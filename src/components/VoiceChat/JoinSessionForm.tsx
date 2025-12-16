import {
	Alert,
	Card,
	CardContent,
	CircularProgress,
	Stack,
	TextField,
	Typography,
} from "@mui/material";
import { Button } from "../Button";

type JoinSessionFormProps = {
	userId: string;
	sessionId: string;
	loading: boolean;
	error: string;
	onUserIdChange: (userId: string) => void;
	onSessionIdChange: (sessionId: string) => void;
	onJoin: () => void;
	disableSessionInput?: boolean;
};

export const JoinSessionForm = ({
	userId,
	sessionId,
	loading,
	error,
	onUserIdChange,
	onSessionIdChange,
	onJoin,
	disableSessionInput,
}: JoinSessionFormProps) => {
	return (
		<Card sx={{ maxWidth: 400, mx: "auto", mt: 4 }}>
			<CardContent>
				<Typography variant="h5" component="h2" gutterBottom>
					Voice Chat
				</Typography>

				{error && (
					<Alert severity="error" sx={{ mb: 2 }}>
						{error}
					</Alert>
				)}

				<Stack spacing={3}>
					<TextField
						label="User ID"
						value={userId}
						onChange={(e) => onUserIdChange(e.target.value)}
						fullWidth
						placeholder="Enter your name"
					/>

					<TextField
						label="Game ID"
						value={sessionId}
						onChange={(e) => onSessionIdChange(e.target.value)}
						fullWidth
						placeholder="Enter game ID to join"
						disabled={disableSessionInput}
					/>

					<Button
						fullWidth
						variant="contained"
						onClick={onJoin}
						disabled={loading || !userId || !sessionId}
					>
						{loading ? (
							<CircularProgress size={24} color="inherit" />
						) : (
							"Join Game"
						)}
					</Button>
				</Stack>
			</CardContent>
		</Card>
	);
};
