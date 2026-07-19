import { nanoid } from "nanoid";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import type { LanguageCode } from "../../i18n";
import { localizePath } from "../../i18n/paths";
import { getAttribution } from "../../lib/attribution";
import { ActiveSessionView } from "./ActiveSessionView";
import { JoinSessionForm } from "./JoinSessionForm";
import { isRegionCode } from "./regions";
import type { JoinResponse, Session } from "./types";
import { useRealtime } from "./useRealtime";

// Room IDs are generated, never typed. Players no longer agree on a word out of
// band — the invite link is the only way in — so the ID has to be unguessable
// rather than memorable: the readable IDs this replaces ("game-123") let anyone
// walk into a stranger's room by guessing. 12 chars of nanoid's 64-symbol
// alphabet is far past brute force, and stays short enough to paste anywhere.
const ROOM_ID_LENGTH = 12;

// A lone participant is a live RealtimeKit connection billed by the minute
// (participant-minutes) with nobody to talk to. After a spell alone we warn,
// then drop the connection to stop the meter — the room stays and one tap
// rejoins. Anyone else being present cancels it. Tuned so an attentive waiter
// (who dismisses the warning) is never paused; only an abandoned tab is.
const WARN_AFTER_ALONE_MS = 4 * 60 * 1000;
const PAUSE_AFTER_ALONE_MS = 5 * 60 * 1000;

