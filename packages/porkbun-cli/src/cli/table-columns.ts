import type { TableColumn } from "./output";

export const domainColumns: TableColumn[] = [
	{ key: "domain", header: "Domain" },
	{ key: "status", header: "Status" },
	{ key: "tld", header: "TLD" },
	{ key: "createDate", header: "Created" },
	{ key: "expireDate", header: "Expires" },
	{
		key: "autoRenew",
		header: "Auto-Renew",
		get: (r) => (String(r.autoRenew) === "1" ? "on" : "off"),
	},
	{ key: "securityLock", header: "Lock" },
];

export const dnsColumns: TableColumn[] = [
	{ key: "id", header: "ID" },
	{ key: "name", header: "Name" },
	{ key: "type", header: "Type" },
	{ key: "content", header: "Content" },
	{ key: "ttl", header: "TTL" },
	{ key: "prio", header: "Priority" },
	{ key: "notes", header: "Notes" },
];

export const urlForwardColumns: TableColumn[] = [
	{ key: "id", header: "ID" },
	{ key: "subdomain", header: "Subdomain" },
	{ key: "location", header: "Location" },
	{ key: "type", header: "Type" },
	{ key: "includePath", header: "Include Path" },
	{ key: "wildcard", header: "Wildcard" },
];

export const glueColumns: TableColumn[] = [
	{ key: "hostname", header: "Hostname" },
	{
		key: "ips",
		header: "IPs",
		get: (r) =>
			Array.isArray(r.ips)
				? (r.ips as string[]).join(", ")
				: String(r.ips ?? ""),
	},
];

export const dnssecColumns: TableColumn[] = [
	{ key: "keyTag", header: "Key Tag" },
	{ key: "alg", header: "Algorithm" },
	{ key: "digestType", header: "Digest Type" },
	{ key: "digest", header: "Digest" },
];
