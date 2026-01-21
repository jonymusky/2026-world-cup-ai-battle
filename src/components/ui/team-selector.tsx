'use client';

import { useRouter } from 'next/navigation';
import type { Team } from '@/types';

interface TeamSelectorProps {
	teams: Team[];
	locale: string;
	selectedTeamId?: string;
	label: string;
}

export function TeamSelector({ teams, locale, selectedTeamId, label }: TeamSelectorProps) {
	const router = useRouter();

	const sortedTeams = [...teams]
		.filter((t) => !t.isPlayoff)
		.toSorted((a, b) => a.name.localeCompare(b.name));

	function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
		const teamId = e.target.value;
		if (teamId) {
			router.push(`/${locale}/predictions/by-team/${teamId}`);
		}
	}

	return (
		<div className="relative">
			<label htmlFor="team-select" className="sr-only">
				{label}
			</label>
			<select
				id="team-select"
				value={selectedTeamId || ''}
				onChange={handleChange}
				className="w-full appearance-none rounded-xl border border-card-border bg-card-bg px-4 py-3 pr-10 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
			>
				<option value="">{label}</option>
				{sortedTeams.map((team) => (
					<option key={team.id} value={team.id}>
						{team.name} ({team.code})
					</option>
				))}
			</select>
			<div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
				<svg
					className="h-5 w-5 text-foreground/50"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
					aria-hidden="true"
				>
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
				</svg>
			</div>
		</div>
	);
}
