// 理科の図。1つの図から「問題用（A,B…）」と「答え入り（名前）」の2枚を作る。
// labels: id=記号, name=図に書く名前, ans=答え（名前とちがうとき）, x,y=記号の位置, px,py=指す点, a=答え入りの文字のそろえ（start/end/middle）
const T=(x,y,t,o='')=>`<text x="${x}" y="${y}" ${o}>${t}</text>`;
const BIG=(x,y,t)=>T(x,y,t,'font-size="18" font-weight="700" text-anchor="middle" fill="#1d2433"');
const SM=(x,y,t,a='middle')=>T(x,y,t,`font-size="13" fill="#444" text-anchor="${a}"`);
const ST='stroke="#333" stroke-width="2"';
const F={};

/* ================= 生物 ================= */
F.microscope={w:420,h:360,body:`
<rect x="110" y="318" width="200" height="24" rx="7" fill="#c9cfd8" ${ST}/>
<path d="M238 318 L272 318 L272 205 Q272 118 214 92 L202 120 Q240 138 240 205 Z" fill="#aab3c0" ${ST}/>
<rect x="160" y="62" width="40" height="88" fill="#dfe4ea" ${ST}/>
<rect x="167" y="30" width="26" height="34" rx="3" fill="#eef1f5" ${ST}/>
<path d="M148 150 L212 150 L203 170 L157 170 Z" fill="#aab3c0" ${ST}/>
<rect x="166" y="170" width="13" height="30" fill="#dfe4ea" ${ST}/>
<path d="M188 170 L198 168 L206 192 L196 196 Z" fill="#dfe4ea" ${ST}/>
<rect x="118" y="214" width="156" height="12" fill="#aab3c0" ${ST}/>
<rect x="150" y="208" width="60" height="6" fill="#cfe6f7" stroke="#333" stroke-width="1"/>
<rect x="160" y="226" width="40" height="9" fill="#7f8a99" ${ST}/>
<line x1="180" y1="270" x2="245" y2="270" stroke="#333" stroke-width="3"/>
<ellipse cx="180" cy="282" rx="25" ry="9" fill="#e9eef3" ${ST}/>
<circle cx="264" cy="190" r="16" fill="#7f8a99" ${ST}/>`,
labels:[
 {id:'A',name:'接眼レンズ',x:90,y:46,px:167,py:46,a:'end'},
 {id:'B',name:'鏡筒',x:90,y:100,px:160,py:100,a:'end'},
 {id:'C',name:'レボルバー',x:340,y:150,px:208,py:158,a:'start'},
 {id:'D',name:'対物レンズ',x:90,y:186,px:166,py:186,a:'end'},
 {id:'E',name:'ステージ',x:90,y:220,px:118,py:220,a:'end'},
 {id:'F',name:'しぼり',x:90,y:250,px:165,py:232,a:'end'},
 {id:'G',name:'反射鏡',x:90,y:290,px:157,py:284,a:'end'},
 {id:'H',name:'調節ねじ',x:340,y:200,px:279,py:192,a:'start'},
]};

F.flower={w:420,h:330,body:`
<rect x="203" y="268" width="14" height="60" fill="#8cc06a" ${ST}/>
<path d="M176 262 Q138 256 122 224 Q160 238 188 254 Z" fill="#8cc06a" ${ST}/>
<path d="M244 262 Q282 256 298 224 Q260 238 232 254 Z" fill="#8cc06a" ${ST}/>
<path d="M184 256 Q104 204 116 118 Q160 168 198 244 Z" fill="#f7c6d9" ${ST}/>
<path d="M236 256 Q316 204 304 118 Q260 168 222 244 Z" fill="#f7c6d9" ${ST}/>
<ellipse cx="210" cy="266" rx="42" ry="10" fill="#8cc06a" ${ST}/>
<line x1="186" y1="252" x2="164" y2="152" stroke="#555" stroke-width="3"/>
<line x1="234" y1="252" x2="256" y2="152" stroke="#555" stroke-width="3"/>
<ellipse cx="163" cy="142" rx="8" ry="14" fill="#f5d34a" ${ST}/>
<ellipse cx="257" cy="142" rx="8" ry="14" fill="#f5d34a" ${ST}/>
<rect x="206" y="130" width="8" height="74" fill="#c8e3a8" ${ST}/>
<ellipse cx="210" cy="124" rx="15" ry="8" fill="#b6d77a" ${ST}/>
<ellipse cx="210" cy="230" rx="25" ry="33" fill="#c8e3a8" ${ST}/>
<circle cx="203" cy="220" r="5.5" fill="#fff" ${ST}/><circle cx="217" cy="220" r="5.5" fill="#fff" ${ST}/>
<circle cx="203" cy="240" r="5.5" fill="#fff" ${ST}/><circle cx="217" cy="240" r="5.5" fill="#fff" ${ST}/>`,
labels:[
 {id:'A',name:'柱頭',x:340,y:110,px:222,py:122,a:'start'},
 {id:'B',name:'やく',x:80,y:130,px:157,py:138,a:'end'},
 {id:'C',name:'花弁',x:80,y:180,px:136,py:180,a:'end'},
 {id:'D',name:'がく',x:80,y:236,px:140,py:240,a:'end'},
 {id:'E',name:'子房',x:340,y:262,px:232,py:250,a:'start'},
 {id:'F',name:'胚珠',x:340,y:206,px:220,py:220,a:'start'},
 {id:'G',name:'おしべ',x:340,y:160,px:250,py:190,a:'start'},
]};

F.pine={w:420,h:240,body:`
<path d="M70 40 Q50 80 70 130 Q90 80 70 40 Z" fill="#e7b6c8" ${ST}/>
<path d="M60 70 L80 70 M58 90 L82 90 M60 110 L80 110" stroke="#333" stroke-width="1.5"/>
${BIG(70,165,'雌花')}
<path d="M140 60 L250 60 L250 150 L140 150 Z" fill="#f4e3c1" ${ST}/>
<circle cx="180" cy="128" r="11" fill="#fff" ${ST}/><circle cx="212" cy="128" r="11" fill="#fff" ${ST}/>
${SM(195,180,'雌花のりん片')}
<path d="M290 60 L390 60 L390 150 L290 150 Z" fill="#f4e3c1" ${ST}/>
<ellipse cx="320" cy="122" rx="14" ry="20" fill="#f5d34a" ${ST}/><ellipse cx="360" cy="122" rx="14" ry="20" fill="#f5d34a" ${ST}/>
${SM(340,180,'雄花のりん片')}`,
labels:[
 {id:'A',name:'胚珠',x:196,y:215,px:196,py:132},
 {id:'B',name:'花粉のう',x:340,y:215,px:340,py:132},
]};

F.cells={w:480,h:290,body:`
<rect x="70" y="50" width="170" height="150" rx="6" fill="#f3fbef" stroke="#3e8e41" stroke-width="6"/>
<rect x="80" y="60" width="150" height="130" rx="4" fill="none" stroke="#333" stroke-width="1.5"/>
<ellipse cx="170" cy="120" rx="42" ry="42" fill="#dcecfb" stroke="#6a8db5" stroke-width="1.5"/>
<circle cx="112" cy="92" r="15" fill="#e7c3e6" ${ST}/>
<ellipse cx="100" cy="176" rx="8" ry="5" fill="#4caf50"/><ellipse cx="128" cy="180" rx="8" ry="5" fill="#4caf50"/>
<ellipse cx="96" cy="140" rx="8" ry="5" fill="#4caf50"/><ellipse cx="214" cy="74" rx="8" ry="5" fill="#4caf50"/><ellipse cx="216" cy="176" rx="8" ry="5" fill="#4caf50"/>
<ellipse cx="380" cy="125" rx="78" ry="62" fill="#fdf1e7" ${ST}/>
<circle cx="380" cy="125" r="17" fill="#e7c3e6" ${ST}/>
${BIG(155,272,'植物の細胞')}${BIG(380,272,'動物の細胞')}`,
labels:[
 {id:'A',name:'細胞壁',x:48,y:72,px:70,py:76,a:'end'},
 {id:'B',name:'細胞膜',x:48,y:112,px:80,py:112,a:'end'},
 {id:'C',name:'核',x:112,y:25,px:112,py:78},
 {id:'D',name:'葉緑体',x:48,y:178,px:92,py:178,a:'end'},
 {id:'E',name:'液胞',x:190,y:25,px:178,py:84},
 {id:'F',name:'核',x:380,y:25,px:380,py:108},
 {id:'G',name:'細胞膜',x:380,y:228,px:380,py:187},
]};

