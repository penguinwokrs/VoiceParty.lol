import {
	Box,
	Card,
	Container,
	CssBaseline,
	createTheme,
	ThemeProvider,
	Typography,
} from "@mui/material";
import { Counter } from "./components/Counter";
import { VoiceChat } from "./components/VoiceChat";

const darkTheme = createTheme({
	palette: {
		mode: "dark",
	},
});

function App() {
	return (
		<ThemeProvider theme={darkTheme}>
			<CssBaseline />
			<Container maxWidth="md" sx={{ textAlign: "center", py: 4 }}>
				<Typography
					variant="h2"
					component="h1"
					gutterBottom
					sx={{ fontSize: "3.2rem" }}
				>
					Voice Party
				</Typography>
				<Typography variant="subtitle1" color="text.secondary" paragraph>
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
					<VoiceChat />

					<Card sx={{ p: 4, width: "100%", maxWidth: 400 }}>
						<Typography variant="h6" gutterBottom>
							Counter Demo
						</Typography>
						<Counter />
					</Card>
				</Box>
			</Container>
		</ThemeProvider>
	);
}

export default App;
