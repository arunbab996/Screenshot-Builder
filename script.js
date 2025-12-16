const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const upload = document.getElementById("upload");
const dropzone = document.getElementById("dropzone");
const bgPicker = document.getElementById("bgPicker");
const noiseToggle = document.getElementById("noiseToggle");

const saveBtn = document.getElementById("save");
const copyBtn = document.getElementById("copy");
const resetBtn = document.getElementById("reset");

const OPTIONS = {
  proportions: ["Auto", "Square"],
  browserTheme: ["None", "Bright", "Dark"],
  padding: ["None", "Small", "Medium", "Large"],
  rounding: ["None", "Small", "Medium", "Large"],
  screenshotRounding: ["None", "Small", "Medium", "Large"],
  shadows: ["None", "Little", "Medium", "A lot"],
  position: [
    "Central",
    "Upper left corner",
    "Upper right corner",
    "Lower left corner",
    "Lower right corner"
  ]
};

let state = {
  proportions: "Auto",
  browserTheme: "None",
  padding: "Large",
  rounding: "Medium",
  screenshotRounding: "Large",
  shadows: "Little",
  position: "Central",
  noise: false
};

let image = null;
let bgColor = "#ffffff";

/* ---------- DROPDOWNS ---------- */
document.querySelectorAll(".dropdown").forEach(el => {
  const key = el.dataset.key;
  const trigger = document.createElement("div");
  trigger.className = "dropdown-trigger";
  trigger.textContent = state[key];
  el.appendChild(trigger);

  trigger.onclick = () => {
    closeMenus();
    const menu = document.createElement("div");
    menu.className = "dropdown-menu";

    OPTIONS[key].forEach(opt => {
      const item = document.createElement("div");
      item.textContent = opt;
      if (opt === state[key]) item.classList.add("active");

      item.onclick = () => {
        state[key] = opt;
        trigger.textContent = opt;
        render();
        closeMenus();
      };

      menu.appendChild(item);
    });

    el.appendChild(menu);
  };
});

function closeMenus() {
  document.querySelectorAll(".dropdown-menu").forEach(m => m.remove());
}

window.addEventListener("click", e => {
  if (!e.target.closest(".dropdown")) closeMenus();
});

/* ---------- UPLOAD ---------- */
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
    dropzone.style.display = "none";
    render();
  };
  img.src = URL.createObjectURL(file);
}

/* ---------- COLORS ---------- */
document.querySelectorAll(".colors button[data-color]").forEach(btn => {
  btn.style.background = btn.dataset.color;
  btn.onclick = () => {
    bgColor = btn.dataset.color;
    document.querySelectorAll(".colors button").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    render();
  };
});

bgPicker.oninput = e => {
  bgColor = e.target.value;
  render();
};

/* ---------- NOISE ---------- */
noiseToggle.onchange = () => {
  state.noise = noiseToggle.checked;
  render();
};

/* ---------- RENDER ---------- */
function render() {
  if (!image) return;

  const paddingMap = { None: 0, Small: 40, Medium: 80, Large: 140 };
  const roundMap = { None: 0, Small: 8, Medium: 16, Large: 28 };
  const shadowMap = {
    None: 0,
    Little: 20,
    Medium: 40,
    "A lot": 70
  };

  const padding = paddingMap[state.padding];
  const radius = roundMap[state.screenshotRounding];
  const shadow = shadowMap[state.shadows];

  canvas.width = image.width + padding * 2;
  canvas.height = image.height + padding * 2;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  /* BG */
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const x = padding;
  const y = padding;

  /* SHADOW PASS */
  if (shadow > 0) {
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.45)";
    ctx.shadowBlur = shadow;
    ctx.shadowOffsetY = shadow / 2;
    ctx.drawImage(image, x, y);
    ctx.restore();
  }

  /* IMAGE */
  drawRoundedImage(ctx, image, x, y, image.width, image.height, radius);

  /* NOISE */
  if (state.noise) drawNoise();
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
  ctx.drawImage(img, x, y);
  ctx.restore();
}

function drawNoise() {
  ctx.save();
  ctx.globalCompositeOperation = "overlay";
  ctx.globalAlpha = 0.12;

  for (let i = 0; i < canvas.width * canvas.height * 0.0015; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const v = Math.random() * 255;
    ctx.fillStyle = `rgb(${v},${v},${v})`;
    ctx.fillRect(x, y, 1, 1);
  }

  ctx.restore();
}

/* ---------- EXPORT ---------- */
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
