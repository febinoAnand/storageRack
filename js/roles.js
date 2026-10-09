function roleUserCount(roleId) {
  return users.filter(function (u) { return u.roleId === roleId; }).length;
}

let roleCurrentPage = 1;
let roleSortField = "name";
let roleSortDir = "asc";

function buildRoleEntry(role) {
  return { role: role, name: role.name, userCount: roleUserCount(role.id) };
}

function sortRoleEntries(list) {
  const dir = roleSortDir === "asc" ? 1 : -1;
  return list.slice().sort(function (a, b) {
    let av = a[roleSortField];
    let bv = b[roleSortField];
    if (typeof av === "string") { av = av.toLowerCase(); bv = bv.toLowerCase(); }
    if (av < bv) return -1 * dir;
    if (av > bv) return 1 * dir;
    return 0;
  });
}

function syncRoleSortIndicators() {
  document.querySelectorAll(".log-table th[data-sort]").forEach(function (th) {
    const arrow = th.querySelector(".sort-arrow");
    if (th.dataset.sort === roleSortField) {
      th.classList.add("sorted");
      arrow.textContent = roleSortDir === "asc" ? "▲" : "▼";
    } else {
      th.classList.remove("sorted");
      arrow.textContent = "";
    }
  });
}

function buildRoleTableRow(entry) {
  const role = entry.role;
  const row = document.createElement("tr");
  row.className = "clickable";
  row.innerHTML = `
    <td data-label="Role"><span class="rack-id-badge">${escapeHtml(role.id)}</span> ${escapeHtml(role.name)}</td>
    <td data-label="Description" class="muted">${escapeHtml(role.description || "No description")}</td>
    <td data-label="Permissions"><div class="perm-chip-row">${permissionSummary(role.permissions)}</div></td>
    <td data-label="Users"><strong>${entry.userCount}</strong></td>
    <td data-label="Actions">
      <button class="icon-btn edit-btn" title="Edit">${ICONS.edit}</button>
      <button class="icon-btn delete delete-btn" title="Delete">${ICONS.trash}</button>
    </td>
  `;

  row.addEventListener("click", function () { openRoleModal(role); });
  row.querySelector(".edit-btn").addEventListener("click", function (e) {
    e.stopPropagation();
    openRoleModal(role);
  });
  row.querySelector(".delete-btn").addEventListener("click", function (e) {
    e.stopPropagation();
    const count = roleUserCount(role.id);
    if (count > 0) {
      showToast(`Reassign its ${count} user(s) to another role first`, "danger");
      return;
    }
    confirmDialog(`Delete role "${role.name}"? This cannot be undone.`, function () {
      roles = roles.filter(function (r) { return r.id !== role.id; });
      saveRoles(roles);
      showToast(`"${role.name}" deleted`, "danger");
      applyRoleFilters();
    }, { confirmLabel: "Delete" });
  });

  return row;
}

function applyRoleFilters() {
  const query = document.getElementById("roleFilterSearch").value.trim().toLowerCase();

  const filtered = roles.filter(function (r) {
    return !query ||
      r.name.toLowerCase().indexOf(query) !== -1 ||
      (r.description || "").toLowerCase().indexOf(query) !== -1;
  });

  let entries = sortRoleEntries(filtered.map(buildRoleEntry));
  syncRoleSortIndicators();

  const totalPages = Math.max(1, Math.ceil(entries.length / PAGE_SIZE));
  if (roleCurrentPage > totalPages) roleCurrentPage = totalPages;

  const tbody = document.getElementById("roleTableBody");
  const emptyState = document.getElementById("emptyState");
  const table = document.querySelector(".log-table-wrap");
  tbody.innerHTML = "";

  if (entries.length === 0) {
    emptyState.hidden = false;
    table.hidden = true;
  } else {
    emptyState.hidden = true;
    table.hidden = false;
    paginateArray(entries, roleCurrentPage, PAGE_SIZE).forEach(function (entry) {
      tbody.appendChild(buildRoleTableRow(entry));
    });
  }

  renderPagination(document.getElementById("rolePagination"), entries.length, roleCurrentPage, PAGE_SIZE, function (page) {
    roleCurrentPage = page;
    applyRoleFilters();
  });
}

