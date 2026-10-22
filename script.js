
(() => {
  "use strict";

  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  const finePointer = window.matchMedia(
    "(hover: hover) and (pointer: fine)"
  ).matches;

  const header = document.querySelector(".site-header");
  const revealItems = [...document.querySelectorAll(".reveal")];
  const year = document.querySelector("#year");

  // Footer year
  if (year) {
    year.textContent = new Date().getFullYear();
  }

  // Header appearance while scrolling
  function updateHeader() {
    if (!header) return;
    header.classList.toggle("scrolled", window.scrollY > 20);
  }

  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  // Reveal elements as they enter the viewport
  if ("IntersectionObserver" in window && !reduceMotion) {
    document.documentElement.classList.add("js-ready");

    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -35px 0px"
      }
    );

    // Small stagger for neighbouring elements
    const groups = new Map();

    revealItems.forEach((element) => {
      const parent = element.parentElement;
      const index = groups.get(parent) || 0;

      groups.set(parent, index + 1);
      element.style.setProperty("--delay", `${Math.min(index * 75, 225)}ms`);

      revealObserver.observe(element);
    });
  } else {
    revealItems.forEach((element) => {
      element.classList.add("visible");
    });
  }

  // Custom cursor for desktop mouse/trackpad users
  const dot = document.querySelector(".cursor-dot");
  const ring = document.querySelector(".cursor-ring");

  if (finePointer && !reduceMotion && dot && ring) {
    document.body.classList.add("custom-cursor");

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;
    let animationFrame = 0;

    function moveCursor(event) {
      mouseX = event.clientX;
      mouseY = event.clientY;

      dot.style.left = `${mouseX}px`;
      dot.style.top = `${mouseY}px`;
    }

    function animateRing() {
      ringX += (mouseX - ringX) * 0.16;
      ringY += (mouseY - ringY) * 0.16;

      ring.style.left = `${ringX}px`;
      ring.style.top = `${ringY}px`;

      animationFrame = window.requestAnimationFrame(animateRing);
    }

    window.addEventListener("pointermove", moveCursor, {
      passive: true
    });

    animationFrame = window.requestAnimationFrame(animateRing);

    // Make the ring expand over interactive elements
    const interactiveElements = document.querySelectorAll(
      "a, button, [role='button']"
    );

    interactiveElements.forEach((element) => {
      element.addEventListener("pointerenter", () => {
        ring.classList.add("cursor-hover");
      });

      element.addEventListener("pointerleave", () => {
        ring.classList.remove("cursor-hover");
      });
    });

    // Hide the cursor when the pointer leaves the browser window
    document.addEventListener("pointerleave", () => {
      dot.style.opacity = "0";
      ring.style.opacity = "0";
    });

    document.addEventListener("pointerenter", () => {
      dot.style.opacity = "";
      ring.style.opacity = "";
    });

    // Avoid a needless animation loop if the page is hidden
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        window.cancelAnimationFrame(animationFrame);
      } else {
        animationFrame = window.requestAnimationFrame(animateRing);
      }
    });
  }
})();
