# @digiguru/live-session

Small composable primitives for collaborative sessions.

`live-session` was extracted from two real applications with deliberately different collaboration models:

- **[Wheel of Emotion](https://emotion.digiguru.co.uk)** — anonymous, multi-browser, realtime participation with WebSocket presence.
- **[TeamTools](https://team-tools.digiguru.co.uk)** — facilitator-led, named participants and multiple local workshop activities.

That contrast is the point: this package is not a voting framework and not a WebSocket framework. It provides a small shared model that can support both.

## Mental model

```text
Session
  Activity
    Contribution
    Aggregate

Participant
```

Optional capabilities sit alongside the core:

```text
HostAuthorization
Persistence
RealtimeTransport
Presence
```

## Why it exists

The library was built by extracting only the behavior proven useful in more than one application.

Wheel of Emotion contributed requirements such as:

- anonymous participant identity;
- replace-current contributions;
- realtime reconnect;
- engagement-aware presence;
- host authorization.

TeamTools contributed different requirements:

- named facilitator-managed participants;
- multiple activities inside one session;
- no mandatory transport;
- local/browser persistence;
- domain-specific contribution values.

The shared API exists where those requirements genuinely overlap.

## Installation

Once published to npm:

```bash
npm install @digiguru/live-session
```

Requires Node.js 24+ for development/build tooling. Browser helpers target modern browsers with WebSocket and Web Crypto support.

## Core example

```ts
import type {
  Session,
  Activity,
  Participant,
  Contribution
} from "@digiguru/live-session";

const session: Session = {
  id: "retro-2026-09-22",
  name: "Monday retro",
  status: "open"
};

const activity: Activity = {
  id: "check-in",
  name: "How are we feeling?"
};

const participant: Participant = {
  id: "participant-123"
};

const contribution: Contribution<string> = {
  participantId: participant.id,
  activityId: activity.id,
  value: "hopeful"
};
```

The library does not decide whether `"hopeful"` is valid, how it should be rendered, or how contributions are aggregated. Those stay in the application.

## Presence example

```ts
import {
  countPresence,
  participantPresence
} from "@digiguru/live-session/presence";

const states = participantPresence(
  [
    { participantId: "a", connected: true, lastActiveAt: 9_900 },
    { participantId: "b", connected: true, lastActiveAt: 1_000 }
  ],
  [
    { participantId: "a", value: "done" }
  ],
  10_000,
  1_000
);

console.log(countPresence(states));
// {
//   connected: 2,
//   active: 1,
//   contributed: 1,
//   waiting: 0
// }
```

Presence distinguishes:

- **connected** — at least one live connection for a participant;
- **active** — connected and recently interactive, or already contributed;
- **contributed** — connected and has a current contribution;
- **waiting** — active but has not yet contributed.

Connections are deduplicated by participant ID.

Time is injectable, so tests never need to wait for production-scale timeouts.

## Browser / realtime helper

```ts
import {
  createRealtimeSessionClient
} from "@digiguru/live-session/browser";

const client = createRealtimeSessionClient({
  sessionId: "quantum-nexus-4821",
  participantId: "anonymous-browser-id",
  onMessage(message) {
    console.log(message);
  }
});

client.connect();
```

The browser helper owns WebSocket lifecycle/reconnect mechanics. The application still owns message contracts and domain behavior.

## Reference applications

### Wheel of Emotion

**Live:** https://emotion.digiguru.co.uk

A realtime anonymous emotion check-in. It demonstrates:

- one public session URL;
- browser-scoped anonymous participant identity;
- replace-current contributions;
- WebSocket transport and reconnect;
- engagement-aware presence;
- host authorization;
- domain-owned aggregation and visualization.

Read the **[screen-by-screen Wheel of Emotion walkthrough](docs/examples/wheel-of-emotion.md)**.

### TeamTools

**Live:** https://team-tools.digiguru.co.uk

A facilitator-led team-health application. It demonstrates:

- named participants;
- local/browser operation;
- multiple activities in one session;
- different domain contribution schemas;
- no mandatory realtime presence or host authorization.

Read the **[screen-by-screen TeamTools walkthrough](docs/examples/teamtools.md)**.

## Package entry points

### `@digiguru/live-session`

Core model, validation and session helpers.

### `@digiguru/live-session/presence`

Transport-neutral presence calculations.

### `@digiguru/live-session/browser`

Browser token/session-route helpers and reconnecting WebSocket client.

## Architecture

The design principles and extraction evidence are documented in **[docs/architecture.md](docs/architecture.md)**.

The most important rules are:

- transport is optional;
- identity policy is application-owned;
- aggregation is application-owned;
- persistence and transport are independent;
- presence is a realtime capability, not a base participant property;
- time-dependent behavior must be deterministically testable.

## Development

Requires Node.js 24+.

```bash
npm install
npm run check
```

`npm run check` performs:

1. TypeScript validation;
2. unit tests;
3. a clean package build.

Tests are intentionally independent of the consuming applications. The package must be valid without Wheel of Emotion or TeamTools being checked out beside it.

## Versioning and consumers

The package follows [Semantic Versioning](https://semver.org/).

Consumers should depend on released versions rather than copying source files or using git submodules:

```json
{
  "dependencies": {
    "@digiguru/live-session": "0.1.0"
  }
}
```

A new library release does **not** silently change consuming applications.

Instead:

```text
live-session 0.1.0 → 0.2.0
        │
        ├── Wheel PR: 0.1.0 → 0.2.0
        └── TeamTools PR: 0.1.0 → 0.2.0
```

Each consumer gets its own dependency update, lockfile change, CI and deployment verification.

## Publishing

The package is intended to be published publicly to npm as:

```text
@digiguru/live-session
```

Release versions are immutable. Bump `package.json` for every publishable change.

The publish workflow requires an npm publishing credential (or npm trusted-publisher configuration) before the first release.

## Open source

- [MIT License](LICENSE)
- [Contributing](CONTRIBUTING.md)
- [Security policy](SECURITY.md)
- [Changelog](CHANGELOG.md)
- [humans.txt](humans.txt)

## License

MIT © Adam Hall
