/* ==========================================================================
   Stackly DENTAL STUDIO — Contact page script (additive)
   Loaded after script.js. Handles only what's unique to contact.html:
   hero arc + route line draw-in, quick-topic chip select, floating-label
   form demo submit, live studio-hours status, and the FAQ accordion.
   Shared behavior (preloader, nav, AOS init, [data-reveal] fades,
   [data-counter] count-up) is already handled by script.js.
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /* ---------------- Hero arc + visit route draw-in ---------------- */
    if (window.gsap) {
        if (window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

        if (!reduceMotion) {
            gsap.to("#cpHeroArcPath", { strokeDashoffset: 0, duration: 2, ease: "power2.inOut", delay: 1.1 });

            const routePath = document.getElementById("cpRoutePath");
            if (routePath) {
                gsap.to(routePath, {
                    strokeDashoffset: 0,
                    duration: 1.6,
                    ease: "power2.inOut",
                    scrollTrigger: { trigger: ".cp-visit", start: "top 70%" }
                });
            }
        } else {
            gsap.set("#cpHeroArcPath", { strokeDashoffset: 0 });
            const routePath = document.getElementById("cpRoutePath");
            if (routePath) gsap.set(routePath, { strokeDashoffset: 0 });
        }

        /* Quick-contact card icon nudge on hover (desktop only) */
        if (matchMedia("(hover:hover)").matches) {
            document.querySelectorAll(".cp-card").forEach((card) => {
                const icon = card.querySelector(".cp-card__icon");
                card.addEventListener("mouseenter", () => {
                    if (icon) gsap.to(icon, { rotate: -8, duration: .35, ease: "back.out(2)" });
                });
                card.addEventListener("mouseleave", () => {
                    if (icon) gsap.to(icon, { rotate: 0, duration: .35, ease: "power2.out" });
                });
            });
        }
    }

    /* ---------------- Topic chip-select ---------------- */
    const chipGroup = document.getElementById("cfTopic");
    const chipValue = document.getElementById("cfTopicValue");
    if (chipGroup && chipValue) {
        chipGroup.querySelectorAll(".cp-chipselect__btn").forEach((btn) => {
            btn.addEventListener("click", () => {
                chipGroup.querySelectorAll(".cp-chipselect__btn").forEach((b) => b.classList.remove("is-active"));
                btn.classList.add("is-active");
                chipValue.value = btn.dataset.value;
            });
        });
    }

    /* ---------------- Contact form (demo submit) ---------------- */
    const form = document.getElementById("contactForm");
    if (form) {
        form.addEventListener("submit", (e) => {
            e.preventDefault();
            if (!form.checkValidity()) { form.reportValidity(); return; }

            const btn = form.querySelector("button[type=submit]");
            btn.classList.add("is-sent");
            btn.disabled = true;

            // Reset form fields immediately
            form.reset();

            // Reset chip-select back to first option
            chipGroup?.querySelectorAll(".cp-chipselect__btn").forEach((b, i) => b.classList.toggle("is-active", i === 0));
            if (chipValue) chipValue.value = "General question";

            // Brief pause so the user sees "sent" feedback, then reset button and redirect to 404
            setTimeout(() => {
                btn.classList.remove("is-sent");
                btn.disabled = false;
                window.location.href = "404.html";
            }, 1200);
        });
    }

    /* ---------------- Live studio hours ---------------- */
    initStudioHours();

    /* ---------------- FAQ accordion ---------------- */
    document.querySelectorAll(".cp-faq__item").forEach((item) => {
        const q = item.querySelector(".cp-faq__q");
        q?.addEventListener("click", () => {
            const isOpen = item.classList.contains("is-open");

            document.querySelectorAll(".cp-faq__item.is-open").forEach((openItem) => {
                openItem.classList.remove("is-open");
                openItem.querySelector(".cp-faq__q")?.setAttribute("aria-expanded", "false");
            });

            if (!isOpen) {
                item.classList.add("is-open");
                q.setAttribute("aria-expanded", "true");
            }
        });
    });
});

/* ==========================================================================
   Live studio hours: reads the schedule straight from the markup, compares
   against the visitor's local clock, and reflects an accurate open/closed
   state plus a "how far through today's window" progress bar.
   ========================================================================== */
function initStudioHours() {
    const table = document.getElementById("hoursTable");
    const statusEl = document.getElementById("hoursStatus");
    const noteEl = document.getElementById("hoursNote");
    if (!table || !statusEl) return;

    // { dayIndex: [openHour, closeHour] } — Sunday = 0. Sunday has no
    // scheduled window (emergencies only), so it's intentionally omitted.
    const schedule = {
        1: [8, 19], 2: [8, 19], 3: [8, 19], 4: [8, 19], 5: [8, 19],
        6: [9, 15]
    };

    const now = new Date();
    const day = now.getDay();
    const hoursFloat = now.getHours() + now.getMinutes() / 60;

    const statusText = statusEl.querySelector(".cp-hours__status-text");
    const todaysWindow = schedule[day];
    const isOpen = !!todaysWindow && hoursFloat >= todaysWindow[0] && hoursFloat < todaysWindow[1];

    statusEl.classList.toggle("is-closed", !isOpen);
    if (statusText) {
        if (isOpen) {
            const closeH = todaysWindow[1];
            const remaining = closeH - hoursFloat;
            const h = Math.floor(remaining);
            const m = Math.round((remaining - h) * 60);
            statusText.textContent = h > 0
                ? `Open now · closes in ${h}h ${m}m`
                : `Open now · closes in ${m}m`;
        } else if (todaysWindow && hoursFloat < todaysWindow[0]) {
            const untilOpen = todaysWindow[0] - hoursFloat;
            const h = Math.floor(untilOpen);
            const m = Math.round((untilOpen - h) * 60);
            statusText.textContent = h > 0 ? `Closed · opens in ${h}h ${m}m` : `Closed · opens in ${m}m`;
        } else if (day === 0) {
            statusText.textContent = "Closed · emergencies only today";
        } else {
            statusText.textContent = "Closed for today";
        }
    }

    table.querySelectorAll("li").forEach((li) => {
        const liDay = Number(li.dataset.day);
        const isToday = liDay === day;
        li.classList.toggle("is-today", isToday);

        const fill = li.querySelector(".cp-hours__bar-fill");
        if (!fill) return;

        const win = schedule[liDay];
        if (!win) { fill.style.width = "0%"; return; }

        if (!isToday) {
            // Fully lit bar for a normal working day, dim for reference only.
            fill.style.width = "0%";
            return;
        }

        let pct = 0;
        if (hoursFloat <= win[0]) pct = 0;
        else if (hoursFloat >= win[1]) pct = 100;
        else pct = ((hoursFloat - win[0]) / (win[1] - win[0])) * 100;
        requestAnimationFrame(() => { fill.style.width = pct + "%"; });
    });

    if (noteEl) {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "your local time zone";
        noteEl.textContent = `Times shown in ${tz.replace(/_/g, " ")}. Studio observes India Standard Time.`;
    }
}