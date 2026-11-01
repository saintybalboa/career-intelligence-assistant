# ADR-003: Development Tooling and CI Strategy

- Status: Proposed
- Date: 2026-11-01

## Context

Career Intelligence Assistant is a pnpm-based monorepo containing a React frontend (`apps/web`), Fastify backend (`apps/api`), and shared contracts (`packages/contracts`). As the project scales, consistent quality gates and automated validation are needed to maintain code quality, catch regressions early, and enable reliable AI-assisted development.

The project currently lacks:

- Shared linting configuration across workspaces
- Consistent code formatting
- Reliable TypeScript validation at the root level
- Automated CI/CD workflow
- Documented validation gates for pull requests

A lightweight, maintainable tooling strategy is essential to support rapid iteration without introducing unnecessary maintenance burden.

## Requirements

1. **Shared linting:** ESLint configuration for TypeScript, React, and modern JavaScript
2. **Formatting:** Prettier with a shared configuration across all workspaces
3. **Type safety:** Consistent TypeScript checking with strict mode enabled
4. **Root scripts:** Consistent commands for lint, format, test, build and check
5. **GitHub Actions CI:** Automated validation on pull requests and pushes to main
6. **Database handling:** Explicit strategy for deterministic versus integration tests
7. **Minimal overhead:** Reuse existing tools; avoid unnecessary dependencies or complexity

## Alternatives Considered

### ESLint + Prettier vs. Biome

**ESLint + Prettier:**

- Proven, widely-used toolchain with extensive community support
- Mature React and TypeScript support through dedicated plugins
- Clear separation of concerns (linting vs. formatting)
- Well-established workflows for monorepos
- Already in use by both frontend and backend workspaces

**Biome:**

- Single unified tool for linting and formatting
- Simpler configuration, faster execution
- Less mature ecosystem; smaller community
- Limited monorepo-specific guidance
- Would require significant refactoring to existing workspace setup

**Decision:** Use ESLint + Prettier. The existing toolchain is well-established, the separation of concerns is clearer, and the additional cognitive overhead of Biome's unified configuration is not justified at this stage. Biome can be reconsidered if the linting and formatting workflow becomes a significant bottleneck.

### Shared Configuration vs. Workspace-Specific Configuration

**Shared configuration:**

- Single source of truth for consistency
- Easier to evolve standards across the repository
- Reduces duplication and maintenance burden

**Workspace-specific configuration:**

- Allows frontend and backend to have different rules (e.g., React vs. Node.js specific rules)
- Supports different tool versions if needed
- More flexibility but higher maintenance cost

**Decision:** Use a shared ESLint configuration with workspace-specific overrides where necessary. The frontend has React-specific rules (React Hooks, JSX), while the backend focuses on Node.js conventions. A root `eslint.config.js` provides defaults for both, with minimal workspace-specific adjustments.

### Single CI Workflow vs. Multiple Workflows

**Single workflow:**

- Simpler to understand and maintain
- Clear dependency order
- Standard validation applies uniformly

**Multiple workflows:**

- Can parallelize independent checks (e.g., frontend lint vs. backend test)
- Allows specialized handling (e.g., database tests in isolation)
- More complex configuration

**Decision:** Use a single straightforward CI workflow for now. The monorepo is small enough that a sequential job is acceptable. If CI execution time becomes a bottleneck, we can split into parallel jobs later (e.g., lint, test-frontend, test-backend-deterministic, test-backend-integration).

### Database-Dependent Test Handling

**Option A: Run database tests in main CI job**

- Requires PostgreSQL service container
- Tests all functionality in one pass
- Slower, more resource-intensive

**Option B: Run deterministic tests in main job, database tests separately**

- Main CI fast and reliable
- Optional database tests only on demand
- Clear separation of concerns

**Option C: Skip database tests in CI; run locally only**

- Fastest CI, but risky
- Doesn't catch database-dependent regressions
- Not suitable for a production-ready application

**Decision:** Use Option B. Run deterministic unit and integration tests in the main CI job. Database-dependent tests are excluded from the default test run (both locally and in CI) via `vitest.config.ts`. Tests can be run separately with an explicit flag when needed. This approach keeps CI fast, reliable and maintainable while still allowing database interactions to be validated locally. Developers can run database tests explicitly when working on database-related code.

## Decision

Implement a lightweight, shared development tooling strategy:

1. **ESLint:** Use ESLint 10 with typescript-eslint, @eslint/js, eslint-plugin-react and eslint-plugin-react-hooks
   - Shared root configuration: `eslint.config.js`
   - Ignores build outputs, dependencies, generated files
   - TypeScript-aware linting using project references
   - React and React Hooks rules for frontend
   - Single configuration entry point

