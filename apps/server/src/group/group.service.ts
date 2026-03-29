import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import type { IGroupRepository } from '../repositories/interfaces/group.repository.interface';
import type { IStudentGroupRepository } from '../repositories/interfaces/student-group.repository.interface';
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
  ): Promise<{ success: boolean; message: string }> {
    const targetGroup = await this.findById(newGroupId);

    const studentGroups = await this.studentGroupRepo.findByStudent(studentId);
    if (!studentGroups || studentGroups.length === 0) {
      throw new NotFoundException(
        `Student ${studentId} is not assigned to any group`,
      );
    }

    const studentGroupWithSameSessionType = (
      await Promise.all(
        studentGroups.map(async (studentGroup) => {
          const currentGroup = await this.groupRepo.findById(
            studentGroup.groupId,
          );
          if (!currentGroup) {
            throw new NotFoundException(
              `Group ${studentGroup.groupId} not found for student ${studentId}`,
            );
          }

          return currentGroup.sessionTypeId === targetGroup.sessionTypeId
            ? studentGroup
            : undefined;
        }),
      )
    ).find((entry): entry is NonNullable<typeof entry> => Boolean(entry));

    if (!studentGroupWithSameSessionType) {
      throw new BadRequestException(
        'Student is not assigned to a group of the selected session type',
      );
    }

    const studentGroup = studentGroupWithSameSessionType;
    const oldGroupId = studentGroup.groupId;

    // If already in the target group, no-op
    if (oldGroupId === newGroupId) {
      return { success: true, message: 'Student is already in target group' };
    }

    // Update the student's group assignment
    await this.studentGroupRepo.update(studentGroup.id, {
      groupId: newGroupId,
    });

    await this.decrementCount(oldGroupId);
    await this.incrementCount(newGroupId);

    return { success: true, message: 'Student moved successfully' };
  }

  async remove(id: string) {
    await this.findById(id);
    return this.groupRepo.delete(id);
  }
}
