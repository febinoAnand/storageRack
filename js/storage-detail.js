const detailParams = new URLSearchParams(window.location.search);
const currentRackId = detailParams.get("id");
let lastAddedItemId = null;
let lastAddedNodeId = null;

const NODE_ICONS = {
  level: "📏", section: "📂", shelf: "📚", drawer: "🗄️",
  hanging: "👔", compartment: "🔲", space: "📦", node: "🧩",
};

function nodeKindLabel(kind) {
  return kind.charAt(0).toUpperCase() + kind.slice(1);
}

function itemRowHtml(item, nodeId) {
  const dotColor = getItemColor(item.name).solid;
  const justAdded = item.id === lastAddedItemId ? " just-added" : "";
  return `
    <div class="item-row${justAdded}" data-item-id="${escapeHtml(item.id)}" data-node-id="${escapeHtml(nodeId)}">
      <div class="item-info">
        <span class="item-dot" style="background:${dotColor}"></span>
        <span class="item-name">${escapeHtml(item.name)}</span>
        <span class="item-qty">${item.quantity} unit${item.quantity === 1 ? "" : "s"}</span>
      </div>
      <div class="item-actions">
        <button class="icon-btn item-edit-btn" title="Edit item">✏️</button>
        <button class="icon-btn delete item-delete-btn" title="Remove item">🗑️</button>
      </div>
    </div>`;
}

function childAddButtonsHtml(rack, node) {
  const t = typeInfo(rack.type);
  let buttons = "";
  const presetChildren = t.childAdd[node.kind];
  if (presetChildren) {
    presetChildren.forEach(function (c) {
      buttons += `<button class="btn-secondary node-add-child-btn" data-node-id="${node.id}" data-kind="${c.kind}" data-label="${escapeHtml(c.label)}">+ ${escapeHtml(c.label)}</button>`;
    });
  } else if (t.freeNesting) {
    buttons += `<button class="btn-secondary node-add-child-btn" data-node-id="${node.id}" data-kind="node" data-label="Node">+ Sub-node</button>`;
  }
  return buttons;
}

function renderNodeHtml(rack, node, depth) {
  const isBox = typeInfo(rack.type).singleSpace;
  const justAddedNode = node.id === lastAddedNodeId ? " just-added" : "";

  const itemsHtml = node.items.length
    ? `<div class="items-list node-items">` + node.items.map(function (it) { return itemRowHtml(it, node.id); }).join("") + `</div>`
    : `<p class="node-empty-hint">No items yet.</p>`;

  const childrenHtml = node.children.map(function (child) { return renderNodeHtml(rack, child, depth + 1); }).join("");

  const avail = nodeAvailability(node);
  const availBadge = avail.capacity != null
    ? `<span class="availability-badge${avail.isFull ? " full" : ""}">${nodeAvailabilityLabel(node)}</span>`
    : "";

  if (isBox) {
    return `
      <div class="node-block" data-node-id="${node.id}">
        <div class="node-header">
          <div class="node-title"><span class="node-icon">📦</span> <span class="node-name">${escapeHtml(node.name)}</span> ${availBadge}</div>
          <div class="node-actions">
            <button class="btn-secondary node-add-item-btn" data-node-id="${node.id}">+ Add Item</button>
          </div>
        </div>
        ${itemsHtml}
      </div>`;
  }

  return `
    <div class="node-block${justAddedNode}" data-node-id="${node.id}" style="margin-left:${depth * 22}px">
      <div class="node-header">
        <div class="node-title">
          <span class="node-icon">${NODE_ICONS[node.kind] || "📦"}</span>
          <span class="node-name">${escapeHtml(node.name)}</span>
          <span class="node-kind-badge">${nodeKindLabel(node.kind)}</span>
          ${availBadge}
        </div>
        <div class="node-actions">
          <button class="btn-secondary node-add-item-btn" data-node-id="${node.id}">+ Item</button>
          ${childAddButtonsHtml(rack, node)}
          <button class="icon-btn node-rename-btn" data-node-id="${node.id}" title="Rename">✏️</button>
          <button class="icon-btn delete node-delete-btn" data-node-id="${node.id}" title="Delete">🗑️</button>
        </div>
      </div>
      ${itemsHtml}
      ${childrenHtml}
    </div>`;
}

