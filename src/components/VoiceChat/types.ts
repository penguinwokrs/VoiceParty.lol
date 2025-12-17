export interface User {
	summonerId: string;
	gameName: string;
	tagLine: string;
	iconUrl: string;
}

export interface Session {
	sessionId: string;
	users: User[];
}

export interface JoinResponse {
	session: Session;
	realtime?: {
		appId: string;
		token: string;
	};
}

export interface Peer {
	id: string;
	peerId?: string;
	summonerId?: string;
	media?: {
		enableAudio?: () => void;
	};
	stream?: MediaStream;
	audioTrack?: MediaStreamTrack;
}
