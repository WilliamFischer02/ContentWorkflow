import fs from "node:fs";
import path from "node:path";
import readline from "node:readline";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const configPath = path.join(__dirname, "tool-config.json");
const rawConfig = JSON.parse(fs.readFileSync(configPath, "utf8"));

const repoRoot = path.win32.normalize(rawConfig.repoRoot);
const nodeExe = path.win32.normalize(rawConfig.nodeExe);
const npmCmd = path.win32.normalize(rawConfig.npmCmd);
const gitExe = path.win32.normalize(rawConfig.gitExe);
const contentFile = path.join(repoRoot, "public", "siteContent.json");
const npmCliJs = path.join(path.dirname(npmCmd), "node_modules", "npm", "bin", "npm-cli.js");

const ANSI = {
  reset: "\x1b[0m",
  dim: "\x1b[90m",
  white: "\x1b[97m",
  cyan: "\x1b[96m",
  yellow: "\x1b[93m",
  green: "\x1b[92m",
  red: "\x1b[91m",
  bold: "\x1b[1m",
};

const STATE = {
  mode: "sections", // sections | fields | prompt | busy
  selectedSectionIndex: 0,
  selectedFieldIndex: 0,
};

let promptActive = false;
let busy = false;
let queuedPaths = new Set();

function clearScreen() {
  process.stdout.write("\x1Bc");
}

function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

function loadJson() {
  return JSON.parse(fs.readFileSync(contentFile, "utf8"));
}

