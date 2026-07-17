import styled from "@emotion/styled";
import { Button, Container } from "@mui/material";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

// "Signal on Ink": a cool ink base with a single warm Ember signature, reserved
// for the live things — the CTA and the voice that's actually speaking. Colors,
// spacing, radii and shadows all come from design tokens exposed as CSS
// variables (src/theme/tokens.generated.css, generated from design/tokens.json).

// ---------------------------------------------------------------- primitives

const Eyebrow = styled.div`
  font-family: var(--font-family-mono);
  font-size: 0.78rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--color-text-muted);
`;

const Section = styled.section`
  position: relative;
  z-index: 1;
  padding: 4.5rem 0;
  border-top: 1px solid var(--color-border-subtle);
`;

const SectionHead = styled.div`
  max-width: 56ch;
  margin: 0 auto 2rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;

  h2 {
    margin: 0;
    font-family: var(--font-family-display);
    font-weight: 800;
    letter-spacing: -0.02em;
    line-height: 1.1;
    color: var(--color-text-primary);
    font-size: clamp(1.6rem, 3.6vw, 2.1rem);
  }
  p {
    margin: 0;
    color: var(--color-text-secondary);
    font-size: 1.05rem;
    line-height: 1.6;
  }
`;

const CtaRow = styled.div`
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
`;

// The themed MUI Button (containedPrimary) already owns the Ember gradient,
// hover glow and focus ring; only the landing's pill geometry is layered on.
const PrimaryButton = styled(Button)`
  gap: 0.5rem;
  height: 46px;
  padding: 0 1.4rem;
  border-radius: var(--radius-pill);
  font-weight: 650;
  font-size: 0.98rem;
  text-transform: none;
  transition: background 0.15s ease, box-shadow 0.15s ease, transform 0.15s ease;

  &:active {
    transform: translateY(1px);
    background: var(--color-brand-emberPress);
  }
`;

const GhostButton = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  height: 46px;
  padding: 0 1.4rem;
  border-radius: var(--radius-pill);
  border: 1px solid var(--color-border-strong);
  font-weight: 600;
  font-size: 0.98rem;
  cursor: pointer;
  color: var(--color-text-primary);
  background: transparent;
  transition: background 0.15s ease, border-color 0.15s ease;

  &:hover {
    background: var(--color-bg-surfaceHover);
  }
`;

// ---------------------------------------------------------------- hero

const Hero = styled.header`
  position: relative;
  overflow: hidden;
`;

const HeroGrid = styled.div`
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: 1.05fr 0.95fr;
  gap: 3rem;
  align-items: center;
  padding: 4rem 0 4.5rem;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    gap: 2.5rem;
    padding: 3rem 0 3.5rem;
  }
`;

const HeroCopy = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.15rem;

  h1 {
    margin: 0;
    font-family: var(--font-family-display);
    font-weight: 800;
    letter-spacing: -0.022em;
    line-height: 1.04;
    color: var(--color-text-primary);
    font-size: clamp(2.1rem, 5.2vw, 3.4rem);
    text-wrap: balance;
  }
  .lead {
    margin: 0;
    max-width: 34ch;
    color: var(--color-text-secondary);
    font-size: clamp(1.02rem, 2.1vw, 1.15rem);
    line-height: 1.55;
  }
`;

const Trust = styled.div`
  display: flex;
  gap: 0.5rem 1.1rem;
  flex-wrap: wrap;
  font-family: var(--font-family-mono);
  font-size: 0.78rem;
  color: var(--color-text-muted);

  span {
    display: inline-flex;
    align-items: center;
    gap: 0.45rem;
  }
  i {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--color-state-success);
    flex: none;
  }
`;

// ---------------------------------------------------------------- call panel

const Panel = styled.div`
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-card);
  overflow: hidden;
`;

