/* LOADER — hides on DOMContentLoaded + a minimum show time, with a
   hard fallback so it can never stay stuck if an asset stalls.
   window.flashLoader() replays the same animation for in-page
   transitions (opening/closing a gallery, etc.) so the loading
   moment shows up everywhere, not just on first page load. */
const flashLoader = (function () {
  const loader = document.getElementById("loader");
  if (!loader) return function () {};

  const MIN_SHOW = 1600; // slightly longer, deliberate loading moment
  const HARD_FALLBACK = 3500;
  const start = Date.now();

  function hideLoader() {
    loader.classList.add("hide");
  }

  function readyToHide() {
    const elapsed = Date.now() - start;
    const remaining = Math.max(MIN_SHOW - elapsed, 0);
    setTimeout(hideLoader, remaining);
  }

  if (document.readyState === "complete" || document.readyState === "interactive") {
    readyToHide();
  } else {
    document.addEventListener("DOMContentLoaded", readyToHide);
  }

  setTimeout(hideLoader, HARD_FALLBACK);

  const line = loader.querySelector(".loader-line span");

  // Replays the loader for a brief in-page transition. `onCovered`
  // runs once the loader is fully opaque, so DOM swaps happen while
  // hidden behind it; the loader then lifts after `showTime`.
  return function flashLoader(onCovered, showTime = 900) {
    loader.classList.remove("hide");
    if (line) {
      line.style.animation = "none";
      void line.offsetWidth; // restart the line-fill animation
      line.style.animation = "";
    }
    window.setTimeout(() => {
      if (typeof onCovered === "function") onCovered();
    }, 220);
    window.setTimeout(() => {
      loader.classList.add("hide");
    }, showTime);
  };
})();

/* HEADER scroll state */
const header = document.getElementById("header");
if (header) {
  window.addEventListener("scroll", () => {
    header.classList.toggle("scrolled", window.scrollY > 50);
  });
}

/* MOBILE MENU */
const menuBtn = document.getElementById("menuBtn");
const navLinks = document.getElementById("navLinks");

if (menuBtn && navLinks) {
  function closeMenu() {
    navLinks.classList.remove("open");
    menuBtn.textContent = "☰";
    menuBtn.setAttribute("aria-expanded", "false");
    document.body.classList.remove("menu-open");
  }

  function toggleMenu() {
    const isOpen = navLinks.classList.toggle("open");
    menuBtn.textContent = isOpen ? "×" : "☰";
    menuBtn.setAttribute("aria-expanded", String(isOpen));
    document.body.classList.toggle("menu-open", isOpen);
  }

  menuBtn.addEventListener("click", toggleMenu);

  document.querySelectorAll(".nav-links a").forEach(link => {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("keydown", e => {
    if (e.key === "Escape") closeMenu();
  });
}

/* Mark the current page's nav link active */
(function () {
  const path = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-links a[href]").forEach(link => {
    const href = link.getAttribute("href");
    if (href === path || (path === "" && href === "index.html")) {
      link.classList.add("active");
    }
  });
})();

/* SCROLL REVEAL */
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (prefersReducedMotion) {
  document.querySelectorAll(".reveal").forEach(el => el.classList.add("visible"));
} else if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll(".reveal").forEach(el => observer.observe(el));
} else {
  document.querySelectorAll(".reveal").forEach(el => el.classList.add("visible"));
}

/* GALLERY COLLECTIONS (work page only) — tap a cover photo to open
   that collection; a back button returns to the collection grid. */
const collectionCards = document.querySelectorAll(".collection-card");
const collectionsView = document.getElementById("collectionsView");
const galleryDetail = document.getElementById("galleryDetail");
const detailTitle = document.getElementById("detailTitle");
const backBtn = document.getElementById("backBtn");
const portfolioItems = document.querySelectorAll(".portfolio-item");

if (collectionCards.length && galleryDetail) {
  function openCollection(key, label) {
    portfolioItems.forEach(item => {
      item.classList.toggle("hide", item.dataset.category !== key);
    });
    if (detailTitle) detailTitle.textContent = label;
    collectionsView.hidden = true;
    galleryDetail.hidden = false;
    galleryDetail.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" });
  }

  function closeCollection() {
    galleryDetail.hidden = true;
    collectionsView.hidden = false;
    collectionsView.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" });
  }

  collectionCards.forEach(card => {
    card.addEventListener("click", () => {
      const key = card.dataset.collection;
      const label = card.querySelector(".collection-name")?.textContent || "";
      flashLoader(() => openCollection(key, label));
    });
  });

  if (backBtn) {
    backBtn.addEventListener("click", () => flashLoader(closeCollection));
  }
}

/* CURRENT YEAR */
const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* HERO PARALLAX (home page only) */
const heroBg = document.querySelector(".hero-bg");
if (heroBg && !prefersReducedMotion) {
  let ticking = false;
  window.addEventListener("scroll", () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const scroll = window.scrollY;
        if (scroll < window.innerHeight) {
          heroBg.style.transform = `translateY(${scroll * 0.12}px)`;
        }
        ticking = false;
      });
      ticking = true;
    }
  });
}
