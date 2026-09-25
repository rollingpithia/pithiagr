<script>
  import StoryIntro from '$lib/components/StoryIntro.svelte';
  import Timeline from '$lib/components/Timeline.svelte';
  import { getContext } from 'svelte';

  const t = getContext('t');
</script>

<svelte:head>
  <title>{t().story.meta.title}</title>
  <meta name="description" content={t().story.meta.description} />
</svelte:head>

<StoryIntro t={t()} />
<Timeline t={t()} />
