import { initMatrixEffect } from "./matrix.js";
// Import all image assets used in this module at the top
import uplinkBg from "../img/uplink-bg.png";
import windowsXpIcon from "../img/icons/windows-xp.svg";
import user1Icon from "../img/icons/user1.svg";
import amdIcon from "../img/icons/amd-athlon-xp.svg";

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
  const titleText = document.createElement("span");
  titleText.className = "title-bar-text";
  titleText.textContent = title;
  const buttons = document.createElement("div");
  buttons.className = "title-bar-buttons";

  if (isAppWindow) {
    const minimizeBtn = document.createElement("div");
    minimizeBtn.className = "title-bar-button";
    minimizeBtn.innerHTML = "&#95;";
    minimizeBtn.onclick = () => minimizeWindow(id);
    buttons.appendChild(minimizeBtn);

    const maximizeBtn = document.createElement("div");
    maximizeBtn.className = "title-bar-button";
    maximizeBtn.innerHTML = "&#9633;";
    maximizeBtn.onclick = () => maximizeWindow(id);
    buttons.appendChild(maximizeBtn);
  }

  const closeBtn = document.createElement("div");
  closeBtn.className = "title-bar-button";
  closeBtn.innerHTML = "X";
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

export function createGunZWindow() {
  const id = "gunz-video";
  if (openWindows[id]) {
    focusWindow(id);
    return;
  }
  const windowEl = createWindowBase(id, "GunZ", {
    width: 640,
    height: 480,
    isAppWindow: true,
    resizable: true,
  });
  const windowBody = windowEl.querySelector(".window-body");
  windowBody.style.padding = "0";
  windowBody.style.overflow = "hidden";
  const videoId = "NiA3MqUzS-8";
  const startTime = 0;
  const iframe = document.createElement("iframe");
  iframe.style.width = "100%";
  iframe.style.height = "100%";
  iframe.style.border = "none";
  iframe.src = `https://www.youtube.com/embed/${videoId}?start=${startTime}&autoplay=1&mute=1&controls=0&loop=1&playlist=${videoId}`;
  iframe.allow =
    "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
  iframe.allowFullscreen = true;
  windowBody.appendChild(iframe);
  openWindows[id] = { el: windowEl, title: "GunZ.exe", type: "video" };
  createTaskbarButton(id, "GunZ.exe");
  focusWindow(id);
}

export function createUplinkWindow() {
  const id = "uplink-window";
  if (openWindows[id]) {
    focusWindow(id);
    return;
  }
  const windowEl = createWindowBase(id, "Uplink", {
    width: 640,
    height: 480,
    isAppWindow: true,
    resizable: true,
  });
  const windowBody = windowEl.querySelector(".window-body");
  windowBody.style.padding = "0";
  windowBody.style.overflow = "hidden";
  windowBody.style.display = "flex";
  windowBody.style.alignItems = "center";
  windowBody.style.justifyContent = "center";
  windowBody.style.background = "#000";
  const img = document.createElement("img");
  img.src = uplinkBg;
  img.alt = "Uplink background";
  img.style.width = "100%";
  img.style.height = "100%";
  img.style.objectFit = "contain";
  windowBody.appendChild(img);
  openWindows[id] = { el: windowEl, title: "Uplink.exe", type: "image" };
  createTaskbarButton(id, "Uplink.exe");
  focusWindow(id);
}

export function createCmdWindow() {
  const id = "cmd-prompt";
  if (openWindows[id]) {
    focusWindow(id);
    return;
  }

  const windowEl = createWindowBase(id, "Command Prompt", {
    width: 640,
    height: 400,
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
  prompt.textContent = "C:\\Documents and Settings\\Evan>";

  const input = document.createElement("input");
  input.type = "text";
  input.className = "cmd-input";
  input.autofocus = true;

  inputLine.append(prompt, input);
  windowBody.append(output, inputLine);

  windowBody.addEventListener("click", () => input.focus());
  setTimeout(() => input.focus(), 0);

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const command = input.value.trim().toLowerCase();
      const args = command.split(" ").slice(1);

      const echoLine = document.createElement("div");
      echoLine.textContent = `C:\\Documents and Settings\\Evan>${command}`;
      output.appendChild(echoLine);

      handleCommand(command, args, output, id);

      input.value = "";
      output.scrollTop = output.scrollHeight;
    }
  });

  openWindows[id] = { el: windowEl, title: "Command Prompt", type: "cmd" };
  createTaskbarButton(id, "Command Prompt");
  focusWindow(id);
}

