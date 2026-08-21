import { initMatrixEffect } from "./matrix.js";
// Static asset paths (served from /assets/img/icons/)
const windowsXpIcon = "/assets/img/icons/windows-xp.svg";
const user1Icon = "/assets/img/icons/user1.svg";
const amdIcon = "/assets/img/icons/amd-athlon-xp.svg";

// --- Global State Variables ---
let highestZIndex = 1;
let messageBoxCount = 0;
export const openWindows = {};

// --- DOM Element References ---
const desktop = document.getElementById("desktop");
const taskbarWindows = document.getElementById("taskbar-windows");

// --- Window Management Functions (Internal) ---

function minimizeWindow(id) {
  const win = openWindows[id];
  if (!win) return;
  win.el.classList.add("minimized");
  unfocusAllWindows();
}

function maximizeWindow(id) {
  const win = openWindows[id];
  if (!win) return;
  win.el.classList.toggle("maximized");
  window.dispatchEvent(new Event("resize"));
}

function closeWindow(id) {
  const win = openWindows[id];
  if (!win) return;

  if (win.animationFrameId) {
    cancelAnimationFrame(win.animationFrameId);
  }

  win.el.remove();
  document.getElementById(`taskbar-${id}`).remove();
  delete openWindows[id];
}

function unfocusAllWindows() {
  document
    .querySelectorAll(".taskbar-button")
    .forEach((btn) => btn.classList.remove("active"));
}

function focusWindow(id) {
  const win = openWindows[id];
  if (!win) return;
  unfocusAllWindows();
  if (win.el.classList.contains("minimized")) {
    win.el.classList.remove("minimized");
  }
  win.el.style.zIndex = ++highestZIndex;
  document.getElementById(`taskbar-${id}`).classList.add("active");
}

function createTaskbarButton(id, title) {
  const button = document.createElement("div");
  button.className = "taskbar-button";
  button.id = `taskbar-${id}`;
  button.textContent = title;
  button.onclick = () => focusWindow(id);
  taskbarWindows.appendChild(button);
}

function makeDraggable(elmnt) {
  let pos1 = 0,
    pos2 = 0,
    pos3 = 0,
    pos4 = 0;
  const titleBar = elmnt.querySelector(".title-bar");

  if (titleBar) {
    titleBar.onmousedown = dragMouseDown;
  }

  function dragMouseDown(e) {
    e = e || window.event;
    e.preventDefault();
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    document.onmousemove = elementDrag;
  }

  function elementDrag(e) {
    if (elmnt.classList.contains("maximized")) return;
    e = e || window.event;
    e.preventDefault();
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    elmnt.style.top = elmnt.offsetTop - pos2 + "px";
    elmnt.style.left = elmnt.offsetLeft - pos1 + "px";
  }

  function closeDragElement() {
    document.onmouseup = null;
    document.onmousemove = null;
  }
}