F.stem=(()=>{let b='';
  const bundle=(cx,cy,ang,r)=>{const c=Math.cos(ang),s=Math.sin(ang);
    return `<circle cx="${(cx+c*r).toFixed(1)}" cy="${(cy+s*r).toFixed(1)}" r="9" fill="#8fbbe6" stroke="#333"/><circle cx="${(cx+c*(r+16)).toFixed(1)}" cy="${(cy+s*(r+16)).toFixed(1)}" r="8" fill="#f2c48d" stroke="#333"/>`};
  b+=`<circle cx="110" cy="125" r="88" fill="#eef7e6" ${ST}/>`;
  for(let k=0;k<8;k++) b+=bundle(110,125,k*Math.PI/4,46);
  b+=`<circle cx="340" cy="125" r="88" fill="#eef7e6" ${ST}/>`;
  [[0,0],[-40,-30],[35,-38],[-50,25],[45,30],[0,50],[-10,-60],[60,-5],[-62,-2],[20,-15],[-22,18],[25,60]].forEach(([dx,dy])=>{
    const ang=Math.atan2(dy,dx)||-Math.PI/2; b+=`<circle cx="${340+dx}" cy="${125+dy}" r="7" fill="#8fbbe6" stroke="#333"/><circle cx="${(340+dx+Math.cos(ang)*12).toFixed(1)}" cy="${(125+dy+Math.sin(ang)*12).toFixed(1)}" r="6" fill="#f2c48d" stroke="#333"/>`;});
  b+=BIG(110,240,'ア')+BIG(340,240,'イ');
  return {w:450,h:250,body:b,labels:[
    {id:'A',name:'道管',x:225,y:150,px:157,py:126},
    {id:'B',name:'師管',x:225,y:95,px:172,py:122},
  ]};})();

F.digest={w:430,h:380,body:`
<rect x="105" y="20" width="220" height="345" rx="60" fill="#fff5ee" stroke="#ccc" stroke-width="2"/>
<path d="M212 22 L212 118 Q214 134 228 140" stroke="#d98c8c" stroke-width="11" fill="none" stroke-linecap="round"/>
<path d="M124 112 Q152 92 232 106 Q248 122 228 150 Q182 176 128 162 Q112 142 124 112 Z" fill="#b5654f" ${ST}/>
<path d="M228 126 Q274 104 298 130 Q310 178 272 198 Q246 208 240 182 Q262 170 256 152 Q246 142 230 146 Z" fill="#e8a0a0" ${ST}/>
<ellipse cx="188" cy="168" rx="10" ry="7" fill="#6bb36b" ${ST}/>
<path d="M206 200 Q246 188 294 202 Q290 214 246 212 Q220 214 206 208 Z" fill="#f0d080" ${ST}/>
<path d="M154 335 L154 240 Q154 226 168 226 L268 226 Q284 226 284 241 L284 322 Q284 338 268 338 L234 338 L234 362" stroke="#c9a27a" stroke-width="16" fill="none" stroke-linejoin="round"/>
<path d="M184 250 C212 238 242 258 252 252 C266 248 258 272 232 270 C204 268 184 282 204 290 C232 298 258 288 252 306 C246 320 208 314 192 317" stroke="#e7b38c" stroke-width="9" fill="none" stroke-linecap="round"/>`,
labels:[
 {id:'A',name:'食道',x:340,y:60,px:216,py:60,a:'start'},
 {id:'B',name:'肝臓',x:88,y:128,px:140,py:128,a:'end'},
 {id:'C',name:'胃',x:340,y:150,px:290,py:150,a:'start'},
 {id:'D',name:'胆のう',x:88,y:180,px:180,py:170,a:'end'},
 {id:'E',name:'すい臓',x:340,y:205,px:282,py:204,a:'start'},
 {id:'F',name:'小腸',x:340,y:280,px:252,py:290,a:'start'},
 {id:'G',name:'大腸',x:88,y:285,px:154,py:285,a:'end'},
]};

F.heart={w:450,h:330,body:`
<rect x="135" y="118" width="85" height="72" rx="10" fill="#cfe0f5" ${ST}/>
<rect x="230" y="118" width="85" height="72" rx="10" fill="#f6d0d0" ${ST}/>
<path d="M135 196 L220 196 L220 300 Q170 300 135 230 Z" fill="#cfe0f5" ${ST}/>
<path d="M230 196 L315 196 L315 230 Q290 300 230 300 Z" fill="#f6d0d0" ${ST}/>
<rect x="55" y="140" width="80" height="24" fill="#9db8e0" ${ST}/>
<rect x="315" y="140" width="80" height="24" fill="#e79a9a" ${ST}/>
<path d="M200 205 L200 62 Q200 46 184 46 L82 46" stroke="#6f93cf" stroke-width="18" fill="none"/>
<path d="M258 205 L258 62 Q258 46 274 46 L388 46" stroke="#d45a5a" stroke-width="18" fill="none"/>
${SM(225,322,'正面から見た図（向かって左が、からだの右側）')}`,
labels:[
 {id:'A',name:'右心房',x:100,y:105,px:150,py:130,a:'end'},
 {id:'B',name:'右心室',x:100,y:255,px:160,py:252,a:'end'},
 {id:'C',name:'左心房',x:350,y:105,px:300,py:130,a:'start'},
 {id:'D',name:'左心室',x:350,y:255,px:290,py:252,a:'start'},
 {id:'E',name:'大動脈',x:405,y:78,px:372,py:48,a:'start'},
 {id:'F',name:'肺動脈',x:52,y:78,px:96,py:48,a:'end'},
 {id:'G',name:'肺静脈',x:405,y:195,px:380,py:162,a:'start'},
 {id:'H',name:'大静脈',x:52,y:195,px:72,py:162,a:'end'},
]};

F.eye={w:430,h:270,body:`
<circle cx="235" cy="135" r="95" fill="#fff" ${ST}/>
<path d="M 244 47 A 88 88 0 0 1 244 223" stroke="#e08a3c" stroke-width="6" fill="none"/>
<path d="M150 88 Q110 135 150 182" fill="#eaf4fb" ${ST}/>
<ellipse cx="164" cy="135" rx="14" ry="32" fill="#cfe6f7" ${ST}/>
<rect x="148" y="88" width="7" height="24" fill="#7a5230"/><rect x="148" y="158" width="7" height="24" fill="#7a5230"/>
<rect x="326" y="124" width="74" height="22" fill="#f1d38a" ${ST}/>`,
labels:[
 {id:'A',name:'虹彩',x:95,y:80,px:150,py:98,a:'end'},
 {id:'B',name:'レンズ',ans:'レンズ（水晶体）',x:95,y:215,px:162,py:160,a:'end'},
 {id:'C',name:'網膜',x:310,y:250,px:281,py:212,a:'start'},
 {id:'D',name:'視神経',x:380,y:95,px:375,py:124},
]};

