const detailParams = new URLSearchParams(window.location.search);
const currentRackId = detailParams.get("id");

function renderDetail() {
  const rack = findRack(currentRackId);
  const container = document.getElementById("detailContent");

  if (!rack) {
    container.innerHTML = `
      <a href="racks.html" class="back-link">← Back to Racks</a>
      <p class="empty-state">Rack "${escapeHtml(currentRackId || "")}" was not found. It may have been deleted.</p>
    `;
    return;
  }

  const status = statusOf(rack);
  const filled = filledOf(rack);
  const free = Math.max(0, rack.capacity - filled);

  const itemsHtml = rack.items.length === 0
    ? `<p class="empty-state">No items placed in this rack yet.</p>`
    : `<div class="items-list">` + rack.items.map(function (item) {
        const dotColor = getItemColor(item.name).solid;
        return `
          <div class="item-row" data-item-id="${escapeHtml(item.id)}">
            <div class="item-info">
              <span class="item-dot" style="background:${dotColor}"></span>
              <span class="item-name">${escapeHtml(item.name)}</span>
              <span class="item-qty">${item.quantity} slot${item.quantity === 1 ? "" : "s"}</span>
            </div>
            <div class="item-actions">
              <button class="icon-btn item-edit-btn" title="Edit item">✏️</button>
              <button class="icon-btn delete item-delete-btn" title="Remove item">🗑️</button>
            </div>
          </div>`;
      }).join("") + `</div>`;

  container.innerHTML = `
    <a href="racks.html" class="back-link">← Back to Racks</a>

    <div class="detail-title-row">
      <div>
        <h2>${escapeHtml(rack.name)} <span class="rack-id-badge large">${escapeHtml(rack.id)}</span></h2>
        <p class="muted">${escapeHtml(rack.location || "No location set")}</p>
        <div class="rack-sub-meta">
          ${categoryBadgeHtml(rack.category)}
          <span class="rack-layout">${rack.rows} rows × ${rack.columns} columns</span>
        </div>
      </div>
      <div class="detail-actions">
        <button class="btn-secondary" id="detailEditBtn">✏️ Edit Rack</button>
        <button class="btn-danger" id="detailDeleteBtn">🗑️ Delete Rack</button>
      </div>
    </div>

    <section class="stats-row">
      <div class="stat-card">
        <div class="stat-icon c-violet">📥</div>
        <div>
          <div class="stat-value">${rack.capacity}</div>
          <div class="stat-label">Total Capacity</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon c-amber">📦</div>
        <div>
          <div class="stat-value">${filled}</div>
          <div class="stat-label">Items Filled</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon c-green">✅</div>
        <div>
          <div class="stat-value">${free}</div>
          <div class="stat-label">Free Slots</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon c-blue">📊</div>
        <div>
          <div class="stat-value">${status.pct}%</div>
          <div class="stat-label">${status.label}</div>
        </div>
      </div>
    </section>

    <div class="rack-progress-track large">
      <div class="rack-progress-fill ${status.cls}" style="width:${status.pct}%"></div>
    </div>

    <div class="panel">
      <div class="panel-head">
        <h3>Rack Layout</h3>
        <span class="muted">${rack.rows} × ${rack.columns} · ${filled} / ${rack.capacity} slots filled</span>
      </div>
      ${buildItemsPreviewHtml(rack)}
      ${buildSlotGridHtml(rack)}
    </div>

    <div class="panel">
      <div class="panel-head">
        <h3>Items in this Rack</h3>
        <button class="btn-primary btn-add" id="addItemBtn">+ Add Item</button>
      </div>
      ${itemsHtml}
    </div>
  `;

  container.querySelector("#detailEditBtn").addEventListener("click", function () {
    openEditModal(rack);
  });
  container.querySelector("#detailDeleteBtn").addEventListener("click", function () {
    deleteRack(rack.id, function () { window.location.href = "racks.html"; });
  });
  container.querySelector("#addItemBtn").addEventListener("click", function () {
    openItemModal(rack, null);
  });
  container.querySelectorAll(".item-edit-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      const itemRow = btn.closest(".item-row");
      const item = rack.items.find(function (i) { return i.id === itemRow.dataset.itemId; });
      if (item) openItemModal(rack, item);
    });
  });
  container.querySelectorAll(".item-delete-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      const itemRow = btn.closest(".item-row");
      deleteItem(rack, itemRow.dataset.itemId);
    });
  });
}

window.onRackDataChanged = renderDetail;

// ---------- Item modal ----------
const itemModalOverlay = document.getElementById("itemModalOverlay");
const itemForm = document.getElementById("itemForm");
const itemError = document.getElementById("itemError");
let activeItemRackId = null;

function openItemModal(rack, item) {
  itemError.hidden = true;
  itemForm.reset();
  activeItemRackId = rack.id;

  document.getElementById("itemModalTitle").textContent = item ? "Edit Item" : "Add Item";
  document.getElementById("itemSave").textContent = item ? "Save Changes" : "Add Item";
  document.getElementById("itemId").value = item ? item.id : "";
  document.getElementById("itemName").value = item ? item.name : "";
  document.getElementById("itemQuantity").value = item ? item.quantity : "";

  itemModalOverlay.hidden = false;
}

function closeItemModal() {
  itemModalOverlay.hidden = true;
  activeItemRackId = null;
}

document.getElementById("itemModalClose").addEventListener("click", closeItemModal);
document.getElementById("itemCancel").addEventListener("click", closeItemModal);
itemModalOverlay.addEventListener("click", function (e) {
  if (e.target === itemModalOverlay) closeItemModal();
});

itemForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const rack = findRack(activeItemRackId);
  if (!rack) return;

  const id = document.getElementById("itemId").value;
  const name = document.getElementById("itemName").value.trim();
  const quantity = parseInt(document.getElementById("itemQuantity").value, 10);

  if (!name || isNaN(quantity) || quantity < 1) {
    itemError.textContent = "Please enter an item name and a valid quantity.";
    itemError.hidden = false;
    return;
  }

  const currentFilled = filledOf(rack);
  const existing = id ? rack.items.find(function (i) { return i.id === id; }) : null;
  const availableFree = rack.capacity - currentFilled + (existing ? existing.quantity : 0);

  if (quantity > availableFree) {
    itemError.textContent = `Only ${availableFree} slot${availableFree === 1 ? "" : "s"} free in this rack.`;
    itemError.hidden = false;
    return;
  }

  if (existing) {
    existing.name = name;
    existing.quantity = quantity;
  } else {
    rack.items.push({ id: itemId(), name: name, quantity: quantity });
  }

  saveRacks(racks);
  closeItemModal();
  renderDetail();
});

function deleteItem(rack, id) {
  const item = rack.items.find(function (i) { return i.id === id; });
  if (!item) return;
  if (!confirm(`Remove "${item.name}" from ${rack.name}?`)) return;

  rack.items = rack.items.filter(function (i) { return i.id !== id; });
  saveRacks(racks);
  renderDetail();
}

renderDetail();
