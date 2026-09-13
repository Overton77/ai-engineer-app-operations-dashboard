<!-- BEGIN GENERATED: semantic-map -->
# Semantic code map

Generated from reviewed module descriptions and current selected source files. Package dependencies/exports/script names are extracted from manifests; relationships and ownership are authored. This is not a complete import graph or proof that a designed capability is implemented.

Paths below are repository-relative. Use the task routes, then search the module heading. Follow accepted architecture docs for decisions; proposed/reference/deprecated documents retain those labels.

## Task routes

- Change pipeline status display: [research-capability](#research-capability) → [app-routes](#app-routes)
- Change client query behavior: [query-provider](#query-provider) → [research-capability](#research-capability)

## Modules

| Module | Source | Responsibility | State |
|---|---|---|---|
| [app-routes](#app-routes) | src/app | Next.js dashboard shell, research-capability pages, and API routes. | implemented |
| [research-capability](#research-capability) | src/features/research-capability | Pre-research catalog, pipeline progress, stored packets, and applied-output views. | implemented |
| [query-provider](#query-provider) | src/providers | Client TanStack Query provider. | implemented |

## app-routes

**src/app** · module · implemented

Next.js dashboard shell, research-capability pages, and API routes.

**Enter:** [`src/app/layout.tsx`](../../src/app/layout.tsx), [`src/app/page.tsx`](../../src/app/page.tsx)
**Interface:** Next.js route entry points.
**Package:** not a standalone package
**Export subpaths:** none declared. Declared metadata; build outputs are not read.
**Declared internal package dependencies:** none declared
**Other runtime dependencies:** none declared
**Reviewed runtime/data relationships:** [research-capability](#research-capability)
**Checks:** No specific test anchor registered.

**Architecture and detailed docs:**

- [reference] [`README.md`](../../README.md) — App scope, routes, setup

## research-capability

**src/features/research-capability** · module · implemented

Pre-research catalog, pipeline progress, stored packets, and applied-output views.

**Enter:** [`src/features/research-capability/types.ts`](../../src/features/research-capability/types.ts), [`src/features/research-capability/server/pipeline-progress.ts`](../../src/features/research-capability/server/pipeline-progress.ts), [`src/features/research-capability/server/packet-artifacts.ts`](../../src/features/research-capability/server/packet-artifacts.ts), [`src/features/research-capability/hooks/use-pipeline-progress.ts`](../../src/features/research-capability/hooks/use-pipeline-progress.ts)
**Interface:** Server data helpers and TanStack Query hooks.
**Package:** not a standalone package
**Export subpaths:** none declared. Declared metadata; build outputs are not read.
**Declared internal package dependencies:** none declared
**Other runtime dependencies:** none declared
**Reviewed runtime/data relationships:** none declared
**Checks:** No specific test anchor registered.
- Use canonical database completion state; this UI does not mark the pipeline finished.

**Architecture and detailed docs:**

- [reference] [`README.md`](../../README.md) — App scope, routes, setup
- [reference] [`RESEARCH_CAPABILITY_PLAN.md`](../../RESEARCH_CAPABILITY_PLAN.md) — Research capability data map and API

## query-provider

**src/providers** · module · implemented

Client TanStack Query provider.

**Enter:** [`src/providers/query-provider.tsx`](../../src/providers/query-provider.tsx)
**Interface:** Query provider wrapping client views.
**Package:** not a standalone package
**Export subpaths:** none declared. Declared metadata; build outputs are not read.
**Declared internal package dependencies:** none declared
**Other runtime dependencies:** none declared
**Reviewed runtime/data relationships:** none declared
**Checks:** No specific test anchor registered.

**Architecture and detailed docs:**

- [reference] [`README.md`](../../README.md) — App scope, routes, setup
<!-- END GENERATED: semantic-map -->
