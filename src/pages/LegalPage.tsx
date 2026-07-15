import {
	Box,
	Container,
	Divider,
	Link,
	Stack,
	Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { Link as RouterLink } from "react-router-dom";
import type { LanguageCode } from "../i18n";
import { localizePath } from "../i18n/paths";

type Section = { heading: string; body: string };

// Shared renderer for long-form legal documents (privacy policy, terms). The
// content lives in i18n so all three locales stay in sync; bodies use "\n" line
// breaks rendered via `pre-line`.
export const LegalPage = ({
	title,
	intro,
	sections,
}: {
	title: string;
	intro: string;
	sections: Section[];
}) => {
	const { t, i18n } = useTranslation();
	const lang = (i18n.resolvedLanguage ?? "en") as LanguageCode;

	return (
		<Container
			maxWidth="md"
			sx={{ position: "relative", zIndex: 1, py: { xs: 6, md: 10 } }}
		>
			<Stack spacing={2.5}>
				<Typography variant="h3" component="h1" sx={{ fontWeight: 800 }}>
					{title}
				</Typography>
				<Typography variant="body2" sx={{ color: "var(--color-text-muted)" }}>
					{t("legal.updated")}
				</Typography>
				<Typography sx={{ whiteSpace: "pre-line" }}>{intro}</Typography>
				<Divider sx={{ borderColor: "var(--color-border-subtle)" }} />
				{/* Guard: t(..., returnObjects) can return a string if the key is
				    missing or still loading — never crash the page on that. */}
				{Array.isArray(sections) &&
					sections.map((s) => (
						<Box key={s.heading}>
							<Typography
								variant="h6"
								component="h2"
								sx={{ fontWeight: 700, mb: 1 }}
							>
								{s.heading}
							</Typography>
							<Typography
								sx={{
									whiteSpace: "pre-line",
									color: "var(--color-text-secondary)",
								}}
							>
								{s.body}
							</Typography>
						</Box>
					))}
				<Divider sx={{ borderColor: "var(--color-border-subtle)" }} />
				<Stack direction="row" spacing={2.5} flexWrap="wrap">
					<Link component={RouterLink} to={localizePath("/", lang)}>
						← {t("legal.nav.home")}
					</Link>
					<Link component={RouterLink} to={localizePath("/privacy", lang)}>
						{t("legal.nav.privacy")}
					</Link>
					<Link component={RouterLink} to={localizePath("/terms", lang)}>
						{t("legal.nav.terms")}
					</Link>
				</Stack>
			</Stack>
		</Container>
	);
};
