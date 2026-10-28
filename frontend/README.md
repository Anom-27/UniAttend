# UniAttend frontend prototype

Author: Pritom Kumar Sen Anom (IT24061), ICT, MBSTU.

Run: open `index.html` in a browser (no install, no internet). Demo data is saved in the browser (localStorage), so a refresh or a second tab keeps it; use *Reset demo data* on the sign-in screen to start over. It is not a database and works only inside one browser on one computer. Tests: `node tests/models.test.js`.

## Features
- Individual sign-in for teacher, student and admin (university email + password, salted hashes, lockout) and forgot password with a one-time code. Demo accounts: `karim@mbstu.ac.bd` / `Teacher@123`, `it24001@mbstu.ac.bd` / `Student@123`, `admin@mbstu.ac.bd` / `Admin@123`.
- Admin-managed university directory (demo): a student can join only if the email is listed; the full name comes from it.
- Demo data is saved in the browser so a second tab works (teacher in one tab, student in another).
- Keyboard attendance on desktop: W/↑, S/↓, Enter, with the active row highlighted.
- Student IDs always sorted (IT24 before IT23, then by number), whatever order students join.
- Class duration of 1 to 5 hours; one Present or Absent mark per student per class, counted for every hour of the class.
- Course join link; students join with university email (`@mbstu.ac.bd`) and a nickname. ID comes from the email, full name from the university account (simulated by `js/data.js`).
- Teacher sheet shows nickname and ID; clicking the ID shows full name and details.
- History with correction, reason and audit log; report in hours with CSV text export.
- Student dashboard in hours (hour tiles, timeline of hour squares, Show Present / Absent / All Classes filters) with low-attendance warning (default minimum 60%); admin department report.

## Files
`index.html`, `css/style.css`, `js/models.js` (8 classes), `js/data.js` (demo data), `js/app.js` (screens), `tests/models.test.js`.

## Database plan (MySQL)
users (email, salt, password_hash), password_resets (code_hash, expires_at, tries), students, teachers, departments, courses (join_token, join_expiry, min_percent), enrollments (nickname), class_sessions (class_date, duration_hours), attendance_records (status), audit_logs.

## REST API plan (Spring Boot)
| Screen action | Endpoint |
|---|---|
| Sign in | POST /api/auth/login (email, password) |
| Forgot password | POST /api/auth/forgot-password, then POST /api/auth/reset-password (email, code, new password) |
| Teacher courses | GET /api/teacher/courses |
| Create join link | POST /api/courses/{id}/join-link |
| Join with link | POST /api/join (code, email, nickname, password) |
| Save attendance | POST /api/courses/{id}/sessions (date, durationHours, one mark per student) |
| History | GET /api/courses/{id}/sessions |
| University directory (demo) | GET, POST, DELETE /api/admin/directory (replaced by the university account in production) |
| Correct one mark | PUT /api/records/{id} (reason required, writes audit log) |
| Student details | GET /api/courses/{id}/students/{studentId} |
| Course report | GET /api/courses/{id}/report |
| Student attendance | GET /api/student/me/attendance |
| Admin report | GET /api/admin/report |

Each `AttendanceService` method becomes one `fetch()` call to the endpoint above.
