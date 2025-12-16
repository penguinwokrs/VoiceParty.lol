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
		REALTIME_ORG_ID: "test-org",
		REALTIME_API_KEY: "test-key",
		REALTIME_KIT_APP_ID: "test-app",
		VC_SESSIONS: mockKV,
		USE_MOCK_REALTIME: "true",
	};

	const originalFetch = global.fetch;

	beforeEach(() => {
		global.fetch = vi.fn((url) => {
			if (
				url.toString().includes("/meetings") &&
				!url.toString().includes("participants")
			) {
				return Promise.resolve({
					ok: true,
					json: async () => ({
						success: true,
						data: { id: "mock-meeting-id" },
					}),
				});
			}
			if (url.toString().includes("/participants")) {
				return Promise.resolve({
					ok: true,
					json: async () => ({
						success: true,
						data: { token: "mock-rt-token" },
					}),
				});
			}
			return Promise.reject(new Error("Unknown URL"));
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

		// Verify fetch NOT called for meeting
		expect(global.fetch).not.toHaveBeenCalledWith(
			expect.stringContaining("api.realtime.cloudflare.com"),
			expect.anything(),
		);

		// Expect mapping save
		expect(mockKV.put).toHaveBeenCalledWith(
			expect.stringContaining("game:"),
			expect.stringContaining("mock-meeting-id"),
		);
		// Expect session save
		expect(mockKV.put).toHaveBeenCalledWith(
			expect.stringContaining("session:mock-meeting-id"),
			expect.stringContaining('"sessionId":'),
		);
	});

	it("POST /sessions/:id/join adds a user (Mock Mode)", async () => {
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
					userId: "user-1",
					iconUrl: "http://example.com/icon.png",
				}),
				headers: { "Content-Type": "application/json" },
			},
			testEnv,
		);

		expect(res.status).toBe(200);
		// biome-ignore lint/suspicious/noExplicitAny: Test assertion
		const body = (await res.json()) as any;
		expect(body.session.users).toHaveLength(1);
		expect(body.realtime.token).toBe("mock-token");

		// Verify fetch NOT called for participants
		expect(global.fetch).not.toHaveBeenCalledWith(
			expect.stringContaining("api.realtime.cloudflare.com"),
			expect.anything(),
		);

		expect(mockKV.put).toHaveBeenCalled();
	});

	it("POST /sessions/:id/join rejects if full", async () => {
		const sessionId = "full-session";
		const sessionData = {
			sessionId,
			meetingId: "mock-meeting-id",
			users: Array(5).fill({ userId: "u", joinedAt: 0 }),
			createdAt: Date.now(),
		};
		// This logic doesn't depend on Mock/Real mode, just internal logic
		mockKV.get
			.mockResolvedValueOnce("mock-meeting-id") // mapping
			.mockResolvedValueOnce(JSON.stringify(sessionData)); // session

		const res = await app.request(
			`/api/sessions/${sessionId}/join`,
			{
				method: "POST",
				body: JSON.stringify({ userId: "user-new" }),
				headers: { "Content-Type": "application/json" },
			},
			testEnv,
		);

		expect(res.status).toBe(403);
		expect(await res.text()).toContain("Session is full");
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
					body: JSON.stringify({ userId: "int-user" }),
					headers: { "Content-Type": "application/json" },
				},
				integrationEnv,
			);
			expect(res.status).toBe(200);
			expect(global.fetch).toHaveBeenCalledWith(
				expect.stringContaining("/participants"),
				expect.objectContaining({
					method: "POST",
					body: expect.stringContaining('"name":"int-user"'),
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
					body: JSON.stringify({ userId: "int-user-2" }),
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
