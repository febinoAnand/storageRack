function roomUnitCount(roomId) {
  return racks.filter(function (r) { return r.storeRoomId === roomId; }).length;
}

function nextRoomId() {
  let max = 1000;
  rooms.forEach(function (r) {
    const m = /^SR-(\d+)$/.exec(r.id);
    if (m) {
      const n = parseInt(m[1], 10);
      if (n > max) max = n;
    }
  });
  return "SR-" + (max + 1);
}

let roomCurrentPage = 1;
let roomSortField = "name";
let roomSortDir = "asc";

function buildRoomEntry(room) {
  return { room: room, name: room.name, location: room.location || "", unitCount: roomUnitCount(room.id) };
}

function sortRoomEntries(list) {
  const dir = roomSortDir === "asc" ? 1 : -1;
  return list.slice().sort(function (a, b) {
    let av = a[roomSortField];
    let bv = b[roomSortField];
    if (typeof av === "string") { av = av.toLowerCase(); bv = bv.toLowerCase(); }
    if (av < bv) return -1 * dir;
    if (av > bv) return 1 * dir;
    return 0;
  });
}

function syncRoomSortIndicators() {
  document.querySelectorAll(".log-table th[data-sort]").forEach(function (th) {
    const arrow = th.querySelector(".sort-arrow");
    if (th.dataset.sort === roomSortField) {
      th.classList.add("sorted");
      arrow.textContent = roomSortDir === "asc" ? "▲" : "▼";
    } else {
      th.classList.remove("sorted");
      arrow.textContent = "";
    }
  });
}

function buildRoomTableRow(entry) {
  const room = entry.room;
  const row = document.createElement("tr");
  row.className = "clickable";
  row.innerHTML = `
    <td data-label="Location"><span class="rack-id-badge">${escapeHtml(room.id)}</span> ${escapeHtml(room.name)}</td>
    <td data-label="Area" class="muted">${escapeHtml(entry.location || "No location set")}</td>
    <td data-label="Storage Units"><strong>${entry.unitCount}</strong></td>
    <td data-label="Actions">
      <button class="icon-btn edit-btn" title="Edit">${ICONS.edit}</button>
      <button class="icon-btn delete delete-btn" title="Delete">${ICONS.trash}</button>
    </td>
  `;

  row.addEventListener("click", function () {
    window.location.href = "storage.html?room=" + encodeURIComponent(room.id);
  });
  row.querySelector(".edit-btn").addEventListener("click", function (e) {
    e.stopPropagation();
    openRoomModal(room);
  });
  row.querySelector(".delete-btn").addEventListener("click", function (e) {
    e.stopPropagation();
    const count = roomUnitCount(room.id);
    if (count > 0) {
      showToast(`Move or delete its ${count} storage unit(s) first`, "danger");
      return;
    }
    confirmDialog(`Delete location "${room.name}"? This cannot be undone.`, function () {
      rooms = rooms.filter(function (r) { return r.id !== room.id; });
      saveRooms(rooms);
      showToast(`"${room.name}" deleted`, "danger");
      applyRoomFilters();
    }, { confirmLabel: "Delete" });
  });

  return row;
}

function applyRoomFilters() {
  const query = document.getElementById("roomFilterSearch").value.trim().toLowerCase();

  const filtered = rooms.filter(function (r) {
    return !query ||
      r.name.toLowerCase().indexOf(query) !== -1 ||
      (r.location || "").toLowerCase().indexOf(query) !== -1;
  });

  let entries = sortRoomEntries(filtered.map(buildRoomEntry));
  syncRoomSortIndicators();

  const totalPages = Math.max(1, Math.ceil(entries.length / PAGE_SIZE));
  if (roomCurrentPage > totalPages) roomCurrentPage = totalPages;

  const tbody = document.getElementById("roomTableBody");
  const emptyState = document.getElementById("emptyState");
  const table = document.querySelector(".log-table-wrap");
  tbody.innerHTML = "";

  if (entries.length === 0) {
    emptyState.hidden = false;
    table.hidden = true;
  } else {
    emptyState.hidden = true;
    table.hidden = false;
    paginateArray(entries, roomCurrentPage, PAGE_SIZE).forEach(function (entry) {
      tbody.appendChild(buildRoomTableRow(entry));
    });
  }

  renderPagination(document.getElementById("roomPagination"), entries.length, roomCurrentPage, PAGE_SIZE, function (page) {
    roomCurrentPage = page;
    applyRoomFilters();
  });
}

document.querySelectorAll(".log-table th[data-sort]").forEach(function (th) {
  th.addEventListener("click", function () {
    const field = th.dataset.sort;
    if (roomSortField === field) {
      roomSortDir = roomSortDir === "asc" ? "desc" : "asc";
    } else {
      roomSortField = field;
      roomSortDir = "asc";
    }
    roomCurrentPage = 1;
    applyRoomFilters();
  });
});

document.getElementById("roomFilterSearch").addEventListener("input", function () { roomCurrentPage = 1; applyRoomFilters(); });
document.getElementById("roomFilterReset").addEventListener("click", function () {
  document.getElementById("roomFilterSearch").value = "";
  roomCurrentPage = 1;
  applyRoomFilters();
});

// ---------- Add / Edit modal ----------
const roomModalOverlay = document.getElementById("roomModalOverlay");
const roomForm = document.getElementById("roomForm");
const roomError = document.getElementById("roomError");
let editingRoomId = null;

function openRoomModal(room) {
  roomError.hidden = true;
  roomForm.reset();
  editingRoomId = room ? room.id : null;
  document.getElementById("roomModalTitle").textContent = room ? "Edit Location" : "Add Location";
  document.getElementById("roomSave").textContent = room ? "Save Changes" : "Add Location";
  document.getElementById("roomName").value = room ? room.name : "";
  document.getElementById("roomLocation").value = room ? room.location || "" : "";
  roomModalOverlay.hidden = false;
}

function closeRoomModal() {
  roomModalOverlay.hidden = true;
  editingRoomId = null;
}

document.getElementById("addRoomBtn").addEventListener("click", function () { openRoomModal(null); });
document.getElementById("roomModalClose").addEventListener("click", closeRoomModal);
document.getElementById("roomCancel").addEventListener("click", closeRoomModal);
roomModalOverlay.addEventListener("click", function (e) {
  if (e.target === roomModalOverlay) closeRoomModal();
});

roomForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const name = document.getElementById("roomName").value.trim();
  const location = document.getElementById("roomLocation").value.trim();

  if (!name) {
    roomError.textContent = "Please enter a location name.";
    roomError.hidden = false;
    return;
  }

  if (editingRoomId) {
    const room = findRoom(editingRoomId);
    room.name = name;
    room.location = location;
    showToast(`"${name}" updated`, "success");
  } else {
    rooms.push({ id: nextRoomId(), name: name, location: location, createdAt: Date.now() });
    showToast(`"${name}" created`, "success");
  }

  saveRooms(rooms);
  closeRoomModal();
  applyRoomFilters();
});

applyRoomFilters();
