# Pre-research library spec

One-pass implementation spec for a **reader surface** in `agents_dashboard`. It mirrors the `pre-research-reports/` folder tree (primary category → video → numbered sections) so people can browse and read finished research cleanly, and always jump to the official YouTube video.

Implement this slice only. Do not start a second data pipeline.

## Why this exists

`pre-research-reports/` is a **shareable export snapshot** written by `research_starter_pre_research_agent/scripts/export-share-reports.mts` (`npm run export:share-reports`). Folders are grouped by **primary engineering category**. Each video folder is a human-readable brief plus `01`–`06` topic slices.

The dashboard already has the live data those folders were built from. It does **not** yet have the same *information architecture* or a reading-first layout.

Two surfaces must stay distinct:

| Surface | Route | Audience | What it shows |
| --- | --- | --- | --- |
| Operational catalog | `/research-capability` | Operators | All starter videos, pipeline status, remaining work, table browsers |
| Pre-research library | `/research-capability/library` | People we show + ourselves reading | Finished applied reports only, organized like the export folders |

Do not turn the operational catalog into the library. People should not have to filter `finished=true` and ignore pipeline badges to read a talk.

## Source of truth (non-negotiable)

Postgres applied tables are the source of truth. Same rule as [RESEARCH_CAPABILITY_PLAN.md](./RESEARCH_CAPABILITY_PLAN.md).

**Do not:**

- Import, copy, or statically serve `pre-research-reports/` into the Next app
- Read local `outputs/pre-research/` or `research_starter_pre_research_agent/scripts/export-share-reports.mts` at runtime
- Add a new schema, migration, or table in `ai-engineer-db-contract`
- Claim videos, write intents, or mark pipeline finished
- Embed the YouTube player in this slice (link only)
- Download transcripts on list endpoints

The export tree is the **UX reference**. The dashboard recomposes the same shape from live rows.

Eligibility for the library matches the exporter:

```
research_pre_research_video_state.pre_research_pipeline_finished
AND pipeline_status = 'finished'
AND latest run status = 'applied'
```

Uncategorized finished videos (no primary `research_video_category` row) belong under `categoryCode=uncategorized`.

## Locked decisions

1. **Live Postgres, not the markdown dump.** 920 folders would bloat deploys and drift from newly applied runs.
2. **New library routes**, keep `/research-capability` operational.
3. **Primary category is the only browse folder.** Secondary category, domain, form, difficulty, and lifecycle stay facets on the report, not extra folder trees. That matches the export.
4. **Reuse the existing paginated catalog API** for category video lists. Add one new reader API for the composed report.
5. **YouTube is a first-class action** on every library list row and every report header. Resolve `video.url` or fall back to `https://www.youtube.com/watch?v=<videoId>`.
6. **Typed reader DTO**, not `Record<string, unknown>` dumps. The operational `applied-outputs` endpoint stays as-is for the existing video workspace.
7. **No MCP / CLI / A2A in this slice.** The share-report JSON is the contract a later MCP resource can expose. This pass is the dashboard client.

## Information architecture

Mirror the export, not the operational table.

```
Library home
  → 17 official categories (plus Uncategorized if needed)
    → finished videos whose primary assignment is that category
      → one readable report
        → Overview
        → 01 Summary
        → 02 Taxonomy
        → 03 Organizations
        → 04 Technologies
        → 05 Curriculum
        → 06 Sources and evidence
```

Export folder names (`01-model_foundations_behavior`) are display labels only. **URLs use stable `category_code`**, because `sort_order` can change.

### Routes

| Route | Page |
| --- | --- |
| `/research-capability/library` | Category index |
| `/research-capability/library/[categoryCode]` | Videos in that primary category |
| `/research-capability/library/[categoryCode]/[videoId]` | Readable report |

Canonical report URL is always the video’s **current** primary category. If a visitor opens a stale category + video pair, 404 or redirect to the canonical category. Do not render the report under the wrong folder.

Add a header nav item **Library** next to Research capability / Taxonomy / Tables. Add a home-page card pointing at `/research-capability/library`.

Cross-links:

- Library report header → operational page `/research-capability/videos/[videoId]` as “Pipeline workspace” (secondary, not the main CTA)
- Operational video page → library report when the video is finished
- Category index cards and taxonomy-division category links may point at `/research-capability/library/[categoryCode]` **in addition to** the existing operational filter links. Do not replace the taxonomy page; it remains the multi-facet board.

### YouTube URL helper

Add `youtubeWatchUrl(videoId: string, storedUrl?: string | null): string` in `src/features/research-capability/lib/youtube.ts`.

