const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const upload = document.getElementById("upload");
const dropzone = document.getElementById("dropzone");
const imageRadiusEl = document.getElementById("imageRadius");

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

function render() {
  if (!image) return;

  const padding = 140;          // outer canvas padding
  const innerPadding = 12;      // 🔥 THIS IS THE FIX
  const dpr = window.devicePixelRatio || 1;

  const cardWidth = image.width + innerPadding * 2;
  const cardHeight = image.height + innerPadding * 2;

  const cssWidth = cardWidth + padding * 2;
  const cssHeight = cardHeight + padding * 2;

  canvas.style.width = cssWidth + "px";
  canvas.style.height = cssHeight + "px";
  canvas.width = cssWidth * dpr;
  canvas.height = cssHeight * dpr;

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, cssWidth, cssHeight);

  // Background
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, cssWidth, cssHeight);

  const x = (cssWidth - cardWidth) / 2;
  const y = (cssHeight - cardHeight) / 2;
  const radius = +imageRadiusEl.value;

  /* SHADOW */
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.35)";
  ctx.shadowBlur = 40;
  ctx.shadowOffsetY = 20;
  roundRect(ctx, x, y, cardWidth, cardHeight, radius);
  ctx.fill();
  ctx.restore();

  /* CARD */
  ctx.save();
  roundRect(ctx, x, y, cardWidth, cardHeight, radius);
  ctx.clip();

  // Card background (important for clean corners)
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(x, y, cardWidth, cardHeight);

  // Image inside the card
  ctx.drawImage(
    image,
    x + innerPadding,
    y + innerPadding
  );

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
