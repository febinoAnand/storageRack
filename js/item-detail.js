const itemDetailParams = new URLSearchParams(window.location.search);
const currentItemId = itemDetailParams.get("id");

const ITEM_ACTIVITY_TYPE_META = { in: "IN", out: "OUT", in_store: "IN STORE", in_use: "IN USE", removed: "REMOVED" };
let itemActivityFilter = "all";
let itemActivityFrom = "";
let itemActivityTo = "";

function itemActivityRowsHtml(item) {
  const fromTs = itemActivityFrom ? new Date(itemActivityFrom + "T00:00:00").getTime() : null;
  const toTs = itemActivityTo ? new Date(itemActivityTo + "T23:59:59.999").getTime() : null;

  const entries = itemLog
    .filter(function (e) { return e.itemName === item.name; })
    .filter(function (e) { return itemActivityFilter === "all" || e.type === itemActivityFilter; })
    .filter(function (e) { return fromTs === null || e.timestamp >= fromTs; })
    .filter(function (e) { return toTs === null || e.timestamp <= toTs; })
    .slice(0, 10);

  return entries.length
    ? entries.map(function (e) {
        const meta = ITEM_ACTIVITY_TYPE_META[e.type] || e.type;
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
    : `<p class="empty-state">No activity matches your filters.</p>`;
}

function itemActivityPanelHtml(item) {
  return `
    <div class="panel">
      <div class="panel-head">
        <h3>Recent Activity</h3>
        <a href="log.html" class="link-more">Full log →</a>
      </div>
      <div class="filters-bar activity-filters-bar">
        <select id="itemActivityFilterSelect">
          <option value="all">All Movements</option>
          <option value="in">IN only</option>
          <option value="out">OUT only</option>
          <option value="in_store">In Store only</option>
          <option value="in_use">In Use only</option>
          <option value="removed">Removed only</option>
        </select>
        <label class="date-filter-field">
          <span>From</span>
          <input type="date" id="itemActivityFrom">
        </label>
        <label class="date-filter-field">
          <span>To</span>
          <input type="date" id="itemActivityTo">
        </label>
        <button type="button" class="btn-secondary" id="itemActivityReset">Reset</button>
      </div>
      <div id="itemActivityBody">${itemActivityRowsHtml(item)}</div>
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

  function refreshActivity() {
    document.getElementById("itemActivityBody").innerHTML = itemActivityRowsHtml(item);
  }

  const activityFilterSelect = document.getElementById("itemActivityFilterSelect");
  const activityFromInput = document.getElementById("itemActivityFrom");
  const activityToInput = document.getElementById("itemActivityTo");
  activityFilterSelect.value = itemActivityFilter;
  activityFromInput.value = itemActivityFrom;
  activityToInput.value = itemActivityTo;

  activityFilterSelect.addEventListener("change", function () {
    itemActivityFilter = activityFilterSelect.value;
    refreshActivity();
  });
  activityFromInput.addEventListener("change", function () {
    itemActivityFrom = activityFromInput.value;
    refreshActivity();
  });
  activityToInput.addEventListener("change", function () {
    itemActivityTo = activityToInput.value;
    refreshActivity();
  });
  document.getElementById("itemActivityReset").addEventListener("click", function () {
    itemActivityFilter = "all";
    itemActivityFrom = "";
    itemActivityTo = "";
    activityFilterSelect.value = "all";
    activityFromInput.value = "";
    activityToInput.value = "";
    refreshActivity();
  });
}

window.onItemDataChanged = renderItemDetail;

renderItemDetail();
