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

import { domain } from "../../../src/cli/commands/domain";

const subCommands = domain.subCommands as Record<string, any>;

describe("domain list", () => {
	const listCmd = subCommands.list;

	beforeEach(() => vi.clearAllMocks());

	it("should list all domains", async () => {
		const domains = [{ domain: "example.com" }];
		const mockClient = {
			domain: { listAll: vi.fn().mockResolvedValue({ domains }) },
		};
		mockGetClient.mockReturnValue(mockClient);

		await listCmd.run!({ args: { format: "json" }, rawArgs: [], cmd: listCmd } as any);

		expect(mockClient.domain.listAll).toHaveBeenCalledWith({
			start: undefined,
			includeLabels: undefined,
		});
		expect(mockOutput).toHaveBeenCalledWith(domains, expect.objectContaining({ format: "json" }));
	});

	it("should pass start and labels options", async () => {
		const mockClient = {
			domain: { listAll: vi.fn().mockResolvedValue({ domains: [] }) },
		};
		mockGetClient.mockReturnValue(mockClient);

		await listCmd.run!({
			args: { format: "json", start: "1000", labels: true },
			rawArgs: [],
			cmd: listCmd,
		} as any);

		expect(mockClient.domain.listAll).toHaveBeenCalledWith({
			start: 1000,
			includeLabels: true,
		});
	});

	it("should call outputError on failure", async () => {
		const error = new Error("fail");
		const mockClient = { domain: { listAll: vi.fn().mockRejectedValue(error) } };
		mockGetClient.mockReturnValue(mockClient);

		await listCmd.run!({ args: { format: "json" }, rawArgs: [], cmd: listCmd } as any);
		expect(mockOutputError).toHaveBeenCalledWith(error);
	});
});

describe("domain check", () => {
	const checkCmd = subCommands.check;

	beforeEach(() => vi.clearAllMocks());

	it("should check domain availability", async () => {
		const result = { status: "SUCCESS", avail: true };
		const mockClient = { domain: { check: vi.fn().mockResolvedValue(result) } };
		mockGetClient.mockReturnValue(mockClient);

		await checkCmd.run!({
			args: { domain: "example.com", format: "json" },
			rawArgs: [],
			cmd: checkCmd,
		} as any);

		expect(mockClient.domain.check).toHaveBeenCalledWith("example.com");
		expect(mockOutput).toHaveBeenCalledWith(result, { format: "json" });
	});

	it("should call outputError on failure", async () => {
		const error = new Error("fail");
		const mockClient = { domain: { check: vi.fn().mockRejectedValue(error) } };
		mockGetClient.mockReturnValue(mockClient);

		await checkCmd.run!({
			args: { domain: "example.com", format: "json" },
			rawArgs: [],
			cmd: checkCmd,
		} as any);
		expect(mockOutputError).toHaveBeenCalledWith(error);
	});
});

describe("domain create", () => {
	const createCmd = subCommands.create;

	beforeEach(() => vi.clearAllMocks());

	it("should register a domain", async () => {
		const result = { status: "SUCCESS" };
		const mockClient = { domain: { create: vi.fn().mockResolvedValue(result) } };
		mockGetClient.mockReturnValue(mockClient);

		await createCmd.run!({
			args: { domain: "example.com", cost: "999", "dry-run": false, format: "json" },
			rawArgs: [],
			cmd: createCmd,
		} as any);

		expect(mockClient.domain.create).toHaveBeenCalledWith("example.com", {
			cost: 999,
			agreeToTerms: "yes",
		});
		expect(mockOutput).toHaveBeenCalledWith(result, { format: "json" });
	});

	it("should handle dry-run", async () => {
		await createCmd.run!({
			args: { domain: "example.com", cost: "999", "dry-run": true, format: "json" },
			rawArgs: [],
			cmd: createCmd,
		} as any);

		expect(mockGetClient).not.toHaveBeenCalled();
		expect(mockOutput).toHaveBeenCalledWith({
			dry_run: true,
			domain: "example.com",
			payload: { cost: 999, agreeToTerms: "yes" },
		});
	});
});

