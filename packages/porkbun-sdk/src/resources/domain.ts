import { Resource } from "../resource";
import type {
	AutoRenewUpdateParams,
	AutoRenewUpdateResponse,
	DomainCheckResponse,
	DomainCreateParams,
	DomainCreateResponse,
	DomainListResponse,
	GlueRecordsResponse,
	NameServersResponse,
	StatusResponse,
	UrlForward,
	UrlForwardCreateParams,
	UrlForwardingResponse,
} from "../types";

export class DomainResource extends Resource {
	async listAll(params?: {
		start?: number;
		includeLabels?: boolean;
	}): Promise<DomainListResponse> {
		return this.fetch<DomainListResponse>("domain/listAll", {
			body: this.authBody({
				...(params?.start !== undefined && { start: params.start }),
				...(params?.includeLabels && { includeLabels: "yes" }),
			}),
		});
	}

	async check(domain: string): Promise<DomainCheckResponse> {
		return this.fetch<DomainCheckResponse>(`domain/checkDomain/${domain}`, {
			body: this.authBody(),
		});
	}

	async create(
		domain: string,
		params: DomainCreateParams,
	): Promise<DomainCreateResponse> {
		return this.fetch<DomainCreateResponse>(`domain/create/${domain}`, {
			body: this.authBody(params),
		});
	}

	async getNameServers(domain: string): Promise<NameServersResponse> {
		return this.fetch<NameServersResponse>(`domain/getNs/${domain}`, {
			body: this.authBody(),
		});
	}

	async updateNameServers(
		domain: string,
		ns: string[],
	): Promise<StatusResponse> {
		return this.fetch<StatusResponse>(`domain/updateNs/${domain}`, {
			body: this.authBody({ ns }),
		});
	}

	async updateAutoRenew(
		params: AutoRenewUpdateParams,
		domain?: string,
	): Promise<AutoRenewUpdateResponse> {
		const path = domain
			? `domain/updateAutoRenew/${domain}`
			: "domain/updateAutoRenew";
		return this.fetch<AutoRenewUpdateResponse>(path, {
			body: this.authBody({
				status: params.status,
				...(params.domains && { domains: params.domains }),
			}),
		});
	}

	async getUrlForwarding(domain: string): Promise<UrlForward[]> {
		const res = await this.fetch<UrlForwardingResponse>(
			`domain/getUrlForwarding/${domain}`,
			{ body: this.authBody() },
		);
		return res.forwards ?? [];
	}

	async addUrlForward(
		domain: string,
		params: UrlForwardCreateParams,
	): Promise<StatusResponse> {
		return this.fetch<StatusResponse>(`domain/addUrlForward/${domain}`, {
			body: this.authBody(params),
		});
	}

	async deleteUrlForward(
		domain: string,
		recordId: string,
	): Promise<StatusResponse> {
		return this.fetch<StatusResponse>(
			`domain/deleteUrlForward/${domain}/${recordId}`,
			{ body: this.authBody() },
		);
	}

	async getGlueRecords(domain: string): Promise<GlueRecordsResponse> {
		return this.fetch<GlueRecordsResponse>(`domain/getGlue/${domain}`, {
			body: this.authBody(),
		});
	}

	async createGlueRecord(
		domain: string,
		subdomain: string,
		ips: string[],
	): Promise<StatusResponse> {
		return this.fetch<StatusResponse>(
			`domain/createGlue/${domain}/${subdomain}`,
			{ body: this.authBody({ ips }) },
		);
	}

	async updateGlueRecord(
		domain: string,
		subdomain: string,
		ips: string[],
	): Promise<StatusResponse> {
		return this.fetch<StatusResponse>(
			`domain/updateGlue/${domain}/${subdomain}`,
			{ body: this.authBody({ ips }) },
		);
	}

	async deleteGlueRecord(
		domain: string,
		subdomain: string,
	): Promise<StatusResponse> {
		return this.fetch<StatusResponse>(
			`domain/deleteGlue/${domain}/${subdomain}`,
			{ body: this.authBody() },
		);
	}
}
