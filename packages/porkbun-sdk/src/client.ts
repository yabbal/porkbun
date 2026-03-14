import { createFetch, type FetchFn } from "./fetch";
import { DnsResource } from "./resources/dns";
import { DnssecResource } from "./resources/dnssec";
import { DomainResource } from "./resources/domain";
import { PricingResource } from "./resources/pricing";
import { SslResource } from "./resources/ssl";
import type { PingResponse, PorkbunCredentials } from "./types";

export interface PorkbunClientOptions {
	apikey: string;
	secretapikey: string;
	baseURL?: string;
	retry?: number;
	retryDelay?: number;
}

export class PorkbunClient {
	readonly fetch: FetchFn;
	private readonly credentials: PorkbunCredentials;

	readonly pricing: PricingResource;
	readonly domain: DomainResource;
	readonly dns: DnsResource;
	readonly dnssec: DnssecResource;
	readonly ssl: SslResource;

	constructor(options: PorkbunClientOptions) {
		this.credentials = {
			apikey: options.apikey,
			secretapikey: options.secretapikey,
		};

		this.fetch = createFetch({
			baseURL: options.baseURL ?? "https://api.porkbun.com/api/json/v3",
			retry: options.retry ?? 2,
			retryDelay: options.retryDelay ?? 500,
			retryStatusCodes: [408, 429, 500, 502, 503, 504],
		});

		this.pricing = new PricingResource(this.fetch);
		this.domain = new DomainResource(this.fetch, this.credentials);
		this.dns = new DnsResource(this.fetch, this.credentials);
		this.dnssec = new DnssecResource(this.fetch, this.credentials);
		this.ssl = new SslResource(this.fetch, this.credentials);
	}

	async ping(): Promise<PingResponse> {
		return this.fetch<PingResponse>("ping", {
			body: { ...this.credentials },
		});
	}
}
