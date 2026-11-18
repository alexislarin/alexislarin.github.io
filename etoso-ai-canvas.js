(() => {
  const PROJECT_ID = "etoso-ai-analytics";
  const CANVAS_FILE = "etoso-ai-5.png";
  const PANEL_FILE = "etoso-ai-5-panel.png";
  const MOMENTUM_EVENT_INTERVAL = 120;
  const MOMENTUM_OVERSHOOT = 64;
  const boundaryMomentum = new WeakMap();
  const innerScrollGestures = new WeakMap();

  function getProject() {
    return document.querySelector(`.project[data-project-id="${PROJECT_ID}"]`);
  }

  function getCanvasImage(project) {
    return project?.querySelector(`.gallery-track img[src$="${CANVAS_FILE}"]`);
  }

  function createCanvas(project, canvasImage) {
    const track = project.querySelector(".gallery-track");
    if (!track || track.querySelector(".etoso-ai-canvas")) return;

    const media = Array.from(track.querySelectorAll("img, video"));
    const mediaIndex = media.indexOf(canvasImage);
    if (mediaIndex < 0) return;

    const canvas = document.createElement("div");
    canvas.className = "etoso-ai-canvas";
    canvas.style.setProperty("--etoso-ai-index", String(mediaIndex));
    canvas.setAttribute("aria-label", "Scrollable analytics canvas");

    const background = document.createElement("div");
    background.className = "etoso-ai-canvas-background";
    const backgroundImage = document.createElement("img");
    backgroundImage.src = `./assets/${CANVAS_FILE}`;
    backgroundImage.alt = "Etoso AI analytics report";
    background.append(backgroundImage);

    const panel = document.createElement("img");
    panel.className = "etoso-ai-canvas-panel";
    panel.src = `./assets/${PANEL_FILE}`;
    panel.alt = "Sources for analysis panel";

    canvas.append(background, panel);
    track.append(canvas);
  }

  function syncCanvas() {
    const project = getProject();
    const canvasImage = getCanvasImage(project);
    if (!project || !canvasImage) return;
    createCanvas(project, canvasImage);

    const canvas = project.querySelector(".etoso-ai-canvas");
    const isGalleryVisible =
      project.classList.contains("current") && project.classList.contains("gallery-open");
    const previousImage = canvasImage.previousElementSibling;

    canvas?.classList.toggle("is-active", isGalleryVisible && canvasImage.classList.contains("active"));
    canvas?.classList.toggle("is-preview", isGalleryVisible && previousImage?.classList.contains("active"));
    ["gallery-media-arriving", "from-left", "from-right"].forEach((className) => {
      canvas?.classList.toggle(className, canvasImage.classList.contains(className));
    });
  }

  function handleCanvasWheel(event) {
    const canvas = event.target.closest(".etoso-ai-canvas.is-active");
    if (!canvas || Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;

    const background = canvas.querySelector(".etoso-ai-canvas-background");
    const maximumScroll = background.scrollHeight - background.clientHeight;
    const direction = Math.sign(event.deltaY);
    const magnitude = Math.abs(event.deltaY);
    const canScroll =
      (event.deltaY < 0 && background.scrollTop > 0) ||
      (event.deltaY > 0 && background.scrollTop < maximumScroll);

    if (!canScroll) {
      const momentum = boundaryMomentum.get(canvas);
      const isMomentumTail =
        momentum &&
        momentum.direction === direction &&
        event.timeStamp - momentum.lastEventAt < MOMENTUM_EVENT_INTERVAL &&
        magnitude <= momentum.lastMagnitude;

      if (!isMomentumTail) {
        boundaryMomentum.delete(canvas);
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      momentum.lastEventAt = event.timeStamp;
      momentum.lastMagnitude = magnitude;
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    const distanceToBoundary = direction < 0 ? background.scrollTop : maximumScroll - background.scrollTop;
    const nextScrollTop = Math.max(0, Math.min(maximumScroll, background.scrollTop + event.deltaY));
    background.scrollTop = nextScrollTop;

    const previousGesture = innerScrollGestures.get(canvas);
    const rapidEventCount =
      previousGesture &&
      previousGesture.direction === direction &&
      event.timeStamp - previousGesture.lastEventAt < MOMENTUM_EVENT_INTERVAL
        ? previousGesture.rapidEventCount + 1
        : 1;
    innerScrollGestures.set(canvas, { direction, lastEventAt: event.timeStamp, rapidEventCount });

    const reachedBoundary =
      (direction < 0 && nextScrollTop <= 0) ||
      (direction > 0 && nextScrollTop >= maximumScroll);
    const hasStrongOvershoot = magnitude - distanceToBoundary > MOMENTUM_OVERSHOOT;

    if (reachedBoundary && (hasStrongOvershoot || rapidEventCount > 1)) {
      boundaryMomentum.set(canvas, { direction, lastEventAt: event.timeStamp, lastMagnitude: magnitude });
    } else {
      boundaryMomentum.delete(canvas);
    }
  }

  function start() {
    const root = document.getElementById("root");
    if (!root) return;

    const observer = new MutationObserver(syncCanvas);
    observer.observe(root, { attributes: true, attributeFilter: ["class"], childList: true, subtree: true });
    window.addEventListener("wheel", handleCanvasWheel, { capture: true, passive: false });
    syncCanvas();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
})();