function saveJson(data) {
  fs.writeFileSync(contentFile, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

function getValueAtPath(obj, pathParts) {
  return pathParts.reduce((acc, part) => acc[part], obj);
}

function setValueAtPath(obj, pathParts, value) {
  const parent = pathParts.slice(0, -1).reduce((acc, part) => acc[part], obj);
  parent[pathParts[pathParts.length - 1]] = value;
}

function pathKey(pathParts) {
  return pathParts.join(".");
}

function shorten(value, max = 90) {
  const text = String(value ?? "").replace(/\s+/g, " ").trim();
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

function wrapText(value, width = 88) {
  const text = String(value ?? "").replace(/\r/g, "");
  const paragraphs = text.split("\n");
  const lines = [];

  for (const paragraph of paragraphs) {
    if (!paragraph.trim()) {
      lines.push("");
      continue;
    }

    const words = paragraph.split(/\s+/);
    let current = "";

    for (const word of words) {
      if (!current) {
        current = word;
      } else if ((current + " " + word).length <= width) {
        current += " " + word;
      } else {
        lines.push(current);
        current = word;
      }
    }

    if (current) lines.push(current);
  }

  return lines;
}

function restoreInteractiveInput() {
  readline.emitKeypressEvents(process.stdin);
  process.stdin.resume();
  if (process.stdin.isTTY) {
    process.stdin.setRawMode(true);
  }
}

function runGit(args) {
  execFileSync(gitExe, args, {
    cwd: repoRoot,
    stdio: "inherit",
    env: process.env,
  });
}

function runNpm(args) {
  ensureToolPathsInEnv();

  if (fs.existsSync(npmCliJs)) {
    execFileSync(nodeExe, [npmCliJs, ...args], {
      cwd: repoRoot,
      stdio: "inherit",
      env: process.env,
    });
    return;
  }

  execFileSync("cmd.exe", ["/d", "/c", `call "${npmCmd}" ${args.join(" ")}`], {
    cwd: repoRoot,
    stdio: "inherit",
    env: process.env,
  });
}

function ensureToolPathsInEnv() {
  const nodeDir = path.dirname(nodeExe);
  const gitDir = path.dirname(gitExe);
  process.env.PATH = `${nodeDir};${gitDir};${process.env.PATH}`;
}

function buildSections(data) {
  const sections = [];

  sections.push({
    group: "HERO",
    type: "fields",
    label: "Hero",
    fields: [
      { label: "Badge", path: ["hero", "badge"] },
      { label: "Title", path: ["hero", "title"] },
      { label: "Description", path: ["hero", "description"] },
    ],
  });

  data.workflows.forEach((workflow, workflowIndex) => {
    sections.push({
      group: workflow.brand.toUpperCase(),
      type: "fields",
      label: `${workflow.brand} — Workflow Meta`,
      fields: [
        { label: "Brand", path: ["workflows", workflowIndex, "brand"] },
        { label: "Chapter Label", path: ["workflows", workflowIndex, "chapterLabel"] },
        { label: "Handle", path: ["workflows", workflowIndex, "handle"] },
        { label: "Summary", path: ["workflows", workflowIndex, "summary"] },
      ],
    });

    workflow.stages.forEach((stage, stageIndex) => {
      sections.push({
        group: workflow.brand.toUpperCase(),
        type: "fields",
        label: `${workflow.brand} — ${stage.title}`,
        fields: [
          { label: "Title", path: ["workflows", workflowIndex, "stages", stageIndex, "title"] },
          { label: "Description", path: ["workflows", workflowIndex, "stages", stageIndex, "description"] },
          { label: "URL", path: ["workflows", workflowIndex, "stages", stageIndex, "url"] },
        ],
      });
    });
  });

  sections.push({
    group: "KANBAN",
    type: "fields",
    label: "Film Kanban — Meta",
    fields: [
      { label: "Title", path: ["filmKanban", "title"] },
      { label: "Description", path: ["filmKanban", "description"] },
    ],
  });

  data.filmKanban.columns.forEach((column, columnIndex) => {
    sections.push({
      group: "KANBAN",
      type: "fields",
      label: `Film Kanban — ${column.title} — Column`,
      fields: [{ label: "Column Title", path: ["filmKanban", "columns", columnIndex, "title"] }],
    });

    column.items.forEach((item, itemIndex) => {
      sections.push({
        group: "KANBAN",
        type: "fields",
        label: `Film Kanban — ${column.title} — ${item.label}`,
        fields: [{ label: "Label", path: ["filmKanban", "columns", columnIndex, "items", itemIndex, "label"] }],
      });
    });
  });

  data.footerCards.forEach((card, cardIndex) => {
    sections.push({
      group: "FOOTER",
      type: "fields",
      label: `Footer Card ${cardIndex + 1}`,
      fields: [
        { label: "Title", path: ["footerCards", cardIndex, "title"] },
        { label: "Text", path: ["footerCards", cardIndex, "text"] },
      ],
    });
  });

  sections.push({
    group: "ACTIONS",
    type: "action",
    action: "apply",
    label: "Apply queued changes (P)",
  });

  sections.push({
    group: "ACTIONS",
    type: "action",
    action: "reload",
    label: "Reload from disk (R)",
  });

  sections.push({
    group: "ACTIONS",
    type: "action",
    action: "discard",
    label: "Discard queued changes (D)",
  });

  sections.push({
    group: "ACTIONS",
    type: "action",
    action: "exit",
    label: "Exit editor",
  });

  return sections;
}

function getFieldMenu(section) {
  return [
    { type: "back", label: "← Back to sections" },
    ...section.fields.map((field) => ({ ...field, type: "field" })),
  ];
}

function getVisibleCount() {
  const terminalRows = process.stdout.rows || 30;
  const reserved = 11;
  const linesPerItem = 2;
  return Math.max(7, Math.min(14, Math.floor((terminalRows - reserved) / linesPerItem)));
}

function getWindowBounds(totalItems, selectedIndex, visibleCount) {
  let start = selectedIndex - Math.floor(visibleCount / 2);
  let end = start + visibleCount;

  if (start < 0) {
    start = 0;
    end = Math.min(totalItems, visibleCount);
  }

  if (end > totalItems) {
    end = totalItems;
    start = Math.max(0, end - visibleCount);
  }

  return { start, end };
}

function renderEditScreen(question, currentValue) {
  clearScreen();

  const terminalWidth = process.stdout.columns || 100;
  const wrapWidth = Math.max(50, Math.min(terminalWidth - 6, 120));
  const wrappedCurrent = wrapText(currentValue, wrapWidth).slice(0, 8);

  console.log(`${ANSI.bold}${ANSI.white}ContentWorkflow CLI Editor${ANSI.reset}`);
  console.log(`${ANSI.dim}Edit Mode — type, review, then press Enter${ANSI.reset}`);
  console.log("");

  console.log(`${ANSI.cyan}${question}${ANSI.reset}`);
  console.log("");

  console.log(`${ANSI.dim}Current value:${ANSI.reset}`);
  if (wrappedCurrent.length === 0) {
    console.log(`${ANSI.dim}(empty)${ANSI.reset}`);
  } else {
    for (const line of wrappedCurrent) {
      console.log(`${ANSI.dim}${line}${ANSI.reset}`);
    }
  }

  console.log("");
  console.log(`${ANSI.yellow}New value:${ANSI.reset}`);
  console.log(`${ANSI.dim}(Blank input keeps the current value)${ANSI.reset}`);
  console.log("");
}

async function promptForInput(question, currentValue) {
  promptActive = true;
  STATE.mode = "prompt";

  process.stdin.setRawMode(false);

  return await new Promise((resolve) => {
    renderEditScreen(question, currentValue);

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: true,
      historySize: 0,
    });

    rl.question("> ", (answer) => {
      rl.close();
      promptActive = false;
      STATE.mode = "sections";
      restoreInteractiveInput();
      resolve(answer);
    });
  });
}

async function pause(message = "Press Enter to continue...") {
  promptActive = true;
  process.stdin.setRawMode(false);

  return await new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question(message, () => {
      rl.close();
      promptActive = false;
      restoreInteractiveInput();
      resolve();
    });
  });
}

