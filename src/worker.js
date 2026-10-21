// Tech Studios · API y servidor (Cloudflare Workers + D1)
// ¡Mantén este repositorio PRIVADO! Aquí viven los hashes de acceso.
import { createHmac, createHash, randomUUID, timingSafeEqual } from "node:crypto";
import { sigv4Presign, enc } from "./sigv4.js";
let ENV = {}; // variables y base de datos de Cloudflare (se asignan en cada solicitud)

const CFG = {
  HASH: "eec1bef54f8294b74223e78078ce1b3116b246ee23df4c184ee2bea501dd8586", SALT: "techstudios-store-v1",
  PHASH: "49aeba0b8ba0a5702282e64d7392c6cd9d9b1479e371042e59e31d8997105612", PSALT: "techstudios-pin-v1",
  UHASH: "a2bb64ed60130e5043d915197cf5467ee88d544a6717455082ae27c5a7f0957f", USALT: "techstudios-unlock-v1",
};
const PLAT = ["win","mac","lin","and","ios","web","lgtv","stv","atv","quest","mcmod","mcplug","mcbed"];
const LEGACY = k => "u" + k[0].toUpperCase() + k.slice(1);
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SESSION_MS = 15 * 60 * 1000;
const secret = () => ENV.SESSION_SECRET || createHash("sha256").update("ts-session|" + CFG.HASH).digest("hex");

/* ---------- almacenamiento ---------- */
// Tabla clave/valor en D1. Los valores grandes se parten en trozos (D1 limita el tamaño de cada fila).
const CH = 500_000;
let ready = false;
async function db() {
  if (!ready) { await ENV.DB.prepare("CREATE TABLE IF NOT EXISTS kv (k TEXT NOT NULL, p INTEGER NOT NULL, v TEXT NOT NULL, PRIMARY KEY (k, p))").run(); ready = true; }
  return ENV.DB;
}
const rd = async (k, d) => {
  try { const D = await db(); const { results } = await D.prepare("SELECT v FROM kv WHERE k = ? ORDER BY p").bind(k).all();
    return results.length ? JSON.parse(results.map(x => x.v).join("")) : d; } catch { return d; }
};
const wr = async (k, v) => {
  const D = await db(), s = JSON.stringify(v), parts = [];
  let i = 0;
  do { let e = Math.min(s.length, i + CH); if (e < s.length && (s.charCodeAt(e) & 0xFC00) === 0xDC00) e--; parts.push(s.slice(i, e)); i = e; } while (i < s.length);
  await D.batch([D.prepare("DELETE FROM kv WHERE k = ?").bind(k), ...parts.map((p, n) => D.prepare("INSERT INTO kv (k, p, v) VALUES (?, ?, ?)").bind(k, n, p))]);
};

/* ---------- Cloudflare R2 (archivos de las apps) ---------- */
// Almacenamientos compatibles con S3 (hasta 3): S3_* (principal, p.ej. Backblaze B2), S3B_* (secundario, p.ej. Filebase) y R2_*
const GB = 1024 ** 3;
const guessLabel = h => /backblazeb2/.test(h) ? "Backblaze B2" : /filebase/.test(h) ? "Filebase" : h;
const guessQuota = h => /filebase/.test(h) ? 5 : 10;
function readStores() {
  const e = Object.fromEntries(Object.entries(ENV).map(([k, v]) => [k, typeof v === "string" ? v.trim() : v])), out = [];
  for (const [id, p] of [["s3", "S3_"], ["s3b", "S3B_"]]) {
    if (!(e[p + "ENDPOINT"] && e[p + "KEY_ID"] && e[p + "SECRET"] && e[p + "BUCKET"])) continue;
    const host = e[p + "ENDPOINT"].replace(/^https?:\/\//, "").replace(/\/.*$/, "");
    const b2 = host.match(/^s3\.([^.]+)\.backblazeb2\.com$/);
    out.push({ id, host, region: e[p + "REGION"] || (b2 ? b2[1] : "us-east-1"), ak: e[p + "KEY_ID"], sk: e[p + "SECRET"], bucket: e[p + "BUCKET"],
      label: e[p + "LABEL"] || guessLabel(host), quota: (+e[p + "QUOTA_GB"] || guessQuota(host)) * GB });
  }
  if (e.R2_ACCOUNT_ID && e.R2_ACCESS_KEY_ID && e.R2_SECRET_ACCESS_KEY && e.R2_BUCKET)
    out.push({ id: "r2", host: `${e.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`, region: "auto", ak: e.R2_ACCESS_KEY_ID, sk: e.R2_SECRET_ACCESS_KEY, bucket: e.R2_BUCKET, label: "Cloudflare R2", quota: 10 * GB });
  return out;
}
const stores = () => readStores();
const r2ok = () => stores().length > 0;
const stOf = f => (f && f.st) || stores()[0]?.id;
const T0 = () => new Date(Math.floor(Date.now() / 1800000) * 1800000);
function r2url(method, key, expires, query, st, now) {
  const all = stores(), e = all.find(x => x.id === st) || all[0];
  return sigv4Presign({ method, host: e.host, path: "/" + e.bucket + "/" + key.split("/").map(enc).join("/"),
    ak: e.ak, sk: e.sk, region: e.region, service: "s3", expires, query, ...(now ? { now } : {}) });
}
const r2 = () => globalThis.__TS_R2 || {
  head: async (key, st) => { try { const x = await fetch(r2url("HEAD", key, 60, {}, st), { method: "HEAD" }); return x.ok ? { size: +x.headers.get("content-length") || 0 } : null; } catch { return null; } },
  del: async (key, st) => { try { await fetch(r2url("DELETE", key, 60, {}, st), { method: "DELETE" }); } catch {} },
};
const FKEY = /^files\/[0-9a-f-]{36}\/[\w.\-()\[\] ]{1,120}$/i;
const MKEY = /^media\/[0-9a-f-]{36}\/[\w.\-()\[\] ]{1,120}$/i;
const stId = v => /^(s3|s3b|r2)$/.test(v) ? v : "";
const ytId = v => { const t = String(v || "").trim(); if (/^[\w-]{11}$/.test(t)) return t; const m = t.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/))([\w-]{11})/); return m ? m[1] : ""; };
const safeName = n => String(n || "archivo").replace(/[^\w.\-()\[\] ]+/g, "_").replace(/^\.+/, "").slice(0, 120) || "archivo";
const MAXFILE = 4.9 * 1024 ** 3;

