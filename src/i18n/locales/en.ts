import type { TranslationResources } from "./ja";

export const en: TranslationResources = {
	landing: {
		eyebrow: "Real-time voice",
		title: "Voice Party",
		subtitle:
			"Gather your allies, coordinate your plays, and dominate the rift with crystal-clear voice — right in your browser.",
		cta: "Join",
		scrollHint: "How to",
		features: {
			eyebrow: "Why Voice Party",
			heading: "Features",
			items: {
				noInstall: {
					title: "No install",
					body: "Just a browser — no app downloads, no sign-ups. Open it and start talking instantly.",
				},
				clearVoice: {
					title: "Crystal-clear voice",
					body: "Low-noise, high-quality real-time voice. Mute and unmute with a single tap.",
				},
				invite: {
					title: "Invite by link",
					body: "Just share the game ID URL with your allies. One click and everyone lands in the same voice chat.",
				},
				lowLatency: {
					title: "Low latency",
					body: "A globally distributed network delivers low-latency calls from anywhere in the world.",
				},
			},
		},
		steps: {
			eyebrow: "How it works",
			heading: "Get started in 4 easy steps",
			items: {
				enter: {
					title: "Enter your summoner name & game ID",
					body: 'Hit "Join," then enter your summoner name and a game ID that works as a shared passphrase. Any ID is fine as long as your allies use the same one.',
				},
				connect: {
					title: "Connect to voice chat",
					body: 'Press "Join Game" to enable your mic and connect with everyone on the same game ID.',
				},
				share: {
					title: "Share the URL with allies",
					body: "Just send your browser URL to your allies. Whoever opens the link joins the same room.",
				},
				win: {
					title: "Strategize and win",
					body: "Coordinate with crystal-clear voice and take over the rift. Leave anytime with one click.",
				},
			},
		},
		finalCta: "Let's get started",
		footer: "© {{year}} Voice Party. Not affiliated with Riot Games.",
	},
	app: {
		subtitle: "Real-time voice chat",
	},
	join: {
		heading: "Voice Chat",
		summonerId: "Summoner ID",
		summonerIdPlaceholder: "Enter your name",
		gameId: "Game ID",
		gameIdPlaceholder: "Enter game ID to join",
		joinGame: "Join Game",
	},
	session: {
		label: "Session",
		connected: "Voice Connected",
		connecting: "Connecting",
		disconnected: "Connection lost",
		reconnecting: "Reconnecting",
		reconnectingHint: "Waiting for the network to come back. Hang tight.",
		reconnect: "Reconnect",
		participants: "Participants ({{n}}/5)",
		you: "(You)",
		status: {
			connecting: "Connecting",
			connected: "Connected",
			reconnecting: "Reconnecting",
			disconnected: "Disconnected",
		},
	},
	errors: {
		idsRequired: "Summoner name and game ID are required",
		joinFailed: "Failed to join session",
		voiceConnectionFailed:
			"Joined session but voice connection failed (check console/creds)",
		reconnectFailed: "Reconnect failed. Please try again.",
	},
	language: {
		label: "Language",
	},
};
