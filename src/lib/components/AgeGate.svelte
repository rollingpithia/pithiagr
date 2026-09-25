<script>
  import SmokeField from './SmokeField.svelte';
  import ColumnSvg from './ColumnSvg.svelte';
  import { asset } from '$lib/asset.js';

  let { t, onEnter, onLeave } = $props();
</script>

<div
  role="dialog"
  aria-modal="true"
  class="age-gate"
>
  <SmokeField count={9} opacity={0.7} hue="primary" />

  <div class="age-gate-columns" aria-hidden="true">
    <div class="age-gate-column"><ColumnSvg side="left" height="100%" /></div>
    <div class="age-gate-column"><ColumnSvg side="right" height="100%" /></div>
  </div>

  <div class="container age-gate-inner">
    <div class="age-gate-logo">
      <img src={asset('/assets/pithia-silhouette.png')} alt="" />
    </div>

    <div class="eyebrow age-gate-eyebrow">{t.age.eyebrow}</div>
    <h1 class="display age-gate-title">{t.age.title}</h1>
    <p class="lead age-gate-sub">{t.age.sub}</p>

    <div class="age-gate-actions">
      <button class="btn" onclick={onEnter}>
        <span>{t.age.enter}</span>
        <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true">
          <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.5" fill="none" />
        </svg>
      </button>
      <button class="btn btn--ghost" onclick={onLeave}>{t.age.leave}</button>
    </div>

    <div class="hairline age-gate-rule"></div>
    <div class="age-gate-legal">{t.age.legal}</div>
  </div>
</div>

<style>
  .age-gate {
    position: fixed;
    inset: 0;
    z-index: 1000;
    background: oklch(0.97 0.012 85);
    display: grid;
    place-items: center;
    overflow: hidden;
    animation: fadeIn 0.8s ease both;
  }

  .age-gate-columns {
    position: absolute;
    inset: 0;
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    padding: 0 4vw;
    color: oklch(0.85 0.01 80);
    opacity: 0.7;
    pointer-events: none;
  }

  .age-gate-column {
    width: 9vw;
    height: 62vh;
  }

  .age-gate-inner {
    position: relative;
    z-index: 2;
    max-width: 620px;
    text-align: center;
    padding: 60px 0;
  }

  .age-gate-logo {
    display: flex;
    justify-content: center;
    margin-bottom: 24px;
  }

  .age-gate-logo img {
    width: 130px;
    height: auto;
    opacity: 0.92;
    filter: drop-shadow(0 6px 20px rgba(0, 0, 0, 0.12));
  }

  .age-gate-eyebrow {
    margin-bottom: 14px;
    color: var(--accent);
  }

  .age-gate-title {
    font-size: clamp(36px, 5.6vw, 64px);
    margin: 0 0 18px;
    text-wrap: balance;
  }

  .age-gate-sub {
    margin: 0 auto 36px;
    max-width: 480px;
  }

  .age-gate-actions {
    display: flex;
    gap: 14px;
    justify-content: center;
    flex-wrap: wrap;
  }

  .age-gate-rule {
    margin: 44px auto 14px;
    max-width: 320px;
  }

  .age-gate-legal {
    font-size: 11px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--ink-mute);
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
</style>
