import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import type { ReactNode } from 'react';
import { Analytics } from '@vercel/analytics/next';
import './globals.css';

const geistSans = Geist({
	variable: '--font-geist-sans',
	subsets: ['latin'],
});

const geistMono = Geist_Mono({
	variable: '--font-geist-mono',
	subsets: ['latin'],
});

export const metadata: Metadata = {
	title: {
		default: '2026 World Cup AI Battle',
		template: '%s | 2026 World Cup AI Battle',
	},
	description:
		'Watch AI models compete to predict the 2026 FIFA World Cup results. See which LLM reigns supreme!',
	keywords: [
		'World Cup 2026',
		'AI predictions',
		'LLM',
		'GPT-4',
		'Claude',
		'Gemini',
		'football',
		'soccer',
	],
	authors: [{ name: '2026 World Cup AI Battle' }],
	openGraph: {
		title: '2026 World Cup AI Battle',
		description: 'Watch AI models compete to predict the 2026 FIFA World Cup results',
		type: 'website',
	},
};

export default function RootLayout({ children }: { children: ReactNode }) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
				{children}
				<Analytics />
			</body>
		</html>
	);
}