- If `storedUrl` is a non-empty http(s) URL, use it
- Else `https://www.youtube.com/watch?v=${videoId}`
- All YouTube anchors: `target="_blank"`, `rel="noreferrer"`, visible label **Watch on YouTube**

Required placements this slice:

1. Library category video rows (external link that does **not** navigate the dashboard)
2. Library report header, next to the title (primary CTA)
3. Operational catalog rows (same helper; the title still opens the dashboard video)
4. Existing `AppliedOutputsWorkspace` header (already has a YouTube link; switch it to the helper so null `url` still works)

Do not embed an iframe.

## Data and APIs

Keep all handlers under `/api/research-capability`. Service role stays on the server. Client access stays TanStack Query.

### 1. Extend taxonomy divisions (reuse)

`GET /api/research-capability/taxonomy-divisions` already returns the 17 categories with applied counts, ordered by `sort_order`.

Extend `TaxonomyDivisionOption` for **engineering categories only** (other divisions can leave the new fields empty or omit them):

```ts
export type TaxonomyDivisionOption = {
  code: string;
  label: string;
  appliedVideoCount: number;
  description?: string;
  inclusionCriteria?: string[];
  exclusionCriteria?: string[];
  exampleTopics?: string[];
  sortOrder?: number;
};
```

Fill those from `research_category_definition`. Keep existing count SQL. Append a synthetic `uncategorized` option only when at least one finished applied video has no primary category.

Folder display helper (UI only):

```ts
function categoryFolderName(sortOrder: number, categoryCode: string) {
  const order = String(Math.floor(sortOrder / 10) || sortOrder).padStart(2, "0");
  return `${order}-${categoryCode}`;
}
```

`uncategorized` uses `sortOrder=999` → `99-uncategorized`.

### 2. Reuse starter-video catalog for library lists

`GET /api/research-capability/starter-videos` already supports `categoryCode`, `finished`, `q`, `page`, `pageSize`, and already returns `url`.

Library category pages call it with:

- `finished=true`
- `categoryCode=<code>` (omit for a “all finished” search-from-home if you add one; category pages always pass the code)
- `pageSize=40` (API already caps 10–100). **Required.** `ai_platforms_developer_tooling` currently holds most finished videos.

Add one list field if missing from the row mapper: `primaryOrganizationUrl` is nice-to-have, not required. `url` is required and already present.

Uncategorized list: `categoryCode=uncategorized` must mean “finished + applied + no primary category”. Implement that as an explicit branch in `readStarterVideoCatalog`, not `primary_cat.category_code = 'uncategorized'`.

Default library list sort: `published_at asc nulls last, video_id` (same as the exporter). The operational catalog can keep its current “finished first, then newest” sort. If the shared query cannot take a sort flag cleanly, add an optional `sort=library` search param used only by the library pages.

### 3. New share-report reader API

`GET /api/research-capability/share-reports/[videoId]`

Returns the composed reader DTO for one finished applied video. 404 if the video is missing or not library-eligible.

Do **not** reuse `applied-outputs` for the library page. That payload is a raw table dump for operators. The library needs labels, rationale, sources, curriculum, and a resolved YouTube URL.

Shape is the dashboard TypeScript form of export schema `pre-research-share-report/1.0.0`. Use camelCase to match the rest of `types.ts`. Include at least:

