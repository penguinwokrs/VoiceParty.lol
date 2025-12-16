import { defineConfig } from "orval";

export default defineConfig({
	riotApi: {
		input: "../tsp-output/@typespec/openapi.yaml",
		output: {
			target: "./generated/riotApi.ts",
			client: "axios",
			mode: "single",
		},
	},
});
