# AI Assisted workflow

I'm using a structured AI-assisted development workflow that combines **ChatGPT, GitHub Copilot and Matt Pocock's engineering skills**, while retaining ownership of technical decisions and code quality.

- **ChatGPT — Planning & Architecture:** Used to break down the assessment into milestones and GitHub issues, define technical requirements and acceptance criteria, explore architectural options, and prepare implementation prompts.

- **GitHub Copilot — Implementation:** Used within VS Code to implement individual GitHub issues, following the repository's `AGENTS.md`, domain documentation and established engineering standards.

- **Matt Pocock's Skills — Engineering Workflow:** Used to further refine engineering tasks (`/grill-with-docs`), guide structured implementation (`/implement`), testing (`/tdd`), code review (`/code-review`) and pull request documentation (`/pr`).

- **Human Review & Validation:** I review the generated code, resolve findings from AI-assisted code reviews, validate functionality and tests, and retain responsibility for approving Architecture Decision Records (ADRs) and merging changes.

**The goal is to use AI to accelerate delivery without compromising engineering quality.** GitHub Issues provide traceable requirements, ADRs capture technical reasoning, and pull requests provide evidence of implementation, testing and review.

This approach makes AI-assisted development repeatable, maintainable and accountable rather than relying on unstructured code generation.

## Agents workflow

- `AGENTS.md`
  Repository-wide engineering instructions

- `issue-tracker.md`
  Where work lives and how to manage it

- `domain.md`
  How agents find domain knowledge

- `CONTEXT.md` + Architecture Decision Records
  Product rules, terminology and technical decisions
