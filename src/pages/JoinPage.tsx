import { Box, Container, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "../components/LanguageSwitcher";
import { VoiceChat } from "../components/VoiceChat";

export const JoinPage = () => {
	const { t } = useTranslation();

	return (
		<Container
			maxWidth="md"
			sx={{ textAlign: "center", py: 4, position: "relative" }}
		>
			<Box sx={{ position: "absolute", top: 16, right: 16 }}>
				<LanguageSwitcher />
			</Box>

			<Typography
				variant="h2"
				component="h1"
				gutterBottom
				sx={{ fontSize: "3.2rem" }}
			>
				{t("landing.title")}
			</Typography>
			<Typography variant="subtitle1" color="text.secondary" paragraph>
				{t("app.subtitle")}
			</Typography>

			<Box
				sx={{
					display: "flex",
					flexDirection: "column",
					gap: 4,
					alignItems: "center",
				}}
			>
				{/* Main Voice Chat Component */}
				<VoiceChat />
			</Box>
		</Container>
	);
};
