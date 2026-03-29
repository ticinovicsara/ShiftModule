import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import type { ISessionTypeRepository } from '../repositories/interfaces/session-type.repository.interface';
import { CreateSessionTypeDto } from './dto/create-session-type.dto';
import { UpdateSessionTypeDto } from './dto/update-session-type.dto';

@Injectable()
export class SessionTypeService {
  constructor(
    @Inject('ISessionTypeRepository')
    private readonly sessionTypeRepo: ISessionTypeRepository,
  ) {}

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
