<script>
  import { asset } from '$lib/asset.js';
  import { OFFICIAL_LOCATIONS, CONTACT_EMAIL } from '$lib/contact.js';

  /** @type {{ labels: Record<string, string>, showEmail?: boolean, showStoreImage?: boolean, variant?: 'card' | 'compact', includeIds?: string[] }} */
  let { labels, showEmail = false, showStoreImage = false, variant = 'card', includeIds } = $props();

  const items = $derived(
    includeIds ? OFFICIAL_LOCATIONS.filter((loc) => includeIds.includes(loc.id)) : OFFICIAL_LOCATIONS,
  );

  /** @param {string} phone */
  function telHref(phone) {
    return `tel:${phone.replace(/\s/g, '')}`;
  }
</script>

<div class="loc" class:loc--compact={variant === 'compact'}>
  {#each items as loc (loc.id)}
    <article class="loc-item" class:loc-item--with-image={showStoreImage && loc.image}>
      {#if showStoreImage && loc.image}
        <figure class="loc-figure">
          <img
            src={asset(loc.image)}
            alt={labels.storeImageAlt ?? ''}
            width="320"
            height="240"
            loading="lazy"
            decoding="async"
          />
          {#if labels.storeImageCaption}
            <figcaption class="loc-figure-caption eyebrow">{labels.storeImageCaption}</figcaption>
          {/if}
        </figure>
      {/if}
      <h3 class="loc-label eyebrow">{labels[loc.labelKey]}</h3>
      <a class="display loc-addr" href={loc.mapsUrl} target="_blank" rel="noopener noreferrer">
        {loc.line1}
      </a>
      <p class="loc-postal">{loc.postal}, {loc.city}</p>
      {#if loc.phone}
        <a class="loc-phone" href={telHref(loc.phone)}>{loc.phone}</a>
      {/if}
    </article>
  {/each}

  {#if showEmail}
    <div class="loc-item loc-item--email">
      <h3 class="loc-label eyebrow">{labels.email ?? 'Email'}</h3>
      <a class="loc-email" href="mailto:{CONTACT_EMAIL}">{CONTACT_EMAIL}</a>
    </div>
  {/if}
</div>

<style>
  .loc {
    display: grid;
    gap: 1.35rem;
  }

  .loc:not(.loc--compact) {
    grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));
    gap: 1.5rem 2rem;
    align-items: start;
  }

  .loc--compact {
    gap: 1.5rem;
  }

  .loc-item {
    display: grid;
    gap: 0.3rem;
  }

  .loc-item--with-image {
    gap: 0.75rem;
  }

  .loc-figure {
    margin: 0 0 0.5rem;
    max-width: 10.5rem;
    border: 1px solid var(--line, oklch(0.85 0.02 85));
    border-radius: 2px;
    overflow: hidden;
    background: #ebe3d6;
  }

  .loc-figure img {
    display: block;
    width: 100%;
    aspect-ratio: 4 / 3;
    object-fit: cover;
  }

  .loc-figure-caption {
    margin: 0;
    padding: 0.35rem 0.5rem;
    font-size: 0.52rem;
    letter-spacing: 0.16em;
    text-align: center;
    color: oklch(0.55 0.04 45);
    background: color-mix(in srgb, var(--paper, #f7f2ea) 70%, #e8e0d4);
    border-top: 1px solid var(--line, oklch(0.85 0.02 85));
  }

  @media (max-width: 720px) {
    .loc:not(.loc--compact) {
      grid-template-columns: 1fr;
    }
  }

  .loc-label {
    margin: 0;
    font-size: 0.64rem;
    letter-spacing: 0.22em;
    color: oklch(0.58 0.06 45);
  }

  .loc--compact .loc-label {
    color: oklch(0.62 0.06 45);
  }

  .loc-addr {
    font-size: clamp(1.1rem, 2vw, 1.35rem);
    font-style: italic;
    line-height: 1.15;
    color: inherit;
    text-decoration: none;
    width: fit-content;
    transition: color 0.2s ease;
  }

  .loc-addr:hover {
    color: var(--accent, oklch(0.72 0.1 45));
  }

  .loc-postal {
    margin: 0;
    font-size: 0.82rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    opacity: 0.75;
  }

  .loc-phone,
  .loc-email {
    margin-top: 0.15rem;
    width: fit-content;
    font-size: 0.88rem;
    letter-spacing: 0.04em;
    text-decoration: none;
    transition: color 0.2s ease, border-color 0.2s ease;
  }

  .loc-phone {
    color: var(--accent, oklch(0.72 0.1 45));
  }

  .loc-email {
    color: oklch(0.76 0.08 45);
    border-bottom: 1px solid oklch(0.76 0.08 45 / 0.35);
    padding-bottom: 0.1rem;
  }

  .loc--compact .loc-phone {
    color: oklch(0.76 0.08 45);
  }

  .loc--compact .loc-email {
    color: oklch(0.76 0.08 45);
  }

  .loc-phone:hover,
  .loc-email:hover {
    opacity: 0.9;
  }
</style>
