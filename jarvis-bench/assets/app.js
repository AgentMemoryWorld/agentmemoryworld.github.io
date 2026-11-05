/* JARVIS-Bench website: leaderboard, memory-ladder chart, authors, logo wall, small UI helpers.
   Data: assets/data.js (parsed from the paper's tables), assets/logos.js (affiliation logos). */
(() => {
  const D = window.JB_DATA;
  const LOGOS = window.JB_LOGOS || [];
  const PARTNER = window.JB_PARTNER;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const pct = v => (v * 100).toFixed(1);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  const FAM = {
    Claude: "#C47F3A", GPT: "#10A37F", Grok: "#4A4D52", Gemini: "#3B6EA8", Qwen: "#6B5B95", Gemma: "#4F8A6B",
    DeepSeek: "#4C5B9E", GLM: "#7C8F3E", Kimi: "#8E6A3D", MiMo: "#A8456B", MiniMax: "#2F7F7A",
  };
  const FAM_ORDER = Object.keys(FAM);
  const famLogo = f => `assets/models/${f.toLowerCase()}.png`;

  /* ---------- logo sizing: equal visual area, clamped ---------- */
  function fit(w, h, area, maxH, maxW, minH) {
    const a = w / h;
    let ww = Math.sqrt(area * a), hh = ww / a;
    if (hh > maxH) { hh = maxH; ww = hh * a; }
    if (ww > maxW) { ww = maxW; hh = ww / a; }
    if (hh < minH) { hh = minH; ww = hh * a; }
    return [Math.round(ww), Math.round(hh)];
  }
  const logoImg = (l, size) => `<img class="logo-img" src="assets/logos/${l.file}" alt="${esc(l.name)}" title="${esc(l.name)}" width="${size[0]}" height="${size[1]}" loading="lazy">`;

  /* ---------- MatrAIx lockup (round mark + name; first in every logo row) ---------- */
  const mxLockup = d => PARTNER ? `<a class="mx" href="${PARTNER.url}" title="${esc(PARTNER.name)}"><img src="assets/logos/${PARTNER.file}" alt="" width="${d}" height="${d}"><b>${esc(PARTNER.name)}</b></a>` : "";

  /* ---------- hero logo strip ---------- */
  const HERO = ["uic", "nvidia", "google-research", "meta", "amazon", "salesforce", "cambridge", "cornell"];
  const heroBox = $("#hero-logos");
  if (heroBox && LOGOS.length) {
    const bySlug = Object.fromEntries(LOGOS.map(l => [l.slug, l]));
    const order = [...HERO, ...LOGOS.map(l => l.slug).filter(s => !HERO.includes(s))];
    const set = mxLockup(26) + order.filter(s => bySlug[s]).map(s => logoImg(bySlug[s], fit(bySlug[s].w, bySlug[s].h, 2300, 30, 132, 15))).join("");
    heroBox.innerHTML = `<div class="marquee"><div class="track"><div class="set">${set}</div><div class="set" aria-hidden="true">${set}</div></div></div>`;
  }

  /* ---------- hero: best of the 54 models at each memory level ---------- */
  const hl = $("#hero-ladder");
  if (hl && D && D.ipr) {
    $$("li[data-k]", hl).forEach(li => {
      const top = Math.max(...D.ipr.map(r => r.c[+li.dataset.k]));
      $("b", li).textContent = pct(top);
      li.style.setProperty("--v", top.toFixed(3));
    });
  }

  /* ---------- memory ladder chart ---------- */
  const LEVELS = [
    ["C0", "No Memory", "No user context"],
    ["C1", "Short Trajectory", "The first 14 days of the log"],
    ["C2", "Long Trajectory", "The full trajectory"],
    ["C3", "Persona Memory", "Full trajectory plus the persona profile"],
    ["C4", "Lifelong Memory", "Plus a distilled survey insight, an oracle-style ceiling"],
  ];
  const chart = $("#ladder-chart");
  if (chart) {
    const Y0 = 20, Y1 = 80, H = 230;
    const y = v => (v - Y0) / (Y1 - Y0) * H;
    const ticks = [20, 30, 40, 50, 60, 70, 80];
    let html = `<div class="axis">${ticks.map(t => `<span style="bottom:${y(t)}px">${t}%</span>`).join("")}</div>`;
    LEVELS.forEach(([code, name, desc], k) => {
      const vals = D.ipr.map(r => r.c[k] * 100);
      const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
      const top = Math.max(...vals);
      const who = D.ipr.filter(r => Math.abs(r.c[k] * 100 - top) < 1e-9).map(r => r.name);
      const grid = ticks.map(t => `<div class="gridline${t === 20 ? "" : ""}" style="bottom:${y(t)}px"></div>`).join("")
        + `<div class="gridline base" style="bottom:${y(25)}px"></div>`;
      html += `<div class="lcol">
        <div class="plot">${grid}
          <div class="bar" style="height:${y(mean)}px"><span class="bv">${mean.toFixed(1)}</span></div>
          <div class="best" style="bottom:${y(top)}px" title="${esc(who.join(", "))}"></div>
          <div class="best-label" style="bottom:${y(top) + 11}px">${esc(who[0])}${who.length > 1 ? ` +${who.length - 1}` : ""}<br><b>${top.toFixed(1)}</b></div>
        </div>
        <div class="lab"><div class="code">${code}</div><div class="nm">${name}</div><div class="ds">${desc}</div></div>
      </div>`;
    });
    chart.innerHTML = html;
  }

  /* ---------- leaderboard ---------- */
  const lb = { tab: "ipr", key: "c4", fam: null, all: false };
  const IPR_COLS = [
    ["c0", "C0", "No memory"], ["c1", "C1", "Short traj."], ["c2", "C2", "Long traj."],
    ["c3", "C3", "Persona"], ["c4", "C4", "Lifelong"], ["avg", "Avg", "of C0–C4"],
  ];
  const iprVal = (r, k) => (k === "avg" ? r.avg : r.c[+k.slice(1)]);
  const TEN = {
    proactive: {
      note: "F1 (%) on whether the participant wanted help. Pooled over 254 anchors (111 positive); per-user mean over 15 users.",
      cols: [["text.pF1", "Text", "pooled F1"], ["image.pF1", "Photo", "pooled F1"], ["d.pF1", "Δ", "photo − text"],
             ["text.uF1", "Text", "per-user F1"], ["image.uF1", "Photo", "per-user F1"], ["d.uF1", "Δ", "photo − text"]],
      key: "text.pF1",
    },
    emotion: {
      note: "Pooled over 123 events; per-user mean over 15 users. Mood-F1 is multi-label; polarity is 3-class accuracy.",
      cols: [["text.pMood", "Text", "pooled mood-F1"], ["image.pMood", "Photo", "pooled mood-F1"], ["d.pMood", "Δ", "photo − text"],
             ["text.pPol", "Text", "pooled polarity"], ["image.pPol", "Photo", "pooled polarity"], ["d.pPol", "Δ", "photo − text"]],
      key: "text.pMood",
    },
  };
  const tenVal = (r, k) => {
    const [half, m] = k.split(".");
    return half === "d" ? Math.round((r.image[m] - r.text[m]) * 10) / 10 : r[half][m];
  };

  const table = $("#lb-table"), famsBox = $("#lb-fams"), note = $("#lb-note"), count = $("#lb-count"), more = $("#lb-more");

  function famChips(rows) {
    const present = FAM_ORDER.filter(f => rows.some(r => r.family === f));
    famsBox.innerHTML = `<button class="fam${lb.fam ? "" : " on"}" data-fam="">All <span class="c">${rows.length}</span></button>`
      + present.map(f => `<button class="fam${lb.fam === f ? " on" : ""}" data-fam="${f}"><img src="${famLogo(f)}" alt="">${f} <span class="c">${rows.filter(r => r.family === f).length}</span></button>`).join("");
    $$(".fam", famsBox).forEach(b => b.onclick = () => { lb.fam = b.dataset.fam || null; render(); });
  }

  function modelCell(name, fam) {
    return `<td class="l model"><div class="mdl"><img src="${famLogo(fam)}" alt="${fam}"><b>${esc(name)}</b><span class="f">${fam}</span></div></td>`;
  }

  function renderIPR() {
    note.textContent = "";
    famChips(D.ipr);
    const best = Object.fromEntries(IPR_COLS.map(([k]) => [k, Math.max(...D.ipr.map(r => iprVal(r, k)))]));
    const sorted = [...D.ipr].sort((a, b) => iprVal(b, lb.key) - iprVal(a, lb.key));
    const rank = new Map(); sorted.forEach((r, i) => {
      const prev = sorted[i - 1];
      rank.set(r, prev && iprVal(prev, lb.key) === iprVal(r, lb.key) ? rank.get(prev) : i + 1);
    });
    let rows = lb.fam ? sorted.filter(r => r.family === lb.fam) : sorted;
    const total = rows.length;
    if (!lb.fam && !lb.all) rows = rows.slice(0, 12);
    const head = `<thead><tr><th class="l nosort">#</th><th class="l nosort">Model</th>${IPR_COLS.map(([k, t, s]) =>
      `<th data-key="${k}" class="${lb.key === k ? "sorted" : ""}">${t}<small>${s}</small></th>`).join("")}</tr></thead>`;
    const body = rows.map(r => `<tr><td class="rank">${rank.get(r)}</td>${modelCell(r.name, r.family)}${IPR_COLS.map(([k]) => {
      const v = iprVal(r, k), top = Math.abs(v - best[k]) < 1e-9 ? " top" : "";
      if (k === "c4") return `<td><div class="c4"><div class="trk"><div class="fill" style="width:${Math.max(0, (v - 0.25) / 0.55 * 100)}%"></div></div><span class="v${top}">${pct(v)}</span></div></td>`;
      return `<td class="${top.trim()}">${pct(v)}</td>`;
    }).join("")}</tr>`).join("");
    table.innerHTML = head + `<tbody>${body}</tbody>`;
    $$("th[data-key]", table).forEach(th => th.onclick = () => { lb.key = th.dataset.key; render(); });
    const colName = IPR_COLS.find(c => c[0] === lb.key);
    count.textContent = `Showing ${rows.length} of ${total} models · sorted by ${colName[1]} (${colName[2]})`;
    more.style.display = lb.fam ? "none" : "";
    more.textContent = lb.all ? "Show top 12" : "Show all 54 models";
  }

  function renderTen(kind) {
    const T = TEN[kind], rows0 = D[kind];
    note.textContent = T.note;
    famChips(rows0);
    if (!T.cols.some(c => c[0] === lb.key)) lb.key = T.key;
    const best = Object.fromEntries(T.cols.filter(c => !c[0].startsWith("d.")).map(([k]) => [k, Math.max(...rows0.map(r => tenVal(r, k)))]));
    let rows = [...rows0].sort((a, b) => tenVal(b, lb.key) - tenVal(a, lb.key));
    if (lb.fam) rows = rows.filter(r => r.family === lb.fam);
    const head = `<thead><tr><th class="l nosort">#</th><th class="l nosort">Model</th>${T.cols.map(([k, t, s]) =>
      `<th data-key="${k}" class="${lb.key === k ? "sorted" : ""}">${t}<small>${s}</small></th>`).join("")}</tr></thead>`;
    const body = rows.map((r, i) => `<tr><td class="rank">${i + 1}</td>${modelCell(r.name, r.family)}${T.cols.map(([k]) => {
      const v = tenVal(r, k);
      if (k.startsWith("d.")) {
        const c = v > 0 ? "up" : v < 0 ? "dn" : "zero";
        return `<td><span class="delta ${c}">${v > 0 ? "+" : v < 0 ? "−" : "±"}${Math.abs(v).toFixed(1)}</span></td>`;
      }
      return `<td class="${Math.abs(v - best[k]) < 1e-9 ? "top" : ""}">${v.toFixed(1)}</td>`;
    }).join("")}</tr>`).join("");
    table.innerHTML = head + `<tbody>${body}</tbody>`;
    $$("th[data-key]", table).forEach(th => th.onclick = () => { lb.key = th.dataset.key; render(); });
    const c = T.cols.find(x => x[0] === lb.key);
    count.textContent = `${rows.length} checkpoints · sorted by ${c[1]} ${c[2]} · Δ: red = photo helps, blue = photo hurts`;
    more.style.display = "none";
  }

  function render() { lb.tab === "ipr" ? renderIPR() : renderTen(lb.tab); }
  if (table) {
    const lbTabs = $$(".lb-top .tab");  // only the leaderboard's tabs (the hero dial has its own)
    lbTabs.forEach(t => t.onclick = () => {
      lbTabs.forEach(x => x.classList.toggle("on", x === t));
      lb.tab = t.dataset.tab; lb.fam = null; lb.key = lb.tab === "ipr" ? "c4" : TEN[lb.tab].key; render();
    });
    more.onclick = () => { lb.all = !lb.all; render(); };
    render();
  }

  /* ---------- authors, affiliations, logo wall, partner ---------- */
  const A = window.JB_AUTHORS || [], AF = window.JB_AFFS || [];
  const authorsBox = $("#authors");
  if (authorsBox) {
    authorsBox.innerHTML = A.map((a, i) => {
      const marks = a.aff.join(",") + (a.equal ? ",*" : "") + (a.corr ? ",†" : "");
      return `<span class="a">${esc(a.name)}<sup>${marks}</sup></span>${i < A.length - 1 ? '<span class="sep">·</span>' : ""}`;
    }).join(" ");
    const affBox = $("#affils");
    if (affBox) affBox.innerHTML = AF.map((n, i) => `<div><sup>${i + 1}</sup>${esc(n)}</div>`).join("");
  }
  const wall = $("#wall");
  if (wall) {
    wall.innerHTML = mxLockup(34) + LOGOS.map(l => {
      const wide = l.w / l.h > 8;
      const s = fit(l.w, l.h, 3000, 40, wide ? 150 : 128, wide ? 11 : 15);
      return `<a title="${esc(l.name)}">${logoImg(l, s)}</a>`;
    }).join("");
  }

  /* ---------- BibTeX ---------- */
  const bib = $("#bibtex");
  if (bib && window.JB_BIBTEX) {  // light syntax colouring: entry type, field names, punctuation
    bib.innerHTML = esc(window.JB_BIBTEX)
      .replace(/^(@\w+)\{/m, '<span class="t">$1</span><span class="p">{</span>')
      .replace(/^(\s+)(\w+)(\s*=)/gm, '$1<span class="k">$2</span><span class="p">$3</span>');
  }
  const copy = $("#copy-bib");
  if (copy) copy.onclick = async () => {
    try { await navigator.clipboard.writeText(window.JB_BIBTEX); }
    catch { const r = document.createRange(); r.selectNodeContents(bib); const s = getSelection(); s.removeAllRanges(); s.addRange(r); document.execCommand("copy"); }
    $("span", copy).textContent = "Copied"; setTimeout(() => { $("span", copy).textContent = "Copy"; }, 1600);
  };

  /* ---------- lightbox ---------- */
  const lbx = $("#lightbox");
  if (lbx) {
    $$("[data-lightbox]").forEach(b => b.onclick = () => {
      $("img", lbx).src = b.dataset.lightbox; $(".cap", lbx).textContent = b.dataset.cap || ""; lbx.classList.add("on");
    });
    lbx.onclick = () => lbx.classList.remove("on");
    addEventListener("keydown", e => { if (e.key === "Escape") lbx.classList.remove("on"); });
  }

  /* ---------- nav: hairline under the bar once the page scrolls (active page is set by tools/build.py) ---------- */
  const nav = $("#nav");
  if (nav) {
    const onScroll = () => nav.classList.toggle("scrolled", scrollY > 8);
    addEventListener("scroll", onScroll, { passive: true }); onScroll();
  }
})();
