import { CreateStudyMajorDto } from './create-study-major.dto';

export class UpdateStudyMajorDto implements Partial<CreateStudyMajorDto> {
  title?: string;
  year?: number;
}
