# Contributing to Porkbun

Thanks for your interest in contributing! Contributions are welcome.

## Getting started

```bash
# Clone the repo
git clone https://github.com/yabbal/porkbun.git
cd porkbun

# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run tests
pnpm test
```

## Project structure

```
porkbun/
├── packages/porkbun-sdk/   # TypeScript SDK (published on npm)
├── packages/porkbun-cli/   # CLI tool (published on npm, depends on porkbun-sdk)
├── apps/docs/              # Documentation site (Fumadocs + Next.js)
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

3. **Run tests** to make sure nothing is broken:
   ```bash
   pnpm test
   ```

4. **Commit your changes** using conventional commits:
   ```bash
   pnpm commit    # Interactive conventional commit prompt
   ```

   Git hooks ([Lefthook](https://github.com/evilmartians/lefthook)) run automatically:
   - **pre-commit** — Biome lint + typecheck on staged files
   - **commit-msg** — validates conventional commit format ([commitlint](https://commitlint.js.org/))
   - **pre-push** — build + tests

5. **Add a changeset** if your change affects a published package:
   ```bash
   pnpm changeset
   ```

6. **Open a pull request** against `main`.

## Commit conventions

We use [Conventional Commits](https://www.conventionalcommits.org/), enforced by commitlint:

- `feat:` — new feature
- `fix:` — bug fix
- `docs:` — documentation only
- `chore:` — maintenance, deps, CI
- `refactor:` — code change that neither fixes a bug nor adds a feature
- `test:` — adding or updating tests
