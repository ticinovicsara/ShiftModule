import { Injectable } from '@nestjs/common';

@Injectable()
export class ProfessorService {
  findAll() {
    return `This action returns all professor`;
  }

  findOne(id: number) {
    return `This action returns a #${id} professor`;
  }

  remove(id: number) {
    return `This action removes a #${id} professor`;
  }
}
