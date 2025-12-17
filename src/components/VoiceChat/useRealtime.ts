import { useRealtimeKitClient } from "@cloudflare/realtimekit-react";
import { useCallback, useEffect, useState } from "react";

export const useRealtime = () => {
	const [client, initClient] = useRealtimeKitClient();
	const [isConnected, setIsConnected] = useState(false);
	const [isMicMuted, setIsMicMuted] = useState(false);

	// Mock state for development
	const [isMock, setIsMock] = useState(false);
	// biome-ignore lint/suspicious/noExplicitAny: Peer type
	const [peers, setPeers] = useState<any[]>([]);

	// Initialize mute state helper
	const updateMuteState = useCallback(() => {
		if (!client) return;
		// Try accessing audioEnabled directly from client.self (SelfMedia)
		// biome-ignore lint/suspicious/noExplicitAny: library types
		const self = client.self as any;
		if (self) {
			if (typeof self.audioEnabled === "boolean") {
				setIsMicMuted(!self.audioEnabled);
			} else if (self.media) {
				// Fallback to media if direct access fails
				setIsMicMuted(!self.media.audioEnabled);
			}
		}
	}, [client]);

	useEffect(() => {
		if (isMock) return;

		if (!client) {
			setIsConnected(false);
			return;
		}

		// Initial states
		setIsConnected(!!client.peerId);

		// Initial mute check
		updateMuteState();

		const updatePeers = () => {
			// biome-ignore lint/suspicious/noExplicitAny: library types
			const c = client as any;
			// Check for participants.joined which is the correct way to get active peers
			if (c.participants?.joined) {
				const joined = c.participants.joined;
				if (typeof joined.toArray === "function") {
					setPeers(joined.toArray());
				} else if (joined instanceof Map) {
					setPeers(Array.from(joined.values()));
				} else {
					console.warn("[useRealtime] Unknown participants structure", joined);
					setPeers([]);
				}
			} else if (c.peers) {
				// Fallback to legacy or incorrect 'peers' property if 'participants' is missing
				const p = c.peers;
				if (p instanceof Map) {
					setPeers(Array.from(p.values()));
				} else if (typeof p === "object") {
					setPeers(Object.values(p));
				}
			}
		};

		const handleUpdate = (...args: unknown[]) => {
			console.log("[useRealtime] handleUpdate triggered:", args);
			updateMuteState();
			setIsConnected(!!client.peerId);
			// Add a small delay to allow internal state to update before reading participants
			setTimeout(() => {
				updatePeers();
			}, 100);
		};

		// RealtimeKit event handling
		// biome-ignore lint/suspicious/noExplicitAny: internal/legacy methods
		const eventSource = client as any;

		// Support both 'on' and 'addListener' (older versions/internals)
		if (typeof eventSource.on === "function") {
			// 'peer.joined' is not in standard types, use 'peer/joined-internal' or fallback
			eventSource.on("peer.joined", handleUpdate);
			eventSource.on("peer/joined-internal", handleUpdate);
			eventSource.on("peer.left", handleUpdate);
			// 'self.updated' might not be emitted by client, check client.self events
			eventSource.on("self.updated", handleUpdate); // Keep for backwards compat if it exists
			eventSource.on("connected", handleUpdate);
			eventSource.on("disconnected", handleUpdate);

			// Listen for media track events which might indicate audio started
			eventSource.on("websocket/new-consumer", handleUpdate);
			eventSource.on("websocket/consumer-resumed", handleUpdate);
			eventSource.on("media/update-active", handleUpdate);

			// Listen to self events directly
			if (client.self && typeof client.self.on === "function") {
				// biome-ignore lint/suspicious/noExplicitAny: self events
				const s = client.self as any;
				s.on("audioUpdate", handleUpdate);
				s.on("videoUpdate", handleUpdate);
			}
		} else if (typeof eventSource.addListener === "function") {
			eventSource.addListener("*", handleUpdate);
		}

		// Backup: Poll for peer updates periodically to ensure consistency
		const intervalId = setInterval(updatePeers, 2000);

		return () => {
			clearInterval(intervalId);
			if (typeof eventSource.off === "function") {
				// Use explicit event names for cleanup
				eventSource.off("peer.joined", handleUpdate);
				eventSource.off("peer/joined-internal", handleUpdate);
				eventSource.off("peer.left", handleUpdate);
				eventSource.off("self.updated", handleUpdate);
				eventSource.off("connected", handleUpdate);
				eventSource.off("disconnected", handleUpdate);
				eventSource.off("websocket/new-consumer", handleUpdate);
				eventSource.off("websocket/consumer-resumed", handleUpdate);
				eventSource.off("media/update-active", handleUpdate);

				if (client.self && typeof client.self.off === "function") {
					// biome-ignore lint/suspicious/noExplicitAny: self events
					const s = client.self as any;
					s.off("audioUpdate", handleUpdate);
					s.off("videoUpdate", handleUpdate);
				}
			} else if (typeof eventSource.removeListener === "function") {
				eventSource.removeListener("*", handleUpdate);
			}
		};
	}, [client, isMock, updateMuteState]);

	const join = useCallback(
		async (token: string, appId?: string) => {
			if (token === "mock-token") {
				console.log("[Mock Mode] Simulating voice connection");
				setIsMock(true);
				setIsConnected(true);
				setIsMicMuted(false);
				return;
			}

			try {
				// biome-ignore lint/suspicious/noExplicitAny: library config type
				const config: any = {
					authToken: token,
				};
				if (appId) {
					config.appId = appId;
				}
				// Explicitly request audio to ensure media tracks are initialized
				config.defaults = {
					audio: true,
					video: false,
				};
				const newClient = await initClient(config);
				if (newClient) {
					await newClient.join();
				}
			} catch (e) {
				console.error("Failed to join RealtimeKit:", e);
				throw e;
			}
		},
		[initClient],
	);

	const leave = useCallback(async () => {
		if (isMock) {
			console.log("[Mock Mode] Leaving session");
			setIsConnected(false);
			setIsMock(false);
			return;
		}
		if (client) {
			await client.leave();
		}
	}, [client, isMock]);

	const toggleMic = useCallback(async () => {
		if (isMock) {
			setIsMicMuted((prev) => !prev);
			return;
		}
		// biome-ignore lint/suspicious/noExplicitAny: casting for potential missing types
		const c = client as any;

		try {
			// Try direct enable/disable first
			if (c.self) {
				const self = c.self;
				// Check current state
				// Depending on implementation, audioEnabled might be on self directly or self.media
				let isAudioEnabled = self.audioEnabled;
				if (typeof isAudioEnabled === "undefined" && self.media) {
					isAudioEnabled = self.media.audioEnabled;
				}

				if (isAudioEnabled) {
					console.log("[useRealtime] Disabling audio via self.disableAudio()");
					await self.disableAudio();
				} else {
					console.log("[useRealtime] Enabling audio via self.enableAudio()");
					await self.enableAudio();
				}
				// Force state update after action
				updateMuteState();
			} else {
				console.error("[useRealtime] client.self is missing!");
			}
		} catch (err) {
			console.error("[useRealtime] Failed to toggle audio:", err);
		}
	}, [client, isMock, updateMuteState]);

	return {
		join,
		leave,
		toggleMic,
		isMicMuted,
		isConnected,
		client,
		peers,
	};
};
