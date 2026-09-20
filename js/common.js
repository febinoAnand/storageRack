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

// ---------- Storage types ----------
const STORAGE_TYPES = {
  shelf: { label: "Shelf", icon: "📚", rootAdd: [{ kind: "level", label: "Shelf Level" }], childAdd: {} },
  rack: { label: "Rack", icon: "🗄️", rootAdd: [{ kind: "level", label: "Level" }], childAdd: { level: [{ kind: "section", label: "Section" }] } },
  cupboard: { label: "Cupboard", icon: "🚪", rootAdd: [{ kind: "shelf", label: "Shelf" }, { kind: "drawer", label: "Drawer" }], childAdd: {} },
  bureau: { label: "Bureau", icon: "🗃️", rootAdd: [{ kind: "drawer", label: "Drawer" }], childAdd: {} },
  wardrobe: { label: "Wardrobe", icon: "👕", rootAdd: [{ kind: "hanging", label: "Hanging Section" }, { kind: "shelf", label: "Shelf" }], childAdd: {} },
  cabinet: { label: "Cabinet", icon: "🗄️", rootAdd: [{ kind: "shelf", label: "Shelf" }, { kind: "compartment", label: "Compartment" }], childAdd: {} },
  box: { label: "Box", icon: "📦", rootAdd: [], childAdd: {}, singleSpace: true },
  custom: { label: "Custom", icon: "🧩", rootAdd: [{ kind: "node", label: "Node" }], childAdd: {}, freeNesting: true },
};

function typeInfo(type) {
  return STORAGE_TYPES[type] || STORAGE_TYPES.custom;
}

