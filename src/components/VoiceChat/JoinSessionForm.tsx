import {
	Alert,
	Card,
	CardContent,
	CircularProgress,
	Stack,
	TextField,
	Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { Button } from "../Button";

type JoinSessionFormProps = {
	summonerId: string;
	sessionId: string;
	loading: boolean;
	error: string;
	onSummonerIdChange: (summonerId: string) => void;
	onSessionIdChange: (sessionId: string) => void;
	onJoin: () => void;
	disableSessionInput?: boolean;
};

export const JoinSessionForm = ({
	summonerId,
	sessionId,
	loading,
	error,
	onSummonerIdChange,
	onSessionIdChange,
	onJoin,
	disableSessionInput,
}: JoinSessionFormProps) => {
	const { t } = useTranslation();

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
						onClick={onJoin}
						disabled={loading || !summonerId || !sessionId}
					>
						{loading ? (
							<CircularProgress size={24} color="inherit" />
						) : (
							t("join.joinGame")
						)}
					</Button>
				</Stack>
			</CardContent>
		</Card>
	);
};
