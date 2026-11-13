/* 班级宠物园 · 本地后端
 * 零依赖：node server.js  （默认 http://localhost:3000）
 * 提供：静态托管 / 注册登录 / 按角色数据隔离 / 动作鉴权 / SSE 实时同步 / 文件持久化
 */
'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const os = require('os');

const ROOT = __dirname;
const PUBLIC = path.join(ROOT, 'assets');
const DATA_FILE = path.join(ROOT, 'data', 'db.json');
const PORT = Number(process.env.PORT || 3000);
const SESSION_MS = 7 * 24 * 3600 * 1000;

/* ---------------- 工具 ---------------- */
const uid = () => crypto.randomBytes(6).toString('hex');
const clamp = (n, a, b) => Math.min(b, Math.max(a, n));
function hashSecret(secret, salt) { return crypto.scryptSync(String(secret), salt, 32).toString('hex'); }
function makeSecret(secret) { const salt = crypto.randomBytes(12).toString('hex'); return { salt, hash: hashSecret(secret, salt) }; }
function checkSecret(secret, salt, hash) {
  try {
    const a = Buffer.from(hashSecret(secret, salt), 'hex'), b = Buffer.from(hash, 'hex');
    return a.length === b.length && crypto.timingSafeEqual(a, b);
  } catch (e) { return false; }
}
function newToken() { return crypto.randomBytes(24).toString('hex'); }
function json(res, code, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'Content-Length': Buffer.byteLength(body) });
  res.end(body);
}
function sendError(res, code, msg) { json(res, code, { ok: false, error: msg }); }

/* ---------------- 初始数据 ---------------- */
const SPECIES_KEYS = ['cat','dog','rabbit','panda','fox','hamster','corgi','ragdoll','angora','sheep','penguin','owl','duck','parrot','dolphin','clownfish','turtle','jellyfish','dragon','kirin','pixiu','phoenix','unicorn','zhuque'];
const DEFAULT_RULES = [
  ['学习','作业完成优秀',1],['学习','课堂主动发言',2],['学习','默写全对',2],['学习','单元测验进步',3],
  ['学习','早读认真专注',1],['学习','订正态度认真',1],['学习','作业未按时交',-2],['学习','上课开小差',-1],
  ['行为','主动帮助同学',2],['行为','拾金不昧',3],['行为','小组合作满分',2],['行为','为班级争得荣誉',5],
  ['行为','课间追逐打闹',-2],['行为','扰乱课堂秩序',-2],['行为','无故迟到',-1],
  ['健康','眼保健操认真',1],['健康','课间操动作规范',1],['健康','主动整理教室',2],['健康','忘做值日',-1],
  ['其他','担任今日小助手',2],['其他','全周无违纪',3],['其他','未佩戴红领巾',-1]
];
const DEFAULT_GOODS = [
  ['免作业卡',16,'当周免一次书面作业',10,'gift','#5965e8','real'],
  ['优先选座券',12,'优先挑选一周座位',8,'star','#f3b53f','real'],
  ['文具小礼包',8,'铅笔、橡皮或小本子',15,'book','#2fbe9d','real'],
  ['当一天班长',20,'体验一日班长职责',3,'medal','#a374e8','real'],
  ['小皇冠',6,'给宠物戴上金皇冠',-1,'sparkle','#ef9c3f','acc:crown'],
  ['蝴蝶结',4,'给宠物系上蝴蝶结',-1,'heart','#ef6a73','acc:bow'],
  ['圆眼镜',5,'给宠物戴上圆眼镜',-1,'search','#5965e8','acc:glasses'],
  ['小围巾',5,'给宠物围上小围巾',-1,'gift','#2fbe9d','acc:scarf'],
  ['小翅膀',7,'给宠物装上小翅膀',-1,'sparkle','#a374e8','acc:wings']
];
const DEMO_NAMES = ['陈冠霖','陈思琪','覃子侨','梁鸿文','李明轩','王一诺','张雨桐','赵子睿','刘欣怡','周浩然'];
const PET_NAMES = ['团子','小满','糖豆','云朵','阿福','豆包','星星','风铃','布丁','可乐'];

