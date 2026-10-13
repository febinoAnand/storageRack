const detailParams = new URLSearchParams(window.location.search);
const currentRackId = detailParams.get("id");

// ---------- Amazon-style image gallery (big image + side thumbnail strip) ----------
function productGalleryHtml(images) {
  if (!images.length) return "";
  const thumbsHtml = images.length > 1
    ? `<div class="gallery-thumbs">` + images.map(function (src, i) {
        return `<img class="gallery-thumb${i === 0 ? " active" : ""}" src="${src}" data-index="${i}" alt="">`;
      }).join("") + `</div>`
    : "";
  return `
    <div class="product-gallery">
      ${thumbsHtml}
      <div class="gallery-main">
        <img class="gallery-main-img" src="${images[0]}" data-index="0" alt="" title="Click to view full-size">
      </div>
    </div>`;
}

document.addEventListener("click", function (e) {
  const thumb = e.target.closest(".gallery-thumb");
  if (thumb) {
    const gallery = thumb.closest(".product-gallery");
    const mainImg = gallery.querySelector(".gallery-main-img");
    mainImg.src = thumb.src;
    mainImg.dataset.index = thumb.dataset.index;
    gallery.querySelectorAll(".gallery-thumb").forEach(function (t) { t.classList.remove("active"); });
    thumb.classList.add("active");
    return;
  }
  const mainImg = e.target.closest(".gallery-main-img");
  if (mainImg) {
    const gallery = mainImg.closest(".product-gallery");
    const thumbEls = gallery.querySelectorAll(".gallery-thumb");
    const images = thumbEls.length ? Array.from(thumbEls).map(function (t) { return t.src; }) : [mainImg.src];
    openLightbox(images, parseInt(mainImg.dataset.index, 10) || 0);
  }
});

// storageEditingItemId: null, or the id of the single item row currently
// inline-editing within the Items panel below (click-to-edit, not a modal).
let storageEditingItemId = null;

function itemRowImageHtml(item) {
  const images = item.images || [];
  if (images.length) {
    return `<img class="rack-image-thumb item-table-thumb" src="${images[0]}" alt="" title="Click to view" style="width:40px;height:40px;">`;
  }
  const dotColor = getItemColor(item.name).solid;
  const initial = item.name.trim().charAt(0).toUpperCase() || "?";
  return `<span class="item-avatar" style="background:${dotColor};" title="No picture">${escapeHtml(initial)}</span>`;
}

function itemRowHtml(item) {
  if (storageEditingItemId === item.id) {
    return `
      <tr data-item-id="${escapeHtml(item.id)}" class="editing-row">
        <td data-label="Image">${itemRowImageHtml(item)}</td>
        <td data-label="Item"><input type="text" class="inline-edit-input row-edit-name" id="rowEditName" value="${escapeHtml(item.name)}"></td>
        <td data-label="Tags">
          <div class="tag-input" id="rowEditTagInput">
            <div class="tag-input-chips" id="rowEditTagChips"></div>
            <input type="text" id="rowEditTagText" placeholder="Type a tag and press Enter">
          </div>
        </td>
        <td data-label="Status">${itemStatusBadgeHtml(item.status)}</td>
        <td data-label="Qty"><input type="number" min="1" class="inline-edit-input row-edit-qty" id="rowEditQty" style="width:70px;" value="${item.quantity}"></td>
        <td data-label="Actions">
          <button class="icon-btn row-save-btn" title="Save">${ICONS.check}</button>
          <button class="icon-btn delete row-cancel-btn" title="Cancel">&times;</button>
        </td>
      </tr>`;
  }
  const tagsCellHtml = item.tags && item.tags.length ? tagsHtml(item.tags) : `<span class="muted">—</span>`;
  return `
    <tr data-item-id="${escapeHtml(item.id)}">
      <td data-label="Image">${itemRowImageHtml(item)}</td>
      <td data-label="Item"><span class="editable-field row-name-trigger" title="Click to edit">${escapeHtml(item.name)} ${ICONS.edit}</span></td>
      <td data-label="Tags">${tagsCellHtml}</td>
      <td data-label="Status"><button type="button" class="status-picker-btn" title="Move or change status">${itemStatusBadgeHtml(item.status)}</button></td>
      <td data-label="Qty"><strong>${item.quantity}</strong></td>
      <td data-label="Actions">
        <a class="icon-btn row-view-btn" href="${itemDetailUrl(item.id)}" title="Open item's own page">${ICONS.chevronRight}</a>
        <button class="icon-btn delete item-archive-btn" title="Remove (send to Archive)">${ICONS.archive}</button>
      </td>
    </tr>`;
}

