import { UserRole } from "@repo/types";
import { useParams } from "react-router-dom";
import { CourseManagementDetailPage } from "../shared";

export function AdminCourseDetailPage() {
  const params = useParams<{ id: string }>();
  if (!params.id) {
    return null;
  }

  return (
    <CourseManagementDetailPage courseId={params.id} role={UserRole.ADMIN} />
  );
}
