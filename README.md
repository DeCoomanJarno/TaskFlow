# TaskFlow

TaskFlow is a full-stack task and project management platform built with **Angular 19** on the frontend and **ASP.NET Core Web API + EF Core (SQLite)** on the backend. It is designed for teams that need lightweight planning, task tracking, category organization, user management, comments, and basic analytics in one place.

---

## Table of Contents

- [What TaskFlow Does](#what-taskflow-does)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Screenshots](#screenshots)
- [Core Features](#core-features)
- [How the Architecture Works](#how-the-architecture-works)
- [Backend API Overview](#backend-api-overview)
- [Local Development Setup](#local-development-setup)
- [Configuration](#configuration)
- [Database and Migrations](#database-and-migrations)
- [Testing and Validation](#testing-and-validation)
- [Troubleshooting](#troubleshooting)
- [Roadmap Ideas](#roadmap-ideas)

---

## What TaskFlow Does

TaskFlow helps teams coordinate work by combining:

- **Projects** (high-level containers)
- **Categories** (organization layers inside projects)
- **Tasks** (work items with state and movement support)
- **Comments** (collaboration and context on tasks)
- **Users** (team members and ownership)
- **Analytics + Settings UI** for operational visibility and personalization

This structure enables a Kanban-style workflow while still supporting hierarchical organization.

---

## Tech Stack

### Frontend

- Angular 19 (standalone components)
- Angular Material + CDK
- RxJS for reactive state flows
- TypeScript + SCSS

### Backend

- ASP.NET Core Web API
- Entity Framework Core
- SQLite database (`taskflow.db`)
- Swagger/OpenAPI

---

## Project Structure

```text
TaskFlow/
├── Frontend/
│   ├── src/app/
│   │   ├── core/                  # shared models/services/interceptors/toasts
│   │   └── features/components/   # task board, projects, users, settings, analytics, dialogs
│   └── src/environments/          # API base URL config
├── Backend/
│   ├── Controllers/               # REST API endpoints
│   ├── Services/                  # business logic layer
│   ├── Data/                      # DbContext + initialization
│   ├── Models/                    # EF entity models
│   ├── Dtos/                      # API DTO contracts
│   └── Migrations/                # EF Core migration history
└── README.md
```

---

## Screenshots

This repository currently does **not** include runtime product screenshots from a live environment.

Use the placeholders below as a capture checklist. Replace each line with an actual image once available.

- [Screenshot 1 — Main Tasks Workspace]
  - Capture the default **Tasks** view after login.
  - Include the top navigation, project sidebar, category list, and empty-state panel.
  - The image should clearly show where users begin organizing work.

- [Screenshot 2 — Create Project Dialog]
  - Open the "create project" dialog from the Projects section.
  - Fill sample values (for example: project name **Project 1**, owner **User X**), without saving sensitive data.
  - Ensure all form fields and validation messages (if any) are visible.

- [Screenshot 3 — Category and Task Board Populated]
  - Show a project with at least one category selected and multiple tasks visible.
  - Include examples of different task states/columns so flow is clear.
  - Prefer sample tasks like "Design UI", "Implement API", "QA Review".

- [Screenshot 4 — Task Details + Comments]
  - Open a task detail dialog/panel.
  - Show assignee/owner, status, and comments thread section.
  - Include at least one comment to demonstrate collaboration behavior.

- [Screenshot 5 — User Management View]
  - Switch to the **Users** tab and capture the user management page.
  - Ensure user list and key actions (create/delete/view) are visible.

- [Screenshot 6 — Analytics View]
  - Switch to **Analytics** and capture the full page.
  - Include charts/cards/metrics area so stakeholders can see reporting capabilities.

- [Screenshot 7 — Settings View]
  - Switch to **Settings** and capture options such as compact mode and notifications.
  - Include toggles and any save/apply controls.

> Suggested naming convention: `docs/screenshots/01-tasks-overview.png`, `02-create-project-dialog.png`, etc.

---

## Core Features

- **Task Board Management**
  - Create, update, move, and delete tasks
  - Group tasks by categories
- **Project & Category Layering**
  - Organize work by projects and nested categories
- **Comments on Tasks**
  - Create and remove task-level comments
- **User Management**
  - List users, inspect details, create, and remove users
- **Authentication Entry Point**
  - Dedicated login endpoint and login dialog integration
- **Notifications + UI Settings**
  - Toggle features such as compact mode and notifications in the UI
- **Analytics Page**
  - Dedicated application view for high-level insight panels

---

## How the Architecture Works

1. Angular UI components trigger actions through service classes.
2. Services call backend REST endpoints under `/api/*`.
3. ASP.NET controllers delegate to domain services.
4. Services use `AppDbContext` to read/write SQLite via EF Core.
5. JSON payloads are returned to the frontend and reflected in reactive UI state.

The backend enables CORS and binds to `http://0.0.0.0:5000`, allowing the Angular app to communicate during local development.

---

## Backend API Overview

Base URL (local): `http://localhost:5000/api`

### Auth
- `POST /auth/login`

### Projects
- `GET /projects`
- `GET /projects/{id}`
- `GET /projects/{projectId}/tasks`
- `POST /projects`
- `PUT /projects/{id}`
- `DELETE /projects/{id}`
- `POST /projects/{id}/enable`
- `POST /projects/{id}/disable`

### Categories
- `GET /categories`
- `GET /categories/{id}`
- `GET /categories/{categoryId}/tasks`
- `POST /categories`
- `PUT /categories/{id}`
- `DELETE /categories/{id}`

### Tasks
- `POST /tasks`
- `PUT /tasks/{taskId}`
- `POST /tasks/{taskId}/move`
- `DELETE /tasks/{taskId}`
- `GET /tasks/{taskId}/comments`
- `POST /tasks/{taskId}/comments`
- `DELETE /tasks/{taskId}/comments/{commentId}`

### Users
- `GET /users`
- `GET /users/{userId}`
- `POST /users`
- `DELETE /users/{userId}`

For interactive docs, run backend and open Swagger UI at `http://localhost:5000/swagger`.

---

## Local Development Setup

## 1) Prerequisites

- Node.js 20+ and npm
- .NET SDK 8+

## 2) Clone and enter the repo

```bash
git clone <your-repo-url>
cd TaskFlow
```

## 3) Frontend setup

```bash
cd Frontend
npm install
npm start -- --host 0.0.0.0 --port 4200
```

Frontend runs at `http://localhost:4200`.

## 4) Backend setup

In a second terminal:

```bash
cd Backend
dotnet restore
dotnet run
```

Backend runs at `http://localhost:5000` and exposes Swagger at `/swagger`.

---

## Configuration

### Frontend environment

File: `Frontend/src/environments/environment.ts`

```ts
export const environment = {
  production: true,
  apiUrl: 'http://localhost:5000/api'
};
```

### Backend app settings

File: `Backend/appsettings.json`

- SQLite connection string: `Data Source=taskflow.db`
- Audit log retention: `RetentionDays: 1`

---

## Database and Migrations

EF Core migrations live in `Backend/Migrations/`.

When the backend starts, it automatically applies pending migrations through `AppDbInitializer.Initialize(db)`.

Useful commands:

```bash
# from Backend/
dotnet ef migrations add <MigrationName>
dotnet ef database update
```

---

## Testing and Validation

### Frontend

```bash
cd Frontend
npm run build
npm test
```

### Backend

```bash
cd Backend
dotnet build
dotnet test
```

---

## Troubleshooting

- **Frontend cannot reach API**
  - Verify backend is running on port `5000`
  - Verify `environment.ts` `apiUrl` value
- **CORS issues**
  - Backend currently allows any origin/header/method; ensure requests are targeting the correct backend
- **Database issues**
  - Delete `taskflow.db` (if safe in local dev) and re-run backend to recreate schema
- **Port conflicts**
  - Change Angular port with `--port` or update backend binding in `Program.cs`

---

## Roadmap Ideas

- Role-based access control
- Real authentication tokens + refresh flow
- Advanced analytics (throughput, lead time)
- CI pipeline with lint/test/build gates
- Docker compose setup for one-command startup

