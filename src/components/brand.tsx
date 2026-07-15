// Shared brand typographic pieces, reused across pages so headers line up.
// Colors/spacing come from design tokens (src/theme/tokens.generated.css).
import styled from "@emotion/styled";
import { Typography } from "@mui/material";

export const Eyebrow = styled.span`
  color: var(--color-brand-teal);
  font-weight: 700;
  font-size: 0.85rem;
  letter-spacing: 0.35em;
  text-transform: uppercase;
  padding-left: 0.35em;
`;

export const BrandTitle = styled(Typography)`
  font-family: var(--font-family-display);
  font-weight: 900;
  color: var(--color-brand-gold);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  line-height: 1.02;
  text-shadow: 0 2px 24px rgba(200, 170, 110, 0.25);
`;

export const BrandSubtitle = styled(Typography)`
  color: var(--color-text-secondary);
  max-width: 560px;
  font-weight: 400;
  line-height: 1.6;
`;

export const BrandDivider = styled.div`
  height: 1px;
  width: 120px;
  background: linear-gradient(90deg, transparent, var(--color-brand-gold), transparent);
`;
