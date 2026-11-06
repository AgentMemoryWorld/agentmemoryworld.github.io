/* Tasks page (tasks.html): the "What the benchmark found" visuals under each task card.
   Marks are HTML/CSS and every label is real text. Numbers come from window.JB_DATA (assets/data.js, the paper's
   tab:matrix-a/b, tab:proactive and tab:emotion) and from the appendix tables quoted inline below. */
(() => {
  const D = window.JB_DATA;
  if (!D) return;
  const $ = (s, r = document) => r.querySelector(s);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const f1 = v => (Math.round(Math.abs(v) * 10) / 10).toFixed(1);
  const num = v => (v < 0 ? "−" : "") + f1(v);
  const sgn = v => (v > 0 ? "+" : v < 0 ? "−" : "") + f1(v);

  /* ---------- one tooltip for every mark (hover and keyboard focus) ---------- */
  const tip = document.createElement("div");
  tip.className = "tk-tip";
  document.body.appendChild(tip);
  const show = t => {
    tip.textContent = t.dataset.tip;
    const b = t.getBoundingClientRect();
    tip.style.left = `${b.left + b.width / 2 + scrollX}px`;
    tip.style.top = `${b.top + scrollY}px`;
    tip.classList.add("on");
  };
  const hide = () => tip.classList.remove("on");
  document.addEventListener("pointerover", e => { const t = e.target.closest("[data-tip]"); if (t) show(t); });
  document.addEventListener("pointerout", e => { if (e.target.closest("[data-tip]")) hide(); });
  document.addEventListener("focusin", e => { const t = e.target.closest("[data-tip]"); if (t) show(t); });
  document.addEventListener("focusout", e => { if (e.target.closest("[data-tip]")) hide(); });

  /* ---------- row-chart helpers: a label column, a track with marks, value columns ---------- */
  const scale = (lo, hi) => v => Math.max(0, Math.min(100, (v - lo) / (hi - lo) * 100));
  const grid = (x, ticks) => ticks.map(t => `linear-gradient(90deg, transparent calc(${x(t)}% - .5px), var(--grid) calc(${x(t)}% - .5px), var(--grid) calc(${x(t)}% + .5px), transparent calc(${x(t)}% + .5px))`).join(",");
  const head = cells => cells.map(c => { const [t, cls] = c.split("|"); return `<span class="tk-rc-h${cls ? " " + cls : ""}">${t}</span>`; }).join("");
  const axis = (x, ticks, fmt, vcols, extra = "") => `<span></span><div class="tk-ax">${ticks.map(t => `<span style="left:${x(t)}%">${fmt(t)}</span>`).join("")}${extra}</div>${"<span></span>".repeat(vcols)}`;
  const mark = (x, cls, tipText) => `<i class="tk-mk${cls ? " " + cls : ""}" style="left:${x}%" data-tip="${esc(tipText)}" tabindex="0"></i>`;
  const table = (caption, cols, rows) => `<details class="tk-tbl"><summary>Show as a table</summary><table><caption>${caption}</caption><thead><tr>${cols.map(c => `<th>${c}</th>`).join("")}</tr></thead><tbody>${rows.map(r => `<tr>${r.map((c, i) => i ? `<td>${c}</td>` : `<th scope="row">${c}</th>`).join("")}</tr>`).join("")}</tbody></table></details>`;

  // beeswarm: spread overlapping dots vertically inside their track; re-run whenever the layout changes
  function swarm(trk) {
    const W = trk.clientWidth, H = trk.clientHeight, d = +(trk.dataset.d || 7), step = d * .87;
    const dots = [...trk.querySelectorAll(".tk-mk")].map(el => ({ el, x: parseFloat(el.style.left) / 100 * W, y: 0 }));
    dots.sort((a, b) => a.x - b.x);
    const placed = [], maxOff = H / 2 - d / 2 - 1;
    dots.forEach(p => {
      let y = null;
      for (let i = 0; y === null && i * step <= maxOff; i++) {
        for (const s of i ? [1, -1] : [1]) {
          const cand = s * i * step;
          if (!placed.some(q => (q.x - p.x) ** 2 + (q.y - cand) ** 2 < d * d)) { y = cand; break; }
        }
      }
      p.y = y === null ? 0 : y;
      placed.push(p);
      p.el.style.top = `calc(50% + ${p.y.toFixed(1)}px)`;
    });
  }
  const swarmAll = () => document.querySelectorAll("[data-swarm]").forEach(swarm);
  let raf = 0;
  new ResizeObserver(() => { cancelAnimationFrame(raf); raf = requestAnimationFrame(swarmAll); }).observe(document.body);

  /* ---------- 01 · the user-memory ladder: 54 models at each level ----------
     Per-model accuracies: assets/data.js (Appendix D tab:matrix-a / tab:matrix-b). Means and best models are computed here. */
  const LEVELS = [["C0", "No Memory", "no user context"], ["C1", "Short Trajectory", "first 14 days"], ["C2", "Long Trajectory", "all days"], ["C3", "Persona Memory", "all days and the persona"], ["C4", "Lifelong Memory", "plus the survey insight"]];
  const ladder = $("#viz-ladder");
  if (ladder) {
    const x = scale(20, 80), ticks = [30, 40, 50, 60, 70, 80];
    const lv = LEVELS.map(([code, name, sub], k) => {
      const pts = D.ipr.map(r => ({ v: r.c[k] * 100, n: r.name })).sort((a, b) => a.v - b.v);
      const mean = pts.reduce((s, p) => s + p.v, 0) / pts.length;
      const top = pts[pts.length - 1].v;
      return { code, name, sub, pts, mean, top, best: pts.filter(p => p.v === top).map(p => p.n) };
    });
    let h = `<div class="tk-rc tk-rc-ladder" style="--grid-img:${grid(x, ticks)}">`
      + head(["Memory level", `Accuracy on the 100 survey questions, % &middot; one dot per model, the tick is the mean &nbsp; <i class="tk-key line"></i>chance, 25%`, "mean|v", "step|v step", "best model|b"]);
    lv.forEach((s, k) => {
      h += `<div class="tk-rc-l"><b>${s.code}</b>${s.name}<small>${s.sub}</small></div>
        <div class="tk-trk tall" data-swarm><i class="tk-chance" style="left:${x(25)}%"></i>${s.pts.map(p => mark(x(p.v), p.v === s.top ? "top" : "", `${p.n} · ${s.code} · ${f1(p.v)}%`)).join("")}<i class="tk-mean" style="left:${x(s.mean)}%" data-tip="mean of the 54 models · ${f1(s.mean)}%" tabindex="0"></i></div>
        <div class="tk-rc-v">${f1(s.mean)}</div><div class="tk-rc-v step">${k ? sgn(s.mean - lv[k - 1].mean) : ""}</div>
        <div class="tk-rc-b">${esc(s.best[0])}${s.best.length > 1 ? ` <small>+${s.best.length - 1}</small>` : ""}<b>${f1(s.top)}</b></div>`;
    });
    h += axis(x, ticks, t => t, 3) + `</div>`;
    h += table("Implicit Preference Reasoning accuracy, %: mean over the 54 models and the best model at each memory level (assets/data.js, from Appendix D)",
      ["Level", "Mean", "Step", "Best model", "Best"], lv.map((s, k) => [`${s.code} ${s.name}`, f1(s.mean), k ? sgn(s.mean - lv[k - 1].mean) : "", esc(s.best.join(", ")), f1(s.top)]));
    ladder.innerHTML = h;
  }

  /* ---------- 02 · the proactive pool, and per-user mean versus pooled F1 ----------
     Pool: 254 anchors, 111 positive, 143 negative, from a subset of users (Section 4, Proactive Help protocol; Appendix N, user selection).
     F1 values: tab:proactive via assets/data.js. */
  const waffle = $("#viz-waffle");
  if (waffle) {
    const N = 254, POS = 111;
    let cells = "";
    for (let i = 0; i < N; i++) cells += `<i${i < POS ? ' class="on"' : ""}></i>`;
    waffle.innerHTML = `<div class="tk-waffle" role="img" aria-label="254 anchor events; the participant flagged 111 as moments to step in and 143 as not">${cells}</div>
      <div class="tk-key-row"><span><i class="tk-key on"></i><b>111</b> help now <small>agentHelp = 1</small></span><span><i class="tk-key"></i><b>143</b> not now <small>agentHelp = 0</small></span></div>`;
  }
  const dumb = $("#viz-dumbbell");
  if (dumb) {
    const x = scale(0, 80), ticks = [0, 20, 40, 60, 80];
    const rows = [...D.proactive].sort((a, b) => b.text.pF1 - a.text.pF1);
    let h = `<div class="tk-rc tk-rc-dumb" style="--grid-img:${grid(x, ticks)}">`
      + head(["Model", `F1, % &middot; <i class="tk-key hollow"></i>per-user mean &nbsp; <i class="tk-key dot"></i>pooled, 254 anchors`, "user|v", "pool|v"]);
    rows.forEach(r => {
      const u = r.text.uF1, p = r.text.pF1;
      h += `<div class="tk-rc-l">${esc(r.name)}<small>${esc(r.family)} family</small></div>
        <div class="tk-trk"><i class="tk-seg" style="left:${x(Math.min(u, p))}%;width:${Math.abs(x(p) - x(u))}%"></i>${mark(x(u), "hollow", `${r.name} · per-user mean F1 ${f1(u)}%`)}${mark(x(p), "", `${r.name} · pooled F1 ${f1(p)}%`)}</div>
        <div class="tk-rc-v">${f1(u)}</div><div class="tk-rc-v">${f1(p)}</div>`;
    });
    h += axis(x, ticks, t => t, 2) + `</div>`;
    h += table("Proactive Help Prediction with text input: F1, % (tab:proactive via assets/data.js)",
      ["Model", "Per-user mean F1", "Pooled F1", "Pooled minus per-user"], rows.map(r => [esc(r.name), f1(r.text.uF1), f1(r.text.pF1), sgn(r.text.pF1 - r.text.uF1)]));
    dumb.innerHTML = h;
  }

  /* ---------- 03 · the 123 emotion events, and where the ten models land ----------
     Split: 78 positive, 22 negative, 23 mixed (Section 4, Emotion-Aware protocol; Appendix N). Metrics: tab:emotion via assets/data.js.
     Segment colours are one pink in three lightness steps (validated ordinal ramp). */
  const split = $("#viz-split");
  if (split) {
    const parts = [["positive", 78, "#B5546E", "#FFFFFF"], ["negative", 22, "#C8768D", "#FFFFFF"], ["mixed", 23, "#D597A9", "#23211E"]];
    split.innerHTML = `<div class="tk-segbar" role="img" aria-label="123 events: 78 positive, 22 negative, 23 mixed">${parts.map(([n, v, c, t]) => `<span style="flex:${v} 1 0;background:${c};color:${t}" data-tip="${v} ${n} events · ${f1(v / 123 * 100)}%" tabindex="0">${v}</span>`).join("")}</div>
      <div class="tk-key-row">${parts.map(([n, , c]) => `<span><i class="tk-key" style="background:${c};box-shadow:none"></i>${n}</span>`).join("")}</div>
      <p class="tk-viz-note">Polarity is derived from the mood keywords the participant wrote on the event.</p>`;
  }
  const strips = $("#viz-strips");
  if (strips) {
    const x = scale(0, 80), ticks = [0, 20, 40, 60, 80];
    const rows = [["Polarity accuracy", "three classes", "pPol", 100 / 3], ["Mood-F1", "mood keywords", "pMood", null]];
    let h = `<div class="tk-rc tk-rc-strip" style="--grid-img:${grid(x, ticks)}">`
      + head(["Metric", `Pooled over the 123 events, % &middot; <i class="tk-key hollow"></i>text input &nbsp; <i class="tk-key dot"></i>photograph &nbsp; <i class="tk-key line"></i>chance, 33%`, "best|b"]);
    rows.forEach(([name, sub, key, chance]) => {
      const pts = D.emotion.flatMap(r => [["text", r.text[key], r.name], ["photograph", r.image[key], r.name]]);
      const best = pts.reduce((a, b) => (b[1] > a[1] ? b : a));
      h += `<div class="tk-rc-l">${name}<small>${sub}</small></div>
        <div class="tk-trk tall" data-swarm data-d="8">${chance ? `<i class="tk-chance" style="left:${x(chance)}%"></i>` : ""}${pts.map(([m, v, n]) => mark(x(v), m === "text" ? "hollow" : "", `${n} · ${m} · ${f1(v)}%`)).join("")}</div>
        <div class="tk-rc-b">${esc(best[2])}, ${best[0] === "text" ? "text" : "photo"}<b>${f1(best[1])}</b></div>`;
    });
    h += axis(x, ticks, t => t, 1) + `</div>`;
    h += table("Emotion-Aware Modeling, pooled over 123 events, % (tab:emotion via assets/data.js)",
      ["Model", "Polarity, text", "Polarity, photo", "Mood-F1, text", "Mood-F1, photo"], D.emotion.map(r => [esc(r.name), f1(r.text.pPol), f1(r.image.pPol), f1(r.text.pMood), f1(r.image.pMood)]));
    strips.innerHTML = h;
  }

  /* ---------- 04 · S1 drop-one diagonal across three model families ----------
     Appendix N tab:cdt-families: change in same-domain accuracy (as a fraction) when the domain's events are removed from the
     Long Trajectory (C2). GPT-5 is the mean of GPT-5, GPT-5-Mini and GPT-5-Nano. Event subdomains per domain: Appendix B tab:domain-mapping. */
  const S1 = [
    ["leisure", "Leisure", "entertainment", -0.128, -0.155, -0.105],
    ["work_study", "Work and study", "work", -0.068, -0.108, -0.075],
    ["shopping", "Shopping", "shopping", -0.064, -0.069, -0.041],
    ["food_dining", "Food and dining", "food", -0.060, -0.062, -0.035],
    ["commuting_travel", "Commuting and travel", "weather, travel", -0.050, -0.088, -0.058],
    ["social_wellbeing", "Social wellbeing", "physical, exercise, event", -0.025, -0.039, -0.016],
    ["daily_routine", "Daily routine", "wake, bedtime, nap", -0.007, -0.018, -0.004],
  ];
  const s1 = $("#viz-s1");
  if (s1) {
    const x = scale(-17, 0), ticks = [-15, -10, -5, 0];
    const FAM = [["GPT-5, mean of three sizes", ""], ["Qwen3.6-27B", "hollow"], ["Gemma-4-31B", "hollow sq"]];
    let h = `<div class="tk-rc tk-rc-s1" style="--grid-img:${grid(x, ticks)}">`
      + head(["Domain removed", `Points lost on that domain's questions &middot; <i class="tk-key dot"></i>GPT-5, mean of three sizes &nbsp; <i class="tk-key hollow"></i>Qwen3.6-27B &nbsp; <i class="tk-key hollow sq"></i>Gemma-4-31B`, "GPT-5|v"]);
    S1.forEach(([id, name, ev, ...vals]) => {
      h += `<div class="tk-rc-l">${name}<small>${ev} events</small></div>
        <div class="tk-trk"><i class="tk-zero" style="left:${x(0)}%"></i>${vals.map((v, i) => mark(x(v * 100), FAM[i][1], `${FAM[i][0]} · drop ${id} · ${sgn(v * 100)} points`)).join("")}</div>
        <div class="tk-rc-v">${num(vals[0] * 100)}</div>`;
    });
    h += axis(x, ticks, t => (t ? "−" + Math.abs(t) : "0"), 1) + `</div>`;
    h += table("Cross-Domain Transfer, S1 drop-one diagonal: change in same-domain accuracy in points relative to the Long Trajectory (Appendix N tab:cdt-families)",
      ["Domain removed", "GPT-5, mean of 3", "Qwen3.6-27B", "Gemma-4-31B"], S1.map(([id, name, , g, q, m]) => [`${name} <small>${id}</small>`, num(g * 100), num(q * 100), num(m * 100)]));
    s1.innerHTML = h;
  }

  swarmAll();
})();
