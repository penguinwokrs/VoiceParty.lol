export type Bindings = {
	VC_SESSIONS: KVNamespace;
	// Permanent report store. Bans stay in KV (they are transient, 24h).
	VC_DB: D1Database;
	RIOT_CLIENT_ID: string;
	RIOT_CLIENT_SECRET: string;
	RIOT_GAME_API_KEY: string;
	// Set to "false" to temporarily disable Riot API validation (e.g. while
	// awaiting RSO production approval). Any other value keeps validation on.
	RIOT_VALIDATION_ENABLED: string;
	REALTIME_ORG_ID: string;
	REALTIME_API_KEY: string;
	REALTIME_KIT_APP_ID: string;
	USE_MOCK_REALTIME: string;
	// Set to "false" to stop reports from issuing automatic bans (they are still
	// recorded, and the client still mutes locally). Any other value, including
	// unset, keeps the automatic suspension on.
	MODERATION_AUTO_BAN_ENABLED?: string;
};

/** One row of the permanent report store, as read by the auto-ban aggregator. */
export type ReportRecord = {
	reporter_riot_id: string;
	reason: string;
	created_at: number;
};

export type User = {
	summonerId: string;
	joinedAt: number;
	iconUrl?: string;
	/**
	 * Whether the Riot API actually confirmed this identity when they joined.
	 * False/absent means the name is self-asserted — either validation was off
	 * (RIOT_VALIDATION_ENABLED) or no API key was configured.
	 *
	 * Moderation reads this: being on a roster only proves a real, distinct
	 * person when joining required proving who you are. Absent that, one
	 * attacker can populate a roster with as many invented names as they like.
	 */
	validated?: boolean;
};

export type Session = {
	sessionId: string;
	meetingId?: string; // RealtimeKit Meeting ID
	users: User[];
	createdAt: number;
};
