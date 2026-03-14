import { useParams } from "react-router-dom";
import { InfoPanel } from "../../components/shared";
import { LABELS } from "../../constants";

export function ProfessorAutoLogPage() {
  const params = useParams<{ courseId: string }>();

  return (
    <InfoPanel
      content={params.courseId ?? "-"}
      description={LABELS.pages.professorAutoLog}
      title={LABELS.pages.professorAutoLog}
    />
  );
}
