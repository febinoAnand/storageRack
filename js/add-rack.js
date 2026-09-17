["newRackRows", "newRackColumns"].forEach(function (id) {
  document.getElementById(id).addEventListener("input", function () {
    updateCapacityPreview("newRackRows", "newRackColumns", "newRackCapacityPreview");
  });
});

document.getElementById("addRackForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const id = document.getElementById("newRackId").value.trim();
  const name = document.getElementById("newRackName").value.trim();
  const location = document.getElementById("newRackLocation").value.trim();
  const category = document.getElementById("newRackCategory").value.trim();
  const rows = parseInt(document.getElementById("newRackRows").value, 10);
  const columns = parseInt(document.getElementById("newRackColumns").value, 10);
  const errorEl = document.getElementById("addRackError");

  if (!id || !name || isNaN(rows) || rows < 1 || isNaN(columns) || columns < 1) {
    errorEl.textContent = "Please enter a rack ID, name, and valid rows/columns.";
    errorEl.hidden = false;
    return;
  }

  if (racks.some(function (r) { return r.id.toLowerCase() === id.toLowerCase(); })) {
    errorEl.textContent = `Rack ID "${id}" is already in use. Choose a different ID.`;
    errorEl.hidden = false;
    return;
  }

  const rack = {
    id: id,
    name: name,
    location: location,
    category: category,
    rows: rows,
    columns: columns,
    capacity: rows * columns,
    createdAt: Date.now(),
    items: [],
  };
  racks.push(rack);
  saveRacks(racks);
  window.location.href = rackDetailUrl(rack.id);
});

document.getElementById("addRackCancel").addEventListener("click", function () {
  window.location.href = "racks.html";
});
