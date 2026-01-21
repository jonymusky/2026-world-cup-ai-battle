import { getTranslations, setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import { LeaderboardPreview } from '@/components/leaderboard/leaderboard-preview';
import { GlobeWrapper } from '@/components/three/globe/globe-wrapper';

interface Props {
	params: Promise<{ locale: string }>;
}

export default async function HomePage({ params }: Props): Promise<React.JSX.Element> {
	const { locale } = await params;
	setRequestLocale(locale);
	const t = await getTranslations('home');

	return (
		<div className="relative">
			{/* Hero Section */}
			<section className="relative overflow-hidden">
				{/* Background gradient */}
				<div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />

				<div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
					<div className="grid items-center gap-12 lg:grid-cols-2">
						{/* Text content */}
						<div className="text-center lg:text-left">
							<h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
								<span className="gradient-text">{t('title')}</span>
							</h1>
							<p className="mt-6 text-lg text-foreground/70 sm:text-xl">{t('subtitle')}</p>
							<div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center lg:justify-start">
								<Link
									href={`/${locale}/leaderboard`}
									className="glow-primary inline-flex items-center justify-center rounded-full bg-primary px-8 py-3 text-lg font-semibold text-background transition-all hover:bg-primary-dark"
								>
									{t('cta')}
								</Link>
								<Link
									href={`/${locale}/predictions`}
									className="inline-flex items-center justify-center rounded-full border border-card-border bg-card-bg px-8 py-3 text-lg font-semibold text-foreground transition-all hover:border-primary hover:text-primary"
								>
									View Predictions
								</Link>
							</div>
						</div>

						{/* 3D Globe */}
						<div className="relative h-[400px] lg:h-[500px]">
							<GlobeWrapper />
						</div>
					</div>
				</div>
			</section>

			{/* Leaderboard Preview */}
			<section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
				<div className="mb-12 text-center">
					<h2 className="text-3xl font-bold">{t('topModels')}</h2>
					<p className="mt-4 text-foreground/60">See which AI is leading the prediction race</p>
				</div>
				<LeaderboardPreview locale={locale} />
			</section>

			{/* Stats Section */}
			<section className="border-y border-card-border bg-card-bg/50">
				<div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
					<div className="grid grid-cols-2 gap-8 md:grid-cols-4">
						<div className="text-center">
							<div className="gradient-text text-4xl font-bold">7</div>
							<div className="mt-2 text-sm text-foreground/60">AI Models</div>
						</div>
						<div className="text-center">
							<div className="gradient-text text-4xl font-bold">48</div>
							<div className="mt-2 text-sm text-foreground/60">Teams</div>
						</div>
						<div className="text-center">
							<div className="gradient-text text-4xl font-bold">104</div>
							<div className="mt-2 text-sm text-foreground/60">Matches</div>
						</div>
						<div className="text-center">
							<div className="gradient-text text-4xl font-bold">728</div>
							<div className="mt-2 text-sm text-foreground/60">Predictions</div>
						</div>
					</div>
				</div>
			</section>
		</div>
	);
}
