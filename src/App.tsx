import { CssBaseline, createTheme, ThemeProvider } from "@mui/material";
import { RouterProvider } from "react-router-dom";
import { router } from "./routes";

const darkTheme = createTheme({
	palette: {
		mode: "dark",
	},
});

function App() {
	return (
		<ThemeProvider theme={darkTheme}>
			<CssBaseline />
			<RouterProvider router={router} />
		</ThemeProvider>
	);
}

export default App;
