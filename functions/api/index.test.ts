import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { REPORT_RATE_LIMIT } from "./_lib/rate-limit";
import { app } from "./[[route]]";

// Mock environment variables
const env = {
	RIOT_CLIENT_ID: "test-client-id",
	RIOT_CLIENT_SECRET: "test-client-secret",
	REALTIME_ORG_ID: "test-org",
	REALTIME_API_KEY: "test-key",
	REALTIME_KIT_APP_ID: "test-app",
	// biome-ignore lint/suspicious/noExplicitAny: Mocking KV
	VC_SESSIONS: {} as any, // Mock KV
};

describe("Worker Auth", () => {
	it("GET /auth/login redirects to Riot", async () => {
		const res = await app.request("/api/auth/login", {}, env);
		expect(res.status).toBe(302);
		expect(res.headers.get("Location")).toContain(
			"https://auth.riotgames.com/authorize",
		);
		expect(res.headers.get("Location")).toContain("client_id=test-client-id");
	});

	it("GET /auth/callback exchanges code for token", async () => {
		// Mock fetch for token endpoint
		const originalFetch = global.fetch;
		global.fetch = vi.fn().mockResolvedValue({
			ok: true,
			json: async () => ({
				access_token: "mock-token",
				id_token: "mock-id-token",
			}),
		});

		try {
			const res = await app.request(
				"/api/auth/callback?code=mock-code",
				{},
				env,
			);

			expect(res.status).toBe(200);
			const body = await res.json();
			expect(body).toEqual({
				access_token: "mock-token",
				id_token: "mock-id-token",
			});

			expect(global.fetch).toHaveBeenCalledWith(
				"https://auth.riotgames.com/token",
				expect.objectContaining({
					method: "POST",
					body: expect.any(URLSearchParams),
				}),
			);
		} finally {
			global.fetch = originalFetch;
		}
	});
});

describe("Riot ID Login (Personal Key)", () => {
	const loginEnv = {
		...env,
		RIOT_GAME_API_KEY: "test-riot-key",
	};

	const originalFetch = global.fetch;

	beforeEach(() => {
		global.fetch = vi.fn((url: string | URL | Request) => {
			const urlStr = url.toString();
			if (urlStr.includes("/riot/account/v1/accounts/by-riot-id/")) {
				if (urlStr.includes("invalid")) {
					return Promise.resolve({
						status: 404,
						ok: false,
						statusText: "Not Found",
					});
				}
				return Promise.resolve({
					ok: true,
					json: async () => ({
						puuid: "mock-puuid",
						gameName: "MockUser",
						tagLine: "JP1",
					}),
				});
			}
			if (urlStr.includes("/lol/summoner/v4/summoners/by-puuid/")) {
				return Promise.resolve({
					ok: true,
					json: async () => ({ profileIconId: 1234 }),
				});
			}
			if (urlStr.includes("/api/versions.json")) {
				return Promise.resolve({
					ok: true,
					json: async () => ["16.13.1", "16.12.1"],
				});
			}
			return Promise.reject(new Error(`Unknown URL: ${urlStr}`));
			// biome-ignore lint/suspicious/noExplicitAny: Mocking fetch requires any cast
		}) as any;
	});

	afterEach(() => {
		global.fetch = originalFetch;
		vi.clearAllMocks();
	});

	const post = (body: unknown, e: typeof env = loginEnv) =>
		app.request(
			"/api/auth/riot-id",
			{
				method: "POST",
				body: JSON.stringify(body),
				headers: { "Content-Type": "application/json" },
			},
			e,
		);

	it("returns resolved identity for a valid Riot ID", async () => {
		// `region` routes the SUMMONER-V4 lookup; the client always sends it.
		const res = await post({ riotId: "MockUser#JP1", region: "jp1" });
		expect(res.status).toBe(200);
		// biome-ignore lint/suspicious/noExplicitAny: Test assertion
		const body = (await res.json()) as any;
		expect(body).toMatchObject({
			puuid: "mock-puuid",
			gameName: "MockUser",
			tagLine: "JP1",
			riotId: "MockUser#JP1",
		});
		expect(body.iconUrl).toContain("/profileicon/1234.png");
		// Uses the latest Data Dragon version from versions.json, not a stale hardcoded one
		expect(body.iconUrl).toContain("/cdn/16.13.1/");
	});

	it("returns 400 when riotId is missing", async () => {
		const res = await post({});
		expect(res.status).toBe(400);
		expect(await res.text()).toContain("riotId is required");
	});

	it("returns 400 when riotId is not in Name#Tag format", async () => {
		const res = await post({ riotId: "NoTagHere" });
		expect(res.status).toBe(400);
		expect(await res.text()).toContain("Name#Tag");
	});

	it("returns 404 when the Riot ID does not exist", async () => {
		const res = await post({ riotId: "invalid#tag" });
		expect(res.status).toBe(404);
		expect(await res.text()).toContain("Riot ID not found");
	});

	it("returns 503 when the Riot API key is not configured", async () => {
		const res = await post({ riotId: "MockUser#JP1" }, env);
		expect(res.status).toBe(503);
		expect(await res.text()).toContain("Missing Riot API Key");
	});

	it("skips the Riot API and echoes the ID when validation is disabled", async () => {
		const disabledEnv = { ...loginEnv, RIOT_VALIDATION_ENABLED: "false" };
		const res = await post({ riotId: "Anyone#XYZ" }, disabledEnv);
		expect(res.status).toBe(200);
		// biome-ignore lint/suspicious/noExplicitAny: Test assertion
		const body = (await res.json()) as any;
		expect(body).toMatchObject({
			puuid: null,
			gameName: "Anyone",
			tagLine: "XYZ",
			riotId: "Anyone#XYZ",
			validated: false,
		});
		// No Riot API call should be made when validation is disabled
		expect(global.fetch).not.toHaveBeenCalled();
	});
});

