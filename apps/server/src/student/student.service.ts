import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { SessionKind, SwapRequestStatus } from '@repo/types';
import type {
  IStudentCourseRepository,
  IStudentGroupRepository,
  ISwapRequestRepository,
  ICourseRepository,
  IGroupRepository,
  ISessionTypeRepository,
} from 'src/repositories';

@Injectable()
export class StudentService {
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
  ) {}

  private async getGroupsForCourse(courseId: string) {
    const sessionTypes = await this.sessionTypeRepo.findByCourse(courseId);
    const groupsPerSession = await Promise.all(
      sessionTypes.map((sessionType) =>
        this.groupRepo.findBySessionType(sessionType.id),
      ),
    );
    return groupsPerSession.flat();
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
}
