/** Intersection observer — adds `.in` to `.reveal` children when visible. */
export function reveal(node) {
  /** @type {Set<Element>} */
  const tracked = new Set();

  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) e.target.classList.add('in');
      }
    },
    { threshold: 0.18, rootMargin: '0px 0px -10% 0px' },
  );

  /** @param {Element} el */
  function observeEl(el) {
    if (!el.classList.contains('reveal') || tracked.has(el)) return;
    tracked.add(el);
    io.observe(el);

    // Filter toggles swap DOM nodes that are already on screen — show them immediately.
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.92 && rect.bottom > 0) {
      el.classList.add('in');
    }
  }

  function scan() {
    node.querySelectorAll('.reveal').forEach(observeEl);
  }

  scan();

  const mo = new MutationObserver(() => scan());
  mo.observe(node, { childList: true, subtree: true });

  return {
    destroy() {
      io.disconnect();
      mo.disconnect();
      tracked.clear();
    },
  };
}