// ---------- IDs ----------
function itemId() {
  return "it_" + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

function nodeId() {
  return "nd_" + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

function makeNode(name, kind, capacity) {
  return { id: nodeId(), name: name, kind: kind, capacity: (capacity || capacity === 0) ? capacity : null, children: [], items: [] };
}

// How full a single node is, based on items placed directly on it (not its children).
function nodeAvailability(node) {
  const filled = node.items.reduce(function (s, it) { return s + it.quantity; }, 0);
  if (node.capacity == null) return { filled: filled, capacity: null, remaining: Infinity, isFull: false };
  const remaining = Math.max(0, node.capacity - filled);
  return { filled: filled, capacity: node.capacity, remaining: remaining, isFull: remaining <= 0 };
}

function nodeAvailabilityLabel(node) {
  const a = nodeAvailability(node);
  if (a.capacity == null) return `${a.filled} placed`;
  return a.isFull ? `Full (${a.filled}/${a.capacity})` : `${a.remaining} of ${a.capacity} free`;
}

// Flat list of every node in a rack, each with its full breadcrumb path and availability — used by placement pickers.
function flattenNodesForPlacement(rack) {
  const out = [];
  function walk(nodes, trail) {
    nodes.forEach(function (node) {
      const path = trail.concat([node.name]);
      out.push({ rack: rack, node: node, path: path.join(" → "), availability: nodeAvailability(node) });
      if (node.children && node.children.length) walk(node.children, path);
    });
  }
  walk(rack.nodes, []);
  return out;
}

function makeItem(name, quantity) {
  return { id: itemId(), name: name, quantity: quantity };
}

// ---------- Store rooms ----------
const ROOMS_KEY = "srRoomsV1";

function loadRooms() {
  const raw = localStorage.getItem(ROOMS_KEY);
  if (raw) return JSON.parse(raw);
  const seed = [
    { id: "SR-1001", name: "Store Room 1", location: "Warehouse 1", createdAt: Date.now() - 6 * 86400000 },
    { id: "SR-1002", name: "Store Room 2", location: "Warehouse 2", createdAt: Date.now() - 5 * 86400000 },
  ];
  saveRooms(seed);
  return seed;
}

function saveRooms(data) {
  localStorage.setItem(ROOMS_KEY, JSON.stringify(data));
}

let rooms = loadRooms();

function findRoom(id) {
  return rooms.find(function (r) { return r.id === id; });
}

function roomLabel(id) {
  const room = findRoom(id);
  return room ? room.name : "No store room";
}

// ---------- Roles & permissions ----------
const PERMISSION_MODULES = [
  { key: "storage", label: "Storage Units" },
  { key: "items", label: "Items" },
  { key: "rooms", label: "Store Rooms" },
  { key: "users", label: "Users" },
  { key: "roles", label: "Roles & Permissions" },
];
const PERMISSION_ACTIONS = ["create", "read", "update", "delete"];

function emptyPermissions(defaultValue) {
  const perms = {};
  PERMISSION_MODULES.forEach(function (m) {
    perms[m.key] = {};
    PERMISSION_ACTIONS.forEach(function (a) { perms[m.key][a] = !!defaultValue; });
  });
  return perms;
}

const ROLES_KEY = "srRolesV1";

function loadRoles() {
  const raw = localStorage.getItem(ROLES_KEY);
  if (raw) return JSON.parse(raw);

  const adminPerms = emptyPermissions(true);

  const managerPerms = emptyPermissions(false);
  ["storage", "items", "rooms"].forEach(function (k) {
    managerPerms[k] = { create: true, read: true, update: true, delete: true };
  });
  managerPerms.users = { create: false, read: true, update: false, delete: false };
  managerPerms.roles = { create: false, read: true, update: false, delete: false };

  const viewerPerms = emptyPermissions(false);
  PERMISSION_MODULES.forEach(function (m) { viewerPerms[m.key].read = true; });

  const seed = [
    { id: "RL-1001", name: "Administrator", description: "Full access to every module.", permissions: adminPerms, createdAt: Date.now() - 6 * 86400000 },
    { id: "RL-1002", name: "Manager", description: "Can manage storage, items and rooms. Read-only on users and roles.", permissions: managerPerms, createdAt: Date.now() - 5 * 86400000 },
    { id: "RL-1003", name: "Viewer", description: "Read-only access across the app.", permissions: viewerPerms, createdAt: Date.now() - 4 * 86400000 },
  ];
  saveRoles(seed);
  return seed;
}

function saveRoles(data) {
  localStorage.setItem(ROLES_KEY, JSON.stringify(data));
}

let roles = loadRoles();

function findRole(id) {
  return roles.find(function (r) { return r.id === id; });
}

function roleLabel(id) {
  const role = findRole(id);
  return role ? role.name : "No role";
}

function permissionSummary(permissions) {
  return PERMISSION_MODULES.map(function (m) {
    const p = permissions[m.key];
    const letters = PERMISSION_ACTIONS.map(function (a) {
      return p[a] ? a.charAt(0).toUpperCase() : "·";
    }).join("");
    return `<span class="perm-chip"><strong>${m.label}</strong> ${letters}</span>`;
  }).join("");
}

// ---------- Users ----------
const USERS_KEY = "srUsersV1";

function loadUsers() {
  const raw = localStorage.getItem(USERS_KEY);
  if (raw) return JSON.parse(raw);

  const seed = [
    { id: "US-1001", name: "Admin User", username: "admin", email: "admin@storage.app", roleId: "RL-1001", status: "active", createdAt: Date.now() - 6 * 86400000 },
    { id: "US-1002", name: "Jane Manager", username: "jane.m", email: "jane@storage.app", roleId: "RL-1002", status: "active", createdAt: Date.now() - 4 * 86400000 },
    { id: "US-1003", name: "Sam Viewer", username: "sam.v", email: "sam@storage.app", roleId: "RL-1003", status: "active", createdAt: Date.now() - 2 * 86400000 },
  ];
  saveUsers(seed);
  return seed;
}

function saveUsers(data) {
  localStorage.setItem(USERS_KEY, JSON.stringify(data));
}

let users = loadUsers();

function findUser(id) {
  return users.find(function (u) { return u.id === id; });
}

function nextUserId() {
  let max = 1000;
  users.forEach(function (u) {
    const m = /^US-(\d+)$/.exec(u.id);
    if (m) { const n = parseInt(m[1], 10); if (n > max) max = n; }
  });
  return "US-" + (max + 1);
}

function nextRoleId() {
  let max = 1000;
  roles.forEach(function (r) {
    const m = /^RL-(\d+)$/.exec(r.id);
    if (m) { const n = parseInt(m[1], 10); if (n > max) max = n; }
  });
  return "RL-" + (max + 1);
}

// ---------- Storage units ----------
const STORAGE_KEY = "srStorageV4";

function seedRack(id, name, storeRoomId, type, category, nodes, daysAgo) {
  return { id: id, name: name, storeRoomId: storeRoomId, type: type, category: category, nodes: nodes, createdAt: Date.now() - daysAgo * 86400000 };
}

function loadRacks() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) return JSON.parse(raw);

  const seed = [
    seedRack("ST-1001", "Rack A", "SR-1001", "rack", "Files & Books", [
      (function () {
        const level1 = makeNode("Level 1", "level");
        level1.children = [
          Object.assign(makeNode("Section 1", "section"), { items: [makeItem("Files", 20)] }),
          Object.assign(makeNode("Section 2", "section"), { items: [makeItem("Books", 15)] }),
        ];
        return level1;
      })(),
      Object.assign(makeNode("Level 2", "level"), { items: [makeItem("Boxes", 10)] }),
    ], 8),

    seedRack("ST-1002", "Cupboard A", "SR-1001", "cupboard", "Office Supplies", [
      Object.assign(makeNode("Shelf 1", "shelf"), { items: [makeItem("Documents", 12)] }),
      Object.assign(makeNode("Drawer 1", "drawer"), { items: [makeItem("Electronics", 8)] }),
    ], 7),

    seedRack("ST-1003", "Bureau A", "SR-1001", "bureau", "Stationery", [
      Object.assign(makeNode("Drawer 1", "drawer"), { items: [makeItem("Pens", 30)] }),
      Object.assign(makeNode("Drawer 2", "drawer"), { items: [makeItem("Tools", 10)] }),
    ], 6),

    seedRack("ST-1004", "Wardrobe A", "SR-1001", "wardrobe", "Apparel", [
      Object.assign(makeNode("Hanging Section", "hanging"), { items: [makeItem("Clothes", 25)] }),
      Object.assign(makeNode("Shelf 1", "shelf"), { items: [makeItem("Accessories", 14)] }),
    ], 5),

    seedRack("ST-1005", "Shelf B", "SR-1002", "shelf", "Books", [
      Object.assign(makeNode("Level 1", "level"), { items: [makeItem("Manuals", 18)] }),
      Object.assign(makeNode("Level 2", "level"), { items: [makeItem("Magazines", 9)] }),
    ], 4),

    seedRack("ST-1006", "Cabinet A", "SR-1002", "cabinet", "Hardware", [
      Object.assign(makeNode("Shelf 1", "shelf"), { items: [makeItem("Cables", 22)] }),
      Object.assign(makeNode("Compartment 1", "compartment"), { items: [makeItem("Screws", 50)] }),
    ], 3),

    seedRack("ST-1007", "Box A", "SR-1002", "box", "Miscellaneous", [
      Object.assign(makeNode("Internal Space", "space"), { items: [makeItem("Spare Parts", 6)] }),
    ], 2),

    seedRack("ST-1008", "Custom A", "SR-1002", "custom", "Lab Equipment", [
      (function () {
        const zone = makeNode("Zone A", "node");
        zone.children = [
          Object.assign(makeNode("Bin 1", "node"), { items: [makeItem("Samples", 5)] }),
        ];
        return zone;
      })(),
    ], 1),
  ];
  saveRacks(seed);
  return seed;
}

