# Porkbun SDK

TypeScript SDK for the [Porkbun](https://porkbun.com) API v3 — manage domains, DNS, SSL and more programmatically.

## Installation

```bash
npm install porkbun-sdk
```

## Authentication

The SDK requires API keys from [porkbun.com/account/api](https://porkbun.com/account/api).

```typescript
import { PorkbunClient } from "porkbun-sdk";

const client = new PorkbunClient({
  apikey: "pk1_xxxxx",
  secretapikey: "sk1_xxxxx",
});
```

### Via environment variables

```bash
export PORKBUN_API_KEY=pk1_xxxxx
export PORKBUN_API_SECRET=sk1_xxxxx
```

```typescript
const client = new PorkbunClient({
  apikey: process.env.PORKBUN_API_KEY!,
  secretapikey: process.env.PORKBUN_API_SECRET!,
});
```

## Usage

```typescript
import { PorkbunClient } from "porkbun-sdk";

const client = new PorkbunClient({
  apikey: process.env.PORKBUN_API_KEY!,
  secretapikey: process.env.PORKBUN_API_SECRET!,
});

// Ping (test credentials)
const ping = await client.ping();
console.log(ping.yourIp);

// Pricing
const pricing = await client.pricing.get();

// Domains
const domains = await client.domain.listAll();
const check = await client.domain.check("example.com");
const ns = await client.domain.getNameServers("example.com");
await client.domain.updateNameServers("example.com", ["ns1.dns.com", "ns2.dns.com"]);
await client.domain.updateAutoRenew({ status: "on" }, "example.com");

// URL Forwarding
const forwards = await client.domain.getUrlForwarding("example.com");
await client.domain.addUrlForward("example.com", {
  location: "https://target.com",
  type: "permanent",
  includePath: "no",
  wildcard: "no",
});

// DNS
const records = await client.dns.retrieve("example.com");
const aRecords = await client.dns.retrieveByNameType("example.com", "A", "www");
const created = await client.dns.create("example.com", {
  type: "A",
  content: "1.2.3.4",
  name: "www",
  ttl: 600,
});
await client.dns.edit("example.com", "12345", {
  type: "A",
  content: "5.6.7.8",
});
await client.dns.delete("example.com", "12345");

// DNSSEC
const dnssecRecords = await client.dnssec.get("example.com");
await client.dnssec.create("example.com", {
  keyTag: "12345",
  alg: "13",
  digestType: "2",
  digest: "abc123",
});

// SSL
const ssl = await client.ssl.retrieve("example.com");
console.log(ssl.certificatechain);
```

## Available resources

| Resource | Access | Description |
|----------|--------|-------------|
| Pricing | `client.pricing` | Get domain pricing for all TLDs |
| Domains | `client.domain` | List, check, register, nameservers, auto-renew |
| URL Forwards | `client.domain` | Add, list, delete URL forwards |
| Glue Records | `client.domain` | Create, update, delete glue records |
| DNS | `client.dns` | CRUD DNS records, filter by type/subdomain |
| DNSSEC | `client.dnssec` | Create, list, delete DS records |
| SSL | `client.ssl` | Retrieve certificate bundles |

## Error handling

```typescript
import { PorkbunClient, PorkbunError } from "porkbun-sdk";

try {
  const records = await client.dns.retrieve("example.com");
} catch (error) {
  if (error instanceof PorkbunError) {
    console.error(`Error ${error.status}: ${error.message}`);
    console.error(`Endpoint: ${error.endpoint}`);
  }
}
```

## Options

```typescript
const client = new PorkbunClient({
  apikey: "pk1_xxxxx",
  secretapikey: "sk1_xxxxx",
  baseURL: "https://api-ipv4.porkbun.com/api/json/v3",  // IPv4-only endpoint
  retry: 3,         // Number of retries (default: 2)
  retryDelay: 1000, // Delay between retries in ms (default: 500)
});
```

## License

MIT — yabbal
