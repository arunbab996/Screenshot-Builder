const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const upload = document.getElementById("upload");
const dropzone = document.getElementById("dropzone");
const paddingInput = document.getElementById("padding");
const radiusInput = document.getElementById("radius");
const shadowInput = document.getElementById("shadow");
const downloadBtn = document.getElementById("download");
const colorButtons = document.querySelectorAll(".colors button");

let image = null;
let bgColor = "#0f172a";

/* Upload */
upload.addEventListener("change", e => loadImage(e.target.files[0]));

/* Paste */
window.addEventListener("paste", e => {
  const item = [...e.clipboardData.items].find(i => i.type.includes("image"));
  if (item) loadImage(item.getAsFile());
});

/* Drag */
dropzone.addEventListener("dragover", e => e.preventDefault());
dropzone.addEventListener("drop", e => {
  e.preventDefault();
  loadImage(e.dataTransfer.files[0]);
});

/* Color select */
colorButtons.forEach(btn => {
  btn.style.background = btn.dataset.color;
  btn.onclick = () => {
    bgColor = btn.dataset.color;
    render();
  };
});

[paddingInput, radiusInput, shadowInput].forEach(el =>
  el.addEventListener("input", render)
);

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

  const padding = +paddingInput.value;
  const radius = +radiusInput.value;

  canvas.width = image.width + padding * 2;
  canvas.height = image.height + padding * 2;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (shadowInput.checked) {
    ctx.shadowColor = "rgba(0,0,0,0.4)";
    ctx.shadowBlur = 40;
    ctx.shadowOffsetY = 20;
  } else {
    ctx.shadowColor = "transparent";
  }

  drawRoundedImage(ctx, image, padding, padding, image.width, image.height, radius);
}

function drawRoundedImage(ctx, img, x, y, w, h, r) {
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
  ctx.clip();
  ctx.drawImage(img, x, y, w, h);
  ctx.restore();
}

downloadBtn.onclick = () => {
  const a = document.createElement("a");
  a.download = "screenshot.png";
  a.href = canvas.toDataURL();
  a.click();
};
