const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

ctx.imageSmoothingEnabled = true;
ctx.imageSmoothingQuality = "high";

const upload = document.getElementById("upload");
const dropzone = document.getElementById("dropzone");
const imageRadiusEl = document.getElementById("imageRadius");
const noiseToggle = document.getElementById("noiseToggle");

let image = null;

upload.addEventListener("change", e => loadImage(e.target.files[0]));
window.addEventListener("paste", e => {
  const item = [...e.clipboardData.items].find(i => i.type.includes("image"));
  if (item) loadImage(item.getAsFile());
});

function loadImage(file) {
  const img = new Image();
  img.onload = () => {
    image = img;
    dropzone.style.display = "none";
    render();
  };
  img.src = URL.createObjectURL(file);
}

imageRadiusEl.addEventListener("input", render);
noiseToggle.addEventListener("input", render);

function render() {
  if (!image) return;

  const padding = 120;
  const inset = 1; // 🔥 THE FIX

  const w = image.width + padding * 2;
  const h = image.height + padding * 2;

  canvas.width = w;
  canvas.height = h;

  ctx.clearRect(0, 0, w, h);

  // background
  ctx.fillStyle = "#ffd6e8";
  ctx.fillRect(0, 0, w, h);

  const x = (w - image.width) / 2;
  const y = (h - image.height) / 2;

  // SHADOW (unchanged)
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.35)";
  ctx.shadowBlur = 30;
  ctx.shadowOffsetY = 12;
  ctx.restore();

  // 🔥 ROUNDED CLIP — REDUCED BY 2px
  ctx.save();
  roundRect(
    ctx,
    x + inset,
    y + inset,
    image.width - inset * 2,
    image.height - inset * 2,
    +imageRadiusEl.value
  );
  ctx.clip();

  // 🔥 IMAGE DRAWN 1px INSIDE CLIP
  ctx.drawImage(
    image,
    x + inset,
    y + inset,
    image.width - inset * 2,
    image.height - inset * 2
  );

  ctx.restore();

  if (noiseToggle.checked) drawNoise(w, h);
}

function drawNoise(w, h) {
  ctx.save();
  ctx.globalCompositeOperation = "soft-light";
  ctx.globalAlpha = 0.22;
  for (let i = 0; i < w * h * 0.002; i++) {
    const x = Math.random() * w;
    const y = Math.random() * h;
    const v = Math.random() * 255;
    ctx.fillStyle = `rgb(${v},${v},${v})`;
    ctx.fillRect(x, y, 1.5, 1.5);
  }
  ctx.restore();
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
