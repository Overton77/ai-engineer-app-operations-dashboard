import { LibraryShareReport } from "@/features/research-capability/components/library-share-report";

export default async function LibraryShareReportPage({
  params,
}: PageProps<"/research-capability/library/[categoryCode]/[videoId]">) {
  const { categoryCode, videoId } = await params;
  return <LibraryShareReport categoryCode={categoryCode} videoId={videoId} />;
}
