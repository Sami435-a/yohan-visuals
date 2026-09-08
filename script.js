/* LOADER — hides on DOMContentLoaded + a minimum show time, with a
   hard fallback so it can never stay stuck if an asset stalls. */
(function () {
  const loader = document.getElementById("loader");
  if (!loader) return;

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

/* PORTFOLIO FILTER (work page only) */
const filters = document.querySelectorAll(".filter");
const portfolioItems = document.querySelectorAll(".portfolio-item");

if (filters.length && portfolioItems.length) {
  filters.forEach(filter => {
    filter.addEventListener("click", () => {
      filters.forEach(f => f.classList.remove("active"));
      filter.classList.add("active");

      const selected = filter.dataset.filter;
      portfolioItems.forEach(item => {
        const category = item.dataset.category;
        item.classList.toggle("hide", !(selected === "all" || category === selected));
      });
    });
  });
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
