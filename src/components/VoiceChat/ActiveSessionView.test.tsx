import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ActiveSessionView } from "./ActiveSessionView";
import type { Session } from "./types";

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
