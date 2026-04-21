const carCatalog = {
  "Любая марка": ["Любая модель"],
  Toyota: ["Любая модель", "Camry", "Corolla", "RAV4", "Land Cruiser", "Prado", "Highlander", "C-HR", "Prius", "Auris", "Hilux"],
  Kia: ["Любая модель", "Rio", "K5", "Optima", "Sportage", "Sorento", "Ceed", "Cerato", "Seltos", "Soul", "Carnival"],
  Hyundai: ["Любая модель", "Solaris", "Elantra", "Sonata", "Tucson", "Santa Fe", "Creta", "Palisade", "i30", "Staria"],
  Volkswagen: ["Любая модель", "Polo", "Jetta", "Passat", "Tiguan", "Touareg", "Golf", "Teramont", "Taos", "Multivan"],
  Skoda: ["Любая модель", "Octavia", "Rapid", "Kodiaq", "Karoq", "Superb", "Fabia", "Yeti"],
  BMW: ["Любая модель", "3 Series", "5 Series", "7 Series", "X1", "X3", "X5", "X6", "X7", "M3", "M5"],
  Mercedes: ["Любая модель", "A-Class", "C-Class", "E-Class", "S-Class", "GLA", "GLC", "GLE", "GLS", "V-Class"],
  Audi: ["Любая модель", "A3", "A4", "A5", "A6", "A7", "A8", "Q3", "Q5", "Q7", "Q8"],
  Nissan: ["Любая модель", "Almera", "Teana", "Qashqai", "X-Trail", "Murano", "Pathfinder", "Juke", "Leaf"],
  Mazda: ["Любая модель", "Mazda3", "Mazda6", "CX-3", "CX-5", "CX-7", "CX-9", "MX-5"],
  Honda: ["Любая модель", "Civic", "Accord", "CR-V", "Pilot", "Fit", "HR-V", "Odyssey"],
  Lexus: ["Любая модель", "IS", "ES", "GS", "LS", "NX", "RX", "GX", "LX", "UX"],
  Mitsubishi: ["Любая модель", "Lancer", "ASX", "Outlander", "Pajero", "Pajero Sport", "Eclipse Cross", "L200"],
  Renault: ["Любая модель", "Logan", "Sandero", "Duster", "Kaptur", "Arkana", "Megane", "Fluence"],
  Ford: ["Любая модель", "Focus", "Mondeo", "Fiesta", "Kuga", "Explorer", "Mustang", "Transit"],
  Chevrolet: ["Любая модель", "Cruze", "Lacetti", "Aveo", "Captiva", "Tahoe", "Niva", "Trailblazer"],
  Lada: ["Любая модель", "Granta", "Vesta", "Largus", "Niva Legend", "Niva Travel", "XRAY", "Priora", "Kalina"],
  Geely: ["Любая модель", "Coolray", "Atlas", "Atlas Pro", "Monjaro", "Tugella", "Emgrand", "Okavango"],
  Chery: ["Любая модель", "Tiggo 4", "Tiggo 7", "Tiggo 8", "Arrizo 8", "Omoda C5", "Exeed TXL", "Exeed VX"],
  Haval: ["Любая модель", "Jolion", "F7", "F7x", "Dargo", "H9", "M6", "H5"],
  Subaru: ["Любая модель", "Impreza", "Legacy", "Outback", "Forester", "XV", "WRX", "Tribeca"],
  Volvo: ["Любая модель", "S60", "S80", "S90", "XC40", "XC60", "XC90", "V60", "V90"],
  Porsche: ["Любая модель", "Cayenne", "Macan", "Panamera", "911", "Taycan", "Boxster", "Cayman"],
};

