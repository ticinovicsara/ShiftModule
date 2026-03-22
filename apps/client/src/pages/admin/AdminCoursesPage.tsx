import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { CourseCard } from "../../components/shared";
import { EmptyState } from "../../components/ui";
import { adminApi } from "../../api";
import { LABELS, ROUTE_PATHS } from "../../constants";
import { useCourses, useFetch } from "../../hooks";

export function AdminCoursesPage() {
  const navigate = useNavigate();
  const { data, loading, error } = useCourses();
  const { data: professors } = useFetch(adminApi.users.getProfessors);

  const professorNameById = useMemo(() => {
    const entries: Array<[string, string]> = (professors ?? []).map(
      (professor) => [
        professor.id,
        `${professor.firstName} ${professor.lastName}`,
      ],
    );
    return new Map<string, string>(entries);
  }, [professors]);

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
        <div
          key={course.id}
          className="cursor-pointer transition-opacity hover:opacity-80 active:opacity-60"
          onClick={() => navigate(ROUTE_PATHS.admin.courseDetail(course.id))}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              navigate(ROUTE_PATHS.admin.courseDetail(course.id));
            }
          }}
        >
          <CourseCard
            course={course}
            professorName={
              course.professorId
                ? (professorNameById.get(course.professorId) ??
                  "Nije dodijeljen")
                : "Nije dodijeljen"
            }
            variant="desktop"
          />
        </div>
      ))}
    </section>
  );
}
