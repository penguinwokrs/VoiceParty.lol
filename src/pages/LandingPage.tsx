import styled from "@emotion/styled";
import { Container, Typography } from "@mui/material";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/Button";
import { LanguageSwitcher } from "../components/LanguageSwitcher";

// Colors/spacing come from design tokens exposed as CSS variables
// (src/theme/tokens.generated.css, generated from design/tokens.json).

const PageWrapper = styled.div`
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  color: var(--color-text-primary);
  background:
    radial-gradient(900px 520px at 50% -10%, var(--color-bg-gradientTop) 0%, transparent 60%),
    linear-gradient(180deg, var(--color-bg-gradientTop) 0%, var(--color-bg-base) 55%);

  /* Subtle hextech grid, faded toward the edges */
  &::before {
    content: "";
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(var(--color-border-subtle) 1px, transparent 1px),
      linear-gradient(90deg, var(--color-border-subtle) 1px, transparent 1px);
    background-size: 48px 48px;
    mask-image: radial-gradient(circle at 50% 20%, rgba(0, 0, 0, 0.6), transparent 72%);
    opacity: 0.5;
    z-index: 0;
  }
`;

const TopBar = styled.div`
  position: absolute;
  top: 1.25rem;
  right: 1.5rem;
  z-index: 2;

  @media (max-width: 600px) {
    top: 0.85rem;
    right: 0.85rem;
  }
`;

const Hero = styled.section`
  position: relative;
  min-height: 92vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  /* Soft teal glow behind the hero */
  &::after {
    content: "";
    position: absolute;
    top: 20%;
    left: 50%;
    width: 640px;
    max-width: 90vw;
    height: 640px;
    transform: translateX(-50%);
    background: radial-gradient(circle, rgba(10, 200, 185, 0.16) 0%, transparent 62%);
    filter: blur(24px);
    z-index: 0;
    pointer-events: none;
  }
`;

const Content = styled(Container)`
  position: relative;
  z-index: 1;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
`;

const Eyebrow = styled.span`
  color: var(--color-brand-teal);
  font-weight: 700;
  font-size: 0.85rem;
  letter-spacing: 0.35em;
  text-transform: uppercase;
  padding-left: 0.35em;
`;

const Title = styled(Typography)`
  font-family: var(--font-family-display);
  font-weight: 900;
  color: var(--color-brand-gold);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  line-height: 1.02;
  text-shadow: 0 2px 24px rgba(200, 170, 110, 0.25);
`;

const Subtitle = styled(Typography)`
  color: var(--color-text-secondary);
  max-width: 560px;
  font-weight: 400;
  line-height: 1.6;
`;

const Divider = styled.div`
  height: 1px;
  width: 120px;
  background: linear-gradient(90deg, transparent, var(--color-brand-gold), transparent);
`;

const PrimaryButton = styled(Button)`
  position: relative;
  overflow: hidden;
  padding: 0.9rem 3rem;
  font-size: 1.05rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  border-radius: var(--radius-pill);
  color: var(--color-bg-base);
  background: linear-gradient(180deg, var(--color-brand-gold) 0%, var(--color-brand-goldDark) 100%);
  box-shadow: var(--shadow-glowGold);
  transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;

  &:hover {
    background: linear-gradient(180deg, var(--color-brand-goldHover) 0%, var(--color-brand-gold) 100%);
    box-shadow: 0 0 30px rgba(200, 170, 110, 0.5);
    transform: translateY(-2px);
  }

  /* Sheen sweep on hover */
  &::after {
    content: "";
    position: absolute;
    top: 0;
    left: -120%;
    width: 60%;
    height: 100%;
    background: linear-gradient(
      100deg,
      transparent 0%,
      rgba(255, 255, 255, 0.35) 50%,
      transparent 100%
    );
    transition: left 0.6s ease;
  }
  &:hover::after {
    left: 130%;
  }
`;

const ScrollHint = styled.div`
  position: absolute;
  bottom: 2.5rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  color: var(--color-text-muted);
  font-size: 0.72rem;
  letter-spacing: 0.28em;
  text-transform: uppercase;

  span.chevron {
    display: block;
    width: 12px;
    height: 12px;
    border-right: 2px solid var(--color-brand-teal);
    border-bottom: 2px solid var(--color-brand-teal);
    transform: rotate(45deg);
    animation: bob 1.6s ease-in-out infinite;
  }

  @keyframes bob {
    0%, 100% { transform: rotate(45deg) translate(0, 0); opacity: 0.4; }
    50% { transform: rotate(45deg) translate(3px, 3px); opacity: 1; }
  }
`;

