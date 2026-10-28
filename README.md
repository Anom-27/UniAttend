# UniAttend: A Web-Based University Attendance Management System

| | |
|---|---|
| **Student** | Pritom Kumar Sen Anom |
| **Student ID** | IT24061 |
| **Department** | ICT, Mawlana Bhashani Science and Technology University (MBSTU) |
| **Session** | 2023-2024 |
| **Course** | Software Engineering and Project Management (ICT3107) |
| **Instructor** | Dr. Ziaur Rahman |
| **Assignment** | Final Capstone Project, Part I: Proposal and Prototyping |

**UniAttend** is a proposed web application that replaces paper attendance sheets in a university. A teacher shares a join link with a course, students join with their university email, the teacher records attendance for each class (1 to 5 hours long), and students see their own attendance and percentage. An administrator manages courses and sees department reports.

> **Current project status:** This repository contains the project proposal, six UML diagrams, a Gantt chart and an interactive front-end prototype with automated rule tests. The Java Spring Boot backend and MySQL database are planned for Phase 3 and are **not implemented yet**. The prototype keeps its demo data in the browser's `localStorage`, so a refresh or a second tab keeps it (for example the teacher in one tab and a student joining in another). This works only inside one browser on one computer, and the *Reset demo data* link on the sign-in screen clears it. It is **not** a database.

## 1. Problem and proposed solution

Most departments still take attendance on paper. Sheets get lost, percentages are calculated by hand, students cannot check their own record, corrections leave no trace, and teachers must type student names and IDs into a list at the start of every course. Classes also differ in length, but a paper tick usually treats a one-hour class and a three-hour class the same.

UniAttend proposes one shared register:

- Every class has a **duration (1 to 5 hours)**. One Present or Absent mark per student counts for the **whole class**: a 2-hour class gives 2 present hours or 2 absent hours.
- The teacher never types student details. Students join a course through a **link**, signing in with their **university email**. The ID is read from the email and the full name from the university account.
- Every correction is kept in an **audit log** with who, when, what and why.

## 2. Objectives

- Let a teacher take attendance for a class in under a minute, for classes of 1 to 5 hours.
- Calculate attendance percentage automatically and correctly, in hours.
- Give each student a private view of their own attendance with a low-attendance warning.
- Remove manual student entry through the course join link.
- Keep a permanent history of every class and every correction.
- Give administrators department-level reports.
- Deliver the proposal, the six UML diagrams, the schedule and an interface prototype that uses at least five classes from the class diagram.

## 3. Scope and main features

### Teacher
- Select a course and take attendance with a **class duration of 1 to 5 hours**; each student gets one Present or Absent mark that counts for every hour of the class.
- The sheet shows each student's **nickname and ID**, always in order (newest batch first: IT24..., then IT23...). Clicking the ID shows the full name, university email, nickname and attendance summary.
- **Keyboard attendance (desktop only):** `W` or `↑` moves the highlighted row up, `S` or `↓` moves it down, `Enter` switches Present and Absent. The active row is highlighted automatically. Phones and tablets use touch.
- Mark all present or absent, save, view class history, correct a student's mark for a class with a reason (written to the audit log).
- View a course report in hours and export it as CSV.
- Create a **course join link** (random code, valid for 7 days).

### Student
- Join a course with the link, university email, a **nickname** (2 to 20 characters, unique in the course) and a password (new students create one; existing students enter their own). The ID is added automatically and the list stays sorted whatever order students join.
- See hours held, attended and missed, the percentage, a timeline of every class (date, hours, Present or Absent) drawn as hour squares, with Show Present / Absent / All Classes filters, and a warning below the course minimum (default **60%**, configurable).
- Students cannot change any record.

### Administrator
- Department attendance report (classes held, hours held, average attendance, students below the minimum).
- **University directory (demo):** add or remove a university email with the student's full name. A student can join a course only if their email is listed, and the name comes from that entry. In the real system this list is replaced by the university account (Google or Microsoft sign-in).
- Account, course and role management is planned for Phase 3.

### Accounts and security
Every teacher, student and admin has an **individual account**: the university email is the login ID, plus a password. Passwords are never stored in plain text; the database keeps a salt and a hash (the prototype uses SHA-256 for demonstration, the real system uses bcrypt through Spring Security). A password needs at least 8 characters with a letter and a number, and 5 wrong attempts lock the account for a minute.

**Forgot password:** the user enters the university email and receives a 6-digit reset code (valid 10 minutes, single use, limited tries), then sets a new password. The reply is the same whether or not the email exists. The prototype shows the code in a "demo inbox" because it cannot send email.