const regions = [
  ["all", "Вся Россия"],
  ["moscow", "Москва и область"],
  ["spb", "Санкт-Петербург"],
  ["ekb", "Екатеринбург"],
  ["krasnodar", "Краснодарский край"],
  ["novosibirsk", "Новосибирская область"],
  ["nnovgorod", "Нижегородская область"],
  ["kazan", "Республика Татарстан"],
  ["samara", "Самарская область"],
  ["rostov", "Ростовская область"],
  ["bashkortostan", "Республика Башкортостан"],
  ["chelyabinsk", "Челябинская область"],
  ["perm", "Пермский край"],
  ["krasnoyarsk", "Красноярский край"],
  ["voronezh", "Воронежская область"],
  ["volgograd", "Волгоградская область"],
  ["saratov", "Саратовская область"],
  ["tyumen", "Тюменская область"],
  ["irkutsk", "Иркутская область"],
  ["primorsky", "Приморский край"],
  ["stavropol", "Ставропольский край"],
  ["omsk", "Омская область"],
  ["ufa", "Уфа"],
  ["sochi", "Сочи"],
  ["kaliningrad", "Калининградская область"],
  ["crimea", "Республика Крым"],
];

const form = document.querySelector("#searchForm");
const brandInput = document.querySelector("#brandInput");
const modelInput = document.querySelector("#modelInput");
const queryInput = document.querySelector("#queryInput");
const regionInput = document.querySelector("#regionInput");
const radiusInput = document.querySelector("#radiusInput");
const priceMinInput = document.querySelector("#priceMinInput");
const budgetInput = document.querySelector("#budgetInput");
const priceMinNumber = document.querySelector("#priceMinNumber");
const budgetNumber = document.querySelector("#budgetNumber");
const priceRangeLabel = document.querySelector("#priceRangeLabel");
const priceRangeFill = document.querySelector("#priceRangeFill");
const pricePresetButtons = document.querySelectorAll("[data-price-max]");
const yearInput = document.querySelector("#yearInput");
const yearToInput = document.querySelector("#yearToInput");
const mileageInput = document.querySelector("#mileageInput");
const priorityInput = document.querySelector("#priorityInput");
const bodyInput = document.querySelector("#bodyInput");
const transmissionInput = document.querySelector("#transmissionInput");
const engineInput = document.querySelector("#engineInput");
const driveInput = document.querySelector("#driveInput");
const powerMinInput = document.querySelector("#powerMinInput");
const volumeInput = document.querySelector("#volumeInput");
const sellerInput = document.querySelector("#sellerInput");
const ownersInput = document.querySelector("#ownersInput");
const conditionInput = document.querySelector("#conditionInput");
const sourceInput = document.querySelector("#sourceInput");
const searchPreview = document.querySelector("#searchPreview");
const resultsGrid = document.querySelector("#resultsGrid");
const sourceList = document.querySelector("#sourceList");
const cardTemplate = document.querySelector("#carCardTemplate");
const sortButtons = document.querySelectorAll(".sort-button");
const filterTabs = document.querySelectorAll(".filter-tab");
const filterPages = document.querySelectorAll(".filter-page");
const demoButton = document.querySelector("#demoButton");
const resetFilters = document.querySelector("#resetFilters");
const foundCount = document.querySelector("#foundCount");
const bestScore = document.querySelector("#bestScore");
const avgPrice = document.querySelector("#avgPrice");
const riskLevel = document.querySelector("#riskLevel");
const API_BASE = location.protocol === "file:" ? "http://localhost:8766" : "";

let currentSort = "score";
let currentResults = [];
let isLoading = false;

function fillSelect(select, items, selectedValue) {
  select.innerHTML = "";
  items.forEach((item) => {
    const option = document.createElement("option");
    if (Array.isArray(item)) {
      option.value = item[0];
      option.textContent = item[1];
    } else {
      option.value = item;
      option.textContent = item;
    }
    select.append(option);
  });
  if (selectedValue) select.value = selectedValue;
}