describe("domain ns", () => {
	const nsCmd = subCommands.ns;
	const nsSubCommands = nsCmd.subCommands as Record<string, any>;

	beforeEach(() => vi.clearAllMocks());

	describe("ns get", () => {
		const getCmd = nsSubCommands.get;

		it("should get nameservers as JSON", async () => {
			const result = { ns: ["ns1.porkbun.com", "ns2.porkbun.com"] };
			const mockClient = { domain: { getNameServers: vi.fn().mockResolvedValue(result) } };
			mockGetClient.mockReturnValue(mockClient);

			await getCmd.run!({
				args: { domain: "example.com", format: "json" },
				rawArgs: [],
				cmd: getCmd,
			} as any);

			expect(mockOutput).toHaveBeenCalledWith(result);
		});

		it("should format nameservers as table", async () => {
			const result = { ns: ["ns1.porkbun.com", "ns2.porkbun.com"] };
			const mockClient = { domain: { getNameServers: vi.fn().mockResolvedValue(result) } };
			mockGetClient.mockReturnValue(mockClient);

			await getCmd.run!({
				args: { domain: "example.com", format: "table" },
				rawArgs: [],
				cmd: getCmd,
			} as any);

			expect(mockOutput).toHaveBeenCalledWith(
				[
					{ index: 1, nameserver: "ns1.porkbun.com" },
					{ index: 2, nameserver: "ns2.porkbun.com" },
				],
				expect.objectContaining({ format: "table" }),
			);
		});
	});

	describe("ns update", () => {
		const updateCmd = nsSubCommands.update;

		it("should update nameservers", async () => {
			const result = { status: "SUCCESS" };
			const mockClient = {
				domain: { updateNameServers: vi.fn().mockResolvedValue(result) },
			};
			mockGetClient.mockReturnValue(mockClient);

			await updateCmd.run!({
				args: {
					domain: "example.com",
					ns: "ns1.example.com,ns2.example.com",
					"dry-run": false,
					format: "json",
				},
				rawArgs: [],
				cmd: updateCmd,
			} as any);

			expect(mockClient.domain.updateNameServers).toHaveBeenCalledWith(
				"example.com",
				["ns1.example.com", "ns2.example.com"],
			);
		});

		it("should handle dry-run", async () => {
			await updateCmd.run!({
				args: {
					domain: "example.com",
					ns: "ns1.example.com, ns2.example.com",
					"dry-run": true,
					format: "json",
				},
				rawArgs: [],
				cmd: updateCmd,
			} as any);

			expect(mockOutput).toHaveBeenCalledWith({
				dry_run: true,
				domain: "example.com",
				payload: { ns: ["ns1.example.com", "ns2.example.com"] },
			});
		});
	});
});

describe("domain auto-renew", () => {
	const autoRenewCmd = subCommands["auto-renew"];

	beforeEach(() => vi.clearAllMocks());

	it("should update auto-renew status", async () => {
		const result = { status: "SUCCESS" };
		const mockClient = {
			domain: { updateAutoRenew: vi.fn().mockResolvedValue(result) },
		};
		mockGetClient.mockReturnValue(mockClient);

		await autoRenewCmd.run!({
			args: { domain: "example.com", status: "on", "dry-run": false, format: "json" },
			rawArgs: [],
			cmd: autoRenewCmd,
		} as any);

		expect(mockClient.domain.updateAutoRenew).toHaveBeenCalledWith(
			{ status: "on" },
			"example.com",
		);
	});

	it("should handle dry-run", async () => {
		await autoRenewCmd.run!({
			args: { domain: "example.com", status: "off", "dry-run": true, format: "json" },
			rawArgs: [],
			cmd: autoRenewCmd,
		} as any);

		expect(mockOutput).toHaveBeenCalledWith({
			dry_run: true,
			domain: "example.com",
			payload: { status: "off" },
		});
	});

	it("should error on invalid status", async () => {
		await autoRenewCmd.run!({
			args: { domain: "example.com", status: "invalid", "dry-run": false, format: "json" },
			rawArgs: [],
			cmd: autoRenewCmd,
		} as any);

		expect(mockOutputError).toHaveBeenCalledWith(expect.any(Error));
	});
});

