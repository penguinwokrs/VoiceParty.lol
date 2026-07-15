import { createTheme } from "@mui/material";
import { cssVar, tokens } from "./tokens.generated";

// Refined modern-gaming theme (LoL-inspired teal/gold on deep navy), built
// entirely from generated design tokens (design/tokens.json). Concrete values
// are fed to createTheme so MUI can derive hover/contrast variants.
const t = tokens;

export const theme = createTheme({
	palette: {
		mode: "dark",
		primary: { main: t["color.brand.teal"], contrastText: t["color.bg.base"] },
		secondary: {
			main: t["color.brand.gold"],
			contrastText: t["color.bg.base"],
		},
		background: {
			default: t["color.bg.base"],
			paper: t["color.bg.surface"],
		},
		text: {
			primary: t["color.text.primary"],
			secondary: t["color.text.secondary"],
		},
		success: { main: t["color.state.success"] },
		error: { main: t["color.state.error"] },
		divider: t["color.border.subtle"],
	},
	shape: {
		borderRadius: Number.parseInt(t["radius.md"], 10),
	},
	typography: {
		fontFamily: t["font.family.base"],
		h1: { fontWeight: 900, letterSpacing: "0.04em" },
		h2: { fontWeight: 800, letterSpacing: "0.04em" },
		h5: { fontWeight: 600, letterSpacing: "0.01em" },
		button: { textTransform: "none", fontWeight: 600, letterSpacing: "0.02em" },
	},
	components: {
		MuiCssBaseline: {
			styleOverrides: {
				body: {
					minHeight: "100vh",
					color: t["color.text.primary"],
					backgroundColor: t["color.bg.base"],
					backgroundImage: `radial-gradient(1100px 620px at 50% -18%, ${t["color.bg.gradientTop"]} 0%, transparent 58%)`,
					backgroundAttachment: "fixed",
				},
			},
		},
		MuiPaper: {
			styleOverrides: {
				root: {
					backgroundImage: "none",
					backgroundColor: t["color.bg.surface"],
					border: `1px solid ${t["color.border.subtle"]}`,
					borderRadius: t["radius.lg"],
				},
			},
		},
		MuiCard: {
			defaultProps: { elevation: 0 },
			styleOverrides: {
				root: {
					backgroundImage: "none",
					backgroundColor: t["color.bg.surface"],
					border: `1px solid ${t["color.border.subtle"]}`,
					borderRadius: t["radius.lg"],
					boxShadow: t["shadow.card"],
					backdropFilter: "blur(6px)",
				},
			},
		},
		MuiOutlinedInput: {
			styleOverrides: {
				root: {
					borderRadius: t["radius.md"],
					backgroundColor: "rgba(255,255,255,0.02)",
					"& .MuiOutlinedInput-notchedOutline": {
						borderColor: t["color.border.subtle"],
					},
					"&:hover .MuiOutlinedInput-notchedOutline": {
						borderColor: t["color.border.strong"],
					},
					"&.Mui-focused .MuiOutlinedInput-notchedOutline": {
						borderColor: t["color.brand.teal"],
						borderWidth: 1,
					},
					"&.Mui-focused": {
						boxShadow: t["shadow.glowTeal"],
					},
				},
			},
		},
		MuiInputLabel: {
			styleOverrides: {
				root: {
					color: t["color.text.secondary"],
					"&.Mui-focused": { color: t["color.brand.teal"] },
				},
			},
		},
		MuiButton: {
			defaultProps: { disableElevation: true },
			styleOverrides: {
				root: {
					borderRadius: t["radius.md"],
					paddingInline: t["space.6"],
					paddingBlock: t["space.3"],
					"&.Mui-disabled": {
						background: t["color.bg.surfaceHover"],
						color: t["color.text.muted"],
						boxShadow: "none",
					},
				},
				containedPrimary: {
					background: `linear-gradient(180deg, ${t["color.brand.teal"]} 0%, ${t["color.brand.tealDark"]} 100%)`,
					color: t["color.bg.base"],
					"&:hover": {
						background: `linear-gradient(180deg, ${t["color.brand.tealHover"]} 0%, ${t["color.brand.teal"]} 100%)`,
						boxShadow: t["shadow.glowTeal"],
					},
				},
				containedSecondary: {
					background: `linear-gradient(180deg, ${t["color.brand.gold"]} 0%, ${t["color.brand.goldDark"]} 100%)`,
					color: t["color.bg.base"],
					"&:hover": {
						background: `linear-gradient(180deg, ${t["color.brand.goldHover"]} 0%, ${t["color.brand.gold"]} 100%)`,
						boxShadow: t["shadow.glowGold"],
					},
				},
				outlined: {
					borderColor: t["color.border.strong"],
				},
			},
		},
		MuiIconButton: {
			styleOverrides: {
				root: { borderRadius: t["radius.md"] },
			},
		},
		MuiAvatar: {
			styleOverrides: {
				root: {
					border: `1px solid ${t["color.border.subtle"]}`,
				},
			},
		},
		MuiAlert: {
			styleOverrides: {
				root: { borderRadius: t["radius.md"] },
			},
		},
	},
});

export { cssVar, tokens };
