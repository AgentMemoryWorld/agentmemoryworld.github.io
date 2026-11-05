/* Home hero: the life-clock watch face.
   1. Hands follow the visitor's local time (24-hour dial, midnight at the top).
   2. Day / Week / Month tabs switch the dial between one day, the last 7 days and the whole month (30 days).
   3. Pointing at the dial shows that day and time, what was logged, and the most common activities then.
   4. The faces are buttons: they swap the Jarvis card for that moment's story.
   5. The legend is eight sub-dials (when in the day, hours per day) for the current scale, and focuses the dial.
   The activity pattern is illustrative (tools/make_hero.py). */
(() => {
  const clock = document.querySelector('.clock-a');
  if (!clock) return;
  const wrap = clock.closest('.clock-wrap');
  const art = clock.closest('.hero-art');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const LABEL = { wake: 'Wake', transit: 'Transit', work: 'Work', food: 'Food', exercise: 'Exercise', shopping: 'Shopping', leisure: 'Leisure', sleep: 'Sleep' };
  const COL = { wake: '#E0A43A', transit: '#4E9E96', work: '#4A86B0', food: '#D0804D', exercise: '#5E9E68', shopping: '#8E76BE', leisure: '#C9688A', sleep: '#6C70B8' };
  const C = +clock.dataset.c, R0 = +clock.dataset.r0, R1 = +clock.dataset.r1, K = +clock.dataset.k;
  const DAYS = +clock.dataset.days, DIAL = +clock.dataset.dial, DR = +clock.dataset.dr, DW = +clock.dataset.dw;
  const ringR = d => { const t = d / (DAYS - 1); return R0 + (R1 - R0) * ((1 - K) * t + K * t * t); };
  const read = g => [...g.querySelectorAll('path')].map(p => ({ k: p.dataset.k, a: +p.dataset.a, b: +p.dataset.b }));
  const covers = (x, h) => (x.a <= x.b ? h >= x.a && h <= x.b : h >= x.a || h <= x.b);
  const dur = x => (x.b - x.a + 24) % 24;
  const hhmm = h => { const m = Math.round(((h % 24) + 24) % 24 * 60) % 1440; return String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0'); };

  // the three scales: which day rings exist and where they sit
  const SCALES = {
    month: { rings: [...clock.querySelectorAll('.layer-all .day')].map(g => ({ d: +g.dataset.day, r: ringR(+g.dataset.day), acts: read(g) })), name: '30 days' },
    week: { rings: [...clock.querySelectorAll('.layer-week .wday')].map(g => ({ d: +g.dataset.day, r: +g.dataset.r, acts: read(g) })), name: '7 days' },
    day: { rings: [...clock.querySelectorAll('.layer-day .dday')].map(g => ({ d: +g.dataset.day, r: DR, acts: read(g) })), name: '1 day' },
  };
  let mode = 'month';

  /* ---------- 1. live hands ---------- */
  (() => {
    const H = [...clock.querySelectorAll('.hrs')], M = clock.querySelector('.mins'), S = clock.querySelector('.secs');
    const angles = d => { const s = d.getSeconds() + d.getMilliseconds() / 1000, m = d.getMinutes() + s / 60, h = d.getHours() + m / 60; return [h / 24 * 360, m / 60 * 360, s / 60 * 360]; };
    const set = (el, deg) => (Array.isArray(el) ? el : [el]).forEach(e => { if (e) e.style.transform = `rotate(${deg}deg)`; });
    const draw = (k = 1) => { const [h, m, s] = angles(new Date()); set(H, h * k); set(M, m * k); set(S, s * k); };
    if (reduce) { draw(); setInterval(draw, 30000); return; }
    const t0 = performance.now(), ease = x => 1 - Math.pow(1 - x, 3);
    const tick = now => { const x = Math.min(1, (now - t0) / 1400); draw(x < 1 ? ease(x) : 1); requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  })();

  /* ---------- 3. explorer ---------- */
  const tip = wrap.querySelector('.clock-tip');
  const cursor = clock.querySelector('.cursor'), arm = clock.querySelector('.cur-arm');
  const ring = clock.querySelector('.cur-ring'), dot = clock.querySelector('.cur-dot');
  let pinned = false;
  function at(evt) {
    const pt = clock.createSVGPoint(); pt.x = evt.clientX; pt.y = evt.clientY;
    const p = pt.matrixTransform(clock.getScreenCTM().inverse());
    const dx = p.x - C, dy = p.y - C, r = Math.hypot(dx, dy);
    const S = SCALES[mode];
    if (mode === 'day' ? Math.abs(r - DR) > DW / 2 + 6 : r < S.rings[0].r - 12 || r > DIAL + 2) return null;
    let a = Math.atan2(dy, dx) + Math.PI / 2; if (a < 0) a += 2 * Math.PI;
    const h = Math.round(a / (2 * Math.PI) * 24 * 6) / 6 % 24;
    let best = S.rings[0];
    S.rings.forEach(x => { if (Math.abs(x.r - r) < Math.abs(best.r - r)) best = x; });
    return { h, ring: best };
  }
  function render(evt, q) {
    const S = SCALES[mode], { h, ring: rg } = q;
    const on = rg.acts.find(x => covers(x, h));
    const weekend = rg.d % 7 >= 5;
    let html = `<div class="ct-h"><span>Day ${rg.d + 1}${weekend ? ' · weekend' : ''}</span><span>${hhmm(h)}</span></div>` +
      (on ? `<div class="ct-on"><i style="background:${COL[on.k]}"></i><b>${LABEL[on.k]}</b><span>${hhmm(on.a)}–${hhmm(on.b)}</span></div>`
          : `<div class="ct-on none">Nothing logged at this time</div>`);
    if (S.rings.length > 1) {
      const count = {};
      S.rings.forEach(x => { const y = x.acts.find(z => covers(z, h)); if (y) count[y.k] = (count[y.k] || 0) + 1; });
      const top = Object.entries(count).sort((a, b) => b[1] - a[1]).slice(0, 3);
      html += `<div class="ct-sum"><div class="ct-sh">At ${hhmm(h)}, across ${S.name}</div>` +
        (top.length ? top.map(([k, n]) => `<div class="ct-row"><span>${LABEL[k]}</span><span class="ct-bar"><i style="width:${n / S.rings.length * 100}%;background:${COL[k]}"></i></span><span class="ct-n">${n}</span></div>`).join('')
                    : `<div class="ct-row none">No activity on any day</div>`) + `</div>`;
    }
    tip.innerHTML = html; tip.hidden = false;
    const box = wrap.getBoundingClientRect(), cb = clock.getBoundingClientRect();
    const px = evt.clientX - box.left, py = evt.clientY - box.top;
    const mx = cb.left - box.left + cb.width / 2, my = cb.top - box.top + cb.height / 2;
    const w = tip.offsetWidth, hh = tip.offsetHeight;
    let x = px >= mx ? px + 16 : px - w - 16, y = py >= my ? py + 14 : py - hh - 14;
    x = Math.min(Math.max(x, -16), box.width - w + 40); y = Math.min(Math.max(y, -10), box.height - hh);
    tip.style.left = x + 'px'; tip.style.top = y + 'px';
    arm.style.transform = `rotate(${h / 24 * 360}deg)`;
    ring.setAttribute('r', rg.r.toFixed(1));
    const ang = h / 24 * 2 * Math.PI - Math.PI / 2;
    dot.setAttribute('cx', (C + rg.r * Math.cos(ang)).toFixed(1));
    dot.setAttribute('cy', (C + rg.r * Math.sin(ang)).toFixed(1));
    cursor.classList.add('on'); wrap.classList.add('exploring');
  }
  function hide() { if (pinned) return; tip.hidden = true; cursor.classList.remove('on'); wrap.classList.remove('exploring'); }
  clock.addEventListener('pointermove', e => { if (pinned) return; const q = at(e); q ? render(e, q) : hide(); });
  clock.addEventListener('pointerleave', hide);
  clock.addEventListener('click', e => { const q = at(e); pinned = false; if (!q) { hide(); return; } render(e, q); pinned = true; });
  document.addEventListener('click', e => { if (!wrap.contains(e.target)) { pinned = false; hide(); } });

  /* ---------- 4. faces ---------- */
  // one Jarvis card and one set of faces per scale; a face swaps its scale's card for that moment's story
  const cards = Object.fromEntries([...wrap.querySelectorAll('.jv-say[data-scale]')].map(c => [c.dataset.scale, { el: c, html: c.innerHTML }]));
  const moments = [...wrap.querySelectorAll('.moment')];
  function select(m) {
    moments.forEach(x => x.classList.toggle('on', x === m));
    Object.values(cards).forEach(c => { if (!m || c.el.dataset.scale !== m.dataset.scale) { c.el.innerHTML = c.html; c.el.classList.remove('story'); } });
    if (!m) return;
    const s = m.dataset, card = cards[s.scale];
    if (!card) return;
    const text = s.kind === 'entry' ? `<span class="st-q">&ldquo;${s.entry}&rdquo;</span>` : `<span class="st-p">${s.entry}</span>`;
    card.el.innerHTML = `<b class="st-h">${s.time} · ${s.title.toUpperCase()}</b>${text}` +
      `<span class="st-m ${s.mk}">${s.mood}</span><span class="st-t ${s.tk}">${s.task}</span>` +
      (s.scale === 'day' && s.time === '23:40' ? `<span class="st-j"><b>JARVIS</b>${card.html.replace(/^<b>[^<]*<\/b>/, '')}</span>` : '');
    card.el.classList.add('story');
  }
  moments.forEach(m => m.addEventListener('click', e => { e.stopPropagation(); select(m.classList.contains('on') ? null : m); }));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { pinned = false; hide(); select(null); } });

  /* ---------- 5. legend: one sub-dial per activity for the current scale ---------- */
  // ring = share of days with the activity at each half hour (midnight at the top, like the main dial);
  // centre = the activity photo, cropped on its subject (zoom, focus x, focus y)
  const CROP = { wake: [1.3, .46, .62], transit: [1.12, .5, .52], work: [1.18, .42, .48], food: [1.12, .62, .47],
                 exercise: [1.0, .5, .5], shopping: [1.3, .52, .56], leisure: [1.25, .5, .7], sleep: [1.2, .6, .52] };
  const legend = art.querySelector('.clock-legend');
  let locked = null;
  const focus = k => { if (k) clock.dataset.focus = k; else delete clock.dataset.focus; legend.querySelectorAll('.lg').forEach(b => b.classList.toggle('on', b.dataset.k === k)); };
  const SD = 64, SC = 32, RR = 27.2, RW = 5.2, RP = 19.8;  // sub-dial box, centre, ring radius and width, photo radius
  const pt = (r, h) => { const a = h / 24 * 2 * Math.PI; return [(SC + r * Math.sin(a)).toFixed(2), (SC - r * Math.cos(a)).toFixed(2)]; };
  const arc = (r, h0, h1) => { const [x0, y0] = pt(r, h0), [x1, y1] = pt(r, h1); return `M${x0} ${y0}A${r} ${r} 0 ${h1 - h0 > 12 ? 1 : 0} 1 ${x1} ${y1}`; };
  function subdial(k, bins) {
    const B = bins.length, step = 24 / B, runs = [];
    bins.forEach((v, i) => {  // merge neighbouring half hours of the same (quantised) share into one arc
      const q = v > 0 ? Math.max(1, Math.round(v * 10)) : 0, last = runs[runs.length - 1];
      if (last && last.q === q && last.b === i) last.b = i + 1; else runs.push({ q, a: i, b: i + 1 });
    });
    const ring = runs.filter(r => r.q).map(r => r.b - r.a === B
      ? `<circle cx="${SC}" cy="${SC}" r="${RR}" stroke="${COL[k]}" stroke-opacity="${(.28 + .072 * r.q).toFixed(2)}"/>`
      : `<path d="${arc(RR, r.a * step, r.b * step)}" stroke="${COL[k]}" stroke-opacity="${(.28 + .072 * r.q).toFixed(2)}"/>`).join('');
    const ticks = [0, 6, 12, 18].map(h => { const [x0, y0] = pt(RP + 1.9, h), [x1, y1] = pt(RP + 3.4, h); return `<line x1="${x0}" y1="${y0}" x2="${x1}" y2="${y1}"/>`; }).join('');
    const [z, fx, fy] = CROP[k] || [1, .5, .5], d = 2 * RP * z, x = SC - RP - (d - 2 * RP) * fx, y = SC - RP - (d - 2 * RP) * fy;
    return `<svg class="sd" viewBox="0 0 ${SD} ${SD}" aria-hidden="true">` +
      `<defs><clipPath id="lgc-${k}"><circle cx="${SC}" cy="${SC}" r="${RP}"/></clipPath></defs>` +
      `<circle class="trk" cx="${SC}" cy="${SC}" r="${RR}" stroke-width="${RW}"/>` +
      `<g class="arcs" fill="none" stroke-width="${RW}" stroke-linecap="butt">${ring}</g>` +
      `<g class="ix">${ticks}</g>` +
      `<circle class="pbg" cx="${SC}" cy="${SC}" r="${RP}" fill="${COL[k]}"/>` +
      `<image href="assets/photos/${k}.webp" x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${d.toFixed(2)}" height="${d.toFixed(2)}" preserveAspectRatio="xMidYMid slice" clip-path="url(#lgc-${k})"/>` +
      `<circle class="prim" cx="${SC}" cy="${SC}" r="${RP}"/></svg>`;
  }
  function drawLegend() {
    const S = SCALES[mode], n = S.rings.length, BINS = 48;
    const rows = Object.keys(LABEL).map(k => {
      const bins = Array.from({ length: BINS }, (_, i) => { const h = (i + .5) * 24 / BINS; return S.rings.filter(x => x.acts.some(y => y.k === k && covers(y, h))).length / n; });
      const hours = S.rings.reduce((s, x) => s + x.acts.filter(y => y.k === k).reduce((t, y) => t + dur(y), 0), 0) / n;
      return { k, bins, hours };
    });
    legend.classList.add('sub');
    legend.innerHTML = rows.map(r =>
      `<button type="button" class="lg${locked === r.k ? ' on' : ''}" data-k="${r.k}" aria-pressed="${locked === r.k}" style="--c:${COL[r.k]}" ` +
      `aria-label="${LABEL[r.k]}, ${r.hours.toFixed(1)} hours per day. Show on the dial">` +
      subdial(r.k, r.bins) +
      `<span class="nm">${LABEL[r.k]}</span>` +
      `<span class="hr">${r.hours.toFixed(1)}<small> h${n === 1 ? '' : '/day'}</small></span></button>`).join('');
    legend.querySelectorAll('.lg').forEach(b => {
      b.addEventListener('mouseenter', () => { if (!locked) focus(b.dataset.k); });
      b.addEventListener('mouseleave', () => { if (!locked) focus(null); });
      b.addEventListener('focus', () => { if (!locked) focus(b.dataset.k); });
      b.addEventListener('blur', () => { if (!locked) focus(null); });
      b.addEventListener('click', () => {
        locked = locked === b.dataset.k ? null : b.dataset.k;
        legend.querySelectorAll('.lg').forEach(x => x.setAttribute('aria-pressed', String(x.dataset.k === locked)));
        focus(locked || b.dataset.k);
      });
    });
  }
  if (legend) drawLegend();

  /* ---------- 2. tabs ---------- */
  const tabs = [...art.querySelectorAll('.clock-tabs .tab')];
  tabs.forEach(t => t.addEventListener('click', () => {
    mode = t.dataset.mode;
    clock.dataset.mode = mode; wrap.dataset.mode = mode;
    select(null);
    tabs.forEach(x => { const on = x === t; x.classList.toggle('on', on); x.setAttribute('aria-selected', String(on)); });
    pinned = false; hide();
    if (legend) drawLegend();
    focus(locked);
  }));
})();
