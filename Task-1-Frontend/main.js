// Mocha Studio — vanilla JS interactions
// No frameworks. Progressive enhancement only.

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

const API_BASE = "http://localhost:3001";

/* ---------- Year ---------- */
const yearEl = $("#year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* ---------- Sticky header shadow ---------- */
const header = $("#site-header");
const onScroll = () => {
  if (window.scrollY > 8) header.classList.add("is-scrolled");
  else header.classList.remove("is-scrolled");
};
onScroll();
window.addEventListener("scroll", onScroll, { passive: true });

/* ---------- Mobile nav toggle ---------- */
const toggle = $("#nav-toggle");
const menu = $("#primary-menu");
const closeMenu = () => {
  menu.classList.remove("is-open");
  toggle.classList.remove("is-open");
  toggle.setAttribute("aria-expanded", "false");
};
toggle.addEventListener("click", () => {
  const open = menu.classList.toggle("is-open");
  toggle.classList.toggle("is-open", open);
  toggle.setAttribute("aria-expanded", String(open));
});
$$("#primary-menu a").forEach((a) => a.addEventListener("click", closeMenu));
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeMenu();
});

/* ---------- Scroll reveal ---------- */
const reveals = $$(".reveal");
if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
  );
  reveals.forEach((el) => io.observe(el));
} else {
  reveals.forEach((el) => el.classList.add("is-visible"));
}

/* ---------- Animated stat counters ---------- */
const counters = $$("[data-count]");
const animateCount = (el) => {
  const target = Number(el.dataset.count) || 0;
  const duration = 1400;
  const start = performance.now();
  const step = (now) => {
    const p = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(eased * target);
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
};
if ("IntersectionObserver" in window && counters.length) {
  const cio = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          cio.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.6 }
  );
  counters.forEach((el) => cio.observe(el));
} else {
  counters.forEach((el) => (el.textContent = el.dataset.count));
}

/* ---------- Contact form validation ---------- */
const form = $("#contact-form");
const status = $("#form-status");

const showError = (name, msg) => {
  const field = form.querySelector(`[name="${name}"]`)?.closest(".field");
  const errEl = form.querySelector(`.field-error[data-for="${name}"]`);
  if (field) field.classList.add("invalid");
  if (errEl) errEl.textContent = msg;
};
const clearError = (name) => {
  const field = form.querySelector(`[name="${name}"]`)?.closest(".field");
  const errEl = form.querySelector(`.field-error[data-for="${name}"]`);
  if (field) field.classList.remove("invalid");
  if (errEl) errEl.textContent = "";
};

const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

const validate = () => {
  let ok = true;
  const data = new FormData(form);
  const name = (data.get("name") || "").toString().trim();
  const email = (data.get("email") || "").toString().trim();
  const message = (data.get("message") || "").toString().trim();

  ["name", "email", "message", "budget"].forEach(clearError);

  if (!name) {
    showError("name", "Please tell us your name.");
    ok = false;
  }
  if (!email) {
    showError("email", "An email address is required.");
    ok = false;
  } else if (!isEmail(email)) {
    showError("email", "That email doesn't look right.");
    ok = false;
  }
  if (!message) {
    showError("message", "A short brief helps us reply well.");
    ok = false;
  }
  return ok;
};

form.addEventListener("submit", (e) => {
  e.preventDefault();
  status.classList.remove("is-error");
  if (!validate()) {
    status.textContent = "Please fix the highlighted fields.";
    status.classList.add("is-error");
    return;
  }

  const data = new FormData(form);
  const submitBtn = form.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  status.textContent = "Sending…";

  fetch(`${API_BASE}/api/contact`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: data.get("name"),
      email: data.get("email"),
      budget: data.get("budget"),
      message: data.get("message"),
    }),
  })
    .then(async (res) => {
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(body?.error?.message || "Something went wrong. Please try again.");
      }
      status.textContent = "Thanks — your enquiry is on its way. We'll reply soon.";
      status.classList.remove("is-error");
      form.reset();
    })
    .catch((err) => {
      status.textContent = err.message || "Couldn't reach the server. Please try again.";
      status.classList.add("is-error");
    })
    .finally(() => {
      submitBtn.disabled = false;
    });
});

form.addEventListener("input", (e) => {
  const name = e.target.name;
  if (name) clearError(name);
});

/* ---------- 3D tilt (service, work & voice cards) ---------- */
const applyTilt = (card, maxTilt, lift = 6) => {
  let raf = 0;
  card.addEventListener("pointermove", (e) => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const rect = card.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      card.style.transform = `translateY(-${lift}px) rotateX(${-py * maxTilt}deg) rotateY(${px * maxTilt}deg)`;
    });
  });
  card.addEventListener("pointerleave", () => {
    cancelAnimationFrame(raf);
    card.style.transform = "";
  });
};
$$(".service-card").forEach((card) => applyTilt(card, 8, 6));
$$(".work-card").forEach((card) => applyTilt(card, 6, 6));
$$(".voice-card").forEach((card) => applyTilt(card, 5, 4));

/* ---------- 3D parallax on hero visual ---------- */
const hero = $(".hero");
const heroArt = $(".hero-art");
if (hero && heroArt) {
  const HERO_MAX_TILT = 12;
  let heroRaf = 0;
  hero.addEventListener("pointermove", (e) => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const rect = hero.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    cancelAnimationFrame(heroRaf);
    heroRaf = requestAnimationFrame(() => {
      heroArt.style.transform = `perspective(1000px) rotateX(${-py * HERO_MAX_TILT}deg) rotateY(${px * HERO_MAX_TILT}deg)`;
    });
  });
  hero.addEventListener("pointerleave", () => {
    cancelAnimationFrame(heroRaf);
    heroArt.style.transform = "";
  });
}

/* ---------- Newsletter (footer) ---------- */
const newsletter = document.querySelector(".footer-newsletter");
newsletter?.addEventListener("submit", (e) => {
  e.preventDefault();
  const input = newsletter.querySelector("input");
  if (!input) return;

  const flashError = () => {
    input.focus();
    input.style.borderColor = "var(--error)";
    setTimeout(() => (input.style.borderColor = ""), 1200);
  };

  if (!isEmail(input.value)) {
    flashError();
    return;
  }

  const email = input.value;
  const submitBtn = newsletter.querySelector('button[type="submit"]');
  submitBtn.disabled = true;

  fetch(`${API_BASE}/api/newsletter`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  })
    .then(async (res) => {
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(body?.error?.message || "Subscription failed.");
      }
      input.value = "";
      input.placeholder = "Subscribed — thank you!";
    })
    .catch((err) => {
      input.title = err.message;
      flashError();
    })
    .finally(() => {
      submitBtn.disabled = false;
    });
});
