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
		summonerId: "Riot ID",
		summonerIdPlaceholder: "Faker#KR1",
		summonerIdHelp:
			"Formerly your Summoner Name. It ends with a #tag — find it on your profile in the top right of the game client.",
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
		idsRequired: "Riot ID is required",
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
		updated: "Last updated: July 18, 2026",
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
					body: 'The Service handles the following:\n・Riot ID / summoner name: to identify and display you (entered by you, or obtained via future Riot Sign-On).\n・Profile icon: for display (public Data Dragon data).\n・IP address / country and region: for delivery and abuse prevention (via Cloudflare).\n・Session data: to manage voice rooms.\n・Report / ban data: to keep the Service safe, prevent abuse, moderate, and — when a measure is appealed — to look up the record it was based on and respond. The Riot IDs of both the reporting user and the reported user are recorded in the clear (the original string, not hashed) and stored with no expiry. The report reason, the session identifier, and the time of the report are stored alongside them. Note that the Service obtains Riot IDs by self-declaration and has no mechanism to confirm that an entered Riot ID belongs to the person entering it.\n・Reports citing "child safety" or "illegal activity" may contain special-category data, such as the fact that the reporting user or a third party suffered harm from a crime. The Service may collect such information without consent only where it is particularly necessary for the protection of the life, body, or property of a person, or for the sound development of children, and obtaining consent is difficult.\n・On-device storage (localStorage): for functional settings such as volume, mute, and noise suppression.',
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
					body: "The Service entrusts information handling to the following providers to deliver its features:\n・Cloudflare, Inc. (hosting, delivery, analytics)\n・RealtimeKit / Cloudflare (voice infrastructure)\nWhere the Service validates your Riot ID, it sends the information needed for validation to Riot Games, Inc. (Riot handles it under its own policy). Report data is not included in that transmission.\nThird-party advertising / affiliate providers act as independent controllers. Except as required by law, we do not provide personal information to third parties without consent.",
				},
				{
					heading: "6. International transfer",
					body: "As a result of the above, information may be processed outside Japan, primarily in the United States. For the data-protection regime of the destination country, refer to the resources published by Japan's Personal Information Protection Commission. Transfers rely on appropriate safeguards such as Standard Contractual Clauses (SCCs), including transfers from the EEA and the UK. Details are available via the contact below.",
				},
				{
					heading: "7. Retention",
					body: "Room-mapping and session data expire automatically after 6 hours by default, and ban records after 24 hours. Voice is not stored.\nReport data does not expire. The Service retains the Riot IDs of the reporting and reported users, the report reason, the session identifier, and the time of the report, with no time limit, for the following purposes:\n・To review the basis for a decision and respond when a measure is appealed.\n・For staff to review concentrations of reports against one user and other patterns of violations. Note that automated measures do not take into account reports older than 30 days.\n・To respond to inquiries from law-enforcement authorities, court orders, and other lawful requests.\n・To preserve records of reports involving child safety in case of later inquiry or investigation.\nIn other words, the record of who reported whom persists, with both Riot IDs in the clear, until the Service deletes it. See Section 11 for how deletion requests are handled.",
				},
				{
					heading: "8. Security measures",
					body: "The Service applies safeguards including encryption in transit, access controls, oversight of processors, and short automatic expiry (TTL) for session and similar data. These measures apply where information is handled abroad (primarily the United States).\nReport data is an exception: as described in Sections 1 and 7, Riot IDs are stored in the clear. Because neither hashing nor automatic expiry protects report data, the Service limits access to the database that stores it to the minimum personnel needed for their work and restricts data export. Even so, if that data were breached, the Riot IDs of the reporting and reported users would be directly readable by whoever obtained it.",
				},
				{
					heading: "9. Special provisions for report data",
					body: "The Service stores the Riot IDs of reporting and reported users in the clear, unhashed, with no time limit. This is for the following purposes:\n・When a ban or similar measure is appealed, to look up the report records the measure was based on and respond with reasons.\n・To preserve records of reports involving child safety in case of later inquiry or investigation.\n・To respond to inquiries from law-enforcement authorities and other lawful requests.\nA Riot ID is not a legal name, but it is information that persistently identifies a user. The record of who reported whom is retained, with both users' Riot IDs, for an indefinite period. As a result, the level of protection for report data is lower than it was when the data was hashed. Use of the report feature is subject to this handling.",
				},
				{
					heading: "10. Legal bases (GDPR)",
					body: "For users in the EEA and the UK, the legal bases for processing are:\n・Service provision (Riot ID, session): performance of a contract (GDPR Art. 6(1)(b)).\n・Abuse prevention and safety (IP, ban): legitimate interests (Art. 6(1)(f)).\n・Retention of report data: legitimate interests in keeping our users safe, in responding to appeals against measures, and in establishing, exercising, or defending legal claims (Art. 6(1)(f)).\n・Responding to lawful disclosure requests and law-enforcement inquiries: compliance with a legal obligation (Art. 6(1)(c)).\n・Advertising / measurement cookies: your consent (Art. 6(1)(a)).\nYou may object, on grounds relating to your particular situation, to processing based on legitimate interests (GDPR Art. 21(1)). Where you object, the Service will stop the processing unless it can demonstrate compelling legitimate grounds to continue.\nInformation about a reported user is obtained not from that user but from the reporting user. The categories of that information, the purposes of its use, its retention period, and users' rights are as set out in this policy (GDPR Art. 14). The Service does not disclose information identifying a reporting user to the reported user, because doing so would undermine the purposes of safety and abuse prevention (Art. 14(5)(b)).",
				},
				{
					heading: "11. Your rights",
					body: 'You may request access, correction, deletion, or suspension of use of your personal information. Users in the EEA and the UK have the rights of access, rectification, erasure, restriction of processing, data portability, objection to processing (including to direct marketing), and withdrawal of consent, and may lodge a complaint with their local supervisory authority. California users have the rights to know, delete, correct, and opt out of the "sale/sharing" of personal information, and the Service does not discriminate for exercising these rights. The request method, identity-verification method, fee (generally none), and response time follow the guidance provided by the contact point.\nReport data is handled as follows:\n・Where a reported user requests erasure or suspension of use, the Service assesses whether the request is well-founded against the requirements set by law, and complies without delay where it is. However, where the record remains necessary for responding to an appeal against a measure or otherwise for the establishment, exercise, or defense of legal claims, or where retention is required by law, the Service may continue to retain it to the extent necessary (Act on the Protection of Personal Information Art. 35; GDPR Art. 17(3)(e)). In that case we will give reasons for declining and explain how to lodge a complaint with a supervisory authority.\n・A request for erasure from a reporting user is handled in the same way. A reporting user\'s Riot ID may be retained to the extent necessary to substantiate a decision in response to an appeal by the reported user.\n・For deletion requests from California users, the Service may decline to the extent an exception set by law applies (including detecting security incidents and protecting against malicious, deceptive, fraudulent, or illegal activity).\nThe Service periodically reviews whether continued retention of report data is necessary and deletes report data it judges to be no longer needed for the purposes above.',
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
					body: "For questions about the handling of personal information, disclosure requests, and complaints, please contact the operator of the Service at voice.crew.contact@gmail.com. The operator's name and address are provided without delay upon request.",
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
					body: "You must enter your Riot ID / summoner name accurately and must not impersonate others. You are responsible for managing shared URLs (room IDs).\nIf you use the report feature, the Riot IDs of both you and the user you report, together with the other report information, are recorded and retained in accordance with the Privacy Policy. False reports and reports made to harass are prohibited conduct under Section 4. See Sections 1, 7, and 9 of the Privacy Policy for details.",
				},
				{
					heading: "4. Prohibited conduct",
					body: "You must not:\n・Harass, threaten, or bully others\n・Engage in discriminatory or abusive speech or hate speech\n・Transmit illegal content or facilitate crime\n・Sexually contact or exploit a minor, or otherwise endanger the safety of children\n・Expose others' personal information (doxxing)\n・Impersonate others or send spam\n・Submit false reports, or use the report feature to harass or for other improper purposes\n・Reverse-engineer, gain unauthorized access to, or disrupt the Service or its infrastructure\n・Infringe the rights of others",
				},
				{
					heading: "5. Voice calls and self-protection",
					body: "The Service does not record or store voice. You can protect yourself using per-participant mute, leaving, and switching rooms. You may report inappropriate users via the in-app report feature or the contact point. You may speak with strangers on the Service, so do not casually share personal information.",
				},
				{
					heading: "6. Operator measures",
					body: "If you breach these Terms (in particular Section 4), or if the operator reasonably determines a breach is suspected based on reports or otherwise, the operator may, without prior notice, mute you, remove you from a session, deny your connection for a period (ban), or take other necessary measures. The nature and duration of measures and the method of appeal are provided through the contact point in Section 18.\nRetention of the report records underlying such a decision is governed by the Privacy Policy. Nothing in this Section or the preceding paragraph limits the rights you have under data-protection law to request disclosure, correction, suspension of use, or the like.",
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
					body: "For questions about these Terms and appeals against measures, please contact the operator of the Service at voice.crew.contact@gmail.com. The operator's name and address are provided without delay upon request.",
				},
			],
		},
	},
};
