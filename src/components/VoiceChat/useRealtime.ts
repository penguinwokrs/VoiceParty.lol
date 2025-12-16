import { useRealtimeKitClient } from "@cloudflare/realtimekit-react";
import { useCallback, useEffect, useState } from "react";

export const useRealtime = () => {
	const [client, initClient] = useRealtimeKitClient();
	const [isConnected, setIsConnected] = useState(false);
	const [isMicMuted, setIsMicMuted] = useState(true);

	useEffect(() => {
		if (!client) {
			setIsConnected(false);
			return;
		}

		// Initial states
		setIsConnected(!!client.peerId);
		// biome-ignore lint/suspicious/noExplicitAny: library types issue
		const c = client as any;
		if (c.self?.media) {
			setIsMicMuted(!c.self.media.audioEnabled);
		}

		const handleUpdate = () => {
			// biome-ignore lint/suspicious/noExplicitAny: library types issue
			const cur = client as any;
			if (cur.self?.media) {
				setIsMicMuted(!cur.self.media.audioEnabled);
			}
			setIsConnected(!!client.peerId);
		};

		// RealtimeKit event handling
		// biome-ignore lint/suspicious/noExplicitAny: check for methods at runtime
		const eventSource = client as any;

		// Support both 'on' and 'addListener' (older versions/internals)
		if (typeof eventSource.on === "function") {
			eventSource.on("peer.joined", handleUpdate);
			eventSource.on("peer.left", handleUpdate);
			eventSource.on("self.updated", handleUpdate);
			eventSource.on("connected", handleUpdate);
			eventSource.on("disconnected", handleUpdate);
		} else if (typeof eventSource.addListener === "function") {
			eventSource.addListener("*", handleUpdate);
		}

		return () => {
			if (typeof eventSource.off === "function") {
				eventSource.off("peer.joined", handleUpdate);
				eventSource.off("peer.left", handleUpdate);
				eventSource.off("self.updated", handleUpdate);
				eventSource.off("connected", handleUpdate);
				eventSource.off("disconnected", handleUpdate);
			} else if (typeof eventSource.removeListener === "function") {
				eventSource.removeListener("*", handleUpdate);
			}
		};
	}, [client]);

	const join = useCallback(
		async (token: string, appId?: string) => {
			try {
				// biome-ignore lint/suspicious/noExplicitAny: debugging
				const config: any = {
					authToken: token,
				};
				if (appId) {
					config.appId = appId;
				}
				const newClient = await initClient(config);
				if (newClient) {
					await newClient.join();
				}
			} catch (e) {
				console.error("Failed to join RealtimeKit:", e);
				// We don't re-throw here to allow UI to handle the error state if needed,
				// or we could throw. Ideally the component handles it.
				throw e;
			}
		},
		[initClient],
	);

	const leave = useCallback(async () => {
		if (client) {
			await client.leave();
		}
	}, [client]);

	const toggleMic = useCallback(async () => {
		// biome-ignore lint/suspicious/noExplicitAny: library types issue
		const c = client as any;
		if (c?.self?.media) {
			if (c.self.media.audioEnabled) {
				await c.self.media.disableAudio();
			} else {
				await c.self.media.enableAudio();
			}
		}
	}, [client]);

	return {
		join,
		leave,
		toggleMic,
		isMicMuted,
		isConnected,
		client,
	};
};
