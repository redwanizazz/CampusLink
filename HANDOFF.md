# CampusLink — Handoff Document
**Date:** 2026-05-19  
**Session summary:** Full audit + all three priority milestones implemented. App builds and server loads cleanly.

---

## How to start the app

```bash
# 1. Start MySQL
docker-compose up -d

# 2. Install all dependencies (if first run)
npm run install:all

# 3. Seed the database (run once after first docker-compose up)
npm run seed --prefix server

# 4. Start both client and server
npm run dev
```

- Frontend: http://localhost:5173  
- Backend: http://localhost:5000  
- API health: http://localhost:5000/api/v1/health

**Seed credentials:**
| Role    | Email                      | Password     |
|---------|----------------------------|--------------|
| Admin   | admin@campuslink.edu       | Admin@123    |
| Faculty | faculty1@campuslink.edu    | password123  |
| Student | student1@campuslink.edu    | password123  |

---

## What is fully built

### Backend — `server/src/`
| Route prefix              | Status | Notes |
|---------------------------|--------|-------|
| `/api/v1/auth`            | ✅     | register, login, getMe |
| `/api/v1/users`           | ✅     | profile, update, avatar, password |
| `/api/v1/connections`     | ✅     | discover, send/accept/reject/remove, list, pending |
| `/api/v1/chats`           | ✅     | list, messages, find-by-user, create-or-get |
| `/api/v1/departments`     | ✅     | public GET list |
| `/api/v1/academics`       | ✅     | courses, attendance, marks, cgpa, routine |
| `/api/v1/events`          | ✅     | CRUD + RSVP + my-events |
| `/api/v1/posts`           | ✅     | feed, create, get, delete, like, comment |
| `/api/v1/notices`         | ✅     | list, detail, create, delete |
| `/api/v1/notifications`   | ✅     | list, mark-read, mark-all-read, delete |
| `/api/v1/search`          | ✅     | global search across users/events/notices |
| `/api/v1/admin`           | ✅     | stats, user list, update role, verify, delete |
| `/api/v1/upload`          | ✅     | file upload (images + PDF + Word/Excel, 10 MB) |

**Middleware:**
- `auth.js` — JWT Bearer token verification
- `role.js` — `requireRole('faculty', 'admin')` RBAC (newly created)
- `upload.js` — Multer, 10 MB, whitelist MIME types

**Socket.io** (`server/src/socket/index.js`):
- JWT auth on handshake
- `join_chat` / `leave_chat` — chat rooms
- `sendMessage` — persists to DB, broadcasts to room + direct-emit to receiver (Chat.create bug fixed)
- `typing` / `stop_typing` — broadcast to room
- `message_read` — updates `read_at`, notifies sender
- `userOnline` / `userOffline` — presence tracking

### Frontend — `client/src/`
| Route                     | Page file                              | Status |
|---------------------------|----------------------------------------|--------|
| `/`                       | `pages/Landing.jsx`                    | ✅     |
| `/login`                  | `pages/auth/Login.jsx`                 | ✅     |
| `/register`               | `pages/auth/Register.jsx`              | ✅ 3-step with photo |
| `/dashboard`              | `pages/Dashboard.jsx`                  | ✅ real feed |
| `/profile/:id`            | `pages/profile/ProfileView.jsx`        | ✅ connect button wired |
| `/profile/edit`           | `pages/profile/ProfileEdit.jsx`        | ✅     |
| `/profile/settings`       | `pages/profile/Settings.jsx`           | ✅     |
| `/network`                | `pages/network/Discover.jsx`           | ✅     |
| `/network/connections`    | `pages/network/Connections.jsx`        | ✅     |
| `/network/requests`       | `pages/network/Requests.jsx`           | ✅     |
| `/messages`               | `pages/messages/Messages.jsx`          | ✅ real-time + typing |
| `/academics`              | `pages/academics/Academics.jsx`        | ✅ tab layout |
| `/academics/attendance`   | `pages/academics/Attendance.jsx`       | ✅     |
| `/academics/marks`        | `pages/academics/Marks.jsx`            | ✅     |
| `/academics/cgpa`         | `pages/academics/CGPA.jsx`             | ✅     |
| `/academics/routine`      | `pages/academics/Routine.jsx`          | ✅     |
| `/events`                 | `pages/events/Events.jsx`              | ✅     |
| `/events/:id`             | `pages/events/EventDetail.jsx`         | ✅ RSVP |
| `/events/create`          | `pages/events/CreateEvent.jsx`         | ✅ faculty/admin |
| `/events/my-events`       | `pages/events/MyEvents.jsx`            | ✅     |
| `/noticeboard`            | `pages/noticeboard/Noticeboard.jsx`    | ✅     |
| `/noticeboard/:id`        | `pages/noticeboard/NoticeDetail.jsx`   | ✅     |
| `/noticeboard/create`     | `pages/noticeboard/CreateNotice.jsx`   | ✅ faculty/admin |
| `/posts/:id`              | `pages/posts/PostDetail.jsx`           | ✅     |
| `/notifications`          | `pages/notifications/Notifications.jsx`| ✅     |
| `/search`                 | `pages/search/Search.jsx`              | ✅     |
| `/admin`                  | `pages/admin/Admin.jsx`                | ✅     |
| `/admin/users`            | `pages/admin/UserManagement.jsx`       | ✅     |
| `/403`                    | `pages/errors/Forbidden.jsx`           | ✅     |
| `*`                       | `pages/errors/NotFound.jsx`            | ✅     |

