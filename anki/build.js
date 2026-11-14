// 使い方: node build.js  → index.html（1ファイル完結）を作る。問題は shakai の units/*.js から取りこむ。
const fs=require('fs'),path=require('path');
const SRC=process.env.SHAKAI_SRC||path.join(__dirname,'..','units');
global.window={UNITS:{}};
for(const f of fs.readdirSync(SRC).sort()) new Function('window',fs.readFileSync(path.join(SRC,f),'utf8'))(window);
const U=window.UNITS;
const hash=s=>{let h=2166136261;for(const ch of s){h^=ch.codePointAt(0);h=Math.imul(h,16777619)}return (h>>>0).toString(36)};
const FIGREF=/地図[０-９0-9１-９]|地図を見て|図を見て|[ＡＢＣA-F]の地図|雨温図を読み取|右の|左の|下の図|上の図|矢印|次の資料|次の図|このグラフ|この図|この地図/;
const KIGO=/ア〜|ア～|[アイウエオカキクケ]と[アイウエオカキクケ]のうち|記号(を[0-9０-９2-9一二三]つ)?$|^[ア-ン]〜[ア-ン]/;
const FIGNOTE=/地図を見て|図を見て|雨温図を読み取|地図２のア|次の資料/;
const dropped=[];
function conv(u){
  const items=[],seen=new Set();
  for(const s of u.sheets) for(const b of s.blocks){
    if(b.fig||b.figs||b.graphsQ||b.housesQ||b.side) continue;
    if(b.note&&FIGNOTE.test(b.note)) continue;
    for(const q of b.qs){
      const qt=q.q; if(FIGREF.test(qt)) continue; if(!Array.isArray(q.c)&&!b.tf&&KIGO.test(qt)&&!/ならべ|古い順/.test(b.note||'')) {dropped.push(u.id+' '+qt); continue;}
      if(Array.isArray(q.c)){ if(q.c.some(c=>FIGREF.test(c))) continue;
        const o={t:'m',q:qt,c:q.c,a:q.a}; if(q.fixc) o.f=1; if(b.note) o.n=b.note; push(o,qt+'|'+q.c[q.a]); }
      else if(b.tf){ push({t:'t',q:qt,a:q.a},qt+'|'+q.a); }
      else { const long=(q.w==='l'||q.w==='xl'||q.a.length>16);
        const o={t:long?'e':'k',q:qt,a:q.a}; if(b.note) o.n=b.note; if(q.ex) o.x=q.ex; push(o,qt+'|'+q.a); }
    }
  }
  function push(o,key){ if(seen.has(key)) return; seen.add(key); o.i=hash(u.id+key); items.push(o); }
  return items;
}
const subjects=[
 {id:'geo',name:'地理',color:'#13806f',units:[...Array.from({length:21},(_,k)=>'geo'+String(k+1).padStart(2,'0')),'geo90']},
 {id:'his',name:'歴史',color:'#3f4fa8',units:[...Array.from({length:18},(_,k)=>'his'+String(k+1).padStart(2,'0')),'his90']},
];
let total=0;
const data=subjects.map(s=>({id:s.id,name:s.name,color:s.color,units:s.units.filter(id=>U[id]).map(id=>{
  const u=U[id], items=conv(u); total+=items.length;
  return {id,label:typeof u.no==='number'?`第${u.no}講`:'受験',title:u.title,items};
})}));
console.log('dropped',dropped.length,dropped.slice(0,40).join('\n'));console.log('questions',total,data.map(s=>s.name+':'+s.units.reduce((a,u)=>a+u.items.length,0)).join(' '));
const json=JSON.stringify(data).replace(/<\//g,'<\\/');
const t=fs.readFileSync(path.join(__dirname,'template.html'),'utf8').replace('/*__DATA__*/[]',json);
fs.writeFileSync(path.join(__dirname,'index.html'),t); console.log('index.html',(t.length/1024|0)+'KB');