/**
 * Handles the logic for processing commands entered into the dummy CMD prompt.
 * @param {string} command - The command entered by the user.
 * @param {string[]} args - An array of arguments that followed the command.
 * @param {HTMLElement} output - The output element to append responses to.
 * @param {string} windowId - The ID of the command prompt window.
 */
function handleCommand(command, args, output, windowId) {
  const response = document.createElement("div");

  // Use a switch statement to determine which command was entered.
  switch (command.split(" ")[0]) {
    case "help":
      // For 'help', set the innerHTML to a formatted string of commands.
      response.innerHTML = `
                Available commands:<br>
                HELP   - Shows this help message.<br>
                CLS    - Clears the screen.<br>
                DIR    - Displays a list of files and subdirectories.<br>
                ECHO   - Displays messages.<br>
                EXIT   - Quits the CMD.EXE program.<br>
            `;
      break;
    case "cls":
      // For 'cls', clear all previous output.
      output.innerHTML = "";
      return; // Exit the function early as no response text is needed.
    case "exit":
      // For 'exit', call the main closeWindow function.
      closeWindow(windowId);
      return; // Exit early.
    case "dir":
      // For 'dir', provide a simulated directory listing.
      response.innerHTML = `
             Volume in drive C has no label.<br>
             Volume Serial Number is B4B1-A421<br>
             <br>
             Directory of C:\\Documents and Settings\\Evan<br>
             <br>
             08/17/2024  04:32 PM    &lt;DIR&gt;          .<br>
             08/17/2024  04:32 PM    &lt;DIR&gt;          ..<br>
             08/17/2024  02:15 PM    &lt;DIR&gt;          Desktop<br>
             08/17/2024  01:05 PM    &lt;DIR&gt;          My Documents<br>
             08/17/2024  11:50 AM    &lt;DIR&gt;          Favorites<br>
                           0 File(s)              0 bytes<br>
                           5 Dir(s)  12,345,678,910 bytes free<br>
            `;
      break;
    case "echo":
      // For 'echo', join the arguments back together and display them.
      response.textContent = args.join(" ");
      break;
    default:
      // If the command is not recognized, show a default error message.
      if (command) {
        response.textContent = `'${command}' is not recognized as an internal or external command, operable program or batch file.`;
      }
      break;
  }
  // Append the generated response to the output.
  if (response.innerHTML || response.textContent) {
    output.appendChild(response);
  }
  // Add a blank line for spacing after the response.
  output.appendChild(document.createElement("br"));
}

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
        <div class="resume-section"><span class="resume-title">Evan L. Granito</span><p class="resume-text">Email: evang@tutamail.com</p><p class="resume-text">Phone: 910-526-8024</p><p class="resume-text">Location: Saratoga Springs, NY</p></div>
        <div class="resume-section"><div class="resume-heading">Summary</div><p class="resume-text">Dedicated and experienced Systems Administrator specializing in security-first environments. Skilled in deploying, managing, and securing a variety of technologies across small business to enterprise architectures. Proven ability in leveraging expertise in Linux systems, networking, and information security to enhance organizational cybersecurity posture.</p></div>
        <div class="resume-section"><div class="resume-heading">Technical Skills</div><div class="resume-sub-heading">Operating Systems:</div><p class="resume-text">Linux, Debian, Ubuntu, RHEL, FreeBSD, OpenBSD, pfSense, OPNsense, MacOS OSX, Windows XP/7/10/11, Windows Server 2022, Arch, Gentoo, Kali, Parrot</p><div class="resume-sub-heading">Scripting and Programming:</div><p class="resume-text">Bash, Python, Go, C, SQL, PHP, sed, awk, HTML, CSS, JavaScript</p><div class="resume-sub-heading">Networking and Security:</div><p class="resume-text">ssh, rsync, scp, sftp, rdp, vnc, pgp, gpg, dns, dig, tcp/ip, ip, route, subnetting/segmentation, nginx, nftables, iptables, ipset, wireguard, openvpn, wireshark, tshark, pyshark, tcpdump, bind, exim, easyrsa, squid, 3proxy, nmap, cron, postfix, dovecot, dhcp</p><div class="resume-sub-heading">Infrastructure and Virtualization:</div><p class="resume-text">Ansible, KVM, Docker, Docker Compose, libvirt, Proxmox, Unraid, TrueNAS Scale</p><div class="resume-sub-heading">Website Design and Development:</div><p class="resume-text">Django, Flask, FastAPI, WordPress, WooCommerce, Drupal, Magento, SquareSpace, Wix, Google Analytics, Matomo</p><div class="resume-sub-heading">Cloud and DevOps:</div><p class="resume-text">GCP, Git, Github, Gitlab</p></div>
        <div class="resume-section"><div class="resume-heading">Professional Certificates</div><p class="resume-text">Google Cybersecurity, November 2023</p></div>
        <div class="resume-section"><div class="resume-heading">Professional Experience</div><div class="resume-sub-heading">Music Industry Marketing, LLC | Atlanta, GA (Remote)</div><p class="resume-text"><strong>System Administrator, May 5, 2022 - Present</strong></p><ul class="resume-list"><li>Manage Windows Server 2022 automation environments</li><li>Automate deployments of Linux systems using Ansible</li><li>Deploy and manage virtualized Android environments</li><li>Develop python and bash scripts to streamline administrative tasks</li><li>Deploy cloud VNC workstations with custom software enabling employees to streamline workflow</li><li>Deploy and manage proxy edge infrastructure</li><li>Deploy and manage MySQL and PostgreSQL databases</li><li>Design and manage Shopify ecommerce website</li><li>Implement SEO strategies and perform keyword-competitor research</li><li>Analyze network traffic with tcpdump, wireguard, tshark, and pyshark</li><li>Analyze system logs to troubleshoot system, application, and network errors</li><li>Enhance system reliability and performance</li></ul><div class="resume-sub-heading">Organic Music Marketing | Atlanta, GA (Remote/Hybrid)</div><p class="resume-text"><strong>Systems Administrator and Automation Development Lead, February 2019 - May 2022</strong></p><ul class="resume-list"><li>Deploy and manage scalable Linux servers and KVM virtual machines</li><li>Build docker images and manage deployments with docker-compose</li><li>Deploy Nginx and MySQL servers for optimal service performance</li><li>Deploy and manage OpenVPN servers and Certificate Authority with EasyRSA</li><li>Deploy routers, servers, switches and manage office network</li><li>Implement security hardening measures across various systems and networks</li></ul><div class="resume-sub-heading">Arcane Solutions, LLC</div><p class="resume-text"><strong>Principal Consultant, December 2018 - Present</strong></p><ul class="resume-list"><li>Web design, development, and management</li><li>Deploy and manage LEMP stacks on cloud KVM architecture</li><li>Automate deployments, updates and patches with Ansible</li><li>E-commerce integration and inventory management</li><li>Manage DNS servers and records</li><li>Automate and maintain offsite backups</li></ul><div class="resume-sub-heading">KnownHost, LLC | Remote</div><p class="resume-text"><strong>Technical Support Engineer (SysAdmin), March 5, 2015 - December 30, 2018</strong></p><ul class="resume-list"><li>Administer KVM and OpenVZ environments, ensuring high availability and performance</li><li>Manage various hosting environments including WHMCS, cPanel, and DirectAdmin</li><li>Configure Apache, Nginx, and LiteSpeed web servers along with PHP and PHP-FPM</li><li>Manage MySQL servers and databases, ensuring data security and performance</li><li>Manage firewall and Web Application Firewall (WAF) configurations</li><li>Conduct malware removal and security hardening</li></ul><div class="resume-sub-heading">ViaTalk | Clifton Park, NY</div><p class="resume-text"><strong>Support Technician, June 2011 - June 2015</strong></p><ul class="resume-list"><li>Provide technical support for VoIP systems</li><li>Handle customer inquiries through phone calls, support tickets, and live chats</li><li>Troubleshoot connectivity, quality, and routing issues</li><li>Manage customer router configurations</li><li>Manage VoIP gateway hardware</li><li>Process phone number porting transfers</li><li>Resolve international calling issues with carrier backbone (Level3, etc)</li></ul></div>
        <div class="resume-section"><div class="resume-heading">Additional Information</div><p class="resume-text">Open to relocation and remote opportunities in the cybersecurity field</p><p class="resume-text">Additional experience, references, and project details available upon request</p></div>
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
