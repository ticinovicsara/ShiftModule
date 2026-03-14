# ShiftModule Frontend Study Report

Date: 2026-03-14

## Scope of study completed

I studied these sources before any frontend implementation:

- Design export folder: `C:/Users/ticin/Downloads/shift-design`
- Backend source: `apps/server/src`
- Shared types: `packages/types/src/index.ts`
- Repository backend context memory: `/memories/repo/shiftmodule-backend-context.md`

I did not implement frontend code in this phase. This was analysis only.

## Design export inventory

Found 19 exported Stitch screens. Each folder contains:

- `code.html`
- `screen.png`

No separate CSS files were present. Styling is embedded in each HTML file via Tailwind classes and inline Tailwind config.

### Screen folders found

1. `admin_automatska_raspodjela`
2. `admin_dashboard`
3. `admin_dashboard_desktop`
4. `admin_uvoz_json_podataka`
5. `e_mail_potvrda_zamjene`
6. `kolegij_na_ekanju`
7. `kolegij_odbijeno`
8. `kolegij_odobreno`
9. `kolegij_potvrda_partnera`
10. `login_screen`
11. `profesor_automatika_log`
12. `profesor_moji_kolegiji_desktop`
13. `profesor_ru_na_obrada`
14. `profesor_ru_na_obrada_desktop`
15. `profesor_ru_no_premje_tanje`
16. `profesor_ure_ivanje_s_prijavom_kvara`
17. `professor_courses`
18. `zamjena_grupe_korak_1_s_kalendarom`
19. `zamjena_grupe_korak_2`

## Design system extracted from HTML

### Core palette found in exports

Repeated exact hex values from Tailwind config:

- Primary: `#6467f2`
- Background light: `#f6f6f8`
- Background dark: `#101122`

Additional exact colors explicitly defined in some screens:

- Danger: `#ef4444`
- Success: `#10b981`
- Success alt: `#22c55e`
- Scrollbar gray / neutral token: `#dbdbe6`

### Derived semantic color usage from screen patterns

These are not all defined as custom tokens, but they are consistently used visually:

- Admin accent: primary indigo `#6467f2`
- Professor accent: still based on primary indigo, but professor screens lean more on white desktop surfaces and operational status colors
- Student accent: primary indigo on mobile, with more visible amber status chips and progress emphasis

Status semantics observed:

- Pending / waiting: amber / yellow family
- Approved / success: emerald / green family
- Rejected / danger: red family
- Auto-processed / algorithmic info: primary indigo with score chips and analytics visuals
- Full capacity: red
- Almost full: yellow / amber
- Available: green

### Typography

Primary font family across all designs:

- `Inter`

Icon font:

- `Material Symbols Outlined`

Weights observed:

- `400`
- `500`
- `600`
- `700`
- `800`
- `900`

Most common Tailwind text sizes found across all HTML:

- `text-sm` dominates
- `text-xs` heavily used for metadata, badges, helper text, bottom nav labels
- `text-base` for default body and control text
- `text-lg` for section headers and prominent card titles
- `text-xl` and `text-2xl` for page-level headings
- `text-3xl` appears on dashboard summary headers and stat numbers

Most common font-weight classes:

- `font-bold`
- `font-medium`
- `font-semibold`

### Radius system

Repeated Tailwind config values:

- default: `0.125rem`
- lg: `0.25rem`
- xl: `0.5rem`
- full: `0.75rem`

In practice, components most often use:

- `rounded-lg`
- `rounded-xl`
- `rounded-full`

### Spacing scale actually used in exports

Most repeated padding values:

- `p-4`
- `px-4`
- `px-8`
- `py-4`
- `py-5`
- `p-5`
- `p-6`
- `p-8`
- `py-3`
- `py-3.5`
- `px-6`

Most repeated margin values:

- `mb-4`
- `mt-1`
- `mb-1`
- `mt-2`
- `mb-8`

Most repeated gaps:

- `gap-1`
- `gap-2`
- `gap-3`
- `gap-4`
- `gap-6`

### Responsive behavior visible in the designs

Observed patterns:

- Mobile-first layouts dominate student and several professor/admin action flows
- Desktop-specific screens exist for admin dashboard and professor course/request management
- Exports use `md`, `lg`, `xl`, and `@container` responsive patterns
- Several mobile screens use bottom navigation
- Desktop screens use left sidebar plus sticky top header
- One important bottom-sheet modal flow exists for student swap creation