function initFilters() {
  fillSelect(brandInput, Object.keys(carCatalog), "Toyota");
  fillSelect(regionInput, regions, "moscow");

  const years = ["", ...Array.from({ length: 33 }, (_, index) => String(2026 - index))];
  fillSelect(yearInput, years.map((year) => year ? [year, year] : ["", "Любой"]), "2018");
  fillSelect(yearToInput, years.map((year) => year ? [year, year] : ["", "Любой"]), "");
  updateModels("Camry");
  updatePreview();
}

function updateModels(selectedModel) {
  const models = carCatalog[brandInput.value] || ["Любая модель"];
  fillSelect(modelInput, models, selectedModel || models[0]);
}

function getVehicleQuery() {
  const brand = brandInput.value === "Любая марка" ? "" : brandInput.value;
  const model = modelInput.value === "Любая модель" ? "" : modelInput.value;
  const freeText = queryInput.value.trim();
  const technical = [
    bodyInput.value,
    transmissionInput.value,
    engineInput.value,
    driveInput.value,
    sellerInput.value,
    conditionInput.value,
  ].filter(Boolean);

  return [brand, model, freeText, ...technical].filter(Boolean).join(" ").replace(/\s+/g, " ").trim() || "автомобиль";
}

function getSearchParams() {
  const params = new URLSearchParams({
    query: getVehicleQuery(),
    region: regionInput.value,
    budget: budgetInput.value || "",
    year: yearInput.value || "",
    priority: priorityInput.value,
    sources: sourceInput.value,
    radius: radiusInput.value,
    priceMin: priceMinInput.value || "",
    yearTo: yearToInput.value || "",
    mileageMax: mileageInput.value || "",
    ownersMax: ownersInput.value || "",
    powerMin: powerMinInput.value || "",
    volumeMax: volumeInput.value || "",
  });

  return params;
}

function formatPrice(value) {
  if (!value) return "цена не найдена";
  return new Intl.NumberFormat("ru-RU").format(value) + " ₽";
}

function formatMileage(value) {
  if (!value) return "пробег не найден";
  return new Intl.NumberFormat("ru-RU").format(value) + " км";
}

function formatCompactPrice(value) {
  if (!value) return "любая цена";
  const number = Number(value);
  if (number >= 1000000) return `до ${(number / 1000000).toFixed(number % 1000000 ? 1 : 0)} млн ₽`;
  return `до ${new Intl.NumberFormat("ru-RU").format(number)} ₽`;
}

function formatShortRub(value) {
  const number = Number(value || 0);
  if (number === 0) return "0 ₽";
  if (number >= 1000000) return `${(number / 1000000).toFixed(number % 1000000 ? 1 : 0)} млн ₽`;
  return `${new Intl.NumberFormat("ru-RU").format(number)} ₽`;
}

function syncPriceRange(source) {
  let min = Number(priceMinInput.value || 0);
  let max = Number(budgetInput.value || 0);

  if (source === "min" && min > max) max = min;
  if (source === "max" && max < min) min = max;

  priceMinInput.value = min;
  budgetInput.value = max;
  priceMinNumber.value = min;
  budgetNumber.value = max;

  const rangeMax = Number(budgetInput.max);
  const left = (min / rangeMax) * 100;
  const right = 100 - (max / rangeMax) * 100;
  priceRangeFill.style.left = `${left}%`;
  priceRangeFill.style.right = `${right}%`;
  priceRangeLabel.textContent = `${formatShortRub(min)} - ${formatShortRub(max)}`;
  updatePreview();
}

function syncPriceFromNumbers(source) {
  const maxAllowed = Number(budgetInput.max);
  let min = Math.max(0, Math.min(maxAllowed, Number(priceMinNumber.value || 0)));
  let max = Math.max(0, Math.min(maxAllowed, Number(budgetNumber.value || 0)));

  if (source === "min" && min > max) max = min;
  if (source === "max" && max < min) min = max;

  priceMinInput.value = min;
  budgetInput.value = max;
  syncPriceRange(source);
}

