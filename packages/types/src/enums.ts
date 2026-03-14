export enum UserRole {
  ADMIN = "ADMIN",
  PROFESSOR = "PROFESSOR",
  STUDENT = "STUDENT",
}

export enum SessionKind {
  LECTURE = "LECTURE",
  LAB = "LAB",
  EXERCISE = "EXERCISE",
}

export enum SwapMode {
  MANUAL = "MANUAL",
  SEMI_AUTO = "SEMI_AUTO",
  AUTO = "AUTO",
}

export enum StudentGroupStatus {
  ASSIGNED = "ASSIGNED",
  UNASSIGNED = "UNASSIGNED",
}

export enum SwapRequestStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  AUTO_RESOLVED = "AUTO_RESOLVED",
}

export enum ReportIssueReason {
  BROKEN_EQUIPMENT = "BROKEN_EQUIPMENT",
  MISSING_EQUIPMENT = "MISSING_EQUIPMENT",
  OTHER = "OTHER",
}
