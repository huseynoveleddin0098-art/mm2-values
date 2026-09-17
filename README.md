const STORAGE_KEY = "mm2values-dashboard-v1";

const defaultItems = [
  { id: crypto.randomUUID(), name: "Victorious", category: "godly", value: 2800000, demand: "High", stability: "Very Stable" },
  { id: crypto.randomUUID(), name: "Dragon", category: "godly", value: 3400000, demand: "High", stability: "Stable" },
  { id: crypto.randomUUID(), name: "Darkmatter", category: "ancient", value: 4900000, demand: "Very High", stability: "Stable" },
  { id: crypto.randomUUID(), name: "Frostbite", category: "chroma", value: 2100000, demand: "Medium", stability: "Stable" },
  { id: crypto.randomUUID(), name: "Gilded", category: "chroma", value: 1700000, demand: "Medium", stability: "Stable" },
  { id: crypto.randomUUID(), name: "Galaxy", category: "vintage", value: 950000, demand: "Medium", stability: "Moderate" },
  { id: crypto.randomUUID(), name: "Cursed", category: "ancient", value: 2800000, demand: "High", stability: "Stable" },
  { id: crypto.randomUUID(), name: "Shadow", category: "pet", value: 650000, demand: "High", stability: "Moderate" },
  { id: crypto.randomUUID(), name: "Neon", category: "pet", value: 520000, demand: "Medium", stability: "Stable" },
  { id: crypto.randomUUID(), name: "Crimson", category: "weapon", value: 1300000, demand: "High", stability: "Stable" },
  { id: crypto.randomUUID(), name: "Royal", category: "weapon", value: 940000, demand: "Medium", stability: "Moderate" },
  { id: crypto.randomUUID(), name: "Abyssal", category: "godly", value: 4300000, demand: "Very High", stability: "Very Stable" }
];

const state = {
  items: loadItems(),
  search: "",
  category: "all"
};

const $ = (id) => document.getElementById(id);

function loadItems() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultItems));
    return [...defaultItems];
  }

  try {
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) && parsed.length ? parsed : [...defaultItems];
  } catch {
    return [...defaultItems];
  }
}

function persistItems() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
}

function formatMoney(value) {
  return `${(value / 1000000).toFixed(1)}M`;
}

function getCategoryLabel(category) {
  return category.charAt(0).toUpperCase() + category.slice(1);
}

function getFilteredItems() {
  return state.items.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(state.search.toLowerCase());
    const matchesCategory = state.category === "all" || item.category === state.category;
    return matchesSearch && matchesCategory;
  });
}

function renderTrending() {
  const top = [...state.items].sort((a, b) => b.value - a.value).slice(0, 4);
  const list = $("trendingList");
  list.innerHTML = top
    .map(
      (item) => `
        <div class="mini-item">
          <span>${item.name}</span>
          <strong>${formatMoney(item.value)}</strong>
        </div>
      `
    )
    .join("");
}

function renderMetrics() {
  const totalItems = state.items.length;
  const categories = new Set(state.items.map((item) => item.category)).size;
  const avg = state.items.reduce((sum, item) => sum + item.value, 0) / totalItems;

  $("metricItems").textContent = String(totalItems);
  $("metricCategories").textContent = String(categories);
  $("avgValue").textContent = formatMoney(avg);

  const topCat = [...state.items].reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + 1;
    return acc;
  }, {});

  const top = Object.entries(topCat).sort((a, b) => b[1] - a[1])[0];
  $("topCategory").textContent = top ? getCategoryLabel(top[0]) : "N/A";
}