function rootAddButtonsHtml(rack) {
  const t = typeInfo(rack.type);
  if (t.singleSpace) return "";
  return t.rootAdd.map(function (r) {
    return `<button class="btn-primary btn-add root-add-btn" data-kind="${r.kind}" data-label="${escapeHtml(r.label)}">+ Add ${escapeHtml(r.label)}</button>`;
  }).join(" ");
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
  const totalNodes = unitNodeCount(rack);
  let emptyNodes = 0;
  walkNodes(rack.nodes, function (n) {
    if (n.items.length === 0 && n.children.length === 0) emptyNodes++;
  });

  const structureHtml = rack.nodes.length === 0
    ? `<p class="empty-state">No structure yet. Use the button above to add your first ${typeInfo(rack.type).rootAdd[0] ? typeInfo(rack.type).rootAdd[0].label.toLowerCase() : "location"}.</p>`
    : rack.nodes.map(function (n) { return renderNodeHtml(rack, n, 0); }).join("");

  lastAddedItemId = null;
  lastAddedNodeId = null;

  container.innerHTML = `
    <a href="storage.html" class="back-link">← Back to Storage</a>

    <div class="detail-title-row">
      <div>
        <h2>${escapeHtml(rack.name)} <span class="rack-id-badge large">${escapeHtml(rack.id)}</span></h2>
        <p class="muted">🚪 ${escapeHtml(roomLabel(rack.storeRoomId))}</p>
        <div class="rack-sub-meta">
          ${typeBadgeHtml(rack.type)}
          ${categoryBadgeHtml(rack.category)}
        </div>
      </div>
      <div class="detail-actions">
        <button class="btn-secondary" id="detailEditBtn">✏️ Edit Storage</button>
        <button class="btn-danger" id="detailDeleteBtn">🗑️ Delete Storage</button>
      </div>
    </div>

    <section class="stats-row stats-row-3">
      <div class="stat-card">
        <div class="stat-icon c-amber">📦</div>
        <div>
          <div class="stat-value" id="detailStatItems">0</div>
          <div class="stat-label">Items Stored</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon c-violet">🗂️</div>
        <div>
          <div class="stat-value" id="detailStatNodes">0</div>
          <div class="stat-label">Locations</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon c-blue">⭕</div>
        <div>
          <div class="stat-value" id="detailStatEmpty">0</div>
          <div class="stat-label">Empty Locations</div>
        </div>
      </div>
    </section>

    <div class="panel">
      <div class="panel-head">
        <h3>Structure</h3>
        <div class="node-actions">${rootAddButtonsHtml(rack)}</div>
      </div>
      <div id="structureTree">${structureHtml}</div>
    </div>
  `;

  animateNumber(document.getElementById("detailStatItems"), totalItems);
  animateNumber(document.getElementById("detailStatNodes"), totalNodes);
  animateNumber(document.getElementById("detailStatEmpty"), emptyNodes);

  container.querySelector("#detailEditBtn").addEventListener("click", function () {
    openEditModal(rack);
  });
  container.querySelector("#detailDeleteBtn").addEventListener("click", function () {
    deleteRack(rack.id, function (deletedRack) {
      setFlashMessage(`"${deletedRack.name}" deleted`, "danger");
      window.location.href = "storage.html";
    });
  });

  wireStructureEvents(rack);
}

window.onRackDataChanged = renderDetail;

