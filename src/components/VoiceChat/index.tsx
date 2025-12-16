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
import { Button } from "../Button";
import { useRealtime } from "./useRealtime";

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

type JoinResponse = {
	session: Session;
	realtime?: {
		meetingId: string;
		token: string;
		appId: string;
	};
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

	const { join, leave, toggleMic, isMicMuted, isConnected } = useRealtime();

	useEffect(() => {
		if (userId) {
			localStorage.setItem("vp_user_id", userId);
		}
	}, [userId]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		if (routeSessionId && userId && !currentSession) {
			setSessionId(routeSessionId);
			joinSession(routeSessionId);
		} else if (routeSessionId && routeSessionId !== sessionId) {
			setSessionId(routeSessionId);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [routeSessionId]);

	const createSession = async () => {
		setLoading(true);
		setError("");
		try {
			const res = await fetch("/api/sessions", { method: "POST" });
			if (!res.ok) throw new Error("Failed to create session");
			const session: Session = await res.json();
			navigate(`/${session.sessionId}`);
			// If we are already on the page (e.g. from home), logic updates
		} catch (err) {
			setError((err as Error).message);
		} finally {
			setLoading(false);
		}
	};

	const joinSession = async (targetSessionId: string) => {
		if (!targetSessionId || !userId) {
			setError("Session ID and User ID are required");
			return;
		}

		if (!routeSessionId || targetSessionId !== routeSessionId) {
			navigate(`/${targetSessionId}`);
			// The useEffect will trigger joinSession again, so we can return here
			// But if we want instant feedback, we can proceed.
			// However, navigating unmounts/remounts components usually unless router preserves state.
			// Here we assume it might remount.
			return;
		}

		setLoading(true);
		setError("");
		try {
			const res = await fetch(`/api/sessions/${targetSessionId}/join`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ userId }),
			});

			if (!res.ok) {
				const text = await res.text();
				throw new Error(text || "Failed to join session");
			}

			const data: JoinResponse = await res.json();
			setCurrentSession(data.session);

			// Connect to RealtimeKit if credentials provided
			if (data.realtime) {
				try {
					await join(data.realtime.token, data.realtime.appId);
				} catch (rtErr) {
					console.error("Realtime connection failed:", rtErr);
					// We don't block the UI, but show warning
					setError(
						"Joined session but voice connection failed (check console/creds)",
					);
				}
			}
		} catch (err) {
			setError((err as Error).message);
			// If session fetch failed, we shouldn't show the session UI
			setCurrentSession(null);
		} finally {
			setLoading(false);
		}
	};

	const handleLeave = async () => {
		await leave();
		setCurrentSession(null);
		setSessionId("");
		navigate("/");
	};

	if (currentSession) {
		return (
			<Card sx={{ maxWidth: 400, mx: "auto", mt: 4, position: "relative" }}>
				{loading && (
					<Box
						sx={{
							position: "absolute",
							top: 0,
							left: 0,
							right: 0,
							height: 4,
							overflow: "hidden",
						}}
					>
						<CircularProgress
							size={20}
							thickness={5}
							sx={{ display: "block", mx: "auto", mt: 1 }}
						/>
					</Box>
				)}
				<CardContent>
					<Typography variant="h5" gutterBottom>
						Session: {currentSession.sessionId.slice(0, 8)}...
					</Typography>
					<Stack direction="row" alignItems="center" spacing={1} mb={2}>
						<Box
							sx={{
								width: 10,
								height: 10,
								borderRadius: "50%",
								bgcolor: isConnected ? "success.main" : "error.main",
							}}
						/>
						<Typography
							variant="caption"
							color={isConnected ? "success.main" : "error.main"}
						>
							{isConnected ? "Voice Connected" : "Voice Disconnected"}
						</Typography>
					</Stack>

					{error && (
						<Alert
							severity="warning"
							onClose={() => setError("")}
							sx={{ mb: 2 }}
						>
							{error}
						</Alert>
					)}

					<Box sx={{ my: 2 }}>
						<Typography variant="subtitle2" color="text.secondary">
							Participants ({currentSession.users.length}/5)
						</Typography>
						<List dense>
							{currentSession.users.map((u) => (
								<ListItem key={u.userId}>
									<ListItemAvatar>
										<Avatar
											src={u.iconUrl}
											alt={u.userId}
											sx={{
												bgcolor:
													u.userId === userId ? "primary.main" : "grey.600",
											}}
										>
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
							color={isMicMuted ? "error" : "primary"}
							onClick={toggleMic}
							size="large"
							sx={{ border: "1px solid currentColor" }}
							disabled={!isConnected}
						>
							{isMicMuted ? <MicOffIcon /> : <MicIcon />}
						</IconButton>
						<IconButton
							color="error"
							onClick={handleLeave}
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
							{loading ? <CircularProgress size={24} /> : "Create New"}
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
