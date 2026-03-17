import "dotenv/config";
import { defineCommand, runMain } from "citty";
import { auth } from "./commands/auth";
import { dns } from "./commands/dns";
import { dnssec } from "./commands/dnssec";
import { domain } from "./commands/domain";
import { email } from "./commands/email";
import { ping } from "./commands/ping";
import { pricing } from "./commands/pricing";
import { ssl } from "./commands/ssl";
import { version } from "./commands/version";

declare const __VERSION__: string;

const main = defineCommand({
	meta: {
		name: "porkbun",
		version: __VERSION__,
		description: "Porkbun CLI — manage domains, DNS, SSL and more",
	},
	subCommands: {
		ping,
		pricing,
		domain,
		dns,
		dnssec,
		ssl,
		email,
		auth,
		version,
	},
});

runMain(main);
