import { Resource } from "../resource";
import type { SslBundle } from "../types";

export class SslResource extends Resource {
	async retrieve(domain: string): Promise<SslBundle> {
		return this.fetch<SslBundle>(`ssl/retrieve/${domain}`, {
			body: this.authBody(),
		});
	}
}
