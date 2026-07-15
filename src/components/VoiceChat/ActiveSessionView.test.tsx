import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ActiveSessionView } from "./ActiveSessionView";
import type { ConnectionState, Session } from "./types";

const session: Session = {
	sessionId: "game-abc",
	users: [
		{ summonerId: "Ashe#JP1", joinedAt: 1 },
		{ summonerId: "Zed#JP1", joinedAt: 2, iconUrl: "https://cdn/icon.png" },
	],
	createdAt: 0,
};

const noop = () => {};

type TestPeer = {
	id: string;
	name?: string;
	customParticipantId?: string;
	summonerId?: string;
};

const renderView = (peers: TestPeer[]) =>
	render(
		<ActiveSessionView
			session={session}
			summonerId="Ashe#JP1"
			isConnected
			isMicMuted={false}
			loading={false}
			error=""
			onErrorClose={noop}
			onToggleMic={noop}
			onLeave={noop}
			peers={peers}
		/>,
	);

describe("ActiveSessionView participants", () => {
	it("shows a remote peer's Summoner ID (customParticipantId), not the internal id", () => {
		renderView([
			{
				id: "rtk-uuid-xyz",
				name: "Zed#JP1",
				customParticipantId: "Zed#JP1",
			},
		]);
		expect(screen.getByText("Zed#JP1")).toBeInTheDocument();
		// The internal RealtimeKit participant id must never be shown as the name.
		expect(screen.queryByText("rtk-uuid-xyz")).not.toBeInTheDocument();
	});

	it("falls back to the participant name when customParticipantId is absent", () => {
		renderView([{ id: "rtk-uuid-2", name: "Yasuo#NA1" }]);
		expect(screen.getByText("Yasuo#NA1")).toBeInTheDocument();
		expect(screen.queryByText("rtk-uuid-2")).not.toBeInTheDocument();
	});

	it("still renders the local user", () => {
		renderView([]);
		expect(screen.getByText("Ashe#JP1")).toBeInTheDocument();
		expect(screen.getByText("(You)")).toBeInTheDocument();
	});
});

describe("ActiveSessionView connection state", () => {
	const renderWithState = (
		connectionState: ConnectionState,
		onReconnect = noop,
	) =>
		render(
			<ActiveSessionView
				session={session}
				summonerId="Ashe#JP1"
				isConnected={connectionState === "connected"}
				connectionState={connectionState}
				isMicMuted={false}
				loading={false}
				error=""
				onErrorClose={noop}
				onToggleMic={noop}
				onLeave={noop}
				onReconnect={onReconnect}
				peers={[{ id: "p1", customParticipantId: "Zed#JP1" }]}
			/>,
		);

	it("shows the reconnecting phase and marks the roster as reconnecting", () => {
		renderWithState("reconnecting");
		// "Reconnecting" appears in the banner and on the remote peer's status.
		expect(screen.getAllByText("Reconnecting").length).toBeGreaterThan(0);
		// The local user is labelled as reconnecting too.
		expect(screen.getByText(/\(You\) · Reconnecting/)).toBeInTheDocument();
	});

	it("shows a Reconnect button on terminal disconnect and calls onReconnect", () => {
		const onReconnect = vi.fn();
		renderWithState("disconnected", onReconnect);
		const btn = screen.getByRole("button", { name: "Reconnect" });
		fireEvent.click(btn);
		expect(onReconnect).toHaveBeenCalledTimes(1);
	});

	it("mic toggle is disabled while not connected", () => {
		renderWithState("reconnecting");
		// Mic + leave buttons render; the mic button is disabled when unhealthy.
		const disabled = screen
			.getAllByRole("button")
			.filter((b) => (b as HTMLButtonElement).disabled);
		expect(disabled.length).toBeGreaterThan(0);
	});
});
