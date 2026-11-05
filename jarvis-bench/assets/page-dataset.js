/* Dataset page: copy button for the prepare-data command, and the hover layer of the two validation charts. */
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

/* hover layer: one tooltip for the dumbbell rows (anchor-only vs full) and the slope chart (synthesizer swap); values also sit in the table twins */
(() => {
  const dumb = document.querySelectorAll(".ds-dumb .db");
  const svg = document.querySelector(".ds-slope");
  if (!dumb.length && !svg) return;
  const tip = document.createElement("div");
  tip.className = "ds-tip";
  document.body.appendChild(tip);
  const move = (x, y) => {
    const w = tip.offsetWidth, h = tip.offsetHeight;
    let left = x + 14, top = y - h - 12;
    if (left + w > innerWidth - 8) left = x - w - 14;
    if (top < 8) top = y + 18;
    tip.style.transform = `translate(${Math.round(left)}px, ${Math.round(top)}px)`;
  };
  const show = (html, x, y) => { tip.innerHTML = html; tip.classList.add("on"); move(x, y); };
  const hide = () => tip.classList.remove("on");

  dumb.forEach(el => {
    const d = el.dataset;
    const cond = d.c === "C2" ? "Long Trajectory (C2)" : "Lifelong Memory (C4)";
    const html = `<b>${d.m}</b><span>${cond} · Implicit Preference accuracy</span>` +
      `<div class="r"><i class="a"></i>anchor-only trajectory<em>${d.a}%</em></div><div class="r"><i class="f"></i>full trajectory<em>${d.f}%</em></div>`;
    el.addEventListener("mouseenter", e => show(html, e.clientX, e.clientY));
    el.addEventListener("mousemove", e => move(e.clientX, e.clientY));
    el.addEventListener("mouseleave", hide);
  });

  if (svg) {
    const lines = [...svg.querySelectorAll(".s")], pts = [...svg.querySelectorAll(".p")], hits = [...svg.querySelectorAll(".hit")];
    const SETTING = { a: "(a) 42 users, GPT synthesis", b: "(b) 15 users, GPT synthesis", c: "(c) 15 users, Qwen3.6-Plus synthesis" };
    const focus = m => {
      svg.classList.toggle("focus", !!m);
      lines.forEach(l => l.classList.toggle("on", l.dataset.m === m));
      pts.forEach(p => p.classList.toggle("on", p.dataset.m === m));
    };
    hits.forEach(h => {
      h.addEventListener("mouseenter", e => {
        focus(h.dataset.m);
        show(`<b>${h.dataset.m}</b><span>${SETTING[h.dataset.k]}</span><div class="r">Lifelong Memory (C4) accuracy<em>${h.dataset.v}%</em></div>`, e.clientX, e.clientY);
      });
      h.addEventListener("mousemove", e => move(e.clientX, e.clientY));
      h.addEventListener("mouseleave", () => { focus(null); hide(); });
    });
    lines.forEach(l => {
      l.addEventListener("mouseenter", () => focus(l.dataset.m));
      l.addEventListener("mouseleave", () => focus(null));
    });
  }
})();
