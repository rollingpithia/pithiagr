/**
 * starfield.js — a hand-drawn night sky on a 2D canvas.
 *
 * Deliberately NOT WebGL: the hero already holds a three.js context, and a
 * second one costs real memory on mid-range phones. Everything here is
 * strokes and arcs, which also matches the ink-drawn artwork better than
 * shaders would.
 *
 * Two skies (kyanós / árgyros) are interpolated channel-by-channel, so the
 * colourway switch is a dissolve, not a swap.
 */

const lerp = (a, b, t) => a + (b - a) * t;
const rand = (a, b) => a + Math.random() * (b - a);
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const css = (c, a = 1) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;

export const SKIES = {
  kyanos: {
    top: [4, 10, 30],
    bottom: [10, 44, 96],
    haze: [30, 99, 184],
    star: [214, 230, 255],
    gold: [227, 183, 94],
    swirl: [126, 176, 240]
  },
  argyros: {
    top: [9, 14, 16],
    bottom: [31, 43, 45],
    haze: [98, 128, 125],
    star: [230, 238, 236],
    gold: [199, 162, 92],
    swirl: [150, 172, 170]
  }
};

const mixSky = (a, b, t) => {
  const out = {};
  for (const k in a) out[k] = [lerp(a[k][0], b[k][0], t), lerp(a[k][1], b[k][1], t), lerp(a[k][2], b[k][2], t)];
  return out;
};

function noiseTile() {
  const c = document.createElement('canvas');
  c.width = c.height = 96;
  const g = c.getContext('2d');
  const img = g.createImageData(96, 96);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = 128 + (Math.random() - 0.5) * 255;
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
    img.data[i + 3] = 26;
  }
  g.putImageData(img, 0, 0);
  return c;
}

