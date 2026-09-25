<script>
  import { getContext } from 'svelte';
  import { reveal } from '$lib/actions/reveal.js';
  import { HOUSE_LOCATION } from '$lib/contact.js';
  import { filterSuppliers, suppliersForLocale } from '$lib/suppliers.js';
  import SuppliersMap from '$lib/components/SuppliersMap.svelte';
  import Meander from '$lib/components/Meander.svelte';

  const getT = getContext('t');
  const getLang = getContext('lang');

  const t = $derived(getT());
  const locale = $derived(getLang());

  let query = $state('');
  let selectedId = $state(/** @type {string | null} */ (null));
  let lastLocale = $state('');

  const regional = $derived(suppliersForLocale(locale));
  const hasRegional = $derived(regional.length > 0);
  const filtered = $derived(filterSuppliers(query, locale));
  const mappedCount = $derived(regional.filter((s) => s.lat != null && s.lng != null).length);

  $effect(() => {
    if (locale === lastLocale) return;
    lastLocale = locale;
    query = '';
    selectedId = null;
  });

  /** @param {string} id */
  function selectSupplier(id) {
    selectedId = id;
    const el = document.getElementById(`supplier-${id}`);
    el?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  /** @param {string} phone */
  function telHref(phone) {
    return `tel:${phone.replace(/\s/g, '')}`;
  }
</script>

<section class="find-hero paper-grain" use:reveal>
  <div class="find-hero-wash" aria-hidden="true"></div>
  <div class="container find-hero-inner">
    <div class="find-hero-eyebrow reveal">
      <span class="find-hero-rule" aria-hidden="true"></span>
      <span class="eyebrow">{t.findUs.eyebrow}</span>
    </div>
    <h1 class="display reveal reveal-d2 find-hero-title">{t.findUs.title}</h1>
    <p class="lead reveal reveal-d3 find-hero-sub">{t.findUs.subtitle}</p>
    <div class="reveal reveal-d4 find-hero-meander" aria-hidden="true">
      <Meander />
    </div>
  </div>
</section>

{#if !hasRegional}
  <section class="find-empty-region" use:reveal>
    <div class="container">
      <div class="find-empty-region-card reveal">
        <p class="find-empty-region-eyebrow eyebrow">{t.findUs.region}</p>
        <h2 class="display find-empty-region-title">{t.findUs.emptyRegion}</h2>
        <p class="find-empty-region-note">{t.findUs.emptyRegionNote}</p>
      </div>
    </div>
  </section>
{:else}
  <section class="find-network" use:reveal>
    <div class="container">
      <header class="find-network-head reveal">
        <div>
          <span class="eyebrow">{t.findUs.eyebrow}</span>
          <h2 class="display find-network-title">{t.findUs.listTitle}</h2>
        </div>
        <p class="find-network-count">
          {t.findUs.count
            .replace('{shown}', String(filtered.length))
            .replace('{total}', String(regional.length))
            .replace('{mapped}', String(mappedCount))}
        </p>
      </header>

      <label class="find-search reveal reveal-d2">
        <span class="sr-only">{t.findUs.search}</span>
        <input
          type="search"
          bind:value={query}
          placeholder={t.findUs.searchPlaceholder}
          autocomplete="off"
        />
      </label>

      <div class="find-network-body reveal reveal-d3">
        <div class="find-map-wrap">
          <p class="find-map-note">{t.findUs.mapNote}</p>
          {#key locale}
            <SuppliersMap
              suppliers={regional}
              pins={[HOUSE_LOCATION]}
              pinLabels={t.findUs.locations}
              {selectedId}
              onSelect={selectSupplier}
            />
          {/key}
          <p class="find-map-attrib">{t.findUs.mapAttrib}</p>
        </div>

        <div class="find-directory-wrap">
          <ul class="find-directory" role="list">
            {#each filtered as s (s.id)}
              <li>
                <button
                  type="button"
                  id="supplier-{s.id}"
                  class="find-directory-item"
                  class:find-directory-item--active={selectedId === s.id}
                  onclick={() => selectSupplier(s.id)}
                >
                  <span class="find-directory-name">{s.name}</span>
                  <span class="find-directory-addr">{s.address}</span>
                  {#if s.phone}
                    <a
                      class="find-directory-phone"
                      href={telHref(s.phone)}
                      onclick={(e) => e.stopPropagation()}
                    >
                      {s.phone}
                    </a>
                  {/if}
                </button>
              </li>
            {/each}
          </ul>

          {#if filtered.length === 0}
            <p class="find-empty">{t.findUs.empty}</p>
          {/if}
        </div>
      </div>
    </div>
  </section>
{/if}

<style>
  .find-hero {
    position: relative;
    padding: 3rem 0 2.25rem;
    overflow: hidden;
  }

  .find-hero-wash {
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse 80% 60% at 50% 0%, rgba(196, 92, 62, 0.08), transparent 70%);
    pointer-events: none;
  }

  .find-hero-inner {
    position: relative;
    text-align: center;
    max-width: 40rem;
    margin-inline: auto;
  }

  .find-hero-eyebrow {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    margin-bottom: 0.85rem;
  }

  .find-hero-rule {
    width: 2.5rem;
    height: 1px;
    background: var(--accent);
    opacity: 0.5;
  }

  .find-hero-title {
    font-size: clamp(2rem, 4.5vw, 3.1rem);
    line-height: 1.05;
    margin: 0 0 0.85rem;
  }

  .find-hero-sub {
    margin: 0;
    color: var(--muted);
    font-size: clamp(1rem, 2vw, 1.1rem);
  }

  .find-hero-meander {
    margin: 1.5rem auto 0;
    width: fit-content;
  }

  /* Empty region */
  .find-empty-region {
    padding: 0 0 5rem;
  }

  .find-empty-region-card {
    max-width: 36rem;
    margin-inline: auto;
    text-align: center;
    padding: 2.5rem 2rem;
    border: 1px solid var(--line);
    border-radius: 2px;
    background: var(--paper);
  }

  .find-empty-region-eyebrow {
    margin: 0 0 0.75rem;
    color: var(--accent);
  }

  .find-empty-region-title {
    font-size: clamp(1.5rem, 3vw, 2rem);
    margin: 0 0 1rem;
    line-height: 1.15;
  }

  .find-empty-region-note {
    margin: 0;
    color: var(--muted);
    line-height: 1.6;
    font-size: 0.95rem;
  }

  /* Stockist network */
  .find-network {
    padding: 2.25rem 0 5rem;
  }

  .find-network-head {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-end;
    justify-content: space-between;
    gap: 0.75rem 1.5rem;
    margin-bottom: 1.25rem;
  }

  .find-network-title {
    font-size: clamp(1.5rem, 2.8vw, 1.9rem);
    margin: 0.3rem 0 0;
    line-height: 1.1;
  }

  .find-network-count {
    margin: 0;
    font-size: 0.82rem;
    letter-spacing: 0.06em;
    color: var(--muted);
    line-height: 1.45;
    text-align: right;
  }

  .find-search {
    display: block;
    margin-bottom: 1.75rem;
    max-width: 28rem;
  }

  .find-search input {
    width: 100%;
    padding: 0.7rem 0;
    border: 0;
    border-bottom: 1px solid var(--line);
    border-radius: 0;
    background: transparent;
    color: var(--ink);
    font: inherit;
    font-size: 0.95rem;
    letter-spacing: 0.02em;
    transition: border-color 0.2s ease;
  }

  .find-search input::placeholder {
    color: color-mix(in srgb, var(--muted) 80%, transparent);
  }

  .find-search input:focus {
    outline: none;
    border-bottom-color: color-mix(in srgb, var(--accent) 55%, var(--line));
  }

  .find-network-body {
    display: grid;
    gap: 2rem;
    align-items: start;
  }

  @media (min-width: 960px) {
    .find-network-body {
      grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.9fr);
      gap: clamp(2rem, 4vw, 3rem);
    }
  }

  .find-map-wrap {
    display: grid;
    gap: 0.65rem;
  }

  @media (min-width: 960px) {
    .find-map-wrap {
      position: sticky;
      top: 5.5rem;
    }
  }

  .find-map-note {
    margin: 0;
    font-size: 0.82rem;
    color: var(--muted);
    line-height: 1.5;
  }

  .find-map-attrib {
    margin: 0;
    font-size: 0.68rem;
    color: var(--muted);
    line-height: 1.4;
    opacity: 0.85;
  }

  .find-directory-wrap {
    min-height: 0;
  }

  .find-directory {
    list-style: none;
    margin: 0;
    padding: 0;
    max-height: min(68vh, 680px);
    overflow: auto;
    border-top: 1px solid var(--line);
  }

  .find-directory-item {
    width: 100%;
    text-align: left;
    padding: 0.85rem 0.5rem 0.85rem 0;
    border: 0;
    border-bottom: 1px solid var(--line);
    border-radius: 0;
    background: transparent;
    cursor: pointer;
    display: grid;
    gap: 0.2rem;
    transition: padding-left 0.2s ease, background 0.2s ease;
  }

  .find-directory-item:hover {
    padding-left: 0.35rem;
    background: color-mix(in srgb, var(--accent) 4%, transparent);
  }

  .find-directory-item--active {
    padding-left: 0.65rem;
    border-left: 2px solid var(--accent);
    background: color-mix(in srgb, var(--accent) 6%, transparent);
  }

  .find-directory-name {
    font-family: var(--display);
    font-size: 1.02rem;
    line-height: 1.25;
    color: var(--ink);
  }

  .find-directory-addr {
    font-size: 0.84rem;
    color: var(--muted);
    line-height: 1.45;
  }

  .find-directory-phone {
    font-size: 0.8rem;
    color: var(--accent);
    text-decoration: none;
    width: fit-content;
  }

  .find-directory-phone:hover {
    text-decoration: underline;
  }

  .find-empty {
    margin: 1.25rem 0 0;
    color: var(--muted);
    font-size: 0.92rem;
  }

  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  /* Tighter map on this page */
  :global(.find-map-wrap .map-shell) {
    min-height: 320px;
  }

  :global(.find-map-wrap .map-canvas) {
    height: min(48vh, 460px);
    min-height: 320px;
  }
</style>
