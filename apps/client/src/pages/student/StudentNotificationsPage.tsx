import { StudentSwapViewState, SwapRequestStatus } from "@repo/types";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SwapRequestCard } from "../../components/shared";
import { Button, EmptyState } from "../../components/ui";
import { LABELS, ROUTE_PATHS } from "../../constants";
import { AuthContext } from "../../context/AuthContext";
import { useRequestDisplayData, useSwapRequests } from "../../hooks";
import toast from "react-hot-toast";
import { useContext } from "react";

export function StudentNotificationsPage() {
  const navigate = useNavigate();
  const auth = useContext(AuthContext);
  if (!auth) {
    throw new Error(
      "StudentNotificationsPage must be used within AuthProvider",
    );
  }

  const { user } = auth;
  const {
    data,
    loading,
    error,
    refetch,
    confirmPartner,
    declinePartner,
    cancel,
  } = useSwapRequests();
  const [actionId, setActionId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "incoming" | "outgoing" | "finished"
  >("incoming");

  useEffect(() => {
    void refetch();

    const refetchOnFocus = () => {
      void refetch();
    };

    const refetchOnVisible = () => {
      if (document.visibilityState === "visible") {
        void refetch();
      }
    };

    window.addEventListener("focus", refetchOnFocus);
    document.addEventListener("visibilitychange", refetchOnVisible);

    return () => {
      window.removeEventListener("focus", refetchOnFocus);
      document.removeEventListener("visibilitychange", refetchOnVisible);
    };
  }, [refetch]);

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

  const finishedRequests = useMemo(
    () =>
      (data ?? []).filter(
        (request) =>
          request.status === SwapRequestStatus.APPROVED ||
          request.status === SwapRequestStatus.REJECTED ||
          request.status === SwapRequestStatus.AUTO_RESOLVED,
      ),
    [data],
  );

  const visibleRequests =
    activeTab === "incoming"
      ? incomingRequests
      : activeTab === "outgoing"
        ? outgoingRequests
        : finishedRequests;

  const { cardRequests } = useRequestDisplayData({
    activeTab: "all",
    requests: visibleRequests,
  });

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

  const handleCancel = async (requestId: string) => {
    setActionId(requestId);
    try {
      await cancel(requestId);
      await refetch();
      toast.success("Zahtjev je obrisan");
    } catch (actionError) {
      const message =
        actionError instanceof Error
          ? actionError.message
          : "Brisanje zahtjeva nije uspjelo";
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
        <Button
          onClick={() => setActiveTab("finished")}
          size="sm"
          variant={activeTab === "finished" ? "primary" : "outline"}
        >
          Završeno ({finishedRequests.length})
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

      {activeTab === "finished" ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
          Pregled svih završenih zahtjeva (odobreni, odbijeni i automatski
          riješeni).
        </div>
      ) : null}

      {!visibleRequests.length ? (
        <EmptyState
          title={
            activeTab === "incoming"
              ? "Nema novih obavijesti"
              : activeTab === "outgoing"
                ? "Nema poslanih zahtjeva"
                : "Nema završenih zahtjeva"
          }
          description={
            activeTab === "incoming"
              ? "Trenutno nemate zahtjeva kolega koje trebate potvrditi ili odbiti."
              : activeTab === "outgoing"
                ? "Još nemate poslanih zahtjeva za zamjenu."
                : "Kad zahtjev bude odobren, odbijen ili automatski riješen, prikazat će se ovdje."
          }
        />
      ) : (
        cardRequests.map((request) => (
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
            {activeTab === "outgoing" &&
            request.studentId === user?.id &&
            (request.status === SwapRequestStatus.PENDING ||
              request.status === SwapRequestStatus.WAITING_FOR_MATCH) ? (
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  onClick={() =>
                    navigate(ROUTE_PATHS.student.swapStep1(request.courseId), {
                      state: {
                        editRequestId: request.id,
                        selectedSessionTypeId: request.sessionTypeId,
                        selectedGroupId: request.desiredGroupId,
                        reason: request.reason,
                        partnerEmail: request.partnerEmail,
                      },
                    })
                  }
                  disabled={actionId === request.id}
                  variant="outline"
                >
                  Uredi zahtjev
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleCancel(request.id)}
                  disabled={actionId === request.id}
                  variant="danger"
                >
                  Obriši zahtjev
                </Button>
              </div>
            ) : null}
          </article>
        ))
      )}
    </section>
  );
}
