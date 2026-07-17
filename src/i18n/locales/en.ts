import type { TranslationResources } from "./ja";

export const en: TranslationResources = {
	landing: {
		eyebrow: "Browser voice · No install",
		title: "VoiceCrew",
		headline: "The call before you commit.",
		lead: "Found a duo in LFG? Stacking five for the weekend? Send one link and hear them on voice — before anyone trades a Discord.",
		ctaStart: "Start a room",
		ctaHow: "How it works",
		trust: {
			noDownload: "No download",
			browser: "Works in the browser",
			muted: "Randoms stay muted",
		},
		panel: {
			ariaLabel:
				"The VoiceCrew in-call screen: a session with three teammates on voice, one speaking, plus mic, noise-suppression, and leave controls.",
		},
		why: {
			eyebrow: "The idea",
			heading:
				"Solo queue? Mute all is correct. The crew you chose? Different story.",
			body: "VoiceCrew doesn't fight mute culture — it lives on the other side of it. Nobody wants voice with four randoms. Everybody wants it with the people they picked.",
			cold: {
				tag: "/mute all",
				title: "The lobby of strangers",
				body: "No mic, no comms, no thanks. Silence is the correct setting for people you didn't choose.",
			},
			warm: {
				tag: "on the line",
				title: "The ones you picked",
				body: "Your duo. Your five-stack for the weekend. Send them a link and warm up your voice before it counts.",
			},
		},
		features: {
			eyebrow: "What it's for",
			heading: "One link. Two to five. Then decide.",
			items: {
				micCheck: {
					title: "A mic check, not a marriage",
					body: "Audition a duo or warm up a five-stack. If the vibe's off, you're out in thirty seconds. No account, no history.",
				},
				onlyYouPick: {
					title: "Only who you pick",
					body: "No matchmaking with strangers. Share the room link — only people who have it get on the line with you.",
				},
				beforeDiscord: {
					title: "The step before Discord",
					body: "Not a Discord replacement — the thing you do before you bother making a server for someone you met ten minutes ago.",
				},
			},
		},
		steps: {
			eyebrow: "How it works",
			heading: "From link to comms in under a minute.",
			items: {
				riotId: {
					title: "Drop your Riot ID",
					body: "Name#Tag, no download, straight in the browser.",
				},
				shareLink: {
					title: "Share the room link",
					body: "Paste it in LFG, a DM, or your stream. One tap to join.",
				},
				micCheck: {
					title: "Mic check",
					body: "Talk it out. Feel the vibe. See if the comms actually click.",
				},
				commit: {
					title: "Commit — or leave",
					body: "Add them on Discord, run it back, or bail clean. Your call.",
				},
			},
		},
		safety: {
			eyebrow: "Safety",
			heading: "Muted by default is a feature, not a bug.",
			body: "Every room ships with one-tap report and local mute, a 13+ age gate, and moderation built in. You choose who gets your voice — and you can take it back instantly.",
		},
		finalCta: {
			eyebrow: "Ready when you are",
			heading: "Get your crew on the line.",
			body: "No install. No sign-up wall. Just a link and a mic check — before you commit to anyone.",
			ctaStart: "Start a room",
			ctaHow: "See how it works",
		},
		footer: "© {{year}} VoiceCrew.",
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
		region: "Region",
		regionPlaceholder: "Select your region",
		regionFromLink:
			"Set by the invite link — other regions can't play together",
		joinGame: "Join Game",
		consent:
			"By pressing “Join Game”, you agree to the <terms>Terms of Service</terms> and <privacy>Privacy Policy</privacy>. You must be 13 or older to use the Service.",
		ageTitle: "Age check",
		ageBody:
			"You must be at least 13 years old to use the Service. Please enter the year you were born.",
		ageYearLabel: "Year of birth",
		ageConfirm: "Confirm and continue",
		ageTooYoung: "You must be at least 13 years old to use the Service.",
		ageInvalid: "Please enter a valid year.",
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
			"🎮 Jumping into VoiceCrew for some crystal-clear voice chat — come play with me! 👉",
		safetyNote:
			"🔒 Voice is never recorded. You may be talking with strangers — don't share personal information, and mute, report, or leave if you feel uncomfortable.",
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
			child_safety: "Child safety (sexual contact / exploitation)",
			illegal: "Illegal activity",
			cheating: "Cheating",
			spam: "Spam",
			inappropriate_name: "Inappropriate name",
			other: "Other",
		},
	},
	legal: {
		disclaimer:
			"VoiceCrew isn't endorsed by Riot Games and doesn't reflect the views or opinions of Riot Games or anyone officially involved in producing or managing Riot Games properties. Riot Games, and all associated properties are trademarks or registered trademarks of Riot Games, Inc.",
		updated: "Last updated: July 16, 2026",
		nav: {
			home: "Home",
			privacy: "Privacy Policy",
			terms: "Terms of Service",
		},
		privacy: {
			title: "Privacy Policy",
			intro:
				'This policy describes how VoiceCrew (the "Service") handles personal information. It follows Japan\'s Act on the Protection of Personal Information (APPI), where the operator is based, and also accommodates users under the GDPR (EEA) and CCPA (California).',
			sections: [
				{
					heading: "1. Information we collect and why",
					body: "The Service handles the following:\n・Riot ID / summoner name: to identify and display you (entered by you, or obtained via future Riot Sign-On).\n・Profile icon: for display (public Data Dragon data).\n・IP address / country and region: for delivery and abuse prevention (via Cloudflare).\n・Session data: to manage voice rooms.\n・Report / ban data: to keep the Service safe, prevent abuse, and moderate (reporter/reported identifiers are HMAC-hashed).\n・On-device storage (localStorage): for functional settings such as volume, mute, and noise suppression.",
				},
				{
					heading: "2. Handling of voice",
					body: "Voice is transmitted between participants in real time via WebRTC. The Service does not record or store voice.",
				},
				{
					heading: "3. Cookies and analytics",
					body: "The Service does not set tracking cookies of its own. Usage is measured with cookieless analytics (on the basis of legitimate interests), and product metrics are aggregated from hashed identifiers. localStorage is used only for functional purposes. If third-party advertising is introduced, users in the EEA and the UK will be asked for consent through a consent-management tool before any advertising or measurement cookies are set.",
				},
				{
					heading: "4. Advertising and affiliates",
					body: "To fund operation, the Service may display third-party advertising and third-party affiliate links. Advertising and affiliate content is clearly labeled as advertising (per Japan's Act against Unjustifiable Premiums and Misleading Representations / stealth-marketing rules). Third-party advertisers are not our processors; they may independently collect information via cookies, and such handling follows each provider's own privacy policy. Providing information for cross-context behavioral advertising may constitute a \"share\" under California law (CCPA/CPRA). California users may opt out, and the Service honors Global Privacy Control (GPC) signals (opt-out methods are provided via the contact below).",
				},
				{
					heading: "5. Disclosure and processors",
					body: "The Service entrusts information handling to the following providers to deliver its features:\n・Cloudflare, Inc. (hosting, delivery, analytics)\n・RealtimeKit / Cloudflare (voice infrastructure)\nWe also send the information needed to validate your Riot ID to Riot Games, Inc. (Riot handles it under its own policy). Third-party advertising / affiliate providers act as independent controllers. Except as required by law, we do not provide personal information to third parties without consent.",
				},
				{
					heading: "6. International transfer",
					body: "As a result of the above, information may be processed outside Japan, primarily in the United States. For the data-protection regime of the destination country, refer to the resources published by Japan's Personal Information Protection Commission. Transfers rely on appropriate safeguards such as Standard Contractual Clauses (SCCs), including transfers from the EEA and the UK. Details are available via the contact below.",
				},
				{
					heading: "7. Retention",
					body: "Room-mapping and session data expire automatically after 6 hours by default. Report data expires after 30 days and ban records after 24 hours. Voice is not stored. Analytics are retained in hashed, aggregated form.",
				},
				{
					heading: "8. Security measures",
					body: "The Service applies safeguards including HMAC hashing of identifiers, short automatic expiry (TTL), encryption in transit, access controls, and oversight of processors. These measures apply where information is handled abroad (primarily the United States).",
				},
				{
					heading: "9. About hashing",
					body: "The hashing used for moderation and analytics is a security measure and does not constitute the creation of anonymized or pseudonymized information under applicable law. Hashed data is still treated as personal information.",
				},
				{
					heading: "10. Legal bases (GDPR)",
					body: "For users in the EEA and the UK, the legal bases for processing are:\n・Service provision (Riot ID, session): performance of a contract (GDPR Art. 6(1)(b)).\n・Abuse prevention and safety (IP, report/ban): legitimate interests (Art. 6(1)(f)).\n・Advertising / measurement cookies: your consent (Art. 6(1)(a)).",
				},
				{
					heading: "11. Your rights",
					body: 'You may request access, correction, deletion, or suspension of use of your personal information. Users in the EEA and the UK have the rights of access, rectification, erasure, restriction of processing, data portability, objection to processing (including to direct marketing), and withdrawal of consent, and may lodge a complaint with their local supervisory authority. California users have the rights to know, delete, correct, and opt out of the "sale/sharing" of personal information, and the Service does not discriminate for exercising these rights. The request method, identity-verification method, fee (generally none), and response time follow the guidance provided by the contact point.',
				},
				{
					heading: "12. Minors",
					body: "You must be at least 13 years old to use the Service. For users in the EEA, the digital-consent age set by the country of residence (13–16) applies; below that age, a guardian's consent is required. Minors must obtain the prior consent of a parent or legal guardian.",
				},
				{
					heading: "13. Changes to this policy",
					body: "We may update this policy as needed. Material changes will be announced within the Service with an effective date. If we change the purpose of use beyond a reasonably related scope, we will obtain your consent again.",
				},
				{
					heading: "14. Contact & requests",
					body: "For questions about the handling of personal information, disclosure requests, and complaints, please contact the operator of the Service. Operator information and contact details will be provided at publication.",
				},
			],
		},
		terms: {
			title: "Terms of Service",
			intro:
				'These Terms of Service (the "Terms") govern your use of VoiceCrew (the "Service"). By using the Service, you agree to these Terms.',
			sections: [
				{
					heading: "1. Scope and acceptance",
					body: "These Terms apply to all relations between the operator and users regarding use of the Service. By accessing or using the Service (including the act of joining), you are deemed to accept these Terms and the Privacy Policy.",
				},
				{
					heading: "2. Eligibility and age",
					body: "You must be at least 13 years old to use the Service. If you are a minor, you must obtain the prior consent of a parent or legal guardian to accept these Terms and use the Service, and by using it you represent that such consent has been obtained. For users in the EEA, the digital-consent age of the country of residence applies.",
				},
				{
					heading: "3. Identifiers",
					body: "You must enter your Riot ID / summoner name accurately and must not impersonate others. You are responsible for managing shared URLs (game IDs).",
				},
				{
					heading: "4. Prohibited conduct",
					body: "You must not:\n・Harass, threaten, or bully others\n・Engage in discriminatory or abusive speech or hate speech\n・Transmit illegal content or facilitate crime\n・Sexually contact or exploit a minor, or otherwise endanger the safety of children\n・Expose others' personal information (doxxing)\n・Impersonate others or send spam\n・Reverse-engineer, gain unauthorized access to, or disrupt the Service or its infrastructure\n・Infringe the rights of others",
				},
				{
					heading: "5. Voice calls and self-protection",
					body: "The Service does not record or store voice. You can protect yourself using per-participant mute, leaving, and switching rooms. You may report inappropriate users via the in-app report feature or the contact point. You may speak with strangers on the Service, so do not casually share personal information.",
				},
				{
					heading: "6. Operator measures",
					body: "If you breach these Terms (in particular Section 4), or if the operator reasonably determines a breach is suspected based on reports or otherwise, the operator may, without prior notice, mute you, remove you from a session, deny your connection for a period (ban), or take other necessary measures. The nature and duration of measures and the method of appeal follow the moderation policy.",
				},
				{
					heading: "7. Advertising and affiliates",
					body: "The Service is provided free of charge and funded by advertising and third-party affiliates. The Service clearly labels advertising and affiliate content as advertising. The Service is not responsible for the content or transactions of advertisers or linked destinations; any transaction is solely between you and the advertiser or destination.",
				},
				{
					heading: "8. Intellectual property and relationship with Riot Games",
					body: "The Service is a third-party application that uses the APIs and intellectual property of Riot Games, Inc. It is not affiliated with, or officially endorsed by, Riot Games. Riot Games and all associated properties are trademarks or registered trademarks of Riot Games, Inc.",
				},
				{
					heading: "9. Disclaimer",
					body: 'The Service is provided "as is" without warranty of availability, completeness, or fitness for a particular purpose.',
				},
				{
					heading: "10. Limitation of liability",
					body: "1. Where the operator is liable to you for damages in connection with the Service, for damages caused by the operator's slight negligence, liability is limited to the ordinary and direct damages actually incurred by you and excludes lost profits, special damages, and indirect damages.\n2. The preceding paragraph does not apply to damages caused by the operator's willful misconduct or gross negligence, for which the operator is liable in accordance with law.\n3. The Service is provided free of charge, and this section is a reasonable allocation of responsibility premised on that gratuitousness.",
				},
				{
					heading: "11. User content and no monitoring",
					body: "Voice is transmitted between participants in real time, and the operator has no obligation to constantly monitor its content. Responsibility for speech and other user content rests with the relevant user.",
				},
				{
					heading: "12. Indemnification",
					body: "If you breach these Terms or cause damage to the operator or a third party in connection with your use of the Service, you shall compensate for such damage.",
				},
				{
					heading: "13. Changes and interruption of the Service",
					body: "The operator may change, suspend, or terminate the Service without prior notice to users.",
				},
				{
					heading: "14. Changes to the Terms",
					body: "The operator may amend these Terms where the amendment conforms to the general interests of users, or where it does not conflict with the purpose of the Service and is reasonable in light of the necessity and appropriateness of the amendment and other circumstances, in accordance with the rules on standard-form contracts under the Civil Code. In such cases, the operator will announce the content and effective date of the amendment within the Service a reasonable period before the effective date.",
				},
				{
					heading: "15. Severability and assignment",
					body: "If any part of these Terms is held invalid or unenforceable, the remaining parts remain in effect. You may not assign your position or rights and obligations under these Terms to a third party without the operator's prior written consent.",
				},
				{
					heading: "16. Governing law and jurisdiction",
					body: "These Terms are governed by the laws of Japan. In addition to the courts with statutory jurisdiction, the district or summary court having jurisdiction over the operator's location shall be a court of agreed jurisdiction of first instance for disputes regarding the Service.",
				},
				{
					heading: "17. Governing language",
					body: "These Terms are provided in multiple languages; in the event of any discrepancy between language versions, the Japanese version prevails.",
				},
				{
					heading: "18. Contact & appeals",
					body: "For questions about these Terms and appeals against measures, please contact the operator of the Service. Operator information and contact details will be provided at publication.",
				},
			],
		},
	},
};
