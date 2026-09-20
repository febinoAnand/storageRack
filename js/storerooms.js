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

function buildRoomCard(room) {
  const count = roomUnitCount(room.id);
  const card = document.createElement("div");
  card.className = "rack-card clickable";
  card.innerHTML = `
    <div class="rack-card-head">
      <div>
        <span class="rack-id-badge">${escapeHtml(room.id)}</span>
        <div class="rack-name">${escapeHtml(room.name)}</div>
      </div>
      <div class="rack-card-actions">
        <button class="icon-btn edit-btn" title="Edit">✏️</button>
        <button class="icon-btn delete delete-btn" title="Delete">🗑️</button>
      </div>
    </div>
    <div class="rack-location">${escapeHtml(room.location || "No location set")}</div>
    <div class="rack-meta">
      <span><strong>${count}</strong> storage unit${count === 1 ? "" : "s"}</span>
    </div>
  `;

  card.addEventListener("click", function () {
    window.location.href = "storage.html?room=" + encodeURIComponent(room.id);
  });
  card.querySelector(".edit-btn").addEventListener("click", function (e) {
    e.stopPropagation();
    openRoomModal(room);
  });
  card.querySelector(".delete-btn").addEventListener("click", function (e) {
    e.stopPropagation();
    if (roomUnitCount(room.id) > 0) {
      showToast(`Move or delete its ${roomUnitCount(room.id)} storage unit(s) first`, "danger");
      return;
    }
    if (!confirm(`Delete store room "${room.name}"? This cannot be undone.`)) return;
    rooms = rooms.filter(function (r) { return r.id !== room.id; });
    saveRooms(rooms);
    showToast(`"${room.name}" deleted`, "danger");
    renderRooms();
  });

  return card;
}

let roomCurrentPage = 1;

function renderRooms() {
  const totalPages = Math.max(1, Math.ceil(rooms.length / PAGE_SIZE));
  if (roomCurrentPage > totalPages) roomCurrentPage = totalPages;

  const grid = document.getElementById("roomGrid");
  const emptyState = document.getElementById("emptyState");
  grid.innerHTML = "";

  if (rooms.length === 0) {
    emptyState.hidden = false;
  } else {
    emptyState.hidden = true;
    paginateArray(rooms, roomCurrentPage, PAGE_SIZE).forEach(function (room) { grid.appendChild(buildRoomCard(room)); });
  }

  renderPagination(document.getElementById("roomPagination"), rooms.length, roomCurrentPage, PAGE_SIZE, function (page) {
    roomCurrentPage = page;
    renderRooms();
  });
}

// ---------- Add / Edit modal ----------
const roomModalOverlay = document.getElementById("roomModalOverlay");
const roomForm = document.getElementById("roomForm");
const roomError = document.getElementById("roomError");
let editingRoomId = null;

function openRoomModal(room) {
  roomError.hidden = true;
  roomForm.reset();
  editingRoomId = room ? room.id : null;
  document.getElementById("roomModalTitle").textContent = room ? "Edit Store Room" : "Add Store Room";
  document.getElementById("roomSave").textContent = room ? "Save Changes" : "Add Room";
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
    roomError.textContent = "Please enter a room name.";
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
  renderRooms();
});

renderRooms();
