import { describe, expect, it } from 'vitest';
import {
	calculatePredictionScore,
	calculateTotalPoints,
	getWinner,
} from '@/lib/scoring/calculator';
import { SCORING_RULES, getPhaseScoring } from '@/lib/scoring/rules';
import type { Match, Prediction } from '@/types';

describe('Scoring Rules', () => {
	it('should have correct scoring for group stage', () => {
		const groupScoring = getPhaseScoring('groups');
		expect(groupScoring.exactScore).toBe(5);
		expect(groupScoring.correctWinner).toBe(2);
		expect(groupScoring.goalDifference).toBe(1);
	});

	it('should have correct scoring for final', () => {
		const finalScoring = getPhaseScoring('final');
		expect(finalScoring.exactScore).toBe(15);
		expect(finalScoring.correctWinner).toBe(8);
		expect(finalScoring.goalDifference).toBe(4);
	});

	it('should have correct bonus points', () => {
		expect(SCORING_RULES.bonuses.champion).toBe(20);
		expect(SCORING_RULES.bonuses.finalist).toBe(10);
		expect(SCORING_RULES.bonuses.groupWinner).toBe(5);
	});
});

describe('getWinner', () => {
	it('should return home for home win', () => {
		expect(getWinner({ homeScore: 2, awayScore: 1 })).toBe('home');
	});

	it('should return away for away win', () => {
		expect(getWinner({ homeScore: 0, awayScore: 3 })).toBe('away');
	});

	it('should return draw for equal scores', () => {
		expect(getWinner({ homeScore: 1, awayScore: 1 })).toBe('draw');
	});
});

describe('calculatePredictionScore', () => {
	const baseMatch: Match = {
		id: 'match-001',
		phase: 'groups',
		group: 'A',
		matchNumber: 1,
		homeTeam: 'arg',
		awayTeam: 'fra',
		venue: {
			name: 'Test Stadium',
			city: 'Test City',
			country: 'USA',
			capacity: 50000,
			coordinates: { lat: 0, lng: 0 },
		},
		datetime: '2026-06-11T18:00:00Z',
		result: { homeScore: 2, awayScore: 1 },
	};

	const basePrediction: Prediction = {
		matchId: 'match-001',
		modelId: 'gpt-4o',
		predictedResult: { homeScore: 2, awayScore: 1 },
		timestamp: '2026-01-01T00:00:00Z',
	};

	it('should award exact score points for exact match', () => {
		const result = calculatePredictionScore(basePrediction, baseMatch);
		expect(result.exactScore).toBe(true);
		expect(result.correctWinner).toBe(true);
		expect(result.correctGoalDifference).toBe(true);
		expect(result.points).toBe(5); // Group stage exact score
	});

	it('should award correct winner points only for correct winner', () => {
		const prediction: Prediction = {
			...basePrediction,
			predictedResult: { homeScore: 3, awayScore: 0 },
		};
		const result = calculatePredictionScore(prediction, baseMatch);
		expect(result.exactScore).toBe(false);
		expect(result.correctWinner).toBe(true);
		expect(result.points).toBe(2); // Group stage correct winner only
	});

	it('should award goal difference bonus for correct difference', () => {
		const prediction: Prediction = {
			...basePrediction,
			predictedResult: { homeScore: 3, awayScore: 2 }, // Same 1-goal difference
		};
		const result = calculatePredictionScore(prediction, baseMatch);
		expect(result.exactScore).toBe(false);
		expect(result.correctWinner).toBe(true);
		expect(result.correctGoalDifference).toBe(true);
		expect(result.points).toBe(3); // 2 for winner + 1 for goal diff
	});

	it('should return 0 points for wrong prediction', () => {
		const prediction: Prediction = {
			...basePrediction,
			predictedResult: { homeScore: 0, awayScore: 2 }, // Wrong winner
		};
		const result = calculatePredictionScore(prediction, baseMatch);
		expect(result.exactScore).toBe(false);
		expect(result.correctWinner).toBe(false);
		expect(result.points).toBe(0);
	});

	it('should return 0 points for match without result', () => {
		const matchWithoutResult: Match = { ...baseMatch, result: undefined };
		const result = calculatePredictionScore(basePrediction, matchWithoutResult);
		expect(result.points).toBe(0);
	});

	it('should handle draw predictions correctly', () => {
		const drawMatch: Match = {
			...baseMatch,
			result: { homeScore: 1, awayScore: 1 },
		};
		const drawPrediction: Prediction = {
			...basePrediction,
			predictedResult: { homeScore: 1, awayScore: 1 },
		};
		const result = calculatePredictionScore(drawPrediction, drawMatch);
		expect(result.exactScore).toBe(true);
		expect(result.points).toBe(5);
	});
});

describe('calculateTotalPoints', () => {
	const matches: Match[] = [
		{
			id: 'match-001',
			phase: 'groups',
			group: 'A',
			matchNumber: 1,
			homeTeam: 'arg',
			awayTeam: 'fra',
			venue: {
				name: 'Test Stadium',
				city: 'Test City',
				country: 'USA',
				capacity: 50000,
				coordinates: { lat: 0, lng: 0 },
			},
			datetime: '2026-06-11T18:00:00Z',
			result: { homeScore: 2, awayScore: 1 },
		},
		{
			id: 'match-002',
			phase: 'groups',
			group: 'A',
			matchNumber: 2,
			homeTeam: 'bra',
			awayTeam: 'ger',
			venue: {
				name: 'Test Stadium 2',
				city: 'Test City',
				country: 'USA',
				capacity: 50000,
				coordinates: { lat: 0, lng: 0 },
			},
			datetime: '2026-06-12T18:00:00Z',
			result: { homeScore: 3, awayScore: 0 },
		},
	];

	it('should calculate total points correctly', () => {
		const predictions: Prediction[] = [
			{
				matchId: 'match-001',
				modelId: 'gpt-4o',
				predictedResult: { homeScore: 2, awayScore: 1 }, // Exact: 5 pts
				timestamp: '2026-01-01T00:00:00Z',
			},
			{
				matchId: 'match-002',
				modelId: 'gpt-4o',
				predictedResult: { homeScore: 2, awayScore: 0 }, // Winner only: 2 pts
				timestamp: '2026-01-01T00:00:00Z',
			},
		];
		const total = calculateTotalPoints(predictions, matches);
		expect(total).toBe(7); // 5 + 2
	});
});
