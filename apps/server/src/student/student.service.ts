import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import {
  SessionKind,
  StudentGroupStatus,
  SwapRequestStatus,
  User,
  UserRole,
} from '@repo/types';
import type {
  IStudentCourseRepository,
  IStudentGroupRepository,
  ISwapRequestRepository,
  ICourseRepository,
  IGroupRepository,
  ISessionTypeRepository,
  IUserRepository,
} from 'src/repositories';

@Injectable()
export class StudentService {
  private readonly lockQueues = new Map<string, Promise<void>>();

  constructor(
    @Inject('IStudentCourseRepository')
    private readonly studentCourseRepo: IStudentCourseRepository,
    @Inject('IStudentGroupRepository')
    private readonly studentGroupRepo: IStudentGroupRepository,
    @Inject('ISwapRequestRepository')
    private readonly swapRequestRepo: ISwapRequestRepository,
    @Inject('ICourseRepository')
    private readonly courseRepo: ICourseRepository,
    @Inject('IGroupRepository')
    private readonly groupRepo: IGroupRepository,
    @Inject('ISessionTypeRepository')
    private readonly sessionTypeRepo: ISessionTypeRepository,
    @Inject('IUserRepository')
    private readonly userRepo: IUserRepository,
  ) {}

  private async withLock<T>(key: string, task: () => Promise<T>): Promise<T> {
    const previous = this.lockQueues.get(key) ?? Promise.resolve();
    let release!: () => void;
    const current = new Promise<void>((resolve) => {
      release = resolve;
    });

    this.lockQueues.set(
      key,
      previous.then(() => current),
    );
    await previous;

    try {
      return await task();
    } finally {
      release();
      if (this.lockQueues.get(key) === current) {
        this.lockQueues.delete(key);
      }
    }
  }

  private async withLocks<T>(
    keys: string[],
    task: () => Promise<T>,
  ): Promise<T> {
    const uniqueSorted = [...new Set(keys)].sort();

    const execute = async (index: number): Promise<T> => {
      if (index >= uniqueSorted.length) {
        return task();
      }
      return this.withLock(uniqueSorted[index], () => execute(index + 1));
    };

    return execute(0);
  }

  private async getGroupsForCourse(courseId: string) {
    const sessionTypes = await this.sessionTypeRepo.findByCourse(courseId);
    const groupsPerSession = await Promise.all(
      sessionTypes.map((sessionType) =>
        this.groupRepo.findBySessionType(sessionType.id),
      ),
    );
    return groupsPerSession.flat();
  }

  private normalizeEmail(value: string | undefined | null): string {
    return (value ?? '').trim().toLowerCase();
  }

  private extractImportEntries(payload: unknown): Array<{
    email: string;
    firstName?: string;
    lastName?: string;
    studentNumber?: string;
  }> {
    const root = Array.isArray(payload)
      ? payload
      : payload &&
          typeof payload === 'object' &&
          Array.isArray((payload as { students?: unknown[] }).students)
        ? (payload as { students: unknown[] }).students
        : [];

    const flat: unknown[] = [];
    const stack = [...root];

    while (stack.length > 0) {
      const next = stack.shift();
      if (Array.isArray(next)) {
        stack.unshift(...next);
        continue;
      }
      flat.push(next);
    }

    return flat
      .filter((item): item is Record<string, unknown> =>
        Boolean(item && typeof item === 'object'),
      )
      .map((item) => {
        const email =
          typeof item.korisnikoime === 'string'
            ? item.korisnikoime
            : typeof item.email === 'string'
              ? item.email
              : '';

        return {
          email: this.normalizeEmail(email),
          firstName:
            typeof item.ime === 'string'
              ? item.ime
              : typeof item.firstName === 'string'
                ? item.firstName
                : undefined,
          lastName:
            typeof item.prezime === 'string'
              ? item.prezime
              : typeof item.lastName === 'string'
                ? item.lastName
                : undefined,
          studentNumber:
            typeof item.idbroj === 'string'
              ? item.idbroj
              : typeof item.studentNumber === 'string'
                ? item.studentNumber
                : undefined,
        };
      })
      .filter((item) => Boolean(item.email));
  }

