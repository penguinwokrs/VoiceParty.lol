import CallEndIcon from "@mui/icons-material/CallEnd";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import PersonIcon from "@mui/icons-material/Person";
import {
	Alert,
	Avatar,
	Box,
	Card,
	CardContent,
	CircularProgress,
	IconButton,
	List,
	ListItem,
	ListItemAvatar,
	ListItemText,
	Stack,
	TextField,
	Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "../Button"; // Reusing our MUI wrapper

type User = {
	userId: string;
	joinedAt: number;
	iconUrl?: string;
};

type Session = {
	sessionId: string;
	users: User[];
	createdAt: number;
};

export const VoiceChat = () => {
	const { sessionId: routeSessionId } = useParams();
	const navigate = useNavigate();
	const [sessionId, setSessionId] = useState(routeSessionId || "");
	const [userId, setUserId] = useState(
		() => localStorage.getItem("vp_user_id") || "",
	);
	const [currentSession, setCurrentSession] = useState<Session | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [isMuted, setIsMuted] = useState(false);

	useEffect(() => {
		if (userId) {
			localStorage.setItem("vp_user_id", userId);
		}
	}, [userId]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: Only trigger when route param changes
	useEffect(() => {
		if (routeSessionId && userId && !currentSession) {
			joinSession(routeSessionId);
		}
		if (routeSessionId) {
			setSessionId(routeSessionId);
		}
	}, [routeSessionId]);

	const createSession = async () => {
		setLoading(true);
		setError("");
		try {
			// Simulation for UI demo
			await new Promise((r) => setTimeout(r, 800));
			const mockSessionId = crypto.randomUUID().slice(0, 8);
			navigate(`/${mockSessionId}`);
		} catch (_err) {
			setError("Failed to create session");
		} finally {
			setLoading(false);
		}
	};

	const joinSession = async (targetSessionId: string) => {
		if (!targetSessionId || !userId) {
			setError("Session ID and User ID are required");
			return;
		}
		// If we are not on the correct route, navigate there first
		// But if we are already there (auto-join case), just proceed
		if (!routeSessionId || targetSessionId !== routeSessionId) {
			navigate(`/${targetSessionId}`);
			return;
		}

		setLoading(true);
		setError("");
		try {
			// Simulation
			await new Promise((r) => setTimeout(r, 800));
			setCurrentSession({
				sessionId: targetSessionId,
				users: [
					{
						userId: userId,
						joinedAt: Date.now(),
						iconUrl: `https://api.dicebear.com/9.x/avataaars/svg?seed=${userId}`,
					},
					{ userId: "other-user", joinedAt: Date.now() },
				],
				createdAt: Date.now(),
			});
		} catch (err) {
			setError((err as Error).message || "Failed to join session");
		} finally {
			setLoading(false);
		}
	};

	const leaveSession = () => {
		setCurrentSession(null);
		setSessionId("");
		navigate("/");
	};

	if (currentSession) {
		return (
			<Card sx={{ maxWidth: 400, mx: "auto", mt: 4 }}>
				<CardContent>
					<Typography variant="h5" gutterBottom>
						Session: {currentSession.sessionId}
					</Typography>
					<Box sx={{ my: 2 }}>
						<Typography variant="subtitle2" color="text.secondary">
							Participants ({currentSession.users.length}/5)
						</Typography>
						<List dense>
							{currentSession.users.map((u) => (
								<ListItem key={u.userId}>
									<ListItemAvatar>
										<Avatar src={u.iconUrl} alt={u.userId}>
											{!u.iconUrl && <PersonIcon />}
										</Avatar>
									</ListItemAvatar>
									<ListItemText
										primary={u.userId}
										secondary={u.userId === userId ? "(You)" : null}
									/>
								</ListItem>
							))}
						</List>
					</Box>
					<Stack direction="row" spacing={2} justifyContent="center" mt={3}>
						<IconButton
							color={isMuted ? "error" : "primary"}
							onClick={() => setIsMuted(!isMuted)}
							size="large"
							sx={{ border: "1px solid currentColor" }}
						>
							{isMuted ? <MicOffIcon /> : <MicIcon />}
						</IconButton>
						<IconButton
							color="error"
							onClick={leaveSession}
							size="large"
							sx={{ border: "1px solid currentColor" }}
						>
							<CallEndIcon />
						</IconButton>
					</Stack>
				</CardContent>
			</Card>
		);
	}

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
						onChange={(e) => setUserId(e.target.value)}
						fullWidth
						placeholder="Enter your name"
					/>

					<TextField
						label="Session ID"
						value={sessionId}
						onChange={(e) => setSessionId(e.target.value)}
						fullWidth
						placeholder="Enter session ID to join"
						disabled={!!routeSessionId}
					/>

					<Stack direction="row" spacing={2}>
						<Button
							fullWidth
							variant="outlined"
							onClick={createSession}
							disabled={loading || !userId}
						>
							Create New
						</Button>
						<Button
							fullWidth
							onClick={() => joinSession(sessionId)}
							disabled={loading || !sessionId || !userId}
						>
							{loading ? <CircularProgress size={24} /> : "Join Session"}
						</Button>
					</Stack>
				</Stack>
			</CardContent>
		</Card>
	);
};
