import { Hono } from "hono";
import { handle } from "hono/cloudflare-pages";
import auth from "./routes/auth";
import sessions from "./routes/sessions";
import type { Bindings } from "./types";

const app = new Hono<{ Bindings: Bindings }>().basePath("/api");

app.get("/", (c) => {
	return c.text("Voice Chat Worker is running! (API)");
});

app.route("/auth", auth);
app.route("/sessions", sessions);

export const onRequest = handle(app);
export { app };
