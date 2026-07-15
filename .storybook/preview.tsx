import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
// Design tokens (CSS variables) used by the branded components.
import "../src/theme/tokens.generated.css";

import { CssBaseline, ThemeProvider } from "@mui/material";
import type { Decorator, Preview } from "@storybook/react-vite";
import { useEffect } from "react";
import i18n from "../src/i18n";
import { theme } from "../src/theme";

// Language switcher in the Storybook toolbar (this app ships en / ja / ko).
export const globalTypes = {
	locale: {
		description: "Language",
		defaultValue: "en",
		toolbar: {
			icon: "globe",
			items: [
				{ value: "en", title: "English" },
				{ value: "ja", title: "日本語" },
				{ value: "ko", title: "한국어" },
			],
			dynamicTitle: true,
		},
	},
};

// Sync the toolbar locale into i18n as a side effect (never during render).
const LocaleSync = ({ locale }: { locale: string }) => {
	useEffect(() => {
		if (i18n.resolvedLanguage !== locale) {
			void i18n.changeLanguage(locale);
		}
	}, [locale]);
	return null;
};

const withProviders: Decorator = (Story, context) => {
	const locale = context.globals.locale ?? "en";
	return (
		<ThemeProvider theme={theme}>
			<CssBaseline />
			<LocaleSync locale={locale} />
			<Story />
		</ThemeProvider>
	);
};

const preview: Preview = {
	parameters: {
		layout: "centered",
		controls: {
			matchers: { color: /(background|color)$/i, date: /Date$/i },
		},
		backgrounds: {
			default: "app",
			values: [
				{ name: "app", value: "#0a1428" },
				{ name: "light", value: "#ffffff" },
			],
		},
	},
	decorators: [withProviders],
};

export default preview;