### Outside the current scope
Biometric or face recognition, a native mobile app, ERP integration, and any decision about exam eligibility. The university policy decides eligibility, not the software.

## 4. Core workflows

**Attendance:** teacher opens a course, picks the date and class duration, marks each student Present or Absent, saves. The class and all marks are stored, percentages update, and the class appears in the history, in each student's dashboard and in the admin report.

**Joining a course:** teacher creates the join link, shares it with the class, each student opens it and signs in with the university email, chooses a nickname, and is enrolled. The student's ID and full name are collected automatically.

## 5. Business rules

| Rule | Behaviour |
|---|---|
| Duration | A class lasts 1 to 5 whole hours. Anything else is rejected. |
| Marks | One Present or Absent record per student per class. It counts for every hour of the class. |
| Percentage | attended hours / held hours × 100, from held classes only. Example: 20 of 25 hours is 80%. |
| No classes yet | Shows N/A, not 0%. |
| Dates | Future dates are rejected. Only one class per course per date. |
| Corrections | Need a reason, are written to the audit log, and update the percentage. |
| Late joiner | A student is not charged for classes held before they joined. |
| Permissions | A teacher can only take or edit attendance for their own course. Students are read-only. |
| Student ID order | Newest batch first, then by number: IT24001, IT24002, ... IT23001, ... Kept sorted automatically when students join in any order. |
| Login | Each user signs in with their own university email and password. |
| Passwords | Stored only as salted hashes. 8+ characters with a letter and a number. 5 wrong attempts lock the account for a minute. |
| Forgot password | One-time 6-digit code, valid 10 minutes, at most 5 tries. |
| Keyboard attendance | W / ↑, S / ↓ and Enter on desktop browsers only. |
| Join link | Expires after 7 days. Only university-domain emails found in the university directory can join. One email is one student. |

## 6. Planned technology and architecture

| Area | Technology |
|---|---|
| Frontend | HTML, CSS, JavaScript (prototype already built) |
| Backend | Java, Spring Boot, Spring Security (OAuth2 sign-in with the university account) |
| Persistence | Spring Data JPA and MySQL |
| Process model | Incremental Model |
| Tools | Git and GitHub, JUnit, Mermaid, PlantUML, LaTeX |

Layered architecture: controllers, services, repositories and entities, then MySQL. In the prototype the `AttendanceService` and `AuthService` classes hold the rules; in Phase 3 each of its methods becomes one REST call.

## 7. Repository contents

```
uniattend-repo/
├── README.md                    this file
├── docs/
│   ├── PROPOSAL.md              full proposal (renders diagrams on GitHub)
│   ├── UniAttend_Proposal.pdf   proposal compiled from LaTeX
│   ├── diagrams/                PlantUML sources and PNG images
│   └── screenshots/             prototype screenshots
├── latex/                       LaTeX source of the proposal
│   ├── main.tex, proposal_body.md, titlepage.tex, preamble.tex
│   └── figures/                 images used by the PDF
└── frontend/                    interactive prototype
    ├── index.html, css/style.css
    ├── js/models.js             the 8 domain classes and business rules
    ├── js/data.js               demo data (becomes MySQL in Phase 3)
    ├── js/app.js                screens
    └── tests/models.test.js     automated rule tests
```

## 8. Where the assignment requirements are addressed

| Requirement | Where to find it |
|---|---|
| Project idea and professional proposal | [docs/PROPOSAL.md](docs/PROPOSAL.md) or [docs/UniAttend_Proposal.pdf](docs/UniAttend_Proposal.pdf): abstract, problem, objectives, scope, stakeholders, requirements, technology, risks, testing |
| Software process model | Proposal section 7: Incremental Model |
| Feasibility study, effort and cost estimate, assumptions, quality assurance, references | Proposal sections 13, 14, 15, 16 and 18 |
| Schedule, milestones, deliverables | Proposal section 8 |
| Gantt chart | Proposal section 8 (Mermaid chart, PNG in `docs/diagrams/gantt.png`) |
| Data Flow Diagram | Proposal sections 11.1 (Level 0) and 11.8 (Level 1) |
| Use Case Diagram | Proposal section 11.2, source `docs/diagrams/usecase.puml` |
| Activity Diagrams | Proposal sections 11.3 and 11.7 |
| Entity Relationship Diagram | Proposal section 11.4 |
| Class Diagram | Proposal section 11.5 |
| Object Diagram | Proposal section 11.6, source `docs/diagrams/object.puml` |
| Interface using at least 5 classes | [frontend/](frontend/): 8 classes in `frontend/js/models.js` |
| LaTeX | [latex/](latex/) and the compiled PDF |