// itemsPanelSortField/Dir drive the sortable column headers; itemsPanelQuery and
// itemsPanelStatusFilter drive the panel's own search + status filter.
let itemsPanelSortField = "name";
let itemsPanelSortDir = "asc";
let itemsPanelQuery = "";
let itemsPanelStatusFilter = "all";

function itemsPanelSortValue(item, field) {
  if (field === "tags") return (item.tags || []).join(", ");
  if (field === "status") return item.status;
  if (field === "quantity") return item.quantity;
  return item.name;
}

function sortPanelItems(list) {
  const dir = itemsPanelSortDir === "asc" ? 1 : -1;
  return list.slice().sort(function (a, b) {
    let av = itemsPanelSortValue(a, itemsPanelSortField);
    let bv = itemsPanelSortValue(b, itemsPanelSortField);
    if (typeof av === "string") { av = av.toLowerCase(); bv = bv.toLowerCase(); }
    if (av < bv) return -1 * dir;
    if (av > bv) return 1 * dir;
    return 0;
  });
}

function filteredPanelItems(rack) {
  const query = itemsPanelQuery.trim().toLowerCase();
  const all = activeGlobalItemsForRack(rack.id);
  return all.filter(function (item) {
    const matchesQuery = !query ||
      item.name.toLowerCase().indexOf(query) !== -1 ||
      (item.tags || []).some(function (t) { return t.toLowerCase().indexOf(query) !== -1; });
    const matchesStatus = itemsPanelStatusFilter === "all" || item.status === itemsPanelStatusFilter;
    return matchesQuery && matchesStatus;
  });
}

function itemsPanelSortThHtml(field, label) {
  const active = itemsPanelSortField === field;
  const arrow = active ? (itemsPanelSortDir === "asc" ? "▲" : "▼") : "";
  return `<th data-sort="${field}" class="${active ? "sorted" : ""}">${label} <span class="sort-arrow">${arrow}</span></th>`;
}

function globalItemsPanelHtml(rack) {
  const allItems = activeGlobalItemsForRack(rack.id);
  const items = sortPanelItems(filteredPanelItems(rack));

  const tableHtml = items.length
    ? `<div class="log-table-wrap">
        <table class="log-table">
          <thead>
            <tr>
              <th>Image</th>
              ${itemsPanelSortThHtml("name", "Item")}
              ${itemsPanelSortThHtml("tags", "Tags")}
              ${itemsPanelSortThHtml("status", "Status")}
              ${itemsPanelSortThHtml("quantity", "Qty")}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody id="itemsPanelBody">
            ${items.map(itemRowHtml).join("")}
          </tbody>
        </table>
      </div>`
    : `<p class="empty-state">No items match your filters.</p>`;

  const bodyHtml = allItems.length
    ? `<div class="filters-bar items-panel-filters">
        <input type="text" id="itemsPanelSearch" placeholder="Search items or tags" value="${escapeHtml(itemsPanelQuery)}">
        <select id="itemsPanelStatusFilter">
          <option value="all">All Statuses</option>
          <option value="in_store">In Store</option>
          <option value="in_use">In Use</option>
        </select>
        <button type="button" class="btn-secondary" id="itemsPanelFilterReset">Reset</button>
      </div>
      ${tableHtml}`
    : `<p class="empty-state">No items yet.</p>`;

  return `
    <div class="panel">
      <div class="panel-head">
        <h3>Items</h3>
        <div class="node-actions">
          <button class="btn-secondary btn-add" id="detailAddItemBtn">+ Add Item</button>
          <a href="items.html" class="link-more">Manage in All Items →</a>
        </div>
      </div>
      ${bodyHtml}
    </div>`;
}

// storageEditingField: null, or which single field is currently click-to-edit active:
// "name" | "room" | "tags" | "images"
let storageEditingField = null;

function editableIconBtns() {
  return `<button type="button" class="icon-btn editable-save-btn" title="Save">${ICONS.check}</button>
          <button type="button" class="icon-btn delete editable-cancel-btn" title="Cancel">&times;</button>`;
}

