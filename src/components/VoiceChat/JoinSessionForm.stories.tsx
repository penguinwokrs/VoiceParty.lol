import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { JoinSessionForm } from "./JoinSessionForm";

const meta = {
	title: "VoiceChat/JoinSessionForm",
	component: JoinSessionForm,
	parameters: { layout: "centered" },
	args: {
		summonerId: "",
		sessionId: "",
		loading: false,
		error: "",
		onSummonerIdChange: fn(),
		onSessionIdChange: fn(),
		onJoin: fn(),
	},
} satisfies Meta<typeof JoinSessionForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {};

export const Filled: Story = {
	args: { summonerId: "Ashe#JP1", sessionId: "GAME-1234" },
};

export const Loading: Story = {
	args: { summonerId: "Ashe#JP1", sessionId: "GAME-1234", loading: true },
};

export const WithError: Story = {
	args: { error: "Summoner name and game ID are required" },
};

export const SessionLocked: Story = {
	args: { sessionId: "GAME-1234", disableSessionInput: true },
};
