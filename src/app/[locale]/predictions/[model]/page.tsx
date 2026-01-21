import { getTranslations, setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Prediction } from '@/types';
import { getMatches, getModelById, getPredictions, getTeamById } from '@/lib/data/loader';
import { Flag } from '@/components/ui/flag';
import { ProviderLogo } from '@/components/ui/provider-logo';
import { PredictionModal } from '@/components/ui/prediction-modal';

interface Props {
	params: Promise<{ locale: string; model: string }>;
}

export async function generateMetadata({ params }: Props): Promise<{ title: string; description: string }> {
	const { locale, model: modelId } = await params;
	const t = await getTranslations({ locale, namespace: 'predictions' });
	const model = getModelById(modelId);

	if (!model) {
		return {
			title: t('notFound'),
			description: '',
		};
	}

	return {
		title: `${model.name} - ${t('title')}`,
		description: `${t('description')} - ${model.name}`,
	};
}

function getPredictionForMatch(predictions: Prediction[], matchId: string): Prediction | undefined {
	return predictions.find((p) => p.matchId === matchId);
}

export default async function ModelPredictionsPage({ params }: Props): Promise<React.JSX.Element> {
	const { locale, model: modelId } = await params;
	setRequestLocale(locale);
	const t = await getTranslations('predictions');

	const model = getModelById(modelId);
	if (!model) {
		notFound();
	}

	const modelPredictions = await getPredictions(modelId);
	const matches = await getMatches('groups');

	return (
		<div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
			{/* Header */}
			<div className="mb-8">
				<Link
					href={`/${locale}/predictions`}
					className="mb-4 inline-flex items-center gap-2 text-sm text-foreground/60 hover:text-primary"
				>
					<svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
					</svg>
					{t('backToModels')}
				</Link>
				<div className="flex items-center gap-4">
					<ProviderLogo provider={model.provider} size={48} color={model.color} />
					<div>
						<h1 className="text-4xl font-bold">
							<span className="gradient-text">{model.name}</span>
						</h1>
						<p className="mt-1 text-foreground/60">{model.provider}</p>
					</div>
				</div>
				{model.description ? (
					<p className="mt-4 text-lg text-foreground/70">{model.description}</p>
				) : null}
			</div>

			{/* Predictions Grid */}
			{modelPredictions ? (
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
					{matches.map((match) => {
						const prediction = getPredictionForMatch(modelPredictions.predictions, match.id) as
							| (Prediction & { homeScore?: number; awayScore?: number; confidence?: number; reasoning?: string })
							| undefined;
						const homeTeam = getTeamById(match.homeTeam);
						const awayTeam = getTeamById(match.awayTeam);
						const hasReasoning = !!prediction?.reasoning;

						const cardContent = (
							<div
								className={`rounded-2xl border border-card-border bg-card-bg p-4 ${hasReasoning ? 'cursor-pointer hover:border-primary/50 hover:bg-card-bg/80' : ''}`}
							>
								{/* Match Info */}
								<div className="mb-4 flex items-center justify-between text-xs text-foreground/50">
									<span>Group {match.group}</span>
									<span>{new Date(match.datetime).toLocaleDateString(locale)}</span>
								</div>

								{/* Teams */}
								<div className="flex items-center justify-between gap-4">
									<div className="flex-1 text-center">
										<div className="mb-2 flex justify-center">
											<Flag code={homeTeam?.code || match.homeTeam} name={homeTeam?.name} size="lg" />
										</div>
										<div className="text-lg font-bold">{homeTeam?.code || match.homeTeam}</div>
										<div className="mt-1 text-xs text-foreground/60">
											{homeTeam?.name || match.homeTeam}
										</div>
									</div>

									{/* Prediction Score */}
									{prediction?.homeScore !== undefined ? (
										<div className="flex items-center gap-2 rounded-lg bg-primary/10 px-4 py-2">
											<span className="text-2xl font-bold text-primary">
												{prediction.homeScore}
											</span>
											<span className="text-foreground/50">-</span>
											<span className="text-2xl font-bold text-primary">
												{prediction.awayScore}
											</span>
										</div>
									) : (
										<div className="rounded-lg bg-card-border px-4 py-2 text-foreground/50">
											-
										</div>
									)}

									<div className="flex-1 text-center">
										<div className="mb-2 flex justify-center">
											<Flag code={awayTeam?.code || match.awayTeam} name={awayTeam?.name} size="lg" />
										</div>
										<div className="text-lg font-bold">{awayTeam?.code || match.awayTeam}</div>
										<div className="mt-1 text-xs text-foreground/60">
											{awayTeam?.name || match.awayTeam}
										</div>
									</div>
								</div>

								{/* Reasoning hint */}
								{hasReasoning ? (
									<div className="mt-3 flex items-center justify-center gap-1 text-xs text-primary/70">
										<svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
										</svg>
										Click to see reasoning
									</div>
								) : null}

								{/* Actual Result (if available) */}
								{match.result ? (
									<div className="mt-4 border-t border-card-border pt-4">
										<div className="flex items-center justify-center gap-4 text-sm">
											<span className="text-foreground/60">Result:</span>
											<span className="font-bold">
												{match.result.homeScore} - {match.result.awayScore}
											</span>
										</div>
									</div>
								) : null}
							</div>
						);

						if (prediction?.reasoning) {
							return (
								<PredictionModal
									key={match.id}
									modelName={model.name}
									modelProvider={model.provider}
									modelColor={model.color}
									homeTeam={homeTeam?.code || match.homeTeam}
									awayTeam={awayTeam?.code || match.awayTeam}
									homeScore={prediction.homeScore!}
									awayScore={prediction.awayScore!}
									confidence={prediction.confidence || 0}
									reasoning={prediction.reasoning}
								>
									{cardContent}
								</PredictionModal>
							);
						}

						return <div key={match.id}>{cardContent}</div>;
					})}
				</div>
			) : (
				<div className="rounded-2xl border border-card-border bg-card-bg p-12 text-center">
					<div className="text-4xl">🔮</div>
					<h3 className="mt-4 text-xl font-bold">{t('noPredictions')}</h3>
					<p className="mt-2 text-foreground/60">{t('noPredictionsDesc')}</p>
				</div>
			)}
		</div>
	);
}
