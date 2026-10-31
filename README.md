# Career Intelligence Assistant

An AI-powered career intelligence assistant that uses Retrieval-Augmented Generation (RAG) to analyse CVs against job descriptions, identify skill gaps, assess role suitability, and provide personalised career insights and interview preparation.

## Prerequisites

- Node.js 22
- pnpm 12.16.1 (provided through Corepack)

## Initial setup

Enable Corepack and install the workspace dependencies from the repository root:

```bash
corepack enable
pnpm install
```

List the workspace packages to verify the repository setup:

```bash
pnpm -r list --depth -1
```

The workspace currently contains independently developed application placeholders in `apps/web` and `apps/api`, plus the shared contracts package in `packages/contracts`. Application frameworks and dependencies will be added by subsequent issues.
