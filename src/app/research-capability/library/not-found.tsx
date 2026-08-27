import { LibraryNotFound } from "@/features/research-capability/components/library-not-found";

export default function LibrarySegmentNotFound() {
  return (
    <LibraryNotFound
      title="Not in the library"
      body="This category or report is not available. The library only shows finished applied talks under their current primary category."
    />
  );
}
