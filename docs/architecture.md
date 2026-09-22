# Architecture

`@digiguru/live-session` is intentionally a collaboration-session core, not a voting framework and not a WebSocket framework.

It was extracted by comparing two applications with meaningfully different collaboration models:

- [Wheel of Emotion](https://emotion.digiguru.co.uk) — anonymous, multi-browser, realtime participation.
- [TeamTools](https://team-tools.digiguru.co.uk) — facilitator-led, named participants, browser-local operation.

The abstraction exists only where both applications supplied evidence for it.

## Canonical model

```text
Session
  Activity
    Contribution
    Aggregate

Participant
```

### Session

A collaboration/workshop instance with identity and lifecycle.

### Activity

A contribution namespace inside a session.

This became necessary because Wheel of Emotion effectively has one activity per room, whereas TeamTools contains multiple exercises—such as Comfort and Tuckman—inside one facilitator workspace.

### Participant

A stable identity key.

The library does not require that identity to be anonymous or named.

### Contribution

A participant's domain value for an activity.

The value is generic because an emotion vote and a Tuckman zone/distance choice are fundamentally different.

### Aggregate

An application-owned summary of contributions.

Aggregation deliberately remains outside the library because each domain has different rules and rendering.

## Optional capabilities

The base model does not imply networking.

Optional capabilities include:

```text
HostAuthorization
Persistence
RealtimeTransport
Presence
```

This keeps a local application such as TeamTools valid without making it pretend to have sockets, presence or host credentials.

## Presence

The reusable presence vocabulary is:

- **connected** — at least one transport connection is open for a participant;
- **active** — connected and either recently interactive or already contributed;
- **contributed** — connected and has a current contribution;
- **waiting** — active but has not yet contributed.

Connection records are deduplicated by participant ID.

Time is an explicit dependency of presence calculations. Production may use a human-scale timeout such as 10 seconds, while tests inject timestamps and short logical windows instead of sleeping.

## Contribution lifecycle

Applications may need different policies:

```text
replace-current
append
single-submit
domain-managed
```

Wheel of Emotion uses replacement semantics: a participant's latest emotion replaces the previous one.

TeamTools currently behaves more like sequential/single-submit activity participation.

The shared core should expose policy seams rather than hard-code one behavior.

## Storage and transport

Persistence and transport are independent.

Examples:

```text
browser localStorage
server memory
Postgres/Supabase
WebSocket
no network transport
```

The library should define interfaces and adapters without choosing one storage/database model for every consumer.

## Application-owned concerns

The consuming application should continue to own:

- domain validation;
- domain vocabulary;
- participant presentation/profile data;
- aggregation;
- visualization;
- host UX;
- authorization policy;
- abuse/rate controls;
- durable persistence choices.

## Reference walkthroughs

- [Wheel of Emotion walkthrough](examples/wheel-of-emotion.md)
- [TeamTools walkthrough](examples/teamtools.md)
