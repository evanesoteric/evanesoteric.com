// Import CSS first to ensure styles are loaded
import "../css/main.scss";

// Import ASCII Art data
import { whoami_1, whoami_2 } from "./art.js";

// Import functional modules
import * as windowManager from "./windowManager.js";

// This is the main entry point for the application script.
document.addEventListener("DOMContentLoaded", () => {
  // --- Global State Bridge ---
  window.openWindows = windowManager.openWindows;

  // --- Clock and Start Menu Initialization ---
  const clockElement = document.getElementById("clock");
  const startButton = document.getElementById("start-button");
  const startMenu = document.getElementById("start-menu");

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

  startButton.addEventListener("click", (e) => {
    e.stopPropagation();
    startMenu.classList.toggle("active");
  });

  document.addEventListener("click", () => {
    if (startMenu.classList.contains("active")) {
      startMenu.classList.remove("active");
    }
  });

  // --- Centralized Event Handling ---
  document.body.addEventListener("dblclick", (event) => {
    const actionTarget = event.target.closest("[data-action]");
    if (actionTarget) {
      const action = actionTarget.dataset.action;
      handleAction(action);
    }
  });

  document.body.addEventListener("click", (event) => {
    const actionTarget = event.target.closest("[data-action]");
    if (actionTarget && actionTarget.tagName === "LI") {
      const action = actionTarget.dataset.action;
      handleAction(action);
    }
  });

  // --- Action Handler ---
  function handleAction(action) {
    switch (action) {
      case "createMyComputerWindow":
        windowManager.createMyComputerWindow();
        break;
      case "createRecycleBinWindow":
        windowManager.createRecycleBinWindow();
        break;
      case "createResumeWindow":
        windowManager.createResumeWindow();
        break;
      // *** THIS BLOCK IS NOW FIXED ***
      case "createWhoamiWindow": {
        const artTexts = [whoami_1, whoami_2];
        windowManager.createWindow(
          "whoami",
          "whoami.txt",
          null,
          "matrix",
          artTexts,
        );
        break;
      }
      case "createRuneScapeMessage":
        windowManager.createRuneScapeWindow();
        break;
      case "createGunZMessage":
        windowManager.createGunZWindow();
        break;
      case "createUplinkMessage":
        windowManager.createUplinkWindow();
        break;
      case "createCmdWindow":
        windowManager.createCmdWindow();
        break;
      case "createFirefoxMessage":
        windowManager.createMessageBox(
          "Firefox",
          "This feature is currently under construction.",
        );
        break;
      case "createEmailMessage":
        windowManager.createMessageBox(
          "Email",
          "This feature is currently under construction.",
        );
        break;
      case "createAimMessage":
        windowManager.createMessageBox(
          "AIM",
          "This feature is currently under construction.",
        );
        break;
      case "createIcqMessage":
        windowManager.createMessageBox(
          "ICQ",
          "This feature is currently under construction.",
        );
        break;
      case "createKazaaMessage":
        windowManager.createMessageBox(
          "Kazaa",
          "This feature is currently under construction.",
        );
        break;
      case "createLimeWireMessage":
        windowManager.createMessageBox(
          "LimeWire",
          "This feature is currently under construction.",
        );
        break;
      case "createNeroMessage":
        windowManager.createMessageBox(
          "Nero",
          "This feature is currently under construction.",
        );
        break;
      case "createPuttyMessage":
        windowManager.createMessageBox(
          "PuTTY",
          "This feature is currently under construction.",
        );
        break;
      case "createNetworkPlacesMessage":
        windowManager.createMessageBox(
          "Network Places",
          "This feature is currently under construction.",
        );
        break;
      case "createFirewallMessage":
        windowManager.createMessageBox(
          "Firewall",
          "This feature is currently under construction.",
        );
        break;
      case "createControlPanelMessage":
        windowManager.createMessageBox(
          "Control Panel",
          "This feature is currently under construction.",
        );
        break;
      case "createRegeditMessage":
        windowManager.createMessageBox(
          "Regedit",
          "This feature is currently under construction.",
        );
        break;
    }
  }
});
