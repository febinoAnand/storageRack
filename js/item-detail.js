const itemDetailParams = new URLSearchParams(window.location.search);
const currentItemId = itemDetailParams.get("id");

function itemActivityPanelHtml(item) {
  const entries = itemLog.filter(function (e) { return e.itemName === item.name; }).slice(0, 8);
  const rowsHtml = entries.length
    ? entries.map(function (e) {
        const meta = { in: "IN", out: "OUT", in_store: "IN STORE", in_use: "IN USE", removed: "REMOVED" }[e.type] || e.type;
        const d = new Date(e.timestamp);
        return `
          <div class="item-row">
            <div class="item-info">
              <span class="rack-badge ${e.type === "out" ? "full" : ""}">${meta}</span>
              <span class="item-name">${escapeHtml(String(e.quantity))} unit${e.quantity === 1 ? "" : "s"}</span>
              <span class="item-qty">${escapeHtml(e.rackName || "Unassigned")} · ${escapeHtml(d.toLocaleDateString())} · ${escapeHtml(e.user)}</span>
            </div>
          </div>`;
      }).join("")
    : `<p class="empty-state">No activity recorded yet.</p>`;

  return `
    <div class="panel">
      <div class="panel-head">
        <h3>Recent Activity</h3>
        <a href="log.html" class="link-more">Full log →</a>
      </div>
      ${rowsHtml}
    </div>`;
}

function renderItemDetail() {
  const item = findGlobalItem(currentItemId);
  const container = document.getElementById("itemDetailContent");

  if (!item) {
    container.innerHTML = `
      <a href="items.html" class="back-link">← Back to Items</a>
      <p class="empty-state">Item "${escapeHtml(currentItemId || "")}" was not found. It may have been deleted.</p>
    `;
    return;
  }

  const rack = item.storageId ? findRack(item.storageId) : null;
  const isArchived = item.status === "removed";

  const actionsHtml = isArchived
    ? `
      <button class="btn-secondary" id="itemRestoreBtn">${ICONS.restore} Restore</button>
      <button class="btn-danger" id="itemPurgeBtn">${ICONS.trash} Delete Forever</button>`
    : `
      <button class="btn-secondary" id="itemEditBtn">${ICONS.edit} Edit Item</button>
      <button class="btn-danger" id="itemArchiveBtn">${ICONS.archive} Remove to Archive</button>`;

  container.innerHTML = `
    <a href="items.html" class="back-link">← Back to Items</a>

    <div class="detail-title-row">
      <div>
        <h2>${escapeHtml(item.name)} <span class="rack-id-badge large">${escapeHtml(item.id)}</span></h2>
        <p class="muted">
          <span class="inline-icon">${ICONS.door}</span>
          ${rack ? `<a href="${rackDetailUrl(rack.id)}">${escapeHtml(rack.name)} (${escapeHtml(rack.id)})</a>` : "Unassigned"}
        </p>
        <div class="rack-sub-meta">
          ${isArchived ? itemStatusBadgeHtml("removed") : `<button type="button" class="status-picker-btn" title="Move or change status">${itemStatusBadgeHtml(item.status)}</button>`}
          ${tagsHtml(item.tags || [])}
        </div>
        ${imagesPreviewHtml(item.images || [], 56)}
      </div>
      <div class="detail-actions">
        ${actionsHtml}
      </div>
    </div>

    <section class="stats-row stats-row-1">
      <div class="stat-card">
        <div class="stat-icon c-amber">${ICONS.box}</div>
        <div>
          <div class="stat-value" id="itemStatQty">0</div>
          <div class="stat-label">Quantity</div>
        </div>
      </div>
    </section>

    <div class="panel">
      <div class="panel-head">
        <h3>Remarks</h3>
      </div>
      <p class="${item.remarks ? "" : "empty-state"}">${item.remarks ? escapeHtml(item.remarks) : "No remarks."}</p>
    </div>

    ${itemActivityPanelHtml(item)}
  `;

  animateNumber(document.getElementById("itemStatQty"), item.quantity);

  if (isArchived) {
    document.getElementById("itemRestoreBtn").addEventListener("click", function () {
      restoreGlobalItem(item, rack);
    });
    document.getElementById("itemPurgeBtn").addEventListener("click", function () {
      purgeGlobalItem(item, function () { window.location.href = "items.html"; });
    });
  } else {
    document.getElementById("itemEditBtn").addEventListener("click", function () {
      openAddItemModal(item);
    });
    document.getElementById("itemArchiveBtn").addEventListener("click", function () {
      archiveGlobalItem(item, rack);
    });
    const statusBtn = container.querySelector(".status-picker-btn");
    if (statusBtn) {
      statusBtn.addEventListener("click", function () {
        openMoveItemModal({
          raw: item, rack: rack, name: item.name, quantity: item.quantity,
          storageLabel: rack ? rack.name : "Unassigned",
        });
      });
    }
  }
}

window.onItemDataChanged = renderItemDetail;

renderItemDetail();
