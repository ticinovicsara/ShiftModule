import { RequestsPage } from "../shared";

const adminTabs = [
  { label: "All", value: "all" },
  { label: "Pending manual", value: "manual" },
  { label: "Automatic requests", value: "automatic" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
];

export function AdminRequestsPage() {
  return <RequestsPage rejectReason="Odbijeno od admina" tabs={adminTabs} />;
}
