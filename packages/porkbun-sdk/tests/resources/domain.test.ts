import { describe, expect, it, vi } from "vitest";
import type { FetchFn } from "../../src/fetch";
import { DomainResource } from "../../src/resources/domain";

const credentials = { apikey: "pk_test", secretapikey: "sk_test" };

const createResource = () => {
	const mockFetch = vi.fn().mockResolvedValue({ status: "SUCCESS" }) as unknown as FetchFn;
	const resource = new DomainResource(mockFetch, credentials);
	return { resource, mockFetch: mockFetch as unknown as ReturnType<typeof vi.fn> };
};

describe("DomainResource", () => {
	describe("listAll", () => {
		it("should call the correct endpoint with credentials", async () => {
			const { resource, mockFetch } = createResource();
			mockFetch.mockResolvedValue({ status: "SUCCESS", domains: [] });

			await resource.listAll();

			expect(mockFetch).toHaveBeenCalledWith("domain/listAll", {
				body: { ...credentials },
			});
		});

		it("should include start param when provided", async () => {
			const { resource, mockFetch } = createResource();
			mockFetch.mockResolvedValue({ status: "SUCCESS", domains: [] });

			await resource.listAll({ start: 10 });

			expect(mockFetch).toHaveBeenCalledWith("domain/listAll", {
				body: { ...credentials, start: 10 },
			});
		});

		it("should include includeLabels when true", async () => {
			const { resource, mockFetch } = createResource();
			mockFetch.mockResolvedValue({ status: "SUCCESS", domains: [] });

			await resource.listAll({ includeLabels: true });

			expect(mockFetch).toHaveBeenCalledWith("domain/listAll", {
				body: { ...credentials, includeLabels: "yes" },
			});
		});

		it("should not include includeLabels when false", async () => {
			const { resource, mockFetch } = createResource();
			mockFetch.mockResolvedValue({ status: "SUCCESS", domains: [] });

			await resource.listAll({ includeLabels: false });

			expect(mockFetch).toHaveBeenCalledWith("domain/listAll", {
				body: { ...credentials },
			});
		});
	});

	describe("check", () => {
		it("should call the correct endpoint with domain", async () => {
			const { resource, mockFetch } = createResource();
			mockFetch.mockResolvedValue({ status: "SUCCESS", response: { avail: "yes" } });

			await resource.check("example.com");

			expect(mockFetch).toHaveBeenCalledWith("domain/checkDomain/example.com", {
				body: { ...credentials },
			});
		});
	});

	describe("create", () => {
		it("should call the correct endpoint with domain and params", async () => {
			const { resource, mockFetch } = createResource();
			const params = { cost: 9.99, agreeToTerms: "yes" };
			mockFetch.mockResolvedValue({ status: "SUCCESS", domain: "example.com" });

			await resource.create("example.com", params);

			expect(mockFetch).toHaveBeenCalledWith("domain/create/example.com", {
				body: { ...credentials, ...params },
			});
		});
	});

	describe("getNameServers", () => {
		it("should call the correct endpoint", async () => {
			const { resource, mockFetch } = createResource();
			mockFetch.mockResolvedValue({ status: "SUCCESS", ns: ["ns1.porkbun.com"] });

			await resource.getNameServers("example.com");

			expect(mockFetch).toHaveBeenCalledWith("domain/getNs/example.com", {
				body: { ...credentials },
			});
		});
	});

	describe("updateNameServers", () => {
		it("should call the correct endpoint with ns array", async () => {
			const { resource, mockFetch } = createResource();
			const ns = ["ns1.custom.com", "ns2.custom.com"];

			await resource.updateNameServers("example.com", ns);

			expect(mockFetch).toHaveBeenCalledWith("domain/updateNs/example.com", {
				body: { ...credentials, ns },
			});
		});
	});

	describe("updateAutoRenew", () => {
		it("should call with domain-specific path when domain is provided", async () => {
			const { resource, mockFetch } = createResource();

			await resource.updateAutoRenew({ status: "on" }, "example.com");

			expect(mockFetch).toHaveBeenCalledWith("domain/updateAutoRenew/example.com", {
				body: { ...credentials, status: "on" },
			});
		});

		it("should call without domain when domain is not provided", async () => {
			const { resource, mockFetch } = createResource();

			await resource.updateAutoRenew({ status: "off" });

			expect(mockFetch).toHaveBeenCalledWith("domain/updateAutoRenew", {
				body: { ...credentials, status: "off" },
			});
		});

		it("should include domains array when provided", async () => {
			const { resource, mockFetch } = createResource();

			await resource.updateAutoRenew({
				status: "on",
				domains: ["a.com", "b.com"],
			});

			expect(mockFetch).toHaveBeenCalledWith("domain/updateAutoRenew", {
				body: { ...credentials, status: "on", domains: ["a.com", "b.com"] },
			});
		});
	});

	describe("getUrlForwarding", () => {
		it("should call the correct endpoint and return forwards", async () => {
			const { resource, mockFetch } = createResource();
			const forwards = [
				{ id: "1", subdomain: "", location: "https://example.com", type: "permanent", includePath: "no", wildcard: "no" },
			];
			mockFetch.mockResolvedValue({ status: "SUCCESS", forwards });

			const result = await resource.getUrlForwarding("example.com");

			expect(mockFetch).toHaveBeenCalledWith("domain/getUrlForwarding/example.com", {
				body: { ...credentials },
			});
			expect(result).toEqual(forwards);
		});

		it("should return empty array when no forwards", async () => {
			const { resource, mockFetch } = createResource();
			mockFetch.mockResolvedValue({ status: "SUCCESS" });

			const result = await resource.getUrlForwarding("example.com");

			expect(result).toEqual([]);
		});
	});

	describe("addUrlForward", () => {
		it("should call the correct endpoint with params", async () => {
			const { resource, mockFetch } = createResource();
			const params = {
				location: "https://target.com",
				type: "permanent" as const,
				includePath: "yes" as const,
				wildcard: "no" as const,
			};

			await resource.addUrlForward("example.com", params);

			expect(mockFetch).toHaveBeenCalledWith("domain/addUrlForward/example.com", {
				body: { ...credentials, ...params },
			});
		});
	});

	describe("deleteUrlForward", () => {
		it("should call the correct endpoint with domain and recordId", async () => {
			const { resource, mockFetch } = createResource();

			await resource.deleteUrlForward("example.com", "123");

			expect(mockFetch).toHaveBeenCalledWith("domain/deleteUrlForward/example.com/123", {
				body: { ...credentials },
			});
		});
	});

	describe("getGlueRecords", () => {
		it("should call the correct endpoint", async () => {
			const { resource, mockFetch } = createResource();
			mockFetch.mockResolvedValue({ status: "SUCCESS", hosts: [] });

			await resource.getGlueRecords("example.com");

			expect(mockFetch).toHaveBeenCalledWith("domain/getGlue/example.com", {
				body: { ...credentials },
			});
		});
	});

	describe("createGlueRecord", () => {
		it("should call the correct endpoint with subdomain and ips", async () => {
			const { resource, mockFetch } = createResource();

			await resource.createGlueRecord("example.com", "ns1", ["1.2.3.4"]);

			expect(mockFetch).toHaveBeenCalledWith("domain/createGlue/example.com/ns1", {
				body: { ...credentials, ips: ["1.2.3.4"] },
			});
		});
	});

	describe("updateGlueRecord", () => {
		it("should call the correct endpoint with subdomain and ips", async () => {
			const { resource, mockFetch } = createResource();

			await resource.updateGlueRecord("example.com", "ns1", ["5.6.7.8"]);

			expect(mockFetch).toHaveBeenCalledWith("domain/updateGlue/example.com/ns1", {
				body: { ...credentials, ips: ["5.6.7.8"] },
			});
		});
	});

	describe("deleteGlueRecord", () => {
		it("should call the correct endpoint with subdomain", async () => {
			const { resource, mockFetch } = createResource();

			await resource.deleteGlueRecord("example.com", "ns1");

			expect(mockFetch).toHaveBeenCalledWith("domain/deleteGlue/example.com/ns1", {
				body: { ...credentials },
			});
		});
	});
});
