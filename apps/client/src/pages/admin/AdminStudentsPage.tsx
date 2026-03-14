import { Table } from "../../components/ui";
import { LABELS } from "../../constants";
import { useStudents } from "../../hooks";

export function AdminStudentsPage() {
  const { data, loading, error } = useStudents();

  if (loading) {
    return <p className="text-sm text-slate-500">{LABELS.common.loading}</p>;
  }

  if (error) {
    return <p className="text-sm text-danger">{error}</p>;
  }

  return (
    <Table
      columns={[
        {
          id: "name",
          header: LABELS.nav.students,
          cell: (row) => `${row.firstName} ${row.lastName}`,
        },
        { id: "email", header: LABELS.auth.email, cell: (row) => row.email },
      ]}
      rowKey={(row) => row.id}
      rows={data ?? []}
    />
  );
}
