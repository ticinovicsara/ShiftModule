import { SwapRequestCard } from "../../components/shared";
import { LABELS } from "../../constants";
import { useSwapRequests } from "../../hooks";

export function StudentRequestsPage() {
  const { data, loading, error } = useSwapRequests();

  if (loading) {
    return <p className="text-sm text-slate-500">{LABELS.common.loading}</p>;
  }

  if (error) {
    return <p className="text-sm text-danger">{error}</p>;
  }

  return (
    <section className="grid gap-4">
      {(data ?? []).map((request) => (
        <SwapRequestCard compact key={request.id} request={request} />
      ))}
    </section>
  );
}
