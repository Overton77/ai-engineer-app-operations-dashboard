import { redirect } from "next/navigation";
import { videoShowcasePath } from "@/features/research-capability/lib/library-paths";

export default async function LibraryShareReportPage({
  params,
}: PageProps<"/research-capability/library/[categoryCode]/[videoId]">) {
  const { videoId } = await params;
  redirect(videoShowcasePath(videoId));
}
