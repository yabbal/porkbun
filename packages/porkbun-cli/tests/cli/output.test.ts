import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { output, outputError } from "../../src/cli/output";

describe("output", () => {
	let logSpy: ReturnType<typeof vi.spyOn>;
	let errorSpy: ReturnType<typeof vi.spyOn>;
	let exitSpy: ReturnType<typeof vi.spyOn>;

	beforeEach(() => {
		logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
		errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
		exitSpy = vi.spyOn(process, "exit").mockImplementation(() => undefined as never);
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe("JSON format", () => {
		it("should output pretty-printed JSON by default", () => {
			const data = { foo: "bar", count: 42 };
			output(data);
			expect(logSpy).toHaveBeenCalledWith(JSON.stringify(data, null, 2));
		});

		it("should output pretty-printed JSON when format is json", () => {
			const data = { foo: "bar" };
			output(data, { format: "json" });
			expect(logSpy).toHaveBeenCalledWith(JSON.stringify(data, null, 2));
		});

		it("should handle null values in data", () => {
			const data = { foo: null };
			output(data, { format: "json" });
			expect(logSpy).toHaveBeenCalledWith(JSON.stringify(data, null, 2));
		});

		it("should handle arrays", () => {
			const data = [1, 2, 3];
			output(data, { format: "json" });
			expect(logSpy).toHaveBeenCalledWith(JSON.stringify(data, null, 2));
		});

		it("should handle primitives", () => {
			output("hello", { format: "json" });
			expect(logSpy).toHaveBeenCalledWith(JSON.stringify("hello", null, 2));
		});
	});

	describe("table format", () => {
		it("should render a table for an array of objects", () => {
			const data = [
				{ name: "alice", age: 30 },
				{ name: "bob", age: 25 },
			];
			output(data, { format: "table" });
			const written = logSpy.mock.calls[0]?.[0] as string;
			expect(written).toContain("alice");
			expect(written).toContain("bob");
			expect(written).toContain("name");
			expect(written).toContain("age");
		});

		it("should render a table for a single object (wraps in array)", () => {
			const data = { name: "alice", age: 30 };
			output(data, { format: "table" });
			const written = logSpy.mock.calls[0]?.[0] as string;
			expect(written).toContain("alice");
			expect(written).toContain("name");
		});

		it("should unwrap nested arrays from objects", () => {
			const data = {
				status: "ok",
				records: [
					{ id: "1", value: "a" },
					{ id: "2", value: "b" },
				],
			};
			output(data, { format: "table" });
			const written = logSpy.mock.calls[0]?.[0] as string;
			expect(written).toContain("1");
			expect(written).toContain("a");
		});

		it("should use custom columns when provided", () => {
			const data = [{ first: "alice", last: "smith" }];
			output(data, {
				format: "table",
				columns: [{ key: "first", header: "First Name" }],
			});
			const written = logSpy.mock.calls[0]?.[0] as string;
			expect(written).toContain("First Name");
			expect(written).toContain("alice");
		});

		it("should use custom getter in columns", () => {
			const data = [{ status: true }];
			output(data, {
				format: "table",
				columns: [
					{
						key: "status",
						header: "Status",
						get: (row) => (row.status ? "Active" : "Inactive"),
					},
				],
			});
			const written = logSpy.mock.calls[0]?.[0] as string;
			expect(written).toContain("Active");
		});
	});

	describe("CSV format", () => {
		it("should output CSV header and rows", () => {
			const data = [
				{ name: "alice", age: 30 },
				{ name: "bob", age: 25 },
			];
			output(data, { format: "csv" });
			expect(logSpy).toHaveBeenNthCalledWith(1, "name,age");
			expect(logSpy).toHaveBeenNthCalledWith(2, "alice,30");
			expect(logSpy).toHaveBeenNthCalledWith(3, "bob,25");
		});

		it("should escape values containing commas", () => {
			const data = [{ desc: "hello, world" }];
			output(data, { format: "csv" });
			expect(logSpy).toHaveBeenNthCalledWith(2, '"hello, world"');
		});

		it("should escape values containing double quotes", () => {
			const data = [{ desc: 'say "hi"' }];
			output(data, { format: "csv" });
			expect(logSpy).toHaveBeenNthCalledWith(2, '"say ""hi"""');
		});

		it("should escape values containing newlines", () => {
			const data = [{ desc: "line1\nline2" }];
			output(data, { format: "csv" });
			expect(logSpy).toHaveBeenNthCalledWith(2, '"line1\nline2"');
		});

		it("should handle single object for CSV (wraps in array)", () => {
			const data = { name: "alice" };
			output(data, { format: "csv" });
			expect(logSpy).toHaveBeenNthCalledWith(1, "name");
			expect(logSpy).toHaveBeenNthCalledWith(2, "alice");
		});

		it("should handle null/undefined values as empty strings", () => {
			const data = [{ a: null, b: undefined, c: "ok" }];
			output(data, { format: "csv" });
			expect(logSpy).toHaveBeenNthCalledWith(2, ",,ok");
		});

		it("should not output anything for empty array", () => {
			output([], { format: "csv" });
			expect(logSpy).not.toHaveBeenCalled();
		});
	});
});

describe("outputError", () => {
	let errorSpy: ReturnType<typeof vi.spyOn>;
	let exitSpy: ReturnType<typeof vi.spyOn>;

	beforeEach(() => {
		errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
		exitSpy = vi.spyOn(process, "exit").mockImplementation(() => undefined as never);
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("should output error JSON on stderr and exit with 1", () => {
		outputError(new Error("something failed"));
		const written = errorSpy.mock.calls[0]?.[0] as string;
		const parsed = JSON.parse(written);
		expect(parsed.error).toBe("UnknownError");
		expect(parsed.message).toBe("something failed");
		expect(exitSpy).toHaveBeenCalledWith(1);
	});

	it("should handle non-Error objects as string", () => {
		outputError("raw string error");
		const written = errorSpy.mock.calls[0]?.[0] as string;
		const parsed = JSON.parse(written);
		expect(parsed.message).toBe("raw string error");
		expect(parsed.error).toBe("UnknownError");
	});

	it("should use toJSON when available on error", () => {
		const error = {
			toJSON: () => ({ code: 400, detail: "bad request" }),
		};
		outputError(error);
		const written = errorSpy.mock.calls[0]?.[0] as string;
		const parsed = JSON.parse(written);
		expect(parsed.code).toBe(400);
		expect(parsed.detail).toBe("bad request");
	});

	it("should always exit with code 1", () => {
		outputError(new Error("test"));
		expect(exitSpy).toHaveBeenCalledWith(1);
	});
});