function getRegionLabel() {
  return regions.find(([value]) => value === regionInput.value)?.[1] || "Вся Россия";
}

function updatePreview() {
  const brand = brandInput.value === "Любая марка" ? "Любая марка" : brandInput.value;
  const model = modelInput.value === "Любая модель" ? "" : modelInput.value;
  const radius = radiusInput.value === "all" ? "вся Россия" : radiusInput.value === "0" ? "без радиуса" : `+${radiusInput.value} км`;
  const parts = [
    `${brand}${model ? ` ${model}` : ""}`,
    getRegionLabel(),
    radius,
    formatCompactPrice(budgetInput.value),
    yearInput.value ? `от ${yearInput.value}` : "",
  ].filter(Boolean);
  searchPreview.textContent = parts.join(" · ");
}

function setLoading(state) {
  isLoading = state;
  const button = form.querySelector(".primary-button span");
  button.textContent = state ? "Собираю объявления..." : "Показать лучшие объявления";
  form.querySelector(".primary-button").disabled = state;
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

  if (!sources.length) {
    sourceList.innerHTML = `<article class="source-item"><div><strong>Ожидание</strong><span>Запустите поиск, чтобы увидеть статус площадок</span></div></article>`;
    return;
  }

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
    <article class="car-card empty-card">
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
      "Попробуйте расширить регион, радиус или бюджет. Если площадка закрывает выдачу антиботом, слева появится прямая ссылка для ручной проверки."
    );
    updateMetrics(sorted);
    return;
  }

  sorted.forEach((car) => {
    const card = cardTemplate.content.firstElementChild.cloneNode(true);
    const img = card.querySelector("img");
    const scoreBadge = card.querySelector(".score-badge");

    card.dataset.resultIndex = String(currentResults.indexOf(car));
    img.src = getDisplayImage(car);
    img.alt = car.title;
    img.onerror = () => {
      img.onerror = null;
      img.src = makePlaceholder(car.source);
    };
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

    const tags = card.querySelector(".tags");
    (car.tags || []).forEach((tag) => {
      const tagElement = document.createElement("span");
      tagElement.className = "tag";
      tagElement.textContent = tag;
      tags.append(tagElement);
    });

    renderAssistantReview(card, car);
    renderDeepAnalysis(card, car.deepAnalysis);
    renderBars(card, car);
    resultsGrid.append(card);
  });

  updateMetrics(sorted);
}

function renderAssistantReview(card, car) {
  const review = car.assistantReview || {};
  const holder = card.querySelector(".assistant-review");
  const decisionClass = getDecisionClass(review.decision);

  holder.innerHTML = `
    <div class="review-verdict ${decisionClass}">
      <span>${review.decision || "AI-разбор"}</span>
      <p>${review.verdict || "Недостаточно данных для подробного разбора."}</p>
    </div>
    ${renderReviewList("Почему стоит смотреть", review.reasons)}
    ${renderReviewList("Риски", review.risks)}
    ${renderReviewList("Проверить на осмотре", review.checks)}
    ${renderReviewList("Спросить продавца", review.questions)}
    <div class="review-recommendation">
      <strong>Рекомендация</strong>
      <p>${review.recommendation || "Сравните с похожими объявлениями и проверьте документы."}</p>
    </div>
  `;
}

