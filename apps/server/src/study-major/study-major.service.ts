import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import type { IStudyMajorRepository } from '../repositories/interfaces/study-major.repository.interface';
import { CreateStudyMajorDto } from './dto/create-study-major.dto';
import { UpdateStudyMajorDto } from './dto/update-study-major.dto';

@Injectable()
export class StudyMajorService {
  constructor(
    @Inject('IStudyMajorRepository')
    private readonly studyMajorRepo: IStudyMajorRepository,
  ) {}

  async findAll() {
    return this.studyMajorRepo.findMany();
  }

  async findById(id: string) {
    const major = await this.studyMajorRepo.findById(id);
    if (!major) throw new NotFoundException(`Study major ${id} not found`);
    return major;
  }

  async create(dto: CreateStudyMajorDto) {
    return this.studyMajorRepo.create(dto);
  }

  async update(id: string, dto: UpdateStudyMajorDto) {
    await this.findById(id);
    return this.studyMajorRepo.update(id, dto);
  }

  async remove(id: string) {
    await this.findById(id);
    return this.studyMajorRepo.delete(id);
  }
}
