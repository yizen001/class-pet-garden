/* 班级宠物园 · 共享运行时：API / 会话 / 实时同步 / 通用组件 */
(function (global) {
  'use strict';

  const ICON = {
    paw:'<path d="M4.5 12.5c0-2 1.2-3.5 2.7-3.5s2.7 1.5 2.7 3.5S8.7 16 7.2 16s-2.7-1.5-2.7-3.5Zm9.6 0c0-2 1.2-3.5 2.7-3.5s2.7 1.5 2.7 3.5S18.3 16 16.8 16s-2.7-1.5-2.7-3.5ZM8 8.2C8 6.3 9.2 5 10.7 5s2.7 1.3 2.7 3.2S12.2 11 10.7 11 8 10.1 8 8.2Zm7.5.1c0-1.6 1-2.8 2.2-2.8s2.2 1.2 2.2 2.8S18.9 11 17.7 11s-2.2-1.1-2.2-2.7ZM12 14c2.2 0 4 1.5 4 3.1 0 1.4-1.4 2-4 2s-4-.6-4-2c0-1.6 1.8-3.1 4-3.1Z"/>',
    target:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.4"/>',
    trophy:'<path d="M7 4h10v5a5 5 0 0 1-10 0V4Z"/><path d="M7 6H4v2a3 3 0 0 0 3 3m10-5h3v2a3 3 0 0 1-3 3M12 14v4m-4 2h8m-5-2h2"/>',
    shop:'<path d="M4 9h16l-1 11H5L4 9Z"/><path d="M8 9V6a4 4 0 0 1 8 0v3"/>',
    gear:'<circle cx="12" cy="12" r="3.2"/><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1-2.8 2.8-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V21h-4v-.2a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1-2.8-2.8.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3v-4h.2a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.8l-.1-.1 2.8-2.8.1.1a1.6 1.6 0 0 0 1.8.3 1.6 1.6 0 0 0 1-1.5V3h4v.2a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1 2.8 2.8-.1.1a1.6 1.6 0 0 0-.3 1.8 1.6 1.6 0 0 0 1.5 1H21v4h-.2a1.6 1.6 0 0 0-1.4 1Z"/>',
    plus:'<path d="M12 5v14M5 12h14"/>', search:'<circle cx="11" cy="11" r="7"/><path d="m16 16 4 4"/>',
    expand:'<path d="M8 3H3v5m13-5h5v5M8 21H3v-5m13 5h5v-5"/>', shrink:'<path d="M3 8h5V3m13 5h-5V3M3 16h5v5m13-5h-5v5"/>',
    close:'<path d="M6 6l12 12M18 6 6 18"/>',
    users:'<circle cx="9" cy="8" r="3.2"/><path d="M3 20v-1.5A4.5 4.5 0 0 1 7.5 14h3A4.5 4.5 0 0 1 15 18.5V20m2-14.8a3.2 3.2 0 0 1 0 6.2M17 14a4.5 4.5 0 0 1 4 4.5V20"/>',
    star:'<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 3Z"/>',
    clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/>',
    download:'<path d="M12 3v12m0 0 4-4m-4 4-4-4M4 18v2h16v-2"/>', upload:'<path d="M12 16V4m0 0 4 4m-4-4L8 8M4 18v2h16v-2"/>',
    trash:'<path d="M4 7h16M9 7V4h6v3m-8 0 1 13h8l1-13"/>', undo:'<path d="M4 10h9a5 5 0 0 1 0 10H9M4 10l4-4M4 10l4 4"/>',
    dice:'<rect x="3.5" y="3.5" width="17" height="17" rx="3"/><circle cx="8" cy="8" r="1.2"/><circle cx="16" cy="8" r="1.2"/><circle cx="12" cy="12" r="1.2"/><circle cx="8" cy="16" r="1.2"/><circle cx="16" cy="16" r="1.2"/>',
    check:'<path d="m5 12 4.5 4.5L19 7"/>', edit:'<path d="M4 20h4l11-11-4-4L4 16v4Zm10-14 4 4"/>',
    heart:'<path d="M12 20s-7-4.4-7-9.4A4.1 4.1 0 0 1 12 8a4.1 4.1 0 0 1 7 2.6c0 5-7 9.4-7 9.4Z"/>',
    gift:'<rect x="3" y="9" width="18" height="11" rx="2"/><path d="M3 13h18M12 9v11M12 9S9 3 7 5s5 4 5 4Zm0 0s3-6 5-4-5 4-5 4Z"/>',
    medal:'<circle cx="12" cy="14" r="5"/><path d="M8 3h8l-2 6M12 12l.8 1.6 1.7.2-1.3 1.2.3 1.7-1.5-.8-1.5.8.3-1.7-1.3-1.2 1.7-.2L12 12Z"/>',
    book:'<path d="M4 5a2 2 0 0 1 2-2h12v16H6a2 2 0 0 0-2 2V5Zm2 14h12"/>',
    sparkle:'<path d="M12 3v6m0 6v6M3 12h6m6 0h6M6 6l3 3m6 6 3 3M18 6l-3 3M9 15l-3 3"/>',
    sad:'<circle cx="12" cy="12" r="9"/><path d="M8 15c1-1.5 2.3-2 4-2s3 .5 4 2M9 9h.01M15 9h.01"/>',
    smile:'<circle cx="12" cy="12" r="9"/><path d="M8 13.5c1 1.5 2.3 2.2 4 2.2s3-.7 4-2.2M9 9h.01M15 9h.01"/>',
    sick:'<circle cx="12" cy="12" r="9"/><path d="m9 9 2 2m0-2-2 2m6-2 2 2m0-2-2 2M9 16h6"/>',
    logout:'<path d="M10 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h5m4-4 4-4-4-4m4 4H9"/>',
    sync:'<path d="M20 7a8 8 0 0 0-14-2M4 17a8 8 0 0 0 14 2M4 5v4h4m12 10v-4h-4"/>',
    eye:'<path d="M2 12s3.6-6 10-6 10 6 10 6-3.6 6-10 6S2 12 2 12Z"/><circle cx="12" cy="12" r="2.6"/>',
    home:'<path d="M4 11 12 4l8 7v9a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1v-9Z"/>'
  };
  function ic(n, size) { return '<svg viewBox="0 0 24 24" width="'+(size||20)+'" height="'+(size||20)+'" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+(ICON[n]||ICON.paw)+'</svg>'; }
  function icFill(n, size, color) { return '<svg viewBox="0 0 24 24" width="'+(size||20)+'" height="'+(size||20)+'" fill="'+(color||'currentColor')+'" aria-hidden="true">'+(ICON[n]||ICON.paw)+'</svg>'; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c])); }
  function dayKey(d) { d = d || new Date(); return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); }
  function todayKey() { return dayKey(); }
  function weekStart() { const d=new Date(); d.setHours(0,0,0,0); d.setDate(d.getDate()-((d.getDay()+6)%7)); return d.getTime(); }
  function fmt(ts) { const d=new Date(ts); return (d.getMonth()+1)+'/'+d.getDate()+' '+String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0'); }
  function clamp(n,a,b){ return Math.min(b,Math.max(a,n)); }

  /* ---------- 会话与请求 ---------- */
  let token = sessionStorage.getItem('pg_token') || '';
  let state = null, myRole = '';
  const listeners = [];
  let es = null, pollTimer = null, syncStatus = 'connecting';
  const statusListeners = [];

  function setToken(t) { token = t || ''; if (t) sessionStorage.setItem('pg_token', t); else sessionStorage.removeItem('pg_token'); }
  function getToken() { return token; }
  async function raw(path, options) {
    const opts = Object.assign({ headers: {} }, options || {});
    opts.headers = Object.assign({}, opts.headers);
    if (token) opts.headers['x-token'] = token;
    if (opts.body && typeof opts.body !== 'string') { opts.headers['Content-Type'] = 'application/json'; opts.body = JSON.stringify(opts.body); }
    let res;
    try { res = await fetch(path, opts); }
    catch (e) { throw new Error('无法连接服务器，请确认 node server.js 正在运行'); }
    let data = {};
    try { data = await res.json(); } catch (e) {}
    if (res.status === 401) {
      if (path.indexOf('/api/auth/login') !== 0) { setToken(''); location.href = '/index.html'; }
      throw new Error(data.error || '登录已失效，请重新登录');
    }
    if (!res.ok || data.ok === false) throw new Error(data.error || ('请求失败 (' + res.status + ')'));
    return data;
  }
  async function login(body) {
    const d = await raw('/api/auth/login', { method: 'POST', body: body });
    setToken(d.token); return d;
  }
  async function logout() {
    try { await raw('/api/auth/logout', { method: 'POST' }); } catch (e) {}
    setToken(''); location.href = '/index.html';
  }
  async function refresh(silent) {
    try {
      const d = await raw('/api/state');
      state = d.state; setSync('online'); notify(); return state;
    } catch (e) { setSync('offline'); if (!silent) toast(e.message, 'bad'); throw e; }
  }
  async function action(type, payload) {
    const d = await raw('/api/action', { method: 'POST', body: { type: type, payload: payload || {} } });
    if (d.state) { state = d.state; setSync('online'); notify(); }
    if (d.data && d.data.relogin) { setToken(''); location.href = '/index.html'; }
    return d;
  }
  function notify() { listeners.forEach(fn => { try { fn(state); } catch (e) { console.error(e); } }); }
  function onState(fn) { listeners.push(fn); if (state) fn(state); }
  function onStatus(fn) { statusListeners.push(fn); fn(syncStatus); }
  function setSync(s) { if (s === syncStatus) return; syncStatus = s; statusListeners.forEach(fn => fn(s)); }
  function connect() {
    if (es) es.close();
    if (!token) return;
    try {
      es = new EventSource('/api/events?token=' + encodeURIComponent(token));
      es.onopen = () => setSync('online');
      es.onerror = () => setSync('offline');
      es.onmessage = ev => { try { const m = JSON.parse(ev.data); if (m.type !== 'ping') refresh(true).catch(() => {}); } catch (e) {} };
    } catch (e) { setSync('offline'); }
    clearInterval(pollTimer);
    pollTimer = setInterval(() => { if (syncStatus !== 'online') refresh(true).catch(() => {}); }, 20000);
  }
  function stop() {
    if (es) { try { es.close(); } catch (e) {} es = null; }
    clearInterval(pollTimer); pollTimer = null;
    state = null; myRole = ''; setSync('connecting');
  }
  async function init(role) {
    myRole = role;
    if (!token) { location.href = '/index.html'; return null; }
    try {
      const me = await raw('/api/auth/me');
      if (me.role !== role) { setToken(''); location.href = '/index.html'; return null; }
      const s = await refresh();
      connect();
      return s;
    } catch (e) { location.href = '/index.html'; return null; }
  }
  function S() { return state; }
  function table() { return state && state.settings ? state.settings.expTable : null; }

  /* ---------- 通用组件 ---------- */
  function toast(msg, type) {
    const box = document.getElementById('toast'); if (!box) return;
    const el = document.createElement('div'); el.className = 'toast ' + (type || ''); el.textContent = msg;
    box.appendChild(el);
    setTimeout(() => { el.style.opacity = '0'; el.style.transition = 'opacity .25s'; setTimeout(() => el.remove(), 260); }, 2400);
  }
  function modal(title, body, footer, wide) {
    const root = document.getElementById('modalRoot'); if (!root) return;
    root.innerHTML = '<div class="backdrop" data-close="1"></div><div class="modal'+(wide?' wide':'')+'" role="dialog" aria-modal="true">' +
      '<div class="modal-head"><h3>'+title+'</h3><button class="x-btn" data-close="1" aria-label="关闭">'+ic('close')+'</button></div>' +
      '<div class="modal-body">'+body+'</div>'+(footer?'<div class="modal-foot">'+footer+'</div>':'')+'</div>';
  }
  function closeModal() { const r = document.getElementById('modalRoot'); if (r) r.innerHTML = ''; }
  function btn(act, label, style, id, extra) {
    return '<button class="btn '+(style||'')+'" data-act="'+act+'"'+(id?' data-id="'+id+'"':'')+(extra||'')+'>'+label+'</button>';
  }
  function confirmBox(title, text, act, id) {
    modal(title, '<p style="line-height:1.8;color:var(--ink-2)">'+text+'</p>', btn(act,'确认','warn',id)+btn('close','取消',''));
  }
  function download(name, text, type) {
    const blob = new Blob([(type === 'text/csv' ? '\ufeff' : '') + text], { type: (type||'text/plain') + ';charset=utf-8' });
    const url = URL.createObjectURL(blob), a = document.createElement('a');
    a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500); toast('已导出 ' + name, 'ok');
  }
  function exportCSV(records, className, nameOf) {
    const rows = [['时间','班级','学生','事项','分类','分值','状态']];
    records.forEach(r => rows.push([new Date(r.ts).toLocaleString('zh-CN'), className, nameOf(r.studentId), r.label, r.cat||'',
      r.kind==='exchange'?'兑换':r.delta, r.undone?'已撤回':(r.kind==='exchange'?'已兑换':'有效')]));
    const csv = rows.map(row => row.map(v => '"'+String(v).replace(/"/g,'""')+'"').join(',')).join('\r\n');
    download(className + '-评价台账.csv', csv, 'text/csv');
  }
  function syncBadge(s) {
    const t = s === 'online' ? '实时同步中' : s === 'offline' ? '连接断开 · 重试中' : '连接中';
    const c = s === 'online' ? 'ok' : 'bad';
    return '<span class="sync-dot '+c+'" title="'+t+'"></span><span class="sync-txt">'+t+'</span>';
  }

  document.addEventListener('click', e => {
    if (e.target.closest('[data-close]')) closeModal();
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

  global.PG = { ic, icFill, esc, dayKey, todayKey, weekStart, fmt, clamp, login, logout, refresh, action, init, onState, onStatus,
    S, table, toast, modal, closeModal, btn, confirmBox, download, exportCSV, syncBadge, getToken, setToken, stop };
})(window);
