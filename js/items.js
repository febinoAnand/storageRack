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
      typeLabel: typeInfo(e.rack.type).label, statusLabel: ITEM_STATUS_LABELS.in_store,
    };
  });
  const global = globalItems.map(function (it) {
    const rack = it.storageId ? findRack(it.storageId) : null;
    const status = it.status || "in_store";
    return {
      kind: "global", raw: it, name: it.name, quantity: it.quantity,
      tags: it.tags || [], remarks: it.remarks || "", images: it.images || [], status: status,
      rack: rack, path: null, storageLabel: rack ? rack.name : "Unassigned",
      typeLabel: rack ? typeInfo(rack.type).label : "Unassigned", statusLabel: ITEM_STATUS_LABELS[status] || status,
    };
  });
  return legacy.concat(global);
}

function buildItemTableRow(entry) {
  const dotColor = getItemColor(entry.name).solid;
  const row = document.createElement("tr");

  const locText = entry.path ? `${escapeHtml(entry.storageLabel)} → ${escapeHtml(entry.path)}` : escapeHtml(entry.storageLabel);
  const tagsText = entry.tags.length ? entry.tags.join(", ") : "—";

  let actionsHtml = "";
  if (entry.kind === "global" && !showArchive) {
    actionsHtml = `
      <button class="icon-btn item-row-edit-btn" title="Edit">${ICONS.edit}</button>
      <button class="icon-btn delete item-row-archive-btn" title="Remove (send to Archive)">${ICONS.archive}</button>
    `;
  } else if (entry.kind === "global" && showArchive) {
    actionsHtml = `
      <button class="icon-btn item-row-restore-btn" title="Restore">${ICONS.restore}</button>
      <button class="icon-btn delete item-row-purge-btn" title="Delete forever">${ICONS.trash}</button>
    `;
  }

  const nameHtml = entry.kind === "global"
    ? `<a href="${itemDetailUrl(entry.raw.id)}">${escapeHtml(entry.name)}</a>`
    : escapeHtml(entry.name);

  row.innerHTML = `
    <td data-label="Item"><span class="item-dot" style="background:${dotColor};display:inline-block;margin-right:6px;"></span>${nameHtml}</td>
    <td data-label="Storage">${entry.rack ? `<a href="${rackDetailUrl(entry.rack.id)}" class="rack-id-badge">${escapeHtml(entry.rack.id)}</a> ` : ""}${locText}</td>
    <td data-label="Tags" class="muted">${escapeHtml(tagsText)}</td>
    <td data-label="Type">${entry.rack ? typeBadgeHtml(entry.rack.type) : `<span class="type-badge">Unassigned</span>`}</td>
    <td data-label="Status">${entry.kind === "global" && !showArchive
      ? `<button type="button" class="status-picker-btn" title="Move or change status">${itemStatusBadgeHtml(entry.status)}</button>`
      : entry.kind === "global" ? itemStatusBadgeHtml(entry.status) : "—"}</td>
    <td data-label="Qty"><strong>${entry.quantity}</strong></td>
    <td data-label="Actions">${actionsHtml || "—"}</td>
  `;

  if (entry.kind === "global" && !showArchive) {
    row.querySelector(".item-row-edit-btn").addEventListener("click", function (e) {
      e.stopPropagation();
      openAddItemModal(entry.raw);
    });
    row.querySelector(".status-picker-btn").addEventListener("click", function (e) {
      e.stopPropagation();
      openMoveItemModal(entry);
    });
    row.querySelector(".item-row-archive-btn").addEventListener("click", function (e) {
      e.stopPropagation();
      archiveGlobalItem(entry.raw, entry.rack);
    });
  } else if (entry.kind === "global" && showArchive) {
    row.querySelector(".item-row-restore-btn").addEventListener("click", function (e) {
      e.stopPropagation();
      restoreGlobalItem(entry.raw, entry.rack);
    });
    row.querySelector(".item-row-purge-btn").addEventListener("click", function (e) {
      e.stopPropagation();
      purgeGlobalItem(entry.raw);
    });
  }

  return row;
}

window.onItemDataChanged = function () { applyItemFilters(); };

let itemCurrentPage = 1;
let itemSortField = "name";
let itemSortDir = "asc";
let currentFilteredItems = [];

function sortItemEntries(list) {
  const dir = itemSortDir === "asc" ? 1 : -1;
  return list.slice().sort(function (a, b) {
    let av = a[itemSortField];
    let bv = b[itemSortField];
    if (typeof av === "string") { av = av.toLowerCase(); bv = bv.toLowerCase(); }
    if (av < bv) return -1 * dir;
    if (av > bv) return 1 * dir;
    return 0;
  });
}