function createWindowBase(id, title, options = {}) {
  const {
    width: defaultWidth = 500,
    height: defaultHeight = 400,
    resizable = true,
    isAppWindow = true,
  } = options;

  const isMobile = window.innerWidth < 768;
  let finalWidth, finalHeight, top, left;

  if (isMobile) {
    // On mobile, create smaller, centered windows
    finalWidth = Math.min(defaultWidth, window.innerWidth * 0.9);
    finalHeight = Math.min(defaultHeight, window.innerHeight * 0.7);
    top = 30; // A small offset from the top
    left = (window.innerWidth - finalWidth) / 2; // Center horizontally
  } else {
    // Original desktop logic for larger, staggered windows
    finalWidth = defaultWidth;
    finalHeight = defaultHeight;
    top = 50 + (Object.keys(openWindows).length + messageBoxCount) * 20;
    left = 100 + (Object.keys(openWindows).length + messageBoxCount) * 20;
  }

  const windowEl = document.createElement("div");
  windowEl.className = "window";
  windowEl.id = `window-${id}`;
  windowEl.style.zIndex = ++highestZIndex;
  windowEl.style.width = `${finalWidth}px`;
  windowEl.style.height = `${finalHeight}px`;
  if (!resizable) windowEl.style.resize = "none";
  windowEl.style.top = `${top}px`;
  windowEl.style.left = `${left}px`;

  const titleBar = document.createElement("div");
  titleBar.className = "title-bar";
  titleBar.addEventListener("dblclick", () => maximizeWindow(id));

  const titleText = document.createElement("span");
  titleText.className = "title-bar-text";
  titleText.textContent = title;
  const buttons = document.createElement("div");
  buttons.className = "title-bar-buttons";

  if (isAppWindow) {
    const minimizeBtn = document.createElement("div");
    minimizeBtn.className = "title-bar-button minimize-btn"; // Changed
    minimizeBtn.onclick = () => minimizeWindow(id);
    buttons.appendChild(minimizeBtn);

    const maximizeBtn = document.createElement("div");
    maximizeBtn.className = "title-bar-button maximize-btn"; // Changed
    maximizeBtn.onclick = () => maximizeWindow(id);
    buttons.appendChild(maximizeBtn);
  }

  const closeBtn = document.createElement("div");
  closeBtn.className = "title-bar-button close-btn"; // Changed
  closeBtn.onclick = () => {
    if (isAppWindow) closeWindow(id);
    else windowEl.remove();
  };
  buttons.append(closeBtn);
  titleBar.append(titleText, buttons);

  const windowBody = document.createElement("div");
  windowBody.className = "window-body";
  windowEl.append(titleBar, windowBody);
  desktop.appendChild(windowEl);

  makeDraggable(windowEl);
  windowEl.addEventListener("mousedown", () => {
    windowEl.style.zIndex = ++highestZIndex;
    if (isAppWindow) focusWindow(id);
  });

  return windowEl;
}

// --- EXPORTED FUNCTIONS (to be called from index.js) ---

export function createMessageBox(title, message) {
  const id = `message-box-${messageBoxCount++}`;
  const windowEl = createWindowBase(id, title, {
    width: 300,
    height: 150,
    isAppWindow: false,
    resizable: false,
  });
  const windowBody = windowEl.querySelector(".window-body");
  windowBody.classList.add("message-box-body");
  const messageText = document.createElement("p");
  messageText.textContent = message;
  const okButton = document.createElement("button");
  okButton.textContent = "OK";
  okButton.onclick = () => windowEl.remove();
  windowBody.append(messageText, okButton);
}

export function createRuneScapeWindow() {
  const id = "runescape-video";
  if (openWindows[id]) {
    focusWindow(id);
    return;
  }
  const windowEl = createWindowBase(id, "RuneScape", {
    width: 640,
    height: 480,
    isAppWindow: true,
    resizable: true,
  });
  const windowBody = windowEl.querySelector(".window-body");
  windowBody.style.padding = "0";
  windowBody.style.overflow = "hidden";
  const videoId = "EfBMZoHbmU4";
  const startTime = 26;
  const iframe = document.createElement("iframe");
  iframe.style.width = "100%";
  iframe.style.height = "100%";
  iframe.style.border = "none";
  iframe.src = `https://www.youtube.com/embed/${videoId}?start=${startTime}&autoplay=1&mute=1&controls=0&loop=1&playlist=${videoId}`;
  iframe.allow =
    "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
  iframe.allowFullscreen = true;
  windowBody.appendChild(iframe);
  openWindows[id] = { el: windowEl, title: "RuneScape.jar", type: "video" };
  createTaskbarButton(id, "RuneScape.jar");
  focusWindow(id);
}

// ========================================================================
// === NEW COMMAND PROMPT - START ===
// Replace your old createCmdWindow and handleCommand functions with this block.
// ========================================================================

