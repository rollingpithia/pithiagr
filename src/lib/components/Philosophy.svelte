<script>
  import SmokeField from './SmokeField.svelte';
  import ColumnSvg from './ColumnSvg.svelte';
  import { reveal } from '$lib/actions/reveal.js';

  let { t } = $props();
</script>

<section
  id="philosophy"
  use:reveal
  class="philosophy"
>
  <SmokeField count={4} opacity={0.18} hue="primary" />

  <div class="container philosophy-inner">
    <div class="philosophy-intro">
      <div class="eyebrow reveal philosophy-eyebrow">{t.philosophy.eyebrow}</div>
      <h2 class="display reveal reveal-d2 philosophy-title">
        {#each t.philosophy.title.split('\n') as line, i}
          {#if i > 0}<br />{/if}{line}
        {/each}
      </h2>
      <p class="lead reveal reveal-d3 philosophy-sub">{t.philosophy.sub}</p>
    </div>

    <div class="philosophy-grid">
      {#each t.philosophy.items as it, i (i)}
        <article class="reveal reveal-d{i + 2} philosophy-card">
          <div class="philosophy-card-head">
            <span class="display philosophy-card-k">{it.k}</span>
            <div>
              <div class="greek-caps philosophy-card-gk">{it.gk}</div>
              <div class="display philosophy-card-title">{it.title}</div>
            </div>
          </div>

          <p class="philosophy-card-body">{it.body}</p>

          <div class="display philosophy-card-oracle">{it.oracle}</div>

          <div class="philosophy-card-ornament" aria-hidden="true">
            <ColumnSvg side="left" height="100%" />
          </div>
        </article>
      {/each}
    </div>
  </div>
</section>

<style>
  .philosophy {
    position: relative;
    padding: 140px 0 120px;
    background: var(--bg);
    border-top: 1px solid var(--hairline);
  }

  .philosophy-inner {
    position: relative;
    z-index: 2;
  }

  .philosophy-intro {
    text-align: center;
    max-width: 760px;
    margin: 0 auto 80px;
  }

  .philosophy-eyebrow {
    color: var(--accent);
    margin-bottom: 18px;
  }

  .philosophy-title {
    font-size: clamp(40px, 5.5vw, 78px);
    margin: 0 0 22px;
    white-space: pre-line;
  }

  .philosophy-sub {
    margin: 0;
  }

  .philosophy-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 0;
    border: 1px solid var(--hairline);
    background: oklch(0.96 0.012 80 / 0.7);
    backdrop-filter: blur(4px);
  }

  .philosophy-card {
    padding: 56px 40px 48px;
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 18px;
    min-height: 360px;
  }

  .philosophy-card:not(:last-child) {
    border-right: 1px solid var(--hairline);
  }

  .philosophy-card-head {
    display: flex;
    align-items: baseline;
    gap: 14px;
    padding-bottom: 18px;
    border-bottom: 1px solid var(--hairline);
  }

  .philosophy-card-k {
    font-size: 36px;
    color: var(--accent);
    font-style: italic;
    font-weight: 500;
  }

  .philosophy-card-gk {
    font-size: 13px;
    letter-spacing: 0.3em;
    color: var(--ink-mute);
    font-weight: 600;
  }

  .philosophy-card-title {
    font-size: 30px;
    font-style: italic;
    color: var(--ink);
  }

  .philosophy-card-body {
    margin: 0;
    color: var(--ink-soft);
    font-size: 15px;
    line-height: 1.65;
  }

  .philosophy-card-oracle {
    margin-top: auto;
    font-style: italic;
    color: var(--ink);
    font-size: 22px;
    padding-top: 22px;
    border-top: 1px dashed var(--hairline);
  }

  .philosophy-card-ornament {
    position: absolute;
    top: 16px;
    right: 18px;
    width: 22px;
    height: 60px;
    color: var(--gold);
    opacity: 0.45;
  }

  @media (max-width: 880px) {
    .philosophy-card:not(:last-child) {
      border-right: none;
      border-bottom: 1px solid var(--hairline);
    }
  }
</style>
