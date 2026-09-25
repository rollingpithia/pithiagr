<script>
  import Catalogue from '$lib/components/Catalogue.svelte';
  import { getContext } from 'svelte';

  const t = getContext('t');
  const lang = getContext('lang');
</script>

<svelte:head>
  <title>{t().catalogue.meta.title}</title>
  <meta name="description" content={t().catalogue.meta.description} />
</svelte:head>

<Catalogue t={t()} lang={lang()} />