F.vertebrates={w:460,h:230,body:(()=>{
  const rows=[['なかま','魚類','両生類','ハチュウ類','鳥類','哺乳類'],['呼吸','えら','子：えら・皮ふ 親：肺・皮ふ','肺','肺','肺'],['体表','うろこ','しめった皮ふ','うろこ','羽毛','毛'],['うまれ方','卵生','卵生','卵生','卵生','胎生']];
  let s='';const cw=[70,70,110,70,70,70],x0=0;let y=10;
  rows.forEach((r,ri)=>{let x=x0;r.forEach((c,ci)=>{const w=cw[ci];s+=`<rect x="${x}" y="${y}" width="${w}" height="50" fill="${ri===0||ci===0?'#eef0f3':'#fff'}" stroke="#333"/>`;
    const lines=c.split(' ');lines.forEach((t,k)=>s+=T(x+w/2,y+28+(k-(lines.length-1)/2)*16,t,`text-anchor="middle" font-size="${t.length>6?11.5:13.5}"`));x+=w;});y+=52;});
  return s;})(),labels:[]};

/* ================= 化学 ================= */
F.burner={w:400,h:340,body:`
<path d="M165 64 Q176 10 187 64 Z" fill="#8ab8f2" stroke="#4a7fc0" stroke-width="1.5"/>
<rect x="161" y="64" width="30" height="176" fill="#c9cfd8" ${ST}/>
<rect x="149" y="160" width="54" height="18" rx="4" fill="#9aa4b2" ${ST}/>
<rect x="153" y="200" width="46" height="16" rx="3" fill="#7f8a99" ${ST}/>
<rect x="110" y="240" width="132" height="24" rx="7" fill="#aab3c0" ${ST}/>
<rect x="242" y="246" width="70" height="11" fill="#e0b080" ${ST}/>
<rect x="290" y="232" width="10" height="38" rx="2" fill="#c0392b" ${ST}/>
<rect x="312" y="242" width="40" height="18" fill="#aab3c0" ${ST}/>`,
labels:[
 {id:'A',name:'空気調節ねじ',x:125,y:169,px:149,py:169,a:'end'},
 {id:'B',name:'ガス調節ねじ',x:125,y:208,px:153,py:208,a:'end'},
 {id:'C',name:'コック',x:330,y:210,px:296,py:236,a:'start'},
]};

F.gascollect={w:480,h:250,body:`
<rect x="15" y="140" width="135" height="65" fill="#dbeefc" ${ST}/>
<rect x="68" y="70" width="42" height="112" fill="#fff" ${ST}/><rect x="70" y="118" width="38" height="62" fill="#dbeefc"/>
<path d="M0 105 L40 105 L40 192 L88 192 L88 168" stroke="#555" stroke-width="4" fill="none"/>
<rect x="215" y="55" width="50" height="115" fill="#fff" ${ST}/><rect x="221" y="168" width="38" height="6" fill="#fff"/>
<path d="M240 235 L240 70" stroke="#555" stroke-width="4" fill="none"/>
<path d="M375 70 L375 185 L425 185 L425 70" fill="#fff" ${ST}/>
<path d="M400 15 L400 172" stroke="#555" stroke-width="4" fill="none"/>`,
labels:[
 {id:'A',name:'水上置換法',x:82,y:232},
 {id:'B',name:'上方置換法',x:290,y:232},
 {id:'C',name:'下方置換法',x:440,y:232},
]};

F.filtration={w:400,h:320,body:`
<line x1="150" y1="18" x2="176" y2="96" stroke="#888" stroke-width="6" stroke-linecap="round"/>
<path d="M124 60 L264 60 L204 150 L184 150 Z" fill="#eef6fb" ${ST}/>
<path d="M136 66 L252 66 L198 142 L190 142 Z" fill="#fff" stroke="#999" stroke-width="1.5"/>
<path d="M186 150 L198 150 L198 228 L186 242 Z" fill="#eef6fb" ${ST}/>
<path d="M182 170 L182 300 L330 300 L330 170" fill="none" ${ST}/>
<rect x="184" y="262" width="144" height="36" fill="#dbeefc"/>`,
labels:[
 {id:'A',name:'ガラス棒',x:95,y:40,px:156,py:38,a:'end'},
 {id:'B',name:'ろ紙',x:310,y:85,px:232,py:90,a:'start'},
 {id:'C',name:'ろうと',x:310,y:128,px:226,py:118,a:'start'},
 {id:'D',name:'ろ液',x:360,y:282,px:300,py:282,a:'start'},
]};

F.distill={w:440,h:320,body:`
<rect x="108" y="88" width="24" height="70" fill="#fff" ${ST}/>
<circle cx="120" cy="200" r="55" fill="#fff" ${ST}/>
<path d="M68 215 A55 55 0 0 0 172 215 Z" fill="#f2c7cf"/>
<circle cx="120" cy="200" r="55" fill="none" ${ST}/>
<circle cx="108" cy="238" r="4" fill="#555"/><circle cx="122" cy="244" r="4" fill="#555"/><circle cx="136" cy="236" r="4" fill="#555"/>
<rect x="116" y="30" width="8" height="80" fill="#fff" stroke="#333" stroke-width="1.5"/><circle cx="120" cy="113" r="5" fill="#d33"/>
<line x1="132" y1="112" x2="300" y2="185" stroke="#777" stroke-width="5"/>
<rect x="262" y="185" width="96" height="100" fill="#dbeefc" ${ST}/>
<rect x="292" y="150" width="24" height="112" rx="12" fill="#fff" ${ST}/>
<rect x="110" y="270" width="20" height="40" fill="#aab3c0" ${ST}/><path d="M113 268 Q120 252 127 268 Z" fill="#8ab8f2"/>`,
labels:[
 {id:'A',name:'温度計',x:65,y:60,px:116,py:60,a:'end'},
 {id:'B',name:'沸騰石',x:65,y:262,px:106,py:242,a:'end'},
 {id:'C',name:'試験管',x:395,y:160,px:316,py:175,a:'start'},
]};

F.electrolysis={w:400,h:320,body:`
<rect x="90" y="40" width="44" height="220" fill="#dbeefc" ${ST}/>
<rect x="266" y="40" width="44" height="220" fill="#dbeefc" ${ST}/>
<rect x="92" y="42" width="40" height="100" fill="#fff"/>
<rect x="268" y="42" width="40" height="50" fill="#fff"/>
<rect x="134" y="225" width="132" height="24" fill="#dbeefc" ${ST}/><rect x="133" y="227" width="134" height="20" fill="#dbeefc"/>
<rect x="104" y="236" width="16" height="20" fill="#777"/><rect x="280" y="236" width="16" height="20" fill="#777"/>
<path d="M112 258 L112 300 L180 300 M220 300 L288 300 L288 258" stroke="#333" stroke-width="2" fill="none"/>
<line x1="186" y1="288" x2="186" y2="312" stroke="#333" stroke-width="2"/><line x1="200" y1="294" x2="200" y2="306" stroke="#333" stroke-width="4"/>
<line x1="180" y1="300" x2="186" y2="300" stroke="#333" stroke-width="2"/><line x1="200" y1="300" x2="220" y2="300" stroke="#333" stroke-width="2"/>
${SM(112,292,'陰極（−）')}${SM(288,292,'陽極（＋）')}`,
labels:[
 {id:'A',name:'水素',x:112,y:95},
 {id:'B',name:'酸素',x:288,y:68},
]};

