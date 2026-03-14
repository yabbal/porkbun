import type { FetchFn } from "./fetch";
import type { PorkbunCredentials } from "./types";

export class Resource {
	constructor(
		protected fetch: FetchFn,
		protected credentials: PorkbunCredentials,
	) {}

	protected authBody(extra?: object) {
		return { ...this.credentials, ...extra } as Record<string, unknown>;
	}
}
