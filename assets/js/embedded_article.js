document.querySelectorAll("iframe[data-embedded-article]").forEach((frame) => {
  frame.addEventListener("load", () => {
    const article = frame.contentDocument;
    if (!article?.body) return;

    const resize = () => {
      frame.style.height = `${Math.max(article.documentElement.scrollHeight, article.body.scrollHeight)}px`;
    };

    new ResizeObserver(resize).observe(article.body);
    resize();

    article.addEventListener(
      "click",
      (event) => {
        const link = event.target.closest?.("a[href]");
        if (link && /^https?:$/.test(link.protocol) && new URL(link.href).origin !== window.location.origin) {
          link.target = "_blank";
          link.rel = "noopener noreferrer";
        }
      },
      true
    );
  });
});
