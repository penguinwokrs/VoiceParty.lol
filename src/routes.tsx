import { createBrowserRouter } from "react-router-dom";
import { MainLayout } from "./layouts/MainLayout";
import { LandingPage } from "./pages/LandingPage";
import { VoiceChatPage } from "./pages/VoiceChatPage";

export const router = createBrowserRouter([
	{
		path: "/",
		element: <LandingPage />,
	},
	{
		element: <MainLayout />,
		children: [
			{
				path: "/join",
				element: <VoiceChatPage />,
			},
			{
				path: "/join/:sessionId",
				element: <VoiceChatPage />,
			},
		],
	},
]);
