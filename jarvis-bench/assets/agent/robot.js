/* Jarvis robot player (assets/robot/ready). Classic script; needs lottie_light.min.js and robot-data.js loaded first.
   Mounts the Lottie into every .jv .ag.rb (the dial centre), loops the idle animation, and
     - pauses when the tab is hidden or the dial is scrolled off-screen,
     - keeps still (one open-eyed frame) under prefers-reduced-motion,
     - adjusts the idle speed to the mood that assets/page-home.js writes into data-mood (calm | pos | neg | help).
   The gaze itself (--gx / --gy) is pure CSS, see robot.css. */
(() => {
  const roots = document.querySelectorAll('.jv .ag.rb');
  if (!roots.length || typeof lottie === 'undefined' || !window.JARVIS_ROBOT) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const SPEED = { calm: 1, pos: 1.25, neg: .8, help: 1.15 };
  // a <base href> (the preview has one) makes url(#id) references resolve against the base URL and the clip-path hides the
  // drawing; lottie prefixes its references with this href instead, which is harmless without a <base>
  if (lottie.setLocationHref) lottie.setLocationHref(location.href.replace(/#.*$/, ''));
  const STILL_FRAME = 0;  // eyes open, looking ahead

  roots.forEach(root => {
    let stage = root.querySelector('.rb-stage');
    if (!stage) { stage = document.createElement('div'); stage.className = 'rb-stage'; root.appendChild(stage); }
    root.setAttribute('role', 'img');
    if (!root.getAttribute('aria-label')) root.setAttribute('aria-label', 'Jarvis, the assistant');
    const anim = lottie.loadAnimation({
      container: stage, renderer: 'svg', loop: true, autoplay: false,
      animationData: JSON.parse(JSON.stringify(window.JARVIS_ROBOT)),  // lottie mutates its data; keep the source intact for a second mount
      rendererSettings: { preserveAspectRatio: 'xMidYMid meet', progressiveLoad: false, hideOnTransparent: true, className: 'rb-svg' },
    });
    let visible = true, inView = true;
    const sync = () => {
      if (reduce.matches) { anim.goToAndStop(STILL_FRAME, true); return; }
      if (visible && inView) { if (anim.isPaused) anim.play(); } else if (!anim.isPaused) anim.pause();
    };
    anim.addEventListener('DOMLoaded', () => {
      const svg = stage.querySelector('svg');
      if (svg) { svg.setAttribute('aria-hidden', 'true'); svg.setAttribute('focusable', 'false'); }  // the root carries the label
      anim.setSpeed(SPEED[root.dataset.mood] || 1); sync();
    });
    document.addEventListener('visibilitychange', () => { visible = !document.hidden; sync(); });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(es => { es.forEach(e => { inView = e.isIntersecting; }); sync(); }, { rootMargin: '80px' }).observe(root);
    }
    reduce.addEventListener ? reduce.addEventListener('change', sync) : reduce.addListener(sync);
    new MutationObserver(() => anim.setSpeed(SPEED[root.dataset.mood] || 1)).observe(root, { attributes: true, attributeFilter: ['data-mood'] });
    root.jarvisRobot = anim;  // handle for debugging / future control
  });
})();
