import { redirect } from "next/navigation";
import { videoShowcasePath } from "@/features/research-capability/lib/library-paths";

export default async function StarterVideoAnchorPage({
  params,
}: PageProps<"/research-capability/videos/[videoId]">) {
  const { videoId } = await params;
  redirect(videoShowcasePath(videoId));
}
