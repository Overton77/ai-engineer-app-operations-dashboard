"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { RESEARCH_TABLE_DEFINITIONS } from "../research-table-definitions";
import { useResearchTableRows } from "../hooks/use-research-table-rows";

const PREVIEW_COLUMNS = 6;

export function ResearchTableBrowser({
  tableKey,
  videoId,
}: {
  tableKey: string;
  videoId?: string;
}) {
  const definition = RESEARCH_TABLE_DEFINITIONS.find((item) => item.tableKey === tableKey);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useResearchTableRows({
    tableKey,
    q: q || undefined,
    videoId,
    page,
  });

  if (!definition) {
    return <p className="text-sm text-destructive">Unknown research table.</p>;
  }

  const columns = data?.rows[0] ? Object.keys(data.rows[0]).slice(0, PREVIEW_COLUMNS) : [];
  const pageCount = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
          Applied / orchestration table
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">{definition.label}</h1>
        <p className="mt-2 font-mono text-sm text-muted-foreground">{definition.postgresTable}</p>
      </div>
      <Input
        value={q}
        onChange={(event) => {
          setPage(1);
          setQ(event.target.value);
        }}
        placeholder={`Search ${definition.searchColumns.join(", ")}`}
      />
      {isLoading ? <Skeleton className="h-[420px] w-full" /> : null}
      {error ? <p className="text-sm text-destructive">Could not load table rows.</p> : null}
      {data ? (
        <>
          <p className="text-sm text-muted-foreground">{data.total} rows</p>
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((column) => (
                  <TableHead key={column}>{column}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.rows.map((row, index) => (
                <TableRow key={index}>
                  {columns.map((column) => (
                    <TableCell key={column} className="max-w-[18rem] truncate align-top text-sm">
                      {formatCell(row[column])}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="flex justify-end gap-2">
            <Button variant="outline" disabled={page <= 1} onClick={() => setPage((current) => current - 1)}>
              Previous
            </Button>
            <Button
              variant="outline"
              disabled={page >= pageCount}
              onClick={() => setPage((current) => current + 1)}
            >
              Next
            </Button>
          </div>
        </>
      ) : null}
    </div>
  );
}

function formatCell(value: unknown): string {
  if (value == null) return "—";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return JSON.stringify(value);
}
