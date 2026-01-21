'use client';

import { OrbitControls, Sphere, Stars } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import { useRef, useMemo } from 'react';
import type { Mesh, Group } from 'three';
import * as THREE from 'three';

function Globe() {
	const meshRef = useRef<Mesh>(null);
	const groupRef = useRef<Group>(null);

	useFrame((_, delta) => {
		if (meshRef.current) {
			meshRef.current.rotation.y += delta * 0.1;
		}
	});

	// Create a simple gradient material for the globe
	const material = useMemo(() => {
		return new THREE.MeshStandardMaterial({
			color: '#10b981',
			metalness: 0.3,
			roughness: 0.7,
			wireframe: true,
		});
	}, []);

	return (
		<group ref={groupRef}>
			{/* Main globe */}
			<Sphere ref={meshRef} args={[2, 64, 64]} material={material} />

			{/* Inner glow sphere */}
			<Sphere args={[1.95, 32, 32]}>
				<meshBasicMaterial color="#0a0a0a" transparent opacity={0.9} />
			</Sphere>

			{/* Outer glow */}
			<Sphere args={[2.1, 32, 32]}>
				<meshBasicMaterial color="#10b981" transparent opacity={0.05} />
			</Sphere>
		</group>
	);
}

function TeamMarkers() {
	const groupRef = useRef<Group>(null);

	// Sample team locations (simplified)
	const teams = useMemo(
		() => [
			{ name: 'USA', lat: 38.9, lng: -77.0, color: '#3b82f6' },
			{ name: 'Mexico', lat: 19.4, lng: -99.1, color: '#22c55e' },
			{ name: 'Brazil', lat: -15.8, lng: -47.9, color: '#eab308' },
			{ name: 'Argentina', lat: -34.6, lng: -58.4, color: '#60a5fa' },
			{ name: 'England', lat: 51.5, lng: -0.1, color: '#ef4444' },
			{ name: 'France', lat: 48.9, lng: 2.4, color: '#3b82f6' },
			{ name: 'Germany', lat: 52.5, lng: 13.4, color: '#fbbf24' },
			{ name: 'Spain', lat: 40.4, lng: -3.7, color: '#dc2626' },
		],
		[]
	);

	const latLngToVector3 = (lat: number, lng: number, radius: number) => {
		const phi = (90 - lat) * (Math.PI / 180);
		const theta = (lng + 180) * (Math.PI / 180);
		return new THREE.Vector3(
			-radius * Math.sin(phi) * Math.cos(theta),
			radius * Math.cos(phi),
			radius * Math.sin(phi) * Math.sin(theta)
		);
	};

	useFrame((_, delta) => {
		if (groupRef.current) {
			groupRef.current.rotation.y += delta * 0.1;
		}
	});

	return (
		<group ref={groupRef}>
			{teams.map((team) => {
				const position = latLngToVector3(team.lat, team.lng, 2.05);
				return (
					<mesh key={team.name} position={position}>
						<sphereGeometry args={[0.03, 16, 16]} />
						<meshBasicMaterial color={team.color} />
					</mesh>
				);
			})}
		</group>
	);
}

export function GlobeScene() {
	return (
		<Canvas
			camera={{ position: [0, 0, 5], fov: 45 }}
			gl={{ antialias: true, alpha: true }}
			style={{ background: 'transparent' }}
		>
			<ambientLight intensity={0.5} />
			<pointLight position={[10, 10, 10]} intensity={1} />
			<pointLight position={[-10, -10, -10]} intensity={0.5} color="#10b981" />

			<Globe />
			<TeamMarkers />

			<Stars radius={100} depth={50} count={1000} factor={4} saturation={0} fade speed={1} />

			<OrbitControls
				enableZoom={false}
				enablePan={false}
				autoRotate
				autoRotateSpeed={0.5}
				minPolarAngle={Math.PI / 3}
				maxPolarAngle={Math.PI / 1.5}
			/>
		</Canvas>
	);
}