function saveRacks(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

let racks = loadRacks();

function findRack(id) {
  return racks.find(function (r) { return r.id === id; });
}

function rackDetailUrl(id) {
  return "storage-detail.html?id=" + encodeURIComponent(id);
}

// ---------- Node / item helpers ----------
function walkNodes(nodes, fn) {
  nodes.forEach(function (node) {
    fn(node);
    if (node.children && node.children.length) walkNodes(node.children, fn);
  });
}

function unitItemCount(rack) {
  let total = 0;
  walkNodes(rack.nodes, function (node) {
    total += node.items.reduce(function (s, it) { return s + it.quantity; }, 0);
  });
  return total;
}

function unitNodeCount(rack) {
  let count = 0;
  walkNodes(rack.nodes, function () { count++; });
  return count;
}

function collectAllItems(rack) {
  const all = [];
  walkNodes(rack.nodes, function (node) {
    node.items.forEach(function (it) { all.push(it); });
  });
  return all;
}

function findNodeDeep(nodes, id) {
  for (let i = 0; i < nodes.length; i++) {
    if (nodes[i].id === id) return nodes[i];
    if (nodes[i].children && nodes[i].children.length) {
      const found = findNodeDeep(nodes[i].children, id);
      if (found) return found;
    }
  }
  return null;
}

function findNodePathDeep(nodes, id, trail) {
  for (let i = 0; i < nodes.length; i++) {
    const newTrail = trail.concat([nodes[i].name]);
    if (nodes[i].id === id) return newTrail;
    if (nodes[i].children && nodes[i].children.length) {
      const found = findNodePathDeep(nodes[i].children, id, newTrail);
      if (found) return found;
    }
  }
  return null;
}

// Flat list of every item across every storage unit, with its location context.
function collectAllItemEntries() {
  const entries = [];
  racks.forEach(function (rack) {
    walkNodes(rack.nodes, function (node) {
      node.items.forEach(function (item) {
        entries.push({
          item: item,
          node: node,
          rack: rack,
          path: findNodePathDeep(rack.nodes, node.id, []).join(" → "),
        });
      });
    });
  });
  return entries;
}

// ---------- IN / OUT transaction log ----------
const LOG_KEY = "srItemLogV1";

function loadLog() {
  const raw = localStorage.getItem(LOG_KEY);
  if (raw) return JSON.parse(raw);

  // Seed the log with an "in" entry for every item already in the seed data, so the log isn't empty on first visit.
  const seed = [];
  racks.forEach(function (rack) {
    walkNodes(rack.nodes, function (node) {
      node.items.forEach(function (item) {
        seed.push({
          id: logId(),
          timestamp: rack.createdAt,
          type: "in",
          itemName: item.name,
          quantity: item.quantity,
          rackId: rack.id,
          rackName: rack.name,
          path: findNodePathDeep(rack.nodes, node.id, []).join(" → "),
          user: "admin",
        });
      });
    });
  });
  saveLog(seed);
  return seed;
}

function saveLog(data) {
  localStorage.setItem(LOG_KEY, JSON.stringify(data));
}

function logId() {
  return "LG-" + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

let itemLog = loadLog();

function logTransaction(type, itemName, quantity, rack, path) {
  if (!quantity || quantity <= 0) return;
  itemLog.unshift({
    id: logId(),
    timestamp: Date.now(),
    type: type,
    itemName: itemName,
    quantity: quantity,
    rackId: rack.id,
    rackName: rack.name,
    path: path,
    user: sessionStorage.getItem("srUser") || "admin",
  });
  if (itemLog.length > 1000) itemLog.length = 1000;
  saveLog(itemLog);
}

function removeNodeDeep(nodes, id) {
  const idx = nodes.findIndex(function (n) { return n.id === id; });
  if (idx !== -1) { nodes.splice(idx, 1); return true; }
  for (let i = 0; i < nodes.length; i++) {
    if (nodes[i].children && removeNodeDeep(nodes[i].children, id)) return true;
  }
  return false;
}

// ---------- Shared helpers ----------
function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str == null ? "" : String(str);
  return div.innerHTML;
}

// ---------- Category / item colors ----------
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

function typeBadgeHtml(type) {
  const t = typeInfo(type);
  return `<span class="type-badge">${t.icon} ${t.label}</span>`;
}

function buildItemsPreviewHtml(items) {
  if (items.length === 0) {
    return `<div class="rack-items-preview"><span class="rack-item-chip more">No items placed yet</span></div>`;
  }
  let html = `<div class="rack-items-preview">`;
  items.forEach(function (item) {
    const c = getItemColor(item.name);
    html += `<span class="rack-item-chip" style="background:${c.bg};border-color:${c.border};color:${c.text}">${escapeHtml(item.name)} <span class="qty">× ${item.quantity}</span></span>`;
  });
  html += `</div>`;
  return html;
}

// ---------- Rack card / row builders ----------
function buildRackCard(rack) {
  const totalItems = unitItemCount(rack);
  const nodeCount = unitNodeCount(rack);

  const card = document.createElement("div");
  card.className = "rack-card clickable";
  card.style.borderLeft = `3px solid ${getCategoryColor(rack.category).solid}`;
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
    <div class="rack-location">🚪 ${escapeHtml(roomLabel(rack.storeRoomId))}</div>
    <div class="rack-sub-meta">
      ${typeBadgeHtml(rack.type)}
      ${categoryBadgeHtml(rack.category)}
    </div>
    ${buildItemsPreviewHtml(collectAllItems(rack))}
    <div class="rack-meta">
      <span><strong>${totalItems}</strong> items</span>
      <span><strong>${nodeCount}</strong> location${nodeCount === 1 ? "" : "s"}</span>
    </div>
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
    deleteRack(rack.id, function (deletedRack) {
      showToast(`"${deletedRack.name}" deleted`, "danger");
      if (typeof window.onRackDataChanged === "function") window.onRackDataChanged();
    }, card);
  });

  return card;
}

