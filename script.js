const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const off = document.createElement("canvas");
const offCtx = off.getContext("2d");

const upload = document.getElementById("upload");
const dropzone = document.getElementById("dropzone");

const proportionEl = document.getElementById("proportion");
const outerRadiusEl = document.getElementById("outerRadius");
const imageRadiusEl = document.getElementById("imageRadius");
const noiseToggle = document.getElementById("noiseToggle");
const bgPicker = document.getElementById("bgPicker");

let image = null;
let bgColor = "#ffffff";

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

[proportionEl, outerRadiusEl, imageRadiusEl, noiseToggle].forEach(el =>
  el.addEventListener("input", render)
);

function render() {
  if (!image) return;

  const padding = 140;
  const chromeH = 0;

  let w = image.width + padding * 2;
  let h = image.height + padding * 2;

  canvas.width = w;
  canvas.height = h;

  ctx.clearRect(0, 0, w, h);

  /* background */
  ctx.save();
  roundRect(ctx, 0, 0, w, h, +outerRadiusEl.value);
  ctx.clip();
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();

  /* OFFSCREEN CARD */
  off.width = image.width;
  off.height = image.height;

  offCtx.clearRect(0, 0, off.width, off.height);
  offCtx.save();
  roundRect(offCtx, 0, 0, off.width, off.height, +imageRadiusEl.value);
  offCtx.clip();
  offCtx.drawImage(image, 0, 0);
  offCtx.restore();

  /* SHADOW */
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.35)";
  ctx.shadowBlur = 30;
  ctx.shadowOffsetY = 15;
  ctx.drawImage(
    off,
    (w - off.width) / 2,
    (h - off.height) / 2
  );
  ctx.restore();

  /* IMAGE */
  ctx.drawImage(
    off,
    (w - off.width) / 2,
    (h - off.height) / 2
  );

  /* NOISE */
  if (noiseToggle.checked) drawNoise(w, h);
}

function drawNoise(w, h) {
  ctx.save();
  ctx.globalCompositeOperation = "soft-light";
  ctx.globalAlpha = 0.25;

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
