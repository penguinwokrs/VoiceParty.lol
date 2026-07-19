import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { VoiceChat } from "./index";

// Mock the local Realtime hook
vi.mock("./useRealtime", () => ({
	useRealtime: () => ({
		join: vi.fn().mockResolvedValue(undefined),
		leave: vi.fn(),
		reconnect: vi.fn(),
		toggleMic: vi.fn(),
		isMicMuted: false,
		isConnected: true,
		connectionState: "connected",
		noiseSuppression: false,
		toggleNoiseSuppression: vi.fn(),
		client: {},
		peers: [],
	}),
}));

describe("VoiceChat", () => {
	it("renders login form initially", () => {
		render(
			<MemoryRouter>
				<VoiceChat />
			</MemoryRouter>,
		);
		expect(screen.getByText("Voice Chat")).toBeInTheDocument();
		expect(screen.getByLabelText("Riot ID")).toBeInTheDocument();
		expect(screen.getByLabelText("Region")).toBeInTheDocument();
		// The room ID is generated, so there is no field to type it into.
		expect(screen.queryByLabelText("Game ID")).not.toBeInTheDocument();
	});

	it("Join Game button is disabled without a Riot ID", () => {
		vi.spyOn(Storage.prototype, "getItem").mockReturnValue(null);
		render(
			<MemoryRouter>
				<VoiceChat />
			</MemoryRouter>,
		);
		const joinBtn = screen.getByText("Join Game");
		expect(joinBtn).toBeDisabled();
	});

	it("updates input fields and enables button", async () => {
		render(
			<MemoryRouter>
				<VoiceChat />
			</MemoryRouter>,
		);
		const joinBtn = screen.getByText("Join Game");
		expect(joinBtn).toBeDisabled();

		const userInput = screen.getByLabelText("Riot ID") as HTMLInputElement;
		fireEvent.change(userInput, { target: { value: "test-user" } });
		expect(userInput.value).toBe("test-user");
		expect(joinBtn).toBeDisabled(); // Still disabled, no region

		// Pick a region from the suggestions.
		fireEvent.mouseDown(screen.getByLabelText("Region"));
		fireEvent.click(await screen.findByText("Korea (KR)"));
		expect(joinBtn).toBeEnabled();
	});

	it("simulates joining a session", async () => {
		// Age already confirmed so Join proceeds without the age gate.
		vi.spyOn(Storage.prototype, "getItem").mockImplementation((k) =>
			k === "vp_age_ok" ? "true" : null,
		);
		// Mock fetch
		global.fetch = vi.fn().mockResolvedValue({
			ok: true,
			text: () => Promise.resolve(""),
			json: () =>
				Promise.resolve({
					session: {
						sessionId: "session-123",
						users: [{ summonerId: "test-user", joinedAt: Date.now() }],
						createdAt: Date.now(),
					},
					realtime: { token: "mock-token", meetingId: "mock-id" },
				}),
		});

		render(
			<MemoryRouter initialEntries={["/join/session-123"]}>
				<Routes>
					<Route path="/" element={<VoiceChat />} />
					{/* Mirrors App.tsx: picking a region moves the room onto the
					    region-scoped path before joining. */}
					<Route path="/join/:region/:sessionId" element={<VoiceChat />} />
					<Route path="/join/:sessionId" element={<VoiceChat />} />
				</Routes>
			</MemoryRouter>,
		);
		const userInput = screen.getByLabelText("Riot ID");
		fireEvent.change(userInput, { target: { value: "test-user" } });

		// The room comes from the invite link in the URL, not from a field.
		fireEvent.mouseDown(screen.getByLabelText("Region"));
		fireEvent.click(await screen.findByText("Korea (KR)"));

		const joinBtn = screen.getByRole("button", { name: "Join Game" });
		expect(joinBtn).toBeEnabled();

		fireEvent.click(joinBtn);

		await waitFor(() => {
			expect(screen.getByText(/Session:.*session-123/)).toBeInTheDocument();
		});

		expect(screen.getByText("test-user")).toBeInTheDocument();
		expect(screen.getByText("(You)")).toBeInTheDocument();
	});

	// A room is region-scoped: players on different platforms can't play
	// together, so the region has to survive the invite link.
	describe("region in the URL", () => {
		const renderAt = (path: string) =>
			render(
				<MemoryRouter initialEntries={[path]}>
					<Routes>
						<Route path="/join/:region/:sessionId" element={<VoiceChat />} />
						<Route path="/join/:sessionId" element={<VoiceChat />} />
					</Routes>
				</MemoryRouter>,
			);

		it("takes the region from the link and locks the field", () => {
			vi.spyOn(Storage.prototype, "getItem").mockReturnValue(null);
			renderAt("/join/kr/session-123");

			const region = screen.getByLabelText("Region") as HTMLInputElement;
			expect(region.value).toBe("Korea (KR)");
			expect(region).toBeDisabled();
		});

		it("ignores an unknown region and lets the player pick", () => {
			vi.spyOn(Storage.prototype, "getItem").mockReturnValue(null);
			renderAt("/join/not-a-region/session-123");

			const region = screen.getByLabelText("Region") as HTMLInputElement;
			expect(region.value).toBe("");
			expect(region).toBeEnabled();
		});

		it("does not remember a region that came from someone else's link", () => {
			vi.spyOn(Storage.prototype, "getItem").mockReturnValue(null);
			const setItem = vi
				.spyOn(Storage.prototype, "setItem")
				.mockImplementation(() => {});

			renderAt("/join/kr/session-123");

			expect(setItem).not.toHaveBeenCalledWith("vp_region", "kr");
		});

		it("puts the region in the invite link", async () => {
			vi.spyOn(Storage.prototype, "getItem").mockImplementation((k) =>
				k === "vp_age_ok" ? "true" : null,
			);
			const writeText = vi.fn().mockResolvedValue(undefined);
			Object.defineProperty(navigator, "clipboard", {
				value: { writeText },
				configurable: true,
			});
			global.fetch = vi.fn().mockResolvedValue({
				ok: true,
				text: () => Promise.resolve(""),
				json: () =>
					Promise.resolve({
						session: {
							sessionId: "session-123",
							users: [{ summonerId: "test-user", joinedAt: Date.now() }],
							createdAt: Date.now(),
						},
						realtime: { token: "mock-token", meetingId: "mock-id" },
					}),
			});

			renderAt("/join/kr/session-123");
			fireEvent.change(screen.getByLabelText("Riot ID"), {
				target: { value: "test-user" },
			});
			fireEvent.click(screen.getByRole("button", { name: "Join Game" }));

			await waitFor(() => {
				expect(screen.getByText(/Session:.*session-123/)).toBeInTheDocument();
			});

			fireEvent.click(screen.getByRole("button", { name: /Copy link/ }));
			await waitFor(() => expect(writeText).toHaveBeenCalled());
			expect(writeText.mock.calls[0][0]).toContain("/join/kr/session-123");
		});

		// The channel tag is not just a metric: the edge picks the preview card's
		// wording from it, so a copied link must claim "copy" and only that.
		it("stamps the copied link with its share channel", async () => {
			vi.spyOn(Storage.prototype, "getItem").mockImplementation((k) =>
				k === "vp_age_ok" ? "true" : null,
			);
			const writeText = vi.fn().mockResolvedValue(undefined);
			Object.defineProperty(navigator, "clipboard", {
				value: { writeText },
				configurable: true,
			});
			global.fetch = vi.fn().mockResolvedValue({
				ok: true,
				text: () => Promise.resolve(""),
				json: () =>
					Promise.resolve({
						session: {
							sessionId: "session-123",
							users: [{ summonerId: "test-user", joinedAt: Date.now() }],
							createdAt: Date.now(),
						},
						realtime: { token: "mock-token", meetingId: "mock-id" },
					}),
			});

			renderAt("/join/kr/session-123");
			fireEvent.change(screen.getByLabelText("Riot ID"), {
				target: { value: "test-user" },
			});
			fireEvent.click(screen.getByRole("button", { name: "Join Game" }));
			await waitFor(() => {
				expect(screen.getByText(/Session:.*session-123/)).toBeInTheDocument();
			});

			fireEvent.click(screen.getByRole("button", { name: /Copy link/ }));
			await waitFor(() => expect(writeText).toHaveBeenCalled());
			expect(writeText.mock.calls[0][0]).toContain("?src=copy");
		});
	});

	// Regression: a returning player has a stored Riot ID, which used to be
	// enough for a shared link to drop them straight into a live call — mic on,
	// before they ever saw the form. Arriving must land on the form; the stored
	// name only prefills it.
	it("does not auto-join from a shared link, even with a stored Riot ID", async () => {
		vi.spyOn(Storage.prototype, "getItem").mockImplementation((k) =>
			k === "vp_summoner_id" ? "Nova#JP1" : k === "vp_age_ok" ? "true" : null,
		);
		const fetchMock = vi.fn();
		global.fetch = fetchMock;

		render(
			<MemoryRouter initialEntries={["/join/jp1/s1"]}>
				<Routes>
					<Route path="/join/:region/:sessionId" element={<VoiceChat />} />
				</Routes>
			</MemoryRouter>,
		);

		// The form is shown, prefilled — not the in-call view.
		const userInput = (await screen.findByLabelText(
			"Riot ID",
		)) as HTMLInputElement;
		expect(userInput.value).toBe("Nova#JP1");
		expect(screen.getByText("Join Game")).toBeInTheDocument();
		// Nothing was joined behind their back.
		expect(fetchMock).not.toHaveBeenCalled();
	});

	it("age gate blocks users under 13 and lets 13+ through", async () => {
		vi.spyOn(Storage.prototype, "getItem").mockReturnValue(null);
		const setItem = vi
			.spyOn(Storage.prototype, "setItem")
			.mockImplementation(() => {});

		render(
			<MemoryRouter initialEntries={["/join/s1"]}>
				<Routes>
					<Route path="/join/:sessionId" element={<VoiceChat />} />
				</Routes>
			</MemoryRouter>,
		);
		fireEvent.change(screen.getByLabelText("Riot ID"), {
			target: { value: "u" },
		});
		fireEvent.mouseDown(screen.getByLabelText("Region"));
		fireEvent.click(await screen.findByText("Japan (JP)"));
		fireEvent.click(screen.getByText("Join Game"));

		// Age dialog appears; an under-13 birth year is rejected.
		const yearInput = await screen.findByLabelText("Year of birth");
		const thisYear = new Date().getFullYear();
		fireEvent.change(yearInput, { target: { value: String(thisYear - 5) } });
		fireEvent.click(screen.getByText("Confirm and continue"));
		// The error is shown (body + helper both mention the age) and age is NOT stored.
		expect(
			screen.getAllByText(/at least 13 years old/i).length,
		).toBeGreaterThan(1);
		expect(setItem).not.toHaveBeenCalledWith("vp_age_ok", "true");

		// A 13+ birth year is accepted and persisted.
		fireEvent.change(yearInput, { target: { value: String(thisYear - 20) } });
		fireEvent.click(screen.getByText("Confirm and continue"));
		expect(setItem).toHaveBeenCalledWith("vp_age_ok", "true");
	});
});
