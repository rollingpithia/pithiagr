<script>
  import { onMount } from 'svelte';
  import { base } from '$app/paths';
  import { browser } from '$app/environment';
  import { getContext } from 'svelte';
  import { reveal } from '$lib/actions/reveal.js';
  import { FORM_SUBMIT_ACTION } from '$lib/contact.js';
  import OfficialLocations from '$lib/components/OfficialLocations.svelte';
  import Meander from '$lib/components/Meander.svelte';

  const getT = getContext('t');
  const t = $derived(getT());

  let sent = $state(false);

  /** @type {HTMLInputElement | undefined} */
  let nextInput = $state();

  onMount(() => {
    if (!browser) return;
    sent = new URL(window.location.href).searchParams.get('sent') === '1';
    if (nextInput) {
      nextInput.value = `${window.location.origin}${base}/contact?sent=1`;
    }
  });
</script>

<section class="contact-hero paper-grain" use:reveal>
  <div class="contact-hero-wash" aria-hidden="true"></div>
  <div class="container contact-hero-inner">
    <div class="contact-hero-eyebrow reveal">
      <span class="contact-hero-rule" aria-hidden="true"></span>
      <span class="eyebrow">{t.contact.eyebrow}</span>
    </div>
    <h1 class="display reveal reveal-d2 contact-hero-title">{t.contact.title}</h1>
    <p class="lead reveal reveal-d3 contact-hero-sub">{t.contact.subtitle}</p>
    <div class="reveal reveal-d4 contact-hero-meander" aria-hidden="true">
      <Meander />
    </div>
  </div>
</section>

