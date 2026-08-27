import { ResearchTableBrowser } from "@/features/research-capability/components/research-table-browser";

export default async function ResearchTablePage({
  params,
  searchParams,
}: PageProps<"/research-capability/tables/[tableKey]">) {
  const { tableKey } = await params;
  const query = await searchParams;
  const videoId = typeof query.videoId === "string" ? query.videoId : undefined;
  return <ResearchTableBrowser tableKey={tableKey} videoId={videoId} />;
}
