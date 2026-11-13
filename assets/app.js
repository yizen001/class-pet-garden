/* 班级宠物园 · 统一工作台（单入口 + 按角色渲染） */
(function () {
  'use strict';
  const $ = id => document.getElementById(id);
  const esc = PG.esc, ic = PG.ic, btn = PG.btn, toast = PG.toast, modal = PG.modal, closeModal = PG.closeModal;

  const NAV = {
    teacher: [{v:'garden',t:'宠物园',i:'paw'},{v:'score',t:'加减分',i:'target'},{v:'rank',t:'排行榜',i:'trophy'},{v:'shop',t:'小卖部',i:'shop'},{v:'manage',t:'管理',i:'gear'}],
    student: [{v:'home',t:'我的宠物',i:'paw'},{v:'rank',t:'班级排行',i:'trophy'},{v:'shop',t:'小卖部',i:'shop'},{v:'log',t:'成长记录',i:'clock'}],
    parent:  [{v:'report',t:'成长报告',i:'heart'},{v:'rank',t:'班级榜',i:'trophy'},{v:'log',t:'成长记录',i:'clock'}]
  };
  const PAGE = {
    teacher: {garden:['宠物园','每位同学都有一只随表现成长的伙伴'],score:['加减分','选择学生与评价项，一键批量记录'],rank:['排行榜','看见每一点进步'],shop:['小卖部','用升级获得的徽章兑换奖励'],manage:['管理','学生、规则、成长设置与数据']},
    student: {home:['我的宠物','照顾它，和它一起进步'],rank:['班级排行','看看大家这一阶段的努力'],shop:['小卖部','用升级获得的徽章装扮宠物'],log:['成长记录','每一分都有据可查']},
    parent:  {report:['成长报告','和孩子一起看见每一点进步'],rank:['班级榜','了解孩子在班级中的位置'],log:['成长记录','老师记录的每一次加减分']}
  };
  const ROLES = [{id:'teacher',name:'教师端',icon:'users'},{id:'student',name:'学生端',icon:'paw'},{id:'parent',name:'家长端',icon:'heart'}];
  const CATS = ['全部','学习','行为','健康','其他'];
  const CAT_COLOR = {'学习':'#5965e8','行为':'#2fbe9d','健康':'#ff8a58','其他':'#a374e8'};
  const PERIODS = [['total','累计'],['week','本周'],['today','今日']];

  let role = '', view = '', authRole = 'teacher', authRegister = false;
  let manageTab = 'students', ruleCat = '全部', rankPeriod = 'total';
  let selected = new Set(), spGroup = 'cute', adoptSpecies = 'cat', lastLevelUp = '';

  const S = () => PG.S() || {};
  const students = () => S().students || [];
  const rules = () => S().rules || [];
  const goods = () => S().goods || [];
  const records = () => S().records || [];
  const settings = () => S().settings || { expTable:[0,40,100,180,280,400,550,720], badges:[0,0,1,1,2,2,3,3,5] };
  const table = () => settings().expTable;
  const lv = e => Pets.levelOf(e || 0, table());
  const me = () => S().me || S().child || {};
  const sid = id => role === 'teacher' ? id : me().id;
  const ranks = () => S().ranks || { total:[], week:[], today:[] };
  const serverDay = () => new Date(S().serverTime || Date.now()).toISOString().slice(0, 10);
  function findStu(id) { return students().find(s => s.id === id) || (me().id === id ? me() : null); }
  function nameOf(id) { const s = findStu(id) || (S().classmates || []).find(x => x.id === id); return s ? s.name : '已移除的同学'; }
  function act(type, payload, msg) {
    return PG.action(type, payload).then(d => { if (msg) toast(msg,'ok'); return d; })
      .catch(e => { toast(e.message,'bad'); return null; });
  }

  /* ==================== 登录层 ==================== */
  function renderAuthHero() {
    $('brandMark').innerHTML = PG.icFill('paw',23,'#fff');
    $('authFeats').innerHTML = [['sync','一个入口，三种身份'],['trophy','积分驱动八阶段进化'],['star','按角色隔离的数据权限']]
      .map(f => '<span><i>'+ic(f[0],14)+'</i>'+f[1]+'</span>').join('');
    const samples = [
      {adopted:true,species:'cat',exp:60,petName:'橘猫',acc:[],status:{hunger:70,joy:80,health:90}},
      {adopted:true,species:'dragon',exp:300,petName:'小龙',acc:[],status:{hunger:70,joy:80,health:90}},
      {adopted:true,species:'unicorn',exp:760,petName:'独角兽',acc:[],status:{hunger:70,joy:80,health:90}}
    ];
    $('heroPets').innerHTML = samples.map(s => Pets.petSVG(s)).join('');
  }
  function renderAuthTabs() {
    $('roleTabs').innerHTML = ROLES.map(r => '<button type="button" class="role-tab'+(authRole===r.id?' on':'')+'" data-act="auth-role" data-role="'+r.id+'">'+ic(r.icon)+'<span>'+r.name+'</span></button>').join('');
  }
  function field(label, id, type, placeholder, value) {
    return '<label class="field"><span>'+label+'</span><input class="input" id="'+id+'" type="'+type+'" placeholder="'+placeholder+'" value="'+(value||'')+'" autocomplete="off"></label>';
  }
  function renderAuthForm() {
    let h = '';
    if (authRole === 'teacher') {
      h += field('账号','fAccount','text',authRegister?'设置登录账号（至少 3 位）':'teacher',authRegister?'':'teacher');
      h += field('密码','fSecret','password',authRegister?'至少 6 位':'123456',authRegister?'':'123456');
      if (authRegister) { h += field('您的称呼','fName','text','例如：王老师',''); h += field('班级名称','fClassName','text','例如：三年级（2）班',''); }
      h += '<label class="field" style="display:flex;align-items:center;gap:8px;cursor:pointer"><input id="fRegister" type="checkbox" '+(authRegister?'checked':'')+' style="width:16px;height:16px;min-height:auto"><span style="margin:0">首次使用，注册新教师账号并创建班级</span></label>';
    } else if (authRole === 'student') {
      h += field('班级邀请码','fClassCode','text','2302','2302');
      h += field('姓名','fName','text','陈思琪','陈思琪');
      h += field('登录码','fSecret','password','6 位登录码','100002');
    } else {
      h += field('孩子姓名','fName','text','陈思琪','陈思琪');
      h += field('家长绑定码','fSecret','password','6 位绑定码','200002');
    }
    h += '<button class="btn primary block" type="submit">'+(authRegister?'注册并进入':'登录工作台')+'</button>';
    $('authForm').innerHTML = h;
    const reg = $('fRegister');
    if (reg) reg.addEventListener('change', e => { authRegister = e.target.checked; renderAuthForm(); });
  }
  function renderAuthDemo() {
    const box = $('demoBox');
    if (authRole === 'teacher') box.innerHTML = '<b>演示账号</b><p>教师 <code>teacher</code> / <code>123456</code>　班级邀请码 <code>2302</code><br>如需从零开始，可勾选「注册新教师账号」自建班级。</p>';
    else if (authRole === 'student') box.innerHTML = '<b>演示账号</b><p>班级码 <code>2302</code>　学生 <code>陈思琪</code> / 登录码 <code>100002</code><br>其他同学登录码见教师端「学生名单」。</p>';
    else box.innerHTML = '<b>演示账号</b><p>孩子 <code>陈思琪</code> / 绑定码 <code>200002</code><br>家长端为只读，可每日为孩子点一次赞。</p>';
  }
  function showAuth(msg) {
    role = ''; PG.stop(); PG.setToken('');
    $('appShell').classList.add('hidden'); $('authLayer').classList.remove('hidden');
    document.body.classList.remove('screen-mode');
    renderAuthTabs(); renderAuthForm(); renderAuthDemo();
    const e = $('authError'); e.textContent = msg || ''; e.classList.toggle('show', !!msg);
  }
  function hideAuth() { $('authLayer').classList.add('hidden'); $('appShell').classList.remove('hidden'); }
  async function submitLogin(e) {
    e.preventDefault();
    const v = id => { const el = $(id); return el ? el.value.trim() : ''; };
    const body = { role: authRole };
    if (authRole === 'teacher') {
      body.account = v('fAccount'); body.secret = v('fSecret');
      if (authRegister) { body.register = true; body.name = v('fName'); body.className = v('fClassName'); }
    } else if (authRole === 'student') { body.classCode = v('fClassCode'); body.name = v('fName'); body.secret = v('fSecret'); }
    else { body.name = v('fName'); body.secret = v('fSecret'); }
    if (!body.secret) { const er = $('authError'); er.textContent = '请填写密码或登录码'; er.classList.add('show'); return; }
    const b = $('authForm').querySelector('button[type=submit]');
    if (b) { b.disabled = true; b.textContent = '正在登录…'; }
    try {
      const d = await PG.login(body);
      $('authError').classList.remove('show');
      await startApp(d.role);
    } catch (err) {
      const er = $('authError'); er.textContent = err.message || '登录失败'; er.classList.add('show');
      if (b) { b.disabled = false; b.textContent = authRegister ? '注册并进入' : '登录工作台'; }
    }
  }
  async function switchIdentity() {
    try { await fetch('/api/auth/logout', { method:'POST', headers:{'x-token':PG.getToken()} }); } catch (e) {}
    showAuth();
  }
  async function startApp(r) {
    role = r; view = NAV[r][0].v;
    const s = await PG.init(r);
    if (!s) { showAuth('登录已失效，请重新登录'); return; }
    hideAuth(); renderAll();
  }

  /* ==================== 框架 ==================== */
  function renderChrome() {
    $('appBrandMark').innerHTML = PG.icFill('paw',23,'#fff');
    $('appBrandSub').textContent = role === 'teacher' ? 'TEACHER' : role === 'student' ? 'STUDENT' : 'PARENT';
    $('sideNav').innerHTML = NAV[role].map(n => '<button class="nav-item'+(view===n.v?' active':'')+'" data-act="nav" data-view="'+n.v+'">'+ic(n.i)+'<span>'+n.t+'</span></button>').join('');
    $('tabBar').innerHTML = NAV[role].map(n => '<button class="tab'+(view===n.v?' active':'')+'" data-act="nav" data-view="'+n.v+'">'+ic(n.i)+'<span>'+n.t+'</span></button>').join('');
    $('pageTitle').textContent = PAGE[role][view][0]; $('pageSub').textContent = PAGE[role][view][1];
    const foot = { teacher:['教师工作台','服务端持久化 · 多端实时同步'], student:['学生空间','我的宠物 · 我的成长'], parent:['家长观察席','只读查看 · 每日一次鼓励'] }[role];
    $('sideFootTitle').textContent = foot[0]; $('sideFootDesc').textContent = foot[1];
    const isT = role === 'teacher';
    $('classSelectBox').hidden = !isT; $('screenBtn').hidden = !isT; $('roleBadge').hidden = isT;
    if (isT) {
      $('classSelectBox').innerHTML = ic('users',16)+'<select id="classSelect" aria-label="切换班级">'+(S().classes||[]).map(c => '<option value="'+c.id+'"'+(c.id===S().activeClassId?' selected':'')+'>'+esc(c.name)+'</option>').join('')+'</select>';
      $('screenBtn').innerHTML = ic('expand',15)+'<span>大屏</span>';
      $('screenExit').innerHTML = ic('shrink',16)+'<span>退出大屏</span>';
      $('screenBanner').innerHTML = '<h2>'+esc(S().className)+' · 班级宠物园</h2><p>一起见证每一只小伙伴的成长</p>';
    } else {
      $('roleBadge').className = 'role-badge ' + role;
      $('roleBadge').innerHTML = ic(role==='student'?'paw':'heart',13)+'<span>'+esc(me().name||'')+(role==='parent'?' 家长':'')+'</span>';
    }
    $('switchBtn').innerHTML = ic('sync',16)+'<span class="switch-txt">切换身份</span>';
  }
  function renderSync(s) { $('syncWrap').innerHTML = PG.syncBadge(s); }
  function activate() { document.querySelectorAll('#views .view').forEach(v => v.classList.toggle('active', v.id === 'view-' + view)); }
  function renderAll() {
    if (!role) return;
    renderChrome();
    $('views').innerHTML = NAV[role].map(n => '<section class="view'+(view===n.v?' active':'')+'" id="view-'+n.v+'"></section>').join('');
    if (role === 'teacher') { renderGarden(); renderScore(); renderTeacherRank(); renderShop(); renderManage(); }
    else if (role === 'student') { renderStudentHome(); renderMemberRank(true); renderStudentShop(); renderStudentLog(); }
    else { renderParentReport(); renderMemberRank(false); renderParentLog(); }
  }

  /* ==================== 共享组件 ==================== */
  function statRow() {
    const ss = students(), adopted = ss.filter(s => s.adopted).length;
    const total = ss.reduce((a,s) => a + (s.exp||0), 0), badges = ss.reduce((a,s) => a + (s.badges||0), 0);
    const today = records().filter(r => !r.undone && r.kind === 'score' && r.delta > 0 && PG.dayKey(new Date(r.ts)) === PG.todayKey()).reduce((a,r) => a + r.delta, 0);
    const d = [['users','本班同学',ss.length,'#eef0ff','#5965e8'],['paw','已领养',adopted,'#e6f8f2','#2fbe9d'],['star','累计积分',total,'#fff3e3','#e9a13a'],['medal','徽章总数',badges,'#f3ecff','#a374e8'],['sparkle','今日加分','+'+today,'#ffeaec','#ef6a73']];
    return '<div class="stat-row">'+d.map(x => '<div class="stat"><div class="stat-ico" style="background:'+x[3]+';color:'+x[4]+'">'+ic(x[0])+'</div><div><b>'+x[2]+'</b><span>'+x[1]+'</span></div></div>').join('')+'</div>';
  }
  function petCard(s) {
    const sp = Pets.SPECIES[s.species] || Pets.SPECIES.cat, l = lv(s.exp), mood = Pets.moodOf(s), p = Math.round(Pets.lvProgress(s.exp||0,table())*100);
    const acc = (s.acc||[]).map(() => '<i></i>').join('');
    return '<button class="pet-card'+(lastLevelUp===s.id?' levelup':'')+'" data-act="open-pet" data-id="'+s.id+'" data-search="'+esc(s.name+' '+(s.petName||'')+' '+sp.n)+'">'+
      '<div class="pet-scene" style="'+Pets.sceneStyle(s.species)+'">'+
        (s.adopted?'<span class="pet-lv">Lv.'+l+' · '+Pets.STAGES[l]+'</span>':'<span class="pet-lv">待领养</span>')+
        '<span class="pet-mood" style="color:'+Pets.MOODS[mood].c+'" title="'+Pets.MOODS[mood].n+'">'+ic(Pets.MOODS[mood].i,15)+'</span>'+Pets.petSVG(s,{table:table()})+'</div>'+
      '<div class="pet-body"><div class="pet-name"><strong>'+esc(s.adopted?(s.petName||sp.n):'未领养')+'</strong>'+(s.adopted?'<small>'+esc(sp.n)+'</small>':'')+'</div>'+
        '<div class="pet-owner">'+esc(s.name)+(s.seat?' · '+esc(s.seat)+'号':'')+'</div>'+
        '<div class="pet-meta"><span>经验</span><b>'+(s.exp||0)+(l>=8?' / MAX':' / '+Pets.nextExp(s.exp||0,table()))+'</b></div>'+
        '<div class="bar'+(l>=8?' gold':'')+'"><i style="width:'+p+'%"></i></div>'+(acc?'<div class="pet-acc">'+acc+'</div>':'')+'</div></button>';
  }
  function recList(list) {
    if (!list.length) return '<div class="empty" style="padding:26px">'+ic('clock')+'<strong>暂无记录</strong>加减分后会显示在这里</div>';
    return '<div class="rec-list">'+list.map(r => {
      const cls = r.kind === 'exchange' ? 'other' : (r.delta > 0 ? 'plus' : 'minus');
      return '<div class="rec'+(r.undone?' undone':'')+'"><div class="rec-ico '+cls+'">'+(r.kind==='exchange'?ic('gift',17):(r.delta>0?ic('plus',16):ic('close',16)))+'</div>'+
        '<div class="rec-main"><strong>'+esc(nameOf(r.studentId))+' · '+esc(r.label)+'</strong><span>'+PG.fmt(r.ts)+(r.cat?' · '+esc(r.cat):'')+(r.undone?' · 已撤回':'')+'</span></div>'+
        '<div class="rec-val '+(r.kind==='exchange'?'':cls)+'">'+(r.kind==='exchange'?'兑换':(r.delta>0?'+':'')+r.delta)+'</div>'+
        (!r.undone && r.kind === 'score' && role === 'teacher' ? btn('undo-rec','撤回','sm ghost',r.id) : '')+'</div>';
    }).join('')+'</div>';
  }
  function feed(list) {
    if (!list.length) return '<div class="empty" style="padding:24px">'+ic('clock')+'<strong>暂无记录</strong>老师打分后会显示在这里</div>';
    return '<div class="feed-list">'+list.map(r => {
      const cls = r.delta > 0 ? 'plus' : 'minus';
      return '<div class="feed"><div class="fi '+cls+'">'+(r.kind==='exchange'?'兑':(r.delta>0?'+':'-'))+'</div>'+
        '<div class="fm"><strong>'+esc(r.label)+'</strong><span>'+PG.fmt(r.ts)+(r.cat?' · '+esc(r.cat):'')+(r.undone?' · 已撤回':'')+'</span></div>'+
        '<div class="fv '+(r.kind==='exchange'?'':cls)+'">'+(r.kind==='exchange'?'兑换':(r.delta>0?'+':'')+r.delta)+'</div></div>';
    }).join('')+'</div>';
  }
  function statusBoxes(s) {
    const st = s.status || {}, arr = [['饱食度',st.hunger||0,'mint'],['快乐值',st.joy||0,'gold'],['健康值',st.health||0,'']];
    return '<div class="status-grid">'+arr.map(x => '<div class="status-box"><span>'+x[0]+'</span><b>'+x[1]+'</b><div class="bar '+x[2]+'"><i style="width:'+x[1]+'%"></i></div></div>').join('')+'</div>';
  }
  function rankSection(arr, opts) {
    opts = opts || {};
    const podium = opts.podium === false ? '' : '<div class="podium">'+arr.slice(0,3).map((x,i) => {
      const st = { adopted:x.adopted, species:x.species, petName:x.petName, exp:x.exp||0, acc:[], status:{hunger:60,joy:60,health:80} };
      return '<div class="podium-item'+(i===0?' first':'')+'"><div class="rank-no">'+(i===0?'冠军':i===1?'亚军':'季军')+'</div>'+
        '<div class="p-svg">'+Pets.petSVG(st,{small:true,table:table()})+'</div><strong>'+esc(x.name)+'</strong>'+
        '<span>'+esc(x.adopted?(x.petName||Pets.SPECIES[x.species].n)+' · Lv.'+lv(x.exp):'待领养')+'</span><b>'+x.v+' 分</b></div>';
    }).join('')+'</div>';
    const rows = '<div class="rank-list">'+arr.map((x,i) => {
      const mine = x.id === opts.mid;
      const style = mine ? ' style="border-color:'+(role==='parent'?'var(--orange)':'var(--brand)')+';background:'+(role==='parent'?'#fff6ef':'var(--brand-soft)')+'"' : '';
      return '<div class="rank-row"'+style+'><div class="rank-no">'+(i+1)+'</div><div class="rank-av">'+esc(x.name.slice(0,1))+'</div>'+
        '<div class="rank-info"><strong>'+esc(x.name)+(mine?' <span class="pill '+(role==='parent'?'o':'b')+'">'+(role==='parent'?'我的孩子':'我')+'</span>':'')+'</strong>'+
        '<span>'+esc(x.adopted?(x.petName||Pets.SPECIES[x.species].n)+' · Lv.'+lv(x.exp)+' · '+Pets.STAGES[lv(x.exp)]:'尚未领养')+'</span></div>'+
        '<div class="rank-score">'+x.v+'<small>分</small></div></div>';
    }).join('')+'</div>';
    return '<div class="section-head"><div><h2>班级排行榜</h2><p>'+esc(S().className)+' · 按'+PERIODS.find(p => p[0]===rankPeriod)[1]+'表现排序'+(role==='teacher'?'':'（只读）')+'</p></div><div class="grow"></div>'+
      '<div class="chips-row">'+PERIODS.map(p => '<button class="chip'+(rankPeriod===p[0]?' on':'')+'" data-act="rank-period" data-period="'+p[0]+'">'+p[1]+'</button>').join('')+'</div>'+
      (role==='teacher'?btn('export-csv','导出表格',''):'')+'</div>'+(arr.length?podium+rows:'<div class="empty">'+ic('paw')+'<strong>暂无数据</strong>先添加同学并开始评价吧</div>');
  }
  function groupTabs(id) {
    return '<div class="sp-group-tabs" id="spGroupTabs">'+Pets.GROUPS.map(g => '<button class="chip'+(spGroup===g.id?' on':'')+'" data-act="sp-group" data-group="'+g.id+'"'+(id?' data-id="'+id+'"':'')+'>'+g.name+' · '+g.keys.length+'</button>').join('')+'</div>';
  }
  function speciesGrid(actName, current, id) {
    const g = Pets.GROUPS.find(x => x.id === spGroup) || Pets.GROUPS[0];
    return g.keys.map(k => {
      const st = { adopted:true, species:k, exp:0, acc:[], status:{hunger:60,joy:60,health:80} };
      const on = (actName === 'pick-adopt' ? adoptSpecies : current) === k;
      return '<div class="species-opt'+(on?' on':'')+'" data-act="'+actName+'" data-species="'+k+'"'+(id?' data-id="'+id+'"':'')+'>'+Pets.petSVG(st,{small:true})+'<span>'+Pets.SPECIES[k].n+'</span></div>';
    }).join('');
  }
  function refreshSpecies(actName, current, id) {
    const g = $('speciesGrid'); if (g) g.innerHTML = speciesGrid(actName, current, id);
    document.querySelectorAll('#spGroupTabs .chip').forEach(c => c.classList.toggle('on', c.dataset.group === spGroup));
  }
  function heroCard(s, opts) {
    opts = opts || {};
    const l = lv(s.exp), sp = Pets.SPECIES[s.species] || Pets.SPECIES.cat;
    return '<div class="card hero-card"><div class="hero-pet" style="'+Pets.sceneStyle(s.species||'cat')+'">'+Pets.petSVG(s,{table:table()})+'</div>'+
      '<div class="hero-info"><h2>'+esc(s.adopted?(s.petName||sp.n):'一颗待孵化的蛋')+'</h2>'+
      '<div class="sub">'+esc(s.name)+' · '+esc(S().className)+' · '+(s.adopted?esc(sp.n)+' · '+Pets.STAGES[l]:'还没有领养宠物')+'</div>'+
      '<div style="display:flex;gap:7px;flex-wrap:wrap">'+(s.adopted?'<span class="pill b">Lv.'+l+'</span><span class="pill o">'+Pets.STAGES[l]+'</span>':'<span class="pill g">待领养</span>')+'<span class="pill p">'+Pets.MOODS[Pets.moodOf(s)].n+'</span></div>'+
      '<div class="pet-meta" style="margin-top:12px"><span>成长经验 '+(s.exp||0)+(l>=8?' / MAX':' / '+Pets.nextExp(s.exp||0,table()))+'</span><b>'+Math.round(Pets.lvProgress(s.exp||0,table())*100)+'%</b></div>'+
      '<div class="bar'+(l>=8?' gold':'')+'"><i style="width:'+(Pets.lvProgress(s.exp||0,table())*100)+'%"></i></div>'+opts.metrics+statusBoxes(s)+opts.actions+'</div></div>';
  }

  /* ==================== 教师视图 ==================== */
  function renderGarden() {
    const ss = students();
    $('view-garden').innerHTML = statRow()+
      '<div class="section-head"><div><h2>全班的小伙伴</h2><p>点击卡片查看成长详情、快速加减分 · 共 '+Object.keys(Pets.SPECIES).length+' 种宠物可选</p></div><div class="grow"></div>'+
        btn('random-pick','随机点名','')+btn('screen-enter','大屏展示','soft')+btn('add-student','添加同学','primary')+'</div>'+
      '<div class="toolbar"><label class="search">'+ic('search')+'<input id="gardenSearch" placeholder="搜索姓名或宠物名" aria-label="搜索学生"></label><span class="chip">共 '+ss.length+' 位同学</span></div>'+
      '<div class="pet-grid" id="petGrid">'+(ss.length?ss.map(petCard).join(''):'<div class="empty" style="grid-column:1/-1">'+ic('paw')+'<strong>还没有同学</strong>点击「添加同学」开始</div>')+
        '<button class="pet-card adopt-card" data-act="add-student"><div class="pet-scene"><div class="adopt-plus">'+ic('plus')+'</div></div><div class="pet-body" style="text-align:center"><div class="pet-name"><strong>添加同学</strong></div><div class="pet-owner">领养一只新伙伴</div></div></button></div>';
    lastLevelUp = '';
  }
  function renderScore() {
    Array.from(selected).forEach(id => { if (!findStu(id)) selected.delete(id); });
    const rs = rules().filter(r => ruleCat === '全部' || r.cat === ruleCat);
    $('view-score').innerHTML = '<div class="section-head"><div><h2>批量评价</h2><p>先选学生，再点评价项即可批量记录；一点一分经验</p></div></div>'+
      '<div class="score-layout"><div class="card panel"><h3>1 · 选择同学</h3><div class="hint">可多选，支持给小组或全班同时打分</div>'+
        '<div class="sel-bar"><span>已选 '+selected.size+' 位</span><div class="grow"></div>'+btn('select-all','全选','sm soft')+btn('clear-sel','清空','sm ghost')+'</div>'+
        '<div class="stu-pick">'+(students().length?students().map(s => '<button class="stu-chip'+(selected.has(s.id)?' on':'')+'" data-act="toggle-sel" data-id="'+s.id+'"><i></i>'+esc(s.name)+'</button>').join(''):'暂无同学')+'</div></div>'+
      '<div><div class="card panel" style="margin-bottom:16px"><h3>2 · 选择评价项</h3><div class="hint">加分在前、扣分在后；规则可在「管理 - 奖惩规则」中自定义</div>'+
        '<div class="chips-scroll" style="margin-bottom:12px">'+CATS.map(c => '<button class="chip'+(ruleCat===c?' on':'')+'" data-act="rule-cat" data-cat="'+c+'">'+c+'</button>').join('')+'</div>'+
        '<label class="search" style="max-width:none;margin-bottom:12px">'+ic('search')+'<input id="ruleSearch" placeholder="搜索评价项" aria-label="搜索评价项"></label>'+
        '<div class="rule-grid" id="ruleGrid">'+rs.map(r => '<button class="rule" data-act="apply-rule" data-id="'+r.id+'" data-search="'+esc(r.label)+'"><span class="rt"><i class="rule-cat-dot" style="background:'+(CAT_COLOR[r.cat]||'#8592a8')+'"></i>'+esc(r.label)+'</span><span class="rv '+(r.delta>0?'plus':'minus')+'">'+(r.delta>0?'+':'')+r.delta+'</span></button>').join('')+'</div></div>'+
      '<div class="card panel"><h3>最近记录</h3><div class="hint">误操作可一键撤回，撤回后经验与徽章同步回滚</div>'+recList(records().slice(0,8))+'</div></div></div>';
  }
  function teacherScores(period) {
    const from = period === 'week' ? PG.weekStart() : new Date().setHours(0,0,0,0);
    return students().map(s => Object.assign({}, s, { v: period === 'total' ? (s.exp||0) :
      records().filter(r => !r.undone && r.kind === 'score' && r.studentId === s.id && r.ts >= from).reduce((a,r) => a + r.delta, 0) }))
      .sort((a,b) => b.v - a.v || a.seat - b.seat);
  }
  function renderTeacherRank() { $('view-rank').innerHTML = rankSection(teacherScores(rankPeriod), { podium:true }); }
  function renderShop() {
    $('view-shop').innerHTML = '<div class="section-head"><div><h2>徽章小卖部</h2><p>宠物每升一级自动发放徽章，可兑换实物奖励或宠物装饰</p></div><div class="grow"></div>'+
      (role==='teacher'?btn('add-good','添加商品','primary'):'')+'</div>'+
      '<div class="toolbar"><span class="chip b">'+(role==='teacher'?'当前班级共 '+students().reduce((a,s)=>a+(s.badges||0),0)+' 枚徽章':'我有 '+(me().badges||0)+' 枚徽章')+'</span>'+
      (role==='teacher'?'<span class="hint">库存 -1 表示不限量</span>':'')+'</div>'+
      '<div class="shop-grid">'+goods().map(g => '<div class="good"><div class="good-ico" style="background:'+g.color+'">'+ic(g.icon||'gift',27)+'</div><h4>'+esc(g.name)+'</h4><p>'+esc(g.desc||'')+'</p>'+
        '<div class="good-foot"><span class="price">'+PG.icFill('medal',15,'#e9a13a')+g.cost+' 徽章</span>'+(g.stock===0?'<span class="pill r">已兑完</span>':'<span class="pill g">'+(g.stock<0?'不限量':'剩 '+g.stock)+'</span>')+'</div>'+
        (role==='teacher'?'<div style="display:flex;gap:7px">'+btn('exchange','兑换','primary sm',g.id,' style="flex:1"')+btn('del-good','','ghost sm',g.id).replace('></button>','>'+ic('trash',14)+'</button>')+'</div>'
          :btn('exchange','兑换','primary block sm',g.id))+'</div>').join('')+'</div>';
  }
  function renderManage() {
    const tabs = [['students','学生名单'],['rules','奖惩规则'],['growth','成长设置'],['records','评价台账'],['classes','班级管理'],['data','数据备份']];
    $('view-manage').innerHTML = '<div class="section-head"><div><h2>班级管理</h2><p>所有数据保存在服务端，多端实时同步</p></div></div>'+
      '<div class="chips-scroll" style="margin-bottom:18px">'+tabs.map(t => '<button class="chip'+(manageTab===t[0]?' on':'')+'" data-act="manage-tab" data-tab="'+t[0]+'">'+t[1]+'</button>').join('')+'</div><div id="manageBody">'+manageBody()+'</div>';
  }
  function manageBody() {
    const ss = students();
    if (manageTab === 'students') return '<div class="card panel"><h3>本班同学 · '+ss.length+' 人</h3><div class="hint">登录码供学生端使用，绑定码供家长端使用；点击「重置」可重新生成。班级邀请码：<b>'+esc(S().inviteCode)+'</b></div>'+
      '<div style="display:flex;gap:9px;flex-wrap:wrap;margin-bottom:14px">'+btn('add-student','添加同学','primary')+btn('batch-import','批量导入','')+'</div>'+
      '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>姓名</th><th>座位</th><th>宠物</th><th>Lv</th><th>经验</th><th>徽章</th><th>登录码 / 绑定码</th><th></th></tr></thead><tbody>'+
      ss.map(s => '<tr><td><b>'+esc(s.name)+'</b></td><td>'+esc(s.seat||'-')+'</td><td>'+esc(s.adopted?(s.petName||Pets.SPECIES[s.species].n):'待领养')+'</td><td>'+lv(s.exp)+'</td><td>'+(s.exp||0)+'</td><td>'+(s.badges||0)+'</td>'+
        '<td><code style="font-size:11.5px">'+esc(s.loginCode)+' / '+esc(s.parentCode)+'</code></td><td style="text-align:right;white-space:nowrap">'+btn('open-pet','详情','sm',s.id)+btn('reset-codes','重置','ghost sm',s.id)+btn('del-student','','ghost sm',s.id).replace('></button>','>'+ic('trash',14)+'</button>')+'</td></tr>').join('')+'</tbody></table></div></div>';
    if (manageTab === 'rules') return '<div class="card panel"><h3>奖惩规则库 · '+rules().length+' 条</h3><div class="hint">1 积分 = 1 点宠物经验；扣分同样扣减经验，可能使宠物降级。</div>'+
      '<div style="margin-bottom:14px">'+btn('add-rule','新增规则','primary')+'</div><div class="rule-grid">'+rules().map(r => '<div class="rule" style="cursor:default"><span class="rt"><i class="rule-cat-dot" style="background:'+(CAT_COLOR[r.cat]||'#8592a8')+'"></i>'+esc(r.label)+'<br><small style="color:var(--muted)">'+esc(r.cat)+'</small></span>'+
        '<span style="display:flex;align-items:center;justify-content:space-between"><span class="rv '+(r.delta>0?'plus':'minus')+'">'+(r.delta>0?'+':'')+r.delta+'</span><button class="x-btn" data-act="del-rule" data-id="'+r.id+'" aria-label="删除规则">'+ic('trash',15)+'</button></span></div>').join('')+'</div></div>';
    if (manageTab === 'growth') return '<div class="card panel"><h3>八阶段成长曲线</h3><div class="hint">设定每一级所需累计经验与升级赠送徽章数量；Lv.1 起始经验固定为 0。</div>'+
      '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>阶段</th><th>形态</th><th>升级所需经验</th><th>升级赠送徽章</th></tr></thead><tbody>'+
      settings().expTable.map((v,i) => '<tr><td><b>Lv.'+(i+1)+'</b></td><td>'+Pets.STAGES[i+1]+'</td><td><input class="input" style="min-height:36px;padding:6px 9px;width:110px" type="number" min="0" id="exp-'+i+'" value="'+v+'"'+(i===0?' disabled':'')+'></td>'+
      '<td><input class="input" style="min-height:36px;padding:6px 9px;width:90px" type="number" min="0" id="bd-'+i+'" value="'+(settings().badges[i+1]||0)+'"></td></tr>').join('')+'</tbody></table></div>'+
      '<div style="margin-top:14px">'+btn('save-growth','保存设置','primary')+'</div></div>';
    if (manageTab === 'records') return '<div class="card panel"><h3>完整台账 · '+records().length+' 条</h3><div class="hint">所有加减分、兑换与撤回均可追溯，支持导出 CSV 供期末统计。</div>'+
      '<div style="display:flex;gap:9px;flex-wrap:wrap;margin-bottom:14px">'+btn('export-csv','导出 CSV','primary')+btn('export-json','导出班级数据','')+'</div>'+recList(records())+'</div>';
    if (manageTab === 'classes') return '<div class="card panel"><h3>班级信息</h3><div class="hint">支持多班级切换，各班级学生与积分独立统计。</div>'+
      '<div class="form-row" style="margin-bottom:14px"><label class="field"><span>班级名称</span><input class="input" id="classNameInput" value="'+esc(S().className)+'"></label><label class="field"><span>学校名称</span><input class="input" id="schoolInput" value="'+esc(S().school||'')+'"></label></div>'+btn('save-class','保存班级信息','primary')+'</div>'+
      '<div class="card panel" style="margin-top:16px"><h3>我的班级</h3><div class="hint">新建班级后可在顶部下拉框一键切换；每个班级有独立邀请码。</div>'+
      (S().classes||[]).map(c => '<div class="line-row"><div class="grow"><b>'+esc(c.name)+'</b><div class="hint">'+c.count+' 位同学 · 邀请码 '+esc(c.inviteCode)+'</div></div><span class="pill '+(c.id===S().activeClassId?'b':'')+'">'+(c.id===S().activeClassId?'当前班级':'')+'</span>'+
        ((S().classes||[]).length>1?btn('del-class','删除','warn sm',c.id):'')+'</div>').join('')+'<div style="margin-top:14px">'+btn('add-class','新建班级','')+'</div></div>';
    return '<div class="split"><div class="card set-block"><h3>导出与备份</h3><div class="hint">数据保存在服务端 data/db.json。更换设备或部署前请先导出 JSON 备份；恢复备份可替换该文件后重启服务。</div>'+
      '<div style="display:flex;flex-direction:column;gap:9px">'+btn('export-csv','导出评价台账 CSV','')+btn('export-json','导出班级数据 JSON','')+'</div></div>'+
      '<div class="card set-block"><h3>演示与重置</h3><div class="hint">重新载入示例班级会清空全部账号与数据并恢复默认演示账号，所有在线端需要重新登录。清空操作不可撤销。</div>'+
      '<div style="display:flex;flex-direction:column;gap:9px">'+btn('reset-demo','重新载入示例数据','')+btn('clear-all','清空全部数据','warn')+'</div></div></div>';
  }

  /* ==================== 学生 / 家长视图 ==================== */
  function renderStudentHome() {
    const s = me();
    const today = records().filter(r => !r.undone && r.kind === 'score' && PG.dayKey(new Date(r.ts)) === PG.todayKey()).reduce((a,r) => a + r.delta, 0);
    const week = records().filter(r => !r.undone && r.kind === 'score' && r.ts >= PG.weekStart()).reduce((a,r) => a + r.delta, 0);
    const metrics = '<div class="metric-row"><div class="metric"><span>累计积分</span><b>'+(s.exp||0)+'</b></div><div class="metric"><span>徽章</span><b>'+(s.badges||0)+'</b></div><div class="metric"><span>家长点赞</span><b>'+(s.likes||0)+'</b></div></div>';
    const actions = '<div class="hero-actions">'+(s.adopted?btn('open-pet','装扮与改名','primary')+btn('interact','互动一次',''):btn('open-adopt','领养我的宠物','primary'))+'</div>';
    $('view-home').innerHTML = heroCard(s,{metrics:metrics,actions:actions})+
      '<div class="card mini-card"><h3>最近表现</h3><div class="hint">今日 +'+today+' 分 · 本周 +'+week+' 分　（数据由老师记录，实时同步）</div>'+feed(records().slice(0,6))+'</div>';
  }
  function renderParentReport() {
    const s = me(), st = s.status || {};
    const week = records().filter(r => !r.undone && r.kind === 'score' && r.ts >= PG.weekStart()).reduce((a,r) => a + r.delta, 0);
    const today = records().filter(r => !r.undone && r.kind === 'score' && PG.dayKey(new Date(r.ts)) === PG.todayKey()).reduce((a,r) => a + r.delta, 0);
    const liked = s.lastLikeDate === serverDay();
    $('view-report').innerHTML = '<div class="readonly-tip">'+ic('eye',17)+'<span>家长端为只读视图：可查看孩子的成长数据与老师的评价记录，不能修改积分或宠物信息。</span></div>'+
      heroCard(s,{metrics:'',actions:''})+
      '<div class="report-grid">'+[['累计积分',s.exp||0],['本周加分','+'+week],['今日加分','+'+today],['可用徽章',s.badges||0],['家长点赞',s.likes||0],['健康状态',(st.health||0)+'%']]
        .map(x => '<div class="report-cell"><span>'+x[0]+'</span><b>'+x[1]+'</b></div>').join('')+'</div>'+
      '<div class="like-box"><div class="grow"><strong>给孩子一个鼓励</strong><span>'+(liked?'今天已经送过鼓励了，明天再来吧':'每天可点赞一次，孩子会看到这份鼓励')+'　累计 '+(s.likes||0)+' 次</span></div>'+
        btn('like',liked?'今日已鼓励':'送一个鼓励',liked?'':'primary')+'</div>'+
      '<div class="card mini-card"><h3>最近的成长轨迹</h3><div class="hint">老师记录的评价与兑换，实时同步</div><div class="timeline">'+
        (records().slice(0,8).map(r => '<div class="tl-item"><strong>'+esc(r.label)+'</strong><span>'+PG.fmt(r.ts)+(r.cat?' · '+esc(r.cat):'')+'</span> <b>'+(r.kind==='exchange'?'兑换':(r.delta>0?'+':'')+r.delta)+'</b></div>').join('')||'<div class="hint">暂无记录</div>')+'</div></div>';
  }
  function renderMemberRank(withPodium) { $('view-rank').innerHTML = rankSection((ranks()[rankPeriod]||[]).slice(), { podium:withPodium, mid:me().id }); }
  function renderStudentShop() { renderShopInto('view-shop'); }
  function renderShopInto(id) { $(id).innerHTML = '<div class="section-head"><div><h2>徽章小卖部</h2><p>用升级获得的徽章兑换奖励与宠物装饰</p></div></div>'+
    '<div class="toolbar"><span class="chip b">我有 '+(me().badges||0)+' 枚徽章</span></div>'+
    '<div class="shop-grid">'+goods().map(g => '<div class="good"><div class="good-ico" style="background:'+g.color+'">'+ic(g.icon||'gift',27)+'</div><h4>'+esc(g.name)+'</h4><p>'+esc(g.desc||'')+'</p>'+
      '<div class="good-foot"><span class="price">'+PG.icFill('medal',15,'#e9a13a')+g.cost+' 徽章</span>'+(g.stock===0?'<span class="pill r">已兑完</span>':'<span class="pill g">'+(g.stock<0?'不限量':'剩 '+g.stock)+'</span>')+'</div>'+
      btn('exchange','兑换','primary block sm',g.id)+'</div>').join('')+'</div>'; }
  function renderStudentLog() { $('view-log').innerHTML = '<div class="card mini-card"><h3>我的成长记录</h3><div class="hint">共 '+records().length+' 条，加减分与兑换全部留痕</div>'+feed(records())+'</div>'; }
  function renderParentLog() { $('view-log').innerHTML = '<div class="card mini-card"><h3>完整成长记录</h3><div class="hint">共 '+records().length+' 条 · 家长端只读</div>'+recList(records())+'</div>'; }

  /* ==================== 弹窗 ==================== */
  function openAdopt(id) {
    adoptSpecies = 'cat'; spGroup = 'cute';
    modal('领养守护宠物','<div class="hint" style="margin-bottom:12px">为 <b>'+esc(nameOf(sid(id)))+'</b> 选择一只守护宠物，共 '+Object.keys(Pets.SPECIES).length+' 种可选。领养后从 Lv.1 幼崽期开始成长，已有经验保留。</div>'+
      '<label class="field"><span>宠物昵称</span><input class="input" id="adoptName" placeholder="例如：团子"></label>'+groupTabs(id)+
      '<div class="species-grid big" id="speciesGrid">'+speciesGrid('pick-adopt',null,id)+'</div>',
      btn('confirm-adopt','确认领养','primary',id)+btn('close','取消',''),true);
  }
  function openPet(id) {
    const s = findStu(sid(id)); if (!s) return;
    if (!s.adopted) { openAdopt(id); return; }
    const isT = role === 'teacher', sp = Pets.SPECIES[s.species] || Pets.SPECIES.cat, l = lv(s.exp);
    const qr = isT ? rules().filter(r => r.delta > 0).slice(0,4).concat(rules().filter(r => r.delta < 0).slice(0,2)) : [];
    const quick = isT ? '<div class="hint" style="margin-bottom:9px">快捷加减分 · 点击即记录</div><div class="quick-rules">'+
      qr.map(r => '<button class="quick-rule '+(r.delta>0?'plus':'minus')+'" data-act="quick-award" data-id="'+s.id+'" data-rule="'+r.id+'">'+esc(r.label)+'<b>'+(r.delta>0?'+':'')+r.delta+'</b></button>').join('')+'</div><div style="height:1px;background:var(--line);margin:16px 0"></div>' : '';
    const nameField = isT ? '<div class="form-row"><label class="field"><span>同学姓名</span><input class="input" id="petStuName" value="'+esc(s.name)+'"></label><label class="field"><span>宠物昵称</span><input class="input" id="petNameInput" value="'+esc(s.petName||'')+'"></label></div>'+
      '<div class="hint" style="margin-bottom:6px">登录码 <b>'+esc(s.loginCode||'—')+'</b>　家长绑定码 <b>'+esc(s.parentCode||'—')+'</b></div>'
      : '<label class="field"><span>宠物昵称</span><input class="input" id="petNameInput" value="'+esc(s.petName||'')+'"></label>';
    const body = '<div class="pet-detail-hero" style="'+Pets.sceneStyle(s.species)+'">'+Pets.petSVG(s,{table:table()})+'</div>'+
      '<div style="display:flex;align-items:center;gap:9px;flex-wrap:wrap;margin-bottom:4px"><span class="pill b">Lv.'+l+'</span><span class="pill o">'+Pets.STAGES[l]+'</span><span class="pill g">'+esc(sp.n)+'</span><span class="pill p">'+Pets.MOODS[Pets.moodOf(s)].n+'</span></div>'+
      '<div class="pet-meta"><span>经验 '+(s.exp||0)+(l>=8?'（已满级）':' / '+Pets.nextExp(s.exp||0,table()))+'</span><b>徽章 '+(s.badges||0)+' · 获赞 '+(s.likes||0)+'</b></div>'+
      '<div class="bar'+(l>=8?' gold':'')+'" style="margin-bottom:14px"><i style="width:'+(Pets.lvProgress(s.exp||0,table())*100)+'%"></i></div>'+statusBoxes(s)+quick+
      '<div class="hint" style="margin-bottom:9px">装饰（已拥有：'+((s.acc||[]).length?(s.acc||[]).map(a => Pets.ACCS[a].n).join('、'):'无，可在小卖部兑换')+'）</div>'+
      '<div class="acc-grid">'+Object.keys(Pets.ACCS).map(a => '<button class="acc-opt'+((s.acc||[]).includes(a)?' on':'')+'" data-act="toggle-acc" data-id="'+s.id+'" data-acc="'+a+'">'+Pets.ACCS[a].n+'</button>').join('')+'</div>'+
      '<div style="height:1px;background:var(--line);margin:16px 0"></div>'+nameField+
      '<div class="hint" style="margin-bottom:9px">更换宠物种类（成长进度保留）</div>'+groupTabs(s.id)+
      '<div class="species-grid big" id="speciesGrid">'+speciesGrid('pick-species',s.species,s.id)+'</div>';
    modal(esc(s.name)+' 的 '+esc(s.petName||sp.n),body,
      btn('save-pet','保存修改','primary',s.id)+btn('interact','互动一次','',s.id)+btn('close','关闭',''),true);
  }
  function openAddStudent() { modal('添加同学','<label class="field"><span>姓名（必填）</span><input class="input" id="stuName" placeholder="例如：王小明"></label><label class="field"><span>学号 / 座位号（选填）</span><input class="input" id="stuSeat" placeholder="例如：12"></label><div class="hint">系统会自动生成 6 位学生登录码与家长绑定码，可在「管理 - 学生名单」查看。</div>',btn('do-add-student','添加到本班','primary')+btn('close','取消','')); }
  function openBatch() { modal('批量导入名单','<label class="field"><span>每行一位同学，支持「姓名,学号」格式</span><textarea class="input" id="batchText" placeholder="王小明,12&#10;李思远,13&#10;张雨桐"></textarea></label><div class="hint">可直接从 Excel 或班级名册复制粘贴；重复姓名会自动跳过。</div>',btn('do-batch','批量添加','primary')+btn('close','取消','')); }
  function openAddRule() { modal('新增评价规则','<label class="field"><span>评价项名称</span><input class="input" id="ruleLabel" placeholder="例如：主动整理图书角"></label><div class="form-row"><label class="field"><span>分类</span><select class="select" id="ruleCatSel">'+CATS.slice(1).map(c => '<option>'+c+'</option>').join('')+'</select></label><label class="field"><span>分值（扣分填负数）</span><input class="input" type="number" id="ruleDelta" value="2"></label></div><div class="hint">建议以正向激励为主，加分项数量多于扣分项。</div>',btn('do-add-rule','保存规则','primary')+btn('close','取消','')); }
  function openAddGood() { modal('添加商品','<label class="field"><span>商品名称</span><input class="input" id="goodName" placeholder="例如：免作业卡"></label><label class="field"><span>说明</span><input class="input" id="goodDesc" placeholder="简单描述奖励内容"></label><div class="form-row"><label class="field"><span>价格（徽章）</span><input class="input" type="number" min="1" id="goodCost" value="10"></label><label class="field"><span>库存（-1 不限量）</span><input class="input" type="number" id="goodStock" value="-1"></label></div><label class="field"><span>奖励类型</span><select class="select" id="goodKind"><option value="real">实物 / 特权奖励</option>'+Object.keys(Pets.ACCS).map(a => '<option value="acc:'+a+'">宠物装饰 · '+Pets.ACCS[a].n+'</option>').join('')+'</select></label>',btn('do-add-good','保存商品','primary')+btn('close','取消','')); }
  function openExchange(gid) {
    const g = goods().find(x => x.id === gid); if (!g) return;
    if (role === 'teacher') {
      const ss = students().filter(s => s.adopted);
      if (!ss.length) { toast('请先添加并领养至少一位同学','bad'); return; }
      modal('徽章兑换','<div class="hint" style="margin-bottom:12px">兑换 <b>'+esc(g.name)+'</b> 需要 '+g.cost+' 枚徽章'+(g.kind&&g.kind.startsWith('acc:')?'，装饰自动装备到该同学的宠物上。':'。')+'</div><label class="field"><span>选择兑换的同学</span><select class="select" id="exStu">'+ss.map(s => '<option value="'+s.id+'">'+esc(s.name)+' · 徽章 '+(s.badges||0)+'</option>').join('')+'</select></label><div class="hint">当前库存：'+(g.stock<0?'不限量':g.stock)+'</div>',btn('do-exchange','确认兑换','primary',gid)+btn('close','取消',''));
    } else {
      PG.confirmBox('确认兑换','兑换 <b>'+esc(g.name)+'</b> 将扣除 '+g.cost+' 枚徽章；宠物装饰会自动装备。','do-exchange',gid);
    }
  }
  function openRandom() {
    const ss = students(); if (!ss.length) { toast('还没有同学','bad'); return; }
    const s = ss[Math.floor(Math.random()*ss.length)], r = rules().find(x => x.delta > 0) || rules()[0];
    modal('随机点名','<div style="text-align:center;padding:18px 0"><div class="pet-detail-hero" style="'+Pets.sceneStyle(s.species||'cat')+'">'+Pets.petSVG(s,{table:table()})+'</div><h2 style="font-size:30px;margin-top:12px">'+esc(s.name)+'</h2><p class="hint">'+esc(s.adopted?(s.petName||'')+' · Lv.'+lv(s.exp):'尚未领养宠物')+'</p></div>',
      btn('random-pick','再抽一次','primary')+btn('quick-award','课堂表现 +'+(r?r.delta:1),'',s.id,' data-rule="'+(r?r.id:'')+'"')+btn('close','关闭',''));
  }

  /* ==================== 事件 ==================== */
  $('authForm').addEventListener('submit', submitLogin);
  document.addEventListener('click', e => {
    const el = e.target.closest('[data-act]'); if (!el) return;
    const a = el.dataset.act, id = el.dataset.id;
    /* 登录层 */
    if (a === 'auth-role') { authRole = el.dataset.role; authRegister = false; $('authError').classList.remove('show'); renderAuthTabs(); renderAuthForm(); renderAuthDemo(); return; }
    /* 公共 */
    switch (a) {
      case 'nav': view = el.dataset.view; activate(); renderChrome(); break;
      case 'close': closeModal(); break;
      case 'switch-identity': switchIdentity(); break;
      case 'screen-enter': document.body.classList.add('screen-mode'); view='garden'; activate(); renderChrome(); try{document.documentElement.requestFullscreen&&document.documentElement.requestFullscreen();}catch(err){} break;
      case 'screen-exit': document.body.classList.remove('screen-mode'); renderChrome(); try{document.fullscreenElement&&document.exitFullscreen();}catch(err){} break;
      case 'rank-period': rankPeriod = el.dataset.period; if(role==='teacher')renderTeacherRank(); else renderMemberRank(role==='student'); break;
      case 'sp-group': { spGroup = el.dataset.group; const isAdopt = !!$('adoptName'); refreshSpecies(isAdopt?'pick-adopt':'pick-species', isAdopt?null:(findStu(sid(id))||{}).species, id); break; }
      case 'pick-adopt': adoptSpecies = el.dataset.species; document.querySelectorAll('#speciesGrid .species-opt').forEach(x => x.classList.toggle('on', x === el)); break;
      case 'confirm-adopt': act('adopt',{studentId:sid(id),species:adoptSpecies,petName:$('adoptName').value.trim()},'领养成功').then(d => { if(d) closeModal(); }); break;
      case 'open-pet': openPet(id); break;
      case 'open-adopt': openAdopt(id); break;
      case 'pick-species': act('changeSpecies',{studentId:sid(id),species:el.dataset.species},'已更换').then(d => { if(d){ closeModal(); openPet(id); } }); break;
      case 'toggle-acc': act('toggleAcc',{studentId:sid(id),acc:el.dataset.acc}).then(d => { if(d){ closeModal(); openPet(id); } }); break;
      case 'save-pet': {
        const p = { studentId:sid(id), petName:$('petNameInput').value.trim() };
        if (role === 'teacher') p.name = $('petStuName').value.trim();
        act('renamePet',p,'已保存').then(d => { if(d) closeModal(); }); break;
      }
      case 'interact': act('interact',{studentId:sid(id)},'互动成功，宠物状态提升').then(d => { if(d){ closeModal(); if(role==='teacher') openPet(id); } }); break;
      case 'exchange': openExchange(id); break;
      case 'do-exchange': {
        const payload = role === 'teacher' ? {goodId:id,studentId:$('exStu').value} : {goodId:id,studentId:me().id};
        act(role === 'teacher' ? 'exchange' : 'selfExchange',payload,'兑换成功').then(() => closeModal()); break;
      }
      case 'export-csv': PG.exportCSV(records(),S().className,nameOf); break;
      case 'export-json': PG.download(S().className+'-班级数据-'+PG.todayKey()+'.json',JSON.stringify(S(),null,2),'application/json'); break;
      case 'random-pick': openRandom(); break;
      case 'like': act('like',{studentId:me().id},'鼓励已送达'); break;
      /* 教师专用 */
      case 'add-student': openAddStudent(); break;
      case 'batch-import': openBatch(); break;
      case 'do-add-student': { const n = $('stuName').value.trim(); if(!n){toast('请填写姓名','bad');break;} act('addStudent',{name:n,seat:$('stuSeat').value.trim()},'已添加 '+n).then(d => { if(d) closeModal(); }); break; }
      case 'do-batch': act('batchStudents',{text:$('batchText').value},'名单已导入').then(d => { if(d) closeModal(); }); break;
      case 'reset-codes': act('setCodes',{studentId:id},'凭证已重置'); break;
      case 'del-student': PG.confirmBox('删除同学','确认删除该同学？其历史评价记录会保留，但宠物数据将移除。','do-del-student',id); break;
      case 'do-del-student': act('delStudent',{studentId:id},'已删除').then(() => closeModal()); break;
      case 'select-all': students().forEach(s => selected.add(s.id)); renderScore(); break;
      case 'clear-sel': selected.clear(); renderScore(); break;
      case 'toggle-sel': selected.has(id) ? selected.delete(id) : selected.add(id); renderScore(); break;
      case 'rule-cat': ruleCat = el.dataset.cat; renderScore(); break;
      case 'apply-rule': { if(!selected.size){toast('请先选择至少一位同学','bad');break;} act('award',{ids:Array.from(selected),ruleId:id},'已为 '+selected.size+' 位同学记录'); break; }
      case 'undo-rec': act('undo',{recordId:id},'已撤回'); break;
      case 'quick-award': { const r = rules().find(x => x.id === el.dataset.rule); if(!r){toast('评价项不存在','bad');break;} closeModal(); act('award',{ids:[id],ruleId:r.id},'已记录'); break; }
      case 'manage-tab': manageTab = el.dataset.tab; renderManage(); break;
      case 'add-rule': openAddRule(); break;
      case 'do-add-rule': act('addRule',{label:$('ruleLabel').value.trim(),cat:$('ruleCatSel').value,delta:$('ruleDelta').value},'规则已添加').then(d => { if(d) closeModal(); }); break;
      case 'del-rule': act('delRule',{ruleId:id},'规则已删除'); break;
      case 'save-growth': { const t=[],b=[0]; for(let i=0;i<8;i++){t.push($('exp-'+i).value);b.push($('bd-'+i).value);} act('saveGrowth',{expTable:t,badges:b},'成长设置已保存'); break; }
      case 'save-class': act('saveClass',{name:$('classNameInput').value.trim(),school:$('schoolInput').value.trim()},'班级信息已更新'); break;
      case 'add-class': act('addClass',{name:'新建班级 '+((S().classes||[]).length+1)},'已创建班级').then(() => { selected.clear(); }); break;
      case 'del-class': PG.confirmBox('删除班级','确认删除该班级及其全部学生数据？此操作不可撤销。','do-del-class',id); break;
      case 'do-del-class': act('delClass',{classId:id}).then(() => closeModal()); break;
      case 'reset-demo': PG.confirmBox('重新载入示例','将清空当前全部账号与数据并恢复演示班级，所有在线端需重新登录。','do-reset-demo',''); break;
      case 'do-reset-demo': act('resetDemo',{}).then(() => closeModal()); break;
      case 'clear-all': PG.confirmBox('清空全部数据','将删除所有班级、学生、规则、商品与记录，且不可撤销。建议先导出 JSON 备份。','do-clear-all',''); break;
      case 'do-clear-all': act('clearAll',{}).then(() => closeModal()); break;
      case 'add-good': openAddGood(); break;
      case 'do-add-good': act('addGood',{name:$('goodName').value.trim(),desc:$('goodDesc').value.trim(),cost:$('goodCost').value,stock:$('goodStock').value,kind:$('goodKind').value},'商品已上架').then(d => { if(d) closeModal(); }); break;
      case 'del-good': PG.confirmBox('下架商品','确认从货架移除该商品？','do-del-good',id); break;
      case 'do-del-good': act('delGood',{goodId:id}).then(() => closeModal()); break;
    }
  });
  document.addEventListener('change', e => { if (e.target.id === 'classSelect') act('switchClass',{classId:e.target.value}).then(() => { selected.clear(); }); });
  document.addEventListener('input', e => {
    if (e.target.id === 'gardenSearch') { const q = e.target.value.trim().toLowerCase(); document.querySelectorAll('#petGrid .pet-card').forEach(c => { if(c.classList.contains('adopt-card'))return; c.classList.toggle('hidden', !!q && !(c.dataset.search||'').toLowerCase().includes(q)); }); }
    if (e.target.id === 'ruleSearch') { const q = e.target.value.trim().toLowerCase(); document.querySelectorAll('#ruleGrid .rule').forEach(c => c.classList.toggle('hidden', !!q && !(c.dataset.search||'').toLowerCase().includes(q))); }
  });
  document.addEventListener('fullscreenchange', () => { if (!document.fullscreenElement) document.body.classList.remove('screen-mode'); });

  /* ==================== 启动 ==================== */
  (async function boot() {
    PG.onStatus(renderSync);
    PG.onState(() => { if (role) renderAll(); });
    renderAuthHero(); renderAuthTabs(); renderAuthForm(); renderAuthDemo();
    if (PG.getToken()) {
      try {
        const d = await (await fetch('/api/auth/me', { headers:{'x-token':PG.getToken()} })).json();
        if (d.ok && NAV[d.role]) { await startApp(d.role); return; }
      } catch (e) {}
    }
    showAuth();
  })();
})();
