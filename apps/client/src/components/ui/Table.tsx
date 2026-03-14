import { clsx } from "clsx";
import type { ReactNode } from "react";

export interface TableColumn<RowData> {
  id: string;
  header: ReactNode;
  cell: (row: RowData) => ReactNode;
  className?: string;
}

export interface TableProps<RowData> {
  columns: TableColumn<RowData>[];
  rows: RowData[];
  rowKey: (row: RowData) => string;
  emptyTitle?: string;
  emptyDescription?: string;
}

export function Table<RowData>({
  columns,
  emptyDescription = "Nothing to display yet.",
  emptyTitle = "No rows",
  rowKey,
  rows,
}: TableProps<RowData>) {
  if (!rows.length) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center shadow-soft">
        <h3 className="text-lg font-bold text-slate-900">{emptyTitle}</h3>
        <p className="mt-2 text-sm text-slate-500">{emptyDescription}</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft">
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-left text-sm">
          <thead className="bg-slate-50">
            <tr>
              {columns.map((column) => (
                <th
                  className="px-5 py-4 text-xs font-bold uppercase tracking-[0.16em] text-slate-500"
                  key={column.id}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr className="border-t border-slate-100" key={rowKey(row)}>
                {columns.map((column) => (
                  <td
                    className={clsx(
                      "px-5 py-4 align-middle text-slate-700",
                      column.className,
                    )}
                    key={column.id}
                  >
                    {column.cell(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
