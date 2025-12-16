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
	Typography,
} from "@mui/material";
import { useEffect, useRef } from "react";
import type { Session } from "./types";

type ActiveSessionViewProps = {
	session: Session;
	userId: string;
	isConnected: boolean;
	isMicMuted: boolean;
	loading: boolean;
	error: string;
	onErrorClose: () => void;
	onToggleMic: () => void;
	onLeave: () => void;
	peers?: Peer[];
};

interface Peer {
	id: string;
	peerId?: string;
	userId?: string; // Add userId which might come from RealtimeKit
	media?: {
		enableAudio?: () => void;
	};
	stream?: MediaStream;
	audioTrack?: MediaStreamTrack;
}

// Helper component for remote audio
const RemoteAudio = ({ peer }: { peer: Peer }) => {
	const audioRef = useRef<HTMLAudioElement>(null);

	useEffect(() => {
		const node = audioRef.current;
		if (!node || !peer) return;

		try {
			// Participant (Peer) usually has audioTrack (MediaStreamTrack) but not 'stream' (MediaStream)
			// We need to create a MediaStream from the track.

			// Check for audioTrack directly
			if (peer.audioTrack) {
				console.log(
					`[RemoteAudio] Attaching track ${peer.audioTrack.id} for peer ${peer.id}`,
				);
				// Create a new MediaStream with the track
				const stream = new MediaStream([peer.audioTrack]);
				node.srcObject = stream;
				// Ensure playback
				node
					.play()
					.catch((e) => console.error("[RemoteAudio] Playback failed:", e));
			} else if (peer.stream) {
				console.log(`[RemoteAudio] Attaching stream for peer ${peer.id}`);
				// Fallback if 'stream' property exists
				node.srcObject = peer.stream;
				node
					.play()
					.catch((e) => console.error("[RemoteAudio] Playback failed:", e));
			} else {
				console.warn(
					`[RemoteAudio] Peer ${peer.id} has no audio track or stream`,
				);
			}
		} catch (e) {
			console.error("Failed to attach stream", e);
		}
	}, [peer, peer.audioTrack, peer.stream]);

	return (
		// biome-ignore lint/a11y/useMediaCaption: Audio for voice chat
		<audio
			ref={audioRef}
			autoPlay
			playsInline
			controls={false}
			style={{ display: "none" }}
		/>
	);
};

export const ActiveSessionView = ({
	session,
	userId,
	isConnected,
	isMicMuted,
	loading,
	error,
	onErrorClose,
	onToggleMic,
	onLeave,
	peers = [], // Default to empty array
}: ActiveSessionViewProps) => {
	return (
		<Card sx={{ maxWidth: 400, mx: "auto", mt: 4, position: "relative" }}>
			{/* Render invisible audio elements for all remote peers */}
			{peers.map((p) => (
				<RemoteAudio key={p.id || p.peerId || "unknown"} peer={p} />
			))}

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
					Session:{" "}
					{session.sessionId.length > 12
						? `${session.sessionId.slice(0, 8)}...`
						: session.sessionId}
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
					<Alert severity="warning" onClose={onErrorClose} sx={{ mb: 2 }}>
						{error}
					</Alert>
				)}

				<Box sx={{ my: 2 }}>
					<Typography variant="subtitle2" color="text.secondary">
						Participants ({peers.length + 1}/5)
					</Typography>
					<List dense>
						{/* Render Local User */}
						<ListItem key={userId}>
							<ListItemAvatar>
								<Avatar
									src={session.users.find((u) => u.userId === userId)?.iconUrl}
									alt={userId}
									sx={{ bgcolor: "primary.main" }}
								>
									<PersonIcon />
								</Avatar>
							</ListItemAvatar>
							<ListItemText primary={userId} secondary="(You)" />
						</ListItem>

						{/* Render Remote Peers */}
						{peers.map((peer) => {
							// Try to find metadata from session users (best effort)
							const meta = session.users.find(
								(u) => u.userId === (peer.userId || peer.id),
							);
							return (
								<ListItem key={peer.id || peer.peerId}>
									<ListItemAvatar>
										<Avatar
											src={meta?.iconUrl}
											alt={meta?.userId || peer.userId || "Unknown"}
											sx={{ bgcolor: "grey.600" }}
										>
											<PersonIcon />
										</Avatar>
									</ListItemAvatar>
									<ListItemText
										primary={meta?.userId || peer.userId || peer.id}
									/>
								</ListItem>
							);
						})}
					</List>
				</Box>
				<Stack direction="row" spacing={2} justifyContent="center" mt={3}>
					<IconButton
						color={isMicMuted ? "error" : "primary"}
						onClick={onToggleMic}
						size="large"
						sx={{ border: "1px solid currentColor" }}
						disabled={!isConnected}
					>
						{isMicMuted ? <MicOffIcon /> : <MicIcon />}
					</IconButton>
					<IconButton
						color="error"
						onClick={onLeave}
						size="large"
						sx={{ border: "1px solid currentColor" }}
					>
						<CallEndIcon />
					</IconButton>
				</Stack>
			</CardContent>
		</Card>
	);
};
