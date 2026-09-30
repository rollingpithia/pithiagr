<script>
  import { base } from '$app/paths';
  import { afterNavigate } from '$app/navigation';
  import { browser } from '$app/environment';
  import { asset } from '$lib/asset.js';
  import { LOCALES } from '$lib/i18n/index.js';

  /** @type {{ lang: string, setLang: (code: string) => void, t: import('$lib/i18n/index.js').Messages, scrolled: boolean, page?: 'home' | 'catalogue' | 'story' | 'find-us' | 'contact' }} */
  let { lang, setLang, t, scrolled, page = 'home' } = $props();

  const home = $derived(base || '/');

  const items = $derived([
    { id: 'home', label: t.nav.home, href: home },
    { id: 'catalogue', label: t.nav.catalogue, href: `${base}/catalogue` },
    { id: 'story', label: t.nav.story, href: `${base}/story` },
    { id: 'find-us', label: t.nav.findUs, href: `${base}/find-us` },
    { id: 'contact', label: t.nav.contact, href: `${base}/contact` },
  ]);

  let open = $state(false);
  /** @type {HTMLButtonElement | undefined} */
  let menuButton = $state();
  /** @type {HTMLElement | undefined} */
  let panel = $state();

  const solid = $derived(
    scrolled || open || page === 'catalogue' || page === 'story' || page === 'find-us' || page === 'contact',
  );

  afterNavigate(() => {
    open = false;
  });

  $effect(() => {
    if (!browser) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = open ? 'hidden' : previous;
    if (open) panel?.querySelector('a')?.focus({ preventScroll: true });
    return () => {
      document.body.style.overflow = previous;
    };
  });

  $effect(() => {
    if (!browser) return;
    const wide = window.matchMedia('(min-width: 981px)');
    const closeIfWide = () => {
      if (wide.matches) open = false;
    };
    wide.addEventListener('change', closeIfWide);
    return () => wide.removeEventListener('change', closeIfWide);
  });

  function onKeydown(event) {
    if (event.key === 'Escape' && open) {
      open = false;
      menuButton?.focus();
    }
  }
</script>

<svelte:window onkeydown={onKeydown} />

