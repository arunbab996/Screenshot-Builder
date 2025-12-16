const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const dropzone = document.getElementById("dropzone");
const upload = document.getElementById("upload");

const controls = {
  proportion: document.getElementById("proportion"),
  browserTheme: document.getElementById("browserTheme"),
  paddingPreset: document.getElementById("paddingPreset"),
  outerRadius: document.getElementById("outerRadius"),
  imageRadius: document.getElementById("imageRadius"),
  position: document.getElementById("position"),
  shadowLevel: document.getElementById("shadowLevel"),
  noise: document.getElementById("noise")
};

const saveBtn = document.getElementById("save");
const copyBtn = document.getElementById("copy");
const resetBtn = document.getElementById("reset");
const colorButtons = document.querySelectorAll(".colors button");

let image = null;
let bgColor = "#0f172a";

upload.addEventListener("change", e => loadImage(e.target.files[0]));

window.addEventListener("paste", e => {
  const item = [...e.clipboardData.items].find(i => i.type.includes("image"));
  if (item) loadImage(item.getAsFile());
});

dropzone.addEventListener("dragover", e => e.preventDefault());
dropzone.addEventListener("drop", e => {
  e.preventDefault();
  loadImage(e.dataTransfer.files[0]);
});

colorButtons.forEach(btn => {
  btn.style.background = btn.dataset.color;
  btn.onclick = () => {
    bgColor = btn.dataset.color;
    render();
  };
});

Object.values(controls).forEach(el =>
  el.addEventListener("change", render)
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

  const padding = +controls.paddingPreset.value;
  const outerR = +controls.outerRadius.value;
  const imgR = +controls.imageRadius.value;

  let width = image.width + padding * 2;
  let height = image.height + padding * 2;

  if (controls.proportion.value === "1") {
    width = height = Math.max(width, height);
  }
  if (controls.proportion.value === "16/9") {
    height = width * 9 / 16;
  }

  canvas.width = width;
  canvas.height = height;

  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, width, height);

  applyShadow();

  const y =
    controls.position.value === "top"
      ? padding
      : (height - image.height) / 2;

  drawRoundedImage(ctx, image, (width - image.width) / 2, y, image.width, image.height, imgR);

  if (controls.noise.checked) drawNoise();
}

function applyShadow() {
  const level = controls.shadowLevel.value;
  if (level === "none") {
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
  }
  if (level === "little") {
    ctx.shadowColor = "rgba(0,0,0,0.35)";
    ctx.shadowBlur = 30;
    ctx.shadowOffsetY = 20;
  }
  if (level === "heavy") {
    ctx.shadowColor = "rgba(0,0,0,0.5)";
    ctx.shadowBlur = 60;
    ctx.shadowOffsetY = 40;
  }
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

function drawNoise() {
  const imgData = ctx.createImageData(canvas.width, canvas.height);
  for (let i = 0; i < imgData.data.length; i += 4) {
    const v = Math.random() * 20;
    imgData.data[i] = v;
    imgData.data[i + 1] = v;
    imgData.data[i + 2] = v;
    imgData.data[i + 3] = 30;
  }
  ctx.putImageData(imgData, 0, 0);
}

saveBtn.onclick = () => {
  const a = document.createElement("a");
  a.download = "screenshot.png";
  a.href = canvas.toDataURL();
  a.click();
};

copyBtn.onclick = async () => {
  const blob = await new Promise(r => canvas.toBlob(r));
  await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
};

resetBtn.onclick = () => location.reload();
