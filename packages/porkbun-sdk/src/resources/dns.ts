import { Resource } from "../resource";
import type {
	DnsCreateParams,
	DnsCreateResponse,
	DnsEditParams,
	DnsRecord,
	DnsRetrieveResponse,
	StatusResponse,
} from "../types";

export class DnsResource extends Resource {
	async create(
		domain: string,
		params: DnsCreateParams,
	): Promise<DnsCreateResponse> {
		return this.fetch<DnsCreateResponse>(`dns/create/${domain}`, {
			body: this.authBody(params),
		});
	}

	async edit(
		domain: string,
		id: string,
		params: DnsEditParams,
	): Promise<StatusResponse> {
		return this.fetch<StatusResponse>(`dns/edit/${domain}/${id}`, {
			body: this.authBody(params),
		});
	}

	async editByNameType(
		domain: string,
		type: string,
		subdomain?: string,
		params?: { content: string; ttl?: number; prio?: number; notes?: string },
	): Promise<StatusResponse> {
		const path = subdomain
			? `dns/editByNameType/${domain}/${type}/${subdomain}`
			: `dns/editByNameType/${domain}/${type}`;
		return this.fetch<StatusResponse>(path, {
			body: this.authBody(params),
		});
	}

	async delete(domain: string, id: string): Promise<StatusResponse> {
		return this.fetch<StatusResponse>(`dns/delete/${domain}/${id}`, {
			body: this.authBody(),
		});
	}

	async deleteByNameType(
		domain: string,
		type: string,
		subdomain?: string,
	): Promise<StatusResponse> {
		const path = subdomain
			? `dns/deleteByNameType/${domain}/${type}/${subdomain}`
			: `dns/deleteByNameType/${domain}/${type}`;
		return this.fetch<StatusResponse>(path, {
			body: this.authBody(),
		});
	}

	async retrieve(domain: string, id?: string): Promise<DnsRecord[]> {
		const path = id ? `dns/retrieve/${domain}/${id}` : `dns/retrieve/${domain}`;
		const res = await this.fetch<DnsRetrieveResponse>(path, {
			body: this.authBody(),
		});
		return res.records ?? [];
	}

	async retrieveByNameType(
		domain: string,
		type: string,
		subdomain?: string,
	): Promise<DnsRecord[]> {
		const path = subdomain
			? `dns/retrieveByNameType/${domain}/${type}/${subdomain}`
			: `dns/retrieveByNameType/${domain}/${type}`;
		const res = await this.fetch<DnsRetrieveResponse>(path, {
			body: this.authBody(),
		});
		return res.records ?? [];
	}
}
