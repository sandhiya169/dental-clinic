/* ==========================================================================
   Stackly DENTAL STUDIO — main script
   Handles: preloader, nav behavior, AOS init, GSAP/ScrollTrigger animations,
   counters, marquee, pinned process rail, team drag-scroll, testimonial
   carousel, gallery hover, booking form.
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
  // Safety fallback in case 'load' is delayed by remote fonts
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

  /* ---------------- Custom cursor dot (desktop hover affordance) -------- */
  const cursorDot = document.querySelector(".cursor-dot");
  if (cursorDot && matchMedia("(hover:hover)").matches) {
    window.addEventListener("mousemove", (e) => {
      cursorDot.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%,-50%)`;
      cursorDot.classList.add("is-active");
    });
    document.querySelectorAll("a, button, .service-card, .studio__slide").forEach((el) => {
      el.addEventListener("mouseenter", () => cursorDot.classList.add("is-big"));
      el.addEventListener("mouseleave", () => cursorDot.classList.remove("is-big"));
    });
  }

  /* ---------------- Nav: scroll state + active link + mobile menu ------- */
  const nav = document.getElementById("siteNav");
  const burger = document.getElementById("navBurger");
  const navMobile = document.getElementById("navMobile");

  window.addEventListener("scroll", () => {
    nav.classList.toggle("is-scrolled", window.scrollY > 40);
  }, { passive: true });

  burger.addEventListener("click", () => {
    const expanded = burger.getAttribute("aria-expanded") === "true";
    burger.setAttribute("aria-expanded", String(!expanded));
    navMobile.classList.toggle("is-open");
    nav.classList.toggle("menu-is-open");
    document.body.classList.toggle("no-scroll");
  });

  document.querySelectorAll('[data-nav]').forEach((link) => {
    link.addEventListener("click", () => {
      navMobile.classList.remove("is-open");
      nav.classList.remove("menu-is-open");
      document.body.classList.remove("no-scroll");
      burger.setAttribute("aria-expanded", "false");
    });
  });

  const sections = document.querySelectorAll("main section[id]");
  const navAnchors = document.querySelectorAll('[data-nav]');
  const spy = () => {
    let current = "";
    sections.forEach((sec) => {
      const rect = sec.getBoundingClientRect();
      if (rect.top <= 140 && rect.bottom >= 140) current = sec.id;
    });
    navAnchors.forEach((a) => {
      const href = a.getAttribute("href");
      if (href.startsWith("#")) {
        a.classList.toggle("is-active", href === `#${current}`);
      }
    });
  };
  window.addEventListener("scroll", spy, { passive: true });

  /* --- Page-based active nav link (multi-page sites) --- */
  const currentPage = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll('[data-nav]').forEach((link) => {
    const linkPage = link.getAttribute("href").split("/").pop().split("#")[0] || "index.html";
    if (linkPage === currentPage) {
      link.classList.add("is-active");
    }
  });


  document.getElementById("heroScroll")?.addEventListener("click", () => {
    document.getElementById("stats").scrollIntoView({ behavior: "smooth" });
  });

  document.getElementById("year").textContent = new Date().getFullYear();

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
  // Guard: the preloader's "load" handler and its safety-timeout fallback can
  // both fire (e.g. when images/fonts take >1.7s to load), which used to
  // create duplicate ScrollTriggers for every section — leaving stats,
  // service cards, team cards, gallery items, etc. stuck at opacity:0.
  if (animationsInitialized) return;
  animationsInitialized = true;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!window.gsap) return;

  /* ---------------- Hero entrance ---------------- */
  const heroTl = gsap.timeline({ defaults: { ease: "power3.out" } });
  heroTl
    .from(".hero__eyebrow", { y: 16, opacity: 0, duration: .6 }, 0)
    .from(".hero__title .line", { yPercent: 110, opacity: 0, duration: .9, stagger: .12 }, 0.1)
    .from(".hero__sub", { y: 20, opacity: 0, duration: .7 }, 0.5)
    .from(".hero__ctas", { y: 20, opacity: 0, duration: .7 }, 0.62)
    .from(".hero__trust", { y: 20, opacity: 0, duration: .7 }, 0.72)
    .from(".hero__frame", { scale: 1.08, opacity: 0, duration: 1.1, ease: "power2.out" }, 0.2)
    .from(".hero__badge", { y: 20, opacity: 0, duration: .6 }, 0.9);

  /* ---------------- Inner-page hero entrance ---------------- */
  if (document.querySelector(".inner-hero")) {
    gsap.timeline({ defaults: { ease: "power3.out" } })
      .from(".inner-hero .eyebrow", { y: 16, opacity: 0, duration: .6 }, 0)
      .from(".inner-hero__title .line", { yPercent: 110, opacity: 0, duration: .9, stagger: .12 }, .1)
      .from(".inner-hero__lead", { y: 20, opacity: 0, duration: .7 }, .5)
      .from(".inner-hero__actions", { y: 20, opacity: 0, duration: .7 }, .62)
      .from(".inner-hero__stats", { y: 20, opacity: 0, duration: .7 }, .72);
  }

  if (!reduceMotion) {
    gsap.to("#heroArcPath", { strokeDashoffset: 0, duration: 2, ease: "power2.inOut", delay: .8 });
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

  /* ---------------- Stats section fade for grid on dark bg -------------- */
  gsap.utils.toArray(".stats__item").forEach((el, i) => {
    gsap.from(el, {
      opacity: 0, y: 24, duration: .7, delay: i * 0.08,
      scrollTrigger: { trigger: ".stats__grid", start: "top 85%" }
    });
  });

  /* ---------------- About ring float ---------------- */
  gsap.to(".about__ring", {
    y: 14, duration: 2.6, ease: "sine.inOut", yoyo: true, repeat: -1
  });

  /* ---------------- Service cards stagger ---------------- */
  gsap.utils.toArray(".service-card").forEach((card, i) => {
    gsap.from(card, {
      y: 46, opacity: 0, duration: .8, ease: "power3.out",
      delay: (i % 3) * 0.08,
      scrollTrigger: { trigger: card, start: "top 90%" }
    });
  });

  /* ---------------- Contact cards scroll reveal ---------------- */
  const contactCards = gsap.utils.toArray(".cp-card");
  if (contactCards.length) {
    if (reduceMotion) {
      gsap.set(contactCards, { y: 0, opacity: 1 });
    } else {
      gsap.from(contactCards, {
        y: 42,
        opacity: 0,
        duration: .8,
        stagger: .12,
        ease: "power3.out",
        scrollTrigger: { trigger: ".cp-quick__grid", start: "top 86%", once: true }
      });
    }
  }

  /* ---------------- Pinned horizontal process rail — removed (now vertical timeline) ---------------- */

  /* ---------------- Process rows stagger in ---------------- */
  gsap.utils.toArray(".process__item").forEach((item, i) => {
    gsap.from(item, {
      y: 20, opacity: 0, duration: .65, ease: "power3.out",
      delay: i * 0.07,
      scrollTrigger: { trigger: item, start: "top 92%" }
    });
  });
  gsap.from(".process__head > *", {
    y: 24, opacity: 0, duration: .7, stagger: .1,
    scrollTrigger: { trigger: ".process__head", start: "top 85%" }
  });

  /* ---------------- Team section reveal ---------------- */
  gsap.from(".team__left > *", {
    y: 28, opacity: 0, duration: .7, stagger: .12, ease: "power3.out",
    scrollTrigger: { trigger: ".team", start: "top 75%", once: true }
  });
  gsap.from(".team__right", {
    x: 40, opacity: 0, duration: .9, ease: "power3.out",
    scrollTrigger: { trigger: ".team", start: "top 75%", once: true }
  });

  /* ---------------- Booking split reveal ---------------- */
  gsap.from(".book__panel > *", {
    y: 24, opacity: 0, duration: .7, stagger: .08,
    scrollTrigger: { trigger: ".book", start: "top 75%" }
  });
  gsap.from(".book__form", {
    y: 24, opacity: 0, duration: .8,
    scrollTrigger: { trigger: ".book", start: "top 70%" }
  });

  ScrollTrigger.refresh();
}