// --- 1. Simulated Filesystem and Commands ---
const fileSystem = {
  "C:": {
    type: "drive",
    children: {
      "Documents and Settings": {
        type: "folder",
        children: {
          Evan: {
            type: "folder",
            children: {
              Desktop: { type: "folder", children: {} },
              "My Documents": {
                type: "folder",
                children: {
                  "flag.txt": {
                    type: "file",
                    content: "254e5f2c3beb1a3d03f17253c15c07f3",
                  },
                  "todo.txt": {
                    type: "file",
                    content:
                      "1. Deploy airgapped AI home lab\n2. Build a time machine\n3. <<encrypted>>",
                  },
                },
              },
            },
          },
        },
      },
      Windows: {
        type: "folder",
        children: {
          System32: {
            type: "folder",
            children: {
              config: {
                type: "folder",
                children: {
                  SAM: {
                    type: "file",
                    content:
                      "  Administrator:1001:AAD3B435B51404EEAAD3B435B51404EE:31D6CFE0D16AE931B73C59D7E0C089C0:::\n" +
                      "  Ev:1002:AAD3B435B51404EEAAD3B435B51404EE:505A9279CFD2F94C658980551CFDE735:::\n" +
                      "  Guest:501:NO PASSWORD*********************:NO PASSWORD*********************:::\n" +
                      "  n3tw0rm:1337:E52CAC67419A9A224A3B108F3FA6CB6D:BA83809AC8DDB0A5E54E7F70658D134D:::",
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};

const commands = {
  help: (state, args, print) => {
    print(
      "Available commands:\n" +
        "  HELP   - Shows this help message.\n" +
        "  CLS    - Clears the screen.\n" +
        "  DIR    - Displays a list of files and subdirectories.\n" +
        "  CD     - Displays the name of or changes the current directory.\n" +
        "  TREE   - Graphically displays the directory structure.\n" +
        "  TYPE   - Displays the contents of a text file.\n" +
        "  CAT    - Displays the contents of a text file (alias for TYPE).\n" +
        "  ECHO   - Displays messages.\n" +
        "  DATE   - Displays the current date.\n" +
        "  TIME   - Displays the current time.\n" +
        "  VER    - Displays the Windows version.\n" +
        "  EXIT   - Quits the CMD.EXE program.",
    );
  },
  cls: (state, args, print, elements) => {
    elements.output.innerHTML = "";
  },
  exit: (state, args, print, elements, windowId) => {
    closeWindow(windowId);
  },
  echo: (state, args, print) => {
    print(args.join(" "));
  },
  date: (state, args, print) => {
    print(`The current date is: ${new Date().toLocaleDateString()}`);
  },
  time: (state, args, print) => {
    print(`The current time is: ${new Date().toLocaleTimeString()}`);
  },
  ver: (state, args, print) => {
    print("\nMicrosoft Windows XP [Version 5.1.2600]");
  },
  dir: (state, args, print) => {
    const path =
      state.currentPath.length > 0 ? state.currentPath.join("\\") : "";
    const node = getNodeFromPath(state.currentPath);
    if (!node || node.type === "file") {
      print("File Not Found");
      return;
    }
    let output = ` Volume in drive C has no label.\n`;
    output += ` Directory of C:\\${path}\n\n`;
    const children = node.children || {};
    let dirCount = 0;
    let fileCount = 0;

    if (state.currentPath.length > 0) {
      output += `${new Date().toLocaleDateString()}  ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}    <DIR>          .\n`;
      output += `${new Date().toLocaleDateString()}  ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}    <DIR>          ..\n`;
    }

    for (const name in children) {
      const child = children[name];
      if (child.type === "folder") {
        output += `${new Date().toLocaleDateString()}  ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}    <DIR>          ${name}\n`;
        dirCount++;
      } else {
        const size = child.content.length;
        output += `${new Date().toLocaleDateString()}  ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}    ${String(size).padStart(14, " ")} ${name}\n`;
        fileCount++;
      }
    }
    output += `               ${fileCount} File(s)              0 bytes\n`;
    output += `               ${dirCount} Dir(s)  12,345,678,910 bytes free`;
    print(output);
  },
  // FIXED: Now handles paths with spaces
  cd: (state, args, print, elements) => {
    const targetPath = args.join(" ").replace(/"/g, ""); // Re-join args for paths with spaces
    if (!targetPath) {
      print(`C:\\${state.currentPath.join("\\")}`);
      return;
    }

    if (targetPath === "..") {
      if (state.currentPath.length > 0) state.currentPath.pop();
    } else if (targetPath === "\\") {
      state.currentPath = [];
    } else {
      const currentNode = getNodeFromPath(state.currentPath);
      const children = currentNode.children || {};
      const realName = Object.keys(children).find(
        (name) => name.toLowerCase() === targetPath.toLowerCase(),
      );

      if (realName && children[realName].type === "folder") {
        state.currentPath.push(realName);
      } else {
        print("The system cannot find the path specified.");
        return;
      }
    }
    elements.prompt.textContent = `C:\\${state.currentPath.join("\\")}>`;
  },
  type: (state, args, print) => {
    const fileName = args.join(" "); // Allow filenames with spaces
    if (!fileName) {
      print("The syntax of the command is incorrect.");
      return;
    }
    const node = getNodeFromPath(state.currentPath);
    const children = node.children || {};
    const realName = Object.keys(children).find(
      (name) => name.toLowerCase() === fileName.toLowerCase(),
    );
    const file = realName ? children[realName] : null;

    if (file && file.type === "file") {
      print(file.content);
    } else {
      print("The system cannot find the file specified.");
    }
  },
  cat: (...args) => commands.type(...args),
  tree: (state, args, print) => {
    let structure = `C:.${state.currentPath.length > 0 ? "\\" + state.currentPath.join("\\") : ""}\n`;
    const startNode = getNodeFromPath(state.currentPath);

    function buildTree(node, prefix = "") {
      if (!node.children) return "";
      let result = "";
      const childrenNames = Object.keys(node.children);
      childrenNames.forEach((name, index) => {
        const isLast = index === childrenNames.length - 1;
        result += `${prefix}${isLast ? "└───" : "├───"}${name}\n`;
        const childNode = node.children[name];
        if (childNode.type === "folder") {
          result += buildTree(
            childNode,
            `${prefix}${isLast ? "    " : "│   "}`,
          );
        }
      });
      return result;
    }

    structure += buildTree(startNode);
    print(structure);
  },
};

// --- 2. Helper function to navigate the simulated filesystem ---
function getNodeFromPath(pathArray) {
  let currentNode = fileSystem["C:"];
  for (const part of pathArray) {
    if (currentNode.children && currentNode.children[part]) {
      currentNode = currentNode.children[part];
    } else {
      return null;
    }
  }
  return currentNode;
}

// --- 3. The new, feature-rich createCmdWindow function ---
export function createCmdWindow() {
  const id = "cmd-prompt";
  if (openWindows[id]) {
    focusWindow(id);
    return;
  }

  const state = {
    commandHistory: [],
    historyIndex: 0,
    currentPath: ["Documents and Settings", "Evan"],
  };

  const windowEl = createWindowBase(id, "Command Prompt", {
    width: 680,
    height: 420,
    isAppWindow: true,
  });
  const windowBody = windowEl.querySelector(".window-body");
  windowBody.classList.add("cmd-body");

  const output = document.createElement("div");
  output.className = "cmd-output";
  output.innerHTML =
    "Microsoft Windows XP [Version 5.1.2600]<br>(C) Copyright 1985-2001 Microsoft Corp.<br><br>";

  const inputLine = document.createElement("div");
  inputLine.className = "cmd-input-line";

  const prompt = document.createElement("span");
  prompt.className = "cmd-prompt-path";
  prompt.textContent = `C:\\${state.currentPath.join("\\")}>`;

  const input = document.createElement("input");
  input.type = "text";
  input.className = "cmd-input";
  input.autofocus = true;

  inputLine.append(prompt, input);
  windowBody.append(output, inputLine);

  const print = (text) => {
    const line = document.createElement("div");
    line.className = "cmd-output-line";
    line.textContent = text;
    output.appendChild(line);
  };

  const executeCommand = (commandStr) => {
    const echoLine = document.createElement("div");
    echoLine.textContent = `${prompt.textContent}${commandStr}`;
    output.appendChild(echoLine);

    if (commandStr) {
      state.commandHistory.push(commandStr);
      state.historyIndex = state.commandHistory.length;

      const trimmedCommand = commandStr.trim();
      const firstSpaceIndex = trimmedCommand.indexOf(" ");
      const command = (
        firstSpaceIndex === -1
          ? trimmedCommand
          : trimmedCommand.substring(0, firstSpaceIndex)
      ).toLowerCase();
      const args =
        firstSpaceIndex === -1
          ? []
          : trimmedCommand.substring(firstSpaceIndex + 1).split(/\s+/);

      if (commands[command]) {
        commands[command](state, args, print, { output, prompt }, id);
      } else {
        print(
          `'${command}' is not recognized as an internal or external command,\noperable program or batch file.`,
        );
      }
    }

    output.appendChild(document.createElement("br"));
    input.value = "";
    windowBody.scrollTop = windowBody.scrollHeight;
  };

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      executeCommand(input.value);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (state.historyIndex > 0) {
        state.historyIndex--;
        input.value = state.commandHistory[state.historyIndex];
        input.selectionStart = input.selectionEnd = input.value.length;
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (state.historyIndex < state.commandHistory.length - 1) {
        state.historyIndex++;
        input.value = state.commandHistory[state.historyIndex];
        input.selectionStart = input.selectionEnd = input.value.length;
      } else {
        state.historyIndex = state.commandHistory.length;
        input.value = "";
      }
    }
  });

  windowBody.addEventListener("click", () => input.focus());
  setTimeout(() => input.focus(), 0);

  openWindows[id] = { el: windowEl, title: "Command Prompt", type: "cmd" };
  createTaskbarButton(id, "Command Prompt");
  focusWindow(id);
}
// ========================================================================
// === NEW COMMAND PROMPT - END ===
// ========================================================================
//
export function createRecycleBinWindow() {
  const id = "recycle-bin";
  if (openWindows[id]) {
    focusWindow(id);
    return;
  }
  const windowEl = createWindowBase(id, "Recycle Bin", {
    width: 500,
    height: 400,
    isAppWindow: true,
  });
  const windowBody = windowEl.querySelector(".window-body");
  const fileList = document.createElement("ul");
  fileList.className = "recycle-bin-list";
  const files = [
    "254e5f2c3beb1a3d03f17253c15c07f3.md5",
    "crack.exe",
    "dan_kaminsky.rip",
    "halo2.bin",
    "n3tw0rm.dll",
    "Tower_7.doc",
    "Windows-XP-activator.bat",
  ];
  files.forEach((fileName) => {
    const li = document.createElement("li");
    li.textContent = fileName;
    li.addEventListener("click", () => {
      fileList
        .querySelectorAll("li")
        .forEach((item) => item.classList.remove("selected"));
      li.classList.add("selected");
    });
    fileList.appendChild(li);
  });
  windowBody.appendChild(fileList);
  openWindows[id] = { el: windowEl, title: "Recycle Bin", type: "default" };
  createTaskbarButton(id, "Recycle Bin");
  focusWindow(id);
}

export function createResumeWindow() {
  const id = "my-resume";
  if (openWindows[id]) {
    focusWindow(id);
    return;
  }
  const windowEl = createWindowBase(id, "My Resume", {
    width: 700,
    height: 600,
    isAppWindow: true,
    resizable: true,
  });
  const windowBody = windowEl.querySelector(".window-body");
  const contentContainer = document.createElement("div");
  contentContainer.className = "resume-content";
  contentContainer.innerHTML = `
        <div class="resume-section"><span class="resume-title">Evan L. Granito</span><p class="resume-text">Systems Administrator · Infrastructure &amp; Security</p><p class="resume-text">Location: Saratoga Springs, NY</p><p class="resume-text">Phone: (518)-560-9286</p><p class="resume-text">Email: evang@tutamail.com</p></div>
        <div class="resume-section"><div class="resume-heading">Professional Summary</div><p class="resume-text">Systems administrator with over a decade of experience building, hardening, and maintaining Linux-first infrastructure across small business and enterprise environments. Extensive background in network security, virtualization, and automation, with a record of replacing manual processes with reliable, scripted deployments.</p></div>
        <div class="resume-section"><div class="resume-heading">Core Competencies</div><div class="resume-sub-heading">Security &amp; Networking:</div><p class="resume-text">nftables, iptables, ipset, WireGuard, OpenVPN, EasyRSA / PKI, SSH hardening, WAF administration, malware removal, Wireshark, tshark, tcpdump, nmap, network segmentation, BIND, GPG, Squid, 3proxy</p><div class="resume-sub-heading">Systems:</div><p class="resume-text">Debian, Ubuntu, RHEL, Arch, Gentoo, Kali, Parrot, FreeBSD, OpenBSD, pfSense, OPNsense, Windows Server 2022, macOS</p><div class="resume-sub-heading">Automation:</div><p class="resume-text">Bash, Python, Go, C, SQL, PHP, sed, awk, Ansible, cron, Git, GitHub, GitLab</p><div class="resume-sub-heading">Infrastructure:</div><p class="resume-text">KVM, libvirt, Proxmox, Docker, Docker Compose, TrueNAS Scale, Unraid, GCP, Nginx, Apache, LiteSpeed, MySQL, PostgreSQL, Postfix, Dovecot, Exim, cPanel, DirectAdmin, WHMCS</p><div class="resume-sub-heading">Web &amp; Application:</div><p class="resume-text">Django, Flask, FastAPI, HTML, CSS, JavaScript, WordPress, WooCommerce, Drupal, Magento, Shopify, Matomo</p></div>
        <div class="resume-section"><div class="resume-heading">Professional Experience</div><div class="resume-sub-heading">Music Industry Marketing, LLC | Atlanta, GA (Remote)</div><p class="resume-text"><strong>Systems Administrator, May 2022 - Present</strong></p><ul class="resume-list"><li>Automate Linux system deployments with Ansible and maintain Windows Server 2022 automation environments</li><li>Deploy and administer proxy edge infrastructure, cloud VNC workstations, and virtualized Android environments</li><li>Administer MySQL and PostgreSQL servers and develop Python and Bash tooling that replaces recurring manual work</li><li>Analyze network traffic and system logs with tcpdump, tshark, and pyshark to isolate system, application, and network faults</li><li>Design and manage the company Shopify storefront and execute SEO and keyword-competitor research</li></ul><div class="resume-sub-heading">Arcane Solutions, LLC | Saratoga Springs, NY</div><p class="resume-text"><strong>Principal Consultant, December 2018 - Present</strong></p><ul class="resume-list"><li>Deploy and manage LEMP stacks on cloud KVM infrastructure for client web properties</li><li>Automate provisioning, updates, and patching with Ansible; build and maintain automated offsite backup pipelines</li><li>Handle full-lifecycle web design, hosting, e-commerce integration, inventory management, and authoritative DNS</li></ul><div class="resume-sub-heading">Organic Music Marketing | Atlanta, GA (Remote / Hybrid)</div><p class="resume-text"><strong>Systems Administrator &amp; Automation Development Lead, February 2019 - May 2022</strong></p><ul class="resume-list"><li>Deployed and scaled Linux servers and KVM virtual machines, tuning Nginx and MySQL for performance and availability</li><li>Built Docker images and managed multi-service deployments with Docker Compose</li><li>Deployed and maintained OpenVPN servers and an internal certificate authority using EasyRSA</li><li>Implemented security hardening standards across servers, workstations, and office network equipment</li></ul><div class="resume-sub-heading">KnownHost, LLC | Remote</div><p class="resume-text"><strong>Technical Support Engineer (Systems Administrator), March 2015 - December 2018</strong></p><ul class="resume-list"><li>Administered KVM and OpenVZ virtualization environments with a focus on uptime and performance</li><li>Managed cPanel, DirectAdmin, and WHMCS hosting environments across a large shared customer base</li><li>Configured Apache, Nginx, and LiteSpeed with PHP-FPM tuning; managed MySQL databases and query performance</li><li>Performed malware removal, firewall and WAF configuration, and post-incident security hardening</li></ul><div class="resume-sub-heading">ViaTalk | Clifton Park, NY</div><p class="resume-text"><strong>Support Technician, June 2011 - June 2015</strong></p><ul class="resume-list"><li>Supported VoIP systems via phone, ticketing, and chat; troubleshot connectivity, call quality, and routing issues</li><li>Managed customer router and gateway hardware; resolved international calling faults with carrier backbone providers</li></ul></div>
        <div class="resume-section"><div class="resume-heading">Education &amp; Certifications</div><p class="resume-text">Google Cybersecurity Certificate, November 2023</p><p class="resume-text">Ballston Spa High School, Class of 2011</p></div>
        <div class="resume-section"><div class="resume-heading">Additional Information</div><p class="resume-text">Open to remote and relocation opportunities</p><p class="resume-text">Additional project details and references available upon request</p></div>
    `;
  windowBody.appendChild(contentContainer);
  openWindows[id] = { el: windowEl, title: "My Resume.txt", type: "default" };
  createTaskbarButton(id, "My Resume.txt");
  focusWindow(id);
}

export function createMyComputerWindow() {
  const id = "my-computer";
  if (openWindows[id]) {
    focusWindow(id);
    return;
  }
  const windowEl = createWindowBase(id, "System Properties", {
    width: 450,
    height: 400,
    isAppWindow: true,
    resizable: false,
  });
  const windowBody = windowEl.querySelector(".window-body");
  windowBody.classList.add("sys-prop-body");

  windowBody.innerHTML = `
        <div class="sys-prop-section">
            <p>System Information:</p>
            <div class="sys-prop-content">
                <img src="${windowsXpIcon}" alt="Windows XP" style="width: 48px; height: auto;">
                <div>
                    <p>Microsoft Windows XP</p>
                    <p>Professional SP1 2002</p>
                </div>
            </div>
        </div>
        <div class="sys-prop-section">
            <p>Registered To:</p>
            <div class="sys-prop-content">
                <img src="${user1Icon}" alt="User Icon" style="width: 48px; height: auto;">
                <div>
                    <p>Evan Granito</p>
                    <p>Arcane Solutions, LLC</p>
                    <p><a href="https://arcanesolutions.io" target="_blank">www.arcanesolutions.io</a></p>
                </div>
            </div>
        </div>
        <div class="sys-prop-section">
            <p>Computer Specifications:</p>
            <div class="sys-prop-content">
                <img src="${amdIcon}" alt="AMD CPU Icon" style="width: 48px; height: auto;">
                <div>
                    <p>CPU: AMD Athlon(tm) XP 1600+</p>
                    <p>Memory (RAM): 512 MB</p>
                    <p>Display: ATI RADEON 7500 SERIES</p>
                    <p>Motherboard: Gigabyte GA-7VTXE+</p>
                </div>
            </div>
        </div>
    `;
  openWindows[id] = {
    el: windowEl,
    title: "System Properties",
    type: "default",
  };
  createTaskbarButton(id, "System Properties");
  focusWindow(id);
}

export function createWindow(
  id,
  title,
  contentUrl,
  type = "default",
  artTexts = [],
) {
  if (openWindows[id]) {
    focusWindow(id);
    return;
  }
  const windowEl = createWindowBase(id, title, { isAppWindow: true });
  const windowBody = windowEl.querySelector(".window-body");

  if (type === "matrix") {
    windowBody.classList.add("matrix-body");
    const canvas = document.createElement("canvas");
    windowBody.appendChild(canvas);
    setTimeout(() => initMatrixEffect(canvas, windowBody, id, artTexts), 0);
  }

  openWindows[id] = { el: windowEl, title, type, animationFrameId: null };
  createTaskbarButton(id, title);
  focusWindow(id);
}
