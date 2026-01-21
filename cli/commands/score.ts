import { getModels, getRankings } from '../../src/lib/data/loader';

interface ScoreOptions {
	model?: string;
	verbose?: boolean;
}

export async function scoreCommand(options: ScoreOptions) {
	console.log('🏆 2026 World Cup AI Battle - Score Calculator\n');

	const models = getModels();
	const rankings = await getRankings();

	if (options.model) {
		const model = models.find((m) => m.id === options.model);
		const ranking = rankings.find((r) => r.modelId === options.model);

		if (!model || !ranking) {
			console.error(`Model "${options.model}" not found.`);
			return;
		}

		console.log(`Model: ${model.name} (${model.provider})\n`);
		console.log(`Total Points: ${ranking.totalPoints}`);
		console.log(`Accuracy: ${ranking.stats.accuracy}%\n`);

		if (options.verbose) {
			console.log('Breakdown:');
			console.log(`  Group Stage: ${ranking.breakdown.groupStage}`);
			console.log(`  Round of 32: ${ranking.breakdown.roundOf32}`);
			console.log(`  Round of 16: ${ranking.breakdown.roundOf16}`);
			console.log(`  Quarter Finals: ${ranking.breakdown.quarterFinals}`);
			console.log(`  Semi Finals: ${ranking.breakdown.semiFinals}`);
			console.log(`  Final: ${ranking.breakdown.final}`);
			console.log(`  Bonuses: ${ranking.breakdown.bonuses}`);
			console.log('\nStats:');
			console.log(`  Total Predictions: ${ranking.stats.totalPredictions}`);
			console.log(`  Exact Scores: ${ranking.stats.exactScores}`);
			console.log(`  Correct Winners: ${ranking.stats.correctWinners}`);
			console.log(`  Goal Difference: ${ranking.stats.correctGoalDifference}`);
		}
		return;
	}

	// Show all models
	const sortedRankings = [...rankings].sort((a, b) => b.totalPoints - a.totalPoints);

	console.log('Current Leaderboard:\n');
	console.log('Rank  Model                    Points  Accuracy');
	console.log('────  ───────────────────────  ──────  ────────');

	sortedRankings.forEach((ranking, index) => {
		const model = models.find((m) => m.id === ranking.modelId);
		const name = (model?.name || ranking.modelId).padEnd(23);
		const points = ranking.totalPoints.toString().padStart(6);
		const accuracy = `${ranking.stats.accuracy}%`.padStart(8);
		const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '  ';
		console.log(`${medal} ${(index + 1).toString().padStart(2)}  ${name}  ${points}  ${accuracy}`);
	});
}
