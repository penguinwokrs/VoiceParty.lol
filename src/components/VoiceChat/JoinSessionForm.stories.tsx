import type { Meta, StoryObj } from "@storybook/react";
import { expect, within } from "@storybook/test";
import { JoinSessionForm } from "./JoinSessionForm";

const meta: Meta<typeof JoinSessionForm> = {
	title: "VoiceChat/JoinSessionForm",
	component: JoinSessionForm,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],
	argTypes: {
		onSummonerIdChange: { action: "summoner id changed" },
		onSessionIdChange: { action: "session id changed" },
		onJoin: { action: "join clicked" },
	},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		summonerId: "",
		sessionId: "",
		loading: false,
		error: "",
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		// Verify form elements are rendered
		await expect(canvas.getByLabelText("Summoner ID")).toBeInTheDocument();
		await expect(canvas.getByLabelText("Game ID")).toBeInTheDocument();
		await expect(
			canvas.getByRole("button", { name: /join/i }),
		).toBeInTheDocument();
		// Verify button is disabled when fields are empty
		await expect(canvas.getByRole("button", { name: /join/i })).toBeDisabled();
	},
};

export const Filled: Story = {
	args: {
		summonerId: "MySummonerName",
		sessionId: "MyGameID",
		loading: false,
		error: "",
	},
	play: async ({ canvasElement, args }) => {
		const canvas = within(canvasElement);
		// Verify form fields are filled
		const summonerInput = canvas.getByLabelText("Summoner ID");
		const sessionInput = canvas.getByLabelText("Game ID");
		await expect(summonerInput).toHaveValue(args.summonerId);
		await expect(sessionInput).toHaveValue(args.sessionId);
		// Verify button is enabled when fields are filled
		await expect(
			canvas.getByRole("button", { name: /join/i }),
		).not.toBeDisabled();
	},
};

export const Loading: Story = {
	args: {
		summonerId: "MySummonerName",
		sessionId: "MyGameID",
		loading: true,
		error: "",
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		// Verify loading state
		await expect(canvas.getByRole("progressbar")).toBeInTheDocument();
		// Verify button is disabled during loading
		await expect(canvas.getByRole("button")).toBeDisabled();
	},
};

export const WithError: Story = {
	args: {
		summonerId: "MySummonerName",
		sessionId: "MyGameID",
		loading: false,
		error: "Session not found",
	},
	play: async ({ canvasElement, args }) => {
		const canvas = within(canvasElement);
		// Verify error message is displayed
		await expect(canvas.getByRole("alert")).toBeInTheDocument();
		await expect(canvas.getByText(args.error)).toBeInTheDocument();
	},
};

export const DisabledSessionInput: Story = {
	args: {
		summonerId: "",
		sessionId: "preset-session-id",
		loading: false,
		error: "",
		disableSessionInput: true,
	},
	play: async ({ canvasElement, args }) => {
		const canvas = within(canvasElement);
		// Verify session input is disabled
		const sessionInput = canvas.getByLabelText("Game ID");
		await expect(sessionInput).toBeDisabled();
		await expect(sessionInput).toHaveValue(args.sessionId);
		// Verify summoner input is still enabled
		await expect(canvas.getByLabelText("Summoner ID")).not.toBeDisabled();
	},
};
