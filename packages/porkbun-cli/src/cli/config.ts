import { PorkbunClient } from "porkbun-sdk";
import { loadSession } from "./session";

export const getClient = (): PorkbunClient => {
	const apikey = process.env.PORKBUN_API_KEY;
	const secretapikey = process.env.PORKBUN_API_SECRET;

	if (!apikey || !secretapikey) {
		console.error(
			JSON.stringify({
				error: "Missing credentials",
				message:
					"Set PORKBUN_API_KEY and PORKBUN_API_SECRET environment variables",
			}),
		);
		process.exit(1);
	}

	return new PorkbunClient({ apikey, secretapikey });
};

export const getWebSession = () => {
	const cookie = process.env.PORKBUN_WEB_COOKIE ?? loadSession()?.cookie;

	if (!cookie) {
		console.error(
			JSON.stringify({
				error: "Missing web session",
				message: "Run 'porkbun auth login' to save your session cookie",
			}),
		);
		process.exit(1);
	}

	const csrfMatch = cookie.match(/csrf_pb=([^;]+)/);

	if (!csrfMatch) {
		console.error(
			JSON.stringify({
				error: "Missing CSRF token",
				message: "PORKBUN_WEB_COOKIE must contain the csrf_pb cookie",
			}),
		);
		process.exit(1);
	}

	return { cookie, csrf: csrfMatch[1] };
};
