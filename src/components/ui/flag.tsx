'use client';

import { useState } from 'react';
import { getFlagEmoji, getFlagUrl } from '@/lib/utils/flags';

interface FlagProps {
	code: string;
	name?: string;
	size?: 'sm' | 'md' | 'lg';
	className?: string;
}

const SIZE_CLASSES = {
	sm: 'w-5 h-4',
	md: 'w-8 h-6',
	lg: 'w-12 h-9',
} as const;

export function Flag({ code, name, size = 'md', className = '' }: FlagProps): React.JSX.Element {
	const [imageError, setImageError] = useState(false);

	if (imageError || code === 'TBD') {
		// Fallback to emoji
		return (
			<span className={`inline-flex items-center justify-center ${className}`} title={name}>
				<span className={size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-4xl' : 'text-2xl'}>
					{getFlagEmoji(code)}
				</span>
			</span>
		);
	}

	return (
		<img
			src={getFlagUrl(code, size)}
			alt={name || code}
			title={name}
			className={`${SIZE_CLASSES[size]} rounded-sm object-cover shadow-sm ${className}`}
			onError={() => setImageError(true)}
			loading="lazy"
		/>
	);
}
