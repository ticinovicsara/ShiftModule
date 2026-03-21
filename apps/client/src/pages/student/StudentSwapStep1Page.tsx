import { SessionKind } from "@repo/types";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useFetch } from "../../hooks/useFetch";
import { studentApi } from "../../api";
import { ROUTE_PATHS } from "../../constants";
import { Button } from "../../components/ui/Button";
import { CapacityBar } from "../../components/shared/CapacityBar";
import { LABELS } from "../../constants/labels";

function formatGroupSchedule(group: {
  schedule?: { day: string; time: string; room: string };
}) {
  if (!group.schedule) {
    return "Termin nije definiran";
  }

  return `${group.schedule.day} ${group.schedule.time}, ${group.schedule.room}`;
}

export function StudentSwapStep1Page() {
  const navigate = useNavigate();
  const params = useParams<{ id: string }>();
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");
  const [selectedSessionTypeId, setSelectedSessionTypeId] =
    useState<string>("");

  const fetchDetail = useCallback(() => {
    if (!params.id) throw new Error("Course id is missing");
    return studentApi.getCourseById(params.id);
  }, [params.id]);

  const { data, loading, error } = useFetch(fetchDetail, [fetchDetail]);

  const sessionTypeById = useMemo(
    () => new Map((data?.sessionTypes ?? []).map((type) => [type.id, type])),
    [data?.sessionTypes],
  );

  const selectedSessionType = sessionTypeById.get(selectedSessionTypeId);

  const groupsForSelectedType = useMemo(
    () =>
      (data?.groups ?? []).filter(
        (group) => group.sessionTypeId === selectedSessionTypeId,
      ),
    [data?.groups, selectedSessionTypeId],
  );

  const currentGroupForSelectedType =
    data?.currentGroup?.sessionTypeId === selectedSessionTypeId
      ? data.currentGroup
      : null;

  useEffect(() => {
    if (!data?.sessionTypes?.length) {
      return;
    }

    const preferred =
      data.sessionTypes.find((type) => type.type === SessionKind.LAB) ??
      data.sessionTypes[0];

    if (!selectedSessionTypeId) {
      setSelectedSessionTypeId(preferred.id);
    }
  }, [data?.sessionTypes, selectedSessionTypeId]);

  useEffect(() => {
    setSelectedGroupId("");
  }, [selectedSessionTypeId]);

  const handleNext = () => {
    if (selectedGroupId && params.id) {
      navigate(ROUTE_PATHS.student.swapStep2(params.id), {
        state: { selectedGroupId },
      });
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center p-12">
        <p>{LABELS.common.loading}</p>
      </div>
    );

  if (error || !data)
    return (
      <div className="flex items-center justify-center p-12">
        <p className="text-red-600">{LABELS.common.notFound}</p>
      </div>
    );

  return (
    <section className="mx-auto max-w-2xl">
      <div className="mb-6">
        <h1 className="mb-2 text-2xl font-semibold text-slate-900">
          Zamjena grupe
        </h1>
        <p className="text-sm text-slate-600">
          Korak 1 od 2: Odaberite novu grupu
        </p>
      </div>

      <div className="grid gap-6">
        {/* Current group */}
        <article className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4">
          <h2 className="text-sm font-semibold text-slate-900">Tip termina</h2>
          <div className="flex flex-wrap gap-2">
            {(data.sessionTypes ?? []).map((sessionType) => (
              <Button
                key={sessionType.id}
                size="sm"
                variant={
                  selectedSessionTypeId === sessionType.id
                    ? "primary"
                    : "outline"
                }
                onClick={() => setSelectedSessionTypeId(sessionType.id)}
              >
                {sessionType.type === SessionKind.LAB ? "LAB" : "VJEZBE"}
              </Button>
            ))}
          </div>
        </article>

        {/* Current group */}
        <article className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4">
          <h2 className="text-sm font-semibold text-slate-900">
            Trenutna grupa (
            {selectedSessionType?.type === SessionKind.LAB ? "LAB" : "VJEZBE"})
          </h2>
          <div className="rounded-lg bg-slate-50 p-3">
            <p className="mb-2 font-medium text-slate-900">
              {currentGroupForSelectedType?.name ?? "Niste rasporedeni"}
            </p>
            {currentGroupForSelectedType ? (
              <CapacityBar
                current={currentGroupForSelectedType.currentCount}
                max={currentGroupForSelectedType.capacity}
              />
            ) : null}
          </div>
        </article>

        {/* Available groups */}
        <article className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4">
          <h2 className="text-sm font-semibold text-slate-900">
            Dostupne grupe (
            {selectedSessionType?.type === SessionKind.LAB ? "LAB" : "VJEZBE"})
          </h2>
          <div className="grid gap-2">
            {groupsForSelectedType.map((group) => (
              <button
                key={group.id}
                onClick={() => setSelectedGroupId(group.id)}
                className={`grid gap-2 rounded-lg border-2 p-3 text-left transition-all ${
                  selectedGroupId === group.id
                    ? "border-blue-500 bg-blue-50"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-900">{group.name}</p>
                    <p className="text-xs text-slate-500">
                      {formatGroupSchedule(group)}
                    </p>
                  </div>
                  <p className="text-xs text-slate-600">
                    {group.currentCount}/{group.capacity}
                  </p>
                </div>
                <CapacityBar
                  current={group.currentCount}
                  max={group.capacity}
                />
              </button>
            ))}
            {!groupsForSelectedType.length ? (
              <p className="text-sm text-slate-500">
                Nema dostupnih grupa za odabrani tip termina.
              </p>
            ) : null}
          </div>
        </article>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() =>
              navigate(ROUTE_PATHS.student.courseDetail(params.id!))
            }
          >
            Otkaži
          </Button>
          <Button disabled={!selectedGroupId} onClick={handleNext}>
            Dalje
          </Button>
        </div>
      </div>
    </section>
  );
}
