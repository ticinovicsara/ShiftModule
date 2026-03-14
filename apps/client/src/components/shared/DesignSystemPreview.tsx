import { useState } from "react";
import {
  Avatar,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  EmptyState,
  ErrorState,
  Input,
  Modal,
  Select,
  Spinner,
  Table,
} from "../ui";

interface CourseRow {
  id: string;
  course: string;
  requests: number;
  status: "pending" | "approved" | "warning";
}

const courseRows: CourseRow[] = [
  { id: "1", course: "Osnove programiranja", requests: 5, status: "pending" },
  { id: "2", course: "Mrežni sustavi", requests: 2, status: "approved" },
  {
    id: "3",
    course: "Napredni razvoj softvera",
    requests: 9,
    status: "warning",
  },
];

const groupOptions = [
  { label: "LAB1 · 17 / 20", value: "lab1" },
  { label: "LAB2 · 19 / 20", value: "lab2" },
  { label: "LAB4 · puno", value: "lab4", disabled: true },
];

export function DesignSystemPreview() {
  const [centerModalOpen, setCenterModalOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState("lab1");
  const [validationMode, setValidationMode] = useState("strict");

  return (
    <main className="surface-grid min-h-screen bg-background-light px-4 py-6 md:px-8 lg:px-12">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <section className="overflow-hidden rounded-[32px] bg-slate-950 text-white shadow-panel">
          <div className="grid gap-8 px-6 py-8 md:px-8 lg:grid-cols-[1.3fr_0.7fr] lg:px-10 lg:py-10">
            <div>
              <Badge size="sm" variant="auto">
                Step 1 complete
              </Badge>
              <h1 className="mt-4 max-w-2xl text-4xl font-black tracking-tight md:text-5xl">
                ShiftModule UI primitives are now responsive for mobile cards
                and desktop shells.
              </h1>
              <p className="mt-4 max-w-2xl text-sm text-slate-300 md:text-base">
                This preview exists only to validate the design system before
                API, auth, routes, and pages are built. The component language
                follows the Stitch export: indigo primary, white cards, compact
                metadata, strong status badges, and mobile/desktop adaptability.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button onClick={() => setCenterModalOpen(true)}>
                  Open centered modal
                </Button>
                <Button variant="secondary" onClick={() => setSheetOpen(true)}>
                  Open mobile sheet
                </Button>
              </div>
            </div>
            <Card className="border-white/10 bg-white/5 text-white">
              <CardHeader>
                <CardTitle className="text-white">Tokens</CardTitle>
                <CardDescription className="text-slate-300">
                  Directly extracted from the Stitch export.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                {["#6467f2", "#f6f6f8", "#101122", "#10b981", "#ef4444"].map(
                  (token) => (
                    <div
                      className="rounded-xl border border-white/10 bg-white/5 p-4"
                      key={token}
                    >
                      <div
                        className="mb-3 h-10 rounded-lg"
                        style={{ backgroundColor: token }}
                      />
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                        Color
                      </p>
                      <p className="mt-1 font-semibold">{token}</p>
                    </div>
                  ),
                )}
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Buttons and badges</CardTitle>
                <CardDescription>
                  Primary actions, destructive actions, chips, and state
                  messaging.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-3">
                <Button>Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="success">Success</Button>
                <Button variant="danger">Danger</Button>
                <Button size="icon" variant="ghost">
                  ⋯
                </Button>
                <Badge variant="pending">Na čekanju</Badge>
                <Badge variant="approved">Odobreno</Badge>
                <Badge variant="rejected">Odbijeno</Badge>
                <Badge variant="warning">Skoro puno</Badge>
                <Badge variant="auto">AUTO</Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Form controls</CardTitle>
                <CardDescription>
                  Designed for login, swap flow, and professor management
                  screens.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <Input
                  label="E-mail"
                  placeholder="ivana.kovac@fesb.unist.hr"
                  leadingIcon={<span>@</span>}
                />
                <Input
                  label="Password"
                  placeholder="••••••••"
                  type="password"
                  leadingIcon={<span>•</span>}
                />
                <Select
                  label="Desired group"
                  options={groupOptions.map((option) => ({
                    ...option,
                    description: option.disabled
                      ? "Nema slobodnih mjesta"
                      : "Ponedjeljak 10:00 - 12:00",
                  }))}
                  placeholder="Choose a group"
                  value={selectedGroup}
                  onValueChange={setSelectedGroup}
                />
                <Input
                  label="Search"
                  placeholder="Search courses or students"
                  leadingIcon={<span>⌕</span>}
                  hint="Used in desktop headers and list pages."
                />
              </CardContent>
              <CardFooter className="justify-between">
                <p className="text-xs text-slate-500">
                  All controls are mobile-friendly at one column and
                  desktop-friendly at two columns.
                </p>
                <Spinner />
              </CardFooter>
            </Card>

            <Table
              columns={[
                {
                  id: "course",
                  header: "Course",
                  cell: (row) => (
                    <span className="font-semibold">{row.course}</span>
                  ),
                },
                {
                  id: "requests",
                  header: "Requests",
                  cell: (row) => row.requests,
                },
                {
                  id: "status",
                  header: "Status",
                  cell: (row) => (
                    <Badge
                      variant={
                        row.status === "approved"
                          ? "approved"
                          : row.status === "pending"
                            ? "pending"
                            : "warning"
                      }
                    >
                      {row.status}
                    </Badge>
                  ),
                },
              ]}
              rowKey={(row) => row.id}
              rows={courseRows}
            />
          </div>

          <div className="grid gap-6">
            <Card tone="info">
              <CardHeader>
                <CardTitle>Avatar and identity</CardTitle>
                <CardDescription>
                  Used in headers, requests, and student lists.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex items-center gap-3">
                <Avatar name="Admin Korisnik" size="lg" />
                <Avatar name="Ivana Kovac" />
                <Avatar name="Profesor Horvat" size="sm" />
              </CardContent>
            </Card>

            <EmptyState
              action={<Button variant="secondary">Create first course</Button>}
              description="Use this on screens where the API returns an empty list of courses, requests, or logs."
              title="No courses yet"
            />

            <ErrorState
              action={<Button variant="danger">Retry request</Button>}
              description="The API layer will feed these states once the axios client and hooks are added in the next steps."
              title="Failed to load swap requests"
            />
          </div>
        </section>
      </div>

      <Modal
        description="Desktop-friendly modal layout for forms, confirm dialogs, and import actions."
        footer={
          <div className="flex justify-end gap-3">
            <Button
              variant="secondary"
              onClick={() => setCenterModalOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={() => setCenterModalOpen(false)}>Confirm</Button>
          </div>
        }
        onClose={() => setCenterModalOpen(false)}
        open={centerModalOpen}
        title="Import students"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Input label="Import source" placeholder="students.json" />
          <Select
            label="Validation mode"
            options={[
              { label: "Strict", value: "strict" },
              { label: "Lenient", value: "lenient" },
            ]}
            value={validationMode}
            onValueChange={setValidationMode}
          />
        </div>
      </Modal>

      <Modal
        description="Bottom-sheet variant for the student swap flow on smaller screens, with a desktop-safe width fallback."
        footer={
          <div className="flex gap-3">
            <Button
              fullWidth
              variant="secondary"
              onClick={() => setSheetOpen(false)}
            >
              Odustani
            </Button>
            <Button fullWidth onClick={() => setSheetOpen(false)}>
              Nastavi
            </Button>
          </div>
        }
        onClose={() => setSheetOpen(false)}
        open={sheetOpen}
        title="Odaberite novu grupu"
        variant="bottom-sheet"
      >
        <div className="grid gap-3">
          {groupOptions.map((option) => (
            <Card
              key={option.value}
              tone={option.disabled ? "danger" : "default"}
            >
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="font-bold text-slate-900">{option.label}</p>
                  <p className="mt-1 text-sm text-slate-500">
                    Responsive card row for mobile selection or desktop modal
                    lists.
                  </p>
                </div>
                <Badge variant={option.disabled ? "full" : "primary"}>
                  {option.disabled ? "Puno" : "Dostupno"}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      </Modal>
    </main>
  );
}
