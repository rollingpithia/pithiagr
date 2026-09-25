<script>
  import OliveSprig from './OliveSprig.svelte';
  import { reveal } from '$lib/actions/reveal.js';

  let { t } = $props();
</script>

<section id="physis" use:reveal class="physis paper-grain">
  <div class="physis-sprig physis-sprig--left" aria-hidden="true">
    <OliveSprig size={200} />
  </div>
  <div class="physis-sprig physis-sprig--right" aria-hidden="true">
    <OliveSprig size={240} />
  </div>

  <div class="container physis-inner">
    <div class="physis-grid">
      <div>
        <div class="eyebrow reveal physis-eyebrow">{t.physis.eyebrow}</div>
        <h2 class="display reveal reveal-d2 physis-title">{t.physis.title}</h2>
        <div class="display reveal reveal-d3 physis-tagline">{t.physis.tagline}</div>
        <p class="reveal reveal-d4 physis-body">{t.physis.body}</p>

        <div class="reveal reveal-d5 physis-seal">
          <span class="physis-seal-dot"></span>
          {t.physis.seal}
        </div>
      </div>

      <ol class="physis-list">
        {#each t.physis.bullets as b, i (i)}
          <li class="reveal reveal-d{i + 2} physis-item">
            <span class="display physis-item-k">{b.k}</span>
            <div>
              <div class="display physis-item-t">{b.t}</div>
              <p class="physis-item-d">{b.d}</p>
            </div>
          </li>
        {/each}
      </ol>
    </div>
  </div>
</section>

<style>
  .physis {
    position: relative;
    padding: 140px 0 130px;
    background:
      radial-gradient(ellipse 65% 50% at 8% 18%, oklch(0.9 0.028 128 / 0.18), transparent 72%),
      radial-gradient(ellipse 50% 45% at 94% 88%, oklch(0.89 0.022 122 / 0.12), transparent 70%),
      linear-gradient(180deg, var(--bg) 0%, oklch(0.94 0.02 95) 55%, oklch(0.93 0.025 85) 100%);
    border-top: 1px solid var(--hairline);
    overflow: hidden;
  }

  .physis-sprig {
    position: absolute;
    z-index: 1;
    color: var(--olive);
  }

  .physis-sprig--left {
    left: -30px;
    top: 80px;
    opacity: 0.35;
    transform: rotate(-12deg);
  }

  .physis-sprig--right {
    right: -40px;
    bottom: 60px;
    opacity: 0.3;
    transform: rotate(168deg);
  }

  .physis-inner {
    position: relative;
    z-index: 2;
  }

  .physis-grid {
    display: grid;
    grid-template-columns: minmax(280px, 0.9fr) minmax(320px, 1.1fr);
    gap: 80px;
    align-items: start;
  }

  .physis-eyebrow {
    color: var(--olive);
    margin-bottom: 18px;
  }

  .physis-title {
    font-size: clamp(72px, 11vw, 180px);
    margin: 0 0 16px;
    letter-spacing: 0.04em;
    color: var(--ink);
    line-height: 0.9;
  }

  .physis-tagline {
    font-style: italic;
    font-size: clamp(22px, 2.6vw, 30px);
    color: var(--terracotta);
    margin-bottom: 24px;
    max-width: 360px;
  }

  .physis-body {
    color: var(--ink-soft);
    font-size: 16px;
    max-width: 420px;
    line-height: 1.7;
    margin: 0;
  }

  .physis-seal {
    margin-top: 38px;
    display: inline-flex;
    align-items: center;
    gap: 14px;
    padding: 12px 22px;
    border: 1px solid var(--gold);
    border-radius: 999px;
    color: var(--gold-deep);
    font-family: var(--display);
    letter-spacing: 0.3em;
    font-size: 13px;
    font-weight: 600;
  }

  .physis-seal-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--gold);
    box-shadow: 0 0 0 4px oklch(0.78 0.12 85 / 0.18);
  }

  .physis-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  .physis-item {
    display: grid;
    grid-template-columns: 70px 1fr;
    gap: 24px;
    padding: 26px 0;
    border-top: 1px solid var(--hairline);
    align-items: baseline;
  }

  .physis-item:last-child {
    border-bottom: 1px solid var(--hairline);
  }

  .physis-item-k {
    font-size: 40px;
    color: var(--terracotta);
    font-style: italic;
    line-height: 1;
    font-weight: 500;
  }

  .physis-item-t {
    font-size: 28px;
    margin-bottom: 6px;
    font-style: italic;
  }

  .physis-item-d {
    margin: 0;
    color: var(--ink-soft);
    font-size: 15px;
    line-height: 1.65;
  }

  @media (max-width: 880px) {
    .physis-grid {
      grid-template-columns: 1fr;
      gap: 56px;
    }
  }
</style>
