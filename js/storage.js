// Populate type & room filter dropdowns
(function populateFilters() {
  const typeSelect = document.getElementById("filterType");
  Object.keys(STORAGE_TYPES).forEach(function (key) {
    const opt = document.createElement("option");
    opt.value = key;
    opt.textContent = STORAGE_TYPES[key].icon + " " + STORAGE_TYPES[key].label;
    typeSelect.appendChild(opt);
  });

  const roomSelect = document.getElementById("filterRoom");
  rooms.forEach(function (room) {
    const opt = document.createElement("option");
    opt.value = room.id;
    opt.textContent = room.name;
    roomSelect.appendChild(opt);
  });
})();

function applyRacksFilters() {
  const query = document.getElementById("filterSearch").value.trim().toLowerCase();
  const typeFilter = document.getElementById("filterType").value;
  const roomFilter = document.getElementById("filterRoom").value;

  const filtered = racks.filter(function (r) {
    const matchesQuery = !query ||
      r.name.toLowerCase().indexOf(query) !== -1 ||
      r.id.toLowerCase().indexOf(query) !== -1 ||
      (r.category || "").toLowerCase().indexOf(query) !== -1;
    const matchesType = typeFilter === "all" || r.type === typeFilter;
    const matchesRoom = roomFilter === "all" || r.storeRoomId === roomFilter;
    return matchesQuery && matchesType && matchesRoom;
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
document.getElementById("filterType").addEventListener("change", applyRacksFilters);
document.getElementById("filterRoom").addEventListener("change", applyRacksFilters);
document.getElementById("filterReset").addEventListener("click", function () {
  document.getElementById("filterSearch").value = "";
  document.getElementById("filterType").value = "all";
  document.getElementById("filterRoom").value = "all";
  applyRacksFilters();
});

// Prefill filters from query params (?search= from the top-bar ID search fallback, ?room= from a Store Room card)
const urlParams = new URLSearchParams(window.location.search);
const searchParam = urlParams.get("search");
if (searchParam) {
  document.getElementById("filterSearch").value = searchParam;
}
const roomParam = urlParams.get("room");
if (roomParam) {
  document.getElementById("filterRoom").value = roomParam;
}

applyRacksFilters();
