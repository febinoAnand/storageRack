(function populateRackFilter() {
  const select = document.getElementById("logFilterRack");
  racks.forEach(function (rack) {
    const opt = document.createElement("option");
    opt.value = rack.id;
    opt.textContent = `${rack.name} (${rack.id})`;
    select.appendChild(opt);
  });
})();

const LOG_PAGE_SIZE = 10;
let logCurrentPage = 1;
let logSortField = "timestamp";
let logSortDir = "desc";

function formatLogDate(ts) {
  const d = new Date(ts);
  return d.toLocaleDateString() + " " + d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function buildLogRow(entry) {
  const dotColor = getItemColor(entry.itemName).solid;
  const tr = document.createElement("tr");
  tr.innerHTML = `
    <td>${formatLogDate(entry.timestamp)}</td>
    <td><span class="log-type-badge ${entry.type}">${entry.type === "in" ? "⬆ IN" : "⬇ OUT"}</span></td>
    <td><span class="item-dot" style="background:${dotColor};display:inline-block;margin-right:6px;"></span>${escapeHtml(entry.itemName)}</td>
    <td><strong>${entry.quantity}</strong></td>
    <td><a href="${rackDetailUrl(entry.rackId)}" class="rack-id-badge">${escapeHtml(entry.rackId)}</a> ${escapeHtml(entry.rackName)}</td>
    <td class="muted">${escapeHtml(entry.path || "—")}</td>
    <td>${escapeHtml(entry.user)}</td>
  `;
  return tr;
}

function sortLog(list) {
  const dir = logSortDir === "asc" ? 1 : -1;
  return list.slice().sort(function (a, b) {
    let av = a[logSortField];
    let bv = b[logSortField];
    if (typeof av === "string") { av = av.toLowerCase(); bv = bv.toLowerCase(); }
    if (av < bv) return -1 * dir;
    if (av > bv) return 1 * dir;
    return 0;
  });
}

function syncSortIndicators() {
  document.querySelectorAll(".log-table th[data-sort]").forEach(function (th) {
    const arrow = th.querySelector(".sort-arrow");
    if (th.dataset.sort === logSortField) {
      th.classList.add("sorted");
      arrow.textContent = logSortDir === "asc" ? "▲" : "▼";
    } else {
      th.classList.remove("sorted");
      arrow.textContent = "";
    }
  });
}

function applyLogFilters() {
  const query = document.getElementById("logFilterSearch").value.trim().toLowerCase();
  const typeFilter = document.getElementById("logFilterType").value;
  const rackFilter = document.getElementById("logFilterRack").value;

  let filtered = itemLog.filter(function (entry) {
    const matchesQuery = !query ||
      entry.itemName.toLowerCase().indexOf(query) !== -1 ||
      entry.rackName.toLowerCase().indexOf(query) !== -1 ||
      (entry.path || "").toLowerCase().indexOf(query) !== -1 ||
      entry.user.toLowerCase().indexOf(query) !== -1;
    const matchesType = typeFilter === "all" || entry.type === typeFilter;
    const matchesRack = rackFilter === "all" || entry.rackId === rackFilter;
    return matchesQuery && matchesType && matchesRack;
  });

  filtered = sortLog(filtered);
  syncSortIndicators();

  document.getElementById("logListHeading").textContent = `Log (${filtered.length} of ${itemLog.length})`;

  const totalPages = Math.max(1, Math.ceil(filtered.length / LOG_PAGE_SIZE));
  if (logCurrentPage > totalPages) logCurrentPage = totalPages;

  const tbody = document.getElementById("logTableBody");
  const emptyState = document.getElementById("logEmptyState");
  const table = document.querySelector(".log-table-wrap");
  tbody.innerHTML = "";

  if (filtered.length === 0) {
    emptyState.hidden = false;
    table.hidden = true;
  } else {
    emptyState.hidden = true;
    table.hidden = false;
    paginateArray(filtered, logCurrentPage, LOG_PAGE_SIZE).forEach(function (entry) {
      tbody.appendChild(buildLogRow(entry));
    });
  }

  renderPagination(document.getElementById("logPagination"), filtered.length, logCurrentPage, LOG_PAGE_SIZE, function (page) {
    logCurrentPage = page;
    applyLogFilters();
  });
}

document.querySelectorAll(".log-table th[data-sort]").forEach(function (th) {
  th.addEventListener("click", function () {
    const field = th.dataset.sort;
    if (logSortField === field) {
      logSortDir = logSortDir === "asc" ? "desc" : "asc";
    } else {
      logSortField = field;
      logSortDir = field === "timestamp" ? "desc" : "asc";
    }
    logCurrentPage = 1;
    applyLogFilters();
  });
});

document.getElementById("logFilterSearch").addEventListener("input", function () { logCurrentPage = 1; applyLogFilters(); });
document.getElementById("logFilterType").addEventListener("change", function () { logCurrentPage = 1; applyLogFilters(); });
document.getElementById("logFilterRack").addEventListener("change", function () { logCurrentPage = 1; applyLogFilters(); });
document.getElementById("logFilterReset").addEventListener("click", function () {
  document.getElementById("logFilterSearch").value = "";
  document.getElementById("logFilterType").value = "all";
  document.getElementById("logFilterRack").value = "all";
  logCurrentPage = 1;
  applyLogFilters();
});

applyLogFilters();