// This panel is a faithful miniature of the real in-call screen
// (ActiveSessionView.tsx): a session card with a participant roster, per-peer
// receive-volume, and the mic / noise-suppression / leave controls. Ember is
// spent only on the voice that's actually speaking and the live mic — never on
// the local avatar (that would dilute the signature).
const PanelTop = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.85rem 1rem;
  border-bottom: 1px solid var(--color-border-subtle);
  font-family: var(--font-family-mono);
  font-size: 0.82rem;
  color: var(--color-text-primary);

  .k {
    color: var(--color-text-muted);
    letter-spacing: 0.14em;
    text-transform: uppercase;
    font-size: 0.66rem;
  }
  .status {
    margin-left: auto;
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    color: var(--color-state-success);
    font-size: 0.72rem;
  }
  .status .sd {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--color-state-success);
  }
`;

const Roster = styled.div`
  padding: 0.9rem 1rem 0.3rem;
  display: flex;
  flex-direction: column;

  .plabel {
    font-size: 0.72rem;
    font-weight: 600;
    color: var(--color-text-secondary);
    margin: 0 0 0.5rem;
  }
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  gap: 0.7rem;
  padding: 0.3rem 0;

  .av {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    flex: none;
    display: grid;
    place-items: center;
    position: relative;
    color: #fff;
  }
  .av svg { width: 20px; height: 20px; opacity: 0.92; }
  .av.self { background: var(--color-state-cool); }
  .av.peer { background: #4a5568; }
  .av.live {
    box-shadow: 0 0 0 3px var(--color-brand-ember),
      0 0 12px 2px color-mix(in srgb, var(--color-brand-ember) 60%, transparent);
  }
  .av .sd {
    position: absolute;
    right: -1px;
    bottom: -1px;
    width: 11px;
    height: 11px;
    border-radius: 50%;
    background: var(--color-state-success);
    border: 2px solid var(--color-bg-surface);
  }

  .who { min-width: 0; flex: 1; }
  .who .n {
    font-size: 0.86rem;
    font-weight: 600;
    color: var(--color-text-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .who .r { font-size: 0.72rem; color: var(--color-text-muted); }

  .flag {
    flex: none;
    width: 28px;
    height: 28px;
    display: grid;
    place-items: center;
    color: var(--color-text-muted);
    border-radius: 8px;
  }
  .flag svg { width: 16px; height: 16px; }
`;

const VolRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.55rem;
  padding: 0 0.25rem 0.5rem 3.1rem;

  > svg { width: 17px; height: 17px; color: var(--color-text-secondary); flex: none; }
  .track {
    flex: 1;
    height: 4px;
    border-radius: 2px;
    background: var(--color-bg-surfaceHover);
    position: relative;
  }
  .fill { position: absolute; inset: 0 auto 0 0; border-radius: 2px; background: var(--color-text-secondary); }
  .fill.boost { background: var(--color-state-warning); }
  .knob {
    position: absolute;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 11px;
    height: 11px;
    border-radius: 50%;
    background: var(--color-text-primary);
    box-shadow: 0 0 0 3px var(--color-bg-surface);
  }
  .knob.boost { background: var(--color-state-warning); }
  .pct {
    min-width: 42px;
    text-align: right;
    font-family: var(--font-family-mono);
    font-size: 0.72rem;
    font-variant-numeric: tabular-nums;
    color: var(--color-text-muted);
  }
  .pct.boost { color: var(--color-state-warning); }
`;

const Controls = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  padding: 0.5rem 1rem 1.1rem;

  .cbtn {
    width: 46px;
    height: 46px;
    border-radius: 50%;
    border: 1.5px solid currentColor;
    display: grid;
    place-items: center;
    background: transparent;
  }
  .cbtn svg { width: 20px; height: 20px; }
  .cbtn.mic { color: var(--color-brand-ember); }
  .cbtn.ns { color: var(--color-state-success); }
  .cbtn.leave { color: var(--color-state-error); }
`;

// ---------------------------------------------------------------- why (split)

const Split = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;

  @media (max-width: 760px) {
    grid-template-columns: 1fr;
  }
`;

const SplitCard = styled.div`
  padding: 1.6rem;
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border-subtle);
  background: var(--color-bg-surface);

  &.warm {
    border-color: color-mix(in srgb, var(--color-brand-ember) 40%, var(--color-border-subtle));
    background:
      radial-gradient(
        120% 120% at 100% 0%,
        color-mix(in srgb, var(--color-brand-ember) 12%, transparent),
        transparent 60%
      ),
      var(--color-bg-surface);
  }

  .tag {
    font-family: var(--font-family-mono);
    font-size: 0.72rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }
  &.cold .tag { color: var(--color-state-cool); }
  &.warm .tag { color: var(--color-brand-ember); }

  h3 {
    margin: 0.7rem 0 0;
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--color-text-primary);
  }
  p {
    margin: 0.5rem 0 0;
    color: var(--color-text-secondary);
    line-height: 1.55;
  }
`;

const FacePile = styled.div`
  display: flex;
  margin-top: 1.25rem;

  .av {
    width: 34px;
    height: 34px;
    border-radius: 50%;
    display: grid;
    place-items: center;
    font-weight: 700;
    font-size: 0.8rem;
    color: #fff;
    margin-left: -8px;
    border: 2px solid var(--color-bg-surface);
  }
  .av:first-of-type { margin-left: 0; }
  .av.muted { background: var(--color-state-cool); color: rgba(255, 255, 255, 0.7); }
  .av.live { box-shadow: var(--shadow-glowEmber); }
  .av.on { box-shadow: 0 0 0 2px var(--color-state-success); }
  .av.idle { box-shadow: 0 0 0 2px var(--color-border-strong); }
`;

// ---------------------------------------------------------------- features

const FeatureGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;

  @media (max-width: 820px) {
    grid-template-columns: 1fr;
  }
`;

const FeatureCard = styled.div`
  padding: 1.5rem;
  border-radius: var(--radius-md);
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border-subtle);
  box-shadow: var(--shadow-card);
  transition: transform 0.16s ease, border-color 0.16s ease, box-shadow 0.16s ease;

  &:hover {
    transform: translateY(-3px);
    border-color: var(--color-border-strong);
    box-shadow: var(--shadow-cardHover);
  }

  .ic {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    display: grid;
    place-items: center;
    margin-bottom: 1rem;
    color: var(--color-brand-ember);
    background: color-mix(in srgb, var(--color-brand-ember) 12%, transparent);
    border: 1px solid var(--color-border-subtle);
  }
  h3 {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 700;
    color: var(--color-text-primary);
  }
  p {
    margin: 0.5rem 0 0;
    color: var(--color-text-secondary);
    font-size: 0.95rem;
    line-height: 1.55;
  }
`;

// ---------------------------------------------------------------- steps

const Steps = styled.ol`
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.85rem;
  counter-reset: pl-step;

  @media (max-width: 820px) {
    grid-template-columns: 1fr 1fr;
  }
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const Step = styled.li`
  padding: 1.4rem;
  border-radius: var(--radius-md);
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border-subtle);

  .n {
    font-family: var(--font-family-mono);
    font-size: 0.75rem;
    letter-spacing: 0.1em;
    color: var(--color-brand-ember);
  }
  h3 {
    margin: 0.6rem 0 0;
    font-size: 1rem;
    font-weight: 700;
    color: var(--color-text-primary);
  }
  p {
    margin: 0.4rem 0 0;
    color: var(--color-text-secondary);
    font-size: 0.9rem;
    line-height: 1.5;
  }
`;

// ---------------------------------------------------------------- final cta

const Final = styled.section`
  position: relative;
  z-index: 1;
  border-top: 1px solid var(--color-border-subtle);
  text-align: center;
  padding: 4.5rem 0;
  background:
    radial-gradient(
      70% 120% at 50% 0%,
      color-mix(in srgb, var(--color-brand-ember) 14%, transparent),
      transparent 60%
    ),
    var(--color-bg-surface);

  h2 {
    margin: 0;
    font-family: var(--font-family-display);
    font-weight: 800;
    letter-spacing: -0.02em;
    color: var(--color-text-primary);
    font-size: clamp(1.8rem, 4.4vw, 2.6rem);
  }
  p {
    margin: 0.9rem auto 0;
    max-width: 46ch;
    color: var(--color-text-secondary);
    line-height: 1.6;
  }
`;

const CenterCol = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.25rem;
`;

// Stop the decorative pulses/beats for users who prefer reduced motion.
const MotionSafe = styled.div`
  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      animation: none !important;
    }
  }
