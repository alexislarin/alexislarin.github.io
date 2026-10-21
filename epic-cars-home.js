(() => {
  const addEpicCarsLink = () => {
    const portfolio = document.querySelector(".portfolio");
    if (!portfolio || portfolio.querySelector(".pet-projects-home")) return;

    const project = document.createElement("aside");
    project.className = "pet-projects-home";
    project.innerHTML = `
      <a class="pet-project" href="https://alexislarin.com/trip/" target="_blank" rel="noreferrer" aria-label="Open Fancy a Trip in a new tab">
        <span class="pet-project-copy">Pet project: experimenting with shadcn styling across code and Figma, using AI</span>
        <span class="pet-project-preview"><img src="./assets/fancy-a-trip-previewoptimised.png" alt="Fancy a Trip interface" /></span>
      </a>
      <a class="pet-project" href="https://alexislarin.com/epic-cars/" target="_blank" rel="noreferrer" aria-label="Open Epic Cars in a new tab">
        <span class="pet-project-copy">Another one: just for fun vibe-coding — gallery of epic cars with a mini-game</span>
        <span class="pet-project-preview"><img src="./assets/epic-cars-previewoptimised.png" alt="Epic Cars gallery and mini-game" /></span>
      </a>
    `;
    portfolio.append(project);

  };

  const mount = () => {
    if (!document.querySelector(".portfolio")) {
      requestAnimationFrame(mount);
      return;
    }
    addEpicCarsLink();
  };

  document.addEventListener("DOMContentLoaded", () => requestAnimationFrame(mount));

  window.addEventListener("wheel", (event) => {
    if (event.deltaY <= 0) return;

    const lastTitle = document.querySelectorAll(".flying-copy.current .flying-title");
    const isLastSlide = [...lastTitle].some((title) => title.textContent === "Track-mode HMI concept");
    const project = document.querySelector(".pet-projects-home");
    if (!isLastSlide || !project) return;

    project.classList.add("is-returning");
    requestAnimationFrame(() => {
      requestAnimationFrame(() => project.classList.add("is-arriving"));
    });
    window.setTimeout(() => project.classList.remove("is-returning", "is-arriving"), 550);
  }, { passive: true });
})();
