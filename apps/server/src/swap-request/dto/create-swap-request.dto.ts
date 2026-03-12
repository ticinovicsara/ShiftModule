export class CreateSwapRequestDto {
  courseId: string;
  activityTypeId: string;
  currentGroupId: string;
  desiredGroupId: string;
  secondChoiceGroupId?: string;
  reason?: string;
  partnerEmail?: string;
}
