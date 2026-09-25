<script>
  let { side = 'left', height = '100%', style = {} } = $props();
  const flip = $derived(side === 'right' ? 'scaleX(-1)' : 'none');
</script>

<svg
  viewBox="0 0 100 600"
  preserveAspectRatio="xMidYMax meet"
  aria-hidden="true"
  style:height
  style:transform={flip}
  style={style}
>
  <rect x="0" y="0" width="100" height="14" fill="currentColor" opacity="0.85" />
  <rect x="6" y="14" width="88" height="10" fill="currentColor" opacity="0.7" />
  <ellipse cx="50" cy="32" rx="46" ry="10" fill="currentColor" opacity="0.6" />
  <g opacity="0.45">
    <rect x="14" y="42" width="72" height="520" fill="currentColor" />
    {#each Array(6) as _, i}
      <rect x={20 + i * 11} y="42" width="2" height="520" fill="oklch(0.97 0.012 85)" opacity="0.8" />
    {/each}
  </g>
  <rect x="6" y="562" width="88" height="14" fill="currentColor" opacity="0.7" />
  <rect x="0" y="576" width="100" height="20" fill="currentColor" opacity="0.85" />
</svg>
