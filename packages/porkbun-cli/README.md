# Porkbun CLI

CLI for [Porkbun](https://porkbun.com) — manage domains, DNS, SSL and more from the terminal.

JSON output by default, ideal for AI agents and automation.

## Features

- **Domains** — list, check availability, register, nameservers, auto-renew
- **DNS** — create, edit, delete, retrieve records (A, AAAA, CNAME, MX, TXT, NS, SRV, CAA, etc.)
- **DNSSEC** — manage DS records
- **SSL** — retrieve certificate bundles
- **URL Forwarding** — add, list, delete forwards
- **Glue Records** — create, update, delete
- **Multi-format** — output as JSON (default), table or CSV via `--format`
- **Dry-run** — preview any write operation before executing
- **Automatic retry** — retry with backoff on 429/5xx errors

## Installation

### Via npm

```bash
npm install -g porkbun-cli
```

### From source

```bash
git clone https://github.com/yabbal/porkbun-cli.git
cd porkbun-cli
pnpm install
pnpm build
pnpm link --global
```

Verify the installation:

```bash
porkbun --help
```

## Configuration

### API keys

Get your API keys from [porkbun.com/account/api](https://porkbun.com/account/api).

Set them as environment variables:

```bash
export PORKBUN_API_KEY=pk1_xxxxx
export PORKBUN_API_SECRET=sk1_xxxxx
```

Or create a `.env` file in the working directory:

```
PORKBUN_API_KEY=pk1_xxxxx
PORKBUN_API_SECRET=sk1_xxxxx
```

Test your credentials:

```bash
porkbun ping
```

## Usage

### Ping (test authentication)

```bash
porkbun ping
```

### Pricing

```bash
porkbun pricing                        # All TLD pricing
porkbun pricing --tld com              # Specific TLD
porkbun pricing --tld dev --format table
```

### Domains

```bash
porkbun domain list                    # List all domains
porkbun domain list --format table     # Table format
porkbun domain check example.com       # Check availability
porkbun domain create example.com --cost 1108  # Register (cost in cents)
```

### Name servers

```bash
porkbun domain ns get example.com
porkbun domain ns update example.com --ns "ns1.dns.com,ns2.dns.com"
```

### Auto-renew

```bash
porkbun domain auto-renew example.com --status on
porkbun domain auto-renew example.com --status off
```

### URL forwarding

```bash
porkbun domain forward list example.com
porkbun domain forward add example.com --location "https://target.com" --type permanent
porkbun domain forward delete example.com --id 12345
```

### Glue records

```bash
porkbun domain glue list example.com
porkbun domain glue create example.com --subdomain ns1 --ips "1.2.3.4,5.6.7.8"
porkbun domain glue update example.com --subdomain ns1 --ips "9.10.11.12"
porkbun domain glue delete example.com --subdomain ns1
```

### DNS records

```bash
# List
porkbun dns list example.com
porkbun dns list example.com --type A
porkbun dns list example.com --format table

# Create
porkbun dns create example.com --type A --content 1.2.3.4
porkbun dns create example.com --type A --content 1.2.3.4 --name www --ttl 3600
porkbun dns create example.com --type MX --content mail.example.com --prio 10

# Edit
porkbun dns edit example.com --id 12345 --type A --content 5.6.7.8
porkbun dns edit-by-name-type example.com --type A --subdomain www --content 5.6.7.8

# Delete
porkbun dns delete example.com --id 12345
porkbun dns delete-by-name-type example.com --type A --subdomain www
```

### DNSSEC

```bash
porkbun dnssec list example.com
porkbun dnssec create example.com --key-tag 12345 --alg 13 --digest-type 2 --digest abc123
porkbun dnssec delete example.com --key-tag 12345
```

### SSL

```bash
porkbun ssl example.com
```

### Output formats

All commands support `--format`:

```bash
porkbun domain list --format json     # JSON (default)
porkbun domain list --format table    # ASCII table
porkbun domain list --format csv      # CSV
porkbun dns list example.com --format csv > records.csv
```

### Dry-run

All write commands support `--dry-run`:

```bash
porkbun dns create example.com --type A --content 1.2.3.4 --dry-run
```

### Pipe with jq

JSON output combines naturally with `jq`:

```bash
# Domain names
porkbun domain list | jq '.[].domain'

# A records only
porkbun dns list example.com | jq '[.[] | select(.type == "A")]'

# Check availability
porkbun domain check example.com | jq '.response.avail'

# Pricing for .com
porkbun pricing | jq '.pricing.com'
```

## Environment variables

| Variable | Description |
|----------|-------------|
| `PORKBUN_API_KEY` | Porkbun API key (required) |
| `PORKBUN_API_SECRET` | Porkbun API secret key (required) |

## Claude Code Skill

This CLI is designed to be used as a Claude Code skill. The agent can manage your Porkbun domains directly from a conversation:

- Structured JSON output, easily parseable by AI
- All commands are non-interactive
- Combinable with `jq` for complex analysis

## Tech stack

| Tool | Role |
|------|------|
| [TypeScript](https://www.typescriptlang.org/) | Language |
| [citty](https://github.com/unjs/citty) | CLI framework |
| [cli-table3](https://github.com/cli-table/cli-table3) | Table rendering |
| [tsup](https://github.com/egoist/tsup) | Build |
| [Biome](https://biomejs.dev/) | Linter & formatter |

## License

MIT — yabbal
