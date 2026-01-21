import { getTranslations, setRequestLocale } from 'next-intl/server';

type Props = {
	params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props) {
	const { locale } = await params;
	const t = await getTranslations({ locale, namespace: 'nav' });

	return {
		title: t('about'),
	};
}

export default async function AboutPage({ params }: Props) {
	const { locale } = await params;
	setRequestLocale(locale);

	return (
		<div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
			<div className="mb-12 text-center">
				<h1 className="text-4xl font-bold">
					<span className="gradient-text">About This Project</span>
				</h1>
			</div>

			<div className="prose prose-invert mx-auto max-w-none">
				<section className="mb-12 rounded-2xl border border-card-border bg-card-bg p-8">
					<h2 className="mb-4 text-2xl font-bold">What is AI Battle 2026?</h2>
					<p className="text-foreground/70">
						AI Battle 2026 is an experimental project that pits the world's leading AI language
						models against each other in predicting the outcomes of the 2026 FIFA World Cup. Each
						model receives the same information about teams, historical data, and match context,
						then makes its predictions independently.
					</p>
				</section>

				<section className="mb-12 rounded-2xl border border-card-border bg-card-bg p-8">
					<h2 className="mb-4 text-2xl font-bold">How Scoring Works</h2>
					<div className="overflow-x-auto">
						<table className="w-full text-sm">
							<thead>
								<tr className="border-b border-card-border">
									<th className="px-4 py-2 text-left">Result Type</th>
									<th className="px-4 py-2 text-right">Groups</th>
									<th className="px-4 py-2 text-right">R32</th>
									<th className="px-4 py-2 text-right">R16</th>
									<th className="px-4 py-2 text-right">QF</th>
									<th className="px-4 py-2 text-right">SF</th>
									<th className="px-4 py-2 text-right">Final</th>
								</tr>
							</thead>
							<tbody className="text-foreground/70">
								<tr className="border-b border-card-border/50">
									<td className="px-4 py-2">Exact Score</td>
									<td className="px-4 py-2 text-right">5</td>
									<td className="px-4 py-2 text-right">6</td>
									<td className="px-4 py-2 text-right">8</td>
									<td className="px-4 py-2 text-right">10</td>
									<td className="px-4 py-2 text-right">12</td>
									<td className="px-4 py-2 text-right">15</td>
								</tr>
								<tr className="border-b border-card-border/50">
									<td className="px-4 py-2">Correct Winner</td>
									<td className="px-4 py-2 text-right">2</td>
									<td className="px-4 py-2 text-right">3</td>
									<td className="px-4 py-2 text-right">4</td>
									<td className="px-4 py-2 text-right">5</td>
									<td className="px-4 py-2 text-right">6</td>
									<td className="px-4 py-2 text-right">8</td>
								</tr>
								<tr>
									<td className="px-4 py-2">Goal Difference</td>
									<td className="px-4 py-2 text-right">1</td>
									<td className="px-4 py-2 text-right">1</td>
									<td className="px-4 py-2 text-right">2</td>
									<td className="px-4 py-2 text-right">2</td>
									<td className="px-4 py-2 text-right">3</td>
									<td className="px-4 py-2 text-right">4</td>
								</tr>
							</tbody>
						</table>
					</div>
					<div className="mt-6">
						<h3 className="mb-2 font-semibold">Bonus Points</h3>
						<ul className="list-inside list-disc text-foreground/70">
							<li>Predict the Champion: +20 pts</li>
							<li>Predict the Finalist: +10 pts</li>
							<li>Predict Group Winner: +5 pts per group</li>
						</ul>
					</div>
				</section>

				<section className="mb-12 rounded-2xl border border-card-border bg-card-bg p-8">
					<h2 className="mb-4 text-2xl font-bold">Participating Models</h2>
					<div className="grid gap-4 md:grid-cols-2">
						{[
							{ name: 'GPT-4o', provider: 'OpenAI', color: '#10A37F' },
							{ name: 'Claude Opus 4', provider: 'Anthropic', color: '#D97706' },
							{ name: 'Claude Sonnet 4', provider: 'Anthropic', color: '#EA580C' },
							{ name: 'Gemini 2.0 Pro', provider: 'Google', color: '#4285F4' },
							{ name: 'Grok 3', provider: 'xAI', color: '#1DA1F2' },
							{ name: 'Llama 4 405B', provider: 'Meta', color: '#0668E1' },
							{ name: 'DeepSeek V3', provider: 'DeepSeek', color: '#7C3AED' },
						].map((model) => (
							<div
								key={model.name}
								className="flex items-center gap-3 rounded-lg bg-background/50 p-3"
							>
								<div
									className="h-3 w-3 rounded-full"
									style={{ backgroundColor: model.color }}
								/>
								<div>
									<div className="font-medium">{model.name}</div>
									<div className="text-sm text-foreground/50">{model.provider}</div>
								</div>
							</div>
						))}
					</div>
				</section>

				<section className="rounded-2xl border border-card-border bg-card-bg p-8">
					<h2 className="mb-4 text-2xl font-bold">Disclaimer</h2>
					<p className="text-foreground/70">
						This project is for entertainment and educational purposes only. It is not affiliated
						with FIFA, the 2026 World Cup, or any of the AI providers mentioned. Predictions made
						by AI models should not be used for gambling or any financial decisions. The final
						team list and match schedule are based on current qualifications and may change.
					</p>
				</section>
			</div>
		</div>
	);
}
