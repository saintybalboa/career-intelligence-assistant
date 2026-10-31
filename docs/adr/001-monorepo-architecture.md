# ADR-001: Monorepo Architecture

- Status: Accepted
- Date: 2026-10-30

## Context

Career Intelligence Assistant will provide a React web application and a Fastify API for document-grounded career analysis. The frontend and backend need independent build and deployment boundaries, while the API contracts should remain consistent as the application evolves.

The project is an early-stage take-home application, so the repository foundation should support incremental development without adding application frameworks, infrastructure or automation before they are needed.

## Requirements

- Keep the web application and API independently runnable and deployable.
- Share only genuine cross-application contracts.
- Support one repeatable local dependency workflow.
- Allow frontend, backend and shared packages to evolve incrementally.
- Keep application dependencies and operational concerns out of the initial foundation.

## Alternatives considered

### Separate frontend and backend repositories

Separate repositories provide strong ownership and deployment isolation, but add coordination overhead for shared contracts and local setup. That overhead is not justified for the current small team and early product stage.

### Integrated full-stack framework

An integrated framework could simplify initial routing and deployment, but would couple the user interface and API more tightly than the intended architecture. It would also introduce framework decisions before the product requirements require them.

## Decision

Use a pnpm workspace monorepo with independently runnable applications in `apps/web` and `apps/api`, and a shared contracts package in `packages/contracts`. The root workspace owns dependency installation and repository-level configuration. Package-specific frameworks and dependencies will be introduced by subsequent issues.

## Consequences

This structure gives the project a single reproducible setup and makes shared contract changes easy to coordinate. It also keeps application boundaries explicit and permits independent build and deployment workflows.

The repository gains workspace configuration and package-management coupling. Teams must keep package boundaries clear and avoid placing unrelated shared code in `packages/contracts`. A monorepo does not provide runtime isolation by itself; deployment and access boundaries remain application concerns.

## Revisit conditions

Reconsider this decision if the applications acquire materially different ownership, release governance or technology requirements; if workspace coordination becomes a significant delivery bottleneck; or if a full-stack framework demonstrably reduces complexity without weakening the required application boundaries.