describe("Session Management", () => {
	// biome-ignore lint/suspicious/noExplicitAny: Mocking KV
	const mockKV: any = {
		put: vi.fn(),
		get: vi.fn(),
	};
	// DEFAULT: Mock Mode is TRUE (as per user request)
	const testEnv = {
		RIOT_CLIENT_ID: "test",
		RIOT_CLIENT_SECRET: "test",
		RIOT_GAME_API_KEY: "test-riot-key", // Enable validation
		REALTIME_ORG_ID: "test-org",
		REALTIME_API_KEY: "test-key",
		REALTIME_KIT_APP_ID: "test-app",
		VC_SESSIONS: mockKV,
		USE_MOCK_REALTIME: "true",
	};

	const originalFetch = global.fetch;

	beforeEach(() => {
		global.fetch = vi.fn((url: string | URL | Request) => {
			const urlStr = url.toString();
			if (urlStr.includes("/meetings") && !urlStr.includes("participants")) {
				return Promise.resolve({
					ok: true,
					json: async () => ({
						success: true,
						data: { id: "mock-meeting-id" },
					}),
				});
			}
			if (urlStr.includes("/participants")) {
				return Promise.resolve({
					ok: true,
					json: async () => ({
						success: true,
						data: { token: "mock-rt-token" },
					}),
				});
			}
			// Mock Riot Account API
			if (urlStr.includes("/riot/account/v1/accounts/by-riot-id/")) {
				if (urlStr.includes("invalid")) {
					return Promise.resolve({
						status: 404,
						ok: false,
						statusText: "Not Found",
					});
				}
				return Promise.resolve({
					ok: true,
					json: async () => ({
						puuid: "mock-puuid",
						gameName: "MockUser",
						tagLine: "JP1",
					}),
				});
			}
			// Mock Riot Summoner API
			if (urlStr.includes("/lol/summoner/v4/summoners/by-puuid/")) {
				return Promise.resolve({
					ok: true,
					json: async () => ({
						profileIconId: 1234,
					}),
				});
			}
			// Mock Data Dragon versions
			if (urlStr.includes("/api/versions.json")) {
				return Promise.resolve({
					ok: true,
					json: async () => ["16.13.1", "16.12.1"],
				});
			}

			return Promise.reject(new Error(`Unknown URL: ${urlStr}`));
			// biome-ignore lint/suspicious/noExplicitAny: Mocking fetch requires any cast
		}) as any;
	});

	afterEach(() => {
		global.fetch = originalFetch;
		vi.clearAllMocks();
	});

	it("POST /sessions creates a new session (Mock Mode)", async () => {
		const res = await app.request("/api/sessions", { method: "POST" }, testEnv);
		expect(res.status).toBe(200);
		// biome-ignore lint/suspicious/noExplicitAny: Test assertion
		const body = (await res.json()) as any;
		expect(body.sessionId).toBeDefined();
		expect(body.meetingId).toBe("mock-meeting-id");
		expect(body.users).toEqual([]);
		// ... existing assertions ...
	});

	// ... existing tests ...

	it("POST /sessions/:id/join accepts any Summoner ID when validation is disabled", async () => {
		const disabledEnv = { ...testEnv, RIOT_VALIDATION_ENABLED: "false" };
		const sessionId = "test-session-disabled";
		mockKV.get
			.mockResolvedValueOnce(null) // ban check → not banned
			.mockResolvedValueOnce("mock-meeting-id")
			.mockResolvedValueOnce(
				JSON.stringify({
					sessionId,
					meetingId: "mock-meeting-id",
					users: [],
					createdAt: Date.now(),
				}),
			);

		const res = await app.request(
			`/api/sessions/${sessionId}/join`,
			{
				method: "POST",
				// "invalid#tag" would 404 with validation on; here it must succeed
				body: JSON.stringify({ summonerId: "invalid#tag" }),
				headers: { "Content-Type": "application/json" },
			},
			disabledEnv,
		);

		expect(res.status).toBe(200);
		// biome-ignore lint/suspicious/noExplicitAny: Test assertion
		const body = (await res.json()) as any;
		expect(body.session.users).toHaveLength(1);
		expect(body.session.users[0].summonerId).toBe("invalid#tag");
	});

	it("POST /sessions/:id/join rejects invalid Summoner ID", async () => {
		const sessionId = "test-session-invalid";
		mockKV.get.mockResolvedValue(null); // No mapping

		const res = await app.request(
			`/api/sessions/${sessionId}/join`,
			{
				method: "POST",
				body: JSON.stringify({ summonerId: "invalid#tag" }),
				headers: { "Content-Type": "application/json" },
			},
			testEnv,
		);

		expect(res.status).toBe(404);
		expect(await res.text()).toContain("Summoner not found");
	});

	it("POST /sessions/:id/join adds user with Icon URL (Mock Mode)", async () => {
		const sessionId = "test-session";
		const meetingId = "mock-meeting-id";
		const sessionData = {
			sessionId,
			meetingId,
			users: [],
			createdAt: Date.now(),
		};

		// Mock KV: First call gets mapping (game:...), second call gets session (session:...)
		mockKV.get
			.mockResolvedValueOnce(null) // ban check → not banned
			.mockResolvedValueOnce("mock-meeting-id") // Mapping found
			.mockResolvedValueOnce(JSON.stringify(sessionData)); // Session found

		const res = await app.request(
			`/api/sessions/${sessionId}/join`,
			{
				method: "POST",
				body: JSON.stringify({
					summonerId: "user-1#JP1",
					region: "jp1",
					// No iconUrl provided, should fetch
				}),
				headers: { "Content-Type": "application/json" },
			},
			testEnv,
		);

		expect(res.status).toBe(200);
		// biome-ignore lint/suspicious/noExplicitAny: Test assertion
		const body = (await res.json()) as any;
		expect(body.session.users).toHaveLength(1);
		expect(body.session.users[0].iconUrl).toContain("/profileicon/1234.png");
		expect(body.realtime.token).toBe("mock-token");
	});

	// Dedicated block for INTEGRATION logic check
	describe("RealtimeKit Integration Logic (Mock=False)", () => {
		const integrationEnv = { ...testEnv, USE_MOCK_REALTIME: "false" };

		it("should attempt to call RealtimeKit API when creating session", async () => {
			const res = await app.request(
				"/api/sessions",
				{ method: "POST" },
				integrationEnv,
			);
			expect(res.status).toBe(200);
			// Fetch SHOULD be called with specific checks
			expect(global.fetch).toHaveBeenCalledWith(
				expect.stringContaining("/meetings"),
				expect.objectContaining({
					method: "POST",
					body: expect.stringMatching(/"title":".+"/), // Verify title is present
				}),
			);
		});

		it("should attempt to call RealtimeKit API when joining", async () => {
			const sessionId = "integration-session";
			// Use a real (non-mock) meeting ID so the join resolves the existing
			// session (and reads all three KV gets) instead of discarding a mock ID.
			const meetingId = "rk-existing-meeting";
			const sessionData = {
				sessionId,
				meetingId,
				users: [],
				createdAt: Date.now(),
			};
			mockKV.get
				.mockResolvedValueOnce(null) // ban check → not banned
				.mockResolvedValueOnce(meetingId)
				.mockResolvedValueOnce(JSON.stringify(sessionData));

			const res = await app.request(
				`/api/sessions/${sessionId}/join`,
				{
					method: "POST",
					body: JSON.stringify({ summonerId: "int-user#JP1" }),
					headers: { "Content-Type": "application/json" },
				},
				integrationEnv,
			);
			expect(res.status).toBe(200);
			expect(global.fetch).toHaveBeenCalledWith(
				expect.stringContaining("/participants"),
				expect.objectContaining({
					method: "POST",
					body: expect.stringContaining('"name":"int-user#JP1"'),
				}),
			);
		});

		it("should attempt to create RealtimeKit meeting with Title when joining non-existent session", async () => {
			const sessionId = "new-integration-session";
			// Mock KV: Return null to simulate non-existent session
			mockKV.get.mockResolvedValue(null);

			const res = await app.request(
				`/api/sessions/${sessionId}/join`,
				{
					method: "POST",
					body: JSON.stringify({ summonerId: "int-user-2#JP1" }),
					headers: { "Content-Type": "application/json" },
				},
				integrationEnv,
			);

			expect(res.status).toBe(200);

			// Verify Meeting Creation with Title
			expect(global.fetch).toHaveBeenCalledWith(
				expect.stringContaining("/meetings"),
				expect.objectContaining({
					method: "POST",
					body: expect.stringContaining(`"title":"${sessionId}"`),
				}),
			);

			// Verify Participant Addition
			expect(global.fetch).toHaveBeenCalledWith(
				expect.stringContaining("/participants"),
				expect.anything(),
			);
		});
	});
});

