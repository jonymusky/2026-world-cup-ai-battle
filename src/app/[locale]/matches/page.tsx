import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Match } from '@/types';
import { getMatches, getTeamById } from '@/lib/data/loader';
import { MatchCard } from '@/components/match/match-card';

interface Props {
	params: Promise<{ locale: string }>;
}

const PHASE_CONFIG = [
	{ key: 'groupStage', phase: 'groups', enabled: true },
	{ key: 'roundOf32', phase: 'round-of-32', enabled: false },
	{ key: 'roundOf16', phase: 'round-of-16', enabled: false },
	{ key: 'quarterFinals', phase: 'quarter-finals', enabled: false },
	{ key: 'semiFinals', phase: 'semi-finals', enabled: false },
	{ key: 'final', phase: 'final', enabled: false },
] as const;

export async function generateMetadata({ params }: Props): Promise<{ title: string; description: string }> {
	const { locale } = await params;
	const t = await getTranslations({ locale, namespace: 'matches' });

	return {
		title: t('title'),
		description: t('description'),
	};
}

function groupMatchesByGroup(matches: Match[]): Record<string, Match[]> {
	const grouped: Record<string, Match[]> = {};
	for (const match of matches) {
		const group = match.group ?? 'Unknown';
		if (!grouped[group]) {
			grouped[group] = [];
		}
		grouped[group].push(match);
	}
	return grouped;
}

export default async function MatchesPage({ params }: Props): Promise<React.JSX.Element> {
	const { locale } = await params;
	setRequestLocale(locale);
	const t = await getTranslations('matches');

	const matches = await getMatches('groups');
	const matchesByGroup = groupMatchesByGroup(matches);

	return (
		<div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
			{/* Header */}
			<div className="mb-12 text-center">
				<h1 className="text-4xl font-bold">
					<span className="gradient-text">{t('title')}</span>
				</h1>
				<p className="mt-4 text-lg text-foreground/60">{t('description')}</p>
			</div>

			{/* Phase Tabs */}
			<div className="mb-8 flex flex-wrap justify-center gap-2">
				{PHASE_CONFIG.map((config, index) => {
					const isActive = index === 0;
					const isDisabled = !config.enabled;

					return (
						<button
							key={config.key}
							type="button"
							disabled={isDisabled}
							className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
								isActive
									? 'bg-primary text-background'
									: isDisabled
										? 'cursor-not-allowed bg-card-bg/50 text-foreground/30'
										: 'bg-card-bg text-foreground/70 hover:bg-card-border'
							}`}
							title={isDisabled ? 'Coming soon' : undefined}
						>
							{t(config.key)}
							{isDisabled ? (
								<span className="ml-1.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-foreground/10 text-[10px]">
									🔒
								</span>
							) : null}
						</button>
					);
				})}
			</div>

			{/* Matches by Group */}
			<div className="space-y-12">
				{Object.entries(matchesByGroup)
					.toSorted(([a], [b]) => a.localeCompare(b))
					.map(([group, groupMatches]) => (
						<div key={group}>
							<h2 className="mb-6 flex items-center gap-3 text-xl font-bold">
								<span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-background">
									{group}
								</span>
								<span>Group {group}</span>
							</h2>
							<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
								{groupMatches.map((match) => {
									const homeTeam = getTeamById(match.homeTeam);
									const awayTeam = getTeamById(match.awayTeam);
									return (
										<MatchCard
											key={match.id}
											match={match}
											homeTeam={homeTeam}
											awayTeam={awayTeam}
											locale={locale}
										/>
									);
								})}
							</div>
						</div>
					))}
			</div>
		</div>
	);
}
