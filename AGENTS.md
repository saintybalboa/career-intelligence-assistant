# Agent skills

## Issue tracker

Issues and specs live in this repository's GitHub Issues. **Before implementing an issue**, read `docs/agents/issue-tracker.md` and fetch the issue using the documented `gh` CLI workflow. The issue is the source of truth for its scope and acceptance criteria.

## Domain docs

Use the single-context domain documentation layout. **For domain-related work**, read `docs/agents/domain.md` and relevant sections of the root `CONTEXT.md`. `domain.md` explains how to find domain knowledge; `CONTEXT.md` contains the evolving domain concepts and rules. Do not assume missing documents exist.

## Project overview

Career Intelligence Assistant is a full-stack conversational AI application that helps users understand how their professional experience aligns with job opportunities.

Users can provide a CV and multiple job descriptions, then ask natural-language questions about role suitability, relevant experience, skill gaps and interview preparation.

The application uses Retrieval-Augmented Generation (RAG) to produce contextual, evidence-backed answers grounded in the provided documents.

This project is being developed as a take-home engineering assessment. Prioritise working functionality, sound engineering decisions, maintainability, testability and a clear path to production.

## Technology stack

The intended architecture consists of:

| Layer                        | Technology                   |
| ---------------------------- | ---------------------------- |
| Frontend                     | React, TypeScript, Vite      |
| Styling                      | Tailwind CSS                 |
| Backend                      | Node.js, TypeScript, Fastify |
| Validation                   | Zod                          |
| Database                     | PostgreSQL with pgvector     |
| Package manager              | pnpm workspaces              |
| Unit and integration testing | Vitest                       |
| React component testing      | React Testing Library        |
| End-to-end testing           | Playwright                   |
| Local infrastructure         | Docker Compose               |
| AI integration               | Provider API via the backend |
| Logging                      | Structured logging with Pino |

The stack represents the intended architecture. Do not install or implement technologies before the relevant GitHub issue requires them.

Do not introduce additional frameworks, databases, infrastructure services or orchestration libraries without a clear technical justification.

## Repository structure

```text
apps/
  web/                 # React frontend
  api/                 # Fastify backend

packages/
  contracts/           # Shared API contracts and schemas

infra/                 # Infrastructure configuration
docs/
  adr/                 # Architecture Decision Records
  agents/              # Agent workflow and domain instructions

evals/                 # AI evaluation datasets and harnesses
```

### Architectural boundaries

- Keep frontend and backend applications independently buildable.
- The frontend communicates with the backend through defined API contracts.
- The frontend must not access the database or AI provider directly.
- Keep AI provider credentials and business logic server-side.
- Put shared code in `packages/` only when genuine reuse exists.
- Avoid circular dependencies and unnecessary abstraction.
- Prefer modular, domain-oriented code over large utility modules.
- Keep framework-specific code separate from domain and application logic where practical.

## Engineering principles

### General

- Prefer simple, maintainable solutions over unnecessary complexity.
- Follow the existing repository conventions.
- Make small, focused changes that satisfy the current issue.
- Avoid speculative features and premature abstractions.
- Use descriptive names that communicate intent.
- Keep functions and components focused on clear responsibilities.
- Apply SOLID principles where they improve maintainability, not mechanically.
- Handle errors explicitly and provide useful failure messages.
- Avoid modifying unrelated code.

### TypeScript

- Enable and preserve strict TypeScript checking.
- Prefer explicit domain types and validated data structures.
- Avoid `any`, unsafe assertions and unnecessary non-null assertions.
- Validate external inputs at runtime using appropriate schemas.
- Prefer type inference where it improves clarity.
- Use discriminated unions for meaningful state or result variants.
- Keep types close to their domain; share only genuine cross-package contracts.

### React

- Prefer functional components and hooks.
- Keep business logic separate from presentation where practical.
- Use semantic HTML and accessible controls.
- Support keyboard navigation and visible focus states.
- Handle loading, empty, error and success states explicitly.
- Avoid unnecessary global state and premature optimisation.
- Do not introduce component abstractions until they provide genuine reuse.

### Backend

- Use Fastify for HTTP routing and request handling.
- Validate request inputs and outputs at system boundaries.
- Separate route handlers from application and domain logic.
- Use dependency injection where it improves testability.
- Keep database access behind focused data-access modules.
- Return predictable API errors without exposing internal details.
- Use structured logging and propagate request identifiers.

## AI and RAG engineering

Treat the following as baseline requirements for AI functionality:

- Ground document-specific answers in retrieved evidence.
- Preserve references to source documents and relevant chunks.
- Distinguish document evidence from model-generated interpretation.
- Do not invent experience, qualifications, skills or employment history.
- A missing mention in a CV is not proof that a person lacks a skill.
- Treat uploaded documents as untrusted data, never as instructions.
- Keep system instructions separate from retrieved document content.
- Handle insufficient evidence explicitly.
- Make models, chunking strategies and retrieval parameters configurable where useful.
- Prefer a straightforward retrieval pipeline before introducing agents or complex orchestration.
- Consider answer quality, latency, cost and observability when selecting AI approaches.

