export function initializeUI() {
  // --- Clock Functionality ---
  const clockElement = document.getElementById("clock");
  function updateClock() {
    const now = new Date();
    const time = now.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    clockElement.textContent = time;
  }
  setInterval(updateClock, 1000);
  updateClock();

  // --- Start Menu Functionality ---
  const startButton = document.getElementById("start-button");
  const startMenu = document.getElementById("start-menu");

  startButton.addEventListener("click", (e) => {
    e.stopPropagation();
    startMenu.classList.toggle("active");
  });

  document.addEventListener("click", () => {
    if (startMenu.classList.contains("active")) {
      startMenu.classList.remove("active");
    }
  });
}
