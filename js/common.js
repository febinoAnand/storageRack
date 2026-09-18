// ---------- Auth guard ----------
if (sessionStorage.getItem("srLoggedIn") !== "true") {
  window.location.href = "index.html";
}

document.getElementById("userChip").textContent =
  "👤 " + (sessionStorage.getItem("srUser") || "Admin");

document.getElementById("logoutBtn").addEventListener("click", function () {
  sessionStorage.removeItem("srLoggedIn");
  sessionStorage.removeItem("srUser");
  window.location.href = "index.html";
});

// ---------- Rack data ----------
const STORAGE_KEY = "srRacksV2";

function itemId() {
  return "it_" + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

function loadRacks() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) return JSON.parse(raw);

  const seed = [
    {
      id: "RK-1001", name: "Rack A1", location: "Warehouse 1, Aisle 1", category: "Hardware",
      rows: 5, columns: 10, capacity: 50,
      createdAt: Date.now() - 6 * 86400000,
      items: [
        { id: itemId(), name: "Steel Bolts - Crate 12", quantity: 20 },
        { id: itemId(), name: "Packaging Foam", quantity: 12 },
      ],
    },
    {
      id: "RK-1002", name: "Rack A2", location: "Warehouse 1, Aisle 2", category: "Electronics",
      rows: 4, columns: 10, capacity: 40,
      createdAt: Date.now() - 5 * 86400000,
      items: [
        { id: itemId(), name: "Circuit Boards - Pallet A", quantity: 25 },
        { id: itemId(), name: "Circuit Boards - Pallet B", quantity: 15 },
      ],
    },
    {
      id: "RK-1003", name: "Rack B1", location: "Warehouse 2, Aisle 1", category: "Spare Parts",
      rows: 6, columns: 10, capacity: 60,
      createdAt: Date.now() - 4 * 86400000,
      items: [
        { id: itemId(), name: "Spare Motors", quantity: 15 },
      ],
    },
    {
      id: "RK-1004", name: "Rack B2", location: "Warehouse 2, Aisle 2", category: "Packaging",
      rows: 5, columns: 8, capacity: 40,
      createdAt: Date.now() - 3 * 86400000,
      items: [
        { id: itemId(), name: "Bubble Wrap Rolls", quantity: 18 },
        { id: itemId(), name: "Cardboard Boxes - Small", quantity: 10 },
        { id: itemId(), name: "Cardboard Boxes - Large", quantity: 6 },
      ],
    },
    {
      id: "RK-1005", name: "Rack C1", location: "Warehouse 3, Aisle 1", category: "Tools",
      rows: 4, columns: 6, capacity: 24,
      createdAt: Date.now() - 2 * 86400000,
      items: [
        { id: itemId(), name: "Cordless Drills", quantity: 8 },
        { id: itemId(), name: "Wrench Sets", quantity: 5 },
      ],
    },
    {
      id: "RK-1006", name: "Rack C2", location: "Warehouse 3, Aisle 2", category: "Safety Equipment",
      rows: 3, columns: 10, capacity: 30,
      createdAt: Date.now() - 1 * 86400000,
      items: [],
    },
  ];
  saveRacks(seed);
  return seed;
}

function saveRacks(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

let racks = loadRacks();

// ---------- Shared helpers ----------
function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str == null ? "" : String(str);
  return div.innerHTML;
}

function filledOf(rack) {
  return rack.items.reduce(function (sum, it) { return sum + it.quantity; }, 0);
}

function statusOf(rack) {
  const capacity = rack.capacity > 0 ? rack.capacity : 1;
  const pct = Math.min(100, Math.round((filledOf(rack) / capacity) * 100));
  let cls = "";
  let label = "Available";
  if (pct >= 100) { cls = "full"; label = "Full"; }
  else if (pct >= 80) { cls = "warning"; label = "Nearly Full"; }
  return { pct: pct, cls: cls, label: label };
}

function findRack(id) {
  return racks.find(function (r) { return r.id === id; });
}

