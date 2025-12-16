const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const upload = document.getElementById("upload");
const dropzone = document.getElementById("dropzone");

const controls = {
  proportion: document.getElementById("proportion"),
  padding: document.getElementById("padding"),
  imageRadius: document.getElementById("imageRadius"),
  position: document.getElementById("position"),
  shadow: document.getElementById("shadow"),
  noise: document.getElementById("noise"),
  bgPicker: document.getElementById("bgPicker")
};

const saveBtn = document.getElementById("save");
const copyBtn = document.getElementById("copy");
const colorButtons = document.querySelectorAll(".colors button[data-color]");

let image = null;
let bgColor = "#020617";

/* Upload */
upload.addEventListener("change", e => loadImage(e.target.files[0]));

/* Paste */
window.addEventListener("paste", e => {
  const item = [...e.clipboardData.items].find(i => i.type.includes("image"));
  if (item) loadImage(item.getAsFile());
});

/* BG Colors */
colorButtons.forEach(btn => {
  btn.style.background = btn.dataset.color;
  btn.onclick = () => {
    bgColor = btn.dataset.color;
    render();
  };
});

controls.bgPicker.addEventListener("input", e => {
  bgColor = e.target.value;
  render();
});

/* Live updates */
Object.values(controls).forEach(el =>
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

  const padding = +controls.padding.value;
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

  drawRoundedImage(
    ctx,
    image,
    (width - image.width) / 2,
    y,
    image.width,
    image.height,
    +controls.imageRadius.value
  );

  if (+controls.noise.value > 0) drawNoise(+controls.noise.value);
}

function applyShadow() {
  const s = +controls.shadow.value;
  ctx.shadowColor = "rgba(0,0,0,0.35)";
  ctx.shadowBlur = s;
  ctx.shadowOffsetY = s / 2;
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

function drawNoise(amount) {
  const imgData = ctx.createImageData(canvas.width, canvas.height);
  for (let i = 0; i < imgData.data.length; i += 4) {
    const v = Math.random() * amount;
    imgData.data[i] = v;
    imgData.data[i + 1] = v;
    imgData.data[i + 2] = v;
    imgData.data[i + 3] = 20;
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
