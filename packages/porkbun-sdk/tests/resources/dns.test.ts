import { describe, expect, it, vi } from "vitest";
import type { FetchFn } from "../../src/fetch";
import { DnsResource } from "../../src/resources/dns";

const credentials = { apikey: "pk_test", secretapikey: "sk_test" };

const createResource = () => {
	const mockFetch = vi.fn().mockResolvedValue({ status: "SUCCESS" }) as unknown as FetchFn;
	const resource = new DnsResource(mockFetch, credentials);
	return { resource, mockFetch: mockFetch as unknown as ReturnType<typeof vi.fn> };
};

describe("DnsResource", () => {
	describe("create", () => {
		it("should call the correct endpoint with domain and params", async () => {
			const { resource, mockFetch } = createResource();
			const params = { type: "A" as const, content: "1.2.3.4", ttl: 300 };
			mockFetch.mockResolvedValue({ status: "SUCCESS", id: "12345" });

			const result = await resource.create("example.com", params);

			expect(mockFetch).toHaveBeenCalledWith("dns/create/example.com", {
				body: { ...credentials, ...params },
			});
			expect(result).toEqual({ status: "SUCCESS", id: "12345" });
		});

		it("should include optional name and prio", async () => {
			const { resource, mockFetch } = createResource();
			const params = { name: "www", type: "A" as const, content: "1.2.3.4", prio: 10 };

			await resource.create("example.com", params);

			expect(mockFetch).toHaveBeenCalledWith("dns/create/example.com", {
				body: { ...credentials, ...params },
			});
		});
	});

	describe("edit", () => {
		it("should call the correct endpoint with domain, id, and params", async () => {
			const { resource, mockFetch } = createResource();
			const params = { type: "A" as const, content: "5.6.7.8" };

			await resource.edit("example.com", "123", params);

			expect(mockFetch).toHaveBeenCalledWith("dns/edit/example.com/123", {
				body: { ...credentials, ...params },
			});
		});
	});

	describe("editByNameType", () => {
		it("should call with subdomain when provided", async () => {
			const { resource, mockFetch } = createResource();
			const params = { content: "5.6.7.8" };

			await resource.editByNameType("example.com", "A", "www", params);

			expect(mockFetch).toHaveBeenCalledWith("dns/editByNameType/example.com/A/www", {
				body: { ...credentials, ...params },
			});
		});

		it("should call without subdomain when not provided", async () => {
			const { resource, mockFetch } = createResource();
			const params = { content: "5.6.7.8" };

			await resource.editByNameType("example.com", "A", undefined, params);

			expect(mockFetch).toHaveBeenCalledWith("dns/editByNameType/example.com/A", {
				body: { ...credentials, ...params },
			});
		});

		it("should work without params", async () => {
			const { resource, mockFetch } = createResource();

			await resource.editByNameType("example.com", "A");

			expect(mockFetch).toHaveBeenCalledWith("dns/editByNameType/example.com/A", {
				body: { ...credentials },
			});
		});
	});

	describe("delete", () => {
		it("should call the correct endpoint with domain and id", async () => {
			const { resource, mockFetch } = createResource();

			await resource.delete("example.com", "456");

			expect(mockFetch).toHaveBeenCalledWith("dns/delete/example.com/456", {
				body: { ...credentials },
			});
		});
	});

	describe("deleteByNameType", () => {
		it("should call with subdomain when provided", async () => {
			const { resource, mockFetch } = createResource();

			await resource.deleteByNameType("example.com", "A", "www");

			expect(mockFetch).toHaveBeenCalledWith("dns/deleteByNameType/example.com/A/www", {
				body: { ...credentials },
			});
		});

		it("should call without subdomain when not provided", async () => {
			const { resource, mockFetch } = createResource();

			await resource.deleteByNameType("example.com", "CNAME");

			expect(mockFetch).toHaveBeenCalledWith("dns/deleteByNameType/example.com/CNAME", {
				body: { ...credentials },
			});
		});
	});

	describe("retrieve", () => {
		it("should call with id when provided", async () => {
			const { resource, mockFetch } = createResource();
			const records = [{ id: "1", name: "example.com", type: "A", content: "1.2.3.4", ttl: "300", prio: null, notes: null }];
			mockFetch.mockResolvedValue({ status: "SUCCESS", records });

			const result = await resource.retrieve("example.com", "1");

			expect(mockFetch).toHaveBeenCalledWith("dns/retrieve/example.com/1", {
				body: { ...credentials },
			});
			expect(result).toEqual(records);
		});

		it("should call without id when not provided", async () => {
			const { resource, mockFetch } = createResource();
			mockFetch.mockResolvedValue({ status: "SUCCESS", records: [] });

			const result = await resource.retrieve("example.com");

			expect(mockFetch).toHaveBeenCalledWith("dns/retrieve/example.com", {
				body: { ...credentials },
			});
			expect(result).toEqual([]);
		});

		it("should return empty array when records is undefined", async () => {
			const { resource, mockFetch } = createResource();
			mockFetch.mockResolvedValue({ status: "SUCCESS" });

			const result = await resource.retrieve("example.com");

			expect(result).toEqual([]);
		});
	});

	describe("retrieveByNameType", () => {
		it("should call with subdomain when provided", async () => {
			const { resource, mockFetch } = createResource();
			const records = [{ id: "1", name: "www.example.com", type: "A", content: "1.2.3.4", ttl: "300", prio: null, notes: null }];
			mockFetch.mockResolvedValue({ status: "SUCCESS", records });

			const result = await resource.retrieveByNameType("example.com", "A", "www");

			expect(mockFetch).toHaveBeenCalledWith("dns/retrieveByNameType/example.com/A/www", {
				body: { ...credentials },
			});
			expect(result).toEqual(records);
		});

		it("should call without subdomain when not provided", async () => {
			const { resource, mockFetch } = createResource();
			mockFetch.mockResolvedValue({ status: "SUCCESS", records: [] });

			const result = await resource.retrieveByNameType("example.com", "MX");

			expect(mockFetch).toHaveBeenCalledWith("dns/retrieveByNameType/example.com/MX", {
				body: { ...credentials },
			});
			expect(result).toEqual([]);
		});

		it("should return empty array when records is undefined", async () => {
			const { resource, mockFetch } = createResource();
			mockFetch.mockResolvedValue({ status: "SUCCESS" });

			const result = await resource.retrieveByNameType("example.com", "TXT");

			expect(result).toEqual([]);
		});
	});
});
