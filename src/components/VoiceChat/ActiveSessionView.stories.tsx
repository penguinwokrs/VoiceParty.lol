import type { Meta, StoryObj } from "@storybook/react";
import { ActiveSessionView } from "./ActiveSessionView";

const meta: Meta<typeof ActiveSessionView> = {
	title: "VoiceChat/ActiveSessionView",
	component: ActiveSessionView,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],
	argTypes: {
		onToggleMic: { action: "toggled mic" },
		onLeave: { action: "left session" },
		onErrorClose: { action: "closed error" },
	},
};

export default meta;
type Story = StoryObj<typeof meta>;

const mockSession = {
	sessionId: "game-12345",
	users: [
		{
			summonerId: "User1",
			gameName: "User",
			tagLine: "1",
			iconUrl:
				"https://ddragon.leagueoflegends.com/cdn/14.24.1/img/profileicon/1.png",
		},
		{
			summonerId: "User2",
			gameName: "User",
			tagLine: "2",
			iconUrl:
				"https://ddragon.leagueoflegends.com/cdn/14.24.1/img/profileicon/2.png",
		},
		{
			summonerId: "User3",
			gameName: "User",
			tagLine: "3",
			iconUrl:
				"https://ddragon.leagueoflegends.com/cdn/14.24.1/img/profileicon/3.png",
		},
	],
};

const mockPeers = [
	{ id: "peer-1", summonerId: "User2" },
	{ id: "peer-2", summonerId: "User3" },
];

export const Connected: Story = {
	args: {
		session: mockSession,
		summonerId: "User1",
		isConnected: true,
		isMicMuted: false,
		loading: false,
		error: "",
		peers: mockPeers,
	},
};

export const Muted: Story = {
	args: {
		...Connected.args,
		isMicMuted: true,
	},
};

export const Disconnected: Story = {
	args: {
		...Connected.args,
		isConnected: false,
	},
};

export const Loading: Story = {
	args: {
		...Connected.args,
		loading: true,
	},
};

export const WithError: Story = {
	args: {
		...Connected.args,
		error: "Failed to connect to voice server",
	},
};

export const Solo: Story = {
	args: {
		...Connected.args,
		peers: [],
	},
};
