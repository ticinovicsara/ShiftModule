import { useNavigate } from "react-router-dom";
import { studentApi } from "../../api";
import { CourseCard } from "../../components/shared";
import { EmptyState, ErrorState, Spinner } from "../../components/ui";
import { LABELS } from "../../constants";
import { ROUTE_PATHS } from "../../constants";
import { useFetch } from "../../hooks";

export function StudentCoursesPage() {
  const navigate = useNavigate();
  const { data, loading, error } = useFetch(studentApi.getMyEnrollments);

  if (loading) return <Spinner />;

  if (error) {
    return <ErrorState description={error} title={LABELS.common.retry} />;
  }

  if (!data?.length) {
    return (
      <EmptyState
        description="Nema dostupnih kolegija za prikaz."
        title={LABELS.common.noResults}
      />
    );
  }

  return (
    <section className="grid gap-4">
      {data.map((item) => {
        if (!item.course) {
          return (
            <div
              className="grid gap-3 rounded-xl border border-slate-200 bg-white p-3"
              key={item.id}
            >
              <p className="text-sm font-semibold text-slate-900">
                Kolegij nije pronađen ({item.courseId})
              </p>
              <p className="text-xs text-slate-500">
                Ovaj upis postoji, ali detalji kolegija nisu dostupni.
              </p>
            </div>
          );
        }

        const course = item.course;

        return (
          <div className="grid gap-3" key={course.id}>
            <div
              className="cursor-pointer transition-opacity hover:opacity-80 active:opacity-60"
              onClick={() =>
                navigate(ROUTE_PATHS.student.courseDetail(course.id))
              }
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  navigate(ROUTE_PATHS.student.courseDetail(course.id));
                }
              }}
            >
              <CourseCard course={course} variant="student" />
            </div>
          </div>
        );
      })}
    </section>
  );
}
