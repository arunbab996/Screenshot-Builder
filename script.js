const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const upload = document.getElementById("upload");
const proportionEl = document.getElementById("proportion");
const browserThemeEl = document.getElementById("browserTheme");
const outerRadiusEl = document.getElementById("outerRadius");
const imageRadiusEl = document.getElementById("imageRadius");
const noiseEl = document.getElementById("noise");

let image = null;
const BG_COLOR = "#ffffff";

/* ---------- IMAGE LOAD ---------- */
upload.addEventListener("change", e => loadImage(e.target.files[0]));

window.addEventListener("paste", e => {
  const item = [...e.clipboardData.items].find(i => i.type.includes("image"));
  if (item) loadImage(item.getAsFile());
});

function loadImage(file) {
  if (!file) return;
  const img = new Image();
  img.onload = () => {
    image = img;
    document.querySelector(".dropzone").style.display = "none";
    render();
  };
  img.src = URL.createObjectURL(file);
}

/* ---------- CONTROLS ---------- */
[
  proportionEl,
  browserThemeEl,
  outerRadiusEl,
  imageRadiusEl,
  noiseEl
].forEach(el => el.addEventListener("input", render));

/* ---------- RENDER (CORRECT PIPELINE) ---------- */
function render() {
  if (!image) return;

  const chromeHeight =
    browserThemeEl.value === "None" ? 0 : 36;

  let w = image.width + 240;
  let h = image.height + 240 + chromeHeight;

  /* PROPORTIONS */
  if (proportionEl.value == 1) {
    const m = Math.max(w, h);
    w = h = m;
  } else if (proportionEl.value == 2) {
    h = w * 9 / 16;
  }

  canvas.width = w;
  canvas.height = h;

  ctx.clearRect(0, 0, w, h);

  /* CANVAS ROUNDING */
  ctx.save();
  roundRect(ctx, 0, 0, w, h, +outerRadiusEl.value);
  ctx.clip();

  /* BACKGROUND */
  ctx.fillStyle = BG_COLOR;
  ctx.fillRect(0, 0, w, h);

  /* IMAGE CONTAINER */
  const imgX = (w - image.width) / 2;
  const imgY = (h - image.height - chromeHeight) / 2;

  /* SHADOW */
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.45)";
  ctx.shadowBlur = 40;
  ctx.shadowOffsetY = 20;
  ctx.fillRect(imgX, imgY, image.width, image.height + chromeHeight);
  ctx.restore();

  /* SCREENSHOT ROUNDING */
  ctx.save();
  roundRect(
    ctx,
    imgX,
    imgY,
    image.width,
    image.height + chromeHeight,
    +imageRadiusEl.value
  );
  ctx.clip();

  /* BROWSER BAR (ON IMAGE) */
  if (chromeHeight > 0) {
    ctx.fillStyle =
      browserThemeEl.value === "Dark" ? "#1f1f1f" : "#f3f4f6";
    ctx.fillRect(imgX, imgY, image.width, chromeHeight);

    ["#ff5f56", "#ffbd2e", "#27c93f"].forEach((c, i) => {
      ctx.fillStyle = c;
      ctx.beginPath();
      ctx.arc(imgX + 18 + i * 16, imgY + chromeHeight / 2, 6, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  /* IMAGE */
  ctx.drawImage(image, imgX, imgY + chromeHeight);

  ctx.restore(); // screenshot clip

  /* NOISE */
  if (noiseEl.checked) drawNoise(w, h);

  ctx.restore(); // canvas clip
}

/* ---------- HELPERS ---------- */
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawNoise(w, h) {
  ctx.save();
  ctx.globalCompositeOperation = "overlay";
  ctx.globalAlpha = 0.18;

  for (let i = 0; i < w * h * 0.0015; i++) {
    const x = Math.random() * w;
    const y = Math.random() * h;
    const v = Math.random() * 255;
    ctx.fillStyle = `rgb(${v},${v},${v})`;
    ctx.fillRect(x, y, 1, 1);
  }

  ctx.restore();
}
