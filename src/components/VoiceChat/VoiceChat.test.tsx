import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { VoiceChat } from "./index";

// Mock the RealtimeKit hook
vi.mock("@cloudflare/realtimekit-react", () => ({
	useRealtime: () => ({
		join: vi.fn(),
		leave: vi.fn(),
		toggleMic: vi.fn(),
		isMicMuted: false,
		isConnected: false,
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
		expect(screen.getByLabelText("User ID")).toBeInTheDocument();
		expect(screen.getByLabelText("Session ID")).toBeInTheDocument();
	});

	it("Create New button is disabled without User ID", () => {
		render(
			<MemoryRouter>
				<VoiceChat />
			</MemoryRouter>,
		);
		const createBtn = screen.getByText("Create New");
		expect(createBtn).toBeDisabled();
	});

	it("updates input fields", () => {
		render(
			<MemoryRouter>
				<VoiceChat />
			</MemoryRouter>,
		);
		const userInput = screen.getByLabelText("User ID") as HTMLInputElement;
		fireEvent.change(userInput, { target: { value: "test-user" } });
		expect(userInput.value).toBe("test-user");

		const sessionInput = screen.getByLabelText(
			"Session ID",
		) as HTMLInputElement;
		fireEvent.change(sessionInput, { target: { value: "test-session" } });
		expect(sessionInput.value).toBe("test-session");
	});

	it("simulates joining a session", async () => {
		// Mock fetch
		global.fetch = vi.fn().mockResolvedValue({
			ok: true,
			text: () => Promise.resolve(""),
			json: () =>
				Promise.resolve({
					session: {
						sessionId: "session-123",
						users: [{ userId: "test-user", joinedAt: Date.now() }],
						createdAt: Date.now(),
					},
					realtime: { token: "mock-token", meetingId: "mock-id" },
				}),
		});

		render(
			<MemoryRouter initialEntries={["/"]}>
				<Routes>
					<Route path="/" element={<VoiceChat />} />
					<Route path="/:sessionId" element={<VoiceChat />} />
				</Routes>
			</MemoryRouter>,
		);
		const userInput = screen.getByLabelText("User ID");
		fireEvent.change(userInput, { target: { value: "test-user" } });

		const sessionInput = screen.getByLabelText("Session ID");
		fireEvent.change(sessionInput, { target: { value: "session-123" } });

		const joinBtn = screen.getByText("Join Session");
		expect(joinBtn).toBeEnabled();

		fireEvent.click(joinBtn);

		await waitFor(() => {
			expect(screen.getByText("Session: session-123")).toBeInTheDocument();
		});

		expect(screen.getByText("test-user")).toBeInTheDocument();
		expect(screen.getByText("(You)")).toBeInTheDocument();
	});
});
