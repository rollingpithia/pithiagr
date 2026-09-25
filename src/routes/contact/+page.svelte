<script>
  import Contact from '$lib/components/Contact.svelte';
  import { getContext } from 'svelte';

  const getT = getContext('t');
  const t = $derived(getT());
</script>

<svelte:head>
  <title>{t.contact.meta.title}</title>
  <meta name="description" content={t.contact.meta.description} />
</svelte:head>

<Contact />