document.querySelectorAll(".log-table th[data-sort]").forEach(function (th) {
  th.addEventListener("click", function () {
    const field = th.dataset.sort;
    if (roleSortField === field) {
      roleSortDir = roleSortDir === "asc" ? "desc" : "asc";
    } else {
      roleSortField = field;
      roleSortDir = "asc";
    }
    roleCurrentPage = 1;
    applyRoleFilters();
  });
});

document.getElementById("roleFilterSearch").addEventListener("input", function () { roleCurrentPage = 1; applyRoleFilters(); });
document.getElementById("roleFilterReset").addEventListener("click", function () {
  document.getElementById("roleFilterSearch").value = "";
  roleCurrentPage = 1;
  applyRoleFilters();
});

// ---------- Permission matrix builder ----------
function buildPermMatrixHtml() {
  let html = `<div class="perm-matrix-header"><span></span><span>Create</span><span>Read</span><span>Update</span><span>Delete</span></div>`;
  PERMISSION_MODULES.forEach(function (m) {
    html += `<div class="perm-matrix-row" data-module="${m.key}"><span class="perm-matrix-label">${escapeHtml(m.label)}</span>`;
    PERMISSION_ACTIONS.forEach(function (a) {
      html += `<label class="perm-check"><input type="checkbox" data-module="${m.key}" data-action="${a}"></label>`;
    });
    html += `</div>`;
  });
  return html;
}

document.getElementById("permMatrix").innerHTML = buildPermMatrixHtml();

function setPermMatrixValues(permissions) {
  PERMISSION_MODULES.forEach(function (m) {
    PERMISSION_ACTIONS.forEach(function (a) {
      const cb = document.querySelector(`#permMatrix input[data-module="${m.key}"][data-action="${a}"]`);
      cb.checked = !!(permissions && permissions[m.key] && permissions[m.key][a]);
    });
  });
}

function readPermMatrixValues() {
  const perms = emptyPermissions(false);
  PERMISSION_MODULES.forEach(function (m) {
    PERMISSION_ACTIONS.forEach(function (a) {
      const cb = document.querySelector(`#permMatrix input[data-module="${m.key}"][data-action="${a}"]`);
      perms[m.key][a] = cb.checked;
    });
  });
  return perms;
}

// ---------- Add / Edit modal ----------
const roleModalOverlay = document.getElementById("roleModalOverlay");
const roleForm = document.getElementById("roleForm");
const roleError = document.getElementById("roleError");
let editingRoleId = null;

function openRoleModal(role) {
  roleError.hidden = true;
  roleForm.reset();
  editingRoleId = role ? role.id : null;
  document.getElementById("roleModalTitle").textContent = role ? "Edit Role" : "Add Role";
  document.getElementById("roleSave").textContent = role ? "Save Changes" : "Add Role";
  document.getElementById("roleName").value = role ? role.name : "";
  document.getElementById("roleDescription").value = role ? role.description || "" : "";
  setPermMatrixValues(role ? role.permissions : emptyPermissions(false));
  roleModalOverlay.hidden = false;
}

function closeRoleModal() {
  roleModalOverlay.hidden = true;
  editingRoleId = null;
}

document.getElementById("addRoleBtn").addEventListener("click", function () { openRoleModal(null); });
document.getElementById("roleModalClose").addEventListener("click", closeRoleModal);
document.getElementById("roleCancel").addEventListener("click", closeRoleModal);
roleModalOverlay.addEventListener("click", function (e) { if (e.target === roleModalOverlay) closeRoleModal(); });

roleForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const name = document.getElementById("roleName").value.trim();
  const description = document.getElementById("roleDescription").value.trim();

  if (!name) {
    roleError.textContent = "Please enter a role name.";
    roleError.hidden = false;
    return;
  }

  const permissions = readPermMatrixValues();

  if (editingRoleId) {
    const role = findRole(editingRoleId);
    role.name = name;
    role.description = description;
    role.permissions = permissions;
    showToast(`"${name}" updated`, "success");
  } else {
    roles.push({ id: nextRoleId(), name: name, description: description, permissions: permissions, createdAt: Date.now() });
    showToast(`"${name}" created`, "success");
  }

  saveRoles(roles);
  closeRoleModal();
  applyRoleFilters();
});

applyRoleFilters();