/* ---------- utilidades ---------- */
const J = (o, s = 200, h = {}) => new Response(JSON.stringify(o), { status: s, headers: {
  "content-type": "application/json; charset=utf-8", "cache-control": "no-store",
  "x-content-type-options": "nosniff", ...h } });
// Respuestas públicas iguales para todos: se guardan 30 s en la caché de Cloudflare (no gastan procesador en cada visita).
const CDN = { "cache-control": "public, max-age=30", "x-cache-me": "1" };
const clip = (v, n) => String(v ?? "").trim().slice(0, n);
const ipH = ip => createHash("sha256").update(CFG.SALT + "|ip|" + ip).digest("hex").slice(0, 24);
const day = (t = Date.now()) => new Date(t).toISOString().slice(0, 10);
const okUrl = u => { try { const x = new URL(u); return x.protocol === "https:" && x.hostname.includes(".") ? x.href : ""; } catch { return ""; } };
const sleep = ms => new Promise(r => setTimeout(r, ms));
const same = (a, b) => a.length === b.length && timingSafeEqual(Buffer.from(a), Buffer.from(b));
const sha = s => createHash("sha256").update(String(s)).digest("hex");
const HEX64 = /^[0-9a-f]{64}$/;
// El navegador calcula PBKDF2 (600.000 vueltas) y envía la clave derivada; aquí solo se compara su SHA-256 (cálculo mínimo).
const keyOk = (k, expected) => HEX64.test(String(k || "")) && same(sha(k), expected);
async function readBody(req) {
  const t = await req.text();
  if (t.length > 1_500_000) throw new Error("big");
  return t ? JSON.parse(t) : {};
}

/* ---------- sesión (token firmado, caduca en 15 min) ---------- */
const sign = p => createHmac("sha256", secret()).update(p).digest("base64url");
function mint() {
  const iat = Date.now(), exp = iat + SESSION_MS;
  const p = Buffer.from(JSON.stringify({ iat, exp })).toString("base64url");
  return { token: p + "." + sign(p), exp };
}
function verifyToken(req, st) {
  const h = req.headers.get("authorization") || "";
  const [p, s] = (h.startsWith("Bearer ") ? h.slice(7) : "").split(".");
  if (!p || !s || !same(sign(p), s)) return null;
  try {
    const o = JSON.parse(Buffer.from(p, "base64url").toString());
    if (o.exp <= Date.now() || o.iat < (st.revokedBefore || 0)) return null;
    return o;
  } catch { return null; }
}

/* ---------- límites de intentos (por IP, con espera creciente) ---------- */
async function wait(key) { const r = await rd("rl:" + key, { n: 0, until: 0 }); return { r, w: Math.max(0, r.until - Date.now()) }; }
async function bump(key, r, max, base) {
  r.n++; if (r.n >= max) r.until = Date.now() + Math.min(3600000, base * 2 ** (r.n - max));
  await wr("rl:" + key, r); return r;
}

/* ---------- estado, estadísticas y catálogo ---------- */
const DEF = { mode: "off", blocked: [], msg: "", frozen: false, revokedBefore: 0, loginLockedUntil: 0 };
const getStatus = async () => ({ ...DEF, ...(await rd("status", {})) });
const pubStatus = (st, admin) => ({ mode: st.mode, blocked: st.blocked, msg: st.msg, ...(admin ? { frozen: st.frozen, loginLocked: st.loginLockedUntil > Date.now() } : {}) });

function counts(s) {
  const d = s?.d || {}, now = Date.now(); let w = 0, m = 0;
  for (let i = 0; i < 30; i++) { const v = d[day(now - i * 864e5)] || 0; m += v; if (i < 7) w += v; }
  return { dl: s?.t || 0, dw: w, dm: m, pp: s?.p || {} };
}
const decorate = (a, stats, admin) => {
  const { urls, files, media, ...rest } = a;
  const fs = {}; for (const k in files || {}) fs[k] = files[k].size;
  const ok = (rest.plat || []).filter(k => urls?.[k] || files?.[k]);
  const c0 = media?.images?.[0];
  return { ...rest, fs, ok, ni: media?.images?.length || 0, tr: media?.trailer?.kind || "", cover: c0 && r2ok() ? r2url("GET", c0.key, 7200, {}, stOf(c0), T0()) : "",
    ...(admin ? { urls, files: files || {}, media: media || { images: [], trailer: null } } : {}), ...counts(stats[a.id]) };
};

