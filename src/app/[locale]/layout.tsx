import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import type { ReactNode } from 'react';
import { locales } from '@/i18n/config';
import { Header } from '@/components/ui/header';
import { Footer } from '@/components/ui/footer';

type Props = {
	children: ReactNode;
	params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
	return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: Props) {
	const { locale } = await params;
	setRequestLocale(locale);
	const messages = await getMessages();

	return (
		<NextIntlClientProvider messages={messages}>
			<div className="flex min-h-screen flex-col">
				<Header />
				<main className="flex-1">{children}</main>
				<Footer />
			</div>
		</NextIntlClientProvider>
	);
}
