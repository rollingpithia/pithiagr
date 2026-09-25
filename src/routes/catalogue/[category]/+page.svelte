<script>
  import CategoryProducts from '$lib/components/CategoryProducts.svelte';
  import CategoryType2 from '$lib/components/CategoryType2.svelte';
  import { localized } from '$lib/catalogue-data.js';
  import { getContext } from 'svelte';

  let { data } = $props();
  const t = getContext('t');
  const lang = getContext('lang');

  const category = $derived(data.category);
  const title = $derived(localized(category.name, lang()));
  const description = $derived(localized(category.description, lang()));
</script>

<svelte:head>
  <title>{title} — {t().brand.name}</title>
  <meta name="description" content={description} />
</svelte:head>

{#if category.type === 2}
  <CategoryType2 {category} t={t()} lang={lang()} />
{:else}
  <CategoryProducts {category} t={t()} lang={lang()} />
{/if}