function buildRackRow(rack) {
  const totalItems = unitItemCount(rack);
  const row = document.createElement("a");
  row.href = rackDetailUrl(rack.id);
  row.className = "rack-row";
  row.style.borderLeftColor = getCategoryColor(rack.category).solid;
  row.innerHTML = `
    <div class="rack-row-main">
      <span class="rack-id-badge">${escapeHtml(rack.id)}</span>
      <span class="rack-row-name">${escapeHtml(rack.name)}</span>
      <span class="rack-row-loc">${escapeHtml(roomLabel(rack.storeRoomId))}</span>
    </div>
    <div class="rack-row-progress">
      ${typeBadgeHtml(rack.type)}
    </div>
    <div class="rack-row-meta">
      <span><strong>${totalItems}</strong> items</span>
    </div>
  `;
  return row;
}

// ---------- Delete rack ----------
function deleteRack(id, onSuccess, elToAnimate) {
  const rack = findRack(id);
  if (!rack) return;
  if (!confirm(`Delete "${rack.name}" (${rack.id})? This cannot be undone.`)) return;

  function finish() {
    racks = racks.filter(function (r) { return r.id !== id; });
    saveRacks(racks);
    if (onSuccess) onSuccess(rack);
  }

  if (elToAnimate) {
    elToAnimate.classList.add("removing");
    elToAnimate.addEventListener("animationend", finish, { once: true });
  } else {
    finish();
  }
}

