'use client';

import { useState } from 'react';

interface ProviderLogoProps {
	provider: string;
	color?: string;
	size?: number;
}

// Local logo paths and whether they need inversion for dark mode
const PROVIDER_LOGOS: Record<string, { path: string; invertOnDark?: boolean }> = {
	openai: { path: '/logos/openai.svg', invertOnDark: true },
	anthropic: { path: '/logos/anthropic.svg', invertOnDark: true },
	google: { path: '/logos/google.svg' },
	xai: { path: '/logos/xai.png' },
	meta: { path: '/logos/meta.svg', invertOnDark: true },
	deepseek: { path: '/logos/deepseek.png' },
};

export function ProviderLogo({ provider, color = '#888', size = 32 }: ProviderLogoProps) {
	const [hasError, setHasError] = useState(false);
	const logoConfig = PROVIDER_LOGOS[provider];

	if (hasError || !logoConfig) {
		return (
			<div
				className="flex items-center justify-center rounded-lg text-white text-xs font-bold uppercase"
				style={{
					backgroundColor: color,
					width: size,
					height: size,
				}}
			>
				{provider.slice(0, 2)}
			</div>
		);
	}

	return (
		<img
			src={logoConfig.path}
			alt={provider}
			width={size}
			height={size}
			className={`rounded-lg object-contain ${logoConfig.invertOnDark ? 'dark:invert' : ''}`}
			style={{ filter: logoConfig.invertOnDark ? 'invert(1)' : undefined }}
			onError={() => setHasError(true)}
		/>
	);
}
