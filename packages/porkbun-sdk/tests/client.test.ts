import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PorkbunClient } from "../src/client";
import { DnsResource } from "../src/resources/dns";
import { DnssecResource } from "../src/resources/dnssec";
import { DomainResource } from "../src/resources/domain";
import { PricingResource } from "../src/resources/pricing";
import { SslResource } from "../src/resources/ssl";

const mockFetchResponse = (data: Record<string, unknown>, status = 200) =>
	Promise.resolve({
		ok: status >= 200 && status < 300,
		status,
		statusText: "OK",
		json: () => Promise.resolve(data),
	});

describe("PorkbunClient", () => {
	const defaultOptions = {
		apikey: "pk_test_123",
		secretapikey: "sk_test_456",
	};

	beforeEach(() => {
		vi.stubGlobal("fetch", vi.fn());
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("should instantiate with default options", () => {
		const client = new PorkbunClient(defaultOptions);

		expect(client).toBeInstanceOf(PorkbunClient);
		expect(client.fetch).toBeDefined();
		expect(typeof client.fetch).toBe("function");
	});

	it("should instantiate with custom baseURL, retry, and retryDelay", () => {
		const client = new PorkbunClient({
			...defaultOptions,
			baseURL: "https://custom.api.com/v3",
			retry: 5,
			retryDelay: 2000,
		});

		expect(client).toBeInstanceOf(PorkbunClient);
	});

	it("should expose pricing as a PricingResource instance", () => {
		const client = new PorkbunClient(defaultOptions);
		expect(client.pricing).toBeInstanceOf(PricingResource);
	});

	it("should expose domain as a DomainResource instance", () => {
		const client = new PorkbunClient(defaultOptions);
		expect(client.domain).toBeInstanceOf(DomainResource);
	});

	it("should expose dns as a DnsResource instance", () => {
		const client = new PorkbunClient(defaultOptions);
		expect(client.dns).toBeInstanceOf(DnsResource);
	});

	it("should expose dnssec as a DnssecResource instance", () => {
		const client = new PorkbunClient(defaultOptions);
		expect(client.dnssec).toBeInstanceOf(DnssecResource);
	});

	it("should expose ssl as a SslResource instance", () => {
		const client = new PorkbunClient(defaultOptions);
		expect(client.ssl).toBeInstanceOf(SslResource);
	});

	it("should call ping endpoint with credentials", async () => {
		const mockFetch = vi.fn().mockReturnValue(
			mockFetchResponse({ status: "SUCCESS", yourIp: "1.2.3.4" }),
		);
		vi.stubGlobal("fetch", mockFetch);

		const client = new PorkbunClient(defaultOptions);
		const result = await client.ping();

		expect(result).toEqual({ status: "SUCCESS", yourIp: "1.2.3.4" });
		expect(mockFetch).toHaveBeenCalledWith(
			expect.stringContaining("ping"),
			expect.objectContaining({
				method: "POST",
				body: JSON.stringify({
					apikey: "pk_test_123",
					secretapikey: "sk_test_456",
				}),
			}),
		);
	});

	it("should use default baseURL when not provided", async () => {
		const mockFetch = vi.fn().mockReturnValue(
			mockFetchResponse({ status: "SUCCESS", yourIp: "1.2.3.4" }),
		);
		vi.stubGlobal("fetch", mockFetch);

		const client = new PorkbunClient(defaultOptions);
		await client.ping();

		expect(mockFetch).toHaveBeenCalledWith(
			"https://api.porkbun.com/api/json/v3/ping",
			expect.anything(),
		);
	});

	it("should use custom baseURL when provided", async () => {
		const mockFetch = vi.fn().mockReturnValue(
			mockFetchResponse({ status: "SUCCESS", yourIp: "1.2.3.4" }),
		);
		vi.stubGlobal("fetch", mockFetch);

		const client = new PorkbunClient({
			...defaultOptions,
			baseURL: "https://custom.api.com",
		});
		await client.ping();

		expect(mockFetch).toHaveBeenCalledWith(
			"https://custom.api.com/ping",
			expect.anything(),
		);
	});
});