F.solubility=(()=>{
  const X=t=>70+t*5.4, Y=g=>270-g*1.85;
  let b='';
  for(let t=0;t<=60;t+=10){b+=`<line x1="${X(t)}" y1="${Y(0)}" x2="${X(t)}" y2="${Y(120)}" stroke="#ddd"/>`+SM(X(t),Y(0)+18,t);}
  for(let g=0;g<=120;g+=20){b+=`<line x1="${X(0)}" y1="${Y(g)}" x2="${X(60)}" y2="${Y(g)}" stroke="#ddd"/>`+SM(X(0)-8,Y(g)+4,g,'end');}
  b+=`<rect x="${X(0)}" y="${Y(120)}" width="${X(60)-X(0)}" height="${Y(0)-Y(120)}" fill="none" stroke="#333" stroke-width="1.5"/>`;
  const curve=(pts,c)=>`<polyline points="${pts.map(([t,g])=>X(t)+','+Y(g).toFixed(1)).join(' ')}" fill="none" stroke="${c}" stroke-width="3" stroke-linejoin="round"/>`;
  b+=curve([[0,13.3],[10,22],[20,31.6],[30,45.6],[40,63.9],[50,85.2],[60,109]],'#c0392b');
  b+=curve([[0,5.7],[10,7.6],[20,11.4],[30,16.6],[40,23.8],[50,36.4],[60,57.4]],'#2b6cb0');
  b+=curve([[0,35.7],[10,35.7],[20,35.8],[30,36.1],[40,36.3],[50,36.7],[60,37.1]],'#2e7d32');
  b+=SM(230,305,'水の温度〔℃〕')+T(22,150,'100gの水にとける質量〔g〕','font-size="13" fill="#444" text-anchor="middle" transform="rotate(-90 22 150)"');
  return {w:540,h:315,body:b,labels:[
    {id:'A',name:'硝酸カリウム',x:X(60)+18,y:Y(109),a:'start'},
    {id:'B',name:'ミョウバン',x:X(60)+18,y:Y(57.4),a:'start'},
    {id:'C',name:'塩化ナトリウム',x:X(60)+18,y:Y(37.1)+4,a:'start'},
  ]};})();

F.atom={w:400,h:300,body:`
<circle cx="200" cy="150" r="105" fill="none" stroke="#999" stroke-width="1.5" stroke-dasharray="6 5"/>
<circle cx="200" cy="150" r="34" fill="#fbeaea" stroke="#999" stroke-dasharray="3 3"/>
<circle cx="188" cy="140" r="13" fill="#e57373" ${ST}/><text x="188" y="145" text-anchor="middle" font-weight="700">＋</text>
<circle cx="212" cy="160" r="13" fill="#e57373" ${ST}/><text x="212" y="165" text-anchor="middle" font-weight="700">＋</text>
<circle cx="212" cy="138" r="13" fill="#cfd4dc" ${ST}/><circle cx="188" cy="162" r="13" fill="#cfd4dc" ${ST}/>
<circle cx="95" cy="150" r="9" fill="#64b5f6" ${ST}/><text x="95" y="155" text-anchor="middle" font-weight="700" font-size="13">−</text>
<circle cx="305" cy="150" r="9" fill="#64b5f6" ${ST}/><text x="305" y="155" text-anchor="middle" font-weight="700" font-size="13">−</text>
${SM(200,290,'ヘリウム原子のモデル')}`,
labels:[
 {id:'A',name:'陽子',x:150,y:40,px:184,py:134},
 {id:'B',name:'中性子',x:262,y:40,px:216,py:132},
 {id:'C',name:'電子',x:345,y:205,px:310,py:158},
 {id:'D',name:'原子核',x:95,y:235,px:178,py:174,a:'end'},
]};

F.daniell={w:420,h:300,body:`
<path d="M60 100 L60 270 L360 270 L360 100" fill="none" ${ST}/>
<rect x="62" y="130" width="296" height="138" fill="#e3effb"/>
<rect x="210" y="130" width="148" height="138" fill="#bcd8f2"/>
<line x1="210" y1="110" x2="210" y2="268" stroke="#8a6d3b" stroke-width="3" stroke-dasharray="6 4"/>
<rect x="110" y="70" width="18" height="170" fill="#b0b7c3" ${ST}/>
<rect x="292" y="70" width="18" height="170" fill="#d08a5a" ${ST}/>
<path d="M119 70 L119 30 L180 30 M240 30 L301 30 L301 70" stroke="#333" stroke-width="2" fill="none"/>
<circle cx="210" cy="30" r="22" fill="#fff" ${ST}/><text x="210" y="36" text-anchor="middle" font-weight="700">M</text>
${SM(135,292,'硫酸亜鉛水溶液')}${SM(285,292,'硫酸銅水溶液')}`,
labels:[
 {id:'A',name:'亜鉛板',x:35,y:90,px:110,py:100,a:'start'},
 {id:'B',name:'銅板',x:390,y:90,px:310,py:100,a:'end'},
 {id:'C',name:'セロハン',x:210,y:85,px:210,py:132},
]};

/* ================= 物理 ================= */
F.reflection={w:400,h:260,body:`
<rect x="40" y="200" width="320" height="14" fill="#cfe6f7" ${ST}/>
<line x1="200" y1="40" x2="200" y2="200" stroke="#777" stroke-width="1.5" stroke-dasharray="6 5"/>
<line x1="90" y1="70" x2="200" y2="200" stroke="#e0a800" stroke-width="4"/>
<line x1="200" y1="200" x2="310" y2="70" stroke="#e0a800" stroke-width="4"/>
<path d="M140 130 l8 -12 l3 12 z" fill="#e0a800"/><path d="M262 130 l3 -14 l7 10 z" fill="#e0a800"/>
<path d="M200 140 A60 60 0 0 0 161 154" fill="none" stroke="#333"/>
<path d="M200 140 A60 60 0 0 1 239 154" fill="none" stroke="#333"/>
<path d="M130 200 A70 70 0 0 1 155 147" fill="none" stroke="#999" stroke-dasharray="3 3"/>
${SM(48,235,'鏡','start')}${SM(80,60,'入る光','middle')}${SM(320,60,'反射した光','middle')}${BIG(122,190,'ウ')}`,
labels:[
 {id:'A',name:'入射角',x:180,y:118,a:'end'},
 {id:'B',name:'反射角',x:220,y:118,a:'start'},
]};

F.refraction={w:400,h:280,body:`
<rect x="20" y="140" width="360" height="130" fill="#dbeefc"/>
<line x1="20" y1="140" x2="380" y2="140" stroke="#333" stroke-width="2"/>
<line x1="200" y1="20" x2="200" y2="270" stroke="#777" stroke-width="1.5" stroke-dasharray="6 5"/>
<line x1="90" y1="40" x2="200" y2="140" stroke="#e0a800" stroke-width="4"/>
<line x1="200" y1="140" x2="250" y2="260" stroke="#e0a800" stroke-width="4"/>
<path d="M200 90 A50 50 0 0 0 163 106" fill="none" stroke="#333"/>
<path d="M200 200 A60 60 0 0 0 223 195" fill="none" stroke="#333"/>
${SM(30,130,'空気','start')}${SM(30,165,'水','start')}`,
labels:[
 {id:'A',name:'入射角',x:175,y:70,a:'end'},
 {id:'B',name:'屈折角',x:225,y:220,a:'start'},
]};

F.lens={w:460,h:240,body:`
<line x1="10" y1="120" x2="450" y2="120" stroke="#777" stroke-width="1.5"/>
<path d="M230 40 Q256 120 230 200 Q204 120 230 40 Z" fill="#dcecfb" ${ST}/>
<circle cx="150" cy="120" r="4" fill="#333"/><circle cx="310" cy="120" r="4" fill="#333"/>
<circle cx="70" cy="120" r="3" fill="#777"/><circle cx="390" cy="120" r="3" fill="#777"/>
${SM(70,140,'2F')}${SM(390,140,'2F')}
<line x1="40" y1="120" x2="40" y2="72" stroke="#2b6cb0" stroke-width="4"/><path d="M32 80 L40 64 L48 80 Z" fill="#2b6cb0"/>
<line x1="40" y1="72" x2="230" y2="72" stroke="#e0a800" stroke-width="2"/>
<line x1="230" y1="72" x2="368" y2="155" stroke="#e0a800" stroke-width="2"/>
<line x1="40" y1="72" x2="368" y2="155" stroke="#e0a800" stroke-width="2"/>
<line x1="368" y1="120" x2="368" y2="145" stroke="#c0392b" stroke-width="4"/><path d="M361 143 L368 157 L375 143 Z" fill="#c0392b"/>
${SM(40,60,'物体')}`,
labels:[
 {id:'A',name:'焦点',x:150,y:185,px:150,py:124},
 {id:'B',name:'凸レンズ',x:230,y:225,px:230,py:200},
 {id:'C',name:'実像',x:410,y:190,px:370,py:150,a:'start'},
]};

