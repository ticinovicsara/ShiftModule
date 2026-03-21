import { SessionKind, SwapRequestStatus } from "@repo/types";
import { useCallback, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { studentApi } from "../../api";
import { SwapRequestCard } from "../../components/shared";
import {
  Badge,
  Button,
  EmptyState,
  ErrorState,
  Spinner,
} from "../../components/ui";
import { LABELS } from "../../constants";
import { ROUTE_PATHS } from "../../constants";
import { useFetch, useRequestDisplayData, useSwapRequests } from "../../hooks";

export function StudentCourseDetailPage() {
  const navigate = useNavigate();
  const params = useParams<{ id: string }>();
  const { data: requests } = useSwapRequests();

  const fetchDetail = useCallback(() => {
    if (!params.id) {
      throw new Error("Course id is missing");
    }

    return studentApi.getCourseById(params.id);
  }, [params.id]);

  const { data, loading, error } = useFetch(fetchDetail, [fetchDetail]);

  const courseRequests = useMemo(
    () => (requests ?? []).filter((request) => request.courseId === params.id),
    [requests, params.id],
  );

  const { cardRequests, usersLoading } = useRequestDisplayData({
    activeTab: "all",
    requests: courseRequests,
    courses: data?.course ? [data.course] : undefined,
  });

  const pendingBySessionKind = useMemo(() => {
    const sessionTypeKindById = new Map(
      (data?.sessionTypes ?? []).map((sessionType) => [
        sessionType.id,
        sessionType.type,
      ]),
    );

    return courseRequests.reduce(
      (acc, request) => {
        if (request.status !== SwapRequestStatus.PENDING) {
          return acc;
        }

        const sessionKind = sessionTypeKindById.get(request.sessionTypeId);
        if (sessionKind === SessionKind.LAB) {
          acc.lab += 1;
        } else if (sessionKind === SessionKind.EXERCISE) {
          acc.exercise += 1;
        }

        return acc;
      },
      { lab: 0, exercise: 0 },
    );
  }, [courseRequests, data?.sessionTypes]);

  if (loading || usersLoading) return <Spinner />;

  if (error || !data?.course) {
    return (
      <ErrorState
        description={error ?? LABELS.common.noResults}
        title={LABELS.common.retry}
      />
    );
  }

  return (
    <section className="grid gap-4">
      <div className="grid gap-3">
        <h2 className="text-xl font-semibold text-slate-900">
          {data.course.title}
        </h2>
        <div className="flex flex-wrap gap-2">
          <Badge variant={pendingBySessionKind.lab > 0 ? "pending" : "neutral"}>
            LAB pending: {pendingBySessionKind.lab}
          </Badge>
          <Badge
            variant={pendingBySessionKind.exercise > 0 ? "pending" : "neutral"}
          >
            VJEZBE pending: {pendingBySessionKind.exercise}
          </Badge>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() =>
              navigate(ROUTE_PATHS.student.swapStep1(data.course!.id))
            }
            size="sm"
          >
            Zatraži zamjenu grupe
          </Button>
        </div>
      </div>

      <div className="grid gap-3">
        <h3 className="text-sm font-semibold text-slate-900">Moji zahtjevi</h3>
        {!cardRequests.length ? (
          <EmptyState
            description="Nema zahtjeva za ovaj kolegij."
            title={LABELS.common.noResults}
          />
        ) : (
          cardRequests.map((request) => (
            <SwapRequestCard key={request.id} request={request} />
          ))
        )}
      </div>
    </section>
  );
}