// Capacity is decided by who is actually CONNECTED (RealtimeKit's live
// "active-session"), not the append-only KV `users` list. These tests pin that
// behavior, including the graceful fallback when the live count is unavailable.
describe("Capacity via live presence (RealtimeKit source of truth)", () => {
	// biome-ignore lint/suspicious/noExplicitAny: Mocking KV
	const mockKV: any = { put: vi.fn(), get: vi.fn() };
	const REAL_MEETING = "rk-meeting-1";
	const liveEnv = {
		RIOT_CLIENT_ID: "test",
		RIOT_CLIENT_SECRET: "test",
		REALTIME_ORG_ID: "test-org",
		REALTIME_API_KEY: "test-key",
		REALTIME_KIT_APP_ID: "test-app",
		VC_SESSIONS: mockKV,
		USE_MOCK_REALTIME: "false",
		// Skip Riot validation so fetch only needs to serve RealtimeKit endpoints.
		RIOT_VALIDATION_ENABLED: "false",
	};

	const originalFetch = global.fetch;
	afterEach(() => {
		global.fetch = originalFetch;
		vi.clearAllMocks();
	});

	// Point the join at an existing real meeting with an empty KV roster, so the
	// decision hinges entirely on the live active-session count.
	const primeExistingMeeting = () => {
		mockKV.get
			.mockResolvedValueOnce(null) // ban check → not banned
			.mockResolvedValueOnce(REAL_MEETING) // game:{id} -> meetingId
			.mockResolvedValueOnce(
				JSON.stringify({
					sessionId: "room-x",
					meetingId: REAL_MEETING,
					users: [],
					createdAt: 0,
				}),
			);
	};

	const join = (summonerId: string) =>
		app.request(
			"/api/sessions/room-x/join",
			{
				method: "POST",
				body: JSON.stringify({ summonerId }),
				headers: { "Content-Type": "application/json" },
			},
			liveEnv,
		);

	// biome-ignore lint/suspicious/noExplicitAny: fetch mock
	const mockRealtime = (activeSession: (url: string) => any) => {
		global.fetch = vi.fn((url: string | URL | Request) => {
			const u = url.toString();
			if (u.includes("/active-session")) return activeSession(u);
			if (u.includes("/participants")) {
				return Promise.resolve({
					ok: true,
					json: async () => ({ success: true, data: { token: "rt-token" } }),
				});
			}
			return Promise.reject(new Error(`Unknown URL: ${u}`));
			// biome-ignore lint/suspicious/noExplicitAny: cast
		}) as any;
	};

	it("rejects a new user when 5 are already connected (KV roster is empty)", async () => {
		primeExistingMeeting();
		mockRealtime(() =>
			Promise.resolve({
				ok: true,
				json: async () => ({
					success: true,
					data: {
						participants: Array.from({ length: 5 }, (_, i) => ({
							id: `p${i}`,
						})),
					},
				}),
			}),
		);

		const res = await join("sixth#JP1");
		expect(res.status).toBe(403);
		expect(await res.text()).toContain("full");
	});

	it("admits a new user when no one is connected (active-session 404)", async () => {
		primeExistingMeeting();
		mockRealtime(() =>
			Promise.resolve({ ok: false, status: 404, statusText: "Not Found" }),
		);

		const res = await join("first#JP1");
		expect(res.status).toBe(200);
		// biome-ignore lint/suspicious/noExplicitAny: assertion
		const body = (await res.json()) as any;
		expect(body.session.users).toHaveLength(1);
	});

	it("does not count participants who already left", async () => {
		primeExistingMeeting();
		mockRealtime(() =>
			Promise.resolve({
				ok: true,
				json: async () => ({
					success: true,
					data: {
						participants: [
							{ id: "a" },
							{ id: "b", left_at: "2026-01-01T00:00:00Z" },
							{ id: "c", status: "LEFT" },
						],
					},
				}),
			}),
		);

		// Only 1 of the 3 is still connected, so a join is allowed.
		const res = await join("joiner#JP1");
		expect(res.status).toBe(200);
	});

	it("refreshes the TTL on both keys on every join, incl. an existing-user rejoin", async () => {
		// Existing participant rejoins: the roster doesn't change, but BOTH the
		// game: mapping and session: entry must be re-written with the TTL so an
		// active room never expires.
		mockKV.get
			.mockResolvedValueOnce(null) // ban check → not banned
			.mockResolvedValueOnce(REAL_MEETING)
			.mockResolvedValueOnce(
				JSON.stringify({
					sessionId: "room-x",
					meetingId: REAL_MEETING,
					users: [{ summonerId: "already#JP1", joinedAt: 0 }],
					createdAt: 0,
				}),
			);
		mockRealtime(() =>
			Promise.resolve({ ok: false, status: 404, statusText: "Not Found" }),
		);

		const res = await join("already#JP1");
		expect(res.status).toBe(200);

		// biome-ignore lint/suspicious/noExplicitAny: mock call tuples
		const puts = mockKV.put.mock.calls as any[];
		const keys = puts.map((call) => call[0]);
		expect(keys).toContain("game:room-x");
		expect(keys).toContain(`session:${REAL_MEETING}`);
		// Every write carries the 6h TTL.
		for (const call of puts) {
			expect(call[2]).toEqual({ expirationTtl: 6 * 60 * 60 });
		}
	});

	it("falls back to the KV roster when the live count is unavailable", async () => {
		// KV roster already has 5 users; live lookup errors (500) -> fall back to KV.
		mockKV.get
			.mockResolvedValueOnce(null) // ban check → not banned
			.mockResolvedValueOnce(REAL_MEETING)
			.mockResolvedValueOnce(
				JSON.stringify({
					sessionId: "room-x",
					meetingId: REAL_MEETING,
					users: Array.from({ length: 5 }, (_, i) => ({
						summonerId: `u${i}#JP1`,
						joinedAt: 0,
					})),
					createdAt: 0,
				}),
			);
		mockRealtime(() =>
			Promise.resolve({ ok: false, status: 500, statusText: "Server Error" }),
		);

		const res = await join("sixth#JP1");
		expect(res.status).toBe(403);
	});
});

