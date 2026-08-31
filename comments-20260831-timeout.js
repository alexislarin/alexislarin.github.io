(function () {
  if (new URLSearchParams(window.location.search).has("nocomments")) return;

  const COMMENTS = {
    "SODA.Auto / Requirements & Architecture": {
      1: [
        {
          id: "rms-feature-architect-goal",
          anchor: { x: 0.31, y: 0.124 },
          width: 400,
          text:
            "The goal was to support use-case for Feature Architect — to decompose a Feature down to Systems level and to figure out interactions between the Systems involved.",
        },
        {
          id: "rms-requirement-links",
          anchor: { x: 0.338, y: 0.723 },
          width: 390,
          text:
            "So two levels of requirements with links between them alongside with Systems involved and how they are connected — should be at hand.",
        },
        {
          id: "rms-diagram-compression",
          anchor: { x: 0.462, y: 0.405 },
          width: 440,
          text:
            "The challenge was to put the diagram (which could be pretty complex, see the next screen) in a narrow space. After chatting with developers, we came up with some solutions to shrink it but leave it still useful as an overview: auto-layout, grouping multiple connections, converting titles to abbreviations (lucky that automotive engineers are fans of abbreviations).",
        },
      ],
    },
    "Etoso / Data check": {
      0: [
        {
          id: "data-check-todo-automation",
          anchor: { x: 0.26, y: 0.185 },
          width: 500,
          text:
            "Initial idea was that our senior expert once a week takes a pack of companies to check and assign them to experts. After the interview with senior experts I've figured out that all the experts got the same skills, all the companies were randomly correct, and the list of companies to check could be automatically retrieved from the database with some filters and sorting applied. So I suggested automating the assignment totally, expert got just the current or next Todo on his dashboard — to get rid of assigning flow.",
        },
      ],
      1: [
        {
          id: "data-check-table-cell",
          anchor: { x: 0.421, y: 0.297 },
          width: 410,
          text:
            "Table with all the data to check. Green cells are already confirmed by the expert. Company could be sent to senior expert review when every cell is confirmed.",
        },
      ],
      2: [
        {
          id: "data-check-data-point",
          anchor: { x: 0.083, y: 0.352 },
          width: 380,
          text:
            "Data point to check — with extracted and raw value (if it was converted from custom unit of measure).",
        },
        {
          id: "data-check-report-highlight",
          anchor: { x: 0.809, y: 0.466 },
          width: 390,
          text: "Report page and exact extracted number on it is highlighted for the expert.",
        },
        {
          id: "data-check-next-data-point",
          anchor: { x: 0.224, y: 0.128 },
          width: 390,
          text: "Navigate to next data point that needs check without getting back to the table.",
        },
      ],
    },
  };

  const ACTIVE_CLASS = "comment-expanded";
  const CLOSING_CLASS = "comment-closing";
  const VISIBLE_CLASS = "comment-visible";
  const OPEN_CLASS = "comment-open";
  let openButton = null;
  let visibilityTimer = 0;
  let lastLayer = null;

  function scheduleHideCommentPips() {
    window.clearTimeout(visibilityTimer);
    if (!openButton) visibilityTimer = window.setTimeout(hideCommentPips, 1000);
  }

  function getActiveImageIndex(section) {
    const media = Array.from(section.querySelectorAll(".gallery-track img, .gallery-track video"));
    const activeIndex = media.findIndex((item) => item.classList.contains("active"));
    return activeIndex >= 0 ? activeIndex : -1;
  }

  function finishClosing(button, bubble, layer) {
    bubble.hidden = true;
    bubble.classList.remove(CLOSING_CLASS);
    button.classList.remove(ACTIVE_CLASS);
    if (layer && (!openButton || !layer.contains(openButton))) layer.classList.remove(OPEN_CLASS);
    scheduleHideCommentPips();
  }

  function clearOpenComment(animate = true) {
    if (!openButton) return;
    const button = openButton;
    button.setAttribute("aria-expanded", "false");
    const bubble = document.getElementById(button.getAttribute("aria-controls"));
    const layer = button.closest(".comment-layer");
    openButton = null;

    if (!bubble || bubble.hidden || !animate) {
      if (bubble) {
        bubble.hidden = true;
        bubble.classList.remove(CLOSING_CLASS);
      }
      button.classList.remove(ACTIVE_CLASS);
      if (layer) layer.classList.remove(OPEN_CLASS);
      scheduleHideCommentPips();
      return;
    }

    bubble.classList.add(CLOSING_CLASS);
    let didFinish = false;
    const closeAfterAnimation = () => {
      if (didFinish || !bubble.classList.contains(CLOSING_CLASS)) return;
      didFinish = true;
      finishClosing(button, bubble, layer);
    };
    bubble.addEventListener("animationend", closeAfterAnimation, { once: true });
    window.setTimeout(closeAfterAnimation, 220);
  }

  function openComment(button, bubble, layer) {
    if (openButton === button) return;
    clearOpenComment();
    openButton = button;
    button.classList.add(ACTIVE_CLASS);
    button.setAttribute("aria-expanded", "true");
    bubble.classList.remove(CLOSING_CLASS);
    bubble.hidden = false;
    layer.classList.add(OPEN_CLASS, VISIBLE_CLASS);
    window.clearTimeout(visibilityTimer);
  }

  function hideCommentPips() {
    if (openButton) return;
    document
      .querySelectorAll(".comment-layer")
      .forEach((layer) => layer.classList.remove(VISIBLE_CLASS));
  }

  function showCommentPips() {
    const visibleLayer = getCurrentLayer();
    if (!visibleLayer) return;
    document
      .querySelectorAll(".comment-layer")
      .forEach((layer) => layer.classList.toggle(VISIBLE_CLASS, layer === visibleLayer));
    scheduleHideCommentPips();
  }

  function getCurrentLayer() {
    const section = document.querySelector(".project.current.gallery-open");
    if (!section) return null;
    const activeIndex = getActiveImageIndex(section);
    return section.querySelector(`.comment-layer[data-image-index="${activeIndex}"]`);
  }

  function syncVisibleLayer() {
    const currentLayer = getCurrentLayer();
    const didLayerChange = currentLayer !== lastLayer;
    lastLayer = currentLayer;
    if (openButton && (!currentLayer || !currentLayer.contains(openButton))) clearOpenComment(false);
    document.querySelectorAll(".comment-layer").forEach((layer) => {
      const isCurrent = layer === currentLayer;
      if (!isCurrent) {
        layer.classList.remove(VISIBLE_CLASS, OPEN_CLASS);
        layer.querySelectorAll(".comment-pip").forEach((pip) => pip.classList.remove(ACTIVE_CLASS));
        layer.querySelectorAll(".comment-bubble").forEach((bubble) => {
          bubble.hidden = true;
          bubble.classList.remove(CLOSING_CLASS);
        });
        return;
      }

      layer.classList.toggle(OPEN_CLASS, Boolean(openButton));
      if (openButton || didLayerChange) {
        layer.classList.add(VISIBLE_CLASS);
      }
    });
    if (!currentLayer) clearOpenComment();
    if (didLayerChange) {
      if (currentLayer) scheduleHideCommentPips();
      else window.clearTimeout(visibilityTimer);
    }
  }

  function makeCommentLayer(projectTitle, imageIndex, comments) {
    const layer = document.createElement("div");
    layer.className = "comment-layer";
    layer.dataset.projectTitle = projectTitle;
    layer.dataset.imageIndex = String(imageIndex);
    layer.style.setProperty("--comment-image-index", imageIndex);
    layer.setAttribute("aria-label", "Design comments");

    comments.forEach((comment) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "comment-pip";
      button.style.setProperty("--comment-x", comment.anchor.x);
      button.style.setProperty("--comment-y", comment.anchor.y);
      button.setAttribute("aria-label", "Open design comment");
      button.setAttribute("aria-expanded", "false");
      button.setAttribute("aria-controls", `comment-${comment.id}`);

      const bubble = document.createElement("div");
      bubble.className = "comment-bubble";
      bubble.id = `comment-${comment.id}`;
      bubble.hidden = true;
      bubble.style.setProperty("--comment-x", comment.anchor.x);
      bubble.style.setProperty("--comment-y", comment.anchor.y);
      bubble.style.setProperty("--comment-width", `${comment.width}px`);
      bubble.textContent = comment.text;

      button.addEventListener("mouseenter", () => {
        openComment(button, bubble, layer);
      });

      button.addEventListener("focus", () => {
        openComment(button, bubble, layer);
      });

      button.addEventListener("click", (event) => {
        event.stopPropagation();
      });

      bubble.addEventListener("mouseleave", () => {
        if (openButton === button) clearOpenComment();
      });

      layer.append(button, bubble);
    });

    return layer;
  }

  function mountComments() {
    document.querySelectorAll(".project").forEach((section) => {
      if (section.dataset.commentsMounted) return;
      const title = section.getAttribute("aria-label");
      const projectComments = COMMENTS[title];
      if (!projectComments) return;

      const track = section.querySelector(".gallery-track");
      if (!track) return;

      Object.entries(projectComments).forEach(([imageIndex, comments]) => {
        track.appendChild(makeCommentLayer(title, imageIndex, comments));
      });
      section.dataset.commentsMounted = "true";
    });
    syncVisibleLayer();
  }

  function start() {
    const root = document.getElementById("root");
    if (!root) return;

    function syncLoop() {
      mountComments();
      syncVisibleLayer();
      window.requestAnimationFrame(syncLoop);
    }
    syncLoop();

    document.addEventListener("click", (event) => {
      if (!(event.target instanceof Element) || !event.target.closest(".comment-layer")) {
        clearOpenComment();
      }
    });
    document.addEventListener("mousemove", showCommentPips, { passive: true });
    document.addEventListener("touchstart", showCommentPips, { passive: true });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
})();
