# Contributing

Thanks for taking a look. Issues and pull requests are welcome.

## Setup

```bash
npm install
npm run web
```

The app runs in demo mode without an API key, which is all you need for UI work and tests.

## Before opening a pull request

```bash
npm run format:check && npm run lint && npm run typecheck && npm test
```

- Keep route files in `src/app` thin; put logic in `src/features/*` or `src/server`.
- Client code must not import from `src/server`. The linter enforces this.
- Add or update tests for any change to `src/server`, `src/shared` or a feature's `lib/`.
- Use [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `docs:` and so on).
