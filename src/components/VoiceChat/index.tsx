import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ActiveSessionView } from "./ActiveSessionView";
import { JoinSessionForm } from "./JoinSessionForm";
import { RemoteAudio } from "./RemoteAudio";
import type { JoinResponse, Session } from "./types";
import { useRealtime } from "./useRealtime";

export const VoiceChat = () => {
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

	const { join, leave, toggleMic, isMicMuted, isConnected, peers } =
		useRealtime();

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
			setError("Session ID and Summoner ID are required");
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
			<>
				{/* Rendering RemoteAudio here to keep ActiveSessionView presentational */}
				{peers.map((p) => (
					<RemoteAudio key={p.id || p.peerId || "unknown"} peer={p} />
				))}
				<ActiveSessionView
					session={currentSession}
					summonerId={summonerId}
					isConnected={isConnected}
					isMicMuted={isMicMuted}
					loading={loading}
					error={error}
					onErrorClose={() => setError("")}
					onToggleMic={toggleMic}
					onLeave={handleLeave}
					peers={peers}
				/>
			</>
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
