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
import { useState } from "react";
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
	const [sessionId, setSessionId] = useState("");
	const [userId, setUserId] = useState("");
	const [currentSession, setCurrentSession] = useState<Session | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [isMuted, setIsMuted] = useState(false);

	const createSession = async () => {
		setLoading(true);
		setError("");
		try {
			// In a real app, point to the deployed worker URL
			// For creating a session, we strictly post to the worker endpoint
			// Mocking fetch for creating session
			/* 
			const res = await fetch('http://localhost:8787/sessions', { method: 'POST' });
			const data = await res.json();
			*/

			// Simulation for UI demo
			await new Promise((r) => setTimeout(r, 800));
			const mockSessionId = crypto.randomUUID().slice(0, 8);
			const data = {
				sessionId: mockSessionId,
				users: [],
				createdAt: Date.now(),
			};

			setSessionId(data.sessionId);
			// Auto join after create?
			joinSession(data.sessionId);
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
		setLoading(true);
		setError("");
		try {
			// Mocking fetch for joining
			/*
			const res = await fetch(`http://localhost:8787/sessions/${targetSessionId}/join`, {
			  method: 'POST',
			  body: JSON.stringify({ userId }),
			  headers: { 'Content-Type': 'application/json' }
			});
			if (!res.ok) throw new Error(await res.text());
			const data = await res.json();
			*/

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
										secondary={u.userId === userId ? "(You)" : "Connected"}
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
