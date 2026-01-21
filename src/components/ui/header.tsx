'use client';

import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LocaleSwitcher } from './locale-switcher';

const NAV_KEYS = ['home', 'leaderboard', 'predictions', 'matches'] as const;

export function Header(): React.JSX.Element {
	const t = useTranslations('nav');
	const pathname = usePathname();
	const locale = useLocale();

	const navItems = NAV_KEYS.map((key) => ({
		key,
		href: key === 'home' ? `/${locale}` : `/${locale}/${key}`,
		label: t(key),
	}));

	function isActive(key: string): boolean {
		if (key === 'home') {
			return pathname === '/' || pathname === `/${locale}`;
		}
		return pathname.includes(`/${key}`);
	}

	return (
		<header className="sticky top-0 z-50 border-b border-card-border bg-background/80 backdrop-blur-md">
			<div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
				<Link href={`/${locale}`} className="flex items-center gap-2">
					<span className="text-2xl">⚽</span>
					<span className="gradient-text text-lg font-bold">AI Battle 2026</span>
				</Link>

				<nav className="hidden items-center gap-1 md:flex">
					{navItems.map((item) => (
						<Link
							key={item.key}
							href={item.href}
							className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
								isActive(item.key)
									? 'bg-primary/10 text-primary'
									: 'text-foreground/70 hover:bg-card-bg hover:text-foreground'
							}`}
						>
							{item.label}
						</Link>
					))}
				</nav>

				<div className="flex items-center gap-4">
					<LocaleSwitcher />
					<Link
						href={`/${locale}/leaderboard`}
						className="hidden rounded-full bg-primary px-4 py-2 text-sm font-medium text-background transition-colors hover:bg-primary-dark sm:block"
					>
						{t('leaderboard')}
					</Link>
				</div>
			</div>
		</header>
	);
}
