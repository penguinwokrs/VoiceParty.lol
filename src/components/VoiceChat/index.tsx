import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { ActiveSessionView } from "./ActiveSessionView";
import { JoinSessionForm } from "./JoinSessionForm";
import type { JoinResponse, Session } from "./types";
import { useRealtime } from "./useRealtime";

export const VoiceChat = () => {
	const { t } = useTranslation();
	const { sessionId: routeSessionId } = useParams();
	const navigate = useNavigate();
	const [sessionId, setSessionId] = useState(routeSessionId || "");
	const [summonerId, setSummonerId] = useState(() => {
		const stored = localStorage.getItem("vp_summoner_id") || "";
		return stored.length > 32 ? "" : stored;
	});
	const [currentSession, setCurrentSession] = useState<Session | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

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

	// biome-ignore lint/correctness/useExhaustiveDependencies: Only run once on mount when params exist
	useEffect(() => {
		if (routeSessionId && summonerId && !currentSession) {
			setSessionId(routeSessionId);
			joinSession(routeSessionId);
		} else if (routeSessionId && routeSessionId !== sessionId) {
			setSessionId(routeSessionId);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [routeSessionId]);

	const joinSession = async (targetSessionId: string) => {
		if (!targetSessionId || !summonerId) {
			setError(t("errors.idsRequired"));
			return;
		}

		if (!routeSessionId || targetSessionId !== routeSessionId) {
			navigate(`/join/${targetSessionId}`);
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
				body: JSON.stringify({ summonerId }),
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
			sessionId={sessionId}
			loading={loading}
			error={error}
			onSummonerIdChange={setSummonerId}
			onSessionIdChange={setSessionId}
			onJoin={() => joinSession(sessionId)}
			disableSessionInput={!!routeSessionId}
		/>
	);
};
