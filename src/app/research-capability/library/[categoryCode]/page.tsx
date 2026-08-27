import { LibraryCategoryVideos } from "@/features/research-capability/components/library-category-videos";

export default async function LibraryCategoryPage({
  params,
}: PageProps<"/research-capability/library/[categoryCode]">) {
  const { categoryCode } = await params;
  return <LibraryCategoryVideos categoryCode={categoryCode} />;
}
