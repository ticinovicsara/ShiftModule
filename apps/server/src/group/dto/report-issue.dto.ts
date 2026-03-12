export class ReportIssueDto {
  reason: 'BROKEN_EQUIPMENT' | 'MISSING_EQUIPMENT' | 'OTHER';
  description?: string;
}
