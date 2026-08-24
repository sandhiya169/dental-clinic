/* ==========================================================================
   Stackly DENTAL STUDIO — 404 page script
   Animations are handled entirely in CSS. This file only manages the
   custom cursor dot (enhancement only, never blocks rendering).
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  /* ---------------- Custom cursor dot (hover-capable devices only) ---------------- */
  const cursorDot = document.querySelector(".cursor-dot");
  if (cursorDot && matchMedia("(hover:hover)").matches) {
    window.addEventListener("mousemove", (e) => {
      cursorDot.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%,-50%)`;
      cursorDot.classList.add("is-active");
    });
    document.querySelectorAll("a, button").forEach((el) => {
      el.addEventListener("mouseenter", () => cursorDot.classList.add("is-big"));
      el.addEventListener("mouseleave", () => cursorDot.classList.remove("is-big"));
    });
  }
});
