import { AppliedOutputsWorkspace } from "@/features/research-capability/components/applied-outputs-workspace";

export default async function StarterVideoAnchorPage({
  params,
}: PageProps<"/research-capability/videos/[videoId]">) {
  const { videoId } = await params;
  return <AppliedOutputsWorkspace videoId={videoId} />;
}
