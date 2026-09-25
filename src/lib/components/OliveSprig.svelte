<script>
  let { size = 80, style = {} } = $props();
</script>

<svg viewBox="0 0 100 100" width={size} height={size} aria-hidden="true" style={style}>
  <g stroke="currentColor" stroke-width="1.4" fill="none" stroke-linecap="round">
    <path d="M50 8 C 48 40, 50 65, 50 92" />
    {#each [14, 26, 38, 50, 62, 74] as y, i}
      <g>
        <path d="M50 {y} Q {30 - (i % 2) * 4} {y - 6}, {20 - (i % 2) * 5} {y + 4}" />
        <path d="M50 {y + 6} Q {70 + (i % 2) * 4} {y}, {80 + (i % 2) * 5} {y + 10}" />
        <ellipse
          cx={20 - (i % 2) * 5}
          cy={y + 4}
          rx="11"
          ry="4.5"
          fill="currentColor"
          opacity="0.18"
          transform="rotate(-30 {20 - (i % 2) * 5} {y + 4})"
        />
        <ellipse
          cx={80 + (i % 2) * 5}
          cy={y + 10}
          rx="11"
          ry="4.5"
          fill="currentColor"
          opacity="0.18"
          transform="rotate(30 {80 + (i % 2) * 5} {y + 10})"
        />
      </g>
    {/each}
  </g>
</svg>
