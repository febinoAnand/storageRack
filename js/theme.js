(function () {
  var saved = localStorage.getItem("srTheme");
  var theme = saved === "light" || saved === "dark" ? saved : "dark";
  document.documentElement.setAttribute("data-theme", theme);
})();
