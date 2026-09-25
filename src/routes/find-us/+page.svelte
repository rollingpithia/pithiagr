<script>
  import FindUs from '$lib/components/FindUs.svelte';
  import { getContext } from 'svelte';

  const getT = getContext('t');
  const t = $derived(getT());
</script>

<svelte:head>
  <title>{t.findUs.meta.title}</title>
  <meta name="description" content={t.findUs.meta.description} />
</svelte:head>

<FindUs />
