<script>
  import SmokeField from './SmokeField.svelte';
  import ColumnSvg from './ColumnSvg.svelte';
  import Meander from './Meander.svelte';
  import { reveal } from '$lib/actions/reveal.js';

  let { t } = $props();
</script>

<section class="story-values paper-grain" use:reveal>
  <SmokeField count={4} opacity={0.14} hue="primary" />

  <div class="container story-values-inner">
    <header class="story-head">
      <div class="eyebrow reveal story-eyebrow">{t.story.eyebrow}</div>
      <h1 class="display reveal reveal-d2 story-title">
        {#each t.story.title.split('\n') as line, i}
          {#if i > 0}<br />{/if}{line}
        {/each}
      </h1>
      <p class="lead reveal reveal-d3 story-lead">{t.story.lead}</p>
      <div class="reveal reveal-d4 story-hero-meander" aria-hidden="true">
        <Meander />
      </div>
    </header>

    <div class="story-editorial reveal reveal-d4">
      <div class="story-prose">
        <p>{t.story.body}</p>
      </div>
      <aside class="story-aside" aria-label={t.story.promise}>
        <div class="story-aside-ornament" aria-hidden="true">
          <ColumnSvg side="left" height="100%" />
        </div>
        <blockquote class="display story-promise">{t.story.promise}</blockquote>
        <p class="story-promise-gloss">{t.story.promiseGloss}</p>
        <p class="story-aside-note">{t.story.promiseNote}</p>
      </aside>
    </div>

    <article class="story-chapter">
      <div class="eyebrow reveal story-chapter-eyebrow">{t.story.origin.eyebrow}</div>
      <div class="story-chapter-prose">
        {#each t.story.origin.paragraphs as paragraph, i (i)}
          <p class="reveal reveal-d{i + 2}">{paragraph}</p>
        {/each}
      </div>
    </article>

    <article class="story-chapter story-chapter--name">
      <div class="eyebrow reveal story-chapter-eyebrow">{t.story.name.eyebrow}</div>
      <h2 class="display reveal reveal-d2 story-chapter-title">{t.story.name.title}</h2>
      <div class="story-chapter-prose">
        {#each t.story.name.paragraphs as paragraph, i (i)}
          <p class="reveal reveal-d{i + 3}">{paragraph}</p>
        {/each}
      </div>
    </article>

    <header class="story-pillars-head">
      <div class="eyebrow reveal story-pillars-eyebrow">{t.story.pillarsEyebrow}</div>
      <p class="lead reveal reveal-d2 story-pillars-intro">{t.story.pillarsIntro}</p>
    </header>

    <div class="story-grid">
      {#each t.story.pillars as pillar, i (i)}
        <article class="reveal reveal-d{i + 2} story-cell">
          <div class="story-cell-head">
            <span class="display story-cell-k" aria-label={pillar.k}>{pillar.k.replace('΄', '')}<span class="story-cell-keraia" aria-hidden="true">΄</span></span>
            {#if pillar.gk}
              <span class="story-cell-dot" aria-hidden="true">·</span>
              <span class="greek-caps story-cell-gk">{pillar.gk}</span>
            {/if}
          </div>
          <h2 class="display story-cell-title">{pillar.title}</h2>
          <p class="story-cell-body">{pillar.body}</p>
        </article>
      {/each}
    </div>
  </div>
</section>

<style>
  .story-values {
    position: relative;
    padding: clamp(56px, 9vh, 100px) 0 clamp(80px, 11vh, 130px);
    background: var(--bg);
    border-bottom: 1px solid var(--hairline);
    overflow: hidden;
  }

  .story-values-inner {
    position: relative;
    z-index: 2;
  }

  .story-head {
    text-align: center;
    max-width: 780px;
    margin: 0 auto clamp(56px, 8vw, 88px);
  }

  .story-eyebrow {
    color: var(--accent);
    margin-bottom: 18px;
    letter-spacing: 0.34em;
  }

  .story-title {
    margin: 0 0 22px;
    font-size: clamp(42px, 6vw, 80px);
    font-style: italic;
    line-height: 1.04;
    color: var(--ink);
  }

  .story-lead {
    margin: 0 auto;
    max-width: 42ch;
  }

  .story-hero-meander {
    margin: 1.75rem auto 0;
    width: fit-content;
  }

  .story-editorial {
    display: grid;
    grid-template-columns: minmax(0, 1.15fr) minmax(280px, 0.85fr);
    gap: clamp(32px, 5vw, 72px);
    align-items: start;
    margin-bottom: clamp(56px, 8vw, 88px);
    padding-bottom: clamp(48px, 7vw, 72px);
    border-bottom: 1px solid var(--hairline);
  }

  .story-prose p {
    margin: 0;
    font-size: clamp(16px, 1.25vw, 18px);
    line-height: 1.82;
    color: var(--ink-soft);
    max-width: 58ch;
  }

  .story-aside {
    position: relative;
    padding: clamp(28px, 4vw, 40px) clamp(24px, 3vw, 36px);
    border: 1px solid var(--hairline);
    background: linear-gradient(165deg, oklch(0.98 0.015 85) 0%, oklch(0.96 0.02 80) 100%);
  }

  .story-aside-ornament {
    position: absolute;
    top: 20px;
    right: 22px;
    width: 20px;
    height: 56px;
    color: var(--gold);
    opacity: 0.42;
  }

  .story-promise {
    margin: 0 0 16px;
    font-size: clamp(28px, 3.2vw, 40px);
    font-style: italic;
    line-height: 1.2;
    color: var(--ink);
    padding-top: 8px;
  }

  .story-promise-gloss {
    margin: 0 0 18px;
    font-family: var(--display);
    font-style: italic;
    font-size: clamp(18px, 1.8vw, 22px);
    line-height: 1.4;
    color: var(--ink-soft);
  }

  .story-aside-note {
    margin: 0;
    color: var(--gold-deep);
    font-size: 13px;
    line-height: 1.55;
    letter-spacing: 0.02em;
  }

  .story-chapter {
    margin-bottom: clamp(48px, 7vw, 72px);
    padding-bottom: clamp(48px, 7vw, 72px);
    border-bottom: 1px solid var(--hairline);
    max-width: 760px;
  }

  .story-chapter-eyebrow {
    color: var(--accent);
    margin-bottom: 22px;
    letter-spacing: 0.34em;
  }

  .story-chapter-title {
    margin: 0 0 22px;
    font-size: clamp(36px, 4.5vw, 58px);
    font-style: italic;
    line-height: 1.05;
    color: var(--ink);
  }

  .story-chapter-prose {
    display: flex;
    flex-direction: column;
    gap: 1.15rem;
  }

  .story-chapter-prose p {
    margin: 0;
    font-size: clamp(16px, 1.25vw, 18px);
    line-height: 1.82;
    color: var(--ink-soft);
  }

  .story-pillars-head {
    text-align: center;
    max-width: 640px;
    margin: 0 auto clamp(36px, 5vw, 52px);
  }

  .story-pillars-eyebrow {
    color: var(--accent);
    margin-bottom: 16px;
    letter-spacing: 0.34em;
  }

  .story-pillars-intro {
    margin: 0 auto;
  }

  .story-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0;
    border: 1px solid var(--hairline);
    background: oklch(0.97 0.012 85 / 0.65);
  }

  .story-cell {
    padding: clamp(36px, 4vw, 52px) clamp(28px, 3.5vw, 40px);
    min-height: 280px;
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .story-cell:not(:last-child) {
    border-right: 1px solid var(--hairline);
  }

  .story-cell-head {
    display: flex;
    align-items: center;
    gap: 10px;
    padding-bottom: 16px;
    border-bottom: 1px solid var(--hairline);
  }

  .story-cell-k {
    font-size: 34px;
    font-style: normal;
    color: var(--accent);
    line-height: 1;
    font-weight: 500;
    flex-shrink: 0;
    white-space: nowrap;
  }

  .story-cell-keraia {
    font-size: 0.42em;
    line-height: 0;
    position: relative;
    top: -0.7em;
    margin-left: -0.22em;
  }

  .story-cell-dot {
    color: var(--ink-faint);
    font-size: 18px;
    line-height: 1;
  }

  .story-cell-gk {
    font-size: 11px;
    letter-spacing: 0.28em;
    color: var(--ink-mute);
    font-weight: 600;
  }

  .story-cell-title {
    margin: 0;
    font-size: clamp(22px, 2.2vw, 28px);
    font-style: italic;
    line-height: 1.15;
    color: var(--ink);
  }

  .story-cell-body {
    margin: 0;
    font-size: 14.5px;
    line-height: 1.68;
    color: var(--ink-soft);
  }

  @media (max-width: 960px) {
    .story-editorial {
      grid-template-columns: 1fr;
    }

    .story-prose p {
      max-width: none;
    }
  }

  @media (max-width: 820px) {
    .story-grid {
      grid-template-columns: 1fr;
    }

    .story-cell:not(:last-child) {
      border-right: none;
      border-bottom: 1px solid var(--hairline);
    }

    .story-cell {
      min-height: 0;
    }
  }
</style>
