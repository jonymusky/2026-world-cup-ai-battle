import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createGoogleGenerativeAI } from '@ai-sdk/google';

// Provider configurations
export const openai = createOpenAI({
	apiKey: process.env.OPENAI_API_KEY,
});

export const anthropic = createAnthropic({
	apiKey: process.env.ANTHROPIC_API_KEY,
});

export const google = createGoogleGenerativeAI({
	apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

// Model registry mapping our model IDs to provider models
export const MODEL_MAPPING: Record<string, { provider: string; model: string }> = {
	'gpt-4o': { provider: 'openai', model: 'gpt-4o' },
	'claude-opus-4': { provider: 'anthropic', model: 'claude-opus-4-20250514' },
	'claude-sonnet-4': { provider: 'anthropic', model: 'claude-sonnet-4-20250514' },
	'gemini-2.0-pro': { provider: 'google', model: 'gemini-2.0-flash' },
	'grok-3': { provider: 'openai', model: 'gpt-4o' }, // Placeholder - xAI uses OpenAI-compatible API
	'llama-4-405b': { provider: 'openai', model: 'gpt-4o' }, // Placeholder
	'deepseek-v3': { provider: 'openai', model: 'gpt-4o' }, // Placeholder
};

// Get the language model for a given model ID
export function getLanguageModel(modelId: string) {
	const mapping = MODEL_MAPPING[modelId];
	if (!mapping) {
		throw new Error(`Unknown model: ${modelId}`);
	}

	switch (mapping.provider) {
		case 'openai':
			return openai(mapping.model);
		case 'anthropic':
			return anthropic(mapping.model);
		case 'google':
			return google(mapping.model);
		default:
			throw new Error(`Unknown provider: ${mapping.provider}`);
	}
}