```ts
export type ShareReport = {
  schema: "pre-research-share-report/1.0.0";
  video: {
    videoId: string;
    title: string;
    description: string | null;
    url: string; // always resolved via youtubeWatchUrl
    publishedAt: string | null;
    channelTitle: string | null;
    durationSeconds: number | null;
  };
  pipeline: {
    runId: string;
    analysisId: string | null;
    finishedAt: string | null;
    researchAsOf: string | null;
    modelId: string | null;
    promptBundleVersion: string | null;
  };
  taxonomy: {
    primary: { categoryCode: string; label: string; confidence: number | null; rationale: string | null } | null;
    secondary: Array<{ categoryCode: string; label: string; confidence: number | null; rationale: string | null }>;
    contentForm: string | null;
    difficulty: string | null;
    evidenceLevel: string | null;
    overallConfidence: number | null;
    domains: Array<{ domainCode: string; label: string; confidence: number | null; rationale: string | null }>;
    lifecycleStages: string[];
  };
  summaries: {
    transcriptOnly: string | null;
    contextualized: string | null;
    whyItMatters: string | null;
    temporalContext: string | null;
  };
  keyTakeaways: string[];
  organizations: Array<{
    canonicalName: string;
    isPrimaryFeatured: boolean;
    officialUrl: string | null;
    authoritativeSummary: string | null;
    organizationScope: string | null;
    relationshipRoles: string[];
    primaryDomainLabel: string | null;
    currentStatus: string | null;
    sources: Array<{
      title: string | null;
      url: string | null;
      sourceRole: string | null;
      authorityTier: string | null;
      verificationStatus: string | null;
    }>;
  }>;
  technologies: Array<{
    familyRank: number | null;
    familyLabel: string;
    primaryTechnology: string | null;
    primaryTechnologyKind: string | null;
    summary: string | null;
    roleInVideo: string | null;
    temporalStatus: string | null;
    officialUrls: string[];
    confidence: number | null;
  }>;
  curriculum: {
    recommendedLearnerLevel: string | null;
    prerequisites: string[];
    learningOutcomes: string[];
    curriculumRoles: string[];
    challengeSeeds: string[];
  };
  entities: Array<{
    entityKind: string;
    name: string;
    canonicalUrl: string | null;
    verificationStatus: string | null;
    relationshipToVideo: string | null;
  }>;
  resources: Array<{
    resourceType: string;
    title: string;
    url: string | null;
    whyValuable: string | null;
    verificationStatus: string | null;
    isFirstParty: boolean | null;
  }>;
  evidence: Array<{
    evidenceId: string;
    sourceKind: string;
    shortExcerpt: string | null;
    supports: string | null;
  }>;
  webSearches: Array<{
    subagent: string | null;
    query: string | null;
    searchPurpose: string | null;
  }>;
};
```

Server module: `src/features/research-capability/server/share-report.ts`.

Query the same tables the exporter uses. Join category / domain **labels** from the definition tables. Load organization sources. Prefer `research_video_initial_summary.transcript_summary` for the contextualized summary when present.

Join labels in SQL. Do not ship raw enum codes to the reader without a human label.

Reference implementation for field mapping (read, do not import): `research_starter_pre_research_agent/scripts/export-share-reports.mts` functions `buildVideoReport` and `loadRelated`.

## Frontend

Stay inside `src/features/research-capability/`. Follow existing names: hooks + fetchers + query keys + client components. Route handlers remain the only server. After UI edits, verify with the `next-dev-loop` skill against a running `pnpm dev`.

### Library home — `/research-capability/library`

Purpose: the export root `README.md` / category folders.

- Title: **Pre-research library**
- One-line explanation: finished talks grouped by primary engineering category. Click a category, then a talk. Watch the official video from any report.
- Grid of all 17 official categories, including zeros (the taxonomy has empty folders on purpose; people should see the map)
- Each card: folder name, label, applied count, description
- Click → `/research-capability/library/[categoryCode]`
- Optional search box that queries `starter-videos?finished=true&q=` and links hits into the canonical report URL. Not required if time is tight; category browse is.

### Category page — `/research-capability/library/[categoryCode]`

Purpose: a category `README.md`.

- Breadcrumb: Library / {label}
- Code, description, include / exclude / example topics when present
- “N finished videos”
- Search within this category (`q` + `categoryCode` + `finished=true`)
- Paginated list. Columns: title, featured organization, content form, difficulty, published, **Watch on YouTube**
- Title links to `/research-capability/library/[categoryCode]/[videoId]`
- Empty official category: keep the definition copy, say no finished videos yet
- Unknown `categoryCode` that is not `uncategorized`: 404

### Report page — `/research-capability/library/[categoryCode]/[videoId]`

Purpose: a video folder `README.md` plus the numbered slices, as a long readable page with in-page nav.

Header:

- Breadcrumb: Library / {primary label} / {title}
- Title
- **Watch on YouTube** (always present)
- Video id, published, duration, channel, featured org
- Secondary link: Pipeline workspace

In-page section nav (sticky on desktop is nice, not required): Overview, Summary, Taxonomy, Organizations, Technologies, Curriculum, Sources.

Render the same material as the export, in this order:

1. **Overview / at a glance** — category, form, difficulty, evidence level, domains, lifecycle, featured org, research-as-of
2. **01 Summary** — why it matters, contextualized summary, transcript-only only if it differs, temporal note, key takeaways
3. **02 Taxonomy** — primary + rationale, secondary + rationale, domains + rationale, form / difficulty / lifecycle
4. **03 Organizations** — primary featured first; official site links; sources with outbound links
5. **04 Technologies** — ranked families, official URLs
6. **05 Curriculum** — level, outcomes, prerequisites, challenge seeds, curriculum roles
7. **06 Sources and evidence** — resources, up to 20 evidence excerpts (full list can stay in the JSON mentally; 20 matches the export README), web-search queries

