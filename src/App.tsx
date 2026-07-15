import { CssBaseline, ThemeProvider } from "@mui/material";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { LangLayout } from "./components/LangLayout";
import { JoinPage } from "./pages/JoinPage";
import { LandingPage } from "./pages/LandingPage";
import { PrivacyPage } from "./pages/PrivacyPage";
import { TermsPage } from "./pages/TermsPage";
import { theme } from "./theme";

function App() {
	return (
		<ThemeProvider theme={theme}>
			<CssBaseline />

			<BrowserRouter>
				<Routes>
					{/* Default language (English), served without a path prefix. */}
					<Route element={<LangLayout />}>
						<Route path="/" element={<LandingPage />} />
						<Route path="/join" element={<JoinPage />} />
						<Route path="/join/:sessionId" element={<JoinPage />} />
						<Route path="/privacy" element={<PrivacyPage />} />
						<Route path="/terms" element={<TermsPage />} />
					</Route>

					{/* Prefixed languages: /ja, /ko (and their sub-routes). */}
					<Route path=":lang" element={<LangLayout />}>
						<Route index element={<LandingPage />} />
						<Route path="join" element={<JoinPage />} />
						<Route path="join/:sessionId" element={<JoinPage />} />
						<Route path="privacy" element={<PrivacyPage />} />
						<Route path="terms" element={<TermsPage />} />
					</Route>
				</Routes>
			</BrowserRouter>
		</ThemeProvider>
	);
}

export default App;
