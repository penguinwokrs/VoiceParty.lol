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
	MODERATION_AUTO_BAN_ENABLED: string;
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
};

export type Session = {
	sessionId: string;
	meetingId?: string; // RealtimeKit Meeting ID
	users: User[];
	createdAt: number;
};
