import { generateObject } from 'ai';
import { gateway } from '@ai-sdk/gateway';
import { z } from 'zod';
import { writeFileSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

interface PredictOptions {
	phase: string;
	model?: string;
	dryRun?: boolean;
	useGateway?: boolean;
}

// Zod schemas for structured output
const PredictionSchema = z.object({
	homeScore: z.number().int().min(0).max(15).describe('Predicted goals for home team'),
	awayScore: z.number().int().min(0).max(15).describe('Predicted goals for away team'),
	confidence: z.number().min(0).max(1).describe('Confidence level from 0 to 1'),
	reasoning: z.string().describe('Brief explanation of the prediction'),
});

const _TournamentPredictionSchema = z.object({
	champion: z.string().describe('Team code of predicted champion'),
	finalist: z.string().describe('Team code of predicted runner-up'),
	groupWinners: z.record(z.string(), z.string()).describe('Group letter to team code mapping'),
	reasoning: z.string().describe('Brief explanation of predictions'),
});

type PredictionResult = z.infer<typeof PredictionSchema>;

interface Match {
	id: string;
	matchNumber: number;
	homeTeam: string;
	awayTeam: string;
	datetime: string;
	venue: { name: string; city: string };
	phase: string;
	group?: string;
}

interface Team {
	id: string;
	name: string;
	code: string;
	ranking: number;
	confederation: string;
	group: string;
}

interface LLMModel {
	id: string;
	name: string;
	provider: string;
}

// Gateway model mapping (provider/model format for AI Gateway)
// Uses slash format per Vercel AI Gateway docs
const GATEWAY_MODEL_MAP: Record<string, string> = {
	'gpt-5.2': 'openai/gpt-5.2',
	'claude-opus-4.5': 'anthropic/claude-opus-4.5',
	'claude-sonnet-4.5': 'anthropic/claude-sonnet-4.5',
	'gemini-2.5-flash': 'google/gemini-2.5-flash',
	'grok-3': 'xai/grok-3',
	'llama-4-405b': 'groq/llama-4-maverick-17b-128e-instruct',
	'deepseek-v3.2': 'deepseek/deepseek-v3.2',
};

// Load data files
function loadJSON<T>(path: string): T {
	const fullPath = join(process.cwd(), path);
	return JSON.parse(readFileSync(fullPath, 'utf-8')) as T;
}

function saveJSON(path: string, data: unknown): void {
	const fullPath = join(process.cwd(), path);
	writeFileSync(fullPath, JSON.stringify(data, null, '\t'));
}

// Get language model via AI Gateway
function getGatewayModel(modelId: string) {
	const gatewayModelId = GATEWAY_MODEL_MAP[modelId];
	if (!gatewayModelId) {
		throw new Error(`No gateway mapping for model: ${modelId}`);
	}
	return gateway(gatewayModelId);
}

// Get language model via direct provider
async function getDirectModel(modelId: string) {
	const models = loadJSON<LLMModel[]>('data/models.json');
	const modelConfig = models.find((m) => m.id === modelId);

	if (!modelConfig) {
		throw new Error(`Unknown model: ${modelId}`);
	}

	switch (modelConfig.provider) {
		case 'openai': {
			const { createOpenAI } = await import('@ai-sdk/openai');
			const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY });
			return openai('gpt-5.2');
		}
		case 'anthropic': {
			const { createAnthropic } = await import('@ai-sdk/anthropic');
			const anthropic = createAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
			const modelName = modelId === 'claude-opus-4.5' ? 'claude-opus-4-5-20251101' : 'claude-sonnet-4-5-20251101';
			return anthropic(modelName);
		}
		case 'google': {
			const { createGoogleGenerativeAI } = await import('@ai-sdk/google');
			const google = createGoogleGenerativeAI({ apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY });
			return google('gemini-2.5-flash');
		}
		case 'xai': {
			const { createOpenAI } = await import('@ai-sdk/openai');
			const xai = createOpenAI({
				apiKey: process.env.XAI_API_KEY,
				baseURL: 'https://api.x.ai/v1',
			});
			return xai('grok-3');
		}
		case 'deepseek': {
			const { createOpenAI } = await import('@ai-sdk/openai');
			const deepseek = createOpenAI({
				apiKey: process.env.DEEPSEEK_API_KEY,
				baseURL: 'https://api.deepseek.com',
			});
			return deepseek('deepseek-v3.2');
		}
		case 'meta': {
			const { createOpenAI } = await import('@ai-sdk/openai');
			const together = createOpenAI({
				apiKey: process.env.TOGETHER_API_KEY,
				baseURL: 'https://api.together.xyz/v1',
			});
			return together('meta-llama/Llama-4-Maverick-17B-128E-Instruct-FP8');
		}
		default:
			throw new Error(`Unsupported provider: ${modelConfig.provider}`);
	}
}

// Get model (gateway or direct based on option)
async function getModel(modelId: string, useGateway: boolean) {
	if (useGateway) {
		return getGatewayModel(modelId);
	}
	return getDirectModel(modelId);
}

