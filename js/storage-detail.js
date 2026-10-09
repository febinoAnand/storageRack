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

function globalItemsPanelHtml(rack) {
  const items = activeGlobalItemsForRack(rack.id);
  const bodyHtml = items.length
    ? `<div class="log-table-wrap">
        <table class="log-table">
          <thead>
            <tr><th>Item</th><th>Tags</th><th>Status</th><th>Qty</th><th>Actions</th></tr>
          </thead>
          <tbody>
            ${items.map(function (item) {
              const dotColor = getItemColor(item.name).solid;
              const tagsText = item.tags && item.tags.length ? item.tags.join(", ") : "—";
              return `
                <tr data-item-id="${escapeHtml(item.id)}">
                  <td data-label="Item"><span class="item-dot" style="background:${dotColor};display:inline-block;margin-right:6px;"></span><a href="${itemDetailUrl(item.id)}">${escapeHtml(item.name)}</a></td>
                  <td data-label="Tags" class="muted">${escapeHtml(tagsText)}</td>
                  <td data-label="Status"><button type="button" class="status-picker-btn" title="Move or change status">${itemStatusBadgeHtml(item.status)}</button></td>
                  <td data-label="Qty"><strong>${item.quantity}</strong></td>
                  <td data-label="Actions">
                    <button class="icon-btn item-edit-btn" title="Edit">${ICONS.edit}</button>
                    <button class="icon-btn delete item-archive-btn" title="Remove (send to Archive)">${ICONS.archive}</button>
                  </td>
                </tr>`;
            }).join("")}
          </tbody>
        </table>
      </div>`
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
      ${productGalleryHtml(rackImages(rack))}
      <div class="detail-title-row">
        <div>
          <h2>${escapeHtml(rack.name)} <span class="rack-id-badge large">${escapeHtml(rack.id)}</span></h2>
          <p class="muted"><span class="inline-icon">${ICONS.door}</span> ${escapeHtml(roomLabel(rack.storeRoomId))}</p>
          <div class="rack-sub-meta">
            ${typeBadgeHtml(rack.type)}
            ${tagsHtml(rackTags(rack))}
          </div>
        </div>
        <div class="detail-actions">
          <button class="btn-secondary" id="detailQrBtn">${ICONS.qr} QR Code</button>
          <button class="btn-secondary" id="detailEditBtn">${ICONS.edit} Edit Storage</button>
          <button class="btn-danger" id="detailDeleteBtn">${ICONS.trash} Delete Storage</button>
        </div>
      </div>
    </div>

    <section class="stats-row stats-row-1">
      <div class="stat-card">
        <div class="stat-icon c-amber">${ICONS.box}</div>
        <div>
          <div class="stat-value" id="detailStatItems">0</div>
          <div class="stat-label">Items Stored</div>
        </div>
      </div>
    </section>

    ${globalItemsPanelHtml(rack)}
  `;

  animateNumber(document.getElementById("detailStatItems"), totalItems);

  container.querySelector("#detailQrBtn").addEventListener("click", function () {
    openQrModal(rack);
  });
  container.querySelector("#detailAddItemBtn").addEventListener("click", function () {
    openAddItemModal(null, rack.id);
  });
  container.querySelector("#detailEditBtn").addEventListener("click", function () {
    openEditModal(rack);
  });
  container.querySelector("#detailDeleteBtn").addEventListener("click", function () {
    deleteRack(rack.id, function (deletedRack) {
      setFlashMessage(`"${deletedRack.name}" deleted`, "danger");
      window.location.href = "storage.html";
    });
  });

  container.querySelectorAll("tr[data-item-id]").forEach(function (row) {
    const item = findGlobalItem(row.dataset.itemId);
    if (!item) return;
    row.querySelector(".status-picker-btn").addEventListener("click", function (e) {
      e.stopPropagation();
      openMoveItemModal({ raw: item, rack: rack, name: item.name, quantity: item.quantity, storageLabel: rack.name });
    });
    row.querySelector(".item-edit-btn").addEventListener("click", function (e) {
      e.stopPropagation();
      openAddItemModal(item);
    });
    row.querySelector(".item-archive-btn").addEventListener("click", function (e) {
      e.stopPropagation();
      archiveGlobalItem(item, rack);
    });
  });
}

window.onRackDataChanged = renderDetail;
window.onItemDataChanged = renderDetail;

// ---------- QR Code modal ----------
const qrModalOverlay = document.getElementById("qrModalOverlay");

function openQrModal(rack) {
  const detailUrl = new URL(rackDetailUrl(rack.id), window.location.href).href;
  const qr = qrcode(0, "M");
  qr.addData(detailUrl);
  qr.make();
  const svg = qr.createSvgTag({ cellSize: 6, margin: 12, scalable: true });

  document.getElementById("qrCodeBox").innerHTML = svg;
  document.getElementById("qrCodeId").textContent = rack.id;
  document.getElementById("qrCodeName").textContent = rack.name;

  document.getElementById("qrPrintCodeBox").innerHTML = svg;
  document.getElementById("qrPrintId").textContent = rack.id;
  document.getElementById("qrPrintName").textContent = rack.name;

  qrModalOverlay.hidden = false;
}

function closeQrModal() {
  qrModalOverlay.hidden = true;
}

document.getElementById("qrModalClose").addEventListener("click", closeQrModal);
qrModalOverlay.addEventListener("click", function (e) { if (e.target === qrModalOverlay) closeQrModal(); });
document.getElementById("qrPrintBtn").addEventListener("click", function () { window.print(); });

renderDetail();
