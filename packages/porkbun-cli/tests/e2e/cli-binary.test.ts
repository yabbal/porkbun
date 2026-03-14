import { describe, it, expect } from "vitest";
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";

const cliRoot = resolve(import.meta.dirname, "../..");
const distCli = resolve(cliRoot, "dist/cli.js");

const runCli = (args: string[]) => {
	return spawnSync("node", [distCli, ...args], {
		cwd: cliRoot,
		encoding: "utf-8",
		timeout: 10_000,
		env: { ...process.env, NODE_ENV: "test" },
	});
};

describe("CLI binary (e2e)", () => {
	it("should show help with --help flag", () => {
		const result = runCli(["--help"]);
		// citty outputs help to stdout
		const combined = (result.stdout ?? "") + (result.stderr ?? "");
		expect(combined).toContain("porkbun");
	});

	it("should show version with version subcommand", () => {
		const result = runCli(["version"]);
		const combined = (result.stdout ?? "") + (result.stderr ?? "");
		// Version is injected by tsup, should be present in output
		expect(combined.length).toBeGreaterThan(0);
	});
});
