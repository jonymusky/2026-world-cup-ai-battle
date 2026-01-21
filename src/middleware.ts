import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
	// Match all pathnames except for:
	// - API routes (/api)
	// - Static files (/_next, /images, etc.)
	// - Public files with extensions
	matcher: ['/((?!api|_next|.*\\..*).*)'],
};
