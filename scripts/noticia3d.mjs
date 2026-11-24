// node noticia3d.mjs <url> <saida_base> "<frase a destacar>"  → <base>.png (página em largura de celular, do topo até a frase) + <base>.json (retângulos da frase)
import { createRequire } from "module";
const puppeteer = createRequire(process.env.HOME + "/.claude/skills/edicao-saraiva/.runtime/node/package.json")("puppeteer-core");
const [url, base, frase] = process.argv.slice(2);
const b = await puppeteer.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", headless: "new", args: ["--hide-scrollbars"] });
const p = await b.newPage();
await p.setUserAgent("Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1");
await p.setViewport({ width: 430, height: 900, deviceScaleFactor: 3, isMobile: true });
await p.goto(url, { waitUntil: "networkidle2", timeout: 60000 }).catch(() => {});
await new Promise((r) => setTimeout(r, 2500));
const info = await p.evaluate((frase) => {
  // tira avisos de cookie, barras fixas e pop-ups, que cobririam a matéria
  for (const el of [...document.querySelectorAll("body *")]) { const s = getComputedStyle(el); if ((s.position === "fixed" || s.position === "sticky") && el.offsetHeight > 0) el.remove(); }
  document.documentElement.style.overflow = "visible"; document.body.style.overflow = "visible";
  const alvo = frase.toLowerCase().replace(/[’']/g, "'");
  const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); let n, achou = null;
  while ((n = w.nextNode())) { const t = n.nodeValue.toLowerCase().replace(/[’']/g, "'"); const i = t.indexOf(alvo); const pai = n.parentElement;
    if (i >= 0 && pai && pai.offsetHeight > 0 && !pai.closest("nav,script,style,aside,title")) { achou = [n, i]; break; } }
  if (!achou) return { erro: "frase não encontrada" };
  const r = document.createRange(); r.setStart(achou[0], achou[1]); r.setEnd(achou[0], achou[1] + frase.length);
  const rects = [...r.getClientRects()].map((q) => ({ x: q.x + scrollX, y: q.y + scrollY, w: q.width, h: q.height }));
  const h1 = document.querySelector("h1"); const hy = h1 ? h1.getBoundingClientRect().y + scrollY : 0;
  return { rects, manchete: hy, altura: document.documentElement.scrollHeight };
}, frase);
if (info.erro) { console.log(JSON.stringify(info)); await b.close(); process.exit(2); }
const fim = Math.min(info.altura, Math.max(...info.rects.map((r) => r.y + r.h)) + 520);
await p.screenshot({ path: base + ".png", clip: { x: 0, y: 0, width: 430, height: Math.min(fim, 5200) } });
const fs = await import("fs"); fs.writeFileSync(base + ".json", JSON.stringify({ largura: 430, altura: Math.min(fim, 5200), escala: 3, ...info }));
console.log("ok", base, "altura", Math.round(fim), "manchete", Math.round(info.manchete), "frase em y", Math.round(info.rects[0].y), "linhas", info.rects.length);
await b.close();
