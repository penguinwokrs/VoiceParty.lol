import CallEndIcon from "@mui/icons-material/CallEnd";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import PersonIcon from "@mui/icons-material/Person";
import RefreshIcon from "@mui/icons-material/Refresh";
import SyncProblemIcon from "@mui/icons-material/SyncProblem";
import {
	Alert,
	Avatar,
	Box,
	Button,
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
import { useTranslation } from "react-i18next";
import type { ConnectionState, Session } from "./types";

// Keyframes reused by the connection indicators (defined once on the Card root).
const connectionKeyframes = {
	"@keyframes vpPulse": {
		"0%, 100%": { opacity: 1, transform: "scale(1)" },
		"50%": { opacity: 0.3, transform: "scale(0.6)" },
	},
	"@keyframes vpSpin": {
		to: { transform: "rotate(360deg)" },
	},
	"@keyframes vpEllipsis": {
		"0%": { content: '"."' },
		"33%": { content: '".."' },
		"66%": { content: '"..."' },
	},
	// Horizontal shimmer for the reconnecting progress bar.
	"@keyframes vpSweep": {
		"0%": { backgroundPosition: "200% 0" },
		"100%": { backgroundPosition: "-200% 0" },
	},
} as const;

type ActiveSessionViewProps = {
	session: Session;
	summonerId: string;
	isConnected: boolean;
	// Richer lifecycle; falls back to isConnected when not provided.
	connectionState?: ConnectionState;
	isMicMuted: boolean;
	loading: boolean;
	error: string;
	onErrorClose: () => void;
	onToggleMic: () => void;
	onLeave: () => void;
	onReconnect?: () => void;
	peers?: Peer[];
};

// Small connection dot shown on each participant avatar.
const StatusDot = ({ state }: { state: ConnectionState }) => {
	const color =
		state === "connected"
			? "success.main"
			: state === "disconnected"
				? "error.main"
				: "warning.main";
	const pulsing = state === "reconnecting" || state === "connecting";
	return (
		<Box
			sx={{
				width: 12,
				height: 12,
				borderRadius: "50%",
				bgcolor: color,
				border: "2px solid",
				borderColor: "background.paper",
				animation: pulsing ? "vpPulse 1.2s ease-in-out infinite" : "none",
			}}
		/>
	);
};

// Avatar with a connection-status dot badge at the bottom-right.
const AvatarWithStatus = ({
	src,
	alt,
	state,
	dimmed,
	bgcolor,
}: {
	src?: string;
	alt: string;
	state: ConnectionState;
	dimmed?: boolean;
	bgcolor: string;
}) => (
	<Box sx={{ position: "relative", display: "inline-flex" }}>
		<Avatar
			src={src}
			alt={alt}
			sx={{
				bgcolor,
				opacity: dimmed ? 0.45 : 1,
				filter: dimmed ? "grayscale(1)" : "none",
				transition: "opacity 0.3s, filter 0.3s",
			}}
		>
			<PersonIcon />
		</Avatar>
		<Box sx={{ position: "absolute", bottom: -2, right: -2 }}>
			<StatusDot state={state} />
		</Box>
	</Box>
);

interface Peer {
	id: string;
	peerId?: string;
	// RealtimeKit Participant identity fields. The backend sets both `name` and
	// `custom_participant_id` to the Summoner ID when creating the participant.
	name?: string;
	customParticipantId?: string;
	summonerId?: string; // legacy/fallback
	media?: {
		enableAudio?: () => void;
	};
	stream?: MediaStream;
	audioTrack?: MediaStreamTrack;
}

// Resolve a peer's Summoner ID from the RealtimeKit participant fields.
// `peer.id` is an internal UUID and must only be used as a last resort.
const peerSummonerId = (peer: Peer): string =>
	peer.customParticipantId || peer.name || peer.summonerId || peer.id;

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
	summonerId,
	isConnected,
	connectionState,
	isMicMuted,
	loading,
	error,
	onErrorClose,
	onToggleMic,
	onLeave,
	onReconnect,
	peers = [], // Default to empty array
}: ActiveSessionViewProps) => {
	const { t } = useTranslation();

	// Local user's lifecycle. Falls back to the boolean for older callers/tests.
	const state: ConnectionState =
		connectionState ?? (isConnected ? "connected" : "disconnected");
	const healthy = state === "connected";
	// While the local socket is down we can't trust remote presence, so the whole
	// roster is shown in the same degraded state.
	const rosterState: ConnectionState = healthy ? "connected" : state;

	return (
		<Card
			sx={{
				maxWidth: 400,
				mx: "auto",
				mt: 4,
				position: "relative",
				transition: "box-shadow 0.3s",
				...connectionKeyframes,
				// Keep the Card's elevation shadow and add a colored ring on top
				// (composed box-shadows both respect the border radius).
				...(state === "reconnecting" && {
					boxShadow: (theme) =>
						`${theme.shadows[1]}, 0 0 0 2px ${theme.palette.warning.main}`,
				}),
				...(state === "disconnected" && {
					boxShadow: (theme) =>
						`${theme.shadows[1]}, 0 0 0 2px ${theme.palette.error.main}`,
				}),
			}}
		>
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
					{t("session.label")}:{" "}
					{session.sessionId.length > 12
						? `${session.sessionId.slice(0, 8)}...`
						: session.sessionId}
				</Typography>
				{/* Compact status line for the healthy / initial-connecting states */}
				{(state === "connected" || state === "connecting") && (
					<Stack direction="row" alignItems="center" spacing={1} mb={2}>
						<StatusDot state={state} />
						<Typography
							variant="caption"
							color={healthy ? "success.main" : "warning.main"}
						>
							{healthy ? t("session.connected") : t("session.connecting")}
						</Typography>
					</Stack>
				)}

				{/* Reconnection phase — prominent, animated */}
				{state === "reconnecting" && (
					<Alert
						severity="warning"
						icon={
							<SyncProblemIcon
								sx={{ animation: "vpSpin 1.4s linear infinite" }}
							/>
						}
						sx={{
							mb: 2,
							position: "relative",
							overflow: "hidden",
							"& .MuiAlert-message": { width: "100%" },
							"&::after": {
								content: '""',
								position: "absolute",
								left: 0,
								bottom: 0,
								height: 2,
								width: "100%",
								background: (theme) =>
									`linear-gradient(90deg, transparent, ${theme.palette.warning.main}, transparent)`,
								backgroundSize: "200% 100%",
								animation: "vpSweep 1.4s linear infinite",
							},
						}}
					>
						<Typography
							variant="body2"
							fontWeight={600}
							sx={{
								"&::after": {
									content: '"…"',
									display: "inline-block",
									animation: "vpEllipsis 1.4s steps(1) infinite",
								},
							}}
						>
							{t("session.reconnecting")}
						</Typography>
						<Typography variant="caption" color="text.secondary">
							{t("session.reconnectingHint")}
						</Typography>
					</Alert>
				)}

				{/* Terminal disconnect — offer a manual reconnect */}
				{state === "disconnected" && (
					<Alert
						severity="error"
						sx={{ mb: 2 }}
						action={
							onReconnect && (
								<Button
									color="inherit"
									size="small"
									startIcon={<RefreshIcon />}
									onClick={onReconnect}
								>
									{t("session.reconnect")}
								</Button>
							)
						}
					>
						{t("session.disconnected")}
					</Alert>
				)}

				{error && (
					<Alert severity="warning" onClose={onErrorClose} sx={{ mb: 2 }}>
						{error}
					</Alert>
				)}

				<Box sx={{ my: 2 }}>
					<Typography variant="subtitle2" color="text.secondary">
						{t("session.participants", { n: peers.length + 1 })}
					</Typography>
					<List dense>
						{/* Render Local User */}
						<ListItem key={summonerId}>
							<ListItemAvatar>
								<AvatarWithStatus
									src={
										session.users.find((u) => u.summonerId === summonerId)
											?.iconUrl
									}
									alt={summonerId}
									state={state}
									dimmed={!healthy}
									bgcolor="primary.main"
								/>
							</ListItemAvatar>
							<ListItemText
								sx={{ minWidth: 0 }}
								primary={summonerId}
								secondary={
									healthy
										? t("session.you")
										: `${t("session.you")} · ${t(`session.status.${state}`)}`
								}
								primaryTypographyProps={{ noWrap: true, title: summonerId }}
								secondaryTypographyProps={{
									noWrap: true,
									...(healthy ? {} : { color: "warning.main" }),
								}}
							/>
						</ListItem>

						{/* Render Remote Peers */}
						{peers.map((peer) => {
							// Resolve the Summoner ID from the participant, then look up
							// session metadata (e.g. profile icon) by that ID.
							const summonerId = peerSummonerId(peer);
							const meta = session.users.find(
								(u) => u.summonerId === summonerId,
							);
							return (
								<ListItem key={peer.id || peer.peerId}>
									<ListItemAvatar>
										<AvatarWithStatus
											src={meta?.iconUrl}
											alt={summonerId}
											state={rosterState}
											dimmed={!healthy}
											bgcolor="grey.600"
										/>
									</ListItemAvatar>
									<ListItemText
										sx={{ minWidth: 0 }}
										primary={summonerId}
										secondary={
											healthy ? undefined : t(`session.status.${rosterState}`)
										}
										primaryTypographyProps={{
											noWrap: true,
											title: summonerId,
										}}
										secondaryTypographyProps={
											healthy
												? undefined
												: { noWrap: true, color: "warning.main" }
										}
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
						disabled={!healthy}
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
