<script>
  import SmokeField from './SmokeField.svelte';
  import { reveal } from '$lib/actions/reveal.js';

  let { t } = $props();
</script>

<section id="chronicle" use:reveal class="timeline">
  <SmokeField count={5} opacity={0.18} hue="primary" />
  <div class="timeline-grain" aria-hidden="true"></div>

  <div class="container timeline-inner">
    <div class="timeline-intro">
      <div class="timeline-intro-eyebrow reveal">
        <span class="timeline-intro-rule" aria-hidden="true"></span>
        <span class="eyebrow timeline-eyebrow">{t.timeline.eyebrow}</span>
        <span class="timeline-intro-rule" aria-hidden="true"></span>
      </div>
      <h2 class="display reveal reveal-d2 timeline-title">
        {#each t.timeline.title.split('\n') as line, i}
          {#if i > 0}<br />{/if}{line}
        {/each}
      </h2>
      <p class="lead reveal reveal-d3 timeline-sub">{t.timeline.sub}</p>
    </div>

    <div class="tl">
      <div aria-hidden="true" class="tl-spine"></div>

      {#each t.timeline.events as ev, i (ev.y + ev.t)}
        {@const side = i % 2 === 1 ? 'right' : 'left'}
        <div data-side={side} class="tl-row">
          <div class="tl-year">
            <span>{ev.y}</span>
          </div>
          <div class="tl-card">
            <div class="tl-card-inner">
              <div class="display tl-card-title">{ev.t}</div>
              <p class="tl-card-desc">{ev.d}</p>
            </div>
          </div>
        </div>
      {/each}
    </div>
  </div>
</section>

<style>
  .timeline {
    position: relative;
    padding: clamp(80px, 11vh, 120px) 0 clamp(100px, 12vh, 150px);
    background: oklch(0.95 0.014 80);
    overflow: hidden;
  }

  .timeline-grain {
    position: absolute;
    inset: 0;
    pointer-events: none;
    opacity: 0.2;
    mix-blend-mode: multiply;
    background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' seed='6'/><feColorMatrix values='0 0 0 0 0.18  0 0 0 0 0.14  0 0 0 0 0.10  0 0 0 0.45 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>");
  }

  .timeline-inner {
    position: relative;
    z-index: 2;
  }

  .timeline-intro {
    text-align: center;
    max-width: 720px;
    margin: 0 auto clamp(64px, 9vw, 96px);
  }

  .timeline-intro-eyebrow {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 18px;
    margin-bottom: 22px;
  }

  .timeline-intro-rule {
    display: inline-block;
    width: 48px;
    height: 1px;
    background: linear-gradient(90deg, transparent, var(--accent));
  }

  .timeline-intro-eyebrow .timeline-intro-rule:last-child {
    background: linear-gradient(90deg, var(--accent), transparent);
  }

  .timeline-eyebrow {
    color: var(--accent);
    letter-spacing: 0.34em;
  }

  .timeline-title {
    font-size: clamp(38px, 5.2vw, 72px);
    font-style: italic;
    margin: 0 0 20px;
    line-height: 1.04;
    color: var(--ink);
  }

  .timeline-sub {
    margin: 0 auto;
    max-width: 46ch;
  }
</style>
