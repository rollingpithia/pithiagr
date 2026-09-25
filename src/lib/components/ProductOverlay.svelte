<script>
  import { asset } from '$lib/asset.js';
  import { localized, productLine, productSpecs } from '$lib/catalogue-data.js';

  let { product, category, t, lang, onClose } = $props();

  const name = $derived(product ? localized(product.Name, lang) : '');
  const line = $derived(product ? productLine(product) : '');
  const specs = $derived(product ? productSpecs(category, product, lang) : []);
  const shortText = $derived(product ? localized(product['Short Description'], lang) : '');
  const description = $derived(product ? localized(product.Description, lang) : '');
  const image = $derived(product?.Image ? asset(String(product.Image)) : '');

  $effect(() => {
    if (!product) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  });
</script>

{#if product}
  <div class="prod-overlay" role="presentation" onclick={onClose}>
    <div
      class="prod-panel"
      role="dialog"
      aria-modal="true"
      aria-labelledby="prod-title"
      tabindex="-1"
      onclick={(e) => e.stopPropagation()}
      onkeydown={(e) => e.stopPropagation()}
    >
      <button type="button" class="prod-close" onclick={onClose} aria-label={t.products.close}>
        <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
          <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" stroke-width="1.5" />
        </svg>
      </button>

      <div class="prod-panel-grid">
        <div class="prod-gallery">
          {#if image}
            <div class="prod-gallery-main">
              <img src={image} alt={name} width="800" height="800" decoding="async" />
            </div>
          {:else}
            <div class="prod-gallery-empty">
              <span class="eyebrow">{t.products.noImage}</span>
            </div>
          {/if}
        </div>

        <div class="prod-info">
          {#if line}
            <div class="prod-badges">
              <span class="prod-badge" class:prod-badge--physis={line === 'physis'}>
                {t.catalogue.variants[line]}
              </span>
            </div>
          {/if}

          <h2 id="prod-title" class="display prod-name">{name}</h2>

          {#if specs.length}
            <ul class="prod-icons">
              {#each specs as spec (spec.key)}
                <li class="prod-icon">
                  <img src={asset(spec.icon)} alt="" width="28" height="28" />
                  <span>{spec.value}</span>
                </li>
              {/each}
            </ul>
          {/if}

          {#if description}
            <p class="prod-description">{description}</p>
          {:else if !shortText}
            <p class="prod-desc-placeholder">{t.products.descriptionSoon}</p>
          {/if}

          {#if description && shortText}
            <hr class="prod-desc-rule" />
          {/if}

          {#if shortText}
            <p class="prod-short">{shortText}</p>
          {/if}
        </div>
      </div>
    </div>
  </div>
{/if}
