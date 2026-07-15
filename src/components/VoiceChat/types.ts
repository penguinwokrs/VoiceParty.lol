export type User = {
	summonerId: string;
	joinedAt: number;
	iconUrl?: string;
};

// Voice connection lifecycle for the local user (and, derived, the roster).
// - connecting:   initial join in progress
// - connected:    joined and healthy
// - reconnecting: socket/media dropped, the SDK (or we) are retrying
// - disconnected: reconnection gave up / left unexpectedly
export type ConnectionState =
	| "connecting"
	| "connected"
	| "reconnecting"
	| "disconnected";

export type Session = {
	sessionId: string;
	users: User[];
	createdAt: number;
};

export type JoinResponse = {
	session: Session;
	realtime?: {
		meetingId: string;
		token: string;
		appId?: string;
	};
};
