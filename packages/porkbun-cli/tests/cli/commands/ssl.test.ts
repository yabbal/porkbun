import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockGetClient, mockOutput, mockOutputError } = vi.hoisted(() => ({
	mockGetClient: vi.fn(),
	mockOutput: vi.fn(),
	mockOutputError: vi.fn(),
}));

vi.mock("../../../src/cli/config", () => ({
	getClient: mockGetClient,
}));
vi.mock("../../../src/cli/output", () => ({
	output: mockOutput,
	outputError: mockOutputError,
}));

import { ssl } from "../../../src/cli/commands/ssl";

describe("ssl command", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should retrieve SSL certificate and output result", async () => {
		const sslResult = {
			status: "SUCCESS",
			certificatechain: "-----BEGIN CERTIFICATE-----",
			privatekey: "-----BEGIN PRIVATE KEY-----",
		};
		const mockClient = {
			ssl: { retrieve: vi.fn().mockResolvedValue(sslResult) },
		};
		mockGetClient.mockReturnValue(mockClient);

		await ssl.run!({
			args: { domain: "example.com", format: "json" },
			rawArgs: [],
			cmd: ssl,
		} as any);

		expect(mockClient.ssl.retrieve).toHaveBeenCalledWith("example.com");
		expect(mockOutput).toHaveBeenCalledWith(sslResult, { format: "json" });
	});

	it("should pass format to output", async () => {
		const mockClient = {
			ssl: { retrieve: vi.fn().mockResolvedValue({ status: "SUCCESS" }) },
		};
		mockGetClient.mockReturnValue(mockClient);

		await ssl.run!({
			args: { domain: "example.com", format: "table" },
			rawArgs: [],
			cmd: ssl,
		} as any);

		expect(mockOutput).toHaveBeenCalledWith(
			{ status: "SUCCESS" },
			{ format: "table" },
		);
	});

	it("should call outputError on failure", async () => {
		const error = new Error("ssl error");
		const mockClient = {
			ssl: { retrieve: vi.fn().mockRejectedValue(error) },
		};
		mockGetClient.mockReturnValue(mockClient);

		await ssl.run!({
			args: { domain: "example.com", format: "json" },
			rawArgs: [],
			cmd: ssl,
		} as any);

		expect(mockOutputError).toHaveBeenCalledWith(error);
	});
});
