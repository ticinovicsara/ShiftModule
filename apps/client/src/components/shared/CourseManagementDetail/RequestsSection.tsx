import {
  CourseManagementRequestTab,
  SwapRequestStatus,
  type SwapRequest,
} from "@repo/types";
import { LABELS, REQUEST_TABS } from "../../../constants";
import { Button, EmptyState } from "../../ui";
import { FilterTabs } from "../FilterTabs";
import { SwapRequestCard } from "../SwapRequestCard";
import type { CourseRequestTab } from "../../../types";

interface RequestsSectionProps {
  activeRequestTab: CourseRequestTab;
  setActiveRequestTab: (value: CourseRequestTab) => void;
  courseRequests: SwapRequest[];
  actionId: string | null;
  onApprove: (requestId: string) => Promise<void>;
  onReject: (requestId: string) => Promise<void>;
  onApproveAllPending?: () => Promise<void>;
  onRejectAllPending?: () => Promise<void>;
  showPriorityInfo?: boolean;
  showSatisfactionInfo?: boolean;
}

export function RequestsSection({
  activeRequestTab,
  setActiveRequestTab,
  courseRequests,
  actionId,
  onApprove,
  onReject,
  onApproveAllPending,
  onRejectAllPending,
  showPriorityInfo = false,
  showSatisfactionInfo = false,
}: RequestsSectionProps) {
  const pendingCount = courseRequests.filter(
    (request) => request.status === SwapRequestStatus.PENDING,
  ).length;

  return (
    <section className="grid gap-4">
      <FilterTabs
        activeValue={activeRequestTab}
        onChange={(value) =>
          setActiveRequestTab(value as CourseManagementRequestTab)
        }
        tabs={REQUEST_TABS.map((tab) => ({
          label: tab.label,
          value: tab.value,
        }))}
      />
      {onApproveAllPending && onRejectAllPending ? (
        <div className="flex flex-wrap gap-2">
          <Button
            disabled={pendingCount === 0 || Boolean(actionId)}
            onClick={() => void onApproveAllPending()}
            size="sm"
            variant="success"
          >
            Prihvati sve na čekanju ({pendingCount})
          </Button>
          <Button
            disabled={pendingCount === 0 || Boolean(actionId)}
            onClick={() => void onRejectAllPending()}
            size="sm"
            variant="danger"
          >
            Odbij sve na čekanju ({pendingCount})
          </Button>
        </div>
      ) : null}

      {!courseRequests.length ? (
        <EmptyState
          description="Nema zahtjeva za odabrani filter."
          title={LABELS.common.noResults}
        />
      ) : (
        courseRequests.map((request) => (
          <div className="grid gap-0" key={request.id}>
            <SwapRequestCard
              request={request}
              showPriorityInfo={showPriorityInfo}
              showSatisfactionInfo={showSatisfactionInfo}
            />
            {request.status === SwapRequestStatus.PENDING ? (
              <div className="flex flex-wrap gap-2 rounded-b-lg border border-slate-200 border-t-0 bg-white px-4 py-3">
                <Button
                  disabled={actionId === request.id}
                  onClick={() => void onApprove(request.id)}
                  size="sm"
                  variant="success"
                >
                  Prihvati
                </Button>
                <Button
                  disabled={actionId === request.id}
                  onClick={() => void onReject(request.id)}
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