function rackDetailUrl(id) {
  return "rack-detail.html?id=" + encodeURIComponent(id);
}

// ---------- Category colors ----------
const CATEGORY_PALETTE = [
  { bg: "#e0f2fe", border: "#7dd3fc", text: "#0369a1", solid: "#0ea5e9" }, // sky
  { bg: "#ede9fe", border: "#c4b5fd", text: "#6d28d9", solid: "#7c3aed" }, // violet
  { bg: "#ecfeff", border: "#67e8f9", text: "#0e7490", solid: "#06b6d4" }, // cyan
  { bg: "#fff7ed", border: "#fdba74", text: "#c2410c", solid: "#f97316" }, // orange
  { bg: "#fef2f2", border: "#fca5a5", text: "#b91c1c", solid: "#ef4444" }, // rose
  { bg: "#ecfdf5", border: "#6ee7b7", text: "#047857", solid: "#10b981" }, // emerald
  { bg: "#fdf4ff", border: "#e9d5ff", text: "#a21caf", solid: "#c026d3" }, // fuchsia
  { bg: "#fefce8", border: "#fde047", text: "#a16207", solid: "#eab308" }, // yellow
  { bg: "#eef2ff", border: "#a5b4fc", text: "#4338ca", solid: "#6366f1" }, // indigo
  { bg: "#f0fdfa", border: "#5eead4", text: "#0f766e", solid: "#14b8a6" }, // teal
];

const CATEGORY_COLOR_MAP = {
  "hardware": CATEGORY_PALETTE[0],
  "electronics": CATEGORY_PALETTE[1],
  "spare parts": CATEGORY_PALETTE[2],
  "packaging": CATEGORY_PALETTE[3],
  "tools": CATEGORY_PALETTE[4],
  "safety equipment": CATEGORY_PALETTE[5],
  "consumables": CATEGORY_PALETTE[6],
};

const CATEGORY_NEUTRAL = { bg: "#f1f5f9", border: "#cbd5e1", text: "#475569", solid: "#94a3b8" };

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function getCategoryColor(category) {
  const key = (category || "").toLowerCase().trim();
  if (!key) return CATEGORY_NEUTRAL;
  if (CATEGORY_COLOR_MAP[key]) return CATEGORY_COLOR_MAP[key];
  return CATEGORY_PALETTE[hashString(key) % CATEGORY_PALETTE.length];
}

function getItemColor(name) {
  const key = "item:" + (name || "").toLowerCase().trim();
  return CATEGORY_PALETTE[hashString(key) % CATEGORY_PALETTE.length];
}

function categoryBadgeHtml(category) {
  if (!category) return "";
  const c = getCategoryColor(category);
  return `<span class="rack-category-badge" style="background:${c.bg};border-color:${c.border};color:${c.text}">${escapeHtml(category)}</span>`;
}

function buildSlotGridHtml(rack) {
  const total = rack.rows * rack.columns;
  const cells = new Array(total).fill(null);

  let idx = 0;
  rack.items.forEach(function (item) {
    for (let i = 0; i < item.quantity && idx < total; i++) {
      cells[idx] = item;
      idx++;
    }
  });

  const cellsHtml = cells.map(function (item) {
    if (!item) return `<div class="slot-cell" title="Empty slot"></div>`;
    const color = getItemColor(item.name).solid;
    return `<div class="slot-cell filled" style="background:${color}" title="${escapeHtml(item.name)}"></div>`;
  }).join("");

  return `<div class="slot-grid-wrap"><div class="slot-grid" style="grid-template-columns: repeat(${rack.columns}, 1fr);">${cellsHtml}</div></div>`;
}

function buildItemsPreviewHtml(rack) {
  if (rack.items.length === 0) {
    return `<div class="rack-items-preview"><span class="rack-item-chip more">No items placed yet</span></div>`;
  }
  let html = `<div class="rack-items-preview">`;
  rack.items.forEach(function (item) {
    const c = getItemColor(item.name);
    html += `<span class="rack-item-chip" style="background:${c.bg};border-color:${c.border};color:${c.text}">${escapeHtml(item.name)} <span class="qty">× ${item.quantity}</span></span>`;
  });
  html += `</div>`;
  return html;
}

