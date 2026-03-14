import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { CourseCard } from "../../components/shared";
import { LABELS } from "../../constants";
import { useCourses } from "../../hooks";

export function StudentCourseDetailPage() {
  const params = useParams<{ id: string }>();
  const { data } = useCourses();

  const selected = useMemo(
    () => data?.find((course) => course.id === params.id),
    [data, params.id],
  );

  if (!selected) {
    return <p className="text-sm text-slate-500">{LABELS.common.noResults}</p>;
  }

  return <CourseCard course={selected} variant="student" />;
}