// The funnel numbers are what gate the M-sized bets, so the events have to be
// emitted from the real request paths — not from a beacon a stranger can spam.
describe("Funnel analytics", () => {
	// biome-ignore lint/suspicious/noExplicitAny: Mocking KV
	const mockKV: any = { get: vi.fn(), put: vi.fn() };

	// Captures the args bound to each funnel_stats UPSERT. Column order matches
	// the INSERT in analytics.ts: day, event, src, ref, lang, country, visitor,
	// detail.
	let funnelRuns: unknown[][] = [];
	const mockDB = {
		prepare: (sql: string) => ({
			bind: (...args: unknown[]) => ({
				run: async () => {
					if (sql.includes("funnel_stats")) funnelRuns.push(args);
					return { success: true };
				},
			}),
		}),
	};
	const analyticsEnv = {
		RIOT_CLIENT_ID: "t",
		RIOT_CLIENT_SECRET: "t",
		REALTIME_ORG_ID: "o",
		REALTIME_API_KEY: "k",
		REALTIME_KIT_APP_ID: "a",
		VC_SESSIONS: mockKV,
		// biome-ignore lint/suspicious/noExplicitAny: minimal D1 stand-in
		VC_DB: mockDB as any,
		USE_MOCK_REALTIME: "true",
		RIOT_VALIDATION_ENABLED: "false",
	};

	beforeEach(() => {
		funnelRuns = [];
		mockKV.get.mockResolvedValue(null);
	});
	afterEach(() => vi.clearAllMocks());

	// The last funnel row, as a labelled object (drops the leading day column,
	// which is time-dependent and covered in the analytics unit tests).
	const lastFunnel = () => {
		const a = funnelRuns.at(-1) ?? [];
		return {
			event: a[1],
			src: a[2],
			ref: a[3],
			lang: a[4],
			country: a[5],
			visitor: a[6],
			detail: a[7],
		};
	};

	it("records a join with its channel, and flags it as a room the joiner minted", async () => {
		const res = await app.request(
			"/api/sessions/room-new/join",
			{
				method: "POST",
				body: JSON.stringify({
					summonerId: "u#JP1",
					src: "line",
					ref: "streamer_01",
					lang: "ja",
				}),
				headers: { "Content-Type": "application/json", "CF-IPCountry": "JP" },
			},
			analyticsEnv,
		);
		expect(res.status).toBe(200);

		expect(lastFunnel()).toEqual({
			event: "joined",
			src: "line",
			ref: "streamer_01",
			lang: "ja",
			country: "JP",
			visitor: "human",
			detail: "new",
		});
	});

	it("distinguishes following someone's invite from minting a room", async () => {
		mockKV.get.mockImplementation((key: string) =>
			Promise.resolve(
				key === "game:room-live"
					? "mock-meeting-live"
					: key === "session:mock-meeting-live"
						? JSON.stringify({
								sessionId: "room-live",
								meetingId: "mock-meeting-live",
								users: [],
								createdAt: 0,
							})
						: null,
			),
		);

		await app.request(
			"/api/sessions/room-live/join",
			{
				method: "POST",
				body: JSON.stringify({ summonerId: "u#JP1", src: "copy", lang: "ja" }),
				headers: { "Content-Type": "application/json" },
			},
			analyticsEnv,
		);

		expect(lastFunnel().detail).toBe("existing");
	});

	// A room whose stale mock meeting has to be recreated is still a room
	// somebody shared. Deriving "new" from the post-reset meetingId counted it
	// as freshly minted, inflating the host-conversion number this event exists
	// to measure.
	it("counts a room whose meeting had to be recreated as existing, not new", async () => {
		mockKV.get.mockImplementation((key: string) =>
			// The mapping is there, but points at a mock meeting while we are in
			// real mode — the join path discards the ID and makes a new meeting.
			Promise.resolve(key === "game:room-stale" ? "mock-meeting-stale" : null),
		);

		await app.request(
			"/api/sessions/room-stale/join",
			{
				method: "POST",
				body: JSON.stringify({ summonerId: "u#JP1", src: "copy", lang: "ja" }),
				headers: { "Content-Type": "application/json" },
			},
			{ ...analyticsEnv, USE_MOCK_REALTIME: "false" },
		);

		expect(lastFunnel().detail).toBe("existing");
	});

	// An unbounded ?src= would let anyone inflate row cardinality by editing a
	// shared link, so unknown channels collapse rather than pass through.
	it("collapses an unknown channel and drops a malformed partner tag", async () => {
		await app.request(
			"/api/sessions/room-odd/join",
			{
				method: "POST",
				body: JSON.stringify({
					summonerId: "u#JP1",
					src: "made-up-channel",
					ref: "not a valid ref",
					lang: "kl",
				}),
				headers: { "Content-Type": "application/json" },
			},
			analyticsEnv,
		);

		const f = lastFunnel();
		expect([f.event, f.src, f.ref, f.lang]).toEqual([
			"joined",
			"other",
			"",
			"other",
		]);
	});

	it("still creates a session when the D1 binding is absent", async () => {
		const { VC_DB, ...withoutDb } = analyticsEnv;
		const res = await app.request(
			"/api/sessions",
			{ method: "POST" },
			withoutDb,
		);
		expect(res.status).toBe(200);
		expect(funnelRuns).toHaveLength(0);
	});
});

