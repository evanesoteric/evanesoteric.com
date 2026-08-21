/**
 * Initializes the Matrix rain and typewriter effect within a given window.
 * @param {HTMLCanvasElement} canvas - The canvas element for the rain effect.
 * @param {HTMLElement} container - The container element for the splash text.
 * @param {string} windowId - The unique ID of the window.
 * @param {string[]} textsToType - An array of ASCII art strings to display.
 */
export function initMatrixEffect(canvas, container, windowId, textsToType) {
  const splashText = document.createElement("pre");
  splashText.className = "matrix-splash-text";
  container.appendChild(splashText);

  let currentTextIndex = 0;

  function runTypewriterCycle() {
    if (!window.openWindows[windowId]) return;
    splashText.textContent = "";

    const textToType = textsToType[currentTextIndex];
    let i = 0;

    function typeCharacter() {
      if (!window.openWindows[windowId]) return;
      if (i < textToType.length) {
        splashText.textContent += textToType.charAt(i);
        i++;
        setTimeout(typeCharacter, 1);
      } else {
        setTimeout(() => {
          currentTextIndex = (currentTextIndex + 1) % textsToType.length;
          runTypewriterCycle();
        }, 4200);
      }
    }
    typeCharacter();
  }
  setTimeout(runTypewriterCycle, 500);

  // --- Canvas Matrix Rain Logic ---
  const ctx = canvas.getContext("2d");
  const symbols =
    "アァカサタナハマヤラワガザダバパイィキシチニヒミリギジヂビピウゥクスツヌフムユュルグズブプエェケセテネヘメレゲゼデベペオォコソトノホモヨョロゴゾドボポヴッン".split(
      "",
    );
  const fontSize = 12;
  let columns;
  let drops = [];

  function resizeCanvas() {
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    if (canvas.width > 0) {
      columns = Math.ceil(canvas.width / fontSize);
      drops = Array(columns).fill(1);
    }
  }

  const resizeObserver = new ResizeObserver(resizeCanvas);
  resizeObserver.observe(container);
  resizeCanvas();

  function draw() {
    if (!window.openWindows[windowId]) return;
    ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#0F0";
    ctx.font = fontSize + "px monospace";

    for (let i = 0; i < drops.length; i++) {
      const text = symbols[Math.floor(Math.random() * symbols.length)];
      ctx.fillText(text, i * fontSize, drops[i] * fontSize);
      if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
        drops[i] = 0;
      }
      drops[i]++;
    }
  }

  // --- MODIFIED ANIMATION LOOP ---
  function animate() {
    if (!window.openWindows[windowId]) {
      resizeObserver.disconnect();
      return;
    }

    setTimeout(() => {
      // *** FIX IS HERE ***
      // Add a second check *inside* the timeout. This ensures that by the time
      // this code runs, the window hasn't been closed in the meantime.
      if (!window.openWindows[windowId]) {
        resizeObserver.disconnect();
        return;
      }

      window.openWindows[windowId].animationFrameId =
        requestAnimationFrame(draw);
      animate();
    }, 50);
  }

  animate();
}
