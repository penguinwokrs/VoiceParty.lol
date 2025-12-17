import { useEffect, useRef } from "react";
import type { Peer } from "./types";

export const RemoteAudio = ({ peer }: { peer: Peer }) => {
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
