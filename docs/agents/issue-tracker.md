# Issue tracker: GitHub

GitHub Issues is the source of truth for requirements, acceptance criteria and implementation scope. GitHub Projects provides delivery visibility; it does not replace issue content.

- **Repository:** `saintybalboa/career-intelligence-assistant`
- **Project board:** https://github.com/users/saintybalboa/projects/5/views/1
- **Project workflow:** Backlog → Ready → In Progress → In Review → Done
- **Milestones:** Use the existing milestone for each delivery phase. Do not create or change milestones without an explicit request.

Use the authenticated `gh` CLI for issue operations. When inside the repository, infer the repository from `git remote -v` (the CLI usually does this automatically). When outside it, specify `--repo saintybalboa/career-intelligence-assistant`.

## Read before writing

1. Read the current issue and its comments before making changes.
2. Check existing issues to avoid duplicates and understand dependencies.
3. Preserve existing requirements and acceptance criteria unless the developer has requested a change.
4. Confirm authentication with `gh auth status` if operations fail; do not assume write access.

## Common operations

```bash
# Read an issue
gh issue view <number> --json number,title,body,state,labels,milestone,comments

# List open issues
gh issue list --state open --json number,title,labels,milestone \
  --jq '[.[] | {number, title, labels: [.labels[].name], milestone: .milestone.title}]'

# Create an issue with a multiline body
gh issue create --title "..." --body-file - <<'ISSUE'
## Objective
...
ISSUE

# Comment with implementation notes or review evidence
gh issue comment <number> --body-file - <<'COMMENT'
...
COMMENT

# Add or remove existing labels
gh issue edit <number> --add-label "..."
gh issue edit <number> --remove-label "..."

# Assign an existing milestone
gh issue edit <number> --milestone "M1 — Project Foundation"

# Close only when explicitly instructed
gh issue close <number>
```

Use the actual milestone names found in the repository; the example above is illustrative. Check label and milestone existence before applying them. Never create duplicate issues simply because an existing issue uses different wording.

## Issue structure

Where suitable, use:

- Objective and context
- Requirements and scope
- Out of scope
- Acceptance criteria (verifiable checklist)
- Dependencies or related issues
- Validation expectations
- Engineering notes and significant trade-offs

The issue describes **what** must be achieved. `AGENTS.md` and installed agent skills govern **how** to work. Do not duplicate large generic Copilot prompts in every issue.

## AI-assisted implementation

- Fetch the assigned issue with `gh issue view` and read `AGENTS.md`, `docs/agents/domain.md` and relevant ADRs.
- Do not create branches, commits or pull requests automatically.
- Make only changes in scope; surface ambiguity rather than expanding requirements silently.
- Run relevant checks and report their actual results, including checks that could not run.
- Post implementation summaries or evidence as issue comments **only when requested**. Do not change issue status, labels, milestone, assignees or project fields unless asked.
- Do not close issues automatically; the developer confirms completion.

## Project board

Project field updates are separate from ordinary issue operations. Do not assume `gh issue edit` changes a GitHub Project's Status field. Use `gh project` commands only when configured, authenticated and explicitly asked to update the board.

## Pull requests as a triage surface

**PRs as a request surface: no.** Requirements originate in GitHub Issues, not pull-request comments. PRs may be used later for review if requested, but are not created by default.

## Skill terminology

- **“Publish to the issue tracker”** → create a GitHub issue, after checking for an existing equivalent and when publication is authorised.
- **“Fetch the relevant ticket”** → read the relevant GitHub issue with `gh issue view`.
- **“Update the ticket”** → propose the change first; edit or comment only when authorised.
- **“Complete the ticket”** → verify acceptance criteria and report results; do not close automatically.