let persistedData = loadJson();
let workingData = deepClone(persistedData);
let sections = buildSections(workingData);

function renderSectionsMenu() {
  clearScreen();

  const visibleCount = getVisibleCount();
  const { start, end } = getWindowBounds(sections.length, STATE.selectedSectionIndex, visibleCount);
  const selectedSection = sections[STATE.selectedSectionIndex];

  console.log(`${ANSI.bold}${ANSI.white}ContentWorkflow CLI Editor${ANSI.reset}`);
  console.log(`${ANSI.dim}Mode: Sections | ↑ / ↓ move | Enter select | P apply | R reload | D discard | Ctrl+C exit${ANSI.reset}`);
  console.log(`${ANSI.dim}Queued edits: ${queuedPaths.size}${ANSI.reset}`);
  console.log("");

  console.log(`${ANSI.cyan}Currently Selected Section${ANSI.reset}`);
  console.log(`${ANSI.white}${selectedSection.label}${ANSI.reset}`);
  console.log("");

  let previousGroup = null;

  for (let i = start; i < end; i++) {
    const section = sections[i];
    const isSelected = i === STATE.selectedSectionIndex;
    const prefix = isSelected ? `${ANSI.white}>` : `${ANSI.dim} `;
    const color = isSelected ? ANSI.white : ANSI.dim;

    if (section.group !== previousGroup) {
      if (previousGroup !== null) console.log("");
      console.log(`${ANSI.cyan}${section.group}${ANSI.reset}`);
      console.log("");
      previousGroup = section.group;
    }

    console.log(`${prefix} ${color}${section.label}${ANSI.reset}`);
  }

  console.log("");
  console.log(`${ANSI.dim}Showing ${start + 1}-${end} of ${sections.length}${ANSI.reset}`);
}

