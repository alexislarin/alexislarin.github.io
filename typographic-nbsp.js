(() => {
  const shortWordFollowedBySpace = /(^|[^\p{L}\p{N}])([\p{L}\p{N}]{1,3}) (?=[\p{L}\p{N}])/gu;
  const excludedParents = new Set(["CODE", "NOSCRIPT", "PRE", "SCRIPT", "STYLE", "TEXTAREA"]);

  const formatTextNode = (node) => {
    if (!node.parentElement || excludedParents.has(node.parentElement.tagName)) return;

    const formatted = node.nodeValue.replace(
      shortWordFollowedBySpace,
      "$1$2\u00a0",
    );

    if (formatted !== node.nodeValue) node.nodeValue = formatted;
  };

  const formatVisibleText = () => {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let node;

    while ((node = walker.nextNode())) formatTextNode(node);
  };

  let pending = false;
  const scheduleFormatting = () => {
    if (pending) return;
    pending = true;
    requestAnimationFrame(() => {
      pending = false;
      formatVisibleText();
    });
  };

  scheduleFormatting();
  new MutationObserver(scheduleFormatting).observe(document.body, {
    childList: true,
    characterData: true,
    subtree: true,
  });
})();
