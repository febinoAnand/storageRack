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

let storageCurrentPage = 1;

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

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  if (storageCurrentPage > totalPages) storageCurrentPage = totalPages;

  const rackGrid = document.getElementById("rackGrid");
  const emptyState = document.getElementById("emptyState");
  rackGrid.innerHTML = "";

  if (filtered.length === 0) {
    emptyState.hidden = false;
  } else {
    emptyState.hidden = true;
    paginateArray(filtered, storageCurrentPage, PAGE_SIZE).forEach(function (rack) {
      rackGrid.appendChild(buildRackCard(rack));
    });
  }

  renderPagination(document.getElementById("storagePagination"), filtered.length, storageCurrentPage, PAGE_SIZE, function (page) {
    storageCurrentPage = page;
    applyRacksFilters();
  });
}

window.onRackDataChanged = applyRacksFilters;

document.getElementById("filterSearch").addEventListener("input", function () { storageCurrentPage = 1; applyRacksFilters(); });
document.getElementById("filterType").addEventListener("change", function () { storageCurrentPage = 1; applyRacksFilters(); });
document.getElementById("filterRoom").addEventListener("change", function () { storageCurrentPage = 1; applyRacksFilters(); });
document.getElementById("filterReset").addEventListener("click", function () {
  document.getElementById("filterSearch").value = "";
  document.getElementById("filterType").value = "all";
  document.getElementById("filterRoom").value = "all";
  storageCurrentPage = 1;
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