Implication for implementation:

- The React app should not mirror separate mobile and desktop pages blindly
- Instead, shared responsive components should adapt between:
  - bottom nav vs sidebar
  - card stack vs table/grid
  - full page vs modal / bottom-sheet interaction

## Reusable component patterns identified

### Base UI components needed

1. `Button`
   - Primary filled
   - Secondary muted
   - Danger outline
   - Success filled
   - Icon button
   - Filter chip / pill button

2. `Input`
   - Leading icon variant
   - Plain text field
   - Search field
   - Numeric field
   - Email field

3. `Select`
   - Standard select
   - Capacity-aware select option presentation

4. `Badge`
   - Status badge
   - Count badge
   - Small uppercase chip
   - Active filter chip

5. `Card`
   - Metric stat card
   - Course card
   - Request card
   - Info card
   - Warning card
   - Summary / preview card

6. `Modal`
   - Center modal
   - Full-height mobile bottom sheet

7. `Spinner`
   - Small inline loader
   - Full-page centered loader

8. `Avatar`
   - Initials avatar
   - Image avatar
   - Avatar group / stacked avatars

9. `Table`
   - Desktop admin table with header, rows, badges, action cell

10. `EmptyState`

- For no courses, no requests, no logs, no results

11. `ErrorState`

- API load failure, unauthorized state, server issue

### Shared business components that repeat across screens

1. `StatusBadge`
   - pending, approved, rejected, auto-resolved, full, almost-full, available

2. `CourseCard`
   - student variant
   - professor variant
   - desktop grid variant

3. `SwapRequestCard`
   - professor manual review card
   - compact recent request row

4. `CapacityBar`
   - current vs max occupancy
   - color by capacity severity

5. `MetricCard`
   - dashboards for admin and professor analytics

6. `SidebarNav`
   - admin desktop navigation
   - professor desktop navigation

7. `BottomNav`
   - student mobile navigation
   - admin mobile dashboard navigation
   - professor mobile navigation

8. `PageHeader`
   - mobile top app bar
   - desktop sticky header with actions / search

9. `SearchField`
   - header search
   - page-local search for students and courses

10. `FilterTabs`

- course status tabs
- archive / active / drafts tabs

11. `SwapProgress`

- 1/2, 2-step indicators for swap flow

12. `InfoPanel`

- algorithm note
- partner confirmation note
- action explanation note

13. `StudentMoveRow`

- professor manual reassignment per student with group select

14. `ImportPreviewTable`

- admin JSON import review with valid / invalid rows

## Screen inventory

Below is the complete screen inventory identified from the Stitch export.

### 1. Login screen

- Source: `login_screen/code.html`
- Role: all roles
- Layout: centered auth card on light background
- Data displayed:
  - email input
  - password input
  - FESB branding
- Actions:
  - log in
  - help / problems with login

### 2. Admin dashboard mobile

- Source: `admin_dashboard/code.html`
- Role: admin
- Layout: mobile dashboard with top bar and bottom nav
- Data displayed:
  - active course count
  - total students
  - pending swap requests
  - over-capacity groups
  - program / study cards
- Actions:
  - open stat detail
  - view all programs
  - open notifications
  - navigate home / requests / groups / settings

### 3. Admin dashboard desktop

- Source: `admin_dashboard_desktop/code.html`
- Role: admin
- Layout: desktop sidebar + sticky top header + stats grid + data table
- Data displayed:
  - active courses
  - total students
  - pending swaps
  - capacity alerts
  - program table with status and metrics
- Actions:
  - search
  - filter table
  - add program
  - open notifications
  - navigate dashboard / courses / students / swap requests / programs / settings

### 4. Admin student JSON import desktop

- Source: `admin_uvoz_json_podataka/code.html`
- Role: admin
- Layout: two-column desktop workspace
- Data displayed:
  - JSON textarea input
  - live preview table
  - validation status per row
  - import statistics / live update indicator
- Actions:
  - format JSON
  - copy JSON
  - open format instructions
  - cancel
  - import students

### 5. Admin automatic allocation preview

- Source: `admin_automatska_raspodjela/code.html`
- Role: admin
- Layout: modal-like summary panel
- Data displayed:
  - unassigned students count
  - groups with free seats count
  - per-group before / after distribution bars
  - delta increase / decrease chips
  - algorithm note
