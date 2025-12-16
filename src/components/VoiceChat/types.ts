export type User = {
	userId: string;
	joinedAt: number;
	iconUrl?: string;
};

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
		appId: string;
	};
};
