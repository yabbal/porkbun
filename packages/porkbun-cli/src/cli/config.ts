import { PorkbunClient } from "porkbun-sdk";

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
