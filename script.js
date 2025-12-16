const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const upload = document.getElementById("upload");
const dropzone = document.getElementById("dropzone");
const imageRadiusEl = document.getElementById("imageRadius");
const shadowStrengthEl = document.getElementById("shadowStrength");

let image = null;

// Offscreen canvas for true image rounding
const maskCanvas = document.createElement("canvas");
const maskCtx = maskCanvas.getContext("2d");

upload.addEventListener("change", e => loadImage(e.target.files[0]));
window.addEventListener("paste", e => {
  const item = [...e.clipboardData.items].find(i => i.type.includes("image"));
  if (item) loadImage(item.getAsFile());
});

imageRadiusEl.addEventListener("input", render);
shadowStrengthEl.addEventListener("input", render);

function loadImage(file) {
  if (!file) return;
  const img = new Image();
  img.onload = () => {
    image = img;
    dropzone.style.display = "none";
    render();
  };
  img.src = URL.createObjectURL(file);
}

function render() {
  if (!image) return;

  const padding = 160;
  const dpr = window.devicePixelRatio || 1;
  const radius = +imageRadiusEl.value;
  const shadow = +shadowStrengthEl.value;

  const cssWidth = image.width + padding * 2;
  const cssHeight = image.height + padding * 2;

  // DPR-safe canvas
  canvas.style.width = cssWidth + "px";
  canvas.style.height = cssHeight + "px";
  canvas.width = cssWidth * dpr;
  canvas.height = cssHeight * dpr;

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, cssWidth, cssHeight);

  // Background
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, cssWidth, cssHeight);

  const x = (cssWidth - image.width) / 2;
  const y = (cssHeight - image.height) / 2;

  /* -----------------------------
     1️⃣ SHADOW FROM GEOMETRY
     ----------------------------- */
  if (shadow > 0) {
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.35)";
    ctx.shadowBlur = shadow;
    ctx.shadowOffsetY = shadow * 0.5;

    roundRect(ctx, x, y, image.width, image.height, radius);
    ctx.fillStyle = "rgba(0,0,0,0.01)"; // must be non-zero alpha
    ctx.fill();
    ctx.restore();
  }

  /* -----------------------------
     2️⃣ TRUE IMAGE ROUNDING
     ----------------------------- */
  maskCanvas.width = image.width;
  maskCanvas.height = image.height;

  maskCtx.clearRect(0, 0, maskCanvas.width, maskCanvas.height);
  maskCtx.save();
  roundRect(maskCtx, 0, 0, image.width, image.height, radius);
  maskCtx.clip();
  maskCtx.drawImage(image, 0, 0);
  maskCtx.restore();

  ctx.drawImage(maskCanvas, x, y);
}

/* Utility */
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
