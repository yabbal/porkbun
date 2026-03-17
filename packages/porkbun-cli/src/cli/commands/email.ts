import { defineCommand } from "citty";
import { getWebSession } from "../config";
import { type OutputFormat, output, outputError } from "../output";

const WEB_BASE = "https://porkbun.com/api/domains";

const webFetch = async (
	endpoint: string,
	params: Record<string, string>,
): Promise<unknown> => {
	const { cookie, csrf } = getWebSession();

	const body = new URLSearchParams({
		...params,
		isajax: "true",
		csrf_pb: csrf,
	});

	const response = await fetch(`${WEB_BASE}/${endpoint}`, {
		method: "POST",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
			Cookie: cookie,
			"X-Requested-With": "XMLHttpRequest",
		},
		body: body.toString(),
	});

	const data = await response.json();

	if (!response.ok || (data as Record<string, unknown>).error) {
		throw new Error(
			(data as Record<string, string>).message ??
				(data as Record<string, string>).error ??
				`HTTP ${response.status}`,
		);
	}

	return data;
};

const add = defineCommand({
	meta: { name: "add", description: "Add an email forward" },
	args: {
		domain: {
			type: "positional",
			description: "Domain name",
			required: true,
		},
		local: {
			type: "string",
			description: "Local part of the email (e.g. contact)",
			required: true,
		},
		remote: {
			type: "string",
			description: "Destination email address",
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
					action: "add_email_forward",
					domain: args.domain,
					local: args.local,
					remote: args.remote,
				});
				return;
			}

			const result = await webFetch("addEmailForward", {
				domain: args.domain,
				local: args.local,
				remote: args.remote,
			});
			output(result, { format: args.format as OutputFormat });
		} catch (e) {
			outputError(e);
		}
	},
});

const deleteForward = defineCommand({
	meta: { name: "delete", description: "Delete an email forward" },
	args: {
		domain: {
			type: "positional",
			description: "Domain name",
			required: true,
		},
		local: {
			type: "string",
			description: "Email address to remove (e.g. contact@domain.com)",
			required: true,
		},
		remote: {
			type: "string",
			description: "Destination email address",
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
					action: "delete_email_forward",
					domain: args.domain,
					local: args.local,
					remote: args.remote,
				});
				return;
			}

			const result = await webFetch("deleteEmailForward", {
				domain: args.domain,
				local: args.local,
				remote: args.remote,
			});
			output(result, { format: args.format as OutputFormat });
		} catch (e) {
			outputError(e);
		}
	},
});

export const email = defineCommand({
	meta: { name: "email", description: "Manage email forwarding" },
	subCommands: {
		add,
		delete: deleteForward,
	},
});
