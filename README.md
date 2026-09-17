const items = [
  { name: "Victorious", category: "godly", value: 2800000, demand: "High", stability: "Very Stable" },
  { name: "Dragon", category: "godly", value: 3400000, demand: "High", stability: "Stable" },
  { name: "Darkmatter", category: "ancient", value: 4900000, demand: "Very High", stability: "Stable" },
  { name: "Frostbite", category: "chroma", value: 2100000, demand: "Medium", stability: "Stable" },
  { name: "Gilded", category: "chroma", value: 1700000, demand: "Medium", stability: "Stable" },
  { name: "Galaxy", category: "vintage", value: 950000, demand: "Medium", stability: "Moderate" },
  { name: "Cursed", category: "ancient", value: 2800000, demand: "High", stability: "Stable" },
  { name: "Shadow", category: "pet", value: 650000, demand: "High", stability: "Moderate" },
  { name: "Neon", category: "pet", value: 520000, demand: "Medium", stability: "Stable" },
  { name: "Crimson", category: "weapon", value: 1300000, demand: "High", stability: "Stable" },
  { name: "Royal", category: "weapon", value: 940000, demand: "Medium", stability: "Moderate" },
  { name: "Abyssal", category: "godly", value: 4300000, demand: "Very High", stability: "Very Stable" }
];

const tableBody = document.getElementById("itemsTable");
const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");
const metricItems = document.getElementById("metric-items");
const myItemSelect = document.getElementById("myItem");
const theirItemSelect = document.getElementById("theirItem");
const tradeResult = document.getElementById("tradeResult");
const calcBtn = document.getElementById("calcBtn");

function formatMoney(value) {
  return `${(value / 1000000).toFixed(1)}M`;
}

function getCategoryLabel(category) {
  return category.charAt(0).toUpperCase() + category.slice(1);
}

function renderTable() {
  const query = searchInput.value.trim().toLowerCase();
  const category = categoryFilter.value;

  const filtered = items.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(query);
    const matchesCategory = category === "all" || item.category === category;
    return matchesSearch && matchesCategory;
  });

  metricItems.textContent = filtered.length;

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
        </tr>
      `
    )
    .join("");
}

function populateSelects() {
  const options = items
    .map((item) => `<option value="${item.name}">${item.name}</option>`)
    .join("");

  myItemSelect.innerHTML = options;
  theirItemSelect.innerHTML = options;

  myItemSelect.value = "Victorious";
  theirItemSelect.value = "Dragon";
}

function calculateTrade() {
  const mySelected = items.find((item) => item.name === myItemSelect.value);
  const theirSelected = items.find((item) => item.name === theirItemSelect.value);

  if (!mySelected || !theirSelected) {
    return;
  }

  const difference = Math.abs(mySelected.value - theirSelected.value);
  const average = (mySelected.value + theirSelected.value) / 2;
  const relative = (difference / average) * 100;

  let title = "Fair";
  let tone = "#34d399";
  let note = "Mübadilə balanslıdır.";

  if (relative > 20) {
    title = "Lose";
    tone = "#f87171";
    note = "Bu trade sizin üçün çox kasadlıdır.";
  } else if (relative > 8) {
    title = "Fair";
    tone = "#fbbf24";
    note = "Bir az fərq var, amma mübadilə düzgün görünür.";
  } else {
    title = "Win";
    tone = "#34d399";
    note = "Bu trade sizin üçün yaxşı görünür.";
  }

  tradeResult.innerHTML = `
    <span class="label">Nəticə</span>
    <strong style="color: ${tone}">${title}</strong>
    <small>${note}</small>
  `;
}

searchInput.addEventListener("input", renderTable);
categoryFilter.addEventListener("change", renderTable);
calcBtn.addEventListener("click", calculateTrade);
myItemSelect.addEventListener("change", calculateTrade);
theirItemSelect.addEventListener("change", calculateTrade);

populateSelects();
renderTable();
calculateTrade();
