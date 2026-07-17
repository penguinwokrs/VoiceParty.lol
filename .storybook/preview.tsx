// Keep this font set in sync with src/main.tsx, or stories render in a
// different typeface than the app.
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "@fontsource/space-grotesk/500.css";
import "@fontsource/space-grotesk/600.css";
import "@fontsource/space-grotesk/700.css";
import "@fontsource/jetbrains-mono/400.css";
import "@fontsource/jetbrains-mono/500.css";
import "@fontsource/jetbrains-mono/700.css";
import "@fontsource/noto-sans-jp/400.css";
import "@fontsource/noto-sans-jp/500.css";
import "@fontsource/noto-sans-jp/700.css";
import "@fontsource/noto-sans-kr/400.css";
import "@fontsource/noto-sans-kr/500.css";
import "@fontsource/noto-sans-kr/700.css";
import "@fontsource/noto-sans-tc/400.css";
import "@fontsource/noto-sans-tc/500.css";
import "@fontsource/noto-sans-tc/700.css";
// Design tokens (CSS variables) used by the branded components.
import "../src/theme/tokens.generated.css";
import "../src/theme/lang-fonts.css";

import { CssBaseline, ThemeProvider } from "@mui/material";
import type { Decorator, Preview } from "@storybook/react-vite";
import { useEffect } from "react";
import i18n from "../src/i18n";
import { theme } from "../src/theme";

// Language switcher in the Storybook toolbar (this app ships en / ja / ko /
// zh-TW). Keep in sync with supportedLanguages in src/i18n/index.ts.
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
				{ value: "zh-TW", title: "繁體中文" },
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
		// LangLayout does this in the app; mirror it here so lang-fonts.css picks
		// the right CJK face in stories too.
		document.documentElement.lang = locale;
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
				// color.bg.base — the Signal on Ink surface (design/tokens.json).
				{ name: "app", value: "#0B0E13" },
				{ name: "light", value: "#ffffff" },
			],
		},
	},
	decorators: [withProviders],
};

export default preview;
