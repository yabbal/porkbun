import { defineCommand } from "citty";
import consola from "consola";
import { outputError } from "../output";
import {
	clearSession,
	loadSession,
	SESSION_PATH,
	saveSession,
} from "../session";

const login = defineCommand({
	meta: {
		name: "login",
		description: "Save web session cookie for email forwarding",
	},
	async run() {
		try {
			consola.info("To get your cookie:");
			consola.info("1. Go to porkbun.com and login");
			consola.info("2. Open DevTools (F12) → Network tab → click any request");
			consola.info("3. Copy the full Cookie header value");
			console.log();

			const cookie = await consola.prompt("Paste your cookie:", {
				type: "text",
			});

			if (typeof cookie !== "string" || !cookie.trim()) {
				consola.error("No cookie provided");
				process.exit(1);
			}

			if (!cookie.includes("csrf_pb=")) {
				consola.error("Invalid cookie — must contain csrf_pb");
				process.exit(1);
			}

			if (!cookie.includes("BUNSESSION2=")) {
				consola.error(
					"Invalid cookie — must contain BUNSESSION2 (are you logged in?)",
				);
				process.exit(1);
			}

			saveSession(cookie.trim());
			consola.success(`Session saved to ${SESSION_PATH}`);
		} catch (e) {
			outputError(e);
		}
	},
});

const status = defineCommand({
	meta: { name: "status", description: "Check saved web session" },
	async run() {
		const session = loadSession();
		if (!session) {
			consola.warn("No session saved. Run: porkbun auth login");
			return;
		}
		consola.success(`Session found (saved ${session.savedAt})`);
	},
});

const logout = defineCommand({
	meta: { name: "logout", description: "Clear saved web session" },
	async run() {
		clearSession();
		consola.success("Session cleared");
	},
});

export const auth = defineCommand({
	meta: {
		name: "auth",
		description: "Manage web authentication for email forwarding",
	},
	subCommands: {
		login,
		status,
		logout,
	},
});
