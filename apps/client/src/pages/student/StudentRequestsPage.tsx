import { SwapRequestStatus } from "@repo/types";
import { SwapRequestCard } from "../../components/shared";
import { Button } from "../../components/ui";
import { LABELS } from "../../constants";
import { useSwapRequests } from "../../hooks";

export function StudentRequestsPage() {
  const { data, loading, error, confirmPartner, refetch } = useSwapRequests();

  if (loading) {
    return <p className="text-sm text-slate-500">{LABELS.common.loading}</p>;
  }

  if (error) {
    return <p className="text-sm text-danger">{error}</p>;
  }

  const requests = data ?? [];

  if (!requests.length) {
    return <p className="text-sm text-slate-500">{LABELS.common.noResults}</p>;
  }

  return (
    <section className="grid gap-4">
      {requests.map((request) => (
        <div className="grid gap-2" key={request.id}>
          <SwapRequestCard compact request={request} />
          {request.isIncomingPartnerRequest &&
          request.status === SwapRequestStatus.PENDING &&
          !request.partnerConfirmed ? (
            <Button
              onClick={async () => {
                await confirmPartner(request.id);
                await refetch();
              }}
              size="sm"
            >
              Potvrdi zamjenu s partnerom
            </Button>
          ) : null}
        </div>
      ))}
    </section>
  );
}
