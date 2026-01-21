'use client';

import { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import type { Group } from 'three';

// Pentagon positions on a truncated icosahedron (normalized to unit sphere)
// These are the centers of the 12 black pentagons on a real soccer ball
const PENTAGON_POSITIONS: [number, number, number][] = [
	[0, 1, 0], // Top
	[0, -1, 0], // Bottom
	// Upper ring
	[0.894, 0.447, 0],
	[0.276, 0.447, 0.851],
	[-0.724, 0.447, 0.526],
	[-0.724, 0.447, -0.526],
	[0.276, 0.447, -0.851],
	// Lower ring (rotated 36 degrees)
	[0.724, -0.447, 0.526],
	[-0.276, -0.447, 0.851],
	[-0.894, -0.447, 0],
	[-0.276, -0.447, -0.851],
	[0.724, -0.447, -0.526],
];

// Create a pentagon shape
function createPentagonGeometry(radius: number): THREE.ShapeGeometry {
	const shape = new THREE.Shape();
	const sides = 5;

	for (let i = 0; i <= sides; i++) {
		const angle = (i * 2 * Math.PI) / sides - Math.PI / 2;
		const x = radius * Math.cos(angle);
		const y = radius * Math.sin(angle);
		if (i === 0) {
			shape.moveTo(x, y);
		} else {
			shape.lineTo(x, y);
		}
	}

	return new THREE.ShapeGeometry(shape);
}

// Pentagon component that positions itself on sphere surface
function Pentagon({
	position,
	sphereRadius,
}: { position: [number, number, number]; sphereRadius: number }) {
	const meshRef = useRef<THREE.Mesh>(null);

	const geometry = useMemo(() => createPentagonGeometry(0.38), []);

	// Calculate rotation to face outward from sphere center
	const quaternion = useMemo(() => {
		const up = new THREE.Vector3(0, 0, 1);
		const target = new THREE.Vector3(...position).normalize();
		const quat = new THREE.Quaternion();
		quat.setFromUnitVectors(up, target);
		return quat;
	}, [position]);

	const worldPosition = useMemo(() => {
		const pos = new THREE.Vector3(...position).normalize();
		return pos.multiplyScalar(sphereRadius * 1.001); // Slightly above sphere surface
	}, [position, sphereRadius]);

	return (
		<mesh
			ref={meshRef}
			position={worldPosition}
			quaternion={quaternion}
			geometry={geometry}
		>
			<meshStandardMaterial
				color="#1a1a1a"
				roughness={0.4}
				metalness={0}
				side={THREE.DoubleSide}
			/>
		</mesh>
	);
}

function SoccerBall() {
	const groupRef = useRef<Group>(null);
	const sphereRadius = 1;

	useFrame((state) => {
		if (groupRef.current) {
			groupRef.current.rotation.y += 0.003;
			groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.25) * 0.1 + 0.15;
		}
	});

	return (
		<group ref={groupRef} scale={2.0}>
			{/* White sphere base */}
			<mesh>
				<sphereGeometry args={[sphereRadius, 64, 64]} />
				<meshStandardMaterial
					color="#f8f8f8"
					roughness={0.5}
					metalness={0}
				/>
			</mesh>

			{/* Black pentagons */}
			{PENTAGON_POSITIONS.map((pos) => (
				<Pentagon key={`pentagon-${pos[0]}-${pos[1]}-${pos[2]}`} position={pos} sphereRadius={sphereRadius} />
			))}
		</group>
	);
}

function LoadingBall() {
	const meshRef = useRef<THREE.Mesh>(null);

	useFrame(() => {
		if (meshRef.current) {
			meshRef.current.rotation.y += 0.01;
		}
	});

	return (
		<mesh ref={meshRef} scale={2.0}>
			<sphereGeometry args={[1, 32, 32]} />
			<meshStandardMaterial color="#f5f5f5" roughness={0.4} />
		</mesh>
	);
}

export function SoccerBallScene(): React.JSX.Element {
	return (
		<Canvas
			camera={{ position: [0, 0, 5], fov: 45 }}
			style={{ background: 'transparent' }}
			gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
		>
			<ambientLight intensity={0.5} />
			<directionalLight position={[5, 5, 5]} intensity={1.0} castShadow />
			<directionalLight position={[-3, 2, -3]} intensity={0.3} />
			<pointLight position={[0, 0, 4]} intensity={0.3} />

			<Suspense fallback={<LoadingBall />}>
				<SoccerBall />
			</Suspense>

			<OrbitControls
				enableZoom={false}
				enablePan={false}
				autoRotate
				autoRotateSpeed={0.4}
				minPolarAngle={Math.PI / 3}
				maxPolarAngle={Math.PI / 1.5}
			/>
		</Canvas>
	);
}
