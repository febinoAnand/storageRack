const typeHints = {
  shelf: "Open shelving.",
  rack: "A multi-tier rack for bulkier goods.",
  cupboard: "An enclosed unit with doors.",
  bureau: "A desk or unit built from drawers.",
  wardrobe: "A tall unit for hanging or folded items.",
  cabinet: "An enclosed storage cabinet.",
  box: "A single container.",
  custom: "Anything that doesn't fit the other types.",
};

(function populateSelects() {
  const typeSelect = document.getElementById("newRackType");
  Object.keys(STORAGE_TYPES).forEach(function (key) {
    const opt = document.createElement("option");
    opt.value = key;
    opt.textContent = STORAGE_TYPES[key].label;
    typeSelect.appendChild(opt);
  });

  function syncHint() {
    document.getElementById("typeHint").textContent = typeHints[typeSelect.value] || "";
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

const newTagInput = createTagInput(document.getElementById("newRackTagChips"), document.getElementById("newRackTagText"), []);
const newImageInput = createImageInput(document.getElementById("newRackImagePreviews"), document.getElementById("newRackImageFile"), {});

document.getElementById("addRackForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const id = document.getElementById("newRackId").value.trim();
  const name = document.getElementById("newRackName").value.trim();
  const type = document.getElementById("newRackType").value;
  const storeRoomId = document.getElementById("newRackRoom").value;
  const errorEl = document.getElementById("addRackError");

  if (!id || !name || !type || !storeRoomId) {
    errorEl.textContent = "Please fill in the storage ID, name, type, and location.";
    errorEl.hidden = false;
    return;
  }

  if (racks.some(function (r) { return r.id.toLowerCase() === id.toLowerCase(); })) {
    errorEl.textContent = `Storage ID "${id}" is already in use. Choose a different ID.`;
    errorEl.hidden = false;
    return;
  }

  const rack = {
    id: id,
    name: name,
    storeRoomId: storeRoomId,
    type: type,
    tags: newTagInput.getTags(),
    images: newImageInput.getImages(),
    nodes: [],
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