function renderDeepAnalysis(card, analysis) {
  const holder = card.querySelector(".deep-analysis");

  if (!analysis) {
    holder.innerHTML = "";
    return;
  }

  holder.innerHTML = `
    <div class="analysis-head">
      <span class="analysis-pill">${escapeHtml(analysis.decision || "Разбор готов")}</span>
      <strong>${escapeHtml(analysis.verdict || "Глубокий анализ объявления")}</strong>
      <p>${escapeHtml(analysis.summary || "Собрал риски, вопросы продавцу и примерные расходы на обслуживание.")}</p>
    </div>
    <div class="analysis-grid">
      ${renderAnalysisBlock("Почему можно смотреть", analysis.buySignals)}
      ${renderAnalysisBlock("Риски и сомнения", analysis.risks)}
      ${renderAnalysisBlock("Что проверить", analysis.inspectionPlan)}
      ${renderAnalysisBlock("Вопросы продавцу", analysis.whatToAsk)}
      ${renderAnalysisBlock("Возможные вложения", analysis.likelyRepairs)}
      ${renderAnalysisBlock("Обслуживание", analysis.maintenanceEstimate)}
    </div>
    <div class="analysis-note">
      <strong>Итог</strong>
      <p>${escapeHtml(analysis.finalAdvice || "Перед покупкой обязательно проверьте VIN, документы и сделайте диагностику в профильном сервисе.")}</p>
    </div>
  `;
}

function renderAnalysisBlock(title, items = []) {
  if (!items.length) return "";
  return `
    <section class="analysis-block">
      <strong>${escapeHtml(title)}</strong>
      <ul>
        ${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
      </ul>
    </section>
  `;
}

function renderReviewList(title, items = []) {
  if (!items.length) return "";
  return `
    <div class="review-block">
      <strong>${title}</strong>
      <ul>
        ${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
      </ul>
    </div>
  `;
}

async function analyzeListing(card, button) {
  const index = Number(card.dataset.resultIndex);
  const car = currentResults[index];
  const panel = card.querySelector(".deep-analysis");

  if (!car) return;

  if (car.deepAnalysis) {
    const isHidden = panel.hidden;
    panel.hidden = !isHidden;
    button.classList.toggle("is-active", isHidden);
    button.textContent = isHidden ? "Скрыть анализ" : "Проанализировать";
    return;
  }

  button.disabled = true;
  button.textContent = "Анализирую...";
  panel.hidden = false;
  panel.innerHTML = `
    <div class="analysis-loading">
      <strong>Смотрю объявление глубже</strong>
      <p>Пытаюсь получить публичное описание, сверяю цену, пробег, фото и типичные расходы по модели.</p>
    </div>
  `;

  try {
    const response = await fetch(`${API_BASE}/api/analyze`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        item: car,
        filters: Object.fromEntries(getSearchParams()),
      }),
    });

    if (!response.ok) throw new Error(`Ошибка сервера: ${response.status}`);
    const payload = await response.json();
    car.deepAnalysis = payload.analysis;
    renderDeepAnalysis(card, car.deepAnalysis);
    button.classList.add("is-active");
    button.textContent = "Скрыть анализ";
  } catch (error) {
    panel.innerHTML = `
      <div class="analysis-loading is-error">
        <strong>Не удалось разобрать объявление</strong>
        <p>${escapeHtml(error.message)}. Откройте объявление вручную и попробуйте позже.</p>
      </div>
    `;
    button.textContent = "Проанализировать";
  } finally {
    button.disabled = false;
  }
}

function getDecisionClass(decision = "") {
  if (decision.includes("Сильный")) return "is-good";
  if (decision.includes("рассматривать")) return "is-ok";
  if (decision.includes("проверки")) return "is-warn";
  return "is-risk";
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function makePlaceholder(source) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="900" height="560" viewBox="0 0 900 560">
      <rect width="900" height="560" fill="#eef1f4"/>
      <rect x="165" y="250" width="570" height="90" rx="38" fill="#e34d4d"/>
      <path d="M250 250h395l-70-86H330z" fill="#17212b"/>
      <circle cx="290" cy="360" r="48" fill="#17212b"/>
      <circle cx="610" cy="360" r="48" fill="#17212b"/>
      <text x="450" y="438" text-anchor="middle" fill="#66717d" font-family="Arial" font-size="32" font-weight="700">${source}</text>
    </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function getDisplayImage(car) {
  if (!car.image) return makePlaceholder(car.source);
  return `${API_BASE}/api/image?url=${encodeURIComponent(car.image)}`;
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
  renderEmpty("Собираю выдачу", "Запрашиваю площадки и пересчитываю рейтинг под выбранные фильтры.");

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
    renderEmpty("Поиск не запущен", `Проверьте, что локальный сервер работает на http://localhost:8766. Детали: ${error.message}`);
    updateMetrics([]);
  } finally {
    setLoading(false);
  }
}

