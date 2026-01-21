import type { Match, Team } from '@/types';
import { Flag } from '@/components/ui/flag';

interface MatchCardProps {
	match: Match;
	homeTeam?: Team;
	awayTeam?: Team;
	locale?: string;
}

export function MatchCard({ match, homeTeam, awayTeam, locale = 'en' }: MatchCardProps) {
	const formatDate = (datetime: string) => {
		const date = new Date(datetime);
		return date.toLocaleDateString(locale, {
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
		});
	};

	return (
		<div className="card-hover overflow-hidden rounded-xl border border-card-border bg-card-bg">
			{/* Match Header */}
			<div className="border-b border-card-border bg-background/50 px-4 py-2">
				<div className="flex items-center justify-between text-xs text-foreground/60">
					<span>Match #{match.matchNumber}</span>
					<span>{formatDate(match.datetime)}</span>
				</div>
			</div>

			{/* Teams */}
			<div className="p-4">
				<div className="flex items-center justify-between gap-4">
					{/* Home Team */}
					<div className="flex flex-1 flex-col items-center text-center">
						<div className="mb-2">
							<Flag
								code={homeTeam?.code || 'TBD'}
								name={homeTeam?.name}
								size="lg"
							/>
						</div>
						<span className="text-sm font-semibold">{homeTeam?.name || match.homeTeam}</span>
						<span className="text-xs text-foreground/50">{homeTeam?.code}</span>
					</div>

					{/* Score */}
					<div className="flex flex-col items-center">
						{match.result ? (
							<div className="flex items-center gap-2">
								<span className="text-2xl font-bold">{match.result.homeScore}</span>
								<span className="text-foreground/40">-</span>
								<span className="text-2xl font-bold">{match.result.awayScore}</span>
							</div>
						) : (
							<span className="rounded-full bg-primary/10 px-3 py-1 text-sm text-primary">
								vs
							</span>
						)}
					</div>

					{/* Away Team */}
					<div className="flex flex-1 flex-col items-center text-center">
						<div className="mb-2">
							<Flag
								code={awayTeam?.code || 'TBD'}
								name={awayTeam?.name}
								size="lg"
							/>
						</div>
						<span className="text-sm font-semibold">{awayTeam?.name || match.awayTeam}</span>
						<span className="text-xs text-foreground/50">{awayTeam?.code}</span>
					</div>
				</div>
			</div>

			{/* Venue */}
			<div className="border-t border-card-border bg-background/30 px-4 py-2">
				<div className="flex items-center gap-2 text-xs text-foreground/60">
					<svg
						className="h-4 w-4"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
						aria-hidden="true"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
						/>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
						/>
					</svg>
					<span>
						{match.venue.name}, {match.venue.city}
					</span>
				</div>
			</div>
		</div>
	);
}
