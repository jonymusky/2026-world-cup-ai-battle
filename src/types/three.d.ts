import '@react-three/fiber';

declare global {
	namespace React {
		namespace JSX {
			interface IntrinsicElements {
				// biome-ignore lint/suspicious/noExplicitAny: R3F types are complex
				[key: string]: any;
			}
		}
	}
}
