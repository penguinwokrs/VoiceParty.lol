// "Duo/Party Arc" — the VoiceCrew symbol.
//
// A centre dot (the shared room) wrapped by two nested arc pairs (the voices
// around it). Single-colour Ember stroke, so it survives at favicon sizes and
// on any background. The symbol is deliberately independent of the wordmark:
// nothing here encodes the name, so a rename never invalidates the asset.
//
// `speaking` steps the outer arc pair out by one beat, which lets the same mark
// double as a live-state indicator. Honours prefers-reduced-motion.
import type { CSSProperties } from "react";

export type BrandMarkProps = {
	/** Rendered px size (square). Legible down to 16. */
	size?: number;
	/** Pulse the outer arcs — use to signal an active/speaking room. */
	speaking?: boolean;
	/** Stroke colour. Defaults to the Ember brand token. */
	color?: string;
	title?: string;
	style?: CSSProperties;
	className?: string;
};

// Geometry is expressed on a 32x32 grid, centred on (16,16).
// Inner arcs r=7.5, outer r=12, each spanning 100° left and right of centre.
const INNER_RIGHT = "M20.82 10.26A7.5 7.5 0 0 1 20.82 21.74";
const INNER_LEFT = "M11.18 21.74A7.5 7.5 0 0 1 11.18 10.26";
const OUTER_RIGHT = "M23.71 6.81A12 12 0 0 1 23.71 25.19";
const OUTER_LEFT = "M8.29 25.19A12 12 0 0 1 8.29 6.81";

export const BrandMark = ({
	size = 32,
	speaking = false,
	color = "var(--color-brand-ember, #FF6A3D)",
	title,
	style,
	className,
}: BrandMarkProps) => (
	<svg
		width={size}
		height={size}
		viewBox="0 0 32 32"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
		role={title ? "img" : "presentation"}
		aria-hidden={title ? undefined : true}
		aria-label={title}
		style={style}
		className={className}
	>
		{title ? <title>{title}</title> : null}
		<style>{`
			@keyframes vcArcBeat {
				0%, 100% { transform: scale(1); opacity: 1; }
				50% { transform: scale(1.09); opacity: 0.65; }
			}
			.vc-outer { transform-origin: 16px 16px; }
			.vc-outer[data-speaking="true"] {
				animation: vcArcBeat 1.6s ease-in-out infinite;
			}
			@media (prefers-reduced-motion: reduce) {
				.vc-outer[data-speaking="true"] { animation: none; }
			}
		`}</style>
		<circle cx="16" cy="16" r="3" fill={color} />
		<g
			stroke={color}
			strokeWidth="2.5"
			strokeLinecap="round"
			vectorEffect="non-scaling-stroke"
		>
			<path d={INNER_RIGHT} />
			<path d={INNER_LEFT} />
			<g className="vc-outer" data-speaking={speaking}>
				<path d={OUTER_RIGHT} />
				<path d={OUTER_LEFT} />
			</g>
		</g>
	</svg>
);
