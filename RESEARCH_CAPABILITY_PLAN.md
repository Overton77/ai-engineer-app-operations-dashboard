# Research-capability plan

This dashboard segment exposes the `research_starter_pre_research_agent` pipeline as a read-only operational surface. Videos are the anchors. Applied `research_*` tables and durable bucket packets are what a finished video produced. Local `outputs/pre-research/` copies are not the source of truth.

Live snapshot from `supabase-blue-ocean` (`wkythqbofmckbuoothhn`) on 2026-08-25:

| Measure | Count |
| --- | ---: |
| Starter-video catalog | 1,049 |
| Qualified transcript videos | 931 |
| Pipeline-finished videos | 290 |
| Applied runs | 290 |
| Review-required runs | 54 |
| Failed runs | 47 |
| Registered packet artifacts | 4,703 |
| Evidence anchors | 3,405 |
| Technology families | 1,307 |

Progress the UI should lead with: **290 of 931 qualified videos completed**. The 1,049 catalog count stays visible as the full channel intake.

## Source of truth

```
YouTube catalog
  -> research_starter_videos
  -> transcript object in ai-engineer-transcripts
  -> claimed research_pre_research_run
  -> twelve packet files in research-ingestion-intents/pre-research/v2/<video_id>/<run_id>/
  -> deterministic executor
  -> applied research_* tables
  -> research_pre_research_video_state.pre_research_pipeline_finished = true
```

A video is completed only when the executor has applied the intent, registered a hash-verified packet, and projected finish state. Eve sessions must never set that flag. `pre_research_complete` on the starter-video row is a mirror of the same finish.

## Data the API must read

### Catalog and orchestration

| Object | Role |
| --- | --- |
| `research_starter_videos` | Channel catalog + transcript pointer. Anchor key: `video_id`. Never select `transcript_text` on list endpoints. |
| `research_pre_research_video_state` | Live eligibility, latest run, `pipeline_status`, finish flag. |
| `research_pre_research_run` | One claim per video + transcript hash. Status walk: queued → claimed → analyzing → research_complete → synthesizing → intent_ready / review_required → applying → applied. |
| `research_pre_research_session` | Research / synthesis session ledger. |
| `research_pre_research_stage_execution` | Per-stage durable execution. |
| `research_pre_research_artifact` | Registry of the twelve v2 packet kinds. |
| `research_ingestion_intent` | Validated / applied / rejected intent. |
| `research_ingestion_intent_event` | Per-operation apply ledger. |

### Applied analysis tables

Written only by the executor from `90-ingestion-intent.json`.

| Object | What the UI shows |
| --- | --- |
| `research_video_analysis` | Transcript-grounded analysis packet: summaries, difficulty, content form, evidence level. |
| `research_video_initial_summary` | Contextualized summary after web/org research. |
| `research_video_technology_summary` | Ranked technology / library families. |
| `research_video_category` | Primary + secondary engineering categories. |
| `research_video_domain` | Application-domain assignments. |
| `research_video_lifecycle` | Lifecycle stages. |
| `research_organization_candidate` | Featured and mentioned organizations. Exactly one primary / rank-1 org per analysis. |
| `research_organization_source` | Sources backing each org. |
| `research_evidence_anchor` | Transcript/web excerpts that ground claims. |
| `research_entity_candidate` | Staging entities. |
| `research_resource_candidate` | Staging resources (repos, papers, docs). |
| `research_web_search_event` | Exa search provenance. |

### Taxonomy lookups

These are the divisions the catalog and filters hang off.

| Object | Division |
| --- | --- |
| `research_taxonomy_version` | Active taxonomy version (`1.0.0`). |
| `research_category_definition` | 17 engineering categories (`research_engineering_category_code`). |
| `research_application_domain` | 16 application domains. |
| `research_organization_domain_definition` | 27 organization-domain codes. |

Current primary-category skew among applied videos: 199 / 290 sit in `ai_platforms_developer_tooling`. The taxonomy page must make that imbalance visible.

### Private buckets

| Bucket | Path | Role |
| --- | --- | --- |
| `ai-engineer-transcripts` | `ai-dot-engineer/<video_id>.txt` | Caption file. SHA must match `research_pre_research_run.transcript_sha256`. |
| `research-ingestion-intents` | `pre-research/v2/<video_id>/<run_id>/` | Twelve v2 packet files. |

