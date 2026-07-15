import styled from "@emotion/styled";
import { useTranslation } from "react-i18next";
import { supportedLanguages } from "../../i18n";

const Switcher = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 4px;
  border-radius: var(--radius-pill);
  background: rgba(10, 20, 40, 0.6);
  border: 1px solid var(--color-border-subtle);
  backdrop-filter: blur(8px);
`;

const LangButton = styled.button<{ active: boolean }>`
  appearance: none;
  cursor: pointer;
  border: none;
  padding: 0.35rem 0.85rem;
  border-radius: var(--radius-pill);
  font-family: var(--font-family-base);
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  transition: color 0.2s ease, background 0.2s ease, box-shadow 0.2s ease;
  color: ${(p) =>
		p.active ? "var(--color-bg-base)" : "var(--color-text-secondary)"};
  background: ${(p) =>
		p.active
			? "linear-gradient(180deg, var(--color-brand-gold) 0%, var(--color-brand-goldDark) 100%)"
			: "transparent"};
  box-shadow: ${(p) => (p.active ? "var(--shadow-glowGold)" : "none")};

  &:hover {
    color: ${(p) =>
			p.active ? "var(--color-bg-base)" : "var(--color-text-primary)"};
  }
`;

export const LanguageSwitcher = () => {
	const { i18n, t } = useTranslation();
	const current = i18n.resolvedLanguage ?? i18n.language;

	return (
		<Switcher role="group" aria-label={t("language.label")}>
			{supportedLanguages.map((lang) => (
				<LangButton
					key={lang.code}
					type="button"
					active={current === lang.code}
					aria-pressed={current === lang.code}
					onClick={() => i18n.changeLanguage(lang.code)}
				>
					{lang.label}
				</LangButton>
			))}
		</Switcher>
	);
};
