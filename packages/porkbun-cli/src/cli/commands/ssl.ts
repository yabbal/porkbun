import { defineCommand } from "citty";
import { getClient } from "../config";
import { type OutputFormat, output, outputError } from "../output";

export const ssl = defineCommand({
	meta: { name: "ssl", description: "Retrieve SSL certificate bundle" },
	args: {
		domain: {
			type: "positional",
			description: "Domain name",
			required: true,
		},
		format: {
			type: "string",
			description: "Output format: json, table, csv",
			default: "json",
		},
	},
	async run({ args }) {
		try {
			const client = getClient();
			const result = await client.ssl.retrieve(args.domain);
			output(result, { format: args.format as OutputFormat });
		} catch (e) {
			outputError(e);
		}
	},
});
