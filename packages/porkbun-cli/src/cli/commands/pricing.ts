import { defineCommand } from "citty";
import { getClient } from "../config";
import { type OutputFormat, output, outputError } from "../output";

export const pricing = defineCommand({
	meta: { name: "pricing", description: "Get domain pricing for all TLDs" },
	args: {
		format: {
			type: "string",
			description: "Output format: json, table, csv",
			default: "json",
		},
		tld: {
			type: "string",
			description: "Filter by specific TLD (e.g. com, net, dev)",
		},
	},
	async run({ args }) {
		try {
			const client = getClient();
			const result = await client.pricing.get();

			if (args.tld) {
				const tld = args.tld.replace(/^\./, "");
				const pricing = result.pricing[tld];
				if (!pricing) {
					outputError(new Error(`TLD ".${tld}" not found`));
					return;
				}
				output(
					{ tld, ...pricing },
					{
						format: args.format as OutputFormat,
						columns: [
							{ key: "tld", header: "TLD" },
							{ key: "registration", header: "Registration" },
							{ key: "renewal", header: "Renewal" },
							{ key: "transfer", header: "Transfer" },
						],
					},
				);
				return;
			}

			if (args.format === "table" || args.format === "csv") {
				const rows = Object.entries(result.pricing).map(([tld, p]) => ({
					tld,
					registration: p.registration,
					renewal: p.renewal,
					transfer: p.transfer,
				}));
				output(rows, {
					format: args.format as OutputFormat,
					columns: [
						{ key: "tld", header: "TLD" },
						{ key: "registration", header: "Registration" },
						{ key: "renewal", header: "Renewal" },
						{ key: "transfer", header: "Transfer" },
					],
				});
			} else {
				output(result);
			}
		} catch (e) {
			outputError(e);
		}
	},
});
