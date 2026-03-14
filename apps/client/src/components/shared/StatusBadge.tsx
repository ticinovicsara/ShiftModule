import { SwapRequestStatus } from "@repo/types";
import { LABELS } from "../../constants";
import { Badge } from "../ui";

export interface StatusBadgeProps {
  status: SwapRequestStatus | "FULL" | "WARNING" | "AVAILABLE";
}

const badgeVariantByStatus = {
  [SwapRequestStatus.PENDING]: "pending",
  [SwapRequestStatus.APPROVED]: "approved",
  [SwapRequestStatus.REJECTED]: "rejected",
  [SwapRequestStatus.AUTO_RESOLVED]: "auto",
  FULL: "full",
  WARNING: "warning",
  AVAILABLE: "approved",
} as const;

const labelByStatus = {
  [SwapRequestStatus.PENDING]: LABELS.status.pending,
  [SwapRequestStatus.APPROVED]: LABELS.status.approved,
  [SwapRequestStatus.REJECTED]: LABELS.status.rejected,
  [SwapRequestStatus.AUTO_RESOLVED]: LABELS.status.autoResolved,
  FULL: LABELS.status.full,
  WARNING: LABELS.status.warning,
  AVAILABLE: LABELS.status.available,
} as const;

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <Badge variant={badgeVariantByStatus[status]}>
      {labelByStatus[status]}
    </Badge>
  );
}
