if(top!==self){try{top.location.href=location.href}catch(e){document.documentElement.style.display="none"}}
const $=id=>document.getElementById(id);
/* ---------- Adaptación al dispositivo y al rendimiento ---------- */
const mq=q=>window.matchMedia?matchMedia(q):{matches:false,addEventListener(){}};
const RMQ=mq("(prefers-reduced-motion:reduce)"),HOVQ=mq("(hover:hover) and (pointer:fine)");
let FX="auto";try{FX=localStorage.getItem("ts_fx")||"auto"}catch(e){}
let fxLevel="full",perfLow=0,batLow=false,fxRestart=null;
const LEVELS=["full","mid","lite"];
function detectLevel(){
  const n=navigator,mem=n.deviceMemory||4,cores=n.hardwareConcurrency||4,con=n.connection||{};
  if(con.saveData||/(^|-)2g$/.test(con.effectiveType||"")||mem<=2||cores<=2)return "lite";
  if(!HOVQ.matches||mem<=4||cores<=4||innerWidth<720)return "mid";
  return "full";
}
const FXN={auto:"Automático",lite:"Ligeros",full:"Completos"};
function fxLabel(){const l=$("fxLink");if(l)l.textContent="Efectos visuales: "+FXN[FX]+(FX==="auto"?" ("+{lite:"ligeros",mid:"medios",full:"completos"}[fxLevel]+")":"")}
function applyFx(){
  let i=FX==="lite"?2:FX==="full"?0:LEVELS.indexOf(detectLevel());
  if(FX==="auto")i=Math.min(2,i+perfLow+(batLow?1:0));
  if(RMQ.matches&&FX!=="full")i=2;
  fxLevel=LEVELS[i];
  const c=document.documentElement.classList;c.remove("lite","mid","full");c.add(fxLevel);c.toggle("touch",!HOVQ.matches);c.toggle("mouse",HOVQ.matches);
  fxLabel();if(fxRestart)fxRestart();
}
function cycleFx(){FX=FX==="auto"?"lite":FX==="lite"?"full":"auto";try{localStorage.setItem("ts_fx",FX)}catch(e){}perfLow=0;applyFx();toast("Efectos visuales: "+FXN[FX]+".")}
applyFx();
if(RMQ.addEventListener)RMQ.addEventListener("change",applyFx);
let rsT;addEventListener("resize",()=>{clearTimeout(rsT);rsT=setTimeout(applyFx,300)},{passive:true});
try{navigator.getBattery&&navigator.getBattery().then(b=>{const f=()=>{const v=b.level<.2&&!b.charging;if(v!==batLow){batLow=v;applyFx()}};f();b.addEventListener("levelchange",f);b.addEventListener("chargingchange",f)}).catch(()=>{})}catch(e){}
/* Si el equipo va lento (muchos cuadros perdidos), baja un nivel de efectos automáticamente. */
function perfProbe(){
  if(FX!=="auto"||fxLevel==="lite"||RMQ.matches)return;
  let n=0,slow=0,last=0;
  const f=t=>{
    if(document.hidden){last=0;setTimeout(()=>requestAnimationFrame(f),700);return}
    if(last&&t-last>34)slow++;last=t;
    if(++n<150)requestAnimationFrame(f);
    else if(slow>45&&perfLow<2){perfLow++;applyFx();toast("Ajusté los efectos para que todo vaya más fluido. Puedes cambiarlo en «Efectos visuales», al final de la página.");setTimeout(perfProbe,3000)}
  };
  setTimeout(()=>requestAnimationFrame(f),2500);
}
const PL={
win:["Windows 11","uWin",".exe, .msi, .msix, .zip"],
mac:["macOS","uMac",".dmg, .pkg, .zip"],
lin:["Linux","uLin",".AppImage, .deb, .rpm, .tar.gz"],
and:["Android","uAnd",".apk, .aab, .zip"],
ios:["iOS (PWA)","uIos",".zip (build de la PWA)"],
web:["Web / HTML5","uWeb","enlace web o .zip (HTML5/WebGL)"],
lgtv:["LG TV (webOS)","uLgtv",".ipk"],
stv:["Samsung TV (Tizen)","uStv",".wgt"],
atv:["Android TV","uAtv",".apk"],
quest:["VR (Meta Quest)","uQuest",".apk (sideload)"],
mcmod:["Minecraft Java · Mods","uMcmod",".jar (Forge, Fabric, NeoForge)"],
mcplug:["Minecraft Java · Plugins","uMcplug",".jar (Spigot, Paper, Bukkit)"],
mcbed:["Minecraft Bedrock · Add-ons","uMcbed",".mcaddon, .mcpack, .mcworld"]};
$("fPlat").innerHTML='<option value="">Todas las plataformas</option>'+Object.keys(PL).map(k=>`<option value="${k}">${PL[k][0]}</option>`).join("");
const LOGO={
win:'<path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-13.051-1.8"/>',
and:'<path fill-rule="evenodd" d="M17.6 9.2l1.3-2.3a.3.3 0 00-.5-.3l-1.3 2.3A8 8 0 0012 7.8a8 8 0 00-5.1 1.1L5.6 6.6a.3.3 0 00-.5.3l1.3 2.3A7.4 7.4 0 003 15.5h18a7.4 7.4 0 00-3.4-6.3zM8.5 13.2a.9.9 0 110-1.8.9.9 0 010 1.8zm7 0a.9.9 0 110-1.8.9.9 0 010 1.8z"/><path d="M5 17h14v1.5a1.5 1.5 0 01-1.5 1.5h-1V22a1.2 1.2 0 01-2.4 0v-2h-4.2v2a1.2 1.2 0 01-2.4 0v-2h-1A1.5 1.5 0 015 18.5z"/>',
ios:'<path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"/>'};
Object.assign(LOGO,{
lin:'<path fill-rule="evenodd" d="M12 2.4c-2.6 0-4 2.3-4 5.1 0 1.4-.6 2.5-1.6 3.9C5.2 13 4.5 15 5 17c.3 1.2 1.2 1.8 2.2 2.2-.2.6-.1 1.3.8 1.6 1.2.4 2.5-.3 4-.3s2.8.7 4 .3c.9-.3 1-1 .8-1.6 1-.4 1.9-1 2.2-2.2.5-2-.2-4-1.4-5.7C17.6 10 17 9 17 7.5c0-2.8-1.4-5.1-5-5.1zM12 10c-1.9 0-3 2.3-3 4.6S10.1 19 12 19s3-2.1 3-4.4S13.9 10 12 10z"/><path d="M10.7 6.3h2.6L12 7.9z" fill="#ffb300"/><circle cx="10.4" cy="5" r=".7" fill="#05060f"/><circle cx="13.6" cy="5" r=".7" fill="#05060f"/>',
web:'<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" fill="none" stroke="currentColor" stroke-width="2"/>',
lgtv:'<circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"/><text x="12" y="15.6" text-anchor="middle" font-family="Arial,sans-serif" font-size="9.5" font-weight="800" fill="currentColor">LG</text>',
stv:'<rect x="2" y="4" width="20" height="13" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M8 21h8M12 17v4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><text x="12" y="13.8" text-anchor="middle" font-family="Arial,sans-serif" font-size="8" font-weight="800" fill="currentColor">S</text>',
atv:'<rect x="2" y="4" width="20" height="13" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M8 21h8M12 17v4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M10 7.2v6l5-3z"/>',
quest:'<path fill-rule="evenodd" d="M3 7h18a1 1 0 011 1v7a2 2 0 01-2 2h-3.6l-1.4-2.2h-6L7.6 17H4a2 2 0 01-2-2V8a1 1 0 011-1zM7.5 10.2a1.8 1.8 0 100 3.6 1.8 1.8 0 000-3.6zm9 0a1.8 1.8 0 100 3.6 1.8 1.8 0 000-3.6z"/>',
mcmod:'<path d="M12 2l9 4.5-9 4.5-9-4.5z" fill="#6fbf3b"/><path d="M3 6.5l9 4.5v10.5l-9-4.5z" fill="#8a5a2e"/><path d="M21 6.5l-9 4.5v10.5l9-4.5z" fill="#6b4423"/><circle cx="18.2" cy="18.2" r="5" fill="#0b0f26" stroke="#fff" stroke-width="1.2"/><text x="18.2" y="20.9" text-anchor="middle" font-family="Arial,sans-serif" font-size="7.5" font-weight="800" fill="#fff">M</text>',
mcplug:'<path d="M12 2l9 4.5-9 4.5-9-4.5z" fill="#6fbf3b"/><path d="M3 6.5l9 4.5v10.5l-9-4.5z" fill="#8a5a2e"/><path d="M21 6.5l-9 4.5v10.5l9-4.5z" fill="#6b4423"/><circle cx="18.2" cy="18.2" r="5" fill="#0b0f26" stroke="#fff" stroke-width="1.2"/><text x="18.2" y="20.9" text-anchor="middle" font-family="Arial,sans-serif" font-size="7.5" font-weight="800" fill="#fff">P</text>',
mcbed:'<path d="M12 2l9 4.5-9 4.5-9-4.5z" fill="#6fbf3b"/><path d="M3 6.5l9 4.5v10.5l-9-4.5z" fill="#8a5a2e"/><path d="M21 6.5l-9 4.5v10.5l9-4.5z" fill="#6b4423"/><circle cx="18.2" cy="18.2" r="5" fill="#0b0f26" stroke="#fff" stroke-width="1.2"/><text x="18.2" y="20.9" text-anchor="middle" font-family="Arial,sans-serif" font-size="7.5" font-weight="800" fill="#fff">B</text>'});
LOGO.mac=LOGO.ios;
const lg=(k,z=18)=>`<svg class="lg lg-${k}" viewBox="0 0 24 24" width="${z}" height="${z}" fill="currentColor" aria-hidden="true">${LOGO[k]}</svg>`;
const IC={search:'<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>',box:'<path d="M21 8l-9-5-9 5v8l9 5 9-5z"/><path d="M3.3 7.5L12 12.5l8.7-5M12 22V12.5"/>',palette:'<path d="M12 3a9 9 0 100 18c1.1 0 1.8-.9 1.5-1.9-.3-1 .4-2.1 1.5-2.1H17a4 4 0 004-4c0-5-4-10-9-10z"/><circle cx="7.5" cy="11" r="1"/><circle cx="10" cy="7" r="1"/><circle cx="15" cy="7.5" r="1"/>',drop:'<path d="M12 2.7C9 7 5.5 10.2 5.5 14.2a6.5 6.5 0 0013 0C18.5 10.2 15 7 12 2.7z"/>',alert:'<path d="M10.3 3.9L2 18a2 2 0 001.7 3h16.6A2 2 0 0022 18L13.7 3.9a2 2 0 00-3.4 0z"/><path d="M12 9v4M12 17h.01"/>',lock:'<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 018 0v4"/>',unlock:'<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 017.5-2"/>',download:'<path d="M12 3v12M7 10l5 5 5-5M4 21h16"/>',power:'<path d="M12 3v9M6.4 6.4a8 8 0 1011.2 0"/>'};
Object.assign(IC,{ban:'<circle cx="12" cy="12" r="9"/><path d="M5.6 5.6l12.8 12.8"/>',snow:'<path d="M12 2v20M4.9 7l14.2 10M19.1 7L4.9 17"/>',logout:'<path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>',trash:'<path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14M10 11v6M14 11v6"/>'});
const ic=(n,z=18)=>`<svg class="ic" viewBox="0 0 24 24" width="${z}" height="${z}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IC[n]}</svg>`;
document.querySelectorAll("[data-ic]").forEach(e=>e.outerHTML=ic(e.dataset.ic,+e.dataset.z||18));
const CATS={"Juegos":["Juegos","Acción","Aventura","Arcade","Carreras","Deportes","Estrategia","Rol (RPG)","Simulación","Puzzle","Terror","Multijugador","Plataformas","Mundo abierto"],"Aplicaciones":["Herramientas","Productividad","Utilidades","Educación","Entretenimiento","Música","Foto y video","Diseño","Desarrollo","Redes sociales","Comunicación","Finanzas","Salud y fitness","Noticias","Viajes","Seguridad","Otra"]};
$("aCat").innerHTML=Object.entries(CATS).map(([g,l])=>`<optgroup label="${g}">${l.map(c=>`<option>${c}</option>`).join("")}</optgroup>`).join("");
document.addEventListener("pointerdown",e=>{const b=e.target.closest("button,.btn");if(!b)return;const r=b.getBoundingClientRect(),d=Math.max(r.width,r.height),s=document.createElement("span");s.className="rip";s.style.cssText=`width:${d}px;height:${d}px;left:${e.clientX-r.left-d/2}px;top:${e.clientY-r.top-d/2}px`;b.appendChild(s);setTimeout(()=>s.remove(),700)});
const fmt=n=>n>=1073741824?(n/1073741824).toFixed(2)+" GB":n>=1048576?(n/1048576).toFixed(1)+" MB":Math.max(1,Math.round(n/1024))+" KB";
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const safeUrl=u=>/^https?:\/\//i.test(u||"")?u:"";
Object.assign(IC,{clip:'<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4h6v3H9zM9 12h6M9 16h4"/>',check:'<path d="M20 6L9 17l-5-5"/>',mail:'<path d="M3 5h18v14H3z"/><path d="M3 7l9 6 9-6"/>',bulb:'<path d="M9 18h6M10 22h4M12 2a7 7 0 00-4 12.7V17h8v-2.3A7 7 0 0012 2z"/>',share:'<path d="M12 3v12M8 7l4-4 4 4M5 11v9h14v-9"/>',addhome:'<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M12 8v8M8 12h8"/>',play:'<path d="M8 5v14l11-7z"/>',help:'<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 015 .5c0 1.7-2.5 2-2.5 3.5M12 17h.01"/>',coffee:'<path d="M3 8h13v6a5 5 0 01-5 5H8a5 5 0 01-5-5V8zM16 9h2a3 3 0 010 6h-2"/>',megaphone:'<path d="M3 11v2a1 1 0 001 1h2l6 4V6L6 10H4a1 1 0 00-1 1zM16 8a5 5 0 010 8M19 5a9 9 0 010 14"/>',clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',pin:'<path d="M12 17v5M9 3h6l-1 6 3 3v2H7v-2l3-3z"/>',eye:'<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',plus:'<path d="M12 5v14M5 12h14"/>',heart:'<path d="M20.8 5.6a5.5 5.5 0 00-7.8 0L12 6.6l-1-1a5.5 5.5 0 10-7.8 7.8l8.8 8.8 8.8-8.8a5.5 5.5 0 000-7.8z"/>',flame:'<path d="M12 2c1 4 5 5.5 5 10a5 5 0 01-10 0c0-2 1-3 2-4 .5 2 1.5 2.5 2 2 0-3-1-5 1-8z"/>'});

/* ---------- Estado y API (todo vive en el servidor) ---------- */
let apps=[],status={mode:"off",blocked:[],msg:"",frozen:false},admin=false,editId=null,iconData="",loaded=false,loadErr=false,seen=new Set(),lastRef=0,sel={},canUpload=false,fl={},ups={},stores=[],upMissing=[];
const SK="ts_tok";
const tok=()=>{try{const o=JSON.parse(sessionStorage.getItem(SK));return o&&o.exp>Date.now()?o.t:null}catch(e){return null}};
const setTok=j=>sessionStorage.setItem(SK,JSON.stringify({t:j.token,exp:j.exp}));
admin=!!tok();
async function derive(str,salt){
  const k=await crypto.subtle.importKey("raw",new TextEncoder().encode(str),"PBKDF2",false,["deriveBits"]);
  const b=await crypto.subtle.deriveBits({name:"PBKDF2",hash:"SHA-256",salt:new TextEncoder().encode(salt),iterations:600000},k,256);
  return [...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,"0")).join("");
}
async function api(path,o={}){
  const h={"content-type":"application/json"},t=tok();if(t&&o.auth!==false)h.authorization="Bearer "+t;if(o.pin)h["x-pin"]=o.pin;
  try{const r=await fetch("/api"+path,{method:o.method||"GET",headers:h,body:o.body?JSON.stringify(o.body):undefined,cache:"no-store"});
    let j={};try{j=await r.json()}catch(e){}
    if(r.status===401&&t&&o.auth!==false)logout(true);
    return{ok:r.ok,s:r.status,j}}catch(e){return{ok:false,s:0,j:{}}}}
let lastLoadT=0;
async function load(){lastLoadT=Date.now();const r=await api(admin?"/admin/catalog":"/catalog");if(r.ok){apps=r.j.apps||[];status=r.j.status||status;canUpload=!!r.j.upload;stores=r.j.stores||[];upMissing=r.j.missing||[];loaded=true;loadErr=false;return true}loadErr=!loaded;return false}
const sigOf=()=>JSON.stringify([apps.map(a=>[a.id,a.dl,a.dw,a.dm,a.q,a.updated]),status]);
async function logout(expired){sessionStorage.removeItem(SK);admin=false;gaFlag();if(expired)toast("Sesión expirada.");await load();ui()}
const touch=()=>{if(!admin||Date.now()-lastRef<120000)return;lastRef=Date.now();api("/admin/refresh",{method:"POST"}).then(r=>{if(r.ok)setTok(r.j)})};
["pointerdown","keydown"].forEach(v=>addEventListener(v,touch,{passive:true}));
setInterval(()=>{if(admin&&!tok())logout(true)},10000);
let hid=0;document.addEventListener("visibilitychange",()=>{if(document.hidden)hid=Date.now();else if(admin&&hid&&Date.now()-hid>5*60*1000)logout(true)});
addEventListener("keydown",e=>{if(e.key==="/"&&!/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)&&!document.querySelector("dialog[open]")){e.preventDefault();$("q").focus()}});
let tT;function toast(m){const t=$("toast");t.textContent=m;t.classList.add("on");clearTimeout(tT);tT=setTimeout(()=>t.classList.remove("on"),2800)}
function countUp(el,to,from){const f=from!=null?from:(+el.textContent||0);if(f===to){el.textContent=to;return}const D=fxLevel==="lite"||RMQ.matches?0:fxLevel==="mid"?500:900;if(!D){el.textContent=to.toLocaleString("es-CL");return}const t0=performance.now();(function s(t){const k=Math.min(1,(t-t0)/D);el.textContent=Math.round(f+(to-f)*(1-Math.pow(1-k,4))).toLocaleString("es-CL");if(k<1)requestAnimationFrame(s)})(t0)}
const canEdit=()=>{if(!admin)return false;if(status.frozen){toast("Panel congelado: solo lectura.");return false}return true};

