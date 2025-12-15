import { describe, expect, it, vi } from "vitest";
import app from "./index";

// Mock environment variables
const env = {
	RIOT_CLIENT_ID: "test-client-id",
	RIOT_CLIENT_SECRET: "test-client-secret",
	// biome-ignore lint/suspicious/noExplicitAny: Mocking KV
	VC_SESSIONS: {} as any, // Mock KV
};

describe("Worker Auth", () => {
	it("GET /auth/login redirects to Riot", async () => {
		const res = await app.request("/auth/login", {}, env);
		expect(res.status).toBe(302);
		expect(res.headers.get("Location")).toContain(
			"https://auth.riotgames.com/authorize",
		);
		expect(res.headers.get("Location")).toContain("client_id=test-client-id");
	});

	it("GET /auth/callback exchanges code for token", async () => {
		// Mock fetch for token endpoint
		global.fetch = vi.fn().mockResolvedValue({
			ok: true,
			json: async () => ({
				access_token: "mock-token",
				id_token: "mock-id-token",
			}),
		});

		const res = await app.request("/auth/callback?code=mock-code", {}, env);

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
	});
});

describe("Session Management", () => {
	// biome-ignore lint/suspicious/noExplicitAny: Mocking KV
	const mockKV: any = {
		put: vi.fn(),
		get: vi.fn(),
	};
	const env = {
		RIOT_CLIENT_ID: "test",
		RIOT_CLIENT_SECRET: "test",
		VC_SESSIONS: mockKV,
	};

	it("POST /sessions creates a new session", async () => {
		const res = await app.request("/sessions", { method: "POST" }, env);
		expect(res.status).toBe(200);
		// biome-ignore lint/suspicious/noExplicitAny: Test assertion
		const body = (await res.json()) as any;
		expect(body.sessionId).toBeDefined();
		expect(body.users).toEqual([]);
		expect(mockKV.put).toHaveBeenCalledWith(
			expect.stringContaining("session:"),
			expect.stringContaining('"sessionId":'),
		);
	});

	it("POST /sessions/:id/join adds a user", async () => {
		const sessionId = "test-session";
		const sessionData = { sessionId, users: [], createdAt: Date.now() };

		mockKV.get.mockResolvedValue(JSON.stringify(sessionData));

		const res = await app.request(
			`/sessions/${sessionId}/join`,
			{
				method: "POST",
				body: JSON.stringify({
					userId: "user-1",
					iconUrl: "http://example.com/icon.png",
				}),
				headers: { "Content-Type": "application/json" },
			},
			env,
		);

		expect(res.status).toBe(200);
		// biome-ignore lint/suspicious/noExplicitAny: Test assertion
		const body = (await res.json()) as any;
		expect(body.users).toHaveLength(1);
		expect(body.users[0].userId).toBe("user-1");
		expect(body.users[0].iconUrl).toBe("http://example.com/icon.png");

		expect(mockKV.put).toHaveBeenCalled();
	});

	it("POST /sessions/:id/join rejects if full", async () => {
		const sessionId = "full-session";
		const sessionData = {
			sessionId,
			users: Array(5).fill({ userId: "u", joinedAt: 0 }),
			createdAt: Date.now(),
		};
		mockKV.get.mockResolvedValue(JSON.stringify(sessionData));

		const res = await app.request(
			`/sessions/${sessionId}/join`,
			{
				method: "POST",
				body: JSON.stringify({ userId: "user-new" }),
				headers: { "Content-Type": "application/json" },
			},
			env,
		);

		expect(res.status).toBe(403);
		expect(await res.text()).toContain("Session is full");
	});
});
