import { SwapRequest, SwapRequestStatus } from '@repo/types';
import { mockStudentGroups } from './mock-student-groups.data';

const sg1 = mockStudentGroups[0];
const sg2 = mockStudentGroups[1];

export const mockSwapRequests: SwapRequest[] = [
  {
    id: 'swaprequest-1',
    studentId: sg1.studentId,
    courseId: 'course-osnove-1',
    sessionTypeId: 'activity-osnove-lab-1',
    currentGroupId: 'group-lab-1',
    desiredGroupId: 'group-lab-2',
    secondChoiceGroupId: undefined,
    reason: 'Preklapanje s drugim kolegijem',
    partnerEmail: 'student2@fesb.hr',
    partnerConfirmed: false,
    status: SwapRequestStatus.PENDING,
    priorityScore: 0.8,
    satisfiedWish: false,
    createdAt: new Date('2024-10-24T10:00:00Z'),
    updatedAt: new Date('2024-10-24T10:00:00Z'),
  },
  {
    id: 'swaprequest-2',
    studentId: sg2.studentId,
    courseId: 'course-osnove-1',
    sessionTypeId: 'activity-osnove-lab-1',
    currentGroupId: 'group-lab-2',
    desiredGroupId: 'group-lab-1',
    secondChoiceGroupId: undefined,
    reason: 'Želim biti s kolegicom',
    partnerEmail: 'student1@fesb.hr',
    partnerConfirmed: false,
    status: SwapRequestStatus.PENDING,
    priorityScore: 0.6,
    satisfiedWish: false,
    createdAt: new Date('2024-10-24T10:05:00Z'),
    updatedAt: new Date('2024-10-24T10:05:00Z'),
  },
];
