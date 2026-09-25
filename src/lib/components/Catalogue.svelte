<script>
  import { base } from '$app/paths';
  import { asset } from '$lib/asset.js';
  import { reveal } from '$lib/actions/reveal.js';
  import { CATEGORIES, linesFor } from '$lib/catalogue.js';
  import { localized } from '$lib/catalogue-data.js';
  import Meander from '$lib/components/Meander.svelte';

  let { t, lang } = $props();

  const featured = $derived(CATEGORIES.filter((c) => c.type === 1));
  const standard = $derived(CATEGORIES.filter((c) => c.type !== 1));
  const home = $derived(base || '/');
  const catalogueBase = $derived(`${base}/catalogue`);

  /** @param {string} id */
  function categoryHref(id) {
    return `${catalogueBase}/${id}`;
  }
</script>

<section class="cat-hero cat-hero--center paper-grain" use:reveal>
  <div class="cat-hero-wash" aria-hidden="true"></div>
  <div class="container cat-hero-inner">
    <div class="cat-hero-eyebrow reveal">
      <span class="cat-hero-rule" aria-hidden="true"></span>
      <span class="eyebrow">{t.catalogue.eyebrow}</span>
    </div>
    <h1 class="display reveal reveal-d2 cat-hero-title">{t.catalogue.title}</h1>
    <p class="lead reveal reveal-d3 cat-hero-sub">{t.catalogue.subtitle}</p>
    <div class="reveal reveal-d4 cat-hero-meander" aria-hidden="true">
      <Meander />
    </div>
    <p class="reveal reveal-d5 cat-hero-note">{t.catalogue.note}</p>
  </div>
</section>

<section class="cat-body" use:reveal>
  <div class="container">
    <div class="cat-section-head reveal">
      <span class="eyebrow">{t.catalogue.featuredEyebrow}</span>
      <h2 class="display cat-section-title">{t.catalogue.featuredTitle}</h2>
    </div>

    <div class="cat-featured">
      {#each featured as cat, i (cat.slug)}
        {@const title = localized(cat.name, lang)}
        {@const desc = localized(cat.description, lang)}
        {@const lines = linesFor(cat)}
        <article class="cat-card cat-card--featured reveal reveal-d{i + 2}">
          <a class="cat-card-link" href={categoryHref(cat.slug)} aria-label={title}>
            <div class="cat-card-media">
              {#if cat.image}
                <img src={asset(cat.image)} alt="" width="800" height="800" loading="lazy" decoding="async" />
              {/if}
              <div class="cat-card-shade" aria-hidden="true"></div>
            </div>
            <div class="cat-card-body">
              <h3 class="display cat-card-title">{title}</h3>
              <p class="cat-card-desc cat-card-excerpt">{desc}</p>
              {#if lines.length}
                <div class="cat-variants">
                  {#each lines as variant (variant)}
                    <span class="cat-variant" class:cat-variant--physis={variant === 'physis'}>
                      {t.catalogue.variants[variant]}
                    </span>
                  {/each}
                </div>
              {/if}
              <span class="cat-card-cta">
                {t.catalogue.explore}
                <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.5" fill="none" />
                </svg>
              </span>
            </div>
          </a>
        </article>
      {/each}
    </div>

    <div class="cat-divider reveal" aria-hidden="true">
      <span class="cat-divider-line"></span>
      <span class="cat-divider-label eyebrow">{t.catalogue.moreEyebrow}</span>
      <span class="cat-divider-line"></span>
    </div>

    <div class="cat-grid">
      {#each standard as cat, i (cat.slug)}
        {@const title = localized(cat.name, lang)}
        {@const desc = localized(cat.description, lang)}
        <article class="cat-card reveal reveal-d{i + 2}">
          <a class="cat-card-link" href={categoryHref(cat.slug)} aria-label={title}>
            <div class="cat-card-media">
              {#if cat.image}
                <img src={asset(cat.image)} alt="" width="800" height="800" loading="lazy" decoding="async" />
              {/if}
              <div class="cat-card-shade" aria-hidden="true"></div>
            </div>
            <div class="cat-card-body">
              <h3 class="display cat-card-title">{title}</h3>
              <p class="cat-card-desc cat-card-excerpt">{desc}</p>
              <span class="cat-card-cta">
                {t.catalogue.explore}
                <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.5" fill="none" />
                </svg>
              </span>
            </div>
          </a>
        </article>
      {/each}
    </div>

    <div class="cat-close reveal">
      <a class="btn btn--ghost" href={home}>
        {t.catalogue.backHome}
      </a>
    </div>
  </div>
</section>
