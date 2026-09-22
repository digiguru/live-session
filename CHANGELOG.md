# Changelog

All notable changes to this project will be documented here.

This project follows [Semantic Versioning](https://semver.org/).

## [0.1.0] - 2026-09-22

### Added

- Initial independent `@digiguru/live-session` package.
- Core `Session`, `Activity`, `Participant`, `Contribution` and `Aggregate` types.
- Session validation and contribution-summary helpers.
- Transport-neutral presence states: connected, active, contributed and waiting.
- Participant-ID deduplication across multiple connections.
- Injectable time and timeout values for deterministic presence tests.
- Browser helpers for local tokens, session routes and reconnecting WebSocket clients.
- Reference architecture derived from Wheel of Emotion and TeamTools.
