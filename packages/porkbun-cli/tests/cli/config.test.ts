import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const { MockPorkbunClient } = vi.hoisted(() => {
	const MockPorkbunClient = vi.fn(function (this: any, opts: unknown) {
		this._opts = opts;
		this.ping = vi.fn();
	});
	return { MockPorkbunClient };
});

vi.mock("porkbun-sdk", () => ({
	PorkbunClient: MockPorkbunClient,
}));

describe("getClient", () => {
	const originalEnv = process.env;
	let errorSpy: ReturnType<typeof vi.spyOn>;
	let exitSpy: ReturnType<typeof vi.spyOn>;

	beforeEach(() => {
		process.env = { ...originalEnv };
		errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
		exitSpy = vi.spyOn(process, "exit").mockImplementation(() => undefined as never);
		MockPorkbunClient.mockClear();
		vi.resetModules();
	});

	afterEach(() => {
		process.env = originalEnv;
		vi.restoreAllMocks();
	});

	it("should return a PorkbunClient when credentials are set", async () => {
		process.env.PORKBUN_API_KEY = "pk_test";
		process.env.PORKBUN_API_SECRET = "sk_test";

		const { getClient } = await import("../../src/cli/config");
		const client = getClient();

		expect(MockPorkbunClient).toHaveBeenCalledWith({
			apikey: "pk_test",
			secretapikey: "sk_test",
		});
		expect(client).toBeDefined();
	});

	it("should exit with error when PORKBUN_API_KEY is missing", async () => {
		delete process.env.PORKBUN_API_KEY;
		process.env.PORKBUN_API_SECRET = "sk_test";

		const { getClient } = await import("../../src/cli/config");
		getClient();

		expect(errorSpy).toHaveBeenCalled();
		const written = errorSpy.mock.calls[0]?.[0] as string;
		const parsed = JSON.parse(written);
		expect(parsed.error).toBe("Missing credentials");
		expect(exitSpy).toHaveBeenCalledWith(1);
	});

	it("should exit with error when PORKBUN_API_SECRET is missing", async () => {
		process.env.PORKBUN_API_KEY = "pk_test";
		delete process.env.PORKBUN_API_SECRET;

		const { getClient } = await import("../../src/cli/config");
		getClient();

		expect(exitSpy).toHaveBeenCalledWith(1);
	});

	it("should exit with error when both credentials are missing", async () => {
		delete process.env.PORKBUN_API_KEY;
		delete process.env.PORKBUN_API_SECRET;

		const { getClient } = await import("../../src/cli/config");
		getClient();

		expect(exitSpy).toHaveBeenCalledWith(1);
	});
});
