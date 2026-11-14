// 使い方: node build.js  → index.html と f/*.svg（図を1枚ずつ）を作る。
// 問題は shakai の units/*.js から、図は公開用の figs1〜4.js（build.py が作ったもの）から取りこむ。
const fs=require('fs'),path=require('path');
const SRC=process.env.SHAKAI_SRC||path.join(__dirname,'..','units');
const FIGDIR=process.env.SHAKAI_FIGS||path.join(__dirname,'..','out','web');
const OUT=process.env.ANKI_OUT||__dirname;
global.window={UNITS:{},__FIGS:[]};
for(const f of fs.readdirSync(SRC).sort()) new Function('window',fs.readFileSync(path.join(SRC,f),'utf8'))(window);
for(const f of fs.readdirSync(FIGDIR).filter(f=>/^figs\d+\.js$/.test(f)).sort()) new Function('window',fs.readFileSync(path.join(FIGDIR,f),'utf8'))(window);
const U=window.UNITS, FIGS=Object.assign({},...window.__FIGS);
const hash=s=>{let h=2166136261;for(const ch of s){h^=ch.codePointAt(0);h=Math.imul(h,16777619)}return (h>>>0).toString(36)};

// 図がないと答えられない文の問題（同じプリントの図を探して付ける）
const FIGREF=/地図[０-９0-9１-９]|地図を見て|図を見て|[ＡＢＣA-F]の地図|雨温図を読み取|右の|左の|下の図|上の図|矢印|次の資料|次の図|このグラフ|この図|この地図/;
const KIGO=/ア〜|ア～|[アイウエオカキクケ]と[アイウエオカキクケ]のうち|記号(を[0-9０-９2-9一二三]つ)?$|^[ア-ン]〜[ア-ン]/;
const FIGNOTE=/地図を見て|図を見て|雨温図を読み取|地図２のア|次の資料/;
const used=new Set(), dropped=[];

function figsOf(b){
  if(b.graphsQ||b.housesQ) return {g:b.graphsQ||b.housesQ,gl:null};
  if(b.figs) return {g:b.figs,gl:b.figLabels};
  if(b.fig) return {g:[b.fig],gl:null};
  return null;
}
// 「地図１」「グラフ２」などの言葉から、同じプリントの中の図を探す
function resolve(sheet,bi,text){
  const tok=(text.match(/(地図|グラフ|図|雨温図)[０-９0-9１-９]/)||[])[0];
  const norm=s=>s.replace(/[０-９]/g,d=>String.fromCharCode(d.charCodeAt(0)-0xFEE0));
  if(tok){
    for(const b of sheet.blocks){ const f=figsOf(b); if(!f) continue;
      if(b.note&&norm(b.note).startsWith(norm(tok))) return f;
      if(b.figLabels){ const k=b.figLabels.findIndex(l=>norm(l).startsWith(norm(tok))); if(k>=0) return {g:[b.figs[k]],gl:[b.figLabels[k]]}; }
    }
  }
  for(let j=bi-1;j>=0;j--){ const f=figsOf(sheet.blocks[j]); if(f) return f; }
  return null;
}
function conv(u){
  const items=[],seen=new Set();
  u.sheets.forEach((s,si)=>s.blocks.forEach((b,bi)=>{
    let f=figsOf(b);
    const grp=u.id+'.'+si+'.'+bi;
    for(const q of b.qs){
      const qt=q.q, txt=qt+(Array.isArray(q.c)?q.c.join(''):'');
      let g=f;
      if(!g){
        const needs=FIGREF.test(txt)||(b.note&&FIGNOTE.test(b.note))||(!Array.isArray(q.c)&&!b.tf&&KIGO.test(qt)&&!/ならべ|古い順/.test(b.note||''));
        if(needs){ g=resolve(s,bi,qt+' '+(b.note||'')); if(!g){ if(KIGO.test(qt)||/地図[０-９0-9１-９]|[ＡＢＣA-F]の地図/.test(txt)){dropped.push(u.id+' '+qt);continue;} g=null; } }
      }
      let o;
      if(Array.isArray(q.c)) o={t:'m',q:qt,c:q.c,a:q.a};
      else if(b.tf) o={t:'t',q:qt,a:q.a};
      else o={t:(q.w==='l'&&!g||q.w==='xl'||q.a.length>16)?'e':'k',q:qt,a:q.a};
      if(b.note) o.n=b.note;
      if(q.ex) o.x=q.ex;
      if(g){ o.g=g.g; if(g.gl&&g.gl.some(x=>x)) o.gl=g.gl; o.s=grp; g.g.forEach(k=>used.add(k)); }
      const key=qt+'|'+(o.t==='m'?q.c[q.a]:q.a)+'|'+(o.g||[]).join();
      if(seen.has(key)) continue; seen.add(key);
      o.i=hash(u.id+qt+'|'+(o.t==='m'?q.c[q.a]:q.a)); items.push(o);
    }
  }));
  return items;
}
const subjects=[
 {id:'geo',name:'地理',units:[...Array.from({length:21},(_,k)=>'geo'+String(k+1).padStart(2,'0')),'geo90']},
 {id:'his',name:'歴史',units:[...Array.from({length:18},(_,k)=>'his'+String(k+1).padStart(2,'0')),'his90']},
 {id:'civ',name:'公民',units:Array.from({length:13},(_,k)=>'civ'+String(k+1).padStart(2,'0')).concat(['civ90'])},
];
let total=0,nfig=0;
let data=subjects.map(s=>({id:s.id,name:s.name,units:s.units.filter(id=>U[id]&&U[id].sheets&&U[id].sheets.length).map(id=>{
  const u=U[id], items=conv(u); total+=items.length; nfig+=items.filter(x=>x.g).length;
  return {id,label:typeof u.no==='number'?`第${u.no}講`:'受験',title:u.title,items};
})})).filter(s=>s.units.length);

