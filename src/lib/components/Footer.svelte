<script>
  import { base } from '$app/paths';
  import { asset } from '$lib/asset.js';
  import ColumnSvg from '$lib/components/ColumnSvg.svelte';
  import OfficialLocations from '$lib/components/OfficialLocations.svelte';
  import Meander from '$lib/components/Meander.svelte';

  /** @type {{ t: import('$lib/i18n/index.js').Messages }} */
  let { t } = $props();

  const home = $derived(base || '/');

  const navLinks = $derived([
    { href: home, label: t.nav.home },
    { href: `${base}/catalogue`, label: t.nav.catalogue },
    { href: `${base}/story`, label: t.nav.story },
    { href: `${base}/find-us`, label: t.nav.findUs },
    { href: `${base}/contact`, label: t.nav.contact },
  ]);
</script>

<footer class="ftr">
  <div class="ftr-grain" aria-hidden="true"></div>
  <div class="ftr-glow ftr-glow--left" aria-hidden="true"></div>
  <div class="ftr-glow ftr-glow--right" aria-hidden="true"></div>

  <div class="container ftr-inner">
    <div class="ftr-masthead">
      <div class="ftr-column-ornament ftr-column-ornament--left" aria-hidden="true">
        <ColumnSvg side="left" height="clamp(120px, 18vw, 200px)" />
      </div>

      <div class="ftr-masthead-center">
        <p class="ftr-places eyebrow">{t.footer.places}</p>
        <a href={home} class="ftr-logo" aria-label={t.brand.name}>
          <img src={asset('/assets/pithia-logo.png')} alt="" />
        </a>
        <p class="display ftr-tagline">{t.footer.tagline}</p>
        <p class="ftr-since-line">{t.footer.since}</p>
      </div>

      <div class="ftr-column-ornament ftr-column-ornament--right" aria-hidden="true">
        <ColumnSvg side="right" height="clamp(120px, 18vw, 200px)" />
      </div>
    </div>

    <div class="ftr-rule" aria-hidden="true">
      <span class="ftr-rule-line"></span>
      <span class="ftr-meander">
        <Meander />
      </span>
      <span class="ftr-rule-line"></span>
    </div>

    <div class="ftr-main">
      <section class="ftr-panel ftr-panel--nav">
        <span class="ftr-eyebrow">{t.footer.navigate}</span>
        <nav class="ftr-links" aria-label={t.footer.navigate}>
          {#each navLinks as link, i (link.href)}
            <a href={link.href}>
              <span class="ftr-link-idx">{String(i + 1).padStart(2, '0')}</span>
              <span>{link.label}</span>
            </a>
          {/each}
        </nav>
      </section>

      <section class="ftr-panel ftr-panel--house">
        <OfficialLocations labels={t.footer.locations} showEmail variant="compact" includeIds={['house']} />
      </section>
    </div>

    <p class="ftr-legal">{t.footer.legal}</p>

    <div class="ftr-plaque">
      <p class="greek-caps ftr-plaque-label">{t.footer.distributorLabel}</p>
      <p class="ftr-distributor">{t.footer.distributor}</p>
    </div>

    <div class="ftr-bar">
      <span>{t.footer.rights}</span>
      <span class="ftr-bar-mid" aria-hidden="true">◆</span>
      <span>MMXXVI</span>
      <span class="ftr-bar-mid" aria-hidden="true">◆</span>
      <span>{t.footer.places}</span>
    </div>
  </div>
</footer>

<style>
  .ftr {
    position: relative;
    padding: clamp(4.5rem, 10vh, 6.5rem) 0 clamp(1.75rem, 4vh, 2.5rem);
    background:
      radial-gradient(ellipse 90% 60% at 50% 0%, oklch(0.24 0.03 260), transparent 55%),
      linear-gradient(180deg, oklch(0.16 0.022 260) 0%, oklch(0.13 0.02 260) 100%);
    color: oklch(0.86 0.015 85);
    overflow: hidden;
  }

  .ftr-grain {
    position: absolute;
    inset: 0;
    pointer-events: none;
    opacity: 0.35;
    background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' seed='8'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.04 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>");
    mix-blend-mode: soft-light;
  }

  .ftr-glow {
    position: absolute;
    width: min(50vw, 520px);
    height: min(50vw, 520px);
    border-radius: 50%;
    pointer-events: none;
    filter: blur(40px);
  }

  .ftr-glow--left {
    top: 8%;
    left: -18%;
    background: radial-gradient(circle, oklch(0.65 0.14 45 / 0.12), transparent 68%);
  }

  .ftr-glow--right {
    bottom: 10%;
    right: -14%;
    background: radial-gradient(circle, oklch(0.55 0.06 85 / 0.08), transparent 70%);
  }

  .ftr-inner {
    position: relative;
    z-index: 1;
  }

  .ftr-masthead {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 2.2fr) minmax(0, 1fr);
    align-items: end;
    gap: clamp(1rem, 3vw, 2rem);
    margin-bottom: clamp(2rem, 4vw, 3rem);
  }

  .ftr-column-ornament {
    color: oklch(0.72 0.02 85);
    opacity: 0.22;
    display: flex;
    align-items: flex-end;
    justify-content: center;
  }

  .ftr-column-ornament--right {
    justify-content: flex-end;
  }

  .ftr-column-ornament--left {
    justify-content: flex-start;
  }

  .ftr-masthead-center {
    text-align: center;
    padding: 0 clamp(0.5rem, 2vw, 1.5rem);
  }

  .ftr-places {
    margin: 0 0 1.25rem;
    color: oklch(0.68 0.08 45);
    letter-spacing: 0.34em;
  }

  .ftr-logo {
    display: inline-flex;
    margin-bottom: 1.35rem;
    text-decoration: none;
  }

  .ftr-logo img {
    height: clamp(42px, 5vw, 54px);
    width: auto;
    filter: invert(1) brightness(0.96);
  }

  .ftr-tagline {
    margin: 0;
    font-size: clamp(2rem, 5.5vw, 3.35rem);
    font-style: italic;
    font-weight: 400;
    line-height: 0.95;
    letter-spacing: 0.01em;
    color: oklch(0.95 0.012 85);
  }

  .ftr-since-line {
    margin: 0.85rem 0 0;
    font-size: 0.72rem;
    letter-spacing: 0.28em;
    text-transform: uppercase;
    color: oklch(0.58 0.015 85);
  }

  .ftr-rule {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    gap: 1.25rem;
    margin-bottom: clamp(2.25rem, 4vw, 3.25rem);
  }

  .ftr-rule-line {
    height: 1px;
    background: linear-gradient(
      90deg,
      transparent,
      oklch(0.42 0.02 260) 20%,
      oklch(0.52 0.04 45 / 0.55) 50%,
      oklch(0.42 0.02 260) 80%,
      transparent
    );
  }

  .ftr-meander {
    --c: oklch(0.72 0.08 45);
    display: block;
    width: 6.4rem;
    opacity: 0.9;
  }

  .ftr-main {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1.15fr);
    gap: 0;
    border: 1px solid oklch(0.34 0.02 260);
    background: oklch(0.17 0.02 260 / 0.55);
    margin-bottom: 1.75rem;
  }

  .ftr-panel {
    padding: clamp(1.35rem, 2.5vw, 2rem) clamp(1.25rem, 2.5vw, 2rem);
    display: grid;
    align-content: start;
    gap: 1rem;
  }

  .ftr-panel:not(:last-child) {
    border-right: 1px solid oklch(0.32 0.02 260);
  }

  .ftr-eyebrow {
    font-size: 0.64rem;
    letter-spacing: 0.26em;
    text-transform: uppercase;
    color: oklch(0.58 0.06 45);
  }

  .ftr-links {
    display: grid;
    gap: 0.15rem;
  }

  .ftr-links a {
    display: grid;
    grid-template-columns: 2rem 1fr;
    align-items: baseline;
    gap: 0.65rem;
    padding: 0.45rem 0;
    color: oklch(0.86 0.015 85);
    text-decoration: none;
    font-size: 0.92rem;
    letter-spacing: 0.05em;
    border-bottom: 1px solid oklch(0.28 0.02 260);
    transition: color 0.25s ease, padding-left 0.25s ease;
  }

  .ftr-links a:last-child {
    border-bottom: 0;
  }

  .ftr-link-idx {
    font-family: var(--mono);
    font-size: 0.62rem;
    letter-spacing: 0.08em;
    color: oklch(0.5 0.02 85);
  }

  .ftr-links a:hover {
    color: oklch(0.98 0.01 85);
    padding-left: 0.2rem;
  }

  .ftr-links a:hover .ftr-link-idx {
    color: oklch(0.72 0.1 45);
  }

  .ftr-panel--house {
    gap: 0;
  }

  :global(.ftr-panel--house .loc-label) {
    color: oklch(0.58 0.06 45);
  }

  :global(.ftr-panel--house .loc-addr) {
    color: oklch(0.94 0.012 85);
  }

  :global(.ftr-panel--house .loc-postal) {
    color: oklch(0.62 0.015 85);
    opacity: 1;
  }

  :global(.ftr-panel--house .loc-phone),
  :global(.ftr-panel--house .loc-email) {
    color: oklch(0.76 0.08 45);
  }

  .ftr-legal {
    max-width: 36rem;
    margin: 0 0 2rem;
    font-size: 0.78rem;
    line-height: 1.65;
    color: oklch(0.52 0.015 85);
  }

  .ftr-plaque {
    position: relative;
    margin: 0 0 2.25rem;
    padding: clamp(1.35rem, 2.5vw, 1.85rem) clamp(1.5rem, 4vw, 2.5rem);
    text-align: center;
    border: 1px solid oklch(0.36 0.02 260);
    background: oklch(0.14 0.018 260 / 0.75);
  }

  .ftr-plaque::before,
  .ftr-plaque::after {
    content: '';
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    width: min(8rem, 30%);
    height: 1px;
    background: linear-gradient(90deg, transparent, oklch(0.55 0.06 45 / 0.5), transparent);
  }

  .ftr-plaque::before {
    top: 0;
  }

  .ftr-plaque::after {
    bottom: 0;
  }

  .ftr-plaque-label {
    margin: 0 0 0.75rem;
    font-size: 0.62rem;
    letter-spacing: 0.3em;
    color: oklch(0.58 0.06 45);
  }

  .ftr-distributor {
    margin: 0 auto;
    max-width: 46rem;
    font-family: var(--display);
    font-size: clamp(0.92rem, 1.6vw, 1.05rem);
    font-style: italic;
    line-height: 1.65;
    letter-spacing: 0.02em;
    color: oklch(0.74 0.015 85);
  }

  .ftr-bar {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
    gap: 0.85rem 1.25rem;
    padding-top: 1.25rem;
    border-top: 1px solid oklch(0.3 0.02 260);
    font-size: 0.62rem;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: oklch(0.5 0.015 85);
  }

  .ftr-bar-mid {
    font-size: 0.45rem;
    color: oklch(0.45 0.06 45);
    opacity: 0.8;
  }

  @media (max-width: 900px) {
    .ftr-masthead {
      grid-template-columns: 1fr;
    }

    .ftr-column-ornament {
      display: none;
    }

    .ftr-main {
      grid-template-columns: 1fr;
    }

    .ftr-panel:not(:last-child) {
      border-right: 0;
      border-bottom: 1px solid oklch(0.32 0.02 260);
    }
  }

  @media (max-width: 560px) {
    .ftr-bar {
      flex-direction: column;
      gap: 0.5rem;
    }

    .ftr-bar-mid {
      display: none;
    }
  }
</style>
