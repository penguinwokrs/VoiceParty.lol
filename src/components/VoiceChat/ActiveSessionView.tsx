import CallEndIcon from "@mui/icons-material/CallEnd";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import GraphicEqIcon from "@mui/icons-material/GraphicEq";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import OutlinedFlagIcon from "@mui/icons-material/OutlinedFlag";
import PersonIcon from "@mui/icons-material/Person";
import RefreshIcon from "@mui/icons-material/Refresh";
import SyncProblemIcon from "@mui/icons-material/SyncProblem";
import VolumeOffIcon from "@mui/icons-material/VolumeOff";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
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
	ListSubheader,
	Menu,
	MenuItem,
	Slider,
	Snackbar,
	Stack,
	Tooltip,
	Typography,
} from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import type { ConnectionState, Session } from "./types";

// Per-participant receive volume: 0%..300% (values > 100% boost via a Web Audio
// GainNode, which a plain <audio>.volume can't do).
const VOLUME_MIN = 0;
const VOLUME_MAX = 300;
const VOLUME_DEFAULT = 100;
const VOLUMES_KEY = "vp_volumes";
// Locally muting a specific participant (gain forced to 0), independent of and
// remembered separately from their volume level.
const MUTED_KEY = "vp_muted";

// Guarded localStorage read: `localStorage` is undefined under SSR and can throw
// a SecurityError in sandboxed/embedded contexts (e.g. the Storybook iframe).
const readJson = <T,>(key: string, fallback: T): T => {
	if (typeof window === "undefined") return fallback;
	try {
		return JSON.parse(localStorage.getItem(key) || "null") ?? fallback;
	} catch {
		return fallback;
	}
};

const loadVolumes = (): Record<string, number> => readJson(VOLUMES_KEY, {});

const loadMuted = (): Record<string, boolean> => readJson(MUTED_KEY, {});

// Report reasons (must match the server's accepted enum). Reporting a user also
// locally mutes them from the reporter's perspective.
const REPORT_REASONS = [
	"harassment",
	"hate",
	"spam",
	"inappropriate_name",
	"illegal",
	"other",
] as const;

