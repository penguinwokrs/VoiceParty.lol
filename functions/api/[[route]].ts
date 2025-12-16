import { Hono } from "hono";
import { handle } from "hono/cloudflare-pages";
import auth from "./_routes/auth";
import sessions from "./_routes/sessions";
import type { Bindings } from "./_types";

const app = new Hono<{ Bindings: Bindings }>().basePath("/api");

app.get("/", (c) => {
	return c.text("Voice Chat Worker is running! (API)");
});

app.route("/auth", auth);
app.route("/sessions", sessions);

export const onRequest = handle(app);
export { app };
