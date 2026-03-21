import { useNavigate } from "react-router-dom";
import { CourseCard } from "../../components/shared";
import { LABELS } from "../../constants";
import { ROUTE_PATHS } from "../../constants";
import { useCourses } from "../../hooks";

export function ProfessorCoursesPage() {
  const navigate = useNavigate();
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
        <div
          key={course.id}
          className="cursor-pointer transition-opacity hover:opacity-80 active:opacity-60"
          onClick={() =>
            navigate(ROUTE_PATHS.professor.courseDetail(course.id))
          }
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              navigate(ROUTE_PATHS.professor.courseDetail(course.id));
            }
          }}
        >
          <CourseCard
            course={course}
            subtitle={LABELS.nav.myCourses}
            variant="professor"
          />
        </div>
      ))}
    </section>
  );
}