Artifact kinds, in pipeline order: `run_manifest`, `transcript_analysis`, `taxonomy_classification`, `web_context`, `organization_research`, `source_verification`, `curriculum_signals`, `initial_summary`, `technology_library_summary`, `organization_profile`, `ingestion_intent`, `execution_receipt`.

Local example: `research_starter_pre_research_agent/outputs/pre-research/v2/ZB7l4uxW3Yo/<run_id>/`. Use it only as a shape reference. The dashboard reads Storage + Postgres.

## API surface

All routes live under `/api/research-capability`. They are read-only Next.js App Router handlers. The service role never leaves the server.

| Route | Returns | Search / filters |
| --- | --- | --- |
| `GET /pipeline-progress` | Finished / qualified / catalog counts plus `pipeline_status` breakdown | none |
| `GET /taxonomy-divisions` | Category, application-domain, org-domain, form, difficulty, lifecycle lookups with applied-video counts | none |
| `GET /starter-videos` | Paginated video anchors with latest-run status, primary category, primary domain, primary org | `q`, `pipelineStatus`, `finished`, `categoryCode` (`uncategorized` = finished + applied + no primary), `domainCode`, `difficulty`, `contentForm`, `sort=library`, `page`, `pageSize` |
| `GET /share-reports/:videoId` | Composed reader DTO for one finished applied video | none |
| `GET /starter-videos/:videoId` | One video + video state + runs | none |
| `GET /applied-outputs/:videoId` | Selected run's applied tables + artifact registry + packet inventory | `runId` optional |
| `GET /table-rows/:tableKey` | Allowlisted table browser | `q`, `videoId`, `page`, `pageSize` |
| `GET /packet-artifacts/:videoId/:runId/:artifactKind` | One packet JSON body from `research-ingestion-intents` | none |
| `GET /transcripts/:videoId` | Transcript preview or full text from `ai-engineer-transcripts` | `full=1` |

`q` on starter videos matches title, `video_id`, featured organization name, and technology family / primary technology.

`tableKey` values tell the operational story, not the raw Postgres name: `starter-videos`, `video-states`, `pipeline-runs`, `ingestion-intents`, `video-analyses`, `initial-summaries`, `technology-families`, `category-assignments`, `domain-assignments`, `lifecycle-assignments`, `organization-candidates`, `organization-sources`, `evidence-anchors`, `entity-candidates`, `resource-candidates`, `packet-artifacts`, `web-search-events`, `stage-executions`.

## Frontend surface

TanStack Query owns client fetching. Catalog filters live in React context and URL search params so they survive navigation.

| Route | Story |
| --- | --- |
| `/` | Dashboard shell. Research-capability is the first (and currently only) segment. |
| `/research-capability` | Progress banner + taxonomy-division filters + searchable video catalog. |
| `/research-capability/library` | Finished-report reader home: official engineering-category folders. |
| `/research-capability/library/[categoryCode]` | Finished videos whose primary category is that folder. |
| `/research-capability/library/[categoryCode]/[videoId]` | One share-report brief. Canonical URL is the current primary category. |
| `/research-capability/videos/[videoId]` | One video as the operational unit: status, taxonomy, orgs, tech families, summaries, evidence, packet completeness. |
| `/research-capability/taxonomy` | Division boards: category / domain / lifecycle / form / difficulty with video counts. |
| `/research-capability/tables/[tableKey]` | Simple search-and-filter browsers for applied and orchestration tables. |

## Naming composition

Feature code lives in `src/features/research-capability/`. Names follow the pipeline, not generic CRUD:

- `pipeline-progress` — x of y completed
- `starter-video-catalog` — the video list
- `starter-video-anchor` — one video as the unit of work
- `applied-research-outputs` — executor-written tables for that video
- `taxonomy-divisions` — the classification system
- `share-report` — composed finished-report reader DTO
- `research-table-catalog` — allowlist of exposable tables
- `packet-artifacts` — durable intent-bucket objects

## Out of scope for this slice

- Writing intents, claiming videos, or marking finish
- Learner / course tables from `aiengineerapp`
- Factory optimizer tables (`factory_*`)
- Downloading every transcript on catalog load
- Treating local `outputs/pre-research/` as live data
