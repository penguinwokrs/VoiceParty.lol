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
import type { Peer, Session } from "./types";

type ActiveSessionViewProps = {
	session: Session;
	summonerId: string;
	isConnected: boolean;
	isMicMuted: boolean;
	loading: boolean;
	error: string;
	onErrorClose: () => void;
	onToggleMic: () => void;
	onLeave: () => void;
	peers?: Peer[];
};

export const ActiveSessionView = ({
	session,
	summonerId,
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
						<ListItem key={summonerId}>
							<ListItemAvatar>
								<Avatar
									src={
										session.users.find((u) => u.summonerId === summonerId)
											?.iconUrl
									}
									alt={summonerId}
									sx={{ bgcolor: "primary.main" }}
								>
									<PersonIcon />
								</Avatar>
							</ListItemAvatar>
							<ListItemText primary={summonerId} secondary="(You)" />
						</ListItem>

						{/* Render Remote Peers */}
						{peers.map((peer) => {
							// Try to find metadata from session users (best effort)
							const meta = session.users.find(
								(u) => u.summonerId === (peer.summonerId || peer.id),
							);
							return (
								<ListItem key={peer.id || peer.peerId}>
									<ListItemAvatar>
										<Avatar
											src={meta?.iconUrl}
											alt={meta?.summonerId || peer.summonerId || "Unknown"}
											sx={{ bgcolor: "grey.600" }}
										>
											<PersonIcon />
										</Avatar>
									</ListItemAvatar>
									<ListItemText
										primary={meta?.summonerId || peer.summonerId || peer.id}
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
