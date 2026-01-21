import { getTranslations, setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import { getModelsWithPredictions, getRankings } from '@/lib/data/loader';
import { createModelLookup, getMedalEmoji } from '@/lib/utils/leaderboard';

interface Props {
	params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<{ title: string; description: string }> {
	const { locale } = await params;
	const t = await getTranslations({ locale, namespace: 'leaderboard' });

	return {
		title: t('title'),
		description: t('description'),
	};
}

function getTopThreeCardStyle(index: number): string {
	switch (index) {
		case 0:
			return 'border-yellow-500/50 bg-gradient-to-b from-yellow-500/10 to-transparent';
		case 1:
			return 'border-gray-400/50 bg-gradient-to-b from-gray-400/10 to-transparent';
		case 2:
			return 'border-orange-600/50 bg-gradient-to-b from-orange-600/10 to-transparent';
		default:
			return 'border-card-border';
	}
}

export default async function LeaderboardPage({ params }: Props): Promise<React.JSX.Element> {
	const { locale } = await params;
	setRequestLocale(locale);
	const t = await getTranslations('leaderboard');

	const models = getModelsWithPredictions();
	const modelIds = new Set(models.map((m) => m.id));
	const rankings = (await getRankings())
		.filter((r) => modelIds.has(r.modelId))
		.toSorted((a, b) => b.totalPoints - a.totalPoints);
	const getModelInfo = createModelLookup(models);

	return (
		<div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
			{/* Header */}
			<div className="mb-12 text-center">
				<h1 className="text-4xl font-bold">
					<span className="gradient-text">{t('title')}</span>
				</h1>
				<p className="mt-4 text-lg text-foreground/60">{t('description')}</p>
			</div>

			{/* Top 3 Cards */}
			<div className="mb-12 grid gap-6 md:grid-cols-3">
				{rankings.slice(0, 3).map((ranking, index) => {
					const model = getModelInfo(ranking.modelId);
					return (
						<Link
							key={ranking.modelId}
							href={`/${locale}/predictions/${ranking.modelId}`}
							className={`card-hover block rounded-2xl border p-6 ${getTopThreeCardStyle(index)}`}
						>
							<div className="mb-4 text-center text-4xl">{getMedalEmoji(index)}</div>
							<div className="text-center">
								<div
									className="mx-auto mb-4 h-4 w-4 rounded-full"
									style={{ backgroundColor: model?.color || '#888' }}
								/>
								<h3 className="text-xl font-bold">{model?.name || ranking.modelId}</h3>
								<p className="text-sm text-foreground/50">{model?.provider}</p>
								<div className="mt-4">
									<span className="gradient-text text-4xl font-bold">
										{ranking.totalPoints}
									</span>
									<span className="ml-2 text-foreground/50">pts</span>
								</div>
							</div>
							<div className="mt-6 grid grid-cols-2 gap-4 border-t border-card-border pt-4">
								<div className="text-center">
									<div className="text-lg font-semibold">{ranking.stats.accuracy}%</div>
									<div className="text-xs text-foreground/50">{t('accuracy')}</div>
								</div>
								<div className="text-center">
									<div className="text-lg font-semibold">{ranking.stats.exactScores}</div>
									<div className="text-xs text-foreground/50">{t('exactScores')}</div>
								</div>
							</div>
							<div className="mt-4 text-center text-xs text-primary">
								{t('viewPredictions')}
							</div>
						</Link>
					);
				})}
			</div>

			{/* Full Leaderboard Table */}
			<div className="overflow-hidden rounded-2xl border border-card-border bg-card-bg">
				<div className="overflow-x-auto">
					<table className="w-full">
						<thead>
							<tr className="border-b border-card-border bg-background/50">
								<th className="px-6 py-4 text-left text-sm font-semibold text-foreground/70">
									{t('rank')}
								</th>
								<th className="px-6 py-4 text-left text-sm font-semibold text-foreground/70">
									{t('model')}
								</th>
								<th className="px-6 py-4 text-right text-sm font-semibold text-foreground/70">
									{t('points')}
								</th>
								<th className="hidden px-6 py-4 text-right text-sm font-semibold text-foreground/70 sm:table-cell">
									{t('accuracy')}
								</th>
								<th className="hidden px-6 py-4 text-right text-sm font-semibold text-foreground/70 md:table-cell">
									{t('exactScores')}
								</th>
								<th className="hidden px-6 py-4 text-right text-sm font-semibold text-foreground/70 lg:table-cell">
									{t('correctWinners')}
								</th>
								<th className="hidden px-6 py-4 text-right text-sm font-semibold text-foreground/70 xl:table-cell">
									{t('predictions')}
								</th>
							</tr>
						</thead>
						<tbody>
							{rankings.map((ranking, index) => {
								const model = getModelInfo(ranking.modelId);
								return (
									<tr
										key={ranking.modelId}
										className="card-hover cursor-pointer border-b border-card-border last:border-0"
									>
										<td className="px-6 py-4">
											<Link href={`/${locale}/predictions/${ranking.modelId}`} className="flex items-center gap-2">
												<span className="text-lg">{getMedalEmoji(index)}</span>
												<span className="font-mono text-foreground/70">{index + 1}</span>
											</Link>
										</td>
										<td className="px-6 py-4">
											<Link href={`/${locale}/predictions/${ranking.modelId}`} className="flex items-center gap-3">
												<div
													className="h-3 w-3 rounded-full"
													style={{ backgroundColor: model?.color || '#888' }}
												/>
												<div>
													<div className="font-semibold hover:text-primary">
														{model?.name || ranking.modelId}
													</div>
													<div className="text-sm text-foreground/50">{model?.provider}</div>
												</div>
											</Link>
										</td>
										<td className="px-6 py-4 text-right">
											<span className="gradient-text text-xl font-bold">
												{ranking.totalPoints}
											</span>
										</td>
										<td className="hidden px-6 py-4 text-right sm:table-cell">
											<span className="text-foreground/70">{ranking.stats.accuracy}%</span>
										</td>
										<td className="hidden px-6 py-4 text-right md:table-cell">
											<span className="rounded-full bg-primary/10 px-2 py-1 text-sm text-primary">
												{ranking.stats.exactScores}
											</span>
										</td>
										<td className="hidden px-6 py-4 text-right lg:table-cell">
											<span className="text-foreground/70">{ranking.stats.correctWinners}</span>
										</td>
										<td className="hidden px-6 py-4 text-right xl:table-cell">
											<span className="text-foreground/70">
												{ranking.stats.totalPredictions}
											</span>
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>
			</div>

			{/* Score Breakdown */}
			<div className="mt-12">
				<h2 className="mb-6 text-2xl font-bold">Score Breakdown by Phase</h2>
				<div className="overflow-hidden rounded-2xl border border-card-border bg-card-bg">
					<div className="overflow-x-auto">
						<table className="w-full">
							<thead>
								<tr className="border-b border-card-border bg-background/50">
									<th className="px-6 py-4 text-left text-sm font-semibold text-foreground/70">
										Model
									</th>
									<th className="px-4 py-4 text-right text-sm font-semibold text-foreground/70">
										Groups
									</th>
									<th className="px-4 py-4 text-right text-sm font-semibold text-foreground/70">
										R32
									</th>
									<th className="px-4 py-4 text-right text-sm font-semibold text-foreground/70">
										R16
									</th>
									<th className="px-4 py-4 text-right text-sm font-semibold text-foreground/70">
										QF
									</th>
									<th className="px-4 py-4 text-right text-sm font-semibold text-foreground/70">
										SF
									</th>
									<th className="px-4 py-4 text-right text-sm font-semibold text-foreground/70">
										Final
									</th>
									<th className="px-4 py-4 text-right text-sm font-semibold text-foreground/70">
										Bonus
									</th>
								</tr>
							</thead>
							<tbody>
								{rankings.map((ranking) => {
									const model = getModelInfo(ranking.modelId);
									return (
										<tr
											key={ranking.modelId}
											className="border-b border-card-border last:border-0"
										>
											<td className="px-6 py-4 font-medium">
												{model?.name || ranking.modelId}
											</td>
											<td className="px-4 py-4 text-right font-mono">
												{ranking.breakdown.groupStage}
											</td>
											<td className="px-4 py-4 text-right font-mono">
												{ranking.breakdown.roundOf32}
											</td>
											<td className="px-4 py-4 text-right font-mono">
												{ranking.breakdown.roundOf16}
											</td>
											<td className="px-4 py-4 text-right font-mono">
												{ranking.breakdown.quarterFinals}
											</td>
											<td className="px-4 py-4 text-right font-mono">
												{ranking.breakdown.semiFinals}
											</td>
											<td className="px-4 py-4 text-right font-mono">
												{ranking.breakdown.final}
											</td>
											<td className="px-4 py-4 text-right font-mono text-accent">
												{ranking.breakdown.bonuses}
											</td>
										</tr>
									);
								})}
							</tbody>
						</table>
					</div>
				</div>
			</div>
		</div>
	);
}
