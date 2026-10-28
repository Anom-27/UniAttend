// Domain classes and business rules. In Phase 3 each AttendanceService / AuthService method becomes one call to the Spring Boot REST API.
// SHA-256 for the demo only (a real server stores bcrypt hashes with Spring Security).
function sha256(s){
  const b=new TextEncoder().encode(s),l=b.length,n=((l+9+63)>>6)<<6,m=new Uint8Array(n);m.set(b);m[l]=128;
  const dv=new DataView(m.buffer);dv.setUint32(n-4,(l*8)>>>0);dv.setUint32(n-8,Math.floor(l*8/4294967296));
  const P=[];for(let c=2;P.length<64;c++)if(P.every(p=>c%p))P.push(c);
  const fr=x=>Math.floor((x-Math.floor(x))*4294967296)>>>0,K=P.map(p=>fr(Math.cbrt(p)));let H=P.slice(0,8).map(p=>fr(Math.sqrt(p)));
  const R=(x,k)=>(x>>>k)|(x<<(32-k));
  for(let o=0;o<n;o+=64){const w=new Array(64);for(let i=0;i<16;i++)w[i]=dv.getUint32(o+i*4);
    for(let i=16;i<64;i++){const a=R(w[i-15],7)^R(w[i-15],18)^(w[i-15]>>>3),c=R(w[i-2],17)^R(w[i-2],19)^(w[i-2]>>>10);w[i]=(w[i-16]+a+w[i-7]+c)>>>0}
    let [a,b2,c,d,e,f,g,h]=H;
    for(let i=0;i<64;i++){const t1=(h+(R(e,6)^R(e,11)^R(e,25))+((e&f)^(~e&g))+K[i]+w[i])>>>0,t2=((R(a,2)^R(a,13)^R(a,22))+((a&b2)^(a&c)^(b2&c)))>>>0;h=g;g=f;f=e;e=(d+t1)>>>0;d=c;c=b2;b2=a;a=(t1+t2)>>>0}
    H=H.map((x,i)=>(x+[a,b2,c,d,e,f,g,h][i])>>>0)}
  return H.map(x=>x.toString(16).padStart(8,'0')).join('')}
// Student IDs sort as: newest batch first (IT24 before IT23), then by number (IT24001, IT24002 ...).
function idCmp(a,b){const p=/^([A-Za-z]+)(\d{2})(\d+)$/,x=p.exec(a),y=p.exec(b);if(!x||!y)return String(a).localeCompare(String(b));
  return x[1].localeCompare(y[1])||(+y[2])-(+x[2])||(+x[3])-(+y[3])}
