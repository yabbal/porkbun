import type { FetchFn } from "../fetch";
import type { PricingResponse } from "../types";

export class PricingResource {
	constructor(private fetch: FetchFn) {}

	async get(): Promise<PricingResponse> {
		return this.fetch<PricingResponse>("pricing/get");
	}
}
