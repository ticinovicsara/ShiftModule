import { CourseCard } from "../../components/shared";
import { EmptyState } from "../../components/ui";
import { LABELS } from "../../constants";
import { useCourses } from "../../hooks";

export function AdminCoursesPage() {
  const { data, loading, error } = useCourses();

  if (loading) {
    return <p className="text-sm text-slate-500">{LABELS.common.loading}</p>;
  }

  if (error) {
    return <p className="text-sm text-danger">{error}</p>;
  }

  if (!data?.length) {
    return (
      <EmptyState
        title={LABELS.common.noResults}
        description={LABELS.pages.adminCourses}
      />
    );
  }

  return (
    <section className="grid gap-4 md:grid-cols-2">
      {data.map((course) => (
        <CourseCard course={course} key={course.id} variant="desktop" />
      ))}
    </section>
  );
}
