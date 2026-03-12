import { Injectable } from '@nestjs/common';
import {
  MockStudentCourseRepository,
  MockStudentGroupRepository,
  MockSwapRequestRepository,
  MockCourseRepository,
  MockGroupRepository,
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
  ) {}

  async getMyCourses(studentId: string) {
    const enrollments = await this.studentCourseRepo.findByStudent(studentId);
    const groups = await this.studentGroupRepo.findByStudent(studentId);
    const requests = await this.swapRequestRepo.findByStudent(studentId);

    return Promise.all(
      enrollments.map(async (enrollment) => {
        const course = await this.courseRepo.findById(enrollment.courseId);
        return {
          ...enrollment,
          course,
          groups: groups.filter((g) => g.studentId === studentId),
          activeRequest:
            requests.find(
              (r) =>
                r.courseId === enrollment.courseId &&
                r.status === SwapRequestStatus.PENDING,
            ) ?? null,
        };
      }),
    );
  }

  async getMyRequests(studentId: string) {
    return this.swapRequestRepo.findByStudent(studentId);
  }
}
