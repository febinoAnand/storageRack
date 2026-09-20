function roleUserCount(roleId) {
  return users.filter(function (u) { return u.roleId === roleId; }).length;
}

function buildRoleCard(role) {
  const count = roleUserCount(role.id);
  const card = document.createElement("div");
  card.className = "rack-card clickable";
  card.innerHTML = `
    <div class="rack-card-head">
      <div>
        <span class="rack-id-badge">${escapeHtml(role.id)}</span>
        <div class="rack-name">${escapeHtml(role.name)}</div>
      </div>
      <div class="rack-card-actions">
        <button class="icon-btn edit-btn" title="Edit">✏️</button>
        <button class="icon-btn delete delete-btn" title="Delete">🗑️</button>
      </div>
    </div>
    <div class="rack-location">${escapeHtml(role.description || "No description")}</div>
    <div class="perm-chip-row">${permissionSummary(role.permissions)}</div>
    <div class="rack-meta">
      <span><strong>${count}</strong> user${count === 1 ? "" : "s"} assigned</span>
    </div>
  `;

  card.addEventListener("click", function () { openRoleModal(role); });
  card.querySelector(".edit-btn").addEventListener("click", function (e) {
    e.stopPropagation();
    openRoleModal(role);
  });
  card.querySelector(".delete-btn").addEventListener("click", function (e) {
    e.stopPropagation();
    const count = roleUserCount(role.id);
    if (count > 0) {
      showToast(`Reassign its ${count} user(s) to another role first`, "danger");
      return;
    }
    if (!confirm(`Delete role "${role.name}"? This cannot be undone.`)) return;
    roles = roles.filter(function (r) { return r.id !== role.id; });
    saveRoles(roles);
    showToast(`"${role.name}" deleted`, "danger");
    renderRoles();
  });

  return card;
}

let roleCurrentPage = 1;

function renderRoles() {
  const totalPages = Math.max(1, Math.ceil(roles.length / PAGE_SIZE));
  if (roleCurrentPage > totalPages) roleCurrentPage = totalPages;

  const grid = document.getElementById("roleGrid");
  const emptyState = document.getElementById("emptyState");
  grid.innerHTML = "";

  if (roles.length === 0) {
    emptyState.hidden = false;
  } else {
    emptyState.hidden = true;
    paginateArray(roles, roleCurrentPage, PAGE_SIZE).forEach(function (role) { grid.appendChild(buildRoleCard(role)); });
  }

  renderPagination(document.getElementById("rolePagination"), roles.length, roleCurrentPage, PAGE_SIZE, function (page) {
    roleCurrentPage = page;
    renderRoles();
  });
}

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
  renderRoles();
});

renderRoles();
