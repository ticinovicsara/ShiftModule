import { Badge, Table } from "../ui";

export interface ImportPreviewRow {
  id: string;
  rowNumber: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  valid: boolean;
  error?: string;
}

export interface ImportPreviewTableProps {
  rows: ImportPreviewRow[];
}

export function ImportPreviewTable({ rows }: ImportPreviewTableProps) {
  const validCount = rows.filter((row) => row.valid).length;
  const invalidCount = rows.length - validCount;

  return (
    <section className="grid gap-3">
      <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
        <Badge variant="neutral">Ukupno: {rows.length}</Badge>
        <Badge variant="approved">Ispravno: {validCount}</Badge>
        <Badge variant="rejected">Neispravno: {invalidCount}</Badge>
      </div>
      <Table
        columns={[
          {
            id: "row",
            header: "Red",
            cell: (row) => row.rowNumber,
            className: "w-16 font-semibold text-slate-500",
          },
          {
            id: "student",
            header: "Student",
            cell: (row) => (
              <div className="grid gap-0.5">
                <p className="font-semibold text-slate-900">
                  {row.firstName} {row.lastName}
                </p>
                <p className="text-xs text-slate-500">{row.email}</p>
              </div>
            ),
          },
          {
            id: "role",
            header: "Uloga",
            cell: (row) => row.role,
            className: "text-xs font-semibold uppercase tracking-[0.08em]",
          },
          {
            id: "status",
            header: "Status",
            cell: (row) =>
              row.valid ? (
                <Badge variant="approved">Validno</Badge>
              ) : (
                <div className="grid gap-1">
                  <Badge variant="rejected">Nevalidno</Badge>
                  {row.error ? (
                    <p className="max-w-xs text-xs text-red-600">{row.error}</p>
                  ) : null}
                </div>
              ),
            className: "w-52",
          },
        ]}
        emptyDescription="Unesi JSON studenata da vidiš pregled prije uvoza."
        emptyTitle="Nema podataka za pregled"
        rowKey={(row) => row.id}
        rows={rows}
      />
    </section>
  );
}
