import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// __VERSION__ is injected by tsup at build time, so we define it for tests
vi.stubGlobal("__VERSION__", "1.0.0-test");

import { version } from "../../../src/cli/commands/version";

describe("version command", () => {
	let consoleSpy: ReturnType<typeof vi.spyOn>;

	beforeEach(() => {
		consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("should output version string", () => {
		version.run!({ args: {}, rawArgs: [], cmd: version } as any);
		expect(consoleSpy).toHaveBeenCalledWith("1.0.0-test");
	});
});
