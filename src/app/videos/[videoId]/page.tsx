import { PreResearchShowcase } from "@/features/research-capability/components/pre-research-showcase";

export default async function VideoShowcasePage({
  params,
}: PageProps<"/videos/[videoId]">) {
  const { videoId } = await params;
  return <PreResearchShowcase videoId={videoId} />;
}
