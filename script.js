const menuToggle = document.querySelector(".menu-toggle");
const siteNav = document.querySelector(".site-nav");
const projectGrid = document.querySelector(".project-grid");
const projectControls = document.querySelectorAll(".project-controls button");
const scrollCue = document.querySelector(".scroll-cue");
const pageHero = document.querySelector(".hero, .project-detail-hero, .projects-hero");
const nextSection = pageHero?.nextElementSibling;
const revealSections = document.querySelectorAll("main > section:not(.hero):not(.project-detail-hero)");
const showcaseCards = document.querySelectorAll(".showcase-card");
const personCards = document.querySelectorAll(".team-section .person-card");
const siteHeader = document.querySelector(".site-header");
const heroSection = pageHero;
const infoButton = document.querySelector(".info-logo-button");
const infoDetails = document.querySelector(".project-info-details");
const infoLabel = document.querySelector(".info-logo-label");
const siteIntro = document.querySelector("[data-site-intro]");
let lastScrollY = window.scrollY;

if (siteIntro) {
  const introSeenKey = "seaconIntroSeen";
  const hasSeenIntro = sessionStorage.getItem(introSeenKey) === "true";
  let introFinished = false;

  const finishIntro = () => {
    if (introFinished) return;

    introFinished = true;
    siteIntro.classList.add("is-fading");
    sessionStorage.setItem(introSeenKey, "true");
    window.removeEventListener("pointerdown", finishIntro);
    window.removeEventListener("keydown", finishIntro);
    window.removeEventListener("wheel", finishIntro);
    window.removeEventListener("touchstart", finishIntro);

    window.setTimeout(() => {
      siteIntro.classList.remove("is-active");
      document.body.classList.remove("intro-active");
      siteIntro.setAttribute("aria-hidden", "true");
    }, 1380);
  };

  if (hasSeenIntro) {
    siteIntro.remove();
  } else {
    document.body.classList.add("intro-active");
    siteIntro.classList.add("is-active");
    siteIntro.setAttribute("aria-hidden", "false");

    window.addEventListener("pointerdown", finishIntro, { once: true });
    window.addEventListener("keydown", finishIntro, { once: true });
    window.addEventListener("wheel", finishIntro, { once: true });
    window.addEventListener("touchstart", finishIntro, { once: true });
  }
}

showcaseCards.forEach((card, index) => {
  const column = index % 3;
  const row = Math.floor(index / 3);
  const orderInRow = row % 2 === 0 ? column : 2 - column;
  card.style.setProperty("--project-delay", `${orderInRow * 0.14}s`);
});

const setPersonCardDelays = () => {
  const columns = window.matchMedia("(max-width: 720px)").matches ? 2 : 4;

  personCards.forEach((card, index) => {
    const column = index % columns;
    const row = Math.floor(index / columns);
    const orderInRow = row % 2 === 0 ? column : columns - 1 - column;
    card.style.setProperty("--person-delay", `${orderInRow * 0.14}s`);
  });
};

setPersonCardDelays();