// ---------- Shared Edit Storage Unit modal (present on storage.html and storage-detail.html) ----------
let editingRackId = null;

function roomOptionsHtml(selectedId) {
  return rooms.map(function (r) {
    return `<option value="${escapeHtml(r.id)}" ${r.id === selectedId ? "selected" : ""}>${escapeHtml(r.name)}</option>`;
  }).join("");
}

function openEditModal(rack) {
  const editModalOverlay = document.getElementById("editModalOverlay");
  if (!editModalOverlay) return;

  document.getElementById("editRackError").hidden = true;
  document.getElementById("editRackForm").reset();
  editingRackId = rack.id;
  document.getElementById("editRackId").value = rack.id;
  document.getElementById("editRackType").value = typeInfo(rack.type).icon + " " + typeInfo(rack.type).label;
  document.getElementById("editRackName").value = rack.name;
  document.getElementById("editRackRoom").innerHTML = roomOptionsHtml(rack.storeRoomId);
  document.getElementById("editRackCategory").value = rack.category || "";
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
    const storeRoomId = document.getElementById("editRackRoom").value;
    const category = document.getElementById("editRackCategory").value.trim();

    if (!name || !storeRoomId) {
      editRackError.textContent = "Please fill in all required fields.";
      editRackError.hidden = false;
      return;
    }

    rack.name = name;
    rack.storeRoomId = storeRoomId;
    rack.category = category;
    saveRacks(racks);
    closeEditModal();
    showToast(`"${rack.name}" updated`, "success");
    if (typeof window.onRackDataChanged === "function") window.onRackDataChanged();
  });
})();

