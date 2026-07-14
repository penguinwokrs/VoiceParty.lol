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
		mockKV.get.mockResolvedValueOnce("mock-meeting-id").mockResolvedValueOnce(
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
			const sessionData = {
				sessionId,
				meetingId: "mock-meeting-id",
				users: [],
				createdAt: Date.now(),
			};
			mockKV.get
				.mockResolvedValueOnce("mock-meeting-id")
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