F.wave=(()=>{let b='';
  const panel=(x,y,amp,n,lab)=>{let d=`M${x} ${y}`;for(let i=0;i<=120;i++){const t=i/120;d+=` L${(x+t*170).toFixed(1)} ${(y-amp*Math.sin(t*n*2*Math.PI)).toFixed(1)}`;}
    return `<rect x="${x-10}" y="${y-60}" width="190" height="120" fill="#f6f7f9" stroke="#bbb"/><line x1="${x}" y1="${y}" x2="${x+170}" y2="${y}" stroke="#ccc"/><path d="${d}" fill="none" stroke="#2e7d32" stroke-width="2.5"/>${BIG(x-26,y+6,lab)}`;};
  b+=panel(50,75,28,3,'ア')+panel(280,75,50,3,'イ')+panel(50,215,28,6,'ウ')+panel(280,215,14,3,'エ');
  b+=SM(230,292,'同じ条件で、4つの音の波形を表した（横軸は時間）');
  return {w:470,h:300,body:b,labels:[]};})();

F.symbols=(()=>{let b='';const cell=(cx,cy,inner)=>`<g>${inner}</g>`;
  const W='stroke="#333" stroke-width="2.5" fill="none"';
  const L=(x1,y1,x2,y2,w=2.5)=>`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#333" stroke-width="${w}"/>`;
  // 電源
  b+=L(30,70,72,70)+L(72,48,72,92,2.5)+L(84,58,84,82,6)+L(84,70,126,70);
  // 電球
  b+=L(170,70,198,70)+`<circle cx="218" cy="70" r="20" ${W}/>`+L(204,56,232,84)+L(232,56,204,84)+L(238,70,266,70);
  // 抵抗
  b+=L(310,70,330,70)+`<rect x="330" y="60" width="50" height="20" ${W}/>`+L(380,70,400,70);
  // スイッチ
  b+=L(30,190,62,190)+`<circle cx="66" cy="190" r="4" fill="#333"/>`+L(66,190,110,170)+`<circle cx="114" cy="190" r="4" fill="#fff" stroke="#333" stroke-width="2"/>`+L(118,190,140,190);
  // 電流計
  b+=L(170,190,196,190)+`<circle cx="218" cy="190" r="22" ${W}/>`+T(218,197,'A','text-anchor="middle" font-size="20" font-weight="700"')+L(240,190,266,190);
  // 電圧計
  b+=L(310,190,334,190)+`<circle cx="356" cy="190" r="22" ${W}/>`+T(356,197,'V','text-anchor="middle" font-size="20" font-weight="700"')+L(378,190,400,190);
  return {w:430,h:265,body:b,labels:[
    {id:'A',name:'電源（電池）',x:78,y:125},{id:'B',name:'電球',x:218,y:125},{id:'C',name:'抵抗（電熱線）',x:355,y:125},
    {id:'D',name:'スイッチ',x:85,y:245},{id:'E',name:'電流計',x:218,y:245},{id:'F',name:'電圧計',x:356,y:245}]};})();

F.circuits=(()=>{const L=(x1,y1,x2,y2,w=2.5)=>`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#333" stroke-width="${w}"/>`;
  const bulb=(cx,cy)=>`<circle cx="${cx}" cy="${cy}" r="15" fill="#fff" stroke="#333" stroke-width="2.5"/>`+L(cx-10,cy-10,cx+10,cy+10,2)+L(cx+10,cy-10,cx-10,cy+10,2);
  let b='';
  // ア 直列
  b+=L(40,50,40,170)+L(40,170,90,170)+L(90,158,90,182)+L(100,163,100,177,6)+L(100,170,180,170)+L(180,170,180,50)+L(40,50,70,50)+bulb(85,50)+L(100,50,130,50)+bulb(145,50)+L(160,50,180,50);
  // イ 並列
  const o=250;
  b+=L(o+20,40,o+20,180)+L(o+20,180,o+70,180)+L(o+70,168,o+70,192)+L(o+80,173,o+80,187,6)+L(o+80,180,o+180,180)+L(o+180,180,o+180,40)+L(o+20,40,o+180,40)+L(o+20,110,o+85,110)+bulb(o+100,40)+bulb(o+100,110)+L(o+115,110,o+180,110);
  b+=`<rect x="${o+85}" y="30" width="30" height="20" fill="#fff"/>`+bulb(o+100,40);
  b+=BIG(110,225,'ア')+BIG(o+100,225,'イ');
  return {w:460,h:240,body:b,labels:[]};})();

F.wirefield={w:360,h:260,body:`
<circle cx="180" cy="130" r="40" fill="none" stroke="#2b6cb0" stroke-width="2"/>
<circle cx="180" cy="130" r="75" fill="none" stroke="#2b6cb0" stroke-width="2"/>
<circle cx="180" cy="130" r="108" fill="none" stroke="#2b6cb0" stroke-width="2"/>
<circle cx="180" cy="130" r="13" fill="#fff" ${ST}/><circle cx="180" cy="130" r="4" fill="#333"/>
${SM(180,252,'導線の断面（電流は、こちらに向かって流れている）')}
<path d="M140 128 l-6 10 l12 0 z" fill="#2b6cb0"/><path d="M105 128 l-6 10 l12 0 z" fill="#2b6cb0"/>`,
labels:[]};

F.spring=(()=>{const X=f=>60+f*60,Y=c=>230-c*18;let b='';
  for(let f=0;f<=5;f++)b+=`<line x1="${X(f)}" y1="${Y(0)}" x2="${X(f)}" y2="${Y(10)}" stroke="#ddd"/>`+SM(X(f),Y(0)+18,f);
  for(let c=0;c<=10;c+=2)b+=`<line x1="${X(0)}" y1="${Y(c)}" x2="${X(5)}" y2="${Y(c)}" stroke="#ddd"/>`+SM(X(0)-8,Y(c)+4,c,'end');
  b+=`<rect x="${X(0)}" y="${Y(10)}" width="${X(5)-X(0)}" height="${Y(0)-Y(10)}" fill="none" stroke="#333" stroke-width="1.5"/>`;
  b+=`<line x1="${X(0)}" y1="${Y(0)}" x2="${X(5)}" y2="${Y(10)}" stroke="#c0392b" stroke-width="3"/>`;
  [1,2,3,4].forEach(f=>b+=`<circle cx="${X(f)}" cy="${Y(2*f)}" r="4" fill="#c0392b"/>`);
  b+=SM(210,268,'ばねを引く力の大きさ〔N〕')+T(18,140,'ばねののび〔cm〕','font-size="13" fill="#444" text-anchor="middle" transform="rotate(-90 18 140)"');
  return {w:400,h:280,body:b,labels:[]};})();

F.tape={w:440,h:210,body:(()=>{let b='';
  const tape=(y,gaps,lab)=>{let s=`<rect x="40" y="${y}" width="380" height="30" fill="#fff8e1" stroke="#333"/>`+BIG(20,y+22,lab);let x=50;gaps.forEach(g=>{s+=`<circle cx="${x}" cy="${y+15}" r="3.5" fill="#333"/>`;x+=g});s+=`<circle cx="${x}" cy="${y+15}" r="3.5" fill="#333"/>`;return s;};
  b+=tape(40,[30,30,30,30,30,30,30,30,30,30,30,30],'ア')+tape(120,[8,14,20,26,32,38,44,50,56,62],'イ');
  b+=SM(230,195,'1秒間に60回打点する記録タイマーの記録（左から右へ打点）');return b;})(),labels:[]};

