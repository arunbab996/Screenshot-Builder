const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const upload = document.getElementById("upload");
const dropzone = document.getElementById("dropzone");

const paddingEl = document.getElementById("padding");
const radiusEl = document.getElementById("radius");
const shadowEl = document.getElementById("shadow");
const noiseEl = document.getElementById("noise");
const bgPicker = document.getElementById("bgPicker");

const colorButtons = document.querySelectorAll(".colors button[data-color]");
const saveBtn = document.getElementById("save");
const copyBtn = document.getElementById("copy");

let image = null;
let bgColor = "#ffffff";

/* Upload */
upload.addEventListener("change", e => loadImage(e.target.files[0]));

/* Paste */
window.addEventListener("paste", e => {
  const item = [...e.clipboardData.items].find(i => i.type.includes("image"));
  if (item) loadImage(item.getAsFile());
});

/* BG swatches */
colorButtons.forEach(btn => {
  btn.style.background = btn.dataset.color;
  btn.onclick = () => {
    bgColor = btn.dataset.color;
    colorButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    render();
  };
});

/* Custom color */
bgPicker.addEventListener("input", e => {
  bgColor = e.target.value;
  colorButtons.forEach(b => b.classList.remove("active"));
  render();
});

/* Live updates */
[paddingEl, radiusEl, shadowEl, noiseEl].forEach(el =>
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

  const padding = +paddingEl.value;
  const radius = +radiusEl.value;
  const shadow = +shadowEl.value;
  const noise = +noiseEl.value;

  canvas.width = image.width + padding * 2;
  canvas.height = image.height + padding * 2;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  /* BG */
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  /* Shadow */
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.4)";
  ctx.shadowBlur = shadow;
  ctx.shadowOffsetY = shadow / 2;

  drawRoundedImage(
    ctx,
    image,
    padding,
    padding,
    image.width,
    image.height,
    radius
  );
  ctx.restore();

  /* Noise overlay */
  if (noise > 0) drawNoise(noise);
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
  ctx.save();
  ctx.globalAlpha = 0.15;
  for (let i = 0; i < amount * 200; i++) {
    ctx.fillStyle = `rgba(0,0,0,${Math.random()})`;
    ctx.fillRect(
      Math.random() * canvas.width,
      Math.random() * canvas.height,
      1,
      1
    );
  }
  ctx.restore();
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