function detailNameFieldHtml(rack) {
  if (storageEditingField === "name") {
    return `<span class="editable-field editing" data-field="name">
      <input type="text" id="editFieldInput" class="inline-edit-input" value="${escapeHtml(rack.name)}">
      ${editableIconBtns()}
    </span> <span class="rack-id-badge large">${escapeHtml(rack.id)}</span>`;
  }
  return `<span class="editable-field" data-field="name" title="Click to edit">${escapeHtml(rack.name)} ${ICONS.edit}</span> <span class="rack-id-badge large">${escapeHtml(rack.id)}</span>`;
}

function detailRoomFieldHtml(rack) {
  if (storageEditingField === "room") {
    return `<span class="editable-field editing" data-field="room">
      <div class="select-with-add">
        <select id="editFieldInput"></select>
        <button type="button" class="btn-secondary" id="editFieldRoomAdd" title="Add a new location">+ New</button>
      </div>
      ${editableIconBtns()}
    </span>`;
  }
  return `<span class="editable-field" data-field="room" title="Click to edit">${escapeHtml(roomLabel(rack.storeRoomId))} ${ICONS.edit}</span>`;
}

function detailTagsFieldHtml(rack) {
  if (storageEditingField === "tags") {
    return `<span class="editable-field editing" data-field="tags">
      <div class="tag-input" id="editFieldTagInput">
        <div class="tag-input-chips" id="editFieldTagChips"></div>
        <input type="text" id="editFieldTagText" placeholder="Type a tag and press Enter">
      </div>
      ${editableIconBtns()}
    </span>`;
  }
  const tags = rackTags(rack);
  return `<span class="editable-field" data-field="tags" title="Click to edit">${tagsHtml(tags)}${tags.length ? "" : "<span class=\"muted\">No tags</span>"} ${ICONS.edit}</span>`;
}

function detailImagesFieldHtml(rack) {
  if (storageEditingField === "images") {
    return `
      <div class="editable-field editing" data-field="images">
        <div class="image-input" id="editFieldImageInput">
          <div class="image-input-previews" id="editFieldImagePreviews"></div>
          <label class="image-input-add" for="editFieldImageFile">
            <span class="add-ghost-icon">+</span> Add Pictures
          </label>
          <input type="file" id="editFieldImageFile" accept="image/*" multiple hidden>
        </div>
        ${editableIconBtns()}
      </div>`;
  }
  const images = rackImages(rack);
  return `
    <div class="editable-field editable-field-block" data-field="images" title="Click to edit pictures">
      ${images.length ? productGalleryHtml(images) : `<p class="muted">No pictures yet.</p>`}
      <button type="button" class="btn-secondary editable-pencil-btn">${ICONS.edit} Edit Pictures</button>
    </div>`;
}