// ---------- Event delegation for the structure tree ----------
function wireStructureEvents(rack) {
  const root = document.getElementById("detailContent");

  root.querySelectorAll(".root-add-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      openNodeModal(rack, null, btn.dataset.kind, btn.dataset.label);
    });
  });

  root.querySelectorAll(".node-add-child-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      openNodeModal(rack, btn.dataset.nodeId, btn.dataset.kind, btn.dataset.label);
    });
  });

  root.querySelectorAll(".node-add-item-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      openItemModal(rack, btn.dataset.nodeId, null);
    });
  });

  root.querySelectorAll(".node-rename-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      const node = findNodeDeep(rack.nodes, btn.dataset.nodeId);
      if (node) openNodeModal(rack, null, node.kind, nodeKindLabel(node.kind), node);
    });
  });

  root.querySelectorAll(".node-delete-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      const node = findNodeDeep(rack.nodes, btn.dataset.nodeId);
      if (!node) return;
      if (!confirm(`Delete "${node.name}" and everything inside it?`)) return;
      const el = root.querySelector(`.node-block[data-node-id="${btn.dataset.nodeId}"]`);
      function finish() {
        removeNodeDeep(rack.nodes, node.id);
        saveRacks(racks);
        showToast(`"${node.name}" deleted`, "danger");
        renderDetail();
      }
      if (el) {
        el.classList.add("removing");
        el.addEventListener("animationend", finish, { once: true });
      } else {
        finish();
      }
    });
  });

  root.querySelectorAll(".item-edit-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      const row = btn.closest(".item-row");
      const node = findNodeDeep(rack.nodes, row.dataset.nodeId);
      const item = node && node.items.find(function (i) { return i.id === row.dataset.itemId; });
      if (item) openItemModal(rack, row.dataset.nodeId, item);
    });
  });

  root.querySelectorAll(".item-delete-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      const row = btn.closest(".item-row");
      deleteItem(rack, row.dataset.nodeId, row.dataset.itemId, row);
    });
  });
}

// ---------- Node modal (add / rename) ----------
const nodeModalOverlay = document.getElementById("nodeModalOverlay");
const nodeForm = document.getElementById("nodeForm");
const nodeError = document.getElementById("nodeError");
let nodeModalCtx = null; // { rack, parentNodeId, kind, existingNode }

function openNodeModal(rack, parentNodeId, kind, label, existingNode) {
  nodeError.hidden = true;
  nodeForm.reset();
  nodeModalCtx = { rack: rack, parentNodeId: parentNodeId, kind: kind, existingNode: existingNode || null };
  document.getElementById("nodeModalTitle").textContent = existingNode ? `Rename ${label}` : `Add ${label}`;
  document.getElementById("nodeSave").textContent = existingNode ? "Save" : "Add";
  document.getElementById("nodeName").value = existingNode ? existingNode.name : "";
  document.getElementById("nodeCapacity").value = existingNode && existingNode.capacity != null ? existingNode.capacity : "";
  nodeModalOverlay.hidden = false;
}

function closeNodeModal() {
  nodeModalOverlay.hidden = true;
  nodeModalCtx = null;
}

document.getElementById("nodeModalClose").addEventListener("click", closeNodeModal);
document.getElementById("nodeCancel").addEventListener("click", closeNodeModal);
nodeModalOverlay.addEventListener("click", function (e) { if (e.target === nodeModalOverlay) closeNodeModal(); });

nodeForm.addEventListener("submit", function (e) {
  e.preventDefault();
  if (!nodeModalCtx) return;

  const name = document.getElementById("nodeName").value.trim();
  const capacityRaw = document.getElementById("nodeCapacity").value;
  const capacity = capacityRaw === "" ? null : parseInt(capacityRaw, 10);

  if (!name) {
    nodeError.textContent = "Please enter a name.";
    nodeError.hidden = false;
    return;
  }
  if (capacityRaw !== "" && (isNaN(capacity) || capacity < 1)) {
    nodeError.textContent = "Capacity must be a positive number, or left blank.";
    nodeError.hidden = false;
    return;
  }

  const { rack, parentNodeId, kind, existingNode } = nodeModalCtx;

  if (existingNode) {
    if (capacity != null) {
      const currentlyFilled = existingNode.items.reduce(function (s, it) { return s + it.quantity; }, 0);
      if (capacity < currentlyFilled) {
        nodeError.textContent = `Capacity can't be less than the ${currentlyFilled} unit(s) already placed here.`;
        nodeError.hidden = false;
        return;
      }
    }
    existingNode.name = name;
    existingNode.capacity = capacity;
    showToast(`"${name}" saved`, "success");
  } else {
    const newNode = makeNode(name, kind, capacity);
    lastAddedNodeId = newNode.id;
    if (parentNodeId) {
      const parent = findNodeDeep(rack.nodes, parentNodeId);
      parent.children.push(newNode);
    } else {
      rack.nodes.push(newNode);
    }
    showToast(`"${name}" added`, "success");
  }

  saveRacks(racks);
  closeNodeModal();
  renderDetail();
});

