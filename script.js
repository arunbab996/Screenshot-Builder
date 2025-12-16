const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const upload = document.getElementById("upload");
const dropzone = document.getElementById("dropzone");
const imageRadiusEl = document.getElementById("imageRadius");
const shadowStrengthEl = document.getElementById("shadowStrength");

let image = null;

upload.addEventListener("change", e => loadImage(e.target.files[0]));
window.addEventListener("paste", e => {
  const item = [...e.clipboardData.items].find(i => i.type.includes("image"));
  if (item) loadImage(item.getAsFile());
});

imageRadiusEl.addEventListener("input", render);
shadowStrengthEl.addEventListener("input", render);

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

  const padding = 160;
  const dpr = window.devicePixelRatio || 1;
  const radius = +imageRadiusEl.value;
  const shadow = +shadowStrengthEl.value;

  const cssWidth = image.width + padding * 2;
  const cssHeight = image.height + padding * 2;

  // DPR-safe canvas setup
  canvas.style.width = cssWidth + "px";
  canvas.style.height = cssHeight + "px";
  canvas.width = cssWidth * dpr;
  canvas.height = cssHeight * dpr;

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, cssWidth, cssHeight);

  // 1. Draw Background
  ctx.fillStyle = "#d9f99d"; 
  ctx.fillRect(0, 0, cssWidth, cssHeight);

  const x = (cssWidth - image.width) / 2;
  const y = (cssHeight - image.height) / 2;

  /* -----------------------------
     2. DRAW SHADOW (With Bleed Fix)
     ----------------------------- */
  if (shadow > 0) {
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.4)";
    ctx.shadowBlur = shadow;
    ctx.shadowOffsetY = shadow * 0.5;
    
    // Use black fill for the shadow caster to avoid white edges
    ctx.fillStyle = "rgba(0,0,0,1)"; 

    // INSET FIX: Shrink the shadow caster by 4px so it stays hidden behind the image
    const shrink = 4; 
    roundRect(
      ctx, 
      x + shrink, 
      y + shrink, 
      image.width - (shrink * 2), 
      image.height - (shrink * 2), 
      radius
    );
    ctx.fill();
    ctx.restore();
  }

  /* -----------------------------
     3. DRAW IMAGE
     ----------------------------- */
  ctx.save();
  roundRect(ctx, x, y, image.width, image.height, radius);
  ctx.clip();
  ctx.drawImage(image, x, y, image.width, image.height);
  ctx.restore();
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  // Clamp radius to ensure it doesn't exceed image dimensions
  const safeR = Math.min(r, w / 2, h / 2);
  
  ctx.moveTo(x + safeR, y);
  ctx.arcTo(x + w, y, x + w, y + h, safeR);
  ctx.arcTo(x + w, y + h, x, y + h, safeR);
  ctx.arcTo(x, y + h, x, y, safeR);
  ctx.arcTo(x, y, x + w, y, safeR);
  ctx.closePath();
}
