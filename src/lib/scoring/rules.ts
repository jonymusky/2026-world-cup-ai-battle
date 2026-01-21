import type { MatchPhase, ScoringRules } from '@/types';

export const SCORING_RULES: ScoringRules = {
	phases: {
		groups: {
			exactScore: 5,
			correctWinner: 2,
			goalDifference: 1,
		},
		'round-of-32': {
			exactScore: 6,
			correctWinner: 3,
			goalDifference: 1,
		},
		'round-of-16': {
			exactScore: 8,
			correctWinner: 4,
			goalDifference: 2,
		},
		'quarter-finals': {
			exactScore: 10,
			correctWinner: 5,
			goalDifference: 2,
		},
		'semi-finals': {
			exactScore: 12,
			correctWinner: 6,
			goalDifference: 3,
		},
		'third-place': {
			exactScore: 10,
			correctWinner: 5,
			goalDifference: 2,
		},
		final: {
			exactScore: 15,
			correctWinner: 8,
			goalDifference: 4,
		},
	},
	bonuses: {
		champion: 20,
		finalist: 10,
		groupWinner: 5,
	},
};

export function getPhaseScoring(phase: MatchPhase) {
	return SCORING_RULES.phases[phase];
}

export function getBonusPoints() {
	return SCORING_RULES.bonuses;
}
