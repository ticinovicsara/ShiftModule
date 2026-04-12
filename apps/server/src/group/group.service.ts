import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import {
  StudentGroupStatus,
  SwapRequestStatus,
  SwapRequestType,
  type UserRole,
} from '@repo/types';
import type { IGroupRepository } from '../repositories/interfaces/group.repository.interface';
import type { ISessionTypeRepository } from '../repositories/interfaces/session-type.repository.interface';
import type { IStudentCourseRepository } from '../repositories/interfaces/student-course.repository.interface';
import type { IStudentGroupRepository } from '../repositories/interfaces/student-group.repository.interface';
import type { ISwapRequestRepository } from '../repositories/interfaces/swap-request.repository.interface';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { ReportIssueDto } from './dto/report-issue.dto';

@Injectable()
export class GroupService {
  constructor(
    @Inject('IGroupRepository')
    private readonly groupRepo: IGroupRepository,
    @Inject('IStudentGroupRepository')
    private readonly studentGroupRepo: IStudentGroupRepository,
    @Inject('ISessionTypeRepository')
    private readonly sessionTypeRepo: ISessionTypeRepository,
    @Inject('IStudentCourseRepository')
    private readonly studentCourseRepo: IStudentCourseRepository,
    @Inject('ISwapRequestRepository')
    private readonly swapRequestRepo: ISwapRequestRepository,
  ) {}

  async findAll() {
    return this.groupRepo.findMany();
  }

  async findById(id: string) {
    const group = await this.groupRepo.findById(id);
    if (!group) throw new NotFoundException(`Group ${id} not found`);
    return group;
  }

  async findBySessionType(sessionTypeId: string) {
    return this.groupRepo.findBySessionType(sessionTypeId);
  }

  async create(dto: CreateGroupDto) {
    return this.groupRepo.create({
      ...dto,
      currentCount: 0,
      isActive: true,
      sessionTypeId: dto.sessionTypeId,
    });
  }

  async update(id: string, dto: UpdateGroupDto) {
    await this.findById(id);
    return this.groupRepo.update(id, dto);
  }

  async updateCapacity(id: string, capacity: number) {
    await this.findById(id);
    if (capacity < 0) {
      throw new BadRequestException(`Capacity cannot be negative`);
    }
    return this.groupRepo.update(id, { capacity });
  }

  async incrementCount(id: string) {
    return this.groupRepo.incrementCount(id);
  }

  async decrementCount(id: string) {
    return this.groupRepo.decrementCount(id);
  }

  async hasCapacity(id: string) {
    return this.groupRepo.hasCapacity(id);
  }

  async reportIssue(id: string, dto: ReportIssueDto) {
    await this.findById(id);
    console.log(
      `IT REPORT → Group ${id}: ${dto.reason} - ${dto.description ?? ''}`,
    );
    return { message: 'Issue reported to IT department' };
  }

  async moveStudentToGroup(
    studentId: string,
    newGroupId: string,
    actor?: {
      id?: string;
      role?: UserRole;
      firstName?: string;
      lastName?: string;
    },
  ): Promise<{ success: boolean; message: string }> {
    const targetGroup = await this.findById(newGroupId);
    const targetSessionType = await this.sessionTypeRepo.findById(
      targetGroup.sessionTypeId,
    );
    if (!targetSessionType) {
      throw new NotFoundException(
        `Session type ${targetGroup.sessionTypeId} not found`,
      );
    }

    const studentCourses =
      await this.studentCourseRepo.findByStudent(studentId);
    const isEnrolledInCourse = studentCourses.some(
      (enrollment) => enrollment.courseId === targetSessionType.courseId,
    );
    if (!isEnrolledInCourse) {
      throw new BadRequestException('Student is not enrolled in target course');
    }

    const studentGroups = await this.studentGroupRepo.findByStudent(studentId);

    const studentGroupWithSameSessionType = (
      await Promise.all(
        studentGroups.map(async (studentGroup) => {
          const currentGroup = await this.groupRepo.findById(
            studentGroup.groupId,
          );
          if (!currentGroup) {
            return undefined;
          }

          return currentGroup.sessionTypeId === targetGroup.sessionTypeId
            ? studentGroup
            : undefined;
        }),
      )
    ).find((entry): entry is NonNullable<typeof entry> => Boolean(entry));

    if (!studentGroupWithSameSessionType) {
      const created = await this.studentGroupRepo.create({
        studentId,
        groupId: newGroupId,
        status: StudentGroupStatus.ASSIGNED,
      });

      await this.incrementCount(newGroupId);

      await this.swapRequestRepo.create({
        studentId,
        courseId: targetSessionType.courseId,
        sessionTypeId: targetGroup.sessionTypeId,
        currentGroupId: newGroupId,
        desiredGroupId: newGroupId,
        requestType: SwapRequestType.SOLO,
        reason:
          `Manual assignment by ${actor?.firstName ?? 'staff'} ${actor?.lastName ?? ''}`.trim(),
        partnerConfirmed: true,
        status: SwapRequestStatus.APPROVED,
        satisfiedWish: undefined,
        priorityScore: 0,
      });

      void created;
      return {
        success: true,
        message: 'Student assigned to group successfully',
      };
    }

    const studentGroup = studentGroupWithSameSessionType;
    const oldGroupId = studentGroup.groupId;

    if (oldGroupId === newGroupId) {
      return { success: true, message: 'Student is already in target group' };
    }

    await this.studentGroupRepo.update(studentGroup.id, {
      groupId: newGroupId,
      status: StudentGroupStatus.ASSIGNED,
    });

    await this.decrementCount(oldGroupId);
    await this.incrementCount(newGroupId);

    await this.swapRequestRepo.create({
      studentId,
      courseId: targetSessionType.courseId,
      sessionTypeId: targetGroup.sessionTypeId,
      currentGroupId: oldGroupId,
      desiredGroupId: newGroupId,
      requestType: SwapRequestType.SOLO,
      reason:
        `Manual move by ${actor?.firstName ?? 'staff'} ${actor?.lastName ?? ''}`.trim(),
      partnerConfirmed: true,
      status: SwapRequestStatus.APPROVED,
      satisfiedWish: undefined,
      priorityScore: 0,
    });

    return { success: true, message: 'Student moved successfully' };
  }

  async remove(id: string) {
    await this.findById(id);
    return this.groupRepo.delete(id);
  }
}
