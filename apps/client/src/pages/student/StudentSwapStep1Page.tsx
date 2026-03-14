import { useNavigate, useParams } from "react-router-dom";
import { Select, Button } from "../../components/ui";
import { SwapProgress } from "../../components/shared";
import { LABELS } from "../../constants";
import { ROUTE_PATHS } from "../../constants";

const groupOptions = [
  { label: "LAB1", value: "lab1" },
  { label: "LAB2", value: "lab2" },
  { label: "LAB3", value: "lab3" },
];

export function StudentSwapStep1Page() {
  const navigate = useNavigate();
  const params = useParams<{ id: string }>();

  const handleContinue = () => {
    if (!params.id) {
      return;
    }

    navigate(ROUTE_PATHS.student.swapStep2(params.id));
  };

  return (
    <section className="grid gap-4">
      <SwapProgress currentStep={1} />
      <Select
        label={LABELS.nav.groups}
        onValueChange={() => undefined}
        options={groupOptions}
      />
      <Button onClick={handleContinue}>{LABELS.common.continue}</Button>
    </section>
  );
}