function renderFieldsMenu() {
  clearScreen();

  const section = sections[STATE.selectedSectionIndex];
  const fieldMenu = getFieldMenu(section);
  const visibleCount = getVisibleCount();
  const { start, end } = getWindowBounds(fieldMenu.length, STATE.selectedFieldIndex, visibleCount);
  const selectedField = fieldMenu[STATE.selectedFieldIndex];

  console.log(`${ANSI.bold}${ANSI.white}ContentWorkflow CLI Editor${ANSI.reset}`);
  console.log(`${ANSI.dim}Mode: Fields | ↑ / ↓ move | Enter edit | B back | P apply | R reload | D discard | Ctrl+C exit${ANSI.reset}`);
  console.log(`${ANSI.dim}Queued edits: ${queuedPaths.size}${ANSI.reset}`);
  console.log("");

  console.log(`${ANSI.cyan}${section.label}${ANSI.reset}`);
  console.log("");

  if (selectedField.type === "back") {
    console.log(`${ANSI.white}${selectedField.label}${ANSI.reset}`);
  } else {
    const currentValue = getValueAtPath(workingData, selectedField.path);
    console.log(`${ANSI.white}${selectedField.label}${ANSI.reset}`);
    console.log(`${ANSI.dim}${shorten(currentValue, 120)}${ANSI.reset}`);
  }

  console.log("");

  for (let i = start; i < end; i++) {
    const field = fieldMenu[i];
    const isSelected = i === STATE.selectedFieldIndex;
    const prefix = isSelected ? `${ANSI.white}>` : `${ANSI.dim} `;
    const color = isSelected ? ANSI.white : ANSI.dim;

    if (field.type === "back") {
      console.log(`${prefix} ${color}${field.label}${ANSI.reset}`);
    } else {
      const value = getValueAtPath(workingData, field.path);
      console.log(`${prefix} ${color}${field.label}${ANSI.reset}`);
      console.log(`  ${ANSI.dim}${shorten(value, 92)}${ANSI.reset}`);
    }
  }

  console.log("");
  console.log(`${ANSI.dim}Showing ${start + 1}-${end} of ${fieldMenu.length}${ANSI.reset}`);
}

function render() {
  if (promptActive) return;
  if (STATE.mode === "fields") {
    renderFieldsMenu();
  } else {
    renderSectionsMenu();
  }
}

async function applyQueuedChanges() {
  busy = true;
  STATE.mode = "busy";
  clearScreen();

  console.log(`${ANSI.bold}${ANSI.white}Applying queued changes${ANSI.reset}`);
  console.log("");

  if (queuedPaths.size === 0) {
    console.log(`${ANSI.dim}No queued changes to apply.${ANSI.reset}`);
    busy = false;
    await pause();
    STATE.mode = "sections";
    return;
  }

  try {
    ensureToolPathsInEnv();
    saveJson(workingData);

    console.log(`${ANSI.yellow}1/4 Building site...${ANSI.reset}`);
    runNpm(["run", "build"]);

    console.log("");
    console.log(`${ANSI.yellow}2/4 Staging content...${ANSI.reset}`);
    runGit(["add", "public/siteContent.json"]);

    console.log("");
    console.log(`${ANSI.yellow}3/4 Committing...${ANSI.reset}`);
    try {
      runGit(["commit", "-m", `content: update site content (${queuedPaths.size} changes)`]);
    } catch {
      console.log(`${ANSI.dim}No commit created (possibly no diff).${ANSI.reset}`);
    }

    console.log("");
    console.log(`${ANSI.yellow}4/4 Pushing...${ANSI.reset}`);
    runGit(["push"]);

    persistedData = loadJson();
    workingData = deepClone(persistedData);
    sections = buildSections(workingData);
    queuedPaths.clear();

    STATE.mode = "sections";
    STATE.selectedFieldIndex = 0;

    console.log("");
    console.log(`${ANSI.green}Queued changes applied successfully.${ANSI.reset}`);
    console.log(`${ANSI.dim}GitHub Pages may take a short moment to redeploy.${ANSI.reset}`);
  } catch (err) {
    console.log("");
    console.log(`${ANSI.red}Apply failed.${ANSI.reset}`);
    console.log(`${ANSI.dim}${err instanceof Error ? err.message : String(err)}${ANSI.reset}`);
  }

  busy = false;
  await pause();
  STATE.mode = "sections";
}

