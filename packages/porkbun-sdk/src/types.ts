// ── Auth ──
export interface PorkbunCredentials {
	apikey: string;
	secretapikey: string;
}

// ── Ping ──
export interface PingResponse {
	status: string;
	yourIp: string;
}

// ── Pricing ──
export interface TldPricing {
	registration: string;
	renewal: string;
	transfer: string;
	coupons?: {
		registration?: { code: string; amount: number; type: string };
	};
}

export interface PricingResponse {
	status: string;
	pricing: Record<string, TldPricing>;
}

// ── Domain ──
export interface Domain {
	domain: string;
	status: string;
	tld: string;
	createDate: string;
	expireDate: string;
	securityLock: string;
	whoisPrivacy: string;
	autoRenew: number;
	notLocal: number;
	labels?: DomainLabel[];
}

export interface DomainLabel {
	id: string;
	title: string;
}

export interface DomainListResponse {
	status: string;
	domains: Domain[];
}

export interface DomainCheckResponse {
	status: string;
	response: {
		avail: string;
		type?: string;
		pricing?: {
			registration?: string;
			renewal?: string;
			transfer?: string;
		};
		premium?: boolean;
		yourIp?: string;
	};
	limits?: {
		ttl: number;
		limit: number;
		used: number;
	};
}

export interface DomainCreateParams {
	cost: number;
	agreeToTerms: string;
}

export interface DomainCreateResponse {
	status: string;
	domain: string;
	cost: number;
	orderId: number;
	balance: number;
	limits?: {
		ttl: number;
		limit: number;
		used: number;
	};
}

export interface AutoRenewUpdateParams {
	status: "on" | "off";
	domains?: string[];
}

export interface AutoRenewUpdateResponse {
	status: string;
	results?: Record<string, { status: string; message?: string }>;
}

// ── Name Servers ──
export interface NameServersResponse {
	status: string;
	ns: string[];
}

// ── URL Forwarding ──
export interface UrlForward {
	id: string;
	subdomain: string;
	location: string;
	type: string;
	includePath: string;
	wildcard: string;
}

export interface UrlForwardCreateParams {
	subdomain?: string;
	location: string;
	type: "temporary" | "permanent";
	includePath: "yes" | "no";
	wildcard: "yes" | "no";
}

export interface UrlForwardingResponse {
	status: string;
	forwards: UrlForward[];
}

// ── Glue Records ──
export interface GlueRecord {
	hostname: string;
	ips: string[];
}

export interface GlueRecordsResponse {
	status: string;
	hosts: GlueRecord[];
}

// ── DNS Records ──
export type DnsRecordType =
	| "A"
	| "MX"
	| "CNAME"
	| "ALIAS"
	| "TXT"
	| "NS"
	| "AAAA"
	| "SRV"
	| "TLSA"
	| "CAA"
	| "HTTPS"
	| "SVCB"
	| "SSHFP";

export interface DnsRecord {
	id: string;
	name: string;
	type: DnsRecordType;
	content: string;
	ttl: string;
	prio: string | null;
	notes: string | null;
}

export interface DnsCreateParams {
	name?: string;
	type: DnsRecordType;
	content: string;
	ttl?: number;
	prio?: number;
	notes?: string;
}

export interface DnsEditParams {
	name?: string;
	type: DnsRecordType;
	content: string;
	ttl?: number;
	prio?: number;
	notes?: string | null;
}

export interface DnsCreateResponse {
	status: string;
	id: string;
}

export interface DnsRetrieveResponse {
	status: string;
	records: DnsRecord[];
}

// ── DNSSEC ──
export interface DnssecRecord {
	keyTag: string;
	alg: string;
	digestType: string;
	digest: string;
}

export interface DnssecCreateParams {
	keyTag: string;
	alg: string;
	digestType: string;
	digest: string;
	maxSigLife?: number;
	keyDataFlags?: number;
	keyDataProtocol?: number;
	keyDataAlgo?: number;
	keyDataPubKey?: string;
}

export interface DnssecRecordsResponse {
	status: string;
	records: Record<string, DnssecRecord>;
}

// ── SSL ──
export interface SslBundle {
	status: string;
	certificatechain: string;
	privatekey: string;
	publickey: string;
}

// ── Generic ──
export interface StatusResponse {
	status: string;
	message?: string;
}
