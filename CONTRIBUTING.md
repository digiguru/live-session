# Contributing

Thanks for considering a contribution to `@digiguru/live-session`.

The project deliberately keeps its core small. Before adding a new abstraction, there should normally be evidence from more than one application that the behavior is genuinely reusable.

## Development

Requires Node.js 24+.

```bash
npm install
npm run check
```

`npm run check` performs TypeScript validation, unit tests and a clean package build.

## Pull requests

- Keep changes focused where practical.
- Add or update tests for behavioral changes.
- Do not use wall-clock sleeps to test time-dependent behavior; inject `now`, a clock, or a short explicit test timeout.
- Keep domain concepts out of the core. Emotions, Tuckman stages and application-specific rendering belong in consuming applications.
- Preserve transport independence in the core. Realtime/WebSocket behavior should remain an optional capability.
- Update `CHANGELOG.md` for user-visible changes.

## Architecture rule

A useful test for a proposed API is whether both current reference applications can use it without app-specific conditionals inside the library:

- Wheel of Emotion: anonymous identity + realtime transport + replace-current contributions.
- TeamTools: named facilitator-managed participants + local transport + activity-scoped contributions.

See [docs/architecture.md](docs/architecture.md) for the current design.
