# Test Run Tracking Log

## Run History

| Run ID | Timestamp        | Total Tests | Passed | Failed | Flaky | Duration | Status       |
| ------ | ---------------- | ----------- | ------ | ------ | ----- | -------- | ------------ |
| #1     | 2026-03-24 14:55 | 0           | 0      | 0      | 0     | 0s       | INITIALIZING |
| #2     | 2026-03-24 14:58 | 69          | 80%?   | 20%?   | -     | -        | FAILED       |
| #3     | 2026-03-24 15:10 | 69          | 0      | 0      | 0     | -        | RUNNING      |

## Test Suite Status

### Auth & Navigation (`auth.spec.ts`)

- [ ] Sign in with valid credentials
- [ ] Sign up with valid credentials
- [ ] Validation errors (empty fields, invalid email)
- [ ] Password length validation (8 chars)
- [ ] Password complexity validation (upper, lower, digit)
- [ ] Sign out functionality
- [ ] Navigation guards (protected routes)
- [ ] Dashboard redirect after login

### Dashboard & Analytics (`dashboard.spec.ts`)

- [ ] Display total problems solved
- [ ] Display today's problem count
- [ ] Display recent logs list
- [ ] Display current and longest streaks
- [ ] Display project counts (total/active)
- [ ] Display difficulty distribution
- [ ] Display consistency score
- [ ] Weekly progress chart rendering
- [ ] Insights panel display

### Daily Logs (`daily-log.spec.ts`)

- [ ] Create a new daily log
- [ ] Edit an existing log
- [ ] Delete a log
- [ ] Validation errors (missing date, negative problems)
- [ ] Topics management (add/remove)
- [ ] Character limit validation (notes)
- [ ] Persistence across page reloads
- [ ] Empty state handling
- [ ] Load more pagination

### DSA Problems (`dsa-problem.spec.ts`)

- [ ] Create a new DSA problem
- [ ] Edit a problem
- [ ] Delete a problem
- [ ] Filter by difficulty
- [ ] Filter by status/platform
- [ ] Validation errors
- [ ] Character limit validation (notes)
- [ ] Pattern intelligence display

### Projects & Milestones (`project.spec.ts` & `milestone.spec.ts`)

- [ ] Create a new project
- [ ] Edit a project
- [ ] Delete a project
- [ ] Status workflow (IN_PROGRESS -> COMPLETED)
- [ ] Tech stack management
- [ ] Progress calculation from milestones
- [ ] Milestone CRUD
- [ ] Milestone reordering
- [ ] Milestone completion sync

### Settings & UX (`settings.spec.ts`)

- [ ] Settings page layout
- [ ] Sidebar active state highlight
- [ ] Mobile responsive drawer
- [ ] Theme toggle (if applicable)

---

## Detailed Run Notes

### Run #2

- Status: FAILED
- Issues: WebServer crash due to missing `ensurePrismaUser` export in `user.ts`.
- Findings: Multiple tests failing with timeouts while waiting for elements (e.g., "5 problems"). Skeletons visible in screenshots suggest data-fetching issues or race conditions in `router.refresh()`.

### Run 3: Sequential & Explicit Sync

- **Status**: ✅ Improved Stability
- **Results**: 69/74 Passed (Chromium)
- **Fixes**:
  - Reduced workers to 1 to avoid DB collisions on same test user.
  - Aligned error messages with Prisma P2002 output.
  - Implemented `waitForResponse` to ensure API calls finish before UI checks.
- **Issues**: Local machine resource limits cause slow execution (~1.5m per test).
- **Service Layer**: All service layer tasks are now completed.
- **BaseURL**: Moved `baseURL` to `127.0.0.1` for consistent local testing.
- **Architecture**: Improved separation of concerns in test setup.
