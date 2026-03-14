import type { Course } from "@repo/types";
import { Card } from "../ui";

export interface CourseCardProps {
  course: Course;
  subtitle?: string;
  variant?: "student" | "professor" | "desktop";
}

const COURSE_PATTERNS = [
  "bg-gradient-to-br from-primary/80 to-primary",
  "bg-gradient-to-br from-slate-300 to-slate-400",
  "bg-gradient-to-br from-amber-300 to-amber-400",
  "bg-gradient-to-br from-indigo-400 to-indigo-600",
  "bg-gradient-to-br from-violet-400 to-violet-600",
];

function getPatternColor(id: string) {
  const index = id.charCodeAt(0) % COURSE_PATTERNS.length;
  return COURSE_PATTERNS[index];
}

export function CourseCard({
  course,
  subtitle,
  variant = "student",
}: CourseCardProps) {
  const patternColor = getPatternColor(course.id);
  const titleClass =
    variant === "desktop" ? "text-base font-semibold" : "text-lg font-bold";

  return (
    <Card className="overflow-hidden p-0">
      {/* Slika/pattern dio */}
      <div className={`h-32 w-full ${patternColor}`} />

      {/* Info dio */}
      <div className="p-4">
        {subtitle && <p className="text-xs text-slate-500 mb-1">{subtitle}</p>}
        <p className={`${titleClass} text-slate-900 text-center`}>
          {course.title}
        </p>
        {course.swapMode && (
          <p className="text-xs text-slate-500 mt-1">{course.swapMode}</p>
        )}
      </div>
    </Card>
  );
}
