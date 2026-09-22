# Security policy

## Supported versions

Security fixes are applied to the latest released version of `@digiguru/live-session`.

## Reporting a vulnerability

Please do **not** open a public GitHub issue for a vulnerability that could put users or consuming applications at risk.

Use GitHub's private vulnerability reporting for this repository when available:

**Security → Advisories → Report a vulnerability**

If private reporting is unavailable, open a minimal issue asking for a private contact channel without publishing exploit details.

Useful reports include:

- affected version;
- affected package entry point;
- reproduction steps;
- likely impact;
- suggested mitigation, if known.

## Scope

This package supplies collaboration-session primitives. Consuming applications remain responsible for their own authentication, authorization, persistence, network configuration, abuse controls and domain validation.