function resetToDefault() {
  brandInput.value = "Toyota";
  updateModels("Camry");
  queryInput.value = "";
  regionInput.value = "moscow";
  radiusInput.value = "100";
  priceMinInput.value = "0";
  budgetInput.value = "2500000";
  priceMinNumber.value = "0";
  budgetNumber.value = "2500000";
  yearInput.value = "2018";
  yearToInput.value = "";
  mileageInput.value = "";
  priorityInput.value = "balanced";
  bodyInput.value = "";
  transmissionInput.value = "";
  engineInput.value = "";
  driveInput.value = "";
  powerMinInput.value = "";
  volumeInput.value = "";
  sellerInput.value = "";
  ownersInput.value = "";
  conditionInput.value = "";
  sourceInput.value = "avito,drom,autoRu";
  syncPriceRange("max");
}

brandInput.addEventListener("change", () => {
  updateModels();
  updatePreview();
});

modelInput.addEventListener("change", updatePreview);
priceMinInput.addEventListener("input", () => syncPriceRange("min"));
budgetInput.addEventListener("input", () => syncPriceRange("max"));
priceMinNumber.addEventListener("input", () => syncPriceFromNumbers("min"));
budgetNumber.addEventListener("input", () => syncPriceFromNumbers("max"));
pricePresetButtons.forEach((button) => {
  button.addEventListener("click", () => {
    priceMinInput.value = "0";
    budgetInput.value = button.dataset.priceMax;
    syncPriceRange("max");
  });
});

form.addEventListener("input", updatePreview);
form.addEventListener("change", updatePreview);

form.addEventListener("submit", (event) => {
  event.preventDefault();
  runSearch();
  document.querySelector("#results").scrollIntoView({ behavior: "smooth", block: "start" });
});

filterTabs.forEach((button) => {
  button.addEventListener("click", () => {
    filterTabs.forEach((tab) => tab.classList.remove("is-active"));
    filterPages.forEach((page) => page.classList.remove("is-active"));
    button.classList.add("is-active");
    document.querySelector(`[data-page="${button.dataset.tab}"]`).classList.add("is-active");
  });
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
  const reviewButton = event.target.closest(".review-toggle");
  if (reviewButton) {
    const card = reviewButton.closest(".car-card");
    const panel = card.querySelector(".assistant-review");
    const isHidden = panel.hidden;
    panel.hidden = !isHidden;
    reviewButton.classList.toggle("is-active", isHidden);
    reviewButton.textContent = isHidden ? "Скрыть разбор" : "Разбор AI";
    return;
  }

  const analyzeButton = event.target.closest(".deep-analyze-button");
  if (analyzeButton) {
    const card = analyzeButton.closest(".car-card");
    analyzeListing(card, analyzeButton);
    return;
  }

  const favoriteButton = event.target.closest(".favorite-button");
  if (!favoriteButton) return;
  favoriteButton.classList.toggle("is-active");
  favoriteButton.textContent = favoriteButton.classList.contains("is-active") ? "★" : "☆";
});

demoButton.addEventListener("click", () => {
  runSearch();
  document.querySelector("#results").scrollIntoView({ behavior: "smooth", block: "start" });
});

resetFilters.addEventListener("click", resetToDefault);

initFilters();
syncPriceRange("max");
updateMetrics([]);
renderSources([]);
renderEmpty("Настройте фильтр", "Выберите марку, модель, регион и бюджет. После запуска здесь появится короткий список лучших объявлений.");
