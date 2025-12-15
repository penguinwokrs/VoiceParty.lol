import { Box, Stack, Typography } from "@mui/material";
import { useState } from "react";
import { Button } from "../Button";

export const Counter = () => {
	const [count, setCount] = useState(0);

	return (
		<Box
			sx={{
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				gap: 2,
			}}
		>
			<Typography variant="h3" data-testid="count-display" fontWeight="bold">
				count is {count}
			</Typography>
			<Stack direction="row" spacing={2}>
				<Button
					variant="contained"
					onClick={() => setCount((count) => count + 1)}
				>
					Increment
				</Button>
				<Button
					variant="outlined"
					onClick={() => setCount((count) => count - 1)}
				>
					Decrement
				</Button>
			</Stack>
		</Box>
	);
};
