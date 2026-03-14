import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { CourseCard } from "../../components/shared";
import { LABELS } from "../../constants";
import { useCourses } from "../../hooks";

export function AdminCourseDetailPage() {
  const params = useParams<{ id: string }>();
  const { data } = useCourses();

  const course = useMemo(
    () => data?.find((item) => item.id === params.id),
    [data, params.id],
  );

  if (!course) {
    return <p className="text-sm text-slate-500">{LABELS.common.noResults}</p>;
  }

  return <CourseCard course={course} variant="desktop" />;
}
