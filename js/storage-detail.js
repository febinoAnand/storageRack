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
  const rowsHtml = items.length
    ? `<div class="items-list">` + items.map(function (item) {
        const dotColor = getItemColor(item.name).solid;
        const tags = item.tags && item.tags.length ? `<span class="item-qty">${escapeHtml(item.tags.join(", "))}</span>` : "";
        return `
          <div class="item-row">
            <div class="item-info">
              <span class="item-dot" style="background:${dotColor}"></span>
              <a class="item-name" href="${itemDetailUrl(item.id)}">${escapeHtml(item.name)}</a>
              <span class="item-qty">${item.quantity} unit${item.quantity === 1 ? "" : "s"}</span>
              ${itemStatusBadgeHtml(item.status)}
              ${tags}
            </div>
          </div>`;
      }).join("") + `</div>`
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
      ${rowsHtml}
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
document.getElementById("qrModalCloseBtn").addEventListener("click", closeQrModal);
qrModalOverlay.addEventListener("click", function (e) { if (e.target === qrModalOverlay) closeQrModal(); });
document.getElementById("qrPrintBtn").addEventListener("click", function () { window.print(); });

renderDetail();
