import { StudentSwapViewState } from "@repo/types";
import { useMemo, useState } from "react";
import { SwapRequestCard } from "../../components/shared";
import { Button, EmptyState } from "../../components/ui";
import { LABELS } from "../../constants";
import { useSwapRequests } from "../../hooks";
import toast from "react-hot-toast";

export function StudentNotificationsPage() {
  const { data, loading, error, refetch, confirmPartner, declinePartner } =
    useSwapRequests();
  const [actionId, setActionId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"incoming" | "outgoing">(
    "incoming",
  );

  const incomingRequests = useMemo(
    () =>
      (data ?? []).filter(
        (request) =>
          request.studentViewState ===
          StudentSwapViewState.INCOMING_PARTNER_CONFIRMATION,
      ),
    [data],
  );

  const outgoingRequests = useMemo(
    () =>
      (data ?? []).filter(
        (request) =>
          request.studentViewState !==
          StudentSwapViewState.INCOMING_PARTNER_CONFIRMATION,
      ),
    [data],
  );

  const visibleRequests =
    activeTab === "incoming" ? incomingRequests : outgoingRequests;

  const handleConfirm = async (requestId: string) => {
    setActionId(requestId);
    try {
      await confirmPartner(requestId);
      await refetch();
      toast.success("Zahtjev je potvrden");
    } catch (actionError) {
      const message =
        actionError instanceof Error
          ? actionError.message
          : "Potvrda nije uspjela";
      toast.error(message);
    } finally {
      setActionId(null);
    }
  };

  const handleDecline = async (requestId: string) => {
    setActionId(requestId);
    try {
      await declinePartner(requestId);
      await refetch();
      toast.success("Zahtjev je odbijen");
    } catch (actionError) {
      const message =
        actionError instanceof Error
          ? actionError.message
          : "Odbijanje nije uspjelo";
      toast.error(message);
    } finally {
      setActionId(null);
    }
  };

  if (loading) {
    return <p className="text-sm text-slate-500">{LABELS.common.loading}</p>;
  }

  if (error) {
    return <p className="text-sm text-danger">{error}</p>;
  }

  return (
    <section className="grid gap-4">
      <div className="flex flex-wrap gap-2">
        <Button
          onClick={() => setActiveTab("incoming")}
          size="sm"
          variant={activeTab === "incoming" ? "primary" : "outline"}
        >
          Primljeno ({incomingRequests.length})
        </Button>
        <Button
          onClick={() => setActiveTab("outgoing")}
          size="sm"
          variant={activeTab === "outgoing" ? "primary" : "outline"}
        >
          Poslano ({outgoingRequests.length})
        </Button>
      </div>

      {activeTab === "incoming" ? (
        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">
          Imate {incomingRequests.length} zahtjeva kolega za potvrdu partner
          zamjene.
        </div>
      ) : null}

      {activeTab === "outgoing" ? (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
          Pregled vaših poslanih zahtjeva i njihovih trenutnih statusa.
        </div>
      ) : null}

      {!visibleRequests.length ? (
        <EmptyState
          title={
            activeTab === "incoming"
              ? "Nema novih obavijesti"
              : "Nema poslanih zahtjeva"
          }
          description={
            activeTab === "incoming"
              ? "Trenutno nemate zahtjeva kolega koje trebate potvrditi ili odbiti."
              : "Još nemate poslanih zahtjeva za zamjenu."
          }
        />
      ) : (
        visibleRequests.map((request) => (
          <article className="grid gap-2" key={request.id}>
            <SwapRequestCard request={request} />
            {activeTab === "incoming" ? (
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  onClick={() => handleConfirm(request.id)}
                  disabled={actionId === request.id}
                  variant="success"
                >
                  Potvrdi
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleDecline(request.id)}
                  disabled={actionId === request.id}
                  variant="danger"
                >
                  Odbij
                </Button>
              </div>
            ) : null}
          </article>
        ))
      )}
    </section>
  );
}
