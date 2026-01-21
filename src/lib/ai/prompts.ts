import type { Match, Team } from '@/types';

export function createPredictionPrompt(match: Match, homeTeam: Team, awayTeam: Team): string {
	return `You are a football (soccer) expert analyst. Predict the result of this FIFA World Cup 2026 match.

Match Details:
- ${homeTeam.name} (${homeTeam.code}) vs ${awayTeam.name} (${awayTeam.code})
- Date: ${match.datetime}
- Venue: ${match.venue.name}, ${match.venue.city}
- Phase: ${match.phase}
- Group: ${match.group || 'N/A'}

Team Information:
${homeTeam.name}:
- FIFA Ranking: ${homeTeam.ranking}
- Confederation: ${homeTeam.confederation}
- Group: ${homeTeam.group}

${awayTeam.name}:
- FIFA Ranking: ${awayTeam.ranking}
- Confederation: ${awayTeam.confederation}
- Group: ${awayTeam.group}

Based on historical performance, current form, FIFA rankings, and team strengths, predict the final score of this match.

Respond with ONLY a JSON object in this exact format (no other text):
{
  "homeScore": <number>,
  "awayScore": <number>,
  "confidence": <number between 0 and 1>,
  "reasoning": "<brief explanation of your prediction>"
}`;
}

export function createTournamentPredictionPrompt(teams: Team[]): string {
	const teamList = teams
		.map((t) => `${t.name} (${t.code}) - FIFA Ranking: ${t.ranking}, Group: ${t.group}`)
		.join('\n');

	return `You are a football (soccer) expert analyst. Predict the overall tournament results for FIFA World Cup 2026.

Participating Teams:
${teamList}

Based on historical performance, current form, FIFA rankings, and team strengths, predict:
1. The tournament champion
2. The runner-up (finalist)
3. The winner of each group (A through L)

Respond with ONLY a JSON object in this exact format (no other text):
{
  "champion": "<team code>",
  "finalist": "<team code>",
  "groupWinners": {
    "A": "<team code>",
    "B": "<team code>",
    "C": "<team code>",
    "D": "<team code>",
    "E": "<team code>",
    "F": "<team code>",
    "G": "<team code>",
    "H": "<team code>",
    "I": "<team code>",
    "J": "<team code>",
    "K": "<team code>",
    "L": "<team code>"
  },
  "reasoning": "<brief explanation of your predictions>"
}`;
}