function newStudent(name, seat, i, classId) {
  return {
    id: uid(), name, seat, adopted: i !== 0,
    species: SPECIES_KEYS[i % SPECIES_KEYS.length],
    petName: i === 0 ? '' : PET_NAMES[i],
    exp: [0,12,48,96,150,235,340,470,610,735][i],
    badges: Math.max(0, Math.floor([0,12,48,96,150,235,340,470,610,735][i] / 120)),
    acc: [], status: { hunger: clamp(50+i*4,20,95), joy: clamp(45+i*5,20,98), health: clamp(60+i*3,25,99) },
    loginCode: String(100001 + i), parentCode: String(200001 + i),
    interactDate: '', interactLeft: 3, likes: 0, lastLikeDate: '', classId
  };
}
function initialDB() {
  const classId = uid(), teacherId = uid();
  const cred = makeSecret('123456');
  const students = DEMO_NAMES.map((n, i) => newStudent(n, i + 1, i, classId));
  const cls = { id: classId, name: '三年级（2）班', school: '示例小学', inviteCode: '2302', teachers: [teacherId], students };
  const rules = DEFAULT_RULES.map(r => ({ id: uid(), cat: r[0], label: r[1], delta: r[2] }));
  const goods = DEFAULT_GOODS.map(g => ({ id: uid(), name: g[0], cost: g[1], desc: g[2], stock: g[3], icon: g[4], color: g[5], kind: g[6] }));
  const records = students.slice(1, 7).map((s, i) => {
    const r = rules[[0,1,2,8,9,10][i]];
    return { id: uid(), ts: Date.now() - (i + 1) * 3600000 * 7, classId, studentId: s.id, label: r.label, delta: r.delta, cat: r.cat, kind: 'score', undone: false };
  });
  return {
    version: 2,
    users: [{ id: teacherId, role: 'teacher', account: 'teacher', name: '王老师', salt: cred.salt, hash: cred.hash, createdAt: Date.now() }],
    sessions: {}, classes: [cls], rules, goods, records,
    settings: { expTable: [0,40,100,180,280,400,550,720], badges: [0,0,1,1,2,2,3,3,5] },
    activeClassId: { [teacherId]: classId }
  };
}

function loadDB() {
  try {
    const d = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    if (!d || !d.classes) throw new Error('bad db');
    d.sessions = d.sessions || {}; d.rules = d.rules || []; d.goods = d.goods || []; d.records = d.records || [];
    d.settings = d.settings || { expTable: [0,40,100,180,280,400,550,720], badges: [0,0,1,1,2,2,3,3,5] };
    d.activeClassId = d.activeClassId || {};
    d.classes.forEach(c => (c.students || []).forEach(s => {
      s.acc = s.acc || []; s.status = s.status || { hunger: 60, joy: 60, health: 80 };
      s.badges = s.badges || 0; s.exp = s.exp || 0; s.likes = s.likes || 0;
      s.loginCode = s.loginCode || String(100000 + Math.floor(Math.random() * 899999));
      s.parentCode = s.parentCode || String(200000 + Math.floor(Math.random() * 899999));
    }));
    return d;
  } catch (e) {
    const d = initialDB(); saveDB(d); return d;
  }
}
function saveDB(snapshot) {
  const data = snapshot || db;
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const tmp = DATA_FILE + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2), 'utf8');
  fs.renameSync(tmp, DATA_FILE);
}
let db = loadDB();

/* ---------------- 会话与鉴权 ---------------- */
function cleanSessions() {
  const now = Date.now(); let dirty = false;
  Object.keys(db.sessions).forEach(t => { if (!db.sessions[t] || db.sessions[t].exp < now) { delete db.sessions[t]; dirty = true; } });
  if (dirty) saveDB();
}
function getSession(req, url) {
  const token = (req.headers['x-token'] || url.searchParams.get('token') || '').toString();
  if (!token) return null;
  const s = db.sessions[token];
  if (!s || s.exp < Date.now()) return null;
  return Object.assign({ token }, s);
}
function classOf(id) { return db.classes.find(c => c.id === id); }
function studentOf(classId, sid) { const c = classOf(classId); return c ? c.students.find(s => s.id === sid) : null; }
function teacherClasses(userId) { return db.classes.filter(c => (c.teachers || []).includes(userId)); }

