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
let data=subjects.map(s=>({id:s.id,name:s.name,grp:'社会',units:s.units.filter(id=>U[id]&&U[id].sheets&&U[id].sheets.length).map(id=>{
  const u=U[id], items=conv(u); total+=items.length; nfig+=items.filter(x=>x.g).length;
  return {id,label:typeof u.no==='number'?`第${u.no}講`:'受験',title:u.title,items};
})})).filter(s=>s.units.length);

// 理科：rika/*.txt（@ID|学年 分野|単元名 / k|問題|答え / m|問題|正解|ちがう… / t|文|○×）
//   図の問題：g|図の名前|指示文 → 図のラベル（A,B…）の名前を答える問題を自動で作る。
//   その後の k/m/t 行も同じ図を使う。g|- で図の問題をおわる。図は rika/figs.js に書く。
const RIKA=path.join(__dirname,'rika');
const FIELDS=[['phy','物理'],['che','化学'],['bio','生物'],['ear','地学']];
function renderFig(f,mode){
  let s=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${f.w} ${f.h}" font-family="inherit" font-size="14">`+f.body;
  for(const l of f.labels||[]){
    if(l.px!=null) s+=`<line x1="${l.x}" y1="${l.y}" x2="${l.px}" y2="${l.py}" stroke="#555" stroke-width="1.3"/><circle cx="${l.px}" cy="${l.py}" r="2.6" fill="#555"/>`;
    if(mode==='Q') s+=`<circle cx="${l.x}" cy="${l.y}" r="12" fill="#fff" stroke="#c8372d" stroke-width="2"/><text x="${l.x}" y="${l.y+5}" text-anchor="middle" font-size="15" font-weight="700" fill="#c8372d">${l.id}</text>`;
    else s+=`<text x="${l.x}" y="${l.y+5}" text-anchor="${l.a||'middle'}" font-size="14.5" font-weight="700" fill="#c8372d" stroke="#fff" stroke-width="4" stroke-linejoin="round" paint-order="stroke">${l.name}</text>`;
  }
  return s+'</svg>';
}
if(fs.existsSync(RIKA)){
  const RF=fs.existsSync(path.join(RIKA,'figs.js'))?require(path.join(RIKA,'figs.js')):{};
  for(const [k,f] of Object.entries(RF)){ FIGS['r_'+k+'Q']=renderFig(f,'Q'); if((f.labels||[]).length) FIGS['r_'+k+'Label']=renderFig(f,'L'); }
  const units=[],byId={};let cur=null,fig=null;const errs=[];
  for(const f of fs.readdirSync(RIKA).filter(f=>/\.txt$/.test(f)).sort())
    fs.readFileSync(path.join(RIKA,f),'utf8').split('\n').forEach((ln,n)=>{
      ln=ln.trim(); if(!ln||ln.startsWith('#')) return;
      const p=ln.split('|'); const where=f+':'+(n+1)+' ';
      if(p[0].startsWith('@')){ const id=p[0].slice(1); fig=null;
        if(byId[id]){cur=byId[id];return}
        const field=FIELDS.find(([,nm])=>p[1].includes(nm));
        if(!field){errs.push(where+'分野が分からない '+ln);return}
        cur={id,field:field[0],label:p[1].replace(field[1],'').trim(),title:p[2],items:[],seen:new Set()};units.push(cur);byId[id]=cur;return}
      if(!cur){errs.push(where+'単元がない '+ln);return}
      const add=(o,key)=>{ key+='|'+(fig?fig.key:''); if(cur.seen.has(key)){errs.push(where+'重複 '+ln);return} cur.seen.add(key);
        if(fig){o.g=['r_'+fig.key+'Q'];o.s=fig.s;used.add(o.g[0]);}
        o.i=hash(cur.id+key); cur.items.push(o); };
      const [t,q,...r]=p;
      if(t==='g'){
        if(q==='-'){fig=null;return}
        const F=RF[q]; if(!F){errs.push(where+'図がない '+q);return}
        fig={key:q,s:cur.id+'.'+q};
        for(const l of F.labels||[]) add({t:'k',q:l.id,a:l.ans||l.name,...(r[0]?{n:r[0]}:{})},l.id+'|'+(l.ans||l.name));
        return;
      }
      if(t==='k'&&r.length===1) add({t:r[0].length>16?'e':'k',q,a:r[0]},q+'|'+r[0]);
      else if(t==='m'&&r.length>=2) add({t:'m',q,c:r,a:0},q+'|'+r[0]);
      else if(t==='t'&&/^[○×]$/.test(r[0])) add({t:'t',q,a:r[0]},q+'|'+r[0]);
      else errs.push(where+'書き方 '+ln);
    });
  if(errs.length) throw new Error('理科の書き方エラー:\n'+errs.join('\n'));
  for(const [fid,fname] of FIELDS){
    const us=units.filter(u=>u.field===fid).map(u=>{delete u.seen;delete u.field;return u});
    const n=us.reduce((a,u)=>a+u.items.length,0); total+=n; nfig+=us.reduce((a,u)=>a+u.items.filter(x=>x.g).length,0);
    data.push({id:fid,name:fname,grp:'理科',units:us}); console.log(fname,us.length+'単元',n+'問','図'+us.reduce((a,u)=>a+u.items.filter(x=>x.g).length,0));
  }
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
