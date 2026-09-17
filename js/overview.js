const totalRacks = racks.length;
const totalCapacity = racks.reduce(function (s, r) { return s + r.capacity; }, 0);
const totalItems = racks.reduce(function (s, r) { return s + filledOf(r); }, 0);
const freeSlots = totalCapacity - totalItems;

document.getElementById("statRacks").textContent = totalRacks;
document.getElementById("statCapacity").textContent = totalCapacity;
document.getElementById("statItems").textContent = totalItems;
document.getElementById("statFree").textContent = freeSlots;

const attention = racks
  .map(function (r) { return { rack: r, status: statusOf(r) }; })
  .filter(function (x) { return x.status.cls === "warning" || x.status.cls === "full"; })
  .sort(function (a, b) { return b.status.pct - a.status.pct; });

const attentionList = document.getElementById("attentionList");
const attentionEmpty = document.getElementById("attentionEmpty");
if (attention.length === 0) {
  attentionEmpty.hidden = false;
} else {
  attentionEmpty.hidden = true;
  attention.forEach(function (x) { attentionList.appendChild(buildRackRow(x.rack)); });
}

const recent = racks.slice().sort(function (a, b) { return b.createdAt - a.createdAt; }).slice(0, 5);
const recentList = document.getElementById("recentList");
recent.forEach(function (r) { recentList.appendChild(buildRackRow(r)); });
