import Link from "next/link";

export function LibraryNotFound({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
        Pre-research library
      </p>
      <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
      <p className="max-w-xl text-muted-foreground">{body}</p>
      <Link href="/research-capability/library" className="text-sm hover:underline">
        Back to the library
      </Link>
    </div>
  );
}
