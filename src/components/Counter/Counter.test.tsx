import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Counter } from "./index";

describe("Counter", () => {
	it("renders initial count", () => {
		render(<Counter />);
		expect(screen.getByTestId("count-display")).toHaveTextContent("count is 0");
	});

	it("increments count when clicked", () => {
		render(<Counter />);
		const button = screen.getByText("Increment");
		fireEvent.click(button);
		expect(screen.getByTestId("count-display")).toHaveTextContent("count is 1");
	});

	it("decrements count when clicked", () => {
		render(<Counter />);
		const button = screen.getByText("Decrement");
		fireEvent.click(button);
		expect(screen.getByTestId("count-display")).toHaveTextContent(
			"count is -1",
		);
	});
});
