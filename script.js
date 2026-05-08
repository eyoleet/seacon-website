const menuToggle = document.querySelector(".menu-toggle");
const siteNav = document.querySelector(".site-nav");
const projectGrid = document.querySelector(".project-grid");
const projectControls = document.querySelectorAll(".project-controls button");

menuToggle?.addEventListener("click", () => {
  const isOpen = siteNav.classList.toggle("is-open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
});

projectControls.forEach((button, index) => {
  button.addEventListener("click", () => {
    const amount = Math.max(projectGrid.clientWidth * 0.7, 260);
    projectGrid.scrollBy({
      left: index === 0 ? -amount : amount,
      behavior: "smooth",
    });
  });
});
