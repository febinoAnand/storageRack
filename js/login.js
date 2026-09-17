const VALID_USERNAME = "admin";
const VALID_PASSWORD = "admin123";

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
  const remember = document.getElementById("remember").checked;

  if (username === VALID_USERNAME && password === VALID_PASSWORD) {
    sessionStorage.setItem("srLoggedIn", "true");
    sessionStorage.setItem("srUser", username);
    if (remember) {
      localStorage.setItem("srRememberedUser", username);
    } else {
      localStorage.removeItem("srRememberedUser");
    }
    window.location.href = "dashboard.html";
  } else {
    errorMsg.hidden = false;
  }
});

// Prefill remembered username
window.addEventListener("DOMContentLoaded", function () {
  const remembered = localStorage.getItem("srRememberedUser");
  if (remembered) {
    document.getElementById("username").value = remembered;
    document.getElementById("remember").checked = true;
  }
});
