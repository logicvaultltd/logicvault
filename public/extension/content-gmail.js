(function injectLogicVaultButtons() {
  const BUTTON_CLASS = "logic-vault-gmail-button";

  const addButtons = () => {
    document.querySelectorAll("a[href*='.pdf']").forEach((anchor) => {
      if (anchor.parentElement?.querySelector(`.${BUTTON_CLASS}`)) {
        return;
      }

      const button = document.createElement("button");
      button.className = BUTTON_CLASS;
      button.textContent = "Convert with Logic Vault";
      button.style.marginLeft = "8px";
      button.style.padding = "6px 10px";
      button.style.borderRadius = "999px";
      button.style.border = "1px solid #e5e7eb";
      button.style.background = "#ffffff";
      button.style.cursor = "pointer";

      button.addEventListener("click", () => {
        const url = new URL("https://logivault.org/api/convert");
        url.searchParams.set("source", anchor.href);
        window.open(url.toString(), "_blank", "noopener,noreferrer");
      });

      anchor.parentElement?.appendChild(button);
    });
  };

  setInterval(addButtons, 3000);
})();
