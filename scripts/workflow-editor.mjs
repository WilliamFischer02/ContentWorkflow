import fs from "node:fs";
import path from "node:path";
import readline from "node:readline";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const contentFile = path.join(repoRoot, "public", "siteContent.json");

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

function clearScreen() {
  process.stdout.write("\x1Bc");
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

function shorten(value, max = 92) {
  const text = String(value).replace(/\s+/g, " ").trim();
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
        continue;
      }

      if ((current + " " + word).length <= width) {
        current += " " + word;
      } else {
        lines.push(current);
        current = word;
      }
    }

    if (current) {
      lines.push(current);
    }
  }

  return lines;
}

function renderEditScreen(question, currentValue) {
  clearScreen();

  const terminalWidth = process.stdout.columns || 100;
  const wrapWidth = Math.max(40, Math.min(terminalWidth - 8, 110));
  const wrapped = wrapText(currentValue, wrapWidth).slice(0, 10);

  console.log(`${ANSI.bold}${ANSI.white}ContentWorkflow CLI Editor${ANSI.reset}`);
  console.log(`${ANSI.dim}Edit Mode${ANSI.reset}`);
  console.log("");

  console.log(`${ANSI.cyan}${question}${ANSI.reset}`);
  console.log("");

  console.log(`${ANSI.dim}Current value:${ANSI.reset}`);
  if (wrapped.length === 0) {
    console.log(`${ANSI.dim}(empty)${ANSI.reset}`);
  } else {
    for (const line of wrapped) {
      console.log(`${ANSI.dim}${line}${ANSI.reset}`);
    }
  }

  console.log("");
  console.log(`${ANSI.yellow}Enter new value below.${ANSI.reset}`);
  console.log(`${ANSI.dim}Blank input keeps the current value.${ANSI.reset}`);
  console.log("");
}

function buildEditorItems(data) {
  const items = [];

  items.push({
    section: "Hero",
    label: "Hero > Badge",
    path: ["hero", "badge"],
  });
  items.push({
    section: "Hero",
    label: "Hero > Title",
    path: ["hero", "title"],
  });
  items.push({
    section: "Hero",
    label: "Hero > Description",
    path: ["hero", "description"],
  });

  data.workflows.forEach((workflow, workflowIndex) => {
    items.push({
      section: workflow.brand,
      label: `${workflow.brand} > Brand`,
      path: ["workflows", workflowIndex, "brand"],
    });
    items.push({
      section: workflow.brand,
      label: `${workflow.brand} > Chapter Label`,
      path: ["workflows", workflowIndex, "chapterLabel"],
    });
    items.push({
      section: workflow.brand,
      label: `${workflow.brand} > Handle`,
      path: ["workflows", workflowIndex, "handle"],
    });
    items.push({
      section: workflow.brand,
      label: `${workflow.brand} > Summary`,
      path: ["workflows", workflowIndex, "summary"],
    });

    workflow.stages.forEach((stage, stageIndex) => {
      items.push({
        section: workflow.brand,
        label: `${workflow.brand} > ${stage.title} > Title`,
        path: ["workflows", workflowIndex, "stages", stageIndex, "title"],
      });
      items.push({
        section: workflow.brand,
        label: `${workflow.brand} > ${stage.title} > Description`,
        path: ["workflows", workflowIndex, "stages", stageIndex, "description"],
      });
      items.push({
        section: workflow.brand,
        label: `${workflow.brand} > ${stage.title} > URL`,
        path: ["workflows", workflowIndex, "stages", stageIndex, "url"],
      });
    });
  });

  items.push({
    section: "Kanban",
    label: "Kanban > Title",
    path: ["filmKanban", "title"],
  });
  items.push({
    section: "Kanban",
    label: "Kanban > Description",
    path: ["filmKanban", "description"],
  });

  data.filmKanban.columns.forEach((column, columnIndex) => {
    items.push({
      section: "Kanban",
      label: `Kanban > ${column.title} > Column Title`,
      path: ["filmKanban", "columns", columnIndex, "title"],
    });

    column.items.forEach((item, itemIndex) => {
      items.push({
        section: "Kanban",
        label: `Kanban > ${column.title} > ${item.label}`,
        path: ["filmKanban", "columns", columnIndex, "items", itemIndex, "label"],
      });
    });
  });

  data.footerCards.forEach((card, cardIndex) => {
    items.push({
      section: "Footer",
      label: `Footer > Card ${cardIndex + 1} Title`,
      path: ["footerCards", cardIndex, "title"],
    });
    items.push({
      section: "Footer",
      label: `Footer > Card ${cardIndex + 1} Text`,
      path: ["footerCards", cardIndex, "text"],
    });
  });

  return items;
}

function execCommand(command) {
  execSync(command, {
    cwd: repoRoot,
    stdio: "inherit",
  });
}

async function promptForInput(question, currentValue) {
  process.stdin.setRawMode(false);

  return await new Promise((resolve) => {
    renderEditScreen(question, currentValue);

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: true,
    });

    rl.question("> ", (answer) => {
      rl.close();
      process.stdin.setRawMode(true);
      resolve(answer);
    });
  });
}

async function pause(message = "Press Enter to continue...") {
  process.stdin.setRawMode(false);

  return await new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question(`${message}`, () => {
      rl.close();
      process.stdin.setRawMode(true);
      resolve();
    });
  });
}

