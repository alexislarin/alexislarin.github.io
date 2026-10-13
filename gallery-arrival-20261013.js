(() => {
  const arrivalClass = "gallery-media-arriving";

  function mediaIn(track) {
    return Array.from(track.querySelectorAll("img, video"));
  }

  function activeIndex(track) {
    return mediaIn(track).findIndex((media) => media.classList.contains("active"));
  }

  function playArrival(media, direction) {
    media.classList.remove(arrivalClass, "from-left", "from-right", "from-top", "from-bottom");
    void media.offsetWidth;
    media.classList.add(arrivalClass, direction);
    media.addEventListener(
      "animationend",
      () => media.classList.remove(arrivalClass, "from-left", "from-right", "from-top", "from-bottom"),
      { once: true },
    );
  }

  function observeTrack(track) {
    let previousIndex = activeIndex(track);

    new MutationObserver(() => {
      const nextIndex = activeIndex(track);
      if (nextIndex < 0 || nextIndex === previousIndex) return;

      const direction = nextIndex < previousIndex ? "from-left" : "from-right";
      playArrival(mediaIn(track)[nextIndex], direction);
      previousIndex = nextIndex;
    }).observe(track, { attributes: true, attributeFilter: ["class"], subtree: true });
  }

  function copyPosition(copy) {
    if (copy.classList.contains("current")) return "current";
    if (copy.classList.contains("next")) return "next";
    if (copy.classList.contains("previous")) return "previous";
    return "other";
  }

  function observeCopy(copy) {
    let previousPosition = copyPosition(copy);

    new MutationObserver(() => {
      const nextPosition = copyPosition(copy);
      if (nextPosition === "current" && previousPosition !== "current") {
        const direction = previousPosition === "next" ? "from-bottom" : previousPosition === "previous" ? "from-top" : null;
        const title = copy.querySelector(".flying-title");
        if (title && direction) playArrival(title, direction);
      }
      previousPosition = nextPosition;
    }).observe(copy, { attributes: true, attributeFilter: ["class"] });
  }

  function attachMotionTargets() {
    const tracks = Array.from(document.querySelectorAll(".gallery-track")).filter(
      (track) => !track.dataset.galleryArrivalObserved,
    );
    tracks.forEach((track) => {
      track.dataset.galleryArrivalObserved = "true";
      observeTrack(track);
    });
    const copies = Array.from(document.querySelectorAll(".flying-copy")).filter(
      (copy) => !copy.dataset.titleArrivalObserved,
    );
    copies.forEach((copy) => {
      copy.dataset.titleArrivalObserved = "true";
      observeCopy(copy);
    });
    return tracks.length > 0 || copies.length > 0;
  }

  function start() {
    if (attachMotionTargets()) return;
    const rootObserver = new MutationObserver(() => {
      if (attachMotionTargets()) rootObserver.disconnect();
    });
    rootObserver.observe(document.documentElement, { childList: true, subtree: true });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true });
  else start();
})();
