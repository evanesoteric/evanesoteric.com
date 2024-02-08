// Matrix canvas
document.addEventListener('DOMContentLoaded', (event) => {
  const canvas = document.getElementById("matrix-canvas");
  const ctx = canvas.getContext("2d");

  let symbol = "アァカサタナハマヤラワガザダバパイィキシチニヒミリギジヂビピウゥクスツヌフムユュルグズブプエェケセテネヘメレゲゼデベペオォコソトノホモヨョロゴゾドボポヴッン";
  symbol = symbol.split("");

  const font_size = 12; // Use the same font size as defined in CSS
  let columns; // Number of columns for the rain
  let drops = []; // y position of drops
  let isInitialScan = true; // Track the initial scanning state

  function onResize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    columns = canvas.width / font_size; // Recalculate columns
    drops = Array(Math.floor(columns)).fill(0); // Reset drops
  }

  function draw() {
    ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#0F0"; // Green text
    ctx.font = font_size + "px Space Mono"; // Set font size and family

    for (let i = 0; i < drops.length; i++) {
      const text = symbol[Math.floor(Math.random() * symbol.length)];
      ctx.fillText(text, i * font_size, drops[i] * font_size);

      if (drops[i] * font_size > canvas.height && Math.random() > 0.975) {
        drops[i] = 0;
        if (isInitialScan) isInitialScan = false; // End initial scan once any drop reaches the bottom
      }

      if (isInitialScan) {
        // During initial scan, make it 50% faster
        drops[i] += 1.5; // Faster fall during initial scan
      } else {
        // Make the rain effect 50% slower after initial scan
        drops[i] += 0.5; // Slower fall for normal rain
      }
    }
  }

  window.addEventListener('resize', onResize, false);
  onResize(); // Initialize canvas dimensions and columns
  setInterval(draw, 33); // Start the animation loop
});

// evanesoteric
const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

let interval = null;

document.querySelector("h1").onmouseover = (event) => {
  let iteration = 0;

  clearInterval(interval);

  interval = setInterval(() => {
    event.target.innerText = event.target.innerText
      .split("")
      .map((letter, index) => {
        if (index < iteration) {
          return event.target.dataset.value[index];
        }

        return letters[Math.floor(Math.random() * 26)];
      })
      .join("");

    if (iteration >= event.target.dataset.value.length) {
      clearInterval(interval);
    }

    iteration += 1 / 3;
  }, 30);
};