/* ---------- Bloqueo / render ---------- */
const lockScreen=()=>`<div class="empty lockscr">${ic("lock",64)}<h3>Sitio cerrado temporalmente</h3><p>Estamos realizando tareas de seguridad. Vuelve más tarde.</p>${status.msg?`<p>${esc(status.msg)}</p>`:""}</div>`;
function applyLock(){
  const m=status.mode,bl=(status.blocked||[]).filter(k=>PL[k]),lb=$("lockBar"),on=m!=="off"||bl.length>0;
  lb.classList.toggle("hide",!on||(m==="full"&&!admin));
  lb.innerHTML=!on?"":ic("lock",18)+"<span>"+(m==="full"?"Cierre total activo (solo lo ves tú como admin). ":m==="downloads"?"Descargas e instalaciones bloqueadas por seguridad. ":"Descargas bloqueadas para: "+bl.map(k=>PL[k][0]).join(", ")+". ")+esc(status.msg||"")+"</span>";
  $("bPanic").classList.toggle("on",on||!!status.frozen);
  $("pState").innerHTML="Estado: <b>"+{off:bl.length?"Plataformas bloqueadas":"Normal",downloads:"Descargas bloqueadas",full:"Cierre total"}[m]+"</b>"+(status.frozen?" · panel congelado":"")+(status.loginLocked?" · acceso admin bloqueado":"");
  render();
}
function ui(){document.body.classList.toggle("admin",admin);$("bLogin").classList.toggle("hide",admin);["bUp","bExp","bImp","bOut","bPanic"].forEach(i=>$(i).classList.toggle("hide",!admin));applyLock()}
const SORTS={soon:(a,b)=>a.release-b.release,new:(a,b)=>b.created-a.created,old:(a,b)=>a.created-b.created,pop:(a,b)=>b.dl-a.dl||b.created-a.created,least:(a,b)=>a.dl-b.dl||b.created-a.created,tw:(a,b)=>b.dw-a.dw||b.dl-a.dl,tm:(a,b)=>b.dm-a.dm||b.dl-a.dl};
const fdt=t=>new Date(t).toLocaleString("es-CL",{day:"numeric",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"});
const fdate=t=>new Date(t).toLocaleDateString("es-CL",{day:"numeric",month:"short",year:"numeric"});
function render(){
  const LM=status.mode,BL=status.blocked||[],G=$("grid");
  document.body.classList.toggle("lockfull",LM==="full"&&!admin);
  const vis=apps.filter(a=>admin||!a.q);
  countUp($("sA"),vis.length);countUp($("sP"),new Set(vis.flatMap(a=>a.plat)).size);countUp($("sC"),vis.reduce((s,a)=>s+a.dl,0));
  if(LM==="full"&&!admin){G.innerHTML=lockScreen();return}
  if(!loaded){G.innerHTML=loadErr?`<div class="empty">No se pudo cargar el catálogo. Intenta de nuevo en un momento.</div>`:Array.from({length:6},()=>`<div class="card sk"><div class="skl" style="width:60%;height:66px"></div><div class="skl" style="width:90%"></div><div class="skl" style="width:75%"></div></div>`).join("");return}
  const q=$("q").value.toLowerCase(),c=$("fCat").value,p=$("fPlat").value,so=$("fSort").value;
  const cats=[...new Set(vis.map(a=>a.cat))].sort();
  $("fCat").innerHTML='<option value="">Todas las categorías</option>'+cats.map(x=>`<option${x===c?" selected":""}>${esc(x)}</option>`).join("");
  let list=vis.filter(a=>(!q||(a.name+" "+a.saga).toLowerCase().includes(q))&&(!c||a.cat===c)&&(!p||a.plat.includes(p))).sort(SORTS[so]||SORTS.new);
  if(so==="soon")list=list.filter(a=>a.release>Date.now());
  if(!list.length){G.innerHTML=`<div class="empty">${vis.length?"Sin resultados.":"Aún no hay apps publicadas."}</div>`;return}
  const old=new Map([...G.querySelectorAll(".card[data-id]")].map(e=>[e.dataset.id,e.getBoundingClientRect()]));
  G.innerHTML=list.map((a,i)=>`<article class="card${seen.has(a.id)?" seen":""}" data-id="${esc(a.id)}" style="--i:${i}">
    ${a.cover?`<div class="cover"><img src="${esc(a.cover)}" alt="" loading="lazy" decoding="async">${a.tr?`<span class="play">${ic("play",16)}</span>`:""}</div>`:""}<div class="top">${a.icon?`<img class="ico" src="${esc(a.icon)}" alt="" decoding="async">`:`<div class="ico">${ic("box",30)}</div>`}<div style="flex:1;min-width:0"><h3>${esc(a.name)}</h3><div class="mut">${a.saga?esc(a.saga)+" · ":""}v${esc(a.ver)}</div></div>
    <div class="dlc" title="Descargas totales">${ic("download",15)}<b class="cnt" data-to="${a.dl}">0</b></div></div>
    <div class="tags"><span class="tag">${esc(a.cat)}</span>${a.q?`<span class="tag" style="border-color:var(--bad);color:var(--bad)">En cuarentena</span>`:""}${a.release>Date.now()?`<span class="tag soon">Próximamente</span>`:""}${a.plat.map(x=>`<span class="tag" style="display:inline-flex;gap:4px;align-items:center">${lg(x,12)}${PL[x][0]}</span>`).join("")}</div>
    <div class="desc">${esc(a.desc)}</div>
    ${a.notes?`<div class="mut">Novedades: ${esc(a.notes)}</div>`:""}
    ${a.release>Date.now()?`<div class="mut" style="display:flex;align-items:center;gap:6px">${ic("clock",14)} Estreno: ${fdt(a.release)}</div><div class="cd" data-ts="${a.release}"></div>`:""}
    <div class="mut trend">${ic("flame",13)} +${a.dw.toLocaleString("es-CL")} esta semana · +${a.dm.toLocaleString("es-CL")} este mes</div>
    <div class="mut">Por ${esc(a.dev)} · Publicada ${fdate(a.created)}</div>
    <div class="links">${a.release>Date.now()?`<button class="sec" disabled>${ic("clock",15)} Disponible el ${fdt(a.release)}</button>`:LM!=="off"?`<button class="sec" disabled>${ic("lock",15)} Descargas bloqueadas</button>`:a.plat.map(x=>!(a.ok||[]).includes(x)?`<button class="sec" disabled>${ic("clock",15)} ${PL[x][0]} · próximamente</button>`:BL.includes(x)?`<button class="sec" disabled>${ic("lock",15)} ${PL[x][0]} bloqueado</button>`:`<a class="btn" href="/api/d/${esc(a.id)}/${x}" rel="noopener noreferrer nofollow">${lg(x,15)} ${x==="ios"?"Abrir PWA":x==="web"?"Abrir":"Descargar"} ${PL[x][0]}${a.fs&&a.fs[x]?" · "+fmt(a.fs[x]):""}</a>`).join("")}</div>
    <div class="plats">${a.plat.map(x=>`<span class="pl" title="${PL[x][0]}">${lg(x,28)}<span>${PL[x][0]}</span></span>`).join("")}</div>
    <div class="adm"><button class="sec" data-act="edit" data-id="${esc(a.id)}">Editar</button><button class="sec" data-act="q" data-id="${esc(a.id)}">${a.q?"Mostrar":"Ocultar"}</button><button class="bad" data-act="del" data-id="${esc(a.id)}">Eliminar</button></div>
  </article>`).join("");
  const flipOk=fxLevel!=="lite"&&!RMQ.matches&&list.length<=80;
  G.querySelectorAll(".card[data-id]").forEach(e=>{
    const id=e.dataset.id,n=e.getBoundingClientRect(),o=old.get(id),cnt=e.querySelector(".cnt"),to=+cnt.dataset.to;
    if(o&&flipOk){const dx=o.left-n.left,dy=o.top-n.top;if(dx||dy)e.animate([{transform:`translate(${dx}px,${dy}px)`},{transform:"none"}],{duration:600,easing:"cubic-bezier(.2,.8,.2,1)"})}
    seen.has(id)?cnt.textContent=to.toLocaleString("es-CL"):countUp(cnt,to,0);seen.add(id)});
}
["q","fCat","fPlat","fSort"].forEach(i=>$(i).addEventListener("input",render));

/* ---------- Login ---------- */
$("bLogin").onclick=async()=>{$("lm").textContent="";$("lm").style.color="";dLogin.showModal();const r=await api("/lockstate",{auth:false}),l=r.ok&&r.j.locked;$("ub").classList.toggle("hide",!l);if(!l)$("uf").classList.add("hide")};
$("fLogin").onsubmit=async e=>{e.preventDefault();$("lm").style.color="";$("lm").textContent="Verificando…";
  const cred=[lu,lp,l1,l2,ln,lr].map(x=>x.value.trim()).join("|");$("fLogin").reset();$("lm").textContent="Calculando…";
  let k;try{k=await derive(cred,"techstudios-store-v1")}catch(x){$("lm").textContent="Tu navegador no permite iniciar sesión aquí (se necesita HTTPS).";return}
  $("lm").textContent="Verificando…";
  const r=await api("/login",{method:"POST",body:{k},auth:false});
  if(r.ok){setTok(r.j);admin=true;gaFlag();lastRef=Date.now();dLogin.close();await load();ui();toast("Sesión iniciada.")}
  else if(r.s===429){$("lm").textContent="Acceso bloqueado temporalmente"+(r.j.wait?" ("+Math.max(1,Math.ceil(r.j.wait/60))+" min)":"")+".";$("ub").classList.remove("hide")}
  else if(r.s===401){$("lm").textContent="Datos incorrectos."+(r.j.left!=null?" Intentos restantes: "+r.j.left:"");if(r.j.left===0)$("ub").classList.remove("hide")}
  else $("lm").textContent="No se pudo conectar con el servidor."};
$("bUnl").onclick=()=>{$("uf").classList.toggle("hide");$("um").textContent="";$("uk").focus()};
$("bUk").onclick=async()=>{$("um").style.color="var(--a)";$("um").textContent="Verificando…";
  let kk="";try{kk=await derive($("uk").value.trim().toUpperCase(),"techstudios-unlock-v1")}catch(x){}$("uk").value="";
  const r=await api("/unlock",{method:"POST",body:{key:kk},auth:false});
  if(r.ok){$("um").textContent="";$("uf").classList.add("hide");$("ub").classList.add("hide");$("lm").style.color="var(--ok)";$("lm").textContent="Dispositivo desbloqueado. Ya puedes ingresar."}
  else{$("um").style.color="";$("um").textContent=r.s===429?"Demasiados intentos. Espera "+Math.max(1,Math.ceil((r.j.wait||60)/60))+" min.":"Clave incorrecta."}};
$("bOut").onclick=()=>logout();

/* ---------- PIN de confirmación (se verifica en el servidor) ---------- */
let pinRes=null;
function askPin(t){return new Promise(res=>{if(pinRes)pinRes(null);pinRes=res;$("pinT").textContent=t||"Confirmación";$("pinE").textContent="";$("pinI").value="";dPin.showModal();$("pinI").focus()})}
$("fPin").onsubmit=async e=>{e.preventDefault();const v=$("pinI").value.trim();
  if(!/^\d{6}$/.test(v)){$("pinE").style.color="";$("pinE").textContent="El PIN tiene 6 dígitos.";return}
  $("pinE").style.color="var(--a)";$("pinE").textContent="Calculando…";$("pinI").value="";
  let k;try{k=await derive(v,"techstudios-pin-v1")}catch(x){$("pinE").style.color="";$("pinE").textContent="Tu navegador no permite verificar el PIN aquí.";return}
  const r=pinRes;pinRes=null;dPin.close();r&&r(k)};
dPin.onclose=()=>{if(pinRes){pinRes(null);pinRes=null}};
const pinErr=r=>toast(r.s===403?"PIN incorrecto.":r.s===429?"Demasiados intentos de PIN. Espera unos minutos.":(r.j.error||"No se pudo completar."));

/* ---------- Formulario ---------- */
function mkDZ(el,onFile,acc,multi){
  const inp=document.createElement("input");inp.type="file";if(acc)inp.accept=acc;if(multi)inp.multiple=true;inp.hidden=true;el.appendChild(inp);
  el.onclick=e=>{if(e.target.tagName!=="INPUT"&&e.target.tagName!=="BUTTON")inp.click()};inp.onchange=()=>{[...inp.files].slice(0,multi?8:1).forEach(onFile)};
  ["dragenter","dragover"].forEach(v=>el.addEventListener(v,e=>{e.preventDefault();el.classList.add("over")}));
  ["dragleave","drop"].forEach(v=>el.addEventListener(v,e=>{e.preventDefault();el.classList.remove("over")}));
  el.addEventListener("drop",e=>[...e.dataTransfer.files].slice(0,multi?8:1).forEach(onFile));
}
function setIcon(f){
  const r=new FileReader();r.onload=()=>{const im=new Image();im.onload=()=>{const c=document.createElement("canvas");c.width=c.height=192;const x=c.getContext("2d"),s=Math.min(im.width,im.height);x.drawImage(im,(im.width-s)/2,(im.height-s)/2,s,s,0,0,192,192);iconData=c.toDataURL("image/webp",.9);$("icoPrev").src=iconData;$("icoPrev").style.visibility="visible"};im.src=r.result};r.readAsDataURL(f)}
mkDZ($("dzIco"),f=>f.type.startsWith("image/")&&setIcon(f),"image/*");
const upBusy=()=>Object.keys(ups).length>0;
function upload(k,file,prog,kind){
  return new Promise(async(res,rej)=>{
    const r=await api("/admin/upload-url",{method:"POST",body:{name:file.name,size:file.size,kind:kind||"file",st:$("aStore").value}});
    if(!r.ok)return rej(new Error(r.j.error||"No se pudo preparar la subida."));
    const x=new XMLHttpRequest();ups[k]=x;x.open("PUT",r.j.url);
    x.upload.onprogress=e=>e.lengthComputable&&prog(e.loaded,e.total);
    x.onload=()=>x.status>=200&&x.status<300?res({key:r.j.key,name:r.j.name,size:file.size,st:r.j.st}):rej(new Error("Falló la subida (código "+x.status+")."));
    x.onerror=()=>rej(new Error("Error de red o de permisos (CORS) al subir."));x.onabort=()=>rej(new Error("Subida cancelada."));
    x.send(file)})}
addEventListener("beforeunload",e=>{if(upBusy()){e.preventDefault();e.returnValue=""}});
dApp.addEventListener("close",()=>{for(const k in ups)ups[k].abort()});
function buildZones(a){
  $("zones").innerHTML="";$("chips").innerHTML="";sel={};fl={};ups={};
  for(const k in PL){
    sel[k]=!!(a&&a.plat.includes(k));const old=a&&a.files&&a.files[k];if(old)fl[k]=old;
    const chip=document.createElement("button");chip.type="button";chip.className="sec chip"+(sel[k]?" on":"");chip.innerHTML=lg(k,22)+"<span>"+PL[k][0]+"</span>";$("chips").appendChild(chip);
    const w=document.createElement("div");w.className="zone"+(sel[k]?"":" hide");
    w.innerHTML=`<div class="zh">${lg(k,46)}<div><b>${PL[k][0]}</b><div class="hint">Formatos: ${PL[k][2]}</div></div></div>
    <label>Archivo — arrástralo aquí</label><div class="dz${old?" has":""}"><div class="t">${canUpload?"Arrastra el archivo aquí o haz clic":"Subida de archivos no configurada"+(upMissing.length?" — al servidor le falta: "+upMissing.join(", "):"")+". Usa un enlace mientras tanto."}</div><div class="i">${old?esc(old.name)+" · "+fmt(old.size):""}</div><div class="pb"><i style="width:${old?100:0}%"></i></div><button type="button" class="sec x ${old?"":"hide"}">Quitar</button></div>
    <label>…o pega un enlace https (opcional si subes archivo)</label><input id="u_${k}" type="url" placeholder="https://…" value="${esc(a&&a.urls&&a.urls[k]||"")}">`;
    $("zones").appendChild(w);
    const dz=w.querySelector(".dz"),info=dz.querySelector(".i"),bar=dz.querySelector(".pb i"),x=dz.querySelector(".x");
    if(canUpload)mkDZ(dz,async f=>{
      if(ups[k])ups[k].abort();
      info.style.color="";bar.style.width="0";dz.classList.add("has");x.classList.remove("hide");info.textContent=f.name+" · "+fmt(f.size)+" · 0%";
      const ka=setInterval(()=>{lastRef=0;touch()},120000);
      try{const fr=await upload(k,f,(l,t)=>{const p=Math.round(l/t*100);bar.style.width=p+"%";info.textContent=f.name+" · "+fmt(l)+" de "+fmt(t)+" ("+p+"%)"});fl[k]=fr;bar.style.width="100%";info.textContent=fr.name+" · "+fmt(fr.size)+" · listo"}
      catch(err){delete fl[k];dz.classList.remove("has");bar.style.width="0";info.style.color="var(--bad)";info.textContent=err.message;x.classList.add("hide")}
      finally{clearInterval(ka);delete ups[k]}});
    x.onclick=()=>{if(ups[k])ups[k].abort();delete fl[k];dz.classList.remove("has");info.textContent="";bar.style.width="0";x.classList.add("hide")};
    chip.onclick=()=>{sel[k]=!sel[k];chip.classList.toggle("on",sel[k]);w.classList.toggle("hide",!sel[k])};
  }
}

/* ---------- Imágenes y tráiler del formulario ---------- */
let shots=[],vf=null,shotN=0;
const fmtGB=n=>(n/1024**3).toFixed(n>=10*1024**3?0:1).replace(".",",")+" GB";
function drawStores(){
  const s=$("aStore");s.innerHTML=stores.map(x=>`<option value="${x.id}">${esc(x.label)} — ${fmtGB(x.used)} de ${fmtGB(x.quota)}</option>`).join("");
  if(stores.length)s.value=[...stores].sort((a,b)=>(b.quota-b.used)-(a.quota-a.used))[0].id;
  $("storeBox").classList.toggle("hide",stores.length<2);
}
function drawShots(){$("shots").innerHTML=shots.map((s,i)=>`<div class="shot${i===0?" cover":""}"><img src="${esc(s.url)}" alt=""><u style="width:${Math.round(s.pct==null?100:s.pct)}%"></u><button type="button" class="x" data-sx="${i}" title="Quitar">×</button>${i===0?`<span class="cv">Portada</span>`:`<button type="button" class="mk" data-sc="${i}">Portada</button>`}</div>`).join("")}
$("shots").onclick=e=>{const x=e.target.closest("[data-sx]"),c=e.target.closest("[data-sc]");if(x){shots.splice(+x.dataset.sx,1);drawShots()}else if(c){shots.unshift(...shots.splice(+c.dataset.sc,1));drawShots()}};
function toBlobImg(f,w,cb){const r=new FileReader();r.onload=()=>{const im=new Image();im.onload=()=>{const k=Math.min(1,w/im.width),cv=document.createElement("canvas");cv.width=Math.round(im.width*k);cv.height=Math.round(im.height*k);cv.getContext("2d").drawImage(im,0,0,cv.width,cv.height);cv.toBlob(b=>b&&cb(b),"image/webp",.85)};im.src=r.result};r.readAsDataURL(f)}
function addShot(f){
  if(!f.type.startsWith("image/"))return;
  if(!canUpload){toast("La subida de archivos no está configurada.");return}
  if(shots.length>=8){toast("Máximo 8 imágenes.");return}
  toBlobImg(f,1600,async blob=>{
    const s={url:URL.createObjectURL(blob),pct:0,name:(f.name.replace(/\.\w+$/,"")||"captura")+".webp"},uk="shot"+(++shotN);shots.push(s);drawShots();
    try{const fr=await upload(uk,new File([blob],s.name,{type:"image/webp"}),(l,t)=>{s.pct=l/t*100;drawShots()},"image");Object.assign(s,fr,{pct:100})}
    catch(err){shots=shots.filter(x=>x!==s);toast(err.message)}finally{delete ups[uk]}
    drawShots()})}
mkDZ($("dzShots"),addShot,"image/*",true);
const syncTr=()=>{const v=document.querySelector("input[name=trk]:checked").value;$("trYt").classList.toggle("hide",v!=="youtube");$("trFile").classList.toggle("hide",v!=="file")};
document.querySelectorAll("input[name=trk]").forEach(r=>r.onchange=syncTr);
mkDZ($("dzVid"),async f=>{
  const dz=$("dzVid"),info=dz.querySelector(".i"),bar=dz.querySelector(".pb i");
  if(!canUpload){toast("La subida de archivos no está configurada.");return}
  if(!/\.(mp4|webm)$/i.test(f.name)){info.style.color="var(--bad)";info.textContent="Usa un video .mp4 o .webm";return}
  vf=null;info.style.color="";dz.classList.add("has");bar.style.width="0";info.textContent=f.name+" · "+fmt(f.size)+" · 0%";
  try{const fr=await upload("trailer",f,(l,t)=>{bar.style.width=(l/t*100)+"%";info.textContent=f.name+" · "+fmt(l)+" de "+fmt(t)},"video");vf=fr;bar.style.width="100%";info.textContent=fr.name+" · "+fmt(fr.size)+" · listo"}
  catch(err){dz.classList.remove("has");info.style.color="var(--bad)";info.textContent=err.message}finally{delete ups.trailer}
},"video/mp4,video/webm");
function resetMedia(a){
  shots=[];vf=null;drawShots();drawStores();
  const dz=$("dzVid");dz.classList.remove("has");dz.querySelector(".i").textContent="";dz.querySelector(".i").style.color="";dz.querySelector(".pb i").style.width="0";
  document.querySelector("input[name=trk][value=none]").checked=true;$("trUrl").value="";
  const m=a&&a.media;
  if(m){
    if(m.trailer){document.querySelector("input[name=trk][value="+m.trailer.kind+"]").checked=true;
      if(m.trailer.kind==="youtube")$("trUrl").value="https://youtu.be/"+m.trailer.id;
      else{vf=m.trailer;dz.classList.add("has");dz.querySelector(".i").textContent=m.trailer.name+" · "+fmt(m.trailer.size);dz.querySelector(".pb i").style.width="100%"}}
    if(m.images.length)api("/admin/media/"+a.id).then(r=>{if(r.ok&&editId===a.id){shots=m.images.map((f,i)=>({...f,url:r.j.images[i]||"",pct:100}));drawShots()}});
  }
  syncTr();
}
async function fillStore(){
  const r=await api("/admin/storage-check"),s=r.ok?(r.j.stores.find(x=>x.id===$("scId").value)||{}):{};
  $("scEp").value=s.host||"";$("scBk").value=s.bucket||"";$("scKi").value="";$("scSe").value="";$("scErr").textContent="";
  $("scKi").placeholder=s.keyPreview?"Ya hay una guardada (empieza con "+s.keyPreview+")":"";
}
$("cfgBtn").onclick=async()=>{await fillStore();dStore.showModal()};
$("scId").onchange=fillStore;
$("fStore").onsubmit=async e=>{
  e.preventDefault();if(!canEdit())return;
  const b={id:$("scId").value,endpoint:$("scEp").value,bucket:$("scBk").value,keyId:$("scKi").value,secret:$("scSe").value};
  if(!b.endpoint.trim()||!b.bucket.trim()){$("scErr").textContent="Completa el endpoint y el nombre del bucket.";return}
  const pin=await askPin("Guardar almacenamiento — ingresa tu PIN");if(!pin)return;
  const r=await api("/admin/storage-config",{method:"PUT",pin,body:b});
  if(!r.ok){if(r.s===400){$("scErr").textContent=r.j.error;return}return pinErr(r)}
  $("scSe").value="";dStore.close();await load();toast("Almacenamiento guardado. Cierra y vuelve a abrir este formulario.");$("diagBtn").click();
};
$("scClear").onclick=async()=>{
  if(!canEdit()||!confirm("¿Quitar este almacenamiento del sitio? Los archivos ya subidos dejarán de poder descargarse hasta que lo vuelvas a configurar."))return;
  const pin=await askPin("Quitar almacenamiento — ingresa tu PIN");if(!pin)return;
  const r=await api("/admin/storage-config",{method:"PUT",pin,body:{id:$("scId").value,clear:true}});
  if(!r.ok)return pinErr(r);dStore.close();await load();toast("Almacenamiento quitado.");
};
$("diagBtn").onclick=async()=>{
  const o=$("diagOut");o.classList.remove("hide");o.textContent="Revisando…";
  const r=await api("/admin/storage-check");if(!r.ok){o.textContent="No se pudo hacer el diagnóstico (¿sesión vencida?).";return}
  const L=[r.j.upload?"Estado: la subida de archivos ESTÁ configurada.":"Estado: la subida de archivos NO está configurada."];
  for(const s of r.j.stores){
    L.push("","• "+s.label);
    if(s.found.length)L.push("  Datos encontrados: "+s.found.join(", "));
    if(s.missing.length&&s.found.length)L.push("  Faltan: "+s.missing.join(", "));
    if(s.host)L.push("  Servidor: "+s.host+" · bucket: "+s.bucket+" · región: "+s.region);
    if(s.keyLen)L.push("  keyID guardado: "+s.keyLen+" caracteres (empieza con "+s.keyStart+") · applicationKey guardada: "+s.secretLen+" caracteres");
    if(s.steps)L.push("  Pruebas: "+s.steps.map(t=>t.n+": "+(t.s==null?"—":(t.s>=200&&t.s<300?"correcto":t.s+(t.c?" "+t.c:"")))).join(" · "));
    L.push("  "+(s.status!=null?"Prueba de conexión: "+(s.status||"sin respuesta")+(s.code?" ("+s.code+")":"")+" → ":"")+s.hint);
  }
  L.push("","Variables relacionadas que ve el servidor: "+(r.j.seen.length?r.j.seen.join(", "):"ninguna"));
  if(!r.j.upload)L.push("","Si no aparece S3_ENDPOINT, S3_KEY_ID, S3_SECRET y S3_BUCKET en la lista de arriba, no se guardaron en ESTE Worker o falta pulsar Deploy. Revisa que los nombres estén en mayúsculas y escritos igual.");
  o.textContent=L.join("\n");
};
$("bUp").onclick=()=>openForm();
function openForm(a){
  if(!canEdit())return;
  editId=a?a.id:null;iconData=a?a.icon:"";$("am").textContent="";$("fApp").reset();
  $("aTitle").textContent=a?"Editar App":"Subir App";$("icoPrev").src=iconData||"";$("icoPrev").style.visibility=iconData?"visible":"hidden";
  if(a){aName.value=a.name;aSaga.value=a.saga;aVer.value=a.ver;aCat.value=a.cat;aDev.value=a.dev;aDesc.value=a.desc;aNotes.value=a.notes||"";if(a.release)$("aRel").value=new Date(a.release-new Date(a.release).getTimezoneOffset()*6e4).toISOString().slice(0,16)}
  buildZones(a);resetMedia(a);dApp.showModal();
}
window.editApp=id=>openForm(apps.find(a=>a.id===id));
window.delApp=async id=>{if(!canEdit())return;const pin=await askPin("Eliminar app — ingresa tu PIN");if(!pin)return;
  const r=await api("/admin/delete",{method:"POST",pin,body:{id}});if(!r.ok)return pinErr(r);await load();render();toast("App eliminada.")};
window.togQ=async id=>{if(!canEdit())return;const a=apps.find(x=>x.id===id);if(!a)return;
  const r=await api("/admin/q",{method:"POST",body:{id,q:!a.q}});if(!r.ok)return toast(r.j.error||"No se pudo cambiar.");await load();render();toast("Visibilidad actualizada.")};
$("fApp").onsubmit=async e=>{
  e.preventDefault();if(!canEdit())return;$("am").style.color="";
  const plat=Object.keys(PL).filter(k=>sel[k]),urls={},rel=$("aRel").value?new Date($("aRel").value).getTime():0;
  if(!plat.length){$("am").textContent="Elige al menos una plataforma.";return}
  if(upBusy()){$("am").textContent="Espera a que terminen las subidas.";return}
  for(const k of plat){const u=$("u_"+k).value.trim();if(u){if(!/^https:\/\//i.test(u)){$("am").textContent="El enlace de "+PL[k][0]+" debe empezar con https://";return}urls[k]=u}if(!urls[k]&&!fl[k]&&!(rel>Date.now())){$("am").textContent="Sube un archivo o pega un enlace https para "+PL[k][0]+".";return}}
  const files=Object.fromEntries(plat.filter(k=>fl[k]).map(k=>[k,fl[k]]));
  if(shots.some(s=>!s.key)){$("am").textContent="Espera a que terminen de subir las imágenes.";return}
  const tk=document.querySelector("input[name=trk]:checked").value;let trailer=null;
  if(tk==="youtube"){const u=$("trUrl").value.trim();if(!/(youtu\.be\/|youtube\.com\/)|^[\w-]{11}$/.test(u)){$("am").textContent="Pon un enlace válido de YouTube.";return}trailer={kind:"youtube",url:u}}
  else if(tk==="file"){if(!vf){$("am").textContent="Sube el video del tráiler o elige otra opción.";return}trailer={kind:"file",key:vf.key,st:vf.st,name:vf.name,size:vf.size}}
  const media={images:shots.map(({key,st,name,size})=>({key,st,name,size})),trailer};
  $("bSave").disabled=true;$("am").style.color="var(--a)";$("am").textContent="Publicando…";
  const r=await api("/admin/app",{method:"PUT",body:{app:{id:editId,icon:iconData,name:aName.value,saga:aSaga.value,ver:aVer.value,cat:aCat.value,dev:aDev.value,desc:aDesc.value,notes:aNotes.value,plat,urls,files,release:rel,media}}});
  $("bSave").disabled=false;$("am").style.color="";
  if(!r.ok){$("am").textContent=r.j.error||"No se pudo guardar.";return}
  await load();dApp.close();render();toast("App publicada.");
};

/* ---------- Exportar / importar ---------- */
async function exportCatalog(){
  const r=await api("/admin/backup");if(!r.ok){toast("No se pudo crear el respaldo.");return}
  const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([JSON.stringify(r.j,null,1)],{type:"application/json"}));a.download="respaldo-techstudios.json";a.click();toast("Respaldo completo descargado.");
}
$("bExp").onclick=()=>{if(admin)exportCatalog()};
$("bImp").onclick=()=>$("impF").click();
$("impF").onchange=async e=>{if(!canEdit())return;const f=e.target.files[0];e.target.value="";if(!f)return;
  let d;try{d=JSON.parse(await f.text())}catch(x){toast("Archivo no válido.");return}
  const full=d&&!Array.isArray(d)&&Array.isArray(d.catalog);
  const pin=await askPin((full?"Restaurar respaldo completo":"Importar catálogo")+" — ingresa tu PIN");if(!pin)return;
  const r=full?await api("/admin/restore",{method:"POST",pin,body:{data:d}}):await api("/admin/import",{method:"POST",pin,body:{apps:d}});
  if(!r.ok)return pinErr(r);await load();postsLoaded=false;render();
  toast(full?"Respaldo restaurado: "+(r.j.apps||0)+" apps, "+(r.j.posts||0)+" publicaciones.":"Catálogo importado ("+(r.j.n||0)+" apps).")};

/* ---------- Centro de pánico (efecto global, en el servidor) ---------- */
$("pPl").innerHTML=Object.keys(PL).map(k=>`<label>${lg(k,16)}<span>${PL[k][0]}</span><input type="checkbox" value="${k}"></label>`).join("");
$("bPanic").onclick=()=>{if(admin)dPanic.showModal()};
document.querySelectorAll("#dPanic [data-m]").forEach(b=>b.onclick=async()=>{
  if(!admin)return;const m=b.dataset.m;
  if(m==="backup"){await exportCatalog();return}
  const bl=[...document.querySelectorAll("#pPl input:checked")].map(i=>i.value);
  if(m==="platforms"&&!bl.length){toast("Elige al menos una plataforma.");return}
  const T={downloads:"Bloquear descargas",platforms:"Bloquear plataformas",full:"Cierre total",freeze:"Congelar panel",kill:"Cerrar sesiones y bloquear acceso admin",off:"Restaurar normal"};
  const pin=await askPin(T[m]+" — ingresa tu PIN de confirmación");if(!pin)return;
  const r=await api("/admin/status",{method:"POST",pin,body:{action:m,blocked:bl,msg:$("pMsg").value.trim()}});
  if(!r.ok)return pinErr(r);
  status=r.j.status;
  if(m==="kill"){dPanic.close();await logout();toast("Sesiones cerradas. Acceso admin bloqueado 24 h.");return}
  applyLock();toast("Aplicado para todos los visitantes.")});



/* ---------- Google Analytics (solo con consentimiento) ---------- */
const GA="G-4T2TEHV78J";
window.dataLayer=window.dataLayer||[];window.gtag=function(){dataLayer.push(arguments)};
let consent="";try{consent=localStorage.getItem("ts_consent")||""}catch(e){}
let gaLoaded=false;
const gaFlag=()=>{window["ga-disable-"+GA]=!!admin||consent!=="yes"};
function loadGA(){
  if(gaLoaded)return;gaLoaded=true;gaFlag();
  const s=document.createElement("script");s.async=true;s.src="https://www.googletagmanager.com/gtag/js?id="+GA;document.head.appendChild(s);
  gtag("js",new Date());gtag("config",GA,{anonymize_ip:true,allow_google_signals:false,allow_ad_personalization_signals:false});
}
function clearGA(){
  gaFlag();const h=location.hostname.split(".");
  document.cookie.split(";").map(c=>c.split("=")[0].trim()).filter(n=>n==="_ga"||n.startsWith("_ga_")||n==="_gid").forEach(n=>{
    for(let i=0;i<h.length;i++)document.cookie=n+"=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain="+h.slice(i).join(".");
    document.cookie=n+"=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/"});
}
function track(n,p){if(gaLoaded&&consent==="yes"&&!admin)gtag("event",n,p||{})}
function setConsent(v){consent=v;try{localStorage.setItem("ts_consent",v)}catch(e){}$("consent").classList.add("hide");if(v==="yes")loadGA();else clearGA();gaFlag();toast(v==="yes"?"Analítica activada. Gracias.":"Analítica desactivada.")}
const showConsent=()=>{$("consent").classList.remove("hide")};
$("cYes").onclick=()=>setConsent("yes");$("cNo").onclick=()=>setConsent("no");
if(consent==="yes")loadGA();
document.addEventListener("click",e=>{
  const a=e.target.closest('a[href^="/api/d/"]');
  if(a){const m=a.getAttribute("href").match(/\/api\/d\/[^/]+\/(\w+)/),card=a.closest(".card");track("app_download",{app_name:card?card.querySelector("h3").textContent:"",platform:m?m[1]:""})}
  if(e.target.closest("#cafeBox a"))track("donate_click");
});

/* ---------- Tutorial de bienvenida ---------- */
const IOS=/iPad|iPhone|iPod/.test(navigator.userAgent)||(navigator.platform==="MacIntel"&&navigator.maxTouchPoints>1);
const OSN=IOS?"ios":/Android/.test(navigator.userAgent)?"android":/Windows/.test(navigator.userAgent)?"win":/Mac OS X|Macintosh/.test(navigator.userAgent)?"mac":/Linux/.test(navigator.userAgent)?"lin":"";
const UL=a=>`<ul class="tl">${a.map(x=>`<li>${x}</li>`).join("")}</ul>`;
const OL=a=>`<ol class="ios">${a.map(x=>`<li>${x}</li>`).join("")}</ol>`;
const TIP=t=>`<div class="tip">${t}</div>`;
const DET=(os,t,h)=>`<details${OSN===os?" open":""}><summary>${t}</summary><div class="dbody">${h}</div></details>`;
const K=t=>`<span class="kbd">${t}</span>`;
const CUR='<svg class="mk-cur" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 3l14 8-6 1.5L10 19z" fill="#fff" stroke="#05060f" stroke-width="1.5" stroke-linejoin="round"/></svg>';
const CAP=t=>`<div class="mk-cap">${t}</div>`;
const MK={
dl:()=>`<div class="mk mk-dl" role="img" aria-label="Ejemplo animado: se pulsa el botón de descarga de Windows y aparece la descarga en la parte de abajo del navegador"><div class="mc-card"><div class="mc-cover">${ic("play",14)}</div><div class="mc-top"><i class="mc-ico">${ic("box",20)}</i><div><b>Mi App</b><small>v1.0 · Juegos</small></div><span class="mc-n">${ic("download",11)} 128</span></div><div class="mc-btns"><span class="mc-b hit"><i class="mc-badge">1</i>${lg("win",13)} Descargar Windows 11 · 120 MB${CUR}</span><span class="mc-b">${lg("and",13)} Descargar Android · 45 MB</span></div></div><div class="mc-bar"><i class="mc-badge">2</i><span class="mc-file">${ic("download",13)} MiApp-Setup.exe</span><span class="mc-prog"><i></i></span><span class="mc-ok">Listo</span></div></div>`+CAP("<b>1.</b> Pulsa el botón de tu plataforma. <b>2.</b> Tu navegador empieza a descargar el archivo (suele aparecer abajo o arriba a la derecha)."),
states:()=>`<div class="mk-states"><div><span class="btn">${lg("win",14)} Descargar Windows 11 · 120 MB</span><p>Listo para descargar.</p></div><div><button class="sec" disabled>${ic("lock",15)} Descargas bloqueadas</button><p>Pausa de seguridad temporal. Vuelve más tarde.</p></div><div><button class="sec" disabled>${ic("clock",15)} Disponible el 12 dic, 18:00</button><p>Aún no se estrena.</p></div><div><button class="sec" disabled>${ic("clock",15)} Android · próximamente</button><p>Esa versión todavía no está lista.</p></div><div><span class="btn">${lg("ios",14)} Abrir PWA iOS (PWA)</span><p>No descarga: se abre en el navegador.</p></div></div>`,
win:()=>`<div class="mk mk-ss" role="img" aria-label="Ejemplo animado de la advertencia SmartScreen de Windows: se pulsa Más información y luego Ejecutar de todas formas"><div class="ssw"><div class="ss-a"><h5>Windows protegió su PC</h5><p>Microsoft Defender SmartScreen impidió el inicio de una aplicación no reconocida. Ejecutar esta aplicación podría poner en riesgo su PC.</p><u class="ss-more"><i class="mc-badge">1</i>Más información</u></div><div class="ss-b"><h5>Windows protegió su PC</h5><p>Aplicación: <b>MiApp-Setup.exe</b><br>Editor: <b>Editor desconocido</b></p><span class="ss-run"><i class="mc-badge">2</i>Ejecutar de todas formas</span><span class="ss-no">No ejecutar</span></div></div><svg class="mk-cur ss-cur" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 3l14 8-6 1.5L10 19z" fill="#fff" stroke="#05060f" stroke-width="1.5" stroke-linejoin="round"/></svg></div>`+CAP("Si Windows muestra esta pantalla azul: pulsa <b>1. Más información</b> y luego <b>2. Ejecutar de todas formas</b>. «Editor desconocido» es normal en programas independientes que no pagan una firma digital."),
dmg:()=>`<div class="mk mk-dmg" role="img" aria-label="Ejemplo animado: se arrastra el icono de la app hasta la carpeta Aplicaciones"><div class="dmg-t">MiApp</div><div class="dmg-app"><i class="dmg-i">${ic("box",28)}</i><span>MiApp</span></div><div class="dmg-arrow"></div><div class="dmg-fold"><i class="dmg-f"><svg viewBox="0 0 24 24" width="52" height="52" fill="currentColor" aria-hidden="true"><path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg></i><span>Aplicaciones</span></div></div>`+CAP("Al abrir el <b>.dmg</b>, arrastra el icono de la app hasta la carpeta <b>Aplicaciones</b>."),
term:()=>`<div class="mk mk-term" role="img" aria-label="Ejemplo animado de comandos en la terminal de Linux"><div class="tbar"><i></i><i></i><i></i><span>Terminal</span></div><div class="tcode"><div><span class="p">$ </span><span class="typ t1">sudo apt install ./archivo.deb</span></div><div class="mut"># o, para un .AppImage:</div><div><span class="p">$ </span><span class="typ t2">chmod +x MiApp.AppImage &amp;&amp; ./MiApp.AppImage</span></div></div></div>`+CAP("Abre la terminal en la carpeta <b>Descargas</b> y escribe el comando que corresponda a tu archivo."),
android:()=>`<div class="mk mk-and"><div class="ph" role="img" aria-label="Paso 1: permitir instalar apps desconocidas a tu navegador"><i class="mc-badge" style="top:8px;left:8px">1</i><h6>Instalar apps desconocidas</h6><div class="ph-row"><span>Chrome</span><i class="tgl"></i></div><div class="ph-cap">Activa el permiso para tu navegador (o para Archivos).</div></div><div class="ph" role="img" aria-label="Paso 2: pulsar Instalar"><i class="mc-badge" style="top:8px;left:8px">2</i><div class="ph-dlg"><b>¿Quieres instalar esta aplicación?</b><div class="ph-app">${ic("box",16)} Mi App</div><div class="ph-btns"><span>Cancelar</span><span class="ph-inst">Instalar</span></div></div></div></div>`+CAP("Los textos pueden variar un poco según la marca de tu celular."),
ios:()=>`<div class="mk mk-and"><div class="ph" role="img" aria-label="Ejemplo animado en un iPhone: tocar Compartir, elegir Añadir a pantalla de inicio y tocar Añadir"><div class="ios-p ios-p1"><div class="ios-url">tech-studios.workers.dev</div><div class="ios-page"><i></i><i></i><i></i><i class="s"></i></div><div class="ios-tb"><span>‹</span><span>›</span><span class="ios-share"><i class="mc-badge">1</i>${ic("share",18)}</span><span>${ic("clip",16)}</span><span>${ic("box",16)}</span></div></div><div class="ios-p ios-p2"><div class="ios-page dim"><i></i><i></i></div><div class="ios-sheet"><div>Copiar</div><div>Añadir a marcadores</div><div class="ios-hl"><i class="mc-badge">2</i>Añadir a pantalla de inicio ${ic("addhome",15)}</div><div>Buscar en la página</div></div></div><div class="ios-p ios-p3"><div class="ios-hd"><span>Cancelar</span><b>Añadir a pantalla de inicio</b><span class="ios-add"><i class="mc-badge">3</i>Añadir</span></div><div class="ios-form"><i class="ios-ic">${ic("box",24)}</i><div><b>Mi App</b><small>tech-studios.workers.dev</small></div></div></div><div class="ios-p ios-p4"><div class="ios-grid"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i class="new">${ic("box",22)}</i></div><div class="ios-lbl">Mi App <small>¡Listo!</small></div></div></div></div>`+CAP("<b>1.</b> Toca Compartir. <b>2.</b> Elige «Añadir a pantalla de inicio». <b>3.</b> Toca Añadir. El icono queda en tu pantalla de inicio."),
pwa:()=>`<div class="mk mk-pwa" role="img" aria-label="Ejemplo animado: el navegador muestra el botón Instalar en la barra de direcciones"><div class="addr"><span class="url">tech-studios.workers.dev</span><span class="inst">${ic("download",14)}</span></div><div class="pop"><b>¿Instalar «Mi App»?</b><br><span class="pbtn">Instalar</span></div></div>`+CAP("En Chrome o Edge aparece un icono de instalación en la barra de direcciones."),
flow:()=>`<div class="mk mk-flow" role="img" aria-label="Pasos: activar modo desarrollador, conectar el equipo e instalar el archivo"><div class="fl">${ic("unlock",22)}<br><b>1</b><br>Activa el modo desarrollador</div><span class="fa">→</span><div class="fl">${ic("power",22)}<br><b>2</b><br>Conecta tu equipo (USB o Wi-Fi)</div><span class="fa">→</span><div class="fl">${ic("download",22)}<br><b>3</b><br>Instala el archivo con la herramienta oficial</div></div>`,
mc:()=>`<div class="mk mk-mc" role="img" aria-label="Ejemplo animado: el archivo .jar se copia a la carpeta mods de Minecraft"><div class="mcp">${ic("box",14)} %appdata%\\.minecraft\\mods</div><div class="mcl"><div>${ic("box",13)} fabric-api.jar</div><div class="mc-new">${ic("box",13)} mi-mod.jar <span style="margin-left:auto;color:#3dffb0">${ic("check",13)}</span></div></div><div class="mc-fly">mi-mod.jar</div></div>`+CAP("Copia el <b>.jar</b> descargado dentro de la carpeta <b>mods</b> (y reinicia el juego)."),
search:()=>`<div class="mk mk-srch" role="img" aria-label="Ejemplo animado: se escribe en el buscador, se abre el orden y las tarjetas se reordenan por popularidad"><div class="sr-bar"><span class="sr-in">${ic("search",14)}<span class="typ t3">dragones</span></span><span class="sr-sel">Plataforma ▾</span><span class="sr-sel sr-sort">Orden ▾<span class="sr-menu"><i>Más nuevas</i><i class="on">Más populares</i><i>Tendencia de la semana</i></span></span></div><div class="sr-cards"><i>${ic("box",18)}<b>Mod A</b><small>12 descargas</small></i><i>${ic("box",18)}<b>Mod B</b><small>48 descargas</small></i><i>${ic("box",18)}<b>Mod C</b><small>230 descargas</small></i></div></div>`+CAP("Escribe en el buscador, elige una plataforma y cambia el <b>Orden</b>. Aquí «Más populares» pone primero lo que más se descargó."),
detail:()=>`<div class="mk mk-dt" role="img" aria-label="Ejemplo animado: la ventana de detalle con galería de imágenes y miniaturas"><div class="dt-h"><i class="mc-ico">${ic("box",18)}</i><b>Mi App</b><span class="dt-x">Cerrar</span></div><div class="dt-main"><span class="dt-ar l">‹</span><span class="dt-ar r">›</span></div><div class="dt-ths"><i class="dt-th">${ic("play",14)}</i><i class="dt-th"></i><i class="dt-th"></i></div></div>`+CAP("Pasa las imágenes con las flechas o las miniaturas. El primer cuadro con el triángulo es el tráiler."),
spoil:()=>`<div class="mk mk-sp" role="img" aria-label="Ejemplo animado: un spoiler borroso que se muestra al pulsar el botón"><div class="sp-meta"><span class="sp-badge">${ic("eye",12)} Spoiler</span><small>hoy</small></div><b>Final del capítulo 3</b><div class="sp-box"><div class="sp-blur"><p>El villano resulta ser el hermano del protagonista y, en la última escena…</p><p>…revela dónde estaba escondido el mapa.</p></div><span class="sp-btn">${ic("eye",14)} Mostrar spoiler</span></div></div>`+CAP("Los spoilers salen borrosos. Pulsa <b>Mostrar spoiler</b> solo si quieres verlos."),
mail:()=>`<div class="mk mk-ml" role="img" aria-label="Ejemplo animado: se completa el formulario de Sugerencias y se abre el correo con el mensaje ya escrito"><div class="ml-f"><i class="mc-badge">1</i><div class="ml-types"><span class="on">Error</span><span>Sugerencia</span><span>Idea</span></div><div class="ml-l" style="--w:100%"></div><div class="ml-l" style="--w:82%"></div><div class="ml-l" style="--w:60%"></div><span class="ml-btn"><i class="mc-badge">2</i>Abrir en mi correo</span></div><span class="ml-ar">→</span><div class="ml-m"><i class="mc-badge">3</i><div class="ml-to">Para: tech.studios270@gmail.com</div><div class="ml-sub">[Error] Mod X — El botón no responde</div><div class="ml-body"><i></i><i></i><i class="s"></i></div><span class="ml-send"><i class="mc-badge">4</i>Enviar</span></div></div>`+CAP("<b>1.</b> Elige el tipo y completa el formulario. <b>2.</b> Pulsa «Abrir en mi correo». <b>3.</b> Se abre tu correo con el mensaje ya escrito. <b>4.</b> Revisa y pulsa <b>Enviar</b>."),
quiz:()=>`<div class="mk mk-qz" role="img" aria-label="Ejemplo animado: se responden las preguntas, se marca el consentimiento y se envían las respuestas"><div class="qz-p"><i></i></div><div class="qz-q"><b>1. ¿Qué plataforma usas más? *</b><span class="qz-o"><i class="d"></i>Windows</span><span class="qz-o qa"><i class="d"></i>Android</span></div><div class="qz-q"><b>2. Califica el sitio *</b><div class="qz-s"><span>1</span><span>2</span><span>3</span><span class="qb">4</span><span>5</span></div></div><div class="qz-c"><span class="qc">${ic("check",11)}</span> Acepto que mis respuestas se guarden</div><span class="qz-send">Enviar respuestas</span><div class="qz-done">${ic("check",34)}<br><b>¡Respuestas enviadas!</b></div></div>`+CAP("Responde, marca el consentimiento y pulsa «Enviar respuestas». La barra de arriba muestra tu avance."),
cafe:()=>`<div class="mk mk-cf" role="img" aria-label="Ejemplo animado: se elige un monto y se confirma el pago en la ventana de PayPal"><div class="cf-l">${ic("coffee",30)}<b>Cómprame un café</b><div class="cf-am"><span>3 USD</span><span>5 USD</span><span class="hit"><i class="mc-badge">1</i>10 USD</span><span>20 USD</span></div></div><span class="ml-ar">→</span><div class="cf-w"><div class="cf-h">PayPal</div><p>Donación de 10 USD a Tech Studios</p><span class="cf-pay"><i class="mc-badge">2</i>Pagar</span><div class="cf-ok">${ic("check",26)} ¡Gracias!</div></div></div>`+CAP("<b>1.</b> Elige un monto. <b>2.</b> En la ventana de PayPal inicia sesión y confirma. Es voluntario, y este sitio no ve tus datos de pago.")
};
const TOUR=[
 ["download","Bienvenido a Tech Studios","Aquí encuentras apps, juegos y mods para tus dispositivos. Esta guía explica todo el sitio con calma. Puedes saltar a cualquier tema con el menú «Ir a…» de arriba.",
  UL(["<b>Descargas:</b> el catálogo. Aquí buscas, ves los detalles y descargas.","<b>Novedades:</b> comunicados, avisos, devlogs y spoilers.","<b>Sugerencias:</b> reporta un error, propone una mejora o una idea de qué crear. El sitio te prepara el correo.","<b>Cuestionario:</b> preguntas cortas para ayudar a decidir qué crear.","<b>Cómprame un café:</b> apoyo voluntario por PayPal.","Arriba a la derecha tienes <b>Ayuda</b> (esta guía) y el botón de estilo visual (Neón o Liquid Glass)."])],
 ["search","Buscar, filtrar y ordenar","Todo esto está arriba del catálogo, en la pestaña Descargas.",
  MK.search()+UL(["<b>Buscador:</b> escribe parte del nombre de la app o de su saga. Atajo en computador: la tecla "+K("/")+".","<b>Categoría:</b> Juegos (Acción, Aventura, Estrategia…) o Aplicaciones (Herramientas, Música, Educación…).","<b>Plataforma:</b> Windows 11, macOS, Linux, Android, iOS (PWA), Web, LG TV, Samsung TV, Android TV, VR, Minecraft…","<b>Orden:</b> más nuevas, más antiguas, más populares, menos populares, tendencia de la semana, tendencia del mes y próximos estrenos.","Puedes combinar todo. Si no aparece nada, quita algún filtro."])+TIP("La «tendencia» cuenta las descargas de los últimos 7 o 30 días: sirve para ver qué está de moda ahora.")],
 ["box","Cómo leer una tarjeta","Cada app del catálogo es una tarjeta con esta información:",
  UL(["<b>Portada e icono.</b> Un círculo con un triángulo de play sobre la portada indica que tiene tráiler.","<b>Nombre, saga y versión</b> (por ejemplo v1.2).","<b>Etiquetas:</b> la categoría, las plataformas con su logo y «Próximamente» si aún no sale.","<b>Descargas:</b> el total arriba a la derecha y, abajo, cuánto subió esta semana y este mes.","<b>Botones de descarga:</b> uno por plataforma, con el tamaño del archivo cuando se conoce, y los logos de las plataformas al final."])],
 ["eye","Ver el detalle: galería y tráiler","Haz clic (o toca) una tarjeta, fuera de los botones, para abrir su ventana de detalle.",
  MK.detail()+OL(["Verás la descripción completa, las novedades de la versión y los botones de descarga.","Si la app tiene imágenes, pásalas con las flechas ‹ › o con las miniaturas de abajo. En computador también sirven las teclas "+K("←")+" y "+K("→")+".","Si tiene tráiler de YouTube, pulsa <b>Ver tráiler</b>. Hasta ese momento el sitio no se conecta con YouTube. Si es un video propio, usa los controles del reproductor.","Para cerrar, pulsa <b>Cerrar</b> o la tecla "+K("Esc")+"."])],
 ["download","Descargar paso a paso","Mira el ejemplo animado y luego sigue los pasos:",
  MK.dl()+OL(["Elige el botón de <b>tu</b> plataforma (tiene su logo). Si una app existe para varias, verás un botón por cada una.","Mira el tamaño que aparece en el botón. Si es grande, mejor usa Wi-Fi.","Pulsa el botón. La descarga empieza sola: el sitio cuenta la descarga y te lleva al archivo.","Busca el archivo en la carpeta <b>Descargas</b> de tu dispositivo (en el navegador de un computador, "+K("Ctrl")+" + "+K("J")+" abre la lista de descargas). Luego sigue la guía de instalación del siguiente paso."])+
  `<h4 class="th">Si el botón no te deja descargar</h4>`+MK.states()+UL(["<b>Candado o «bloqueada»:</b> las descargas están detenidas por seguridad por un rato. Vuelve más tarde.","<b>Reloj o «Disponible el…»:</b> la app aún no se estrena.","<b>«Próximamente» en una plataforma:</b> esa versión todavía no está lista.","<b>«Abrir PWA» o «Abrir»:</b> no descarga un archivo; se abre en el navegador."])+TIP("Descarga siempre desde los botones de este sitio. Los archivos de otras páginas pueden no ser seguros.")],
 ["box","Instalar según tu dispositivo","Abre el tuyo (ya dejé abierto el que parece corresponder a tu equipo). Los programas nuevos suelen mostrar advertencias del sistema: es normal.",
  DET("win","Windows 11 (.exe, .msi, .msix, .zip)",MK.win()+UL(["Doble clic en el archivo. Si es un <b>.zip</b>: clic derecho, <b>Extraer todo</b>, y abre el programa dentro de la carpeta.","Si aparece una pantalla azul de <b>SmartScreen</b>: pulsa <b>Más información</b> y luego <b>Ejecutar de todas formas</b>, solo si descargaste el archivo desde este sitio.","Windows puede pedir permiso de administrador para instalar. Acepta solo si tú iniciaste la instalación."]))+
  DET("mac","macOS (.dmg, .pkg, .zip)",MK.dmg()+UL(["<b>.dmg:</b> ábrelo y arrastra la app a la carpeta <b>Aplicaciones</b>. <b>.pkg:</b> doble clic y sigue el asistente.","Si dice que no se puede abrir por ser de un desarrollador no identificado: clic derecho (o Control + clic) sobre la app, <b>Abrir</b> y otra vez <b>Abrir</b>."]))+
  DET("lin","Linux (.AppImage, .deb, .rpm, .tar.gz)",MK.term()+UL(["<b>.AppImage:</b> clic derecho, <b>Propiedades</b>, <b>Permisos</b>, marca «Permitir ejecutar» y haz doble clic.","<b>.deb</b> (Ubuntu, Debian): doble clic, o en la terminal <code>sudo apt install ./archivo.deb</code>.","<b>.rpm</b> (Fedora): <code>sudo dnf install ./archivo.rpm</code>.","<b>.tar.gz:</b> extráelo y ejecuta el programa que trae dentro."]))+
  DET("android","Android (.apk, .zip)",MK.android()+UL(["Toca el archivo descargado (o ábrelo desde la app <b>Archivos</b> o <b>Descargas</b>).","Android puede pedirte permitir «instalar apps desconocidas» para tu navegador o para Archivos. Actívalo, instala y luego vuelve a desactivarlo.","Si es un <b>.zip</b>, extráelo primero. Un archivo <b>.aab</b> no se instala directamente: busca el <b>.apk</b>."]))+
  DET("ios","iPhone y iPad (PWA)",UL(["Abre el sitio en <b>Safari</b>, toca <b>Compartir</b> "+ic("share",16)+", elige <b>Añadir a pantalla de inicio</b> "+ic("addhome",16)+" y toca <b>Añadir</b>.","Los archivos .apk y .exe no funcionan en iOS. Hay un paso con más detalle justo después."]))+
  DET("web","Web / HTML5 (botón «Abrir»)",MK.pwa()+UL(["Se abre en una pestaña del navegador y no se instala nada.","Para usarla como app: en Chrome o Edge, menú y <b>Instalar</b>; en el celular, <b>Añadir a pantalla de inicio</b>."]))+
  DET("tv","Smart TV y realidad virtual (LG, Samsung, Android TV, Meta Quest)",MK.flow()+UL(["<b>LG TV (.ipk):</b> requiere activar el modo desarrollador y las herramientas de LG para webOS.","<b>Samsung TV (.wgt):</b> requiere modo desarrollador y Tizen Studio.","<b>Android TV (.apk):</b> instálalo con un explorador de archivos (por ejemplo la app «Downloader») o por USB.","<b>Meta Quest (.apk):</b> activa el modo desarrollador y usa SideQuest o Meta Quest Developer Hub.","Son pasos técnicos: sigue la guía oficial de tu dispositivo."]))+
  DET("mc","Minecraft: mods, plugins y add-ons",MK.mc()+UL(["<b>Mods de Java (.jar):</b> instala primero el cargador que indique la app (Forge, Fabric o NeoForge) para <b>la misma versión</b> del juego. Copia el .jar a la carpeta <b>mods</b>: en Windows, pulsa "+K("Win")+" + "+K("R")+", escribe <code>%appdata%\\.minecraft</code> y abre (o crea) la carpeta mods.","<b>Plugins (.jar):</b> son para servidores Spigot, Paper o Bukkit. Copia el .jar a la carpeta <b>plugins</b> del servidor y reinícialo. Solo quien administra el servidor puede hacerlo.","<b>Add-ons de Bedrock (.mcaddon, .mcpack, .mcworld):</b> ábrelo con Minecraft (doble clic en Windows; en el celular, desde Archivos). Se importa solo; luego actívalo en los ajustes de tu mundo."])+TIP("Antes de instalar mods, haz una copia de tus mundos."))],
 ["clock","Próximos estrenos","Algunas apps se anuncian antes de salir:",
  UL(["Llevan la etiqueta <b>Próximamente</b> y una <b>cuenta regresiva</b> en días, horas, minutos y segundos.","El botón dice «Disponible el…» y no se puede pulsar hasta ese momento.","Cuando llega la hora, la app se activa sola y la página se actualiza.","Para verlas todas juntas, elige <b>Próximos estrenos</b> en el orden del catálogo."])],
 ["megaphone","Novedades y spoilers","En la pestaña Novedades publico noticias del proyecto.",
  MK.spoil()+UL(["Cada publicación tiene un tipo con su color: <b>Comunicado</b>, <b>Aviso</b>, <b>Devlog</b>, <b>Estreno</b> o <b>Spoiler</b>.","Las publicaciones <b>fijadas</b> aparecen primero.","Los <b>spoilers</b> salen borrosos para que nadie se arruine una sorpresa: pulsa <b>Mostrar spoiler</b> solo si quieres verlos.","La lista se actualiza sola cada pocos minutos."])],
 ["mail","Sugerencias: cómo enviar un correo","Sirve para tres cosas: reportar un error, hacer una sugerencia o proponer una idea de qué crear.",
  MK.mail()+OL(["Abre la pestaña <b>Sugerencias</b> y elige el tipo.","Completa el formulario. Los campos con * son obligatorios. <b>Error:</b> dónde ocurrió, qué pasó, pasos para repetirlo y qué tan grave es. <b>Sugerencia:</b> sobre qué es, tu idea y por qué sería útil. <b>Idea:</b> qué quieres que se cree, para qué plataformas y de qué trata.","Si quieres una respuesta, escribe tu nombre y tu correo (es opcional). La casilla <b>Incluir información técnica</b> agrega tu sistema, navegador y tamaño de pantalla: viene marcada en los errores y puedes desmarcarla.","Revisa la <b>vista previa</b>: así llegará el correo.","Pulsa <b>Abrir en mi correo</b> (usa la app de correo de tu dispositivo), <b>Abrir en Gmail</b> (se abre en otra pestaña) o <b>Copiar mensaje</b> (pégalo en cualquier correo dirigido a tech.studios270@gmail.com).","En tu programa de correo, revisa el mensaje y pulsa <b>Enviar</b>."])+TIP("La página no envía nada por sí sola: solo prepara el correo. Si necesitas mostrar un error, adjunta tú mismo una captura de pantalla antes de enviar.")],
 ["clip","Cuestionario","Son preguntas cortas que ayudan a decidir qué crear y qué mejorar.",
  MK.quiz()+OL(["Abre la pestaña <b>Cuestionario</b>. Si dice que está cerrado, vuelve más tarde.","Responde: algunas preguntas piden <b>una opción</b> (círculos), otras <b>varias</b> (casillas), una <b>escala del 1 al 5</b> (1 es nada, 5 es mucho) o una <b>respuesta escrita</b>.","Las preguntas con * son obligatorias. Las que falten se marcan en rojo y la barra de arriba muestra cuánto llevas.","Marca la casilla de consentimiento: tus respuestas se guardan para mejorar el sitio. No escribas datos personales sensibles.","Pulsa <b>Enviar respuestas</b>. Solo puedes responder una vez desde tu dispositivo."])],
 ["coffee","Cómprame un café","Si te gusta mi trabajo, puedes apoyarlo con una donación voluntaria.",
  MK.cafe()+OL(["Abre la pestaña <b>Cómprame un café</b>.","Elige un monto rápido (3, 5, 10 o 20) o <b>Otro monto</b>.","Se abre PayPal en una pestaña nueva. Ahí inicias sesión y confirmas el pago.","Es voluntario y no da derecho a productos ni servicios. Este sitio no ve ni guarda tus datos de pago."])+TIP("Si aún no está configurado, verás un aviso de que las donaciones estarán disponibles pronto.")],
 ["help","Personaliza y privacidad","Pequeños detalles que ayudan:",
  UL(["<b>Estilo visual:</b> el botón de arriba cambia entre Neón y Liquid Glass. El sitio recuerda tu elección.","<b>Cookies:</b> al entrar aparece un aviso. Si aceptas, se usa Google Analytics para medir visitas. Puedes cambiar de opinión cuando quieras en <b>Preferencias de cookies</b>, al final de la página.","<b>Documentos legales:</b> en el pie de página están la Política de Privacidad, los Términos de Uso, las Condiciones, el Acuerdo Legal, el EULA, las Cookies, la Propiedad Intelectual y la Seguridad.","<b>Ayuda:</b> el botón de arriba (o el enlace del pie) abre de nuevo esta guía."])],
 ["alert","Problemas frecuentes","Antes de escribirme, prueba esto:",
  UL(["<b>La página se ve rara o no responde:</b> recárgala con "+K("Ctrl")+" + "+K("Shift")+" + "+K("R")+" (en el celular, desliza hacia abajo).","<b>Las descargas aparecen bloqueadas:</b> es una pausa de seguridad temporal. Intenta más tarde.","<b>El archivo no abre:</b> revisa que sea el de tu plataforma y sigue la guía de instalación.","<b>Windows, macOS o Android muestran una advertencia:</b> es normal con software nuevo. Confirma que lo descargaste desde este sitio.","<b>En iPhone o iPad no instala:</b> usa Safari y revisa el paso especial para iOS.","<b>No se ve el tráiler:</b> un bloqueador de anuncios puede bloquear YouTube.","<b>Sigue sin funcionar:</b> cuéntamelo en Sugerencias, con el tipo «Reportar un error»."])],
 ["check","¡Listo!","Ya conoces todo el sitio. Si quieres, ve directo a una sección:",
  `<div class="tgo"><button class="sec" data-act="gotab" data-tab="dl">Ir a Descargas</button><button class="sec" data-act="gotab" data-tab="su">Ir a Sugerencias</button></div>`]
];
const IOSSTEP=["share",IOS?"Instala en tu iPhone o iPad":"Si usas iPhone o iPad","En iPhone y iPad las apps se instalan como PWA: se ven y funcionan como una app normal, sin pasar por la App Store.",
 MK.ios()+OL(["Abre este sitio en <b>Safari</b>.","Toca el botón <b>Compartir</b> "+ic("share",18)+" (en iPhone está abajo; en iPad, arriba a la derecha).","Desliza el menú y elige <b>Añadir a pantalla de inicio</b> "+ic("addhome",18)+".","Toca <b>Añadir</b>. Verás el icono en tu pantalla de inicio y se abrirá a pantalla completa, como una app."])+TIP("Los archivos .apk y .exe no funcionan en iOS: usa los botones <b>Abrir PWA</b> de cada app. Si no ves «Añadir a pantalla de inicio», confirma que estás en Safari y no dentro de otra app (Instagram, Facebook…)."),"ios"];
TOUR.splice(IOS?1:TOUR.findIndex(s=>s[1]==="Instalar según tu dispositivo")+1,0,IOSSTEP);
let ti=0;
$("tIdx").innerHTML=TOUR.map((s,k)=>`<option value="${k}">${k+1}. ${esc(s[1])}</option>`).join("");
function drawTour(dir){
  const [i,t,x,html]=TOUR[ti],b=$("tBody");
  $("tIcon").innerHTML=ic(i,44);$("tTitle").textContent=t;$("tText").innerHTML=esc(x)+(html||"");b.classList.toggle("rich",!!html);
  b.classList.remove("sl","sr");void b.offsetWidth;if(dir)b.classList.add(dir>0?"sl":"sr");
  $("tBar").style.width=((ti+1)/TOUR.length*100)+"%";
  $("tDots").textContent="Paso "+(ti+1)+" de "+TOUR.length;$("tIdx").value=String(ti);
  $("tPrev").style.visibility=ti?"visible":"hidden";$("tNext").textContent=ti===TOUR.length-1?"Empezar":"Siguiente";
  dTour.scrollTop=0;
}
$("tIdx").onchange=()=>{const n=+$("tIdx").value;const d=n>ti?1:-1;ti=n;drawTour(d)};
function openTour(k){ti=typeof k==="number"?k:0;drawTour(0);if(!dTour.open)dTour.showModal();track("tutorial_begin")}
$("tNext").onclick=()=>{if(ti===TOUR.length-1){track("tutorial_complete");dTour.close();return}ti++;drawTour(1)};
$("tPrev").onclick=()=>{if(ti>0){ti--;drawTour(-1)}};
$("tSkip").onclick=()=>dTour.close();
$("tDots").onclick=e=>{const k=e.target.dataset&&e.target.dataset.k;if(k!=null){const n=+k;drawTour(n>ti?1:-1);ti=n;drawTour(0)}};
dTour.addEventListener("close",()=>{try{localStorage.setItem("ts_tour","1")}catch(e){}});
$("bHelp").innerHTML=ic("help",16)+" Ayuda";$("bHelp").onclick=()=>openTour();
function initIosTip(){
  let off="";try{off=localStorage.getItem("ts_iostip")||""}catch(e){}
  if(!IOS||off)return;$("iosTipI").innerHTML=ic("addhome",22);$("iosTip").classList.remove("hide");
  $("iosTipB").onclick=()=>openTour(TOUR.findIndex(s=>s[4]==="ios"));
  $("iosTipX").onclick=()=>{$("iosTip").classList.add("hide");try{localStorage.setItem("ts_iostip","1")}catch(e){}};
}
function firstVisit(){initIosTip();
  let seen="";try{seen=localStorage.getItem("ts_tour")||""}catch(e){}
  if(!admin&&!seen&&status.mode!=="full")setTimeout(openTour,700);
  if(!consent)setTimeout(showConsent,1100);
}


/* ---------- Detalle de la app: galería y tráiler ---------- */
let vItems=[],vi=0;
async function openView(id){
  const a=apps.find(x=>x.id===id);if(!a)return;
  $("vIcon").innerHTML=a.icon?`<img class="ico" src="${esc(a.icon)}" alt="" decoding="async">`:`<div class="ico">${ic("box",30)}</div>`;
  $("vName").textContent=a.name;$("vMeta").textContent=(a.saga?a.saga+" · ":"")+"v"+a.ver+" · "+a.cat+" · "+a.dev;
  $("vDesc").innerHTML=esc(a.desc)+(a.notes?`<div class="mut" style="margin-top:8px">Novedades: ${esc(a.notes)}</div>`:"");
  const card=[...document.querySelectorAll(".card[data-id]")].find(c=>c.dataset.id===id);$("vLinks").innerHTML=card?card.querySelector(".links").innerHTML:"";
  $("vMedia").innerHTML="";$("vMedia").classList.remove("on");$("vThumbs").innerHTML="";vItems=[];vi=0;
  dView.showModal();track("app_view",{app_name:a.name});
  if(a.ni||a.tr){
    const r=await api((admin?"/admin":"")+"/media/"+id);if(!r.ok)return;
    if(r.j.trailer)vItems.push(r.j.trailer.kind==="youtube"?{t:"yt",id:r.j.trailer.id}:{t:"vid",url:r.j.trailer.url});
    (r.j.images||[]).forEach(u=>vItems.push({t:"img",url:u}));drawView();
  }
}
function drawView(){
  const it=vItems[vi],M=$("vMedia");if(!it){M.classList.remove("on");M.innerHTML="";return}
  M.classList.add("on");const poster=(vItems.find(x=>x.t==="img")||{}).url||"";
  if(it.t==="img")M.innerHTML=`<img src="${esc(it.url)}" alt="">`;
  else if(it.t==="vid")M.innerHTML=`<video controls preload="metadata" playsinline src="${esc(it.url)}"></video>`;
  else{
    M.innerHTML=`<div class="ytf">${poster?`<img src="${esc(poster)}" alt="">`:""}<button class="ytb" type="button">${ic("play",34)}<span>Ver tráiler</span></button></div>`;
    M.querySelector(".ytb").onclick=()=>{const f=document.createElement("iframe");f.src="https://www.youtube-nocookie.com/embed/"+it.id+"?autoplay=1&rel=0";f.allow="autoplay; encrypted-media; picture-in-picture; fullscreen";f.allowFullscreen=true;f.referrerPolicy="strict-origin-when-cross-origin";f.title="Tráiler";M.innerHTML="";M.appendChild(f);track("trailer_play")};
  }
  if(vItems.length>1)M.insertAdjacentHTML("beforeend",`<button class="vnav l" data-vn="-1" aria-label="Anterior">‹</button><button class="vnav r" data-vn="1" aria-label="Siguiente">›</button>`);
  $("vThumbs").innerHTML=vItems.length>1?vItems.map((x,k)=>`<button type="button" class="vt${k===vi?" on":""}" data-vk="${k}">${x.t==="img"?`<img src="${esc(x.url)}" alt="" loading="lazy">`:ic("play",20)}</button>`).join(""):"";
}
$("vMedia").onclick=e=>{const b=e.target.closest("[data-vn]");if(b){vi=(vi+ +b.dataset.vn+vItems.length)%vItems.length;drawView()}};
$("vThumbs").onclick=e=>{const b=e.target.closest("[data-vk]");if(b){vi=+b.dataset.vk;drawView()}};
dView.addEventListener("keydown",e=>{if(vItems.length>1&&(e.key==="ArrowRight"||e.key==="ArrowLeft")){vi=(vi+(e.key==="ArrowRight"?1:-1)+vItems.length)%vItems.length;drawView()}});
dView.addEventListener("close",()=>{$("vMedia").innerHTML=""});
document.addEventListener("click",e=>{const c=e.target.closest(".card[data-id]");if(!c||e.target.closest("a,button,.adm"))return;openView(c.dataset.id)});

/* ---------- Pestañas ---------- */
const TABS=[["dl","Descargas","download","descargas"],["po","Novedades","megaphone","novedades"],["su","Sugerencias","mail","sugerencias"],["qz","Cuestionario","clip","cuestionario"],["cf","Cómprame un café","coffee","cafe"]];
let tab="dl";
$("tabs").innerHTML=TABS.map(([k,n,i])=>`<button class="tab" data-tab="${k}">${ic(i,17)}<span>${n}</span></button>`).join("")+'<i class="ind"></i>';
function moveInd(){const b=document.querySelector(".tab.on"),i=document.querySelector("#tabs .ind");if(!b||!i)return;i.style.width=b.offsetWidth+"px";i.style.transform="translateX("+b.offsetLeft+"px)"}
function setTab(k,push){
  tab=k;document.querySelectorAll(".tab").forEach(b=>b.classList.toggle("on",b.dataset.tab===k));
  TABS.forEach(t=>$("pane_"+t[0]).classList.toggle("hide",t[0]!==k));
  track("tab_view",{tab:TABS.find(t=>t[0]===k)[1]});moveInd();if(push!==false){try{history.replaceState(null,"","#"+TABS.find(t=>t[0]===k)[3])}catch(e){}}
  if(k==="po")loadPosts();if(k==="cf")loadSettings();if(k==="su")initSug();if(k==="qz")loadQuiz();
}
document.querySelectorAll(".tab").forEach(b=>b.onclick=()=>setTab(b.dataset.tab));
addEventListener("resize",moveInd);

/* ---------- Novedades (publicaciones) ---------- */
let posts=[],postsLoaded=false,poEdit=null,poImg="";
const PTYPES={comunicado:["Comunicado","megaphone"],spoiler:["Spoiler","eye"],aviso:["Aviso","alert"],devlog:["Devlog","flame"],estreno:["Estreno","clock"]};
async function loadPosts(){const r=await api("/posts",{auth:false});if(r.ok){posts=r.j.posts||[];postsLoaded=true}renderPosts()}
function renderPosts(){
  const L=$("postList");
  if(!postsLoaded){L.innerHTML=Array.from({length:3},()=>`<div class="post sk"><div class="skl" style="width:40%"></div><div class="skl" style="width:90%"></div><div class="skl" style="width:70%"></div></div>`).join("");return}
  if(!posts.length){L.innerHTML=`<div class="empty">Aún no hay publicaciones.</div>`;return}
  L.innerHTML=posts.map((p,i)=>{const T=PTYPES[p.type]||PTYPES.comunicado,body=`<div class="pbody">${esc(p.body)}</div>`;
    return `<article class="post ${esc(p.type)}" style="--i:${i}"><div class="meta"><span class="pbadge">${ic(T[1],13)} ${T[0]}</span>${p.pinned?`<span class="pbadge" style="--pc:#ffb347">${ic("pin",13)} Fijada</span>`:""}<span>${fdate(p.created)}</span></div>
    <h3>${esc(p.title)}</h3>${p.image?`<img class="pimg" src="${esc(p.image)}" alt="">`:""}
    ${p.type==="spoiler"?`<div class="spoil"><div class="sb">${body}</div><button class="sbtn" data-act="spoil">${ic("eye",15)} Mostrar spoiler</button></div>`:body}
    <div class="adm" style="margin-top:12px"><button class="sec" data-act="pedit" data-id="${esc(p.id)}">Editar</button><button class="bad" data-act="pdel" data-id="${esc(p.id)}">Eliminar</button></div></article>`}).join("");
}
function resizeImg(f,w,cb){const r=new FileReader();r.onload=()=>{const im=new Image();im.onload=()=>{const k=Math.min(1,w/im.width),cv=document.createElement("canvas");cv.width=Math.round(im.width*k);cv.height=Math.round(im.height*k);cv.getContext("2d").drawImage(im,0,0,cv.width,cv.height);cb(cv.toDataURL("image/webp",.82))};im.src=r.result};r.readAsDataURL(f)}
mkDZ($("dzPost"),f=>f.type.startsWith("image/")&&resizeImg(f,900,d=>{poImg=d;$("poPrev").src=d;$("poPrev").style.visibility="visible"}),"image/*");
$("bPost").onclick=()=>openPost();
function openPost(p){
  if(!canEdit())return;poEdit=p?p.id:null;poImg=p?p.image:"";$("fPost").reset();$("poErr").textContent="";
  $("poTitleH").textContent=p?"Editar publicación":"Nueva publicación";$("poPrev").src=poImg||"";$("poPrev").style.visibility=poImg?"visible":"hidden";
  if(p){$("poType").value=p.type;$("poTitle").value=p.title;$("poBody").value=p.body;$("poPinned").checked=p.pinned}
  dPost.showModal();
}
window.editPost=id=>openPost(posts.find(p=>p.id===id));
window.delPost=async id=>{if(!canEdit())return;const pin=await askPin("Eliminar publicación — ingresa tu PIN");if(!pin)return;
  const r=await api("/admin/post-delete",{method:"POST",pin,body:{id}});if(!r.ok)return pinErr(r);await loadPosts();toast("Publicación eliminada.")};
$("fPost").onsubmit=async e=>{e.preventDefault();if(!canEdit())return;$("poSave").disabled=true;$("poErr").style.color="var(--a)";$("poErr").textContent="Publicando…";
  const r=await api("/admin/post",{method:"PUT",body:{post:{id:poEdit,type:$("poType").value,title:$("poTitle").value,body:$("poBody").value,image:poImg,pinned:$("poPinned").checked}}});
  $("poSave").disabled=false;$("poErr").style.color="";if(!r.ok){$("poErr").textContent=r.j.error||"No se pudo publicar.";return}
  dPost.close();await loadPosts();toast("Publicado.")};
setInterval(()=>{if(!document.hidden&&tab==="po")loadPosts()},180000);

/* ---------- Cómprame un café (PayPal) ---------- */
let sett={paypal:"",cur:"USD",msg:""};
async function loadSettings(){const r=await api("/settings",{auth:false});if(r.ok)sett=r.j;renderCafe()}
function renderCafe(){
  const u=sett.paypal||"",me=/^https:\/\/(www\.)?paypal\.me\/[^\/]+$/i.test(u),lnk=(h,t,cls)=>`<a class="btn ${cls||""}" href="${esc(h)}" target="_blank" rel="noopener noreferrer">${t}</a>`;
  $("cafeBox").innerHTML=`<div class="cafe"><div class="cup">${ic("coffee",72)}<i class="steam"></i><i class="steam"></i><i class="steam"></i></div><h3>Cómprame un café</h3>
  <p>${esc(sett.msg||"Si mis apps te gustan, puedes apoyarme con una donación. ¡Gracias por ayudarme a seguir creando!")}</p>
  ${!u?`<div class="mut">La página de donaciones estará disponible pronto.</div>`:me?`<div class="amts">${[3,5,10,20].map(a=>lnk(u+"/"+a+sett.cur,ic("coffee",15)+" "+a+" "+sett.cur)).join("")}</div>${lnk(u,"Otro monto","sec")}`:lnk(u,ic("heart",16)+" Donar con PayPal","big")}
  <div class="mut small">Serás redirigido a PayPal para completar la donación de forma segura. Las donaciones son voluntarias y no dan derecho a productos ni servicios.</div></div>`;
}
$("bSet").onclick=()=>{if(!canEdit())return;$("stErr").textContent="";$("stPay").value=sett.paypal||"";$("stCur").value=sett.cur||"USD";$("stMsg").value=sett.msg||"";dSet.showModal()};
$("fSet").onsubmit=async e=>{e.preventDefault();if(!canEdit())return;const pin=await askPin("Guardar configuración de donaciones — ingresa tu PIN");if(!pin)return;
  const r=await api("/admin/settings",{method:"PUT",pin,body:{paypal:$("stPay").value.trim(),cur:$("stCur").value,msg:$("stMsg").value}});
  if(!r.ok){if(r.s===400){$("stErr").textContent=r.j.error;return}return pinErr(r)}
  sett=r.j;dSet.close();renderCafe();toast("Donaciones actualizadas.")};


/* ---------- Sugerencias (preparan un correo) ---------- */
const MAIL="tech.studios270@gmail.com";
const SUG={error:{n:"Reportar un error",i:"alert",d:"Algo no funciona como debería.",tag:"Error"},mejora:{n:"Sugerencia",i:"bulb",d:"Una mejora para el sitio o para una app.",tag:"Sugerencia"},idea:{n:"Idea de qué crear",i:"box",d:"Propón una app, juego, mod o plugin.",tag:"Idea"}};
let sgT="error",sgV={},sgInit=false;
function devInfo(){
  const ua=navigator.userAgent,os=IOS?"iOS":/Android/.test(ua)?"Android":/Windows/.test(ua)?"Windows":/Mac OS X|Macintosh/.test(ua)?"macOS":/Linux/.test(ua)?"Linux":"Desconocido";
  const br=/Edg\//.test(ua)?"Edge":/OPR\//.test(ua)?"Opera":/Firefox\//.test(ua)?"Firefox":/Chrome\//.test(ua)?"Chrome":/Safari\//.test(ua)?"Safari":"Otro",v=(ua.match(/(?:Edg|OPR|Firefox|Chrome|Version)\/(\d+)/)||[])[1]||"";
  return os+" · "+br+(v?" "+v:"")+" · "+innerWidth+"x"+innerHeight+" · "+navigator.language;
}
const sgApps=()=>apps.filter(a=>!a.q).map(a=>a.name);
function sgFields(t){
  const who=[{k:"from",l:"Tu nombre (opcional)",t:"text",max:60},{k:"reply",l:"Tu correo para responderte (opcional)",t:"email",max:90}];
  if(t==="error")return [{k:"target",l:"¿Dónde ocurrió?",t:"select",req:1,opts:["El sitio web (en general)",...sgApps(),"Otra cosa"]},{k:"sum",l:"Resumen en una frase",t:"text",req:1,max:90,ph:"Ej: El botón de descarga no responde"},{k:"what",l:"¿Qué pasó?",t:"area",req:1,max:700},{k:"steps",l:"Pasos para reproducirlo",t:"area",max:500,ph:"1. Abrí… 2. Toqué… 3. Pasó…"},{k:"expected",l:"¿Qué esperabas que pasara?",t:"text",max:160},{k:"sev",l:"¿Qué tan grave es?",t:"select",opts:["Me impide usar el sitio","Es molesto, pero puedo seguir","Es un detalle menor"]},...who];
  if(t==="mejora")return [{k:"target",l:"¿Sobre qué?",t:"select",req:1,opts:["El sitio web (en general)","Descargas","Novedades","Sugerencias","Cómprame un café",...sgApps(),"Otra cosa"]},{k:"sum",l:"Resumen en una frase",t:"text",req:1,max:90,ph:"Ej: Poder filtrar por tamaño"},{k:"what",l:"Describe tu sugerencia",t:"area",req:1,max:800},{k:"why",l:"¿Por qué sería útil?",t:"area",max:400},{k:"prio",l:"¿Qué tanto la quieres?",t:"select",opts:["Sería genial","Me gustaría","Solo es una idea"]},...who];
  return [{k:"kind",l:"¿Qué te gustaría que cree?",t:"select",req:1,opts:["Una app","Un juego","Un mod de Minecraft Java","Un plugin de Minecraft","Un add-on de Minecraft Bedrock","Una app para Smart TV","Otra cosa"]},{k:"name",l:"Nombre tentativo (opcional)",t:"text",max:80},{k:"plats",l:"¿Para qué plataformas?",t:"plats"},{k:"what",l:"¿De qué trata? ¿Qué haría?",t:"area",req:1,max:800},{k:"refs",l:"Referencias o enlaces de ejemplo (opcional)",t:"text",max:200},{k:"help",l:"¿Quieres participar?",t:"select",opts:["Solo quiero verla cuando esté lista","Me gustaría probarla en beta","Puedo colaborar (arte, música, pruebas…)"]},...who];
}
function sgHTML(f){
  const id="sg_"+f.k,v=sgV[f.k],lab=`<label for="${id}">${f.l}${f.req?" *":""}</label>`;
  if(f.t==="area")return lab+`<textarea id="${id}" rows="4" maxlength="${f.max}" placeholder="${esc(f.ph||"")}">${esc(v||"")}</textarea>`;
  if(f.t==="select")return lab+`<select id="${id}">${f.opts.map(o=>`<option${o===v?" selected":""}>${esc(o)}</option>`).join("")}</select>`;
  if(f.t==="plats")return `<label>${f.l}</label><div class="chk" id="${id}">${Object.keys(PL).map(k=>`<label>${lg(k,15)}<span>${PL[k][0]}</span><input type="checkbox" value="${k}"${(v||[]).includes(k)?" checked":""}></label>`).join("")}</div>`;
  return lab+`<input id="${id}" type="${f.t==="email"?"email":"text"}" maxlength="${f.max}" placeholder="${esc(f.ph||"")}" value="${esc(v||"")}">`;
}
function sgDraw(){
  $("sugTypes").innerHTML=Object.entries(SUG).map(([k,s])=>`<button type="button" class="stype${k===sgT?" on":""}" data-sgt="${k}">${ic(s.i,22)}<b>${s.n}</b><span class="d">${s.d}</span></button>`).join("");
  $("sugForm").innerHTML=sgFields(sgT).map(sgHTML).join("")+`<div class="chk" style="margin-top:12px"><label><input type="checkbox" id="sg_tech"${sgV["tech_"+sgT]==null?(sgT==="error"?" checked":""):(sgV["tech_"+sgT]?" checked":"")}> Incluir información técnica de mi dispositivo</label></div><div class="hint">Ayuda a reproducir errores: sistema, navegador y tamaño de pantalla. Lo verás en la vista previa.</div>`;
  sgPrev();
}
function sgRead(){
  for(const f of sgFields(sgT)){const e=$("sg_"+f.k);if(!e)continue;sgV[f.k]=f.t==="plats"?[...e.querySelectorAll("input:checked")].map(i=>i.value):e.value}
  const t=$("sg_tech");if(t)sgV["tech_"+sgT]=t.checked;
}
function sgMsg(){
  const v=sgV,s=SUG[sgT],miss=sgFields(sgT).filter(f=>f.req&&!String(v[f.k]||"").trim()).map(f=>f.l),L=[];
  const add=(t,x)=>{x=String(x||"").trim();if(x)L.push(t?t+":\n"+x:x)};
  let subj;
  if(sgT==="idea"){subj="[Idea] "+(v.kind||"")+(v.name?": "+v.name:"");add("",["Tipo de solicitud: Idea de qué crear","Qué quiere que cree: "+(v.kind||"")+(v.name?" — "+v.name:"")].join("\n"));
    if((v.plats||[]).length)add("Plataformas",(v.plats||[]).map(k=>PL[k][0]).join(", "));add("Descripción",v.what);add("Referencias",v.refs);add("Participación",v.help)}
  else{subj="["+s.tag+"] "+(v.target||"")+" — "+(v.sum||"");add("",["Tipo de solicitud: "+s.n,"Dónde: "+(v.target||""),"Resumen: "+(v.sum||"")].join("\n"));
    if(sgT==="error"){add("¿Qué pasó?",v.what);add("Pasos para reproducirlo",v.steps);add("Lo que esperaba",v.expected);add("Gravedad",v.sev)}
    else{add("Sugerencia",v.what);add("¿Por qué sería útil?",v.why);add("Prioridad",v.prio)}}
  if(v.from||v.reply)add("Contacto",[v.from&&"Nombre: "+v.from,v.reply&&"Correo: "+v.reply].filter(Boolean).join("\n"));
  if(v["tech_"+sgT]==null?sgT==="error":v["tech_"+sgT])add("Información técnica","Dispositivo: "+devInfo()+"\nPágina: "+location.origin+"\nFecha: "+new Date().toLocaleString("es-CL"));
  L.push("—\nEnviado desde Tech Studios");
  return {subj,body:L.join("\n\n"),miss};
}
function sgPrev(){
  const m=sgMsg(),ok=!m.miss.length,e=encodeURIComponent;
  $("sugTo").textContent=MAIL;$("sugSubj").textContent=m.subj;$("sugBody").textContent=m.body;
  $("sugMail").href="mailto:"+MAIL+"?subject="+e(m.subj)+"&body="+e(m.body.replace(/\n/g,"\r\n"));
  $("sugGmail").href="https://mail.google.com/mail/?view=cm&fs=1&to="+e(MAIL)+"&su="+e(m.subj)+"&body="+e(m.body);
  ["sugMail","sugGmail","sugCopy"].forEach(i=>$(i).setAttribute("aria-disabled",ok?"false":"true"));
  $("sugWarn").textContent=!ok?"Falta completar: "+m.miss.join(", ")+".":m.body.length>1800?"Tu mensaje es largo: algunos programas de correo lo cortan. Acórtalo o usa «Copiar mensaje».":"";
  $("sugWarn").style.color=ok?"var(--mut)":"var(--bad)";
}
function initSug(){
  if(!sgInit){sgInit=true;
    $("sugTypes").onclick=e=>{const b=e.target.closest("[data-sgt]");if(!b)return;sgRead();sgT=b.dataset.sgt;sgDraw()};
    $("sugForm").addEventListener("input",()=>{sgRead();sgPrev()});$("sugForm").addEventListener("change",()=>{sgRead();sgPrev()});
    for(const [id,via] of [["sugMail","mailto"],["sugGmail","gmail"]])$(id).addEventListener("click",e=>{if($(id).getAttribute("aria-disabled")==="true"){e.preventDefault();toast("Completa los campos obligatorios (*).");return}track("suggestion_prepare",{type:sgT,via})});
    $("sugCopy").onclick=async()=>{if($("sugCopy").getAttribute("aria-disabled")==="true"){toast("Completa los campos obligatorios (*).");return}
      const m=sgMsg(),txt="Para: "+MAIL+"\nAsunto: "+m.subj+"\n\n"+m.body;
      try{await navigator.clipboard.writeText(txt)}catch(x){const t=document.createElement("textarea");t.value=txt;document.body.appendChild(t);t.select();try{document.execCommand("copy")}catch(y){}t.remove()}
      toast("Mensaje copiado. Pégalo en un correo a "+MAIL);track("suggestion_prepare",{type:sgT,via:"copy"})};
  }
  sgRead();sgDraw();
}


/* ---------- Cuestionario ---------- */
let quiz=null,qzLoaded=false,qzN=0,qDraft=[];
const qzKey=()=>quiz&&quiz.id?"ts_qz_"+quiz.id+"_"+quiz.ver:"";
const qzDone=()=>{try{return localStorage.getItem(qzKey())==="1"}catch(e){return false}};
async function loadQuiz(){const r=await api(admin?"/admin/quiz":"/quiz");if(r.ok){quiz=r.j.quiz||null;qzN=r.j.n||0;qzLoaded=true}renderQuiz()}
function renderQuiz(){
  const B=$("qzBox");$("qzTog").textContent=quiz&&quiz.active?"Cerrar cuestionario":"Abrir cuestionario";
  if(!qzLoaded){B.innerHTML=`<div class="empty">Cargando…</div>`;return}
  if(!quiz){B.innerHTML=`<div class="empty">${admin?"Aún no creaste el cuestionario. Pulsa «Editar» para empezar.":"Por ahora no hay un cuestionario abierto. ¡Vuelve pronto!"}</div>`;return}
  if(quiz.closed||(admin&&!quiz.active)){B.innerHTML=`<div class="empty">${ic("lock",40)}<h3 style="margin:10px 0 4px">${esc(quiz.title)}</h3>Este cuestionario está cerrado${admin?` (${qzN} respuestas). Pulsa «Abrir cuestionario» para recibir más.`:". ¡Gracias por tu interés!"}</div>`;return}
  if(qzDone()){B.innerHTML=qzThanks("Ya enviaste tus respuestas");return}
  B.innerHTML=`<form id="qzF" class="qzf" autocomplete="off" novalidate><div><h3>${esc(quiz.title)}</h3>${quiz.desc?`<p class="mut" style="margin:6px 0 0">${esc(quiz.desc)}</p>`:""}</div><div class="qprog"><i id="qzBar"></i></div>
  ${quiz.questions.map((Q,i)=>`<fieldset class="qq" data-q="${Q.id}" style="animation-delay:${i*70}ms"><legend><span class="qn">${i+1}</span><span>${esc(Q.t)}${Q.req?" *":""}</span></legend>${qzInput(Q)}</fieldset>`).join("")}
  <input class="hp" name="hp" tabindex="-1" autocomplete="off" aria-hidden="true">
  <label class="qcons"><input type="checkbox" id="qzCons"><span>Acepto que mis respuestas se guarden en el servidor de Tech Studios para mejorar el sitio y las apps. No incluyas datos personales sensibles. Más información en la <a href="#privacidad" data-act="legal" data-k="privacidad">Política de Privacidad</a>.</span></label>
  <div id="qzErr" class="msg"></div><button id="qzSend" class="big" style="justify-self:start;padding:13px 26px">Enviar respuestas</button></form>`;
  const f=$("qzF");f.addEventListener("input",qzProg);f.addEventListener("change",qzProg);f.onsubmit=qzSubmit;qzProg();
}
const qzThanks=t=>`<div class="qdone">${ic("check",64)}<h3>${t}</h3><p class="mut">Gracias por tomarte el tiempo. Tu opinión ayuda a mejorar Tech Studios.</p></div>`;
function qzInput(Q){
  if(Q.type==="single")return Q.opts.map((o,k)=>`<label class="qo"><input type="radio" name="q_${Q.id}" value="${k}"><span>${esc(o)}</span></label>`).join("");
  if(Q.type==="multi")return Q.opts.map((o,k)=>`<label class="qo"><input type="checkbox" name="q_${Q.id}" value="${k}"><span>${esc(o)}</span></label>`).join("");
  if(Q.type==="scale")return `<div class="qs">${[1,2,3,4,5].map(n=>`<label><input type="radio" name="q_${Q.id}" value="${n}"><span>${n}</span></label>`).join("")}</div><div class="qsl"><span>Nada</span><span>Mucho</span></div>`;
  return `<textarea name="q_${Q.id}" rows="3" maxlength="300" placeholder="Escribe tu respuesta…"></textarea>`;
}
function qzCollect(){
  const f=$("qzF"),a={};
  for(const Q of quiz.questions){
    if(Q.type==="single"||Q.type==="scale"){const c=f.querySelector(`input[name=q_${Q.id}]:checked`);if(c)a[Q.id]=+c.value}
    else if(Q.type==="multi"){const c=[...f.querySelectorAll(`input[name=q_${Q.id}]:checked`)].map(i=>+i.value);if(c.length)a[Q.id]=c}
    else{const t=f.querySelector(`textarea[name=q_${Q.id}]`).value.trim();if(t)a[Q.id]=t}
  }
  return a;
}
function qzProg(){const a=qzCollect();$("qzBar").style.width=Math.round(Object.keys(a).length/quiz.questions.length*100)+"%";document.querySelectorAll(".qq.bad").forEach(q=>{if(a[q.dataset.q]!=null)q.classList.remove("bad")})}
async function qzSubmit(e){
  e.preventDefault();const a=qzCollect(),err=$("qzErr");err.style.color="";
  const miss=quiz.questions.filter(Q=>Q.req&&a[Q.id]==null);
  document.querySelectorAll(".qq").forEach(q=>q.classList.toggle("bad",miss.some(Q=>Q.id===q.dataset.q)));
  if(miss.length){err.textContent="Responde las preguntas marcadas con *.";document.querySelector(".qq.bad").scrollIntoView({behavior:"smooth",block:"center"});return}
  if(!Object.keys(a).length){err.textContent="Responde al menos una pregunta.";return}
  if(!$("qzCons").checked){err.textContent="Marca la casilla de consentimiento para enviar.";return}
  $("qzSend").disabled=true;err.style.color="var(--a)";err.textContent="Enviando…";
  const r=await api("/quiz/submit",{method:"POST",auth:false,body:{ver:quiz.ver,answers:a,consent:true,hp:document.querySelector("#qzF .hp").value}});
  $("qzSend").disabled=false;
  if(r.ok){try{localStorage.setItem(qzKey(),"1")}catch(x){}track("quiz_submit");$("qzBox").innerHTML=qzThanks("¡Respuestas enviadas!");return}
  err.style.color="";err.textContent=r.s===409?"El cuestionario cambió. Recargando…":r.j.error||"No se pudo enviar. Intenta de nuevo.";
  if(r.s===409)setTimeout(loadQuiz,1200);
  if(r.s===429){try{localStorage.setItem(qzKey(),"1")}catch(x){}setTimeout(renderQuiz,1500)}
}
/* --- editor (admin) --- */
const QT={single:"Una opción",multi:"Varias opciones",scale:"Escala 1 a 5",text:"Respuesta escrita"};
function qdDraw(){
  $("qList").innerHTML=qDraft.map((q,i)=>`<div class="qedit" data-i="${i}"><div class="qh"><b>Pregunta ${i+1}</b><button type="button" class="sec" data-qa="up" ${i?"":"disabled"}>↑</button><button type="button" class="sec" data-qa="down" ${i<qDraft.length-1?"":"disabled"}>↓</button><button type="button" class="bad" data-qa="del">✕</button></div>
  <input data-f="t" maxlength="200" placeholder="Escribe la pregunta" value="${esc(q.t)}">
  <div class="row"><div><select data-f="type">${Object.entries(QT).map(([k,n])=>`<option value="${k}"${q.type===k?" selected":""}>${n}</option>`).join("")}</select></div><div class="chk" style="align-self:center"><label><input type="checkbox" data-f="req"${q.req?" checked":""}> Obligatoria</label></div></div>
  ${q.type==="single"||q.type==="multi"?`<textarea data-f="opts" rows="4" placeholder="Una opción por línea (de 2 a 6)">${esc(q.opts)}</textarea>`:""}</div>`).join("");
  $("qCount").textContent="("+qDraft.length+"/7)";$("qAdd").disabled=qDraft.length>=7;
}
$("qList").addEventListener("input",e=>{const f=e.target.dataset.f;if(!f)return;const i=+e.target.closest(".qedit").dataset.i;qDraft[i][f]=f==="req"?e.target.checked:e.target.value});
$("qList").addEventListener("change",e=>{if(e.target.dataset.f==="type"||e.target.dataset.f==="req"){const i=+e.target.closest(".qedit").dataset.i;qDraft[i][e.target.dataset.f]=e.target.dataset.f==="req"?e.target.checked:e.target.value;if(e.target.dataset.f==="type")qdDraw()}});
$("qList").addEventListener("click",e=>{const b=e.target.closest("[data-qa]");if(!b)return;const i=+b.closest(".qedit").dataset.i,a=b.dataset.qa;
  if(a==="del")qDraft.splice(i,1);else if(a==="up"&&i>0)qDraft.splice(i-1,0,...qDraft.splice(i,1));else if(a==="down"&&i<qDraft.length-1)qDraft.splice(i+1,0,...qDraft.splice(i,1));qdDraw()});
$("qAdd").onclick=()=>{if(qDraft.length<7){qDraft.push({t:"",type:"single",req:true,opts:""});qdDraw()}};
$("qzEdit").onclick=()=>{
  if(!canEdit())return;$("qErr").textContent="";
  $("qTitle").value=quiz&&quiz.title||"";$("qDesc").value=quiz&&quiz.desc||"";$("qActive").checked=quiz?!!quiz.active:true;
  qDraft=quiz&&quiz.questions?quiz.questions.map(q=>({t:q.t,type:q.type,req:q.req,opts:(q.opts||[]).join("\n")})):[{t:"",type:"single",req:true,opts:""}];
  qdDraw();dQ.showModal();
};
function qdBody(){return{title:$("qTitle").value,desc:$("qDesc").value,active:$("qActive").checked,questions:qDraft.map(q=>({t:q.t,type:q.type,req:q.req,opts:q.type==="single"||q.type==="multi"?String(q.opts||"").split("\n").map(x=>x.trim()).filter(Boolean):[]}))}}
$("fQ").onsubmit=async e=>{
  e.preventDefault();if(!canEdit())return;const b=qdBody(),err=$("qErr");err.style.color="";
  if(!b.title.trim()){err.textContent="Pon un título.";return}
  if(!b.questions.length){err.textContent="Agrega al menos una pregunta.";return}
  for(const [i,q] of b.questions.entries()){if(!q.t.trim()){err.textContent="La pregunta "+(i+1)+" está vacía.";return}if((q.type==="single"||q.type==="multi")&&(q.opts.length<2||q.opts.length>6)){err.textContent="La pregunta "+(i+1)+" necesita de 2 a 6 opciones (una por línea).";return}}
  let r=await api("/admin/quiz",{method:"PUT",body:{quiz:b}});
  if(r.s===409&&r.j.error==="reset"){
    if(!confirm("Cambiar las preguntas borrará las "+r.j.n+" respuestas actuales. ¿Ya descargaste el CSV? Pulsa Aceptar para continuar y borrarlas."))return;
    const pin=await askPin("Cambiar preguntas y borrar respuestas — ingresa tu PIN");if(!pin)return;
    r=await api("/admin/quiz",{method:"PUT",pin,body:{quiz:b,confirmReset:true}});
  }
  if(!r.ok){if(r.s===400||r.s===423){err.textContent=r.j.error||"No se pudo guardar.";return}return pinErr(r)}
  dQ.close();await loadQuiz();toast("Cuestionario guardado.");
};
$("qzTog").onclick=async()=>{if(!canEdit())return;if(!quiz||quiz.closed){toast("Primero crea el cuestionario.");return}
  const r=await api("/admin/quiz-active",{method:"POST",body:{active:!quiz.active}});if(!r.ok){toast(r.j.error||"No se pudo cambiar.");return}await loadQuiz();toast(quiz.active?"Cuestionario abierto.":"Cuestionario cerrado.")};
/* --- resultados (admin) --- */
let qrData=null;
$("qzRes").onclick=async()=>{
  if(!admin)return;const r=await api("/admin/quiz");if(!r.ok||!r.j.quiz){toast("Aún no hay cuestionario.");return}
  qrData=r.j;const q=r.j.quiz,R=r.j.results;
  $("qrBody").innerHTML=`<p class="mut">${esc(q.title)} · ${R.n} respuesta${R.n===1?"":"s"} · ${q.active?"abierto":"cerrado"}</p>`+q.questions.map((Q,i)=>{
    const it=R.items[i],head=`<h4>${i+1}. ${esc(Q.t)} <span class="mut">(${it.answered} respondieron)</span></h4>`;
    if(Q.type==="text")return `<div class="qrq">${head}${it.texts.length?it.texts.map(t=>`<div class="qtxt"><small>${fdate(t.ts)}</small>${esc(t.text)}</div>`).join(""):`<div class="mut">Sin respuestas todavía.</div>`}</div>`;
    const labels=Q.type==="scale"?[1,2,3,4,5].map(n=>String(n)):Q.opts,tot=Math.max(1,it.answered);
    return `<div class="qrq">${head}${Q.type==="scale"&&it.answered?`<div class="mut" style="margin-bottom:6px">Promedio: <b style="color:var(--a)">${String(it.avg).replace(".",",")}</b> de 5</div>`:""}${labels.map((l,k)=>`<div class="qbar"><span>${esc(l)}</span><div class="t"><i data-w="${Math.round(it.counts[k]/tot*100)}"></i></div><span>${it.counts[k]} · ${Math.round(it.counts[k]/tot*100)}%</span></div>`).join("")}</div>`}).join("");
  dQR.showModal();requestAnimationFrame(()=>requestAnimationFrame(()=>document.querySelectorAll("#qrBody .qbar i").forEach(i=>i.style.width=i.dataset.w+"%")));
};
const csvCell=v=>{let s=String(v==null?"":v);if(/^[=+\-@\t\r]/.test(s))s="'"+s;return '"'+s.replace(/"/g,'""')+'"'};
$("qrCsv").onclick=async()=>{
  const r=await api("/admin/quiz-responses");if(!r.ok||!r.j.quiz){toast("No hay datos para exportar.");return}
  const q=r.j.quiz,rows=[["Fecha",...q.questions.map(Q=>Q.t)]];
  for(const x of r.j.responses)rows.push([new Date(x.ts).toLocaleString("es-CL"),...q.questions.map(Q=>{const v=x.a[Q.id];if(v==null)return "";if(Q.type==="single")return Q.opts[v];if(Q.type==="multi")return v.map(i=>Q.opts[i]).join(" | ");return v})]);
  const a=document.createElement("a");a.href=URL.createObjectURL(new Blob(["\ufeff"+rows.map(r=>r.map(csvCell).join(",")).join("\r\n")],{type:"text/csv;charset=utf-8"}));a.download="respuestas-cuestionario.csv";a.click();toast("CSV descargado.");
};
$("qrDel").onclick=async()=>{if(!canEdit())return;if(!confirm("Se borrarán todas las respuestas actuales. ¿Descargaste el CSV? Esta acción no se puede deshacer."))return;
  const pin=await askPin("Borrar respuestas — ingresa tu PIN");if(!pin)return;const r=await api("/admin/quiz-reset",{method:"POST",pin});if(!r.ok)return pinErr(r);dQR.close();await loadQuiz();toast("Respuestas borradas.")};

/* ---------- Cuenta regresiva de estrenos ---------- */
setInterval(()=>{document.querySelectorAll(".cd").forEach(e=>{
  const t=+e.dataset.ts-Date.now();
  if(t<=0){if(!e.dataset.done){e.dataset.done=1;e.textContent="¡Ya disponible!";setTimeout(()=>load().then(render),1500)}return}
  const d=Math.floor(t/864e5),h=Math.floor(t%864e5/36e5),m=Math.floor(t%36e5/6e4),s=Math.floor(t%6e4/1e3);
  e.innerHTML=`<span><b>${d}</b>días</span><span><b>${h}</b>horas</span><span><b>${m}</b>min</span><span><b>${s}</b>seg</span>`})},1000);

/* ---------- Efectos: tilt 3D, resplandor y partículas (según dispositivo) ---------- */
let mx=innerWidth/2,my=innerHeight/3,tiltRaf=0,tiltEv=null,glowRaf=0;
const tiltOn=()=>fxLevel==="full"&&HOVQ.matches&&!RMQ.matches;
$("grid").addEventListener("pointermove",e=>{
  if(!tiltOn())return;tiltEv=e;if(tiltRaf)return;
  tiltRaf=requestAnimationFrame(()=>{tiltRaf=0;const ev=tiltEv,c=ev.target.closest&&ev.target.closest(".card");if(!c)return;
    const r=c.getBoundingClientRect(),x=(ev.clientX-r.left)/r.width,y=(ev.clientY-r.top)/r.height;
    c.style.setProperty("--ry",(x-.5)*10+"deg");c.style.setProperty("--rx",(.5-y)*10+"deg");c.style.setProperty("--mx",x*100+"%");c.style.setProperty("--my",y*100+"%")});
},{passive:true});
$("grid").addEventListener("pointerout",e=>{const c=e.target.closest(".card");if(c){c.style.setProperty("--rx","0deg");c.style.setProperty("--ry","0deg")}});
addEventListener("pointermove",e=>{
  mx=e.clientX;my=e.clientY;if(fxLevel!=="full"||!HOVQ.matches||glowRaf)return;
  glowRaf=requestAnimationFrame(()=>{glowRaf=0;$("glow").style.left=mx+"px";$("glow").style.top=my+"px"});
},{passive:true});
fxRestart=(()=>{
  const cv=$("fx"),g=cv.getContext("2d");let W=0,H=0,P=[],raf=0,tm=0,link=120;
  const cfg=()=>fxLevel==="full"?{n:90,dpr:Math.min(window.devicePixelRatio||1,1.5),link:120}:fxLevel==="mid"?{n:34,dpr:1,link:100}:{n:0,dpr:1,link:0};
  function size(){
    const c=cfg();link=c.link;if(!c.n||RMQ.matches){P=[];g.clearRect(0,0,cv.width||1,cv.height||1);return}
    W=innerWidth;H=innerHeight;cv.width=Math.round(W*c.dpr);cv.height=Math.round(H*c.dpr);cv.style.width=W+"px";cv.style.height=H+"px";g.setTransform(c.dpr,0,0,c.dpr,0,0);
    P=Array.from({length:Math.min(c.n,Math.floor(W*H/16000))},()=>({x:Math.random()*W,y:Math.random()*H,vx:(Math.random()-.5)*.35,vy:(Math.random()-.5)*.35}));
  }
  function draw(){
    g.clearRect(0,0,W,H);g.fillStyle="#00e5ffaa";
    for(const p of P){p.x+=p.vx;p.y+=p.vy;if(p.x<0||p.x>W)p.vx*=-1;if(p.y<0||p.y>H)p.vy*=-1;
      const dx=mx-p.x,dy=my-p.y;if(dx*dx+dy*dy<25600){p.x+=dx*.004;p.y+=dy*.004}
      g.beginPath();g.arc(p.x,p.y,1.4,0,7);g.fill()}
    const L2=link*link;
    for(let i=0;i<P.length;i++)for(let j=i+1;j<P.length;j++){const dx=P[i].x-P[j].x,dy=P[i].y-P[j].y,d2=dx*dx+dy*dy;
      if(d2<L2){g.strokeStyle=`rgba(138,92,255,${.35*(1-Math.sqrt(d2)/link)})`;g.beginPath();g.moveTo(P[i].x,P[i].y);g.lineTo(P[j].x,P[j].y);g.stroke()}}
  }
  function loop(){
    raf=0;tm=0;if(!P.length)return;
    if(document.hidden||document.querySelector("dialog[open]")){tm=setTimeout(loop,500);return}
    draw();raf=requestAnimationFrame(loop);
  }
  return ()=>{cancelAnimationFrame(raf);clearTimeout(tm);size();if(P.length)loop()};
})();
fxRestart();perfProbe();
/* ---------- Documentos legales ---------- */
const EMP={mail:"tech.studios270@gmail.com"},UPD="15 de octubre de 2026";
const WHO=`<p><b>Titular del sitio:</b> Tech Studios (contacto: ${EMP.mail}), en adelante «Tech Studios».</p>`;
const LD={
privacidad:["Política de Privacidad",()=>WHO+`
<h3>1. Marco legal</h3><p>Esta política se rige por el artículo 19 N° 4 de la Constitución Política de la República, la Ley N° 19.628 sobre Protección de la Vida Privada y la Ley N° 21.719, que regula la protección y el tratamiento de los datos personales y crea la Agencia de Protección de Datos Personales (publicada el 13 de diciembre de 2024; su entrada en vigencia está fijada para el 1 de diciembre de 2026, sin perjuicio de eventuales modificaciones legislativas). Se complementa con la Ley N° 19.496 sobre Protección de los Derechos de los Consumidores y la Ley N° 21.430 sobre Garantías y Protección Integral de los Derechos de la Niñez y Adolescencia.</p>
<h3>2. Datos que tratamos</h3><ul><li>Visitantes: el sitio no exige registro ni usa publicidad. Solo si aceptas las cookies de analítica, usamos Google Analytics 4 (Google LLC) para medir el uso del sitio de forma agregada (páginas vistas, descargas, país aproximado, tipo de dispositivo); Google puede tratar tu dirección IP y un identificador en cookies, incluso fuera de Chile. Puedes rechazar o retirar tu consentimiento cuando quieras desde «Preferencias de cookies», en el pie de página; sin tu consentimiento no se carga Google Analytics. Al descargar una App, nuestro servidor suma un contador agregado de descargas por app y plataforma y calcula un identificador anónimo (resumen criptográfico irreversible, con sal, de tu dirección IP) que se usa solo para evitar conteos duplicados y abusos; no guardamos tu dirección IP en texto claro en ese registro. El proveedor de alojamiento puede registrar datos técnicos de conexión (dirección IP, fecha y hora, navegador) por razones de seguridad y operación.</li><li>Preferencias guardadas en tu propio dispositivo (por ejemplo, el estilo visual). No se envían a nuestros servidores.</li><li>Cuestionario: si lo respondes, guardamos tus respuestas (incluido el texto libre que escribas) en nuestro servidor, con tu consentimiento, para mejorar el sitio y decidir qué crear. No pedimos tu nombre ni tu correo; usamos un identificador anónimo derivado de tu IP solo para evitar envíos repetidos. Conservamos las últimas 500 respuestas mientras el cuestionario esté vigente. Si quieres que eliminemos una respuesta, escríbenos indicando su contenido aproximado y la fecha. No incluyas datos sensibles.</li><li>Si nos escribes, tratamos tu correo y el contenido del mensaje. La pestaña «Sugerencias» no envía nada a nuestros servidores: prepara un correo en tu propia aplicación o en Gmail y tú decides si lo mandas; si incluyes información técnica de tu dispositivo (opcional), viaja solo dentro de ese correo, hacia tech.studios270@gmail.com.</li></ul>
<h3>3. Finalidades y licitud</h3><p>Operar y proteger el sitio, atender consultas y reclamos, cumplir obligaciones legales y, solo con tu consentimiento, medir el uso del sitio (analítica). Tratamos datos con tu consentimiento, para atender lo que solicitas, por obligación legal o por interés legítimo (seguridad), según corresponda.</p>
<h3>4. Tus derechos</h3><p>Conforme a la Ley N° 19.628 puedes solicitar información, modificación, cancelación y bloqueo de tus datos. Desde la vigencia de la Ley N° 21.719 también podrás ejercer los derechos de acceso, rectificación, supresión, oposición, portabilidad y bloqueo temporal del tratamiento. Escríbenos a ${EMP.mail} y responderemos dentro de los plazos legales. Podrás reclamar ante la Agencia de Protección de Datos Personales o la autoridad competente.</p>
<h3>5. Comunicación y transferencias</h3><p>No vendemos datos personales. Podemos compartirlos con proveedores de infraestructura (alojamiento y almacenamiento de archivos) que actúan por nuestra cuenta, incluso fuera de Chile, con resguardos adecuados, y con autoridades cuando la ley o una orden judicial lo exijan. Si decides donar, PayPal trata tus datos como responsable independiente, según sus propias políticas; nuestro sitio solo te redirige a su página. Si aceptas la analítica, Google Analytics recibe datos de uso de tu navegador y puede transferirlos fuera de Chile, incluyendo Estados Unidos. Si pulsas «Ver tráiler» en un video de YouTube, se carga el reproductor de YouTube (Google LLC, dominio youtube-nocookie.com), que puede tratar tus datos según su política; no se carga hasta que lo solicitas.</p>
<h3>6. Conservación y seguridad</h3><p>Conservamos los datos solo por el tiempo necesario para las finalidades indicadas o el plazo que exija la ley. Aplicamos medidas técnicas y organizativas razonables (ver «Seguridad»).</p>
<h3>7. Menores de edad</h3><p>El sitio no está dirigido a menores de 14 años. Si eres su padre, madre o representante legal y crees que nos entregaron datos de un menor, contáctanos para eliminarlos.</p>
<h3>8. Cambios</h3><p>Podemos actualizar esta política; publicaremos la versión vigente con su fecha.</p>`],
terminos:["Términos de Uso",()=>WHO+`
<h3>1. Aceptación</h3><p>Al usar este sitio aceptas estos Términos, que se interpretan conforme a la legislación chilena, en especial el Código Civil, la Ley N° 19.496 y la Ley N° 19.799 sobre documentos electrónicos y firma electrónica, que reconoce validez a la aceptación por medios electrónicos.</p>
<h3>2. Uso permitido</h3><p>Puedes navegar el catálogo y descargar las Apps para uso personal y lícito. Está prohibido: intentar acceder sin autorización a áreas de administración; alterar, sobrecargar o vulnerar el sitio; distribuir malware; o usar el sitio para infringir derechos de terceros. Estas conductas pueden constituir delitos conforme a la Ley N° 21.459 sobre delitos informáticos.</p>
<h3>3. Contenido y propiedad intelectual</h3><p>El sitio, su diseño, marcas, logotipos y Apps están protegidos por la Ley N° 17.336 sobre Propiedad Intelectual y la Ley N° 19.039 sobre Propiedad Industrial. Los logotipos y marcas de plataformas (Windows, macOS, Linux, Android, iOS, LG webOS, Samsung Tizen, Meta Quest, Minecraft, entre otras) pertenecen a sus respectivos titulares y se usan solo para indicar compatibilidad.</p>
<h3>4. Disponibilidad y enlaces de terceros</h3><p>No garantizamos disponibilidad ininterrumpida. Podemos suspender descargas o el sitio por motivos de seguridad o mantenimiento. Los enlaces a sitios de terceros se rigen por las condiciones de esos sitios.</p>
<h3>5. Responsabilidad</h3><p>En la medida permitida por la ley, Tech Studios no responde por daños indirectos derivados del uso del sitio. Nada de lo aquí dispuesto limita los derechos irrenunciables del consumidor (art. 4 de la Ley N° 19.496) ni la responsabilidad que la ley no permita excluir.</p>
<h3>6. Ley aplicable y jurisdicción</h3><p>Rige la ley chilena. Para controversias se someten a los tribunales ordinarios de justicia con competencia en la ciudad de Santiago, sin perjuicio de la competencia de los Juzgados de Policía Local en materias de consumo y del derecho a acudir al SERNAC.</p>
<h3>7. Donaciones</h3><p>La sección «Cómprame un café» permite hacer aportes voluntarios a través de PayPal. Son donaciones libres: no constituyen la compra de un producto o servicio ni otorgan beneficios, y se rigen además por los términos de PayPal, un tercero independiente que procesa el pago. Tech Studios no recibe ni almacena tus datos de tarjeta o de pago.</p><h3>8. Modificaciones</h3><p>Podemos modificar estos Términos; la versión vigente será la publicada en este sitio.</p>`],
condiciones:["Condiciones de Descarga e Instalación",()=>WHO+`
<h3>1. Alcance</h3><p>Estas condiciones regulan la descarga e instalación de las Apps y contenidos (Windows 11, macOS, Linux, Android, iOS (PWA), web, Smart TV, realidad virtual y mods, plugins y add-ons de Minecraft) publicados en este sitio. Cada ficha puede indicar condiciones adicionales (precio, requisitos, versión).</p>
<h3>2. Fuente y verificación</h3><ul><li>Descarga las Apps solo desde los botones oficiales de este sitio. Tech Studios no se responsabiliza por copias obtenidas desde otras fuentes.</li><li>En Windows, el sistema puede mostrar advertencias para software de editores nuevos; verifica el nombre del editor antes de continuar.</li><li>En Android, instalar archivos APK fuera de una tienda oficial exige habilitar fuentes desconocidas; hazlo solo para apps en las que confíes y desactívalo después.</li><li>En iOS, las Apps se ofrecen como PWA: se abren en el navegador y pueden añadirse a la pantalla de inicio.</li><li>En Smart TV (LG webOS, Samsung Tizen, Android TV) y en dispositivos de realidad virtual puede requerirse el modo desarrollador o una instalación manual; hazlo bajo tu responsabilidad y solo con archivos de este sitio.</li><li>Los mods, plugins y add-ons de Minecraft son contenido no oficial de terceros, no aprobado ni asociado a Mojang Studios ni a Microsoft. Antes de instalar, respalda tus mundos y verifica la versión del juego y del cargador (Forge, Fabric, NeoForge, Spigot, Paper, etc.). Instalar plugins en un servidor es responsabilidad de su administrador.</li></ul>
<h3>3. Requisitos y compatibilidad</h3><p>Es responsabilidad del usuario verificar que su dispositivo cumple los requisitos indicados. Respaldar tus datos antes de instalar es una buena práctica.</p>
<h3>4. Apps de pago y derechos del consumidor</h3><p>Si una App tiene precio, rigen los derechos de la Ley N° 19.496, incluyendo cuando corresponda el derecho a retracto en contratos a distancia (art. 3 bis) y la garantía legal (arts. 20 y 21). Los derechos irrenunciables del consumidor no pueden ser limitados por estas condiciones.</p>
<h3>5. Bloqueos de seguridad</h3><p>Tech Studios puede bloquear temporalmente las descargas si detecta un riesgo de seguridad. Durante el bloqueo no se debe instalar ninguna copia descargada previamente de dudosa procedencia.</p>
<h3>6. Reclamos</h3><p>Escribe a ${EMP.mail}. Si no obtienes respuesta satisfactoria, puedes acudir al SERNAC o a los Juzgados de Policía Local.</p>`],
acuerdo:["Acuerdo Legal",()=>WHO+`
<h3>1. Documentos que lo integran</h3><p>Forman un solo acuerdo entre tú y Tech Studios: Términos de Uso, Política de Privacidad, Condiciones de Descarga e Instalación, EULA, Política de Cookies y Almacenamiento, Propiedad Intelectual y Seguridad. En caso de contradicción prevalece el documento más específico para la materia.</p>
<h3>2. Aceptación electrónica</h3><p>Aceptas estos documentos al usar el sitio o instalar una App. Conforme a la Ley N° 19.799, los actos y contratos celebrados por medios electrónicos tienen igual validez que los realizados por escrito.</p>
<h3>3. Derechos del consumidor</h3><p>Este acuerdo es compatible con la Ley N° 19.496. Cualquier cláusula que contravenga derechos irrenunciables del consumidor o sea abusiva en los términos del artículo 16 de esa ley se tendrá por no escrita, sin afectar el resto.</p>
<h3>4. Datos personales</h3><p>El tratamiento de datos se rige por la Ley N° 19.628 y la Ley N° 21.719 y por nuestra Política de Privacidad.</p>
<h3>5. Divisibilidad, no renuncia y cesión</h3><p>Si una cláusula fuera inválida, las demás siguen vigentes. La falta de ejercicio de un derecho no implica renuncia. Tech Studios puede ceder este acuerdo a un sucesor; el usuario no puede ceder el suyo sin autorización.</p>
<h3>6. Fuerza mayor</h3><p>Ninguna parte responde por incumplimientos causados por caso fortuito o fuerza mayor (artículo 45 del Código Civil).</p>
<h3>7. Ley y jurisdicción</h3><p>Se rige por las leyes de Chile. Las partes se someten a los tribunales ordinarios de justicia de Santiago, sin perjuicio de la competencia de los Juzgados de Policía Local en materias de consumo.</p>`],
eula:["Acuerdo de Licencia de Usuario Final (EULA)",()=>WHO+`
<h3>1. Licencia</h3><p>Tech Studios te otorga una licencia limitada, personal, no exclusiva, intransferible y revocable para instalar y usar cada App en tus dispositivos, para fines lícitos y según este EULA. Las Apps se licencian, no se venden.</p>
<h3>2. Restricciones</h3><p>Salvo en los casos expresamente autorizados por la Ley N° 17.336, no puedes: copiar o distribuir las Apps; modificarlas, descompilarlas o realizar ingeniería inversa; eliminar avisos de propiedad; sublicenciar, alquilar o revender; ni eludir medidas técnicas de protección.</p>
<h3>3. Propiedad</h3><p>Las Apps, su código, arte, sonidos, marcas y demás contenidos son de Tech Studios o de sus licenciantes y están protegidos por la Ley N° 17.336 y la Ley N° 19.039. Esta licencia no transfiere derechos de propiedad.</p>
<h3>4. Componentes de terceros</h3><p>Las Apps pueden incluir componentes de terceros (por ejemplo, motores o bibliotecas) sujetos a sus propias licencias, que prevalecen respecto de esos componentes.</p>
<h3>5. Actualizaciones</h3><p>Podemos ofrecer actualizaciones, que se regirán por este EULA salvo que se indique otra cosa.</p>
<h3>6. Garantías y responsabilidad</h3><p>En la medida permitida por la ley, las Apps se entregan «tal como están», sin garantías adicionales a las legales, y Tech Studios no responde por daños indirectos o pérdida de datos. Esto no limita los derechos irrenunciables de la Ley N° 19.496 ni la responsabilidad que no pueda excluirse por ley.</p>
<h3>7. Datos</h3><p>El tratamiento de datos se rige por la Política de Privacidad (Ley N° 19.628 y Ley N° 21.719).</p>
<h3>8. Terminación</h3><p>La licencia termina si incumples este EULA. Debes entonces dejar de usar y eliminar las copias de la App.</p>
<h3>9. Ley aplicable</h3><p>Rige la ley chilena y la jurisdicción indicada en el Acuerdo Legal.</p>`],
cookies:["Política de Cookies y Almacenamiento Local",()=>WHO+`
<h3>1. Qué usamos</h3><p>Por defecto este sitio no usa cookies de seguimiento ni publicidad. Emplea almacenamiento local del navegador (localStorage y sessionStorage) necesario para su funcionamiento y, solo si lo aceptas, cookies de analítica:</p>
<ul><li><b>Preferencias:</b> estilo visual elegido (Neón o Liquid Glass), el nivel de efectos visuales, tu decisión sobre las cookies de analítica si ya viste el tutorial de bienvenida, si cerraste el aviso de instalación en iOS y si ya respondiste el cuestionario.</li><li><b>Cookies de analítica (opcionales):</b> si las aceptas, Google Analytics 4 (Google LLC) instala cookies como «_ga» y «_ga_…» para distinguir visitantes y medir el uso del sitio (páginas vistas, descargas, país aproximado, tipo de dispositivo). Google indica que pueden durar hasta 2 años. No usamos funciones publicitarias. Puedes rechazarlas o retirarlas cuando quieras desde «Preferencias de cookies», en el pie de página.</li><li><b>Sesión del administrador:</b> token de sesión temporal (sessionStorage) que caduca en minutos. El catálogo y los contadores de descargas se guardan en el servidor, no en tu navegador.</li></ul>
<h3>2. Terceros</h3><p>Solo si aceptas la analítica cargamos el script de Google Analytics (Google LLC), que puede tratar datos de tu navegador y transferirlos fuera de Chile, incluyendo Estados Unidos. Solo si pulsas «Ver tráiler» en un video de YouTube cargamos su reproductor (Google LLC, youtube-nocookie.com). Las imágenes, videos y archivos de las apps se sirven desde nuestros proveedores de almacenamiento. No cargamos otros scripts ni fuentes de terceros. Además, el proveedor de alojamiento puede registrar datos técnicos de conexión (ver Política de Privacidad).</p>
<h3>3. Control</h3><p>Puedes retirar tu consentimiento en cualquier momento desde «Preferencias de cookies» y borrar estos datos desde la configuración de tu navegador. Hacerlo restablece tus preferencias. Su tratamiento se rige por la Ley N° 19.628 y la Ley N° 21.719.</p>`],
propiedad:["Propiedad Intelectual y Retiro de Contenido",()=>WHO+`
<h3>1. Protección</h3><p>Las obras, programas computacionales, diseños y marcas de este sitio están protegidos por la Ley N° 17.336 sobre Propiedad Intelectual y la Ley N° 19.039 sobre Propiedad Industrial. Queda prohibida su reproducción o uso no autorizado.</p>
<h3>2. Marcas de terceros</h3><p>Windows, macOS, Linux, Android, iOS, LG, Samsung, Meta Quest, Minecraft y otras marcas mencionadas pertenecen a sus titulares y se usan solo con fines descriptivos, sin implicar afiliación ni patrocinio. Minecraft es una marca de Mojang Studios (Microsoft); los mods, plugins y add-ons publicados aquí son contenido no oficial.</p>
<h3>3. Aviso de infracción</h3><p>Si crees que un contenido de este sitio infringe tus derechos, escribe a ${EMP.mail} indicando: tu identidad y contacto; la obra protegida y prueba de tu titularidad o representación; la ubicación exacta del contenido; y una declaración de buena fe. Revisaremos el aviso y, cuando corresponda, retiraremos o bloquearemos el contenido, conforme al régimen de limitación de responsabilidad de los prestadores de servicios de la Ley N° 17.336 (artículos 85 L y siguientes) y a las órdenes judiciales.</p>
<h3>4. Contraaviso</h3><p>Si el contenido fue retirado y consideras que fue un error, puedes enviarnos un contraaviso fundado; actuaremos según la ley y lo que resuelvan los tribunales.</p>
<h3>5. Reincidencia</h3><p>Podremos suspender el acceso de quienes infrinjan de forma reiterada derechos de terceros.</p>`],
seguridad:["Seguridad y Divulgación Responsable",()=>WHO+`
<h3>1. Medidas</h3><p>Aplicamos medidas razonables para proteger el sitio, entre ellas: política de seguridad de contenido (CSP), cabeceras de seguridad HTTP, cifrado en tránsito (HTTPS), control de acceso del administrador con bloqueo por intentos fallidos, caducidad de sesión y confirmación con PIN para acciones críticas, validación de datos y un mecanismo de bloqueo de descargas ante incidentes. Ninguna medida elimina todo riesgo.</p>
<h3>2. Marco legal</h3><p>La Ley N° 21.459 sanciona los delitos informáticos (como el acceso ilícito, la interceptación ilícita y el ataque a la integridad de sistemas), y la Ley N° 21.663 (Ley Marco de Ciberseguridad) establece el marco institucional de la ciberseguridad en Chile. Los datos personales se protegen conforme a la Ley N° 19.628 y la Ley N° 21.719.</p>
<h3>3. Reporte de vulnerabilidades</h3><p>Si encuentras una vulnerabilidad, escribe a ${EMP.mail} con los detalles para reproducirla. Pedimos que no accedas a datos de terceros, no degrades el servicio, no hagas pruebas destructivas y nos des un plazo razonable para corregirla antes de divulgarla. Tech Studios no iniciará acciones por reportes hechos de buena fe bajo estas reglas, sin perjuicio de lo que la ley disponga.</p>
<h3>4. Incidentes</h3><p>Si ocurre un incidente que afecte datos personales o descargas, tomaremos medidas de contención, podremos bloquear temporalmente las descargas y informaremos a los afectados y autoridades cuando la ley lo exija.</p>`]};
function openLegal(k){const d=LD[k];if(!d)return;$("lgBody").innerHTML=`<h2>${d[0]}</h2><div class="mut">Última actualización: ${UPD}</div><div class="lgb">${d[1]()}</div>`;if(!dLegal.open)dLegal.showModal();dLegal.scrollTop=0;try{history.replaceState(null,"","#"+k)}catch(e){}}
dLegal.onclose=()=>{try{history.replaceState(null,"",location.pathname)}catch(e){}};
document.addEventListener("click",e=>{const b=e.target.closest("[data-act]");if(!b)return;const a=b.dataset.act;if(b.tagName==="A")e.preventDefault();
  if(a==="close")$(b.dataset.d).close();else if(a==="legal")openLegal(b.dataset.k);
  else if(a==="edit")window.editApp(b.dataset.id);else if(a==="del")window.delApp(b.dataset.id);else if(a==="q")window.togQ(b.dataset.id);else if(a==="tour")openTour();else if(a==="fx")cycleFx();else if(a==="gotab"){dTour.close();setTab(b.dataset.tab)}else if(a==="consent")showConsent();else if(a==="spoil")b.closest(".spoil").classList.add("open");else if(a==="pedit")editPost(b.dataset.id);else if(a==="pdel")delPost(b.dataset.id)});
if(LD[location.hash.slice(1)])openLegal(location.hash.slice(1));

const setLiquid=v=>{document.body.classList.toggle("liquid",v);document.documentElement.classList.toggle("lq",v);$("bStyle").innerHTML=v?ic("palette",16)+" Neón":ic("drop",16)+" Liquid Glass";try{localStorage.setItem("ts_style",v?"liquid":"neon")}catch(e){}};
if(window.chrome)document.documentElement.classList.add("refract");
$("bStyle").onclick=()=>setLiquid(!document.body.classList.contains("liquid"));
let _st=null;try{_st=localStorage.getItem("ts_style")}catch(e){}
setLiquid(_st!=="neon");
ui();
setTab((TABS.find(t=>"#"+t[3]===location.hash)||TABS[0])[0],false);
load().then(()=>{ui();firstVisit()});
const softRefresh=async()=>{if(document.hidden)return;const s=sigOf();if(await load()&&sigOf()!==s)applyLock()};
setInterval(softRefresh,300000);
document.addEventListener("visibilitychange",()=>{if(!document.hidden&&Date.now()-lastLoadT>120000)softRefresh()});