  async getCourseOverviews(studentId: string) {
    const enrollments = await this.studentCourseRepo.findByStudent(studentId);
    const studentGroups = await this.studentGroupRepo.findByStudent(studentId);
    const requests = await this.swapRequestRepo.findByStudent(studentId);

    return Promise.all(
      enrollments.map(async (enrollment) => {
        const course = await this.courseRepo.findById(enrollment.courseId);
        const groups = await this.getGroupsForCourse(enrollment.courseId);
        const currentStudentGroup = studentGroups.find((studentGroup) =>
          groups.some((group) => group.id === studentGroup.groupId),
        );
        const currentGroup = groups.find(
          (group) => group.id === currentStudentGroup?.groupId,
        );

        const requestsForCourse = requests.filter(
          (request) => request.courseId === enrollment.courseId,
        );
        const latestRequest = requestsForCourse.sort(
          (first, second) =>
            new Date(second.updatedAt).getTime() -
            new Date(first.updatedAt).getTime(),
        )[0];

        return {
          course,
          currentGroup,
          latestRequestStatus: latestRequest?.status,
          hasPendingRequest: requestsForCourse.some(
            (request) => request.status === SwapRequestStatus.PENDING,
          ),
        };
      }),
    );
  }

  async getCourseDetail(studentId: string, courseId: string) {
    const enrollments = await this.studentCourseRepo.findByStudent(studentId);
    const enrollment = enrollments.find((entry) => entry.courseId === courseId);
    if (!enrollment) {
      throw new NotFoundException('Course enrollment not found');
    }

    const course = await this.courseRepo.findById(courseId);
    const sessionTypes = await this.sessionTypeRepo.findByCourse(courseId);
    const groups = await this.getGroupsForCourse(courseId);
    const studentGroups = await this.studentGroupRepo.findByStudent(studentId);
    const currentStudentGroups = studentGroups.filter((studentGroup) =>
      groups.some((group) => group.id === studentGroup.groupId),
    );
    const currentGroups = groups.filter((group) =>
      currentStudentGroups.some(
        (studentGroup) => studentGroup.groupId === group.id,
      ),
    );
    const currentGroup = currentGroups[0] ?? null;

    const sessionTypeKindById = new Map(
      sessionTypes.map((sessionType) => [sessionType.id, sessionType.type]),
    );
    const groupsWithKind = groups.map((group) => ({
      ...group,
      sessionKind:
        sessionTypeKindById.get(group.sessionTypeId) ?? SessionKind.LAB,
    }));

    const requests = await this.swapRequestRepo.findByStudent(studentId);
    const requestsForCourse = requests.filter(
      (request) => request.courseId === courseId,
    );

    return {
      course,
      sessionTypes,
      currentGroup,
      currentGroups,
      groups: groupsWithKind,
      hasPendingRequest: requestsForCourse.some(
        (request) => request.status === SwapRequestStatus.PENDING,
      ),
    };
  }

  async getMyCourses(studentId: string) {
    const enrollments = await this.studentCourseRepo.findByStudent(studentId);
    const groups = await this.studentGroupRepo.findByStudent(studentId);
    const requests = await this.swapRequestRepo.findByStudent(studentId);

    return Promise.all(
      enrollments.map(async (enrollment) => {
        const course = await this.courseRepo.findById(enrollment.courseId);
        const latestRequestForCourse = requests
          .filter((r) => r.courseId === enrollment.courseId)
          .sort(
            (first, second) =>
              new Date(second.updatedAt).getTime() -
              new Date(first.updatedAt).getTime(),
          )[0];

        return {
          ...enrollment,
          course,
          groups: groups.filter((g) => g.studentId === studentId),
          activeRequest: latestRequestForCourse ?? null,
        };
      }),
    );
  }

  async getMyRequests(studentId: string) {
    return this.swapRequestRepo.findByStudent(studentId);
  }

