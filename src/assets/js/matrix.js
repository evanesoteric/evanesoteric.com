jQuery(document).ready(function($) {
  const canvas = document.getElementById("matrix-canvas");
  const ctx = canvas.getContext("2d");

  let symbol = "アァカサタナハマヤラワガザダバパイィキシチニヒミリギジヂビピウゥクスツヌフムユュルグズブプエェケセテネヘメレゲゼデベペオォコソトノホモヨョロゴゾドボポヴッン";
  symbol = symbol.split("");

  const font_size = 12;
  let columns;
  let drops = [];
  let isInitialScan = true;

  function onResize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    columns = canvas.width / font_size;
    drops = Array(Math.floor(columns)).fill(0);
    isInitialScan = true; // Reset the initial scan flag on resize
  }

  function draw() {
    ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#0F0";
    ctx.font = font_size + "px Space Mono";

    for (let i = 0; i < drops.length; i++) {
      const text = symbol[Math.floor(Math.random() * symbol.length)];
      ctx.fillText(text, i * font_size, drops[i] * font_size);

      if (drops[i] * font_size > canvas.height && Math.random() > 0.975) {
        drops[i] = 0;
        if (isInitialScan) isInitialScan = false;
      }

      if (isInitialScan) {
        drops[i] += 1.5;
      } else {
        drops[i] += 0.5;
      }
    }
  }

  window.addEventListener('resize', onResize, false);
  onResize();
  setInterval(draw, 33);
});
