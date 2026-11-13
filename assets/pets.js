/* 班级宠物园 · 共享宠物库（24 种，全部内联 SVG，零依赖） */
(function (global) {
  'use strict';

  const GROUPS = [
    { id: 'cute', name: '萌宠', keys: ['cat','dog','rabbit','panda','fox','hamster','corgi','ragdoll','angora','sheep'] },
    { id: 'bird', name: '飞羽', keys: ['penguin','owl','duck','parrot'] },
    { id: 'sea', name: '水族', keys: ['dolphin','clownfish','turtle','jellyfish'] },
    { id: 'legend', name: '国风神兽', keys: ['dragon','kirin','pixiu','phoenix','unicorn','zhuque'] }
  ];

  const SPECIES = {
    cat:      { n:'橘猫',     g:'cute', body:'#f9b06a', belly:'#ffe4c4', dark:'#c97c3c', ear:'triangle', tail:'curl',    bg1:'#fff2df', bg2:'#ffe2bf' },
    dog:      { n:'柴犬',     g:'cute', body:'#d79a62', belly:'#f8e5cb', dark:'#a56c3c', ear:'flop',    tail:'curl',    bg1:'#fff1e2', bg2:'#ffdcb9' },
    rabbit:   { n:'垂耳兔',   g:'cute', body:'#f3c9dc', belly:'#fff0f6', dark:'#cf8fae', ear:'long',    tail:'puff',    bg1:'#fff0f6', bg2:'#f9d7e8' },
    panda:    { n:'熊猫',     g:'cute', body:'#f2f5fb', belly:'#ffffff', dark:'#3b4359', ear:'round',   tail:'puff',    bg1:'#eef4ff', bg2:'#dce8ff' },
    fox:      { n:'小狐狸',   g:'cute', body:'#f28c5c', belly:'#ffe9d9', dark:'#c9613a', ear:'triangle', tail:'bushy',   bg1:'#fff0e6', bg2:'#ffd9c2' },
    hamster:  { n:'金丝熊',   g:'cute', body:'#e8bd80', belly:'#fff2dc', dark:'#b9874d', ear:'round',   tail:'none', extra:['cheek'], bg1:'#fff6e5', bg2:'#f8e3bd' },
    corgi:    { n:'柯基',     g:'cute', body:'#e3a05b', belly:'#fff1dd', dark:'#a96d34', ear:'triangle', tail:'puff', extra:['saddle'], bg1:'#fff4e4', bg2:'#ffdfbb' },
    ragdoll:  { n:'布偶猫',   g:'cute', body:'#f2e9e2', belly:'#ffffff', dark:'#8a7596', ear:'triangle', tail:'curl', extra:['mask'], bg1:'#f7f1fb', bg2:'#e9dcf2' },
    angora:   { n:'安哥拉兔', g:'cute', body:'#fdf4e6', belly:'#ffffff', dark:'#d8b998', ear:'long',    tail:'puff', extra:['fluff'], bg1:'#fffaf0', bg2:'#f6e9d4' },
    sheep:    { n:'小绵羊',   g:'cute', body:'#fff9ef', belly:'#ffffff', dark:'#b9a28a', ear:'flop',    tail:'puff', extra:['wool'], bg1:'#f7fbff', bg2:'#e6f0fa' },
    penguin:  { n:'企鹅',     g:'bird', body:'#55628c', belly:'#f6f9ff', dark:'#333d61', ear:'none',    tail:'none', extra:['beak'], bg1:'#eaf0ff', bg2:'#d6e2ff' },
    owl:      { n:'猫头鹰',   g:'bird', body:'#bd9166', belly:'#f5e2c7', dark:'#8a5f3c', ear:'horn',    tail:'none', extra:['beak','wing'], bg1:'#fff4e6', bg2:'#f0dcc0' },
    duck:     { n:'柯尔鸭',   g:'bird', body:'#f9d75f', belly:'#fff4c8', dark:'#d7a52f', ear:'none',    tail:'none', extra:['beak'], bg1:'#fffbdf', bg2:'#f7ecad' },
    parrot:   { n:'虎皮鹦鹉', g:'bird', body:'#68c796', belly:'#e3f8d9', dark:'#2f8a64', ear:'horn',    tail:'rainbow', extra:['beak','wing'], bg1:'#eafbef', bg2:'#c9efdc' },
    dolphin:  { n:'小海豚',   g:'sea',  body:'#7cb9e8', belly:'#e8f6ff', dark:'#3d7db8', ear:'none',    tail:'fin', extra:['fin'], bg1:'#e9f6ff', bg2:'#c9e6fb' },
    clownfish:{ n:'小丑鱼',   g:'sea',  body:'#f79050', belly:'#ffe0c2', dark:'#c85f2a', ear:'none',    tail:'fin', extra:['stripe','fin'], bg1:'#fff1e4', bg2:'#ffd6b4' },
    turtle:   { n:'小海龟',   g:'sea',  body:'#8fcf9f', belly:'#e6f8e5', dark:'#4c9a6c', ear:'none',    tail:'none', extra:['shell'], bg1:'#eafaee', bg2:'#ccefd6' },
    jellyfish:{ n:'小水母',   g:'sea',  body:'#c6a9f2', belly:'#f2eaff', dark:'#8f6bc9', ear:'none',    tail:'none', extra:['tentacle'], bg1:'#f6efff', bg2:'#e5d5fb' },
    dragon:   { n:'小龙',     g:'legend', body:'#7ad0a8', belly:'#d9f6e6', dark:'#3c9a76', ear:'horn', tail:'spike', bg1:'#e8faf1', bg2:'#cdf1de' },
    kirin:    { n:'麒麟',     g:'legend', body:'#f0b45e', belly:'#ffedc9', dark:'#b8762c', ear:'horn', tail:'bushy', extra:['mane','scale'], bg1:'#fff5df', bg2:'#f9dfa8' },
    pixiu:    { n:'貔貅',     g:'legend', body:'#c8a6ea', belly:'#f1e6ff', dark:'#8457bb', ear:'horn', tail:'curl', extra:['wing','mane'], bg1:'#f7efff', bg2:'#e7d3fa' },
    phoenix:  { n:'凤凰',     g:'legend', body:'#f27f62', belly:'#ffe1c9', dark:'#c44a37', ear:'horn', tail:'rainbow', extra:['wing','crest'], bg1:'#fff0e6', bg2:'#ffcfb8' },
    unicorn:  { n:'独角兽',   g:'legend', body:'#c9b3f5', belly:'#f2ecff', dark:'#9270cf', ear:'horn', tail:'rainbow', bg1:'#f5efff', bg2:'#e6d9ff' },
    zhuque:   { n:'朱雀',     g:'legend', body:'#ef7a80', belly:'#ffe0dd', dark:'#b84556', ear:'horn', tail:'rainbow', extra:['wing','crest'], bg1:'#fff0f0', bg2:'#ffd3d5' }
  };

  const STAGES = ['','幼崽期','成长期','活泼期','进阶期','闪耀期','王者期','传说形态'];
  const ACCS = { hat:{n:'小红帽'}, bow:{n:'蝴蝶结'}, scarf:{n:'小围巾'}, glasses:{n:'圆眼镜'}, crown:{n:'金皇冠'}, wings:{n:'小翅膀'}, medal:{n:'奖牌'} };
  const MOODS = { happy:{n:'开心',i:'smile',c:'#2fbe9d'}, calm:{n:'平静',i:'smile',c:'#8592a8'}, sad:{n:'低落',i:'sad',c:'#f3b53f'}, sick:{n:'不舒服',i:'sick',c:'#ef6a73'} };

  const clamp = (n,a,b) => Math.min(b, Math.max(a,n));
  function levelOf(exp, table) { const t = table || [0,40,100,180,280,400,550,720]; for (let lv=8;lv>=1;lv--) if (exp>=t[lv-1]) return lv; return 1; }
  function nextExp(exp, table) { const lv=levelOf(exp,table),t=table||[0,40,100,180,280,400,550,720]; return lv>=8?t[7]:t[lv]; }
  function lvProgress(exp, table) { const lv=levelOf(exp,table),t=table||[0,40,100,180,280,400,550,720]; if(lv>=8)return 1; return clamp((exp-t[lv-1])/(t[lv]-t[lv-1]||1),0,1); }
  function moodOf(s) { const st=s.status||{hunger:60,joy:60,health:80}; if(st.health<35)return 'sick'; if(st.joy<35||st.hunger<30)return 'sad'; if(st.joy>75)return 'happy'; return 'calm'; }

  function eggSVG() {
    return '<svg class="pet-svg" viewBox="0 0 200 210" aria-label="宠物蛋" role="img">' +
      '<ellipse cx="100" cy="188" rx="42" ry="8" fill="rgba(31,42,68,.10)"/>' +
      '<g class="pet-bob"><path d="M100 46c30 0 48 40 48 70 0 27-21 48-48 48s-48-21-48-48c0-30 18-70 48-70Z" fill="#fff7ec" stroke="#e9d9c4" stroke-width="2"/>' +
      '<path d="M62 116h22l10-13 10 20 10-14 8 12h16" fill="none" stroke="#e7c9a6" stroke-width="3" stroke-linejoin="round"/>' +
      '<circle cx="76" cy="88" r="4" fill="#f4d9bd"/><circle cx="124" cy="76" r="5" fill="#f4d9bd"/><circle cx="132" cy="132" r="3.5" fill="#f4d9bd"/>' +
      '<path d="M88 140q12 10 24 0" stroke="#d9b894" stroke-width="2.5" fill="none" stroke-linecap="round"/></g></svg>';
  }
  function earSVG(type, sp) {
    const d=sp.dark,b=sp.body;
    switch(type){
      case 'triangle': return '<path d="M70 62 64 26 94 50Z" fill="'+b+'" stroke="'+d+'" stroke-width="2" stroke-linejoin="round"/><path d="M130 62 136 26 106 50Z" fill="'+b+'" stroke="'+d+'" stroke-width="2" stroke-linejoin="round"/><path d="M73 56 70 37 87 51Z" fill="'+d+'" opacity=".35"/><path d="M127 56 130 37 113 51Z" fill="'+d+'" opacity=".35"/>';
      case 'long': return '<ellipse cx="80" cy="36" rx="11" ry="28" fill="'+b+'" stroke="'+d+'" stroke-width="2"/><ellipse cx="120" cy="36" rx="11" ry="28" fill="'+b+'" stroke="'+d+'" stroke-width="2"/><ellipse cx="80" cy="38" rx="4.5" ry="19" fill="#fff" opacity=".55"/><ellipse cx="120" cy="38" rx="4.5" ry="19" fill="#fff" opacity=".55"/>';
      case 'flop': return '<ellipse cx="67" cy="72" rx="14" ry="26" fill="'+d+'" transform="rotate(-18 67 72)"/><ellipse cx="133" cy="72" rx="14" ry="26" fill="'+d+'" transform="rotate(18 133 72)"/>';
      case 'round': return '<circle cx="71" cy="58" r="16" fill="'+d+'"/><circle cx="129" cy="58" r="16" fill="'+d+'"/>';
      case 'horn': return '<path d="M74 54 68 24 92 46Z" fill="#f3cf72" stroke="#d8a93c" stroke-width="2" stroke-linejoin="round"/><path d="M126 54 132 24 108 46Z" fill="#f3cf72" stroke="#d8a93c" stroke-width="2" stroke-linejoin="round"/><path d="M100 48 100 18 90 44Z" fill="#ffd66b" stroke="#d8a93c" stroke-width="1.5"/>';
      case 'none': return '<path d="M96 50q4-14 10-16" stroke="'+d+'" stroke-width="3" fill="none" stroke-linecap="round"/>';
      default: return '';
    }
  }
  function tailSVG(type, sp) {
    const b=sp.body,d=sp.dark;
    switch(type){
      case 'curl': return '<path d="M136 145q34 4 30-28" stroke="'+b+'" stroke-width="13" fill="none" stroke-linecap="round"/><path d="M136 145q34 4 30-28" stroke="'+d+'" stroke-width="3" fill="none" stroke-linecap="round" opacity=".25"/>';
      case 'puff': return '<circle cx="140" cy="146" r="14" fill="'+(sp.ear==='round'?d:b)+'"/>';
      case 'bushy': return '<path d="M134 150q38 8 32-30-2 14-16 12 8-10 4-20-24 12-20 38Z" fill="'+b+'" stroke="'+d+'" stroke-width="2" stroke-linejoin="round"/><path d="M162 122q4 16-6 26" stroke="#fff" stroke-width="5" fill="none" opacity=".7" stroke-linecap="round"/>';
      case 'spike': return '<path d="M136 152q26 6 34-22l-8 8-6-14-8 12-6-10Z" fill="'+d+'"/>';
      case 'rainbow': return '<path d="M136 150q30 10 34-24" stroke="#ff9ab0" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M136 156q36 10 40-20" stroke="#ffd66b" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M136 162q40 8 44-14" stroke="#8ad9c0" stroke-width="6" fill="none" stroke-linecap="round"/>';
      case 'fin': return '<path d="M136 150q26-4 34-26-2 18-16 20 8-12 4-18-20 8-22 24Z" fill="'+d+'"/>';
      default: return '';
    }
  }
  function extraSVG(list, sp) {
    let o=''; const b=sp.body,d=sp.dark;
    (list||[]).forEach(x=>{
      switch(x){
        case 'cheek': o+='<circle cx="68" cy="100" r="14" fill="'+sp.belly+'" opacity=".95"/><circle cx="132" cy="100" r="14" fill="'+sp.belly+'" opacity=".95"/>'; break;
        case 'saddle': o+='<path d="M66 112q34-16 68 0-6 22-34 22t-34-22Z" fill="'+d+'" opacity=".35"/>'; break;
        case 'mask': o+='<path d="M66 66q34-18 68 0 6 24-34 28t-34-28Z" fill="'+d+'" opacity=".28"/>'; break;
        case 'fluff': o+='<circle cx="82" cy="52" r="13" fill="#fff" opacity=".85"/><circle cx="100" cy="46" r="15" fill="#fff" opacity=".9"/><circle cx="118" cy="52" r="13" fill="#fff" opacity=".85"/>'; break;
        case 'wool': o+='<circle cx="76" cy="66" r="14" fill="#fff"/><circle cx="100" cy="56" r="17" fill="#fff"/><circle cx="124" cy="66" r="14" fill="#fff"/><circle cx="64" cy="128" r="13" fill="#fff"/><circle cx="136" cy="128" r="13" fill="#fff"/>'; break;
        case 'beak': o+='<path d="M88 98h24l-12 13Z" fill="#f0a63c" stroke="#d3872a" stroke-width="1.5" stroke-linejoin="round"/>'; break;
        case 'wing': o+='<path d="M62 122q-26-16-30 4 4 18 30 12Z" fill="'+sp.belly+'" stroke="'+d+'" stroke-width="1.8"/><path d="M138 122q26-16 30 4-4 18-30 12Z" fill="'+sp.belly+'" stroke="'+d+'" stroke-width="1.8"/>'; break;
        case 'fin': o+='<path d="M100 92 92 66 108 88Z" fill="'+d+'" opacity=".8"/>'; break;
        case 'stripe': o+='<path d="M74 124q26 10 52 0" stroke="#fff" stroke-width="7" fill="none" opacity=".8"/><path d="M78 146q22 8 44 0" stroke="#fff" stroke-width="6" fill="none" opacity=".7"/>'; break;
        case 'shell': o+='<path d="M100 96c-30 0-42 26-42 46 0 14 18 24 42 24s42-10 42-24c0-20-12-46-42-46Z" fill="'+d+'" opacity=".85"/><path d="M100 104v58M70 132h60M78 112l-14 32M122 112l14 32" stroke="'+sp.belly+'" stroke-width="2.5" opacity=".7" fill="none"/>'; break;
        case 'tentacle': o+='<path d="M74 158q-6 22 2 30M90 162q-4 24 4 30M110 162q4 24-4 30M126 158q6 22-2 30" stroke="'+d+'" stroke-width="5" fill="none" stroke-linecap="round" opacity=".75"/>'; break;
        case 'mane': o+='<path d="M62 70q-14-18 4-30 6 16 18 8 6-18 16-20 10 2 16 20 12 8 18-8 18 12 4 30-20-14-38-10t-38 10Z" fill="#f3cf72" opacity=".9"/>'; break;
        case 'scale': o+='<path d="M70 132q8-8 16 0M114 132q8-8 16 0M84 150q8-8 16 0" stroke="'+d+'" stroke-width="2.5" fill="none" opacity=".45"/>'; break;
        case 'crest': o+='<path d="M100 46q-10-24 4-34 4 14 14 18-6 10-18 16Z" fill="#f5c33f" stroke="#d8a93c" stroke-width="1.5"/>'; break;
      }
    });
    return o;
  }
  function faceSVG(sp, mood) {
    let eyes;
    if(mood==='sick') eyes='<path d="M80 84l10 10m0-10-10 10" stroke="#3c4661" stroke-width="3" stroke-linecap="round"/><path d="M110 84l10 10m0-10-10 10" stroke="#3c4661" stroke-width="3" stroke-linecap="round"/>';
    else if(mood==='sad') eyes='<path d="M80 92q5-5 10 0M110 92q5-5 10 0" stroke="#3c4661" stroke-width="3" fill="none" stroke-linecap="round"/>';
    else eyes='<circle cx="85" cy="88" r="5.4" fill="#2f3954"/><circle cx="115" cy="88" r="5.4" fill="#2f3954"/><circle cx="86.8" cy="86" r="1.9" fill="#fff"/><circle cx="116.8" cy="86" r="1.9" fill="#fff"/>';
    const mouth=mood==='happy'?'<path d="M90 101q10 11 20 0" stroke="#8b5a4a" stroke-width="2.6" fill="none" stroke-linecap="round"/>':
      (mood==='sad'||mood==='sick')?'<path d="M91 106q9-7 18 0" stroke="#8b5a4a" stroke-width="2.6" fill="none" stroke-linecap="round"/>':
      '<path d="M94 102q6 6 12 0" stroke="#8b5a4a" stroke-width="2.6" fill="none" stroke-linecap="round"/>';
    const patch=sp.ear==='round'?'<ellipse cx="85" cy="88" rx="12" ry="14" fill="#3b4359" opacity=".85"/><ellipse cx="115" cy="88" rx="12" ry="14" fill="#3b4359" opacity=".85"/>':'';
    return patch+eyes+'<ellipse cx="72" cy="100" rx="8" ry="4.5" fill="#ff8f9e" opacity=".5"/><ellipse cx="128" cy="100" rx="8" ry="4.5" fill="#ff8f9e" opacity=".5"/>'+
      '<path d="M100 96v3" stroke="#c8896b" stroke-width="2" stroke-linecap="round"/>'+mouth+
      (mood==='sick'?'<rect x="80" y="40" width="40" height="11" rx="5" fill="#bfe3f5" opacity=".9" transform="rotate(-8 100 45)"/>':'');
  }
  function accSVG(list, lv) {
    let o='';
    if(list.includes('wings')) o+='<path d="M62 118q-30-18-34 4 4 20 34 12Z" fill="#fff" stroke="#dfe7f5" stroke-width="2"/><path d="M138 118q30-18 34 4-4 20-34 12Z" fill="#fff" stroke="#dfe7f5" stroke-width="2"/>';
    if(list.includes('hat')) o+='<path d="M66 52q34-38 68 0Z" fill="#ef6a73"/><rect x="60" y="49" width="80" height="9" rx="4.5" fill="#d9535d"/><circle cx="100" cy="19" r="6" fill="#fff"/>';
    if(list.includes('crown')) o+='<path d="M68 48 74 26 88 40 100 20 112 40 126 26 132 48Z" fill="#f5c33f" stroke="#d9a326" stroke-width="2" stroke-linejoin="round"/><circle cx="100" cy="40" r="3" fill="#ef6a73"/>';
    if(list.includes('bow')) o+='<path d="M132 58q16-14 20 0-4 14-20 0Z" fill="#ef6a73"/><path d="M132 58q-16-14-20 0 4 14 20 0Z" fill="#ef6a73"/><circle cx="132" cy="58" r="5" fill="#d9535d"/>';
    if(list.includes('scarf')) o+='<path d="M74 114q26 14 52 0l3 12q-28 14-58 0Z" fill="#5b8def"/><path d="M120 124l8 22 8-4-6-20Z" fill="#4774d8"/>';
    if(list.includes('glasses')) o+='<circle cx="85" cy="88" r="12" fill="none" stroke="#4a5872" stroke-width="2.6"/><circle cx="115" cy="88" r="12" fill="none" stroke="#4a5872" stroke-width="2.6"/><path d="M97 88h6" stroke="#4a5872" stroke-width="2.6"/>';
    if(list.includes('medal')) o+='<path d="M86 118 100 128 114 118" fill="none" stroke="#e8585f" stroke-width="4"/><circle cx="100" cy="138" r="10" fill="#f5c33f" stroke="#d9a326" stroke-width="2"/>';
    if(lv>=7) o+='<circle cx="100" cy="86" r="62" fill="none" stroke="#f5c33f" stroke-width="3" opacity=".55" stroke-dasharray="6 9"/>';
    return o;
  }

  function petSVG(s, opts) {
    opts = opts || {};
    if(!s.adopted) return eggSVG();
    const sp = SPECIES[s.species] || SPECIES.cat;
    const table = opts.table || null;
    const lv = levelOf(s.exp || 0, table);
    const mood = moodOf(s);
    const k = 0.72 + lv * 0.043;
    const spark = lv>=5 ? '<g opacity=".85"><path d="M32 52l3 8 8 3-8 3-3 8-3-8-8-3 8-3Z" fill="#f5c33f"/><path d="M168 40l2 6 6 2-6 2-2 6-2-6-6-2 6-2Z" fill="#8b7cf1"/></g>' : '';
    const acc = s.acc || [];
    return '<svg class="pet-svg'+(opts.small?' small':'')+'" viewBox="0 0 200 210" role="img" aria-label="'+esc(s.petName||sp.n)+' Lv.'+lv+'">'+
      '<ellipse cx="100" cy="190" rx="'+(42*k).toFixed(1)+'" ry="8" fill="rgba(31,42,68,.10)"/>'+
      '<g class="pet-bob" transform="translate(100,165) scale('+k.toFixed(3)+') translate(-100,-165)">'+
        (lv>=6?'<ellipse cx="100" cy="86" rx="70" ry="70" fill="#ffdf8a" opacity=".28"/>':'')+
        tailSVG(sp.tail,sp)+
        '<ellipse cx="82" cy="170" rx="15" ry="9" fill="'+sp.dark+'"/><ellipse cx="118" cy="170" rx="15" ry="9" fill="'+sp.dark+'"/>'+
        '<ellipse cx="100" cy="132" rx="40" ry="42" fill="'+sp.body+'"/>'+
        '<ellipse cx="100" cy="140" rx="27" ry="30" fill="'+sp.belly+'"/>'+
        '<ellipse cx="70" cy="132" rx="10" ry="19" fill="'+sp.body+'" transform="rotate(-18 70 132)"/>'+
        '<ellipse cx="130" cy="132" rx="10" ry="19" fill="'+sp.body+'" transform="rotate(18 130 132)"/>'+
        extraSVG(sp.extra,sp)+
        earSVG(sp.ear,sp)+
        '<circle cx="100" cy="86" r="37" fill="'+sp.body+'"/>'+
        '<ellipse cx="100" cy="98" rx="24" ry="17" fill="'+sp.belly+'" opacity=".85"/>'+
        faceSVG(sp,mood)+accSVG(acc,lv)+
      '</g>'+spark+'</svg>';
  }
  function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
  function sceneStyle(key){const sp=SPECIES[key]||SPECIES.cat;return 'background:linear-gradient(160deg,'+sp.bg1+','+sp.bg2+')';}

  global.Pets = { SPECIES, GROUPS, STAGES, ACCS, MOODS, levelOf, nextExp, lvProgress, moodOf, petSVG, eggSVG, sceneStyle };
})(window);
