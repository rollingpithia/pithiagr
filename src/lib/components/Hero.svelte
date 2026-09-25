<script>
  import { base } from '$app/paths';
  import { asset } from '$lib/asset.js';

  let { t } = $props();
  const stats = $derived(t.hero.stats ?? []);
  const storyHref = $derived(`${base}/story`);
</script>

<section id="top" class="hero">
  <div aria-hidden="true" class="hero-aureole"></div>
  <div aria-hidden="true" class="hero-grain"></div>

  <div class="container hero-inner">
    <div class="hero-text">
      <div class="hero-eyebrow hero-fade" style="animation-delay: 0.15s">
        <span aria-hidden="true" class="hero-eyebrow-rule"></span>
        <span class="eyebrow">{t.hero.eyebrow}</span>
      </div>

      <h1 class="hero-headline hero-fade" style="animation-delay: 0.35s">
        {t.hero.titleB}
      </h1>

      <div aria-hidden="true" class="hero-rule hero-fade" style="animation-delay: 0.55s"></div>

      <p class="hero-subhead hero-fade" style="animation-delay: 0.7s">
        {t.hero.subhead}
      </p>

      <div class="hero-ctas hero-fade" style="animation-delay: 0.95s">
        <a class="btn hero-cta-primary" href="#philosophy">
          <span>{t.hero.cta}</span>
          <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true">
            <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.5" fill="none" />
          </svg>
        </a>
        <a class="btn btn--ghost" href={storyHref}>{t.hero.ctaSec}</a>
      </div>
    </div>

    <div class="hero-art hero-fade" style="animation-delay: 0.25s">
      <img src={asset('/assets/pithia-silhouette.png')} alt="" class="hero-silhouette" />
    </div>
  </div>

  {#if stats.length > 0}
    <div class="container hero-rail hero-fade" style="animation-delay: 1.1s">
      <ul class="hero-rail-list">
        {#each stats as s, i (i)}
          <li>
            <span class="hero-rail-k">{s.k}</span>
            <span class="hero-rail-l">{s.l}</span>
          </li>
        {/each}
      </ul>
    </div>
  {/if}

  <div aria-hidden="true" class="hero-scroll-cue hero-fade" style="animation-delay: 1.35s">
    <span>{t.hero.scroll}</span>
    <span class="hero-scroll-line"></span>
  </div>
</section>

<style>
  @keyframes scrollPulse {
    0%,
    100% {
      transform: scaleY(0.4);
      transform-origin: top;
      opacity: 0.3;
    }
    50% {
      transform: scaleY(1);
      transform-origin: top;
      opacity: 1;
    }
  }
</style>
