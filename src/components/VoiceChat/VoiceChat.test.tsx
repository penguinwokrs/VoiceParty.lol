import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { VoiceChat } from "./index";

// Mock the local Realtime hook
vi.mock("./useRealtime", () => ({
	useRealtime: () => ({
		join: vi.fn().mockResolvedValue(undefined),
		leave: vi.fn(),
		toggleMic: vi.fn(),
		isMicMuted: false,
		isConnected: false,
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
		expect(screen.getByLabelText("Summoner ID")).toBeInTheDocument();
		expect(screen.getByLabelText("Game ID")).toBeInTheDocument();
	});

	it("Join Game button is disabled without User ID or Game ID", () => {
		vi.spyOn(Storage.prototype, "getItem").mockReturnValue(null);
		render(
			<MemoryRouter>
				<VoiceChat />
			</MemoryRouter>,
		);
		const joinBtn = screen.getByText("Join Game");
		expect(joinBtn).toBeDisabled();
	});

	it("updates input fields and enables button", () => {
		render(
			<MemoryRouter>
				<VoiceChat />
			</MemoryRouter>,
		);
		const joinBtn = screen.getByText("Join Game");
		expect(joinBtn).toBeDisabled();

		const userInput = screen.getByLabelText("Summoner ID") as HTMLInputElement;
		fireEvent.change(userInput, { target: { value: "test-user" } });
		expect(userInput.value).toBe("test-user");
		expect(joinBtn).toBeDisabled(); // Still disabled, no Game ID

		const sessionInput = screen.getByLabelText("Game ID") as HTMLInputElement;
		fireEvent.change(sessionInput, { target: { value: "test-session" } });
		expect(sessionInput.value).toBe("test-session");
		expect(joinBtn).toBeEnabled();
	});

	it("simulates joining a session", async () => {
		vi.spyOn(Storage.prototype, "getItem").mockReturnValue(null);
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
					<Route path="/join/:sessionId" element={<VoiceChat />} />
				</Routes>
			</MemoryRouter>,
		);
		const userInput = screen.getByLabelText("Summoner ID");
		fireEvent.change(userInput, { target: { value: "test-user" } });

		const sessionInput = screen.getByLabelText("Game ID");
		fireEvent.change(sessionInput, { target: { value: "session-123" } });

		const joinBtn = await screen.findByRole("button");
		expect(joinBtn).toBeEnabled();

		fireEvent.click(joinBtn);

		await waitFor(() => {
			expect(screen.getByText(/Session:.*session-123/)).toBeInTheDocument();
		});

		expect(screen.getByText("test-user")).toBeInTheDocument();
		expect(screen.getByText("(You)")).toBeInTheDocument();
	});
});
