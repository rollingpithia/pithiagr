<script>
  import { base } from '$app/paths';
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import {
    DEFAULT_LOCALE,
    LOCALE_STORAGE_KEY,
    getMessages,
    resolveLocale,
  } from '$lib/i18n/index.js';
  import { ACCENT_MAP, DISPLAY_MAP } from '$lib/theme.js';
  import Header from '$lib/components/Header.svelte';
  import Hero from '$lib/components/Hero.svelte';
  import Philosophy from '$lib/components/Philosophy.svelte';
  import Physis from '$lib/components/Physis.svelte';
  import StarrySeries from '$lib/components/StarrySeries.svelte';
  import Filtrakia from '$lib/components/Filtrakia.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import AgeGate from '$lib/components/AgeGate.svelte';
  import ThreeHero from '$lib/components/ThreeHero.svelte';

  const AGE_GATE_ENABLED = true;
  const accent = 'terracotta';
  const displayFont = 'cormorant';

  let lang = $state(DEFAULT_LOCALE);
  let entered = $state(false);
  let scrolled = $state(false);

  const t = $derived(getMessages(lang));

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
      scrolled = window.scrollY > 80;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    return () => window.removeEventListener('scroll', onScroll);
  });

  $effect(() => {
    if (!browser) return;
    if (!entered) {
      document.body.classList.remove('pithia-ready');
      return;
    }
    document.body.classList.add('pithia-ready');
    const timer = setTimeout(() => {
      window.__pithiaThreeStarted = true;
      window.dispatchEvent(new Event('pithia:three-start'));
    }, 1500);
    return () => clearTimeout(timer);
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
  <title>{t.meta.title}</title>
  <meta name="description" content={t.meta.description} />
  <link rel="icon" type="image/png" href="{base}/assets/pithia-silhouette.png" />
</svelte:head>

<Header {lang} {setLang} {t} {scrolled} />
<ThreeHero />

<main style:filter={entered ? 'none' : 'blur(10px)'} style:transition="filter .6s ease">
  <Hero {t} />
  <Philosophy {t} />
  <Physis {t} />
  <StarrySeries {t} />
  <Filtrakia {t} />
  <Footer {t} />
</main>

{#if !entered}
  <AgeGate {t} onEnter={enter} onLeave={leave} />
{/if}
