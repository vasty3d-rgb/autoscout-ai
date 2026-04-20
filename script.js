const form = document.querySelector("#searchForm");
const queryInput = document.querySelector("#queryInput");
const regionInput = document.querySelector("#regionInput");
const budgetInput = document.querySelector("#budgetInput");
const yearInput = document.querySelector("#yearInput");
const priorityInput = document.querySelector("#priorityInput");
const resultsGrid = document.querySelector("#resultsGrid");
const sourceList = document.querySelector("#sourceList");
const cardTemplate = document.querySelector("#carCardTemplate");
const sortButtons = document.querySelectorAll(".sort-button");
const demoButton = document.querySelector("#demoButton");
const foundCount = document.querySelector("#foundCount");
const bestScore = document.querySelector("#bestScore");
const avgPrice = document.querySelector("#avgPrice");
const riskLevel = document.querySelector("#riskLevel");
const API_BASE = location.protocol === "file:" ? "http://localhost:8766" : "";

let currentSort = "score";
let currentResults = [];
let isLoading = false;

function formatPrice(value) {
  if (!value) return "цена не найдена";
  return new Intl.NumberFormat("ru-RU").format(value) + " ₽";
}

function formatMileage(value) {
  if (!value) return "пробег не найден";
  return new Intl.NumberFormat("ru-RU").format(value) + " км";
}

function setLoading(state) {
  isLoading = state;
  const button = form.querySelector(".primary-button span");
  button.textContent = state ? "Ищу на площадках..." : "Найти лучшие варианты";
  form.querySelector(".primary-button").disabled = state;
}

function getSearchParams() {
  const params = new URLSearchParams({
    query: queryInput.value.trim() || "Toyota Camry",
    region: regionInput.value,
    budget: budgetInput.value,
    year: yearInput.value,
    priority: priorityInput.value,
  });

  return params;
}

function sortResults(results) {
  return [...results].sort((a, b) => {
    if (currentSort === "price") return (a.price || Number.MAX_SAFE_INTEGER) - (b.price || Number.MAX_SAFE_INTEGER);
    if (currentSort === "year") return (b.year || 0) - (a.year || 0);
    return b.score - a.score;
  });
}

function statusText(source) {
  if (source.ok && source.count > 0) return `${source.count} найдено`;
  if (source.ok) return "страница доступна, карточки не распознаны";
  return source.message || "нет доступа к выдаче";
}

function renderSources(sources = []) {
  sourceList.innerHTML = "";

  sources.forEach((source) => {
    const item = document.createElement("article");
    item.className = "source-item";
    item.innerHTML = `
      <div>
        <strong>${source.source}</strong>
        <span>${statusText(source)}</span>
      </div>
      <a href="${source.url}" target="_blank" rel="noreferrer">открыть</a>
    `;
    sourceList.append(item);
  });
}

function renderBars(card, car) {
  const parts = car.scoreParts || {};
  const bars = [
    ["Цена", parts.price],
    ["Фото", parts.photo],
    ["Описание", parts.description],
    ["Возраст", parts.age],
  ].filter(([, value]) => typeof value === "number");

  const holder = card.querySelector(".score-bars");
  holder.innerHTML = "";

  bars.forEach(([label, value]) => {
    const row = document.createElement("div");
    row.className = "bar";
    row.innerHTML = `
      <span>${label}</span>
      <div class="track"><div class="fill" style="width: ${Math.round(value * 10)}%"></div></div>
      <strong>${value.toFixed(1)}</strong>
    `;
    holder.append(row);
  });
}

function renderEmpty(message, details = "") {
  resultsGrid.innerHTML = `
    <article class="car-card">
      <div class="car-body">
        <h3>${message}</h3>
        <p class="ai-summary">${details}</p>
      </div>
    </article>
  `;
}

