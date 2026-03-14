import type {
  Course,
  Group,
  SessionType,
  StudyMajor,
  SwapRequest,
  User,
} from "@repo/types";

export interface AdminApiContract {
  users: User[];
  studyMajors: StudyMajor[];
  courses: Course[];
  groups: Group[];
  sessionTypes: SessionType[];
  swapRequests: SwapRequest[];
}