// ---------- Item modal ----------
const itemModalOverlay = document.getElementById("itemModalOverlay");
const itemForm = document.getElementById("itemForm");
const itemError = document.getElementById("itemError");
let activeItemCtx = null; // { rackId, nodeId }

function openItemModal(rack, nodeId, item) {
  itemError.hidden = true;
  itemForm.reset();
  activeItemCtx = { rackId: rack.id, nodeId: nodeId };

  document.getElementById("itemModalTitle").textContent = item ? "Edit Item" : "Add Item";
  document.getElementById("itemSave").textContent = item ? "Save Changes" : "Add Item";
  document.getElementById("itemId").value = item ? item.id : "";
  document.getElementById("itemName").value = item ? item.name : "";
  document.getElementById("itemQuantity").value = item ? item.quantity : "";

  itemModalOverlay.hidden = false;
}

function closeItemModal() {
  itemModalOverlay.hidden = true;
  activeItemCtx = null;
}

document.getElementById("itemModalClose").addEventListener("click", closeItemModal);
document.getElementById("itemCancel").addEventListener("click", closeItemModal);
itemModalOverlay.addEventListener("click", function (e) {
  if (e.target === itemModalOverlay) closeItemModal();
});

itemForm.addEventListener("submit", function (e) {
  e.preventDefault();
  if (!activeItemCtx) return;

  const rack = findRack(activeItemCtx.rackId);
  const node = findNodeDeep(rack.nodes, activeItemCtx.nodeId);
  if (!rack || !node) return;

  const id = document.getElementById("itemId").value;
  const name = document.getElementById("itemName").value.trim();
  const quantity = parseInt(document.getElementById("itemQuantity").value, 10);

  if (!name || isNaN(quantity) || quantity < 1) {
    itemError.textContent = "Please enter an item name and a valid quantity.";
    itemError.hidden = false;
    return;
  }

  const existing = id ? node.items.find(function (i) { return i.id === id; }) : null;

  if (node.capacity != null) {
    const currentlyFilled = node.items.reduce(function (s, it) { return s + it.quantity; }, 0) - (existing ? existing.quantity : 0);
    const available = node.capacity - currentlyFilled;
    if (quantity > available) {
      itemError.textContent = `Only ${Math.max(0, available)} unit(s) of space left here.`;
      itemError.hidden = false;
      return;
    }
  }

  const path = findNodePathDeep(rack.nodes, node.id, []).join(" → ");

  if (existing) {
    const delta = quantity - existing.quantity;
    existing.name = name;
    existing.quantity = quantity;
    if (delta > 0) logTransaction("in", name, delta, rack, path);
    else if (delta < 0) logTransaction("out", name, -delta, rack, path);
    showToast(`"${name}" updated`, "success");
  } else {
    const newItem = makeItem(name, quantity);
    node.items.push(newItem);
    lastAddedItemId = newItem.id;
    logTransaction("in", name, quantity, rack, path);
    showToast(`"${name}" added`, "success");
  }

  saveRacks(racks);
  closeItemModal();
  renderDetail();
});

function deleteItem(rack, nodeId, itemId, itemRow) {
  const node = findNodeDeep(rack.nodes, nodeId);
  if (!node) return;
  const item = node.items.find(function (i) { return i.id === itemId; });
  if (!item) return;
  if (!confirm(`Remove "${item.name}" from ${rack.name}?`)) return;

  const path = findNodePathDeep(rack.nodes, node.id, []).join(" → ");

  function finish() {
    node.items = node.items.filter(function (i) { return i.id !== itemId; });
    saveRacks(racks);
    logTransaction("out", item.name, item.quantity, rack, path);
    showToast(`"${item.name}" removed`, "danger");
    renderDetail();
  }

  if (itemRow) {
    itemRow.classList.add("removing");
    itemRow.addEventListener("animationend", finish, { once: true });
  } else {
    finish();
  }
}

renderDetail();
