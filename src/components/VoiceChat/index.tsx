import { nanoid } from "nanoid";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import type { LanguageCode } from "../../i18n";
import { localizePath } from "../../i18n/paths";
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
			const res = await fetch(`/api/sessions/${targetSessionId}/join`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ summonerId, region }),
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

	const handleLeave = async () => {
		await leave();
		setCurrentSession(null);
		// Leaving ends the intent to be in a room, and the next one is a new room.
		joinRequested.current = false;
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
