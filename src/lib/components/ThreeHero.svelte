<script>
  import { onMount } from 'svelte';
  import { base } from '$app/paths';
  import { initThreeHero } from '$lib/three-hero.js';

  let container;

  onMount(() => {
    if (!container) return;
    let destroy;
    initThreeHero(container, { base }).then((fn) => {
      destroy = fn;
    });
    return () => destroy?.();
  });
</script>

<div id="webgl-container" bind:this={container} aria-hidden="true"></div>
