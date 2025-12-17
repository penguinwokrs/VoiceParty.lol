/// <reference types="vitest/config" />
/// <reference types="vitest" />

import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

// https://vite.dev/config/
export default defineConfig({
	plugins: [react()],
	define: {
		"process.env": {},
		global: "window",
	},
	server: {
		host: true,
		proxy: {
			"/api": {
				target: "http://127.0.0.1:8788",
				changeOrigin: true,
			},
		},
	},
	test: {
		globals: true,
		environment: "jsdom",
		setupFiles: "./src/setupTests.ts",
	},
});
