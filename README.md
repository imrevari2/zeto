# EDF Reader

  This is a web application for browsing and reading EDF files from a predefined directory. It lists the files with their validation status and shows each file's metadata.

  ## What it does

  - The application scans a specific folder for `.edf` files and displays them in a list with a status:
    - **VALID** – readable, complete metadata
    - **MISSING_METADATA** – readable, but key metadata (e.g. patient name) is absent
    - **INCONSISTENT_HEADER** – header parses but is internally inconsistent
    - **CORRUPT** – not a valid/readable EDF file
  - Opens a detail view per file with information like recording date, patient name, channel count, etc
  - Displays the signal of a selected channel in a chart.

  ## Architecture

  This is a monorepo with three folders sharing one API contract located in the api subfolder:

  edf-reader/
  ├── api/        OpenAPI spec (edf.yaml) — the source to generate code from
  ├── backend/    Java 21 + Spring Boot — reads and parses EDF, exposes REST API
  └── frontend/   React + TypeScript (Vite) — UI

  - **Backend** – Spring Boot service that reads EDF files by the help of external EDFlib-Java library, checks their status, and provides 3 GET endpoints (`/files`, `/files/content`, `/files/signal`). DTOs and controller interfaces are being generated from the API folder using OpenAPI.
  - **Frontend** – React app using MUI for the UI, React Query with a help of Orval-generated hooks for data fetching, and uPlot to display charts.
  - **API** – OpenAPI 3 spec; Backend and frontend generate type-safe code from here.

  ## Stack choice reasoning

  The three folder structure was chosen instead of a two folder to include the api contract for backend - frontend communication into a separate transparent and easily accessible folder so that both backend and
  frontend can access it and generate the code based on one contract. It makes any changes and possible future expansion more easy and transparent.
    Java 21 with Spring Boot were chosen as it was a requirement while React for frontend was chosen as it is ideal for small scale lightweight fast applications. MUI (material UI) was chosen for display the
  content as it is easy to use and provided precoded and predefined components to build a frontend from.

  
  ## Tech stack

  | Layer    | Tech                                              |
  |----------|---------------------------------------------------|
  | Backend  | Java 21, Spring Boot, OpenAPI codegen, EDFlib-Java |
  | Frontend | React, TypeScript, Vite, MUI, React Query, uPlot   |
  | Contract | OpenAPI 3 (`api/openapi/edf.yaml`)                 |

  ## Getting started

  **Prerequisites:** Java 21, Node 20+ (22 OK), and EDF files to inspect.

  ### 1. Backend

  ```bash
  cd backend
  # place the .edf files in the configured folder (see application.properties: edf.directory)
  ./mvnw spring-boot:run
  ```

  The API starts on http://localhost:8080

  ### 2. Frontend
  
  ```bash
  cd frontend
  npm install
  npm run dev
  ```

  The UI starts on http://localhost:5173

  ▎ The backend allows CORS from http://localhost:5173. Make sure the backend is running before using the UI.

  API endpoints

  ┌────────┬────────────────┬─────────────────────────────────────────┐
  │ Method │      Path      │               Description               │
  ├────────┼────────────────┼─────────────────────────────────────────┤
  │ GET    │ /files         │ List all EDF files with their status    │
  ├────────┼────────────────┼─────────────────────────────────────────┤
  │ GET    │ /files/content │ Metadata of one file (?name=)           │
  ├────────┼────────────────┼─────────────────────────────────────────┤
  │ GET    │ /files/signal  │ One channels samples (?name=&channel=)  │
  └────────┴────────────────┴─────────────────────────────────────────┘