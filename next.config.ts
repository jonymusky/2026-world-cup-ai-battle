import createNextIntlPlugin from 'next-intl/plugin';
import type { NextConfig } from 'next';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
	transpilePackages: ['three'],
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'img.logo.dev',
			},
		],
	},
};

export default withNextIntl(nextConfig);