describe("domain forward", () => {
	const forwardCmd = subCommands.forward;
	const forwardSubCommands = forwardCmd.subCommands as Record<string, any>;

	beforeEach(() => vi.clearAllMocks());

	describe("forward list", () => {
		const listCmd = forwardSubCommands.list;

		it("should list URL forwards", async () => {
			const result = [{ id: "1", location: "https://example.com" }];
			const mockClient = {
				domain: { getUrlForwarding: vi.fn().mockResolvedValue(result) },
			};
			mockGetClient.mockReturnValue(mockClient);

			await listCmd.run!({
				args: { domain: "example.com", format: "json" },
				rawArgs: [],
				cmd: listCmd,
			} as any);

			expect(mockOutput).toHaveBeenCalledWith(result, expect.objectContaining({ format: "json" }));
		});

		it("should call outputError on failure", async () => {
			const error = new Error("fail");
			const mockClient = {
				domain: { getUrlForwarding: vi.fn().mockRejectedValue(error) },
			};
			mockGetClient.mockReturnValue(mockClient);

			await listCmd.run!({
				args: { domain: "example.com", format: "json" },
				rawArgs: [],
				cmd: listCmd,
			} as any);
			expect(mockOutputError).toHaveBeenCalledWith(error);
		});
	});

	describe("forward add", () => {
		const addCmd = forwardSubCommands.add;

		it("should add a URL forward", async () => {
			const result = { status: "SUCCESS" };
			const mockClient = {
				domain: { addUrlForward: vi.fn().mockResolvedValue(result) },
			};
			mockGetClient.mockReturnValue(mockClient);

			await addCmd.run!({
				args: {
					domain: "example.com",
					location: "https://target.com",
					type: "permanent",
					"include-path": "no",
					wildcard: "no",
					"dry-run": false,
					format: "json",
				},
				rawArgs: [],
				cmd: addCmd,
			} as any);

			expect(mockClient.domain.addUrlForward).toHaveBeenCalledWith("example.com", {
				location: "https://target.com",
				type: "permanent",
				includePath: "no",
				wildcard: "no",
			});
		});

		it("should include subdomain when provided", async () => {
			const result = { status: "SUCCESS" };
			const mockClient = {
				domain: { addUrlForward: vi.fn().mockResolvedValue(result) },
			};
			mockGetClient.mockReturnValue(mockClient);

			await addCmd.run!({
				args: {
					domain: "example.com",
					location: "https://target.com",
					subdomain: "blog",
					type: "temporary",
					"include-path": "yes",
					wildcard: "yes",
					"dry-run": false,
					format: "json",
				},
				rawArgs: [],
				cmd: addCmd,
			} as any);

			expect(mockClient.domain.addUrlForward).toHaveBeenCalledWith("example.com", {
				location: "https://target.com",
				subdomain: "blog",
				type: "temporary",
				includePath: "yes",
				wildcard: "yes",
			});
		});

		it("should handle dry-run", async () => {
			await addCmd.run!({
				args: {
					domain: "example.com",
					location: "https://target.com",
					type: "permanent",
					"include-path": "no",
					wildcard: "no",
					"dry-run": true,
					format: "json",
				},
				rawArgs: [],
				cmd: addCmd,
			} as any);

			expect(mockOutput).toHaveBeenCalledWith(expect.objectContaining({ dry_run: true }));
		});

		it("should call outputError on failure", async () => {
			const error = new Error("fail");
			const mockClient = {
				domain: { addUrlForward: vi.fn().mockRejectedValue(error) },
			};
			mockGetClient.mockReturnValue(mockClient);

			await addCmd.run!({
				args: {
					domain: "example.com",
					location: "https://target.com",
					type: "permanent",
					"include-path": "no",
					wildcard: "no",
					"dry-run": false,
					format: "json",
				},
				rawArgs: [],
				cmd: addCmd,
			} as any);
			expect(mockOutputError).toHaveBeenCalledWith(error);
		});
	});

	describe("forward delete", () => {
		const deleteCmd = forwardSubCommands.delete;

		it("should delete a URL forward", async () => {
			const result = { status: "SUCCESS" };
			const mockClient = {
				domain: { deleteUrlForward: vi.fn().mockResolvedValue(result) },
			};
			mockGetClient.mockReturnValue(mockClient);

			await deleteCmd.run!({
				args: { domain: "example.com", id: "123", "dry-run": false, format: "json" },
				rawArgs: [],
				cmd: deleteCmd,
			} as any);

			expect(mockClient.domain.deleteUrlForward).toHaveBeenCalledWith("example.com", "123");
		});

		it("should handle dry-run", async () => {
			await deleteCmd.run!({
				args: { domain: "example.com", id: "123", "dry-run": true, format: "json" },
				rawArgs: [],
				cmd: deleteCmd,
			} as any);

			expect(mockOutput).toHaveBeenCalledWith({
				dry_run: true,
				domain: "example.com",
				action: "delete_url_forward",
				recordId: "123",
			});
		});

		it("should call outputError on failure", async () => {
			const error = new Error("fail");
			const mockClient = {
				domain: { deleteUrlForward: vi.fn().mockRejectedValue(error) },
			};
			mockGetClient.mockReturnValue(mockClient);

			await deleteCmd.run!({
				args: { domain: "example.com", id: "123", "dry-run": false, format: "json" },
				rawArgs: [],
				cmd: deleteCmd,
			} as any);
			expect(mockOutputError).toHaveBeenCalledWith(error);
		});
	});
});

