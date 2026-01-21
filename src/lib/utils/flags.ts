// Mapping from FIFA codes to ISO 2-letter country codes for flag CDN
const FIFA_TO_ISO: Record<string, string> = {
	// Group A
	MEX: 'mx',
	RSA: 'za',
	KOR: 'kr',
	// Group B
	CAN: 'ca',
	QAT: 'qa',
	SUI: 'ch',
	// Group C
	BRA: 'br',
	MAR: 'ma',
	HAI: 'ht',
	SCO: 'gb-sct', // Scotland uses GB subdivision
	// Group D
	USA: 'us',
	PAR: 'py',
	AUS: 'au',
	// Group E
	GER: 'de',
	CUW: 'cw',
	CIV: 'ci',
	ECU: 'ec',
	// Group F
	NED: 'nl',
	JPN: 'jp',
	TUN: 'tn',
	// Group G
	BEL: 'be',
	EGY: 'eg',
	IRN: 'ir',
	NZL: 'nz',
	// Group H
	ESP: 'es',
	CPV: 'cv',
	KSA: 'sa',
	URU: 'uy',
	// Group I
	FRA: 'fr',
	SEN: 'sn',
	NOR: 'no',
	// Group J
	ARG: 'ar',
	ALG: 'dz',
	AUT: 'at',
	JOR: 'jo',
	// Group K
	POR: 'pt',
	UZB: 'uz',
	COL: 'co',
	// Group L
	ENG: 'gb-eng', // England uses GB subdivision
	CRO: 'hr',
	GHA: 'gh',
	PAN: 'pa',
	// Playoff teams possibilities
	CZE: 'cz',
	DEN: 'dk',
	IRL: 'ie',
	MKD: 'mk',
	BIH: 'ba',
	ITA: 'it',
	NIR: 'gb-nir', // Northern Ireland
	WAL: 'gb-wls', // Wales
	KOS: 'xk', // Kosovo
	ROU: 'ro',
	SVK: 'sk',
	TUR: 'tr',
	ALB: 'al',
	POL: 'pl',
	SWE: 'se',
	UKR: 'ua',
	BOL: 'bo',
	IRQ: 'iq',
	SUR: 'sr',
	COD: 'cd',
	JAM: 'jm',
	NCA: 'ni',
	// TBD placeholder
	TBD: 'un', // UN flag for placeholder
};

/**
 * Get flag image URL from FIFA country code
 * Uses flagcdn.com for reliable flag images
 */
export function getFlagUrl(fifaCode: string, size: 'sm' | 'md' | 'lg' = 'md'): string {
	const isoCode = FIFA_TO_ISO[fifaCode.toUpperCase()] || 'un';

	// Handle GB subdivisions (Scotland, England, Wales, Northern Ireland)
	if (isoCode.startsWith('gb-')) {
		return `https://flagcdn.com/w${getSizeWidth(size)}/${isoCode}.png`;
	}

	const width = getSizeWidth(size);
	return `https://flagcdn.com/w${width}/${isoCode}.png`;
}

function getSizeWidth(size: 'sm' | 'md' | 'lg'): number {
	switch (size) {
		case 'sm':
			return 20;
		case 'md':
			return 40;
		case 'lg':
			return 80;
		default:
			return 40;
	}
}

/**
 * Get flag emoji from FIFA country code (fallback for when images don't load)
 */
export function getFlagEmoji(fifaCode: string): string {
	const isoCode = FIFA_TO_ISO[fifaCode.toUpperCase()];
	if (!isoCode || isoCode === 'un') return '🏳️';

	// Handle GB subdivisions
	if (isoCode.startsWith('gb-')) {
		const subdivision = isoCode.split('-')[1];
		switch (subdivision) {
			case 'eng':
				return '🏴󠁧󠁢󠁥󠁮󠁧󠁿';
			case 'sct':
				return '🏴󠁧󠁢󠁳󠁣󠁴󠁿';
			case 'wls':
				return '🏴󠁧󠁢󠁷󠁬󠁳󠁿';
			case 'nir':
				return '🇬🇧'; // No specific emoji for Northern Ireland
			default:
				return '🇬🇧';
		}
	}

	// Convert ISO code to regional indicator symbols
	const codePoints = isoCode
		.toUpperCase()
		.split('')
		.map((char) => 0x1f1e6 + char.charCodeAt(0) - 65);
	return String.fromCodePoint(...codePoints);
}
