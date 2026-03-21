import { SwapRequestStatus } from "@repo/types";
import { useState } from "react";
import { FilterTabs, SwapRequestCard } from "../../components/shared";
import { Button, EmptyState, ErrorState, Spinner } from "../../components/ui";
import { LABELS } from "../../constants";
import {
  useCourses,
  useRequestDisplayData,
  useSwapRequests,
} from "../../hooks";

const defaultTabs = [
  { label: "Svi", value: "all" },
  { label: "Na čekanju", value: "manual" },
  { label: "Automatski zahtjevi", value: "automatic" },
  { label: "Odobreni", value: "approved" },
  { label: "Odbijeni", value: "rejected" },
];

interface RequestsPageProps {
  rejectReason: string;
  tabs?: { label: string; value: string }[];
}

export function RequestsPage({
  rejectReason,
  tabs = defaultTabs,
}: RequestsPageProps) {
  const { data, loading, error, approve, reject, refetch } = useSwapRequests();
  const { data: courses } = useCourses();
  const [activeTab, setActiveTab] = useState("all");
  const [actionId, setActionId] = useState<string | null>(null);

  const { cardRequests, hasMissingDisplayData, usersLoading, usersError } =
    useRequestDisplayData({
      activeTab,
      requests: data ?? undefined,
      courses: courses ?? undefined,
    });

  const handleApprove = async (requestId: string) => {
    setActionId(requestId);
    try {
      await approve(requestId);
      await refetch();
    } finally {
      setActionId(null);
    }
  };

  const handleReject = async (requestId: string) => {
    setActionId(requestId);
    try {
      await reject({ id: requestId, dto: { reason: rejectReason } });
      await refetch();
    } finally {
      setActionId(null);
    }
  };

  if (loading || usersLoading) return <Spinner />;

  if (error || usersError) {
    return (
      <ErrorState
        description={error ?? "Neuspjelo ucitavanje korisnickih podataka."}
        title={LABELS.common.retry}
      />
    );
  }

  if (hasMissingDisplayData) {
    return (
      <ErrorState
        description="Nedostaju nazivi kolegija ili grupa za prikaz zahtjeva."
        title={LABELS.common.retry}
      />
    );
  }

  return (
    <section className="grid gap-4">
      <FilterTabs activeValue={activeTab} onChange={setActiveTab} tabs={tabs} />
      {!cardRequests.length ? (
        <EmptyState
          description="Nema zahtjeva za odabrani filter."
          title={LABELS.common.noResults}
        />
      ) : (
        cardRequests.map((request) => (
          <div className="grid gap-2" key={request.id}>
            <SwapRequestCard request={request} />
            {request.status !== SwapRequestStatus.AUTO_RESOLVED ? (
              <div className="flex flex-wrap gap-2 p-2">
                <Button
                  disabled={
                    actionId === request.id ||
                    request.status !== SwapRequestStatus.PENDING
                  }
                  onClick={() => handleApprove(request.id)}
                  size="sm"
                  variant="success"
                >
                  Prihvati
                </Button>
                <Button
                  disabled={
                    actionId === request.id ||
                    request.status !== SwapRequestStatus.PENDING
                  }
                  onClick={() => handleReject(request.id)}
                  size="sm"
                  variant="danger"
                >
                  Odbij
                </Button>
              </div>
            ) : null}
          </div>
        ))
      )}
    </section>
  );
}
