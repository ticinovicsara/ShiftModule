import { SwapMode } from '@repo/types';
import { CreateCourseDto } from './create-course.dto';

export class UpdateCourseDto implements Partial<CreateCourseDto> {
  title?: string;
  studyMajorId?: string;
  professorId?: string;
  swapMode?: SwapMode;
}
