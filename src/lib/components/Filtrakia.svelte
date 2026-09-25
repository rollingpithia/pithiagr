<script>
  import { base } from '$app/paths';
  import { reveal } from '$lib/actions/reveal.js';

  let { t } = $props();
  const href = $derived(`${base}/catalogue/filtrakia`);
</script>

<section id="filtrakia" use:reveal class="tips paper-grain">
  <div class="tips-mark tips-mark--left" aria-hidden="true">
    <svg viewBox="0 0 120 28" fill="none" stroke="currentColor" stroke-width="1.2">
      <rect x="4" y="8" width="70" height="12" rx="6" />
      <path d="M52 8v12" />
      <rect x="78" y="10" width="36" height="8" rx="4" />
    </svg>
  </div>

  <div class="container tips-inner">
    <div class="tips-grid">
      <ol class="tips-list">
        {#each t.filtrakia.bullets as b, i (i)}
          <li class="reveal reveal-d{i + 2} tips-item">
            <span class="display tips-item-k">{b.k}</span>
            <div>
              <div class="display tips-item-t">{b.t}</div>
              <p class="tips-item-d">{b.d}</p>
            </div>
          </li>
        {/each}
      </ol>

      <div class="tips-copy">
        <div class="eyebrow reveal tips-eyebrow">{t.filtrakia.eyebrow}</div>
        <h2 class="display reveal reveal-d2 tips-title">{t.filtrakia.title}</h2>
        <div class="display reveal reveal-d3 tips-tagline">{t.filtrakia.tagline}</div>
        <p class="reveal reveal-d4 tips-body">{t.filtrakia.body}</p>
        <a class="reveal reveal-d5 tips-cta" href={href}>{t.filtrakia.cta}</a>
        <div class="reveal reveal-d5 tips-seal">
          <span class="tips-seal-dot"></span>
          {t.filtrakia.seal}
        </div>
      </div>
    </div>
  </div>
</section>

<style>
  .tips {
    position: relative;
    padding: clamp(72px, 10vw, 120px) 0 clamp(64px, 9vw, 110px);
    background:
      radial-gradient(ellipse 55% 45% at 12% 20%, oklch(0.93 0.03 230 / 0.45), transparent 70%),
      radial-gradient(ellipse 40% 40% at 90% 80%, oklch(0.94 0.02 85 / 0.5), transparent 72%),
      linear-gradient(180deg, var(--bg) 0%, oklch(0.96 0.015 220) 100%);
    border-top: 1px solid var(--hairline);
    overflow: hidden;
  }

  .tips-mark {
    position: absolute;
    color: var(--ink-faint);
    opacity: 0.4;
    pointer-events: none;
  }

  .tips-mark--left {
    left: 0;
    top: 64px;
    width: min(180px, 16vw);
  }

  .tips-inner {
    position: relative;
    z-index: 1;
  }

  .tips-grid {
    display: grid;
    grid-template-columns: minmax(260px, 0.92fr) minmax(280px, 1.08fr);
    gap: clamp(40px, 6vw, 80px);
    align-items: start;
  }

  .tips-eyebrow {
    color: var(--ink-mute);
    margin-bottom: 14px;
  }

  .tips-title {
    font-size: clamp(46px, 6.4vw, 88px);
    font-weight: 500;
    margin: 0 0 12px;
    letter-spacing: -0.02em;
    line-height: 0.95;
    color: var(--ink);
    text-wrap: balance;
  }

  .tips-tagline {
    font-style: italic;
    font-weight: 500;
    font-size: clamp(20px, 2.2vw, 28px);
    line-height: 1.25;
    color: var(--ink-soft);
    margin-bottom: 18px;
    max-width: 16em;
  }

  .tips-body {
    margin: 0;
    max-width: 38em;
    color: var(--ink-soft);
    font-size: clamp(15px, 1.05vw, 16.5px);
    line-height: 1.7;
  }

  .tips-cta {
    display: inline-flex;
    align-items: center;
    min-height: 44px;
    margin-top: 8px;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--ink);
    text-decoration: none;
    border-bottom: 1px solid var(--ink);
    padding-bottom: 2px;
  }

  .tips-cta:hover {
    color: var(--accent);
    border-color: var(--accent);
  }

  .tips-seal {
    margin-top: 8px;
    display: inline-flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 10px;
    max-width: 100%;
    padding: 10px 16px;
    border: 1px solid var(--stroke-strong);
    border-radius: 999px;
    color: var(--ink-mute);
    font-family: var(--display);
    letter-spacing: 0.18em;
    font-size: 12px;
    font-weight: 600;
    line-height: 1.3;
  }

  .tips-seal-dot {
    width: 8px;
    height: 8px;
    flex: none;
    border-radius: 50%;
    background: var(--primary);
    box-shadow: 0 0 0 4px oklch(0.88 0.04 230 / 0.45);
  }

  .tips-list {
    list-style: none;
    padding: 0;
    margin: 8px 0 0;
  }

  .tips-item {
    display: grid;
    grid-template-columns: 56px minmax(0, 1fr);
    gap: 16px 20px;
    padding: 22px 0;
    border-top: 1px solid var(--hairline);
    align-items: baseline;
  }

  .tips-item:last-child {
    border-bottom: 1px solid var(--hairline);
  }

  .tips-item-k {
    font-size: clamp(28px, 3vw, 36px);
    color: var(--ink-faint);
    font-style: italic;
    line-height: 1;
  }

  .tips-item-t {
    font-size: clamp(22px, 2.2vw, 28px);
    line-height: 1.15;
    margin-bottom: 6px;
    font-style: italic;
  }

  .tips-item-d {
    margin: 0;
    color: var(--ink-soft);
    font-size: 15px;
    line-height: 1.65;
  }

  @media (max-width: 980px) {
    .tips-mark {
      display: none;
    }
  }

  @media (max-width: 800px) {
    .tips-grid {
      grid-template-columns: 1fr;
      gap: 36px;
    }

    .tips-copy {
      order: -1;
    }

    .tips-title {
      font-size: clamp(42px, 12vw, 64px);
    }

    .tips-list {
      margin-top: 4px;
    }
  }

  @media (max-width: 420px) {
    .tips-item {
      grid-template-columns: 40px minmax(0, 1fr);
      gap: 12px;
      padding: 18px 0;
    }

    .tips-seal {
      letter-spacing: 0.12em;
      font-size: 11px;
    }
  }
</style>
