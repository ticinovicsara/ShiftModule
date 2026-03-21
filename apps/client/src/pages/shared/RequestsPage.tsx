import { SwapRequestStatus, UserRole } from "@repo/types";
import { useContext, useState } from "react";
import { FilterTabs, SwapRequestCard } from "../../components/shared";
import {
  Button,
  EmptyState,
  ErrorState,
  Modal,
  Spinner,
} from "../../components/ui";
import { LABELS } from "../../constants";
import { AuthContext } from "../../context/AuthContext";
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
  rejectReason?: string;
  tabs?: { label: string; value: string }[];
}

type PendingAction = {
  requestId: string;
  action: "approve" | "reject";
};

const REJECT_REASON_BY_ROLE: Partial<Record<UserRole, string>> = {
  [UserRole.ADMIN]: "Odbijeno od admina",
  [UserRole.PROFESSOR]: "Odbijeno od profesora",
};

export function RequestsPage({
  rejectReason,
  tabs = defaultTabs,
}: RequestsPageProps) {
  const auth = useContext(AuthContext);
  const { data, loading, error, approve, reject, refetch } = useSwapRequests();
  const { data: courses } = useCourses();
  const [activeTab, setActiveTab] = useState("all");
  const [actionId, setActionId] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(
    null,
  );

  const resolvedRejectReason =
    rejectReason ??
    (auth?.user ? REJECT_REASON_BY_ROLE[auth.user.role] : undefined) ??
    "Odbijeno";

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
      await reject({ id: requestId, dto: { reason: resolvedRejectReason } });
      await refetch();
    } finally {
      setActionId(null);
    }
  };

  const closeConfirmationModal = () => {
    if (actionId) {
      return;
    }
    setPendingAction(null);
  };

  const confirmPendingAction = async () => {
    if (!pendingAction) {
      return;
    }

    if (pendingAction.action === "approve") {
      await handleApprove(pendingAction.requestId);
    } else {
      await handleReject(pendingAction.requestId);
    }

    setPendingAction(null);
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
          <div className="grid gap-0" key={request.id}>
            <SwapRequestCard request={request} />
            {request.status === SwapRequestStatus.PENDING ? (
              <div className="flex flex-wrap gap-2 p-2">
                <Button
                  disabled={actionId === request.id}
                  onClick={() =>
                    setPendingAction({
                      requestId: request.id,
                      action: "approve",
                    })
                  }
                  size="sm"
                  variant="success"
                >
                  Prihvati
                </Button>
                <Button
                  disabled={actionId === request.id}
                  onClick={() =>
                    setPendingAction({
                      requestId: request.id,
                      action: "reject",
                    })
                  }
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
      <Modal
        description="Jeste li sigurni"
        footer={
          <div className="flex justify-end gap-2">
            <Button
              disabled={Boolean(actionId)}
              onClick={closeConfirmationModal}
              variant="ghost"
            >
              Odustani
            </Button>
            <Button
              disabled={Boolean(actionId)}
              onClick={confirmPendingAction}
              variant={
                pendingAction?.action === "reject" ? "danger" : "success"
              }
            >
              Potvrdi
            </Button>
          </div>
        }
        onClose={closeConfirmationModal}
        open={Boolean(pendingAction)}
        title="Potvrda"
      >
        <p className="text-sm text-slate-600">Jeste li sigurni</p>
      </Modal>
    </section>
  );
}
