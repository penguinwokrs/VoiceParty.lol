import styled from "@emotion/styled";
import { Container } from "@mui/material";
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

const PrimaryButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  height: 46px;
  padding: 0 1.4rem;
  border: 1px solid transparent;
  border-radius: var(--radius-pill);
  font: inherit;
  font-weight: 650;
  font-size: 0.98rem;
  cursor: pointer;
  color: var(--color-text-onEmber);
  background: var(--color-brand-ember);
  transition: background 0.15s ease, box-shadow 0.15s ease, transform 0.15s ease;

  &:hover {
    background: var(--color-brand-emberHover);
    box-shadow: var(--shadow-glowEmber);
  }
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

const PanelTop = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.85rem 1rem;
  border-bottom: 1px solid var(--color-border-subtle);
  font-family: var(--font-family-mono);
  font-size: 0.78rem;
  color: var(--color-text-secondary);

  .room {
    color: var(--color-text-primary);
  }
  .live {
    margin-left: auto;
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    color: var(--color-brand-ember);
    letter-spacing: 0.1em;
    text-transform: uppercase;
    font-size: 0.68rem;
  }
  .beat {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: var(--color-brand-ember);
    animation: plBeat 1.6s ease-in-out infinite;
  }

  @keyframes plBeat {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.35; }
  }
`;

const Seats = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.6rem;
  padding: 1rem;
`;

const Seat = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: var(--radius-md);
  background: var(--color-bg-surfaceHover);
  border: 1px solid var(--color-border-subtle);
  min-width: 0;

  &.empty {
    border-style: dashed;
    background: transparent;
    color: var(--color-text-muted);
    justify-content: center;
    font-family: var(--font-family-mono);
    font-size: 0.8rem;
  }

  .av {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    flex: none;
    display: grid;
    place-items: center;
    font-weight: 700;
    font-size: 0.9rem;
    color: #fff;
  }
  .av.idle { box-shadow: 0 0 0 2px var(--color-border-strong); }
  .av.on { box-shadow: 0 0 0 2px var(--color-state-success); }
  .av.live {
    box-shadow: var(--shadow-glowEmber);
    animation: plPulse 1.5s ease-in-out infinite alternate;
  }

  .who {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }
  .who b { font-size: 0.9rem; font-weight: 650; color: var(--color-text-primary); }
  .who .id { font-family: var(--font-family-mono); font-size: 0.7rem; color: var(--color-text-muted); }
  .who .st { font-family: var(--font-family-mono); font-size: 0.68rem; letter-spacing: 0.04em; text-transform: uppercase; }
  .st.live-t { color: var(--color-brand-ember); }
  .st.on-t { color: var(--color-state-success); }
  .st.you-t { color: var(--color-text-muted); }

  @keyframes plPulse {
    from { box-shadow: 0 0 0 2px var(--color-brand-ember); }
    to { box-shadow: 0 0 0 3px var(--color-brand-ember), 0 0 22px rgba(255, 106, 61, 0.4); }
  }
`;

const PanelFoot = styled.div`
  display: flex;
  align-items: center;
  padding: 0.85rem 1rem;
  border-top: 1px solid var(--color-border-subtle);
  font-family: var(--font-family-mono);
  font-size: 0.72rem;
  color: var(--color-text-muted);
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
      radial-gradient(120% 120% at 100% 0%, rgba(255, 106, 61, 0.12), transparent 60%),
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
    background: rgba(255, 106, 61, 0.12);
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
    radial-gradient(70% 120% at 50% 0%, rgba(255, 106, 61, 0.14), transparent 60%),
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
								<PrimaryButton type="button" onClick={startRoom}>
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
								<span>/join/</span>
								<span className="room">{t("landing.panel.room")}</span>
								<span className="live">
									<i className="beat" />
									{t("landing.panel.live")}
								</span>
							</PanelTop>
							<Seats>
								<Seat>
									<div className="av idle" style={{ background: "#3B4658" }}>
										YU
									</div>
									<div className="who">
										<b>{t("landing.panel.youName")}</b>
										<span className="st you-t">
											{t("landing.panel.youStatus")}
										</span>
									</div>
								</Seat>
								<Seat>
									<div className="av live" style={{ background: "#6D4BD6" }}>
										NV
									</div>
									<div className="who">
										<b>nova</b>
										<span className="id">nova#EUW</span>
										<span className="st live-t">
											{t("landing.panel.speaking")}
										</span>
									</div>
								</Seat>
								<Seat>
									<div className="av on" style={{ background: "#2E7D6B" }}>
										KI
									</div>
									<div className="who">
										<b>kirei</b>
										<span className="id">kirei#NA</span>
										<span className="st on-t">
											{t("landing.panel.connected")}
										</span>
									</div>
								</Seat>
								<Seat className="empty">{t("landing.panel.invite")}</Seat>
								<Seat className="empty">{t("landing.panel.invite")}</Seat>
							</Seats>
							<PanelFoot>{t("landing.panel.footNote")}</PanelFoot>
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
							<PrimaryButton type="button" onClick={startRoom}>
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
