# Porkbun

CLI and TypeScript SDK for [Porkbun](https://porkbun.com) — manage domains, DNS, SSL and more from the terminal.

[![CI](https://github.com/yabbal/porkbun/actions/workflows/ci.yml/badge.svg)](https://github.com/yabbal/porkbun/actions/workflows/ci.yml)
[![npm porkbun-cli](https://img.shields.io/npm/v/porkbun-cli?label=porkbun-cli)](https://www.npmjs.com/package/porkbun-cli)
[![npm porkbun-sdk](https://img.shields.io/npm/v/porkbun-sdk?label=porkbun-sdk)](https://www.npmjs.com/package/porkbun-sdk)
[![coverage](https://img.shields.io/endpoint?url=https://gist.githubusercontent.com/yabbal/52f42c6bc708b76eb2c4d056a79fe2d5/raw/porkbun-coverage.json)](https://github.com/yabbal/porkbun/actions/workflows/ci.yml)
[![docs](https://img.shields.io/badge/docs-GitHub%20Pages-blue)](https://yabbal.github.io/porkbun/)

## Features

- **Domains** — list, check availability, register, nameservers, auto-renew
- **DNS** — create, edit, delete, retrieve records (A, AAAA, CNAME, MX, TXT, NS, SRV, CAA, etc.)
- **DNSSEC** — manage DS records
- **SSL** — retrieve certificate bundles
- **URL Forwarding** — add, list, delete forwards
- **Glue Records** — create, update, delete
- **Multi-format** — output as JSON (default), table or CSV via `--format`
- **Dry-run** — preview any write operation before executing
- **SDK TypeScript** — package [`porkbun-sdk`](https://www.npmjs.com/package/porkbun-sdk) usable standalone
- **Skill IA** — compatible Claude Code and AI agents via [skills.sh](https://skills.sh)
- **Automatic retry** — exponential backoff on 429/5xx errors

## Installation

```bash
npm install -g porkbun-cli
```

## Quick start

```bash
# Set your API keys (from https://porkbun.com/account/api)
export PORKBUN_API_KEY=pk1_xxxxx
export PORKBUN_API_SECRET=sk1_xxxxx

# Or create a .env file
echo "PORKBUN_API_KEY=pk1_xxxxx" >> .env
echo "PORKBUN_API_SECRET=sk1_xxxxx" >> .env

# Test authentication
porkbun ping

# List your domains
porkbun domain list --format table

# Check domain availability
porkbun domain check mycoolsite.com
```

## Examples

```bash
# Domains
porkbun domain list --format table
porkbun domain check example.com
porkbun domain ns get example.com

# DNS
porkbun dns list example.com --format table
porkbun dns create example.com --type A --content 1.2.3.4 --name www
porkbun dns delete example.com --id 12345

# Pricing
porkbun pricing --tld dev --format table

# Dry-run (preview without executing)
porkbun dns create example.com --type A --content 1.2.3.4 --dry-run

# Combine with jq
porkbun domain list | jq '.[].domain'
porkbun dns list example.com | jq '[.[] | select(.type == "A")]'
```

## SDK TypeScript

The SDK is available as a separate package: [`porkbun-sdk`](https://www.npmjs.com/package/porkbun-sdk)

```bash
npm install porkbun-sdk
```

```typescript
import { PorkbunClient } from "porkbun-sdk";

const client = new PorkbunClient({
  apikey: process.env.PORKBUN_API_KEY!,
  secretapikey: process.env.PORKBUN_API_SECRET!,
});

// Ping
const ping = await client.ping();

// Domains
const domains = await client.domain.listAll();
const check = await client.domain.check("example.com");

// DNS
const records = await client.dns.retrieve("example.com");
const created = await client.dns.create("example.com", {
  type: "A",
  content: "1.2.3.4",
  name: "www",
});

// SSL
const ssl = await client.ssl.retrieve("example.com");
```

## Skill for AI agents

Porkbun CLI is designed to work with AI agents. All commands return structured JSON, directly usable by an LLM.

```bash
npx skills add yabbal/porkbun
```

## Documentation

Full documentation available at **[yabbal.github.io/porkbun](https://yabbal.github.io/porkbun/)**.

## Monorepo structure

```
porkbun/
├── packages/porkbun-sdk/   # TypeScript SDK (published on npm)
├── packages/porkbun-cli/   # CLI (published on npm, depends on porkbun-sdk)
├── apps/docs/              # Documentation site (Fumadocs + Next.js)
├── turbo.json              # Turborepo
└── SKILL.md                # Skill for AI agents (skills.sh)
```

## Development

```bash
pnpm install              # Install dependencies
pnpm build                # Build SDK + CLI
pnpm dev                  # Dev mode
pnpm test                 # Run tests
pnpm lint                 # Lint
```

## Tech stack

| Tool | Role |
|------|------|
| [TypeScript](https://www.typescriptlang.org/) | Language |
| [citty](https://github.com/unjs/citty) | CLI framework |
| [tsup](https://github.com/egoist/tsup) | Build |
| [Turborepo](https://turbo.build/) | Monorepo |
| [Biome](https://biomejs.dev/) | Linter & formatter |
| [Vitest](https://vitest.dev/) | Tests & coverage |
| [Fumadocs](https://fumadocs.vercel.app/) | Documentation |

## License

MIT