// ---------- Rack card / row builders ----------
function buildRackCard(rack) {
  const status = statusOf(rack);
  const filled = filledOf(rack);
  const free = Math.max(0, rack.capacity - filled);

  const card = document.createElement("div");
  card.className = "rack-card clickable";
  card.style.borderLeft = `4px solid ${getCategoryColor(rack.category).solid}`;
  card.innerHTML = `
    <div class="rack-card-head">
      <div>
        <span class="rack-id-badge">${escapeHtml(rack.id)}</span>
        <div class="rack-name">${escapeHtml(rack.name)}</div>
      </div>
      <div class="rack-card-actions">
        <button class="icon-btn edit-btn" title="Edit">✏️</button>
        <button class="icon-btn delete delete-btn" title="Delete">🗑️</button>
      </div>
    </div>
    <div class="rack-location">${escapeHtml(rack.location || "No location set")}</div>
    <div class="rack-sub-meta">
      ${categoryBadgeHtml(rack.category)}
      <span class="rack-layout">${rack.rows} × ${rack.columns} layout</span>
    </div>
    ${buildItemsPreviewHtml(rack)}
    <div class="rack-progress-track">
      <div class="rack-progress-fill ${status.cls}" style="width:${status.pct}%"></div>
    </div>
    <div class="rack-meta">
      <span><strong>${filled}</strong> / ${rack.capacity} items</span>
      <span><strong>${free}</strong> free</span>
    </div>
    <span class="rack-badge ${status.cls}">${status.label} · ${status.pct}%</span>
  `;

  card.addEventListener("click", function () {
    window.location.href = rackDetailUrl(rack.id);
  });
  card.querySelector(".edit-btn").addEventListener("click", function (e) {
    e.stopPropagation();
    openEditModal(rack);
  });
  card.querySelector(".delete-btn").addEventListener("click", function (e) {
    e.stopPropagation();
    deleteRack(rack.id, function () {
      if (typeof window.onRackDataChanged === "function") window.onRackDataChanged();
    });
  });

  return card;
}

function buildRackRow(rack) {
  const status = statusOf(rack);
  const filled = filledOf(rack);
  const row = document.createElement("a");
  row.href = rackDetailUrl(rack.id);
  row.className = "rack-row";
  row.style.borderLeftColor = getCategoryColor(rack.category).solid;
  row.innerHTML = `
    <div class="rack-row-main">
      <span class="rack-id-badge">${escapeHtml(rack.id)}</span>
      <span class="rack-row-name">${escapeHtml(rack.name)}</span>
      <span class="rack-row-loc">${escapeHtml(rack.location || "")}</span>
    </div>
    <div class="rack-row-progress">
      <div class="rack-progress-track small">
        <div class="rack-progress-fill ${status.cls}" style="width:${status.pct}%"></div>
      </div>
    </div>
    <div class="rack-row-meta">
      <span>${filled} / ${rack.capacity}</span>
      <span class="rack-badge ${status.cls}">${status.label}</span>
    </div>
  `;
  return row;
}

// ---------- Delete rack ----------
function deleteRack(id, onSuccess) {
  const rack = findRack(id);
  if (!rack) return;
  if (!confirm(`Delete "${rack.name}" (${rack.id})? This cannot be undone.`)) return;

  racks = racks.filter(function (r) { return r.id !== id; });
  saveRacks(racks);
  if (onSuccess) onSuccess();
}

// ---------- Shared Edit Rack modal (present on racks.html and rack-detail.html) ----------
let editingRackId = null;

function updateCapacityPreview(rowsInputId, colsInputId, previewId) {
  const rows = parseInt(document.getElementById(rowsInputId).value, 10);
  const columns = parseInt(document.getElementById(colsInputId).value, 10);
  const preview = document.getElementById(previewId);
  if (!isNaN(rows) && rows > 0 && !isNaN(columns) && columns > 0) {
    preview.textContent = `Total capacity: ${rows * columns} slots`;
  } else {
    preview.textContent = "Total capacity: — slots";
  }
}

