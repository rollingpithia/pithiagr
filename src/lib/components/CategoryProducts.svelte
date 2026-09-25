<script>
  import { base } from '$app/paths';
  import { asset } from '$lib/asset.js';
  import { reveal } from '$lib/actions/reveal.js';
  import { categoryAttributes, isListed, localized, productAttributes, productLine } from '$lib/catalogue-data.js';
  import ProductOverlay from '$lib/components/ProductOverlay.svelte';

  let { t, lang, category } = $props();

  /** @type {Record<string, unknown> | null} */
  let selected = $state(null);

  /** @type {string} */
  let attributeFilter = $state('all');

  const attributes = $derived(categoryAttributes(category, lang));
  const title = $derived(localized(category.name, lang));
  const description = $derived(localized(category.description, lang));
  const catalogueUrl = $derived(`${base}/catalogue`);

  const listed = $derived(category.products.filter((p) => isListed(p)));
  const filtered = $derived(
    listed.filter((p) => {
      if (attributeFilter === 'all') return true;
      return productAttributes(p, lang).some((attr) => attr.id === attributeFilter);
    }),
  );

  /** @param {Record<string, unknown>} product */
  function openProduct(product) {
    selected = product;
  }

  function closeProduct() {
    selected = null;
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
    <p class="reveal reveal-d4 cat-hero-count">
      {t.products.productCount.replace('{count}', String(filtered.length))}
    </p>
  </div>
</section>

<section class="cat-body cat-body--products">
  <div class="container">
    <div class="prod-layout">
      {#if attributes.length}
        <aside class="prod-side">
          <div class="prod-filter-group" role="tablist" aria-label={t.products.filterType}>
            <button
              type="button"
              role="tab"
              class="prod-filter-btn"
              class:active={attributeFilter === 'all'}
              aria-selected={attributeFilter === 'all'}
              onclick={() => (attributeFilter = 'all')}
            >
              {t.products.all}
            </button>
            {#each attributes as attr (attr.id)}
              <button
                type="button"
                role="tab"
                class="prod-filter-btn"
                class:active={attributeFilter === attr.id}
                aria-selected={attributeFilter === attr.id}
                onclick={() => (attributeFilter = attr.id)}
              >
                {attr.label}
              </button>
            {/each}
          </div>
        </aside>
      {/if}

      <div class="prod-main">
    {#if filtered.length === 0}
      <p class="prod-empty">{t.products.empty}</p>
    {:else}
      <div class="prod-grid">
        {#each filtered as product (product.SKU)}
          {@const name = localized(product.Name, lang)}
          {@const line = productLine(product)}
          <button
            type="button"
            class="prod-card"
            onclick={() => openProduct(product)}
            aria-label="{t.products.viewDetails}: {name}"
          >
            <div class="prod-card-media">
              {#if product.Image}
                <img
                  src={asset(String(product.Image))}
                  alt=""
                  width="800"
                  height="800"
                  loading="lazy"
                  decoding="async"
                />
              {:else}
                <div class="prod-card-placeholder" aria-hidden="true"></div>
              {/if}
              <div class="prod-card-shade" aria-hidden="true"></div>
            </div>
            <div class="prod-card-body">
              {#if line}
                <span class="prod-card-brand" class:prod-card-brand--physis={line === 'physis'}>
                  {t.catalogue.variants[line]}
                </span>
              {/if}
              <span class="prod-card-name">{name}</span>
              <span class="prod-card-cta">{t.products.viewDetails}</span>
            </div>
          </button>
        {/each}
      </div>
    {/if}
      </div>
    </div>
  </div>
</section>

<ProductOverlay product={selected} {category} {t} {lang} onClose={closeProduct} />
