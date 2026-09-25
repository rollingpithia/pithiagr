<script>
  import { untrack } from 'svelte';
  import { base } from '$app/paths';
  import { asset } from '$lib/asset.js';
  import { createSky } from '$lib/starfield.js';

  /** @type {{ t: import('$lib/i18n/index.js').Messages, kyanosSrc?: string, argyrosSrc?: string, seriesHref?: string }} */
  let {
    t,
    kyanosSrc = asset('/assets/main-img/blue.jpg'),
    argyrosSrc = asset('/assets/main-img/silver.jpg'),
    seriesHref = `${base}/catalogue/xartakia`,
  } = $props();

  const colorways = $derived([
    {
      id: 'kyanos',
      name: t.starry.kyanos.name,
      greek: t.starry.kyanos.greek,
      gold: '#E3B75E',
      src: kyanosSrc,
      alt: t.starry.kyanos.alt,
      line: t.starry.kyanos.line,
      body: t.starry.kyanos.body,
    },
    {
      id: 'argyros',
      name: t.starry.argyros.name,
      greek: t.starry.argyros.greek,
      gold: '#C7A25C',
      src: argyrosSrc,
      alt: t.starry.argyros.alt,
      line: t.starry.argyros.line,
      body: t.starry.argyros.body,
    },
  ]);

  let index = $state(0);
  let active = $derived(colorways[index]);

  let sectionEl;
  let canvasEl;
  let galleryEl;
  let sky;

  const reduce = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  $effect(() => {
    if (!canvasEl || !sectionEl) return;

    sky = createSky(canvasEl, { reducedMotion: reduce() });
    sky.resize();
    untrack(() => sky.to(colorways[index].id, 0));

    const ro = new ResizeObserver(() => sky.resize());
    ro.observe(sectionEl);

    let inView = false;
    const sync = () => (inView && !document.hidden ? sky.start() : sky.stop());

    const io = new IntersectionObserver(
      ([e]) => {
        inView = e.isIntersecting;
        sync();
      },
      { rootMargin: '120px' },
    );
    io.observe(sectionEl);

    document.addEventListener('visibilitychange', sync);

    return () => {
      ro.disconnect();
      io.disconnect();
      document.removeEventListener('visibilitychange', sync);
      sky.destroy();
      sky = undefined;
    };
  });

  $effect(() => {
    sky?.to(colorways[index].id, 0.9);
  });

  function track(e) {
    if (!sectionEl || !matchMedia('(hover: hover)').matches) return;
    const r = sectionEl.getBoundingClientRect();
    sky?.pointer(((e.clientX - r.left) / r.width - 0.5) * 2, ((e.clientY - r.top) / r.height - 0.5) * 2);
  }

  function leave() {
    sky?.pointer(0, 0);
  }

  function galleryKeys(e) {
    const dir = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
    if (!dir) return;
    e.preventDefault();
    index = (index + dir + colorways.length) % colorways.length;
    galleryEl?.querySelectorAll('.pick')[index]?.focus();
  }
</script>

<section
  id="starry"
  class="starry"
  bind:this={sectionEl}
  onpointermove={track}
  onpointerleave={leave}
  style:--gold={active.gold}
  aria-labelledby="starry-title"
