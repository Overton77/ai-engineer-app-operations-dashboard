<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Agents dashboard

This app is a research-and-capability proof surface. The first segment is **research-capability**: it reads the `research_starter_pre_research_agent` Postgres ledger and the private Supabase buckets `ai-engineer-transcripts` and `research-ingestion-intents`.

## Operational names

- A **starter video** is a row in `research_starter_videos`. Videos are the anchors.
- A **pipeline run** is one claim of a transcript hash. Completion is `research_pre_research_video_state.pre_research_pipeline_finished`, not a local `outputs/` folder.
- **Applied research outputs** are the executor-written `research_*` analysis tables for that video.
- **Taxonomy divisions** are the engineering categories, application domains, lifecycle stages, content form, difficulty, and organization domains.
- **Packet artifacts** live under `research-ingestion-intents/pre-research/v2/<video_id>/<run_id>/`.
- **Transcript objects** live at `ai-engineer-transcripts/ai-dot-engineer/<video_id>.txt`.

The **library** (`/research-capability/library`) is the finished-report reader; the catalog (`/research-capability`) is the operational pipeline surface. Do not query learner tables from `aiengineerapp`. Do not mark pipeline finished from this app. Route handlers are the only server. Client data access goes through TanStack Query hooks.

## After every edit

Verify the changed page against a running `pnpm dev` using the `next-dev-loop` skill.


<!-- BEGIN GENERATED: agent-docs -->
## Repository guide

Research and capability proof UI over the pre-research ledger and stored packet artifacts.

Lifecycle: Existing research operations surface; relationship to Mission Control dashboard remains open.

Read the relevant documents below before changing behavior. Inspect more-specific AGENTS.md files in the destination directory. Accepted docs record settled decisions; proposed, reference, and deprecated docs are labelled context. The map is navigation, not proof of implementation or deployment.

- Do not mark pre-research complete from the UI. Use the database completion state, not local output folders.
- Read the relevant installed Next.js documentation before framework changes. Route handlers own server access; use TanStack Query hooks for client data.
- Do not query learner tables from aiengineerapp.
- Shared Supabase migrations and generated database types are owned by ai-engineer-db-contract; consume its pinned contract. Do not create another migration/type authority.
- Search explicit source paths first. Do not recursively enumerate artifacts, outputs, runs, receipts, caches, dependencies, or private notes. Read an individual artifact only when the task calls for it.

### Code navigation

Read `docs/agents/CODE-MAP.md` for source entrypoints, interfaces, dependencies, tests, and architecture by module.

- `src/app/AGENTS.md`: Next.js routes and application shell.
- `src/features/AGENTS.md`: Research capability feature implementation.
- `src/providers/AGENTS.md`: Client data-provider configuration.
- Change pipeline status display: research-capability → app-routes
- Change client query behavior: query-provider → research-capability

### Task routes

- App scope, routes, setup: `README.md`
- Research capability data map and API: `RESEARCH_CAPABILITY_PLAN.md`

### Validation

Run from this repository root; choose checks relevant to the change. Commands are documented here, never executed by the documentation updater.

- `pnpm lint`
- `pnpm build`

Documentation: `node .agent-docs/cli.mjs check --repo .`; refresh with `node .agent-docs/cli.mjs build --repo .`. Edit `.agent-docs/config.json` to change this guide.

[Docs index]|root:.
|.:{README.md,RESEARCH_CAPABILITY_PLAN.md}
<!-- END GENERATED: agent-docs -->
