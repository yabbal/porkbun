import { defineCommand } from "citty";
import { getClient } from "../config";
import { type OutputFormat, output, outputError } from "../output";

export const ping = defineCommand({
	meta: { name: "ping", description: "Test API authentication" },
	args: {
		format: {
			type: "string",
			description: "Output format: json, table, csv",
			default: "json",
		},
	},
	async run({ args }) {
		try {
			const client = getClient();
			const result = await client.ping();
			output(result, { format: args.format as OutputFormat });
		} catch (e) {
			outputError(e);
		}
	},
});
