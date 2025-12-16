const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const upload = document.getElementById("upload");
const paddingInput = document.getElementById("padding");
const radiusInput = document.getElementById("radius");
const bgColorInput = document.getElementById("bgColor");
const shadowInput = document.getElementById("shadow");
const downloadBtn = document.getElementById("download");

let image = null;

upload.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const img = new Image();
  img.onload = () => {
    image = img;
    render();
  };
  img.src = URL.createObjectURL(file);
});

[paddingInput, radiusInput, bgColorInput, shadowInput].forEach(el =>
  el.addEventListener("input", render)
);

function render() {
  if (!image) return;

  const padding = parseInt(paddingInput.value);
  const radius = parseInt(radiusInput.value);
  const bgColor = bgColorInput.value;
  const shadowEnabled = shadowInput.checked;

  canvas.width = image.width + padding * 2;
  canvas.height = image.height + padding * 2;

  // Background
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Shadow
  if (shadowEnabled) {
    ctx.shadowColor = "rgba(0,0,0,0.35)";
    ctx.shadowBlur = 40;
    ctx.shadowOffsetY = 20;
  } else {
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
  }

  drawRoundedImage(
    ctx,
    image,
    padding,
    padding,
    image.width,
    image.height,
    radius
  );
}

function drawRoundedImage(ctx, img, x, y, w, h, r) {
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
  ctx.clip();

  ctx.drawImage(img, x, y, w, h);
  ctx.restore();
}

downloadBtn.addEventListener("click", () => {
  const link = document.createElement("a");
  link.download = "screenshot.png";
  link.href = canvas.toDataURL("image/png");
  link.click();
});
