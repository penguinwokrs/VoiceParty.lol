import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "./index";

const meta = {
	title: "Components/Button",
	component: Button,
	args: { children: "Join Game" },
	argTypes: {
		variant: {
			control: "inline-radio",
			options: ["contained", "outlined", "text"],
		},
		color: {
			control: "inline-radio",
			options: ["primary", "secondary", "error", "success"],
		},
		disabled: { control: "boolean" },
	},
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Contained: Story = { args: { variant: "contained" } };
export const Outlined: Story = { args: { variant: "outlined" } };
export const Text: Story = { args: { variant: "text" } };
export const Disabled: Story = { args: { disabled: true } };
