import type { LucideIcon } from "lucide-react";
import {
  AudioLines,
  Bot,
  Boxes,
  Cloud,
  Container,
  Cpu,
  Database,
  FlaskConical,
  GitBranch,
  Layers,
  Library,
  MessageSquare,
  MousePointer2,
  Server,
  Shield,
  Sparkles,
  Timer,
  Triangle,
  Workflow,
  Wrench,
} from "lucide-react";

const ORG_TECH_ICONS: Record<string, LucideIcon> = {
  openai: Sparkles,
  anthropic: Sparkles,
  claude: Sparkles,
  google: Cloud,
  deepmind: Cloud,
  googledeepmind: Cloud,
  meta: Boxes,
  facebook: Boxes,
  microsoft: Cloud,
  langchain: Layers,
  huggingface: Library,
  aws: Cloud,
  amazon: Cloud,
  amazonwebservices: Cloud,
  nvidia: Cpu,
  cursor: MousePointer2,
  vercel: Triangle,
  temporal: Timer,
  cohere: Sparkles,
  mistral: Sparkles,
  together: Cloud,
  groq: Cpu,
  fireworks: Sparkles,
  pinecone: Database,
  weaviate: Database,
  qdrant: Database,
  supabase: Database,
  cloudflare: Cloud,
  databricks: Database,
  snowflake: Database,
  github: GitBranch,
  docker: Container,
  kubernetes: Container,
};

const CATEGORY_ICON_MATCHES: Array<{ match: string; icon: LucideIcon }> = [
  { match: "agent", icon: Bot },
  { match: "eval", icon: FlaskConical },
  { match: "rag", icon: Library },
  { match: "retriev", icon: Library },
  { match: "infra", icon: Server },
  { match: "platform", icon: Server },
  { match: "model", icon: Cpu },
  { match: "train", icon: Cpu },
  { match: "tool", icon: Wrench },
  { match: "product", icon: Boxes },
  { match: "safety", icon: Shield },
  { match: "data", icon: Database },
  { match: "orchestr", icon: Workflow },
  { match: "prompt", icon: MessageSquare },
  { match: "voice", icon: AudioLines },
  { match: "speech", icon: AudioLines },
];

export function iconForTechnology(name: string | null | undefined): LucideIcon {
  return lookupNamedIcon(name) ?? Cpu;
}

export function iconForCategory(codeOrLabel: string | null | undefined): LucideIcon {
  if (!codeOrLabel) return Layers;
  const key = normalizeKey(codeOrLabel);
  const matched = CATEGORY_ICON_MATCHES.find(({ match }) => key.includes(match));
  return matched?.icon ?? Layers;
}

export function OrgMark({ name }: { name: string }) {
  const Icon = lookupNamedIcon(name);
  if (Icon) {
    return <Icon className="size-3.5 shrink-0" aria-hidden />;
  }
  return (
    <span
      aria-hidden
      className="inline-flex size-3.5 shrink-0 items-center justify-center rounded-[2px] border border-border font-mono text-[8px] leading-none text-muted-foreground"
    >
      {twoLetterGlyph(name)}
    </span>
  );
}

function lookupNamedIcon(name: string | null | undefined): LucideIcon | undefined {
  if (!name) return undefined;
  return ORG_TECH_ICONS[normalizeKey(name)];
}

function normalizeKey(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function twoLetterGlyph(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  const first = words[0]?.[0] ?? "";
  const second = words[1]?.[0];
  if (second) return `${first}${second}`.toUpperCase();
  return name.slice(0, 2).toUpperCase() || "—";
}
