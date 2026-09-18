(function populateTypeFilter() {
  const typeSelect = document.getElementById("itemFilterType");
  Object.keys(STORAGE_TYPES).forEach(function (key) {
    const opt = document.createElement("option");
    opt.value = key;
    opt.textContent = STORAGE_TYPES[key].icon + " " + STORAGE_TYPES[key].label;
    typeSelect.appendChild(opt);
  });
})();

function buildItemEntryRow(entry) {
  const dotColor = getItemColor(entry.item.name).solid;
  const row = document.createElement("a");
  row.href = rackDetailUrl(entry.rack.id);
  row.className = "rack-row";
  row.style.borderLeftColor = dotColor;
  row.innerHTML = `
    <div class="rack-row-main">
      <span class="item-dot" style="background:${dotColor}"></span>
      <span class="rack-row-name">${escapeHtml(entry.item.name)}</span>
      <span class="rack-row-loc">${escapeHtml(entry.rack.name)} → ${escapeHtml(entry.path)}</span>
    </div>
    <div class="rack-row-progress">
      ${typeBadgeHtml(entry.rack.type)}
    </div>
    <div class="rack-row-meta">
      <span><strong>${entry.item.quantity}</strong> units</span>
      <span class="rack-id-badge">${escapeHtml(entry.rack.id)}</span>
    </div>
  `;
  return row;
}

function applyItemFilters() {
  const query = document.getElementById("itemFilterSearch").value.trim().toLowerCase();
  const typeFilter = document.getElementById("itemFilterType").value;

  const all = collectAllItemEntries();
  const filtered = all.filter(function (entry) {
    const matchesQuery = !query ||
      entry.item.name.toLowerCase().indexOf(query) !== -1 ||
      entry.rack.name.toLowerCase().indexOf(query) !== -1 ||
      (entry.rack.category || "").toLowerCase().indexOf(query) !== -1 ||
      entry.path.toLowerCase().indexOf(query) !== -1;
    const matchesType = typeFilter === "all" || entry.rack.type === typeFilter;
    return matchesQuery && matchesType;
  });

  filtered.sort(function (a, b) { return a.item.name.localeCompare(b.item.name); });

  document.getElementById("itemListHeading").textContent =
    `Items (${filtered.length} of ${all.length})`;

  const list = document.getElementById("itemList");
  const emptyState = document.getElementById("itemEmptyState");
  list.innerHTML = "";

  if (filtered.length === 0) {
    emptyState.hidden = false;
  } else {
    emptyState.hidden = true;
    filtered.forEach(function (entry) { list.appendChild(buildItemEntryRow(entry)); });
  }
}

document.getElementById("itemFilterSearch").addEventListener("input", applyItemFilters);
document.getElementById("itemFilterType").addEventListener("change", applyItemFilters);
document.getElementById("itemFilterReset").addEventListener("click", function () {
  document.getElementById("itemFilterSearch").value = "";
  document.getElementById("itemFilterType").value = "all";
  applyItemFilters();
});

applyItemFilters();
