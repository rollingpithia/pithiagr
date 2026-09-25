<script>
  import { base } from '$app/paths';
  import { onMount, setContext } from 'svelte';
  import { browser } from '$app/environment';
  import {
    DEFAULT_LOCALE,
    LOCALE_STORAGE_KEY,
    getMessages,
    resolveLocale,
  } from '$lib/i18n/index.js';
  import { ACCENT_MAP, DISPLAY_MAP } from '$lib/theme.js';
  import Header from '$lib/components/Header.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import AgeGate from '$lib/components/AgeGate.svelte';

  let { children } = $props();

  const AGE_GATE_ENABLED = true;
  const accent = 'terracotta';
  const displayFont = 'cormorant';

  let lang = $state(DEFAULT_LOCALE);
  let entered = $state(false);
  let scrolled = $state(true);

  const t = $derived(getMessages(lang));

  setContext('t', () => t);
  setContext('lang', () => lang);

  $effect(() => {
    if (!browser) return;
    document.documentElement.style.setProperty('--accent', ACCENT_MAP[accent]);
    document.documentElement.style.setProperty('--display', DISPLAY_MAP[displayFont]);
    document.documentElement.lang = lang;
  });

  onMount(() => {
    lang = resolveLocale(localStorage.getItem(LOCALE_STORAGE_KEY) ?? DEFAULT_LOCALE);

    if (!AGE_GATE_ENABLED) {
      entered = true;
    } else if (sessionStorage.getItem('pithia-entered') === '1') {
      entered = true;
    }

    const onScroll = () => {
      scrolled = window.scrollY > 24;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    return () => window.removeEventListener('scroll', onScroll);
  });

  $effect(() => {
    if (!browser || !entered) return;
    document.body.classList.add('pithia-ready');
  });

  function setLang(next) {
    lang = next;
    if (browser) localStorage.setItem(LOCALE_STORAGE_KEY, next);
  }

  function enter() {
    sessionStorage.setItem('pithia-entered', '1');
    entered = true;
  }

  function leave() {
    window.location.href = 'https://www.google.com/';
  }
</script>

<svelte:head>
  <link rel="icon" type="image/png" href="{base}/assets/pithia-silhouette.png" />
</svelte:head>

<Header {lang} {setLang} {t} {scrolled} page="catalogue" />

<main class="cat-page" style:filter={entered ? 'none' : 'blur(10px)'} style:transition="filter .6s ease">
  {@render children?.()}
  <Footer {t} />
</main>

{#if !entered}
  <AgeGate {t} onEnter={enter} onLeave={leave} />
{/if}

<style>
  .cat-page {
    padding-top: 88px;
    min-height: 100vh;
    background: var(--bg);
  }
</style>
