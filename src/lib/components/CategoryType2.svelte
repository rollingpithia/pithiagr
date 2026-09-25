<script>
  import { base } from '$app/paths';
  import { asset } from '$lib/asset.js';
  import { reveal } from '$lib/actions/reveal.js';
  import { hasAltText, isListed, localized } from '$lib/catalogue-data.js';
  import Meander from '$lib/components/Meander.svelte';

  let { t, lang, category } = $props();

  const title = $derived(localized(category.name, lang));
  const description = $derived(localized(category.description, lang));
  const catalogueUrl = $derived(`${base}/catalogue`);
  const listed = $derived(category.products.filter((p) => isListed(p)));
  const stories = $derived(listed.filter((p) => hasAltText(p)));
  const gallery = $derived(listed.filter((p) => !hasAltText(p)));

  /** @type {HTMLDivElement | null} */
  let track = $state(null);

  function scrollGallery(direction) {
    if (!track) return;
    const card = track.querySelector('.type2-slide');
    const amount = card ? card.getBoundingClientRect().width + 16 : 280;
    track.scrollBy({ left: direction * amount, behavior: 'smooth' });
  }
</script>

<section class="cat-hero cat-hero--compact paper-grain" use:reveal>
  <div class="cat-hero-wash" aria-hidden="true"></div>
  <div class="container cat-hero-inner">
    <a class="cat-breadcrumb reveal" href={catalogueUrl}>
      <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true">
        <path d="M10 4L6 8l4 4" stroke="currentColor" stroke-width="1.5" fill="none" />
      </svg>
      {t.products.backToCatalogue}
    </a>
    <h1 class="display reveal reveal-d2 cat-hero-title">{title}</h1>
    <div class="cat-intro reveal reveal-d3">
      {#each description.split(/\n\n+/) as paragraph}
        {#if paragraph.trim()}
          <p>{paragraph}</p>
        {/if}
      {/each}
    </div>
  </div>
</section>

<section class="cat-body cat-body--products">
  <div class="container">
    {#if stories.length}
      <div class="type2-flow">
        {#each stories as product, i (product.SKU)}
          {@const alt = localized(product['Alt Text'], lang)}
          {@const name = localized(product.Name, lang)}
          {#if i > 0}
            <div class="type2-link" aria-hidden="true">
              <Meander />
            </div>
          {/if}
          <article class="type2-card" class:type2-card--flip={i % 2 === 1}>
            <div class="type2-media">
              {#if product.Image}
                <img src={asset(String(product.Image))} alt="" width="800" height="800" loading="lazy" />
              {:else}
                <div class="prod-card-placeholder" aria-hidden="true"></div>
              {/if}
            </div>
            <div class="type2-copy">
              {#if name}
                <h2 class="display type2-name">{name}</h2>
              {/if}
              <p class="type2-alt">{alt}</p>
            </div>
          </article>
        {/each}
      </div>
    {/if}

    {#if gallery.length}
      <div class="type2-gallery">
        <div class="type2-gallery-head">
          <button type="button" class="type2-nav" onclick={() => scrollGallery(-1)} aria-label={t.products.viewDetails}>
            <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
              <path d="M10 4L6 8l4 4" stroke="currentColor" stroke-width="1.5" fill="none" />
            </svg>
          </button>
          <button type="button" class="type2-nav" onclick={() => scrollGallery(1)} aria-label={t.products.viewDetails}>
            <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
              <path d="M6 4l4 4-4 4" stroke="currentColor" stroke-width="1.5" fill="none" />
            </svg>
          </button>
        </div>
        <div class="type2-track" bind:this={track}>
          {#each gallery as product (product.SKU)}
            <figure class="type2-slide">
              {#if product.Image}
                <img src={asset(String(product.Image))} alt={localized(product.Name, lang)} width="640" height="640" loading="lazy" />
              {:else}
                <div class="prod-card-placeholder" aria-hidden="true"></div>
              {/if}
            </figure>
          {/each}
        </div>
      </div>
    {/if}
  </div>
</section>