2. **Prettier:** Use Prettier 3 for formatting consistency
   - Shared configuration: `.prettierrc.json`
   - Ignore patterns: `.prettierignore`
   - Prints at 100 characters per line (readable in most editors)
   - Enforces `prettier` as the final authority in ESLint conflicts

3. **TypeScript:** Preserve strict checking across all workspaces
   - Root `tsconfig.eslint.json` for ESLint's type-aware linting
   - Workspace-specific `tsconfig.json` for build and development
   - Consistent target (ES2020 frontend, ES2022 backend) aligned to Node.js 22 capabilities
   - Root `typecheck` script runs all workspace type checks

4. **Root Scripts:** Provide consistent entry points for all validation:

   ```bash
   pnpm lint              # Run ESLint
   pnpm lint:fix          # Fix linting issues
   pnpm format            # Apply Prettier formatting
   pnpm format:check      # Verify formatting without changes
   pnpm typecheck         # Run TypeScript checks across workspaces
   pnpm test              # Run all unit and integration tests
   pnpm build             # Build all applications
   pnpm check             # Run all non-destructive quality checks
   ```

5. **GitHub Actions CI:**
   - Workflow: `.github/workflows/ci.yml`
   - Triggers: Pull requests targeting `main`, pushes to `main`
   - Node.js: LTS version matching `engines.node` (currently 22)
   - pnpm: Version from `packageManager` field (currently 12.16.1)
   - Steps: format check → lint → typecheck → test → build
   - Caching: Use pnpm store caching for reproducible builds
   - Minimal permissions: Only `contents: read` for checkout

6. **Database-Dependent Tests:**
   - Backend integration tests in `tests/database.test.ts` require PostgreSQL with pgvector
   - Excluded from default test run via `vitest.config.ts` to keep CI deterministic
   - Run explicitly when needed: `pnpm --filter @career/api test -- apps/api/tests/database.test.ts`
   - Developers run locally with `pnpm db:up && pnpm db:migrate` before running database tests
   - CI remains fast and reliable without database dependency

7. **Security and Credentials:**
   - `.gitignore` already excludes `.env` and local secrets
   - CI uses no hardcoded credentials (tests use mock configs)
   - ESLint and Prettier configuration files are committed
   - No sensitive data in workflow configuration

## Consequences

### Positive

- **Consistency:** All developers and CI use the same linting and formatting rules
- **Simplicity:** Shared configuration reduces duplication and makes updates easier
- **Developer experience:** Root-level `pnpm check` runs all quality gates with clear feedback
- **Maintainability:** Single ESLint and Prettier config is easier to evolve than workspace-specific configs
- **Production-ready:** Strict TypeScript checking and comprehensive validation support long-term reliability
- **Flexibility:** Workspace-specific overrides remain possible for genuinely different needs

### Negative

- **Setup overhead:** Developers must have ESLint and Prettier installed (now in root devDependencies)
- **CI complexity:** Multiple validation steps add to CI execution time (mitigated by future parallelization)
- **Initial configuration:** Creating shared configs and integration points requires careful setup

### Risks

- **TypeScript checking:** Using ESLint's `project` option for type-aware linting requires accurate `tsconfig.eslint.json` maintenance; drift can cause false positives
- **Test coverage:** Skipping database tests in main CI could mask database-specific regressions (mitigated by clear documentation and separation)
- **Lock-in:** Switching away from ESLint and Prettier later would require re-configuring all workspaces (manageable risk given their widespread adoption)

## Revisit Conditions

1. **ESLint + Prettier vs. Biome:** If linting or formatting becomes a performance bottleneck (> 30 seconds), or if team consensus shifts toward unified tooling
2. **Shared configuration:** If frontend and backend acquire significantly different standards (e.g., different React versions, different backend frameworks) that make shared rules untenable
3. **CI workflow:** If a single sequential job exceeds 5 minutes, split into parallel jobs for lint, frontend test, backend test
4. **Database tests:** If database integration tests consistently fail in CI or require significant maintenance, move to a separate optional workflow or defer entirely

## Implementation Status

- [x] ESLint configuration (`eslint.config.js`)
- [x] Prettier configuration (`.prettierrc.json`, `.prettierignore`)
- [x] TypeScript ESLint configuration (`tsconfig.eslint.json`)
- [x] Root-level scripts (lint, format, typecheck, test, build, check)
- [x] Workspace-specific typecheck scripts
- [x] GitHub Actions CI workflow (`.github/workflows/ci.yml`)
- [x] README documentation updates
- [x] Local validation (all checks passing)
