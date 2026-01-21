import { getTranslations, setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import { getModelsWithPredictions, getRankings, getTeams } from '@/lib/data/loader';
import { ProviderLogo } from '@/components/ui/provider-logo';
import { TeamSelector } from '@/components/ui/team-selector';

interface Props {
	params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<{ title: string; description: string }> {
	const { locale } = await params;
	const t = await getTranslations({ locale, namespace: 'predictions' });

	return {
		title: t('title'),
		description: t('description'),
	};
}

export default async function PredictionsPage({ params }: Props): Promise<React.JSX.Element> {
	const { locale } = await params;
	setRequestLocale(locale);
	const t = await getTranslations('predictions');

	const models = getModelsWithPredictions();
	const rankings = await getRankings();
	const teams = getTeams();

	const rankingsByModelId = new Map(rankings.map((r) => [r.modelId, r]));

	const sortedModels = [...models].toSorted((a, b) => {
		const pointsA = rankingsByModelId.get(a.id)?.totalPoints ?? 0;
		const pointsB = rankingsByModelId.get(b.id)?.totalPoints ?? 0;
		return pointsB - pointsA;
	});

	return (
		<div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
			{/* Header */}
			<div className="mb-12 text-center">
				<h1 className="text-4xl font-bold">
					<span className="gradient-text">{t('title')}</span>
				</h1>
				<p className="mt-4 text-lg text-foreground/60">{t('description')}</p>
			</div>

			{/* Team Selector */}
			<div className="mb-12 rounded-2xl border border-card-border bg-card-bg p-6">
				<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
					<div>
						<h2 className="text-xl font-bold">{t('byTeam')}</h2>
						<p className="mt-1 text-sm text-foreground/60">{t('selectTeam')}</p>
					</div>
					<div className="w-full sm:w-72">
						<TeamSelector teams={teams} locale={locale} label={t('selectTeam')} />
					</div>
				</div>
			</div>

			{/* Models Grid */}
			<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
				{sortedModels.map((model, index) => {
					const ranking = rankingsByModelId.get(model.id);
					return (
						<Link
							key={model.id}
							href={`/${locale}/predictions/${model.id}`}
							className="card-hover group overflow-hidden rounded-2xl border border-card-border bg-card-bg"
						>
							{/* Header with color */}
							<div
								className="h-2"
								style={{ backgroundColor: model.color || '#888' }}
							/>

							<div className="p-6">
								{/* Model Info */}
								<div className="mb-4 flex items-start justify-between">
									<div className="flex items-center gap-3">
										<ProviderLogo provider={model.provider} size={40} color={model.color} />
										<div>
											<h3 className="text-xl font-bold group-hover:text-primary">
												{model.name}
											</h3>
											<p className="text-sm text-foreground/50">{model.provider}</p>
										</div>
									</div>
									<div className="flex h-8 w-8 items-center justify-center rounded-full bg-card-border text-sm font-bold">
										#{index + 1}
									</div>
								</div>

								{/* Description */}
								{model.description ? (
									<p className="mb-4 text-sm text-foreground/60">{model.description}</p>
								) : null}

								{/* Stats */}
								{ranking ? (
									<div className="grid grid-cols-3 gap-4 border-t border-card-border pt-4">
										<div className="text-center">
											<div className="gradient-text text-xl font-bold">
												{ranking.totalPoints}
											</div>
											<div className="text-xs text-foreground/50">Points</div>
										</div>
										<div className="text-center">
											<div className="text-xl font-bold">{ranking.stats.accuracy}%</div>
											<div className="text-xs text-foreground/50">Accuracy</div>
										</div>
										<div className="text-center">
											<div className="text-xl font-bold">{ranking.stats.exactScores}</div>
											<div className="text-xs text-foreground/50">Exact</div>
										</div>
									</div>
								) : null}

								{/* View Link */}
								<div className="mt-4 flex items-center justify-end text-sm text-primary opacity-0 transition-opacity group-hover:opacity-100">
									<span>{t('viewAll')}</span>
									<svg
										className="ml-1 h-4 w-4"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
										aria-hidden="true"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M9 5l7 7-7 7"
										/>
									</svg>
								</div>
							</div>
						</Link>
					);
				})}
			</div>
		</div>
	);
}
