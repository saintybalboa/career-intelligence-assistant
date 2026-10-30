# Project workflow

This document outlines the typical workflow for contributing to the Career Intelligence Assistant project, including issue tracking, domain modeling, and code exploration.

1. GitHub Issue

    Define scope, technical requirements and acceptance criteria with assistance from ChatGPT

2. Technical refinement

    Refine the technical approach, breaking down tasks and identifying dependencies.
    Use `/grill-with-docs` when the issue contains important architectural choices

3. Implementation

    Implement the solution according to the refined technical approach.
    Use `/implement` with the GitHub issue as the source of truth

4. Testing

    Test the implemented solution to ensure it meets the acceptance criteria.
    Use `/tdd` for logic, API routes and RAG functionality

5. Code review

    Review the code for correctness, style, and adherence to the specification.
    Use `/code-review` to check the changes against the specification

6. Delivery

    Deliver the final solution, ensuring it is properly integrated and documented.
    Review the diff, validate locally and close the issue

## Agents workflow

- AGENTS.md
  Repository-wide engineering instructions

- issue-tracker.md
  Where work lives and how to manage it

- domain.md
  How agents find domain knowledge

- CONTEXT.md + Architecture Decision Records
  Product rules, terminology and technical decisions
