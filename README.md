# @digiguru/live-session

Shared collaboration-session primitives extracted from Wheel of Emotion and TeamTools.

## Model

The package keeps the reusable core deliberately small:

```text
Session
  Activity
    Contribution
    Aggregate
Participant
```

Optional capabilities include host authorization, persistence and realtime presence.

Presence distinguishes:

- connected;
- active;
- contributed;
- waiting.

Time is injectable into presence calculations, so tests never need to sleep for production-scale activity windows.

## Package boundaries

- `@digiguru/live-session` — core model, validation and session summary helpers.
- `@digiguru/live-session/presence` — transport-neutral presence calculations.
- `@digiguru/live-session/browser` — browser token/session-route helpers and realtime WebSocket client.

Applications continue to own domain concepts such as emotion validation, Comfort/Tuckman zones, aggregation and result rendering.

## Distribution

This repository is the source of truth and publishes the private npm package to GitHub Packages.

Consumers depend on a normal semantic version, for example:

```json
{
  "dependencies": {
    "@digiguru/live-session": "0.1.0"
  }
}
```

Do not use git submodules or copy the source into consumers. A library change is released here, then each consuming repository adopts the new package version through its own PR and CI.

## Development

Requires Node 24.

```bash
npm ci
npm run check
```

`npm run check` performs TypeScript validation, unit tests, and a clean package build.

## Publishing

A push to `main` runs CI and publishes the package version in `package.json` to GitHub Packages if that exact version has not already been published.

Package versions are immutable. Increment `version` for every publishable change.

Because the repository/package is private, consuming repositories need read access to the package. GitHub Actions should use a token with `read:packages`; local developers authenticate npm to `npm.pkg.github.com`.
