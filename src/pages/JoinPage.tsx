import { Container } from "@mui/material";
import { useTranslation } from "react-i18next";
import {
	BrandDivider,
	BrandSubtitle,
	BrandTitle,
	Eyebrow,
} from "../components/brand";
import { VoiceChat } from "../components/VoiceChat";

export const JoinPage = () => {
	const { t } = useTranslation();

	// The page frame (branded background + top-bar language switcher) is provided
	// by AppShell via LangLayout, so this page only renders its own content.
	return (
		<Container
			maxWidth="md"
			sx={{
				position: "relative",
				zIndex: 1,
				textAlign: "center",
				pt: { xs: 8, md: 10 },
				pb: 6,
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				gap: 2.5,
			}}
		>
			<Eyebrow>{t("landing.eyebrow")}</Eyebrow>
			<BrandTitle
				variant="h1"
				component="h1"
				sx={{ fontSize: { xs: "2.5rem", md: "3.5rem" } }}
			>
				{t("landing.title")}
			</BrandTitle>
			<BrandDivider />
			<BrandSubtitle variant="h6">{t("app.subtitle")}</BrandSubtitle>

			<VoiceChat />
		</Container>
	);
};