// Inline X (Twitter) logo — self-contained so it needs no brand-icon dependency.
const XLogo = () => (
	<svg
		width="15"
		height="15"
		viewBox="0 0 24 24"
		fill="currentColor"
		aria-hidden
	>
		<title>X</title>
		<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
	</svg>
);

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
	// Speaking indicator: a thick, vivid green ring + a constant soft glow +
	// an expanding pulse halo, so it reads clearly even over the teal self avatar.
	// The solid ring + glow are a static box-shadow; only this halo animates, via
	// GPU-composited transform/opacity (no per-frame repaint) on an ::after ring.
	"@keyframes vpSpeakPulse": {
		"0%": { transform: "scale(1)", opacity: 0.7 },
		"70%": { transform: "scale(1.45)", opacity: 0 },
		"100%": { transform: "scale(1.45)", opacity: 0 },
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
	noiseSuppression?: boolean;
	onToggleNoiseSuppression?: () => void;
	// Peer IDs currently speaking, and whether the local user is speaking.
	activeSpeakers?: Set<string>;
	selfSpeaking?: boolean;
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

// Avatar with a connection-status dot badge at the bottom-right, plus a pulsing
// green ring while the participant is speaking.
const AvatarWithStatus = ({
	src,
	alt,
	state,
	dimmed,
	bgcolor,
	speaking,
}: {
	src?: string;
	alt: string;
	state: ConnectionState;
	dimmed?: boolean;
	bgcolor: string;
	speaking?: boolean;
}) => (
	<Box
		sx={{
			position: "relative",
			display: "inline-flex",
			// Expanding halo ring (GPU-composited transform/opacity). Sits over the
			// avatar bounds; the wrapper doesn't clip, so it can grow past the edge.
			...(speaking && {
				"&::after": {
					content: '""',
					position: "absolute",
					// Start at the outer edge of the avatar's static 3px ring (avatars
					// are border-box, so inset:0 would sit inside it and clip the icon).
					inset: "-3px",
					borderRadius: "50%",
					border: "2px solid rgba(46, 213, 115, 0.9)",
					animation: "vpSpeakPulse 1.3s ease-out infinite",
					pointerEvents: "none",
				},
			}),
		}}
	>
		<Avatar
			src={src}
			alt={alt}
			sx={{
				bgcolor,
				opacity: dimmed ? 0.45 : 1,
				filter: dimmed ? "grayscale(1)" : "none",
				transition: "opacity 0.3s, filter 0.3s, box-shadow 0.2s",
				// Solid ring + soft glow, set once (static box-shadow → no repaint).
				...(speaking && {
					boxShadow:
						"0 0 0 3px rgba(46, 213, 115, 1), 0 0 12px 2px rgba(46, 213, 115, 0.75)",
				}),
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

// Remote audio for one peer, played through a Web Audio GainNode so the
// per-participant volume can go ABOVE 100% (boost) as well as below.
//
// The stream is also attached to a MUTED <audio> element: Chrome won't pull a
// remote WebRTC track through a MediaStreamAudioSourceNode unless it is also
// sinked to a media element, so the element keeps the track flowing while the
// Web Audio graph does the actual (gain-controlled) playback.
const PeerAudio = ({
	peer,
	audioContext,
	volume,
}: {
	peer: Peer;
	audioContext: AudioContext | null;
	volume: number; // linear gain, 1 = 100%
}) => {
	const audioRef = useRef<HTMLAudioElement>(null);
	const gainRef = useRef<GainNode | null>(null);
	const volumeRef = useRef(volume);
	volumeRef.current = volume;

	const track = peer.audioTrack;
	useEffect(() => {
		const el = audioRef.current;
		if (!el || !audioContext) return;
		const stream = track ? new MediaStream([track]) : (peer.stream ?? null);
		if (!stream) return;

		el.srcObject = stream;
		el.muted = true; // avoid double audio; real output is the gain graph
		el.play().catch(() => {});

		let src: MediaStreamAudioSourceNode | null = null;
		let gain: GainNode | null = null;
		try {
			src = audioContext.createMediaStreamSource(stream);
			gain = audioContext.createGain();
			gain.gain.value = volumeRef.current;
			src.connect(gain).connect(audioContext.destination);
			gainRef.current = gain;
		} catch (e) {
			console.error("[PeerAudio] Web Audio setup failed:", e);
		}
		return () => {
			try {
				src?.disconnect();
				gain?.disconnect();
			} catch {
				/* noop */
			}
			gainRef.current = null;
		};
		// track/context identity drives (re)wiring; volume is applied below
	}, [track, audioContext, peer.stream]);

	// Live volume updates without rebuilding the graph.
	useEffect(() => {
		if (gainRef.current)
			gainRef.current.gain.value = Number.isFinite(volume) ? volume : 1;
	}, [volume]);

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
	noiseSuppression = false,
	onToggleNoiseSuppression,
	activeSpeakers,
	selfSpeaking = false,
	peers = [], // Default to empty array
}: ActiveSessionViewProps) => {
	const { t } = useTranslation();

	// A remote peer is "speaking" if either of its RealtimeKit ids is active.
	const isPeerSpeaking = (peer: Peer): boolean =>
		!!activeSpeakers &&
		(activeSpeakers.has(peer.id) ||
			(!!peer.peerId && activeSpeakers.has(peer.peerId)));

	// One AudioContext per session, used for per-peer gain (volume + boost).
	// Created in an effect (never during render — a discarded render would leak
	// it) and held in state so peers re-render/wire up once it exists.
	const [audioCtx, setAudioCtx] = useState<AudioContext | null>(null);
	useEffect(() => {
		if (
			typeof window === "undefined" ||
			typeof window.AudioContext === "undefined"
		)
			return;
		const ctx = new AudioContext();
		setAudioCtx(ctx);
		// Autoplay policy: resume now (the join click was the user gesture).
		ctx.resume().catch(() => {});
		return () => {
			ctx.close().catch(() => {});
		};
	}, []);

	// Per-participant receive volume (percent), keyed by Summoner ID so a
	// player's preferred level sticks across sessions.
	const [volumes, setVolumes] = useState<Record<string, number>>(loadVolumes);
	// Compute the next value and persist it directly in the handler — the state
	// updater must stay pure (React may invoke it twice under StrictMode/concurrent).
	const setVolume = (sid: string, pct: number) => {
		const next = { ...volumes, [sid]: pct };
		setVolumes(next);
		try {
			localStorage.setItem(VOLUMES_KEY, JSON.stringify(next));
		} catch {
			/* ignore quota errors */
		}
		audioCtx?.resume().catch(() => {});
	};
	const volumeOf = (sid: string) => volumes[sid] ?? VOLUME_DEFAULT;

	// Per-participant local mute (independent from the volume level).
	const [muted, setMuted] = useState<Record<string, boolean>>(loadMuted);
	const isMuted = (sid: string) => muted[sid] ?? false;
	const toggleMute = (sid: string) => {
		const next = { ...muted, [sid]: !muted[sid] };
		setMuted(next);
		try {
			localStorage.setItem(MUTED_KEY, JSON.stringify(next));
		} catch {
			/* ignore quota errors */
		}
		audioCtx?.resume().catch(() => {});
	};
	// Force-mute (used when reporting) — never un-mutes an already-muted user.
	const muteFor = (sid: string) => {
		if (muted[sid]) return;
		const next = { ...muted, [sid]: true };
		setMuted(next);
		try {
			localStorage.setItem(MUTED_KEY, JSON.stringify(next));
		} catch {
			/* ignore quota errors */
		}
		audioCtx?.resume().catch(() => {});
	};

	// Reporting: a small reason menu anchored to a participant's flag button.
	const [reportTarget, setReportTarget] = useState<{
		el: HTMLElement;
		sid: string;
	} | null>(null);
	const [reportToast, setReportToast] = useState(false);
	const submitReport = (sid: string, reason: string) => {
		setReportTarget(null);
		// Protect the reporter immediately: locally mute the reported user. This
		// is the ordinary local mute, so it can be undone via the normal control.
		muteFor(sid);
		setReportToast(true);
		// Record the report; failure must not disrupt the call.
		void fetch(
			`/api/sessions/${encodeURIComponent(session.sessionId)}/reports`,
			{
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					reporterSummonerId: summonerId,
					reportedSummonerId: sid,
					reason,
				}),
			},
		)
			.then((res) => {
				// fetch only rejects on network errors, so surface HTTP errors too.
				if (!res.ok) {
					console.error("[report] submit failed with status:", res.status);
				}
			})
			.catch((e) => console.error("[report] submit failed:", e));
	};

	// Sharing: invite friends to this room by link or a playful tweet.
	const shareUrl =
		typeof window !== "undefined"
			? `${window.location.origin}/join/${encodeURIComponent(session.sessionId)}`
			: "";
	const [copiedToast, setCopiedToast] = useState(false);
	const copyLink = () => {
		navigator.clipboard
			?.writeText(shareUrl)
			.then(() => setCopiedToast(true))
			.catch((e) => console.error("[share] copy failed:", e));
	};
	const shareToX = () => {
		const intent = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
			t("session.shareText"),
		)}&url=${encodeURIComponent(shareUrl)}`;
		window.open(intent, "_blank", "noopener,noreferrer");
	};

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
				// Fixed width so the card is the SAME size in every state (it used
				// to shrink to its content — e.g. narrower with no participants).
				// An explicit width (not a %) holds even inside shrink-wrapping
				// parents like Storybook's centered layout; maxWidth keeps it
				// responsive on screens narrower than 400px.
				width: 400,
				maxWidth: "100%",
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
			{/* Invisible audio elements — one gain-controlled sink per remote peer */}
			{peers.map((p) => (
				<PeerAudio
					key={p.id || p.peerId || "unknown"}
					peer={p}
					audioContext={audioCtx}
					volume={
						isMuted(peerSummonerId(p)) ? 0 : volumeOf(peerSummonerId(p)) / 100
					}
				/>
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

				{/* Invite friends: copy the room link or share a playful tweet. */}
				<Stack direction="row" spacing={1} mb={2} flexWrap="wrap" useFlexGap>
					<Button
						size="small"
						variant="outlined"
						startIcon={<ContentCopyIcon />}
						onClick={copyLink}
					>
						{t("session.share")}
					</Button>
					<Button
						size="small"
						variant="outlined"
						startIcon={<XLogo />}
						onClick={shareToX}
					>
						{t("session.shareOnX")}
					</Button>
				</Stack>

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
									speaking={healthy && selfSpeaking}
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
							const vol = volumeOf(summonerId);
							const boosted = vol > 100;
							const mutedNow = isMuted(summonerId);
							return (
								<ListItem
									key={peer.id || peer.peerId}
									sx={{
										flexDirection: "column",
										alignItems: "stretch",
										gap: 0.5,
									}}
								>
									<Box
										sx={{
											display: "flex",
											alignItems: "center",
											width: "100%",
										}}
									>
										<ListItemAvatar>
											<AvatarWithStatus
												src={meta?.iconUrl}
												alt={summonerId}
												state={rosterState}
												dimmed={!healthy}
												bgcolor="grey.600"
												speaking={healthy && isPeerSpeaking(peer)}
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
										<Tooltip title={t("report.action")}>
											<IconButton
												size="small"
												edge="end"
												onClick={(e) =>
													setReportTarget({
														el: e.currentTarget,
														sid: summonerId,
													})
												}
												aria-label={t("report.reportName", {
													name: summonerId,
												})}
											>
												<OutlinedFlagIcon fontSize="small" />
											</IconButton>
										</Tooltip>
									</Box>
									{/* Per-participant mute + receive volume (0%..300%, boost > 100%) */}
									<Box
										sx={{
											display: "flex",
											alignItems: "center",
											gap: 1,
											pl: 5,
											pr: 0.5,
										}}
									>
										<Tooltip
											title={mutedNow ? t("session.unmute") : t("session.mute")}
										>
											<IconButton
												size="small"
												onClick={() => toggleMute(summonerId)}
												color={mutedNow ? "error" : "default"}
												aria-label={
													mutedNow
														? t("session.unmuteName", { name: summonerId })
														: t("session.muteName", { name: summonerId })
												}
												aria-pressed={mutedNow}
											>
												{mutedNow ? (
													<VolumeOffIcon fontSize="small" />
												) : (
													<VolumeUpIcon fontSize="small" />
												)}
											</IconButton>
										</Tooltip>
										<Slider
											size="small"
											aria-label={t("session.volume", { name: summonerId })}
											min={VOLUME_MIN}
											max={VOLUME_MAX}
											step={5}
											marks={[{ value: 100 }]}
											value={vol}
											disabled={mutedNow}
											onChange={(_, v) => setVolume(summonerId, v as number)}
											sx={
												!mutedNow && boosted
													? { color: "warning.main" }
													: undefined
											}
										/>
										<Typography
											variant="caption"
											sx={{
												minWidth: 46,
												textAlign: "right",
												fontVariantNumeric: "tabular-nums",
												color: mutedNow
													? "error.main"
													: boosted
														? "warning.main"
														: "text.secondary",
											}}
										>
											{mutedNow ? t("session.muted") : `${vol}%`}
										</Typography>
									</Box>
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
					{onToggleNoiseSuppression && (
						<Tooltip
							title={
								noiseSuppression
									? t("session.noiseSuppressionOn")
									: t("session.noiseSuppressionOff")
							}
						>
							<span>
								<IconButton
									color={noiseSuppression ? "success" : "default"}
									onClick={onToggleNoiseSuppression}
									size="large"
									sx={{ border: "1px solid currentColor" }}
									disabled={!healthy}
									aria-pressed={noiseSuppression}
									aria-label={t("session.noiseSuppression")}
								>
									<GraphicEqIcon />
								</IconButton>
							</span>
						</Tooltip>
					)}
					<IconButton
						color="error"
						onClick={onLeave}
						size="large"
						sx={{ border: "1px solid currentColor" }}
					>
						<CallEndIcon />
					</IconButton>
				</Stack>

				{/* Report reason menu (anchored to a participant's flag button). */}
				<Menu
					anchorEl={reportTarget?.el ?? null}
					open={Boolean(reportTarget)}
					onClose={() => setReportTarget(null)}
				>
					<ListSubheader sx={{ bgcolor: "transparent", lineHeight: 2.5 }}>
						{t("report.title")}
					</ListSubheader>
					{REPORT_REASONS.map((reason) => (
						<MenuItem
							key={reason}
							onClick={() =>
								reportTarget && submitReport(reportTarget.sid, reason)
							}
						>
							{t(`report.reasons.${reason}`)}
						</MenuItem>
					))}
				</Menu>

				<Snackbar
					open={reportToast}
					autoHideDuration={3000}
					onClose={() => setReportToast(false)}
					message={t("report.submitted")}
					anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
				/>
				<Snackbar
					open={copiedToast}
					autoHideDuration={3000}
					onClose={() => setCopiedToast(false)}
					message={t("session.linkCopied")}
					anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
				/>
			</CardContent>
		</Card>
	);
};