function openEditModal(rack) {
  const editModalOverlay = document.getElementById("editModalOverlay");
  if (!editModalOverlay) return;

  document.getElementById("editRackError").hidden = true;
  document.getElementById("editRackForm").reset();
  editingRackId = rack.id;
  document.getElementById("editRackId").value = rack.id;
  document.getElementById("editRackName").value = rack.name;
  document.getElementById("editRackLocation").value = rack.location || "";
  document.getElementById("editRackCategory").value = rack.category || "";
  document.getElementById("editRackRows").value = rack.rows;
  document.getElementById("editRackColumns").value = rack.columns;
  updateCapacityPreview("editRackRows", "editRackColumns", "editRackCapacityPreview");
  editModalOverlay.hidden = false;
}

function closeEditModal() {
  document.getElementById("editModalOverlay").hidden = true;
  editingRackId = null;
}

(function initEditModal() {
  const editModalOverlay = document.getElementById("editModalOverlay");
  if (!editModalOverlay) return;

  const editRackForm = document.getElementById("editRackForm");
  const editRackError = document.getElementById("editRackError");

  ["editRackRows", "editRackColumns"].forEach(function (id) {
    document.getElementById(id).addEventListener("input", function () {
      updateCapacityPreview("editRackRows", "editRackColumns", "editRackCapacityPreview");
    });
  });

  document.getElementById("editModalClose").addEventListener("click", closeEditModal);
  document.getElementById("editRackCancel").addEventListener("click", closeEditModal);
  editModalOverlay.addEventListener("click", function (e) {
    if (e.target === editModalOverlay) closeEditModal();
  });

  editRackForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const rack = findRack(editingRackId);
    if (!rack) return;

    const name = document.getElementById("editRackName").value.trim();
    const location = document.getElementById("editRackLocation").value.trim();
    const category = document.getElementById("editRackCategory").value.trim();
    const rows = parseInt(document.getElementById("editRackRows").value, 10);
    const columns = parseInt(document.getElementById("editRackColumns").value, 10);

    if (!name || isNaN(rows) || rows < 1 || isNaN(columns) || columns < 1) {
      editRackError.textContent = "Please fill in all required fields with valid values.";
      editRackError.hidden = false;
      return;
    }

    const capacity = rows * columns;
    const filled = filledOf(rack);
    if (capacity < filled) {
      editRackError.textContent = `Capacity can't be less than the ${filled} items already placed in this rack.`;
      editRackError.hidden = false;
      return;
    }

    rack.name = name;
    rack.location = location;
    rack.category = category;
    rack.rows = rows;
    rack.columns = columns;
    rack.capacity = capacity;
    saveRacks(racks);
    closeEditModal();
    if (typeof window.onRackDataChanged === "function") window.onRackDataChanged();
  });
})();

// ---------- Top search (find rack by ID) ----------
function runIdSearch() {
  const query = document.getElementById("idSearchInput").value.trim();
  if (!query) return;

  const exact = racks.find(function (r) { return r.id.toLowerCase() === query.toLowerCase(); });
  if (exact) {
    window.location.href = rackDetailUrl(exact.id);
  } else {
    window.location.href = "racks.html?search=" + encodeURIComponent(query);
  }
}

document.getElementById("idSearchBtn").addEventListener("click", runIdSearch);
document.getElementById("idSearchInput").addEventListener("keydown", function (e) {
  if (e.key === "Enter") runIdSearch();
});

// ---------- Sidebar (active nav + mobile toggle) ----------
(function initSidebar() {
  const page = document.body.dataset.page;
  document.querySelectorAll(".nav-item").forEach(function (a) {
    a.classList.toggle("active", a.dataset.route === page);
  });

  const menuToggle = document.getElementById("menuToggle");
  if (menuToggle) {
    menuToggle.addEventListener("click", function () {
      document.getElementById("sidebar").classList.toggle("open");
    });
  }
})();
