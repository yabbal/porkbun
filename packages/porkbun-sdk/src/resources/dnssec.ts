import { Resource } from "../resource";
import type {
	DnssecCreateParams,
	DnssecRecord,
	DnssecRecordsResponse,
	StatusResponse,
} from "../types";

export class DnssecResource extends Resource {
	async create(
		domain: string,
		params: DnssecCreateParams,
	): Promise<StatusResponse> {
		return this.fetch<StatusResponse>(`dns/createDnssecRecord/${domain}`, {
			body: this.authBody(params),
		});
	}

	async get(domain: string): Promise<Record<string, DnssecRecord>> {
		const res = await this.fetch<DnssecRecordsResponse>(
			`dns/getDnssecRecords/${domain}`,
			{ body: this.authBody() },
		);
		return res.records ?? {};
	}

	async delete(domain: string, keyTag: string): Promise<StatusResponse> {
		return this.fetch<StatusResponse>(
			`dns/deleteDnssecRecord/${domain}/${keyTag}`,
			{ body: this.authBody() },
		);
	}
}