// Phase 1: report persists both Riot IDs in the clear, permanently, and
// (client-side) mutes the reported user. Phase 2/3: distinct reporters accrue
// into a temporary auto-ban that blocks the reported user's next join.
describe("Reports & auto-ban (moderation)", () => {
	// biome-ignore lint/suspicious/noExplicitAny: Mocking KV
	const mockKV: any = { get: vi.fn(), put: vi.fn(), list: vi.fn() };

	// Minimal D1 stand-in: records the args bound to INSERTs, and replays
	// whatever rows a test stages for the aggregator's SELECT.
	// biome-ignore lint/suspicious/noExplicitAny: Mocking D1 rows
	let stagedRows: any[] = [];
	// biome-ignore lint/suspicious/noExplicitAny: Mocking D1 bind args
	let inserts: any[][] = [];
	const mockDB = {
		prepare: (sql: string) => ({
			// biome-ignore lint/suspicious/noExplicitAny: Mocking D1 bind args
			bind: (...args: any[]) => ({
				run: async () => {
					if (sql.includes("INSERT")) inserts.push(args);
					return { success: true };
				},
				all: async () => ({ results: stagedRows }),
			}),
		}),
	};

	const env = {
		RIOT_CLIENT_ID: "t",
		RIOT_CLIENT_SECRET: "t",
		REALTIME_ORG_ID: "o",
		REALTIME_API_KEY: "k",
		REALTIME_KIT_APP_ID: "a",
		VC_SESSIONS: mockKV,
		// biome-ignore lint/suspicious/noExplicitAny: Mocking D1
		VC_DB: mockDB as any,
		USE_MOCK_REALTIME: "true",
	};

	// A report is only accepted from — and against — someone actually on the
	// room's roster, so every test needs a room staged in KV. Tests that exercise
	// the guard itself shrink `roster` or replace the stub outright.
	const ROOM = "room-1";
	const MEETING = "mock-meeting-1";
	let roster: string[] = [];
	let reportsThisWindow = 0;

	// Whether the staged roster counts as Riot-verified. Auto-ban requires it —
	// see the "unverified roster" tests below.
	let rosterValidated = true;

	const stageRoom = () => {
		mockKV.get.mockImplementation((key: string) => {
			if (key === `game:${ROOM}`) return Promise.resolve(MEETING);
			if (key === `session:${MEETING}`)
				return Promise.resolve(
					JSON.stringify({
						sessionId: ROOM,
						meetingId: MEETING,
						users: roster.map((summonerId) => ({
							summonerId,
							joinedAt: 0,
							validated: rosterValidated,
						})),
						createdAt: 0,
					}),
				);
			if (key.startsWith("rl:report:"))
				return Promise.resolve(
					reportsThisWindow ? String(reportsThisWindow) : null,
				);
			return Promise.resolve(null);
		});
	};

	beforeEach(() => {
		stagedRows = [];
		inserts = [];
		reportsThisWindow = 0;
		rosterValidated = true;
		roster = [
			"Alice#JP1",
			"TROLL#JP1",
			"reporter3#JP1",
			"reporter4#JP1",
			"r1#JP1",
		];
		stageRoom();
	});
	afterEach(() => vi.clearAllMocks());

	const postReport = (body: unknown, ip = "203.0.113.1") =>
		app.request(
			`/api/sessions/${ROOM}/reports`,
			{
				method: "POST",
				body: JSON.stringify(body),
				headers: {
					"Content-Type": "application/json",
					"CF-Connecting-IP": ip,
				},
			},
			env,
		);

	const putKeys = (): string[] =>
		mockKV.put.mock.calls.map((c: unknown[]) => String(c[0]));

	it("persists both Riot IDs in the clear, normalized plus raw", async () => {
		const res = await postReport({
			reporterSummonerId: " Alice#JP1 ",
			reportedSummonerId: "TROLL#JP1",
			reason: "harassment",
		});
		expect(res.status).toBe(200);

		expect(inserts).toHaveLength(1);
		const [, sessionId, reporter, reporterRaw, reported, reportedRaw, reason] =
			inserts[0];
		expect(sessionId).toBe("room-1");
		// Normalized for matching, raw preserved for display.
		expect(reporter).toBe("alice#jp1");
		expect(reporterRaw).toBe("Alice#JP1");
		expect(reported).toBe("troll#jp1");
		expect(reportedRaw).toBe("TROLL#JP1");
		expect(reason).toBe("harassment");
		// Nothing about a report goes to KV any more, and one reporter never bans.
		expect(putKeys().some((k) => k.startsWith("report:"))).toBe(false);
		expect(putKeys().some((k) => k.startsWith("ban:"))).toBe(false);
	});

	it("rejects a self-report (case-insensitive)", async () => {
		const res = await postReport({
			reporterSummonerId: "same#JP1",
			reportedSummonerId: "SAME#jp1",
			reason: "spam",
		});
		expect(res.status).toBe(400);
	});

	it("rejects an invalid reason", async () => {
		const res = await postReport({
			reporterSummonerId: "a#JP1",
			reportedSummonerId: "b#JP1",
			reason: "not-a-reason",
		});
		expect(res.status).toBe(400);
	});

	it("requires both summoner IDs", async () => {
		const res = await postReport({ reason: "spam" });
		expect(res.status).toBe(400);
	});

	// The reporter used to be an unverified string from the request body, so
	// three POSTs with invented names cleared MIN_DISTINCT_REPORTERS and banned
	// any Riot ID for 24h. Membership in the room is what makes a reporter real.
	it("rejects a report from someone who never joined the room", async () => {
		const res = await postReport({
			reporterSummonerId: "ghost#JP1",
			reportedSummonerId: "TROLL#JP1",
			reason: "harassment",
		});
		expect(res.status).toBe(403);
		expect(inserts).toHaveLength(0);
	});

	it("rejects a report against someone who never joined the room", async () => {
		const res = await postReport({
			reporterSummonerId: "Alice#JP1",
			reportedSummonerId: "stranger#JP1",
			reason: "harassment",
		});
		expect(res.status).toBe(403);
		expect(inserts).toHaveLength(0);
	});

	it("rejects a report for a room that does not exist", async () => {
		mockKV.get.mockImplementation(() => Promise.resolve(null));
		const res = await postReport({
			reporterSummonerId: "Alice#JP1",
			reportedSummonerId: "TROLL#JP1",
			reason: "harassment",
		});
		expect(res.status).toBe(404);
		expect(inserts).toHaveLength(0);
	});

	// The roster stores whatever case the user typed; a ban must not hinge on it.
	it("matches the roster case-insensitively", async () => {
		const res = await postReport({
			reporterSummonerId: "alice#jp1",
			reportedSummonerId: "troll#jp1",
			reason: "harassment",
		});
		expect(res.status).toBe(200);
		expect(inserts).toHaveLength(1);
	});

	// Second line of defence: even a real participant cannot spray reports across
	// many rooms from one machine.
	it("rate limits a flood of reports from one IP", async () => {
		reportsThisWindow = REPORT_RATE_LIMIT;
		const res = await postReport({
			reporterSummonerId: "Alice#JP1",
			reportedSummonerId: "TROLL#JP1",
			reason: "harassment",
		});
		expect(res.status).toBe(429);
		expect(inserts).toHaveLength(0);
	});

	// The roster check alone is not identity. With RIOT_VALIDATION_ENABLED
	// "false" — production today — join accepts any self-asserted name, so one
	// attacker can seed a room with invented reporters plus the victim and clear
	// MIN_DISTINCT_REPORTERS unaided. Reproduced end-to-end against a local
	// `wrangler pages dev`: 4 joins + 3 reports = a 24h ban, no accounts needed.
	it("does not auto-ban when the roster is not Riot-verified", async () => {
		rosterValidated = false;
		const now = Date.now();
		stagedRows = [
			{ reporter_riot_id: "r1", reason: "harassment", created_at: now },
			{ reporter_riot_id: "r2", reason: "hate", created_at: now },
			{ reporter_riot_id: "r3", reason: "illegal", created_at: now },
		];
		const res = await postReport({
			reporterSummonerId: "reporter3#JP1",
			reportedSummonerId: "TROLL#JP1",
			reason: "illegal",
		});

		// The report is still evidence: recorded, and the client still mutes.
		expect(res.status).toBe(200);
		expect(inserts).toHaveLength(1);
		// Only the automatic suspension is withheld.
		expect(putKeys().some((k) => k.startsWith("ban:"))).toBe(false);
	});

	it("does not auto-ban when only one of the two parties is verified", async () => {
		const now = Date.now();
		stagedRows = [
			{ reporter_riot_id: "r1", reason: "harassment", created_at: now },
			{ reporter_riot_id: "r2", reason: "hate", created_at: now },
			{ reporter_riot_id: "r3", reason: "illegal", created_at: now },
		];
		// Verified reporter, unverified target: an attacker who cannot forge
		// reporters could otherwise still ban a name nobody has proven.
		mockKV.get.mockImplementation((key: string) => {
			if (key === `game:${ROOM}`) return Promise.resolve(MEETING);
			if (key === `session:${MEETING}`)
				return Promise.resolve(
					JSON.stringify({
						sessionId: ROOM,
						meetingId: MEETING,
						users: [
							{ summonerId: "reporter3#JP1", joinedAt: 0, validated: true },
							{ summonerId: "TROLL#JP1", joinedAt: 0, validated: false },
						],
						createdAt: 0,
					}),
				);
			return Promise.resolve(null);
		});

		const res = await postReport({
			reporterSummonerId: "reporter3#JP1",
			reportedSummonerId: "TROLL#JP1",
			reason: "illegal",
		});
		expect(res.status).toBe(200);
		expect(putKeys().some((k) => k.startsWith("ban:"))).toBe(false);
	});

	// Kill switch: keep recording reports (and client-side local mute) while
	// taking humans back into the loop for the actual suspension.
	it("records the report but skips the auto-ban when the kill switch is off", async () => {
		const now = Date.now();
		stagedRows = [
			{ reporter_riot_id: "r1", reason: "harassment", created_at: now },
			{ reporter_riot_id: "r2", reason: "hate", created_at: now },
			{ reporter_riot_id: "r3", reason: "illegal", created_at: now },
		];
		const res = await app.request(
			`/api/sessions/${ROOM}/reports`,
			{
				method: "POST",
				body: JSON.stringify({
					reporterSummonerId: "reporter3#JP1",
					reportedSummonerId: "TROLL#JP1",
					reason: "illegal",
				}),
				headers: {
					"Content-Type": "application/json",
					"CF-Connecting-IP": "203.0.113.9",
				},
			},
			{ ...env, MODERATION_AUTO_BAN_ENABLED: "false" },
		);
		expect(res.status).toBe(200);
		expect(inserts).toHaveLength(1);
		expect(putKeys().some((k) => k.startsWith("ban:"))).toBe(false);
	});

	it("issues a temporary ban once enough DISTINCT reporters flag severe reasons", async () => {
		const now = Date.now();
		stagedRows = [
			{ reporter_riot_id: "r1", reason: "harassment", created_at: now },
			{ reporter_riot_id: "r2", reason: "hate", created_at: now },
			{ reporter_riot_id: "r3", reason: "illegal", created_at: now },
		];
		const res = await postReport({
			reporterSummonerId: "reporter3#JP1",
			reportedSummonerId: "troll#JP1",
			reason: "illegal",
		});
		expect(res.status).toBe(200);

		const banCall = mockKV.put.mock.calls.find((c: unknown[]) =>
			String(c[0]).startsWith("ban:"),
		);
		expect(banCall).toBeTruthy();
		// Bans key on the normalized Riot ID now that nothing is hashed.
		expect(banCall[0]).toBe("ban:troll#jp1");
		expect(banCall[2].expirationTtl).toBe(24 * 60 * 60);
	});

	it("does not ban when many reports come from a single reporter", async () => {
		const now = Date.now();
		stagedRows = [
			{ reporter_riot_id: "r1", reason: "harassment", created_at: now },
			{ reporter_riot_id: "r1", reason: "harassment", created_at: now },
			{ reporter_riot_id: "r1", reason: "harassment", created_at: now },
		];
		const res = await postReport({
			reporterSummonerId: "r1#JP1",
			reportedSummonerId: "troll#JP1",
			reason: "harassment",
		});
		expect(res.status).toBe(200);
		expect(putKeys().some((k) => k.startsWith("ban:"))).toBe(false);
	});

	// Reports no longer expire, so recency decay is the only thing stopping old
	// reports from accumulating into a ban forever.
	it("does not count reports older than 30 days toward a ban", async () => {
		const now = Date.now();
		const old = now - 31 * 24 * 60 * 60 * 1000;
		stagedRows = [
			{ reporter_riot_id: "r1", reason: "harassment", created_at: old },
			{ reporter_riot_id: "r2", reason: "hate", created_at: old },
			{ reporter_riot_id: "r3", reason: "illegal", created_at: old },
		];
		const res = await postReport({
			reporterSummonerId: "reporter4#JP1",
			reportedSummonerId: "troll#JP1",
			reason: "illegal",
		});
		expect(res.status).toBe(200);
		expect(putKeys().some((k) => k.startsWith("ban:"))).toBe(false);
	});

	// child_safety is escalated to humans; it must never drive the auto-ban, or
	// the most severe category becomes the easiest one to weaponize.
	it("stores a child-safety report but keeps it out of the auto-ban score", async () => {
		const now = Date.now();
		stagedRows = [
			{ reporter_riot_id: "r1", reason: "child_safety", created_at: now },
			{ reporter_riot_id: "r2", reason: "child_safety", created_at: now },
			{ reporter_riot_id: "r3", reason: "child_safety", created_at: now },
		];
		const res = await postReport({
			reporterSummonerId: "reporter4#JP1",
			reportedSummonerId: "troll#JP1",
			reason: "child_safety",
		});
		expect(res.status).toBe(200);
		// Persisted like any other report...
		expect(inserts).toHaveLength(1);
		expect(inserts[0][6]).toBe("child_safety");
		// ...but never scored.
		expect(putKeys().some((k) => k.startsWith("ban:"))).toBe(false);
	});

	it("blocks a banned user from joining", async () => {
		mockKV.get.mockImplementation((key: string) =>
			Promise.resolve(key.startsWith("ban:") ? '{"source":"auto"}' : null),
		);
		const res = await app.request(
			"/api/sessions/room-1/join",
			{
				method: "POST",
				body: JSON.stringify({ summonerId: "troll#JP1" }),
				headers: { "Content-Type": "application/json" },
			},
			{ ...env, RIOT_VALIDATION_ENABLED: "false" },
		);
		expect(res.status).toBe(403);
		expect(await res.text()).toContain("suspended");
	});
});
