import {
	Box,
	Container,
	CssBaseline,
	ThemeProvider,
	Typography,
} from "@mui/material";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { VoiceChat } from "./components/VoiceChat";
import { LandingPage } from "./pages/LandingPage";
import { theme } from "./theme";

function App() {
	return (
		<ThemeProvider theme={theme}>
			<CssBaseline />

			<BrowserRouter>
				<Routes>
					<Route path="/" element={<LandingPage />} />
					<Route
						path="/join"
						element={
							<Container maxWidth="md" sx={{ textAlign: "center", py: 4 }}>
								<Typography
									variant="h2"
									component="h1"
									gutterBottom
									sx={{ fontSize: "3.2rem" }}
								>
									Voice Party
								</Typography>
								<Typography
									variant="subtitle1"
									color="text.secondary"
									paragraph
								>
									Cloudflare Realtime Voice Chat Demo
								</Typography>

								<Box
									sx={{
										display: "flex",
										flexDirection: "column",
										gap: 4,
										alignItems: "center",
									}}
								>
									{/* Main Voice Chat Component */}
									<VoiceChat />
								</Box>
							</Container>
						}
					/>
					<Route
						path="/join/:sessionId"
						element={
							<Container maxWidth="md" sx={{ textAlign: "center", py: 4 }}>
								<Typography
									variant="h2"
									component="h1"
									gutterBottom
									sx={{ fontSize: "3.2rem" }}
								>
									Voice Party
								</Typography>
								<Typography
									variant="subtitle1"
									color="text.secondary"
									paragraph
								>
									Cloudflare Realtime Voice Chat Demo
								</Typography>

								<Box
									sx={{
										display: "flex",
										flexDirection: "column",
										gap: 4,
										alignItems: "center",
									}}
								>
									{/* Main Voice Chat Component */}
									<VoiceChat />
								</Box>
							</Container>
						}
					/>
				</Routes>
			</BrowserRouter>
		</ThemeProvider>
	);
}

export default App;
