<!--
  /about — Michelle's bio plus the shared ContactBlock as a CTA.

  A restrained editorial section on the dark canvas. The bio paragraph and the
  ContactBlock are the content; contact details live only in ContactBlock.

  Renders a <section> inside the layout's <main> (not a nested main). The
  sr-only h1 carries the semantic landmark heading.
-->
<script lang="ts">
  import ContactBlock from '$lib/components/ContactBlock.svelte';
</script>

<svelte:head>
  <title>About — Michelle Ngo</title>
  <meta
    name="description"
    content="Michelle Ngo — filmmaker and producer based in New York City."
  />
</svelte:head>

<section class="bg-neutral-950 py-16 md:py-24">
  <div class="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
    <h1 class="sr-only">About Michelle Ngo</h1>

    <p class="font-sans text-base font-normal leading-relaxed text-neutral-50">
      I'm Michelle Ngo, a filmmaker and producer based in New York City. I make video that helps brands
      and broadcasters tell stories well — short documentaries, branded films, promos, and trailers. My
      credits include PBS American Portrait, HBO Max, HBO, ABC News, U2's Sphere residency, Amazon News,
      and Music Box Films. I love a tight schedule and a thoughtful script. I work hardest when the subject
      matter is human — real people telling true stories about how they live, what they make, and why
      it matters. If you have a project that needs a steady hand and a quick turn, get in touch.
    </p>

    <div class="mt-12">
      <ContactBlock />
    </div>
  </div>
</section>
