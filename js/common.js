// ---------- Icon system (one hand-drawn, monochrome SVG set — no emoji) ----------
function svgIcon(path) {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${path}</svg>`;
}

const ICONS = {
  box: svgIcon('<path d="M21 8l-9-5-9 5 9 5 9-5z"></path><path d="M3 8v8l9 5 9-5V8"></path><path d="M12 13v8"></path>'),
  archive: svgIcon('<rect x="3" y="4" width="18" height="5" rx="1"></rect><rect x="4" y="9" width="16" height="11" rx="1"></rect><line x1="9" y1="13" x2="15" y2="13"></line>'),
  tag: svgIcon('<path d="M20 13.5L13.5 20a1.5 1.5 0 0 1-2.1 0L4 12.6V4h8.6l7.4 7.4a1.5 1.5 0 0 1 0 2.1z"></path><circle cx="8" cy="8" r="1.5" fill="currentColor" stroke="none"></circle>'),
  repeat: svgIcon('<path d="M17 2l4 4-4 4"></path><path d="M21 6H9a4 4 0 0 0-4 4v1"></path><path d="M7 22l-4-4 4-4"></path><path d="M3 18h12a4 4 0 0 0 4-4v-1"></path>'),
  door: svgIcon('<rect x="5" y="3" width="13" height="18" rx="1"></rect><circle cx="14.5" cy="12" r="0.75" fill="currentColor" stroke="none"></circle>'),
  users: svgIcon('<circle cx="9" cy="8" r="3"></circle><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"></path><circle cx="17" cy="9" r="2.4"></circle><path d="M15.3 14.2c2.5.4 4.4 2.4 4.4 5.8"></path>'),
  shield: svgIcon('<path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z"></path>'),
  menu: svgIcon('<line x1="4" y1="7" x2="20" y2="7"></line><line x1="4" y1="12" x2="20" y2="12"></line><line x1="4" y1="17" x2="20" y2="17"></line>'),
  search: svgIcon('<circle cx="11" cy="11" r="7"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>'),
  sun: svgIcon('<circle cx="12" cy="12" r="4"></circle><path d="M12 2v2M12 20v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2 12h2M20 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"></path>'),
  moon: svgIcon('<path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5z"></path>'),
  user: svgIcon('<circle cx="12" cy="8" r="4"></circle><path d="M4 20c0-4.4 3.6-8 8-8s8 3.6 8 8"></path>'),
  edit: svgIcon('<path d="M12 20h9"></path><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>'),
  trash: svgIcon('<polyline points="3 6 5 6 21 6"></polyline><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path><path d="M10 11v6M14 11v6"></path><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"></path>'),
  check: svgIcon('<circle cx="12" cy="12" r="9"></circle><path d="M8 12.5l2.5 2.5L16 9.5"></path>'),
  info: svgIcon('<circle cx="12" cy="12" r="9"></circle><line x1="12" y1="11" x2="12" y2="16"></line><circle cx="12" cy="7.5" r="1" fill="currentColor" stroke="none"></circle>'),
  folder: svgIcon('<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z"></path>'),
  circleSlash: svgIcon('<circle cx="12" cy="12" r="9"></circle><line x1="5" y1="5" x2="19" y2="19"></line>'),
  layers: svgIcon('<polyline points="12 2 2 7 12 12 22 7 12 2"></polyline><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline>'),
  shelf: svgIcon('<rect x="3" y="4" width="18" height="6" rx="1"></rect><rect x="3" y="14" width="18" height="6" rx="1"></rect>'),
  drawer: svgIcon('<rect x="3" y="5" width="18" height="14" rx="2"></rect><line x1="9" y1="12" x2="15" y2="12"></line>'),
  hanging: svgIcon('<path d="M12 3a2 2 0 1 1 2 2c-.5.5-1 1-1 2"></path><path d="M12 7s0 1-2 2L2 14c-1 .6-1 2 .2 2.4L12 20l9.8-3.6c1.2-.4 1.2-1.8.2-2.4l-8-5c-2-1-2-2-2-2"></path>'),
  compartment: svgIcon('<rect x="3" y="3" width="8" height="8" rx="1"></rect><rect x="13" y="3" width="8" height="8" rx="1"></rect><rect x="3" y="13" width="8" height="8" rx="1"></rect><rect x="13" y="13" width="8" height="8" rx="1"></rect>'),
  node: svgIcon('<circle cx="6" cy="6" r="2.3"></circle><circle cx="18" cy="6" r="2.3"></circle><circle cx="12" cy="18" r="2.3"></circle><path d="M8 7.3l2.5 8M16 7.3l-2.5 8M8.4 6h7.2"></path>'),
  cupboard: svgIcon('<rect x="4" y="3" width="16" height="18" rx="1"></rect><line x1="12" y1="3" x2="12" y2="21"></line><circle cx="10" cy="12" r="0.7" fill="currentColor" stroke="none"></circle><circle cx="14" cy="12" r="0.7" fill="currentColor" stroke="none"></circle>'),
  bureau: svgIcon('<rect x="4" y="3" width="16" height="18" rx="1"></rect><line x1="4" y1="9" x2="20" y2="9"></line><line x1="4" y1="15" x2="20" y2="15"></line><line x1="10" y1="6" x2="14" y2="6"></line><line x1="10" y1="12" x2="14" y2="12"></line><line x1="10" y1="18" x2="14" y2="18"></line>'),
  arrowUp: svgIcon('<line x1="12" y1="19" x2="12" y2="5"></line><polyline points="6 11 12 5 18 11"></polyline>'),
  arrowDown: svgIcon('<line x1="12" y1="5" x2="12" y2="19"></line><polyline points="6 13 12 19 18 13"></polyline>'),
  restore: svgIcon('<path d="M3 12a9 9 0 1 0 3.3-6.9"></path><polyline points="3 3 3 8 8 8"></polyline>'),
  qr: svgIcon('<rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect><line x1="14" y1="15" x2="14" y2="21"></line><line x1="21" y1="15" x2="21" y2="21"></line><line x1="17.5" y1="14" x2="17.5" y2="21"></line>'),
  print: svgIcon('<polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect>'),
  chevronLeft: svgIcon('<polyline points="15 18 9 12 15 6"></polyline>'),
  chevronRight: svgIcon('<polyline points="9 18 15 12 9 6"></polyline>'),
};

const NAV_ICONS = { overview: "home", storage: "archive", items: "tag", log: "repeat", rooms: "door", users: "users", roles: "shield" };

ICONS.home = svgIcon('<path d="M3 11l9-7 9 7"></path><path d="M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9"></path>');

(function replaceChromeIcons() {
  document.querySelectorAll(".nav-item[data-route]").forEach(function (a) {
    const span = a.querySelector(".nav-icon");
    const name = NAV_ICONS[a.dataset.route];
    if (span && name) span.innerHTML = ICONS[name];
  });
  document.querySelectorAll(".brand-icon").forEach(function (el) { el.innerHTML = ICONS.box; });
  const menuToggle = document.getElementById("menuToggle");
  if (menuToggle) menuToggle.innerHTML = ICONS.menu;
  const searchBtn = document.getElementById("idSearchBtn");
  if (searchBtn) searchBtn.innerHTML = ICONS.search + " Search";
})();

// ---------- Auth guard ----------
if (sessionStorage.getItem("srLoggedIn") !== "true") {
  window.location.href = "index.html";
}

document.getElementById("userChip").innerHTML =
  ICONS.user + " " + escapeHtml(sessionStorage.getItem("srUser") || "Admin");

document.getElementById("logoutBtn").addEventListener("click", function () {
  sessionStorage.removeItem("srLoggedIn");
  sessionStorage.removeItem("srUser");
  window.location.href = "index.html";
});

// ---------- Storage types ----------
// Purely descriptive now — a storage has no sub-structure, so this only
// drives the type badge/icon shown on it.
const STORAGE_TYPES = {
  shelf: { label: "Shelf", icon: ICONS.shelf },
  rack: { label: "Rack", icon: ICONS.layers },
  cupboard: { label: "Cupboard", icon: ICONS.cupboard },
  bureau: { label: "Bureau", icon: ICONS.bureau },
  wardrobe: { label: "Wardrobe", icon: ICONS.hanging },
  cabinet: { label: "Cabinet", icon: ICONS.compartment },
  box: { label: "Box", icon: ICONS.box },
  custom: { label: "Custom", icon: ICONS.node },
};

function typeInfo(type) {
  return STORAGE_TYPES[type] || STORAGE_TYPES.custom;
}

// Unique, human-readable alphanumeric code for a compartment (level/shelf/drawer/section/etc.), e.g. "CM-1001".
// Kept for any legacy compartment data created before storages became flat.
const NODE_CODE_SEQ_KEY = "srNodeCodeSeqV1";

function nextNodeCode() {
  const seq = parseInt(localStorage.getItem(NODE_CODE_SEQ_KEY) || "1000", 10) + 1;
  localStorage.setItem(NODE_CODE_SEQ_KEY, String(seq));
  return "CM-" + seq;
}

// ---------- Locations (store rooms) ----------
const ROOMS_KEY = "srRoomsV1";

function loadRooms() {
  const raw = localStorage.getItem(ROOMS_KEY);
  if (raw) return JSON.parse(raw);
  const seed = [
    { id: "SR-1001", name: "Location 1", location: "Warehouse 1", createdAt: Date.now() - 6 * 86400000 },
    { id: "SR-1002", name: "Location 2", location: "Warehouse 2", createdAt: Date.now() - 5 * 86400000 },
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
  return room ? room.name : "No location";
}

// ---------- Roles & permissions ----------
const PERMISSION_MODULES = [
  { key: "storage", label: "Storage Units" },
  { key: "items", label: "Items" },
  { key: "rooms", label: "Locations" },
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
    { id: "RL-1002", name: "Manager", description: "Can manage storage, items and locations. Read-only on users and roles.", permissions: managerPerms, createdAt: Date.now() - 5 * 86400000 },
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

function seedRack(id, name, storeRoomId, type, tags, nodes, daysAgo) {
  return { id: id, name: name, storeRoomId: storeRoomId, type: type, tags: tags, images: [], nodes: nodes, createdAt: Date.now() - daysAgo * 86400000 };
}

function backfillNodeCodes(racksData) {
  let changed = false;
  racksData.forEach(function (rack) {
    walkNodes(rack.nodes, function (node) {
      if (!node.code) {
        node.code = nextNodeCode();
        changed = true;
      }
    });
  });
  return changed;
}

function loadRacks() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    const data = JSON.parse(raw);
    if (backfillNodeCodes(data)) saveRacks(data);
    return data;
  }

  // A storage is just a storage — no sub-levels or compartments. Items attach
  // to it directly (see loadGlobalItems below).
  const seed = [
    seedRack("ST-1001", "Spare Parts Rack", "SR-1001", "rack", ["Spare Parts", "Maintenance"], [], 8),
    seedRack("ST-1002", "Cleaning Cupboard", "SR-1001", "cupboard", ["Cleaning Supplies", "Janitorial"], [], 7),
    seedRack("ST-1003", "Paperwork Bureau", "SR-1001", "bureau", ["Documents", "Admin"], [], 6),
    seedRack("ST-1004", "Safety Gear Wardrobe", "SR-1001", "wardrobe", ["Safety Gear", "PPE"], [], 5),
    seedRack("ST-1005", "Retail Shelf 1", "SR-1002", "shelf", ["Retail Stock", "Display"], [], 4),
    seedRack("ST-1006", "Server Cabinet", "SR-1002", "cabinet", ["IT Equipment", "Networking"], [], 3),
    seedRack("ST-1007", "Returns Box", "SR-1002", "box", ["Returns"], [], 2),
    seedRack("ST-1008", "Chem Storage", "SR-1002", "custom", ["Chemicals", "Hazmat"], [], 1),
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

function itemDetailUrl(id) {
  return "item-detail.html?id=" + encodeURIComponent(id);
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
  total += activeGlobalItemsForRack(rack.id).reduce(function (s, it) { return s + it.quantity; }, 0);
  return total;
}

function collectAllItems(rack) {
  const all = [];
  walkNodes(rack.nodes, function (node) {
    node.items.forEach(function (it) { all.push(it); });
  });
  return all;
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

// ---------- Global items (belong to a storage as a whole, or to nothing — not a specific compartment) ----------
const GLOBAL_ITEMS_KEY = "srGlobalItemsV1";

function loadGlobalItems() {
  const raw = localStorage.getItem(GLOBAL_ITEMS_KEY);
  if (raw) {
    const data = JSON.parse(raw);
    let changed = false;
    data.forEach(function (i) {
      if (!i.status) { i.status = "in_store"; changed = true; }
    });
    if (changed) saveGlobalItems(data);
    return data;
  }

  // Seed items belong to a storage as a whole (or nothing) — every item field gets
  // exercised here: ID, tags, remarks, optional storage assignment, and status.
  function d(daysAgo) { return Date.now() - daysAgo * 86400000; }
  const seed = [
    { id: "IT-1001", name: "Hydraulic Hoses", tags: ["Spare Parts"], quantity: 12, remarks: "Check for wear monthly.", storageId: "ST-1001", images: [], status: "in_store", createdAt: d(8) },
    { id: "IT-1002", name: "Bearing Sets", tags: ["Spare Parts"], quantity: 28, remarks: "", storageId: "ST-1001", images: [], status: "in_store", createdAt: d(8) },
    { id: "IT-1003", name: "Floor Cleaner", tags: ["Cleaning Supplies"], quantity: 20, remarks: "", storageId: "ST-1002", images: [], status: "in_store", createdAt: d(7) },
    { id: "IT-1004", name: "Mop Heads", tags: ["Cleaning Supplies"], quantity: 15, remarks: "", storageId: "ST-1002", images: [], status: "in_store", createdAt: d(7) },
    { id: "IT-1005", name: "Invoice Binders", tags: ["Documents"], quantity: 10, remarks: "Archived yearly.", storageId: "ST-1003", images: [], status: "in_store", createdAt: d(6) },
    { id: "IT-1006", name: "Laminator", tags: ["Equipment"], quantity: 1, remarks: "Shared with front office.", storageId: "ST-1003", images: [], status: "in_use", createdAt: d(6) },
    { id: "IT-1007", name: "Hard Hats", tags: ["PPE"], quantity: 24, remarks: "", storageId: "ST-1004", images: [], status: "in_store", createdAt: d(5) },
    { id: "IT-1008", name: "Safety Vests", tags: ["PPE"], quantity: 30, remarks: "", storageId: "ST-1004", images: [], status: "in_store", createdAt: d(5) },
    { id: "IT-1009", name: "Display Mannequins", tags: ["Retail Stock"], quantity: 6, remarks: "", storageId: "ST-1005", images: [], status: "in_store", createdAt: d(4) },
    { id: "IT-1010", name: "Network Switches", tags: ["IT Equipment"], quantity: 9, remarks: "", storageId: "ST-1006", images: [], status: "in_store", createdAt: d(3) },
    { id: "IT-1011", name: "Patch Cables", tags: ["Networking"], quantity: 50, remarks: "", storageId: "ST-1006", images: [], status: "in_store", createdAt: d(3) },
    { id: "IT-1012", name: "Returned Headsets", tags: ["Returns"], quantity: 7, remarks: "Pending inspection.", storageId: "ST-1007", images: [], status: "in_store", createdAt: d(2) },
    { id: "IT-1013", name: "Acetone Bottles", tags: ["Chemicals"], quantity: 5, remarks: "Store away from heat.", storageId: "ST-1008", images: [], status: "in_store", createdAt: d(1) },
    { id: "IT-1014", name: "Spare Forklift Key", tags: ["Equipment"], quantity: 1, remarks: "", storageId: null, images: [], status: "in_store", createdAt: d(1) },
  ];
  saveGlobalItems(seed);
  return seed;
}

function saveGlobalItems(data) {
  localStorage.setItem(GLOBAL_ITEMS_KEY, JSON.stringify(data));
}

let globalItems = loadGlobalItems();

function findGlobalItem(id) {
  return globalItems.find(function (i) { return i.id === id; });
}

function nextItemCode() {
  let max = 1000;
  globalItems.forEach(function (i) {
    const m = /^IT-(\d+)$/.exec(i.id);
    if (m) { const n = parseInt(m[1], 10); if (n > max) max = n; }
  });
  return "IT-" + (max + 1);
}

// All items assigned to a rack, active or archived.
function globalItemsForRack(rackId) {
  return globalItems.filter(function (i) { return i.storageId === rackId; });
}

// Only items that are still in circulation (not removed/archived) — used for stock counts.
function activeGlobalItemsForRack(rackId) {
  return globalItemsForRack(rackId).filter(function (i) { return i.status !== "removed"; });
}

function globalItemStorageLabel(item) {
  if (!item.storageId) return "Unassigned";
  const rack = findRack(item.storageId);
  return rack ? rack.name : "Unassigned";
}

// ---------- Item status (In Store / In Use / Removed-to-Archive) ----------
const ITEM_STATUS_LABELS = { in_store: "In Store", in_use: "In Use", removed: "Removed" };
const ITEM_STATUS_BADGE_CLASS = { in_store: "", in_use: "warning", removed: "neutral" };

function itemStatusBadgeHtml(status) {
  const cls = ITEM_STATUS_BADGE_CLASS[status] || "";
  const label = ITEM_STATUS_LABELS[status] || status;
  return `<span class="rack-badge ${cls}">${escapeHtml(label)}</span>`;
}

// ---------- Item lifecycle actions (shared by items.html and item-detail.html) ----------
function archiveGlobalItem(item, rack, onSuccess) {
  if (!confirm(`Remove "${item.name}" to the archive?`)) return;
  item.status = "removed";
  saveGlobalItems(globalItems);
  logStatusChange(item, "removed", rack);
  showToast(`"${item.name}" moved to archive`, "danger");
  if (onSuccess) onSuccess();
  if (typeof window.onItemDataChanged === "function") window.onItemDataChanged();
}

function restoreGlobalItem(item, rack, onSuccess) {
  item.status = "in_store";
  saveGlobalItems(globalItems);
  logStatusChange(item, "in_store", rack);
  showToast(`"${item.name}" restored`, "success");
  if (onSuccess) onSuccess();
  if (typeof window.onItemDataChanged === "function") window.onItemDataChanged();
}

function purgeGlobalItem(item, onSuccess) {
  if (!confirm(`Permanently delete "${item.name}"? This cannot be undone.`)) return;
  globalItems = globalItems.filter(function (i) { return i.id !== item.id; });
  saveGlobalItems(globalItems);
  showToast(`"${item.name}" permanently deleted`, "danger");
  if (onSuccess) onSuccess();
  if (typeof window.onItemDataChanged === "function") window.onItemDataChanged();
}

// ---------- Shared Add / Edit Item modal (present on items.html and item-detail.html) ----------
let editingGlobalItemId = null;
let itemTagInput = null;
let itemImageInput = null;

function populateRackSelect(selectEl, selectedId) {
  selectEl.innerHTML = `<option value="">— Unassigned —</option>` + racks.map(function (r) {
    return `<option value="${escapeHtml(r.id)}">${escapeHtml(r.name)} (${escapeHtml(r.id)}) — ${escapeHtml(roomLabel(r.storeRoomId))}</option>`;
  }).join("");
  selectEl.value = selectedId || "";
}

function openAddItemModal(existingItem, presetStorageId) {
  const addItemModalOverlay = document.getElementById("addItemModalOverlay");
  if (!addItemModalOverlay) return;

  const addItemPageForm = document.getElementById("addItemPageForm");
  document.getElementById("addItemPageError").hidden = true;
  addItemPageForm.reset();
  populateRackSelect(document.getElementById("placeRackSelect"), existingItem ? existingItem.storageId : presetStorageId);

  editingGlobalItemId = existingItem ? existingItem.id : null;
  document.getElementById("addItemModalTitle").textContent = existingItem ? "Edit Item" : "Add Item";
  document.getElementById("addItemPageSubmit").textContent = existingItem ? "Save Changes" : "Add Item";
  document.getElementById("placeItemEditingId").value = existingItem ? existingItem.id : "";
  document.getElementById("placeItemId").value = existingItem ? existingItem.id : "";
  document.getElementById("placeItemName").value = existingItem ? existingItem.name : "";
  document.getElementById("placeItemQuantity").value = existingItem ? existingItem.quantity : "";
  document.getElementById("placeItemRemarks").value = existingItem ? existingItem.remarks || "" : "";

  itemTagInput = createTagInput(document.getElementById("placeItemTagChips"), document.getElementById("placeItemTagText"), existingItem ? existingItem.tags || [] : []);
  itemImageInput = createImageInput(document.getElementById("placeItemImagePreviews"), document.getElementById("placeItemImageFile"), { initialImages: existingItem ? existingItem.images || [] : [] });

  addItemModalOverlay.hidden = false;
}

function closeAddItemModal() {
  document.getElementById("addItemModalOverlay").hidden = true;
  editingGlobalItemId = null;
}

(function initAddItemModal() {
  const addItemModalOverlay = document.getElementById("addItemModalOverlay");
  if (!addItemModalOverlay) return;

  const addItemPageForm = document.getElementById("addItemPageForm");
  const addItemPageError = document.getElementById("addItemPageError");
  const placeRackSelect = document.getElementById("placeRackSelect");
  const addItemPageBtn = document.getElementById("addItemPageBtn");

  if (addItemPageBtn) addItemPageBtn.addEventListener("click", function () { openAddItemModal(null); });
  document.getElementById("addItemModalClose").addEventListener("click", closeAddItemModal);
  document.getElementById("addItemPageCancel").addEventListener("click", closeAddItemModal);
  addItemModalOverlay.addEventListener("click", function (e) { if (e.target === addItemModalOverlay) closeAddItemModal(); });

  addItemPageForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const name = document.getElementById("placeItemName").value.trim();
    const idRaw = document.getElementById("placeItemId").value.trim();
    const quantity = parseInt(document.getElementById("placeItemQuantity").value, 10);
    const storageId = placeRackSelect.value || null;
    const remarks = document.getElementById("placeItemRemarks").value.trim();

    if (!name || isNaN(quantity) || quantity < 1) {
      addItemPageError.textContent = "Please enter an item name and a valid quantity.";
      addItemPageError.hidden = false;
      return;
    }

    if (idRaw && globalItems.some(function (i) { return i.id.toLowerCase() === idRaw.toLowerCase() && i.id !== editingGlobalItemId; })) {
      addItemPageError.textContent = `Item ID "${idRaw}" is already in use. Choose a different ID.`;
      addItemPageError.hidden = false;
      return;
    }

    const tags = itemTagInput.getTags();
    const images = itemImageInput.getImages();
    const rack = storageId ? findRack(storageId) : null;

    if (editingGlobalItemId) {
      const item = findGlobalItem(editingGlobalItemId);
      const delta = quantity - item.quantity;
      item.name = name;
      item.quantity = quantity;
      item.tags = tags;
      item.remarks = remarks;
      item.images = images;
      item.storageId = storageId;
      saveGlobalItems(globalItems);
      if (delta > 0) logTransaction("in", name, delta, rack, null);
      else if (delta < 0) logTransaction("out", name, -delta, rack, null);
      showToast(`"${name}" updated`, "success");
    } else {
      const item = {
        id: idRaw || nextItemCode(),
        name: name,
        tags: tags,
        quantity: quantity,
        remarks: remarks,
        storageId: storageId,
        images: images,
        status: "in_store",
        createdAt: Date.now(),
      };
      globalItems.push(item);
      saveGlobalItems(globalItems);
      logTransaction("in", name, quantity, rack, null);
      showToast(`"${name}" added`, "success");
    }

    closeAddItemModal();
    if (typeof window.onItemDataChanged === "function") window.onItemDataChanged();
  });
})();

// ---------- Shared Move / Use Item modal (present on items.html and item-detail.html) ----------
let moveItemCtx = null; // { raw, rack, name, quantity, storageLabel }

function openMoveItemModal(entry) {
  const moveItemModalOverlay = document.getElementById("moveItemModalOverlay");
  if (!moveItemModalOverlay) return;

  moveItemCtx = entry;
  document.getElementById("moveItemError").hidden = true;
  document.getElementById("moveItemForm").reset();

  document.getElementById("moveItemContext").textContent =
    `"${entry.name}" — ${entry.quantity} unit${entry.quantity === 1 ? "" : "s"} at ${entry.storageLabel}`;

  const qtyInput = document.getElementById("moveItemQuantity");
  qtyInput.max = entry.quantity;
  qtyInput.value = entry.quantity;

  populateRackSelect(document.getElementById("moveItemStorage"), entry.raw.storageId || "");
  document.getElementById("moveItemStatus").value = entry.raw.status;

  moveItemModalOverlay.hidden = false;
}

function closeMoveItemModal() {
  document.getElementById("moveItemModalOverlay").hidden = true;
  moveItemCtx = null;
}

(function initMoveItemModal() {
  const moveItemModalOverlay = document.getElementById("moveItemModalOverlay");
  if (!moveItemModalOverlay) return;

  const moveItemForm = document.getElementById("moveItemForm");
  const moveItemError = document.getElementById("moveItemError");

  document.getElementById("moveItemModalClose").addEventListener("click", closeMoveItemModal);
  document.getElementById("moveItemCancel").addEventListener("click", closeMoveItemModal);
  moveItemModalOverlay.addEventListener("click", function (e) {
    if (e.target === moveItemModalOverlay) closeMoveItemModal();
  });

  moveItemForm.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!moveItemCtx) return;

    const entry = moveItemCtx;
    const item = entry.raw;
    const quantity = parseInt(document.getElementById("moveItemQuantity").value, 10);
    const destStorageId = document.getElementById("moveItemStorage").value || null;
    const destStatus = document.getElementById("moveItemStatus").value;

    if (isNaN(quantity) || quantity < 1 || quantity > item.quantity) {
      moveItemError.textContent = `Enter a quantity between 1 and ${item.quantity}.`;
      moveItemError.hidden = false;
      return;
    }

    const sourceRack = entry.rack;
    const destRack = destStorageId ? findRack(destStorageId) : null;
    const storageChanged = destStorageId !== (item.storageId || null);
    const statusChanged = destStatus !== item.status;

    if (quantity === item.quantity && !storageChanged && !statusChanged) {
      moveItemError.textContent = "Nothing changed — pick a different quantity, storage, or status.";
      moveItemError.hidden = false;
      return;
    }

    if (quantity === item.quantity) {
      // Taking everything — update this item in place, no split needed.
      item.storageId = destStorageId;
      item.status = destStatus;
      saveGlobalItems(globalItems);
      if (storageChanged) {
        logTransaction("out", item.name, quantity, sourceRack, null);
        logTransaction("in", item.name, quantity, destRack, null);
      }
      if (statusChanged) logStatusChange(item, destStatus, destRack);
    } else {
      // Taking part of it — split it into a new entry, leave the rest where it was.
      item.quantity -= quantity;
      const moved = {
        id: nextItemCode(), name: item.name, tags: (item.tags || []).slice(),
        quantity: quantity, remarks: item.remarks || "", images: (item.images || []).slice(),
        storageId: destStorageId, status: destStatus, createdAt: Date.now(),
      };
      globalItems.push(moved);
      saveGlobalItems(globalItems);
      if (storageChanged) {
        logTransaction("out", item.name, quantity, sourceRack, null);
        logTransaction("in", item.name, quantity, destRack, null);
      }
      if (statusChanged) logStatusChange(moved, destStatus, destRack);
    }

    showToast(
      storageChanged
        ? `Moved ${quantity} unit${quantity === 1 ? "" : "s"} of "${item.name}" to ${destRack ? destRack.name : "Unassigned"}`
        : `${quantity} unit${quantity === 1 ? "" : "s"} of "${item.name}" marked ${ITEM_STATUS_LABELS[destStatus]}`,
      "success"
    );

    closeMoveItemModal();
    if (typeof window.onItemDataChanged === "function") window.onItemDataChanged();
  });
})();

// ---------- IN / OUT transaction log ----------
const LOG_KEY = "srItemLogV1";

// A handful of "out" examples, so the log doesn't read as all stock-ins.
function sampleOutLogEntries() {
  const ONE_DAY = 86400000;
  const examples = [
    { rackId: "ST-1001", rackName: "Spare Parts Rack", itemName: "Hydraulic Hoses", quantity: 3, user: "jane.m" },
    { rackId: "ST-1002", rackName: "Cleaning Cupboard", itemName: "Floor Cleaner", quantity: 4, user: "sam.v" },
    { rackId: "ST-1003", rackName: "Paperwork Bureau", itemName: "Invoice Binders", quantity: 2, user: "admin" },
    { rackId: "ST-1004", rackName: "Safety Gear Wardrobe", itemName: "Hard Hats", quantity: 5, user: "jane.m" },
    { rackId: "ST-1006", rackName: "Server Cabinet", itemName: "Patch Cables", quantity: 10, user: "admin" },
  ];
  const out = [];
  examples.forEach(function (ex) {
    const rack = findRack(ex.rackId);
    if (!rack) return;
    out.push({
      id: logId(),
      timestamp: rack.createdAt + ONE_DAY,
      type: "out",
      itemName: ex.itemName,
      quantity: ex.quantity,
      rackId: ex.rackId,
      rackName: ex.rackName,
      path: null,
      user: ex.user,
    });
  });
  return out;
}

function loadLog() {
  const raw = localStorage.getItem(LOG_KEY);
  if (raw) {
    const data = JSON.parse(raw);
    if (data.length && !data.some(function (e) { return e.type === "out"; })) {
      const withOut = data.concat(sampleOutLogEntries());
      saveLog(withOut);
      return withOut;
    }
    return data;
  }

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

  // Also log an "in" entry for each seeded global item.
  globalItems.forEach(function (item) {
    const rack = item.storageId ? findRack(item.storageId) : null;
    seed.push({
      id: logId(),
      timestamp: item.createdAt,
      type: "in",
      itemName: item.name,
      quantity: item.quantity,
      rackId: rack ? rack.id : "",
      rackName: rack ? rack.name : "Unassigned",
      path: null,
      user: "admin",
    });
  });

  seed.push.apply(seed, sampleOutLogEntries());

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
    rackId: rack ? rack.id : "",
    rackName: rack ? rack.name : "Unassigned",
    path: path,
    user: sessionStorage.getItem("srUser") || "admin",
  });
  if (itemLog.length > 1000) itemLog.length = 1000;
  saveLog(itemLog);
}

// Logs a status change (In Store / In Use / Removed) — not a quantity movement, so it's
// recorded separately from logTransaction's "in"/"out" entries.
function logStatusChange(item, newStatus, rack) {
  itemLog.unshift({
    id: logId(),
    timestamp: Date.now(),
    type: newStatus,
    itemName: item.name,
    quantity: item.quantity,
    rackId: rack ? rack.id : "",
    rackName: rack ? rack.name : "Unassigned",
    path: null,
    user: sessionStorage.getItem("srUser") || "admin",
  });
  if (itemLog.length > 1000) itemLog.length = 1000;
  saveLog(itemLog);
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

// A storage unit's tags. New storages store `tags: string[]`; older/seed data
// only has a single `category` string, so fall back to that as a one-item list.
function rackTags(rack) {
  if (Array.isArray(rack.tags) && rack.tags.length) return rack.tags;
  if (rack.category) return [rack.category];
  return [];
}

function tagsHtml(tags) {
  return tags.map(function (t) { return categoryBadgeHtml(t); }).join("");
}

function rackImages(rack) {
  return Array.isArray(rack.images) ? rack.images : [];
}

function imagesPreviewHtml(images, size) {
  if (!images.length) return "";
  size = size || 44;
  return `<div class="rack-images-preview">` + images.map(function (src) {
    return `<img class="rack-image-thumb" src="${src}" alt="" title="Click to view" style="width:${size}px;height:${size}px">`;
  }).join("") + `</div>`;
}

// ---------- Image lightbox (click any picture thumbnail, anywhere, to view it full-size) ----------
let lightboxImages = [];
let lightboxIndex = 0;

function buildLightbox() {
  let el = document.getElementById("imageLightbox");
  if (el) return el;

  el = document.createElement("div");
  el.id = "imageLightbox";
  el.className = "lightbox-overlay";
  el.hidden = true;
  el.innerHTML = `
    <button type="button" class="lightbox-close" title="Close">&times;</button>
    <button type="button" class="lightbox-nav lightbox-prev" title="Previous">${ICONS.chevronLeft}</button>
    <img class="lightbox-img" src="" alt="">
    <button type="button" class="lightbox-nav lightbox-next" title="Next">${ICONS.chevronRight}</button>
    <div class="lightbox-counter"></div>
  `;
  document.body.appendChild(el);

  function close() { el.hidden = true; }
  function show(i) {
    lightboxIndex = (i + lightboxImages.length) % lightboxImages.length;
    el.querySelector(".lightbox-img").src = lightboxImages[lightboxIndex];
    const multi = lightboxImages.length > 1;
    el.querySelector(".lightbox-prev").hidden = !multi;
    el.querySelector(".lightbox-next").hidden = !multi;
    el.querySelector(".lightbox-counter").textContent = multi ? `${lightboxIndex + 1} / ${lightboxImages.length}` : "";
    el.querySelector(".lightbox-counter").hidden = !multi;
  }

  el.querySelector(".lightbox-close").addEventListener("click", close);
  el.querySelector(".lightbox-prev").addEventListener("click", function () { show(lightboxIndex - 1); });
  el.querySelector(".lightbox-next").addEventListener("click", function () { show(lightboxIndex + 1); });
  el.addEventListener("click", function (e) { if (e.target === el) close(); });
  document.addEventListener("keydown", function (e) {
    if (el.hidden) return;
    if (e.key === "Escape") close();
    else if (e.key === "ArrowLeft") show(lightboxIndex - 1);
    else if (e.key === "ArrowRight") show(lightboxIndex + 1);
  });

  el._show = show;
  return el;
}

function openLightbox(images, startIndex) {
  const el = buildLightbox();
  lightboxImages = images;
  el._show(startIndex || 0);
  el.hidden = false;
}

document.addEventListener("click", function (e) {
  const thumb = e.target.closest(".rack-image-thumb");
  if (!thumb) return;
  e.stopPropagation();
  const container = thumb.closest(".rack-images-preview") || thumb.parentElement;
  const thumbs = Array.from(container.querySelectorAll(".rack-image-thumb"));
  openLightbox(thumbs.map(function (img) { return img.src; }), thumbs.indexOf(thumb));
}, true);

// ---------- Shared tag-input / image-input controls (Add + Edit storage forms) ----------
function createTagInput(chipsEl, textEl, initialTags) {
  let tags = (initialTags || []).slice();

  function render() {
    chipsEl.innerHTML = tags.map(function (t, i) {
      return `<span class="tag-chip">${escapeHtml(t)}<button type="button" class="tag-chip-remove" data-i="${i}">&times;</button></span>`;
    }).join("");
    chipsEl.querySelectorAll(".tag-chip-remove").forEach(function (btn) {
      btn.addEventListener("click", function () {
        tags.splice(parseInt(btn.dataset.i, 10), 1);
        render();
      });
    });
  }

  function addFromText() {
    const raw = textEl.value.split(",");
    raw.forEach(function (part) {
      const v = part.trim();
      if (v && tags.indexOf(v) === -1) tags.push(v);
    });
    textEl.value = "";
    render();
  }

  textEl.addEventListener("keydown", function (e) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addFromText();
    } else if (e.key === "Backspace" && !textEl.value && tags.length) {
      tags.pop();
      render();
    }
  });
  textEl.addEventListener("blur", function () {
    if (textEl.value.trim()) addFromText();
  });

  render();

  return {
    getTags: function () { return tags.slice(); },
    setTags: function (next) { tags = (next || []).slice(); render(); },
  };
}

function createImageInput(previewsEl, fileEl, options) {
  const maxCount = (options && options.maxCount) || 5;
  const maxBytes = (options && options.maxBytes) || 2 * 1024 * 1024;
  let images = (options && options.initialImages || []).slice();

  function render() {
    previewsEl.innerHTML = images.map(function (src, i) {
      return `<div class="image-input-thumb"><img src="${src}" alt=""><button type="button" class="image-input-remove" data-i="${i}">&times;</button></div>`;
    }).join("");
    previewsEl.querySelectorAll(".image-input-remove").forEach(function (btn) {
      btn.addEventListener("click", function () {
        images.splice(parseInt(btn.dataset.i, 10), 1);
        render();
      });
    });
  }

  fileEl.addEventListener("change", function () {
    const files = Array.from(fileEl.files || []);
    files.forEach(function (file) {
      if (images.length >= maxCount) {
        showToast(`You can attach up to ${maxCount} pictures`, "danger");
        return;
      }
      if (file.size > maxBytes) {
        showToast(`"${file.name}" is too large (max ${Math.round(maxBytes / 1024 / 1024)}MB)`, "danger");
        return;
      }
      const reader = new FileReader();
      reader.onload = function () {
        images.push(reader.result);
        render();
      };
      reader.readAsDataURL(file);
    });
    fileEl.value = "";
  });

  render();

  return {
    getImages: function () { return images.slice(); },
    setImages: function (next) { images = (next || []).slice(); render(); },
  };
}

function typeBadgeHtml(type) {
  const t = typeInfo(type);
  return `<span class="type-badge"><span class="badge-icon">${t.icon}</span>${t.label}</span>`;
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

  const tags = rackTags(rack);
  const images = rackImages(rack);

  const card = document.createElement("div");
  card.className = "rack-card clickable";
  card.style.borderLeft = `3px solid ${getCategoryColor(tags[0] || "").solid}`;
  card.innerHTML = `
    <div class="rack-card-head">
      <div>
        <span class="rack-id-badge">${escapeHtml(rack.id)}</span>
        <div class="rack-name">${escapeHtml(rack.name)}</div>
      </div>
      <div class="rack-card-actions">
        <button class="icon-btn edit-btn" title="Edit">${ICONS.edit}</button>
        <button class="icon-btn delete delete-btn" title="Delete">${ICONS.trash}</button>
      </div>
    </div>
    <div class="rack-location"><span class="inline-icon">${ICONS.door}</span> ${escapeHtml(roomLabel(rack.storeRoomId))}</div>
    <div class="rack-sub-meta">
      ${typeBadgeHtml(rack.type)}
      ${tagsHtml(tags)}
    </div>
    ${imagesPreviewHtml(images)}
    ${buildItemsPreviewHtml(collectAllItems(rack).concat(activeGlobalItemsForRack(rack.id)))}
    <div class="rack-meta">
      <span><strong>${totalItems}</strong> items</span>
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
  row.style.borderLeftColor = getCategoryColor(rackTags(rack)[0] || "").solid;
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

function buildAddGhostCard(label, onClick) {
  const card = document.createElement("div");
  card.className = "rack-card clickable add-ghost-card";
  card.innerHTML = `<span class="add-ghost-icon">+</span><span>${escapeHtml(label)}</span>`;
  card.addEventListener("click", onClick);
  return card;
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

let editTagInput = null;
let editImageInput = null;

function openEditModal(rack) {
  const editModalOverlay = document.getElementById("editModalOverlay");
  if (!editModalOverlay) return;

  document.getElementById("editRackError").hidden = true;
  document.getElementById("editRackForm").reset();
  editingRackId = rack.id;
  document.getElementById("editRackId").value = rack.id;
  document.getElementById("editRackType").value = typeInfo(rack.type).label;
  document.getElementById("editRackName").value = rack.name;
  document.getElementById("editRackRoom").innerHTML = roomOptionsHtml(rack.storeRoomId);
  editTagInput = createTagInput(document.getElementById("editRackTagChips"), document.getElementById("editRackTagText"), rackTags(rack));
  editImageInput = createImageInput(document.getElementById("editRackImagePreviews"), document.getElementById("editRackImageFile"), { initialImages: rackImages(rack) });
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

    if (!name || !storeRoomId) {
      editRackError.textContent = "Please fill in all required fields.";
      editRackError.hidden = false;
      return;
    }

    rack.name = name;
    rack.storeRoomId = storeRoomId;
    rack.tags = editTagInput ? editTagInput.getTags() : rackTags(rack);
    rack.images = editImageInput ? editImageInput.getImages() : rackImages(rack);
    delete rack.category;
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
