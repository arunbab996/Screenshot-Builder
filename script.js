const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const upload = document.getElementById("upload");
const dropzone = document.getElementById("dropzone");

const proportionEl = document.getElementById("proportion");
const outerRadiusEl = document.getElementById("outerRadius");
const imageRadiusEl = document.getElementById("imageRadius");
const noiseToggle = document.getElementById("noiseToggle");
const bgPicker = document.getElementById("bgPicker");

const saveBtn = document.getElementById("save");
const copyBtn = document.getElementById("copy");

const OPTIONS = {
  browserTheme: ["None", "Light", "Dark"],
  padding: ["None", "Small", "Medium", "Large"],
  shadows: ["None", "Little", "Medium", "A lot"]
};

let state = {
  browserTheme: "None",
  padding: "Large",
  shadows: "Little"
};

let image = null;
let bgColor = "#ffffff";

/* DROPDOWNS */
document.querySelectorAll(".dropdown").forEach(el => {
  const key = el.dataset.key;
  const trigger = document.createElement("div");
  trigger.className = "dropdown-trigger";
  trigger.textContent = state[key];
  el.appendChild(trigger);

  trigger.onclick = () => {
    document.querySelectorAll(".dropdown-menu").forEach(m => m.remove());
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
        menu.remove();
      };

      menu.appendChild(item);
    });

    el.appendChild(menu);
  };
});

/* IMAGE LOAD */
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

/* COLORS */
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

/* CONTROLS */
[
  proportionEl,
  outerRadiusEl,
  imageRadiusEl,
  noiseToggle
].forEach(el => el.addEventListener("input", render));

/* RENDER */
function render() {
  if (!image) return;

  const paddingMap = { None: 0, Small: 40, Medium: 80, Large: 140 };
  const shadowMap = { None: 0, Little: 18, Medium: 36, "A lot": 60 };

  const padding = paddingMap[state.padding];
  const shadow = shadowMap[state.shadows];
  const chromeH = state.browserTheme === "None" ? 0 : 36;

  let w = image.width + padding * 2;
  let h = image.height + padding * 2 + chromeH;

  if (proportionEl.value == 1) {
    const m = Math.max(w, h);
    w = h = m;
  } else if (proportionEl.value == 2) {
    h = w * 9 / 16;
  }

  canvas.width = w;
  canvas.height = h;

  ctx.clearRect(0, 0, w, h);
  ctx.save();

  /* CANVAS ROUNDING */
  roundRect(ctx, 0, 0, w, h, +outerRadiusEl.value);
  ctx.clip();

  /* BACKGROUND */
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, w, h);

  const imgX = (w - image.width) / 2;
  const imgY = (h - image.height - chromeH) / 2;

  /* SHADOW — MATCHES ROUNDED SHAPE */
  if (shadow > 0) {
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.45)";
    ctx.shadowBlur = shadow;
    ctx.shadowOffsetY = shadow / 2;

    roundRect(
      ctx,
      imgX,
      imgY,
      image.width,
      image.height + chromeH,
      +imageRadiusEl.value
    );
    ctx.fill();
    ctx.restore();
  }

  /* IMAGE GROUP */
  ctx.save();
  roundRect(ctx, imgX, imgY, image.width, image.height + chromeH, +imageRadiusEl.value);
  ctx.clip();

  ctx.fillStyle = state.browserTheme === "Dark" ? "#1f1f1f" : "#f3f4f6";
  ctx.fillRect(imgX, imgY, image.width, image.height + chromeH);

  if (chromeH > 0) {
    ctx.fillStyle = state.browserTheme === "Dark" ? "#1f1f1f" : "#f3f4f6";
    ctx.fillRect(imgX, imgY, image.width, chromeH);

    ["#ff5f56", "#ffbd2e", "#27c93f"].forEach((c, i) => {
      ctx.fillStyle = c;
      ctx.beginPath();
      ctx.arc(imgX + 18 + i * 16, imgY + chromeH / 2, 6, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  ctx.drawImage(image, imgX, imgY + chromeH);
  ctx.restore();

  /* NOISE */
  if (noiseToggle.checked) {
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

  ctx.restore();
}

/* HELPERS */
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/* EXPORT */
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
