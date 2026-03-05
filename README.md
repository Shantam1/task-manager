## Task Manager – Django REST + React

This project is a **multi-organization task management system** with a **Django REST Framework** backend and a **minimal React frontend**. Each user belongs to exactly one organization, and all data (projects, tasks, comments) is hard‑isolated per organization.

### Overview & Domain Model

- **Organization**: Logical tenant. A `User` belongs to exactly one organization.
- **User**: Custom Django user (`core.User`) with a foreign key to `Organization`.
- **Project**: Owned by a `User` and linked to an `Organization`.
- **Task**:
  - Fields: `title`, `description`, `status` (`todo` / `in_progress` / `done`), `project`, `assignee`, `created_by`.
  - Only users in the same organization can see or modify a task.
  - Only the **assignee** or the **project owner** can move a task to `done`.
- **Comment**: Text comment on a `Task`, created by a `User`.

Key assumptions:

- Users are pre‑created and already assigned to an `Organization` (no public signup flow).
- A user’s `organization` is mandatory in real usage, and all access is scoped using it.
- JWT authentication is used for all API calls; there are no session‑based views.

---

### Backend Setup (Django)

Requirements:

- Python 3.11+ (recommended)
- `pip` / `venv`

Steps (from the project root `task-manager`):

```bash
cd backend
python -m venv venv
venv\Scripts\activate  # on Windows
pip install -r requirements.txt  # if present, otherwise `pip install django djangorestframework djangorestframework-simplejwt drf-yasg django-cors-headers`

python manage.py migrate
python manage.py createsuperuser  # create an admin user

# (Optional) create some organizations and users in the admin
python manage.py runserver
```

The API will be available at `http://127.0.0.1:8000/`.

---

### Frontend Setup (React)

Requirements:

- Node.js 18+ and npm

Steps (from the project root `task-manager`):

```bash
cd frontend
npm install
npm start
```

The React app runs on `http://localhost:3000` and talks to the backend at `http://127.0.0.1:8000/api`.

---

### Authentication & Permissions

- **Authentication**: JWT using `djangorestframework-simplejwt`.
  - Login: `POST /api/login/` with JSON body `{ "username": "...", "password": "..." }`
    - Response contains `access` and `refresh` tokens.
  - Refresh: `POST /api/refresh/` with `{ "refresh": "<refresh_token>" }`.
  - The frontend stores the **access token** in `localStorage` under `token` and sends it as:
    - `Authorization: Bearer <access_token>`
- **Global requirement**: All viewsets use `IsAuthenticated`. Only authenticated users can access any of the core APIs.
- **Organization isolation**:
  - `UserViewSet`: `GET /api/users/` only returns users in `request.user.organization`.
  - `ProjectViewSet`: `GET /api/projects/` only returns projects in `request.user.organization`. On create, the project’s `owner` and `organization` are forced from `request.user`.
  - `TaskViewSet`:
    - Queryset only includes tasks where `task.project.organization == request.user.organization`.
    - On create/update, both `project` and `assignee` must belong to the current user’s organization, otherwise a `403` is raised.
  - `CommentViewSet`: Only comments on tasks in the user’s organization are visible.

**Task completion rule**:

- On update in `TaskViewSet`, if a task’s `status` is being set to `"done"` and the current user is **neither**:
  - the task’s `assignee`, **nor**
  - the project’s `owner`,
  then a `403` PermissionDenied is raised with an explanatory message.

This is enforced in addition to other org‑scoping checks.

---

### Core API Endpoints

All core endpoints are prefixed with `/api/` and require an `Authorization: Bearer <token>` header.

- **Auth**
  - `POST /api/login/` – get JWT access + refresh.
  - `POST /api/refresh/` – refresh access token.

- **Users**
  - `GET /api/users/` – list users in the current user’s organization.

- **Projects**
  - `GET /api/projects/` – list projects in the current user’s organization.
  - `POST /api/projects/` – create a project.
    - Request body: `{ "name": "Project Name" }`
    - `owner` and `organization` are taken from `request.user` automatically.

- **Tasks**
  - `GET /api/tasks/` – list tasks in projects owned by the user’s organization.
  - `POST /api/tasks/` – create a task.
    - Fields: `title`, `description`, `project` (id), `assignee` (user id), optional `status`.
    - Backend ensures `project.organization` and `assignee.organization` match the current user’s organization.
  - `PATCH /api/tasks/{id}/` – update a task (e.g. change `status`).
    - When setting `status` to `"done"`, only the assignee or project owner is allowed.

- **Comments**
  - `GET /api/comments/` – list comments for tasks in the user’s organization.
  - `POST /api/comments/` – create a comment.
    - Request body: `{ "task": <task_id>, "text": "Your comment" }`
    - The `user` field is always set from the authenticated `request.user`.

---

### API Documentation (Swagger / ReDoc)

Auto‑generated API documentation is provided via **drf-yasg**:

- Swagger UI: `http://127.0.0.1:8000/swagger/`
- ReDoc: `http://127.0.0.1:8000/redoc/`
- Raw schema: `http://127.0.0.1:8000/swagger.json` or `.yaml`

These endpoints are public for easier inspection and demo, but the underlying APIs they describe still require JWT authentication.

---

### Frontend Flow & Multi‑Organization Behavior

The React app is intentionally minimal and focuses on consuming the APIs:

1. **Login**
   - Screen: `Login` component.
   - Calls `POST /api/login/` and saves `access` to `localStorage`.
2. **Projects**
   - Screen: `Projects` component.
   - Calls `GET /api/projects/` and shows only projects in the current user’s organization.
   - Allows creating new projects with `POST /api/projects/`.
3. **Tasks**
   - Screen: `Tasks` component.
   - Loads tasks via `GET /api/tasks/` and filters client‑side by selected project.
   - Loads users via `GET /api/users/` so that tasks can only be assigned to users in the same organization.
   - Allows:
     - Creating tasks with `POST /api/tasks/`.
     - Changing task status using `PATCH /api/tasks/{id}/`.
       - Only shows the “Mark Done” button if the current user is the assignee or project owner and the task is `in_progress`.
4. **Comments**
   - Component: `Comments`.
   - Loads comments via `GET /api/comments/` and filters by `taskId`.
   - Adds comments with `POST /api/comments/`; the backend sets the `user`.

To demonstrate **multi‑organization behavior** in your video:

- Create at least two organizations and users (via Django admin).
- Log in as a user from Org A:
  - Create projects, tasks, and comments.
  - Verify that `/api/users/`, `/api/projects/`, `/api/tasks/`, and `/api/comments/` only surface Org A data.
- Log in as a user from Org B:
  - You should see a completely separate list of users/projects/tasks/comments.

---

### How to Run End‑to‑End for the Demo

1. **Start backend**:
   - `cd backend`
   - `venv\Scripts\activate`
   - `python manage.py runserver`
2. **Start frontend**:
   - In another terminal: `cd frontend`
   - `npm start`
3. **In the browser**:
   - Visit `http://localhost:3000`
   - Log in using a user created in Django admin.
   - Walk through:
     - Login
     - Project creation & selection
     - Task creation and status transitions (`todo` → `in_progress` → `done`)
     - Comment creation
     - Multi‑organization isolation by logging in as users from different organizations.

---

### Notes & Trade‑offs

- The frontend is intentionally simple (no routing, no advanced state management) to highlight backend behavior and permissions.
- Tasks and comments are filtered client‑side by project/task after the API returns all data scoped by organization, which keeps backend code straightforward for this exercise.
- Error messages from the backend are surfaced via toast notifications where applicable.

