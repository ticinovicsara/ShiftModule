import { useState } from "react";
import { useParams } from "react-router-dom";
import { Button, Input } from "../../components/ui";
import { SwapProgress } from "../../components/shared";
import { LABELS } from "../../constants";
import { useSwapRequests } from "../../hooks";

export function StudentSwapStep2Page() {
  const params = useParams<{ id: string }>();
  const { create } = useSwapRequests();
  const [reason, setReason] = useState("");
  const [partnerEmail, setPartnerEmail] = useState("");

  const handleSubmit = async () => {
    if (!params.id) {
      return;
    }

    await create({
      courseId: params.id,
      sessionTypeId: "activity",
      currentGroupId: "group-a",
      desiredGroupId: "group-b",
      reason,
      partnerEmail: partnerEmail.trim() ? partnerEmail.trim() : undefined,
    });

    setReason("");
    setPartnerEmail("");
  };

  return (
    <section className="grid gap-4">
      <SwapProgress currentStep={2} />
      <Input
        label={LABELS.common.details}
        onChange={(event) => setReason(event.target.value)}
        placeholder={LABELS.common.details}
        value={reason}
      />
      <Input
        hint="Ostavi prazno za solo zahtjev. Unesi email partnera za paired zahtjev."
        label="Partner email (opcionalno)"
        onChange={(event) => setPartnerEmail(event.target.value)}
        placeholder="student2@fesb.hr"
        type="email"
        value={partnerEmail}
      />
      <Button onClick={handleSubmit}>{LABELS.common.save}</Button>
    </section>
  );
}
