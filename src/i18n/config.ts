import { routing } from './routing';

export const locales = routing.locales;
export type Locale = (typeof locales)[number];

export const defaultLocale = routing.defaultLocale;

export const localeNames: Record<Locale, string> = {
	en: 'English',
	es: 'Espanol',
	pt: 'Portugues',
};
