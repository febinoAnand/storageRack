function toastSvgIcon(path) {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${path}</svg>`;
}

const TOAST_ICONS = {
  success: toastSvgIcon('<circle cx="12" cy="12" r="9"></circle><path d="M8 12.5l2.5 2.5L16 9.5"></path>'),
  danger: toastSvgIcon('<polyline points="3 6 5 6 21 6"></polyline><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path><path d="M10 11v6M14 11v6"></path><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"></path>'),
  info: toastSvgIcon('<circle cx="12" cy="12" r="9"></circle><line x1="12" y1="11" x2="12" y2="16"></line><circle cx="12" cy="7.5" r="1" fill="currentColor" stroke="none"></circle>'),
};
const FLASH_KEY = "srFlashMessage";

function ensureToastContainer() {
  let container = document.getElementById("toastContainer");
  if (!container) {
    container = document.createElement("div");
    container.id = "toastContainer";
    document.body.appendChild(container);
  }
  return container;
}

function showToast(message, type) {
  type = type || "info";
  const container = ensureToastContainer();

  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${TOAST_ICONS[type] || TOAST_ICONS.info}</span>
    <span class="toast-msg"></span>
    <button class="toast-close" aria-label="Dismiss">&times;</button>
  `;
  toast.querySelector(".toast-msg").textContent = message;

  function dismiss() {
    toast.classList.add("leaving");
    toast.addEventListener("animationend", function () { toast.remove(); }, { once: true });
  }

  toast.querySelector(".toast-close").addEventListener("click", dismiss);
  container.appendChild(toast);

  setTimeout(dismiss, 3200);
}

function setFlashMessage(message, type) {
  sessionStorage.setItem(FLASH_KEY, JSON.stringify({ message: message, type: type }));
}

function consumeFlashMessage() {
  const raw = sessionStorage.getItem(FLASH_KEY);
  if (!raw) return;
  sessionStorage.removeItem(FLASH_KEY);
  try {
    const flash = JSON.parse(raw);
    showToast(flash.message, flash.type);
  } catch (e) { /* ignore malformed flash */ }
}

document.addEventListener("DOMContentLoaded", consumeFlashMessage);