<header class="hdr" class:scrolled={solid} class:menu-open={open}>
  <div class="container hdr-inner">
    <a href={home} aria-label={t.brand.name} class="hdr-logo">
      <img src={asset('/assets/pithia-logo.png')} alt={t.brand.name} />
    </a>

    <div class="hdr-end">
      <nav class="hdr-nav" aria-label={t.footer.navigate}>
        {#each items as it (it.id)}
          <a href={it.href} class:active={page === it.id}>{it.label}</a>
        {/each}
      </nav>

      <div class="hdr-lang">
        {#each LOCALES as locale (locale.code)}
          <button
            type="button"
            class:active={lang === locale.code}
            onclick={() => setLang(locale.code)}
            aria-label={locale.label}
          >
            {locale.label}
          </button>
        {/each}
      </div>

      <button
        type="button"
        class="hdr-menu"
        bind:this={menuButton}
        aria-expanded={open}
        aria-controls="site-menu"
        onclick={() => (open = !open)}
      >
        <span class="hdr-menu-mark" aria-hidden="true"></span>
        <span class="sr">{open ? t.nav.close : t.nav.menu}</span>
      </button>
    </div>
  </div>

  <nav
    id="site-menu"
    class="hdr-panel"
    class:open
    bind:this={panel}
    aria-label={t.footer.navigate}
    inert={!open}
  >
    <div class="container hdr-panel-inner">
      {#each items as it, i (it.id)}
        <a href={it.href} class:active={page === it.id} onclick={() => (open = false)}>
          <span class="hdr-panel-idx">{String(i + 1).padStart(2, '0')}</span>
          <span class="hdr-panel-label">{it.label}</span>
        </a>
      {/each}
    </div>
  </nav>
</header>

<style>
  .hdr {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 50;
    padding: 22px 0;
    background: transparent;
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
    border-bottom: 1px solid transparent;
    transition: all 0.35s ease;
  }

  .hdr.scrolled {
    padding: 14px 0;
    background: oklch(0.97 0.012 85 / 0.78);
    backdrop-filter: blur(14px) saturate(140%);
    -webkit-backdrop-filter: blur(14px) saturate(140%);
    border-bottom: 1px solid var(--hairline);
  }

  .hdr-inner {
    position: relative;
    z-index: 2;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 24px;
  }

  .hdr-end {
    display: flex;
    align-items: center;
    gap: 22px;
  }

  .hdr-logo {
    display: flex;
    align-items: center;
    color: var(--ink);
    text-decoration: none;
  }

  .hdr-logo img {
    height: 36px;
    width: auto;
    object-fit: contain;
    transition: height 0.35s ease;
  }

  .hdr.scrolled .hdr-logo img {
    height: 30px;
  }

  .hdr-nav {
    display: flex;
    gap: 28px;
    align-items: center;
  }

  .hdr-nav a {
    color: var(--ink-soft);
    text-decoration: none;
    font-size: 13px;
    letter-spacing: 0.08em;
    transition: color 0.2s ease;
  }

  .hdr-nav a:hover,
  .hdr-nav a.active {
    color: var(--ink);
  }

  .hdr-nav a.active {
    position: relative;
  }

  .hdr-nav a.active::after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    bottom: -6px;
    height: 1px;
    background: var(--accent);
  }

  .hdr-lang {
    display: flex;
    border: 1px solid var(--stroke-strong);
    border-radius: 999px;
    padding: 3px;
    gap: 2px;
  }

  .hdr-lang button {
    appearance: none;
    border: 0;
    padding: 5px 10px;
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    border-radius: 999px;
    cursor: pointer;
    background: transparent;
    color: var(--ink-mute);
    transition: all 0.2s ease;
  }

  .hdr-lang button.active {
    background: var(--ink);
    color: var(--bg);
  }

  .hdr-menu {
    display: none;
    width: 40px;
    height: 40px;
    padding: 0;
    place-items: center;
    flex-shrink: 0;
    border-radius: 999px;
    border: 1px solid var(--stroke-strong);
    background: transparent;
    color: var(--ink);
  }

  .hdr-menu-mark,
  .hdr-menu-mark::before,
  .hdr-menu-mark::after {
    display: block;
    width: 16px;
    height: 1px;
    background: currentColor;
    position: relative;
    transition: transform 0.25s ease, top 0.25s ease, background 0.2s ease;
  }

  .hdr-menu-mark::before,
  .hdr-menu-mark::after {
    content: '';
    position: absolute;
    left: 0;
  }

  .hdr-menu-mark::before { top: -5px; }
  .hdr-menu-mark::after { top: 5px; }

  .hdr-menu[aria-expanded='true'] .hdr-menu-mark {
    background: transparent;
  }

  .hdr-menu[aria-expanded='true'] .hdr-menu-mark::before {
    top: 0;
    transform: rotate(40deg);
  }

  .hdr-menu[aria-expanded='true'] .hdr-menu-mark::after {
    top: 0;
    transform: rotate(-40deg);
  }

  .hdr-panel {
    display: none;
  }

  @media (max-width: 980px) {
    .hdr-nav { display: none; }
    .hdr-menu { display: grid; }
    .hdr-end { gap: 10px; }

    .hdr.menu-open {
      background: var(--bg);
      border-bottom-color: var(--hairline);
      /* Blur on the bar would trap this panel inside the header. */
      backdrop-filter: none;
      -webkit-backdrop-filter: none;
    }

    .hdr-panel {
      display: flex;
      position: fixed;
      inset: 0;
      z-index: 1;
      padding: 108px 0 40px;
      overflow: auto;
      background:
        radial-gradient(closest-side at 85% 12%, oklch(0.99 0.08 80 / 0.55), transparent 72%),
        var(--bg);
      opacity: 0;
      visibility: hidden;
      pointer-events: none;
      transform: translateY(-6px);
      transition: opacity 0.3s ease, transform 0.35s cubic-bezier(.2, .7, .2, 1), visibility 0.3s;
    }

    .hdr-panel.open {
      opacity: 1;
      visibility: visible;
      pointer-events: auto;
      transform: none;
    }

    .hdr-panel-inner {
      display: flex;
      flex-direction: column;
      width: min(1320px, 100% - 48px);
    }

    .hdr-panel a {
      display: grid;
      grid-template-columns: 2.4rem 1fr;
      align-items: baseline;
      gap: 12px;
      padding: 16px 0;
      border-bottom: 1px solid var(--hairline);
      color: var(--ink);
      text-decoration: none;
    }

    .hdr-panel a:first-child {
      border-top: 1px solid var(--hairline);
    }

    .hdr-panel-idx {
      font-family: var(--mono);
      font-size: 11px;
      letter-spacing: 0.12em;
      color: var(--ink-faint);
    }

    .hdr-panel a.active .hdr-panel-idx,
    .hdr-panel a:hover .hdr-panel-idx {
      color: var(--accent);
    }

    .hdr-panel-label {
      font-family: var(--display);
      font-style: italic;
      font-weight: 500;
      font-size: clamp(32px, 9vw, 46px);
      line-height: 1;
      letter-spacing: -0.01em;
    }

    .hdr-panel a.active .hdr-panel-label {
      color: var(--ink);
    }
  }

  @media (max-width: 640px) {
    .hdr-panel-inner { width: calc(100% - 32px); }
    .hdr-lang button { padding: 5px 8px; }
  }

  @media (prefers-reduced-motion: reduce) {
    .hdr-panel,
    .hdr-menu-mark,
    .hdr-menu-mark::before,
    .hdr-menu-mark::after {
      transition: none;
    }
  }
</style>