const Section = styled.section`
  position: relative;
  z-index: 1;
  padding: 5.5rem 0;
`;

const SectionHeading = styled(Typography)`
  font-family: var(--font-family-display);
  font-weight: 900;
  color: var(--color-text-primary);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  text-align: center;
`;

const SectionEyebrow = styled.div`
  color: var(--color-brand-teal);
  font-weight: 700;
  font-size: 0.8rem;
  letter-spacing: 0.32em;
  text-transform: uppercase;
  text-align: center;
  margin-bottom: 0.75rem;
`;

const FeatureGrid = styled.div`
  margin-top: 3rem;
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
`;

const FeatureCard = styled.div`
  position: relative;
  padding: 2rem 1.75rem;
  border-radius: var(--radius-lg);
  background: linear-gradient(180deg, var(--color-bg-surface) 0%, var(--color-bg-base) 100%);
  border: 1px solid var(--color-border-subtle);
  box-shadow: var(--shadow-card);
  transition: transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;

  &:hover {
    transform: translateY(-4px);
    border-color: var(--color-border-strong);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5), var(--shadow-glowTeal);
  }
`;

const IconBadge = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  margin-bottom: 1.25rem;
  border-radius: var(--radius-md);
  color: var(--color-brand-teal);
  background: radial-gradient(circle at 30% 20%, rgba(10, 200, 185, 0.22), rgba(10, 200, 185, 0.05));
  border: 1px solid var(--color-border-subtle);
`;

const FeatureTitle = styled(Typography)`
  font-weight: 700;
  color: var(--color-brand-gold);
  margin-bottom: 0.5rem;
`;

const FeatureBody = styled(Typography)`
  color: var(--color-text-secondary);
  line-height: 1.65;
  font-size: 0.95rem;
`;

const StepList = styled.ol`
  margin: 3rem 0 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 1.25rem;
`;

const StepRow = styled.li`
  position: relative;
  display: grid;
  grid-template-columns: 64px 1fr;
  gap: 1.5rem;
  align-items: center;
  padding: 1.75rem;
  border-radius: var(--radius-lg);
  background: linear-gradient(120deg, var(--color-bg-surface) 0%, var(--color-bg-base) 100%);
  border: 1px solid var(--color-border-subtle);

  @media (max-width: 600px) {
    grid-template-columns: 48px 1fr;
    gap: 1rem;
    padding: 1.25rem;
  }
`;

const StepNumber = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  font-family: var(--font-family-display);
  font-weight: 900;
  font-size: 1.6rem;
  color: var(--color-bg-base);
  background: linear-gradient(180deg, var(--color-brand-gold) 0%, var(--color-brand-goldDark) 100%);
  box-shadow: var(--shadow-glowGold);

  @media (max-width: 600px) {
    width: 48px;
    height: 48px;
    font-size: 1.2rem;
  }
`;

const StepTitle = styled(Typography)`
  font-weight: 700;
  color: var(--color-text-primary);
  margin-bottom: 0.3rem;
`;

const StepBody = styled(Typography)`
  color: var(--color-text-secondary);
  line-height: 1.6;
  font-size: 0.95rem;
`;

const FinalCta = styled.div`
  margin-top: 4rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  text-align: center;
`;

type FeatureKey = "noInstall" | "clearVoice" | "invite" | "lowLatency";

type Feature = {
	key: FeatureKey;
	icon: ReactNode;
};

const MicIcon = (
	<svg
		width="26"
		height="26"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="1.8"
		strokeLinecap="round"
		strokeLinejoin="round"
		role="img"
		aria-label="Microphone"
	>
		<rect x="9" y="2" width="6" height="12" rx="3" />
		<path d="M5 10a7 7 0 0 0 14 0" />
		<line x1="12" y1="17" x2="12" y2="21" />
		<line x1="8" y1="21" x2="16" y2="21" />
	</svg>
);

const BrowserIcon = (
	<svg
		width="26"
		height="26"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="1.8"
		strokeLinecap="round"
		strokeLinejoin="round"
		role="img"
		aria-label="Browser"
	>
		<rect x="3" y="4" width="18" height="16" rx="2" />
		<line x1="3" y1="9" x2="21" y2="9" />
		<circle cx="6.5" cy="6.5" r="0.6" fill="currentColor" />
		<circle cx="9" cy="6.5" r="0.6" fill="currentColor" />
	</svg>
);

