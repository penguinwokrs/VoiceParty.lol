import { Box, Container, Link, Stack, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { Link as RouterLink } from "react-router-dom";
import type { LanguageCode } from "../i18n";
import { localizePath } from "../i18n/paths";

// Site-wide footer: legal links + the Riot-mandated disclaimer + copyright.
// Rendered once by AppShell so it appears on every route.
export const SiteFooter = () => {
	const { t, i18n } = useTranslation();
	const lang = (i18n.resolvedLanguage ?? "en") as LanguageCode;

	return (
		<Box
			component="footer"
			sx={{
				position: "relative",
				zIndex: 1,
				mt: "auto",
				px: 2,
				py: 4,
				borderTop: "1px solid var(--color-border-subtle)",
			}}
		>
			<Container maxWidth="md">
				<Stack spacing={1.5} alignItems="center" textAlign="center">
					<Stack
						direction="row"
						spacing={2.5}
						justifyContent="center"
						flexWrap="wrap"
					>
						<Link
							component={RouterLink}
							to={localizePath("/privacy", lang)}
							sx={{ color: "var(--color-text-secondary)", fontSize: "0.85rem" }}
						>
							{t("legal.nav.privacy")}
						</Link>
						<Link
							component={RouterLink}
							to={localizePath("/terms", lang)}
							sx={{ color: "var(--color-text-secondary)", fontSize: "0.85rem" }}
						>
							{t("legal.nav.terms")}
						</Link>
					</Stack>
					<Typography
						variant="caption"
						sx={{ color: "var(--color-text-muted)", maxWidth: 640 }}
					>
						{t("legal.disclaimer")}
					</Typography>
					<Typography
						variant="caption"
						sx={{ color: "var(--color-text-muted)" }}
					>
						{t("landing.footer", { year: new Date().getFullYear() })}
					</Typography>
				</Stack>
			</Container>
		</Box>
	);
};
