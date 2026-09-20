(function populateRoleFilter() {
  const filterSelect = document.getElementById("userFilterRole");
  roles.forEach(function (role) {
    const opt = document.createElement("option");
    opt.value = role.id;
    opt.textContent = role.name;
    filterSelect.appendChild(opt);
  });
})();

function statusBadgeHtml(status) {
  const cls = status === "active" ? "" : "warning";
  const label = status === "active" ? "Active" : "Inactive";
  return `<span class="rack-badge ${cls}">${label}</span>`;
}

function roleBadgeHtml(roleId) {
  const role = findRole(roleId);
  if (!role) return `<span class="rack-category-badge">No role</span>`;
  const c = getCategoryColor(role.name);
  return `<span class="rack-category-badge" style="background:${c.bg};border-color:${c.border};color:${c.text}">${escapeHtml(role.name)}</span>`;
}

function buildUserCard(user) {
  const card = document.createElement("div");
  card.className = "rack-card clickable";
  card.style.borderLeft = `3px solid ${getCategoryColor(roleLabel(user.roleId)).solid}`;
  card.innerHTML = `
    <div class="rack-card-head">
      <div>
        <span class="rack-id-badge">${escapeHtml(user.id)}</span>
        <div class="rack-name">${escapeHtml(user.name)}</div>
      </div>
      <div class="rack-card-actions">
        <button class="icon-btn edit-btn" title="Edit">✏️</button>
        <button class="icon-btn delete delete-btn" title="Delete">🗑️</button>
      </div>
    </div>
    <div class="rack-location">👤 @${escapeHtml(user.username)} ${user.email ? "· " + escapeHtml(user.email) : ""}</div>
    <div class="rack-sub-meta">
      ${roleBadgeHtml(user.roleId)}
      ${statusBadgeHtml(user.status)}
    </div>
    <div class="rack-meta">
      <span>Added ${new Date(user.createdAt).toLocaleDateString()}</span>
    </div>
  `;

  card.addEventListener("click", function () { openUserModal(user); });
  card.querySelector(".edit-btn").addEventListener("click", function (e) {
    e.stopPropagation();
    openUserModal(user);
  });
  card.querySelector(".delete-btn").addEventListener("click", function (e) {
    e.stopPropagation();
    if (!confirm(`Delete user "${user.name}"? This cannot be undone.`)) return;
    users = users.filter(function (u) { return u.id !== user.id; });
    saveUsers(users);
    showToast(`"${user.name}" deleted`, "danger");
    applyUserFilters();
  });

  return card;
}

let userCurrentPage = 1;

function applyUserFilters() {
  const query = document.getElementById("userFilterSearch").value.trim().toLowerCase();
  const roleFilter = document.getElementById("userFilterRole").value;

  const filtered = users.filter(function (u) {
    const matchesQuery = !query ||
      u.name.toLowerCase().indexOf(query) !== -1 ||
      u.username.toLowerCase().indexOf(query) !== -1 ||
      (u.email || "").toLowerCase().indexOf(query) !== -1;
    const matchesRole = roleFilter === "all" || u.roleId === roleFilter;
    return matchesQuery && matchesRole;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  if (userCurrentPage > totalPages) userCurrentPage = totalPages;

  const grid = document.getElementById("userGrid");
  const emptyState = document.getElementById("emptyState");
  grid.innerHTML = "";

  if (filtered.length === 0) {
    emptyState.hidden = false;
  } else {
    emptyState.hidden = true;
    paginateArray(filtered, userCurrentPage, PAGE_SIZE).forEach(function (u) { grid.appendChild(buildUserCard(u)); });
  }

  renderPagination(document.getElementById("userPagination"), filtered.length, userCurrentPage, PAGE_SIZE, function (page) {
    userCurrentPage = page;
    applyUserFilters();
  });
}

document.getElementById("userFilterSearch").addEventListener("input", function () { userCurrentPage = 1; applyUserFilters(); });
document.getElementById("userFilterRole").addEventListener("change", function () { userCurrentPage = 1; applyUserFilters(); });
document.getElementById("userFilterReset").addEventListener("click", function () {
  document.getElementById("userFilterSearch").value = "";
  document.getElementById("userFilterRole").value = "all";
  userCurrentPage = 1;
  applyUserFilters();
});

// ---------- Add / Edit modal ----------
const userModalOverlay = document.getElementById("userModalOverlay");
const userForm = document.getElementById("userForm");
const userError = document.getElementById("userError");
let editingUserId = null;

function openUserModal(user) {
  userError.hidden = true;
  userForm.reset();
  editingUserId = user ? user.id : null;
  document.getElementById("userModalTitle").textContent = user ? "Edit User" : "Add User";
  document.getElementById("userSave").textContent = user ? "Save Changes" : "Add User";
  document.getElementById("userName").value = user ? user.name : "";
  document.getElementById("userUsername").value = user ? user.username : "";
  document.getElementById("userEmail").value = user ? user.email || "" : "";
  document.getElementById("userStatus").value = user ? user.status : "active";

  const roleSelect = document.getElementById("userRole");
  roleSelect.innerHTML = roles.map(function (r) {
    return `<option value="${escapeHtml(r.id)}">${escapeHtml(r.name)}</option>`;
  }).join("");
  if (user) roleSelect.value = user.roleId;

  if (roles.length === 0) {
    roleSelect.disabled = true;
    document.getElementById("userSave").disabled = true;
  } else {
    roleSelect.disabled = false;
    document.getElementById("userSave").disabled = false;
  }

  userModalOverlay.hidden = false;
}

function closeUserModal() {
  userModalOverlay.hidden = true;
  editingUserId = null;
}

document.getElementById("addUserBtn").addEventListener("click", function () { openUserModal(null); });
document.getElementById("userModalClose").addEventListener("click", closeUserModal);
document.getElementById("userCancel").addEventListener("click", closeUserModal);
userModalOverlay.addEventListener("click", function (e) { if (e.target === userModalOverlay) closeUserModal(); });

userForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const name = document.getElementById("userName").value.trim();
  const username = document.getElementById("userUsername").value.trim();
  const email = document.getElementById("userEmail").value.trim();
  const status = document.getElementById("userStatus").value;
  const roleId = document.getElementById("userRole").value;

  if (!name || !username || !roleId) {
    userError.textContent = "Please fill in name, username, and role.";
    userError.hidden = false;
    return;
  }

  const usernameTaken = users.some(function (u) {
    return u.username.toLowerCase() === username.toLowerCase() && u.id !== editingUserId;
  });
  if (usernameTaken) {
    userError.textContent = `Username "${username}" is already taken.`;
    userError.hidden = false;
    return;
  }

  if (editingUserId) {
    const user = findUser(editingUserId);
    user.name = name;
    user.username = username;
    user.email = email;
    user.status = status;
    user.roleId = roleId;
    showToast(`"${name}" updated`, "success");
  } else {
    users.push({
      id: nextUserId(), name: name, username: username, email: email,
      status: status, roleId: roleId, createdAt: Date.now(),
    });
    showToast(`"${name}" added`, "success");
  }

  saveUsers(users);
  closeUserModal();
  applyUserFilters();
});

applyUserFilters();