function renderTable() {
  const filtered = getFilteredItems();
  const tableBody = $("itemsTable");

  tableBody.innerHTML = filtered
    .map(
      (item) => `
        <tr>
          <td>
            <div class="item-name">
              <span class="item-dot"></span>
              <span>${item.name}</span>
            </div>
          </td>
          <td><span class="badge">${getCategoryLabel(item.category)}</span></td>
          <td class="value">${formatMoney(item.value)}</td>
          <td class="demand">${item.demand}</td>
          <td class="stability">${item.stability}</td>
          <td>
            <div class="row-actions">
              <button class="icon-action" type="button" data-edit="${item.id}">Edit</button>
              <button class="icon-action danger" type="button" data-delete="${item.id}">Delete</button>
            </div>
          </td>
        </tr>
      `
    )
    .join("");

  document.querySelectorAll("[data-edit]").forEach((button) => {
    button.addEventListener("click", () => loadItemToForm(button.dataset.edit));
  });

  document.querySelectorAll("[data-delete]").forEach((button) => {
    button.addEventListener("click", () => {
      state.items = state.items.filter((item) => item.id !== button.dataset.delete);
      persistItems();
      renderAll();
    });
  });
}

function renderDropdowns() {
  const itemOptions = state.items
    .map((item) => `<option value="${item.id}">${item.name}</option>`)
    .join("");

  $("myItem").innerHTML = itemOptions;
  $("theirItem").innerHTML = itemOptions;

  if (state.items.length >= 2) {
    $("myItem").value = state.items[0].id;
    $("theirItem").value = state.items[1].id;
  }
}

function renderSummary() {
  $("summaryTotal").textContent = String(state.items.length);
  const max = [...state.items].sort((a, b) => b.value - a.value)[0];
  $("summaryTop").textContent = max ? formatMoney(max.value) : "0";
}

function renderTradeResult() {
  const leftId = $("myItem").value;
  const rightId = $("theirItem").value;

  if (!leftId || !rightId) {
    return;
  }

  const left = state.items.find((item) => item.id === leftId);
  const right = state.items.find((item) => item.id === rightId);

  if (!left || !right) {
    return;
  }

  const diff = Math.abs(left.value - right.value);
  const avg = (left.value + right.value) / 2;
  const ratio = (diff / avg) * 100;

  let title = "Fair";
  let color = "#fbbf24";
  let note = "Trade is close to balanced.";

  if (ratio > 20) {
    title = "Lose";
    color = "#f87171";
    note = "This trade is heavily skewed in one direction.";
  } else if (ratio < 8) {
    title = "Win";
    color = "#34d399";
    note = "This trade is favorable and balanced.";
  }

  $("tradeResult").innerHTML = `
    <span class="label">Result</span>
    <strong style="color:${color}">${title}</strong>
    <small>${note}</small>
  `;
}

function renderAll() {
  renderTrending();
  renderMetrics();
  renderTable();
  renderDropdowns();
  renderTradeResult();
  renderSummary();
}

function resetForm() {
  $("adminForm").reset();
  $("itemId").value = "";
}

function loadItemToForm(id) {
  const item = state.items.find((entry) => entry.id === id);
  if (!item) return;

  $("itemId").value = item.id;
  $("itemName").value = item.name;
  $("itemCategory").value = item.category;
  $("itemValue").value = item.value;
  $("itemDemand").value = item.demand;
  $("itemStability").value = item.stability;
  $("itemName").focus();
}

$("searchInput").addEventListener("input", (event) => {
  state.search = event.target.value;
  renderTable();
});

$("categoryFilter").addEventListener("change", (event) => {
  state.category = event.target.value;
  renderTable();
});

$("calcBtn").addEventListener("click", renderTradeResult);
$("myItem").addEventListener("change", renderTradeResult);
$("theirItem").addEventListener("change", renderTradeResult);

$("adminForm").addEventListener("submit", (event) => {
  event.preventDefault();

  const id = $("itemId").value;
  const payload = {
    id: id || crypto.randomUUID(),
    name: $("itemName").value.trim(),
    category: $("itemCategory").value,
    value: Number($("itemValue").value),
    demand: $("itemDemand").value,
    stability: $("itemStability").value
  };

  if (!payload.name || !payload.value) return;

  if (id) {
    state.items = state.items.map((item) => (item.id === id ? payload : item));
  } else {
    state.items.unshift(payload);
  }

  persistItems();
  resetForm();
  renderAll();
});

$("resetForm").addEventListener("click", resetForm);

renderAll();