>
  <canvas class="sky" bind:this={canvasEl} aria-hidden="true"></canvas>

  <div class="container wrap">
    <header class="lede">
      <div>
        <p class="series">{t.starry.series}</p>
        <h2 id="starry-title">{t.starry.title}</h2>
      </div>
      <p class="intro">{t.starry.intro}</p>
    </header>

    <div class="split">
      <div
        class="gallery"
        role="radiogroup"
        aria-label={t.starry.colorwayLabel}
        tabindex="-1"
        bind:this={galleryEl}
        onkeydown={galleryKeys}
      >
        {#each colorways as c, i}
          <figure class="plate" class:on={i === index}>
            <button
              type="button"
              class="pick"
              role="radio"
              aria-checked={i === index}
              tabindex={i === index ? 0 : -1}
              onclick={() => (index = i)}
            >
              <span class="media">
                <img src={c.src} alt={c.alt} loading="lazy" decoding="async" draggable="false" />
              </span>
            </button>
            <figcaption>
              <span class="pname">{c.name}</span>
            </figcaption>
          </figure>
        {/each}
      </div>

      <div class="detail">
        <p class="chosen">{active.name}<span>{active.greek}</span></p>
        <p class="line">{active.line}</p>
        <p class="body">{active.body}</p>
        <ul class="essentials">
          {#each t.starry.essentials as e}
            <li>{e}</li>
          {/each}
        </ul>
        <div class="buy">
          <a class="secondary" href={seriesHref}>{t.starry.seriesCta}</a>
        </div>
      </div>
    </div>
  </div>
</section>

<style>
  .starry {
    --paper: #f1ece1;
    --dim: rgba(241, 236, 225, 0.74);
    --rule: rgba(241, 236, 225, 0.17);

    position: relative;
    isolation: isolate;
    overflow: hidden;
    color: var(--paper);
    font-family: var(--body);
    padding: clamp(3.75rem, 8vw, 6.5rem) 0;
    scroll-margin-top: 5rem;
  }

  .sky {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    z-index: -1;
    display: block;
    pointer-events: none;
  }

  .wrap {
    position: relative;
    z-index: 1;
  }

  .lede {
    display: grid;
    gap: 1rem 2.5rem;
  }
  .series {
    font-family: var(--display);
    font-style: italic;
    font-size: clamp(0.95rem, 1.4vw, 1.05rem);
    color: var(--gold);
    margin: 0 0 0.3rem;
    transition: color 700ms ease;
  }
  h2 {
    font-family: var(--display);
    font-weight: 300;
    font-size: clamp(2.6rem, 8vw, 5.2rem);
    line-height: 0.88;
    letter-spacing: -0.02em;
    margin: 0;
  }
  .intro {
    margin: 0;
    max-width: 38ch;
    font-weight: 300;
    font-size: clamp(0.95rem, 1.4vw, 1.1rem);
    line-height: 1.65;
    color: var(--dim);
  }

  .split {
    display: grid;
    gap: 1.75rem;
    margin-top: clamp(1.75rem, 4vw, 3.25rem);
    align-items: start;
    justify-items: center;
  }

  .gallery,
  .detail {
    min-width: 0;
  }

  .detail {
    width: 100%;
  }

  .gallery {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1.1rem;
    width: min(20.5rem, 100%);
  }
  .plate {
    margin: 0;
    min-width: 0;
  }
  .pick {
    display: block;
    width: 100%;
    padding: 0;
    background: #070b12;
    border: 1px solid rgba(241, 236, 225, 0.16);
    box-shadow:
      0 1px 0 rgba(255, 255, 255, 0.08),
      0 10px 22px rgba(0, 0, 0, 0.38);
    cursor: pointer;
    transition: border-color 500ms ease, box-shadow 500ms ease;
  }
  .media {
    display: block;
    line-height: 0;
  }
  .media img {
    display: block;
    width: 100%;
    height: auto;
    opacity: 0.62;
    transition: opacity 500ms ease;
  }
  .pick:hover .media img {
    opacity: 0.85;
  }
  .plate.on .pick {
    border-color: color-mix(in srgb, var(--gold) 55%, transparent);
    box-shadow:
      0 0 0 1px color-mix(in srgb, var(--gold) 35%, transparent),
      0 12px 26px rgba(0, 0, 0, 0.42);
  }
  .plate.on .pick img {
    opacity: 1;
  }
  figcaption {
    display: flex;
    align-items: baseline;
    margin-top: 0.45rem;
    padding-top: 0.35rem;
    border-top: 1px solid var(--rule);
    box-shadow: inset 2px 0 0 transparent;
    transition: box-shadow 500ms ease, padding-left 500ms ease;
  }
  .plate.on figcaption {
    box-shadow: inset 2px 0 0 var(--gold);
    padding-left: 0.5rem;
  }
  .pname {
    font-family: var(--display);
    font-size: 1.15rem;
    color: var(--dim);
    transition: color 500ms ease;
  }
  .plate.on .pname {
    color: var(--paper);
  }

  .chosen {
    font-family: var(--display);
    font-weight: 300;
    font-size: clamp(1.85rem, 4vw, 2.85rem);
    line-height: 1;
    margin: 0 0 0.75rem;
    display: flex;
    align-items: baseline;
    gap: 0.65rem;
    flex-wrap: wrap;
  }
  .chosen span {
    font-family: var(--body);
    font-size: 0.78rem;
    color: var(--dim);
  }
  .line {
    font-family: var(--display);
    font-style: italic;
    font-size: clamp(1.15rem, 2vw, 1.5rem);
    line-height: 1.35;
    margin: 0 0 1.1rem;
    max-width: 32ch;
  }
  .body {
    margin: 0 0 1.5rem;
    max-width: 46ch;
    font-weight: 300;
    font-size: clamp(0.92rem, 1.2vw, 1rem);
    line-height: 1.7;
    color: var(--dim);
  }
  .essentials {
    list-style: none;
    margin: 0 0 1.5rem;
    padding: 0;
    max-width: 36ch;
  }
  .essentials li {
    font-family: var(--display);
    font-size: clamp(1.05rem, 1.6vw, 1.2rem);
    border-top: 1px solid var(--rule);
    padding: 0.55rem 0;
  }
  .essentials li:last-child {
    border-bottom: 1px solid var(--rule);
  }
  .buy {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 1.25rem;
  }
  .secondary {
    color: var(--dim);
    font-size: 0.9rem;
    text-decoration: none;
    border-bottom: 1px solid var(--rule);
    padding-bottom: 2px;
    transition: color 300ms ease, border-color 300ms ease;
  }
  .secondary:hover {
    color: var(--paper);
    border-color: var(--gold);
  }

  .starry :focus-visible {
    outline: 2px solid var(--gold, #e3b75e);
    outline-offset: 4px;
  }

  /* Tablet+: booklets on the left, copy on the right */
  @media (min-width: 720px) {
    .split {
      grid-template-columns: auto minmax(0, 1fr);
      justify-items: stretch;
      gap: clamp(1.75rem, 4vw, 3.25rem);
    }
    .gallery {
      width: 24rem;
    }
    .detail {
      max-width: 38rem;
    }
    .line,
    .body,
    .essentials {
      max-width: none;
    }
  }

  @media (min-width: 960px) {
    .lede {
      grid-template-columns: minmax(0, 1fr) minmax(0, 34ch);
      align-items: end;
      gap: 1.25rem clamp(1.75rem, 4vw, 3.5rem);
    }
    .gallery {
      width: 26.5rem;
    }
    .detail {
      position: sticky;
      top: 5.5rem;
    }
  }

  @media (min-width: 1280px) {
    .split {
      gap: 4rem;
    }
    .gallery {
      width: 28.5rem;
    }
  }

  @media (max-height: 800px) and (min-width: 720px) {
    .starry {
      padding-block: 3.25rem;
    }
    .split {
      margin-top: 1.5rem;
    }
    h2 {
      font-size: clamp(2.4rem, 5.5vw, 4rem);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .starry * {
      transition-duration: 1ms !important;
      animation-duration: 1ms !important;
    }
  }
</style>
