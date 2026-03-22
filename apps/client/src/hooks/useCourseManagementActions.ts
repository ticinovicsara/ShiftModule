import { ReportIssueReason, UserRole } from "@repo/types";
import { useCallback, useState } from "react";
import toast from "react-hot-toast";
import { adminApi, professorApi } from "../api";
import { REQUEST_REJECT_REASON } from "../constants";

interface UseCourseManagementActionsParams {
  role: UserRole.ADMIN | UserRole.PROFESSOR;
  courseId: string;
  issueDescription: string;
  approve: (requestId: string) => Promise<unknown>;
  reject: (args: { id: string; dto: { reason: string } }) => Promise<unknown>;
  updateCapacity: (args: {
    id: string;
    dto: { capacity: number };
  }) => Promise<unknown>;
  refetchDetail: () => Promise<void>;
  refetchRequests: () => Promise<void>;
  clearSelectedGroupForStudent: (studentId: string) => void;
}

export function useCourseManagementActions({
  role,
  courseId,
  issueDescription,
  approve,
  reject,
  updateCapacity,
  refetchDetail,
  refetchRequests,
  clearSelectedGroupForStudent,
}: UseCourseManagementActionsParams) {
  const [actionId, setActionId] = useState<string | null>(null);
  const [movingStudentId, setMovingStudentId] = useState<string | null>(null);
  const [reportingIssue, setReportingIssue] = useState(false);
  const [issueReported, setIssueReported] = useState(false);

  const saveCapacity = useCallback(
    async (group: { id: string; capacity: number }, nextCapacity: number) => {
      try {
        await updateCapacity({ id: group.id, dto: { capacity: nextCapacity } });
        await refetchDetail();
        toast.success("Kapacitet je uspješno ažuriran.");
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Ažuriranje kapaciteta nije uspjelo.",
        );
      }
    },
    [refetchDetail, updateCapacity],
  );

  const sendCourseIssueReport = useCallback(async () => {
    const description = issueDescription.trim();
    if (!description) {
      return;
    }

    setReportingIssue(true);
    try {
      if (role === UserRole.ADMIN) {
        await adminApi.courses.reportIssue(courseId, {
          reason: ReportIssueReason.OTHER,
          description,
        });
      } else {
        await professorApi.courses.reportIssue(courseId, {
          reason: ReportIssueReason.OTHER,
          description,
        });
      }

      setIssueReported(true);
      toast.success("IT prijava je uspješno poslana.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Slanje IT prijave nije uspjelo.",
      );
    } finally {
      setReportingIssue(false);
    }
  }, [courseId, issueDescription, role]);

  const handleApprove = useCallback(
    async (requestId: string) => {
      setActionId(requestId);
      try {
        await approve(requestId);
        await refetchRequests();
        toast.success("Zahtjev je odobren.");
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Odobravanje nije uspjelo.",
        );
      } finally {
        setActionId(null);
      }
    },
    [approve, refetchRequests],
  );

  const handleReject = useCallback(
    async (requestId: string) => {
      setActionId(requestId);
      try {
        await reject({ id: requestId, dto: { reason: REQUEST_REJECT_REASON } });
        await refetchRequests();
        toast.success("Zahtjev je odbijen.");
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Odbijanje nije uspjelo.",
        );
      } finally {
        setActionId(null);
      }
    },
    [refetchRequests, reject],
  );

  const handleMoveStudent = useCallback(
    async (studentId: string, newGroupId: string) => {
      setMovingStudentId(studentId);
      try {
        const api = role === UserRole.ADMIN ? adminApi : professorApi;
        await api.groups.moveStudentToGroup(studentId, newGroupId);
        clearSelectedGroupForStudent(studentId);
        await refetchDetail();
        toast.success("Student je uspješno premješten.");
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Premještanje studenta nije uspjelo.",
        );
      } finally {
        setMovingStudentId(null);
      }
    },
    [clearSelectedGroupForStudent, refetchDetail, role],
  );

  return {
    actionId,
    movingStudentId,
    reportingIssue,
    issueReported,
    saveCapacity,
    sendCourseIssueReport,
    handleApprove,
    handleReject,
    handleMoveStudent,
  };
}
