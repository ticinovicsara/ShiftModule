import { SessionKind } from '@repo/types';

export class CreateSessionTypeDto {
  courseId: string;
  type: SessionKind;
}
