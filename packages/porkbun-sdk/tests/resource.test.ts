import { describe, expect, it, vi } from "vitest";
import { Resource } from "../src/resource";

const credentials = { apikey: "pk_test", secretapikey: "sk_test" };
const mockFetch = vi.fn();

describe("Resource", () => {
	it("should store fetch and credentials", () => {
		const resource = new Resource(mockFetch, credentials);

		// Access protected members via the instance (they exist at runtime)
		expect(resource).toHaveProperty("fetch", mockFetch);
		expect(resource).toHaveProperty("credentials", credentials);
	});

	it("should return credentials from authBody()", () => {
		const resource = new Resource(mockFetch, credentials);

		// authBody is protected, we need to access it via a subclass or cast
		const body = (resource as unknown as { authBody: (extra?: object) => Record<string, unknown> }).authBody();

		expect(body).toEqual({
			apikey: "pk_test",
			secretapikey: "sk_test",
		});
	});

	it("should merge credentials with extra in authBody(extra)", () => {
		const resource = new Resource(mockFetch, credentials);
		const authBody = (resource as unknown as { authBody: (extra?: object) => Record<string, unknown> }).authBody;

		const body = authBody.call(resource, { domain: "example.com", ttl: 300 });

		expect(body).toEqual({
			apikey: "pk_test",
			secretapikey: "sk_test",
			domain: "example.com",
			ttl: 300,
		});
	});

	it("should not mutate the original credentials object", () => {
		const creds = { apikey: "pk", secretapikey: "sk" };
		const resource = new Resource(mockFetch, creds);
		const authBody = (resource as unknown as { authBody: (extra?: object) => Record<string, unknown> }).authBody;

		authBody.call(resource, { extra: "value" });

		expect(creds).toEqual({ apikey: "pk", secretapikey: "sk" });
	});
});