export function createSky(canvas, { reducedMotion = false, density = 1 } = {}) {
  const ctx = canvas.getContext('2d', { alpha: false });

  let w = 0;
  let h = 0;
  let dpr = 1;
  let raf = 0;
  let last = 0;
  let time = 0;
  let running = false;

  let from = SKIES.kyanos;
  let to = SKIES.kyanos;
  let mix = 1;
  let mixDur = 0.9;

  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };

  let stars = [];
  let sparkles = [];
  let swirls = [];
  let comet = null;
  let nextComet = rand(5, 11);
  let pattern = null;

  /* ---------- population (normalised, so a resize never regenerates) ---------- */

  function populate() {
    const area = (w * h) / 1000;
    const n = clamp(Math.round(area * 0.34 * density), 70, 340);

    stars = Array.from({ length: n }, () => {
      const depth = Math.random();
      return {
        x: Math.random(),
        y: Math.random(),
        d: depth,
        r: lerp(0.35, 1.5, depth * depth),
        base: lerp(0.25, 0.9, depth),
        speed: rand(0.4, 1.6),
        phase: rand(0, Math.PI * 2)
      };
    });

    // gold sparkles stay in the upper sky — down among the copy they read as noise
    sparkles = Array.from({ length: clamp(Math.round(n * 0.05), 4, w < 700 ? 8 : 14) }, () => ({
      x: Math.random(),
      y: rand(0.02, w < 700 ? 0.3 : 0.46),
      r: rand(5, 13),
      rot: rand(0, Math.PI),
      speed: rand(0.25, 0.7),
      phase: rand(0, Math.PI * 2)
    }));

    swirls = Array.from({ length: 7 }, (_, i) => ({
      x: rand(0.06, 0.94),
      y: rand(0.05, 0.6),
      s: rand(46, 132),
      turns: rand(1.6, 2.6),
      rot: rand(0, Math.PI * 2),
      spin: rand(-0.05, 0.05),
      drift: rand(0.1, 0.3),
      phase: i * 1.4,
      alpha: rand(0.08, 0.17)
    }));
  }

  /* ---------- drawing ---------- */

  function spiral(x, y, size, turns, rot) {
    const steps = 84;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.beginPath();
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const th = t * Math.PI * 2 * turns;
      const r = t * size;
      const px = Math.cos(th) * r;
      const py = Math.sin(th) * r * 0.82;
      i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
    }
    ctx.stroke();
    ctx.restore();
  }

  function sparkle(x, y, r, rot, color, alpha) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, r * 2.6);
    glow.addColorStop(0, css(color, alpha * 0.5));
    glow.addColorStop(1, css(color, 0));
    ctx.fillStyle = glow;
    ctx.fillRect(-r * 2.6, -r * 2.6, r * 5.2, r * 5.2);
    ctx.beginPath();
    ctx.moveTo(0, -r);
    ctx.quadraticCurveTo(0, 0, r, 0);
    ctx.quadraticCurveTo(0, 0, 0, r);
    ctx.quadraticCurveTo(0, 0, -r, 0);
    ctx.quadraticCurveTo(0, 0, 0, -r);
    ctx.fillStyle = css(color, alpha);
    ctx.fill();
    ctx.restore();
  }

  function paint(dt) {
    if (mix < 1) mix = clamp(mix + dt / mixDur, 0, 1);
    const p = mix >= 1 ? to : mixSky(from, to, easeInOut(mix));

    pointer.x = lerp(pointer.x, pointer.tx, 0.05);
    pointer.y = lerp(pointer.y, pointer.ty, 0.05);

    // sky
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, css(p.top));
    g.addColorStop(1, css(p.bottom));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    // two slow hazes, as if the sky were breathing
    for (let i = 0; i < 2; i++) {
      const cx = w * (i ? 0.78 : 0.24) + Math.sin(time * 0.06 + i * 2) * w * 0.05;
      const cy = h * (i ? 0.62 : 0.26) + Math.cos(time * 0.05 + i) * h * 0.05;
      const rad = Math.max(w, h) * (i ? 0.52 : 0.62);
      const hz = ctx.createRadialGradient(cx, cy, 0, cx, cy, rad);
      hz.addColorStop(0, css(p.haze, i ? 0.16 : 0.24));
      hz.addColorStop(1, css(p.haze, 0));
      ctx.fillStyle = hz;
      ctx.fillRect(0, 0, w, h);
    }

    // swirls — the artwork's own motif
    ctx.lineWidth = 1.1;
    ctx.lineCap = 'round';
    for (const s of swirls) {
      const px = s.x * w + pointer.x * 26 + Math.sin(time * s.drift + s.phase) * 10;
      const py = s.y * h + pointer.y * 16 + Math.cos(time * s.drift * 0.8 + s.phase) * 7;
      ctx.strokeStyle = css(p.swirl, s.alpha);
      spiral(px, py, s.s, s.turns, s.rot + time * s.spin);
    }

    // stars
    for (const s of stars) {
      const tw = reducedMotion ? 1 : 0.6 + 0.4 * Math.sin(time * s.speed + s.phase);
      const px = s.x * w + pointer.x * (10 + s.d * 46);
      const py = s.y * h + pointer.y * (6 + s.d * 26);
      ctx.beginPath();
      ctx.arc(px, py, s.r, 0, Math.PI * 2);
      ctx.fillStyle = css(p.star, s.base * tw);
      ctx.fill();
    }

    // gold sparkles
    for (const s of sparkles) {
      const tw = reducedMotion ? 0.8 : 0.55 + 0.45 * Math.sin(time * s.speed + s.phase);
      sparkle(s.x * w + pointer.x * 40, s.y * h + pointer.y * 22, s.r, s.rot + time * 0.04, p.gold, 0.75 * tw);
    }

    // one comet, rarely, never twice in a row
    if (!reducedMotion) {
      nextComet -= dt;
      if (!comet && nextComet <= 0) {
        comet = { x: rand(0.1, 0.7) * w, y: rand(0.02, 0.3) * h, a: rand(0.32, 0.5), sp: rand(760, 1080), life: 0, len: rand(120, 210) };
        nextComet = rand(9, 18);
      }
      if (comet) {
        comet.life += dt;
        const dx = Math.cos(comet.a) * comet.sp * dt;
        const dy = Math.sin(comet.a) * comet.sp * dt;
        comet.x += dx;
        comet.y += dy;
        const fade = clamp(1 - comet.life / 1.5, 0, 1);
        const tx = comet.x - Math.cos(comet.a) * comet.len;
        const ty = comet.y - Math.sin(comet.a) * comet.len;
        const tr = ctx.createLinearGradient(comet.x, comet.y, tx, ty);
        tr.addColorStop(0, css(p.star, 0.85 * fade));
        tr.addColorStop(1, css(p.star, 0));
        ctx.strokeStyle = tr;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(comet.x, comet.y);
        ctx.lineTo(tx, ty);
        ctx.stroke();
        if (comet.x > w + 200 || comet.y > h + 200 || fade <= 0) comet = null;
      }
    }

    // paper grain, then a vignette to sit the artwork forward
    if (pattern) {
      ctx.globalAlpha = 0.5;
      ctx.fillStyle = pattern;
      ctx.fillRect(0, 0, w, h);
      ctx.globalAlpha = 1;
    }
    const vg = ctx.createRadialGradient(w / 2, h * 0.44, Math.min(w, h) * 0.2, w / 2, h * 0.5, Math.max(w, h) * 0.78);
    vg.addColorStop(0, 'rgba(0,0,0,0)');
    vg.addColorStop(1, 'rgba(0,0,0,0.55)');
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, w, h);
  }

  function frame(now) {
    const dt = clamp((now - last) / 1000, 0, 0.05);
    last = now;
    time += dt;
    paint(dt);
    raf = requestAnimationFrame(frame);
  }

  /* ---------- api ---------- */

  const api = {
    resize() {
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = rect.width;
      h = rect.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (!stars.length) populate();
      if (!pattern) pattern = ctx.createPattern(noiseTile(), 'repeat');
      if (!running) paint(0);
    },
    start() {
      if (running) return;
      if (reducedMotion) {
        paint(0);
        return;
      }
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    },
    stop() {
      running = false;
      cancelAnimationFrame(raf);
    },
    /** Dissolve to another sky. `id` is a key of SKIES. */
    to(id, seconds = 0.9) {
      const next = SKIES[id];
      if (!next || next === to) return;
      from = mix >= 1 ? to : mixSky(from, to, easeInOut(mix));
      to = next;
      mixDur = reducedMotion ? 0.001 : seconds;
      mix = 0;
      if (!running) paint(mixDur + 0.01);
    },
    /** Normalised −1…1 offsets from the section centre. */
    pointer(nx, ny) {
      pointer.tx = clamp(nx, -1, 1);
      pointer.ty = clamp(ny, -1, 1);
      if (!running) paint(0);
    },
    destroy() {
      api.stop();
      stars = sparkles = swirls = [];
      pattern = null;
    }
  };

  return api;
}
