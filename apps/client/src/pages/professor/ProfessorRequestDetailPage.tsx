import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { InfoPanel, SwapRequestCard } from "../../components/shared";
import { LABELS } from "../../constants";
import { useSwapRequests } from "../../hooks";

export function ProfessorRequestDetailPage() {
  const params = useParams<{ requestId: string }>();
  const { data } = useSwapRequests();

  const request = useMemo(
    () => data?.find((item) => item.id === params.requestId),
    [data, params.requestId],
  );

  if (!request) {
    return <p className="text-sm text-slate-500">{LABELS.common.noResults}</p>;
  }

  return (
    <section className="grid gap-4">
      <SwapRequestCard request={request} />
      <InfoPanel
        content={request.reason ?? "-"}
        description={LABELS.pages.professorRequests}
        title={LABELS.common.details}
      />
    </section>
  );
}
