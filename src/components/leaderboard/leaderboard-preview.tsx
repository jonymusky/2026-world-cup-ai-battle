import Link from 'next/link';
import { getModels, getRankings } from '@/lib/data/loader';
import { createModelLookup, getMedalEmoji } from '@/lib/utils/leaderboard';
import { ProviderLogo } from '@/components/ui/provider-logo';

interface LeaderboardPreviewProps {
	locale: string;
}

export async function LeaderboardPreview({ locale }: LeaderboardPreviewProps): Promise<React.JSX.Element> {
	const models = getModels();
	const rankings = await getRankings();

	const topRankings = [...rankings].toSorted((a, b) => b.totalPoints - a.totalPoints).slice(0, 5);
	const getModelInfo = createModelLookup(models);

	return (
		<div className="overflow-hidden rounded-2xl border border-card-border bg-card-bg">
			<div className="overflow-x-auto">
				<table className="w-full">
					<thead>
						<tr className="border-b border-card-border bg-background/50">
							<th className="px-6 py-4 text-left text-sm font-semibold text-foreground/70">
								Rank
							</th>
							<th className="px-6 py-4 text-left text-sm font-semibold text-foreground/70">
								Model
							</th>
							<th className="px-6 py-4 text-right text-sm font-semibold text-foreground/70">
								Points
							</th>
							<th className="hidden px-6 py-4 text-right text-sm font-semibold text-foreground/70 sm:table-cell">
								Accuracy
							</th>
							<th className="hidden px-6 py-4 text-right text-sm font-semibold text-foreground/70 md:table-cell">
								Exact Scores
							</th>
						</tr>
					</thead>
					<tbody>
						{topRankings.map((ranking, index) => {
							const model = getModelInfo(ranking.modelId);
							return (
								<tr
									key={ranking.modelId}
									className="card-hover border-b border-card-border last:border-0"
								>
									<td className="px-6 py-4">
										<div className="flex items-center gap-2">
											<span className="text-lg">{getMedalEmoji(index)}</span>
											<span className="font-mono text-foreground/70">{index + 1}</span>
										</div>
									</td>
									<td className="px-6 py-4">
										<div className="flex items-center gap-3">
											<ProviderLogo
												provider={model?.provider || 'unknown'}
												color={model?.color}
												size={32}
											/>
											<div>
												<div className="font-semibold">{model?.name || ranking.modelId}</div>
												<div className="text-sm text-foreground/50">{model?.provider}</div>
											</div>
										</div>
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
								</tr>
							);
						})}
					</tbody>
				</table>
			</div>
			<div className="border-t border-card-border bg-background/30 p-4 text-center">
				<Link
					href={`/${locale}/leaderboard`}
					className="text-sm font-medium text-primary hover:text-primary-dark"
				>
					View Full Leaderboard →
				</Link>
			</div>
		</div>
	);
}