export const VoiceChat = () => {
	const { t, i18n } = useTranslation();
	const lang = (i18n.resolvedLanguage ?? "en") as LanguageCode;
	const { sessionId: routeSessionId, region: routeRegionParam } = useParams();
	const navigate = useNavigate();
	// An unknown code in the URL is ignored rather than trusted, which also
	// lets a legacy /join/:sessionId link fall through to the picker.
	const routeRegion = isRegionCode(routeRegionParam) ? routeRegionParam : "";
	// Following an invite link uses that room; otherwise this visit mints a new
	// one, so the join button is live the moment a Riot ID is filled in.
	const [sessionId, setSessionId] = useState(
		() => routeSessionId || nanoid(ROOM_ID_LENGTH),
	);
	const [summonerId, setSummonerId] = useState(() => {
		const stored = localStorage.getItem("vp_summoner_id") || "";
		return stored.length > 32 ? "" : stored;
	});
	// Player's Riot platform region (e.g. "na1"). An invite link pins it —
	// you can't play across platforms — otherwise we remember the last choice.
	const [region, setRegion] = useState(() => {
		if (routeRegion) return routeRegion;
		try {
			return localStorage.getItem("vp_region") || "";
		} catch {
			return "";
		}
	});
	const [currentSession, setCurrentSession] = useState<Session | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	// Idle handling for a solo connection (see WARN_/PAUSE_AFTER_ALONE_MS).
	const [idleWarning, setIdleWarning] = useState(false);
	const [idlePaused, setIdlePaused] = useState(false);
	// Bumped to re-arm the alone timers when the user says "keep waiting".
	const [keepAliveNonce, setKeepAliveNonce] = useState(0);
	// Whether the player pressed Join. A ref, not state: it gates an effect that
	// must see the new value on the very next run, without a re-render of its own.
	const joinRequested = useRef(false);

	const {
		join,
		leave,
		reconnect,
		toggleMic,
		isMicMuted,
		isConnected,
		connectionState,
		noiseSuppression,
		toggleNoiseSuppression,
		activeSpeakers,
		selfSpeaking,
		peers,
	} = useRealtime();

	useEffect(() => {
		if (summonerId) {
			localStorage.setItem("vp_summoner_id", summonerId);
		}
	}, [summonerId]);

	// Only regions the player picked themselves are remembered. A region pinned
	// by someone else's invite link must not become their default — a JP player
	// following a KR link would otherwise start their next room on KR.
	const handleRegionChange = (next: string) => {
		setRegion(next);
		if (!next) return;
		try {
			localStorage.setItem("vp_region", next);
		} catch {
			/* ignore storage errors */
		}
	};

	// Follow the link if it points at a different region than the one in hand.
	useEffect(() => {
		if (routeRegion) setRegion(routeRegion);
	}, [routeRegion]);

	// In-app room path. Keeps the current language prefix, so joining from
	// /ja/join doesn't drop the reader back into English.
	const roomPath = (id: string) =>
		localizePath(region ? `/join/${region}/${id}` : `/join/${id}`, lang);

	// biome-ignore lint/correctness/useExhaustiveDependencies: Re-runs when the room the URL points at changes
	useEffect(() => {
		if (routeSessionId && routeSessionId !== sessionId) {
			setSessionId(routeSessionId);
		}
		// Resume a join the player actually asked for. `joinSession` navigates to
		// the room path first and returns, so this effect is what completes the
		// join once the params are in place.
		//
		// It must NOT fire on arrival from someone's link: a returning player has
		// a stored Riot ID, which used to be enough to drop them straight into a
		// live call — mic on, strangers listening — without ever seeing the form.
		// The stored name prefills the field; pressing Join stays their decision.
		if (
			joinRequested.current &&
			routeSessionId &&
			summonerId &&
			!currentSession
		) {
			joinSession(routeSessionId);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [routeSessionId, routeRegion]);

	const joinSession = async (targetSessionId: string) => {
		if (!targetSessionId || !summonerId) {
			setError(t("errors.idsRequired"));
			return;
		}

		// Put the room in the URL before joining, so the address bar is always a
		// shareable invite. Region is part of that identity; links made before it
		// existed stay on the bare path until the joiner picks one.
		if (
			!routeSessionId ||
			targetSessionId !== routeSessionId ||
			(region && region !== routeRegion)
		) {
			navigate(roomPath(targetSessionId));
			// Navigating re-runs the effect above, which calls joinSession again
			// with the params now in place.
			return;
		}

		setLoading(true);
		setError("");
		try {
			const { src, ref } = getAttribution();
			const res = await fetch(`/api/sessions/${targetSessionId}/join`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				// src/ref/lang are attribution only — the server sanitizes them
				// against its own allowlist and never stores them per-user.
				body: JSON.stringify({ summonerId, region, src, ref, lang }),
			});

			if (!res.ok) {
				const text = await res.text();
				throw new Error(text || t("errors.joinFailed"));
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
					setError(t("errors.voiceConnectionFailed"));
				}
			}
		} catch (err) {
			setError((err as Error).message);
			// If session fetch failed, we shouldn't show the session UI
			setCurrentSession(null);
			// Don't let a failed attempt keep retrying behind their back — e.g. on
			// the next region change. Pressing Join again is an explicit retry.
			joinRequested.current = false;
		} finally {
			setLoading(false);
		}
	};

	// Watch a live, solo connection and pause it before it wastes many minutes.
	// `peers` is the live SDK roster (who is actually connected), not the
	// append-only KV list — so this reflects real presence. Anyone joining, or
	// the connection ending for any other reason, cancels the timers.
	// biome-ignore lint/correctness/useExhaustiveDependencies: keepAliveNonce is the re-arm signal
	useEffect(() => {
		if (!isConnected || peers.length > 0 || idlePaused) {
			setIdleWarning(false);
			return;
		}
		const warnTimer = setTimeout(
			() => setIdleWarning(true),
			WARN_AFTER_ALONE_MS,
		);
		const pauseTimer = setTimeout(() => {
			setIdleWarning(false);
			setIdlePaused(true);
			// leave() drops the RealtimeKit connection (stops billing) without
			// navigating away, so the room view stays and resume can re-join.
			leave().catch((e) => console.error("[idle] pause failed:", e));
		}, PAUSE_AFTER_ALONE_MS);
		return () => {
			clearTimeout(warnTimer);
			clearTimeout(pauseTimer);
		};
	}, [isConnected, peers.length, idlePaused, keepAliveNonce, leave]);

	// "Keep waiting" from the warning: dismiss it and restart the alone timers.
	const handleKeepAlive = () => {
		setIdleWarning(false);
		setKeepAliveNonce((n) => n + 1);
	};

	// Resume from an idle pause: re-join the same room.
	const handleResume = async () => {
		setIdlePaused(false);
		setError("");
		try {
			await reconnect();
		} catch {
			setError(t("errors.reconnectFailed"));
		}
	};

	const handleLeave = async () => {
		await leave();
		setCurrentSession(null);
		// Leaving ends the intent to be in a room, and the next one is a new room.
		joinRequested.current = false;
		setIdlePaused(false);
		setIdleWarning(false);
		setSessionId(nanoid(ROOM_ID_LENGTH));
		navigate("/");
	};

	const handleReconnect = async () => {
		setError("");
		try {
			await reconnect();
		} catch {
			// reconnect() re-throws on failure; surface it instead of leaving an
			// unhandled rejection with no UI feedback.
			setError(t("errors.reconnectFailed"));
		}
	};

	if (currentSession) {
		return (
			<ActiveSessionView
				session={currentSession}
				summonerId={summonerId}
				region={region}
				isConnected={isConnected}
				connectionState={connectionState}
				isMicMuted={isMicMuted}
				loading={loading}
				error={error}
				onErrorClose={() => setError("")}
				onToggleMic={toggleMic}
				onLeave={handleLeave}
				onReconnect={handleReconnect}
				noiseSuppression={noiseSuppression}
				onToggleNoiseSuppression={toggleNoiseSuppression}
				activeSpeakers={activeSpeakers}
				selfSpeaking={selfSpeaking}
				peers={peers}
				idleWarning={idleWarning}
				idlePaused={idlePaused}
				onResume={handleResume}
				onKeepAlive={handleKeepAlive}
			/>
		);
	}

	return (
		<JoinSessionForm
			summonerId={summonerId}
			region={region}
			loading={loading}
			error={error}
			onSummonerIdChange={setSummonerId}
			onRegionChange={handleRegionChange}
			onJoin={() => {
				joinRequested.current = true;
				joinSession(sessionId);
			}}
			disableRegionInput={!!routeRegion}
		/>
	);
};
