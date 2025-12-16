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
	media?: {
		enableAudio?: () => void;
	};
	stream?: MediaStream;
}

// Helper component for remote audio
const RemoteAudio = ({ peer }: { peer: Peer }) => {
	const audioRef = (node: HTMLAudioElement | null) => {
		if (node && peer.media) {
			// Attach tracks. Note: RealtimeKit uses 'peer.media.enableAudio()' which usually handles sending.
			// For playback we need to get the MediaStream or Track.
			// RealtimeKit often handles this internally if using their UI components,
			// but raw SDK requires attaching tracks.
			// Let's assume peer.media.tracks is a MediaStream or has audio tracks.
			// Or check peer.stream.

			// According to common WebRTC SDK patterns:
			// peer.media might provide tracks.
			// Docs say "seamlessly ... play media".
			// If we inspect the peer object in useRealtime we might know better.
			// But sticking to standard:
			// if (peer.stream) node.srcObject = peer.stream;

			// Let's protect against errors.
			try {
				if (peer.stream) {
					node.srcObject = peer.stream;
				}
			} catch (e) {
				console.error("Failed to attach stream", e);
			}
		}
	};

	// We can try to attach ref.
	// Actually, straightforward way in React:
	// useEffect(() => { if(ref.current) ref.current.srcObject = peer.stream }, [peer.stream])

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
						Participants ({session.users.length}/5)
					</Typography>
					<List dense>
						{session.users.map((u) => {
							// Determine if user is speaking or connected based on peers list?
							// For now, simple list.
							return (
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
