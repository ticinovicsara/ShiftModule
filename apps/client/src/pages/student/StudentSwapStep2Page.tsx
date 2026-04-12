import { SwapRequestStatus, SwapRequestType } from "@repo/types";
import { useCallback, useEffect, useMemo } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { Button } from "../../components/ui";
import { StudentPartnerSearchInput } from "../../components/shared/StudentPartnerSearchInput";
import { LABELS } from "../../constants/labels";
import { ROUTE_PATHS } from "../../constants";
import { useFetch } from "../../hooks/useFetch";
import { ApiError, studentApi } from "../../api";
import { useSwapRequests } from "../../hooks";
import { useState } from "react";
import toast from "react-hot-toast";

export function StudentSwapStep2Page() {
  const params = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { create, update, data: requests, refetch } = useSwapRequests();

  const [reason, setReason] = useState("");
  const [wantPartner, setWantPartner] = useState(false);
  const [partnerEmail, setPartnerEmail] = useState("");
  const [partnerDisplayName, setPartnerDisplayName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const state = location.state as {
    editRequestId?: string;
    selectedSessionTypeId?: string;
    selectedGroupId?: string;
    reason?: string;
    partnerEmail?: string;
  } | null;

  const editRequestId = state?.editRequestId;
  const selectedSessionTypeId = state?.selectedSessionTypeId;
  const selectedGroupId = state?.selectedGroupId;

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

  useEffect(() => {
    if (state?.reason) {
      setReason(state.reason);
    }

    if (state?.partnerEmail) {
      setPartnerEmail(state.partnerEmail);
      setWantPartner(true);
    }
  }, [state?.partnerEmail, state?.reason]);

  const fetchDetail = useCallback(() => {
    if (!params.id) throw new Error("Course id is missing");
    return studentApi.getCourseById(params.id);
  }, [params.id]);

  const { data, loading, error } = useFetch(fetchDetail);

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

  if (!selectedSessionTypeId || !selectedGroupId) {
    return (
      <div className="flex items-center justify-center p-12">
        <p className="text-sm text-red-600">
          Nedostaju podaci iz prethodnog koraka. Vratite se natrag.
        </p>
      </div>
    );
  }

  const currentGroup = (data.currentGroups ?? []).find(
    (g) => g.sessionTypeId === selectedSessionTypeId,
  );
  const desiredGroup = data.groups.find((g) => g.id === selectedGroupId);

  if (hasOtherActiveRequest && !editRequestId) {
    return (
      <section className="mx-auto max-w-2xl grid gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">
            Zamjena grupe
          </h1>
          <p className="text-sm text-slate-500 mt-1">Korak 2 od 2</p>
        </div>
        <article className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm text-amber-900">
            Zahtjev je već poslan. Ne možete poslati novi dok aktivni zahtjev ne
            bude riješen ili obrisan.
          </p>
        </article>
        <Button
          variant="outline"
          onClick={() => navigate(ROUTE_PATHS.student.notifications)}
        >
          Otvori obavijesti
        </Button>
      </section>
    );
  }

  const handleSubmit = async () => {
    if (!params.id) return;
    if (!currentGroup) {
      toast.error("Trenutna grupa nije pronađena za odabrani tip vježbe.");
      return;
    }
    if (!reason.trim()) {
      toast.error("Molimo unesite razlog za zamjenu grupe");
      return;
    }
    if (wantPartner && !partnerEmail.trim()) {
      toast.error("Molimo unesite email partnera");
      return;
    }

    setIsSubmitting(true);
    try {
      if (editRequestId) {
        await update({
          id: editRequestId,
          dto: {
            desiredGroupId: selectedGroupId,
            reason,
            partnerEmail: wantPartner ? partnerEmail.trim() : undefined,
            requestType: wantPartner
              ? SwapRequestType.PAIRED
              : SwapRequestType.SOLO,
          },
        });
        toast.success("Zahtjev je uspješno ažuriran");
      } else {
        await create({
          courseId: params.id,
          sessionTypeId: selectedSessionTypeId,
          currentGroupId: currentGroup.id,
          desiredGroupId: selectedGroupId,
          reason,
          partnerEmail: wantPartner ? partnerEmail.trim() : undefined,
        });
        toast.success("Zahtjev je uspješno poslan");
      }

      await refetch();
      navigate(ROUTE_PATHS.student.courses);
    } catch (submitError) {
      if (submitError instanceof ApiError && submitError.statusCode === 409) {
        toast.error(
          "Već imate aktivan zahtjev za ovaj tip vježbe. Obrišite postojeći zahtjev u Obavijestima pa pošaljite novi.",
        );
      } else {
        toast.error("Slanje nije uspjelo");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="mx-auto max-w-2xl grid gap-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Zamjena grupe</h1>
        <p className="text-sm text-slate-500 mt-1">
          Korak 2 od 2 — {editRequestId ? "Uredi zahtjev" : "Detalji zahtjeva"}
        </p>
      </div>

      {/* Swap summary */}
      {currentGroup && desiredGroup && (
        <article className="rounded-xl border border-indigo-200 bg-indigo-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-indigo-500 mb-1">
            Zamjena
          </p>
          <p className="text-sm font-medium text-indigo-900">
            <span className="font-semibold">{currentGroup.name}</span>
            {" → "}
            <span className="font-semibold">{desiredGroup.name}</span>
          </p>
          {desiredGroup.schedule && (
            <p className="text-xs text-indigo-600 mt-1">
              Novi termin: {desiredGroup.schedule.day}{" "}
              {desiredGroup.schedule.time}, {desiredGroup.schedule.room}
            </p>
          )}
        </article>
      )}

      {/* Request details */}
      <article className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-slate-700">
          Detalji zahtjeva
        </h2>

        <label className="grid gap-2 text-sm font-medium text-slate-900">
          Razlog za zamjenu *
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={4}
            placeholder="Objasnite zašto trebate zamjenu grupe..."
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
          />
        </label>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={wantPartner}
              onChange={(e) => setWantPartner(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-indigo-500"
            />
            <span className="text-sm font-medium text-slate-900">
              Imam osobu za zamjenu
            </span>
          </label>
        </div>

        {wantPartner && currentGroup && (
          <StudentPartnerSearchInput
            courseId={params.id!}
            desiredGroupId={selectedGroupId}
            sessionTypeId={selectedSessionTypeId}
            value={partnerDisplayName}
            onChange={setPartnerDisplayName}
            onSelect={(email, displayName) => {
              setPartnerEmail(email);
              setPartnerDisplayName(displayName);
            }}
          />
        )}
      </article>

      {/* Actions */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={() => navigate(-1)}
          disabled={isSubmitting}
        >
          Natrag
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={
            !reason.trim() ||
            (wantPartner && !partnerEmail.trim()) ||
            isSubmitting
          }
        >
          {isSubmitting
            ? "Spremanje..."
            : editRequestId
              ? "Spremi izmjene"
              : "Pošalji zahtjev"}
        </Button>
      </div>
    </section>
  );
}
