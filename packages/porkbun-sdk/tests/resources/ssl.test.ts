import { describe, expect, it, vi } from "vitest";
import type { FetchFn } from "../../src/fetch";
import { SslResource } from "../../src/resources/ssl";

const credentials = { apikey: "pk_test", secretapikey: "sk_test" };

const createResource = () => {
	const mockFetch = vi.fn().mockResolvedValue({ status: "SUCCESS" }) as unknown as FetchFn;
	const resource = new SslResource(mockFetch, credentials);
	return { resource, mockFetch: mockFetch as unknown as ReturnType<typeof vi.fn> };
};

describe("SslResource", () => {
	describe("retrieve", () => {
		it("should call the correct endpoint with domain", async () => {
			const { resource, mockFetch } = createResource();
			const bundle = {
				status: "SUCCESS",
				certificatechain: "-----BEGIN CERTIFICATE-----\nMIIC...\n-----END CERTIFICATE-----",
				privatekey: "-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----",
				publickey: "-----BEGIN PUBLIC KEY-----\nMIIB...\n-----END PUBLIC KEY-----",
			};
			mockFetch.mockResolvedValue(bundle);

			const result = await resource.retrieve("example.com");

			expect(mockFetch).toHaveBeenCalledWith("ssl/retrieve/example.com", {
				body: { ...credentials },
			});
			expect(result).toEqual(bundle);
		});

		it("should pass credentials in the body", async () => {
			const { resource, mockFetch } = createResource();

			await resource.retrieve("test.com");

			const callBody = mockFetch.mock.calls[0][1].body;
			expect(callBody).toHaveProperty("apikey", "pk_test");
			expect(callBody).toHaveProperty("secretapikey", "sk_test");
		});
	});
});
