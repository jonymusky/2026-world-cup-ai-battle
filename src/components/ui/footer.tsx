'use client';

import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';

const NAV_KEYS = ['home', 'leaderboard', 'predictions', 'matches'] as const;
const AI_MODELS = ['GPT-5.2', 'Claude Opus 4.5', 'Gemini 2.5 Flash', 'Grok 3'] as const;

export function Footer(): React.JSX.Element {
	const t = useTranslations('nav');
	const locale = useLocale();

	const navLinks = NAV_KEYS.map((key) => ({
		key,
		href: key === 'home' ? `/${locale}` : `/${locale}/${key}`,
		label: t(key),
	}));

	return (
		<footer className="border-t border-card-border bg-card-bg">
			<div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
				<div className="grid grid-cols-2 gap-8 md:grid-cols-4">
					<div className="col-span-2 md:col-span-1">
						<div className="flex items-center gap-2">
							<span className="text-2xl">⚽</span>
							<span className="gradient-text text-lg font-bold">AI Battle 2026</span>
						</div>
						<p className="mt-4 text-sm text-foreground/60">
							The ultimate showdown between AI models predicting the 2026 FIFA World Cup.
						</p>
					</div>

					<div>
						<h3 className="font-semibold text-foreground">Navigation</h3>
						<ul className="mt-4 space-y-2">
							{navLinks.map((link) => (
								<li key={link.key}>
									<Link
										href={link.href}
										className="text-sm text-foreground/60 hover:text-primary"
									>
										{link.label}
									</Link>
								</li>
							))}
						</ul>
					</div>

					<div>
						<h3 className="font-semibold text-foreground">AI Models</h3>
						<ul className="mt-4 space-y-2">
							{AI_MODELS.map((model) => (
								<li key={model} className="text-sm text-foreground/60">
									{model}
								</li>
							))}
						</ul>
					</div>

					<div>
						<h3 className="font-semibold text-foreground">About</h3>
						<ul className="mt-4 space-y-2">
							<li>
								<Link
									href={`/${locale}/about`}
									className="text-sm text-foreground/60 hover:text-primary"
								>
									{t('about')}
								</Link>
							</li>
							<li>
								<a
									href="https://github.com/jonymusky/2026-world-cup-ai-battle"
									target="_blank"
									rel="noopener noreferrer"
									className="text-sm text-foreground/60 hover:text-primary"
								>
									GitHub
								</a>
							</li>
						</ul>
					</div>
				</div>

				<div className="mt-12 border-t border-card-border pt-8">
					<p className="text-center text-sm text-foreground/40">
						© 2026 AI Battle. Not affiliated with FIFA. Made for fun and AI experimentation.
					</p>
				</div>
			</div>
		</footer>
	);
}
