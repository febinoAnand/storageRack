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

let userCurrentPage = 1;
let userSortField = "name";
let userSortDir = "asc";

function buildUserEntry(user) {
  return {
    user: user, name: user.name, username: user.username, status: user.status,
    roleLabel: roleLabel(user.roleId), createdAt: user.createdAt,
  };
}

function sortUserEntries(list) {
  const dir = userSortDir === "asc" ? 1 : -1;
  return list.slice().sort(function (a, b) {
    let av = a[userSortField];
    let bv = b[userSortField];
    if (typeof av === "string") { av = av.toLowerCase(); bv = bv.toLowerCase(); }
    if (av < bv) return -1 * dir;
    if (av > bv) return 1 * dir;
    return 0;
  });
}

function syncUserSortIndicators() {
  document.querySelectorAll(".log-table th[data-sort]").forEach(function (th) {
    const arrow = th.querySelector(".sort-arrow");
    if (th.dataset.sort === userSortField) {
      th.classList.add("sorted");
      arrow.textContent = userSortDir === "asc" ? "▲" : "▼";
    } else {
      th.classList.remove("sorted");
      arrow.textContent = "";
    }
  });
}

function buildUserTableRow(entry) {
  const user = entry.user;
  const row = document.createElement("tr");
  row.className = "clickable";
  const avatarColor = getItemColor(user.name).solid;
  const avatarInitial = user.name.trim().charAt(0).toUpperCase() || "?";
  row.innerHTML = `
    <td data-label="Avatar"><span class="item-avatar" style="background:${avatarColor};">${escapeHtml(avatarInitial)}</span></td>
    <td data-label="User"><span class="rack-id-badge">${escapeHtml(user.id)}</span> ${escapeHtml(user.name)}</td>
    <td data-label="Username / Email" class="muted">@${escapeHtml(user.username)}${user.email ? " · " + escapeHtml(user.email) : ""}</td>
    <td data-label="Role">${roleBadgeHtml(user.roleId)}</td>
    <td data-label="Status">${statusBadgeHtml(user.status)}</td>
    <td data-label="Added" class="muted">${new Date(user.createdAt).toLocaleDateString()}</td>
    <td data-label="Actions">
      <button class="icon-btn reset-password-btn" title="${user.password ? "Reset password" : "Set password"}">${ICONS.key}</button>
      <button class="icon-btn edit-btn" title="Edit">${ICONS.edit}</button>
      <button class="icon-btn delete delete-btn" title="Delete">${ICONS.trash}</button>
    </td>
  `;

  row.addEventListener("click", function () { openUserModal(user); });
  row.querySelector(".reset-password-btn").addEventListener("click", function (e) {
    e.stopPropagation();
    requestPasswordReset(user);
  });
  row.querySelector(".edit-btn").addEventListener("click", function (e) {
    e.stopPropagation();
    openUserModal(user);
  });
  row.querySelector(".delete-btn").addEventListener("click", function (e) {
    e.stopPropagation();
    confirmDialog(`Delete user "${user.name}"? This cannot be undone.`, function () {
      users = users.filter(function (u) { return u.id !== user.id; });
      saveUsers(users);
      showToast(`"${user.name}" deleted`, "danger");
      applyUserFilters();
    }, { confirmLabel: "Delete" });
  });

  return row;
}

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

  let entries = sortUserEntries(filtered.map(buildUserEntry));
  syncUserSortIndicators();

  const totalPages = Math.max(1, Math.ceil(entries.length / PAGE_SIZE));
  if (userCurrentPage > totalPages) userCurrentPage = totalPages;

  const tbody = document.getElementById("userTableBody");
  const emptyState = document.getElementById("emptyState");
  const table = document.querySelector(".log-table-wrap");
  tbody.innerHTML = "";

  if (entries.length === 0) {
    emptyState.hidden = false;
    table.hidden = true;
  } else {
    emptyState.hidden = true;
    table.hidden = false;
    paginateArray(entries, userCurrentPage, PAGE_SIZE).forEach(function (entry) {
      tbody.appendChild(buildUserTableRow(entry));
    });
  }

  renderPagination(document.getElementById("userPagination"), entries.length, userCurrentPage, PAGE_SIZE, function (page) {
    userCurrentPage = page;
    applyUserFilters();
  });
}

document.querySelectorAll(".log-table th[data-sort]").forEach(function (th) {
  th.addEventListener("click", function () {
    const field = th.dataset.sort;
    if (userSortField === field) {
      userSortDir = userSortDir === "asc" ? "desc" : "asc";
    } else {
      userSortField = field;
      userSortDir = "asc";
    }
    userCurrentPage = 1;
    applyUserFilters();
  });
});

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
  document.getElementById("userPhone").value = user ? user.phone || "" : "";
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
  const phone = document.getElementById("userPhone").value.trim();
  const status = document.getElementById("userStatus").value;
  const roleId = document.getElementById("userRole").value;

  if (!name || !username || !roleId || !email) {
    userError.textContent = "Please fill in name, username, email, and role.";
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
    user.phone = phone;
    user.status = status;
    user.roleId = roleId;
    showToast(`"${name}" updated`, "success");
  } else {
    users.push({
      id: nextUserId(), name: name, username: username, email: email, phone: phone,
      status: status, roleId: roleId, createdAt: Date.now(),
    });
    showToast(`"${name}" added`, "success");
  }

  saveUsers(users);
  closeUserModal();
  applyUserFilters();
});

// ---------- Password reset (invite) ----------
// Shared by the table's key icon (existing users) and the Add/Edit modal's
// "Send Invite" button. Setting the actual password happens on the
// recipient's end, via the link in their email — this admin-side action
// only sends it; it's never shown here.
function requestPasswordReset(user) {
  if (!user.email) {
    showToast("Add an email address for this user first.", "danger");
    openUserModal(user);
    return;
  }
  confirmDialog(`Send a password reset link to ${user.name}?`, function () {
    closeUserModal();
    showToast(`Invitation sent to ${user.email}`, "success");
  }, { confirmLabel: "Send Link", danger: false });
}

// "Send Invite" saves the user first (so a brand-new user from the Add form
// has a real record before the invite references it), then sends the same
// password-reset invite the table's key icon uses.
document.getElementById("userSendInvite").addEventListener("click", function () {
  const name = document.getElementById("userName").value.trim();
  const username = document.getElementById("userUsername").value.trim();
  const email = document.getElementById("userEmail").value.trim();
  const phone = document.getElementById("userPhone").value.trim();
  const status = document.getElementById("userStatus").value;
  const roleId = document.getElementById("userRole").value;

  if (!name || !username || !roleId || !email) {
    userError.textContent = "Please fill in name, username, email, and role before sending an invite.";
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

  userError.hidden = true;

  let user;
  if (editingUserId) {
    user = findUser(editingUserId);
    user.name = name;
    user.username = username;
    user.email = email;
    user.phone = phone;
    user.status = status;
    user.roleId = roleId;
  } else {
    user = {
      id: nextUserId(), name: name, username: username, email: email, phone: phone,
      status: status, roleId: roleId, createdAt: Date.now(),
    };
    users.push(user);
  }
  saveUsers(users);
  applyUserFilters();

  requestPasswordReset(user);
});

applyUserFilters();
