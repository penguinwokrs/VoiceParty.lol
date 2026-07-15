export type Bindings = {
	VC_SESSIONS: KVNamespace;
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
	// Optional HMAC salt for pseudonymizing Summoner IDs in moderation/analytics
	// stores. Falls back to an app-default when unset.
	REPORT_SALT?: string;
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
