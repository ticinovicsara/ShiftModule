import type { SwapRequest } from "@repo/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui";
import { StatusBadge } from "./StatusBadge";

export interface SwapRequestCardProps {
  request: SwapRequest;
  compact?: boolean;
}

export function SwapRequestCard({
  request,
  compact = false,
}: SwapRequestCardProps) {
  const title = compact
    ? `${request.currentGroupId} → ${request.desiredGroupId}`
    : `Zamjena ${request.currentGroupId} → ${request.desiredGroupId}`;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <CardTitle className={compact ? "text-base" : "text-lg"}>
            {title}
          </CardTitle>
          <StatusBadge status={request.status} />
        </div>
        <CardDescription>{request.courseId}</CardDescription>
      </CardHeader>
      <CardContent className="pt-0 text-sm text-slate-600">
        {request.reason ?? "Bez dodatnog opisa."}
      </CardContent>
    </Card>
  );
}