F.pendulum={w:400,h:280,body:`
<line x1="120" y1="20" x2="280" y2="20" stroke="#333" stroke-width="4"/>
<line x1="200" y1="20" x2="95" y2="160" stroke="#999" stroke-width="1.5" stroke-dasharray="5 4"/>
<line x1="200" y1="20" x2="200" y2="215" stroke="#333" stroke-width="2"/>
<line x1="200" y1="20" x2="305" y2="160" stroke="#999" stroke-width="1.5" stroke-dasharray="5 4"/>
<path d="M95 160 Q200 260 305 160" fill="none" stroke="#bbb" stroke-dasharray="3 4"/>
<circle cx="95" cy="160" r="15" fill="#e3effb" stroke="#999" stroke-width="2"/>
<circle cx="200" cy="215" r="15" fill="#90caf9" ${ST}/>
<circle cx="305" cy="160" r="15" fill="#e3effb" stroke="#999" stroke-width="2"/>
${BIG(70,165,'A')}${BIG(200,262,'B')}${BIG(332,165,'C')}`,labels:[]};

/* ================= 地学 ================= */
F.volcano={w:470,h:200,body:`
<path d="M20 150 Q50 150 70 80 Q85 40 100 80 Q120 150 150 150 Z" fill="#e8e1d6" ${ST}/>
<path d="M170 150 L235 55 L245 55 L310 150 Z" fill="#b9a993" ${ST}/>
<path d="M320 150 Q390 105 455 150 Z" fill="#6f6257" ${ST}/>
${BIG(85,185,'ア')}${BIG(240,185,'イ')}${BIG(388,185,'ウ')}`,labels:[]};

F.igneous=(()=>{let b='';
  const rnd=(s=>()=>(s=(s*16807)%2147483647)/2147483647)(7);
  b+=`<rect x="20" y="20" width="190" height="150" fill="#d7d2c9" ${ST}/>`;
  for(let i=0;i<260;i++)b+=`<circle cx="${(24+rnd()*182).toFixed(1)}" cy="${(24+rnd()*142).toFixed(1)}" r="1.4" fill="${rnd()<.5?'#8d8579':'#f2efe9'}"/>`;
  [[60,60,'#fff'],[150,50,'#333'],[110,120,'#fff'],[170,130,'#333'],[50,140,'#fff']].forEach(([x,y,c])=>b+=`<polygon points="${x-14},${y-8} ${x+6},${y-14} ${x+16},${y+4} ${x-2},${y+14} ${x-16},${y+6}" fill="${c}" stroke="#555"/>`);
  b+=`<rect x="250" y="20" width="190" height="150" fill="#fff" ${ST}/>`;
  for(let r=0;r<5;r++)for(let c=0;c<6;c++){const x=262+c*30+(r%2)*8,y=32+r*28,col=['#fff','#f3e9dc','#333','#e9e4dc'][Math.floor(rnd()*4)];b+=`<polygon points="${x},${y} ${x+22},${y+2} ${x+26},${y+20} ${x+4},${y+24} ${x-4},${y+10}" fill="${col}" stroke="#555"/>`;}
  b+=BIG(115,195,'ア')+BIG(345,195,'イ');
  return {w:460,h:205,body:b,labels:[
    {id:'A',name:'斑晶',x:60,y:60},{id:'B',name:'石基',x:80,y:95,a:'middle'}]};})();

F.seismo=(()=>{let d='M20 110';const rnd=(s=>()=>(s=(s*16807)%2147483647)/2147483647)(3);
  for(let x=20;x<=430;x+=2){let a=0;if(x>80&&x<200)a=10;else if(x>=200&&x<330)a=48;else if(x>=330)a=16;d+=` L${x} ${(110+(rnd()*2-1)*a).toFixed(1)}`;}
  const b=`<line x1="20" y1="110" x2="440" y2="110" stroke="#ddd"/><path d="${d}" fill="none" stroke="#333" stroke-width="1.5"/>
<line x1="80" y1="30" x2="80" y2="190" stroke="#c0392b" stroke-dasharray="5 4"/><line x1="200" y1="30" x2="200" y2="190" stroke="#c0392b" stroke-dasharray="5 4"/>
<path d="M80 205 L200 205" stroke="#555" stroke-width="2"/><path d="M80 199 L80 211 M200 199 L200 211" stroke="#555" stroke-width="2"/>
${SM(230,248,'ある地点の地震計の記録（左から右へ時間が進む）')}`;
  return {w:460,h:255,body:b,labels:[
    {id:'A',name:'初期微動',x:140,y:52},{id:'B',name:'主要動',x:270,y:40},{id:'C',name:'初期微動継続時間',x:140,y:226}]};})();

F.ps=(()=>{const X=t=>60+t*9,Y=k=>240-k*1.25;let b='';
  for(let t=0;t<=40;t+=10)b+=`<line x1="${X(t)}" y1="${Y(0)}" x2="${X(t)}" y2="${Y(160)}" stroke="#ddd"/>`+SM(X(t),Y(0)+18,t);
  for(let k=0;k<=160;k+=40)b+=`<line x1="${X(0)}" y1="${Y(k)}" x2="${X(40)}" y2="${Y(k)}" stroke="#ddd"/>`+SM(X(0)-8,Y(k)+4,k,'end');
  b+=`<rect x="${X(0)}" y="${Y(160)}" width="${X(40)-X(0)}" height="${Y(0)-Y(160)}" fill="none" stroke="#333" stroke-width="1.5"/>`;
  b+=`<line x1="${X(0)}" y1="${Y(0)}" x2="${X(20)}" y2="${Y(160)}" stroke="#c0392b" stroke-width="3"/><line x1="${X(0)}" y1="${Y(0)}" x2="${X(40)}" y2="${Y(160)}" stroke="#2b6cb0" stroke-width="3"/>`;
  b+=SM(240,282,'地震が発生してからの時間〔秒〕')+T(18,140,'震源からの距離〔km〕','font-size="13" fill="#444" text-anchor="middle" transform="rotate(-90 18 140)"');
  return {w:440,h:290,body:b,labels:[{id:'A',name:'P波',x:X(20)-28,y:Y(160)+8},{id:'B',name:'S波',x:X(40)-26,y:Y(160)+26}]};})();

F.strata=(()=>{let b='';const x=140,w=170;
  const layer=(y,h,fill,pat)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" stroke="#333" stroke-width="1.5"/>${pat||''}`;
  const dots=(y,h,r,c,step)=>{let s='';for(let yy=y+step/2;yy<y+h;yy+=step)for(let xx=x+step/2;xx<x+w;xx+=step)s+=`<circle cx="${xx+((yy/step)%2?step/3:0)}" cy="${yy}" r="${r}" fill="${c}"/>`;return s;};
  let pat='';for(let yy=40;yy<88;yy+=10)pat+=`<line x1="${x+8}" y1="${yy}" x2="${x+w-8}" y2="${yy}" stroke="#7d6e5d" stroke-dasharray="10 6"/>`;
  b+=layer(30,64,'#d9cbb8',pat);
  let v='';for(let xx=x+10;xx<x+w;xx+=16)v+=`<path d="M${xx} 100 l4 8 l4 -8" stroke="#999" fill="none"/>`;
  b+=layer(94,20,'#f7f4ee',v);
  b+=layer(114,70,'#f1e2b6',dots(114,70,1.6,'#9c8a5c',9));
  b+=layer(184,70,'#e8d8c3',dots(184,70,7,'#fff',20)+dots(184,70,1.5,'#888',20));
  b+=SM(x+w/2,280,'あるがけの地層（上下の逆転はない）');
  return {w:440,h:290,body:b,labels:[
    {id:'A',name:'れき岩',x:345,y:219,px:310,py:219,a:'start'},
    {id:'B',name:'砂岩',x:345,y:149,px:310,py:149,a:'start'},
    {id:'C',name:'凝灰岩',x:345,y:104,px:310,py:104,a:'start'},
    {id:'D',name:'泥岩',x:345,y:62,px:310,py:62,a:'start'}]};})();

