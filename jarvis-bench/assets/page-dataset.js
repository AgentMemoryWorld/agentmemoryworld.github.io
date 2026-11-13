/* Dataset page: copy button for the data-loading example, and the hover layer of the two validation charts. */
(() => {
  const btn = document.getElementById("ds-copy");
  const code = document.getElementById("ds-cmd");
  if (!btn || !code) return;
  const label = btn.querySelector("span");
  btn.onclick = async () => {
    const text = code.textContent.trim();
    try { await navigator.clipboard.writeText(text); }
    catch {
      const r = document.createRange(); r.selectNodeContents(code);
      const s = getSelection(); s.removeAllRanges(); s.addRange(r); document.execCommand("copy");
    }
    label.textContent = "Copied";
    setTimeout(() => { label.textContent = "Copy"; }, 1600);
  };
})();

/* hover layer: one tooltip for the dumbbell rows (anchor-only vs full) and the slope chart (synthesizer swap). Hover and keyboard focus
   show the same readout; every value also sits in the Table twin, so the tooltip never gates anything. */
(() => {
  const rows = [...document.querySelectorAll(".ds-dumb .dr")].filter(r => r.querySelector(".db"));
  const slopes = [...document.querySelectorAll(".ds-slope")];
  if (!rows.length && !slopes.length) return;
  const tip = document.createElement("div");
  tip.className = "ds-tip";
  document.body.appendChild(tip);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  // beside the pointer on the asked side, flipped when that side has no room, and never past the viewport edges (phones are 360-390px wide)
  const move = (x, y, side) => {
    const w = tip.offsetWidth, h = tip.offsetHeight, vw = innerWidth;
    const right = x + 14, left0 = x - w - 14;
    let left = side === "left" ? left0 : right;
    if (left + w > vw - 8) left = left0;
    if (left < 8) left = right + w <= vw - 8 ? right : Math.max(8, (vw - w) / 2);
    left = Math.min(left, Math.max(8, vw - w - 8));
    let top = y - h - 12;
    if (top < 8) top = y + 18;
    tip.style.transform = `translate(${Math.round(left)}px, ${Math.round(top)}px)`;
  };
  const show = (html, x, y, side) => { tip.innerHTML = html; tip.classList.add("on"); move(x, y, side); };
  const hide = () => tip.classList.remove("on");
  const above = el => { const b = el.getBoundingClientRect(); return [b.left + b.width / 2, b.top]; };

  // 01 dumbbell: the whole row (name, marks, delta) is the hover target; the mark is the keyboard stop
  const COND = { C2: "Long Trajectory (C2)", C4: "Lifelong Memory (C4)" };
  rows.forEach(row => {
    const el = row.querySelector(".db"), d = el.dataset;
    const html = () => `<b>${esc(d.m)}</b><span>${COND[d.c]} · Implicit Preference accuracy</span>` +
      `<div class="r"><i class="f"></i>full trajectory, as released<em>${esc(d.f)}%</em></div>` +
      `<div class="r"><i class="a"></i>anchor-only, synthetic events removed<em>${esc(d.a)}%</em></div>` +
      `<div class="r sum">Δ anchor-only − full<em>${esc(d.d)} pts</em></div>`;
    row.addEventListener("mouseenter", e => show(html(), e.clientX, e.clientY));
    row.addEventListener("mousemove", e => move(e.clientX, e.clientY));
    row.addEventListener("mouseleave", hide);
    el.addEventListener("focus", () => show(html(), ...above(el)));
    el.addEventListener("blur", hide);
  });

  // 02 slope: the nearest dot within 24px wins (dots 0.3 points apart overlap); a line, a label row or a key-list row stands for its model
  // at the (c) end; the tooltip opens on the left of the pointer in the (c) column so it never covers the names. Tab reaches every dot.
  const SETTING = { a: "(a) all users, gpt-5-mini", b: "(b) random subset, gpt-5-mini", c: "(c) same subset, Qwen3.6-Plus" };
  slopes.forEach(root => {
    const key = root.parentElement.querySelector(".ds-slope-key");
    const marks = [...root.querySelectorAll("[data-m]"), ...(key ? key.querySelectorAll("[data-m]") : [])];
    const hits = [...root.querySelectorAll(".hit")];
    const cHit = m => hits.find(h => h.dataset.m === m && h.dataset.k === "c");
    const side = h => h.dataset.k === "c" ? "left" : "right";
    const focus = m => { root.classList.toggle("focus", !!m); marks.forEach(n => n.classList.toggle("on", n.dataset.m === m)); };
    const html = h => {
      const d = h.dataset;
      return `<b>${esc(d.m)}</b><span>Lifelong Memory (C4) accuracy</span>` +
        ["a", "b", "c"].map(k => `<div class="r${k === d.k ? "" : " dim"}"><i class="k"></i>${SETTING[k]}<em>${esc(d["v" + k])}%</em></div>`).join("") +
        `<div class="r sum">Δ (c) − (b)<em>${esc(d.d)} pts</em></div>`;
    };
    const pick = (x, y) => {
      let best = null, bd = 24 * 24;
      for (const h of hits) {
        const b = h.getBoundingClientRect(), dx = b.left + b.width / 2 - x, dy = b.top + b.height / 2 - y, q = dx * dx + dy * dy;
        if (q < bd) { bd = q; best = h; }
      }
      return best;
    };
    let cur = null;
    const set = (h, x, y) => {
      if (h) {
        if (h !== cur) { cur = h; focus(h.dataset.m); tip.innerHTML = html(h); tip.classList.add("on"); }
        move(x, y, side(h));
      } else if (cur) { cur = null; focus(null); hide(); }
    };
    root.addEventListener("mousemove", e => {
      const over = e.target.closest ? e.target.closest("[data-m]") : null;
      set(pick(e.clientX, e.clientY) || (over && cHit(over.dataset.m)), e.clientX, e.clientY);
    });
    root.addEventListener("mouseleave", () => set(null));
    if (key) {
      key.addEventListener("mousemove", e => { const li = e.target.closest("[data-m]"); set(li && cHit(li.dataset.m), e.clientX, e.clientY); });
      key.addEventListener("mouseleave", () => set(null));
    }
    hits.forEach(h => {   // keyboard: Tab through the dots, same readout as hover
      h.addEventListener("focus", () => { focus(h.dataset.m); show(html(h), ...above(h), side(h)); });
      h.addEventListener("blur", () => { focus(null); hide(); });
    });
  });
})();