// 理科：rika/*.txt（@ID|学年 分野|単元名 / k|問題|答え / m|問題|正解|ちがう… / t|文|○×）
const RIKA=path.join(__dirname,'rika');
if(fs.existsSync(RIKA)){
  const units=[];let cur=null;const errs=[];
  for(const f of fs.readdirSync(RIKA).filter(f=>/\.txt$/.test(f)).sort())
    fs.readFileSync(path.join(RIKA,f),'utf8').split('\n').forEach((ln,n)=>{
      ln=ln.trim(); if(!ln||ln.startsWith('#')) return;
      const p=ln.split('|');
      if(p[0].startsWith('@')){cur={id:p[0].slice(1),label:p[1],title:p[2],items:[],seen:new Set()};units.push(cur);return}
      const [t,q,...r]=p; let o;
      if(t==='k'&&r.length===1) o={t:r[0].length>16?'e':'k',q,a:r[0]};
      else if(t==='m'&&r.length>=3) o={t:'m',q,c:r,a:0};
      else if(t==='t'&&/^[○×]$/.test(r[0])) o={t:'t',q,a:r[0]};
      else {errs.push(f+':'+(n+1)+' '+ln);return}
      const key=q+'|'+r[0]; if(cur.seen.has(key)) {errs.push('重複 '+ln);return} cur.seen.add(key);
      o.i=hash(cur.id+key); cur.items.push(o);
    });
  if(errs.length) throw new Error('理科の書き方エラー:\n'+errs.join('\n'));
  units.forEach(u=>delete u.seen);
  const n=units.reduce((a,u)=>a+u.items.length,0); total+=n;
  data.push({id:'sci',name:'理科',units}); console.log('理科',units.length+'単元',n+'問');
}

// 図を1枚ずつのファイルにする（答えの入った「〜Label」図もあれば一緒に）
const missing=[...used].filter(k=>!FIGS[k]);
if(missing.length) throw new Error('図が見つからない: '+missing.join(' '));
const labels={};
for(const k of used){ const l=k.replace(/Q$/,'Label'); if(l!==k&&FIGS[l]){labels[k]=l;} }
const fdir=path.join(OUT,'f'); fs.rmSync(fdir,{recursive:true,force:true}); fs.mkdirSync(fdir,{recursive:true});
let bytes=0;
for(const k of new Set([...used,...Object.values(labels)])){ fs.writeFileSync(path.join(fdir,k+'.svg'),FIGS[k]); bytes+=FIGS[k].length; }

console.log('dropped',dropped.length,dropped.join(' / '));
console.log('questions',total,'with figures',nfig,data.map(s=>s.name+':'+s.units.reduce((a,u)=>a+u.items.length,0)).join(' '));
console.log('figure files',used.size+Object.keys(labels).length,(bytes/1e6).toFixed(1)+'MB');
const json=JSON.stringify(data).replace(/<\//g,'<\\/');
const t=fs.readFileSync(path.join(__dirname,'template.html'),'utf8').replace('/*__DATA__*/[]',json).replace('/*__LABELS__*/{}',JSON.stringify(labels));
fs.writeFileSync(path.join(OUT,'index.html'),t); console.log('index.html',(t.length/1024|0)+'KB');
