import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ActiveSessionView } from "./ActiveSessionView";
import { JoinSessionForm } from "./JoinSessionForm";
import type { JoinResponse, Session } from "./types";
import { useRealtime } from "./useRealtime";

export const VoiceChat = () => {
	const { sessionId: routeSessionId } = useParams();
	const navigate = useNavigate();
	const [sessionId, setSessionId] = useState(routeSessionId || "");
	const [userId, setUserId] = useState(
		() => localStorage.getItem("vp_user_id") || "",
	);
	const [currentSession, setCurrentSession] = useState<Session | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	const { join, leave, toggleMic, isMicMuted, isConnected } = useRealtime();

	useEffect(() => {
		if (userId) {
			localStorage.setItem("vp_user_id", userId);
		}
	}, [userId]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		if (routeSessionId && userId && !currentSession) {
			setSessionId(routeSessionId);
			joinSession(routeSessionId);
		} else if (routeSessionId && routeSessionId !== sessionId) {
			setSessionId(routeSessionId);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [routeSessionId]);

	const joinSession = async (targetSessionId: string) => {
		if (!targetSessionId || !userId) {
			setError("Session ID and User ID are required");
			return;
		}

		if (!routeSessionId || targetSessionId !== routeSessionId) {
			navigate(`/${targetSessionId}`);
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
				body: JSON.stringify({ userId }),
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
			<ActiveSessionView
				session={currentSession}
				userId={userId}
				isConnected={isConnected}
				isMicMuted={isMicMuted}
				loading={loading}
				error={error}
				onErrorClose={() => setError("")}
				onToggleMic={toggleMic}
				onLeave={handleLeave}
			/>
		);
	}

	return (
		<JoinSessionForm
			userId={userId}
			sessionId={sessionId}
			loading={loading}
			error={error}
			onUserIdChange={setUserId}
			onSessionIdChange={setSessionId}
			onJoin={() => joinSession(sessionId)}
			disableSessionInput={!!routeSessionId}
		/>
	);
};
