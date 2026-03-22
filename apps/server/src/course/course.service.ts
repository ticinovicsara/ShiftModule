import { Injectable, NotFoundException } from '@nestjs/common';
import { MockCourseRepository } from '../repositories/mock/mock-course.repository';
import { MockStudentCourseRepository } from '../repositories/mock/mock-student-course.repository';
import { MockSessionTypeRepository } from '../repositories/mock/mock-session-type';
import { MockGroupRepository } from '../repositories/mock/mock-group.repository';
import { MockStudentGroupRepository } from '../repositories/mock/mock-student-group.repository';
import { MockUserRepository } from '../repositories/mock/mock-user.repository';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { SwapMode, SwapRequestStatus } from '@repo/types';
import type { ReportIssueDto } from '../group/dto/report-issue.dto';
import { SwapRequestService } from '../swap-request/swap-request.service';

@Injectable()
export class CourseService {
  constructor(
    private readonly courseRepo: MockCourseRepository,
    private readonly studentCourseRepo: MockStudentCourseRepository,
    private readonly sessionTypeRepo: MockSessionTypeRepository,
    private readonly groupRepo: MockGroupRepository,
    private readonly studentGroupRepo: MockStudentGroupRepository,
    private readonly userRepo: MockUserRepository,
    private readonly swapRequestService: SwapRequestService,
  ) {}

  private async getGroupsByCourse(courseId: string) {
    const sessionTypes = await this.sessionTypeRepo.findByCourse(courseId);
    const groupsPerSession = await Promise.all(
      sessionTypes.map((sessionType) =>
        this.groupRepo.findBySessionType(sessionType.id),
      ),
    );

    return groupsPerSession.flat();
  }

  async findAll() {
    return this.courseRepo.findMany();
  }

  async findById(id: string) {
    const course = await this.courseRepo.findById(id);
    if (!course) throw new NotFoundException(`Course ${id} not found`);
    return course;
  }

  async findCoursesByProfessor(professorId: string) {
    return this.courseRepo.findMany({ where: { professorId } });
  }

  async getProfessorDashboardStats(professorId: string) {
    const courses = await this.findCoursesByProfessor(professorId);
    const courseIds = courses.map((course) => course.id);

    const studentCourses = await Promise.all(
      courseIds.map((courseId) =>
        this.studentCourseRepo.findByCourse(courseId),
      ),
    );
    const uniqueStudentIds = new Set(
      studentCourses.flat().map((studentCourse) => studentCourse.studentId),
    );

    const requestsByCourse = await Promise.all(
      courseIds.map((courseId) =>
        this.swapRequestService.getAllRequests(courseId),
      ),
    );
    const pendingSwapRequests = requestsByCourse
      .flat()
      .filter((request) => request.status === SwapRequestStatus.PENDING);

    return {
      courses: courses.length,
      students: uniqueStudentIds.size,
      pendingSwapRequests: pendingSwapRequests.length,
    };
  }

  async getCourseDetail(courseId: string) {
    const course = await this.findById(courseId);
    const sessionTypes = await this.sessionTypeRepo.findByCourse(courseId);
    const groups = await this.getGroupsByCourse(courseId);

    const sessionTypeKindById = new Map(
      sessionTypes.map((sessionType) => [sessionType.id, sessionType.type]),
    );

    const enrollments = await this.studentCourseRepo.findByCourse(courseId);
    const uniqueEnrollments = Array.from(
      new Map(
        enrollments.map((enrollment) => [enrollment.studentId, enrollment]),
      ).values(),
    );

    const groupIdsInCourse = new Set(groups.map((group) => group.id));
    const enrolledStudentGroupEntries = (
      await Promise.all(
        uniqueEnrollments.map((enrollment) =>
          this.studentGroupRepo.findByStudent(enrollment.studentId),
        ),
      )
    )
      .flat()
      .filter((studentGroup) => groupIdsInCourse.has(studentGroup.groupId));

    const assignmentCountByGroupId = new Map<string, number>();
    for (const studentGroup of enrolledStudentGroupEntries) {
      const count = assignmentCountByGroupId.get(studentGroup.groupId) ?? 0;
      assignmentCountByGroupId.set(studentGroup.groupId, count + 1);
    }

    const groupsWithActualCounts = groups.map((group) => ({
      ...group,
      currentCount: assignmentCountByGroupId.get(group.id) ?? 0,
    }));

    const students = await Promise.all(
      uniqueEnrollments.map(async (enrollment) => {
        const user = await this.userRepo.findById(enrollment.studentId);
        const studentGroups = await this.studentGroupRepo.findByStudent(
          enrollment.studentId,
        );
        const currentStudentGroup = studentGroups.find((studentGroup) =>
          groupsWithActualCounts.some(
            (group) => group.id === studentGroup.groupId,
          ),
        );
        const currentGroup = groupsWithActualCounts.find(
          (group) => group.id === currentStudentGroup?.groupId,
        );

        const assignments = studentGroups
          .map((studentGroup) => {
            const group = groupsWithActualCounts.find(
              (entry) => entry.id === studentGroup.groupId,
            );
            if (!group) {
              return null;
            }

            return {
              sessionTypeId: group.sessionTypeId,
              sessionKind: sessionTypeKindById.get(group.sessionTypeId),
              groupId: group.id,
              groupName: group.name,
            };
          })
          .filter((assignment): assignment is NonNullable<typeof assignment> =>
            Boolean(assignment),
          );

        return {
          id: enrollment.studentId,
          firstName: user?.firstName ?? 'Nepoznato',
          lastName: user?.lastName ?? 'Nepoznato',
          email: user?.email ?? '',
          currentGroupId: currentGroup?.id,
          currentGroupName: currentGroup?.name,
          assignments,
        };
      }),
    );

    const requests = await this.swapRequestService.getAllRequests(courseId);
    const pendingSwapRequests = requests.filter(
      (request) => request.status === SwapRequestStatus.PENDING,
    );

    return {
      course,
      groups: groupsWithActualCounts,
      sessionTypes,
      students,
      stats: {
        totalStudents: students.length,
        groupsCount: groupsWithActualCounts.length,
        pendingSwapRequests: pendingSwapRequests.length,
      },
    };
  }

  async reportIssue(courseId: string, dto: ReportIssueDto) {
    await this.findById(courseId);
    console.log(
      `IT REPORT → Course ${courseId}: ${dto.reason} - ${dto.description ?? ''}`,
    );
    return { message: 'Issue reported to IT department' };
  }

  async findCoursesByMajor(majorId: string) {
    return this.courseRepo.findMany({ where: { studyMajorId: majorId } });
  }

  async findWithActivityTypes(id: string) {
    const course = await this.courseRepo.findWithSessionTypes(id);
    if (!course) throw new NotFoundException(`Course ${id} not found`);
    return course;
  }

  async create(dto: CreateCourseDto) {
    return this.courseRepo.create(dto);
  }

  async update(id: string, dto: UpdateCourseDto) {
    await this.findById(id);
    return this.courseRepo.update(id, dto);
  }

  async assignProfessor(courseId: string, professorId: string) {
    await this.findById(courseId);
    return this.courseRepo.update(courseId, { professorId });
  }

  async setSwapMode(courseId: string, mode: SwapMode) {
    await this.findById(courseId);
    return this.courseRepo.update(courseId, { swapMode: mode });
  }

  async remove(id: string) {
    await this.findById(id);
    return this.courseRepo.delete(id);
  }
}