function createPredictionPrompt(match: Match, homeTeam: Team, awayTeam: Team): string {
	return `You are a football (soccer) expert analyst. Predict the result of this FIFA World Cup 2026 match.

Match Details:
- ${homeTeam.name} (${homeTeam.code}) vs ${awayTeam.name} (${awayTeam.code})
- Date: ${match.datetime}
- Venue: ${match.venue.name}, ${match.venue.city}
- Phase: ${match.phase}
- Group: ${match.group || 'N/A'}

Team Information:
${homeTeam.name}:
- FIFA Ranking: ${homeTeam.ranking}
- Confederation: ${homeTeam.confederation}

${awayTeam.name}:
- FIFA Ranking: ${awayTeam.ranking}
- Confederation: ${awayTeam.confederation}

Based on historical performance, current form, FIFA rankings, and team strengths, predict the final score.`;
}

async function predictMatch(
	model: Awaited<ReturnType<typeof getModel>>,
	match: Match,
	teams: Team[]
): Promise<PredictionResult> {
	const homeTeam = teams.find((t) => t.id === match.homeTeam);
	const awayTeam = teams.find((t) => t.id === match.awayTeam);

	if (!homeTeam || !awayTeam) {
		throw new Error(`Team not found for match ${match.id}`);
	}

	const prompt = createPredictionPrompt(match, homeTeam, awayTeam);

	const { object } = await generateObject({
		model,
		schema: PredictionSchema,
		prompt,
		temperature: 0.7,
	});

	return object;
}

export async function predictCommand(options: PredictOptions) {
	const useGateway = options.useGateway ?? !!process.env.AI_GATEWAY_API_KEY;

	console.log('\n⚽ 2026 World Cup AI Battle - Prediction Runner\n');
	console.log(`Phase: ${options.phase}`);
	console.log(`Model: ${options.model || 'All models'}`);
	console.log(`Mode: ${useGateway ? '🌐 AI Gateway' : '🔌 Direct Provider'}`);
	console.log(`Dry Run: ${options.dryRun ? 'Yes' : 'No'}\n`);

	// Load data
	const models = loadJSON<LLMModel[]>('data/models.json');
	const teams = loadJSON<Team[]>('data/teams.json');
	const matches = loadJSON<Match[]>(`data/matches/${options.phase}.json`);

	console.log(`Found ${matches.length} matches in ${options.phase} phase\n`);

	if (options.dryRun) {
		console.log('📋 Dry run mode - no API calls will be made\n');
		console.log('Matches to predict:');
		for (const match of matches) {
			const home = teams.find((t) => t.id === match.homeTeam);
			const away = teams.find((t) => t.id === match.awayTeam);
			console.log(`  - Match ${match.matchNumber}: ${home?.name || match.homeTeam} vs ${away?.name || match.awayTeam}`);
		}
		console.log('\nModels to run:');
		const modelsToRun = options.model ? models.filter((m) => m.id === options.model) : models;
		for (const m of modelsToRun) {
			const gatewayId = GATEWAY_MODEL_MAP[m.id] || 'N/A';
			console.log(`  - ${m.name} (${useGateway ? gatewayId : m.provider})`);
		}
		console.log('\n📦 Using Zod schemas for structured output (AI SDK v6 generateObject)');
		return;
	}

	const modelsToRun = options.model ? models.filter((m) => m.id === options.model) : models;

	for (const modelConfig of modelsToRun) {
		console.log(`\n🤖 Running predictions for ${modelConfig.name}...`);
		console.log(`   Using: ${useGateway ? GATEWAY_MODEL_MAP[modelConfig.id] : modelConfig.provider}`);

		try {
			const model = await getModel(modelConfig.id, useGateway);
			const predictions: Array<{
				matchId: string;
				homeScore: number;
				awayScore: number;
				confidence: number;
				reasoning: string;
			}> = [];

			for (const match of matches) {
				const home = teams.find((t) => t.id === match.homeTeam);
				const away = teams.find((t) => t.id === match.awayTeam);
				process.stdout.write(`  Predicting ${home?.code || '???'} vs ${away?.code || '???'}...`);

				try {
					const result = await predictMatch(model, match, teams);
					predictions.push({
						matchId: match.id,
						homeScore: result.homeScore,
						awayScore: result.awayScore,
						confidence: result.confidence,
						reasoning: result.reasoning,
					});
					console.log(` ${result.homeScore}-${result.awayScore} ✓`);
				} catch (error) {
					console.log(' ✗ (error)');
					console.error(`    Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
				}

				// Rate limiting delay
				await new Promise((resolve) => setTimeout(resolve, 1000));
			}

			// Save predictions
			const existingPredictions = loadJSON<{
				modelId: string;
				predictions: typeof predictions;
				tournamentPredictions: Record<string, unknown>;
				generatedAt: string | null;
			}>(`data/predictions/${modelConfig.id}.json`);

			existingPredictions.predictions = predictions;
			existingPredictions.generatedAt = new Date().toISOString();

			saveJSON(`data/predictions/${modelConfig.id}.json`, existingPredictions);
			console.log(`  ✓ Saved ${predictions.length} predictions`);
		} catch (error) {
			console.error(`  ✗ Failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
			if (useGateway) {
				console.error('    Make sure AI_GATEWAY_API_KEY is set in .env.local');
			} else {
				console.error('    Make sure the correct API key is set in .env.local');
			}
		}
	}

	console.log('\n✅ Prediction run complete!\n');
}
