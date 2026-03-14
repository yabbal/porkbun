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

import { pricing } from "../../../src/cli/commands/pricing";

describe("pricing command", () => {
	const pricingData = {
		pricing: {
			com: { registration: "9.99", renewal: "9.99", transfer: "9.99" },
			net: { registration: "10.99", renewal: "10.99", transfer: "10.99" },
		},
	};

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should output full pricing data as JSON", async () => {
		const mockClient = { pricing: { get: vi.fn().mockResolvedValue(pricingData) } };
		mockGetClient.mockReturnValue(mockClient);

		await pricing.run!({ args: { format: "json" }, rawArgs: [], cmd: pricing } as any);

		expect(mockOutput).toHaveBeenCalledWith(pricingData);
	});

	it("should filter by TLD", async () => {
		const mockClient = { pricing: { get: vi.fn().mockResolvedValue(pricingData) } };
		mockGetClient.mockReturnValue(mockClient);

		await pricing.run!({
			args: { format: "json", tld: "com" },
			rawArgs: [],
			cmd: pricing,
		} as any);

		expect(mockOutput).toHaveBeenCalledWith(
			{ tld: "com", registration: "9.99", renewal: "9.99", transfer: "9.99" },
			expect.objectContaining({ format: "json" }),
		);
	});

	it("should strip leading dot from TLD", async () => {
		const mockClient = { pricing: { get: vi.fn().mockResolvedValue(pricingData) } };
		mockGetClient.mockReturnValue(mockClient);

		await pricing.run!({
			args: { format: "json", tld: ".com" },
			rawArgs: [],
			cmd: pricing,
		} as any);

		expect(mockOutput).toHaveBeenCalledWith(
			expect.objectContaining({ tld: "com" }),
			expect.anything(),
		);
	});

	it("should call outputError when TLD not found", async () => {
		const mockClient = { pricing: { get: vi.fn().mockResolvedValue(pricingData) } };
		mockGetClient.mockReturnValue(mockClient);

		await pricing.run!({
			args: { format: "json", tld: "xyz" },
			rawArgs: [],
			cmd: pricing,
		} as any);

		expect(mockOutputError).toHaveBeenCalledWith(expect.any(Error));
	});

	it("should format as table with rows", async () => {
		const mockClient = { pricing: { get: vi.fn().mockResolvedValue(pricingData) } };
		mockGetClient.mockReturnValue(mockClient);

		await pricing.run!({
			args: { format: "table" },
			rawArgs: [],
			cmd: pricing,
		} as any);

		expect(mockOutput).toHaveBeenCalledWith(
			expect.arrayContaining([
				expect.objectContaining({ tld: "com" }),
				expect.objectContaining({ tld: "net" }),
			]),
			expect.objectContaining({ format: "table" }),
		);
	});

	it("should format as csv with rows", async () => {
		const mockClient = { pricing: { get: vi.fn().mockResolvedValue(pricingData) } };
		mockGetClient.mockReturnValue(mockClient);

		await pricing.run!({
			args: { format: "csv" },
			rawArgs: [],
			cmd: pricing,
		} as any);

		expect(mockOutput).toHaveBeenCalledWith(
			expect.arrayContaining([expect.objectContaining({ tld: "com" })]),
			expect.objectContaining({ format: "csv" }),
		);
	});

	it("should call outputError on failure", async () => {
		const error = new Error("api error");
		const mockClient = { pricing: { get: vi.fn().mockRejectedValue(error) } };
		mockGetClient.mockReturnValue(mockClient);

		await pricing.run!({ args: { format: "json" }, rawArgs: [], cmd: pricing } as any);

		expect(mockOutputError).toHaveBeenCalledWith(error);
	});
});