async function saveBuildCommitPush(itemLabel, data) {
  clearScreen();
  console.log(`${ANSI.bold}${ANSI.cyan}ContentWorkflow CLI Editor${ANSI.reset}`);
  console.log(`${ANSI.dim}Saving change for:${ANSI.reset} ${itemLabel}`);
  console.log("");

  saveJson(data);

  try {
    console.log(`${ANSI.yellow}1/4 Building site...${ANSI.reset}`);
    execCommand("npm run build");

    console.log("");
    console.log(`${ANSI.yellow}2/4 Staging updated files...${ANSI.reset}`);
    execCommand("git add public/siteContent.json");

    console.log("");
    console.log(`${ANSI.yellow}3/4 Creating commit...${ANSI.reset}`);
    try {
      execCommand('git commit -m "content: update site content"');
    } catch {
      console.log(`${ANSI.dim}No commit created — content may be unchanged.${ANSI.reset}`);
    }

    console.log("");
    console.log(`${ANSI.yellow}4/4 Pushing...${ANSI.reset}`);
    try {
      execCommand("git push");
    } catch {
      console.log(`${ANSI.red}Push failed. Resolve manually if needed.${ANSI.reset}`);
    }

    console.log("");
    console.log(`${ANSI.green}Finished successfully.${ANSI.reset}`);
  } catch {
    console.log("");
    console.log(`${ANSI.red}Build failed after the edit. The JSON file was still saved.${ANSI.reset}`);
    console.log(`${ANSI.dim}Fix the issue, then rerun the editor or build manually.${ANSI.reset}`);
  }

  await pause();
}

let data = loadJson();
let items = buildEditorItems(data);
let selectedIndex = 0;

function getVisibleItemCount() {
  const terminalRows = process.stdout.rows || 30;

  // Header + instructions + selected summary + footer
  const reservedLines = 12;

  // Each item usually consumes 3 lines:
  // label, value, blank spacer
  const linesPerItem = 3;

  const count = Math.floor((terminalRows - reservedLines) / linesPerItem);

  // Keep the list compact enough to stay visible in smaller PowerShell windows
  return Math.max(6, Math.min(12, count));
}

function getWindowBounds(totalItems, selected, visibleCount) {
  let start = selected - Math.floor(visibleCount / 2);
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

function renderMenu() {
  clearScreen();

  const visibleCount = getVisibleItemCount();
  const { start, end } = getWindowBounds(items.length, selectedIndex, visibleCount);
  const selectedItem = items[selectedIndex];
  const selectedValue = getValueAtPath(data, selectedItem.path);

  console.log(`${ANSI.bold}${ANSI.white}ContentWorkflow CLI Editor${ANSI.reset}`);
  console.log(
    `${ANSI.dim}Use ↑ / ↓ to move, Enter to edit, R to reload from disk, Ctrl+C to exit.${ANSI.reset}`,
  );
  console.log(
    `${ANSI.dim}Edits write into public/siteContent.json, then build / commit / push.${ANSI.reset}`,
  );
  console.log("");

  console.log(`${ANSI.cyan}Currently Selected${ANSI.reset}`);
  console.log(`${ANSI.white}${selectedItem.label}${ANSI.reset}`);
  console.log(`${ANSI.dim}${shorten(selectedValue, 120)}${ANSI.reset}`);
  console.log("");

  let previousSection = null;

  for (let i = start; i < end; i++) {
    const item = items[i];
    const currentValue = getValueAtPath(data, item.path);
    const isSelected = i === selectedIndex;

    if (item.section !== previousSection) {
      console.log(`${ANSI.cyan}${item.section}${ANSI.reset}`);
      previousSection = item.section;
    }

    const prefix = isSelected ? `${ANSI.white}>` : `${ANSI.dim} `;
    const labelColor = isSelected ? ANSI.white : ANSI.dim;
    const valueColor = isSelected ? ANSI.cyan : ANSI.dim;

    console.log(`${prefix} ${labelColor}${item.label}${ANSI.reset}`);
    console.log(`  ${valueColor}${shorten(currentValue, 88)}${ANSI.reset}`);
    console.log("");
  }

  console.log(
    `${ANSI.dim}Selected ${selectedIndex + 1} of ${items.length} | Showing ${start + 1}-${end}${ANSI.reset}`,
  );
}

async function editSelectedItem() {
  const item = items[selectedIndex];
  const currentValue = String(getValueAtPath(data, item.path));
  const answer = await promptForInput(item.label, currentValue);

  if (!String(answer).trim()) {
    return;
  }

  setValueAtPath(data, item.path, answer);
  await saveBuildCommitPush(item.label, data);

  data = loadJson();
  items = buildEditorItems(data);
}

readline.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);

process.stdin.on("keypress", async (_, key) => {
  if (key.ctrl && key.name === "c") {
    clearScreen();
    process.exit(0);
  }

  if (key.name === "up") {
    selectedIndex = selectedIndex > 0 ? selectedIndex - 1 : items.length - 1;
    renderMenu();
    return;
  }

  if (key.name === "down") {
    selectedIndex = selectedIndex < items.length - 1 ? selectedIndex + 1 : 0;
    renderMenu();
    return;
  }

  if (key.name === "return") {
    await editSelectedItem();
    renderMenu();
    return;
  }

  if (key.name?.toLowerCase() === "r") {
    data = loadJson();
    items = buildEditorItems(data);
    renderMenu();
  }
});

renderMenu();