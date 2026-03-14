# Contributing to Porkbun CLI

Thanks for your interest in contributing! Contributions are welcome.

## Getting started

```bash
# Clone the repo
git clone https://github.com/yabbal/porkbun-cli.git
cd porkbun-cli

# Install dependencies
pnpm install

# Build all packages
pnpm build
```

## Project structure

```
porkbun-cli/
├── packages/porkbun-sdk/   # TypeScript SDK (published on npm)
├── packages/porkbun-cli/   # CLI tool (published on npm, depends on porkbun-sdk)
└── turbo.json              # Turborepo config
```

## Development workflow

1. **Create a branch** from `main`:
   ```bash
   git checkout -b feat/my-feature
   ```

2. **Make your changes** — follow existing code conventions:
   - TypeScript strict mode
   - Arrow functions preferred
   - Formatted with [Biome](https://biomejs.dev/)

3. **Commit your changes** using conventional commits:
   ```bash
   pnpm commit    # Interactive conventional commit prompt
   ```

   Git hooks ([Lefthook](https://github.com/evilmartians/lefthook)) run automatically:
   - **pre-commit** — Biome lint on staged files
   - **commit-msg** — validates conventional commit format ([commitlint](https://commitlint.js.org/))
   - **pre-push** — build

4. **Add a changeset** if your change affects a published package:
   ```bash
   pnpm changeset
   ```

5. **Open a pull request** against `main`.

## Commit conventions

We use [Conventional Commits](https://www.conventionalcommits.org/), enforced by commitlint:

- `feat:` — new feature
- `fix:` — bug fix
- `docs:` — documentation only
- `chore:` — maintenance, deps, CI
- `refactor:` — code change that neither fixes a bug nor adds a feature
- `test:` — adding or updating tests
