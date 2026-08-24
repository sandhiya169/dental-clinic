/* ==========================================================================
   Stackly DENTAL STUDIO — Auth pages script
   IMPORTANT: This file performs client-side validation ONLY.
   No email/password value is ever stored, persisted, or verified against
   any database. Nothing is written to localStorage, cookies, or sent
   over the network. Submissions only redirect the user on success.
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("year") && (document.getElementById("year").textContent = new Date().getFullYear());

  initRoleSwitch();
  initPasswordToggles();
  initLoginForm();
  initSignupForm();
});

/* ---------------- Role switch (Patient / Admin) ---------------- */
function initRoleSwitch() {
  const switcher = document.querySelector("[data-role-switch]");
  if (!switcher) return;

  const buttons = switcher.querySelectorAll(".role-switch__btn");
  const titleEl = document.querySelector("[data-role-title]");
  const subEl = document.querySelector("[data-role-sub]");
  const idField = document.querySelector("[data-admin-field]");

  const copy = {
    patient: {
      title: "Welcome back, <em>friend.</em>",
      sub: "Sign in to view appointments, treatment plans and messages.",
    },
    admin: {
      title: "Welcome back, <em>doctor.</em>",
      sub: "Sign in to your clinic dashboard to manage patients and schedules.",
    },
  };

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const role = btn.dataset.roleBtn;
      switcher.dataset.role = role;
      buttons.forEach((b) => b.setAttribute("aria-selected", String(b === btn)));

      if (titleEl && copy[role]) titleEl.innerHTML = copy[role].title;
      if (subEl && copy[role]) subEl.textContent = copy[role].sub;
      if (idField) idField.classList.toggle("is-visible", role === "admin");

      const hiddenRole = document.getElementById("loginRole");
      if (hiddenRole) hiddenRole.value = role;
    });
  });
}

/* ---------------- Show / hide password ---------------- */
function initPasswordToggles() {
  document.querySelectorAll(".pw-toggle").forEach((toggle) => {
    toggle.addEventListener("click", () => {
      const input = document.getElementById(toggle.dataset.target);
      if (!input) return;
      const shown = input.type === "text";
      input.type = shown ? "password" : "text";
      toggle.classList.toggle("is-shown", !shown);
      toggle.setAttribute("aria-label", shown ? "Show password" : "Hide password");
    });
  });
}

/* ---------------- Generic field validation helpers ---------------- */
function setFieldError(input, message) {
  const wrap = input.closest(".auth-field");
  if (!wrap) return;
  const errorEl = wrap.querySelector(".auth-field__error");
  input.classList.toggle("has-error", Boolean(message));
  if (errorEl) {
    errorEl.textContent = message || "";
    errorEl.classList.toggle("is-visible", Boolean(message));
  }
}

