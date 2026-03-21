import { Injectable } from '@nestjs/common';
import {
  MockStudentCourseRepository,
  MockStudentGroupRepository,
  MockSwapRequestRepository,
  MockCourseRepository,
  MockGroupRepository,
  MockSessionTypeRepository,
} from '../repositories';
import { SwapRequestStatus } from '@repo/types';

@Injectable()
export class StudentService {
  constructor(
    private readonly studentCourseRepo: MockStudentCourseRepository,
    private readonly studentGroupRepo: MockStudentGroupRepository,
    private readonly swapRequestRepo: MockSwapRequestRepository,
    private readonly courseRepo: MockCourseRepository,
    private readonly groupRepo: MockGroupRepository,
    private readonly sessionTypeRepo: MockSessionTypeRepository,
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
      return null;
    }

    const course = await this.courseRepo.findById(courseId);
    const sessionTypes = await this.sessionTypeRepo.findByCourse(courseId);
    const groups = await this.getGroupsForCourse(courseId);
    const studentGroups = await this.studentGroupRepo.findByStudent(studentId);
    const currentStudentGroup = studentGroups.find((studentGroup) =>
      groups.some((group) => group.id === studentGroup.groupId),
    );
    const currentGroup = groups.find(
      (group) => group.id === currentStudentGroup?.groupId,
    );

    const requests = await this.swapRequestRepo.findByStudent(studentId);
    const requestsForCourse = requests.filter(
      (request) => request.courseId === courseId,
    );

    return {
      course,
      sessionTypes,
      currentGroup,
      groups,
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
