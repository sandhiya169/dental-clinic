/* ==========================================================================
   Stackly DENTAL STUDIO — Dashboard script
   Handles: mobile sidebar toggle, in-page panel switching (no reload),
   hash-based deep linking, and a visual-only demo message thread.
   No data is stored, persisted, or sent anywhere.
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  initSidebarToggle();
  initPanelSwitching();
  initDemoMessageThread();
  initUserDisplay();

  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
});

/* ---------------- Show logged-in email in topbar & sidebar ---------------- */
function initUserDisplay() {
  const topbarEmailEl = document.getElementById("dashUserEmail");
  const sidebarEmailEl = document.getElementById("sidebarUserEmail");

  const email = localStorage.getItem("dc_user_email") || "guest@demo.com";

  // Topbar chip — desktop only (hidden on ≤900px via CSS)
  if (topbarEmailEl) {
    topbarEmailEl.textContent = email;
    topbarEmailEl.setAttribute("title", email);
    topbarEmailEl.style.display = "flex";
  }

  // Sidebar email — mobile drawer only (hidden on >900px via CSS)
  if (sidebarEmailEl) {
    sidebarEmailEl.textContent = email;
    sidebarEmailEl.setAttribute("title", email);
  }
}

/* ---------------- Mobile sidebar open/close ---------------- */
function initSidebarToggle() {
  const sidebar = document.getElementById("dashSidebar");
  const burger = document.getElementById("dashBurger");
  const closeBtn = document.getElementById("dashSidebarClose");
  const overlay = document.getElementById("dashOverlay");
  if (!sidebar) return;

  const open = () => {
    sidebar.classList.add("is-open");
    overlay?.classList.add("is-visible");
    document.body.classList.add("no-scroll");
  };
  const close = () => {
    sidebar.classList.remove("is-open");
    overlay?.classList.remove("is-visible");
    document.body.classList.remove("no-scroll");
  };

  burger?.addEventListener("click", open);
  closeBtn?.addEventListener("click", close);
  overlay?.addEventListener("click", close);

  // Close the drawer whenever a nav item is chosen on mobile
  sidebar.querySelectorAll("[data-panel]").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (window.matchMedia("(max-width: 900px)").matches) close();
    });
  });
}

/* ---------------- Panel switching (SPA-style, same page) --------------- */
function initPanelSwitching() {
  const navButtons = document.querySelectorAll(".dash-nav__item[data-panel]");
  const panels = document.querySelectorAll(".dash-panel[data-panel]");
  const titleEl = document.getElementById("dashPanelTitle");
  const eyebrowEl = document.getElementById("dashPanelEyebrow");
  if (!navButtons.length || !panels.length) return;

  const activate = (name, updateHash = true) => {
    let matched = false;

    navButtons.forEach((btn) => {
      const isMatch = btn.dataset.panel === name;
      btn.classList.toggle("is-active", isMatch);
      btn.setAttribute("aria-selected", String(isMatch));
      if (isMatch) matched = true;
    });

    if (!matched) return;

    panels.forEach((panel) => {
      panel.classList.toggle("is-active", panel.dataset.panel === name);
    });

    const activeBtn = document.querySelector(`.dash-nav__item[data-panel="${name}"]`);
    if (activeBtn) {
      if (titleEl) titleEl.textContent = activeBtn.dataset.title || activeBtn.textContent.trim();
      if (eyebrowEl) eyebrowEl.textContent = activeBtn.dataset.eyebrow || "";
    }

    if (updateHash) {
      history.replaceState(null, "", `#${name}`);
    }

    // Scroll content back to top on panel change
    document.querySelector(".dash-content")?.scrollTo({ top: 0, behavior: "instant" in document.documentElement.style ? "instant" : "auto" });
    window.scrollTo({ top: 0, behavior: "auto" });
  };

  navButtons.forEach((btn) => {
    btn.addEventListener("click", () => activate(btn.dataset.panel));
  });

  // Deep link support: #appointments etc.
  const initial = window.location.hash ? window.location.hash.slice(1) : null;
  const validNames = Array.from(panels).map((p) => p.dataset.panel);
  if (initial && validNames.includes(initial)) {
    activate(initial, false);
  } else {
    const firstActive = document.querySelector(".dash-nav__item.is-active[data-panel]");
    activate(firstActive ? firstActive.dataset.panel : validNames[0], false);
  }

  window.addEventListener("hashchange", () => {
    const name = window.location.hash.slice(1);
    if (validNames.includes(name)) activate(name, false);
  });
}

/* ---------------- Demo message thread (visual only, nothing sent) ------ */
function initDemoMessageThread() {
  const form = document.getElementById("dashMsgForm");
  const input = document.getElementById("dashMsgInput");
  const thread = document.getElementById("dashMsgThread");
  if (!form || !input || !thread) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const value = input.value.trim();
    if (!value) return;

    const bubble = document.createElement("div");
    bubble.className = "dash-msg dash-msg--out";
    const now = new Date();
    const time = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    bubble.innerHTML = `${escapeHtml(value)}<span>You · ${time}</span>`;
    thread.appendChild(bubble);
    thread.scrollTop = thread.scrollHeight;
    input.value = "";

    // Nothing is persisted — this is a front-end-only visual demo.
  });
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}