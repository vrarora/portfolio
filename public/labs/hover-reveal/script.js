const viewport = document.querySelector("#viewport");
const canvas = document.querySelector("#artworkCanvas");
const baseImage = document.querySelector("#baseImage");
const metalImage = document.querySelector("#metalImage");

if (!viewport || !canvas || !baseImage || !metalImage) {
  throw new Error("Missing artwork elements.");
}

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const lerp = (start, end, amount) => start + (end - start) * amount;

const waitForImage = (image) =>
  new Promise((resolve, reject) => {
    if (image.complete && image.naturalWidth > 0) {
      resolve(image);
      return;
    }

    const onLoad = () => {
      cleanup();
      resolve(image);
    };
    const onError = () => {
      cleanup();
      reject(new Error(`Failed to load ${image.currentSrc || image.src || "image"}`));
    };
    const cleanup = () => {
      image.removeEventListener("load", onLoad);
      image.removeEventListener("error", onError);
    };

    image.addEventListener("load", onLoad, { once: true });
    image.addEventListener("error", onError, { once: true });
  });

const context = canvas.getContext("2d", { alpha: true });
if (!context) {
  throw new Error("2D canvas unavailable.");
}

const revealCanvas = document.createElement("canvas");
const revealContext = revealCanvas.getContext("2d", { alpha: true });
if (!revealContext) {
  throw new Error("Reveal canvas unavailable.");
}

const metalCanvas = document.createElement("canvas");
const metalContext = metalCanvas.getContext("2d", { alpha: true });
if (!metalContext) {
  throw new Error("Metal canvas unavailable.");
}

const state = {
  loaded: false,
  imageAspect: 1,
  renderBounds: { x: 0, y: 0, width: 1, height: 1 },
  pointer: {
    inside: false,
    x: 0.5,
    y: 0.5,
    targetX: 0.5,
    targetY: 0.5,
    speed: 0,
    targetSpeed: 0,
    lastMoveTime: 0,
  },
  lastFrameTime: 0,
  rafId: 0,
};

const resizeCanvases = () => {
  const rect = viewport.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0) {
    return;
  }

  const devicePixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  const width = Math.max(1, Math.round(rect.width * devicePixelRatio));
  const height = Math.max(1, Math.round(rect.height * devicePixelRatio));

  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
    revealCanvas.width = width;
    revealCanvas.height = height;
    metalCanvas.width = width;
    metalCanvas.height = height;
  }

  const canvasAspect = width / height;
  if (canvasAspect > state.imageAspect) {
    const drawHeight = height;
    const drawWidth = Math.round(drawHeight * state.imageAspect);
    state.renderBounds = {
      x: Math.round((width - drawWidth) / 2),
      y: 0,
      width: drawWidth,
      height: drawHeight,
    };
  } else {
    const drawWidth = width;
    const drawHeight = Math.round(drawWidth / state.imageAspect);
    state.renderBounds = {
      x: 0,
      y: Math.round((height - drawHeight) / 2),
      width: drawWidth,
      height: drawHeight,
    };
  }

  revealContext.setTransform(1, 0, 0, 1, 0, 0);
  revealContext.clearRect(0, 0, revealCanvas.width, revealCanvas.height);
};

const updatePointer = (event) => {
  const rect = viewport.getBoundingClientRect();
  const canvasX = ((event.clientX - rect.left) / rect.width) * canvas.width;
  const canvasY = ((event.clientY - rect.top) / rect.height) * canvas.height;
  const bounds = state.renderBounds;
  const x = clamp((canvasX - bounds.x) / bounds.width, 0, 1);
  const y = clamp((canvasY - bounds.y) / bounds.height, 0, 1);
  const now = performance.now();
  const deltaSeconds = Math.max(0.016, (now - state.pointer.lastMoveTime) / 1000);
  const distance = Math.hypot((x - state.pointer.targetX) * state.imageAspect, y - state.pointer.targetY);

  state.pointer.targetX = x;
  state.pointer.targetY = y;
  state.pointer.targetSpeed = clamp(distance / deltaSeconds, 0, 2.5);
  state.pointer.lastMoveTime = now;
};

