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

let itemCurrentPage = 1;

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

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  if (itemCurrentPage > totalPages) itemCurrentPage = totalPages;

  const list = document.getElementById("itemList");
  const emptyState = document.getElementById("itemEmptyState");
  list.innerHTML = "";

  if (filtered.length === 0) {
    emptyState.hidden = false;
  } else {
    emptyState.hidden = true;
    paginateArray(filtered, itemCurrentPage, PAGE_SIZE).forEach(function (entry) {
      list.appendChild(buildItemEntryRow(entry));
    });
  }

  renderPagination(document.getElementById("itemPagination"), filtered.length, itemCurrentPage, PAGE_SIZE, function (page) {
    itemCurrentPage = page;
    applyItemFilters();
  });
}

document.getElementById("itemFilterSearch").addEventListener("input", function () { itemCurrentPage = 1; applyItemFilters(); });
document.getElementById("itemFilterType").addEventListener("change", function () { itemCurrentPage = 1; applyItemFilters(); });
document.getElementById("itemFilterReset").addEventListener("click", function () {
  document.getElementById("itemFilterSearch").value = "";
  document.getElementById("itemFilterType").value = "all";
  itemCurrentPage = 1;
  applyItemFilters();
});

// ---------- Add Item modal (placement picker) ----------
const addItemModalOverlay = document.getElementById("addItemModalOverlay");
const addItemPageForm = document.getElementById("addItemPageForm");
const addItemPageError = document.getElementById("addItemPageError");
const placeRackSelect = document.getElementById("placeRackSelect");
const placeNodeSelect = document.getElementById("placeNodeSelect");
const placeNodeHint = document.getElementById("placeNodeHint");

function populateRackSelect() {
  placeRackSelect.innerHTML = racks.map(function (r) {
    return `<option value="${escapeHtml(r.id)}">${escapeHtml(r.name)} (${escapeHtml(r.id)}) — ${escapeHtml(roomLabel(r.storeRoomId))}</option>`;
  }).join("");
}

function populateNodeSelect() {
  const rack = findRack(placeRackSelect.value);
  const submitBtn = addItemPageForm.querySelector("button[type=submit]");

  if (!rack) {
    placeNodeSelect.innerHTML = "";
    placeNodeHint.textContent = "";
    return;
  }

  const placements = flattenNodesForPlacement(rack);

  if (placements.length === 0) {
    placeNodeSelect.innerHTML = "";
    placeNodeHint.textContent = "This storage has no locations yet — add one from its detail page first.";
    placeNodeSelect.disabled = true;
    submitBtn.disabled = true;
    return;
  }

  placeNodeSelect.disabled = false;
  submitBtn.disabled = false;
  placeNodeSelect.innerHTML = placements.map(function (p) {
    const availLabel = nodeAvailabilityLabel(p.node);
    const full = p.availability.isFull;
    return `<option value="${escapeHtml(p.node.id)}" ${full ? "disabled" : ""}>${escapeHtml(p.path)} — ${full ? "FULL" : availLabel}</option>`;
  }).join("");

  syncNodeHint();
}

function syncNodeHint() {
  const rack = findRack(placeRackSelect.value);
  if (!rack) return;
  const node = findNodeDeep(rack.nodes, placeNodeSelect.value);
  placeNodeHint.textContent = node ? `${nodeAvailabilityLabel(node)} at this location.` : "";
}

placeRackSelect.addEventListener("change", populateNodeSelect);
placeNodeSelect.addEventListener("change", syncNodeHint);

function openAddItemModal() {
  addItemPageError.hidden = true;
  addItemPageForm.reset();

  if (racks.length === 0) {
    showToast("Create a storage unit first", "danger");
    return;
  }

  populateRackSelect();
  populateNodeSelect();
  addItemModalOverlay.hidden = false;
}

function closeAddItemModal() {
  addItemModalOverlay.hidden = true;
}

document.getElementById("addItemPageBtn").addEventListener("click", openAddItemModal);
document.getElementById("addItemModalClose").addEventListener("click", closeAddItemModal);
document.getElementById("addItemPageCancel").addEventListener("click", closeAddItemModal);
addItemModalOverlay.addEventListener("click", function (e) { if (e.target === addItemModalOverlay) closeAddItemModal(); });

addItemPageForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const rack = findRack(placeRackSelect.value);
  const node = rack ? findNodeDeep(rack.nodes, placeNodeSelect.value) : null;
  const name = document.getElementById("placeItemName").value.trim();
  const quantity = parseInt(document.getElementById("placeItemQuantity").value, 10);

  if (!rack || !node) {
    addItemPageError.textContent = "Please choose where to place this item.";
    addItemPageError.hidden = false;
    return;
  }
  if (!name || isNaN(quantity) || quantity < 1) {
    addItemPageError.textContent = "Please enter an item name and a valid quantity.";
    addItemPageError.hidden = false;
    return;
  }

  const avail = nodeAvailability(node);
  if (avail.capacity != null && quantity > avail.remaining) {
    addItemPageError.textContent = `Only ${avail.remaining} unit(s) of space left at "${node.name}".`;
    addItemPageError.hidden = false;
    return;
  }

  node.items.push(makeItem(name, quantity));
  saveRacks(racks);
  logTransaction("in", name, quantity, rack, findNodePathDeep(rack.nodes, node.id, []).join(" → "));
  closeAddItemModal();
  showToast(`"${name}" added to ${rack.name}`, "success");
  itemCurrentPage = 1;
  applyItemFilters();
});

applyItemFilters();
