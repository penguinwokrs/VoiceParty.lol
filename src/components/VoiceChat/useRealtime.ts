import { useRealtimeKitClient } from "@cloudflare/realtimekit-react";
import { useCallback, useEffect, useState } from "react";

export const useRealtime = () => {
	const [client, initClient] = useRealtimeKitClient();
	// biome-ignore lint/nursery/useExplicitType: <explanation>
	const [, setTick] = useState(0);

	useEffect(() => {
		if (!client) return;

		const handleUpdate = () => setTick((t) => t + 1);

		// @ts-expect-error - addListener is not in the type definition but used in library internals
		if (typeof client.addListener === "function") {
			// @ts-expect-error
			client.addListener("*", handleUpdate);
		}

		return () => {
			// @ts-expect-error
			if (typeof client.removeListener === "function") {
				// @ts-expect-error
				client.removeListener("*", handleUpdate);
			}
		};
	}, [client]);

	const isConnected = !!client?.peerId;

	const isMicMuted = (() => {
		if (!client?.self?.media) return true;
		return !client.self.media.audioEnabled;
	})();

	const join = useCallback(
		async (token: string) => {
			// Initialize with the token
			const newClient = await initClient({
				authToken: token,
			});
			if (newClient) {
				await newClient.join();
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
		if (client?.self?.media) {
			if (client.self.media.audioEnabled) {
				await client.self.media.disableAudio();
			} else {
				await client.self.media.enableAudio();
			}
		}
	}, [client]);

	return {
		join,
		leave,
		toggleMic,
		isMicMuted: !!isMicMuted,
		isConnected: !!isConnected,
	};
};
