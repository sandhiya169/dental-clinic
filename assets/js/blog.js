/* ==========================================================================
   Stackly DENTAL STUDIO — Journal (blog) page script
   Self-contained: preloader, nav, cursor dot, AOS init, GSAP/ScrollTrigger
   animations, article filtering, popular-rail drag scroll, forms.
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
  }

  /* ---------------- Preloader ---------------- */
  const preloader = document.getElementById("preloader");
  window.addEventListener("load", () => {
    setTimeout(() => {
      preloader.classList.add("is-hidden");
      document.body.style.overflow = "";
      initPageAnimations();
    }, 900);
  });
  setTimeout(() => {
    if (!preloader.classList.contains("is-hidden")) {
      preloader.classList.add("is-hidden");
      initPageAnimations();
    }
  }, 2600);
  document.body.style.overflow = "hidden";

  /* ---------------- AOS ---------------- */
  if (window.AOS) {
    AOS.init({ duration: 700, once: true, offset: 60, easing: "ease-out-cubic" });
  }

  /* ---------------- Custom cursor dot ---------------- */
  const cursorDot = document.querySelector(".cursor-dot");
  if (cursorDot && matchMedia("(hover:hover)").matches) {
    window.addEventListener("mousemove", (e) => {
      cursorDot.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%,-50%)`;
      cursorDot.classList.add("is-active");
    });
    document.querySelectorAll("a, button, .article-card, .popular-card, .pill").forEach((el) => {
      el.addEventListener("mouseenter", () => cursorDot.classList.add("is-big"));
      el.addEventListener("mouseleave", () => cursorDot.classList.remove("is-big"));
    });
  }

  /* ---------------- Nav: scroll state + mobile menu ---------------- */
  const nav = document.getElementById("siteNav");
  const burger = document.getElementById("navBurger");
  const navMobile = document.getElementById("navMobile");

  window.addEventListener("scroll", () => {
    nav.classList.toggle("is-scrolled", window.scrollY > 40);
  }, { passive: true });

  burger?.addEventListener("click", () => {
    const expanded = burger.getAttribute("aria-expanded") === "true";
    burger.setAttribute("aria-expanded", String(!expanded));
    navMobile.classList.toggle("is-open");
    nav.classList.toggle("menu-is-open");
    document.body.classList.toggle("no-scroll");
  });

  document.querySelectorAll('[data-nav]').forEach((link) => {
    link.addEventListener("click", () => {
      navMobile?.classList.remove("is-open");
      nav.classList.remove("menu-is-open");
      document.body.classList.remove("no-scroll");
      burger?.setAttribute("aria-expanded", "false");
    });
  });

  document.getElementById("year").textContent = new Date().getFullYear();

  /* --- Page-based active nav link --- */
  const currentPage = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll('[data-nav]').forEach((link) => {
    const linkPage = link.getAttribute("href").split("/").pop().split("#")[0] || "index.html";
    if (linkPage === currentPage) link.classList.add("is-active");
  });

  /* ---------------- Fallback reveal (in case GSAP fails to load) -------- */
  const revealEls = document.querySelectorAll("[data-reveal], [data-reveal-line]");
  if (!window.gsap) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    revealEls.forEach((el) => io.observe(el));
  }

  initInteractions();
});

/* ==========================================================================
   GSAP-driven animations (called once preloader hides)
   ========================================================================== */
let animationsInitialized = false;
function initPageAnimations() {
  if (animationsInitialized) return;
  animationsInitialized = true;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!window.gsap) return;

  /* ---------------- Blog hero entrance ---------------- */
  const heroTl = gsap.timeline({ defaults: { ease: "power3.out" } });
  heroTl
    .from(".blog-hero__eyebrow", { y: 16, opacity: 0, duration: .6 }, 0)
    .from(".blog-hero__title .line", { yPercent: 110, opacity: 0, duration: .9, stagger: .12 }, 0.1)
    .from(".blog-hero__sub", { y: 20, opacity: 0, duration: .7 }, 0.5)
    .from(".blog-hero__search", { y: 20, opacity: 0, duration: .7 }, 0.62)
    .from(".pill", { y: 16, opacity: 0, duration: .5, stagger: .06 }, 0.75);

  if (!reduceMotion) {
    gsap.to("#blogHeroArcPath", { strokeDashoffset: 0, duration: 2, ease: "power2.inOut", delay: .8 });
    gsap.to("#searchArcPath", { strokeDashoffset: 0, duration: 1.6, ease: "power2.inOut", delay: 1 });
  }

  /* ---------------- Generic [data-reveal] scroll reveals ---------------- */
  gsap.utils.toArray("[data-reveal]").forEach((el) => {
    gsap.fromTo(el,
      { y: 30, opacity: 0 },
      {
        y: 0, opacity: 1, duration: .8, ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 88%" }
      }
    );
  });

  /* ---------------- Featured post: image reveal + copy stagger --------- */
  gsap.fromTo(".featured__media",
    { scale: 1.1, opacity: 0 },
    {
      scale: 1, opacity: 1, duration: 1.1, ease: "power2.out",
      scrollTrigger: { trigger: ".featured", start: "top 75%" }
    }
  );

  /* ---------------- Counters ---------------- */
  document.querySelectorAll("[data-counter]").forEach((el) => {
    const target = parseFloat(el.dataset.counter);
    const suffix = el.dataset.suffix || "";
    const counterObj = { val: 0 };
    ScrollTrigger.create({
      trigger: el,
      start: "top 90%",
      once: true,
      onEnter: () => {
        gsap.to(counterObj, {
          val: target, duration: 1.8, ease: "power2.out",
          onUpdate: () => { el.textContent = Math.round(counterObj.val).toLocaleString() + suffix; }
        });
      }
    });
  });

  gsap.utils.toArray(".topics__item").forEach((el) => {
    gsap.from(el, {
      opacity: 0, y: 24, duration: .7,
      scrollTrigger: { trigger: ".topics__grid", start: "top 85%" }
    });
  });

  /* ---------------- Article filter chips ---------------- */
  gsap.from(".filter-chip", {
    y: 14, opacity: 0, duration: .5, stagger: .05,
    scrollTrigger: { trigger: ".articles__filters", start: "top 90%" }
  });

  /* ---------------- Article cards stagger ---------------- */
  gsap.utils.toArray(".article-card").forEach((card, i) => {
    gsap.from(card, {
      y: 46, opacity: 0, duration: .8, ease: "power3.out",
      delay: (i % 3) * 0.08,
      scrollTrigger: { trigger: card, start: "top 90%" }
    });
  });

  /* ---------------- Popular rail cards + parallax image ---------------- */
  gsap.utils.toArray(".popular-card").forEach((card, i) => {
    gsap.from(card, {
      x: 40, opacity: 0, duration: .7, delay: i * 0.07,
      scrollTrigger: { trigger: card, start: "top 92%" }
    });
    const img = card.querySelector(".popular-card__photo img");
    if (img && !reduceMotion) {
      gsap.fromTo(img, { yPercent: -8 }, {
        yPercent: 8, ease: "none",
        scrollTrigger: { trigger: card, start: "top bottom", end: "bottom top", scrub: true }
      });
    }
  });

  ScrollTrigger.refresh();
}

/* ==========================================================================
   Non-GSAP interactions: search, pill jump-links, article filtering,
  popular rail, booking form
   ========================================================================== */
function initInteractions() {


  /* ---------------- Hero topic pills jump + pre-filter ---------------- */
  document.querySelectorAll("[data-jump]").forEach((pill) => {
    pill.addEventListener("click", () => {
      const category = pill.dataset.jump;
      applyFilter(category);
      document.getElementById("articles").scrollIntoView({ behavior: "smooth" });
    });
  });

  /* ---------------- Article filter chips ---------------- */
  const filterChips = document.querySelectorAll(".filter-chip");
  filterChips.forEach((chip) => {
    chip.addEventListener("click", () => applyFilter(chip.dataset.filter));
  });

  function applyFilter(category) {
    filterChips.forEach((c) => c.classList.toggle("is-active", c.dataset.filter === category));
    const cards = document.querySelectorAll(".article-card");

    if (window.gsap) {
      gsap.to(cards, {
        opacity: 0, y: 10, duration: .25, ease: "power1.in",
        onComplete: () => {
          cards.forEach((card) => {
            const match = category === "all" || card.dataset.category === category;
            card.classList.toggle("is-hidden", !match);
          });
          const visible = document.querySelectorAll(".article-card:not(.is-hidden)");
          gsap.fromTo(visible, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: .4, stagger: .05, ease: "power2.out" });
          toggleEmptyState();
          if (window.ScrollTrigger) ScrollTrigger.refresh();
        }
      });
    } else {
      cards.forEach((card) => {
        const match = category === "all" || card.dataset.category === category;
        card.classList.toggle("is-hidden", !match);
      });
      toggleEmptyState();
      if (window.ScrollTrigger) ScrollTrigger.refresh();
    }
  }

  function toggleEmptyState() {
    const empty = document.getElementById("articlesEmpty");
    if (!empty) return;
    const visibleCount = document.querySelectorAll(".article-card:not(.is-hidden)").length;
    empty.hidden = visibleCount !== 0;
  }

  /* ---------------- Popular rail: marquee ---------------- */
  const popularRail = document.getElementById("popularRail");
  if (popularRail) {
    let isPaused = false;

    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const originalCards = [...popularRail.children];
      const marqueeTrack = document.createElement("div");
      marqueeTrack.className = "popular__track";
      originalCards.forEach((card) => marqueeTrack.appendChild(card));
      originalCards.forEach((card) => marqueeTrack.appendChild(card.cloneNode(true)));
      popularRail.appendChild(marqueeTrack);
      popularRail.classList.add("is-marquee");
      popularRail.addEventListener("mouseenter", () => isPaused = true);
      popularRail.addEventListener("mouseleave", () => isPaused = false);
      popularRail.addEventListener("touchstart", () => isPaused = true, { passive: true });
      popularRail.addEventListener("touchend", () => isPaused = false, { passive: true });
      marqueeTrack.addEventListener("animationstart", () => marqueeTrack.style.animationPlayState = "running");
      popularRail.addEventListener("mouseenter", () => marqueeTrack.style.animationPlayState = "paused");
      popularRail.addEventListener("mouseleave", () => marqueeTrack.style.animationPlayState = "running");
      popularRail.addEventListener("touchstart", () => marqueeTrack.style.animationPlayState = "paused", { passive: true });
      popularRail.addEventListener("touchend", () => marqueeTrack.style.animationPlayState = "running", { passive: true });
    }
  }

}