/* ---------------- 成长规则 ---------------- */
function levelOf(exp) { const t = db.settings.expTable; for (let lv = 8; lv >= 1; lv--) if (exp >= t[lv - 1]) return lv; return 1; }
function badgeSum(a, b) { let n = 0; for (let i = a + 1; i <= b; i++) n += (db.settings.badges[i] || 0); return n; }
function adjust(s, delta) {
  const before = levelOf(s.exp);
  s.exp = Math.max(0, s.exp + delta);
  const after = levelOf(s.exp);
  if (after > before) s.badges += badgeSum(before, after);
  if (after < before) s.badges = Math.max(0, s.badges - badgeSum(after, before));
  const st = s.status;
  if (delta > 0) { st.hunger = clamp(st.hunger + 3, 0, 100); st.joy = clamp(st.joy + 4, 0, 100); st.health = clamp(st.health + 1, 0, 100); }
  else { st.hunger = clamp(st.hunger - 2, 0, 100); st.joy = clamp(st.joy - 5, 0, 100); st.health = clamp(st.health - 6, 0, 100); }
  return after > before ? after : 0;
}
function addRecord(o) { db.records.unshift(Object.assign({ id: uid(), ts: Date.now(), undone: false }, o)); }

/* ---------------- 数据视图（按角色隔离） ---------------- */
function publicStudent(s) {
  return { id: s.id, name: s.name, seat: s.seat, adopted: s.adopted, species: s.species, petName: s.petName, exp: s.exp, badges: s.badges, acc: s.acc, level: levelOf(s.exp), likes: s.likes || 0 };
}
function safeStudent(s) { const o = Object.assign({}, s); delete o.loginCode; delete o.parentCode; return o; }
function rankScores(cls) {
  const d = new Date(); d.setHours(0,0,0,0);
  const wk = new Date(d); wk.setDate(wk.getDate() - ((wk.getDay() + 6) % 7));
  const calc = from => cls.students.map(s => ({
    id: s.id, name: s.name, seat: s.seat, adopted: s.adopted, species: s.species, petName: s.petName,
    exp: s.exp, level: levelOf(s.exp), likes: s.likes || 0,
    v: from === null ? s.exp : db.records.filter(r => !r.undone && r.kind === 'score' && r.studentId === s.id && r.ts >= from).reduce((a, r) => a + r.delta, 0)
  })).sort((a, b) => b.v - a.v || a.seat - b.seat);
  return { total: calc(null), week: calc(wk.getTime()), today: calc(d.getTime()) };
}
function stateFor(sess) {
  const cls = classOf(sess.classId);
  const base = { role: sess.role, className: cls ? cls.name : '', classId: sess.classId, inviteCode: cls ? cls.inviteCode : '',
    settings: db.settings, serverTime: Date.now() };
  if (sess.role === 'teacher') {
    const myClasses = teacherClasses(sess.userId);
    const active = cls || myClasses[0];
    return Object.assign(base, {
      user: { id: sess.userId, name: (db.users.find(u => u.id === sess.userId) || {}).name || '老师' },
      classes: myClasses.map(c => ({ id: c.id, name: c.name, school: c.school, inviteCode: c.inviteCode, count: c.students.length })),
      activeClassId: active ? active.id : '',
      students: active ? active.students : [], rules: db.rules, goods: db.goods,
      records: db.records.filter(r => r.classId === (active ? active.id : sess.classId)),
      school: active ? active.school : ''
    });
  }
  const s = studentOf(sess.classId, sess.studentId);
  if (sess.role === 'student') {
    return Object.assign(base, {
      user: { id: s.id, name: s.name }, me: safeStudent(s),
      classmates: cls.students.map(publicStudent),
      ranks: rankScores(cls),
      records: db.records.filter(r => r.studentId === s.id),
      goods: db.goods.map(g => ({ id: g.id, name: g.name, cost: g.cost, desc: g.desc, stock: g.stock, icon: g.icon, color: g.color, kind: g.kind })),
      rules: db.rules.filter(r => r.delta > 0)
    });
  }
  return Object.assign(base, {
    user: { id: s.id, name: s.name + ' 家长' }, child: safeStudent(s),
    classmates: cls.students.map(publicStudent),
    ranks: rankScores(cls),
    records: db.records.filter(r => r.studentId === s.id),
    goods: []
  });
}

