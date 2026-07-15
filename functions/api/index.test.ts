import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
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
		const res = await post({ riotId: "MockUser#JP1" });
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

// Phase 1: report records a pseudonymized entry and (client-side) mutes the
// reported user. Phase 2/3: distinct reporters accrue into a temporary auto-ban
// that blocks the reported user's next join.
describe("Reports & auto-ban (moderation)", () => {
	// biome-ignore lint/suspicious/noExplicitAny: Mocking KV
	const mockKV: any = { get: vi.fn(), put: vi.fn(), list: vi.fn() };
	const env = {
		RIOT_CLIENT_ID: "t",
		RIOT_CLIENT_SECRET: "t",
		REALTIME_ORG_ID: "o",
		REALTIME_API_KEY: "k",
		REALTIME_KIT_APP_ID: "a",
		VC_SESSIONS: mockKV,
		USE_MOCK_REALTIME: "true",
		REPORT_SALT: "test-salt",
	};

	afterEach(() => vi.clearAllMocks());

	const postReport = (body: unknown) =>
		app.request(
			"/api/sessions/room-1/reports",
			{
				method: "POST",
				body: JSON.stringify(body),
				headers: { "Content-Type": "application/json" },
			},
			env,
		);

	const putKeys = (): string[] =>
		mockKV.put.mock.calls.map((c: unknown[]) => String(c[0]));

	it("records a report under a report: key with TTL and metadata", async () => {
		mockKV.list.mockResolvedValue({ keys: [] });
		const res = await postReport({
			reporterSummonerId: "alice#JP1",
			reportedSummonerId: "troll#JP1",
			reason: "harassment",
		});
		expect(res.status).toBe(200);

		const call = mockKV.put.mock.calls.find((c: unknown[]) =>
			String(c[0]).startsWith("report:"),
		);
		expect(call).toBeTruthy();
		expect(call[2].expirationTtl).toBe(30 * 24 * 60 * 60);
		expect(call[2].metadata.reason).toBe("harassment");
		// A single reporter never triggers a ban.
		expect(putKeys().some((k) => k.startsWith("ban:"))).toBe(false);
	});

	it("rejects a self-report (case-insensitive)", async () => {
		mockKV.list.mockResolvedValue({ keys: [] });
		const res = await postReport({
			reporterSummonerId: "same#JP1",
			reportedSummonerId: "SAME#jp1",
			reason: "spam",
		});
		expect(res.status).toBe(400);
	});

	it("rejects an invalid reason", async () => {
		mockKV.list.mockResolvedValue({ keys: [] });
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

	it("issues a temporary ban once enough DISTINCT reporters flag severe reasons", async () => {
		const now = Date.now();
		mockKV.list.mockResolvedValue({
			keys: [
				{
					name: "report:x:s1:r1",
					metadata: { r: "r1", reason: "harassment", t: now },
				},
				{
					name: "report:x:s2:r2",
					metadata: { r: "r2", reason: "hate", t: now },
				},
				{
					name: "report:x:s3:r3",
					metadata: { r: "r3", reason: "illegal", t: now },
				},
			],
		});
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
		expect(banCall[2].expirationTtl).toBe(24 * 60 * 60);
	});

	it("does not ban when many reports come from a single reporter", async () => {
		const now = Date.now();
		mockKV.list.mockResolvedValue({
			keys: [
				{
					name: "report:x:s1:r1",
					metadata: { r: "r1", reason: "harassment", t: now },
				},
				{
					name: "report:x:s2:r1",
					metadata: { r: "r1", reason: "harassment", t: now },
				},
				{
					name: "report:x:s3:r1",
					metadata: { r: "r1", reason: "harassment", t: now },
				},
			],
		});
		const res = await postReport({
			reporterSummonerId: "r1#JP1",
			reportedSummonerId: "troll#JP1",
			reason: "harassment",
		});
		expect(res.status).toBe(200);
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
