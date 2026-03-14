import { defineCommand } from "citty";
import { getClient } from "../config";
import { type OutputFormat, output, outputError } from "../output";
import {
	domainColumns,
	glueColumns,
	urlForwardColumns,
} from "../table-columns";

const list = defineCommand({
	meta: { name: "list", description: "List all domains" },
	args: {
		format: {
			type: "string",
			description: "Output format: json, table, csv",
			default: "json",
		},
		start: {
			type: "string",
			description: "Pagination start index (increments of 1000)",
		},
		labels: {
			type: "boolean",
			description: "Include domain labels",
			default: false,
		},
	},
	async run({ args }) {
		try {
			const client = getClient();
			const result = await client.domain.listAll({
				start: args.start ? Number(args.start) : undefined,
				includeLabels: args.labels,
			});
			output(result.domains, {
				format: args.format as OutputFormat,
				columns: domainColumns,
			});
		} catch (e) {
			outputError(e);
		}
	},
});

const check = defineCommand({
	meta: { name: "check", description: "Check domain availability" },
	args: {
		domain: {
			type: "positional",
			description: "Domain name to check (e.g. example.com)",
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
			const result = await client.domain.check(args.domain);
			output(result, { format: args.format as OutputFormat });
		} catch (e) {
			outputError(e);
		}
	},
});

const create = defineCommand({
	meta: { name: "create", description: "Register a new domain" },
	args: {
		domain: {
			type: "positional",
			description: "Domain name to register",
			required: true,
		},
		cost: {
			type: "string",
			description: "Cost in cents (integer)",
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
				cost: Number(args.cost),
				agreeToTerms: "yes",
			};

			if (args["dry-run"]) {
				output({ dry_run: true, domain: args.domain, payload: params });
				return;
			}

			const client = getClient();
			const result = await client.domain.create(args.domain, params);
			output(result, { format: args.format as OutputFormat });
		} catch (e) {
			outputError(e);
		}
	},
});

const nsGet = defineCommand({
	meta: { name: "get", description: "Get name servers for a domain" },
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
			const result = await client.domain.getNameServers(args.domain);
			if (args.format === "table" || args.format === "csv") {
				output(
					result.ns.map((ns, i) => ({ index: i + 1, nameserver: ns })),
					{
						format: args.format as OutputFormat,
						columns: [
							{ key: "index", header: "#" },
							{ key: "nameserver", header: "Name Server" },
						],
					},
				);
			} else {
				output(result);
			}
		} catch (e) {
			outputError(e);
		}
	},
});

const nsUpdate = defineCommand({
	meta: { name: "update", description: "Update name servers for a domain" },
	args: {
		domain: {
			type: "positional",
			description: "Domain name",
			required: true,
		},
		ns: {
			type: "string",
			description: "Name servers (comma-separated)",
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
			const nameservers = args.ns.split(",").map((s) => s.trim());

			if (args["dry-run"]) {
				output({
					dry_run: true,
					domain: args.domain,
					payload: { ns: nameservers },
				});
				return;
			}

			const client = getClient();
			const result = await client.domain.updateNameServers(
				args.domain,
				nameservers,
			);
			output(result, { format: args.format as OutputFormat });
		} catch (e) {
			outputError(e);
		}
	},
});

const ns = defineCommand({
	meta: { name: "ns", description: "Manage domain name servers" },
	subCommands: { get: nsGet, update: nsUpdate },
});

const autoRenew = defineCommand({
	meta: { name: "auto-renew", description: "Update auto-renew status" },
	args: {
		domain: {
			type: "positional",
			description: "Domain name",
			required: true,
		},
		status: {
			type: "string",
			description: "Auto-renew status: on or off",
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
			const status = args.status as "on" | "off";
			if (status !== "on" && status !== "off") {
				outputError(new Error("Status must be 'on' or 'off'"));
				return;
			}

			if (args["dry-run"]) {
				output({
					dry_run: true,
					domain: args.domain,
					payload: { status },
				});
				return;
			}

			const client = getClient();
			const result = await client.domain.updateAutoRenew(
				{ status },
				args.domain,
			);
			output(result, { format: args.format as OutputFormat });
		} catch (e) {
			outputError(e);
		}
	},
});

const forwardList = defineCommand({
	meta: { name: "list", description: "List URL forwards for a domain" },
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
			const result = await client.domain.getUrlForwarding(args.domain);
			output(result, {
				format: args.format as OutputFormat,
				columns: urlForwardColumns,
			});
		} catch (e) {
			outputError(e);
		}
	},
});

