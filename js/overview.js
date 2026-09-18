const totalRacks = racks.length;
const totalRooms = rooms.length;
const totalItems = racks.reduce(function (s, r) { return s + unitItemCount(r); }, 0);
const typesInUse = new Set(racks.map(function (r) { return r.type; })).size;

animateNumber(document.getElementById("statRacks"), totalRacks);
animateNumber(document.getElementById("statRooms"), totalRooms);
animateNumber(document.getElementById("statItems"), totalItems);
animateNumber(document.getElementById("statTypes"), typesInUse);

const empty = racks.filter(function (r) { return unitItemCount(r) === 0; });

const attentionList = document.getElementById("attentionList");
const attentionEmpty = document.getElementById("attentionEmpty");
if (empty.length === 0) {
  attentionEmpty.hidden = false;
} else {
  attentionEmpty.hidden = true;
  empty.forEach(function (r) { attentionList.appendChild(buildRackRow(r)); });
}

const recent = racks.slice().sort(function (a, b) { return b.createdAt - a.createdAt; }).slice(0, 5);
const recentList = document.getElementById("recentList");
recent.forEach(function (r) { recentList.appendChild(buildRackRow(r)); });
