// Shared page shell: the branded background + the top-bar language switcher.
// Applied once in LangLayout so every route has the same frame.
import styled from "@emotion/styled";
import type { ReactNode } from "react";
import { LanguageSwitcher } from "./LanguageSwitcher";

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

export const AppShell = ({ children }: { children: ReactNode }) => (
	<PageWrapper>
		<TopBar>
			<LanguageSwitcher />
		</TopBar>
		{children}
	</PageWrapper>
);
