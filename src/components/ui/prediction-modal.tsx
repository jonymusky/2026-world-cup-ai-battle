'use client';

import { useRef, useEffect, useCallback } from 'react';
import { ProviderLogo } from './provider-logo';

interface PredictionModalProps {
	modelName: string;
	modelProvider: string;
	modelColor?: string;
	homeTeam: string;
	awayTeam: string;
	homeScore: number;
	awayScore: number;
	confidence: number;
	reasoning: string;
	children: React.ReactNode;
}

export function PredictionModal({
	modelName,
	modelProvider,
	modelColor,
	homeTeam,
	awayTeam,
	homeScore,
	awayScore,
	confidence,
	reasoning,
	children,
}: PredictionModalProps): React.JSX.Element {
	const dialogRef = useRef<HTMLDialogElement>(null);

	const openModal = useCallback(() => {
		dialogRef.current?.showModal();
	}, []);

	const closeModal = useCallback(() => {
		dialogRef.current?.close();
	}, []);

	useEffect(() => {
		const dialog = dialogRef.current;
		if (!dialog) return;

		function handleBackdropClick(e: MouseEvent) {
			if (e.target === dialog) {
				(e.target as HTMLDialogElement).close();
			}
		}

		dialog.addEventListener('click', handleBackdropClick);
		return () => dialog.removeEventListener('click', handleBackdropClick);
	}, []);

	return (
		<>
			<button
				type="button"
				onClick={openModal}
				className="w-full text-left transition-transform hover:scale-[1.02] active:scale-[0.98]"
			>
				{children}
			</button>

			<dialog
				ref={dialogRef}
				className="fixed inset-0 m-auto max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-card-border bg-background p-0 shadow-2xl backdrop:bg-black/60 backdrop:backdrop-blur-sm"
			>
				{/* Header */}
				<div
					className="sticky top-0 border-b border-card-border p-4"
					style={{ backgroundColor: `${modelColor}15` }}
				>
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3">
							<ProviderLogo provider={modelProvider} size={32} color={modelColor} />
							<div>
								<h3 className="font-bold" style={{ color: modelColor }}>
									{modelName}
								</h3>
								<p className="text-xs text-foreground/50">{modelProvider}</p>
							</div>
						</div>
						<button
							type="button"
							onClick={closeModal}
							className="rounded-full p-2 hover:bg-card-border"
							aria-label="Close modal"
						>
							<svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
							</svg>
						</button>
					</div>
				</div>

				{/* Content */}
				<div className="p-4">
					{/* Match & Score */}
					<div className="mb-4 flex items-center justify-center gap-4 rounded-xl bg-card-bg p-4">
						<span className="text-lg font-bold">{homeTeam}</span>
						<div
							className="rounded-lg px-4 py-2 text-2xl font-bold"
							style={{ backgroundColor: `${modelColor}20`, color: modelColor }}
						>
							{homeScore} - {awayScore}
						</div>
						<span className="text-lg font-bold">{awayTeam}</span>
					</div>

					{/* Confidence */}
					<div className="mb-4">
						<div className="mb-1 flex items-center justify-between text-sm">
							<span className="text-foreground/60">Confidence</span>
							<span className="font-medium">{Math.round(confidence * 100)}%</span>
						</div>
						<div className="h-2 overflow-hidden rounded-full bg-card-border">
							<div
								className="h-full rounded-full transition-all"
								style={{
									width: `${confidence * 100}%`,
									backgroundColor: modelColor,
								}}
							/>
						</div>
					</div>

					{/* Reasoning */}
					<div>
						<h4 className="mb-2 text-sm font-medium text-foreground/60">Reasoning</h4>
						<p className="text-sm leading-relaxed text-foreground/80">{reasoning}</p>
					</div>
				</div>
			</dialog>
		</>
	);
}