const forwardAdd = defineCommand({
	meta: { name: "add", description: "Add a URL forward" },
	args: {
		domain: {
			type: "positional",
			description: "Domain name",
			required: true,
		},
		location: {
			type: "string",
			description: "Destination URL",
			required: true,
		},
		subdomain: {
			type: "string",
			description: "Subdomain (empty for root)",
		},
		type: {
			type: "string",
			description: "Redirect type: temporary or permanent",
			default: "permanent",
		},
		"include-path": {
			type: "string",
			description: "Include path: yes or no",
			default: "no",
		},
		wildcard: {
			type: "string",
			description: "Wildcard: yes or no",
			default: "no",
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
				location: args.location,
				type: args.type as "temporary" | "permanent",
				includePath: args["include-path"] as "yes" | "no",
				wildcard: args.wildcard as "yes" | "no",
				...(args.subdomain && { subdomain: args.subdomain }),
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
			const result = await client.domain.addUrlForward(args.domain, params);
			output(result, { format: args.format as OutputFormat });
		} catch (e) {
			outputError(e);
		}
	},
});

const forwardDelete = defineCommand({
	meta: { name: "delete", description: "Delete a URL forward" },
	args: {
		domain: {
			type: "positional",
			description: "Domain name",
			required: true,
		},
		id: {
			type: "string",
			description: "Forward record ID",
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
					action: "delete_url_forward",
					recordId: args.id,
				});
				return;
			}

			const client = getClient();
			const result = await client.domain.deleteUrlForward(args.domain, args.id);
			output(result, { format: args.format as OutputFormat });
		} catch (e) {
			outputError(e);
		}
	},
});

const forward = defineCommand({
	meta: { name: "forward", description: "Manage URL forwarding" },
	subCommands: { list: forwardList, add: forwardAdd, delete: forwardDelete },
});

const glueList = defineCommand({
	meta: { name: "list", description: "List glue records" },
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
			const result = await client.domain.getGlueRecords(args.domain);
			output(result.hosts ?? [], {
				format: args.format as OutputFormat,
				columns: glueColumns,
			});
		} catch (e) {
			outputError(e);
		}
	},
});

const glueCreate = defineCommand({
	meta: { name: "create", description: "Create a glue record" },
	args: {
		domain: {
			type: "positional",
			description: "Domain name",
			required: true,
		},
		subdomain: {
			type: "string",
			description: "Glue host subdomain",
			required: true,
		},
		ips: {
			type: "string",
			description: "IP addresses (comma-separated)",
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
			const ips = args.ips.split(",").map((s) => s.trim());

			if (args["dry-run"]) {
				output({
					dry_run: true,
					domain: args.domain,
					subdomain: args.subdomain,
					payload: { ips },
				});
				return;
			}

			const client = getClient();
			const result = await client.domain.createGlueRecord(
				args.domain,
				args.subdomain,
				ips,
			);
			output(result, { format: args.format as OutputFormat });
		} catch (e) {
			outputError(e);
		}
	},
});

const glueUpdate = defineCommand({
	meta: { name: "update", description: "Update a glue record" },
	args: {
		domain: {
			type: "positional",
			description: "Domain name",
			required: true,
		},
		subdomain: {
			type: "string",
			description: "Glue host subdomain",
			required: true,
		},
		ips: {
			type: "string",
			description: "IP addresses (comma-separated)",
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
			const ips = args.ips.split(",").map((s) => s.trim());

			if (args["dry-run"]) {
				output({
					dry_run: true,
					domain: args.domain,
					subdomain: args.subdomain,
					payload: { ips },
				});
				return;
			}

			const client = getClient();
			const result = await client.domain.updateGlueRecord(
				args.domain,
				args.subdomain,
				ips,
			);
			output(result, { format: args.format as OutputFormat });
		} catch (e) {
			outputError(e);
		}
	},
});

const glueDelete = defineCommand({
	meta: { name: "delete", description: "Delete a glue record" },
	args: {
		domain: {
			type: "positional",
			description: "Domain name",
			required: true,
		},
		subdomain: {
			type: "string",
			description: "Glue host subdomain",
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
					action: "delete_glue_record",
					subdomain: args.subdomain,
				});
				return;
			}

			const client = getClient();
			const result = await client.domain.deleteGlueRecord(
				args.domain,
				args.subdomain,
			);
			output(result, { format: args.format as OutputFormat });
		} catch (e) {
			outputError(e);
		}
	},
});

const glue = defineCommand({
	meta: { name: "glue", description: "Manage glue records" },
	subCommands: {
		list: glueList,
		create: glueCreate,
		update: glueUpdate,
		delete: glueDelete,
	},
});

export const domain = defineCommand({
	meta: { name: "domain", description: "Manage domains" },
	subCommands: {
		list,
		check,
		create,
		ns,
		"auto-renew": autoRenew,
		forward,
		glue,
	},
});