/* ---------------- 动作权限表 ---------------- */
const TEACHER_ONLY = new Set(['award','undo','addStudent','batchStudents','delStudent','addRule','delRule','addGood','delGood',
  'saveGrowth','saveClass','addClass','delClass','switchClass','resetDemo','clearAll','setCodes']);
const STUDENT_ONLY = new Set(['adopt','renamePet','changeSpecies','toggleAcc','interact','selfExchange']);
const PARENT_ONLY = new Set(['like']);
const TEACHER_ALSO = new Set(['exchange','adopt','renamePet','changeSpecies','toggleAcc','interact']); // 教师可代操作

function needStudent(sess, payload) {
  const sid = payload.studentId || sess.studentId;
  if (sess.role !== 'teacher' && sid !== sess.studentId) return null;
  const c = classOf(sess.classId);
  if (!c || !c.students.some(x => x.id === sid)) return null;
  return studentOf(sess.classId, sid);
}

function perform(sess, type, p) {
  p = p || {};
  const isTeacher = sess.role === 'teacher';
  if (TEACHER_ONLY.has(type) && !isTeacher) return { error: '仅教师可执行此操作' };
  if (STUDENT_ONLY.has(type) && sess.role !== 'student' && !isTeacher) return { error: '无权操作' };
  if (PARENT_ONLY.has(type) && sess.role !== 'parent') return { error: '仅家长可执行此操作' };
  if ((type === 'exchange' || type === 'selfExchange') && sess.role === 'parent') return { error: '家长端为只读，无法兑换' };
  const cls = classOf(sess.classId);
  switch (type) {
    case 'award': {
      const r = db.rules.find(x => x.id === p.ruleId);
      if (!r) return { error: '评价项不存在' };
      const ids = Array.isArray(p.ids) ? p.ids.slice(0, 100) : [];
      let ups = 0;
      ids.forEach(id => {
        const s = studentOf(sess.classId, id); if (!s) return;
        const up = adjust(s, r.delta); if (up) ups++;
        addRecord({ classId: sess.classId, studentId: id, label: r.label, delta: r.delta, cat: r.cat, kind: 'score' });
      });
      return { data: { count: ids.length, levelUps: ups } };
    }
    case 'undo': {
      const r = db.records.find(x => x.id === p.recordId && x.classId === sess.classId);
      if (!r || r.undone || r.kind !== 'score') return { error: '记录不可撤回' };
      const s = studentOf(sess.classId, r.studentId);
      if (s) adjust(s, -r.delta);
      r.undone = true;
      return { data: { ok: true } };
    }
    case 'addStudent': {
      const name = String(p.name || '').trim(); if (!name) return { error: '请填写姓名' };
      if (cls.students.some(s => s.name === name)) return { error: '该姓名已存在' };
      const i = cls.students.length;
      cls.students.push(newStudent(name, p.seat || '', i, cls.id));
      Object.assign(cls.students[cls.students.length - 1], { adopted: false, exp: 0, badges: 0, petName: '' });
      return { data: { ok: true } };
    }
    case 'batchStudents': {
      const lines = String(p.text || '').split(/\r?\n/).map(x => x.trim()).filter(Boolean).slice(0, 300);
      let n = 0;
      lines.forEach(line => {
        const parts = line.split(/[,，\t]+/); const name = (parts[0] || '').trim();
        if (!name || cls.students.some(s => s.name === name)) return;
        const i = cls.students.length;
        const st = newStudent(name, (parts[1] || '').trim(), i, cls.id);
        Object.assign(st, { adopted: false, exp: 0, badges: 0, petName: '' });
        cls.students.push(st); n++;
      });
      return { data: { count: n } };
    }
    case 'delStudent': {
      cls.students = cls.students.filter(s => s.id !== p.studentId);
      return { data: { ok: true } };
    }
    case 'setCodes': {
      const s = studentOf(sess.classId, p.studentId); if (!s) return { error: '学生不存在' };
      s.loginCode = String(100000 + Math.floor(Math.random() * 899999));
      s.parentCode = String(200000 + Math.floor(Math.random() * 899999));
      return { data: { ok: true } };
    }
    case 'adopt': {
      const s = needStudent(sess, p); if (!s) return { error: '无权领养' };
      s.adopted = true; s.species = SPECIES_KEYS.includes(p.species) ? p.species : 'cat';
      s.petName = String(p.petName || '').trim() || s.species;
      s.status = { hunger: 60, joy: 60, health: 80 };
      return { data: { ok: true } };
    }
    case 'renamePet': {
      const s = needStudent(sess, p); if (!s || !s.adopted) return { error: '无权修改' };
      const n = String(p.name || '').trim(); if (n && isTeacher) s.name = n;
      const pn = String(p.petName || '').trim(); if (pn) s.petName = pn;
      return { data: { ok: true } };
    }
    case 'changeSpecies': {
      const s = needStudent(sess, p); if (!s || !s.adopted) return { error: '无权修改' };
      if (SPECIES_KEYS.includes(p.species)) s.species = p.species;
      return { data: { ok: true } };
    }
    case 'toggleAcc': {
      const s = needStudent(sess, p); if (!s || !s.adopted) return { error: '无权修改' };
      const a = String(p.acc || '');
      if (!['hat','bow','scarf','glasses','crown','wings','medal'].includes(a)) return { error: '装饰无效' };
      if (!s.acc.includes(a)) return { error: '尚未拥有该装饰' };
      const i = s.acc.indexOf(a); if (i >= 0) s.acc.splice(i, 1); else s.acc.push(a);
      return { data: { ok: true } };
    }
    case 'interact': {
      const s = needStudent(sess, p); if (!s || !s.adopted) return { error: '无权互动' };
      const dk = new Date().toISOString().slice(0, 10);
      if (s.interactDate !== dk) { s.interactDate = dk; s.interactLeft = 3; }
      if (s.interactLeft <= 0) return { error: '今日互动次数已用完' };
      s.interactLeft--;
      s.status.hunger = clamp(s.status.hunger + 12, 0, 100);
      s.status.joy = clamp(s.status.joy + 12, 0, 100);
      s.status.health = clamp(s.status.health + 8, 0, 100);
      return { data: { left: s.interactLeft } };
    }
    case 'exchange': case 'selfExchange': {
      const g = db.goods.find(x => x.id === p.goodId); if (!g) return { error: '商品不存在' };
      const s = needStudent(sess, p); if (!s) return { error: '无权兑换' };
      if (s.badges < g.cost) return { error: '徽章不足' };
      if (g.stock === 0) return { error: '库存已兑完' };
      s.badges -= g.cost; if (g.stock > 0) g.stock--;
      if (g.kind && g.kind.startsWith('acc:')) { const a = g.kind.split(':')[1]; if (!s.acc.includes(a)) s.acc.push(a); }
      addRecord({ classId: sess.classId, studentId: s.id, label: '兑换 ' + g.name, delta: 0, cat: '', kind: 'exchange' });
      return { data: { ok: true } };
    }
    case 'like': {
      const s = needStudent(sess, p); if (!s) return { error: '无权点赞' };
      const dk = new Date().toISOString().slice(0, 10);
      if (s.lastLikeDate === dk) return { error: '今天已经点过赞了' };
      s.lastLikeDate = dk; s.likes = (s.likes || 0) + 1;
      return { data: { likes: s.likes } };
    }
    case 'addRule': {
      const label = String(p.label || '').trim(); if (!label) return { error: '请填写名称' };
      db.rules.push({ id: uid(), label, cat: ['学习','行为','健康','其他'].includes(p.cat) ? p.cat : '其他', delta: clamp(parseInt(p.delta) || 0, -20, 20) });
      return { data: { ok: true } };
    }
    case 'delRule': { db.rules = db.rules.filter(r => r.id !== p.ruleId); return { data: { ok: true } }; }
    case 'addGood': {
      const name = String(p.name || '').trim(); if (!name) return { error: '请填写名称' };
      const kind = String(p.kind || 'real');
      db.goods.push({ id: uid(), name, desc: String(p.desc || ''), cost: clamp(parseInt(p.cost) || 1, 1, 999),
        stock: parseInt(p.stock) === 0 ? 0 : (parseInt(p.stock) < 0 ? -1 : (parseInt(p.stock) || -1)),
        icon: 'gift', color: '#5965e8', kind });
      return { data: { ok: true } };
    }
    case 'delGood': { db.goods = db.goods.filter(g => g.id !== p.goodId); return { data: { ok: true } }; }
    case 'saveGrowth': {
      const t = Array.isArray(p.expTable) ? p.expTable.slice(0, 8).map(x => Math.max(0, parseInt(x) || 0)) : null;
      const b = Array.isArray(p.badges) ? p.badges.slice(0, 9).map(x => Math.max(0, parseInt(x) || 0)) : null;
      if (t && t.length === 8) { t[0] = 0; for (let i = 1; i < 8; i++) if (t[i] <= t[i - 1]) t[i] = t[i - 1] + 20; db.settings.expTable = t; }
      if (b && b.length === 9) db.settings.badges = b;
      return { data: { ok: true } };
    }
    case 'saveClass': {
      cls.name = String(p.name || '').trim() || cls.name;
      cls.school = String(p.school || '').trim();
      return { data: { ok: true } };
    }
    case 'addClass': {
      const c = { id: uid(), name: String(p.name || '新建班级'), school: '', inviteCode: String(1000 + Math.floor(Math.random() * 8999)), teachers: [sess.userId], students: [] };
      db.classes.push(c); db.activeClassId[sess.userId] = c.id; sess.classId = c.id; db.sessions[sess.token].classId = c.id;
      return { data: { classId: c.id } };
    }
    case 'switchClass': {
      const c = teacherClasses(sess.userId).find(x => x.id === p.classId);
      if (!c) return { error: '班级不存在' };
      db.activeClassId[sess.userId] = c.id; sess.classId = c.id; db.sessions[sess.token].classId = c.id;
      return { data: { classId: c.id } };
    }
    case 'delClass': {
      const mine = teacherClasses(sess.userId);
      if (mine.length <= 1) return { error: '至少保留一个班级' };
      db.classes = db.classes.filter(c => c.id !== p.classId);
      db.records = db.records.filter(r => r.classId !== p.classId);
      const first = teacherClasses(sess.userId)[0];
      db.activeClassId[sess.userId] = first.id; sess.classId = first.id; db.sessions[sess.token].classId = first.id;
      return { data: { ok: true } };
    }
    case 'resetDemo': {
      const demo = initialDB();
      db.users = demo.users; db.sessions = {}; db.classes = demo.classes; db.rules = demo.rules;
      db.goods = demo.goods; db.records = demo.records; db.settings = demo.settings; db.activeClassId = demo.activeClassId;
      return { data: { relogin: true } };
    }
    case 'clearAll': {
      const u = db.users.find(x => x.id === sess.userId);
      db.sessions = {}; db.classes = []; db.records = []; db.activeClassId = {};
      const c = { id: uid(), name: (u ? u.name : '老师') + '的班级', school: '', inviteCode: String(1000 + Math.floor(Math.random() * 8999)), teachers: [sess.userId], students: [] };
      db.classes.push(c); db.activeClassId[sess.userId] = c.id;
      return { data: { relogin: true } };
    }
    default: return { error: '未知操作：' + type };
  }
}

