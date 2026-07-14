import { createTheme } from "@mui/material";
import { cssVar, tokens } from "./tokens.generated";

// The MUI theme is built from generated design tokens (design/tokens.json).
// Concrete hex values are fed to createTheme so MUI can still derive
// light/dark/contrast variants (it cannot parse `var(--x)` for that).
export const theme = createTheme({
	palette: {
		mode: "dark",
		primary: { main: tokens["color.semantic.primary"] },
		secondary: { main: tokens["color.semantic.secondary"] },
		background: {
			default: tokens["color.bg.base"],
			paper: tokens["color.bg.elevated"],
		},
		text: {
			primary: tokens["color.text.primary"],
			secondary: tokens["color.text.secondary"],
		},
	},
	shape: {
		borderRadius: Number.parseInt(tokens["radius.md"], 10),
	},
	typography: {
		fontFamily: tokens["font.family.base"],
	},
});

// Re-export token helpers so components can reference tokens without reaching
// into the generated file directly.
export { cssVar, tokens };
