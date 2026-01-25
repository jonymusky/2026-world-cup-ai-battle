import { cache } from 'react';
import type { LLMModel, Match, ModelPredictions, ModelRanking, Team } from '@/types';

// Import match phases statically to avoid Turbopack dynamic import issues
import groupsMatches from '../../../data/matches/groups.json';

// Import prediction files statically
import gpt52Predictions from '../../../data/predictions/gpt-5.2.json';
import claudeOpus45Predictions from '../../../data/predictions/claude-opus-4.5.json';
import claudeSonnet45Predictions from '../../../data/predictions/claude-sonnet-4.5.json';
import gemini25FlashPredictions from '../../../data/predictions/gemini-2.5-flash.json';
import grok3Predictions from '../../../data/predictions/grok-3.json';
import llama4405bPredictions from '../../../data/predictions/llama-4-405b.json';
import deepseekV32Predictions from '../../../data/predictions/deepseek-v3.2.json';

const MATCH_PHASES_DATA: Record<string, Match[]> = {
	groups: groupsMatches as Match[],
	'round-of-32': [],
	'round-of-16': [],
	'quarter-finals': [],
	'semi-finals': [],
	final: [],
};

const PREDICTIONS_DATA: Record<string, ModelPredictions> = {
	'gpt-5.2': gpt52Predictions as ModelPredictions,
	'claude-opus-4.5': claudeOpus45Predictions as ModelPredictions,
	'claude-sonnet-4.5': claudeSonnet45Predictions as ModelPredictions,
	'gemini-2.5-flash': gemini25FlashPredictions as ModelPredictions,
	'grok-3': grok3Predictions as ModelPredictions,
	'llama-4-405b': llama4405bPredictions as ModelPredictions,
	'deepseek-v3.2': deepseekV32Predictions as ModelPredictions,
};

const DEFAULT_RANKING_STATS = {
	totalPredictions: 0,
	exactScores: 0,
	correctWinners: 0,
	correctGoalDifference: 0,
	accuracy: 0,
} as const;

const DEFAULT_RANKING_BREAKDOWN = {
	groupStage: 0,
	roundOf32: 0,
	roundOf16: 0,
	quarterFinals: 0,
	semiFinals: 0,
	final: 0,
	bonuses: 0,
} as const;

export function getTeams(): Team[] {
	return require('../../../data/teams.json') as Team[];
}

export function getTeamById(id: string): Team | undefined {
	return getTeams().find((team) => team.id === id);
}

export function getTeamByCode(code: string): Team | undefined {
	return getTeams().find((team) => team.code === code);
}

export function getTeamsByGroup(group: string): Team[] {
	return getTeams().filter((team) => team.group === group);
}

export function getModels(): LLMModel[] {
	return require('../../../data/models.json') as LLMModel[];
}

export function getModelById(id: string): LLMModel | undefined {
	return getModels().find((model) => model.id === id);
}

export function getModelsWithPredictions(): LLMModel[] {
	return getModels().filter((model) => {
		const predictions = PREDICTIONS_DATA[model.id];
		return predictions?.predictions && predictions.predictions.length > 0;
	});
}

export const getMatches = cache(async (phase?: string): Promise<Match[]> => {
	if (phase) {
		return MATCH_PHASES_DATA[phase] || [];
	}

	return Object.values(MATCH_PHASES_DATA).flat();
});

export const getPredictions = cache(async (modelId: string): Promise<ModelPredictions | null> => {
	return PREDICTIONS_DATA[modelId] || null;
});

function createDefaultRanking(modelId: string): ModelRanking {
	return {
		modelId,
		totalPoints: 0,
		stats: { ...DEFAULT_RANKING_STATS },
		breakdown: { ...DEFAULT_RANKING_BREAKDOWN },
	};
}

export const getRankings = cache(async (): Promise<ModelRanking[]> => {
	try {
		return require('../../../data/rankings.json') as ModelRanking[];
	} catch {
		return getModels().map((model) => createDefaultRanking(model.id));
	}
});

export const getMatchesByTeam = cache(async (teamId: string): Promise<Match[]> => {
	const allMatches = await getMatches();
	return allMatches.filter((match) => match.homeTeam === teamId || match.awayTeam === teamId);
});

export const getAllPredictions = cache(async (): Promise<Record<string, ModelPredictions>> => {
	return PREDICTIONS_DATA;
});

export interface TournamentPrediction {
	modelId: string;
	champion?: string;
	finalist?: string;
	groupWinners?: Record<string, string>;
	reasoning?: string;
}

export function getTournamentPredictions(): TournamentPrediction[] {
	const models = getModels();
	const predictions: TournamentPrediction[] = [];

	for (const model of models) {
		const modelPredictions = PREDICTIONS_DATA[model.id];
		if (modelPredictions?.tournamentPredictions) {
			const tp = modelPredictions.tournamentPredictions;
			if (tp.champion || tp.finalist) {
				predictions.push({
					modelId: model.id,
					champion: tp.champion,
					finalist: tp.finalist,
					groupWinners: tp.groupWinners,
					reasoning: tp.reasoning,
				});
			}
		}
	}

	return predictions;
}