`;

// ---------------------------------------------------------------- icons

const svgProps = {
	width: 20,
	height: 20,
	viewBox: "0 0 24 24",
	fill: "none",
	stroke: "currentColor",
	strokeWidth: 2,
	strokeLinecap: "round" as const,
	strokeLinejoin: "round" as const,
};

// Feature icons are decorative — the adjacent heading carries the meaning — so
// they are hidden from assistive tech (aria-hidden set explicitly, not via the
// shared spread, so the linter can see it statically).
const MicCheckIcon = (
	<svg {...svgProps} aria-hidden="true">
		<path d="M3 12h2l2-6 3 15 3-12 2 5h6" />
	</svg>
);
const OnlyYouIcon = (
	<svg {...svgProps} aria-hidden="true">
		<path d="M9 15l6-6M10 6l1-1a4 4 0 1 1 6 6l-1 1M14 18l-1 1a4 4 0 1 1-6-6l1-1" />
	</svg>
);
const BeforeDiscordIcon = (
	<svg {...svgProps} aria-hidden="true">
		<path d="M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4M10 12H3m0 0 3-3m-3 3 3 3" />
	</svg>
);

// Glyphs for the in-call panel miniature — mirror the MUI icons the real
// ActiveSessionView uses (Person, Flag, VolumeUp, Mic, GraphicEq, CallEnd).
// Size/color come from the panel CSS (.av svg / .cbtn svg / .flag svg).
const PersonGlyph = () => (
	<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
		<path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0 2c-5 0-9 2.5-9 6v2h18v-2c0-3.5-4-6-9-6Z" />
	</svg>
);
const FlagGlyph = () => (
	<svg
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth={2}
		strokeLinecap="round"
		strokeLinejoin="round"
		aria-hidden="true"
	>
		<path d="M4 21V4m0 1h11l-1.5 4L16 13H4" />
	</svg>
);
const VolGlyph = () => (
	<svg
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth={2}
		strokeLinecap="round"
		strokeLinejoin="round"
		aria-hidden="true"
	>
		<path d="M4 9v6h4l5 4V5L8 9H4Z" />
		<path d="M16 8a4 4 0 0 1 0 8" />
	</svg>
);
const MicGlyph = () => (
	<svg
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth={2}
		strokeLinecap="round"
		strokeLinejoin="round"
		aria-hidden="true"
	>
		<rect x="9" y="3" width="6" height="12" rx="3" />
		<path d="M6 11a6 6 0 0 0 12 0M12 17v4" />
	</svg>
);
const EqGlyph = () => (
	<svg
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth={2}
		strokeLinecap="round"
		aria-hidden="true"
	>
		<path d="M6 9v6M10 5v14M14 8v8M18 11v2" />
	</svg>
);
const LeaveGlyph = () => (
	<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
		<path d="M12 9c-1.6 0-3.15.25-4.6.72v3.1c0 .39-.23.74-.56.9-.98.49-1.87 1.12-2.66 1.85-.18.18-.43.28-.7.28-.28 0-.53-.11-.71-.29L.29 13.08A.99.99 0 0 1 0 12.38c0-.28.11-.53.29-.71C3.34 8.78 7.46 7 12 7s8.66 1.78 11.71 4.67c.18.18.29.43.29.71 0 .28-.11.53-.29.71l-2.48 2.48c-.18.18-.43.29-.71.29-.27 0-.52-.1-.7-.28a11.27 11.27 0 0 0-2.66-1.85.998.998 0 0 1-.56-.9v-3.1C15.15 9.25 13.6 9 12 9Z" />
	</svg>
);

type FeatureKey = "micCheck" | "onlyYouPick" | "beforeDiscord";
const features: { key: FeatureKey; icon: ReactNode }[] = [
	{ key: "micCheck", icon: MicCheckIcon },
	{ key: "onlyYouPick", icon: OnlyYouIcon },
	{ key: "beforeDiscord", icon: BeforeDiscordIcon },
];

const stepKeys = ["riotId", "shareLink", "micCheck", "commit"] as const;

// ---------------------------------------------------------------- page

export const LandingPage = () => {
	const navigate = useNavigate();
	const { t } = useTranslation();

	const startRoom = () => navigate("/join");

	return (
		<MotionSafe>
			<Hero>
				<Container maxWidth="lg">
					<HeroGrid>
						<HeroCopy>
							<Eyebrow>{t("landing.eyebrow")}</Eyebrow>
							<h1>{t("landing.headline")}</h1>
							<p className="lead">{t("landing.lead")}</p>
							<CtaRow>
								<PrimaryButton
									type="button"
									variant="contained"
									color="primary"
									onClick={startRoom}
								>
									{t("landing.ctaStart")}
								</PrimaryButton>
								<GhostButton href="#how">{t("landing.ctaHow")}</GhostButton>
							</CtaRow>
							<Trust>
								<span>
									<i />
									{t("landing.trust.noDownload")}
								</span>
								<span>
									<i />
									{t("landing.trust.browser")}
								</span>
								<span>
									<i />
									{t("landing.trust.muted")}
								</span>
							</Trust>
						</HeroCopy>

						<Panel role="img" aria-label={t("landing.panel.ariaLabel")}>
							<PanelTop>
								<span className="k">Session</span>
								<span>aram-duo</span>
								<span className="status">
									<i className="sd" />
									Connected
								</span>
							</PanelTop>
							<Roster>
								<div className="plabel">Participants (3)</div>
								{/* Local user — neutral avatar; Ember stays reserved for the live voice */}
								<Row>
									<div className="av self">
										<PersonGlyph />
										<i className="sd" />
									</div>
									<div className="who">
										<div className="n">Nova#EUW</div>
										<div className="r">You</div>
									</div>
								</Row>
								{/* Speaking peer — Ember ring */}
								<Row>
									<div className="av peer live">
										<PersonGlyph />
										<i className="sd" />
									</div>
									<div className="who">
										<div className="n">kirei#NA</div>
									</div>
									<span className="flag">
										<FlagGlyph />
									</span>
								</Row>
								<VolRow>
									<VolGlyph />
									<div className="track">
										<div className="fill" style={{ width: "33%" }} />
										<span className="knob" style={{ left: "33%" }} />
									</div>
									<span className="pct">100%</span>
								</VolRow>
								{/* Peer with boosted receive volume */}
								<Row>
									<div className="av peer">
										<PersonGlyph />
										<i className="sd" />
									</div>
									<div className="who">
										<div className="n">m0chi#EUW</div>
									</div>
									<span className="flag">
										<FlagGlyph />
									</span>
								</Row>
								<VolRow>
									<VolGlyph />
									<div className="track">
										<div className="fill boost" style={{ width: "50%" }} />
										<span className="knob boost" style={{ left: "50%" }} />
									</div>
									<span className="pct boost">150%</span>
								</VolRow>
							</Roster>
							<Controls>
								<span className="cbtn mic" title="Mute mic">
									<MicGlyph />
								</span>
								<span className="cbtn ns" title="Noise suppression">
									<EqGlyph />
								</span>
								<span className="cbtn leave" title="Leave">
									<LeaveGlyph />
								</span>
							</Controls>
						</Panel>
					</HeroGrid>
				</Container>
			</Hero>

			<Section>
				<Container maxWidth="lg">
					<SectionHead>
						<Eyebrow>{t("landing.why.eyebrow")}</Eyebrow>
						<h2>{t("landing.why.heading")}</h2>
						<p>{t("landing.why.body")}</p>
					</SectionHead>
					<Split>
						<SplitCard className="cold">
							<div className="tag">{t("landing.why.cold.tag")}</div>
							<h3>{t("landing.why.cold.title")}</h3>
							<p>{t("landing.why.cold.body")}</p>
							<FacePile aria-hidden="true">
								<div className="av muted">R</div>
								<div className="av muted">R</div>
								<div className="av muted">R</div>
								<div className="av muted">R</div>
							</FacePile>
						</SplitCard>
						<SplitCard className="warm">
							<div className="tag">{t("landing.why.warm.tag")}</div>
							<h3>{t("landing.why.warm.title")}</h3>
							<p>{t("landing.why.warm.body")}</p>
							<FacePile aria-hidden="true">
								<div className="av live" style={{ background: "#6D4BD6" }}>
									NV
								</div>
								<div className="av on" style={{ background: "#2E7D6B" }}>
									KI
								</div>
								<div className="av idle" style={{ background: "#3B4658" }}>
									YU
								</div>
							</FacePile>
						</SplitCard>
					</Split>
				</Container>
			</Section>

			<Section>
				<Container maxWidth="lg">
					<SectionHead>
						<Eyebrow>{t("landing.features.eyebrow")}</Eyebrow>
						<h2>{t("landing.features.heading")}</h2>
					</SectionHead>
					<FeatureGrid>
						{features.map((f) => (
							<FeatureCard key={f.key}>
								<div className="ic">{f.icon}</div>
								<h3>{t(`landing.features.items.${f.key}.title`)}</h3>
								<p>{t(`landing.features.items.${f.key}.body`)}</p>
							</FeatureCard>
						))}
					</FeatureGrid>
				</Container>
			</Section>

			<Section id="how">
				<Container maxWidth="lg">
					<SectionHead>
						<Eyebrow>{t("landing.steps.eyebrow")}</Eyebrow>
						<h2>{t("landing.steps.heading")}</h2>
					</SectionHead>
					<Steps>
						{stepKeys.map((key, i) => (
							<Step key={key}>
								<div className="n">{String(i + 1).padStart(2, "0")}</div>
								<h3>{t(`landing.steps.items.${key}.title`)}</h3>
								<p>{t(`landing.steps.items.${key}.body`)}</p>
							</Step>
						))}
					</Steps>
				</Container>
			</Section>

			<Section>
				<Container maxWidth="md">
					<SectionHead>
						<Eyebrow>{t("landing.safety.eyebrow")}</Eyebrow>
						<h2>{t("landing.safety.heading")}</h2>
						<p>{t("landing.safety.body")}</p>
					</SectionHead>
				</Container>
			</Section>

			<Final>
				<Container maxWidth="md">
					<CenterCol>
						<Eyebrow>{t("landing.finalCta.eyebrow")}</Eyebrow>
						<h2>{t("landing.finalCta.heading")}</h2>
						<p>{t("landing.finalCta.body")}</p>
						<CtaRow style={{ justifyContent: "center" }}>
							<PrimaryButton
								type="button"
								variant="contained"
								color="primary"
								onClick={startRoom}
							>
								{t("landing.finalCta.ctaStart")}
							</PrimaryButton>
							<GhostButton href="#how">
								{t("landing.finalCta.ctaHow")}
							</GhostButton>
						</CtaRow>
					</CenterCol>
				</Container>
			</Final>
		</MotionSafe>
	);
};
