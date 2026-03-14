import { describe, it, expect } from "vitest";
import {
	domainColumns,
	dnsColumns,
	urlForwardColumns,
	glueColumns,
	dnssecColumns,
} from "../../src/cli/table-columns";

describe("domainColumns", () => {
	const autoRenewCol = domainColumns.find((c) => c.key === "autoRenew")!;

	it("should have an autoRenew getter", () => {
		expect(autoRenewCol.get).toBeDefined();
	});

	it("should return 'on' for autoRenew='1'", () => {
		expect(autoRenewCol.get!({ autoRenew: "1" })).toBe("on");
	});

	it("should return 'on' for autoRenew=1 (number)", () => {
		expect(autoRenewCol.get!({ autoRenew: 1 })).toBe("on");
	});

	it("should return 'off' for autoRenew='0'", () => {
		expect(autoRenewCol.get!({ autoRenew: "0" })).toBe("off");
	});

	it("should return 'off' for autoRenew=false", () => {
		expect(autoRenewCol.get!({ autoRenew: false })).toBe("off");
	});

	it("should return 'off' for autoRenew=undefined", () => {
		expect(autoRenewCol.get!({ autoRenew: undefined })).toBe("off");
	});

	it("should return 'off' for autoRenew=true (stringified is not '1')", () => {
		expect(autoRenewCol.get!({ autoRenew: true })).toBe("off");
	});

	it("should have expected column keys", () => {
		const keys = domainColumns.map((c) => c.key);
		expect(keys).toContain("domain");
		expect(keys).toContain("status");
		expect(keys).toContain("tld");
		expect(keys).toContain("createDate");
		expect(keys).toContain("expireDate");
		expect(keys).toContain("securityLock");
	});
});

describe("glueColumns", () => {
	const ipsCol = glueColumns.find((c) => c.key === "ips")!;

	it("should have an ips getter", () => {
		expect(ipsCol.get).toBeDefined();
	});

	it("should join array of IPs with comma separator", () => {
		expect(ipsCol.get!({ ips: ["1.2.3.4", "5.6.7.8"] })).toBe("1.2.3.4, 5.6.7.8");
	});

	it("should return string value as-is", () => {
		expect(ipsCol.get!({ ips: "1.2.3.4" })).toBe("1.2.3.4");
	});

	it("should return empty string for undefined", () => {
		expect(ipsCol.get!({ ips: undefined })).toBe("");
	});

	it("should return empty string for null", () => {
		expect(ipsCol.get!({ ips: null })).toBe("");
	});
});

describe("dnsColumns", () => {
	it("should have expected column keys", () => {
		const keys = dnsColumns.map((c) => c.key);
		expect(keys).toEqual(["id", "name", "type", "content", "ttl", "prio", "notes"]);
	});
});

describe("urlForwardColumns", () => {
	it("should have expected column keys", () => {
		const keys = urlForwardColumns.map((c) => c.key);
		expect(keys).toEqual(["id", "subdomain", "location", "type", "includePath", "wildcard"]);
	});
});

describe("dnssecColumns", () => {
	it("should have expected column keys", () => {
		const keys = dnssecColumns.map((c) => c.key);
		expect(keys).toEqual(["keyTag", "alg", "digestType", "digest"]);
	});
});
