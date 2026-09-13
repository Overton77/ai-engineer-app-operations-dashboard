const SECTIONS = [
  { id: "overview", label: "Overview" },
  { id: "summary", label: "Summary" },
  { id: "taxonomy", label: "Taxonomy" },
  { id: "organizations", label: "Organizations" },
  { id: "technologies", label: "Technologies" },
  { id: "curriculum", label: "Curriculum" },
  { id: "sources", label: "Sources" },
] as const;

export const SHOWCASE_SECTION_COUNT = SECTIONS.length;

export function ShowcaseRailNav() {
  return (
    <nav
      aria-label="In this report"
      className="hidden lg:sticky lg:top-8 lg:flex lg:flex-col lg:gap-2"
    >
      <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
        In this report
      </p>
      <SectionLinks className="text-sm text-muted-foreground hover:text-foreground" />
    </nav>
  );
}

export function ShowcaseBarNav() {
  return (
    <nav
      aria-label="In this report"
      className="flex gap-3 overflow-x-auto pb-1 text-sm text-muted-foreground lg:hidden"
    >
      <SectionLinks className="whitespace-nowrap hover:text-foreground" />
    </nav>
  );
}

function SectionLinks({ className }: { className: string }) {
  return SECTIONS.map((section) => (
    <a key={section.id} href={`#${section.id}`} className={className}>
      {section.label}
    </a>
  ));
}
