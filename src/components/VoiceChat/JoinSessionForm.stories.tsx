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
		region: "",
		loading: false,
		error: "",
		onSummonerIdChange: fn(),
		onRegionChange: fn(),
		onJoin: fn(),
	},
} satisfies Meta<typeof JoinSessionForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {};

export const Filled: Story = {
	args: { summonerId: "Nova#JP1", region: "jp1" },
};

export const Loading: Story = {
	args: {
		summonerId: "Nova#JP1",
		region: "jp1",
		loading: true,
	},
};

export const WithError: Story = {
	args: { error: "Riot ID is required" },
};

// Following an invite link pins the region: you can't play across platforms.
export const RegionLocked: Story = {
	args: { summonerId: "Nova#JP1", region: "jp1", disableRegionInput: true },
};
