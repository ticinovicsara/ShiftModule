import { Injectable, NotFoundException } from '@nestjs/common';
import { MockCourseRepository } from '../repositories/mock/mock-course.repository';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { SwapMode } from '@repo/types';

@Injectable()
export class CourseService {
  constructor(private readonly courseRepo: MockCourseRepository) {}

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
