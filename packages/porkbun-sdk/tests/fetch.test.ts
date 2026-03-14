import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PorkbunError } from "../src/errors";
import { createFetch } from "../src/fetch";

let mockFetch: ReturnType<typeof vi.fn>;

beforeEach(() => {
	mockFetch = vi.fn();
	vi.stubGlobal("fetch", mockFetch);
});

afterEach(() => {
	vi.restoreAllMocks();
});

const mockResponse = (data: Record<string, unknown>, status = 200) =>
	Promise.resolve({
		ok: status >= 200 && status < 300,
		status,
		statusText: `Status ${status}`,
		json: () => Promise.resolve(data),
	});

describe("createFetch", () => {
	it("should build the URL from baseURL + path", async () => {
		mockFetch.mockReturnValue(
			mockResponse({ status: "SUCCESS", data: "ok" }),
		);

		const fetchFn = createFetch({ baseURL: "https://api.example.com/v3" });
		await fetchFn("ping");

		expect(mockFetch).toHaveBeenCalledWith(
			"https://api.example.com/v3/ping",
			expect.anything(),
		);
	});

	it("should use POST method by default", async () => {
		mockFetch.mockReturnValue(
			mockResponse({ status: "SUCCESS" }),
		);

		const fetchFn = createFetch({ baseURL: "https://api.test.com" });
		await fetchFn("test");

		expect(mockFetch).toHaveBeenCalledWith(
			expect.any(String),
			expect.objectContaining({ method: "POST" }),
		);
	});

	it("should serialize the body as JSON", async () => {
		mockFetch.mockReturnValue(
			mockResponse({ status: "SUCCESS" }),
		);

		const fetchFn = createFetch({ baseURL: "https://api.test.com" });
		const body = { apikey: "pk", secretapikey: "sk" };
		await fetchFn("test", { body });

		expect(mockFetch).toHaveBeenCalledWith(
			expect.any(String),
			expect.objectContaining({
				body: JSON.stringify(body),
				headers: { "Content-Type": "application/json" },
			}),
		);
	});

	it("should send undefined body when no body is provided", async () => {
		mockFetch.mockReturnValue(
			mockResponse({ status: "SUCCESS" }),
		);

		const fetchFn = createFetch({ baseURL: "https://api.test.com" });
		await fetchFn("test");

		expect(mockFetch).toHaveBeenCalledWith(
			expect.any(String),
			expect.objectContaining({ body: undefined }),
		);
	});

	it("should return data when status is SUCCESS", async () => {
		const data = { status: "SUCCESS", yourIp: "1.2.3.4" };
		mockFetch.mockReturnValue(mockResponse(data));

		const fetchFn = createFetch({ baseURL: "https://api.test.com" });
		const result = await fetchFn("ping");

		expect(result).toEqual(data);
	});

	it("should throw PorkbunError when API status is not SUCCESS", async () => {
		mockFetch.mockReturnValue(
			mockResponse({ status: "ERROR", message: "Invalid API key" }),
		);

		const fetchFn = createFetch({ baseURL: "https://api.test.com", retry: 0 });

		await expect(fetchFn("ping")).rejects.toThrow(PorkbunError);
		await expect(fetchFn("ping")).rejects.toMatchObject({
			message: "Invalid API key",
			status: 200,
			endpoint: "ping",
		});
	});

	it("should throw PorkbunError when response is not ok", async () => {
		mockFetch.mockReturnValue(
			mockResponse({ message: "Forbidden" }, 403),
		);

		const fetchFn = createFetch({ baseURL: "https://api.test.com", retry: 0 });

		await expect(fetchFn("test")).rejects.toThrow(PorkbunError);
		await expect(fetchFn("test")).rejects.toMatchObject({
			status: 403,
		});
	});

	it("should retry on retryable status codes", async () => {
		mockFetch
			.mockReturnValueOnce(mockResponse({ message: "Too Many Requests" }, 429))
			.mockReturnValueOnce(mockResponse({ status: "SUCCESS", ok: true }));

		const fetchFn = createFetch({
			baseURL: "https://api.test.com",
			retry: 2,
			retryDelay: 1,
		});

		const result = await fetchFn("test");
		expect(result).toEqual({ status: "SUCCESS", ok: true });
		expect(mockFetch).toHaveBeenCalledTimes(2);
	});

	it("should retry on 500 status codes", async () => {
		mockFetch
			.mockReturnValueOnce(mockResponse({ message: "Server Error" }, 500))
			.mockReturnValueOnce(mockResponse({ status: "SUCCESS" }));

		const fetchFn = createFetch({
			baseURL: "https://api.test.com",
			retry: 1,
			retryDelay: 1,
		});

		const result = await fetchFn("test");
		expect(result).toEqual({ status: "SUCCESS" });
		expect(mockFetch).toHaveBeenCalledTimes(2);
	});

	it("should not retry on non-retryable status codes like 400", async () => {
		mockFetch.mockReturnValue(
			mockResponse({ message: "Bad Request" }, 400),
		);

		const fetchFn = createFetch({
			baseURL: "https://api.test.com",
			retry: 2,
			retryDelay: 1,
		});

		await expect(fetchFn("test")).rejects.toThrow(PorkbunError);
		// PorkbunError is thrown immediately (no retry for 400), so only 1 call
		expect(mockFetch).toHaveBeenCalledTimes(1);
	});

	it("should not retry on 401", async () => {
		mockFetch.mockReturnValue(
			mockResponse({ message: "Unauthorized" }, 401),
		);

		const fetchFn = createFetch({
			baseURL: "https://api.test.com",
			retry: 2,
			retryDelay: 1,
		});

		await expect(fetchFn("test")).rejects.toThrow(PorkbunError);
		expect(mockFetch).toHaveBeenCalledTimes(1);
	});

	it("should throw after exhausting retries on retryable errors", async () => {
		mockFetch.mockReturnValue(
			mockResponse({ message: "Server Error" }, 500),
		);

		const fetchFn = createFetch({
			baseURL: "https://api.test.com",
			retry: 2,
			retryDelay: 1,
		});

		await expect(fetchFn("test")).rejects.toThrow(PorkbunError);
		expect(mockFetch).toHaveBeenCalledTimes(3); // initial + 2 retries
	});

	it("should retry on network errors and throw after exhausting retries", async () => {
		mockFetch.mockRejectedValue(new TypeError("fetch failed"));

		const fetchFn = createFetch({
			baseURL: "https://api.test.com",
			retry: 1,
			retryDelay: 1,
		});

		await expect(fetchFn("test")).rejects.toThrow(TypeError);
		expect(mockFetch).toHaveBeenCalledTimes(2);
	});

	it("should recover from network error on retry", async () => {
		mockFetch
			.mockRejectedValueOnce(new TypeError("fetch failed"))
			.mockReturnValueOnce(mockResponse({ status: "SUCCESS" }));

		const fetchFn = createFetch({
			baseURL: "https://api.test.com",
			retry: 1,
			retryDelay: 1,
		});

		const result = await fetchFn("test");
		expect(result).toEqual({ status: "SUCCESS" });
	});

	it("should use custom method when provided", async () => {
		mockFetch.mockReturnValue(mockResponse({ status: "SUCCESS" }));

		const fetchFn = createFetch({ baseURL: "https://api.test.com" });
		await fetchFn("test", { method: "GET" });

		expect(mockFetch).toHaveBeenCalledWith(
			expect.any(String),
			expect.objectContaining({ method: "GET" }),
		);
	});

	it("should apply backoff delay between retries", async () => {
		const sleepCalls: number[] = [];
		const originalSetTimeout = globalThis.setTimeout;

		// Track setTimeout calls for sleep
		vi.spyOn(globalThis, "setTimeout").mockImplementation(((fn: () => void, ms?: number) => {
			if (ms && ms > 0) sleepCalls.push(ms);
			fn();
			return 0 as unknown as ReturnType<typeof setTimeout>;
		}) as typeof setTimeout);

		mockFetch
			.mockReturnValueOnce(mockResponse({ message: "Error" }, 500))
			.mockReturnValueOnce(mockResponse({ message: "Error" }, 500))
			.mockReturnValueOnce(mockResponse({ status: "SUCCESS" }));

		const fetchFn = createFetch({
			baseURL: "https://api.test.com",
			retry: 2,
			retryDelay: 100,
		});

		await fetchFn("test");

		// First retry: retryDelay * 1 = 100, second retry: retryDelay * 2 = 200
		expect(sleepCalls).toContain(100);
		expect(sleepCalls).toContain(200);
	});

	it("should use statusText as fallback message when no message in response", async () => {
		mockFetch.mockReturnValue(
			Promise.resolve({
				ok: false,
				status: 404,
				statusText: "Not Found",
				json: () => Promise.resolve({ status: "ERROR" }),
			}),
		);

		const fetchFn = createFetch({ baseURL: "https://api.test.com", retry: 0 });

		await expect(fetchFn("test")).rejects.toMatchObject({
			message: "Not Found",
			status: 404,
		});
	});
});
