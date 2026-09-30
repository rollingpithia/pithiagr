<script>
  import { onMount } from 'svelte';
  import { base } from '$app/paths';
  import { initThreeHero } from '$lib/three-hero.js';

  let container;

  /** Phones stay on the still hero. Tablets and desktops get the orbit. */
  const wideScreen = '(min-width: 768px)';

  onMount(() => {
    const wide = window.matchMedia(wideScreen);
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    /** @type {(() => void) | undefined} */
    let destroy;
    let pending = false;

    async function sync() {
      const show = wide.matches && !reduce.matches;
      if (!show) {
        destroy?.();
        destroy = undefined;
        return;
      }
      if (destroy || pending || !container) return;
      pending = true;
      try {
        const teardown = await initThreeHero(container, { base });
        if (!wide.matches || reduce.matches) {
          teardown?.();
          return;
        }
        destroy = teardown;
      } finally {
        pending = false;
      }
    }

    sync();
    wide.addEventListener('change', sync);
    reduce.addEventListener('change', sync);

    return () => {
      wide.removeEventListener('change', sync);
      reduce.removeEventListener('change', sync);
      destroy?.();
    };
  });
</script>

<div id="webgl-container" bind:this={container} aria-hidden="true"></div>