const LinkIcon = (
	<svg
		width="26"
		height="26"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="1.8"
		strokeLinecap="round"
		strokeLinejoin="round"
		role="img"
		aria-label="Share link"
	>
		<path d="M9 15l6-6" />
		<path d="M10.5 6.5l1-1a4 4 0 0 1 6 6l-1 1" />
		<path d="M13.5 17.5l-1 1a4 4 0 0 1-6-6l1-1" />
	</svg>
);

const BoltIcon = (
	<svg
		width="26"
		height="26"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="1.8"
		strokeLinecap="round"
		strokeLinejoin="round"
		role="img"
		aria-label="Low latency"
	>
		<path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" />
	</svg>
);

const features: Feature[] = [
	{ key: "noInstall", icon: BrowserIcon },
	{ key: "clearVoice", icon: MicIcon },
	{ key: "invite", icon: LinkIcon },
	{ key: "lowLatency", icon: BoltIcon },
];

const stepKeys = ["enter", "connect", "share", "win"] as const;

export const LandingPage = () => {
	const navigate = useNavigate();
	const { t } = useTranslation();

	return (
		<PageWrapper>
			<TopBar>
				<LanguageSwitcher />
			</TopBar>

			<Hero>
				<Content maxWidth="md">
					<Eyebrow>{t("landing.eyebrow")}</Eyebrow>

					<Title
						variant="h1"
						sx={{ fontSize: { xs: "2.75rem", md: "4.75rem" } }}
					>
						{t("landing.title")}
					</Title>

					<Divider />

					<Subtitle variant="h6">{t("landing.subtitle")}</Subtitle>

					<PrimaryButton onClick={() => navigate("/join")} variant="contained">
						{t("landing.cta")}
					</PrimaryButton>
				</Content>

				<ScrollHint>
					{t("landing.scrollHint")}
					<span className="chevron" />
				</ScrollHint>
			</Hero>

			<Section>
				<Container maxWidth="lg">
					<SectionEyebrow>{t("landing.features.eyebrow")}</SectionEyebrow>
					<SectionHeading
						variant="h3"
						sx={{ fontSize: { xs: "1.9rem", md: "2.6rem" } }}
					>
						{t("landing.features.heading")}
					</SectionHeading>

					<FeatureGrid>
						{features.map((f) => (
							<FeatureCard key={f.key}>
								<IconBadge>{f.icon}</IconBadge>
								<FeatureTitle variant="h6">
									{t(`landing.features.items.${f.key}.title`)}
								</FeatureTitle>
								<FeatureBody>
									{t(`landing.features.items.${f.key}.body`)}
								</FeatureBody>
							</FeatureCard>
						))}
					</FeatureGrid>
				</Container>
			</Section>

			<Section style={{ paddingTop: 0 }}>
				<Container maxWidth="md">
					<SectionEyebrow>{t("landing.steps.eyebrow")}</SectionEyebrow>
					<SectionHeading
						variant="h3"
						sx={{ fontSize: { xs: "1.9rem", md: "2.6rem" } }}
					>
						{t("landing.steps.heading")}
					</SectionHeading>

					<StepList>
						{stepKeys.map((key, i) => (
							<StepRow key={key}>
								<StepNumber>{i + 1}</StepNumber>
								<div>
									<StepTitle variant="h6">
										{t(`landing.steps.items.${key}.title`)}
									</StepTitle>
									<StepBody>{t(`landing.steps.items.${key}.body`)}</StepBody>
								</div>
							</StepRow>
						))}
					</StepList>

					<FinalCta>
						<Divider />
						<Typography
							variant="h5"
							sx={{
								fontFamily: "var(--font-family-display)",
								fontWeight: 900,
								color: "var(--color-brand-gold)",
								textTransform: "uppercase",
								letterSpacing: "0.04em",
							}}
						>
							{t("landing.finalCta")}
						</Typography>
						<PrimaryButton
							onClick={() => navigate("/join")}
							variant="contained"
						>
							{t("landing.cta")}
						</PrimaryButton>
						<Typography
							variant="body2"
							sx={{ color: "var(--color-text-muted)", mt: 4 }}
						>
							{t("landing.footer", { year: new Date().getFullYear() })}
						</Typography>
					</FinalCta>
				</Container>
			</Section>
		</PageWrapper>
	);
};
