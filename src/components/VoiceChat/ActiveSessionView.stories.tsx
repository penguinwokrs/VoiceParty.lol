import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { ActiveSessionView } from "./ActiveSessionView";
import type { Session } from "./types";

const session: Session = {
	sessionId: "GAME-DEMO-1234",
	users: [
		{ summonerId: "Ashe#JP1", joinedAt: 1 },
		{ summonerId: "Zed#JP1", joinedAt: 2 },
	],
	createdAt: 0,
};

const peers = [
	{ id: "p1", customParticipantId: "Zed#JP1" },
	{ id: "p2", customParticipantId: "Yasuo#NA1" },
];

const meta = {
	title: "VoiceChat/ActiveSessionView",
	component: ActiveSessionView,
	parameters: { layout: "centered" },
	args: {
		session,
		summonerId: "Ashe#JP1",
		isConnected: true,
		connectionState: "connected",
		isMicMuted: false,
		loading: false,
		error: "",
		peers,
		noiseSuppression: false,
		onErrorClose: fn(),
		onToggleMic: fn(),
		onLeave: fn(),
		onReconnect: fn(),
		onToggleNoiseSuppression: fn(),
	},
	argTypes: {
		connectionState: {
			control: "inline-radio",
			options: ["connecting", "connected", "reconnecting", "disconnected"],
		},
	},
} satisfies Meta<typeof ActiveSessionView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Connected: Story = {};

export const Connecting: Story = {
	args: { connectionState: "connecting", isConnected: false },
};

export const Reconnecting: Story = {
	args: { connectionState: "reconnecting", isConnected: false },
};

export const Disconnected: Story = {
	args: { connectionState: "disconnected", isConnected: false },
};

export const Solo: Story = {
	args: { peers: [] },
};

export const MicMuted: Story = {
	args: { isMicMuted: true },
};

export const NoiseSuppressionOn: Story = {
	args: { noiseSuppression: true },
};

export const WithError: Story = {
	args: { error: "Joined session but voice connection failed" },
};
