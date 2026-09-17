function applyRacksFilters() {
  const query = document.getElementById("filterSearch").value.trim().toLowerCase();
  const statusFilter = document.getElementById("filterStatus").value;

  const filtered = racks.filter(function (r) {
    const matchesQuery = !query ||
      r.name.toLowerCase().indexOf(query) !== -1 ||
      r.id.toLowerCase().indexOf(query) !== -1 ||
      (r.location || "").toLowerCase().indexOf(query) !== -1;
    const matchesStatus = statusFilter === "all" || statusOf(r).cls === statusFilter ||
      (statusFilter === "available" && statusOf(r).cls === "");
    return matchesQuery && matchesStatus;
  });

  const rackGrid = document.getElementById("rackGrid");
  const emptyState = document.getElementById("emptyState");
  rackGrid.innerHTML = "";

  if (filtered.length === 0) {
    emptyState.hidden = false;
  } else {
    emptyState.hidden = true;
    filtered.forEach(function (rack) { rackGrid.appendChild(buildRackCard(rack)); });
  }
}

window.onRackDataChanged = applyRacksFilters;

document.getElementById("filterSearch").addEventListener("input", applyRacksFilters);
document.getElementById("filterStatus").addEventListener("change", applyRacksFilters);
document.getElementById("filterReset").addEventListener("click", function () {
  document.getElementById("filterSearch").value = "";
  document.getElementById("filterStatus").value = "all";
  applyRacksFilters();
});

// Prefill search from ?search= query param (set by the top-bar ID search fallback)
const urlParams = new URLSearchParams(window.location.search);
const searchParam = urlParams.get("search");
if (searchParam) {
  document.getElementById("filterSearch").value = searchParam;
}

applyRacksFilters();