Reading typography: `max-w-3xl` for prose, `leading-7`, muted secondary text. This page is a brief, not a dashboard of metric cards.

Empty sections: one quiet “None recorded.” Do not hide the heading. Operators need to see what the agent omitted.

Do not show pipeline packet completeness, raw artifact paths, or table-browser links on this page. Those stay on the operational workspace.

### Operational catalog touch-ups (small, required)

In `starter-video-catalog.tsx`, add a Watch on YouTube control per row using the helper. Title continues to open `/research-capability/videos/[videoId]`.

In `applied-outputs-workspace.tsx`, if `preResearchComplete`, add “Open library report” linking to `/research-capability/library/{primaryCategoryCode}/{videoId}`. If primary category is unknown, use `uncategorized`. The existing YouTube link must use the helper.

## Files to add or change

Add:

- `src/features/research-capability/lib/youtube.ts`
- `src/features/research-capability/server/share-report.ts`
- `src/app/api/research-capability/share-reports/[videoId]/route.ts`
- `src/app/research-capability/library/page.tsx`
- `src/app/research-capability/library/[categoryCode]/page.tsx`
- `src/app/research-capability/library/[categoryCode]/[videoId]/page.tsx`
- `src/features/research-capability/components/library-category-index.tsx`
- `src/features/research-capability/components/library-category-videos.tsx`
- `src/features/research-capability/components/library-share-report.tsx`
- `src/features/research-capability/hooks/use-share-report.ts`

Change:

- `src/features/research-capability/types.ts` — `ShareReport`, extended `TaxonomyDivisionOption`
- `src/features/research-capability/server/taxonomy-divisions.ts` — extra category fields + uncategorized
- `src/features/research-capability/server/starter-video-catalog.ts` — uncategorized filter + optional library sort
- `src/features/research-capability/api/fetchers.ts` + `query-keys.ts`
- `src/features/research-capability/components/starter-video-catalog.tsx`
- `src/features/research-capability/components/applied-outputs-workspace.tsx`
- `src/app/layout.tsx` — Library nav
- `src/app/page.tsx` — Library home card
- `README.md` and `RESEARCH_CAPABILITY_PLAN.md` — document the new routes
- `AGENTS.md` — one sentence: library is the finished-report reader; catalog is operational

Do not add markdown copies of reports under `public/` or `src/`.

## Implementation order

1. `youtubeWatchUrl` + wire it into the existing catalog and video header (smallest visible win)
2. Extend taxonomy-divisions + library home
3. Category page on reused `starter-videos` (finished + category + pagination + YouTube)
4. `readShareReport` + API + report page
5. Cross-links, nav, docs
6. Browser-verify the three library routes plus the two operational touch-ups

## Acceptance criteria

- Library home lists all 17 official categories with counts and descriptions
- Opening `model_foundations_behavior` shows only finished videos whose primary category is that code
- Opening a video report is readable as a brief: summary, taxonomy rationale, orgs, tech, curriculum, sources
- Every library list row and every report header has **Watch on YouTube** and opens the official video in a new tab
- A video with `url = null` still gets `https://www.youtube.com/watch?v=<id>`
- `ai_platforms_developer_tooling` paginates; the first paint does not render hundreds of rows
- Unfinished / in-pipeline videos do not appear in the library
- `/research-capability` still shows unfinished videos and pipeline filters
- No new DB objects; no static import of `pre-research-reports/`
- 404 for unknown category codes and for videos that are not library-eligible
- Wrong category + valid video does not present that video as belonging to the wrong folder

## Verification

Use the `next-dev-loop` skill against `pnpm dev`. A screenshot is not enough.

1. Home → Library card → category grid
2. Open a small category (`model_foundations_behavior`) → open `ju73sWVtvU0` → read the Replit report → click Watch on YouTube
3. Open `ai_platforms_developer_tooling` → confirm pagination and in-category search
4. From a report, open Pipeline workspace, then return via Open library report
5. Operational catalog: YouTube link works without leaving the row’s dashboard title link broken
6. Hit `/research-capability/library/not-a-real-category` and a non-finished video id → 404
7. Desktop and a narrow viewport on the report page (header + section stack)

## Out of scope

- YouTube embed, timestamps, or transcript playback
- Re-exporting markdown to disk
- Editing analysis, approving review-required runs, or re-running the agent
- Filtering the library by domain / form / difficulty as extra folder trees
- MCP, CLI, or A2A exposure of the share-report JSON
- Learner / course surfaces
- Visual redesign of the operational catalog beyond the YouTube + library cross-links
