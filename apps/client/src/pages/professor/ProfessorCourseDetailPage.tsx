import { useParams } from "react-router-dom";
import { CourseManagementDetailPage } from "../shared";

export function ProfessorCourseDetailPage() {
  const params = useParams<{ id: string }>();
  if (!params.id) {
    return null;
  }

  return <CourseManagementDetailPage courseId={params.id} role="professor" />;
}
