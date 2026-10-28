// Demo seed data. In Phase 3 this data comes from MySQL through the backend (users table holds email, salt and password hash).
const names=['Rafi Ahmed','Nusrat Jahan','Tanvir Hasan','Mim Akter','Sabbir Hossain','Jannat Ferdous','Arif Rahman','Sadia Islam'];
const nicks=['Rafi','Nus','Tanvir','Mimi','Sabbir','Jannat','Arif','Sadi'];
// Stands in for the university account profile (Google or Microsoft sign-in) that returns the full name.
const DIRECTORY={'it24061@mbstu.ac.bd':'Pritom Kumar Sen Anom','it24009@mbstu.ac.bd':'Nadia Islam','it24010@mbstu.ac.bd':'Karim Uddin','it24011@mbstu.ac.bd':'Tania Sultana','it23002@mbstu.ac.bd':'Sumi Akter','it23015@mbstu.ac.bd':'Rubel Mia'};
const students=names.map((n,i)=>new Student('s'+i,n,'IT'+(24001+i),'it'+(24001+i)+'@'+DOMAIN));
students.forEach(s=>DIRECTORY[s.email]=s.name);
const teacher=new Teacher('t1','Dr. Karim','karim@'+DOMAIN),admin=new User('a1','Dept Admin','admin','admin@'+DOMAIN);
const auth=new AuthService([teacher,admin,...students]);
auth.setPassword(teacher,'Teacher@123');auth.setPassword(admin,'Admin@123');students.forEach(s=>auth.setPassword(s,'Student@123'));
const courses=[new Course('SE','Software Engineering','t1',students.map(s=>s.id)),new Course('DS','Data Structures','t1',students.slice(0,6).map(s=>s.id)),new Course('DB','Database Systems','t2',students.map(s=>s.id))];
courses.forEach(c=>c.studentIds.forEach(id=>c.nick[id]=nicks[+id.slice(1)]));
const svc=new AttendanceService(),durs=[2,1,2,3,2,1,2,2];
courses.forEach((c,ci)=>{for(let k=0;k<(c.id=='DB'?0:8);k++){const s=new ClassSession(++svc.seq,c.id,'2026-09-'+String(k*3+1).padStart(2,'0'),k+1,durs[k]);svc.sessions.push(s);
  c.studentIds.forEach((id,i)=>svc.records.push(new AttendanceRecord(++svc.seq,s.id,id,((i*3+k*5+ci)%(i%4==3?2:8))==0?'Absent':'Present')))}});
courses.forEach(c=>svc.sortIds(c));
