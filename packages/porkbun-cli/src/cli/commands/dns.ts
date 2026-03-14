import { defineCommand } from "citty";
import type { DnsRecordType } from "porkbun-sdk";
import { getClient } from "../config";
import { type OutputFormat, output, outputError } from "../output";
import { dnsColumns } from "../table-columns";

const list = defineCommand({
	meta: { name: "list", description: "List DNS records for a domain" },
	args: {
		domain: {
			type: "positional",
			description: "Domain name",
			required: true,
		},
		id: {
			type: "string",
			description: "Filter by record ID",
		},
		type: {
			type: "string",
			description: "Filter by record type (A, CNAME, MX, etc.)",
		},
		subdomain: {
			type: "string",
			description: "Filter by subdomain (used with --type)",
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
			const records = args.type
				? await client.dns.retrieveByNameType(
						args.domain,
						args.type,
						args.subdomain,
					)
				: await client.dns.retrieve(args.domain, args.id);

			output(records, {
				format: args.format as OutputFormat,
				columns: dnsColumns,
			});
		} catch (e) {
			outputError(e);
		}
	},
});

const create = defineCommand({
	meta: { name: "create", description: "Create a DNS record" },
	args: {
		domain: {
			type: "positional",
			description: "Domain name",
			required: true,
		},
		type: {
			type: "string",
			description: "Record type (A, CNAME, MX, TXT, AAAA, etc.)",
			required: true,
		},
		content: {
			type: "string",
			description: "Record content/value",
			required: true,
		},
		name: {
			type: "string",
			description: "Subdomain (empty for root, * for wildcard)",
		},
		ttl: {
			type: "string",
			description: "TTL in seconds (min 600)",
		},
		prio: {
			type: "string",
			description: "Priority (for MX, SRV records)",
		},
		notes: {
			type: "string",
			description: "Notes for this record",
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
				type: args.type as DnsRecordType,
				content: args.content,
				...(args.name && { name: args.name }),
				...(args.ttl && { ttl: Number(args.ttl) }),
				...(args.prio && { prio: Number(args.prio) }),
				...(args.notes && { notes: args.notes }),
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
			const result = await client.dns.create(args.domain, params);
			output(result, { format: args.format as OutputFormat });
		} catch (e) {
			outputError(e);
		}
	},
});

const edit = defineCommand({
	meta: { name: "edit", description: "Edit a DNS record by ID" },
	args: {
		domain: {
			type: "positional",
			description: "Domain name",
			required: true,
		},
		id: {
			type: "string",
			description: "Record ID to edit",
			required: true,
		},
		type: {
			type: "string",
			description: "Record type",
			required: true,
		},
		content: {
			type: "string",
			description: "Record content/value",
			required: true,
		},
		name: {
			type: "string",
			description: "Subdomain",
		},
		ttl: {
			type: "string",
			description: "TTL in seconds",
		},
		prio: {
			type: "string",
			description: "Priority",
		},
		notes: {
			type: "string",
			description: "Notes",
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
				type: args.type as DnsRecordType,
				content: args.content,
				...(args.name && { name: args.name }),
				...(args.ttl && { ttl: Number(args.ttl) }),
				...(args.prio && { prio: Number(args.prio) }),
				...(args.notes !== undefined && { notes: args.notes }),
			};

			if (args["dry-run"]) {
				output({
					dry_run: true,
					domain: args.domain,
					recordId: args.id,
					payload: params,
				});
				return;
			}

			const client = getClient();
			const result = await client.dns.edit(args.domain, args.id, params);
			output(result, { format: args.format as OutputFormat });
		} catch (e) {
			outputError(e);
		}
	},
});

const editByNameType = defineCommand({
	meta: {
		name: "edit-by-name-type",
		description: "Edit DNS records by domain, type and subdomain",
	},
	args: {
		domain: {
			type: "positional",
			description: "Domain name",
			required: true,
		},
		type: {
			type: "string",
			description: "Record type",
			required: true,
		},
		content: {
			type: "string",
			description: "Record content/value",
			required: true,
		},
		subdomain: {
			type: "string",
			description: "Subdomain",
		},
		ttl: {
			type: "string",
			description: "TTL in seconds",
		},
		prio: {
			type: "string",
			description: "Priority",
		},
		notes: {
			type: "string",
			description: "Notes",
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
				content: args.content,
				...(args.ttl && { ttl: Number(args.ttl) }),
				...(args.prio && { prio: Number(args.prio) }),
				...(args.notes !== undefined && { notes: args.notes }),
			};

			if (args["dry-run"]) {
				output({
					dry_run: true,
					domain: args.domain,
					type: args.type,
					subdomain: args.subdomain ?? "(root)",
					payload: params,
				});
				return;
			}

			const client = getClient();
			const result = await client.dns.editByNameType(
				args.domain,
				args.type,
				args.subdomain,
				params,
			);
			output(result, { format: args.format as OutputFormat });
		} catch (e) {
			outputError(e);
		}
	},
});

const deleteRecord = defineCommand({
	meta: { name: "delete", description: "Delete a DNS record by ID" },
	args: {
		domain: {
			type: "positional",
			description: "Domain name",
			required: true,
		},
		id: {
			type: "string",
			description: "Record ID to delete",
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
					action: "delete_dns_record",
					recordId: args.id,
				});
				return;
			}

			const client = getClient();
			const result = await client.dns.delete(args.domain, args.id);
			output(result, { format: args.format as OutputFormat });
		} catch (e) {
			outputError(e);
		}
	},
});

const deleteByNameType = defineCommand({
	meta: {
		name: "delete-by-name-type",
		description: "Delete DNS records by domain, type and subdomain",
	},
	args: {
		domain: {
			type: "positional",
			description: "Domain name",
			required: true,
		},
		type: {
			type: "string",
			description: "Record type",
			required: true,
		},
		subdomain: {
			type: "string",
			description: "Subdomain",
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
					action: "delete_dns_by_name_type",
					type: args.type,
					subdomain: args.subdomain ?? "(root)",
				});
				return;
			}

			const client = getClient();
			const result = await client.dns.deleteByNameType(
				args.domain,
				args.type,
				args.subdomain,
			);
			output(result, { format: args.format as OutputFormat });
		} catch (e) {
			outputError(e);
		}
	},
});

export const dns = defineCommand({
	meta: { name: "dns", description: "Manage DNS records" },
	subCommands: {
		list,
		create,
		edit,
		"edit-by-name-type": editByNameType,
		delete: deleteRecord,
		"delete-by-name-type": deleteByNameType,
	},
});