F.fold={w:460,h:200,body:`
<path d="M20 60 Q70 20 120 60 T220 60 L220 150 Q170 110 120 150 T20 150 Z" fill="#f1e2b6" ${ST}/>
<path d="M20 90 Q70 50 120 90 T220 90" fill="none" ${ST}/><path d="M20 120 Q70 80 120 120 T220 120" fill="none" ${ST}/>
<path d="M250 50 L330 50 L350 160 L250 160 Z" fill="#f1e2b6" ${ST}/>
<path d="M330 80 L440 80 L440 190 L350 190 Z" fill="#e8d8c3" ${ST}/>
<line x1="250" y1="85" x2="336" y2="85" ${ST}/><line x1="250" y1="120" x2="343" y2="120" ${ST}/>
<line x1="336" y1="115" x2="440" y2="115" ${ST}/><line x1="343" y1="150" x2="440" y2="150" ${ST}/>
<line x1="325" y1="25" x2="358" y2="200" stroke="#c0392b" stroke-width="3"/>`,
labels:[{id:'A',name:'しゅう曲',x:120,y:185},{id:'B',name:'断層',x:290,y:185}]};

F.weathersym=(()=>{const W='stroke="#333" stroke-width="2.5"';let b='';const c=(x)=>`<circle cx="${x}" cy="60" r="22" fill="#fff" ${W}/>`;
  b+=c(50);
  b+=c(130)+`<line x1="130" y1="38" x2="130" y2="82" ${W}/>`;
  b+=c(210)+`<circle cx="210" cy="60" r="12" fill="#fff" ${W}/>`;
  b+=`<circle cx="290" cy="60" r="22" fill="#333" ${W}/>`;
  b+=c(370)+T(370,70,'＊','text-anchor="middle" font-size="26" font-weight="700"');
  return {w:420,h:130,body:b,labels:[
    {id:'A',name:'快晴',x:50,y:112},{id:'B',name:'晴れ',x:130,y:112},{id:'C',name:'くもり',x:210,y:112},{id:'D',name:'雨',x:290,y:112},{id:'E',name:'雪',x:370,y:112}]};})();

F.windsym={w:300,h:250,body:`
<line x1="150" y1="20" x2="150" y2="230" stroke="#ccc"/><line x1="40" y1="130" x2="260" y2="130" stroke="#ccc"/>
${SM(150,15,'北')}${SM(150,246,'南')}${SM(272,134,'東')}${SM(28,134,'西')}
<circle cx="150" cy="130" r="18" fill="#fff" stroke="#333" stroke-width="2.5"/><circle cx="150" cy="130" r="9" fill="#fff" stroke="#333" stroke-width="2.5"/>
<line x1="163" y1="117" x2="232" y2="48" stroke="#333" stroke-width="2.5"/>
<line x1="232" y1="48" x2="245" y2="64" stroke="#333" stroke-width="2.5"/><line x1="222" y1="58" x2="235" y2="74" stroke="#333" stroke-width="2.5"/><line x1="212" y1="68" x2="225" y2="84" stroke="#333" stroke-width="2.5"/>`,labels:[]};

F.frontsym=(()=>{let b='';const y0=[35,85,135,185];
  const tri=(x,y,c,up=true)=>`<path d="M${x} ${y} l9 ${up?-14:14} l9 ${up?14:-14} z" fill="${c}"/>`;
  const semi=(x,y,c,up=true)=>`<path d="M${x} ${y} a9 9 0 0 ${up?1:0} 18 0 z" fill="${c}"/>`;
  b+=`<line x1="30" y1="${y0[0]}" x2="250" y2="${y0[0]}" stroke="#2b6cb0" stroke-width="3"/>`;for(let x=40;x<240;x+=40)b+=tri(x,y0[0],'#2b6cb0');
  b+=`<line x1="30" y1="${y0[1]}" x2="250" y2="${y0[1]}" stroke="#c0392b" stroke-width="3"/>`;for(let x=40;x<240;x+=40)b+=semi(x,y0[1],'#c0392b');
  for(let k=0;k<5;k++){const x=30+k*44;b+=`<line x1="${x}" y1="${y0[2]}" x2="${x+22}" y2="${y0[2]}" stroke="#2b6cb0" stroke-width="3"/><line x1="${x+22}" y1="${y0[2]}" x2="${x+44}" y2="${y0[2]}" stroke="#c0392b" stroke-width="3"/>`+tri(x+2,y0[2],'#2b6cb0',false)+semi(x+24,y0[2],'#c0392b');}
  b+=`<line x1="30" y1="${y0[3]}" x2="250" y2="${y0[3]}" stroke="#7b3fa0" stroke-width="3"/>`;for(let x=40;x<240;x+=44)b+=tri(x,y0[3],'#7b3fa0')+semi(x+22,y0[3],'#7b3fa0');
  return {w:400,h:215,body:b,labels:[
    {id:'A',name:'寒冷前線',x:285,y:y0[0],a:'start'},{id:'B',name:'温暖前線',x:285,y:y0[1],a:'start'},{id:'C',name:'停滞前線',x:285,y:y0[2],a:'start'},{id:'D',name:'閉そく前線',x:285,y:y0[3],a:'start'}]};})();

F.frontsec={w:470,h:230,body:`
<rect x="15" y="20" width="210" height="160" fill="#fdeaea" stroke="#bbb"/>
<path d="M15 180 L15 120 Q60 120 120 180 Z" fill="#dce9f8" stroke="#2b6cb0" stroke-width="2"/>
<path d="M95 150 Q90 60 125 40 Q160 30 165 70 Q170 110 140 150 Z" fill="#fff" stroke="#888" stroke-width="2"/>
<path d="M60 160 l20 0 M50 145 l20 0" stroke="#2b6cb0" stroke-width="3"/><path d="M70 155 l10 5 l-10 5 z M60 140 l10 5 l-10 5 z" fill="#2b6cb0"/>
<path d="M150 140 l0 -40" stroke="#c0392b" stroke-width="3"/><path d="M145 105 l5 -10 l5 10 z" fill="#c0392b"/>
${T(40,40,'寒気','font-size="13" fill="#2b6cb0"')}${T(175,40,'暖気','font-size="13" fill="#c0392b"')}
<rect x="245" y="20" width="210" height="160" fill="#fdeaea" stroke="#bbb"/>
<path d="M455 180 L455 110 Q360 130 255 180 Z" fill="#dce9f8" stroke="#2b6cb0" stroke-width="2"/>
<path d="M265 160 Q330 120 440 92 Q445 80 420 78 Q340 82 290 120 Q262 140 265 160 Z" fill="#fff" stroke="#888" stroke-width="2"/>
<path d="M280 150 l60 -30" stroke="#c0392b" stroke-width="3"/><path d="M336 114 l10 1 l-6 9 z" fill="#c0392b"/>
${T(400,165,'寒気','font-size="13" fill="#2b6cb0"')}${T(265,45,'暖気','font-size="13" fill="#c0392b"')}
${BIG(120,212,'ア')}${BIG(350,212,'イ')}`,labels:[]};

