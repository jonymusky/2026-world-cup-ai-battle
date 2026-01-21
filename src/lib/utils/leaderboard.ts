import type { LLMModel } from '@/types';

/**
 * Returns the medal emoji for a given ranking position (0-indexed).
 */
export function getMedalEmoji(position: number): string {
	switch (position) {
		case 0:
			return '🥇';
		case 1:
			return '🥈';
		case 2:
			return '🥉';
		default:
			return '';
	}
}

/**
 * Creates a model lookup function from an array of models.
 */
export function createModelLookup(
	models: LLMModel[]
): (modelId: string) => LLMModel | undefined {
	const modelMap = new Map(models.map((m) => [m.id, m]));
	return (modelId: string) => modelMap.get(modelId);
}
