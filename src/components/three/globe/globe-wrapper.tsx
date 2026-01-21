'use client';

import { useEffect, useState, Component, type ReactNode } from 'react';

// Error boundary for Three.js render errors
class ThreeErrorBoundary extends Component<
	{ children: ReactNode; fallback: ReactNode },
	{ hasError: boolean; error: Error | null }
> {
	constructor(props: { children: ReactNode; fallback: ReactNode }) {
		super(props);
		this.state = { hasError: false, error: null };
	}

	static getDerivedStateFromError(error: Error) {
		return { hasError: true, error };
	}

	componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
		console.error('Three.js render error:', error, errorInfo);
	}

	render() {
		if (this.state.hasError) {
			return this.props.fallback;
		}
		return this.props.children;
	}
}

function GlobeLoading() {
	return (
		<div className="flex h-full w-full items-center justify-center">
			<div className="flex flex-col items-center gap-4">
				<div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
				<p className="text-sm text-foreground/60">Loading 3D...</p>
			</div>
		</div>
	);
}

// CSS Soccer Ball - works without Three.js
function CSSSoccerBall() {
	return (
		<div className="flex h-full w-full items-center justify-center">
			<div className="soccer-ball-container">
				<div className="soccer-ball">
					<div className="pentagon" />
					<div className="pentagon" />
					<div className="pentagon" />
					<div className="pentagon" />
					<div className="pentagon" />
				</div>
			</div>
			<style jsx>{`
				.soccer-ball-container {
					perspective: 1000px;
					width: 200px;
					height: 200px;
				}
				.soccer-ball {
					width: 200px;
					height: 200px;
					border-radius: 50%;
					background: linear-gradient(135deg, #ffffff 0%, #e8e8e8 50%, #d0d0d0 100%);
					box-shadow:
						inset -20px -20px 40px rgba(0, 0, 0, 0.1),
						inset 10px 10px 20px rgba(255, 255, 255, 0.5),
						0 20px 40px rgba(0, 0, 0, 0.3);
					position: relative;
					animation: rotate3d 8s linear infinite;
					transform-style: preserve-3d;
				}
				.pentagon {
					position: absolute;
					width: 50px;
					height: 50px;
					background: #1a1a1a;
					clip-path: polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%);
				}
				.pentagon:nth-child(1) { top: 20px; left: 75px; }
				.pentagon:nth-child(2) { top: 65px; left: 25px; transform: rotate(72deg); }
				.pentagon:nth-child(3) { top: 65px; right: 25px; transform: rotate(-72deg); }
				.pentagon:nth-child(4) { bottom: 45px; left: 45px; transform: rotate(36deg); }
				.pentagon:nth-child(5) { bottom: 45px; right: 45px; transform: rotate(-36deg); }
				@keyframes rotate3d {
					0% { transform: rotateY(0deg) rotateX(10deg); }
					100% { transform: rotateY(360deg) rotateX(10deg); }
				}
			`}</style>
		</div>
	);
}

export function GlobeWrapper() {
	const [isClient, setIsClient] = useState(false);
	const [SceneComponent, setSceneComponent] = useState<React.ComponentType | null>(null);
	const [loadError, setLoadError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		setIsClient(true);

		// Check for reduced motion preference
		const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

		if (prefersReducedMotion) {
			setIsLoading(false);
			return;
		}

		// Try to dynamically import the 3D soccer ball
		import('../soccer-ball/soccer-ball-scene')
			.then((mod) => {
				console.log('Three.js Soccer Ball loaded successfully');
				setSceneComponent(() => mod.SoccerBallScene);
				setIsLoading(false);
			})
			.catch((error) => {
				console.error('Failed to load 3D Soccer Ball:', error);
				setLoadError(error.message);
				setIsLoading(false);
			});
	}, []);

	if (!isClient) {
		return <GlobeLoading />;
	}

	// Show loading while importing
	if (isLoading) {
		return <GlobeLoading />;
	}

	// Use CSS soccer ball as fallback if load failed or no component
	if (loadError || !SceneComponent) {
		return (
			<div className="float-animation relative h-full w-full">
				<CSSSoccerBall />
				{loadError && process.env.NODE_ENV === 'development' && (
					<div className="absolute bottom-2 left-2 right-2 rounded bg-red-500/80 p-2 text-xs text-white">
						Three.js Error: {loadError}
					</div>
				)}
			</div>
		);
	}

	return (
		<div className="float-animation relative h-full w-full">
			<ThreeErrorBoundary
				fallback={
					<div className="float-animation relative h-full w-full">
						<CSSSoccerBall />
					</div>
				}
			>
				<SceneComponent />
			</ThreeErrorBoundary>
		</div>
	);
}
