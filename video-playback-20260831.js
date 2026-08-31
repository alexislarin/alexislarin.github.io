(function () {
  const PLAY_DELAY = 560;
  let activeVideo = null;
  let activeSince = 0;
  let lastPlayAttemptAt = 0;

  function getVideos() {
    return Array.from(document.querySelectorAll(".gallery-track video"));
  }

  function preloadVideo(video) {
    video.preload = "auto";
    video.muted = true;
    video.defaultMuted = true;
    video.volume = 0;
    video.playsInline = true;
    video.setAttribute("muted", "");
    video.setAttribute("playsinline", "");

    if (video.dataset.preloadStarted) return;
    video.dataset.preloadStarted = "true";
    video.load();
  }

  function getTargetVideo() {
    return document.querySelector(".project.current.gallery-open .gallery-track video.active");
  }

  function pauseAndRewind(video) {
    video.pause();
    video.dataset.playBlocked = "";
    try {
      video.currentTime = 0;
    } catch (_) {
      // Metadata may not be ready on the first preload tick.
    }
  }

  function tryPlay(video, now) {
    preloadVideo(video);
    if (!video.paused) return;
    if (now - lastPlayAttemptAt < 120) return;
    lastPlayAttemptAt = now;

    const play = video.play();
    if (play && typeof play.catch === "function") {
      play
        .then(() => {
          video.dataset.playBlocked = "";
        })
        .catch(() => {
          video.dataset.playBlocked = "true";
        });
    }
  }

  function sync(now) {
    const videos = getVideos();
    videos.forEach(preloadVideo);

    const targetVideo = getTargetVideo();
    if (targetVideo !== activeVideo) {
      if (activeVideo) pauseAndRewind(activeVideo);
      activeVideo = targetVideo;
      activeSince = now;
    }

    videos.forEach((video) => {
      if (video !== activeVideo && !video.paused) pauseAndRewind(video);
    });

    if (activeVideo && now - activeSince >= PLAY_DELAY) {
      tryPlay(activeVideo, now);
    }

    window.requestAnimationFrame(sync);
  }

  function retryActiveVideo() {
    if (!activeVideo) return;
    tryPlay(activeVideo, performance.now());
  }

  function start() {
    ["pointerdown", "keydown", "wheel", "touchstart", "mousemove"].forEach((eventName) => {
      window.addEventListener(eventName, retryActiveVideo, { passive: true, capture: true });
    });
    window.requestAnimationFrame(sync);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
})();