function cleanMedia(m) {
  const images = (Array.isArray(m?.images) ? m.images : []).slice(0, 8).filter(f => f && typeof f.key === "string" && MKEY.test(f.key))
    .map(f => ({ key: f.key, st: stId(f.st), name: safeName(f.name), size: Math.max(0, +f.size || 0) }));
  let trailer = null; const t = m?.trailer;
  if (t && t.kind === "youtube") { const id = ytId(t.id || t.url); if (id) trailer = { kind: "youtube", id }; }
  else if (t && t.kind === "file" && typeof t.key === "string" && MKEY.test(t.key)) trailer = { kind: "file", key: t.key, st: stId(t.st), name: safeName(t.name), size: Math.max(0, +t.size || 0) };
  return { images, trailer };
}
function cleanApp(o, old) {
  if (!o || typeof o !== "object") return null;
  const plat0 = (Array.isArray(o.plat) ? o.plat : []).filter(k => PLAT.includes(k));
  const urls = {};
  for (const k of plat0) { const u = okUrl(o.urls?.[k] ?? o[LEGACY(k)]); if (u) urls[k] = u; }
  const files = {};
  for (const k of plat0) { const f = o.files?.[k]; if (f && typeof f.key === "string" && FKEY.test(f.key)) files[k] = { key: f.key, st: stId(f.st), name: safeName(f.name), size: Math.max(0, +f.size || 0) }; }
  const rel = Number(o.release);
  const release = Number.isFinite(rel) && rel > 0 && rel < Date.now() + 5 * 365 * 864e5 ? Math.floor(rel) : 0;
  const plat = plat0.filter(k => release > Date.now() || urls[k] || files[k]);
  const name = clip(o.name, 80), ver = clip(o.ver, 30), cat = clip(o.cat, 40), desc = clip(o.desc, 1200);
  if (!plat.length || !name || !ver || !cat || !desc) return null;
  const icon = typeof o.icon === "string" && o.icon.length < 250000 && /^data:image\/(png|jpeg|webp|gif);base64,[A-Za-z0-9+\/=]+$/.test(o.icon) ? o.icon : "";
  const now = Date.now();
  const created = old?.created || (+o.created > 0 ? +o.created : (Date.parse(o.date) || now));
  return { id: old?.id || (UUID.test(o.id || "") ? o.id : randomUUID()), icon, name, saga: clip(o.saga, 80), ver, cat,
    dev: clip(o.dev, 80) || "Tech Studios", desc, notes: clip(o.notes, 600), plat, urls, files, media: cleanMedia(o.media), release, q: !!o.q, created, updated: now };
}

const POST_TYPES = ["comunicado", "spoiler", "aviso", "devlog", "estreno"];
const okImg = (v, max) => typeof v === "string" && v.length < max && /^data:image\/(png|jpeg|webp|gif);base64,[A-Za-z0-9+\/=]+$/.test(v) ? v : "";
function cleanPost(o, old) {
  if (!o || typeof o !== "object") return null;
  const title = clip(o.title, 120), body = clip(o.body, 4000);
  if (!title || !body) return null;
  const now = Date.now();
  return { id: old?.id || (UUID.test(o.id || "") ? o.id : randomUUID()), type: POST_TYPES.includes(o.type) ? o.type : "comunicado",
    title, body, image: okImg(o.image, 350000), pinned: !!o.pinned, created: old?.created || now, updated: now };
}
const okPay = u => { try { const x = new URL(u); const h = x.hostname.replace(/^www\./, ""); return x.protocol === "https:" && (h === "paypal.me" || h === "paypal.com") ? x.href.replace(/\/$/, "") : ""; } catch { return ""; } };
const CURS = ["USD", "EUR", "GBP", "CAD", "AUD", "MXN", "BRL"];
/* ---------- Cuestionario ---------- */
const QTYPES = ["single", "multi", "text", "scale"];
function cleanQuiz(o) {
  if (!o || typeof o !== "object") return null;
  const title = clip(o.title, 100); if (!title) return null;
  const raw = (Array.isArray(o.questions) ? o.questions : []).slice(0, 7);
  const questions = raw.map((q, i) => {
    const t = clip(q?.t, 200); const type = QTYPES.includes(q?.type) ? q.type : "text"; if (!t) return null;
    let opts = [];
    if (type === "single" || type === "multi") { opts = (Array.isArray(q.opts) ? q.opts : []).map(x => clip(x, 80)).filter(Boolean).slice(0, 6); if (opts.length < 2) return null; }
    return { id: "q" + (i + 1), t, type, opts, req: !!q.req };
  });
  if (!questions.length || questions.some(x => !x)) return null;
  return { title, desc: clip(o.desc, 300), active: !!o.active, questions };
}
function cleanAnswers(q, a) {
  a = a && typeof a === "object" ? a : {}; const out = {};
  for (const Q of q.questions) {
    const v = a[Q.id];
    if (Q.type === "single") { const i = Number.isInteger(v) ? v : -1; if (i >= 0 && i < Q.opts.length) out[Q.id] = i; else if (Q.req) return null; }
    else if (Q.type === "multi") { const arr = Array.isArray(v) ? [...new Set(v.filter(i => Number.isInteger(i) && i >= 0 && i < Q.opts.length))] : []; if (arr.length) out[Q.id] = arr; else if (Q.req) return null; }
    else if (Q.type === "scale") { const n = Number.isInteger(v) ? v : 0; if (n >= 1 && n <= 5) out[Q.id] = n; else if (Q.req) return null; }
    else { const t = clip(v, 300); if (t) out[Q.id] = t; else if (Q.req) return null; }
  }
  return Object.keys(out).length ? out : null;
}
function quizResults(q, resp) {
  const cur = resp.filter(r => r.ver === q.ver);
  return { n: cur.length, items: q.questions.map(Q => {
    if (Q.type === "single" || Q.type === "multi") { const c = Q.opts.map(() => 0); let tot = 0;
      for (const r of cur) { const v = r.a[Q.id]; if (v == null) continue; tot++; (Array.isArray(v) ? v : [v]).forEach(i => { if (c[i] != null) c[i]++; }); }
      return { id: Q.id, counts: c, answered: tot }; }
    if (Q.type === "scale") { const c = [0, 0, 0, 0, 0]; let sum = 0, tot = 0;
      for (const r of cur) { const v = r.a[Q.id]; if (v >= 1 && v <= 5) { c[v - 1]++; sum += v; tot++; } }
      return { id: Q.id, counts: c, answered: tot, avg: tot ? +(sum / tot).toFixed(2) : 0 }; }
    const withText = cur.filter(r => r.a[Q.id]);
    return { id: Q.id, answered: withText.length, texts: withText.slice(-50).reverse().map(r => ({ ts: r.ts, text: r.a[Q.id] })) };
  }) };
}
const getSettings = async () => ({ paypal: "", cur: "USD", msg: "", ...(await rd("settings", {})) });

