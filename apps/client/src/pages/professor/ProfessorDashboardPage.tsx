import { MetricCard } from "../../components/shared";
import { ErrorState, Spinner } from "../../components/ui";
import { LABELS } from "../../constants";
import { useProfessorDashboardStats } from "../../hooks";

export function ProfessorDashboardPage() {
  const { metrics, loading, error } = useProfessorDashboardStats();

  if (loading) {
    return <Spinner />;
  }

  if (error) {
    return <ErrorState title={LABELS.common.retry} description={error} />;
  }

  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <MetricCard
        title={LABELS.nav.myCourses}
        value={String(metrics[0].value)}
      />
      <MetricCard
        title={LABELS.nav.students}
        value={String(metrics[1].value)}
      />
      <MetricCard
        title="Zahtjevi na čekanju"
        value={String(metrics[2].value)}
      />
    </section>
  );
}
