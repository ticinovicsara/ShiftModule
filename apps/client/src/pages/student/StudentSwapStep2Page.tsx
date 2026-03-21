import { useCallback, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { Button, Input } from "../../components/ui";
import { CapacityBar } from "../../components/shared/CapacityBar";
import { LABELS } from "../../constants/labels";
import { ROUTE_PATHS } from "../../constants";
import { useFetch } from "../../hooks/useFetch";
import { studentApi } from "../../api";
import { useSwapRequests } from "../../hooks";
import toast from "react-hot-toast";

export function StudentSwapStep2Page() {
  const params = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { create } = useSwapRequests();
  const [reason, setReason] = useState("");
  const [wantPartner, setWantPartner] = useState(false);
  const [partnerEmail, setPartnerEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedGroupId = (location.state as { selectedGroupId?: string })
    ?.selectedGroupId;

  const fetchDetail = useCallback(() => {
    if (!params.id) throw new Error("Course id is missing");
    return studentApi.getCourseById(params.id);
  }, [params.id]);

  const { data, loading, error } = useFetch(fetchDetail, [fetchDetail]);

  if (loading)
    return (
      <div className="flex items-center justify-center p-12">
        <p>{LABELS.common.loading}</p>
      </div>
    );

  if (error || !data || loading) return;

  if (!selectedGroupId)
    return (
      <div className="flex items-center justify-center p-12">
        <p className="text-red-600">
          Grupa nije odabrana. Vratite se na prethodni korak.
        </p>
      </div>
    );

  const desiredGroup = data.groups.find((g) => g.id === selectedGroupId);
  if (!desiredGroup)
    return (
      <div className="flex items-center justify-center p-12">
        <p className="text-red-600">Odabrana grupa nije pronađena.</p>
      </div>
    );

  const handleSubmit = async () => {
    if (!params.id) {
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
      await create({
        courseId: params.id,
        sessionTypeId: desiredGroup.sessionTypeId,
        currentGroupId: data.currentGroup?.id ?? "",
        desiredGroupId: selectedGroupId,
        reason,
        partnerEmail: wantPartner ? partnerEmail.trim() : undefined,
      });
      toast.success("Zahtjev je uspjesno poslan");
      navigate(ROUTE_PATHS.student.courses);
    } catch (submitError) {
      const message =
        submitError instanceof Error
          ? submitError.message
          : "Slanje nije uspjelo";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="mx-auto max-w-2xl">
      <div className="mb-6">
        <h1 className="mb-2 text-2xl font-semibold text-slate-900">
          Zamjena grupe
        </h1>
        <p className="text-sm text-slate-600">Korak 2 od 2: Razlog i potvrda</p>
      </div>

      <div className="grid gap-6">
        <article className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4">
          <h2 className="text-sm font-semibold text-slate-900">
            Pregled odabira
          </h2>
          <div className="grid gap-2">
            <div className="rounded-lg bg-slate-50 p-3">
              <p className="text-xs text-slate-600">Iz grupe:</p>
              <p className="font-medium text-slate-900">
                {data.currentGroup?.name ?? "-"}
              </p>
              {data.currentGroup ? (
                <CapacityBar
                  current={data.currentGroup.currentCount}
                  max={data.currentGroup.capacity}
                />
              ) : null}
            </div>
            <div className="flex justify-center">→</div>
            <div className="rounded-lg bg-blue-50 p-3">
              <p className="text-xs text-slate-600">U grupu:</p>
              <p className="font-medium text-slate-900">{desiredGroup.name}</p>
              <CapacityBar
                current={desiredGroup.currentCount}
                max={desiredGroup.capacity}
              />
            </div>
          </div>
        </article>

        <Input
          label="Razlog za zamjenu *"
          onChange={(event) => setReason(event.target.value)}
          placeholder="Objasnite zašto trebate zamjenu grupe..."
          value={reason}
        />

        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={wantPartner}
              onChange={(e) => setWantPartner(e.target.checked)}
              className="h-4 w-4 cursor-pointer rounded border-slate-300 text-blue-500"
            />
            <span className="cursor-pointer text-sm font-medium text-slate-900">
              Imam kolegu za zamjenu
            </span>
          </label>
        </div>

        {wantPartner && (
          <Input
            label="Email partnera *"
            onChange={(event) => setPartnerEmail(event.target.value)}
            placeholder="partner@fesb.hr"
            type="email"
            value={partnerEmail}
            hint="Unesite email kolege koji treba biti vaš partner u zamjeni"
          />
        )}

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
            {isSubmitting ? "Slanje..." : "Pošalji zahtjev"}
          </Button>
        </div>
      </div>
    </section>
  );
}
