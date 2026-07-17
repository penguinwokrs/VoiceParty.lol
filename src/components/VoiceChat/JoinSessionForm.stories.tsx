import type { Meta, StoryObj } from "@storybook/react-vite";
import { MemoryRouter } from "react-router-dom";
import { fn } from "storybook/test";
import { JoinSessionForm } from "./JoinSessionForm";

const meta = {
	title: "VoiceChat/JoinSessionForm",
	component: JoinSessionForm,
	// The consent notice links to /terms and /privacy, so a Router is required.
	decorators: [
		(Story) => (
			<MemoryRouter>
				<Story />
			</MemoryRouter>
		),
	],
	parameters: { layout: "centered" },
	args: {
		summonerId: "",
		sessionId: "",
		region: "",
		loading: false,
		error: "",
		onSummonerIdChange: fn(),
		onSessionIdChange: fn(),
		onRegionChange: fn(),
		onJoin: fn(),
	},
} satisfies Meta<typeof JoinSessionForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {};

export const Filled: Story = {
	args: { summonerId: "Nova#JP1", sessionId: "GAME-1234", region: "jp1" },
};

export const Loading: Story = {
	args: {
		summonerId: "Nova#JP1",
		sessionId: "GAME-1234",
		region: "jp1",
		loading: true,
	},
};

export const WithError: Story = {
	args: { error: "Summoner name and game ID are required" },
};

export const SessionLocked: Story = {
	args: { sessionId: "GAME-1234", disableSessionInput: true },
};