function syncItemSortIndicators() {
  document.querySelectorAll(".log-table th[data-sort]").forEach(function (th) {
    const arrow = th.querySelector(".sort-arrow");
    if (th.dataset.sort === itemSortField) {
      th.classList.add("sorted");
      arrow.textContent = itemSortDir === "asc" ? "▲" : "▼";
    } else {
      th.classList.remove("sorted");
      arrow.textContent = "";
    }
  });
}

function applyItemFilters() {
  const query = document.getElementById("itemFilterSearch").value.trim().toLowerCase();
  const typeFilter = document.getElementById("itemFilterType").value;

  const all = buildUnifiedRows().filter(function (entry) {
    if (showArchive) return entry.kind === "global" && entry.status === "removed";
    return entry.kind === "legacy" || entry.status !== "removed";
  });

  let filtered = all.filter(function (entry) {
    const matchesQuery = !query ||
      entry.name.toLowerCase().indexOf(query) !== -1 ||
      entry.storageLabel.toLowerCase().indexOf(query) !== -1 ||
      entry.tags.some(function (t) { return t.toLowerCase().indexOf(query) !== -1; }) ||
      entry.remarks.toLowerCase().indexOf(query) !== -1 ||
      (entry.path || "").toLowerCase().indexOf(query) !== -1;
    const matchesType = typeFilter === "all" || (entry.rack && entry.rack.type === typeFilter);
    return matchesQuery && matchesType;
  });

  filtered = sortItemEntries(filtered);
  syncItemSortIndicators();
  currentFilteredItems = filtered;

  document.getElementById("itemListHeading").textContent =
    `${showArchive ? "Archived" : "Items"} (${filtered.length} of ${all.length})`;

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  if (itemCurrentPage > totalPages) itemCurrentPage = totalPages;

  const tbody = document.getElementById("itemTableBody");
  const emptyState = document.getElementById("itemEmptyState");
  const table = document.querySelector(".log-table-wrap");
  tbody.innerHTML = "";

  if (filtered.length === 0) {
    emptyState.hidden = false;
    emptyState.textContent = showArchive ? "The archive is empty." : "No items match your filters.";
    table.hidden = true;
  } else {
    emptyState.hidden = true;
    table.hidden = false;
    paginateArray(filtered, itemCurrentPage, PAGE_SIZE).forEach(function (entry) {
      tbody.appendChild(buildItemTableRow(entry));
    });
  }

  renderPagination(document.getElementById("itemPagination"), filtered.length, itemCurrentPage, PAGE_SIZE, function (page) {
    itemCurrentPage = page;
    applyItemFilters();
  });
}

document.querySelectorAll(".log-table th[data-sort]").forEach(function (th) {
  th.addEventListener("click", function () {
    const field = th.dataset.sort;
    if (itemSortField === field) {
      itemSortDir = itemSortDir === "asc" ? "desc" : "asc";
    } else {
      itemSortField = field;
      itemSortDir = "asc";
    }
    itemCurrentPage = 1;
    applyItemFilters();
  });
});

document.getElementById("itemFilterSearch").addEventListener("input", function () { itemCurrentPage = 1; applyItemFilters(); });
document.getElementById("itemFilterType").addEventListener("change", function () { itemCurrentPage = 1; applyItemFilters(); });
document.getElementById("itemFilterReset").addEventListener("click", function () {
  document.getElementById("itemFilterSearch").value = "";
  document.getElementById("itemFilterType").value = "all";
  itemCurrentPage = 1;
  applyItemFilters();
});

// ---------- Import Items ----------
const IMPORT_COLUMNS = ["name", "itemid", "tags", "quantity", "storageid", "remarks", "status"];

function parseCSV(text) {
  const rows = [];
  let row = [], field = "", inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else field += c;
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      row.push(field); field = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field); field = "";
      if (row.length > 1 || row[0] !== "") rows.push(row);
      row = [];
    } else {
      field += c;
    }
  }
  if (field !== "" || row.length) { row.push(field); rows.push(row); }
  return rows;
}

function csvRowsToObjects(rows) {
  if (!rows.length) return [];
  const headers = rows[0].map(function (h) { return h.trim(); });
  return rows.slice(1).map(function (r) {
    const obj = {};
    headers.forEach(function (h, i) { obj[h] = r[i] !== undefined ? r[i] : ""; });
    return obj;
  });
}

function normalizeRowKeys(obj) {
  const out = {};
  Object.keys(obj).forEach(function (k) {
    out[k.trim().toLowerCase().replace(/\s+/g, "")] = obj[k];
  });
  return out;
}