/* ---------------- SSE 广播 ---------------- */
const clients = new Set();
function broadcast(classId, type) {
  const payload = 'data: ' + JSON.stringify({ type: type || 'change', classId, ts: Date.now() }) + '\n\n';
  clients.forEach(c => {
    try { c.res.write(payload); } catch (e) { clients.delete(c); }
  });
}

/* ---------------- 登录 / 注册 ---------------- */
function login(body) {
  const role = body.role;
  if (role === 'teacher') {
    if (body.register) {
      const account = String(body.account || '').trim();
      if (account.length < 3) return { error: '账号至少 3 个字符' };
      if (String(body.secret || '').length < 6) return { error: '密码至少 6 位' };
      if (db.users.some(u => u.account === account)) return { error: '账号已存在' };
      const cred = makeSecret(body.secret), id = uid();
      db.users.push({ id, role: 'teacher', account, name: String(body.name || account).trim(), salt: cred.salt, hash: cred.hash, createdAt: Date.now() });
      const c = { id: uid(), name: String(body.className || '我的班级').trim(), school: '', inviteCode: String(1000 + Math.floor(Math.random() * 8999)), teachers: [id], students: [] };
      db.classes.push(c); db.activeClassId[id] = c.id;
      return { userId: id, classId: c.id, role: 'teacher' };
    }
    const u = db.users.find(x => x.role === 'teacher' && x.account === String(body.account || '').trim());
    if (!u || !checkSecret(body.secret || '', u.salt, u.hash)) return { error: '账号或密码不正确' };
    const mine = teacherClasses(u.id);
    let cid = db.activeClassId[u.id];
    if (!mine.some(c => c.id === cid)) cid = mine.length ? mine[0].id : null;
    if (!cid) { const c = { id: uid(), name: '我的班级', inviteCode: String(1000 + Math.floor(Math.random() * 8999)), teachers: [u.id], students: [] }; db.classes.push(c); cid = c.id; db.activeClassId[u.id] = cid; }
    return { userId: u.id, classId: cid, role: 'teacher' };
  }
  if (role === 'student') {
    const c = db.classes.find(x => x.inviteCode === String(body.classCode || '').trim());
    if (!c) return { error: '班级邀请码不正确' };
    const s = c.students.find(x => x.name === String(body.name || '').trim());
    if (!s || s.loginCode !== String(body.secret || '').trim()) return { error: '姓名或登录码不正确' };
    return { studentId: s.id, classId: c.id, role: 'student' };
  }
  if (role === 'parent') {
    let found = null;
    db.classes.forEach(c => c.students.forEach(s => {
      if (s.name === String(body.name || '').trim() && s.parentCode === String(body.secret || '').trim()) found = { s, c };
    }));
    if (!found) return { error: '孩子姓名或绑定码不正确' };
    return { studentId: found.s.id, classId: found.c.id, role: 'parent' };
  }
  return { error: '未知身份' };
}