describe("domain glue", () => {
	const glueCmd = subCommands.glue;
	const glueSubCommands = glueCmd.subCommands as Record<string, any>;

	beforeEach(() => vi.clearAllMocks());

	describe("glue list", () => {
		const listCmd = glueSubCommands.list;

		it("should list glue records", async () => {
			const hosts = [{ hostname: "ns1.example.com", ips: ["1.2.3.4"] }];
			const mockClient = {
				domain: { getGlueRecords: vi.fn().mockResolvedValue({ hosts }) },
			};
			mockGetClient.mockReturnValue(mockClient);

			await listCmd.run!({
				args: { domain: "example.com", format: "json" },
				rawArgs: [],
				cmd: listCmd,
			} as any);

			expect(mockOutput).toHaveBeenCalledWith(hosts, expect.objectContaining({ format: "json" }));
		});

		it("should handle missing hosts", async () => {
			const mockClient = {
				domain: { getGlueRecords: vi.fn().mockResolvedValue({}) },
			};
			mockGetClient.mockReturnValue(mockClient);

			await listCmd.run!({
				args: { domain: "example.com", format: "json" },
				rawArgs: [],
				cmd: listCmd,
			} as any);

			expect(mockOutput).toHaveBeenCalledWith([], expect.anything());
		});

		it("should call outputError on failure", async () => {
			const error = new Error("fail");
			const mockClient = {
				domain: { getGlueRecords: vi.fn().mockRejectedValue(error) },
			};
			mockGetClient.mockReturnValue(mockClient);

			await listCmd.run!({
				args: { domain: "example.com", format: "json" },
				rawArgs: [],
				cmd: listCmd,
			} as any);
			expect(mockOutputError).toHaveBeenCalledWith(error);
		});
	});

	describe("glue create", () => {
		const createCmd = glueSubCommands.create;

		it("should create a glue record", async () => {
			const result = { status: "SUCCESS" };
			const mockClient = {
				domain: { createGlueRecord: vi.fn().mockResolvedValue(result) },
			};
			mockGetClient.mockReturnValue(mockClient);

			await createCmd.run!({
				args: {
					domain: "example.com",
					subdomain: "ns1",
					ips: "1.2.3.4,5.6.7.8",
					"dry-run": false,
					format: "json",
				},
				rawArgs: [],
				cmd: createCmd,
			} as any);

			expect(mockClient.domain.createGlueRecord).toHaveBeenCalledWith(
				"example.com",
				"ns1",
				["1.2.3.4", "5.6.7.8"],
			);
		});

		it("should handle dry-run", async () => {
			await createCmd.run!({
				args: {
					domain: "example.com",
					subdomain: "ns1",
					ips: "1.2.3.4",
					"dry-run": true,
					format: "json",
				},
				rawArgs: [],
				cmd: createCmd,
			} as any);

			expect(mockOutput).toHaveBeenCalledWith({
				dry_run: true,
				domain: "example.com",
				subdomain: "ns1",
				payload: { ips: ["1.2.3.4"] },
			});
		});

		it("should call outputError on failure", async () => {
			const error = new Error("fail");
			const mockClient = {
				domain: { createGlueRecord: vi.fn().mockRejectedValue(error) },
			};
			mockGetClient.mockReturnValue(mockClient);

			await createCmd.run!({
				args: {
					domain: "example.com",
					subdomain: "ns1",
					ips: "1.2.3.4",
					"dry-run": false,
					format: "json",
				},
				rawArgs: [],
				cmd: createCmd,
			} as any);
			expect(mockOutputError).toHaveBeenCalledWith(error);
		});
	});

	describe("glue update", () => {
		const updateCmd = glueSubCommands.update;

		it("should update a glue record", async () => {
			const result = { status: "SUCCESS" };
			const mockClient = {
				domain: { updateGlueRecord: vi.fn().mockResolvedValue(result) },
			};
			mockGetClient.mockReturnValue(mockClient);

			await updateCmd.run!({
				args: {
					domain: "example.com",
					subdomain: "ns1",
					ips: "1.2.3.4",
					"dry-run": false,
					format: "json",
				},
				rawArgs: [],
				cmd: updateCmd,
			} as any);

			expect(mockClient.domain.updateGlueRecord).toHaveBeenCalledWith(
				"example.com",
				"ns1",
				["1.2.3.4"],
			);
		});

		it("should handle dry-run", async () => {
			await updateCmd.run!({
				args: {
					domain: "example.com",
					subdomain: "ns1",
					ips: "1.2.3.4",
					"dry-run": true,
					format: "json",
				},
				rawArgs: [],
				cmd: updateCmd,
			} as any);

			expect(mockOutput).toHaveBeenCalledWith(expect.objectContaining({ dry_run: true }));
		});

		it("should call outputError on failure", async () => {
			const error = new Error("fail");
			const mockClient = {
				domain: { updateGlueRecord: vi.fn().mockRejectedValue(error) },
			};
			mockGetClient.mockReturnValue(mockClient);

			await updateCmd.run!({
				args: {
					domain: "example.com",
					subdomain: "ns1",
					ips: "1.2.3.4",
					"dry-run": false,
					format: "json",
				},
				rawArgs: [],
				cmd: updateCmd,
			} as any);
			expect(mockOutputError).toHaveBeenCalledWith(error);
		});
	});

	describe("glue delete", () => {
		const deleteCmd = glueSubCommands.delete;

		it("should delete a glue record", async () => {
			const result = { status: "SUCCESS" };
			const mockClient = {
				domain: { deleteGlueRecord: vi.fn().mockResolvedValue(result) },
			};
			mockGetClient.mockReturnValue(mockClient);

			await deleteCmd.run!({
				args: { domain: "example.com", subdomain: "ns1", "dry-run": false, format: "json" },
				rawArgs: [],
				cmd: deleteCmd,
			} as any);

			expect(mockClient.domain.deleteGlueRecord).toHaveBeenCalledWith("example.com", "ns1");
		});

		it("should handle dry-run", async () => {
			await deleteCmd.run!({
				args: { domain: "example.com", subdomain: "ns1", "dry-run": true, format: "json" },
				rawArgs: [],
				cmd: deleteCmd,
			} as any);

			expect(mockOutput).toHaveBeenCalledWith({
				dry_run: true,
				domain: "example.com",
				action: "delete_glue_record",
				subdomain: "ns1",
			});
		});

		it("should call outputError on failure", async () => {
			const error = new Error("fail");
			const mockClient = {
				domain: { deleteGlueRecord: vi.fn().mockRejectedValue(error) },
			};
			mockGetClient.mockReturnValue(mockClient);

			await deleteCmd.run!({
				args: { domain: "example.com", subdomain: "ns1", "dry-run": false, format: "json" },
				rawArgs: [],
				cmd: deleteCmd,
			} as any);
			expect(mockOutputError).toHaveBeenCalledWith(error);
		});
	});
});