function discardQueuedChanges() {
  workingData = deepClone(persistedData);
  sections = buildSections(workingData);
  queuedPaths.clear();
  STATE.mode = "sections";
  STATE.selectedFieldIndex = 0;
}

function reloadFromDisk() {
  persistedData = loadJson();
  workingData = deepClone(persistedData);
  sections = buildSections(workingData);
  queuedPaths.clear();
  STATE.mode = "sections";
  STATE.selectedFieldIndex = 0;
}

async function editCurrentField() {
  const section = sections[STATE.selectedSectionIndex];
  const fieldMenu = getFieldMenu(section);
  const selectedField = fieldMenu[STATE.selectedFieldIndex];

  if (selectedField.type === "back") {
    STATE.mode = "sections";
    STATE.selectedFieldIndex = 0;
    return;
  }

  const currentValue = String(getValueAtPath(workingData, selectedField.path));
  const answer = await promptForInput(`${section.label} → ${selectedField.label}`, currentValue);

  if (String(answer).trim()) {
    setValueAtPath(workingData, selectedField.path, answer);
    queuedPaths.add(pathKey(selectedField.path));
    sections = buildSections(workingData);
  }

  STATE.mode = "sections";
  STATE.selectedFieldIndex = 0;
}

async function handleEnter() {
  if (STATE.mode === "sections") {
    const selectedSection = sections[STATE.selectedSectionIndex];

    if (selectedSection.type === "fields") {
      STATE.mode = "fields";
      STATE.selectedFieldIndex = 0;
      return;
    }

    if (selectedSection.action === "apply") {
      await applyQueuedChanges();
      return;
    }

    if (selectedSection.action === "reload") {
      reloadFromDisk();
      return;
    }

    if (selectedSection.action === "discard") {
      discardQueuedChanges();
      return;
    }

    if (selectedSection.action === "exit") {
      clearScreen();
      process.exit(0);
    }
  } else if (STATE.mode === "fields") {
    await editCurrentField();
  }
}

readline.emitKeypressEvents(process.stdin);
process.stdin.resume();
if (process.stdin.isTTY) {
  process.stdin.setRawMode(true);
}

process.stdin.on("keypress", async (_, key) => {
  if (key.ctrl && key.name === "c") {
    clearScreen();
    process.exit(0);
  }

  if (promptActive || busy) {
    return;
  }

  if (key.name?.toLowerCase() === "p") {
    await applyQueuedChanges();
    render();
    return;
  }

  if (key.name?.toLowerCase() === "r") {
    reloadFromDisk();
    render();
    return;
  }

  if (key.name?.toLowerCase() === "d") {
    discardQueuedChanges();
    render();
    return;
  }

  if (STATE.mode === "fields" && key.name?.toLowerCase() === "b") {
    STATE.mode = "sections";
    STATE.selectedFieldIndex = 0;
    render();
    return;
  }

  if (STATE.mode === "sections") {
    if (key.name === "up") {
      STATE.selectedSectionIndex =
        STATE.selectedSectionIndex > 0 ? STATE.selectedSectionIndex - 1 : sections.length - 1;
      render();
      return;
    }

    if (key.name === "down") {
      STATE.selectedSectionIndex =
        STATE.selectedSectionIndex < sections.length - 1 ? STATE.selectedSectionIndex + 1 : 0;
      render();
      return;
    }
  } else if (STATE.mode === "fields") {
    const fieldMenuLength = getFieldMenu(sections[STATE.selectedSectionIndex]).length;

    if (key.name === "up") {
      STATE.selectedFieldIndex =
        STATE.selectedFieldIndex > 0 ? STATE.selectedFieldIndex - 1 : fieldMenuLength - 1;
      render();
      return;
    }

    if (key.name === "down") {
      STATE.selectedFieldIndex =
        STATE.selectedFieldIndex < fieldMenuLength - 1 ? STATE.selectedFieldIndex + 1 : 0;
      render();
      return;
    }
  }

  if (key.name === "return") {
    await handleEnter();
    render();
  }
});

render();