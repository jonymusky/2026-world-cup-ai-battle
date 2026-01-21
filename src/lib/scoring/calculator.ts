import type { Match, MatchResult, Prediction } from '@/types';
import { getPhaseScoring } from './rules';

export interface ScoreResult {
	points: number;
	exactScore: boolean;
	correctWinner: boolean;
	correctGoalDifference: boolean;
}

export function calculatePredictionScore(
	prediction: Prediction,
	match: Match
): ScoreResult {
	const result: ScoreResult = {
		points: 0,
		exactScore: false,
		correctWinner: false,
		correctGoalDifference: false,
	};

	if (!match.result) {
		return result;
	}

	const actual = match.result;
	// Support both flat format (homeScore/awayScore) and nested format (predictedResult)
	const predicted = prediction.predictedResult ?? {
		homeScore: prediction.homeScore ?? 0,
		awayScore: prediction.awayScore ?? 0,
	};
	const scoring = getPhaseScoring(match.phase);

	// Check exact score
	if (
		predicted.homeScore === actual.homeScore &&
		predicted.awayScore === actual.awayScore
	) {
		result.exactScore = true;
		result.correctWinner = true;
		result.correctGoalDifference = true;
		result.points = scoring.exactScore;
		return result;
	}

	// Check correct winner
	const actualWinner = getWinner(actual);
	const predictedWinner = getWinner(predicted);

	if (actualWinner === predictedWinner) {
		result.correctWinner = true;
		result.points += scoring.correctWinner;
	}

	// Check goal difference (only if winner is correct and not a draw)
	if (result.correctWinner && actualWinner !== 'draw') {
		const actualDiff = Math.abs(actual.homeScore - actual.awayScore);
		const predictedDiff = Math.abs(predicted.homeScore - predicted.awayScore);

		if (actualDiff === predictedDiff) {
			result.correctGoalDifference = true;
			result.points += scoring.goalDifference;
		}
	}

	return result;
}

export function getWinner(result: MatchResult): 'home' | 'away' | 'draw' {
	if (result.homeScore > result.awayScore) return 'home';
	if (result.awayScore > result.homeScore) return 'away';
	return 'draw';
}

export function calculateTotalPoints(
	predictions: Prediction[],
	matches: Match[]
): number {
	let total = 0;

	for (const prediction of predictions) {
		const match = matches.find((m) => m.id === prediction.matchId);
		if (match) {
			const score = calculatePredictionScore(prediction, match);
			total += score.points;
		}
	}

	return total;
}
