<script>
  import { base } from '$app/paths';
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
</script>

<header class="hdr" class:scrolled={scrolled || page === 'catalogue' || page === 'story' || page === 'find-us' || page === 'contact'}>
  <div class="container hdr-inner">
    <a href={home} aria-label={t.brand.name} class="hdr-logo">
      <img src={asset('/assets/pithia-logo.png')} alt={t.brand.name} />
    </a>

    <nav class="hdr-nav">
      {#each items as it (it.id)}
        <a
          href={it.href}
          class:active={page === it.id}
        >{it.label}</a>
      {/each}
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
    </nav>
  </div>
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
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 24px;
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

  @media (max-width: 720px) {
    .hdr-nav a {
      display: none;
    }
  }
</style>
