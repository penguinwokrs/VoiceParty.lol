// Shared brand typographic pieces, reused across pages so headers line up.
// Colors/spacing come from design tokens (src/theme/tokens.generated.css).
import styled from "@emotion/styled";
import { Typography } from "@mui/material";

export const Eyebrow = styled.span`
  color: var(--color-text-secondary);
  font-family: var(--font-family-mono);
  font-weight: 500;
  font-size: 0.8rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  padding-left: 0.35em;
`;

export const BrandTitle = styled(Typography)`
  font-family: var(--font-family-display);
  font-weight: 800;
  color: var(--color-text-primary);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  line-height: 1.02;
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
  background: linear-gradient(90deg, transparent, var(--color-brand-ember), transparent);
`;
