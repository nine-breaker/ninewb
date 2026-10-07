const CATEGORY_LABELS = {
  web: "Web Resources",
  games: "Games",
};

// placeholder icon — swap individual entries to real icons later
const CATEGORY_ICONS = {
  web:         "../images/cat/yummy.jpg",
  games:       "../images/cat/yummy.jpg",
};

const PLACEHOLDER_ICON = "../images/cat/yummy.jpg";

let items = [];
let activeCategory = null;

async function initLibrary() {
  items = await (await fetch("../data/links.json")).json();

  // total count in the Directory bar
  document.getElementById("directory-count").textContent = items.length;

  // build one button per category, ordered by first appearance
  const categories = [...new Set(items.map(i => i.category))];
  renderCategoryButtons(categories);

  // wire hover
  if (typeof attachHoverInfoDelegated === "function") {
    attachHoverInfoDelegated(".category-btn", "dir-info", "—");
  }
}

function renderCategoryButtons(categories) {
  const container = document.getElementById("category-buttons");
  container.innerHTML = "";

  categories.forEach(cat => {
    const btn = document.createElement("button");
    btn.className = "category-btn";
    btn.dataset.category = cat;
    btn.dataset.hoverText = CATEGORY_LABELS[cat] ?? cat;
    btn.innerHTML = `<img src="${CATEGORY_ICONS[cat] ?? PLACEHOLDER_ICON}" alt="${cat}">`;
    btn.addEventListener("click", () => toggleCategory(cat));
    container.appendChild(btn);
  });
  // hover
}

function toggleCategory(cat) {
  const panel = document.getElementById("category-panel");


  if (activeCategory === cat) {
    activeCategory = null;
    panel.hidden = true;
    document.querySelectorAll(".category-btn").forEach(b => b.classList.remove("active"));
    return;
  }

  activeCategory = cat;

  // highlight active button
  document.querySelectorAll(".category-btn").forEach(b => {
    b.classList.toggle("active", b.dataset.category === cat);
  });

  // label bar
  document.getElementById("category-label").textContent =
    CATEGORY_LABELS[cat] ?? cat;

  // filter + render list
  const filtered = items.filter(i => i.category === cat);
  renderList(filtered);

  panel.hidden = false;
}

function renderList(list) {
  const container = document.getElementById("category-list");
  container.innerHTML = list.map(entry).join("");
  container.scrollTop = 0;
}

function entry(item) {
  return `
    <div class="link-entry">
      <a href="${item.url}" target="_blank" rel="noopener">${escapeHtml(item.title)}</a>
      ${item.description ? `<div class="link-desc">${escapeHtml(item.description)}</div>` : ""}
    </div>
  `;
}

function escapeHtml(s) {
  return String(s ?? "").replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));
}

initLibrary();