function parseImportFile(file) {
  const isCsv = /\.csv$/i.test(file.name);
  return new Promise(function (resolve, reject) {
    const reader = new FileReader();
    reader.onerror = function () { reject(new Error("Could not read the file.")); };
    if (isCsv) {
      reader.onload = function () {
        try {
          const rows = csvRowsToObjects(parseCSV(String(reader.result)));
          resolve(rows.map(normalizeRowKeys));
        } catch (err) { reject(err); }
      };
      reader.readAsText(file);
    } else {
      reader.onload = function () {
        try {
          const wb = XLSX.read(new Uint8Array(reader.result), { type: "array" });
          const sheet = wb.Sheets[wb.SheetNames[0]];
          const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });
          resolve(rows.map(normalizeRowKeys));
        } catch (err) { reject(err); }
      };
      reader.readAsArrayBuffer(file);
    }
  });
}

function validateImportRow(obj, seenIds) {
  const name = String(obj.name || "").trim();
  const itemId = String(obj.itemid || "").trim();
  const tags = String(obj.tags || "").split(",").map(function (t) { return t.trim(); }).filter(Boolean);
  const quantity = parseInt(obj.quantity, 10);
  const storageIdRaw = String(obj.storageid || "").trim();
  const remarks = String(obj.remarks || "").trim();
  const statusRaw = String(obj.status || "").trim().toLowerCase();
  const status = statusRaw === "in use" || statusRaw === "in_use" ? "in_use" : "in_store";

  const errors = [];
  if (!name) errors.push("Missing name");
  if (isNaN(quantity) || quantity < 1) errors.push("Invalid quantity");

  let rack = null;
  if (storageIdRaw) {
    rack = findRack(storageIdRaw);
    if (!rack) errors.push(`Unknown storage "${storageIdRaw}"`);
  }

  if (itemId) {
    if (findGlobalItem(itemId)) errors.push(`Item ID "${itemId}" already exists`);
    else if (seenIds.has(itemId)) errors.push(`Item ID "${itemId}" repeated in file`);
  }
  if (itemId) seenIds.add(itemId);

  return { name, itemId, tags, quantity, storageId: rack ? rack.id : null, rack, remarks, status, errors };
}

let importParsedRows = [];

function importRowHtml(row) {
  const ok = row.errors.length === 0;
  const statusCell = ok
    ? `<span class="rack-badge">${ICONS.check} OK</span>`
    : `<span class="rack-badge full" title="${escapeHtml(row.errors.join("; "))}">${escapeHtml(row.errors.join("; "))}</span>`;
  return `
    <tr class="${ok ? "" : "import-row-error"}">
      <td data-label="Status">${statusCell}</td>
      <td data-label="Name">${escapeHtml(row.name || "—")}</td>
      <td data-label="Item ID">${escapeHtml(row.itemId || "auto")}</td>
      <td data-label="Tags">${escapeHtml(row.tags.join(", ") || "—")}</td>
      <td data-label="Qty">${isNaN(row.quantity) ? "—" : row.quantity}</td>
      <td data-label="Storage">${escapeHtml(row.rack ? row.rack.name : (row.storageId ? row.storageId : "Unassigned"))}</td>
      <td data-label="Remarks">${escapeHtml(row.remarks || "—")}</td>
    </tr>`;
}

function showImportStep(step) {
  document.getElementById("importStepUpload").hidden = step !== "upload";
  document.getElementById("importStepPreview").hidden = step !== "preview";
}

function openImportModal() {
  document.getElementById("importFile").value = "";
  document.getElementById("importParseError").hidden = true;
  importParsedRows = [];
  showImportStep("upload");
  document.getElementById("importModalOverlay").hidden = false;
}

function closeImportModal() {
  document.getElementById("importModalOverlay").hidden = true;
}

document.getElementById("importItemsBtn").addEventListener("click", openImportModal);
document.getElementById("importModalClose").addEventListener("click", closeImportModal);
document.getElementById("importCancel1").addEventListener("click", closeImportModal);
document.getElementById("importBack").addEventListener("click", function () { showImportStep("upload"); });
document.getElementById("importModalOverlay").addEventListener("click", function (e) {
  if (e.target === document.getElementById("importModalOverlay")) closeImportModal();
});

document.getElementById("importDownloadTemplate").addEventListener("click", function () {
  const csv = "name,itemId,tags,quantity,storageId,remarks,status\n" +
    "Wrenches,,Tools,16,ST-1001,Reorder when below 5,In Store\n" +
    "Floor Cleaner,,Cleaning Supplies,20,ST-1002,,In Store\n";
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "item-import-template.csv";
  a.click();
  URL.revokeObjectURL(url);
});

