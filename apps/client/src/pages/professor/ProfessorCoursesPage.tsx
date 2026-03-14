import { CourseCard } from "../../components/shared";
import { LABELS } from "../../constants";
import { useCourses } from "../../hooks";

export function ProfessorCoursesPage() {
  const { data, loading, error } = useCourses();

  if (loading) {
    return <p className="text-sm text-slate-500">{LABELS.common.loading}</p>;
  }

  if (error) {
    return <p className="text-sm text-danger">{error}</p>;
  }

  return (
    <section className="grid gap-4 lg:grid-cols-2">
      {(data ?? []).map((course) => (
        <CourseCard
          course={course}
          key={course.id}
          subtitle={LABELS.nav.myCourses}
          variant="professor"
        />
      ))}
    </section>
  );
}
