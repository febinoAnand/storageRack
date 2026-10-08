const VALID_USERNAME = "admin";
const DEFAULT_PASSWORD = "admin123";

function getCurrentPassword() {
  return localStorage.getItem("srPassword") || DEFAULT_PASSWORD;
}

const loginForm = document.getElementById("loginForm");
const errorMsg = document.getElementById("errorMsg");

// If already logged in, skip straight to dashboard
if (sessionStorage.getItem("srLoggedIn") === "true") {
  window.location.href = "dashboard.html";
}

loginForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;

  if (username === VALID_USERNAME && password === getCurrentPassword()) {
    sessionStorage.setItem("srLoggedIn", "true");
    sessionStorage.setItem("srUser", username);
    setFlashMessage(`Welcome back, ${username}!`, "success");
    window.location.href = "dashboard.html";
  } else {
    errorMsg.hidden = false;
    const card = document.querySelector(".login-card");
    card.classList.remove("shake");
    void card.offsetWidth;
    card.classList.add("shake");
  }
});

// ---------- Forgot password ----------
// Two-step flow: request a code (emailed to the account's address), then enter
// that code plus a new password. There's no real backend/email here, so the
// "sent" code is revealed in the UI — but the step still requires proving you
// got the code, rather than letting anyone change the password outright.
const ADMIN_EMAIL = "admin@storage.app";
let pendingResetCode = null;
let pendingResetUsername = null;

const forgotModalOverlay = document.getElementById("forgotModalOverlay");
const forgotRequestForm = document.getElementById("forgotRequestForm");
const forgotRequestError = document.getElementById("forgotRequestError");
const forgotResetForm = document.getElementById("forgotResetForm");
const forgotResetError = document.getElementById("forgotResetError");
const forgotSentHint = document.getElementById("forgotSentHint");

function maskEmail(email) {
  const parts = email.split("@");
  const visible = parts[0].slice(0, 2);
  return visible + "*".repeat(Math.max(1, parts[0].length - 2)) + "@" + parts[1];
}

function showForgotStep(step) {
  forgotRequestForm.hidden = step !== 1;
  forgotResetForm.hidden = step !== 2;
}

function openForgotModal() {
  pendingResetCode = null;
  pendingResetUsername = null;
  forgotRequestError.hidden = true;
  forgotResetError.hidden = true;
  forgotRequestForm.reset();
  forgotResetForm.reset();
  document.getElementById("forgotUsername").value = document.getElementById("username").value.trim() || "admin";
  showForgotStep(1);
  forgotModalOverlay.hidden = false;
}

function closeForgotModal() {
  forgotModalOverlay.hidden = true;
}

document.getElementById("forgotLink").addEventListener("click", function (e) {
  e.preventDefault();
  openForgotModal();
});
document.getElementById("forgotModalClose").addEventListener("click", closeForgotModal);
document.getElementById("forgotCancel").addEventListener("click", closeForgotModal);
document.getElementById("forgotBack").addEventListener("click", function () { showForgotStep(1); });
forgotModalOverlay.addEventListener("click", function (e) {
  if (e.target === forgotModalOverlay) closeForgotModal();
});

forgotRequestForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const username = document.getElementById("forgotUsername").value.trim();

  if (username !== VALID_USERNAME) {
    forgotRequestError.textContent = `No account found for "${username}".`;
    forgotRequestError.hidden = false;
    return;
  }

  forgotRequestError.hidden = true;
  pendingResetUsername = username;
  pendingResetCode = String(Math.floor(100000 + Math.random() * 900000));
  forgotSentHint.innerHTML =
    `We sent a 6-digit code to <strong>${maskEmail(ADMIN_EMAIL)}</strong>. ` +
    `(Demo mode — no real email is sent, so your code is shown here: <strong>${pendingResetCode}</strong>.)`;
  showToast(`Verification code sent to ${maskEmail(ADMIN_EMAIL)}`, "success");
  showForgotStep(2);
});

forgotResetForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const code = document.getElementById("forgotCode").value.trim();
  const newPassword = document.getElementById("forgotNewPassword").value;
  const confirmPassword = document.getElementById("forgotConfirmPassword").value;

  if (!pendingResetCode || code !== pendingResetCode) {
    forgotResetError.textContent = "That code isn't correct. Check the code and try again.";
    forgotResetError.hidden = false;
    return;
  }
  if (newPassword.length < 6) {
    forgotResetError.textContent = "New password must be at least 6 characters.";
    forgotResetError.hidden = false;
    return;
  }
  if (newPassword !== confirmPassword) {
    forgotResetError.textContent = "Passwords don't match.";
    forgotResetError.hidden = false;
    return;
  }

  localStorage.setItem("srPassword", newPassword);
  const resetUsername = pendingResetUsername;
  pendingResetCode = null;
  pendingResetUsername = null;
  closeForgotModal();
  document.getElementById("username").value = resetUsername;
  document.getElementById("password").value = "";
  errorMsg.hidden = true;
  showToast("Password updated. Sign in with your new password.", "success");
});

// ---------- Icons (self-contained — this page doesn't load common.js) ----------
function loginSvgIcon(path) {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${path}</svg>`;
}

const LOGIN_ICON_BOX = loginSvgIcon('<path d="M21 8l-9-5-9 5 9 5 9-5z"></path><path d="M3 8v8l9 5 9-5V8"></path><path d="M12 13v8"></path>');
const LOGIN_ICON_SUN = loginSvgIcon('<circle cx="12" cy="12" r="4"></circle><path d="M12 2v2M12 20v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2 12h2M20 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"></path>');
const LOGIN_ICON_MOON = loginSvgIcon('<path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5z"></path>');

document.querySelector(".brand-icon").innerHTML = LOGIN_ICON_BOX;

// ---------- Theme toggle ----------
const themeFab = document.getElementById("themeFab");

function syncThemeFab() {
  const isDark = document.documentElement.getAttribute("data-theme") === "dark";
  themeFab.innerHTML = isDark ? LOGIN_ICON_SUN : LOGIN_ICON_MOON;
}

themeFab.addEventListener("click", function () {
  const isDark = document.documentElement.getAttribute("data-theme") === "dark";
  const next = isDark ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem("srTheme", next);
  syncThemeFab();
});

syncThemeFab();
