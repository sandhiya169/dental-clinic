/* ==========================================================================
   Stackly DENTAL STUDIO — services page script
   Handles: preloader, nav behavior, AOS init, cursor dot, GSAP hero reveal,
   category-filterable service grid, scroll-linked spotlight showcase,
   pricing/trust entrances, and an accessible FAQ accordion.
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
  // Safety fallback in case 'load' is delayed by remote fonts/images
  setTimeout(() => {
    if (!preloader.classList.contains("is-hidden")) {
      preloader.classList.add("is-hidden");
      document.body.style.overflow = "";
      initPageAnimations();
    }
  }, 2600);
  document.body.style.overflow = "hidden";

  /* ---------------- AOS ---------------- */
  if (window.AOS) {
    AOS.init({ duration: 700, once: true, offset: 60, easing: "ease-out-cubic" });
  }

  /* ---------------- Custom cursor dot (desktop hover affordance) -------- */
  const cursorDot = document.querySelector(".cursor-dot");
  if (cursorDot && matchMedia("(hover:hover)").matches) {
    window.addEventListener("mousemove", (e) => {
      cursorDot.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%,-50%)`;
      cursorDot.classList.add("is-active");
    });
    document.querySelectorAll(
      "a, button, .svc-card, .pricing__card, .trust__item"
    ).forEach((el) => {
      el.addEventListener("mouseenter", () => cursorDot.classList.add("is-big"));
      el.addEventListener("mouseleave", () => cursorDot.classList.remove("is-big"));
    });
  }

  /* ---------------- Nav: scroll state + mobile menu ---------------------- */
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

  document.querySelectorAll('.nav__mobile a, .nav__links a').forEach((link) => {
    link.addEventListener("click", () => {
      navMobile.classList.remove("is-open");
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
  if (!window.gsap) {
    document.documentElement.classList.add("no-gsap");
    document.querySelectorAll("[data-hero-el], [data-hero-line]").forEach((el) => {
      el.classList.add("is-visible");
    });
    document.querySelectorAll("[data-spotlight-img]").forEach((img, i) => {
      img.classList.toggle("is-active", i === 0);
    });
  }

  initInteractions();
});

/* ==========================================================================
   GSAP-driven animations (called once preloader hides)
   ========================================================================== */
let animationsInitialized = false;
function initPageAnimations() {
  // Guard against the 'load' handler and the safety-timeout both firing.
  if (animationsInitialized) return;
  animationsInitialized = true;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!window.gsap) return;

  /* ---------------- Hero entrance ---------------- */
  const heroTl = gsap.timeline({ defaults: { ease: "power3.out" } });
  heroTl
    .from(".svc-hero .eyebrow", { y: 16, opacity: 0, duration: .6 }, 0)
    .from("[data-hero-line]", { yPercent: 110, opacity: 0, duration: .9, stagger: .12 }, 0.1)
    .from(".svc-hero__lead", { y: 20, opacity: 0, duration: .7 }, 0.5)
    .from(".svc-hero__ctas", { y: 20, opacity: 0, duration: .7 }, 0.62)
    .from(".svc-hero__stats", { y: 20, opacity: 0, duration: .7 }, 0.72)
    .from(".svc-hero__visual", { scale: 1.08, opacity: 0, duration: 1.1, ease: "power2.out" }, 0.2)
    .from(".svc-hero__price-badge", { y: 20, opacity: 0, duration: .6 }, 0.9);

  /* ---------------- Hero stat counters ---------------- */
  document.querySelectorAll(".inner-hero__stat strong[data-counter]").forEach((el) => {
    const target = parseFloat(el.dataset.counter);
    const suffix = el.dataset.suffix || "";
    const counterObj = { val: 0 };
    ScrollTrigger.create({
      trigger: el,
      start: "top 95%",
      once: true,
      onEnter: () => {
        gsap.to(counterObj, {
          val: target, duration: 1.4, ease: "power2.out",
          onUpdate: () => { el.textContent = Math.round(counterObj.val).toLocaleString() + suffix; }
        });
      }
    });
  });

  /* ---------------- Service cards stagger ---------------- */
  gsap.utils.toArray(".svc-card").forEach((card, i) => {
    gsap.from(card, {
      y: 40, opacity: 0, duration: .7, ease: "power3.out",
      delay: (i % 3) * 0.07,
      scrollTrigger: { trigger: card, start: "top 92%" }
    });
  });

  /* ---------------- Spotlight scroll-linked showcase --------------------- */
  const spotlightSteps = gsap.utils.toArray("[data-spotlight-step]");
  const spotlightImgs = gsap.utils.toArray("[data-spotlight-img]");

  const setActiveSpotlight = (index) => {
    spotlightSteps.forEach((step, i) => step.classList.toggle("is-active", i === index));
    spotlightImgs.forEach((img, i) => img.classList.toggle("is-active", i === index));
  };

  if (spotlightSteps.length) {
    const spotlightObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSpotlight(spotlightSteps.indexOf(entry.target));
        }
      });
    }, {
      rootMargin: "-30% 0px -30% 0px",
      threshold: 0
    });

    spotlightSteps.forEach((step) => spotlightObserver.observe(step));
  }

  // Note: pricing cards and trust items are revealed by AOS (data-aos on
  // each element in the HTML) — they intentionally have no separate GSAP
  // opacity tween here. Layering a GSAP .from({opacity:0}) on top of an
  // AOS-controlled element sets an inline opacity style that permanently
  // overrides AOS's own class-based reveal, leaving the element invisible
  // even after AOS adds "aos-animate". Pick one reveal mechanism per element.

  /* ---------------- Closing CTA arc draw ---------------------------------- */
  const ctaArc = document.querySelector(".svc-cta__arc path");
  if (ctaArc && !reduceMotion) {
    const len = ctaArc.getTotalLength();
    gsap.set(ctaArc, { strokeDasharray: len, strokeDashoffset: len });
    gsap.to(ctaArc, {
      strokeDashoffset: 0, duration: 1.6, ease: "power2.inOut",
      scrollTrigger: { trigger: ".svc-cta", start: "top 80%" }
    });
  }

  ScrollTrigger.refresh();
}

/* ==========================================================================
   Non-GSAP interactions: service filter tabs, FAQ accordion
   ========================================================================== */
function initInteractions() {

  /* ---------------- Service category filter ---------------- */
  const tabs = document.querySelectorAll(".svc-tab");
  const cards = document.querySelectorAll(".svc-card");
  const emptyMsg = document.getElementById("svcEmpty");

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => {
        t.classList.remove("is-active");
        t.setAttribute("aria-selected", "false");
      });
      tab.classList.add("is-active");
      tab.setAttribute("aria-selected", "true");

      const filter = tab.dataset.filter;
      let visibleCount = 0;

      cards.forEach((card) => {
        const match = filter === "all" || card.dataset.category === filter;
        card.classList.toggle("is-hidden", !match);
        if (match) visibleCount++;
      });

      if (emptyMsg) emptyMsg.hidden = visibleCount !== 0;

      if (window.ScrollTrigger) ScrollTrigger.refresh();
      if (window.AOS) AOS.refresh();

      // Re-run entrance animation for newly visible cards
      if (window.gsap) {
        const visibleCards = Array.from(cards).filter((c) => !c.classList.contains("is-hidden"));
        gsap.fromTo(visibleCards,
          { opacity: 0, y: 18 },
          { opacity: 1, y: 0, duration: .5, ease: "power2.out", stagger: .05 }
        );
      }
    });
  });

  /* ---------------- FAQ accordion ---------------- */
  const faqItems = document.querySelectorAll(".svc-faq__item");
  faqItems.forEach((item) => {
    const btn = item.querySelector(".svc-faq__q");
    const panel = item.querySelector(".svc-faq__a");

    const openPanel = () => {
      item.classList.add("is-open");
      btn.setAttribute("aria-expanded", "true");
      if (window.gsap) {
        gsap.to(panel, { height: "auto", duration: .4, ease: "power2.out" });
      } else {
        panel.style.height = "auto";
      }
    };

    const closePanel = () => {
      item.classList.remove("is-open");
      btn.setAttribute("aria-expanded", "false");
      if (window.gsap) {
        gsap.to(panel, { height: 0, duration: .35, ease: "power2.inOut" });
      } else {
        panel.style.height = "0px";
      }
    };

    // Initialize state
    if (item.classList.contains("is-open")) {
      panel.style.height = "auto";
    } else {
      panel.style.height = "0px";
    }

    btn.addEventListener("click", () => {
      const isOpen = item.classList.contains("is-open");
      // Close any other open item (single-open accordion)
      faqItems.forEach((other) => {
        if (other !== item && other.classList.contains("is-open")) {
          const otherPanel = other.querySelector(".svc-faq__a");
          other.classList.remove("is-open");
          other.querySelector(".svc-faq__q").setAttribute("aria-expanded", "false");
          if (window.gsap) {
            gsap.to(otherPanel, { height: 0, duration: .35, ease: "power2.inOut" });
          } else {
            otherPanel.style.height = "0px";
          }
        }
      });

      isOpen ? closePanel() : openPanel();
    });
  });
}