const TOAST_ICONS = { success: "✅", danger: "🗑️", info: "ℹ️" };
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
