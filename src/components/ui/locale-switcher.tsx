'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { type Locale, localeNames, locales } from '@/i18n/config';

export function LocaleSwitcher() {
	const locale = useLocale();
	const router = useRouter();
	const pathname = usePathname();

	const handleChange = (newLocale: string) => {
		// Remove current locale from pathname and add new one
		const segments = pathname.split('/');
		if (locales.includes(segments[1] as Locale)) {
			segments[1] = newLocale;
		} else {
			segments.splice(1, 0, newLocale);
		}
		router.push(segments.join('/') || '/');
	};

	return (
		<div className="relative">
			<select
				value={locale}
				onChange={(e) => handleChange(e.target.value)}
				className="cursor-pointer appearance-none rounded-lg border border-card-border bg-card-bg px-3 py-1.5 pr-8 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
			>
				{locales.map((loc) => (
					<option key={loc} value={loc}>
						{localeNames[loc]}
					</option>
				))}
			</select>
			<div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
				<svg
					className="h-4 w-4 text-foreground/60"
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