const drawBrush = () => {
  const bounds = state.renderBounds;
  const pointer = state.pointer;
  const speedFactor = clamp(pointer.speed / 1.8, 0, 1);
  const radiusPx = lerp(88, 142, speedFactor) * (bounds.width / 900);
  const brushX = bounds.x + pointer.x * bounds.width;
  const brushY = bounds.y + pointer.y * bounds.height;

  revealContext.save();
  revealContext.globalCompositeOperation = "source-over";
  revealContext.filter = "blur(9px)";
  revealContext.globalAlpha = lerp(0.12, 0.22, speedFactor);
  const gradient = revealContext.createRadialGradient(brushX, brushY, radiusPx * 0.16, brushX, brushY, radiusPx);
  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");
  revealContext.fillStyle = gradient;
  revealContext.beginPath();
  revealContext.arc(brushX, brushY, radiusPx, 0, Math.PI * 2);
  revealContext.fill();
  revealContext.restore();
};

const decayReveal = (deltaSeconds) => {
  const decayRate = state.pointer.inside ? 0.42 : 4.8;

  revealContext.save();
  revealContext.globalCompositeOperation = "destination-out";
  revealContext.fillStyle = `rgba(0,0,0,${clamp(deltaSeconds * decayRate, 0.006, 0.24)})`;
  revealContext.fillRect(0, 0, revealCanvas.width, revealCanvas.height);
  revealContext.restore();
};

const render = (deltaSeconds) => {
  const { x, y, width, height } = state.renderBounds;
  context.clearRect(0, 0, canvas.width, canvas.height);

  context.drawImage(baseImage, x, y, width, height);

  decayReveal(deltaSeconds);
  if (state.pointer.inside) {
    drawBrush();
  }

  metalContext.setTransform(1, 0, 0, 1, 0, 0);
  metalContext.clearRect(0, 0, metalCanvas.width, metalCanvas.height);
  metalContext.drawImage(metalImage, x, y, width, height);
  metalContext.globalCompositeOperation = "destination-in";
  metalContext.drawImage(revealCanvas, 0, 0);
  metalContext.globalCompositeOperation = "source-over";

  context.drawImage(metalCanvas, 0, 0);
};

const animate = (timestamp) => {
  const deltaSeconds = Math.min((timestamp - state.lastFrameTime) / 1000, 0.05);
  state.lastFrameTime = timestamp;

  const pointerEase = 1 - Math.exp(-14 * deltaSeconds);
  const speedEase = 1 - Math.exp(-10 * deltaSeconds);
  state.pointer.x = lerp(state.pointer.x, state.pointer.targetX, pointerEase);
  state.pointer.y = lerp(state.pointer.y, state.pointer.targetY, pointerEase);
  state.pointer.speed = lerp(state.pointer.speed, state.pointer.targetSpeed, speedEase);
  state.pointer.targetSpeed *= Math.exp(-8 * deltaSeconds);

  render(deltaSeconds);
  state.rafId = window.requestAnimationFrame(animate);
};

const initialize = async () => {
  await Promise.all([waitForImage(baseImage), waitForImage(metalImage)]);
  state.imageAspect = baseImage.naturalWidth / baseImage.naturalHeight;
  resizeCanvases();
  state.loaded = true;
  state.lastFrameTime = performance.now();
  render(0.016);
  state.rafId = window.requestAnimationFrame(animate);
};

viewport.addEventListener("pointerenter", (event) => {
  state.pointer.inside = true;
  updatePointer(event);
});

viewport.addEventListener("pointermove", (event) => {
  updatePointer(event);
});

viewport.addEventListener("pointerleave", () => {
  state.pointer.inside = false;
  revealContext.setTransform(1, 0, 0, 1, 0, 0);
  revealContext.clearRect(0, 0, revealCanvas.width, revealCanvas.height);
});

window.addEventListener("resize", () => {
  if (!state.loaded) {
    return;
  }
  resizeCanvases();
});

initialize().catch((error) => {
  console.error(error);
  viewport.setAttribute("aria-label", "Artwork failed to load");
});