function renderDetail() {
  const rack = findRack(currentRackId);
  const container = document.getElementById("detailContent");

  if (!rack) {
    container.innerHTML = `
      <a href="storage.html" class="back-link">← Back to Storage</a>
      <p class="empty-state">Storage "${escapeHtml(currentRackId || "")}" was not found. It may have been deleted.</p>
    `;
    return;
  }

  const totalItems = unitItemCount(rack);

  container.innerHTML = `
    <a href="storage.html" class="back-link">← Back to Storage</a>

    <div class="detail-hero">
      ${detailImagesFieldHtml(rack)}
      <div class="detail-title-row">
        <div class="detail-title-info">
          <h2>${detailNameFieldHtml(rack)}</h2>
          <div class="muted detail-room-row"><span class="inline-icon">${ICONS.door}</span> ${detailRoomFieldHtml(rack)}</div>
        </div>
        <div class="detail-actions">
          <div class="detail-qr-block" title="Scan to open this storage">
            ${rackQrThumbHtml(rack)}
            <button type="button" class="icon-btn" id="detailQrPrintBtn" title="Print QR label">${ICONS.print}</button>
          </div>
          <button class="btn-danger" id="detailDeleteBtn">${ICONS.trash} Delete Storage</button>
        </div>
      </div>
    </div>

    <section class="stats-row stats-row-3">
      <div class="stat-card">
        <div class="stat-icon c-amber">${ICONS.box}</div>
        <div>
          <div class="stat-value" id="detailStatItems">0</div>
          <div class="stat-label">Items Stored</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon c-blue">${ICONS.layers}</div>
        <div>
          <div class="stat-value">${typeBadgeHtml(rack.type)}</div>
          <div class="stat-label">Type</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon c-violet">${ICONS.tag}</div>
        <div>
          <div class="stat-value">${detailTagsFieldHtml(rack)}</div>
          <div class="stat-label">Tags</div>
        </div>
      </div>
    </section>

    ${globalItemsPanelHtml(rack)}
  `;

  animateNumber(document.getElementById("detailStatItems"), totalItems);

  function startEditing(field) {
    storageEditingField = field;
    renderDetail();
  }
  function stopEditing() {
    storageEditingField = null;
    renderDetail();
  }

  if (storageEditingField) {
    const editableWrap = container.querySelector(`.editable-field[data-field="${storageEditingField}"]`);
    editableWrap.querySelector(".editable-cancel-btn").addEventListener("click", stopEditing);

    if (storageEditingField === "name") {
      const input = document.getElementById("editFieldInput");
      input.focus();
      input.select();
      function save() {
        const name = input.value.trim();
        if (!name) { input.focus(); return; }
        rack.name = name;
        saveRacks(racks);
        showToast(`"${rack.name}" updated`, "success");
        stopEditing();
      }
      input.addEventListener("keydown", function (e) {
        if (e.key === "Enter") save();
        if (e.key === "Escape") stopEditing();
      });
      editableWrap.querySelector(".editable-save-btn").addEventListener("click", save);
    }

    if (storageEditingField === "room") {
      const roomSelect = document.getElementById("editFieldInput");
      function refreshRoomSelect(selectedId) {
        roomSelect.innerHTML = rooms.map(function (r) {
          return `<option value="${escapeHtml(r.id)}">${escapeHtml(r.name)}</option>`;
        }).join("");
        roomSelect.value = selectedId || rack.storeRoomId;
      }
      refreshRoomSelect();
      document.getElementById("editFieldRoomAdd").addEventListener("click", function () {
        openQuickAddLocationModal(function (newRoom) { refreshRoomSelect(newRoom.id); });
      });
      function save() {
        rack.storeRoomId = roomSelect.value;
        delete rack.category;
        saveRacks(racks);
        showToast(`"${rack.name}" updated`, "success");
        stopEditing();
      }
      editableWrap.querySelector(".editable-save-btn").addEventListener("click", save);
    }

    if (storageEditingField === "tags") {
      const tagInput = createTagInput(document.getElementById("editFieldTagChips"), document.getElementById("editFieldTagText"), rackTags(rack));
      function save() {
        rack.tags = tagInput.getTags();
        saveRacks(racks);
        showToast(`"${rack.name}" updated`, "success");
        stopEditing();
      }
      editableWrap.querySelector(".editable-save-btn").addEventListener("click", save);
    }

    if (storageEditingField === "images") {
      const imageInput = createImageInput(document.getElementById("editFieldImagePreviews"), document.getElementById("editFieldImageFile"), { initialImages: rackImages(rack) });
      function save() {
        rack.images = imageInput.getImages();
        saveRacks(racks);
        showToast(`"${rack.name}" updated`, "success");
        stopEditing();
      }
      editableWrap.querySelector(".editable-save-btn").addEventListener("click", save);
    }
  } else {
    container.querySelectorAll(".editable-field[data-field]").forEach(function (el) {
      const trigger = el.classList.contains("editable-field-block") ? el.querySelector(".editable-pencil-btn") : el;
      trigger.addEventListener("click", function (e) {
        e.stopPropagation();
        startEditing(el.dataset.field);
      });
    });
  }

  populateQrPrintArea(rack);
  container.querySelector("#detailQrPrintBtn").addEventListener("click", function (e) {
    e.stopPropagation();
    window.print();
  });
  container.querySelector("#detailAddItemBtn").addEventListener("click", function () {
    openAddItemModal(null, rack.id);
  });
  container.querySelector("#detailDeleteBtn").addEventListener("click", function () {
    deleteRack(rack.id, function (deletedRack) {
      setFlashMessage(`"${deletedRack.name}" deleted`, "danger");
      window.location.href = "storage.html";
    });
  });

  container.querySelectorAll(".log-table th[data-sort]").forEach(function (th) {
    th.addEventListener("click", function () {
      const field = th.dataset.sort;
      if (itemsPanelSortField === field) {
        itemsPanelSortDir = itemsPanelSortDir === "asc" ? "desc" : "asc";
      } else {
        itemsPanelSortField = field;
        itemsPanelSortDir = "asc";
      }
      renderDetail();
    });
  });

  const itemsPanelSearchInput = container.querySelector("#itemsPanelSearch");
  if (itemsPanelSearchInput) {
    itemsPanelSearchInput.addEventListener("input", function () {
      itemsPanelQuery = itemsPanelSearchInput.value;
      const cursorPos = itemsPanelSearchInput.selectionStart;
      renderDetail();
      const newInput = document.getElementById("itemsPanelSearch");
      if (newInput) {
        newInput.focus();
        newInput.setSelectionRange(cursorPos, cursorPos);
      }
    });
  }
  const itemsPanelStatusSelect = container.querySelector("#itemsPanelStatusFilter");
  if (itemsPanelStatusSelect) {
    itemsPanelStatusSelect.value = itemsPanelStatusFilter;
    itemsPanelStatusSelect.addEventListener("change", function () {
      itemsPanelStatusFilter = itemsPanelStatusSelect.value;
      renderDetail();
    });
  }
  const itemsPanelFilterReset = container.querySelector("#itemsPanelFilterReset");
  if (itemsPanelFilterReset) {
    itemsPanelFilterReset.addEventListener("click", function () {
      itemsPanelQuery = "";
      itemsPanelStatusFilter = "all";
      renderDetail();
    });
  }

  function stopEditingItemRow() {
    storageEditingItemId = null;
    renderDetail();
  }

  container.querySelectorAll("tr[data-item-id]").forEach(function (row) {
    const item = findGlobalItem(row.dataset.itemId);
    if (!item) return;

    if (storageEditingItemId === item.id) {
      const nameInput = row.querySelector("#rowEditName");
      const qtyInput = row.querySelector("#rowEditQty");
      const tagInput = createTagInput(row.querySelector("#rowEditTagChips"), row.querySelector("#rowEditTagText"), item.tags || []);
      function saveRow() {
        const name = nameInput.value.trim();
        const quantity = parseInt(qtyInput.value, 10);
        if (!name || isNaN(quantity) || quantity < 1) { nameInput.focus(); return; }
        const delta = quantity - item.quantity;
        item.name = name;
        item.quantity = quantity;
        item.tags = tagInput.getTags();
        saveGlobalItems(globalItems);
        if (delta > 0) logTransaction("in", name, delta, rack, null);
        else if (delta < 0) logTransaction("out", name, -delta, rack, null);
        showToast(`"${name}" updated`, "success");
        stopEditingItemRow();
      }
      nameInput.addEventListener("keydown", function (e) {
        if (e.key === "Enter") saveRow();
        if (e.key === "Escape") stopEditingItemRow();
      });
      qtyInput.addEventListener("keydown", function (e) {
        if (e.key === "Enter") saveRow();
        if (e.key === "Escape") stopEditingItemRow();
      });
      row.querySelector(".row-save-btn").addEventListener("click", saveRow);
      row.querySelector(".row-cancel-btn").addEventListener("click", stopEditingItemRow);
      return;
    }

    row.querySelector(".status-picker-btn").addEventListener("click", function (e) {
      e.stopPropagation();
      openMoveItemModal({ raw: item, rack: rack, name: item.name, quantity: item.quantity, storageLabel: rack.name });
    });
    row.querySelector(".row-name-trigger").addEventListener("click", function (e) {
      e.stopPropagation();
      storageEditingItemId = item.id;
      renderDetail();
    });
    row.querySelector(".item-archive-btn").addEventListener("click", function (e) {
      e.stopPropagation();
      archiveGlobalItem(item, rack);
    });
  });
}

window.onRackDataChanged = renderDetail;
window.onItemDataChanged = renderDetail;

// ---------- QR code is always shown inline on the page; this just keeps the
// off-screen printable label (swapped in via @media print) in sync. ----------
function populateQrPrintArea(rack) {
  const detailUrl = new URL(rackDetailUrl(rack.id), window.location.href).href;
  const qr = qrcode(0, "M");
  qr.addData(detailUrl);
  qr.make();
  const svg = qr.createSvgTag({ cellSize: 6, margin: 12, scalable: true });

  document.getElementById("qrPrintCodeBox").innerHTML = svg;
  document.getElementById("qrPrintId").textContent = rack.id;
  document.getElementById("qrPrintName").textContent = rack.name;
}

renderDetail();
