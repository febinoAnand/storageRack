(function populateTypeFilter() {
  const typeSelect = document.getElementById("itemFilterType");
  Object.keys(STORAGE_TYPES).forEach(function (key) {
    const opt = document.createElement("option");
    opt.value = key;
    opt.textContent = STORAGE_TYPES[key].label;
    typeSelect.appendChild(opt);
  });
})();

let showArchive = false;

function syncArchiveToggle() {
  const btn = document.getElementById("itemArchiveToggle");
  btn.innerHTML = showArchive ? `${ICONS.box} View Active Items` : `${ICONS.archive} View Archive`;
  document.getElementById("itemViewTitle").textContent = showArchive ? "Archive" : "All Items";
  document.getElementById("itemViewSubtitle").textContent = showArchive
    ? "Items that have been removed from active stock"
    : "Every item across every storage unit, in one place";
  document.getElementById("addItemPageBtn").style.display = showArchive ? "none" : "";
}

document.getElementById("itemArchiveToggle").addEventListener("click", function () {
  showArchive = !showArchive;
  syncArchiveToggle();
  itemCurrentPage = 1;
  applyItemFilters();
});

// Normalize both legacy (compartment-nested) items and global (storage-level/unassigned)
// items into one display shape so the list can show them side by side.
function buildUnifiedRows() {
  const legacy = collectAllItemEntries().map(function (e) {
    return {
      kind: "legacy", name: e.item.name, quantity: e.item.quantity,
      tags: [], remarks: "", images: [], status: "in_store",
      rack: e.rack, path: e.path, storageLabel: e.rack.name,
    };
  });
  const global = globalItems.map(function (it) {
    const rack = it.storageId ? findRack(it.storageId) : null;
    return {
      kind: "global", raw: it, name: it.name, quantity: it.quantity,
      tags: it.tags || [], remarks: it.remarks || "", images: it.images || [], status: it.status || "in_store",
      rack: rack, path: null, storageLabel: rack ? rack.name : "Unassigned",
    };
  });
  return legacy.concat(global);
}

function buildItemEntryRow(entry) {
  const dotColor = getItemColor(entry.name).solid;
  const row = document.createElement("div");
  row.className = "rack-row";
  row.style.borderLeftColor = dotColor;

  const locText = entry.path ? `${escapeHtml(entry.storageLabel)} → ${escapeHtml(entry.path)}` : escapeHtml(entry.storageLabel);
  const tagsText = entry.tags.length ? entry.tags.join(", ") : "";

  let actionsHtml = "";
  if (entry.kind === "global" && !showArchive) {
    const toggleIcon = entry.status === "in_use" ? ICONS.box : ICONS.user;
    const toggleTitle = entry.status === "in_use" ? "Mark In Store" : "Mark In Use";
    actionsHtml = `
      <button class="icon-btn item-row-edit-btn" title="Edit">${ICONS.edit}</button>
      <button class="icon-btn item-row-toggle-btn" title="${toggleTitle}">${toggleIcon}</button>
      <button class="icon-btn delete item-row-archive-btn" title="Remove (send to Archive)">${ICONS.archive}</button>
    `;
  } else if (entry.kind === "global" && showArchive) {
    actionsHtml = `
      <button class="icon-btn item-row-restore-btn" title="Restore">${ICONS.restore}</button>
      <button class="icon-btn delete item-row-purge-btn" title="Delete forever">${ICONS.trash}</button>
    `;
  }

  row.innerHTML = `
    <div class="rack-row-main">
      <span class="item-dot" style="background:${dotColor}"></span>
      <span class="rack-row-name">${escapeHtml(entry.name)}</span>
      <span class="rack-row-loc">${locText}${tagsText ? " · " + escapeHtml(tagsText) : ""}</span>
    </div>
    <div class="rack-row-progress">
      ${entry.rack ? typeBadgeHtml(entry.rack.type) : `<span class="type-badge">Unassigned</span>`}
      ${entry.kind === "global" ? itemStatusBadgeHtml(entry.status) : ""}
    </div>
    <div class="rack-row-meta">
      <span><strong>${entry.quantity}</strong> units</span>
      ${entry.rack ? `<span class="rack-id-badge">${escapeHtml(entry.rack.id)}</span>` : ""}
      ${actionsHtml}
    </div>
  `;

  if (entry.rack) {
    row.classList.add("clickable");
    row.addEventListener("click", function () { window.location.href = rackDetailUrl(entry.rack.id); });
  }

  if (entry.kind === "global" && !showArchive) {
    row.querySelector(".item-row-edit-btn").addEventListener("click", function (e) {
      e.stopPropagation();
      openAddItemModal(entry.raw);
    });
    row.querySelector(".item-row-toggle-btn").addEventListener("click", function (e) {
      e.stopPropagation();
      const next = entry.raw.status === "in_use" ? "in_store" : "in_use";
      entry.raw.status = next;
      saveGlobalItems(globalItems);
      logStatusChange(entry.raw, next, entry.rack);
      showToast(`"${entry.raw.name}" marked ${ITEM_STATUS_LABELS[next]}`, "success");
      applyItemFilters();
    });
    row.querySelector(".item-row-archive-btn").addEventListener("click", function (e) {
      e.stopPropagation();
      if (!confirm(`Remove "${entry.raw.name}" to the archive?`)) return;
      entry.raw.status = "removed";
      saveGlobalItems(globalItems);
      logStatusChange(entry.raw, "removed", entry.rack);
      showToast(`"${entry.raw.name}" moved to archive`, "danger");
      applyItemFilters();
    });
  } else if (entry.kind === "global" && showArchive) {
    row.querySelector(".item-row-restore-btn").addEventListener("click", function (e) {
      e.stopPropagation();
      entry.raw.status = "in_store";
      saveGlobalItems(globalItems);
      logStatusChange(entry.raw, "in_store", entry.rack);
      showToast(`"${entry.raw.name}" restored`, "success");
      applyItemFilters();
    });
    row.querySelector(".item-row-purge-btn").addEventListener("click", function (e) {
      e.stopPropagation();
      if (!confirm(`Permanently delete "${entry.raw.name}"? This cannot be undone.`)) return;
      globalItems = globalItems.filter(function (i) { return i.id !== entry.raw.id; });
      saveGlobalItems(globalItems);
      showToast(`"${entry.raw.name}" permanently deleted`, "danger");
      applyItemFilters();
    });
  }

  return row;
}

