import { defineCommand } from "citty";
import { getClient } from "../config";
import { type OutputFormat, output, outputError } from "../output";
import { dnssecColumns } from "../table-columns";

const list = defineCommand({
	meta: { name: "list", description: "List DNSSEC records" },
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
			const records = await client.dnssec.get(args.domain);

			if (args.format === "table" || args.format === "csv") {
				const rows = Object.values(records);
				output(rows, {
					format: args.format as OutputFormat,
					columns: dnssecColumns,
				});
			} else {
				output(records);
			}
		} catch (e) {
			outputError(e);
		}
	},
});

const create = defineCommand({
	meta: { name: "create", description: "Create a DNSSEC record" },
	args: {
		domain: {
			type: "positional",
			description: "Domain name",
			required: true,
		},
		"key-tag": {
			type: "string",
			description: "Key tag",
			required: true,
		},
		alg: {
			type: "string",
			description: "DS Data algorithm",
			required: true,
		},
		"digest-type": {
			type: "string",
			description: "Digest type",
			required: true,
		},
		digest: {
			type: "string",
			description: "Digest",
			required: true,
		},
		"dry-run": {
			type: "boolean",
			description: "Preview the request without executing",
			default: false,
		},
		format: {
			type: "string",
			description: "Output format: json, table, csv",
			default: "json",
		},
	},
	async run({ args }) {
		try {
			const params = {
				keyTag: args["key-tag"],
				alg: args.alg,
				digestType: args["digest-type"],
				digest: args.digest,
			};

			if (args["dry-run"]) {
				output({
					dry_run: true,
					domain: args.domain,
					payload: params,
				});
				return;
			}

			const client = getClient();
			const result = await client.dnssec.create(args.domain, params);
			output(result, { format: args.format as OutputFormat });
		} catch (e) {
			outputError(e);
		}
	},
});

const deleteRecord = defineCommand({
	meta: { name: "delete", description: "Delete a DNSSEC record" },
	args: {
		domain: {
			type: "positional",
			description: "Domain name",
			required: true,
		},
		"key-tag": {
			type: "string",
			description: "Key tag to delete",
			required: true,
		},
		"dry-run": {
			type: "boolean",
			description: "Preview the request without executing",
			default: false,
		},
		format: {
			type: "string",
			description: "Output format: json, table, csv",
			default: "json",
		},
	},
	async run({ args }) {
		try {
			if (args["dry-run"]) {
				output({
					dry_run: true,
					domain: args.domain,
					action: "delete_dnssec",
					keyTag: args["key-tag"],
				});
				return;
			}

			const client = getClient();
			const result = await client.dnssec.delete(args.domain, args["key-tag"]);
			output(result, { format: args.format as OutputFormat });
		} catch (e) {
			outputError(e);
		}
	},
});

export const dnssec = defineCommand({
	meta: { name: "dnssec", description: "Manage DNSSEC records" },
	subCommands: { list, create, delete: deleteRecord },
});