**Shared UI components:**
- `components/ui/Avatar.jsx` — initials+colour fallback, no external image service
- `components/ui/Skeleton.jsx` — `<Skeleton>`, `<CardSkeleton>`, `<PostSkeleton>`, `<TableRowSkeleton>`
- `components/ui/Button.jsx` — primary / secondary / danger variants
- `components/ui/Input.jsx` — label + inline error

---

## What is still missing

These are the remaining gaps from the original build brief:

### High priority
| Item | Where to add |
|------|-------------|
| **Forgot password / Reset password** | `nodemailer` not installed. Add `npm install nodemailer --prefix server`, add `POST /api/v1/auth/forgot-password` and `POST /api/v1/auth/reset-password/:token` to `authController.js` + `authRoutes.js`, add `/forgot-password` and `/reset-password/:token` pages |
| **JWT refresh token** | No `/api/v1/auth/refresh` or `/api/v1/auth/logout` endpoint. Refresh token should be stored as HttpOnly cookie. Add to `authController.js` and `authRoutes.js` |
| **`/academics/results`** | A dedicated Results page showing `SemesterResult` rows (the CGPA page covers this partially but the spec wants a separate route) |

### Medium priority
| Item | Notes |
|------|-------|
| **Group chat** | `Chat` model supports `type: 'group'`, `ChatMember` is set up. Need `POST /api/v1/chats/group`, socket `join_chat` room already works. UI: new group chat dialog in Messages |
| **Admin content moderation** | `/admin/content` page — reported posts/messages queue. No `reports` table defined yet |
| **Admin analytics** | `/admin/analytics` page — active users, messages sent over time |
| **File sharing in chat** | UI button exists (`Paperclip` icon in Messages.jsx) but has no handler. Wire to `/api/v1/upload` and emit `attachmentUrl` via socket |
| **Notification socket delivery** | `notification` socket event not emitted on server yet. Needs emit calls added in connection accept, new message, RSVP etc. |
| **`event_update` socket event** | Spec asks for broadcast on new event creation |

### Low priority / Polish
| Item | Notes |
|------|-------|
| Vite chunk size warning | Bundle is 568 KB; add `React.lazy` / dynamic imports for large pages (admin, academics) |
| `/profile/settings` — notification preferences | Currently only password change; add notification toggle section |
| Dark mode on Landing page | Landing page has no Navbar, so no toggle. Add a simple toggle button to the landing nav |
| `sockets/index.js` duplicate | `server/src/sockets/index.js` is an empty stub never imported. Safe to delete |
| Skeleton on `/academics` overview | The 4-card grid renders instantly but child pages have skeletons |
| Search in Navbar | Navbar search bar now links to `/search` — works, but could pass the typed query as `?q=` param |

---

## Architecture decisions to remember

- **Database is MySQL** via Docker. `server/.env` has `DB_PASSWORD=campus_password` — no `USE_SQLITE=true`.
- **Migrations vs sync:** No migration files. Tables are created via `sequelize.sync()` (in the seeder). If you change a model, run the seeder again (`npm run seed --prefix server`) — **this drops and recreates all tables**.
- **File uploads** go to `server/uploads/` (local filesystem, gitignored). Served at `http://localhost:5000/uploads/filename`.
- **Dark mode** uses Tailwind `darkMode: 'class'`. The class is applied to `<html>` and stored in `localStorage` under the key `theme`.
- **TanStack Query** `QueryClient` is in `main.jsx` with `staleTime: 2 min`. All data-fetching pages use `useQuery` / `useMutation`.
- **Role middleware** is `server/src/middleware/role.js` — use as `requireRole('faculty', 'admin')`.
- **JWT** access tokens expire in 15 min. There is currently no refresh flow — the client auto-logs-out on 401 (see `axiosInstance.js`).

---

## Key file map (quick reference)

```
server/
  src/
    app.js              ← all routes mounted here
    server.js           ← HTTP + Socket.io bootstrap
    socket/index.js     ← all Socket.io event handlers
    config/database.js  ← Sequelize (MySQL/SQLite toggle)
    models/index.js     ← all associations
    middleware/
      auth.js           ← JWT verification
      role.js           ← RBAC (NEW)
      upload.js         ← Multer (10 MB, whitelist MIME)
    controllers/        ← one file per module
    routes/             ← one file per module
    seeders/runSeeders.js

client/
  src/
    main.jsx            ← QueryClientProvider + dark mode init
    App.jsx
    routes/index.jsx    ← full route tree
    store/
      useAuthStore.js   ← user + JWT in localStorage
      useSocketStore.js ← socket singleton
    api/                ← one file per backend module
    components/
      ui/
        Avatar.jsx      ← NEW — initials fallback
        Skeleton.jsx    ← NEW — skeleton loaders
        Button.jsx
        Input.jsx
      layout/
        MainLayout.jsx
        Navbar.jsx      ← dark mode persisted (NEW)
        Sidebar.jsx     ← admin link added (NEW)
      features/
        UserCard.jsx
    pages/              ← see route table above
```

---

## Next session — recommended order

1. **Forgot password / Reset password** — install nodemailer, add endpoints + pages
2. **JWT refresh token** — add `/auth/refresh` + `/auth/logout`, store refresh in HttpOnly cookie
3. **Notification socket delivery** — emit `notification` event from connection/message/RSVP controllers
4. **File sharing in chat** — wire Paperclip button → upload → socket emit
5. **Group chat UI** — new group creation dialog, group chat view in Messages
6. **Code splitting** — `React.lazy` for admin and academics pages to fix Vite chunk warning
