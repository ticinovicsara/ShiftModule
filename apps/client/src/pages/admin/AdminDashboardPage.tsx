import { MetricCard } from "../../components/shared";
import { ErrorState, Spinner } from "../../components/ui";
import { LABELS } from "../../constants";
import { useDashboardStats } from "../../hooks";

export function AdminDashboardPage() {
  const { metrics, loading, error } = useDashboardStats();

  if (loading) {
    return <Spinner />;
  }

  if (error) {
    return <ErrorState title={LABELS.common.retry} description={error} />;
  }

  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <MetricCard
        title={LABELS.nav.students}
        value={String(metrics[0].value)}
      />
      <MetricCard title={LABELS.nav.courses} value={String(metrics[1].value)} />
      <MetricCard title={LABELS.nav.groups} value={String(metrics[2].value)} />
      <MetricCard
        title={LABELS.nav.requests}
        value={String(metrics[3].value)}
      />
    </section>
  );
}
