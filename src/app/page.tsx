import Link from "next/link";
import { RESEARCH_TABLE_DEFINITIONS } from "@/features/research-capability/research-table-definitions";

export default function DashboardHomePage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
          Capability proof
        </p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight">Agents dashboard</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          The first segment is research-capability: starter videos as anchors, applied research
          tables as outputs, and pipeline completion as x of y qualified videos.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <HomeLink
          href="/research-capability"
          title="Starter-video catalog"
          body="Search, filter, and open finished or remaining videos."
        />
        <HomeLink
          href="/research-capability/taxonomy"
          title="Taxonomy divisions"
          body="Engineering categories, application domains, form, and difficulty."
        />
        <HomeLink
          href="/research-capability/tables/pipeline-runs"
          title="Research tables"
          body="Browse applied and orchestration tables with simple search."
        />
      </div>
      <div>
        <p className="mb-3 text-xs uppercase tracking-[0.16em] text-muted-foreground">
          Exposable tables
        </p>
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
          {RESEARCH_TABLE_DEFINITIONS.map((table) => (
            <Link
              key={table.tableKey}
              href={`/research-capability/tables/${table.tableKey}`}
              className="hover:text-foreground"
            >
              {table.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function HomeLink({
  href,
  title,
  body,
}: {
  href: string;
  title: string;
  body: string;
}) {
  return (
    <Link href={href} className="rounded-xl border border-border p-5 hover:bg-muted/40">
      <h2 className="text-lg font-medium">{title}</h2>
      <p className="mt-2 text-sm text-muted-foreground">{body}</p>
    </Link>
  );
}
