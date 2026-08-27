export function jsonData<T>(data: T, init?: ResponseInit) {
  return Response.json({ ok: true, data }, init);
}

export function jsonError(error: string, status = 400) {
  return Response.json({ ok: false, error }, { status });
}

export function readSearchParam(
  searchParams: URLSearchParams,
  key: string,
): string | undefined {
  const value = searchParams.get(key);
  return value && value.length > 0 ? value : undefined;
}

export function readPage(searchParams: URLSearchParams) {
  const page = Math.max(1, Number(searchParams.get("page") ?? "1") || 1);
  const pageSize = Math.min(
    100,
    Math.max(10, Number(searchParams.get("pageSize") ?? "40") || 40),
  );
  return { page, pageSize };
}
