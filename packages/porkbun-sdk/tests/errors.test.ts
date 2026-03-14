import { describe, expect, it } from "vitest";
import { PorkbunError } from "../src/errors";

describe("PorkbunError", () => {
	it("should be an instance of Error", () => {
		const error = new PorkbunError("test", 400, "/ping");
		expect(error).toBeInstanceOf(Error);
	});

	it("should have name set to PorkbunError", () => {
		const error = new PorkbunError("test", 400, "/ping");
		expect(error.name).toBe("PorkbunError");
	});

	it("should expose message, status, endpoint, and details", () => {
		const details = { message: "Invalid domain" };
		const error = new PorkbunError("Bad Request", 400, "/dns/create", details);

		expect(error.message).toBe("Bad Request");
		expect(error.status).toBe(400);
		expect(error.endpoint).toBe("/dns/create");
		expect(error.details).toEqual(details);
	});

	it("should allow details to be undefined", () => {
		const error = new PorkbunError("Not Found", 404, "/domain/check");
		expect(error.details).toBeUndefined();
	});

	it("should return the correct JSON format from toJSON()", () => {
		const details = { code: "INVALID" };
		const error = new PorkbunError("Forbidden", 403, "/ssl/retrieve", details);

		expect(error.toJSON()).toEqual({
			error: "PorkbunError",
			message: "Forbidden",
			status: 403,
			endpoint: "/ssl/retrieve",
			details: { code: "INVALID" },
		});
	});

	it("should return undefined details in toJSON() when not provided", () => {
		const error = new PorkbunError("Error", 500, "/ping");
		const json = error.toJSON();
		expect(json.details).toBeUndefined();
	});
});
