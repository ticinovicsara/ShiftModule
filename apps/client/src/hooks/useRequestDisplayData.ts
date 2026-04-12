import {
  SwapRequestStatus,
  type Course,
  type SwapRequest,
  type User,
} from "@repo/types";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { fetchUsersByIds } from "../api";

export interface RequestCardDisplayModel extends SwapRequest {
  courseTitle?: string;
  currentGroupName?: string;
  desiredGroupName?: string;
  student?: Pick<User, "id" | "firstName" | "lastName" | "email">;
  partner?: Pick<User, "id" | "firstName" | "lastName" | "email">;
  professor?: Pick<User, "id" | "firstName" | "lastName" | "email">;
}

interface UseRequestDisplayDataParams {
  activeTab: string;
  requests?: SwapRequest[];
  courses?: Course[];
}

export function useRequestDisplayData({
  activeTab,
  requests,
  courses,
}: UseRequestDisplayDataParams) {
  const userIds = useMemo(
    () => [
      ...new Set([
        ...(requests ?? []).flatMap(
          (request) =>
            [request.studentId, request.partnerStudentId].filter(
              Boolean,
            ) as string[],
        ),
        ...((courses ?? [])
          .map((course) => course.professorId)
          .filter(Boolean) as string[]),
      ]),
    ],
    [courses, requests],
  );

  const {
    data: users,
    isLoading: usersLoading,
    error: usersError,
  } = useQuery<User[]>({
    queryKey: ["users", userIds],
    queryFn: () => fetchUsersByIds(userIds),
    enabled: userIds.length > 0,
  });

  const userMap = useMemo(
    () => new Map<string, User>((users ?? []).map((user) => [user.id, user])),
    [users],
  );

  const courseMap = useMemo(
    () =>
      new Map<string, Course>(
        (courses ?? []).map((course) => [course.id, course]),
      ),
    [courses],
  );

  const filteredRequests = useMemo(() => {
    const source = requests ?? [];

    if (activeTab === "manual") {
      return source.filter(
        (request) => request.status === SwapRequestStatus.PENDING,
      );
    }

    if (activeTab === "automatic") {
      return source.filter(
        (request) => request.status === SwapRequestStatus.AUTO_RESOLVED,
      );
    }

    if (activeTab === "approved") {
      return source.filter(
        (request) => request.status === SwapRequestStatus.APPROVED,
      );
    }

    if (activeTab === "rejected") {
      return source.filter(
        (request) => request.status === SwapRequestStatus.REJECTED,
      );
    }

    return source;
  }, [activeTab, requests]);

  const cardRequests = useMemo<RequestCardDisplayModel[]>(
    () =>
      filteredRequests.map((request) => ({
        ...request,
        courseTitle:
          request.courseTitle ?? courseMap.get(request.courseId)?.title,
        currentGroupName: request.currentGroupName,
        desiredGroupName: request.desiredGroupName,
        student: userMap.get(request.studentId),
        partner: request.partnerStudentId
          ? userMap.get(request.partnerStudentId)
          : undefined,
        professor: (() => {
          const professorId = courseMap.get(request.courseId)?.professorId;
          return professorId ? userMap.get(professorId) : undefined;
        })(),
      })),
    [courseMap, filteredRequests, userMap],
  );

  const hasMissingDisplayData = cardRequests.some(
    (request) =>
      !request.courseTitle ||
      !request.currentGroupName ||
      !request.desiredGroupName,
  );

  return {
    cardRequests,
    hasMissingDisplayData,
    usersLoading,
    usersError,
  };
}
