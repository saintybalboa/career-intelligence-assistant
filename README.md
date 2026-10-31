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

The workspace contains:
- `apps/web`: React frontend application using TypeScript and Vite
- `apps/api`: Fastify backend API (in progress)
- `packages/contracts`: Shared API contracts and schemas

## Frontend development

The frontend is a React application built with TypeScript, Vite, Tailwind CSS, and configured for testing with Vitest and React Testing Library.

### Commands

Start the development server (runs on `http://localhost:5173`):

```bash
pnpm --filter @career/web dev
```

Run tests in watch mode:

```bash
pnpm --filter @career/web test
```

Run tests once (CI mode):

```bash
pnpm --filter @career/web test -- --run
```

Build for production:

```bash
pnpm --filter @career/web build
```

Preview production build:

```bash
pnpm --filter @career/web preview
```

### Configuration

The frontend uses the following configuration:

- **API URL**: Set via the `VITE_API_URL` environment variable. Defaults to `http://localhost:3001` for local development. Copy [`.env.example`](apps/web/.env.example) to `.env.local` to customise the API URL.

- **TypeScript**: Strict mode is enabled. Configuration is in [`tsconfig.json`](apps/web/tsconfig.json).

- **Styling**: Tailwind CSS with a focused colour palette and responsive utilities. See [`tailwind.config.ts`](apps/web/tailwind.config.ts) for details.

### Project structure

```
apps/web/
├── src/
│   ├── components/       # React components
│   ├── App.tsx          # Main app component
│   ├── main.tsx         # React entry point
│   ├── index.css        # Global Tailwind styles
│   └── config.ts        # Application configuration
├── index.html           # HTML entry point
├── vite.config.ts       # Vite configuration
├── vitest.config.ts     # Vitest configuration
├── tailwind.config.ts   # Tailwind CSS configuration
└── tsconfig.json        # TypeScript configuration
```
