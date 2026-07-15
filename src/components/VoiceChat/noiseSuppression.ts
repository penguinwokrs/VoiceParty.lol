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
// Fetch + compile the RNNoise WASM once and reuse it (the middleware is
// re-created on every reconnect, so without this it would re-download/recompile
// each time).
let rnnoiseWasmPromise: Promise<ArrayBuffer> | null = null;
const getRnnoiseWasm = () => {
	if (!rnnoiseWasmPromise) {
		rnnoiseWasmPromise = loadRnnoise({
			url: rnnoiseWasmUrl,
			simdUrl: rnnoiseWasmSimdUrl,
		});
	}
	return rnnoiseWasmPromise;
};

export const createNoiseSuppressionMiddleware = (): AudioMiddleware => {
	return async (audioContext: AudioContext) => {
		const wasmBinary = await getRnnoiseWasm();
		await audioContext.audioWorklet.addModule(rnnoiseWorkletUrl);
		return new RnnoiseWorkletNode(audioContext, {
			wasmBinary,
			maxChannels: 1,
		});
	};
};
