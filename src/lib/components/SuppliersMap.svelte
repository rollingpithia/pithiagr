<script>
  import { onMount, untrack } from 'svelte';
  import { browser } from '$app/environment';

  /** @type {{ suppliers: import('$lib/suppliers.js').Supplier[], pins?: import('$lib/contact.js').OfficialLocation[], pinLabels?: Record<string, string>, selectedId?: string | null, onSelect?: (id: string) => void }} */
  let { suppliers, pins = [], pinLabels = {}, selectedId = null, onSelect } = $props();

  let mapEl = $state(null);
  /** @type {import('leaflet').Map | null} */
  let map = null;
  /** @type {import('leaflet') | null} */
  let L = null;
  /** @type {Map<string, import('leaflet').CircleMarker>} */
  const markerLayer = new Map();
  /** @type {import('leaflet').CircleMarker[]} */
  let pinMarkers = [];
  let boundsKey = '';

  const withCoords = $derived(suppliers.filter((s) => s.lat != null && s.lng != null));

  onMount(() => {
    if (!browser || !mapEl) return;

    let cancelled = false;

    (async () => {
      const leaflet = (await import('leaflet')).default;
      await import('leaflet/dist/leaflet.css');
      if (cancelled || !mapEl) return;

      L = leaflet;
      map = L.map(mapEl, { scrollWheelZoom: false });
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 18,
      }).addTo(map);

      syncMarkers();
    })();

    return () => {
      cancelled = true;
      clearMarkers();
      map?.remove();
      map = null;
      L = null;
      boundsKey = '';
    };
  });

  function clearMarkers() {
    for (const marker of markerLayer.values()) marker.remove();
    markerLayer.clear();
    for (const marker of pinMarkers) marker.remove();
    pinMarkers = [];
  }

  function syncMarkers() {
    if (!map || !L) return;

    const next = withCoords;
    const nextPins = pins;
    const nextKey = `${next.map((s) => s.id).join(',')}|${nextPins.map((p) => p.id).join(',')}`;

    clearMarkers();

    const bounds = L.latLngBounds([]);
    for (const p of nextPins) {
      const label = pinLabels[p.labelKey] ?? p.labelKey;
      const marker = L.circleMarker([p.lat, p.lng], {
        radius: 9,
        color: '#2a2a35',
        weight: 2,
        fillColor: '#d4a574',
        fillOpacity: 0.95,
      });
      marker.bindPopup(
        `<strong>${escapeHtml(label)}</strong><br>${escapeHtml(p.line1)}<br>${escapeHtml(`${p.postal}, ${p.city}`)}${p.phone ? `<br><a href="tel:${p.phone.replace(/\s/g, '')}">${escapeHtml(p.phone)}</a>` : ''}`,
      );
      marker.addTo(map);
      pinMarkers.push(marker);
      bounds.extend([p.lat, p.lng]);
    }

    for (const s of next) {
      const marker = L.circleMarker([s.lat, s.lng], {
        radius: 7,
        color: '#8b3a2a',
        weight: 2,
        fillColor: '#c45c3e',
        fillOpacity: 0.85,
      });
      marker.bindPopup(
        `<strong>${escapeHtml(s.name)}</strong><br>${escapeHtml(s.address)}${s.phone ? `<br><a href="tel:${s.phone}">${escapeHtml(s.phone)}</a>` : ''}`,
      );
      marker.on('click', () => onSelect?.(s.id));
      marker.addTo(map);
      markerLayer.set(s.id, marker);
      bounds.extend([s.lat, s.lng]);
    }

    if (nextKey !== boundsKey) {
      boundsKey = nextKey;
      if (bounds.isValid()) {
        map.fitBounds(bounds.pad(0.12));
      } else {
        map.setView([38.5, 23.7], 6);
      }
    }
  }

  $effect(() => {
    withCoords;
    pins;
    pinLabels;
    untrack(syncMarkers);
  });

  $effect(() => {
    if (!map || !selectedId) return;
    const marker = markerLayer.get(selectedId);
    const supplier = withCoords.find((s) => s.id === selectedId);
    if (!marker || !supplier) return;
    untrack(() => {
      map.setView([supplier.lat, supplier.lng], Math.max(map.getZoom(), 14), { animate: true });
      marker.openPopup();
    });
  });

  /** @param {string} s */
  function escapeHtml(s) {
    return s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
</script>

<div class="map-shell" class:map-shell--empty={withCoords.length === 0}>
  <div class="map-canvas" bind:this={mapEl} role="img" aria-label="Map of stockist locations"></div>
  {#if withCoords.length === 0}
    <p class="map-empty">Map coordinates are not available yet.</p>
  {/if}
</div>

<style>
  .map-shell {
    position: relative;
    border: 1px solid var(--line);
    border-radius: 2px;
    overflow: hidden;
    background: #e8e4dc;
    min-height: 420px;
    isolation: isolate;
  }

  .map-canvas {
    width: 100%;
    height: min(52vh, 520px);
    min-height: 420px;
    z-index: 0;
  }

  .map-shell--empty .map-canvas {
    opacity: 0.35;
  }

  .map-empty {
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
    padding: 1.5rem;
    text-align: center;
    color: var(--muted);
    font-size: 0.95rem;
    pointer-events: none;
    z-index: 1;
  }

  :global(.map-shell .leaflet-container) {
    font-family: var(--sans);
    background: #e8e4dc;
    z-index: 0;
  }

  :global(.map-shell .leaflet-pane),
  :global(.map-shell .leaflet-top),
  :global(.map-shell .leaflet-bottom) {
    z-index: 1;
  }

  :global(.leaflet-popup-content-wrapper) {
    border-radius: 2px;
    font-size: 0.85rem;
    line-height: 1.45;
  }

  :global(.leaflet-popup-content strong) {
    font-family: var(--display);
    font-weight: 500;
    font-size: 1rem;
  }
</style>
