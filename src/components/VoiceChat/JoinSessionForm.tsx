import {
	Alert,
	Autocomplete,
	Card,
	CardContent,
	CircularProgress,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Link,
	Stack,
	TextField,
	Typography,
} from "@mui/material";
import { useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { Link as RouterLink } from "react-router-dom";
import type { LanguageCode } from "../../i18n";
import { localizePath } from "../../i18n/paths";
import { Button } from "../Button";

// Minimum age to use the Service (see Terms/Privacy). Enforced with a neutral
// birth-year gate rather than a yes/no prompt.
const MIN_AGE = 13;
const AGE_OK_KEY = "vp_age_ok";

const isAgeConfirmed = (): boolean => {
	if (typeof window === "undefined") return false;
	try {
		return localStorage.getItem(AGE_OK_KEY) === "true";
	} catch {
		return false;
	}
};

// Riot platform routing regions (LoL). `code` is the platform value used by the
// Riot API; the label is what the player picks from the suggestions.
type Region = { code: string; label: string };
const REGIONS: Region[] = [
	{ code: "na1", label: "North America (NA)" },
	{ code: "euw1", label: "EU West (EUW)" },
	{ code: "eun1", label: "EU Nordic & East (EUNE)" },
	{ code: "kr", label: "Korea (KR)" },
	{ code: "jp1", label: "Japan (JP)" },
	{ code: "oc1", label: "Oceania (OCE)" },
	{ code: "br1", label: "Brazil (BR)" },
	{ code: "la1", label: "Latin America North (LAN)" },
	{ code: "la2", label: "Latin America South (LAS)" },
	{ code: "tr1", label: "Türkiye (TR)" },
	{ code: "ru", label: "Russia (RU)" },
	{ code: "ph2", label: "Philippines (PH)" },
	{ code: "sg2", label: "Singapore (SG)" },
	{ code: "th2", label: "Thailand (TH)" },
	{ code: "tw2", label: "Taiwan (TW)" },
	{ code: "vn2", label: "Vietnam (VN)" },
];

type JoinSessionFormProps = {
	summonerId: string;
	sessionId: string;
	region: string;
	loading: boolean;
	error: string;
	onSummonerIdChange: (summonerId: string) => void;
	onSessionIdChange: (sessionId: string) => void;
	onRegionChange: (region: string) => void;
	onJoin: () => void;
	disableSessionInput?: boolean;
};

export const JoinSessionForm = ({
	summonerId,
	sessionId,
	region,
	loading,
	error,
	onSummonerIdChange,
	onSessionIdChange,
	onRegionChange,
	onJoin,
	disableSessionInput,
}: JoinSessionFormProps) => {
	const { t, i18n } = useTranslation();
	const lang = (i18n.resolvedLanguage ?? "en") as LanguageCode;

	// Age gate: shown once (persisted) before the first join.
	const [ageOpen, setAgeOpen] = useState(false);
	const [birthYear, setBirthYear] = useState("");
	const [ageError, setAgeError] = useState("");

	const handleJoinClick = () => {
		if (isAgeConfirmed()) {
			onJoin();
		} else {
			setAgeError("");
			setBirthYear("");
			setAgeOpen(true);
		}
	};

	const confirmAge = () => {
		const year = Number(birthYear);
		const now = new Date().getFullYear();
		if (!Number.isInteger(year) || year < 1900 || year > now) {
			setAgeError(t("join.ageInvalid"));
			return;
		}
		if (now - year < MIN_AGE) {
			setAgeError(t("join.ageTooYoung"));
			return;
		}
		try {
			localStorage.setItem(AGE_OK_KEY, "true");
		} catch {
			/* ignore storage errors */
		}
		setAgeOpen(false);
		onJoin();
	};

	return (
		<Card sx={{ maxWidth: 400, mx: "auto", mt: 4 }}>
			<CardContent>
				<Typography variant="h5" component="h2" gutterBottom>
					{t("join.heading")}
				</Typography>

				{error && (
					<Alert severity="error" sx={{ mb: 2 }}>
						{error}
					</Alert>
				)}

				<Stack spacing={3}>
					<Autocomplete
						options={REGIONS}
						getOptionLabel={(o) => o.label}
						isOptionEqualToValue={(o, v) => o.code === v.code}
						value={REGIONS.find((r) => r.code === region) ?? null}
						onChange={(_, v) => onRegionChange(v?.code ?? "")}
						fullWidth
						autoHighlight
						renderInput={(params) => (
							<TextField
								{...params}
								label={t("join.region")}
								placeholder={t("join.regionPlaceholder")}
							/>
						)}
					/>

					<TextField
						label={t("join.summonerId")}
						value={summonerId}
						onChange={(e) => onSummonerIdChange(e.target.value)}
						fullWidth
						placeholder={t("join.summonerIdPlaceholder")}
					/>

					<TextField
						label={t("join.gameId")}
						value={sessionId}
						onChange={(e) => onSessionIdChange(e.target.value)}
						fullWidth
						placeholder={t("join.gameIdPlaceholder")}
						disabled={disableSessionInput}
					/>

					<Button
						fullWidth
						variant="contained"
						onClick={handleJoinClick}
						disabled={loading || !summonerId || !sessionId || !region}
					>
						{loading ? (
							<CircularProgress size={24} color="inherit" />
						) : (
							t("join.joinGame")
						)}
					</Button>

					{/* Consent notice: joining accepts the Terms and Privacy Policy. */}
					<Typography
						variant="caption"
						sx={{ color: "var(--color-text-muted)", textAlign: "center" }}
					>
						<Trans
							i18nKey="join.consent"
							components={{
								terms: (
									<Link
										component={RouterLink}
										to={localizePath("/terms", lang)}
									/>
								),
								privacy: (
									<Link
										component={RouterLink}
										to={localizePath("/privacy", lang)}
									/>
								),
							}}
						/>
					</Typography>
				</Stack>
			</CardContent>

			<Dialog open={ageOpen} onClose={() => setAgeOpen(false)}>
				<DialogTitle>{t("join.ageTitle")}</DialogTitle>
				<DialogContent>
					<Typography variant="body2" sx={{ mb: 2 }}>
						{t("join.ageBody")}
					</Typography>
					<TextField
						autoFocus
						fullWidth
						label={t("join.ageYearLabel")}
						value={birthYear}
						onChange={(e) => setBirthYear(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === "Enter" && birthYear) confirmAge();
						}}
						error={!!ageError}
						helperText={ageError || undefined}
						slotProps={{
							htmlInput: { inputMode: "numeric", pattern: "[0-9]*" },
						}}
					/>
				</DialogContent>
				<DialogActions>
					<Button
						variant="contained"
						onClick={confirmAge}
						disabled={!birthYear}
					>
						{t("join.ageConfirm")}
					</Button>
				</DialogActions>
			</Dialog>
		</Card>
	);
};
