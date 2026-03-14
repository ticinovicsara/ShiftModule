import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui";
import { CourseCard } from "../../components/shared";
import { LABELS } from "../../constants";
import { ROUTE_PATHS } from "../../constants";
import { useCourses } from "../../hooks";

export function StudentCoursesPage() {
  const navigate = useNavigate();
  const { data, loading, error } = useCourses();

  if (loading) {
    return <p className="text-sm text-slate-500">{LABELS.common.loading}</p>;
  }

  if (error) {
    return <p className="text-sm text-danger">{error}</p>;
  }

  return (
    <section className="grid gap-4">
      {(data ?? []).map((course) => (
        <div className="grid gap-3" key={course.id}>
          <CourseCard course={course} variant="student" />
          <Button
            onClick={() => navigate(ROUTE_PATHS.student.swapStep1(course.id))}
          >
            {LABELS.pages.studentCourses}
          </Button>
        </div>
      ))}
    </section>
  );
}
