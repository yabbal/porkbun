import { describe, expect, it, vi } from "vitest";
import type { FetchFn } from "../../src/fetch";
import { PricingResource } from "../../src/resources/pricing";

describe("PricingResource", () => {
	it("should call the correct endpoint", async () => {
		const mockFetch = vi.fn().mockResolvedValue({
			status: "SUCCESS",
			pricing: {},
		}) as unknown as FetchFn;

		const pricing = new PricingResource(mockFetch);
		await pricing.get();

		expect(mockFetch).toHaveBeenCalledWith("pricing/get");
	});

	it("should return the pricing response", async () => {
		const response = {
			status: "SUCCESS",
			pricing: {
				com: { registration: "9.99", renewal: "9.99", transfer: "9.99" },
			},
		};

		const mockFetch = vi.fn().mockResolvedValue(response) as unknown as FetchFn;
		const pricing = new PricingResource(mockFetch);
		const result = await pricing.get();

		expect(result).toEqual(response);
	});

	it("should not pass a body to fetch", async () => {
		const mockFetch = vi.fn().mockResolvedValue({
			status: "SUCCESS",
			pricing: {},
		}) as unknown as FetchFn;

		const pricing = new PricingResource(mockFetch);
		await pricing.get();

		expect(mockFetch).toHaveBeenCalledWith("pricing/get");
		expect(mockFetch).toHaveBeenCalledTimes(1);
		// Should only be called with the path, no second argument
		expect((mockFetch as ReturnType<typeof vi.fn>).mock.calls[0]).toHaveLength(1);
	});
});
