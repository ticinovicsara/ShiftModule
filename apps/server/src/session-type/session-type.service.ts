import { Injectable, NotFoundException } from '@nestjs/common';
import { MockSessionTypeRepository } from '../repositories';
import { CreateSessionTypeDto } from './dto/create-session-type.dto';
import { UpdateSessionTypeDto } from './dto/update-session-type.dto';

@Injectable()
export class SessionTypeService {
  constructor(private readonly sessionTypeRepo: MockSessionTypeRepository) {}

  async findAll() {
    return this.sessionTypeRepo.findMany();
  }

  async findById(id: string) {
    const sessionType = await this.sessionTypeRepo.findById(id);
    if (!sessionType)
      throw new NotFoundException(`Session type ${id} not found`);
    return sessionType;
  }

  async findByCourse(courseId: string) {
    return this.sessionTypeRepo.findByCourse(courseId);
  }

  async create(dto: CreateSessionTypeDto) {
    return this.sessionTypeRepo.create(dto);
  }

  async update(id: string, dto: UpdateSessionTypeDto) {
    await this.findById(id);
    return this.sessionTypeRepo.update(id, dto);
  }

  async remove(id: string) {
    await this.findById(id);
    return this.sessionTypeRepo.delete(id);
  }
}
