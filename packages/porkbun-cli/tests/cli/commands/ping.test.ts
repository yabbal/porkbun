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

import { ping } from "../../../src/cli/commands/ping";

describe("ping command", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should call client.ping() and output result", async () => {
		const mockClient = { ping: vi.fn().mockResolvedValue({ status: "SUCCESS", yourIp: "1.2.3.4" }) };
		mockGetClient.mockReturnValue(mockClient);

		await ping.run!({ args: { format: "json" }, rawArgs: [], cmd: ping } as any);

		expect(mockGetClient).toHaveBeenCalled();
		expect(mockClient.ping).toHaveBeenCalled();
		expect(mockOutput).toHaveBeenCalledWith(
			{ status: "SUCCESS", yourIp: "1.2.3.4" },
			{ format: "json" },
		);
	});

	it("should pass format option to output", async () => {
		const mockClient = { ping: vi.fn().mockResolvedValue({ status: "SUCCESS" }) };
		mockGetClient.mockReturnValue(mockClient);

		await ping.run!({ args: { format: "table" }, rawArgs: [], cmd: ping } as any);

		expect(mockOutput).toHaveBeenCalledWith(
			{ status: "SUCCESS" },
			{ format: "table" },
		);
	});

	it("should call outputError on failure", async () => {
		const error = new Error("auth failed");
		const mockClient = { ping: vi.fn().mockRejectedValue(error) };
		mockGetClient.mockReturnValue(mockClient);

		await ping.run!({ args: { format: "json" }, rawArgs: [], cmd: ping } as any);

		expect(mockOutputError).toHaveBeenCalledWith(error);
	});
});