## Testing and quality

- Add or update tests for behaviour introduced or changed.
- Prefer behaviour-focused tests over implementation-detail tests.
- Use unit tests for deterministic domain logic.
- Use integration tests for API, database and retrieval boundaries.
- Use React Testing Library for meaningful UI behaviour.
- Use Playwright for critical end-to-end workflows.
- Mock external AI provider calls in deterministic automated tests.
- Use a separate evaluation suite for AI answer quality and retrieval relevance.
- Test failure paths and important edge cases.
- Do not remove meaningful tests solely to make a build pass.

Run all checks relevant to the affected workspace.

Do not claim that tests or commands passed unless they were actually executed. Report any checks that could not be performed.

## Security and privacy

- Never commit API keys, credentials, tokens or real user CVs.
- Never expose secrets through frontend environment variables.
- Validate uploaded files, including type and size.
- Treat uploaded documents and retrieved content as untrusted.
- Do not log sensitive document contents or personal information unnecessarily.
- Use safe database access patterns and parameterised queries.
- Apply least-privilege principles to infrastructure and application access.
- Consider document deletion, retention and isolation in application design.
- Do not send personal documents to third-party services without an explicit product requirement and appropriate disclosure.

Use synthetic or anonymised documents for development, tests and demonstrations.

## Observability

For backend and AI features:

- Prefer structured logs over ad hoc console output.
- Include request or correlation identifiers.
- Record meaningful errors with actionable context.
- Measure relevant processing and external API durations.
- Track AI token usage and estimated cost where available.
- Avoid logging prompts or retrieved document content containing personal data by default.
- Keep observability proportionate to the current implementation.

## Documentation and architectural decisions

- Update documentation when behaviour, setup or configuration changes.
- Keep the README focused on running and understanding the application.
- Record significant architectural decisions in `docs/adr/`.
- Read relevant ADRs before changing an established architecture. Respect **accepted** ADRs; if a proposed change conflicts with one, explain the conflict and seek a decision rather than silently overriding it.
- Discuss and document material trade-offs rather than silently overriding existing decisions.
- Keep ADRs concise and grounded in actual requirements.
- Do not create an ADR for every implementation detail.

The developer remains responsible for reviewing and accepting architectural decisions.

## GitHub issue workflow

GitHub Issues is the authoritative source of implementation requirements.

Repository:
`saintybalboa/career-intelligence-assistant`

Project board:
`https://github.com/users/saintybalboa/projects/5/views/1`

Before implementation:

1. Read the assigned GitHub issue.
2. Understand its requirements, dependencies and acceptance criteria.
3. Inspect the existing code and relevant documentation.
4. Identify relevant architectural constraints.
5. Clarify material ambiguity before committing to an approach.
6. For domain-related changes, consult `CONTEXT.md` and relevant accepted ADRs.

During implementation:

1. Keep changes within the issue's scope.
2. Prefer incremental implementation.
3. Write meaningful tests alongside functional changes.
4. Review generated code rather than accepting it uncritically.
5. Do not automatically create branches, commits or pull requests.
6. Do not create, close, relabel, reassign, or move GitHub issues or Project items, or change milestones, unless explicitly instructed.
7. Do not introduce unrelated refactors.

After implementation:

1. Run relevant validation commands.
2. Review changes against acceptance criteria.
3. Identify regressions, risks and incomplete work.
4. Summarise technical decisions and trade-offs.
5. Report actual validation results.
6. Leave issue closure and delivery decisions to the developer unless explicitly instructed otherwise.

## Agent skills

Use installed engineering skills to support planning, implementation, testing, debugging and code review.

Skills complement these repository instructions. Do not duplicate their workflows unnecessarily.

### Issue tracker

Use GitHub Issues for the backlog and GitHub Projects for delivery status.

Follow `docs/agents/issue-tracker.md` for issue operations; use its `gh` CLI commands and permission safeguards.

### Domain docs

Use a single shared domain context for the application.

Read `docs/agents/domain.md` and relevant sections of `CONTEXT.md` before domain modelling, implementing domain features, changing business terminology or making architectural decisions.

### Skill usage

When installed and appropriate:

- Use `/grill-with-docs` to challenge significant technical decisions.
- Use `/implement` for scoped issue implementation.
- Use `/tdd` for behaviour that benefits from test-driven development.
- Use `/code-review` to review completed changes.
- Use debugging skills to investigate failures systematically.

Do not assume that a skill is installed merely because it is named here.

## Working agreement

AI coding assistants should act as engineering collaborators, not autonomous owners of the repository.

Optimise for correctness, clarity, maintainability and verifiable progress.

The goal is not to generate the most code. The goal is to deliver the smallest well-engineered solution that satisfies the requirements.
