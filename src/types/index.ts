// Team types
export interface Team {
	id: string;
	name: string;
	code: string; // FIFA code (e.g., "ARG", "BRA")
	flag: string; // Path to flag image
	group: string; // Group letter (A-L)
	confederation: Confederation;
	ranking: number; // FIFA ranking
	coordinates: {
		lat: number;
		lng: number;
	};
	isPlayoff?: boolean; // True if team is from playoff
	playoffTeams?: string[]; // Possible teams for this playoff slot
}

export type Confederation = 'UEFA' | 'CONMEBOL' | 'CONCACAF' | 'CAF' | 'AFC' | 'OFC' | 'Intercontinental';

// Match types
export type MatchPhase =
	| 'groups'
	| 'round-of-32'
	| 'round-of-16'
	| 'quarter-finals'
	| 'semi-finals'
	| 'third-place'
	| 'final';

export interface Match {
	id: string;
	phase: MatchPhase;
	group?: string; // Only for group stage
	matchNumber: number;
	homeTeam: string; // Team ID or placeholder (e.g., "Winner A1")
	awayTeam: string;
	venue: Venue;
	datetime: string; // ISO 8601
	result?: MatchResult;
}

export interface MatchResult {
	homeScore: number;
	awayScore: number;
	penalties?: {
		homeScore: number;
		awayScore: number;
	};
}

export interface Venue {
	name: string;
	city: string;
	country: 'USA' | 'Canada' | 'Mexico';
	capacity: number;
	coordinates: {
		lat: number;
		lng: number;
	};
}

// Prediction types
export interface Prediction {
	matchId: string;
	modelId?: string;
	predictedResult?: MatchResult;
	// Flat format (from JSON files)
	homeScore?: number;
	awayScore?: number;
	confidence?: number; // 0-1
	reasoning?: string;
	timestamp?: string; // ISO 8601
}

export interface ModelPredictions {
	modelId: string;
	predictions: Prediction[];
	tournamentPredictions: {
		champion?: string; // Team code
		finalist?: string; // Team code (runner-up)
		groupWinners?: Record<string, string>; // Group letter -> Team code
		reasoning?: string; // Brief explanation of predictions
	};
	generatedAt?: string; // ISO 8601
}

// Model types
export interface LLMModel {
	id: string;
	name: string;
	provider: LLMProvider;
	logoDomain: string;
	description?: string;
	avatar?: string;
	color?: string;
}

// Helper to get provider logo URL from logo.dev
export function getProviderLogoUrl(logoDomain: string, size = 64): string {
	const token = process.env.NEXT_PUBLIC_LOGO_DEV_TOKEN;
	const baseUrl = `https://img.logo.dev/${logoDomain}?size=${size}`;
	return token ? `${baseUrl}&token=${token}` : baseUrl;
}

export type LLMProvider =
	| 'openai'
	| 'anthropic'
	| 'google'
	| 'xai'
	| 'meta'
	| 'deepseek'
	| 'mistral';

// Ranking types
export interface ModelRanking {
	modelId: string;
	totalPoints: number;
	stats: RankingStats;
	breakdown: ScoreBreakdown;
}

export interface RankingStats {
	totalPredictions: number;
	exactScores: number;
	correctWinners: number;
	correctGoalDifference: number;
	accuracy: number; // Percentage
}

export interface ScoreBreakdown {
	groupStage: number;
	roundOf32: number;
	roundOf16: number;
	quarterFinals: number;
	semiFinals: number;
	final: number;
	bonuses: number;
}

// Scoring rules
export interface ScoringRules {
	phases: Record<MatchPhase, PhaseScoring>;
	bonuses: {
		champion: number;
		finalist: number;
		groupWinner: number;
	};
}

export interface PhaseScoring {
	exactScore: number;
	correctWinner: number;
	goalDifference: number;
}

// API response types
export interface LeaderboardResponse {
	rankings: ModelRanking[];
	lastUpdated: string;
}

export interface PredictionsResponse {
	modelId: string;
	predictions: Prediction[];
	lastUpdated: string;
}

export interface MatchesResponse {
	matches: Match[];
	phase?: MatchPhase;
}