F.lowfront=(()=>{const L=[200,120],C=[90,270],W=[350,210];let b='';
  const marks=(p,q,side,kind,col)=>{let o='';const dx=q[0]-p[0],dy=q[1]-p[1],len=Math.hypot(dx,dy),ux=dx/len,uy=dy/len;let nx=-uy,ny=ux;if(nx*side[0]+ny*side[1]<0){nx=-nx;ny=-ny}
    for(const t of [0.25,0.5,0.75]){const cx=p[0]+dx*t,cy=p[1]+dy*t;
      if(kind==='tri') o+=`<path d="M${(cx-ux*10).toFixed(1)} ${(cy-uy*10).toFixed(1)} L${(cx+nx*15).toFixed(1)} ${(cy+ny*15).toFixed(1)} L${(cx+ux*10).toFixed(1)} ${(cy+uy*10).toFixed(1)} Z" fill="${col}"/>`;
      else {let pts=[];for(let k=0;k<=12;k++){const a=Math.PI*k/12;pts.push(((cx+ux*10*Math.cos(a)+nx*10*Math.sin(a))).toFixed(1)+','+((cy+uy*10*Math.cos(a)+ny*10*Math.sin(a))).toFixed(1));}o+=`<polygon points="${pts.join(' ')}" fill="${col}"/>`;}}
    return o;};
  b+=`<line x1="${L[0]}" y1="${L[1]}" x2="${C[0]}" y2="${C[1]}" stroke="#2b6cb0" stroke-width="3"/>`+marks(L,C,[1,0.4],'tri','#2b6cb0');
  b+=`<line x1="${L[0]}" y1="${L[1]}" x2="${W[0]}" y2="${W[1]}" stroke="#c0392b" stroke-width="3"/>`+marks(L,W,[0.3,-1],'semi','#c0392b');
  b+=`<circle cx="200" cy="120" r="5" fill="#333"/>`+T(185,104,'低','font-size="22" font-weight="700"');
  b+=BIG(95,175,'ア')+BIG(215,235,'イ')+BIG(320,130,'ウ');
  b+=SM(210,292,'日本付近の温帯低気圧（上が北）');
  return {w:420,h:300,body:b,labels:[{id:'A',name:'寒冷前線',x:60,y:262,px:96,py:262},{id:'B',name:'温暖前線',x:380,y:250,px:345,py:208}]};})();

F.pressure={w:460,h:220,body:(()=>{let b='';
  const arrows=(cx,out,cw)=>{let s='';for(let k=0;k<8;k++){const a=k*Math.PI/4;const r1=out?28:78,r2=out?78:28;const tw=(cw?1:-1)*0.45;
    const x1=cx+r1*Math.cos(a),y1=110+r1*Math.sin(a),x2=cx+r2*Math.cos(a+tw),y2=110+r2*Math.sin(a+tw);
    const ang=Math.atan2(y2-y1,x2-x1);s+=`<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="#2b6cb0" stroke-width="2.5"/><path d="M${x2.toFixed(1)} ${y2.toFixed(1)} l${(-10*Math.cos(ang-0.4)).toFixed(1)} ${(-10*Math.sin(ang-0.4)).toFixed(1)} M${x2.toFixed(1)} ${y2.toFixed(1)} l${(-10*Math.cos(ang+0.4)).toFixed(1)} ${(-10*Math.sin(ang+0.4)).toFixed(1)}" stroke="#2b6cb0" stroke-width="2.5"/>`;}return s;};
  b+=`<circle cx="115" cy="110" r="88" fill="none" stroke="#ccc"/><circle cx="115" cy="110" r="50" fill="none" stroke="#ccc"/>`+arrows(115,true,true)+T(115,118,'ア','text-anchor="middle" font-size="20" font-weight="700"');
  b+=`<circle cx="345" cy="110" r="88" fill="none" stroke="#ccc"/><circle cx="345" cy="110" r="50" fill="none" stroke="#ccc"/>`+arrows(345,false,false)+T(345,118,'イ','text-anchor="middle" font-size="20" font-weight="700"');
  b+=SM(230,214,'北半球の地表付近の風のようす（上が北）');return b;})(),labels:[]};

F.celestial={w:440,h:310,body:`
<ellipse cx="220" cy="220" rx="175" ry="52" fill="#eef7e6" stroke="#333" stroke-width="2"/>
<path d="M45 220 A175 175 0 0 1 395 220" fill="none" stroke="#bbb" stroke-dasharray="5 5"/>
<path d="M72 194 Q220 -104 368 194" fill="none" stroke="#c0392b" stroke-width="3"/>
<path d="M45 220 Q220 -50 395 220" fill="none" stroke="#e0a800" stroke-width="3"/>
<path d="M72 246 Q220 4 368 246" fill="none" stroke="#2b6cb0" stroke-width="3"/>
<circle cx="220" cy="220" r="5" fill="#333"/>${SM(220,240,'観測者')}
${T(28,226,'東','font-size="15" font-weight="700" text-anchor="middle"')}${T(412,226,'西','font-size="15" font-weight="700" text-anchor="middle"')}
${T(220,292,'南','font-size="15" font-weight="700" text-anchor="middle"')}${T(248,170,'北','font-size="15" font-weight="700" text-anchor="middle"')}`,
labels:[
 {id:'A',name:'夏至の日',x:300,y:58,px:262,py:64,a:'start'},
 {id:'B',name:'春分・秋分の日',x:318,y:102,px:290,py:110,a:'start'},
 {id:'C',name:'冬至の日',x:330,y:150,px:300,py:160,a:'start'}]};

F.orbit={w:460,h:300,body:(()=>{let b=`<ellipse cx="230" cy="150" rx="175" ry="95" fill="none" stroke="#999" stroke-width="1.5"/>`;
  b+=`<circle cx="230" cy="150" r="30" fill="#f7c948" stroke="#e0a800" stroke-width="2"/>`+SM(230,155,'太陽');
  b+=`<path d="M375 96.3 L391.5 102.2 L381.9 112.4 Z" fill="#777"/>`;
  const earth=(x,y)=>{const t=23.4*Math.PI/180,dx=Math.sin(t)*30,dy=Math.cos(t)*30;
    return `<circle cx="${x}" cy="${y}" r="17" fill="#8fbbe6" ${ST}/><line x1="${(x-dx).toFixed(1)}" y1="${(y+dy).toFixed(1)}" x2="${(x+dx).toFixed(1)}" y2="${(y-dy).toFixed(1)}" stroke="#333" stroke-width="2.5"/>`+T((x+dx+4).toFixed(1),(y-dy-2).toFixed(1),'北','font-size="11"');};
  b+=earth(405,150)+earth(230,55)+earth(55,150)+earth(230,245);
  b+=SM(230,292,'北極側から見た地球の公転（矢印は公転の向き）');return b;})(),
labels:[
 {id:'A',name:'冬至',x:405,y:192},{id:'B',name:'春分',x:282,y:40,a:'start'},{id:'C',name:'夏至',x:55,y:192},{id:'D',name:'秋分',x:282,y:262,a:'start'}]};

F.moon={w:460,h:320,body:(()=>{let b='';for(let k=0;k<4;k++)b+=`<path d="M440 ${70+k*55} l-40 0" stroke="#e0a800" stroke-width="2.5"/><path d="M400 ${70+k*55} l9 -5 l0 10 z" fill="#e0a800"/>`;
  b+=T(440,40,'太陽の光','font-size="13" fill="#a07800" text-anchor="end"');
  b+=`<circle cx="200" cy="160" r="110" fill="none" stroke="#999" stroke-dasharray="5 5"/>`;
  b+=`<circle cx="200" cy="160" r="28" fill="#8fbbe6" ${ST}/>`+SM(200,165,'地球');
  const moon=(x,y)=>`<circle cx="${x}" cy="${y}" r="16" fill="#555" stroke="#333" stroke-width="1.5"/><path d="M${x} ${y-16} A16 16 0 0 1 ${x} ${y+16} Z" fill="#fff59d" stroke="#333" stroke-width="1.5"/>`;
  b+=moon(310,160)+moon(200,50)+moon(90,160)+moon(200,270);
  b+=`<path d="M271.4 75.8 L287.7 82.2 L277.8 92.1 Z" fill="#777"/>`;
  b+=SM(200,315,'北極側から見た月の位置（矢印は月の公転の向き）');return b;})(),
labels:[
 {id:'A',name:'新月',x:345,y:195,a:'start'},{id:'B',name:'上弦の月',x:232,y:30,a:'start'},{id:'C',name:'満月',x:56,y:195,a:'end'},{id:'D',name:'下弦の月',x:232,y:296,a:'start'}]};

module.exports=F;
