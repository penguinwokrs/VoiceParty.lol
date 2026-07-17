import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
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
	IconButton,
	InputAdornment,
	Link,
	Stack,
	TextField,
	Tooltip,
	Typography,
} from "@mui/material";
import { useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { Link as RouterLink } from "react-router-dom";
import type { LanguageCode } from "../../i18n";
import { localizePath } from "../../i18n/paths";
import { Button } from "../Button";
import { REGIONS } from "./regions";

// Hover/focus help for a field. The icon sits in the input's end adornment.
//
// The icon must be wrapped in a button, not left bare: MUI's SvgIcon renders
// `aria-hidden`, so a focusable bare icon would be a focus stop that screen
// readers never announce, and Tooltip could not attach its text to it. The
// button carries the tooltip text as its accessible name (Tooltip does this
// for a string `title`), which is the only way the help reaches assistive tech.
//
// `enterTouchDelay={0}` opens it on tap as well — on touch there is no cursor
// to hover with, and this is the only route to the text there.
const FieldHelp = ({ text }: { text: string }) => (
	<InputAdornment position="end">
		<Tooltip title={text} enterTouchDelay={0} leaveTouchDelay={6000}>
			<IconButton
				size="small"
				edge="end"
				// Informational only: the tooltip is the whole behaviour.
				disableRipple
				sx={{ color: "text.secondary", cursor: "help" }}
			>
				<HelpOutlineIcon fontSize="small" />
			</IconButton>
		</Tooltip>
	</InputAdornment>
);

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

type JoinSessionFormProps = {
	summonerId: string;
	region: string;
	loading: boolean;
	error: string;
	onSummonerIdChange: (summonerId: string) => void;
	onRegionChange: (region: string) => void;
	onJoin: () => void;
	/** The invite link fixed the region — you can't play across platforms. */
	disableRegionInput?: boolean;
};

export const JoinSessionForm = ({
	summonerId,
	region,
	loading,
	error,
	onSummonerIdChange,
	onRegionChange,
	onJoin,
	disableRegionInput,
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
						disabled={disableRegionInput}
						renderInput={(params) => (
							<TextField
								{...params}
								label={t("join.region")}
								placeholder={t("join.regionPlaceholder")}
								helperText={
									disableRegionInput ? t("join.regionFromLink") : undefined
								}
							/>
						)}
					/>

					<TextField
						label={t("join.summonerId")}
						value={summonerId}
						onChange={(e) => onSummonerIdChange(e.target.value)}
						fullWidth
						placeholder={t("join.summonerIdPlaceholder")}
						slotProps={{
							input: {
								endAdornment: <FieldHelp text={t("join.summonerIdHelp")} />,
							},
							// Float the label permanently. MUI hides the placeholder until
							// the label shrinks, which would keep the example invisible
							// until the field is focused — the example is the point here.
							inputLabel: { shrink: true },
						}}
					/>

					<Button
						fullWidth
						variant="contained"
						onClick={handleJoinClick}
						disabled={loading || !summonerId || !region}
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
