import Link from "next/link";

export function LibraryNotFound({
  title = "This talk is not in the finished pre-research library.",
  body,
}: {
  title?: string;
  body?: string;
}) {
  return (
    <div className="flex flex-col gap-3">
      <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
      {body ? <p className="max-w-xl text-muted-foreground">{body}</p> : null}
      <Link href="/" className="text-sm hover:underline">
        Back to talks
      </Link>
    </div>
  );
}
