import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import {
  MockGroupRepository,
  MockStudentGroupRepository,
} from '../repositories';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { ReportIssueDto } from './dto/report-issue.dto';

@Injectable()
export class GroupService {
  constructor(
    private readonly groupRepo: MockGroupRepository,
    @Inject(MockStudentGroupRepository)
    private readonly studentGroupRepo: MockStudentGroupRepository,
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
    const group = await this.findById(id);
    if (capacity < group.currentCount) {
      throw new BadRequestException(
        `Capacity cannot be less than current count (${group.currentCount})`,
      );
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
    // Verify the target group exists
    await this.findById(newGroupId);

    // Find the student's current group assignment
    const studentGroups = await this.studentGroupRepo.findByStudent(studentId);
    if (!studentGroups || studentGroups.length === 0) {
      throw new NotFoundException(
        `Student ${studentId} is not assigned to any group`,
      );
    }

    // For simplicity, move the first assignment (typically there's only one per course)
    const studentGroup = studentGroups[0];
    const oldGroupId = studentGroup.groupId;

    // If already in the target group, no-op
    if (oldGroupId === newGroupId) {
      return { success: true, message: 'Student is already in target group' };
    }

    // Update the student's group assignment
    await this.studentGroupRepo.update(studentGroup.id, {
      groupId: newGroupId,
    });

    // Decrement count in old group, increment in new group
    await this.decrementCount(oldGroupId);
    await this.incrementCount(newGroupId);

    return { success: true, message: 'Student moved successfully' };
  }

  async remove(id: string) {
    await this.findById(id);
    return this.groupRepo.delete(id);
  }
}