- Actions:
  - close modal
  - confirm automatic allocation
  - likely cancel / review action

### 6. Student course list with pending request

- Source: `kolegij_na_ekanju/code.html`
- Role: student
- Layout: mobile course list with filter tabs
- Data displayed:
  - course card with thumbnail
  - pending swap state
  - progress snippet
  - request sent timestamp
  - processing status
- Actions:
  - filter by all / in progress / pending / finished
  - open course details
  - navigate home / courses / notifications / profile

### 7. Student request rejected status

- Source: `kolegij_odbijeno/code.html`
- Role: student
- Layout: mobile status detail page
- Data displayed:
  - rejected badge
  - course name
  - rejection reason
  - alternative terms suggestion
- Actions:
  - retry request
  - open course details
  - open alternatives
  - bottom nav navigation

### 8. Student request approved course detail

- Source: `kolegij_odobreno/code.html`
- Role: student
- Layout: mobile approved detail page
- Data displayed:
  - approved badge
  - course details
  - instructor name
  - ECTS
  - new assigned group and schedule
  - confirmation message
  - audit info
- Actions:
  - open materials
  - navigate home / courses / messages / profile

### 9. Student partner-confirmation pending card

- Source: `kolegij_potvrda_partnera/code.html`
- Role: student
- Layout: mobile course overview with a special pending-partner card
- Data displayed:
  - course title
  - partner confirmation waiting state
  - progress 1/2
  - request target email
  - recommendation card
- Actions:
  - filter all / in progress / finished
  - navigate courses / confirmations / profile / settings

### 10. Email / partner confirmation page

- Source: `e_mail_potvrda_zamjene/code.html`
- Role: student partner recipient
- Layout: centered confirmation card
- Data displayed:
  - swap pair LAB1 ↔ LAB2
  - requesting student name
  - course title
  - 48h expiration note
- Actions:
  - accept swap
  - reject swap

### 11. Student swap step 1, group selection bottom sheet

- Source: `zamjena_grupe_korak_1_s_kalendarom/code.html`
- Role: student
- Layout: mobile bottom-sheet modal
- Data displayed:
  - step indicator 1/2
  - current group
  - available groups
  - occupancy bars
  - full / almost full / selected states
  - optional calendar view
- Actions:
  - close
  - toggle calendar
  - choose desired group
  - continue
  - cancel

### 12. Student swap step 2, request details

- Source: `zamjena_grupe_korak_2/code.html`
- Role: student
- Layout: mobile page / flow step
- Data displayed:
  - step indicator
  - reason textarea
  - partner toggle
  - partner email input
  - informational card about automatic processing
- Actions:
  - go back
  - submit swap request

### 13. Professor courses mobile

- Source: `professor_courses/code.html`
- Role: professor
- Layout: mobile course list with floating action button and bottom nav
- Data displayed:
  - filters for academic year / semester
  - course cards
  - pending request counts per course
  - activity type tags
  - student count per course
- Actions:
  - open search
  - add
  - open course detail
  - navigate courses / schedule / notifications / profile
  - floating help/chat action

### 14. Professor courses desktop

- Source: `profesor_moji_kolegiji_desktop/code.html`
- Role: professor
- Layout: sidebar + top header + tabbed course grid
- Data displayed:
  - active / archived / drafts tabs
  - course cards
  - swap count badge on selected courses
  - course code / term / student count
- Actions:
  - search courses
  - filter
  - create new course
  - open notifications
  - navigate dashboard / my courses / students / schedule / reports / settings

### 15. Professor manual request processing mobile

- Source: `profesor_ru_na_obrada/code.html`
- Role: professor
- Layout: mobile request review page
- Data displayed:
  - requesting student info
  - current group vs desired group
  - target group capacity
  - student reason
  - recent request mini-history
- Actions:
  - approve
  - reject
  - optionally enter rejection reason
  - navigate requests / groups / settings

### 16. Professor manual request processing desktop

- Source: `profesor_ru_na_obrada_desktop/code.html`
- Role: professor
- Layout: desktop split screen
- Data displayed:
  - lab capacities grid
  - manual requests list
  - request cards with student info, reasons, and current/desired group
- Actions:
  - search students
  - approve request
  - reject request
  - navigate dashboard / schedules / groups / manual swaps / settings

### 17. Professor manual student reassignment