menuToggle?.addEventListener("click", () => {
  const isOpen = siteNav.classList.toggle("is-open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
});

let projectCarousel = null;

if (projectGrid) {
  const originalCards = Array.from(projectGrid.querySelectorAll(".project-card"));

  if (originalCards.length) {
    const beforeCards = originalCards.map((card) => card.cloneNode(true));
    const afterCards = originalCards.map((card) => card.cloneNode(true));
    const beforeFragment = document.createDocumentFragment();
    const afterFragment = document.createDocumentFragment();
    let carouselIsAnimating = false;

    beforeCards.forEach((card) => beforeFragment.appendChild(card));
    afterCards.forEach((card) => afterFragment.appendChild(card));
    projectGrid.insertBefore(beforeFragment, projectGrid.firstChild);
    projectGrid.appendChild(afterFragment);

    const getCarouselMetrics = () => {
      const cards = Array.from(projectGrid.querySelectorAll(".project-card"));
      const originalStartCard = cards[originalCards.length];
      const originalEndCard = cards[originalCards.length * 2];
      const firstCard = cards[0];
      const gridStyle = window.getComputedStyle(projectGrid);
      const gap = parseFloat(gridStyle.columnGap || gridStyle.gap) || 0;
      const cardStep = firstCard
        ? firstCard.getBoundingClientRect().width + gap
        : Math.max(projectGrid.clientWidth * 0.7, 260);

      return {
        cardStep,
        originalStart: originalStartCard?.offsetLeft || 0,
        originalEnd: originalEndCard?.offsetLeft || projectGrid.scrollWidth,
      };
    };

    const normalizeCarouselPosition = () => {
      const { originalStart, originalEnd } = getCarouselMetrics();
      const setWidth = originalEnd - originalStart;
      let newScrollLeft = null;

      if (projectGrid.scrollLeft < originalStart) {
        newScrollLeft = projectGrid.scrollLeft + setWidth;
      }

      if (projectGrid.scrollLeft >= originalEnd) {
        newScrollLeft = projectGrid.scrollLeft - setWidth;
      }

      if (newScrollLeft !== null) {
        const previousScrollBehavior = projectGrid.style.scrollBehavior;
        const previousScrollSnapType = projectGrid.style.scrollSnapType;

        projectGrid.style.scrollBehavior = "auto";
        projectGrid.style.scrollSnapType = "none";
        projectGrid.scrollLeft = newScrollLeft;

        window.requestAnimationFrame(() => {
          projectGrid.style.scrollBehavior = previousScrollBehavior;
          projectGrid.style.scrollSnapType = previousScrollSnapType;
        });
      }
    };

    projectCarousel = {
      getCarouselMetrics,
      normalizeCarouselPosition,
      setAnimating(isAnimating) {
        carouselIsAnimating = isAnimating;
      },
    };

    window.requestAnimationFrame(() => {
      projectGrid.style.scrollBehavior = "auto";
      projectGrid.scrollLeft = getCarouselMetrics().originalStart;
      projectGrid.style.scrollBehavior = "";
    });

    let carouselScrollTimer;
    projectGrid.addEventListener(
      "scroll",
      () => {
        if (carouselIsAnimating) return;

        window.clearTimeout(carouselScrollTimer);
        carouselScrollTimer = window.setTimeout(normalizeCarouselPosition, 260);
      },
      { passive: true }
    );

    window.addEventListener("resize", () => {
      projectGrid.style.scrollBehavior = "auto";
      projectGrid.scrollLeft = getCarouselMetrics().originalStart;
      projectGrid.style.scrollBehavior = "";
    });
  }
}

projectControls.forEach((button, index) => {
  button.addEventListener("click", () => {
    const isPrevious = index === 0;
    const amount = projectCarousel
      ? projectCarousel.getCarouselMetrics().cardStep
      : Math.max(projectGrid.clientWidth * 0.7, 260);

    projectGrid.scrollBy({
      left: isPrevious ? -amount : amount,
      behavior: "smooth",
    });

    projectCarousel?.setAnimating(true);

    window.setTimeout(() => {
      projectCarousel?.normalizeCarouselPosition();
      projectCarousel?.setAnimating(false);
    }, 720);
  });
});

if (scrollCue && nextSection) {
  window.setTimeout(() => {
    scrollCue.classList.add("is-visible");
  }, 2600);

  scrollCue.addEventListener("click", () => {
    scrollCue.classList.add("is-descending");
    nextSection.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("section-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.16,
      rootMargin: "0px 0px -8% 0px",
    }
  );

  revealSections.forEach((section) => revealObserver.observe(section));
} else {
  revealSections.forEach((section) => section.classList.add("section-visible"));
}

if ("IntersectionObserver" in window && showcaseCards.length) {
  const projectObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("project-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.18,
      rootMargin: "0px 0px -10% 0px",
    }
  );

  showcaseCards.forEach((card) => projectObserver.observe(card));
} else {
  showcaseCards.forEach((card) => card.classList.add("project-visible"));
}

if ("IntersectionObserver" in window && personCards.length) {
  const personObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("person-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.18,
      rootMargin: "0px 0px -10% 0px",
    }
  );

  personCards.forEach((card) => personObserver.observe(card));
} else {
  personCards.forEach((card) => card.classList.add("person-visible"));
}

if (
  siteHeader &&
  heroSection &&
  !document.body.classList.contains("projects-page") &&
  !document.body.classList.contains("contact-page")
) {
  let wasPastHero = false;
  let hasActivatedScrollHeader = false;

  const updateScrollHeader = () => {
    const currentScrollY = window.scrollY;
    const heroExitPoint = Math.max(heroSection.offsetHeight - siteHeader.offsetHeight, 120);
    const hasLeftHero = currentScrollY > heroExitPoint;
    const isScrollingUp = currentScrollY < lastScrollY - 4;
    const isScrollingDown = currentScrollY > lastScrollY + 4;

    if (!hasLeftHero) {
      siteHeader.classList.remove("is-scroll-nav", "is-visible");
      hasActivatedScrollHeader = false;
    } else {
      if (isScrollingUp) {
        if (!siteHeader.classList.contains("is-scroll-nav")) {
          siteHeader.classList.add("is-scroll-nav");
          siteHeader.offsetHeight;
        }

        hasActivatedScrollHeader = true;
        window.requestAnimationFrame(() => {
          siteHeader.classList.add("is-visible");
        });
      }

      if (isScrollingDown && hasActivatedScrollHeader && !siteNav.classList.contains("is-open")) {
        siteHeader.classList.remove("is-visible");
      }
    }

    wasPastHero = hasLeftHero;
    lastScrollY = Math.max(currentScrollY, 0);
  };

  window.addEventListener("scroll", updateScrollHeader, { passive: true });
  updateScrollHeader();
}

if (infoButton && infoDetails) {
  infoButton.addEventListener("click", () => {
    if (
      infoButton.classList.contains("is-opening") ||
      infoButton.classList.contains("is-closing")
    ) {
      return;
    }

    const isOpen = infoButton.classList.contains("is-open");

    if (isOpen) {
      infoButton.setAttribute("aria-expanded", "false");
      infoButton.classList.add("is-closing");
      infoDetails.classList.remove("is-visible");
      infoDetails.setAttribute("aria-hidden", "true");
      if (infoLabel) infoLabel.textContent = "Info";

      window.setTimeout(() => {
        infoButton.classList.remove("is-open", "is-closing");
      }, 920);

      return;
    }

    infoButton.classList.add("is-opening");
    infoButton.setAttribute("aria-expanded", "true");
    infoDetails.classList.add("is-visible");
    infoDetails.setAttribute("aria-hidden", "false");
    if (infoLabel) infoLabel.textContent = "Hide";

    window.setTimeout(() => {
      infoButton.classList.add("is-open");
      infoButton.classList.remove("is-opening");
    }, 920);
  });
}