/* ==========================================================================
   Non-GSAP interactions: testimonial carousel, team drag, gallery,
   booking form submit
   ========================================================================== */
function initInteractions() {

  /* ---------------- Process: floating image reveal on row hover ---------------- */
  const processItems = document.querySelectorAll(".process__item");
  const processImgPane = document.getElementById("processImgPane");
  const processImg = document.getElementById("processImg");

  if (processItems.length && processImgPane && processImg) {
    let hideTimer;

    processItems.forEach((item) => {
      item.addEventListener("mouseenter", () => {
        clearTimeout(hideTimer);
        const src = item.dataset.img;
        if (src && processImg.src !== src) {
          processImg.style.opacity = "0";
          setTimeout(() => {
            processImg.src = src;
            processImg.style.opacity = "1";
          }, 200);
        }
        // Position pane alongside the hovered row, clamped so it never overflows
        const itemRect = item.getBoundingClientRect();
        const innerEl = item.closest(".process__inner");
        const sectionRect = innerEl.getBoundingClientRect();
        const paneH = processImgPane.offsetHeight || 220;
        const maxTop = innerEl.offsetHeight - paneH - 16;
        const rawTop = itemRect.top - sectionRect.top - 20;
        processImgPane.style.top = Math.max(0, Math.min(rawTop, maxTop)) + "px";
        processImgPane.classList.add("is-visible");
      });

      item.addEventListener("mouseleave", () => {
        hideTimer = setTimeout(() => {
          processImgPane.classList.remove("is-visible");
        }, 300);
      });
    });

    processImgPane.addEventListener("mouseenter", () => clearTimeout(hideTimer));
    processImgPane.addEventListener("mouseleave", () => {
      processImgPane.classList.remove("is-visible");
    });
  }

  /* ---------------- Studio Tour: tab switching ---------------- */
  const studioTabs = document.querySelectorAll(".studio__tab");
  const studioSlides = document.querySelectorAll(".studio__slide");
  const studioCaptions = document.querySelectorAll(".studio__caption");

  if (studioTabs.length) {
    let studioAutoTimer;

    const switchStudio = (key) => {
      studioTabs.forEach((t) => {
        const active = t.dataset.tab === key;
        t.classList.toggle("is-active", active);
        t.setAttribute("aria-selected", String(active));
      });
      studioSlides.forEach((s) => s.classList.toggle("is-active", s.dataset.slide === key));
      studioCaptions.forEach((c) => c.classList.toggle("is-active", c.dataset.caption === key));
    };

    const startAuto = () => {
      const keys = Array.from(studioTabs).map((t) => t.dataset.tab);
      let idx = 0;
      studioAutoTimer = setInterval(() => {
        idx = (idx + 1) % keys.length;
        switchStudio(keys[idx]);
      }, 5000);
    };

    studioTabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        clearInterval(studioAutoTimer);
        switchStudio(tab.dataset.tab);
        startAuto();
      });
    });

    startAuto();

    // Pause on hover / touch
    const studioEl = document.querySelector(".studio");
    studioEl?.addEventListener("mouseenter", () => clearInterval(studioAutoTimer));
    studioEl?.addEventListener("mouseleave", startAuto);
    studioEl?.addEventListener("touchstart", () => clearInterval(studioAutoTimer), { passive: true });
  }

  /* ---------------- Testimonial carousel ---------------- */
  const rail = document.getElementById("testimonialRail");
  const prevBtn = document.getElementById("tPrev");
  const nextBtn = document.getElementById("tNext");
  if (rail) {
    const scrollByCard = (dir) => {
      const card = rail.querySelector(".t-card");
      if (!card) return;
      const amount = card.getBoundingClientRect().width + 24;
      rail.scrollBy({ left: dir * amount, behavior: "smooth" });
    };
    prevBtn?.addEventListener("click", () => scrollByCard(-1));
    nextBtn?.addEventListener("click", () => scrollByCard(1));

    let autoTimer = setInterval(() => scrollByCard(1), 5500);
    rail.addEventListener("mouseenter", () => clearInterval(autoTimer));
    rail.addEventListener("touchstart", () => clearInterval(autoTimer), { passive: true });
  }

  /* ---------------- Team: index list ↔ featured photo switcher ---------------- */
  const teamData = [
    {
      img: "assets/images/doctor-3.webp",
      name: "Dr. Naomi Voss, DDS",
      role: "Lead Dentist · Cosmetic &amp; Restorative",
      bio: "14 years practicing, with a focus on natural-looking veneer and bonding work that complements each patient's face."
    },
    {
      img: "assets/images/doctor-4.webp",
      name: "Dr. Owen Farrell",
      role: "Oral Surgeon · Implants",
      bio: "Specialist in guided implant surgery and full-arch reconstruction — over 2,000 implants placed with a 99% success rate."
    },
    {
      img: "assets/images/doctor-5.webp",
      name: "Dr. Nathan",
      role: "Orthodontics · Clear Aligners",
      bio: "Leads our clear-aligner program, from first scan to final retainer fit — every case planned digitally before a single tray ships."
    },
    {
      img: "assets/images/doctor-2.webp",
      name: "Dr. Sam Okafor",
      role: "General &amp; Preventive Care",
      bio: "Your first visit is usually with Sam — calm, thorough, and big on patient education so you always leave knowing your options."
    }
  ];

  const teamIndexItems = document.querySelectorAll(".team__index-item");
  const teamThumbs = document.querySelectorAll(".team__thumb");
  const teamFeaturedImg = document.getElementById("teamFeaturedImg");
  const teamBioText = document.getElementById("teamBioText");
  const teamBadgeName = document.getElementById("teamBadgeName");
  const teamBadgeRole = document.getElementById("teamBadgeRole");

  if (teamIndexItems.length && teamFeaturedImg) {
    // Show bio text on load
    setTimeout(() => teamBioText?.classList.add("is-visible"), 400);

    const switchMember = (idx) => {
      const d = teamData[idx];
      if (!d) return;

      // Update active states
      teamIndexItems.forEach((el) => el.classList.toggle("is-active", +el.dataset.member === idx));
      teamThumbs.forEach((el) => el.classList.toggle("is-active", +el.dataset.member === idx));

      // Crossfade photo
      teamFeaturedImg.classList.add("is-swapping");
      setTimeout(() => {
        teamFeaturedImg.src = d.img;
        teamFeaturedImg.alt = d.name;
        teamFeaturedImg.classList.remove("is-swapping");
      }, 280);

      // Swap badge
      if (teamBadgeName) teamBadgeName.innerHTML = d.name;
      if (teamBadgeRole) teamBadgeRole.innerHTML = d.role;

      // Swap bio
      if (teamBioText) {
        teamBioText.classList.remove("is-visible");
        setTimeout(() => {
          teamBioText.textContent = d.bio;
          teamBioText.classList.add("is-visible");
        }, 200);
      }
    };

    teamIndexItems.forEach((item) => {
      item.addEventListener("click", () => switchMember(+item.dataset.member));
      item.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); switchMember(+item.dataset.member); }
      });
    });

    teamThumbs.forEach((thumb) => {
      thumb.addEventListener("click", () => switchMember(+thumb.dataset.member));
    });
  }

  /* ---------------- Booking form — validate → reset → redirect to 404 ---------------- */
  const form = document.getElementById("bookingForm");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }

      const btn = form.querySelector("button[type=submit]");
      btn.classList.add("is-sent");
      btn.disabled = true;

      // Reset the form immediately so it's clean if the user navigates back
      form.reset();

      // Flag in sessionStorage so the 404 page knows we came from the booking form
      sessionStorage.setItem("fromBooking", "1");

      // Short delay so the "sent" state is briefly visible, then redirect
      setTimeout(() => {
        window.location.href = "404.html";
      }, 800);
    });

    // Prevent picking a past date
    const dateInput = document.getElementById("bfDate");
    if (dateInput) {
      const today = new Date().toISOString().split("T")[0];
      dateInput.setAttribute("min", today);
    }

    // When navigating back from 404, ensure form is clean
    window.addEventListener("pageshow", () => {
      form.reset();
      const btn = form.querySelector("button[type=submit]");
      if (btn) { btn.classList.remove("is-sent"); btn.disabled = false; }
    });
  }
}