## 9. Interface prototype

### How to open it
Extract the folder and open `frontend/index.html` in a browser. No installation and no internet are needed.

### Demo walkthrough
1. **Sign in** (open *Demo accounts* on the sign-in card): teacher `karim@mbstu.ac.bd` / `Teacher@123`. Choose **Software Engineering**, set the class duration (for example 2 hours), and take attendance with the mouse or the keyboard (`W`/`↑`, `S`/`↓`, `Enter`; the highlighted row follows you). Click an ID to see the student's details, then save.
2. **History:** open a class, type a reason and click a status to correct it. The change appears in the correction log.
3. **Join link:** open the **Join link** tab, create a link and note the code.
4. **Student join:** log out, enter the code, the email `it24009@mbstu.ac.bd` (also `it24010`, `it24011`, `it24061`) and a nickname and a password (it24009 and it24010 are new accounts; also try `it23015` and `it23002`). The full name is filled in automatically and the new ID is placed in sorted order on the sheet. If an email is not in the directory, sign in as admin first and add it under *University directory (demo)*. Then sign in as the teacher again to see the new student on the sheet.
5. **Student:** sign in as `it24001@mbstu.ac.bd` / `Student@123` to see hours, percentage, the hour-square timeline and the Show Present / Absent / All Classes filters.
6. **Admin:** sign in as `admin@mbstu.ac.bd` / `Admin@123` for the department report.
7. **Forgot password:** log out, click **Forgot password?**, enter an email, copy the code from the demo inbox and set a new password.

The university sign-in is **simulated** by a small directory in `js/data.js`. A real Google or Microsoft sign-in needs the backend and is planned for Phase 3.

### Classes used by the prototype

| Class | Role |
|---|---|
| `User`, `Student`, `Teacher` | Accounts and roles; `Student` has ID and university email |
| `Course` | Teacher, enrolled students, nicknames, minimum percentage, join link |
| `ClassSession` | One class on one date with its duration in hours |
| `AttendanceRecord` | One student, one class, Present or Absent (counts for the class hours) |
| `AttendanceService` | Take attendance, correct with audit log, join by link, keep IDs sorted, calculate percentage |
| `AuthService` | Sign in, salted password hash, lockout, forgot password |

### Automated tests
```
cd frontend
node tests/models.test.js
```
26 tests check the SHA-256 hash, sorted IDs, the admin directory, login, lockout, password rules, forgot password, the duration limit, one mark per class counted in hours, percentage in hours, corrections and the audit log, permissions, join-link rules and the late-joiner rule. The user interface was also exercised in a headless browser with no page errors.

## 10. Planned database and API

MySQL tables: `users` (email, salt, password hash), `password_resets` (code hash, expiry, tries), `students`, `teachers`, `departments`, `courses` (join token, expiry, minimum percentage), `enrollments` (nickname), `class_sessions` (date, duration in hours), `attendance_records` (status) and `audit_logs`. The REST endpoints that replace the prototype methods are listed in [frontend/README.md](frontend/README.md).

## 11. Schedule and milestones (Incremental Model)

| Milestone | Date | Deliverable |
|---|---|---|
| M1 Proposal approved | 27 Oct 2026 | Proposal, requirements, six UML diagrams, Gantt chart |
| M2 Prototype ready | 27 Oct 2026 | Interactive interface using 8 classes |
| M3 Backend and database done | 29 Nov 2026 | REST API, MySQL schema, login, roles |
| M4 Integration complete | 6 Dec 2026 | Frontend connected to backend |
| M5 Testing complete | 13 Dec 2026 | Test report, bug fixes |
| M6 Final release | 20 Dec 2026 | Deployed site, final report, source on GitHub |

These are planned milestones. Only M1 and M2 are complete.

## 12. Rebuilding documents

- **PDF:** in `latex/`, run `xelatex main.tex` twice (or upload the folder to Overleaf).
- **Diagrams:** `.puml` files render with PlantUML or the [PlantUML server](https://www.plantuml.com/plantuml). The other diagrams are Mermaid code inside `docs/PROPOSAL.md`; paste them into [Mermaid Live](https://mermaid.live).

## 13. Important implementation note

The proposal, diagrams and prototype describe the planned design. The prototype is a working demonstration of the main screens and rules, not the finished system: it has no database (demo data lives in the browser's localStorage), no real authentication (passwords are hashed in the browser only for demonstration) and no server. Those are the Phase 3 work.

---
Author: **Pritom Kumar Sen Anom (IT24061)**, ICT, MBSTU. Supervisor: Dr. Ziaur Rahman.
