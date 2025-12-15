import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { VoiceChat } from "./index";

describe("VoiceChat", () => {
	it("renders login form initially", () => {
		render(<VoiceChat />);
		expect(screen.getByText("Voice Chat")).toBeInTheDocument();
		expect(screen.getByLabelText("User ID")).toBeInTheDocument();
		expect(screen.getByLabelText("Session ID")).toBeInTheDocument();
	});

	it("Create New button is disabled without User ID", () => {
		render(<VoiceChat />);
		const createBtn = screen.getByText("Create New");
		expect(createBtn).toBeDisabled();
	});

	it("updates input fields", () => {
		render(<VoiceChat />);
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
		render(<VoiceChat />);
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