/* ---------------- 静态文件 ---------------- */
const MIME = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.ico': 'image/x-icon' };
function serveStatic(res, urlPath) {
  let rel = decodeURIComponent(urlPath.split('?')[0]);
  if (rel === '/' || rel === '') rel = '/index.html';
  const relFile = rel.replace(/^\/+/, '');
  let file;
  if (relFile.startsWith('assets/')) file = path.join(ROOT, relFile);
  else file = path.join(ROOT, relFile);
  if (!file.startsWith(ROOT)) { sendError(res, 403, 'Forbidden'); return; }
  fs.readFile(file, (err, buf) => {
    if (err) { sendError(res, 404, 'Not Found'); return; }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
    res.end(buf);
  });
}
function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', c => { raw += c; if (raw.length > 1e6) { reject(new Error('请求过大')); req.destroy(); } });
    req.on('end', () => { try { resolve(raw ? JSON.parse(raw) : {}); } catch (e) { reject(new Error('JSON 格式错误')); } });
    req.on('error', reject);
  });
}

/* ---------------- HTTP 路由 ---------------- */
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://' + (req.headers.host || 'localhost'));
  const p = url.pathname;
  try {
    if (p === '/api/health') return json(res, 200, { ok: true, service: 'class-pet-garden', version: 2, time: Date.now() });
    if (p === '/api/auth/login' && req.method === 'POST') {
      const body = await readBody(req);
      const r = login(body);
      if (r.error) return sendError(res, 401, r.error);
      const token = newToken();
      db.sessions[token] = Object.assign({ exp: Date.now() + SESSION_MS, createdAt: Date.now() }, r);
      saveDB();
      return json(res, 200, { ok: true, token, role: r.role, redirect: '/index.html' });
    }
    if (p === '/api/auth/logout' && req.method === 'POST') {
      const sess = getSession(req, url);
      if (sess) { delete db.sessions[sess.token]; saveDB(); }
      return json(res, 200, { ok: true });
    }
    const sess = getSession(req, url);
    if (p === '/api/auth/me') {
      if (!sess) return sendError(res, 401, '未登录');
      return json(res, 200, { ok: true, role: sess.role, classId: sess.classId, name: stateFor(sess).user.name });
    }
    if (p === '/api/state') {
      if (!sess) return sendError(res, 401, '未登录');
      return json(res, 200, { ok: true, state: stateFor(sess) });
    }
    if (p === '/api/action' && req.method === 'POST') {
      if (!sess) return sendError(res, 401, '未登录');
      if (!classOf(sess.classId)) return sendError(res, 400, '班级不存在，请重新登录');
      const body = await readBody(req);
      const out = perform(sess, body.type, body.payload || {});
      if (out.error) return sendError(res, 403, out.error);
      saveDB();
      broadcast(sess.classId, body.type);
      return json(res, 200, { ok: true, data: out.data || {}, state: stateFor(sess) });
    }
    if (p === '/api/events') {
      if (!sess) return sendError(res, 401, '未登录');
      res.writeHead(200, { 'Content-Type': 'text/event-stream; charset=utf-8', 'Cache-Control': 'no-cache, no-transform', 'Connection': 'keep-alive', 'X-Accel-Buffering': 'no' });
      res.write(': connected\n\n');
      const c = { res, classId: sess.classId, role: sess.role };
      clients.add(c);
      const hb = setInterval(() => { try { res.write(': ping\n\n'); } catch (e) {} }, 25000);
      req.on('close', () => { clearInterval(hb); clients.delete(c); });
      return;
    }
    if (p.startsWith('/api/')) return sendError(res, 404, 'API 不存在');
    if (req.method !== 'GET') return sendError(res, 405, 'Method Not Allowed');
    if (['/teacher.html','/student.html','/parent.html'].includes(p)) {
      res.writeHead(302, { 'Location': '/index.html', 'Cache-Control': 'no-store' });
      return res.end();
    }
    return serveStatic(res, p);
  } catch (e) {
    return sendError(res, 500, e.message || '服务器错误');
  }
});

cleanSessions();
server.listen(PORT, '0.0.0.0', () => {
  const ips = [];
  Object.values(os.networkInterfaces()).forEach(list => (list || []).forEach(n => { if (n.family === 'IPv4' && !n.internal) ips.push(n.address); }));
  console.log('班级宠物园服务已启动');
  console.log('  本机:   http://localhost:' + PORT);
  ips.forEach(ip => console.log('  局域网: http://' + ip + ':' + PORT + '   (手机/平板同一 WiFi 可访问)'));
  console.log('  演示账号: 教师 teacher / 123456 ; 班级邀请码 2302');
  console.log('  学生: 陈思琪 / 登录码 100002 ; 家长: 陈思琪 / 绑定码 200002');
  console.log('  数据文件: ' + DATA_FILE);
});