- Source: `profesor_ru_no_premje_tanje/code.html`
- Role: professor
- Layout: mobile list of students in current group
- Data displayed:
  - group student roster
  - student identity / JMBAG
  - destination group selector for each student
- Actions:
  - search students
  - select new group per student
  - confirm reassignment

### 18. Professor group capacity edit + IT issue reporting

- Source: `profesor_ure_ivanje_s_prijavom_kvara/code.html`
- Role: professor or admin operational staff
- Layout: mobile edit screen
- Data displayed:
  - group/course card
  - current / max capacity inputs
  - warning about current assignments
  - technical issue form
  - IT status chip
- Actions:
  - save
  - reset
  - report IT issue
  - toggle system status
  - navigate groups / students / settings

### 19. Professor automatic mode log

- Source: `profesor_automatika_log/code.html`
- Role: professor
- Layout: mobile log / analytics page
- Data displayed:
  - processed request count
  - successful vs warning counts
  - auto-processed history entries
  - score chips
  - timestamps
- Actions:
  - navigate dashboard / logs / settings

## Navigation structures extracted

### Student mobile navigation patterns

Observed labels across screens:

- Početna / Home
- Tečajevi / Kolegiji
- Obavijesti
- Profil
- Potvrde
- Postavke
- Poruke

Implementation note:

- Final app should normalize this into one student nav system, not a different one per screen. The designs vary slightly by screen, so this needs a product decision during implementation.

### Admin navigation patterns

Mobile admin nav:

- Home
- Zahtjevi
- Grupe
- Postavke

Desktop admin sidebar:

- Dashboard
- Courses / Predmeti
- Students / Studenti
- Swap Requests
- Programs
- Settings / Postavke

### Professor navigation patterns

Mobile professor nav:

- Zahtjevi
- Grupe
- Postavke
- Kolegiji
- Raspored
- Obavijesti
- Profil

Desktop professor nav:

- Dashboard
- My Courses
- Students
- Schedule / Schedules
- Reports
- Manual Swaps
- Groups
- Settings

## Backend contract summary for frontend planning

### Auth flow

- Login endpoint: `POST /auth/login`
- Auth lookup is email-based
- Successful response envelope:
  - `{ data: { token, user }, error: null, message: 'Login successful' }`
- JWT payload fields:
  - `id`
  - `email`
  - `firstName`
  - `lastName`
  - `role`
- Roles:
  - `ADMIN`
  - `PROFESSOR`
  - `STUDENT`

### Response convention

Main business controllers return:

- `{ data, error, message }`

Frontend API client should unwrap `data` centrally.

### Shared types available from `@repo/types`

Enums:

- `UserRole`
- `SessionKind`
- `SwapMode`
- `StudentGroupStatus`
- `SwapRequestStatus`

Entity interfaces:

- `User`
- `StudyMajor`
- `Course`
- `SessionType`
- `Group`
- `StudentGroup`
- `StudentCourse`
- `SwapRequest`

### Endpoint map relevant for frontend

#### General

- `GET /` root app hello endpoint

#### Auth

- `POST /auth/login`

#### Admin: users

- `GET /admin/users`
- `GET /admin/users/students`
- `GET /admin/users/professors`
- `GET /admin/users/:id`
- `POST /admin/users`
- `POST /admin/users/import`
- `PATCH /admin/users/:id`
- `DELETE /admin/users/:id`

#### Admin: study majors

- `GET /admin/study-majors`
- `GET /admin/study-majors/:id`
- `POST /admin/study-majors`
- `PATCH /admin/study-majors/:id`
- `DELETE /admin/study-majors/:id`

#### Admin and professor: courses

- Admin:
  - `GET /admin/courses`
  - `POST /admin/courses`
  - `PATCH /admin/courses/:id`
  - `POST /admin/courses/:id/assign-professor`
  - `DELETE /admin/courses/:id`
- Professor:
  - `GET /professor/courses`
  - `GET /professor/courses/:id`
  - `PATCH /professor/courses/:id/swap-mode`

#### Admin and professor: groups

- Admin:
  - `GET /admin/groups`
  - `POST /admin/groups`
  - `PATCH /admin/groups/:id/capacity`
  - `PATCH /admin/groups/:id`
  - `DELETE /admin/groups/:id`
- Admin or professor:
  - `POST /groups/:id/report-issue`