class User{constructor(id,name,role,email=''){Object.assign(this,{id,name,role,email,salt:'',passHash:'',fails:0,lockUntil:0,resetCode:null,resetExpiry:0,resetTries:0})}}
class Student extends User{constructor(id,name,roll,email=''){super(id,name,'student',email);this.roll=roll}}
class Teacher extends User{constructor(id,name,email=''){super(id,name,'teacher',email)}}
class Course{constructor(id,name,teacherId,studentIds,min=60){Object.assign(this,{id,name,teacherId,studentIds,min,nick:{},joinToken:null,joinExpiry:null})}}
class ClassSession{constructor(id,courseId,date,no,duration=1,status='Held'){Object.assign(this,{id,courseId,date,no,duration,status})}}
class AttendanceRecord{constructor(id,sessionId,studentId,status){Object.assign(this,{id,sessionId,studentId,status})}}
const MAX_HOURS=5,DOMAIN='mbstu.ac.bd',today=()=>new Date().toISOString().slice(0,10);
// Login, password storage and forgot-password. Passwords are never stored in plain text.
class AuthService{
  constructor(users){this.users=users}
  static check(pw){pw=String(pw);if(pw.length<8||!/[A-Za-z]/.test(pw)||!/\d/.test(pw))throw Error('Password needs at least 8 characters with a letter and a number')}
  find(email){email=String(email).trim().toLowerCase();return this.users.find(u=>u.email==email)}
  setPassword(u,pw){AuthService.check(pw);u.salt=Math.random().toString(36).slice(2)+Date.now().toString(36);u.passHash=sha256(u.salt+pw)}
  login(email,pw){const u=this.find(email),bad=Error('Wrong email or password');
    if(!u)throw bad;if(Date.now()<u.lockUntil)throw Error('Too many wrong attempts. Try again in a minute.');
    if(sha256(u.salt+String(pw))!==u.passHash){if(++u.fails>=5){u.lockUntil=Date.now()+60000;u.fails=0}throw bad}
    u.fails=0;return u}
  startReset(email){const u=this.find(email);if(!u)return null;u.resetCode=String(100000+Math.floor(Math.random()*900000));u.resetExpiry=Date.now()+600000;u.resetTries=0;return u.resetCode}
  finishReset(email,code,pw){const u=this.find(email),bad=Error('Reset code is invalid or expired');
    if(!u||!u.resetCode||Date.now()>u.resetExpiry)throw bad;
    if(++u.resetTries>5){u.resetCode=null;throw Error('Too many tries. Request a new code.')}
    if(String(code).trim()!==u.resetCode)throw bad;
    this.setPassword(u,pw);u.resetCode=null;u.fails=0;u.lockUntil=0}
}
class AttendanceService{
  constructor(){this.sessions=[];this.records=[];this.audit=[];this.seq=1000}
  held(cid){return this.sessions.filter(s=>s.courseId==cid&&s.status=='Held')}
  recs(sid){return this.records.filter(r=>r.sessionId==sid)}
  own(course,teacher){if(course.teacherId!==teacher.id)throw Error('Not your course')}
  sortIds(course){const r=id=>students.find(s=>s.id==id).roll;course.studentIds.sort((a,b)=>idCmp(r(a),r(b)))}
  // One class = one Present or Absent mark per student. The mark counts for every hour of the class (a 2-hour class is 2 present or 2 absent hours).
  take(course,teacher,date,duration,marks){
    this.own(course,teacher);
    if(!Number.isInteger(duration)||duration<1||duration>MAX_HOURS)throw Error('Class duration must be 1 to '+MAX_HOURS+' hours');
    if(!date)throw Error('Choose a date');
    if(date>today())throw Error('Future classes cannot be recorded');
    if(this.sessions.some(s=>s.courseId==course.id&&s.date==date))throw Error('A class on this date already exists');
    const s=new ClassSession(++this.seq,course.id,date,this.held(course.id).length+1,duration);this.sessions.push(s);
    course.studentIds.forEach(id=>this.records.push(new AttendanceRecord(++this.seq,s.id,id,marks[id]||'Absent')));
    return s}
  edit(course,teacher,rec,status,reason){
    this.own(course,teacher);
    const s=this.sessions.find(x=>x.id==rec.sessionId);if(!s||s.courseId!=course.id)throw Error('This record is not in your course');
    if(!String(reason).trim())throw Error('Give a reason for the correction');
    if(rec.status==status)return;
    this.audit.push({t:new Date().toLocaleString(),by:teacher.name,ref:students.find(x=>x.id==rec.studentId).roll+' ('+s.date+', '+s.duration+' h)',from:rec.status,to:status,reason:String(reason).trim()});
    rec.status=status}
  // Demo stand-in for the university account list: only the admin can add or remove entries (email -> full name).
  dirCheck(u){if(!u||u.role!='admin')throw Error('Only the admin can change the directory')}
  addDirectory(u,email,name){this.dirCheck(u);email=String(email).trim().toLowerCase();name=String(name).trim().replace(/\s+/g,' ');
    if(!email.endsWith('@'+DOMAIN)||!/^[a-z]{2}\d+$/.test(email.split('@')[0]))throw Error('Use a university email like it23049@'+DOMAIN);
    if(!/^\p{L}[\p{L} .'-]{1,59}$/u.test(name))throw Error('Enter the full name (2 to 60 letters)');
    if(DIRECTORY[email])throw Error('This email is already in the directory');DIRECTORY[email]=name}
  removeDirectory(u,email){this.dirCheck(u);if(students.some(s=>s.email==email))throw Error('This student has already joined and cannot be removed here');if(!DIRECTORY[email])throw Error('Not in the directory');delete DIRECTORY[email]}
  newLink(course,teacher){this.own(course,teacher);course.joinToken=Math.random().toString(36).slice(2,10);course.joinExpiry=Date.now()+7*864e5;return course.joinToken}
  // Full name comes from the university account (DIRECTORY here), ID from the email, nickname from the student.
  // A new student sets a password; a student who already has an account proves it with the existing password.
  join(token,email,nick,pw){
    const c=courses.find(x=>x.joinToken&&x.joinToken==String(token).trim());
    if(!c)throw Error('Invalid link code');
    if(Date.now()>c.joinExpiry)throw Error('This link has expired. Ask your teacher for a new one.');
    email=String(email).trim().toLowerCase();
    if(!email.endsWith('@'+DOMAIN))throw Error('Use your university email (@'+DOMAIN+')');
    const local=email.split('@')[0];if(!/^[a-z]{2}\d+$/.test(local))throw Error('Could not read your ID from this email');
    nick=String(nick).trim();if(!/^[A-Za-z0-9 ._-]{2,20}$/.test(nick))throw Error('Nickname must be 2 to 20 letters, numbers, space or . _ -');
    const full=DIRECTORY[email];if(!full)throw Error('This email was not found in the university directory. In this demo the admin can add it.');
    let s=students.find(x=>x.email==email);
    if(s&&c.studentIds.includes(s.id))throw Error('You already joined this course');
    if(Object.values(c.nick).some(n=>n.toLowerCase()==nick.toLowerCase()))throw Error('This nickname is already used in this course. Choose another.');
    if(s)auth.login(email,pw);else{AuthService.check(pw);s=new Student('s'+students.length,full,local.toUpperCase(),email);auth.setPassword(s,pw);students.push(s);auth.users.push(s)}
    c.studentIds.push(s.id);c.nick[s.id]=nick;this.sortIds(c);return s}
  // Percentage is counted in hours, only from held classes the student has records for.
  stat(sid,cid){
    const rs=[];this.held(cid).forEach(s=>{const r=this.records.find(x=>x.sessionId==s.id&&x.studentId==sid);if(r)rs.push({d:s.duration,p:r.status=='Present'})});
    const H=rs.reduce((a,x)=>a+x.d,0),A=rs.filter(x=>x.p).reduce((a,x)=>a+x.d,0);
    return{H,A,classes:rs.length,pct:H?A/H*100:null}}
}