const fileRefs = a => a ? [...Object.values(a.files || {}), ...(a.media?.images || []), ...(a.media?.trailer?.key ? [a.media.trailer] : [])] : [];
const rid = f => stOf(f) + "|" + f.key;
async function finalize(app, old, verify = true) {
  const known = new Set(fileRefs(old).map(rid));
  const check = async f => { if (!verify || known.has(rid(f))) return true; const h = r2ok() ? await r2().head(f.key, stOf(f)) : null; if (!h) return false; f.size = h.size || f.size; return true; };
  for (const k of Object.keys(app.files)) if (!(await check(app.files[k]))) delete app.files[k];
  const keepImgs = []; for (const f of app.media.images) if (await check(f)) keepImgs.push(f);
  app.media.images = keepImgs;
  if (app.media.trailer?.key && !(await check(app.media.trailer))) app.media.trailer = null;
  const teaser = app.release > Date.now();
  app.plat = app.plat.filter(k => teaser || app.urls[k] || app.files[k]);
  return app.plat.length ? app : null;
}
async function dropFiles(refs) { if (r2ok()) for (const f of refs) await r2().del(f.key, stOf(f)); }
const usage = cat => { const u = {}; for (const a of cat) for (const f of fileRefs(a)) u[stOf(f)] = (u[stOf(f)] || 0) + (f.size || 0); return u; };
const storeInfo = cat => { const u = usage(cat); return stores().map(x => ({ id: x.id, label: x.label, used: u[x.id] || 0, quota: x.quota })); };
const mediaView = a => {
  const t = a.media?.trailer;
  return { images: (a.media?.images || []).map(f => r2url("GET", f.key, 7200, {}, stOf(f), T0())),
    trailer: t ? (t.kind === "youtube" ? { kind: "youtube", id: t.id } : { kind: "file", url: r2url("GET", t.key, 7200, {}, stOf(t), T0()) }) : null };
};

async function pinCheck(req, iph) {
  const { r, w } = await wait("pin:" + iph);
  if (w > 0) return { s: 429, wait: Math.ceil(w / 1000) };
  const ok = keyOk(req.headers.get("x-pin"), CFG.PHASH);
  if (ok) { if (r.n) await wr("rl:pin:" + iph, { n: 0, until: 0 }); return null; }
  await bump("pin:" + iph, r, 3, 300000); await sleep(600);
  return { s: 403 };
}

