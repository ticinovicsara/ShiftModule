import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { MockGroupRepository } from '../repositories/mock/mock-group.repository';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { ReportIssueDto } from './dto/report-issue.dto';

@Injectable()
export class GroupService {
  constructor(private readonly groupRepo: MockGroupRepository) {}

  async findAll() {
    return this.groupRepo.findMany();
  }

  async findById(id: string) {
    const group = await this.groupRepo.findById(id);
    if (!group) throw new NotFoundException(`Group ${id} not found`);
    return group;
  }

  async findByActivityType(activityTypeId: string) {
    return this.groupRepo.findByActivityType(activityTypeId);
  }

  async create(dto: CreateGroupDto) {
    return this.groupRepo.create({ ...dto, currentCount: 0, isActive: true });
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

  async remove(id: string) {
    await this.findById(id);
    return this.groupRepo.delete(id);
  }
}
