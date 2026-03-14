import { defineCommand } from "citty";

declare const __VERSION__: string;

export const version = defineCommand({
	meta: { name: "version", description: "Show CLI version" },
	run() {
		console.log(__VERSION__);
	},
});