// ---------- Top search (find storage unit by ID) ----------
function runIdSearch() {
  const query = document.getElementById("idSearchInput").value.trim();
  if (!query) return;

  const exact = racks.find(function (r) { return r.id.toLowerCase() === query.toLowerCase(); });
  if (exact) {
    window.location.href = rackDetailUrl(exact.id);
  } else {
    window.location.href = "storage.html?search=" + encodeURIComponent(query);
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

// ---------- Theme toggle ----------
(function initThemeToggle() {
  const themeToggle = document.getElementById("themeToggle");
  if (!themeToggle) return;

  const label = document.getElementById("themeToggleLabel");

  function sync() {
    const isDark = document.documentElement.getAttribute("data-theme") === "dark";
    label.textContent = isDark ? "Dark Mode" : "Light Mode";
  }

  themeToggle.addEventListener("click", function () {
    const isDark = document.documentElement.getAttribute("data-theme") === "dark";
    const next = isDark ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("srTheme", next);
    sync();
  });

  sync();
})();

// ---------- Pagination ----------
const PAGE_SIZE = 6;

function paginateArray(array, page, pageSize) {
  const start = (page - 1) * pageSize;
  return array.slice(start, start + pageSize);
}

// Renders numbered page buttons into `container`. Calls onChange(pageNumber) when a button is clicked.
// Hides itself (empty innerHTML) when everything fits on one page.
function renderPagination(container, totalItems, currentPage, pageSize, onChange) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  if (totalPages <= 1) {
    container.innerHTML = "";
    return;
  }

  let html = `<button class="page-btn page-nav" data-page="${currentPage - 1}" ${currentPage === 1 ? "disabled" : ""}>‹ Prev</button>`;
  for (let p = 1; p <= totalPages; p++) {
    html += `<button class="page-btn ${p === currentPage ? "active" : ""}" data-page="${p}">${p}</button>`;
  }
  html += `<button class="page-btn page-nav" data-page="${currentPage + 1}" ${currentPage === totalPages ? "disabled" : ""}>Next ›</button>`;
  container.innerHTML = html;

  container.querySelectorAll(".page-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      if (btn.disabled) return;
      onChange(parseInt(btn.dataset.page, 10));
    });
  });
}

// ---------- Animation helpers ----------
function animateNumber(el, target, suffix, duration) {
  suffix = suffix || "";
  duration = duration || 700;
  const startTime = performance.now();

  function tick(now) {
    const progress = Math.min(1, (now - startTime) / duration);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(target * eased) + suffix;
    if (progress < 1) requestAnimationFrame(tick);
    else el.textContent = target + suffix;
  }

  requestAnimationFrame(tick);
}
