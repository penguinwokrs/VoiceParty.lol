import type { AudioMiddleware } from "@cloudflare/realtimekit";
import {
	loadRnnoise,
	RnnoiseWorkletNode,
} from "@sapphi-red/web-noise-suppressor";
// Vite serves the worklet module and the wasm binaries as URLs.
import rnnoiseWasmUrl from "@sapphi-red/web-noise-suppressor/rnnoise.wasm?url";
import rnnoiseWasmSimdUrl from "@sapphi-red/web-noise-suppressor/rnnoise_simd.wasm?url";
import rnnoiseWorkletUrl from "@sapphi-red/web-noise-suppressor/rnnoiseWorklet.js?url";

// RealtimeKit audio middleware that runs the local mic through RNNoise
// (WASM ML noise suppression). RealtimeKit wires the raw mic audio through the
// returned AudioWorkletNode, so the processed audio is what other participants
// hear. Add it with `client.self.addAudioMiddleware(mw)` and remove the SAME
// reference with `removeAudioMiddleware(mw)`.
export const createNoiseSuppressionMiddleware = (): AudioMiddleware => {
	return async (audioContext: AudioContext) => {
		const wasmBinary = await loadRnnoise({
			url: rnnoiseWasmUrl,
			simdUrl: rnnoiseWasmSimdUrl,
		});
		await audioContext.audioWorklet.addModule(rnnoiseWorkletUrl);
		return new RnnoiseWorkletNode(audioContext, {
			wasmBinary,
			maxChannels: 1,
		});
	};
};
