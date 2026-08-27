# Agents dashboard

Research and capability proof surface for the AI Engineer agents. The first segment is **research-capability**: it reads the `research_starter_pre_research_agent` Postgres ledger plus the private Supabase buckets `ai-engineer-transcripts` and `research-ingestion-intents`.

See [RESEARCH_CAPABILITY_PLAN.md](./RESEARCH_CAPABILITY_PLAN.md) for the data map, API surface, and naming story.

## Setup

```bash
pnpm install
cp .env.example .env
# fill POSTGRES_URL or POSTGRES_URL_NON_POOLING, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
pnpm dev
```

The app uses Next.js 16.4 canary with `AGENTS.md`, `CLAUDE.md`, bundled docs at `node_modules/next/dist/docs/`, Next.js MCP at `/_next/mcp`, and the `next-dev-loop` skill.

## Routes

- `/` dashboard shell
- `/research-capability` starter-video catalog and pipeline progress
- `/research-capability/library` finished-report reader, grouped by primary engineering category
- `/research-capability/library/[categoryCode]` finished videos in that primary category
- `/research-capability/library/[categoryCode]/[videoId]` one readable share report
- `/research-capability/videos/[videoId]` one video as the operational unit
- `/research-capability/taxonomy` taxonomy division boards
- `/research-capability/tables/[tableKey]` allowlisted table browsers