let itemCurrentPage = 1;

function applyItemFilters() {
  const query = document.getElementById("itemFilterSearch").value.trim().toLowerCase();
  const typeFilter = document.getElementById("itemFilterType").value;

  const all = buildUnifiedRows().filter(function (entry) {
    if (showArchive) return entry.kind === "global" && entry.status === "removed";
    return entry.kind === "legacy" || entry.status !== "removed";
  });

  const filtered = all.filter(function (entry) {
    const matchesQuery = !query ||
      entry.name.toLowerCase().indexOf(query) !== -1 ||
      entry.storageLabel.toLowerCase().indexOf(query) !== -1 ||
      entry.tags.some(function (t) { return t.toLowerCase().indexOf(query) !== -1; }) ||
      entry.remarks.toLowerCase().indexOf(query) !== -1 ||
      (entry.path || "").toLowerCase().indexOf(query) !== -1;
    const matchesType = typeFilter === "all" || (entry.rack && entry.rack.type === typeFilter);
    return matchesQuery && matchesType;
  });

  filtered.sort(function (a, b) { return a.name.localeCompare(b.name); });

  document.getElementById("itemListHeading").textContent =
    `${showArchive ? "Archived" : "Items"} (${filtered.length} of ${all.length})`;

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  if (itemCurrentPage > totalPages) itemCurrentPage = totalPages;

  const list = document.getElementById("itemList");
  const emptyState = document.getElementById("itemEmptyState");
  list.innerHTML = "";

  if (filtered.length === 0) {
    emptyState.hidden = false;
    emptyState.textContent = showArchive ? "The archive is empty." : "No items match your filters.";
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

// ---------- Add / Edit Item modal ----------
const addItemModalOverlay = document.getElementById("addItemModalOverlay");
const addItemPageForm = document.getElementById("addItemPageForm");
const addItemPageError = document.getElementById("addItemPageError");
const placeRackSelect = document.getElementById("placeRackSelect");

let itemTagInput = null;
let itemImageInput = null;
let editingGlobalItemId = null;

function populateRackSelect(selectedId) {
  placeRackSelect.innerHTML = `<option value="">— Unassigned —</option>` + racks.map(function (r) {
    return `<option value="${escapeHtml(r.id)}">${escapeHtml(r.name)} (${escapeHtml(r.id)}) — ${escapeHtml(roomLabel(r.storeRoomId))}</option>`;
  }).join("");
  placeRackSelect.value = selectedId || "";
}

function openAddItemModal(existingItem) {
  addItemPageError.hidden = true;
  addItemPageForm.reset();
  populateRackSelect(existingItem ? existingItem.storageId : "");

  editingGlobalItemId = existingItem ? existingItem.id : null;
  document.getElementById("addItemModalTitle").textContent = existingItem ? "Edit Item" : "Add Item";
  document.getElementById("addItemPageSubmit").textContent = existingItem ? "Save Changes" : "Add Item";
  document.getElementById("placeItemEditingId").value = existingItem ? existingItem.id : "";
  document.getElementById("placeItemId").value = existingItem ? existingItem.id : "";
  document.getElementById("placeItemName").value = existingItem ? existingItem.name : "";
  document.getElementById("placeItemQuantity").value = existingItem ? existingItem.quantity : "";
  document.getElementById("placeItemRemarks").value = existingItem ? existingItem.remarks || "" : "";

  itemTagInput = createTagInput(document.getElementById("placeItemTagChips"), document.getElementById("placeItemTagText"), existingItem ? existingItem.tags || [] : []);
  itemImageInput = createImageInput(document.getElementById("placeItemImagePreviews"), document.getElementById("placeItemImageFile"), { initialImages: existingItem ? existingItem.images || [] : [] });

  addItemModalOverlay.hidden = false;
}

function closeAddItemModal() {
  addItemModalOverlay.hidden = true;
  editingGlobalItemId = null;
}

document.getElementById("addItemPageBtn").addEventListener("click", function () { openAddItemModal(null); });
document.getElementById("addItemModalClose").addEventListener("click", closeAddItemModal);
document.getElementById("addItemPageCancel").addEventListener("click", closeAddItemModal);
addItemModalOverlay.addEventListener("click", function (e) { if (e.target === addItemModalOverlay) closeAddItemModal(); });

addItemPageForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const name = document.getElementById("placeItemName").value.trim();
  const idRaw = document.getElementById("placeItemId").value.trim();
  const quantity = parseInt(document.getElementById("placeItemQuantity").value, 10);
  const storageId = placeRackSelect.value || null;
  const remarks = document.getElementById("placeItemRemarks").value.trim();

  if (!name || isNaN(quantity) || quantity < 1) {
    addItemPageError.textContent = "Please enter an item name and a valid quantity.";
    addItemPageError.hidden = false;
    return;
  }

  if (idRaw && globalItems.some(function (i) { return i.id.toLowerCase() === idRaw.toLowerCase() && i.id !== editingGlobalItemId; })) {
    addItemPageError.textContent = `Item ID "${idRaw}" is already in use. Choose a different ID.`;
    addItemPageError.hidden = false;
    return;
  }

  const tags = itemTagInput.getTags();
  const images = itemImageInput.getImages();
  const rack = storageId ? findRack(storageId) : null;

  if (editingGlobalItemId) {
    const item = findGlobalItem(editingGlobalItemId);
    const delta = quantity - item.quantity;
    item.name = name;
    item.quantity = quantity;
    item.tags = tags;
    item.remarks = remarks;
    item.images = images;
    item.storageId = storageId;
    saveGlobalItems(globalItems);
    if (delta > 0) logTransaction("in", name, delta, rack, null);
    else if (delta < 0) logTransaction("out", name, -delta, rack, null);
    showToast(`"${name}" updated`, "success");
  } else {
    const item = {
      id: idRaw || nextItemCode(),
      name: name,
      tags: tags,
      quantity: quantity,
      remarks: remarks,
      storageId: storageId,
      images: images,
      status: "in_store",
      createdAt: Date.now(),
    };
    globalItems.push(item);
    saveGlobalItems(globalItems);
    logTransaction("in", name, quantity, rack, null);
    showToast(`"${name}" added`, "success");
  }

  closeAddItemModal();
  itemCurrentPage = 1;
  applyItemFilters();
});

syncArchiveToggle();
applyItemFilters();
