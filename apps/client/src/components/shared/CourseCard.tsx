import type { Course } from "@repo/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui";

export interface CourseCardProps {
  course: Course;
  subtitle?: string;
  variant?: "student" | "professor" | "desktop";
}

export function CourseCard({
  course,
  subtitle,
  variant = "student",
}: CourseCardProps) {
  const meta = [course.studyMajorId, course.swapMode]
    .filter(Boolean)
    .join(" • ");
  const titleClass = variant === "desktop" ? "text-xl" : "text-lg";

  return (
    <Card>
      <CardHeader>
        <CardDescription>{subtitle ?? meta}</CardDescription>
        <CardTitle className={titleClass}>{course.title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0 text-sm text-slate-600">{meta}</CardContent>
    </Card>
  );
}
