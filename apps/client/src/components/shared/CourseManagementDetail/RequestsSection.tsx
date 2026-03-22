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
}

export function RequestsSection({
  activeRequestTab,
  setActiveRequestTab,
  courseRequests,
  actionId,
  onApprove,
  onReject,
}: RequestsSectionProps) {
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
      {!courseRequests.length ? (
        <EmptyState
          description="Nema zahtjeva za odabrani filter."
          title={LABELS.common.noResults}
        />
      ) : (
        courseRequests.map((request) => (
          <div className="grid gap-0" key={request.id}>
            <SwapRequestCard request={request} />
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
