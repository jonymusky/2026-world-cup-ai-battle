import { getTranslations, setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Prediction } from '@/types';
import {
	getAllPredictions,
	getMatchesByTeam,
	getModelsWithPredictions,
	getTeamById,
	getTeams,
} from '@/lib/data/loader';
import { Flag } from '@/components/ui/flag';
import { ProviderLogo } from '@/components/ui/provider-logo';
import { TeamSelector } from '@/components/ui/team-selector';
import { PredictionModal } from '@/components/ui/prediction-modal';

interface Props {
	params: Promise<{ locale: string; team: string }>;
}

export async function generateMetadata({ params }: Props): Promise<{ title: string; description: string }> {
	const { locale, team: teamId } = await params;
	const t = await getTranslations({ locale, namespace: 'predictions' });
	const team = getTeamById(teamId);

	if (!team) {
		return {
			title: t('notFound'),
			description: '',
		};
	}

	return {
		title: t('teamPredictions', { team: team.name }),
		description: t('description'),
	};
}

export default async function TeamPredictionsPage({ params }: Props): Promise<React.JSX.Element> {
	const { locale, team: teamId } = await params;
	setRequestLocale(locale);
	const t = await getTranslations('predictions');

	const team = getTeamById(teamId);
	if (!team) {
		notFound();
	}

	const teams = getTeams();
	const models = getModelsWithPredictions();
	const teamMatches = await getMatchesByTeam(teamId);
	const allPredictions = await getAllPredictions();

	// Sort matches by date
	const sortedMatches = [...teamMatches].toSorted(
		(a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime()
	);

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
					{t('backToPredictions')}
				</Link>

				<div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
					<div className="flex items-center gap-4">
						<Flag code={team.code} name={team.name} size="lg" />
						<div>
							<h1 className="text-4xl font-bold">
								<span className="gradient-text">{team.name}</span>
							</h1>
							<p className="mt-1 text-foreground/60">
								Group {team.group} - {team.confederation}
							</p>
						</div>
					</div>

					{/* Team Selector */}
					<div className="w-full sm:w-64">
						<TeamSelector
							teams={teams}
							locale={locale}
							selectedTeamId={teamId}
							label={t('selectTeam')}
						/>
					</div>
				</div>
			</div>

			{/* Matches with All Model Predictions */}
			<div className="space-y-8">
				{sortedMatches.map((match) => {
					const homeTeam = getTeamById(match.homeTeam);
					const awayTeam = getTeamById(match.awayTeam);
					const isHome = match.homeTeam === teamId;

					return (
						<div
							key={match.id}
							className="overflow-hidden rounded-2xl border border-card-border bg-card-bg"
						>
							{/* Match Header */}
							<div className="border-b border-card-border bg-card-bg/50 p-4">
								<div className="flex items-center justify-between text-sm text-foreground/50">
									<span>
										Group {match.group} - Match {match.matchNumber}
									</span>
									<span>{new Date(match.datetime).toLocaleDateString(locale)}</span>
								</div>

								{/* Match Teams */}
								<div className="mt-4 flex items-center justify-center gap-6">
									<div className={`flex items-center gap-3 ${isHome ? 'font-bold' : ''}`}>
										<Flag
											code={homeTeam?.code || match.homeTeam}
											name={homeTeam?.name}
											size="md"
										/>
										<span className="text-lg">{homeTeam?.name || match.homeTeam}</span>
									</div>
									<span className="text-foreground/30">vs</span>
									<div className={`flex items-center gap-3 ${!isHome ? 'font-bold' : ''}`}>
										<span className="text-lg">{awayTeam?.name || match.awayTeam}</span>
										<Flag
											code={awayTeam?.code || match.awayTeam}
											name={awayTeam?.name}
											size="md"
										/>
									</div>
								</div>
							</div>

							{/* Model Predictions Grid */}
							<div className="p-4">
								<h3 className="mb-3 text-sm font-medium text-foreground/60">{t('allModels')}</h3>
								<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
									{models.map((model) => {
										const modelPredictions = allPredictions[model.id];
										const prediction = modelPredictions?.predictions?.find(
											(p: Prediction) => p.matchId === match.id
										) as {
											homeScore?: number;
											awayScore?: number;
											confidence?: number;
											reasoning?: string;
										} | undefined;

										const hasReasoning = !!prediction?.reasoning;
										const cardContent = (
											<div className={`flex items-center justify-between rounded-lg border border-card-border bg-background p-3 ${hasReasoning ? 'cursor-pointer hover:border-primary/50 hover:bg-card-bg' : ''}`}>
												<div className="flex items-center gap-2">
													<ProviderLogo
														provider={model.provider}
														size={24}
														color={model.color}
													/>
													<span className="text-sm font-medium">{model.name}</span>
												</div>
												{prediction?.homeScore !== undefined ? (
													<div
														className="rounded-md px-2 py-1 text-sm font-bold"
														style={{
															backgroundColor: `${model.color}20`,
															color: model.color,
														}}
													>
														{prediction.homeScore} - {prediction.awayScore}
													</div>
												) : (
													<div className="rounded-md bg-card-border px-2 py-1 text-sm text-foreground/50">
														-
													</div>
												)}
											</div>
										);

										if (prediction?.reasoning) {
											return (
												<PredictionModal
													key={model.id}
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

										return <div key={model.id}>{cardContent}</div>;
									})}
								</div>
							</div>

							{/* Actual Result (if available) */}
							{match.result ? (
								<div className="border-t border-card-border bg-primary/5 p-4">
									<div className="flex items-center justify-center gap-4 text-sm">
										<span className="text-foreground/60">Final Result:</span>
										<span className="text-xl font-bold text-primary">
											{match.result.homeScore} - {match.result.awayScore}
										</span>
									</div>
								</div>
							) : null}
						</div>
					);
				})}
			</div>

			{sortedMatches.length === 0 ? (
				<div className="rounded-2xl border border-card-border bg-card-bg p-12 text-center">
					<div className="text-4xl">🏟️</div>
					<h3 className="mt-4 text-xl font-bold">{t('noPredictions')}</h3>
					<p className="mt-2 text-foreground/60">{t('noPredictionsDesc')}</p>
				</div>
			) : null}
		</div>
	);
}
