import styled from "@emotion/styled";
import { Box, Container, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/Button";

// Colors/spacing come from design tokens exposed as CSS variables
// (src/theme/tokens.generated.css, generated from design/tokens.json).

const PageWrapper = styled.div`
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
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
    mask-image: radial-gradient(circle at 50% 38%, rgba(0, 0, 0, 0.6), transparent 72%);
    opacity: 0.5;
    z-index: 0;
  }

  /* Soft teal glow behind the hero */
  &::after {
    content: "";
    position: absolute;
    top: 22%;
    left: 50%;
    width: 640px;
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

export const LandingPage = () => {
	const navigate = useNavigate();

	return (
		<PageWrapper>
			<Content maxWidth="md">
				<Eyebrow>Real-time voice</Eyebrow>

				<Title variant="h1" sx={{ fontSize: { xs: "2.75rem", md: "4.75rem" } }}>
					Voice Party
				</Title>

				<Divider />

				<Subtitle variant="h6">
					Gather your allies, coordinate your plays, and dominate the rift with
					crystal-clear voice — right in your browser.
				</Subtitle>

				<PrimaryButton onClick={() => navigate("/join")} variant="contained">
					参加 (Join)
				</PrimaryButton>

				<Box sx={{ mt: 6 }}>
					<Typography variant="body2" sx={{ color: "var(--color-text-muted)" }}>
						© {new Date().getFullYear()} Voice Party. Not affiliated with Riot
						Games.
					</Typography>
				</Box>
			</Content>
		</PageWrapper>
	);
};
