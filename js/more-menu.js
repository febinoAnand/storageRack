// ---------- Shared "More" menu modal (mobile only) ----------
// Opened from both the bottom tab bar's More button and the topbar's
// user-chip ([data-open-more]). Reuses the same .modal-overlay/.modal
// markup and open/close conventions every other modal in this app uses.
(function () {
  const overlay = document.getElementById("moreMenuOverlay");
  if (!overlay) return;

  function openMoreMenu() { overlay.hidden = false; }
  function closeMoreMenu() { overlay.hidden = true; }

  document.querySelectorAll("[data-open-more]").forEach(function (el) {
    el.addEventListener("click", function (e) {
      e.preventDefault();
      openMoreMenu();
    });
  });

  const closeBtn = document.getElementById("moreMenuClose");
  if (closeBtn) closeBtn.addEventListener("click", closeMoreMenu);
  overlay.addEventListener("click", function (e) {
    if (e.target === overlay) closeMoreMenu();
  });
})();