#### Admin: session types

- `GET /admin/session-types`
- `GET /admin/session-types/course/:courseId`
- `POST /admin/session-types`
- `PATCH /admin/session-types/:id`
- `DELETE /admin/session-types/:id`

#### Student

- `GET /student/courses`
- `GET /student/requests`

#### Swap requests

- Student:
  - `GET /swap-request/student/requests`
  - `POST /swap-request/student/requests`
  - `POST /swap-request/student/requests/:id/confirm-partner`
- Professor:
  - `GET /swap-request/professor/requests`
  - `POST /swap-request/professor/requests/:id/approve`
  - `POST /swap-request/professor/requests/:id/reject`

#### Stub modules currently present but weak for frontend value

- `admin/*` scaffold controller exists but returns string stub responses
- `professor/*` scaffold controller exists but returns string stub responses

Frontend should prefer the business endpoints above, not those scaffold CRUD endpoints.

## Implementation plan I was preparing

### Step 1: design system

Create `src/components/ui/` with:

- `Button`
- `Input`
- `Select`
- `Badge`
- `Card`
- `Modal`
- `Spinner`
- `Avatar`
- `Table`
- `EmptyState`
- `ErrorState`

Design rules for these base components:

- Tailwind only
- typed props in each file
- role/status variants driven by constants, not ad hoc classes scattered through pages
- mobile and desktop variants handled by composition and props

### Step 2: API layer

Create:

- `src/api/client.ts`
- `src/api/endpoints.ts`
- `src/api/auth.api.ts`
- `src/api/admin.api.ts`
- `src/api/professor.api.ts`
- `src/api/student.api.ts`

Plan for client behavior:

- axios instance with `import.meta.env.VITE_API_URL`
- attach JWT from local storage on requests
- unwrap `{ data, error, message }`
- redirect to login on `401`
- standardize `500` and server errors in one place

### Step 3: auth

Create:

- `src/context/AuthContext.tsx`
- `src/routes/ProtectedRoute.tsx`
- `src/routes/paths.ts`

Auth state shape should include:

- current user
- token
- role
- authenticated flag
- loading state during bootstrap
- login action
- logout action

### Step 4: layouts

Create:

- `src/layouts/AuthLayout.tsx`
- `src/layouts/AppLayout.tsx`

Layout strategy:

- `AuthLayout` for centered login shell
- `AppLayout` responsive between sidebar and mobile top/bottom nav
- per-role nav configuration from constants, not hardcoded inside JSX

### Step 5: page order requested by user

Implement one at a time after approval:

1. Login
2. Admin Dashboard
3. Student Courses
4. Student Swap Modal
5. Professor Course Detail

## Planned frontend folders

Requested target structure remains valid:

- `src/api/`
- `src/components/ui/`
- `src/components/shared/`
- `src/context/`
- `src/hooks/`
- `src/layouts/`
- `src/pages/admin/`
- `src/pages/professor/`
- `src/pages/student/`
- `src/routes/`
- `src/types/`
- `src/constants/`

## Constraints and implementation notes discovered during study

1. Designs are partially inconsistent between screens.
   - Student bottom navigation labels differ by screen.
   - Admin / professor naming mixes Croatian and English.
   - The final app needs a normalized information architecture.

2. The shared color language is consistent enough to build one design system.
   - Indigo primary is stable.
   - Status colors are stable.
   - Surface and spacing language are stable.

3. The backend is real and usable now, but some modules are still scaffold-level.
   - `admin.controller.ts` and `professor.controller.ts` are scaffolds.
   - Business pages should target `user`, `course`, `group`, `session-type`, `study-major`, `student`, and `swap-request` endpoints.

4. Current backend data is mock/in-memory.
   - Good for integration work.
   - Not suitable for assuming persistence between restarts.

5. The Stitch link was provided, but no browser-authenticated extraction was completed in this study phase.
   - The local export in Downloads was the reliable source used.

## Proposed first build target

If implementation starts next, the first concrete deliverable should be:

1. Tailwind setup in the Vite client
2. shared design tokens and UI primitives
3. axios client and endpoint constants
4. auth context and protected routing
5. responsive app shell
6. login page

Only after that should role pages be added one by one.

## Files where this study is documented

This detailed report:

- `frontend-study-report.md`

Repository memory summary:

- `/memories/repo/shiftmodule-frontend-context.md`