  async getCourseStudents(
    studentId: string,
    courseId: string,
    sessionTypeId?: string,
  ) {
    const enrollments = await this.studentCourseRepo.findByStudent(studentId);
    const enrollment = enrollments.find((entry) => entry.courseId === courseId);
    if (!enrollment) {
      throw new NotFoundException('Course enrollment not found');
    }

    const groups = await this.getGroupsForCourse(courseId);
    const scopedGroups = sessionTypeId
      ? groups.filter((group) => group.sessionTypeId === sessionTypeId)
      : groups;
    const enrolledStudents =
      await this.studentCourseRepo.findByCourse(courseId);
    const enrolledStudentIds = new Set(
      enrolledStudents.map((entry) => entry.studentId),
    );

    const courseStudentIds = Array.from(enrolledStudentIds);
    const enrolledUsersData = await Promise.all(
      courseStudentIds.map((id) => this.userRepo.findById(id)),
    );
    const enrolledUsers = enrolledUsersData.filter(
      (user) => user !== null && user !== undefined && user.id !== studentId,
    );

    const groupAssignmentsPerGroup = await Promise.all(
      scopedGroups.map((group) => this.studentGroupRepo.findByGroup(group.id)),
    );

    const currentGroupByStudent = new Map<string, string>();
    for (const groupAssignments of groupAssignmentsPerGroup) {
      for (const assignment of groupAssignments) {
        if (!currentGroupByStudent.has(assignment.studentId)) {
          currentGroupByStudent.set(assignment.studentId, assignment.groupId);
        }
      }
    }

    return (enrolledUsers as any[]).map((user) => ({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      currentGroupId: currentGroupByStudent.get(user.id),
    }));
  }

  async enrollStudentWithoutGroup(courseId: string, studentId: string) {
    return this.withLocks(
      [`course:${courseId}`, `student:${studentId}`],
      async () => {
        const [course, student] = await Promise.all([
          this.courseRepo.findById(courseId),
          this.userRepo.findById(studentId),
        ]);

        if (!course) {
          throw new NotFoundException('Course not found');
        }

        if (!student) {
          throw new NotFoundException('Student not found');
        }

        if (student.role !== UserRole.STUDENT) {
          throw new BadRequestException('User must have STUDENT role');
        }

        const existing = await this.studentCourseRepo.findByStudent(studentId);
        const existingEnrollment = existing.find(
          (item) => item.courseId === courseId,
        );
        if (existingEnrollment) {
          return {
            alreadyEnrolled: true,
            enrollment: existingEnrollment,
          };
        }

        const enrollment = await this.studentCourseRepo.create({
          studentId,
          courseId,
        });

        return {
          alreadyEnrolled: false,
          enrollment,
        };
      },
    );
  }

