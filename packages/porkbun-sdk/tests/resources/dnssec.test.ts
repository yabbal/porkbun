import { describe, expect, it, vi } from "vitest";
import type { FetchFn } from "../../src/fetch";
import { DnssecResource } from "../../src/resources/dnssec";

const credentials = { apikey: "pk_test", secretapikey: "sk_test" };

const createResource = () => {
	const mockFetch = vi.fn().mockResolvedValue({ status: "SUCCESS" }) as unknown as FetchFn;
	const resource = new DnssecResource(mockFetch, credentials);
	return { resource, mockFetch: mockFetch as unknown as ReturnType<typeof vi.fn> };
};

describe("DnssecResource", () => {
	describe("create", () => {
		it("should call the correct endpoint with domain and params", async () => {
			const { resource, mockFetch } = createResource();
			const params = {
				keyTag: "12345",
				alg: "13",
				digestType: "2",
				digest: "abc123",
			};

			await resource.create("example.com", params);

			expect(mockFetch).toHaveBeenCalledWith("dns/createDnssecRecord/example.com", {
				body: { ...credentials, ...params },
			});
		});

		it("should include optional params", async () => {
			const { resource, mockFetch } = createResource();
			const params = {
				keyTag: "12345",
				alg: "13",
				digestType: "2",
				digest: "abc123",
				maxSigLife: 3600,
				keyDataFlags: 257,
			};

			await resource.create("example.com", params);

			expect(mockFetch).toHaveBeenCalledWith("dns/createDnssecRecord/example.com", {
				body: { ...credentials, ...params },
			});
		});
	});

	describe("get", () => {
		it("should call the correct endpoint and return records", async () => {
			const { resource, mockFetch } = createResource();
			const records = {
				"12345": { keyTag: "12345", alg: "13", digestType: "2", digest: "abc" },
			};
			mockFetch.mockResolvedValue({ status: "SUCCESS", records });

			const result = await resource.get("example.com");

			expect(mockFetch).toHaveBeenCalledWith("dns/getDnssecRecords/example.com", {
				body: { ...credentials },
			});
			expect(result).toEqual(records);
		});

		it("should return empty object when no records", async () => {
			const { resource, mockFetch } = createResource();
			mockFetch.mockResolvedValue({ status: "SUCCESS" });

			const result = await resource.get("example.com");

			expect(result).toEqual({});
		});
	});

	describe("delete", () => {
		it("should call the correct endpoint with domain and keyTag", async () => {
			const { resource, mockFetch } = createResource();

			await resource.delete("example.com", "12345");

			expect(mockFetch).toHaveBeenCalledWith("dns/deleteDnssecRecord/example.com/12345", {
				body: { ...credentials },
			});
		});
	});
});
