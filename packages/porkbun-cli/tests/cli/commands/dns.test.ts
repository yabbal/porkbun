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

import { dns } from "../../../src/cli/commands/dns";

const subCommands = dns.subCommands as Record<string, any>;

describe("dns list", () => {
	const listCmd = subCommands.list;

	beforeEach(() => vi.clearAllMocks());

	it("should list all DNS records for a domain", async () => {
		const records = [{ id: "1", type: "A", content: "1.2.3.4" }];
		const mockClient = {
			dns: { retrieve: vi.fn().mockResolvedValue(records) },
		};
		mockGetClient.mockReturnValue(mockClient);

		await listCmd.run!({
			args: { domain: "example.com", format: "json" },
			rawArgs: [],
			cmd: listCmd,
		} as any);

		expect(mockClient.dns.retrieve).toHaveBeenCalledWith("example.com", undefined);
		expect(mockOutput).toHaveBeenCalledWith(records, expect.objectContaining({ format: "json" }));
	});

	it("should filter by record ID", async () => {
		const records = [{ id: "42", type: "A" }];
		const mockClient = {
			dns: { retrieve: vi.fn().mockResolvedValue(records) },
		};
		mockGetClient.mockReturnValue(mockClient);

		await listCmd.run!({
			args: { domain: "example.com", id: "42", format: "json" },
			rawArgs: [],
			cmd: listCmd,
		} as any);

		expect(mockClient.dns.retrieve).toHaveBeenCalledWith("example.com", "42");
	});

	it("should filter by type and subdomain", async () => {
		const records = [{ id: "1", type: "A" }];
		const mockClient = {
			dns: { retrieveByNameType: vi.fn().mockResolvedValue(records) },
		};
		mockGetClient.mockReturnValue(mockClient);

		await listCmd.run!({
			args: { domain: "example.com", type: "A", subdomain: "www", format: "json" },
			rawArgs: [],
			cmd: listCmd,
		} as any);

		expect(mockClient.dns.retrieveByNameType).toHaveBeenCalledWith("example.com", "A", "www");
	});

	it("should call outputError on failure", async () => {
		const error = new Error("fail");
		const mockClient = { dns: { retrieve: vi.fn().mockRejectedValue(error) } };
		mockGetClient.mockReturnValue(mockClient);

		await listCmd.run!({
			args: { domain: "example.com", format: "json" },
			rawArgs: [],
			cmd: listCmd,
		} as any);

		expect(mockOutputError).toHaveBeenCalledWith(error);
	});
});

