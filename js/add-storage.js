const typeHints = {
  shelf: "Flat shelf levels, e.g. Level 1, Level 2.",
  rack: "Levels that can each hold sections.",
  cupboard: "A mix of shelves and drawers.",
  bureau: "A set of drawers.",
  wardrobe: "A hanging section plus shelves.",
  cabinet: "Shelves and compartments.",
  box: "A single internal space — just add items directly.",
  custom: "Build your own arbitrary structure of nested nodes.",
};

function pluralizeLabel(label) {
  return /f$/i.test(label) ? label.slice(0, -1) + "ves" : label + "s";
}

function renderQuickStructureFields(type) {
  const wrap = document.getElementById("quickStructureField");
  const container = document.getElementById("quickStructureFields");
  const hint = document.getElementById("quickStructureHint");
  const t = typeInfo(type);

  if (!t.rootAdd || t.rootAdd.length === 0) {
    wrap.hidden = true;
    container.innerHTML = "";
    hint.textContent = "";
    return;
  }

  wrap.hidden = false;
  container.innerHTML = t.rootAdd.map(function (r) {
    return `
      <div class="field">
        <label for="qty_${r.kind}">Number of ${escapeHtml(pluralizeLabel(r.label))}</label>
        <input type="number" id="qty_${r.kind}" min="0" max="30" placeholder="0" data-kind="${r.kind}" data-label="${escapeHtml(r.label)}">
      </div>`;
  }).join("");
  hint.textContent = `Creates empty ${t.rootAdd.map(function (r) { return pluralizeLabel(r.label).toLowerCase(); }).join(" and ")} ready to fill in. Leave at 0 to build the structure later.`;
}

(function populateSelects() {
  const typeSelect = document.getElementById("newRackType");
  Object.keys(STORAGE_TYPES).forEach(function (key) {
    const opt = document.createElement("option");
    opt.value = key;
    opt.textContent = STORAGE_TYPES[key].icon + " " + STORAGE_TYPES[key].label;
    typeSelect.appendChild(opt);
  });

  function syncHint() {
    document.getElementById("typeHint").textContent = typeHints[typeSelect.value] || "";
    renderQuickStructureFields(typeSelect.value);
  }
  typeSelect.addEventListener("change", syncHint);
  syncHint();

  const roomSelect = document.getElementById("newRackRoom");
  rooms.forEach(function (room) {
    const opt = document.createElement("option");
    opt.value = room.id;
    opt.textContent = room.name;
    roomSelect.appendChild(opt);
  });

  if (rooms.length === 0) {
    roomSelect.disabled = true;
    document.querySelector("#addRackForm button[type=submit]").disabled = true;
  }
})();

document.getElementById("addRackForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const id = document.getElementById("newRackId").value.trim();
  const name = document.getElementById("newRackName").value.trim();
  const type = document.getElementById("newRackType").value;
  const storeRoomId = document.getElementById("newRackRoom").value;
  const category = document.getElementById("newRackCategory").value.trim();
  const errorEl = document.getElementById("addRackError");

  if (!id || !name || !type || !storeRoomId) {
    errorEl.textContent = "Please fill in the storage ID, name, type, and store room.";
    errorEl.hidden = false;
    return;
  }

  if (racks.some(function (r) { return r.id.toLowerCase() === id.toLowerCase(); })) {
    errorEl.textContent = `Storage ID "${id}" is already in use. Choose a different ID.`;
    errorEl.hidden = false;
    return;
  }

  const nodes = typeInfo(type).singleSpace ? [makeNode("Internal Space", "space")] : [];

  document.querySelectorAll("#quickStructureFields input[type=number]").forEach(function (input) {
    const count = parseInt(input.value, 10);
    if (!count || count < 1) return;
    for (let i = 1; i <= count; i++) {
      nodes.push(makeNode(`${input.dataset.label} ${i}`, input.dataset.kind));
    }
  });

  const rack = {
    id: id,
    name: name,
    storeRoomId: storeRoomId,
    type: type,
    category: category,
    nodes: nodes,
    createdAt: Date.now(),
  };
  racks.push(rack);
  saveRacks(racks);
  setFlashMessage(`"${rack.name}" created`, "success");
  window.location.href = rackDetailUrl(rack.id);
});

document.getElementById("addRackCancel").addEventListener("click", function () {
  window.location.href = "storage.html";
});
