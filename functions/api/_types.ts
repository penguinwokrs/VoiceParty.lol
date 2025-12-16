export type Bindings = {
	VC_SESSIONS: KVNamespace;
	RIOT_CLIENT_ID: string;
	RIOT_CLIENT_SECRET: string;
	REALTIME_ORG_ID: string;
	REALTIME_API_KEY: string;
	REALTIME_KIT_APP_ID: string;
	USE_MOCK_REALTIME: string;
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