/* ---------- manejador ---------- */
async function handle(req) {
  const url = new URL(req.url);
  const path = url.pathname.replace(/^\/api\/?/, "").replace(/\/$/, "");
  const m = req.method;
  const ip = req.headers.get("cf-connecting-ip") || "0.0.0.0";
  const iph = ipH(ip);
  try {
    /* ===== público ===== */
    if (m === "GET" && path === "catalog") {
      const st = await getStatus();
      const [cat, stats] = await Promise.all([rd("catalog", []), rd("stats", {})]);
      const apps = st.mode === "full" ? [] : cat.filter(a => !a.q).map(a => decorate(a, stats, false));
      return J({ apps, status: pubStatus(st, false) }, 200, CDN);
    }
    if (m === "GET" && path === "lockstate") {
      const st = await getStatus(); const { w } = await wait("login:" + iph);
      return J({ locked: w > 0 || st.loginLockedUntil > Date.now() });
    }
    if (m === "GET" && path === "posts") {
      const st = await getStatus(); if (st.mode === "full") return J({ posts: [] }, 200, CDN);
      const p = await rd("posts", []); p.sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || b.created - a.created);
      return J({ posts: p }, 200, CDN);
    }
    const mm = path.match(/^media\/([0-9a-f-]{36})$/i);
    if (m === "GET" && mm) {
      const st = await getStatus(); if (st.mode === "full") return J({ error: "notfound" }, 404);
      const a = (await rd("catalog", [])).find(x => x.id === mm[1] && !x.q);
      return a && r2ok() ? J(mediaView(a), 200, CDN) : J({ images: [], trailer: a?.media?.trailer?.kind === "youtube" ? { kind: "youtube", id: a.media.trailer.id } : null });
    }
    if (m === "GET" && path === "settings") return J(await getSettings(), 200, CDN);
    if (m === "GET" && path === "quiz") {
      const st = await getStatus(); if (st.mode === "full") return J({ quiz: null });
      const q = await rd("quiz", null);
      return J({ quiz: !q ? null : q.active ? { id: q.id, ver: q.ver, title: q.title, desc: q.desc, questions: q.questions } : { closed: true, title: q.title } }, 200, CDN);
    }
    if (m === "POST" && path === "quiz/submit") {
      const st = await getStatus(); if (st.mode === "full") return J({ error: "closed" }, 403);
      const q = await rd("quiz", null); if (!q || !q.active) return J({ error: "Este cuestionario está cerrado." }, 403);
      const b = await readBody(req);
      if (b.hp) return J({ ok: true });
      if (b.consent !== true) return J({ error: "Debes aceptar que tus respuestas se guarden." }, 400);
      if (+b.ver !== q.ver) return J({ error: "El cuestionario cambió. Recarga la página para ver las preguntas nuevas." }, 409);
      const k = "rl:qz:" + iph + ":" + q.ver; const rl = await rd(k, { n: 0, last: 0 });
      if (rl.n >= 3 || Date.now() - (rl.last || 0) < 8000) return J({ error: "Ya enviaste tus respuestas. ¡Gracias!" }, 429);
      const a = cleanAnswers(q, b.answers);
      if (!a) return J({ error: "Responde las preguntas obligatorias." }, 400);
      const list = await rd("quiz_resp", []); list.push({ id: randomUUID().slice(0, 8), ts: Date.now(), ver: q.ver, a });
      await wr("quiz_resp", list.slice(-500)); await wr(k, { n: rl.n + 1, last: Date.now() });
      return J({ ok: true });
    }
    const dm = path.match(/^d\/([0-9a-f-]{36})\/([a-z]{2,6})$/i);
    if (m === "GET" && dm) {
      const [, id, plat] = dm; const st = await getStatus();
      if (st.mode !== "off" || st.blocked.includes(plat))
        return new Response("<!doctype html><meta charset=utf-8><title>Descargas bloqueadas</title><body style='font:16px system-ui;background:#05060f;color:#fff;display:grid;place-items:center;height:100vh;margin:0'><p>Las descargas están temporalmente bloqueadas por seguridad.</p>", { status: 403, headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" } });
      const cat = await rd("catalog", []); const a = cat.find(x => x.id === id && !x.q);
      if (a && a.release > Date.now()) return new Response("<!doctype html><meta charset=utf-8><title>Próximamente</title><body style='font:16px system-ui;background:#05060f;color:#fff;display:grid;place-items:center;height:100vh;margin:0'><p>Esta app aún no está disponible. ¡Pronto!</p>", { status: 403, headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" } });
      const f = a?.files?.[plat];
      const target = f && r2ok() ? r2url("GET", f.key, 300, { "response-content-disposition": `attachment; filename="${safeName(f.name)}"` }, stOf(f)) : a?.urls?.[plat];
      if (!target || !okUrl(target)) return J({ error: "notfound" }, 404);
      const k = `rl:dl:${iph}:${id}:${plat}`; const last = await rd(k, 0);
      if (Date.now() - last > 600000) {
        await wr(k, Date.now());
        const stats = await rd("stats", {}); const s = stats[id] || { t: 0, p: {}, d: {} };
        s.t++; s.p[plat] = (s.p[plat] || 0) + 1; s.d[day()] = (s.d[day()] || 0) + 1;
        for (const d of Object.keys(s.d)) if (Date.parse(d) < Date.now() - 60 * 864e5) delete s.d[d];
        stats[id] = s; await wr("stats", stats);
      }
      return new Response(null, { status: 302, headers: { location: target, "cache-control": "no-store", "referrer-policy": "no-referrer" } });
    }

    /* ===== acceso ===== */
    if (m === "POST" && path === "login") {
      const st = await getStatus();
      if (st.loginLockedUntil > Date.now()) return J({ error: "locked", wait: Math.ceil((st.loginLockedUntil - Date.now()) / 1000) }, 429);
      const { r, w } = await wait("login:" + iph);
      if (w > 0) return J({ error: "locked", wait: Math.ceil(w / 1000) }, 429);
      const b = await readBody(req);
      if (keyOk(b.k, CFG.HASH)) {
        if (r.n) await wr("rl:login:" + iph, { n: 0, until: 0 });
        return J(mint());
      }
      await bump("login:" + iph, r, 5, 60000); await sleep(700);
      return J({ error: "bad", left: Math.max(0, 5 - r.n) }, 401);
    }
    if (m === "POST" && path === "unlock") {
      const { r, w } = await wait("unl:" + iph);
      if (w > 0) return J({ error: "wait", wait: Math.ceil(w / 1000) }, 429);
      const b = await readBody(req);
      if (keyOk(b.key, CFG.UHASH)) {
        await wr("rl:login:" + iph, { n: 0, until: 0 }); await wr("rl:unl:" + iph, { n: 0, until: 0 });
        const st = await getStatus(); st.loginLockedUntil = 0; await wr("status", st);
        return J({ ok: true });
      }
      await bump("unl:" + iph, r, 3, 300000); await sleep(700);
      return J({ error: "bad" }, 403);
    }

    /* ===== administración ===== */
    if (path.startsWith("admin/")) {
      const st = await getStatus();
      if (!verifyToken(req, st)) return J({ error: "auth" }, 401);
      const a = path.slice(6);
      const frozen = () => st.frozen ? J({ error: "El panel está congelado." }, 423) : null;

      if (m === "POST" && a === "refresh") return J(mint());
      if (m === "GET" && a === "catalog") {
        const [cat, stats] = await Promise.all([rd("catalog", []), rd("stats", {})]);
        return J({ apps: cat.map(x => decorate(x, stats, true)), status: pubStatus(st, true), upload: r2ok(), missing: r2ok() ? [] : ["S3_ENDPOINT", "S3_KEY_ID", "S3_SECRET", "S3_BUCKET"].filter(k => !ENV[k]), stores: storeInfo(cat) });
      }
      if (m === "PUT" && a === "app") {
        const f = frozen(); if (f) return f;
        const b = await readBody(req); const cat = await rd("catalog", []);
        const old = cat.find(x => x.id === (b.app || {}).id);
        let app = cleanApp(b.app, old);
        if (app) app = await finalize(app, old);
        if (!app) return J({ error: "Datos inválidos: revisa nombre, versión, categoría, descripción y que cada plataforma tenga un archivo subido o un enlace https." }, 400);
        const next = old ? cat.map(x => x.id === app.id ? app : x) : [app, ...cat];
        await wr("catalog", next.slice(0, 500));
        const keep = new Set(fileRefs(app).map(rid)); await dropFiles(fileRefs(old).filter(f => !keep.has(rid(f))));
        return J({ ok: true, id: app.id });
      }
      const am = a.match(/^media\/([0-9a-f-]{36})$/i);
      if (m === "GET" && am) { const x = (await rd("catalog", [])).find(y => y.id === am[1]); return x ? J(mediaView(x)) : J({ error: "notfound" }, 404); }
      if (m === "GET" && a === "storage-check") {
        const names = Object.keys(ENV).filter(k => !["DB", "ASSETS"].includes(k));
        const out = [];
        for (const [id, p, label] of [["s3", "S3_", "Almacenamiento principal (S3_…)"], ["s3b", "S3B_", "Almacenamiento secundario (S3B_…)"]]) {
          const need = ["ENDPOINT", "KEY_ID", "SECRET", "BUCKET"], have = need.filter(k => String(ENV[p + k] || "").trim());
          const entry = { id, label, missing: need.filter(k => !have.includes(k)).map(k => p + k), found: have.map(k => p + k) };
          const st = stores().find(x => x.id === id);
          if (st) {
            entry.host = st.host; entry.bucket = st.bucket; entry.region = st.region;
            try {
              const x = await fetch(r2url("HEAD", "files/__diagnostico__/x", 60, {}, id), { method: "HEAD" });
              entry.status = x.status;
              entry.hint = x.status === 404 ? "OK: las claves y el bucket funcionan." : x.status === 403 ? "Las claves no tienen permiso o están mal copiadas (keyID o applicationKey), o la clave no es de este bucket." : x.status === 400 ? "Revisa el endpoint y el nombre del bucket: Backblaze no los reconoce." : x.status === 301 || x.status === 307 ? "El endpoint no corresponde a la región del bucket." : "Respuesta inesperada del almacenamiento.";
            } catch { entry.status = 0; entry.hint = "No se pudo conectar. Revisa que S3_ENDPOINT sea solo el dominio, sin https:// y sin espacios."; }
          } else if (have.length) entry.hint = "Faltan variables: " + entry.missing.join(", ") + ".";
          else entry.hint = "No hay ninguna variable de este grupo.";
          out.push(entry);
        }
        return J({ upload: r2ok(), stores: out, seen: names.filter(k => /s3|b2|bucket|key|secret|endpoint|session/i.test(k)).sort() });
      }
      if (m === "GET" && a === "backup") return J({ v: 1, at: Date.now(), catalog: await rd("catalog", []), stats: await rd("stats", {}), posts: await rd("posts", []), settings: await getSettings(), quiz: await rd("quiz", null), quiz_resp: await rd("quiz_resp", []) });
      if (m === "POST" && a === "restore") {
        const f = frozen(); if (f) return f;
        const e = await pinCheck(req, iph); if (e) return J({ error: "pin", wait: e.wait }, e.s);
        const d = (await readBody(req)).data || {};
        const cat = [], seen = new Set();
        for (const x of (Array.isArray(d.catalog) ? d.catalog : []).slice(0, 500)) { const c = cleanApp(x, null); const fz = c && await finalize(c, null, false); if (fz && !seen.has(fz.id)) { seen.add(fz.id); cat.push(fz); } }
        const stats = {};
        for (const [id, s0] of Object.entries(d.stats && typeof d.stats === "object" ? d.stats : {})) {
          if (!UUID.test(id) || !s0) continue;
          stats[id] = { t: Math.max(0, +s0.t || 0), p: Object.fromEntries(Object.entries(s0.p || {}).filter(([k]) => PLAT.includes(k)).map(([k, v]) => [k, Math.max(0, +v || 0)])),
            d: Object.fromEntries(Object.entries(s0.d || {}).filter(([k]) => /^\d{4}-\d{2}-\d{2}$/.test(k)).map(([k, v]) => [k, Math.max(0, +v || 0)])) };
        }
        const posts = (Array.isArray(d.posts) ? d.posts : []).slice(0, 200).map(p => cleanPost(p, { id: UUID.test(p?.id || "") ? p.id : undefined, created: +p?.created > 0 ? +p.created : undefined })).filter(Boolean);
        const sp = d.settings || {}; const settings = { paypal: sp.paypal ? okPay(String(sp.paypal)) : "", cur: CURS.includes(sp.cur) ? sp.cur : "USD", msg: clip(sp.msg, 300) };
        const qn = cleanQuiz(d.quiz); const quiz = qn ? { id: UUID.test(d.quiz?.id || "") ? d.quiz.id : randomUUID(), ver: Math.max(1, +d.quiz?.ver || 1), ...qn, updated: Date.now() } : null;
        const resp = quiz ? (Array.isArray(d.quiz_resp) ? d.quiz_resp : []).filter(x => x && x.ver === quiz.ver && x.a && typeof x.a === "object").slice(-500).map(x => ({ id: clip(x.id, 8), ts: +x.ts || Date.now(), ver: quiz.ver, a: x.a })) : [];
        await wr("catalog", cat); await wr("stats", stats); await wr("posts", posts); await wr("settings", settings); if (quiz) await wr("quiz", quiz); await wr("quiz_resp", resp);
        return J({ ok: true, apps: cat.length, posts: posts.length, answers: resp.length });
      }
      if (m === "GET" && a === "quiz") {
        const q = await rd("quiz", null); const resp = await rd("quiz_resp", []);
        return J({ quiz: q, n: q ? resp.filter(x => x.ver === q.ver).length : 0, results: q ? quizResults(q, resp) : null });
      }
      if (m === "GET" && a === "quiz-responses") { const q = await rd("quiz", null); return J({ quiz: q, responses: q ? (await rd("quiz_resp", [])).filter(x => x.ver === q.ver) : [] }); }
      if (m === "PUT" && a === "quiz") {
        const f = frozen(); if (f) return f;
        const b = await readBody(req); const nq = cleanQuiz(b.quiz);
        if (!nq) return J({ error: "Revisa: título, entre 1 y 7 preguntas con texto, y 2 a 6 opciones en las de elegir." }, 400);
        const old = await rd("quiz", null); const resp = await rd("quiz_resp", []);
        const changed = !old || JSON.stringify(old.questions) !== JSON.stringify(nq.questions);
        const n = old ? resp.filter(x => x.ver === old.ver).length : 0;
        if (old && changed && n > 0) {
          if (!b.confirmReset) return J({ error: "reset", n }, 409);
          const e = await pinCheck(req, iph); if (e) return J({ error: "pin", wait: e.wait }, e.s);
          await wr("quiz_resp", []);
        }
        const quiz = { id: old?.id || randomUUID(), ver: old ? (changed ? old.ver + 1 : old.ver) : 1, ...nq, updated: Date.now() };
        await wr("quiz", quiz); return J({ ok: true, quiz });
      }
      if (m === "POST" && a === "quiz-active") {
        const f = frozen(); if (f) return f;
        const b = await readBody(req); const q = await rd("quiz", null); if (!q) return J({ error: "Primero crea el cuestionario." }, 400);
        q.active = !!b.active; await wr("quiz", q); return J({ ok: true, active: q.active });
      }
      if (m === "POST" && a === "quiz-reset") {
        const f = frozen(); if (f) return f;
        const e = await pinCheck(req, iph); if (e) return J({ error: "pin", wait: e.wait }, e.s);
        await wr("quiz_resp", []); return J({ ok: true });
      }
      if (m === "PUT" && a === "post") {
        const f = frozen(); if (f) return f;
        const b = await readBody(req); const list = await rd("posts", []);
        const old = list.find(x => x.id === (b.post || {}).id); const p = cleanPost(b.post, old);
        if (!p) return J({ error: "Escribe un título y un texto." }, 400);
        await wr("posts", (old ? list.map(x => x.id === p.id ? p : x) : [p, ...list]).slice(0, 200));
        return J({ ok: true, id: p.id });
      }
      if (m === "POST" && a === "post-delete") {
        const f = frozen(); if (f) return f;
        const e = await pinCheck(req, iph); if (e) return J({ error: "pin", wait: e.wait }, e.s);
        const b = await readBody(req); await wr("posts", (await rd("posts", [])).filter(x => x.id !== b.id));
        return J({ ok: true });
      }
      if (m === "PUT" && a === "settings") {
        const f = frozen(); if (f) return f;
        const e = await pinCheck(req, iph); if (e) return J({ error: "pin", wait: e.wait }, e.s);
        const b = await readBody(req); const raw = String(b.paypal || "").trim();
        const paypal = raw ? okPay(raw) : "";
        if (raw && !paypal) return J({ error: "El enlace debe ser de PayPal (https://paypal.me/tuusuario o un botón de donación de paypal.com)." }, 400);
        const set = { paypal, cur: CURS.includes(b.cur) ? b.cur : "USD", msg: clip(b.msg, 300) };
        await wr("settings", set); return J({ ok: true, ...set });
      }
      if (m === "POST" && a === "upload-url") {
        const f = frozen(); if (f) return f;
        if (!r2ok()) return J({ error: "El almacenamiento de archivos aún no está configurado en el servidor." }, 501);
        const b = await readBody(req); const size = +b.size;
        const kind = ["file", "image", "video"].includes(b.kind) ? b.kind : "file";
        const name = safeName(b.name); const ext = (name.match(/\.([a-z0-9]+)$/i) || [])[1]?.toLowerCase() || "";
        if (kind === "image" && !["png", "jpg", "jpeg", "webp", "gif"].includes(ext)) return J({ error: "Las imágenes deben ser png, jpg, webp o gif." }, 400);
        if (kind === "video" && !["mp4", "webm"].includes(ext)) return J({ error: "El video debe ser .mp4 o .webm." }, 400);
        const max = kind === "image" ? 10 * 1024 ** 2 : MAXFILE;
        if (!(size > 0) || size > max) return J({ error: kind === "image" ? "La imagen debe pesar menos de 10 MB." : "El archivo debe pesar entre 1 byte y 4,9 GB." }, 400);
        const all = stores(); const cat = await rd("catalog", []); const u = usage(cat);
        const pick = all.find(x => x.id === b.st) || [...all].sort((p, q) => (q.quota - (u[q.id] || 0)) - (p.quota - (u[p.id] || 0)))[0];
        const key = `${kind === "file" ? "files" : "media"}/${randomUUID()}/${name}`;
        return J({ url: r2url("PUT", key, 10800, {}, pick.id), key, name, st: pick.id });
      }
      if (m === "POST" && a === "q") {
        const f = frozen(); if (f) return f;
        const b = await readBody(req); const cat = await rd("catalog", []);
        await wr("catalog", cat.map(x => x.id === b.id ? { ...x, q: !!b.q } : x));
        return J({ ok: true });
      }
      if (m === "POST" && a === "delete") {
        const f = frozen(); if (f) return f;
        const e = await pinCheck(req, iph); if (e) return J({ error: "pin", wait: e.wait }, e.s);
        const b = await readBody(req); const cat = await rd("catalog", []);
        await dropFiles(fileRefs(cat.find(x => x.id === b.id)));
        await wr("catalog", cat.filter(x => x.id !== b.id));
        const stats = await rd("stats", {}); delete stats[b.id]; await wr("stats", stats);
        return J({ ok: true });
      }
      if (m === "POST" && a === "import") {
        const f = frozen(); if (f) return f;
        const e = await pinCheck(req, iph); if (e) return J({ error: "pin", wait: e.wait }, e.s);
        const b = await readBody(req);
        const cat0 = await rd("catalog", []);
        const list = [];
        const arr = (Array.isArray(b.apps) ? b.apps : []).slice(0, 500);
        const nref = arr.reduce((n, x) => n + Object.keys(x?.files || {}).length + (x?.media?.images?.length || 0) + (x?.media?.trailer ? 1 : 0), 0);
        for (const x of arr) { const c = cleanApp(x, null); const f = c && await finalize(c, null, nref <= 40); if (f) list.push(f); }
        const ids = new Set(); const uniq = list.filter(x => !ids.has(x.id) && ids.add(x.id));
        await wr("catalog", uniq);
        const keep = new Set(uniq.flatMap(fileRefs).map(rid)); await dropFiles(cat0.flatMap(fileRefs).filter(f => !keep.has(rid(f))));
        return J({ ok: true, n: uniq.length });
      }
      if (m === "POST" && a === "status") {
        const e = await pinCheck(req, iph); if (e) return J({ error: "pin", wait: e.wait }, e.s);
        const b = await readBody(req); const act = b.action; const now = Date.now();
        if (act === "downloads") { st.mode = "downloads"; st.blocked = []; }
        else if (act === "platforms") { st.mode = "off"; st.blocked = (Array.isArray(b.blocked) ? b.blocked : []).filter(k => PLAT.includes(k)); }
        else if (act === "full") st.mode = "full";
        else if (act === "freeze") st.frozen = true;
        else if (act === "kill") { st.revokedBefore = now; st.loginLockedUntil = now + 864e5; }
        else if (act === "off") { st.mode = "off"; st.blocked = []; st.frozen = false; }
        else return J({ error: "bad" }, 400);
        if (["downloads", "platforms", "full", "off"].includes(act)) st.msg = act === "off" ? "" : clip(b.msg, 160);
        await wr("status", st);
        return J({ ok: true, status: pubStatus(st, true) });
      }
    }
    return J({ error: "notfound" }, 404);
  } catch (e) {
    return J({ error: e?.message === "big" ? "Solicitud demasiado grande." : "Error del servidor." }, e?.message === "big" ? 413 : 500);
  }
}

const CACHEABLE = /^\/api\/(catalog|posts|settings|quiz|media\/[0-9a-f-]{36})$/;
export default {
  async fetch(req, env, ctx) {
    ENV = env;
    const url = new URL(req.url), cache = globalThis.caches && caches.default;
    const cacheable = cache && req.method === "GET" && CACHEABLE.test(url.pathname) && !req.headers.get("authorization");
    const key = cacheable ? new Request(url.origin + url.pathname, { method: "GET" }) : null;
    if (cacheable) { const hit = await cache.match(key); if (hit) return hit; }
    const res = await handle(req);
    const mark = res.headers.get("x-cache-me"); if (mark) res.headers.delete("x-cache-me");
    if (cacheable && mark && res.status === 200) ctx.waitUntil(cache.put(key, res.clone()));
    return res;
  },
};