  async autoAssignUngroupedStudents(
    courseId: string,
    sessionKind?: SessionKind,
  ) {
    return this.withLock(`course:${courseId}`, async () => {
      const course = await this.courseRepo.findById(courseId);
      if (!course) {
        throw new NotFoundException('Course not found');
      }

      const [allSessionTypes, enrollments] = await Promise.all([
        this.sessionTypeRepo.findByCourse(courseId),
        this.studentCourseRepo.findByCourse(courseId),
      ]);

      const sessionTypes = sessionKind
        ? allSessionTypes.filter(
            (sessionType) => sessionType.type === sessionKind,
          )
        : allSessionTypes;

      if (sessionTypes.length === 0) {
        throw new BadRequestException(
          sessionKind
            ? `No session types found for kind ${sessionKind} in this course`
            : 'No session types found for this course',
        );
      }

      const sessionGroups = await Promise.all(
        sessionTypes.map(async (sessionType) => {
          const groups = await this.groupRepo.findBySessionType(sessionType.id);
          return [sessionType.id, [...groups]] as const;
        }),
      );

      const groupsBySessionType = new Map(sessionGroups);

      let createdAssignments = 0;
      let skippedExisting = 0;
      const unresolved: Array<{
        studentId: string;
        sessionTypeId: string;
        reason: string;
      }> = [];

      for (const enrollment of enrollments) {
        const currentAssignments = await this.studentGroupRepo.findByStudent(
          enrollment.studentId,
        );

        for (const sessionType of sessionTypes) {
          const candidates = groupsBySessionType.get(sessionType.id) ?? [];

          if (candidates.length === 0) {
            unresolved.push({
              studentId: enrollment.studentId,
              sessionTypeId: sessionType.id,
              reason: 'No groups available for this session type',
            });
            continue;
          }

          const alreadyAssignedForType = currentAssignments.some((assignment) =>
            candidates.some((group) => group.id === assignment.groupId),
          );
          if (alreadyAssignedForType) {
            skippedExisting += 1;
            continue;
          }

          const targetGroup = [...candidates]
            .filter(
              (group) => group.isActive && group.currentCount < group.capacity,
            )
            .sort((first, second) => {
              if (first.currentCount !== second.currentCount) {
                return first.currentCount - second.currentCount;
              }
              return first.id.localeCompare(second.id);
            })[0];

          if (!targetGroup) {
            unresolved.push({
              studentId: enrollment.studentId,
              sessionTypeId: sessionType.id,
              reason: 'No group with available capacity',
            });
            continue;
          }

          await this.studentGroupRepo.create({
            studentId: enrollment.studentId,
            groupId: targetGroup.id,
            status: StudentGroupStatus.ASSIGNED,
          });
          await this.groupRepo.incrementCount(targetGroup.id);
          targetGroup.currentCount += 1;
          createdAssignments += 1;
        }
      }

      return {
        courseId,
        sessionKind: sessionKind ?? null,
        totalEnrollments: enrollments.length,
        totalSessionTypes: sessionTypes.length,
        createdAssignments,
        skippedExisting,
        unresolvedCount: unresolved.length,
        unresolved,
      };
    });
  }

  async importExistingStudentsToCourse(courseId: string, payload: unknown) {
    return this.withLock(`course:${courseId}`, async () => {
      const course = await this.courseRepo.findById(courseId);
      if (!course) {
        throw new NotFoundException('Course not found');
      }

      const entries = this.extractImportEntries(payload);
      if (entries.length === 0) {
        throw new BadRequestException(
          'Import payload is empty. Provide students as an array or { students: [] }',
        );
      }

      const uniqueByEmail = new Map<string, (typeof entries)[number]>();
      for (const entry of entries) {
        if (!uniqueByEmail.has(entry.email)) {
          uniqueByEmail.set(entry.email, entry);
        }
      }

      const results: Array<{
        email: string;
        status: 'enrolled' | 'already-enrolled' | 'not-found' | 'not-student';
        studentId?: string;
      }> = [];

      let enrolledCount = 0;
      let alreadyEnrolledCount = 0;
      let notFoundCount = 0;
      let notStudentCount = 0;

      for (const entry of uniqueByEmail.values()) {
        const user = await this.userRepo.findByEmail(entry.email);
        if (!user) {
          notFoundCount += 1;
          results.push({
            email: entry.email,
            status: 'not-found',
          });
          continue;
        }

        if (user.role !== UserRole.STUDENT) {
          notStudentCount += 1;
          results.push({
            email: entry.email,
            status: 'not-student',
            studentId: user.id,
          });
          continue;
        }

        const currentEnrollments = await this.studentCourseRepo.findByStudent(
          user.id,
        );
        const exists = currentEnrollments.some(
          (item) => item.courseId === courseId,
        );
        if (exists) {
          alreadyEnrolledCount += 1;
          results.push({
            email: entry.email,
            status: 'already-enrolled',
            studentId: user.id,
          });
          continue;
        }

        await this.studentCourseRepo.create({
          studentId: user.id,
          courseId,
        });

        enrolledCount += 1;
        results.push({
          email: entry.email,
          status: 'enrolled',
          studentId: user.id,
        });
      }

      return {
        courseId,
        processed: uniqueByEmail.size,
        enrolledCount,
        alreadyEnrolledCount,
        notFoundCount,
        notStudentCount,
        results,
      };
    });
  }
}
