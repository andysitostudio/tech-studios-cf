// URL prefirmada (AWS Signature V4) para Backblaze B2, Filebase y Cloudflare R2. Funciona con nodejs_compat.
import { createHmac, createHash } from "node:crypto";
const sha = s => createHash("sha256").update(s).digest("hex");
const hm = (k, s) => createHmac("sha256", k).update(s).digest();
export const enc = s => encodeURIComponent(s).replace(/[!'()*]/g, c => "%" + c.charCodeAt(0).toString(16).toUpperCase());

export function sigv4Presign({ method, host, path, ak, sk, region, service, expires, query = {}, now = new Date() }) {
  const amz = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
  const date = amz.slice(0, 8);
  const scope = `${date}/${region}/${service}/aws4_request`;
  const q = { ...query, "X-Amz-Algorithm": "AWS4-HMAC-SHA256", "X-Amz-Credential": `${ak}/${scope}`,
    "X-Amz-Date": amz, "X-Amz-Expires": String(expires), "X-Amz-SignedHeaders": "host" };
  const cq = Object.keys(q).sort().map(k => enc(k) + "=" + enc(q[k])).join("&");
  const creq = [method, path, cq, `host:${host}\n`, "host", "UNSIGNED-PAYLOAD"].join("\n");
  const sts = ["AWS4-HMAC-SHA256", amz, scope, sha(creq)].join("\n");
  const key = hm(hm(hm(hm("AWS4" + sk, date), region), service), "aws4_request");
  const sig = createHmac("sha256", key).update(sts).digest("hex");
  return `https://${host}${path}?${cq}&X-Amz-Signature=${sig}`;
}
