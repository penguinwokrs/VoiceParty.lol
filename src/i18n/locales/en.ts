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
		footer: "© {{year}} Voice Party.",
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
		share: "Copy link",
		shareOnX: "Share on X",
		linkCopied: "Link copied",
		shareText:
			"🎮 Jumping into VoiceParty.lol for some crystal-clear voice chat — come play with me! 👉",
		safetyNote:
			"🔒 Voice is never recorded. You can mute or report anyone to protect yourself.",
		noiseSuppression: "Noise suppression",
		noiseSuppressionOn: "Noise suppression: on",
		noiseSuppressionOff: "Noise suppression: off",
		volume: "{{name}} volume",
		mute: "Mute",
		unmute: "Unmute",
		muted: "Muted",
		muteName: "Mute {{name}}",
		unmuteName: "Unmute {{name}}",
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
	report: {
		action: "Report",
		title: "Reason for report",
		reportName: "Report {{name}}",
		submitted: "Reported and muted",
		reasons: {
			harassment: "Harassment",
			hate: "Hate / discrimination",
			spam: "Spam",
			inappropriate_name: "Inappropriate name",
			illegal: "Illegal / cheating",
			other: "Other",
		},
	},
	legal: {
		disclaimer:
			"VoiceParty.lol isn't endorsed by Riot Games and doesn't reflect the views or opinions of Riot Games or anyone officially involved in producing or managing Riot Games properties. Riot Games, and all associated properties are trademarks or registered trademarks of Riot Games, Inc.",
		updated: "Last updated: July 16, 2026",
		draftNote:
			"This document is a draft and will be finalized before publication.",
		nav: {
			home: "Home",
			privacy: "Privacy Policy",
			terms: "Terms of Service",
		},
		privacy: {
			title: "Privacy Policy",
			intro:
				'This policy describes how VoiceParty.lol (the "Service") handles personal information. It follows Japan\'s Act on the Protection of Personal Information (APPI), where the operator is based, and also accommodates users under the GDPR (EEA) and CCPA (California).',
			sections: [
				{
					heading: "1. Information we collect and why",
					body: "The Service handles the following:\n・Riot ID / summoner name: to identify and display you (entered by you, or obtained via future Riot Sign-On).\n・Profile icon: for display (public Data Dragon data).\n・IP address / country and region: for delivery and abuse prevention (via Cloudflare).\n・Session data: to manage voice rooms.\n・On-device storage (localStorage): for functional settings such as volume, mute, and noise suppression.",
				},
				{
					heading: "2. Handling of voice",
					body: "Voice is transmitted between participants in real time via WebRTC. The Service does not record or store voice.",
				},
				{
					heading: "3. Cookies and analytics",
					body: "The Service does not set tracking cookies of its own. Usage is measured with cookieless analytics, and product metrics are aggregated from hashed identifiers. localStorage is used only for functional purposes.",
				},
				{
					heading: "4. Advertising and affiliates",
					body: "To fund operation, the Service may display third-party advertising and third-party affiliate links. Where it does, it clearly labels such content as advertising (per Japan's Act against Unjustifiable Premiums and Misleading Representations / stealth-marketing rules). Third-party advertisers may collect information via cookies; such handling follows each provider's own privacy policy.",
				},
				{
					heading: "5. Disclosure and processors",
					body: "The Service entrusts information handling to the following providers to deliver its features:\n・Cloudflare, Inc. (hosting, delivery, analytics)\n・RealtimeKit / Cloudflare (voice infrastructure)\n・Riot Games, Inc. (Riot ID validation API)\n・Advertising / affiliate providers (if introduced)\nExcept as required by law, we do not provide personal information to third parties without consent.",
				},
				{
					heading: "6. International transfer",
					body: "As a result of the above, information may be processed on servers located outside Japan.",
				},
				{
					heading: "7. Retention",
					body: "Voice-session data expires automatically after a limited period (6 hours by default). Voice is not stored. Analytics are retained in hashed, aggregated form.",
				},
				{
					heading: "8. Your rights",
					body: "You may request disclosure, correction, deletion, or suspension of use of your personal information. EEA users may exercise their GDPR rights, and California users may opt out under the CCPA. Please use the contact below.",
				},
				{
					heading: "9. Minors",
					body: "You must be at least 13 years old to use the Service. See the Terms of Service for details.",
				},
				{
					heading: "10. Changes to this policy",
					body: "We may update this policy as needed. Material changes will be announced within the Service.",
				},
				{
					heading: "11. Contact",
					body: "For questions about the handling of personal information, please contact the operator of the Service (contact details will be provided at publication).",
				},
			],
		},
		terms: {
			title: "Terms of Service",
			intro:
				'These Terms of Service (the "Terms") govern your use of VoiceParty.lol (the "Service"). By using the Service, you agree to these Terms.',
			sections: [
				{
					heading: "1. Scope",
					body: "These Terms apply to all relations between the operator and users regarding use of the Service.",
				},
				{
					heading: "2. Eligibility and age",
					body: "You must be at least 13 years old to use the Service. Minors must obtain the consent of a guardian.",
				},
				{
					heading: "3. Identifiers",
					body: "You must enter your Riot ID / summoner name accurately and must not impersonate others. You are responsible for managing shared URLs (game IDs).",
				},
				{
					heading: "4. Prohibited conduct",
					body: "You must not:\n・Harass, threaten, or bully others\n・Engage in discriminatory or abusive speech or hate speech\n・Transmit illegal content or facilitate crime\n・Expose others' personal information (doxxing)\n・Impersonate others or send spam\n・Reverse-engineer, gain unauthorized access to, or disrupt the Service or its infrastructure\n・Infringe the rights of others or third parties",
				},
				{
					heading: "5. Voice calls and self-protection",
					body: "The Service does not record or store voice. You can protect yourself using per-participant mute, leaving, and switching rooms. You may report inappropriate users to the contact below.",
				},
				{
					heading: "6. Advertising and affiliates",
					body: "The Service is provided free of charge and funded by advertising and third-party affiliates. The Service clearly labels advertising and affiliate content as advertising. The Service is not responsible for the content or transactions of advertisers or linked destinations; any transaction is solely between you and the advertiser or destination.",
				},
				{
					heading: "7. Intellectual property and relationship with Riot Games",
					body: "The Service is a third-party application that uses the APIs and intellectual property of Riot Games, Inc. It is not affiliated with, or officially endorsed by, Riot Games. Riot Games and all associated properties are trademarks or registered trademarks of Riot Games, Inc.",
				},
				{
					heading: "8. Disclaimer",
					body: 'The Service is provided "as is" without warranty of availability, completeness, or fitness for a particular purpose.',
				},
				{
					heading: "9. Limitation of liability",
					body: "To the extent permitted by law, the operator is not liable for damages arising from use of, or inability to use, the Service.",
				},
				{
					heading: "10. Changes and interruption of the Service",
					body: "The operator may change, suspend, or terminate the Service without prior notice to users.",
				},
				{
					heading: "11. Changes to the Terms",
					body: "The operator may amend these Terms. Material changes will be announced within the Service. Continued use after changes constitutes acceptance.",
				},
				{
					heading: "12. Governing law and jurisdiction",
					body: "These Terms are governed by the laws of Japan. Any dispute regarding the Service shall be subject to the exclusive jurisdiction of the court having jurisdiction over the operator's location as the court of first instance.",
				},
				{
					heading: "13. Contact",
					body: "For questions about these Terms, please contact the operator of the Service (contact details will be provided at publication).",
				},
			],
		},
	},
};
