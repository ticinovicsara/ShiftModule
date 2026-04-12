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
  showPriorityInfo?: boolean;
  showSatisfactionInfo?: boolean;
  showProfessorInfo?: boolean;
}

type SwapRequestCardModel = SwapRequest & {
  courseTitle?: string;
  currentGroupName?: string;
  desiredGroupName?: string;
  student?: Pick<User, "id" | "firstName" | "lastName" | "email" | "gpa">;
  partner?: Pick<User, "id" | "firstName" | "lastName" | "email">;
  professor?: Pick<User, "id" | "firstName" | "lastName" | "email">;
};

function getPriorityConfig(priorityScore?: number) {
  if ((priorityScore ?? 0) >= 0.7) {
    return { label: "Visoki prioritet", variant: "approved" as const };
  }

  if ((priorityScore ?? 0) >= 0.4) {
    return { label: "Srednji prioritet", variant: "warning" as const };
  }

  return { label: "Niski prioritet", variant: "neutral" as const };
}

export function SwapRequestCard({
  request,
  compact = false,
  showPriorityInfo = false,
  showSatisfactionInfo = false,
  showProfessorInfo = false,
}: SwapRequestCardProps) {
  const fallbackCourseTitle = `Kolegij (${request.courseId})`;
  const currentGroupName = request.currentGroupName ?? request.currentGroupId;
  const desiredGroupName = request.desiredGroupName ?? request.desiredGroupId;
  const title = request.courseTitle ?? fallbackCourseTitle;
  const switchDescription = compact
    ? `${currentGroupName} → ${desiredGroupName}`
    : `Zamjena grupe: ${currentGroupName} -> ${desiredGroupName}`;

  const studentName = request.student
    ? `${request.student.firstName} ${request.student.lastName}`
    : `Student (${request.studentId})`;

  const partnerName = request.partner
    ? `${request.partner.firstName} ${request.partner.lastName}`
    : "Nema partnera";

  const professorName = request.professor
    ? `${request.professor.firstName} ${request.professor.lastName}`
    : "Nije dodijeljen";

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
  const priorityConfig = getPriorityConfig(request.priorityScore);
  const studentGpa = request.student?.gpa ?? 3.0;
  const submissionDate = new Date(request.createdAt);
  const submissionLabel = Number.isNaN(submissionDate.getTime())
    ? "-"
    : submissionDate.toLocaleString("hr-HR", {
        dateStyle: "short",
        timeStyle: "short",
      });
  const gpaLabel = studentGpa.toLocaleString("hr-HR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const resolvedForStudentFeedback =
    request.status === SwapRequestStatus.APPROVED ||
    request.status === SwapRequestStatus.AUTO_RESOLVED;

  const satisfactionLabel =
    request.satisfiedWish === true
      ? "Želja zadovoljena"
      : request.satisfiedWish === false
        ? "Želja nije zadovoljena"
        : resolvedForStudentFeedback
          ? "Čeka potvrdu studenta"
          : "Nije primjenjivo";

  const studentViewLabelByState: Record<StudentSwapViewState, string> = {
    [StudentSwapViewState.AWAITING_PARTNER_CONFIRMATION]:
      "Ceka se potvrda partnera",
    [StudentSwapViewState.INCOMING_PARTNER_CONFIRMATION]:
      "Potrebna je tvoja potvrda partnera",
    [StudentSwapViewState.QUEUED_FOR_REVIEW]: "Zahtjev je u obradi",
    [StudentSwapViewState.AUTO_PROCESSED]: "Automatski obradeno",
    [StudentSwapViewState.MANUALLY_APPROVED]: "Ručno odobreno",
    [StudentSwapViewState.MANUALLY_REJECTED]: "Ručno odbijeno",
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
            {showPriorityInfo ? (
              <Badge variant={priorityConfig.variant}>
                {priorityConfig.label}
              </Badge>
            ) : null}
          </div>
        </div>

        <CardTitle className={`mt-3 ${compact ? "text-base" : "text-lg"}`}>
          {title}
        </CardTitle>
        <p className="mt-1 text-sm text-slate-500">{switchDescription}</p>
        {showPriorityInfo ? (
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
            <span>GPA studenta: {gpaLabel}</span>
            <span>Vrijeme podnošenja: {submissionLabel}</span>
          </div>
        ) : null}
        {showSatisfactionInfo ? (
          <div className="mt-2 text-xs text-slate-500">
            <span>Ishod želje: {satisfactionLabel}</span>
          </div>
        ) : null}
        {showProfessorInfo ? (
          <div className="mt-2 text-xs text-slate-500">
            <span>Profesor: {professorName}</span>
          </div>
        ) : null}
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