<section class="contact-body" use:reveal>
  <div class="container contact-layout">
    <aside class="contact-aside reveal">
      <h2 class="display contact-section-title">{t.contact.detailsTitle}</h2>
      <p class="contact-aside-note">{t.contact.detailsNote}</p>

      <OfficialLocations labels={t.contact.locations} showEmail variant="card" includeIds={['house']} />
    </aside>

    <div class="contact-form-col reveal reveal-d2">
      <h2 class="display contact-section-title">{t.contact.formTitle}</h2>
      <p class="contact-form-note">{t.contact.formNote}</p>

      {#if sent}
        <p class="contact-success" role="status">{t.contact.success}</p>
      {:else}
      <form class="contact-form" action={FORM_SUBMIT_ACTION} method="POST">
        <input type="hidden" name="_subject" value={t.contact.formSubject} />
        <input type="hidden" name="_next" bind:this={nextInput} value="" />
        <input type="text" name="_gotcha" class="contact-honey" tabindex="-1" autocomplete="off" />

        <div class="contact-row">
          <label class="contact-field">
            <span>{t.contact.fields.name}</span>
            <input type="text" name="name" required autocomplete="name" placeholder={t.contact.placeholders.name} />
          </label>

          <label class="contact-field">
            <span>{t.contact.fields.email}</span>
            <input type="email" name="email" required autocomplete="email" placeholder={t.contact.placeholders.email} />
          </label>
        </div>

        <label class="contact-field">
          <span>{t.contact.fields.phone}</span>
          <input type="tel" name="phone" autocomplete="tel" placeholder={t.contact.placeholders.phone} />
        </label>

        <label class="contact-field">
          <span>{t.contact.fields.message}</span>
          <textarea
            name="message"
            rows="6"
            required
            placeholder={t.contact.placeholders.message}
          ></textarea>
        </label>

        <button type="submit" class="contact-submit">{t.contact.submit}</button>
      </form>
      {/if}
    </div>
  </div>
</section>

<style>
  .contact-hero {
    position: relative;
    padding: clamp(2.5rem, 6vw, 4.5rem) 0 clamp(2rem, 4vw, 3rem);
    overflow: hidden;
    border-bottom: 1px solid var(--hairline);
  }

  .contact-hero-wash {
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse 70% 55% at 50% 0%, oklch(0.65 0.14 45 / 0.08), transparent 70%);
    pointer-events: none;
  }

  .contact-hero-inner {
    position: relative;
    text-align: center;
    max-width: 40rem;
    margin-inline: auto;
  }

  .contact-hero-eyebrow {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    margin-bottom: 1rem;
  }

  .contact-hero-rule {
    width: 2.5rem;
    height: 1px;
    background: var(--accent);
    opacity: 0.5;
  }

  .contact-hero-title {
    font-size: clamp(2.4rem, 6vw, 4.2rem);
    font-style: italic;
    line-height: 0.98;
    margin: 0 0 0.85rem;
  }

  .contact-hero-sub {
    margin: 0 auto;
    max-width: 38ch;
    font-family: var(--body);
    font-style: normal;
    font-size: clamp(15px, 1.1vw, 17px);
    line-height: 1.65;
    color: var(--ink-soft);
  }

  .contact-hero-meander {
    margin: 1.5rem auto 0;
    width: fit-content;
  }

  .contact-body {
    padding: clamp(2.5rem, 6vw, 4.5rem) 0 clamp(3.5rem, 8vw, 6rem);
  }

  .contact-layout {
    display: grid;
    gap: clamp(2rem, 4vw, 3.5rem);
    align-items: start;
  }

  @media (min-width: 900px) {
    .contact-layout {
      grid-template-columns: minmax(16rem, 0.78fr) minmax(0, 1.22fr);
    }
  }

  .contact-section-title {
    font-size: clamp(1.7rem, 2.4vw, 2.15rem);
    font-style: italic;
    line-height: 1.1;
    margin: 0 0 0.55rem;
  }

  .contact-aside-note,
  .contact-form-note {
    margin: 0 0 1.35rem;
    max-width: 42ch;
    font-size: 15px;
    color: var(--ink-soft);
    line-height: 1.65;
  }

  .contact-form-col {
    padding: clamp(1.25rem, 2.5vw, 2rem);
    border: 1px solid var(--hairline);
    background: var(--bg);
  }

  .contact-success {
    margin: 0;
    padding: 1.1rem 1.15rem;
    border-left: 2px solid var(--gold);
    background: var(--bg-warm);
    color: var(--ink);
    font-size: 16px;
    line-height: 1.6;
  }

  .contact-form {
    display: grid;
    gap: 1rem;
  }

  .contact-row {
    display: grid;
    gap: 1rem;
  }

  @media (min-width: 640px) {
    .contact-row {
      grid-template-columns: 1fr 1fr;
    }
  }

  .contact-honey {
    position: absolute;
    left: -9999px;
    width: 1px;
    height: 1px;
    opacity: 0;
    pointer-events: none;
  }

  .contact-field {
    display: grid;
    gap: 0.4rem;
  }

  .contact-field span {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--ink-mute);
  }

  .contact-field input,
  .contact-field textarea {
    width: 100%;
    min-height: 48px;
    padding: 0.75rem 0.9rem;
    border: 1px solid var(--stroke-strong);
    border-radius: 0;
    background: var(--bg-warm);
    color: var(--ink);
    font: inherit;
    font-size: 16px;
    line-height: 1.45;
    resize: vertical;
  }

  .contact-field textarea {
    min-height: 9rem;
  }

  .contact-field input::placeholder,
  .contact-field textarea::placeholder {
    color: var(--ink-faint);
  }

  .contact-field input:focus,
  .contact-field textarea:focus {
    outline: 2px solid color-mix(in srgb, var(--accent) 55%, transparent);
    outline-offset: 1px;
    border-color: var(--ink);
  }

  .contact-submit {
    justify-self: stretch;
    margin-top: 0.35rem;
    min-height: 48px;
    padding: 0.85rem 1.4rem;
    border: 1px solid var(--ink);
    border-radius: 0;
    background: var(--ink);
    color: var(--bg);
    font: inherit;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    cursor: pointer;
    transition: background 0.2s ease, color 0.2s ease;
  }

  .contact-submit:hover {
    background: transparent;
    color: var(--ink);
  }

  @media (min-width: 640px) {
    .contact-submit {
      justify-self: start;
      min-width: 12rem;
    }
  }
</style>
