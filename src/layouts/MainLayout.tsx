import { Box, Container, Typography } from "@mui/material";
import { Outlet } from "react-router-dom";

export function MainLayout() {
	return (
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
				<Outlet />
			</Box>
		</Container>
	);
}
