import type { Course, CreateCourseDto, UpdateCourseDto } from "@repo/types";
import { UserRole } from "@repo/types";
import { useCallback, useContext, useMemo } from "react";
import { adminApi, professorApi, studentApi } from "../api";
import { AuthContext } from "../context/AuthContext";
import { useFetch } from "./useFetch";
import { useMutation } from "./useMutation";

export function useCourses() {
  const auth = useContext(AuthContext);
  if (!auth) {
    throw new Error("useCourses must be used within AuthProvider");
  }

  const fetchAll = useCallback(async () => {
    if (auth.role === UserRole.PROFESSOR) {
      return professorApi.courses.getAll();
    }

    if (auth.role === UserRole.STUDENT) {
      return studentApi.getCourses();
    }

    return adminApi.courses.getAll();
  }, [auth.role]);
  const { data, loading, error, refetch } = useFetch<Course[]>(fetchAll, [
    fetchAll,
  ]);

  const createMutation = useMutation((dto: CreateCourseDto) =>
    adminApi.courses.create(dto),
  );
  const updateMutation = useMutation(
    (args: { id: string; dto: UpdateCourseDto }) =>
      adminApi.courses.update(args.id, args.dto),
  );
  const removeMutation = useMutation((id: string) =>
    adminApi.courses.remove(id),
  );

  const getById = useCallback(async (id: string) => {
    const fromProfessor = await professorApi.courses.getById(id);
    return fromProfessor;
  }, []);

  const getStudentCourses = useCallback(() => studentApi.getCourses(), []);

  return useMemo(
    () => ({
      data,
      loading,
      error,
      refetch,
      getById,
      getStudentCourses,
      create: createMutation.execute,
      update: updateMutation.execute,
      remove: removeMutation.execute,
      createLoading: createMutation.loading,
      updateLoading: updateMutation.loading,
      removeLoading: removeMutation.loading,
    }),
    [
      createMutation.execute,
      createMutation.loading,
      data,
      error,
      getById,
      getStudentCourses,
      loading,
      refetch,
      removeMutation.execute,
      removeMutation.loading,
      updateMutation.execute,
      updateMutation.loading,
    ],
  );
}
