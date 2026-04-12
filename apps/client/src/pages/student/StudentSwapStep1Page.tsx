import { SessionKind, SwapRequestStatus } from "@repo/types";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useFetch } from "../../hooks/useFetch";
import { studentApi } from "../../api";
import { ROUTE_PATHS } from "../../constants";
import { Button } from "../../components/ui/Button";
import { CapacityBar } from "../../components/shared/CapacityBar";
import { LABELS } from "../../constants/labels";
import { useSwapRequests } from "../../hooks";

function formatGroupSchedule(group: {
  schedule?: { day: string; time: string; room: string };
}) {
  if (!group.schedule) return "Termin nije definiran";
  return `${group.schedule.day} ${group.schedule.time}, ${group.schedule.room}`;
}

export function StudentSwapStep1Page() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams<{ id: string }>();
  const [selectedSessionTypeId, setSelectedSessionTypeId] =
    useState<string>("");
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");
  const { data: requests } = useSwapRequests();

  const state = location.state as {
    editRequestId?: string;
    selectedSessionTypeId?: string;
    selectedGroupId?: string;
    reason?: string;
    partnerEmail?: string;
  } | null;

  const editRequestId = state?.editRequestId;

  const fetchDetail = useCallback(() => {
    if (!params.id) throw new Error("Course id is missing");
    return studentApi.getCourseById(params.id);
  }, [params.id]);

  const { data, loading, error } = useFetch(fetchDetail);

  useEffect(() => {
    if (state?.selectedSessionTypeId) {
      setSelectedSessionTypeId(state.selectedSessionTypeId);
    }

    if (state?.selectedGroupId) {
      setSelectedGroupId(state.selectedGroupId);
    }
  }, [state?.selectedGroupId, state?.selectedSessionTypeId]);

  const sessionTypes = data?.sessionTypes ?? [];
  const currentGroups = data?.currentGroups ?? [];

  const sessionTypeByKind = useMemo(() => {
    const map = new Map<SessionKind, string>();
    for (const st of sessionTypes) {
      if (!map.has(st.type)) map.set(st.type, st.id);
    }
    return map;
  }, [sessionTypes]);

  const sessionTypeById = useMemo(
    () => new Map(sessionTypes.map((st) => [st.id, st])),
    [sessionTypes],
  );

  const assignedKinds = useMemo(() => {
    const assigned = new Set<SessionKind>();
    for (const group of currentGroups) {
      const st = sessionTypeById.get(group.sessionTypeId);
      if (st) assigned.add(st.type);
    }
    return assigned;
  }, [currentGroups, sessionTypeById]);

  const getOptionState = (kind: SessionKind) => {
    const sessionTypeId = sessionTypeByKind.get(kind) ?? null;
    const enabled = Boolean(sessionTypeId && assignedKinds.has(kind));
    return {
      kind,
      sessionTypeId,
      enabled,
      disabledLabel: enabled ? null : "Nije dostupno za ovaj kolegij",
      title:
        kind === SessionKind.LAB ? "Laboratorijske vježbe" : "Auditorne vježbe",
    };
  };

  const optionStates = [
    getOptionState(SessionKind.LAB),
    getOptionState(SessionKind.EXERCISE),
  ];

  // Auto-select first enabled session type
  useEffect(() => {
    if (selectedSessionTypeId) return;
    const first = optionStates.find((o) => o.enabled);
    if (first?.sessionTypeId) setSelectedSessionTypeId(first.sessionTypeId);
  }, [optionStates, selectedSessionTypeId]);

  // Reset selection only when selected group is not valid for the chosen session type.
  useEffect(() => {
    setSelectedGroupId((current) => {
      if (!current || !selectedSessionTypeId) {
        return current;
      }

      const selectedGroupSessionTypeId = data?.groups?.find(
        (group) => group.id === current,
      )?.sessionTypeId;

      if (selectedGroupSessionTypeId === selectedSessionTypeId) {
        return current;
      }

      return "";
    });
  }, [data?.groups, selectedSessionTypeId]);

  const availableGroups = useMemo(
    () =>
      (data?.groups ?? []).filter(
        (g) => g.sessionTypeId === selectedSessionTypeId,
      ),
    [data?.groups, selectedSessionTypeId],
  );

  const currentGroupForSelectedType = useMemo(
    () =>
      currentGroups.find((g) => g.sessionTypeId === selectedSessionTypeId) ??
      null,
    [currentGroups, selectedSessionTypeId],
  );

  const selectedGroup =
    availableGroups.find((g) => g.id === selectedGroupId) ?? null;

  const hasOtherActiveRequest = useMemo(
    () =>
      (requests ?? []).some(
        (request) =>
          request.courseId === params.id &&
          request.id !== editRequestId &&
          (request.status === SwapRequestStatus.PENDING ||
            request.status === SwapRequestStatus.WAITING_FOR_MATCH),
      ),
    [editRequestId, params.id, requests],
  );

  const handleNext = () => {
    if (!selectedSessionTypeId || !selectedGroupId || !params.id) return;

    if (hasOtherActiveRequest) {
      return;
    }

    navigate(ROUTE_PATHS.student.swapStep2(params.id), {
      state: {
        editRequestId,
        selectedSessionTypeId,
        selectedGroupId,
        reason: state?.reason,
        partnerEmail: state?.partnerEmail,
      },
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <p className="text-sm text-slate-500">{LABELS.common.loading}</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center p-12">
        <p className="text-sm text-red-600">{LABELS.common.notFound}</p>
      </div>
    );
  }

  if (hasOtherActiveRequest && !editRequestId) {
    return (
      <section className="mx-auto max-w-2xl grid gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">
            Zamjena grupe
          </h1>
          <p className="text-sm text-slate-500 mt-1">Korak 1 od 2</p>
        </div>
        <article className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm text-red-900">
            Zahtjev je već poslan i još nije riješen. Ne možete poslati novi dok
            aktivni zahtjev ne bude riješen ili obrisan.
          </p>
        </article>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => navigate(ROUTE_PATHS.student.notifications)}
          >
            Otvori obavijesti
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              navigate(ROUTE_PATHS.student.courseDetail(params.id!))
            }
          >
            Natrag na kolegij
          </Button>
        </div>
      </section>
    );
  }

  const hasAnyEnabled = optionStates.some((o) => o.enabled);

  if (!hasAnyEnabled) {
    return (
      <section className="mx-auto max-w-2xl grid gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">
            Zamjena grupe
          </h1>
          <p className="text-sm text-slate-500 mt-1">Korak 1 od 2</p>
        </div>
        <article className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm text-amber-900">
            Za ovaj kolegij trenutno nije dostupan nijedan tip vježbe za
            zamjenu.
          </p>
        </article>
        <Button
          variant="outline"
          onClick={() => navigate(ROUTE_PATHS.student.courseDetail(params.id!))}
        >
          Natrag
        </Button>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-2xl grid gap-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Zamjena grupe</h1>
        <p className="text-sm text-slate-500 mt-1">
          Korak 1 od 2 — Odaberi tip i grupu
        </p>
      </div>

      {/* Session type picker */}
      <article className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-slate-700">Tip vježbe</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {optionStates.map((option) => {
            const isSelected = selectedSessionTypeId === option.sessionTypeId;
            return (
              <button
                key={option.kind}
                type="button"
                onClick={() =>
                  option.enabled &&
                  option.sessionTypeId &&
                  setSelectedSessionTypeId(option.sessionTypeId)
                }
                disabled={!option.enabled}
                className={`grid gap-1 rounded-xl border-2 p-4 text-left transition-all ${
                  !option.enabled
                    ? "cursor-not-allowed border-slate-100 bg-slate-50 opacity-50"
                    : isSelected
                      ? "border-indigo-500 bg-indigo-50"
                      : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <p
                  className={`text-sm font-semibold ${isSelected ? "text-indigo-700" : "text-slate-900"}`}
                >
                  {option.title}
                </p>
                <p
                  className={`text-xs ${isSelected ? "text-indigo-500" : "text-slate-400"}`}
                >
                  {option.disabledLabel ?? "Dostupno za odabir"}
                </p>
              </button>
            );
          })}
        </div>
      </article>

      {/* Current group info */}
      {currentGroupForSelectedType && (
        <article className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4">
          <h2 className="text-sm font-semibold text-slate-700">
            Tvoja trenutna grupa
          </h2>
          <div className="rounded-lg bg-slate-50 p-3 grid gap-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-900">
                {currentGroupForSelectedType.name}
              </p>
              <p className="text-xs text-slate-500">
                {currentGroupForSelectedType.currentCount}/
                {currentGroupForSelectedType.capacity}
              </p>
            </div>
            <CapacityBar
              current={currentGroupForSelectedType.currentCount}
              max={currentGroupForSelectedType.capacity}
            />
          </div>
        </article>
      )}

      {/* Available groups */}
      {selectedSessionTypeId && (
        <article className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4">
          <h2 className="text-sm font-semibold text-slate-700">
            Dostupne grupe
          </h2>
          {!availableGroups.length ? (
            <p className="text-sm text-slate-500">
              Nema dostupnih grupa za odabrani tip.
            </p>
          ) : (
            <div className="grid gap-2">
              {availableGroups.map((group) => {
                const isSelected = selectedGroupId === group.id;
                const isCurrent = group.id === currentGroupForSelectedType?.id;
                return (
                  <button
                    key={group.id}
                    type="button"
                    disabled={isCurrent}
                    onClick={() => !isCurrent && setSelectedGroupId(group.id)}
                    className={`grid gap-2 rounded-xl border-2 p-3 text-left transition-all ${
                      isCurrent
                        ? "cursor-not-allowed border-slate-100 bg-slate-50 opacity-50"
                        : isSelected
                          ? "border-indigo-500 bg-indigo-50"
                          : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p
                          className={`text-sm font-medium ${isSelected ? "text-indigo-700" : "text-slate-900"}`}
                        >
                          {group.name}
                          {isCurrent && (
                            <span className="ml-2 text-xs text-slate-400">
                              (trenutna)
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {formatGroupSchedule(group)}
                        </p>
                      </div>
                      <p className="text-xs text-slate-500 flex-shrink-0">
                        {group.currentCount}/{group.capacity}
                      </p>
                    </div>
                    <CapacityBar
                      current={group.currentCount}
                      max={group.capacity}
                    />
                  </button>
                );
              })}
            </div>
          )}
        </article>
      )}

      {/* Selected group summary */}
      {selectedGroup && currentGroupForSelectedType && (
        <article className="rounded-xl border border-indigo-200 bg-indigo-50 p-4">
          <p className="text-sm font-medium text-indigo-800">
            Mijenjaš se iz{" "}
            <span className="font-semibold">
              {currentGroupForSelectedType.name}
            </span>{" "}
            u <span className="font-semibold">{selectedGroup.name}</span>
          </p>
          <p className="text-xs text-indigo-600 mt-1">
            {formatGroupSchedule(currentGroupForSelectedType)} →{" "}
            {formatGroupSchedule(selectedGroup)}
          </p>
        </article>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={() => navigate(ROUTE_PATHS.student.courseDetail(params.id!))}
        >
          Otkaži
        </Button>
        <Button
          disabled={!selectedGroupId || !selectedSessionTypeId}
          onClick={handleNext}
        >
          Dalje
        </Button>
      </div>
    </section>
  );
}
