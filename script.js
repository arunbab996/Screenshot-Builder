const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

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

  const padding = 140;
  const dpr = window.devicePixelRatio || 1;

  const cssWidth = image.width + padding * 2;
  const cssHeight = image.height + padding * 2;

  // ✅ DPR-aware canvas
  canvas.style.width = cssWidth + "px";
  canvas.style.height = cssHeight + "px";
  canvas.width = cssWidth * dpr;
  canvas.height = cssHeight * dpr;

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, cssWidth, cssHeight);

  // background
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, cssWidth, cssHeight);

  const x = (cssWidth - image.width) / 2;
  const y = (cssHeight - image.height) / 2;
  const radius = +imageRadiusEl.value;

  // shadow (rounded)
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.35)";
  ctx.shadowBlur = 40;
  ctx.shadowOffsetY = 20;

  roundRect(ctx, x, y, image.width, image.height, radius);
  ctx.fill();
  ctx.restore();

  // image (perfectly clipped)
  ctx.save();
  roundRect(ctx, x, y, image.width, image.height, radius);
  ctx.clip();
  ctx.drawImage(image, x, y);
  ctx.restore();

  if (noiseToggle.checked) drawNoise(cssWidth, cssHeight);
}

function drawNoise(w, h) {
  ctx.save();
  ctx.globalCompositeOperation = "soft-light";
  ctx.globalAlpha = 0.18;

  for (let i = 0; i < w * h * 0.002; i++) {
    const x = Math.random() * w;
    const y = Math.random() * h;
    const v = Math.random() * 255;
    ctx.fillStyle = `rgb(${v},${v},${v})`;
    ctx.fillRect(x, y, 1, 1);
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
