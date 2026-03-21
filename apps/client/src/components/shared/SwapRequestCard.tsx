import {
  StudentSwapViewState,
  SwapRequestStatus,
  SwapRequestType,
  type SwapRequest,
  type User,
} from "@repo/types";
import { Badge, Card, CardContent, CardHeader, CardTitle } from "../ui";
import { StatusBadge } from "./StatusBadge";
import { FaArrowRightArrowLeft } from "react-icons/fa6";
import { getInitials, getAvatarColor } from "../../utils";

export interface SwapRequestCardProps {
  request: SwapRequestCardModel;
  compact?: boolean;
}

type SwapRequestCardModel = SwapRequest & {
  courseTitle?: string;
  currentGroupName?: string;
  desiredGroupName?: string;
  student?: Pick<User, "id" | "firstName" | "lastName" | "email">;
  partner?: Pick<User, "id" | "firstName" | "lastName" | "email">;
};

export function SwapRequestCard({
  request,
  compact = false,
}: SwapRequestCardProps) {
  if (!request.student && !request.partner) {
    throw new Error(
      "SwapRequestCard requires at least student or partner information",
    );
  }

  if (
    !request.courseTitle ||
    !request.currentGroupName ||
    !request.desiredGroupName
  ) {
    throw new Error(
      "SwapRequestCard requires courseTitle/currentGroupName/desiredGroupName",
    );
  }

  const title = request.courseTitle;
  const switchDescription = compact
    ? `${request.currentGroupName} → ${request.desiredGroupName}`
    : `Zamjena grupe: ${request.currentGroupName} -> ${request.desiredGroupName}`;

  const studentName = request.student
    ? `${request.student.firstName} ${request.student.lastName}`
    : "Nepoznat student";

  const partnerName = request.partner
    ? `${request.partner.firstName} ${request.partner.lastName}`
    : "Nema partnera";

  const studentInitials = getInitials(
    request.student?.firstName,
    request.student?.lastName,
  );
  const partnerInitials = getInitials(
    request.partner?.firstName,
    request.partner?.lastName,
  );

  const avatarColor = getAvatarColor(request.studentId);
  const requestTypeLabel =
    request.requestType === SwapRequestType.PAIRED ? "U paru" : "Solo";
  const processingMode =
    request.processingMode ??
    (request.status === SwapRequestStatus.AUTO_RESOLVED
      ? "AUTOMATIC"
      : "MANUAL");

  const studentViewLabelByState: Record<StudentSwapViewState, string> = {
    [StudentSwapViewState.AWAITING_PARTNER_CONFIRMATION]:
      "Ceka se potvrda partnera",
    [StudentSwapViewState.INCOMING_PARTNER_CONFIRMATION]:
      "Potrebna je tvoja potvrda partnera",
    [StudentSwapViewState.QUEUED_FOR_REVIEW]: "Zahtjev je u obradi",
    [StudentSwapViewState.AUTO_PROCESSED]: "Automatski obradeno",
    [StudentSwapViewState.MANUALLY_APPROVED]: "Rucno odobreno",
    [StudentSwapViewState.MANUALLY_REJECTED]: "Rucno odbijeno",
  };

  return (
    <Card className="bg-white">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={request.status} />
            <Badge variant="primary">{requestTypeLabel}</Badge>
            <Badge
              variant={processingMode === "AUTOMATIC" ? "auto" : "neutral"}
            >
              {processingMode === "AUTOMATIC" ? "Automatic" : "Manual"}
            </Badge>
          </div>
        </div>

        <CardTitle className={`mt-3 ${compact ? "text-base" : "text-lg"}`}>
          {title}
        </CardTitle>
        <p className="mt-1 text-sm text-slate-500">{switchDescription}</p>
      </CardHeader>

      <div className="flex items-center justify-between gap-4 border-t border-slate-200">
        <div className="flex items-center gap-3 p-5">
          <div
            className={`${avatarColor} flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg text-sm font-semibold text-white`}
          >
            {studentInitials}
          </div>
          <div className="flex-1">
            <p className="font-medium text-sm">{studentName}</p>
            {request.student?.email && (
              <p className="text-xs text-slate-500">{request.student.email}</p>
            )}
          </div>
        </div>
        <FaArrowRightArrowLeft />
        <div className="flex flex-1 items-center gap-3 p-5">
          <div
            className={`${avatarColor} flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg text-sm font-semibold text-white`}
          >
            {partnerInitials}
          </div>
          <div className="flex-1">
            <p className="font-medium text-sm">{partnerName}</p>
            {request.partner?.email ? (
              <p className="text-xs text-slate-500">{request.partner.email}</p>
            ) : null}
          </div>
        </div>
      </div>

      <CardContent className="pt-0 text-sm text-slate-600">
        {request.reason ?? "Bez dodatnog opisa."}
        {request.studentViewState ? (
          <p className="mt-2 text-xs font-medium text-slate-500">
            {studentViewLabelByState[request.studentViewState]}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
