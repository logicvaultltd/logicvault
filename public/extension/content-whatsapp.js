(function injectWhatsAppOverlay() {
  const ICON_CLASS = "logic-vault-whatsapp-overlay";

  const addOverlays = () => {
    document.querySelectorAll("a[href*='.pdf'], div[role='button'][data-testid*='document']").forEach((node) => {
      const host = node.parentElement ?? node;

      if (host.querySelector(`.${ICON_CLASS}`)) {
        return;
      }

      const button = document.createElement("button");
      button.className = ICON_CLASS;
      button.textContent = "V";
      button.style.position = "absolute";
      button.style.top = "8px";
      button.style.right = "8px";
      button.style.width = "28px";
      button.style.height = "28px";
      button.style.borderRadius = "999px";
      button.style.border = "0";
      button.style.background = "#326295";
      button.style.color = "#ffffff";
      button.style.cursor = "pointer";

      button.addEventListener("click", () => {
        const source =
          node instanceof HTMLAnchorElement ? node.href : window.location.href;
        const url = new URL("https://logivault.org/api/convert");
        url.searchParams.set("source", source);
        window.open(url.toString(), "_blank", "noopener,noreferrer");
      });

      host.style.position = "relative";
      host.appendChild(button);
    });
  };

  setInterval(addOverlays, 3000);
})();
