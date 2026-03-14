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

import { dnssec } from "../../../src/cli/commands/dnssec";

const subCommands = dnssec.subCommands as Record<string, any>;

describe("dnssec list", () => {
	const listCmd = subCommands.list;

	beforeEach(() => vi.clearAllMocks());

	it("should list DNSSEC records as JSON", async () => {
		const records = { ds1: { keyTag: "123", alg: "13" } };
		const mockClient = {
			dnssec: { get: vi.fn().mockResolvedValue(records) },
		};
		mockGetClient.mockReturnValue(mockClient);

		await listCmd.run!({
			args: { domain: "example.com", format: "json" },
			rawArgs: [],
			cmd: listCmd,
		} as any);

		expect(mockClient.dnssec.get).toHaveBeenCalledWith("example.com");
		expect(mockOutput).toHaveBeenCalledWith(records);
	});

	it("should format as table with rows from Object.values", async () => {
		const records = {
			ds1: { keyTag: "123", alg: "13" },
			ds2: { keyTag: "456", alg: "8" },
		};
		const mockClient = {
			dnssec: { get: vi.fn().mockResolvedValue(records) },
		};
		mockGetClient.mockReturnValue(mockClient);

		await listCmd.run!({
			args: { domain: "example.com", format: "table" },
			rawArgs: [],
			cmd: listCmd,
		} as any);

		expect(mockOutput).toHaveBeenCalledWith(
			[
				{ keyTag: "123", alg: "13" },
				{ keyTag: "456", alg: "8" },
			],
			expect.objectContaining({ format: "table" }),
		);
	});

	it("should format as csv with rows from Object.values", async () => {
		const records = { ds1: { keyTag: "123", alg: "13" } };
		const mockClient = {
			dnssec: { get: vi.fn().mockResolvedValue(records) },
		};
		mockGetClient.mockReturnValue(mockClient);

		await listCmd.run!({
			args: { domain: "example.com", format: "csv" },
			rawArgs: [],
			cmd: listCmd,
		} as any);

		expect(mockOutput).toHaveBeenCalledWith(
			[{ keyTag: "123", alg: "13" }],
			expect.objectContaining({ format: "csv" }),
		);
	});

	it("should call outputError on failure", async () => {
		const error = new Error("fail");
		const mockClient = { dnssec: { get: vi.fn().mockRejectedValue(error) } };
		mockGetClient.mockReturnValue(mockClient);

		await listCmd.run!({
			args: { domain: "example.com", format: "json" },
			rawArgs: [],
			cmd: listCmd,
		} as any);

		expect(mockOutputError).toHaveBeenCalledWith(error);
	});
});

describe("dnssec create", () => {
	const createCmd = subCommands.create;

	beforeEach(() => vi.clearAllMocks());

	it("should create a DNSSEC record", async () => {
		const result = { status: "SUCCESS" };
		const mockClient = {
			dnssec: { create: vi.fn().mockResolvedValue(result) },
		};
		mockGetClient.mockReturnValue(mockClient);

		await createCmd.run!({
			args: {
				domain: "example.com",
				"key-tag": "12345",
				alg: "13",
				"digest-type": "2",
				digest: "abc123",
				"dry-run": false,
				format: "json",
			},
			rawArgs: [],
			cmd: createCmd,
		} as any);

		expect(mockClient.dnssec.create).toHaveBeenCalledWith("example.com", {
			keyTag: "12345",
			alg: "13",
			digestType: "2",
			digest: "abc123",
		});
		expect(mockOutput).toHaveBeenCalledWith(result, { format: "json" });
	});

	it("should handle dry-run", async () => {
		await createCmd.run!({
			args: {
				domain: "example.com",
				"key-tag": "12345",
				alg: "13",
				"digest-type": "2",
				digest: "abc123",
				"dry-run": true,
				format: "json",
			},
			rawArgs: [],
			cmd: createCmd,
		} as any);

		expect(mockGetClient).not.toHaveBeenCalled();
		expect(mockOutput).toHaveBeenCalledWith({
			dry_run: true,
			domain: "example.com",
			payload: {
				keyTag: "12345",
				alg: "13",
				digestType: "2",
				digest: "abc123",
			},
		});
	});

	it("should call outputError on failure", async () => {
		const error = new Error("fail");
		const mockClient = { dnssec: { create: vi.fn().mockRejectedValue(error) } };
		mockGetClient.mockReturnValue(mockClient);

		await createCmd.run!({
			args: {
				domain: "example.com",
				"key-tag": "12345",
				alg: "13",
				"digest-type": "2",
				digest: "abc123",
				"dry-run": false,
				format: "json",
			},
			rawArgs: [],
			cmd: createCmd,
		} as any);

		expect(mockOutputError).toHaveBeenCalledWith(error);
	});
});

describe("dnssec delete", () => {
	const deleteCmd = subCommands.delete;

	beforeEach(() => vi.clearAllMocks());

	it("should delete a DNSSEC record", async () => {
		const result = { status: "SUCCESS" };
		const mockClient = {
			dnssec: { delete: vi.fn().mockResolvedValue(result) },
		};
		mockGetClient.mockReturnValue(mockClient);

		await deleteCmd.run!({
			args: {
				domain: "example.com",
				"key-tag": "12345",
				"dry-run": false,
				format: "json",
			},
			rawArgs: [],
			cmd: deleteCmd,
		} as any);

		expect(mockClient.dnssec.delete).toHaveBeenCalledWith("example.com", "12345");
		expect(mockOutput).toHaveBeenCalledWith(result, { format: "json" });
	});

	it("should handle dry-run", async () => {
		await deleteCmd.run!({
			args: {
				domain: "example.com",
				"key-tag": "12345",
				"dry-run": true,
				format: "json",
			},
			rawArgs: [],
			cmd: deleteCmd,
		} as any);

		expect(mockOutput).toHaveBeenCalledWith({
			dry_run: true,
			domain: "example.com",
			action: "delete_dnssec",
			keyTag: "12345",
		});
	});

	it("should call outputError on failure", async () => {
		const error = new Error("fail");
		const mockClient = { dnssec: { delete: vi.fn().mockRejectedValue(error) } };
		mockGetClient.mockReturnValue(mockClient);

		await deleteCmd.run!({
			args: {
				domain: "example.com",
				"key-tag": "12345",
				"dry-run": false,
				format: "json",
			},
			rawArgs: [],
			cmd: deleteCmd,
		} as any);

		expect(mockOutputError).toHaveBeenCalledWith(error);
	});
});
