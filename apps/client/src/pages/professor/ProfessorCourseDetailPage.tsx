import { useParams } from "react-router-dom";
import { FilterTabs, SwapRequestCard } from "../../components/shared";
import { LABELS } from "../../constants";
import { useSwapRequests } from "../../hooks";

export function ProfessorCourseDetailPage() {
  const params = useParams<{ id: string }>();
  const { data } = useSwapRequests();

  const requests = (data ?? []).filter(
    (request) => request.courseId === params.id,
  );

  return (
    <section className="grid gap-4">
      <FilterTabs
        activeValue="all"
        onChange={() => undefined}
        tabs={[{ label: LABELS.nav.requests, value: "all" }]}
      />
      {requests.map((request) => (
        <SwapRequestCard key={request.id} request={request} />
      ))}
    </section>
  );
}
