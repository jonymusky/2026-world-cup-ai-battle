import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock next/navigation
vi.mock('next/navigation', () => ({
	useRouter: () => ({
		push: vi.fn(),
		replace: vi.fn(),
		prefetch: vi.fn(),
		back: vi.fn(),
	}),
	useSearchParams: () => new URLSearchParams(),
	usePathname: () => '/',
}));

// Mock next-intl
vi.mock('next-intl', () => ({
	useTranslations: () => (key: string) => key,
	useLocale: () => 'en',
}));

// Mock React Three Fiber
vi.mock('@react-three/fiber', () => ({
	Canvas: ({ children }: { children: React.ReactNode }) => children,
	useFrame: vi.fn(),
	useThree: () => ({
		camera: {},
		scene: {},
		gl: {},
	}),
}));

// Mock drei
vi.mock('@react-three/drei', () => ({
	OrbitControls: () => null,
	Sphere: () => null,
	Html: ({ children }: { children: React.ReactNode }) => children,
	useTexture: () => ({}),
}));
