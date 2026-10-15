// ---------- Scan QR page: camera-based QR scanning for storage units ----------
const scanOverlay = document.getElementById("scanOverlay");
const scanOverlayFrameWrap = document.querySelector(".scan-overlay-frame-wrap");
const scannerVideo = document.getElementById("scannerVideo");
const scannerLine = document.getElementById("scannerLine");
const scanStatus = document.getElementById("scanStatus");
const startScanBtn = document.getElementById("startScanBtn");
const stopScanBtn = document.getElementById("stopScanBtn");
const scanManualForm = document.getElementById("scanManualForm");
const scanManualInput = document.getElementById("scanManualInput");

const scanCanvas = document.createElement("canvas");
const scanCanvasCtx = scanCanvas.getContext("2d", { willReadFrequently: true });

let scanStream = null;
let scanRafId = null;
let scanFoundAt = 0; // timestamp of the last successful match, to pause re-triggering during the redirect
let lastMissText = null;
let lastMissAt = 0;

function setStatus(message, kind) {
  scanStatus.textContent = message || "";
  scanStatus.className = "scan-status" + (kind ? " " + kind : "");
}

// Extracts a Storage ID from whatever a QR code decodes to. The app's own QR
// codes encode a full absolute URL like ".../storage-detail.html?id=ST-1008"
// (see rackQrThumbHtml / populateQrPrintArea in common.js) — but fall back to
// treating the raw decoded text as a bare ID too, in case it's encoded that way.
function extractStorageId(decodedText) {
  const text = (decodedText || "").trim();
  if (!text) return null;

  try {
    const url = new URL(text, window.location.href);
    const idParam = url.searchParams.get("id");
    if (idParam) return idParam;
  } catch (e) {
    // Not a URL — fall through to the bare-ID case below.
  }

  return text;
}

function goToStorage(rack) {
  setStatus(`Found "${rack.name}" (${rack.id}) — opening…`, "success");
  scanOverlayFrameWrap.classList.add("found");
  if (navigator.vibrate) navigator.vibrate(80);
  stopCamera();
  setTimeout(function () {
    window.location.href = rackDetailUrl(rack.id);
  }, 500);
}

function handleDecodedText(decodedText) {
  if (scanFoundAt) return; // already matched, waiting to redirect

  const id = extractStorageId(decodedText);
  if (!id) return;

  const rack = findRack(id);
  if (rack) {
    scanFoundAt = Date.now();
    goToStorage(rack);
    return;
  }

  // Avoid spamming the same "not found" message every single frame.
  const now = Date.now();
  if (id === lastMissText && now - lastMissAt < 2500) return;
  lastMissText = id;
  lastMissAt = now;
  setStatus(`No storage found for "${id}"`, "error");
}

function scanFrame() {
  if (!scanStream) return;

  if (scannerVideo.readyState === scannerVideo.HAVE_ENOUGH_DATA) {
    scanCanvas.width = scannerVideo.videoWidth;
    scanCanvas.height = scannerVideo.videoHeight;
    scanCanvasCtx.drawImage(scannerVideo, 0, 0, scanCanvas.width, scanCanvas.height);
    const imageData = scanCanvasCtx.getImageData(0, 0, scanCanvas.width, scanCanvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: "dontInvert" });
    if (code && code.data) handleDecodedText(code.data);
  }

  scanRafId = requestAnimationFrame(scanFrame);
}

function cameraSupportError() {
  if (!window.isSecureContext) {
    return "Camera access needs a secure connection (HTTPS or localhost). Use the ID field below instead.";
  }
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    return "This browser doesn't support camera access. Use the ID field below instead.";
  }
  return null;
}

function openScanOverlay() {
  scanOverlay.hidden = false;
}
function closeScanOverlay() {
  scanOverlay.hidden = true;
}

function startCamera() {
  const unsupported = cameraSupportError();
  if (unsupported) {
    setStatus(unsupported, "error");
    return;
  }

  setStatus("Requesting camera access…");
  navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" } } })
    .then(function (stream) {
      scanStream = stream;
      scanFoundAt = 0;
      scannerVideo.srcObject = stream;
      scannerVideo.play();
      scannerVideo.hidden = false;
      scanOverlayFrameWrap.classList.remove("found");
      scannerLine.hidden = false;
      setStatus("Align QR code within the frame");
      scanRafId = requestAnimationFrame(scanFrame);
    })
    .catch(function (err) {
      const message = err && err.name === "NotAllowedError"
        ? "Camera permission denied. Allow camera access, or use the ID field below."
        : "Couldn't access the camera. Use the ID field below instead.";
      setStatus(message, "error");
    });
}

function stopCamera() {
  if (scanRafId) cancelAnimationFrame(scanRafId);
  scanRafId = null;
  if (scanStream) {
    scanStream.getTracks().forEach(function (track) { track.stop(); });
    scanStream = null;
  }
  scannerVideo.pause();
  scannerVideo.srcObject = null;
  scannerVideo.hidden = true;
  scannerLine.hidden = true;
}

startScanBtn.addEventListener("click", function () {
  openScanOverlay();
  startCamera();
});
stopScanBtn.addEventListener("click", function () {
  stopCamera();
  closeScanOverlay();
  setStatus("");
});

scanManualForm.addEventListener("submit", function (e) {
  e.preventDefault();
  const id = scanManualInput.value.trim();
  if (!id) return;
  const rack = findRack(id);
  if (!rack) {
    showToast(`No storage found for "${id}"`, "danger");
    return;
  }
  goToStorage(rack);
});

document.addEventListener("visibilitychange", function () {
  if (document.hidden) {
    stopCamera();
    closeScanOverlay();
  }
});
window.addEventListener("beforeunload", stopCamera);