describe("dns create", () => {
	const createCmd = subCommands.create;

	beforeEach(() => vi.clearAllMocks());

	it("should create a DNS record", async () => {
		const result = { status: "SUCCESS", id: "123" };
		const mockClient = {
			dns: { create: vi.fn().mockResolvedValue(result) },
		};
		mockGetClient.mockReturnValue(mockClient);

		await createCmd.run!({
			args: {
				domain: "example.com",
				type: "A",
				content: "1.2.3.4",
				"dry-run": false,
				format: "json",
			},
			rawArgs: [],
			cmd: createCmd,
		} as any);

		expect(mockClient.dns.create).toHaveBeenCalledWith("example.com", {
			type: "A",
			content: "1.2.3.4",
		});
		expect(mockOutput).toHaveBeenCalledWith(result, { format: "json" });
	});

	it("should include optional params", async () => {
		const result = { status: "SUCCESS" };
		const mockClient = {
			dns: { create: vi.fn().mockResolvedValue(result) },
		};
		mockGetClient.mockReturnValue(mockClient);

		await createCmd.run!({
			args: {
				domain: "example.com",
				type: "MX",
				content: "mail.example.com",
				name: "sub",
				ttl: "600",
				prio: "10",
				notes: "test note",
				"dry-run": false,
				format: "json",
			},
			rawArgs: [],
			cmd: createCmd,
		} as any);

		expect(mockClient.dns.create).toHaveBeenCalledWith("example.com", {
			type: "MX",
			content: "mail.example.com",
			name: "sub",
			ttl: 600,
			prio: 10,
			notes: "test note",
		});
	});

	it("should handle dry-run", async () => {
		await createCmd.run!({
			args: {
				domain: "example.com",
				type: "A",
				content: "1.2.3.4",
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
			payload: { type: "A", content: "1.2.3.4" },
		});
	});

	it("should call outputError on failure", async () => {
		const error = new Error("fail");
		const mockClient = { dns: { create: vi.fn().mockRejectedValue(error) } };
		mockGetClient.mockReturnValue(mockClient);

		await createCmd.run!({
			args: {
				domain: "example.com",
				type: "A",
				content: "1.2.3.4",
				"dry-run": false,
				format: "json",
			},
			rawArgs: [],
			cmd: createCmd,
		} as any);

		expect(mockOutputError).toHaveBeenCalledWith(error);
	});
});

describe("dns edit", () => {
	const editCmd = subCommands.edit;

	beforeEach(() => vi.clearAllMocks());

	it("should edit a DNS record by ID", async () => {
		const result = { status: "SUCCESS" };
		const mockClient = {
			dns: { edit: vi.fn().mockResolvedValue(result) },
		};
		mockGetClient.mockReturnValue(mockClient);

		await editCmd.run!({
			args: {
				domain: "example.com",
				id: "42",
				type: "A",
				content: "5.6.7.8",
				"dry-run": false,
				format: "json",
			},
			rawArgs: [],
			cmd: editCmd,
		} as any);

		expect(mockClient.dns.edit).toHaveBeenCalledWith("example.com", "42", {
			type: "A",
			content: "5.6.7.8",
		});
	});

	it("should include optional params", async () => {
		const result = { status: "SUCCESS" };
		const mockClient = {
			dns: { edit: vi.fn().mockResolvedValue(result) },
		};
		mockGetClient.mockReturnValue(mockClient);

		await editCmd.run!({
			args: {
				domain: "example.com",
				id: "42",
				type: "A",
				content: "5.6.7.8",
				name: "sub",
				ttl: "3600",
				prio: "5",
				"dry-run": false,
				format: "json",
			},
			rawArgs: [],
			cmd: editCmd,
		} as any);

		expect(mockClient.dns.edit).toHaveBeenCalledWith("example.com", "42", {
			type: "A",
			content: "5.6.7.8",
			name: "sub",
			ttl: 3600,
			prio: 5,
		});
	});

	it("should handle dry-run", async () => {
		await editCmd.run!({
			args: {
				domain: "example.com",
				id: "42",
				type: "A",
				content: "5.6.7.8",
				"dry-run": true,
				format: "json",
			},
			rawArgs: [],
			cmd: editCmd,
		} as any);

		expect(mockOutput).toHaveBeenCalledWith({
			dry_run: true,
			domain: "example.com",
			recordId: "42",
			payload: { type: "A", content: "5.6.7.8" },
		});
	});
});

describe("dns edit-by-name-type", () => {
	const editByNameTypeCmd = subCommands["edit-by-name-type"];

	beforeEach(() => vi.clearAllMocks());

	it("should edit DNS records by name and type", async () => {
		const result = { status: "SUCCESS" };
		const mockClient = {
			dns: { editByNameType: vi.fn().mockResolvedValue(result) },
		};
		mockGetClient.mockReturnValue(mockClient);

		await editByNameTypeCmd.run!({
			args: {
				domain: "example.com",
				type: "A",
				content: "1.2.3.4",
				subdomain: "www",
				"dry-run": false,
				format: "json",
			},
			rawArgs: [],
			cmd: editByNameTypeCmd,
		} as any);

		expect(mockClient.dns.editByNameType).toHaveBeenCalledWith(
			"example.com",
			"A",
			"www",
			{ content: "1.2.3.4" },
		);
	});

	it("should handle dry-run", async () => {
		await editByNameTypeCmd.run!({
			args: {
				domain: "example.com",
				type: "A",
				content: "1.2.3.4",
				"dry-run": true,
				format: "json",
			},
			rawArgs: [],
			cmd: editByNameTypeCmd,
		} as any);

		expect(mockOutput).toHaveBeenCalledWith({
			dry_run: true,
			domain: "example.com",
			type: "A",
			subdomain: "(root)",
			payload: { content: "1.2.3.4" },
		});
	});

	it("should include optional params", async () => {
		const result = { status: "SUCCESS" };
		const mockClient = {
			dns: { editByNameType: vi.fn().mockResolvedValue(result) },
		};
		mockGetClient.mockReturnValue(mockClient);

		await editByNameTypeCmd.run!({
			args: {
				domain: "example.com",
				type: "A",
				content: "1.2.3.4",
				ttl: "600",
				prio: "10",
				"dry-run": false,
				format: "json",
			},
			rawArgs: [],
			cmd: editByNameTypeCmd,
		} as any);

		expect(mockClient.dns.editByNameType).toHaveBeenCalledWith(
			"example.com",
			"A",
			undefined,
			{ content: "1.2.3.4", ttl: 600, prio: 10 },
		);
	});
});

describe("dns delete", () => {
	const deleteCmd = subCommands.delete;

	beforeEach(() => vi.clearAllMocks());

	it("should delete a DNS record by ID", async () => {
		const result = { status: "SUCCESS" };
		const mockClient = {
			dns: { delete: vi.fn().mockResolvedValue(result) },
		};
		mockGetClient.mockReturnValue(mockClient);

		await deleteCmd.run!({
			args: { domain: "example.com", id: "42", "dry-run": false, format: "json" },
			rawArgs: [],
			cmd: deleteCmd,
		} as any);

		expect(mockClient.dns.delete).toHaveBeenCalledWith("example.com", "42");
	});

	it("should handle dry-run", async () => {
		await deleteCmd.run!({
			args: { domain: "example.com", id: "42", "dry-run": true, format: "json" },
			rawArgs: [],
			cmd: deleteCmd,
		} as any);

		expect(mockOutput).toHaveBeenCalledWith({
			dry_run: true,
			domain: "example.com",
			action: "delete_dns_record",
			recordId: "42",
		});
	});
});

describe("dns delete-by-name-type", () => {
	const deleteByNameTypeCmd = subCommands["delete-by-name-type"];

	beforeEach(() => vi.clearAllMocks());

	it("should delete DNS records by name and type", async () => {
		const result = { status: "SUCCESS" };
		const mockClient = {
			dns: { deleteByNameType: vi.fn().mockResolvedValue(result) },
		};
		mockGetClient.mockReturnValue(mockClient);

		await deleteByNameTypeCmd.run!({
			args: {
				domain: "example.com",
				type: "A",
				subdomain: "www",
				"dry-run": false,
				format: "json",
			},
			rawArgs: [],
			cmd: deleteByNameTypeCmd,
		} as any);

		expect(mockClient.dns.deleteByNameType).toHaveBeenCalledWith("example.com", "A", "www");
	});

	it("should handle dry-run with root subdomain", async () => {
		await deleteByNameTypeCmd.run!({
			args: {
				domain: "example.com",
				type: "A",
				"dry-run": true,
				format: "json",
			},
			rawArgs: [],
			cmd: deleteByNameTypeCmd,
		} as any);

		expect(mockOutput).toHaveBeenCalledWith({
			dry_run: true,
			domain: "example.com",
			action: "delete_dns_by_name_type",
			type: "A",
			subdomain: "(root)",
		});
	});

	it("should call outputError on failure", async () => {
		const error = new Error("fail");
		const mockClient = {
			dns: { deleteByNameType: vi.fn().mockRejectedValue(error) },
		};
		mockGetClient.mockReturnValue(mockClient);

		await deleteByNameTypeCmd.run!({
			args: {
				domain: "example.com",
				type: "A",
				"dry-run": false,
				format: "json",
			},
			rawArgs: [],
			cmd: deleteByNameTypeCmd,
		} as any);

		expect(mockOutputError).toHaveBeenCalledWith(error);
	});
});