function clearFieldError(input) {
  setFieldError(input, "");
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function showBanner(banner, type, message) {
  if (!banner) return;
  banner.classList.remove("auth-banner--success", "auth-banner--error");
  banner.classList.add(type === "success" ? "auth-banner--success" : "auth-banner--error", "is-visible");
  const text = banner.querySelector("[data-banner-text]");
  if (text) text.textContent = message;
}

function hideBanner(banner) {
  banner?.classList.remove("is-visible");
}

/* ---------------- Login form (validation only, nothing stored) --------- */
function initLoginForm() {
  const form = document.getElementById("loginForm");
  if (!form) return;

  const emailInput = document.getElementById("loginEmail");
  const passInput = document.getElementById("loginPassword");
  const banner = document.getElementById("loginBanner");
  const submitBtn = form.querySelector("button[type=submit]");

  [emailInput, passInput].forEach((el) => {
    el?.addEventListener("input", () => clearFieldError(el));
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    hideBanner(banner);
    let valid = true;

    if (!emailInput.value.trim()) {
      setFieldError(emailInput, "Email is required.");
      valid = false;
    } else if (!isValidEmail(emailInput.value)) {
      setFieldError(emailInput, "Enter a valid email address.");
      valid = false;
    } else {
      clearFieldError(emailInput);
    }

    if (!passInput.value) {
      setFieldError(passInput, "Password is required.");
      valid = false;
    } else if (passInput.value.length < 6) {
      setFieldError(passInput, "Password must be at least 6 characters.");
      valid = false;
    } else {
      clearFieldError(passInput);
    }

    const adminIdField = document.getElementById("loginAdminId");
    if (adminIdField && adminIdField.closest(".auth-field").classList.contains("is-visible")) {
      if (!adminIdField.value.trim()) {
        setFieldError(adminIdField, "Clinic ID is required for admin sign-in.");
        valid = false;
      } else {
        clearFieldError(adminIdField);
      }
    }

    if (!valid) {
      showBanner(banner, "error", "Please fix the highlighted fields and try again.");
      return;
    }

    // NOTE: no credentials are checked or persisted anywhere.
    // This is a front-end-only demo flow.
    submitBtn.classList.add("is-loading");
    submitBtn.disabled = true;

    setTimeout(() => {
      submitBtn.classList.remove("is-loading");
      submitBtn.disabled = false;
      const role = document.querySelector("[data-role-switch]")?.dataset.role || "patient";
      // showBanner(
      //   banner,
      //   "success",
      //   role === "admin"
      //     ? "Looks good! Taking you to the dentist dashboard…"
      //     : "Looks good! Taking you to your dashboard…"
      // );
      setTimeout(() => {
        localStorage.setItem("dc_user_email", emailInput.value.trim());
        localStorage.setItem("dc_user_role", role);
        window.location.href = role === "admin" ? "dentist-dashboard.html" : "patient-dashboard.html";
      }, 900);
    }, 700);
  });
}

/* ---------------- Signup form (validation only, nothing stored) -------- */
function initSignupForm() {
  const form = document.getElementById("signupForm");
  if (!form) return;

  const nameInput = document.getElementById("suName");
  const emailInput = document.getElementById("suEmail");
  const phoneInput = document.getElementById("suPhone");
  const passInput = document.getElementById("suPassword");
  const confirmInput = document.getElementById("suConfirm");
  const termsInput = document.getElementById("suTerms");
  const banner = document.getElementById("signupBanner");
  const submitBtn = form.querySelector("button[type=submit]");

  [nameInput, emailInput, phoneInput, passInput, confirmInput].forEach((el) => {
    el?.addEventListener("input", () => clearFieldError(el));
  });
  termsInput?.addEventListener("change", () => {
    if (termsInput.checked) setFieldError(termsInput, "");
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    hideBanner(banner);
    let valid = true;

    if (!nameInput.value.trim() || nameInput.value.trim().length < 2) {
      setFieldError(nameInput, "Enter your full name.");
      valid = false;
    } else {
      clearFieldError(nameInput);
    }

    if (!emailInput.value.trim()) {
      setFieldError(emailInput, "Email is required.");
      valid = false;
    } else if (!isValidEmail(emailInput.value)) {
      setFieldError(emailInput, "Enter a valid email address.");
      valid = false;
    } else {
      clearFieldError(emailInput);
    }

    const phoneDigits = phoneInput.value.replace(/\D/g, "");
    if (!phoneInput.value.trim()) {
      setFieldError(phoneInput, "Phone number is required.");
      valid = false;
    } else if (phoneDigits.length < 7) {
      setFieldError(phoneInput, "Enter a valid phone number.");
      valid = false;
    } else {
      clearFieldError(phoneInput);
    }

    if (!passInput.value) {
      setFieldError(passInput, "Password is required.");
      valid = false;
    } else if (passInput.value.length < 8) {
      setFieldError(passInput, "Use at least 8 characters.");
      valid = false;
    } else {
      clearFieldError(passInput);
    }

    if (!confirmInput.value) {
      setFieldError(confirmInput, "Please confirm your password.");
      valid = false;
    } else if (confirmInput.value !== passInput.value) {
      setFieldError(confirmInput, "Passwords do not match.");
      valid = false;
    } else {
      clearFieldError(confirmInput);
    }

    if (!termsInput.checked) {
      setFieldError(termsInput, "You must accept the terms to continue.");
      valid = false;
    }

    if (!valid) {
      showBanner(banner, "error", "Please fix the highlighted fields and try again.");
      return;
    }

    // NOTE: form values are read only for validation above and are
    // discarded here — nothing is saved, stored, or transmitted.
    submitBtn.classList.add("is-loading");
    submitBtn.disabled = true;

    setTimeout(() => {
      form.reset();
      showBanner(banner, "success", "Account created! Redirecting you to login…");
      setTimeout(() => {
        window.location.href = "login.html";
      }, 1200);
    }, 700);
  });
}

