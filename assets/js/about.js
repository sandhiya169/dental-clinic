/* ==========================================================================
   Stackly DENTAL STUDIO — about page script
   Handles: preloader, nav behavior, AOS init, cursor dot, GSAP hero reveal,
   scroll-drawn story spine + timeline dots, founder photo wipe reveal,
   bento gallery stagger, people-rail drag-scroll.
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
            "a, button, .studio-tour__item, .people__card, .standards__item"
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
    const heroEls = document.querySelectorAll("[data-hero-el], [data-hero-line]");
    if (!window.gsap) {
        heroEls.forEach((el) => el.classList.add("is-visible"));
        document.querySelectorAll(".people__founder-photo").forEach((el) => {
            el.style.clipPath = "inset(0 0% 0 0)";
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
    const heroTl = gsap.timeline({
        defaults: { ease: "power3.out" },
        onComplete: () => gsap.set(".inner-hero .eyebrow, .inner-hero__title .line, .inner-hero__lead, .inner-hero__sign", { opacity: 1 })
    });
    heroTl
        .from(".inner-hero .eyebrow", { y: 16, opacity: 0, duration: .6 }, 0)
        .from("[data-hero-line]", { yPercent: 110, opacity: 0, duration: .9, stagger: .12 }, 0.1)
        .from(".inner-hero__lead", { y: 20, opacity: 0, duration: .7 }, 0.5)
        .from(".inner-hero__sign", { y: 20, opacity: 0, duration: .7 }, 0.62);

    /* ---------------- Origin story: scroll-drawn spine + dots ------------- */
    const spinePath = document.getElementById("storySpinePath");
    const storyRail = document.querySelector(".story__rail");
    const storyDots = gsap.utils.toArray(".story__marker");

    if (spinePath && storyRail) {
        const spineLength = spinePath.getTotalLength();
        gsap.set(spinePath, { strokeDasharray: spineLength, strokeDashoffset: reduceMotion ? 0 : spineLength });

        if (!reduceMotion) {
            gsap.to(spinePath, {
                strokeDashoffset: 0,
                ease: "none",
                scrollTrigger: {
                    trigger: storyRail,
                    start: "top 75%",
                    end: "bottom 70%",
                    scrub: 0.6
                }
            });
        }

        storyDots.forEach((dot) => {
            gsap.to(dot, {
                scale: 1,
                duration: .4,
                ease: "back.out(2)",
                scrollTrigger: { trigger: dot, start: "top 78%", once: true }
            });
        });
    }

    /* ---------------- Manifesto number count-in ---------------------------- */
    gsap.utils.toArray(".manifesto__num").forEach((num) => {
        gsap.from(num, {
            opacity: 0, x: -12, duration: .6, ease: "power2.out",
            scrollTrigger: { trigger: num, start: "top 90%" }
        });
    });

    /* ---------------- Founder photo wipe reveal ---------------------------- */
    const founderBlock = document.querySelector("[data-founder-reveal]");
    if (founderBlock) {
        const founderPhoto = founderBlock.querySelector(".people__founder-photo");
        const founderInfo = founderBlock.querySelectorAll(".people__founder-info > *");

        const founderTl = gsap.timeline({
            scrollTrigger: { trigger: founderBlock, start: "top 75%" }
        });
        founderTl
            .to(founderPhoto, { clipPath: "inset(0 0% 0 0)", duration: 1, ease: "power3.inOut" }, 0)
            .from(founderInfo, { y: 20, opacity: 0, duration: .7, stagger: .08, ease: "power3.out" }, 0.25);
    }

    /* ---------------- People rail cards (extra lift beyond AOS) ----------- */
    gsap.utils.toArray(".people__card").forEach((card, i) => {
        gsap.from(card, {
            y: 30, opacity: 0, duration: .6, delay: (i % 4) * 0.05, ease: "power3.out",
            scrollTrigger: { trigger: "#peopleRail", start: "top 88%" }
        });
    });

    /* ---------------- Studio tour bento stagger ---------------------------- */
    gsap.utils.toArray("[data-bento]").forEach((item, i) => {
        gsap.from(item, {
            scale: 1.08, opacity: 0, duration: .8, ease: "power2.out",
            delay: (i % 5) * 0.06,
            scrollTrigger: { trigger: ".studio-tour__grid", start: "top 85%" }
        });
    });

    /* ---------------- Standards grid stagger ------------------------------- */
    gsap.utils.toArray(".standards__item").forEach((item, i) => {
        gsap.from(item, {
            y: 30, opacity: 0, duration: .6, delay: (i % 3) * 0.08, ease: "power3.out",
            scrollTrigger: { trigger: ".standards__grid", start: "top 88%" }
        });
    });

    /* ---------------- Closing CTA arc draw ---------------------------------- */
    const ctaArc = document.querySelector(".about-cta__arc path");
    if (ctaArc && !reduceMotion) {
        const len = ctaArc.getTotalLength();
        gsap.set(ctaArc, { strokeDasharray: len, strokeDashoffset: len });
        gsap.to(ctaArc, {
            strokeDashoffset: 0, duration: 1.6, ease: "power2.inOut",
            scrollTrigger: { trigger: ".about-cta", start: "top 80%" }
        });
    }

    ScrollTrigger.refresh();
}

/* ==========================================================================
   Non-GSAP interactions: people-rail drag-scroll
   ========================================================================== */
function initInteractions() {
    const peopleRail = document.getElementById("peopleRail");
    if (peopleRail) {
        let isDown = false, startX, scrollLeft;

        peopleRail.addEventListener("mousedown", (e) => {
            isDown = true;
            startX = e.pageX - peopleRail.offsetLeft;
            scrollLeft = peopleRail.scrollLeft;
        });
        ["mouseleave", "mouseup"].forEach((evt) =>
            peopleRail.addEventListener(evt, () => isDown = false)
        );
        peopleRail.addEventListener("mousemove", (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - peopleRail.offsetLeft;
            peopleRail.scrollLeft = scrollLeft - (x - startX) * 1.4;
        });

        // Touch support
        let touchStartX = 0, touchScrollLeft = 0;
        peopleRail.addEventListener("touchstart", (e) => {
            touchStartX = e.touches[0].pageX;
            touchScrollLeft = peopleRail.scrollLeft;
        }, { passive: true });
        peopleRail.addEventListener("touchmove", (e) => {
            const x = e.touches[0].pageX;
            peopleRail.scrollLeft = touchScrollLeft - (x - touchStartX);
        }, { passive: true });
    }
}