import { Injectable, NotFoundException } from '@nestjs/common';
import { MockCourseRepository } from '../repositories/mock/mock-course.repository';
import { MockStudentCourseRepository } from '../repositories/mock/mock-student-course.repository';
import { MockSwapRequestRepository } from '../repositories/mock/mock-swap-request.repository';
import { MockSessionTypeRepository } from '../repositories/mock/mock-session-type';
import { MockGroupRepository } from '../repositories/mock/mock-group.repository';
import { MockStudentGroupRepository } from '../repositories/mock/mock-student-group.repository';
import { MockUserRepository } from '../repositories/mock/mock-user.repository';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { SwapMode, SwapRequestStatus } from '@repo/types';

@Injectable()
export class CourseService {
  constructor(
    private readonly courseRepo: MockCourseRepository,
    private readonly studentCourseRepo: MockStudentCourseRepository,
    private readonly swapRequestRepo: MockSwapRequestRepository,
    private readonly sessionTypeRepo: MockSessionTypeRepository,
    private readonly groupRepo: MockGroupRepository,
    private readonly studentGroupRepo: MockStudentGroupRepository,
    private readonly userRepo: MockUserRepository,
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

    const allRequests = await this.swapRequestRepo.findMany();
    const pendingSwapRequests = allRequests.filter(
      (request) =>
        courseIds.includes(request.courseId) &&
        request.status === SwapRequestStatus.PENDING,
    );

    return {
      courses: courses.length,
      students: uniqueStudentIds.size,
      pendingSwapRequests: pendingSwapRequests.length,
    };
  }

  async getCourseDetail(courseId: string) {
    const course = await this.findById(courseId);
    const groups = await this.getGroupsByCourse(courseId);

    const enrollments = await this.studentCourseRepo.findByCourse(courseId);
    const students = await Promise.all(
      enrollments.map(async (enrollment) => {
        const user = await this.userRepo.findById(enrollment.studentId);
        const studentGroups = await this.studentGroupRepo.findByStudent(
          enrollment.studentId,
        );
        const currentStudentGroup = studentGroups.find((studentGroup) =>
          groups.some((group) => group.id === studentGroup.groupId),
        );
        const currentGroup = groups.find(
          (group) => group.id === currentStudentGroup?.groupId,
        );

        return {
          id: enrollment.studentId,
          firstName: user?.firstName ?? 'Nepoznato',
          lastName: user?.lastName ?? 'Nepoznato',
          email: user?.email ?? '',
          currentGroupId: currentGroup?.id,
          currentGroupName: currentGroup?.name,
        };
      }),
    );

    const requests = await this.swapRequestRepo.findByCourse(courseId);
    const pendingSwapRequests = requests.filter(
      (request) => request.status === SwapRequestStatus.PENDING,
    );

    return {
      course,
      groups,
      students,
      stats: {
        totalStudents: students.length,
        groupsCount: groups.length,
        pendingSwapRequests: pendingSwapRequests.length,
      },
    };
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
