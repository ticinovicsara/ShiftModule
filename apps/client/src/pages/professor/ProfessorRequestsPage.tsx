import { RequestsPage } from "../shared";

const professorTabs = [
  { label: "All", value: "all" },
  { label: "Pending manual", value: "manual" },
  { label: "Automatic requests", value: "automatic" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
];

export function ProfessorRequestsPage() {
  return (
    <RequestsPage rejectReason="Odbijeno od profesora" tabs={professorTabs} />
  );
}