document.getElementById("importFile").addEventListener("change", function (e) {
  const file = e.target.files[0];
  const errorEl = document.getElementById("importParseError");
  errorEl.hidden = true;
  if (!file) return;

  parseImportFile(file).then(function (rawRows) {
    if (!rawRows.length) {
      errorEl.textContent = "That file has no rows to import.";
      errorEl.hidden = false;
      return;
    }
    const seenIds = new Set();
    importParsedRows = rawRows.map(function (r) { return validateImportRow(r, seenIds); });

    const validCount = importParsedRows.filter(function (r) { return r.errors.length === 0; }).length;
    document.getElementById("importSummary").textContent =
      `${importParsedRows.length} row${importParsedRows.length === 1 ? "" : "s"} found — ${validCount} ready to import, ${importParsedRows.length - validCount} with errors (errors will be skipped).`;
    document.getElementById("importPreviewBody").innerHTML = importParsedRows.map(importRowHtml).join("");
    document.getElementById("importConfirm").disabled = validCount === 0;

    showImportStep("preview");
  }).catch(function (err) {
    errorEl.textContent = "Couldn't read that file: " + err.message;
    errorEl.hidden = false;
  });
});

document.getElementById("importConfirm").addEventListener("click", function () {
  const validRows = importParsedRows.filter(function (r) { return r.errors.length === 0; });
  if (!validRows.length) return;

  validRows.forEach(function (row) {
    const item = {
      id: row.itemId || nextItemCode(),
      name: row.name,
      tags: row.tags,
      quantity: row.quantity,
      remarks: row.remarks,
      images: [],
      storageId: row.storageId,
      status: row.status,
      createdAt: Date.now(),
    };
    globalItems.push(item);
    logTransaction("in", item.name, item.quantity, row.rack, null);
  });
  saveGlobalItems(globalItems);

  showToast(`Imported ${validRows.length} item${validRows.length === 1 ? "" : "s"}`, "success");
  closeImportModal();
  itemCurrentPage = 1;
  applyItemFilters();
});

// ---------- Export (CSV / PDF) ----------
const exportBtn = document.getElementById("exportBtn");
const exportMenu = document.getElementById("exportMenu");

exportBtn.addEventListener("click", function (e) {
  e.stopPropagation();
  exportMenu.hidden = !exportMenu.hidden;
});
document.addEventListener("click", function () { exportMenu.hidden = true; });
exportMenu.addEventListener("click", function (e) { e.stopPropagation(); });

function exportFileBaseName() {
  return (showArchive ? "archived-items" : "items") + "-" + new Date().toISOString().slice(0, 10);
}

function exportRowsAsObjects() {
  return currentFilteredItems.map(function (entry) {
    return {
      Name: entry.name,
      "Item ID": entry.kind === "global" ? entry.raw.id : "—",
      Storage: entry.rack ? `${entry.rack.name} (${entry.rack.id})` : "Unassigned",
      Tags: entry.tags.join(", "),
      Type: entry.typeLabel,
      Status: entry.statusLabel,
      Quantity: entry.quantity,
      Remarks: entry.remarks || "",
    };
  });
}

function csvEscape(val) {
  const s = String(val == null ? "" : val);
  return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}

document.getElementById("exportCsvBtn").addEventListener("click", function () {
  const rows = exportRowsAsObjects();
  if (!rows.length) { showToast("Nothing to export.", "danger"); return; }
  const headers = Object.keys(rows[0]);
  const lines = [headers.join(",")].concat(rows.map(function (r) {
    return headers.map(function (h) { return csvEscape(r[h]); }).join(",");
  }));
  const blob = new Blob([lines.join("\n")], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = exportFileBaseName() + ".csv";
  a.click();
  URL.revokeObjectURL(url);
  exportMenu.hidden = true;
});

document.getElementById("exportPdfBtn").addEventListener("click", function () {
  const rows = exportRowsAsObjects();
  if (!rows.length) { showToast("Nothing to export.", "danger"); return; }
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: "landscape" });
  const headers = Object.keys(rows[0]);
  doc.setFontSize(14);
  doc.text(showArchive ? "Archived Items" : "All Items", 14, 15);
  doc.setFontSize(9);
  doc.text(new Date().toLocaleString(), 14, 21);
  doc.autoTable({
    head: [headers],
    body: rows.map(function (r) { return headers.map(function (h) { return String(r[h]); }); }),
    startY: 26,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [37, 99, 235] },
  });
  doc.save(exportFileBaseName() + ".pdf");
  exportMenu.hidden = true;
});

syncArchiveToggle();
applyItemFilters();