function renderResults() {
  const sorted = sortResults(currentResults);
  resultsGrid.innerHTML = "";

  if (!sorted.length) {
    renderEmpty(
      "Объявления не получены",
      "Площадки могут отдавать CAPTCHA/антибот-страницу или менять разметку. Откройте ссылки слева для ручной проверки; для стабильного продакшена нужен официальный API, фид или партнерский доступ."
    );
    updateMetrics(sorted);
    return;
  }

  sorted.forEach((car) => {
    const card = cardTemplate.content.firstElementChild.cloneNode(true);
    const img = card.querySelector("img");
    const scoreBadge = card.querySelector(".score-badge");

    img.src = car.image || makePlaceholder(car.source);
    img.alt = car.title;
    card.querySelector(".source-badge").textContent = car.source;
    scoreBadge.textContent = `${car.score.toFixed(1)} / 10`;
    scoreBadge.classList.toggle("warn", car.score < 7.6);
    scoreBadge.classList.toggle("danger", car.score < 6.7);
    card.querySelector("h3").textContent = car.title;
    card.querySelector(".car-meta").textContent = `${car.year || "год не найден"} · ${formatMileage(car.mileage)} · ${car.source}`;
    card.querySelector(".price").textContent = formatPrice(car.price);
    card.querySelector(".price-comment").textContent = car.priceComment || "оценка цены";
    card.querySelector(".ai-summary").textContent = car.summary;
    card.querySelector(".open-link").href = car.url;
    card.querySelector(".open-link").textContent = "Открыть объявление";

    const tags = card.querySelector(".tags");
    (car.tags || []).forEach((tag) => {
      const tagElement = document.createElement("span");
      tagElement.className = "tag";
      tagElement.textContent = tag;
      tags.append(tagElement);
    });

    renderBars(card, car);
    resultsGrid.append(card);
  });

  updateMetrics(sorted);
}

function makePlaceholder(source) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="900" height="560" viewBox="0 0 900 560">
      <rect width="900" height="560" fill="#edf2f7"/>
      <rect x="165" y="250" width="570" height="90" rx="38" fill="#0f8b8d"/>
      <path d="M250 250h395l-70-86H330z" fill="#16202a"/>
      <circle cx="290" cy="360" r="48" fill="#16202a"/>
      <circle cx="610" cy="360" r="48" fill="#16202a"/>
      <text x="450" y="438" text-anchor="middle" fill="#66717d" font-family="Arial" font-size="32" font-weight="700">${source}</text>
    </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function updateMetrics(results) {
  const found = results.length;
  const best = found ? Math.max(...results.map((car) => car.score)) : 0;
  const prices = results.map((car) => car.price).filter(Boolean);
  const avg = prices.length ? prices.reduce((sum, price) => sum + price, 0) / prices.length : 0;
  const risk = best >= 8.2 ? "низкий" : best >= 7.2 ? "средний" : found ? "выше среднего" : "нет данных";

  foundCount.textContent = found;
  bestScore.textContent = best.toFixed(1);
  avgPrice.textContent = prices.length ? formatPrice(Math.round(avg)) : "нет данных";
  riskLevel.textContent = risk;
}

async function runSearch() {
  if (isLoading) return;
  setLoading(true);
  renderEmpty("Ищу объявления", "Запрашиваю Avito, Drom и Auto.ru. Обычно это занимает несколько секунд.");

  try {
    const response = await fetch(`${API_BASE}/api/search?${getSearchParams().toString()}`);
    if (!response.ok) throw new Error(`Ошибка сервера: ${response.status}`);
    const payload = await response.json();
    currentResults = payload.items || [];
    renderSources(payload.sources || []);
    renderResults();
  } catch (error) {
    currentResults = [];
    renderSources([]);
    renderEmpty("Поиск не запущен", `Откройте приложение через локальный сервер: http://localhost:8766. Детали: ${error.message}`);
    updateMetrics([]);
  } finally {
    setLoading(false);
  }
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  runSearch();
  document.querySelector("#results").scrollIntoView({ behavior: "smooth", block: "start" });
});

sortButtons.forEach((button) => {
  button.addEventListener("click", () => {
    sortButtons.forEach((item) => item.classList.remove("is-active"));
    button.classList.add("is-active");
    currentSort = button.dataset.sort;
    renderResults();
  });
});

resultsGrid.addEventListener("click", (event) => {
  const favoriteButton = event.target.closest(".favorite-button");
  if (!favoriteButton) return;
  favoriteButton.classList.toggle("is-active");
  favoriteButton.textContent = favoriteButton.classList.contains("is-active") ? "★" : "☆";
});

demoButton.textContent = "Живой поиск";
demoButton.addEventListener("click", () => {
  runSearch();
  document.querySelector("#results").scrollIntoView({ behavior: "smooth", block: "start" });
});

updateMetrics([]);
renderSources([]);
renderEmpty("Запустите живой поиск", "Нажмите кнопку поиска. Приложение обратится к реальным страницам площадок через локальный backend.");
