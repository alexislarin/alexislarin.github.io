(() => {
  const addEpicCarsLink = () => {
    const portfolio = document.querySelector(".portfolio");
    if (!portfolio || portfolio.querySelector(".epic-cars-home")) return;

    const project = document.createElement("aside");
    project.className = "epic-cars-home";
    project.innerHTML = `
      <span class="epic-cars-copy">Pet-project:<br>gallery of epic cars<br>with a mini-game</span>
      <a class="epic-cars-preview" href="https://alexislarin.com/epic-cars/" target="_blank" rel="noreferrer" aria-label="Open Epic Cars in a new tab">
        <img src="./assets/epic-cars-preview.png" alt="Epic Cars gallery and mini-game" />
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
    const project = document.querySelector(".epic-cars-home");
    if (!isLastSlide || !project) return;

    project.classList.add("is-returning");
    requestAnimationFrame(() => {
      requestAnimationFrame(() => project.classList.add("is-arriving"));
    });
    window.setTimeout(() => project.classList.remove("is-returning", "is-arriving"), 550);
  }, { passive: true });
})();
