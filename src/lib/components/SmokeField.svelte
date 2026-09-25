<script>
  import { onMount } from 'svelte';

  let {
    count = 7,
    hue = 'primary',
    opacity = 0.5,
    height = '100%',
    baseFreq = 0.012,
    class: className = '',
    style = {},
  } = $props();

  const id = `sf-${Math.random().toString(36).slice(2, 8)}`;

  const tint = $derived(
    hue === 'olive'
      ? 'oklch(0.62 0.08 120)'
      : hue === 'gold'
        ? 'oklch(0.78 0.12 85)'
        : hue === 'ink'
          ? 'oklch(0.28 0.02 260)'
          : '#cdecf7',
  );

  let blobs = $state([]);

  onMount(() => {
    const arr = [];
    for (let i = 0; i < count; i++) {
      arr.push({
        x: Math.random() * 100,
        y: 20 + Math.random() * 70,
        r: 120 + Math.random() * 280,
        dur: 14 + Math.random() * 18,
        dly: -Math.random() * 20,
        op: opacity * (0.4 + Math.random() * 0.7),
      });
    }
    blobs = arr;
  });
</script>

<div
  aria-hidden="true"
  class="smokefield {className}"
  style:position="absolute"
  style:inset="0"
  style:height
  style:width="100%"
  style:overflow="hidden"
  style:pointer-events="none"
  style={style}
>
  <svg width="100%" height="100%" preserveAspectRatio="none" style="position:absolute;inset:0">
    <defs>
      <filter id="{id}-disp" x="-20%" y="-20%" width="140%" height="140%">
        <feTurbulence type="fractalNoise" baseFrequency={baseFreq} numOctaves="2" seed="3">
          <animate
            attributeName="baseFrequency"
            dur="32s"
            repeatCount="indefinite"
            values="{baseFreq};{baseFreq * 1.6};{baseFreq}"
          />
        </feTurbulence>
        <feDisplacementMap in="SourceGraphic" scale="60" />
        <feGaussianBlur stdDeviation="14" />
      </filter>
      <radialGradient id="{id}-blob">
        <stop offset="0%" stop-color={tint} stop-opacity="0.85" />
        <stop offset="55%" stop-color={tint} stop-opacity="0.35" />
        <stop offset="100%" stop-color={tint} stop-opacity="0" />
      </radialGradient>
    </defs>
    <g filter="url(#{id}-disp)">
      {#each blobs as b, i (i)}
        <circle
          cx="{b.x}%"
          cy="{b.y}%"
          r={b.r}
          fill="url(#{id}-blob)"
          style:opacity={b.op}
          style:transform-origin="center"
          style:animation="sway {b.dur}s ease-in-out {b.dly}s infinite"
        />
      {/each}
    </g>
  </svg>
</div>
