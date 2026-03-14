import { useParams } from "react-router-dom";
import { Button, Input } from "../../components/ui";
import { SwapProgress } from "../../components/shared";
import { LABELS } from "../../constants";
import { useSwapRequests } from "../../hooks";

export function StudentSwapStep2Page() {
  const params = useParams<{ id: string }>();
  const { create } = useSwapRequests();

  const handleSubmit = async () => {
    if (!params.id) {
      return;
    }

    await create({
      courseId: params.id,
      activityTypeId: "activity",
      currentGroupId: "group-a",
      desiredGroupId: "group-b",
      reason: "",
    });
  };

  return (
    <section className="grid gap-4">
      <SwapProgress currentStep={2} />
      <Input
        label={LABELS.common.details}
        placeholder={LABELS.common.details}
      />
      <Button onClick={handleSubmit}>{LABELS.common.save}</Button>
    </section>
  );
}
