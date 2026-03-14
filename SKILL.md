---
name: porkbun
description: CLI to manage Porkbun domains, DNS records, SSL certificates, DNSSEC, URL forwarding and glue records via the Porkbun API
---

# Porkbun CLI Skill

CLI to manage domains, DNS, SSL and more on [Porkbun](https://porkbun.com) via the Porkbun API v3.
All commands return JSON on stdout (default), with table and CSV support via `--format`.

Use when the user asks about Porkbun, domain management, DNS records, SSL certificates, domain availability, domain registration, nameservers, URL forwarding, glue records, DNSSEC, or any task related to their Porkbun account. Triggers on: "porkbun", "domain", "dns", "nameservers", "ssl certificate", "domain availability", "register domain", "dns records", "url forwarding", "glue records", "dnssec", "domain pricing", "check domain", "manage domains".

## Pre-requisites

- Install the CLI: `npm install -g porkbun-cli`
- Install the SDK: `npm install porkbun-sdk`
- Set environment variables:
  ```bash
  export PORKBUN_API_KEY=pk1_xxxxx
  export PORKBUN_API_SECRET=sk1_xxxxx
  ```
  Or create a `.env` file in the working directory.
- Get your API keys from: https://porkbun.com/account/api

## Available commands

### Authentication test
```bash
porkbun ping                              # Test API credentials, returns your IP
```

### Domain pricing
```bash
porkbun pricing                           # All TLD pricing
porkbun pricing --tld com                 # Pricing for a specific TLD
porkbun pricing --format table            # Table format
```

### Domain management
```bash
porkbun domain list                       # List all domains
porkbun domain list --labels              # Include domain labels
porkbun domain list --format table        # Table format
porkbun domain check example.com          # Check domain availability
porkbun domain create example.com --cost 1108  # Register domain (cost in cents)
porkbun domain create example.com --cost 1108 --dry-run  # Preview registration
```

### Name servers
```bash
porkbun domain ns get example.com                         # Get current nameservers
porkbun domain ns update example.com --ns "ns1.dns.com,ns2.dns.com"  # Update nameservers
porkbun domain ns update example.com --ns "ns1.dns.com,ns2.dns.com" --dry-run
```

### Auto-renew
```bash
porkbun domain auto-renew example.com --status on         # Enable auto-renew
porkbun domain auto-renew example.com --status off        # Disable auto-renew
```

### URL forwarding
```bash
porkbun domain forward list example.com                   # List URL forwards
porkbun domain forward add example.com --location "https://target.com" --type permanent
porkbun domain forward add example.com --location "https://target.com" --subdomain www --wildcard yes
porkbun domain forward delete example.com --id 12345      # Delete a forward
```

### Glue records
```bash
porkbun domain glue list example.com                      # List glue records
porkbun domain glue create example.com --subdomain ns1 --ips "1.2.3.4,5.6.7.8"
porkbun domain glue update example.com --subdomain ns1 --ips "9.10.11.12"
porkbun domain glue delete example.com --subdomain ns1
```

### DNS records
```bash
porkbun dns list example.com                              # All DNS records
porkbun dns list example.com --type A                     # Filter by type
porkbun dns list example.com --type TXT --subdomain _dmarc  # Filter by type and subdomain
porkbun dns list example.com --format table               # Table format

# Create records
porkbun dns create example.com --type A --content 1.2.3.4
porkbun dns create example.com --type A --content 1.2.3.4 --name www --ttl 3600
porkbun dns create example.com --type MX --content mail.example.com --prio 10
porkbun dns create example.com --type TXT --content "v=spf1 include:_spf.google.com ~all"
porkbun dns create example.com --type CNAME --content target.com --name blog
porkbun dns create example.com --type A --content 1.2.3.4 --dry-run  # Preview

# Edit records
porkbun dns edit example.com --id 12345 --type A --content 5.6.7.8
porkbun dns edit-by-name-type example.com --type A --subdomain www --content 5.6.7.8

# Delete records
porkbun dns delete example.com --id 12345
porkbun dns delete-by-name-type example.com --type A --subdomain www
```

### DNSSEC
```bash
porkbun dnssec list example.com                           # List DNSSEC records
porkbun dnssec create example.com --key-tag 12345 --alg 13 --digest-type 2 --digest abc123
porkbun dnssec delete example.com --key-tag 12345
```

### SSL
```bash
porkbun ssl example.com                                   # Retrieve SSL certificate bundle
```

### Version
```bash
porkbun version                                           # Show CLI version
```

## Output formats

```bash
porkbun domain list --format json     # JSON (default)
porkbun domain list --format table    # Table
porkbun domain list --format csv      # CSV
```

## Dry-run mode

All write commands support `--dry-run` to preview the request payload without executing:

```bash
porkbun dns create example.com --type A --content 1.2.3.4 --dry-run
porkbun domain ns update example.com --ns "ns1.dns.com" --dry-run
porkbun domain create example.com --cost 1108 --dry-run
```

## jq examples

```bash
porkbun domain list | jq '.[].domain'
porkbun dns list example.com | jq '.[] | select(.type == "A") | {name, content}'
porkbun pricing | jq '.pricing.com'
porkbun domain check example.com | jq '.response.avail'
```

## Typical workflows

### Check and register a domain
```bash
porkbun domain check mycoolsite.com
porkbun domain create mycoolsite.com --cost 1108 --dry-run
porkbun domain create mycoolsite.com --cost 1108
```

### Configure DNS for a new domain
```bash
porkbun dns create example.com --type A --content 76.76.21.21 --name @
porkbun dns create example.com --type CNAME --content cname.vercel-dns.com --name www
porkbun dns create example.com --type MX --content mail.example.com --prio 10
porkbun dns create example.com --type TXT --content "v=spf1 include:_spf.google.com ~all"
porkbun dns list example.com --format table
```

### Domain inventory
```bash
porkbun domain list --format table
porkbun domain list | jq '[.[] | {domain, expireDate, autoRenew}]'
porkbun domain list | jq '[.[] | select(.autoRenew == "0")] | length'  # Count domains without auto-renew
```

### Bulk DNS audit
```bash
# List all records for a domain
porkbun dns list example.com --format table

# Find all A records
porkbun dns list example.com | jq '[.[] | select(.type == "A")]'

# Find records with low TTL
porkbun dns list example.com | jq '[.[] | select((.ttl | tonumber) < 3600)]'
```
