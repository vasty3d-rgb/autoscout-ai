const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
let sharp;

try {
  sharp = require("sharp");
} catch {
  sharp = require("C:/Users/User5/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp");
}

const PORT = Number(process.env.PORT || 8766);
const ROOT = __dirname;

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
};

const regions = {
  all: {
    label: "Вся Россия",
    avito: "rossiya",
    drom: "",
    autoRu: "",
  },
  moscow: {
    label: "Москва и область",
    avito: "moskva",
    drom: "moscow",
    autoRu: "moskva",
  },
  spb: {
    label: "Санкт-Петербург",
    avito: "sankt-peterburg",
    drom: "spb",
    autoRu: "sankt-peterburg",
  },
  krasnodar: {
    label: "Краснодарский край",
    avito: "krasnodarskiy_kray",
    drom: "krasnodar",
    autoRu: "krasnodar",
  },
  ekb: {
    label: "Екатеринбург",
    avito: "ekaterinburg",
    drom: "ekaterinburg",
    autoRu: "ekaterinburg",
  },
};

const sources = {
  avito: {
    name: "Avito",
    buildUrl(params) {
      const region = regions[params.region]?.avito || regions.all.avito;
      const url = new URL(`https://www.avito.ru/${region}/avtomobili`);
      url.searchParams.set("q", params.query);
      if (params.budget) url.searchParams.set("pmax", params.budget);
      return url.toString();
    },
  },
  drom: {
    name: "Drom",
    buildUrl(params) {
      const region = regions[params.region]?.drom;
      const host = region ? `${region}.drom.ru` : "auto.drom.ru";
      const vehiclePath = buildVehiclePath(params.query);
      const url = new URL(`https://${host}/${vehiclePath}`);
      url.searchParams.set("keywords", params.query);
      if (params.budget) url.searchParams.set("maxprice", params.budget);
      if (params.year) url.searchParams.set("minyear", params.year);
      return url.toString();
    },
  },
  autoRu: {
    name: "Auto.ru",
    buildUrl(params) {
      const region = regions[params.region]?.autoRu;
      const vehiclePath = buildVehiclePath(params.query);
      const base = region ? `https://auto.ru/${region}/cars/${vehiclePath}used/` : `https://auto.ru/cars/${vehiclePath}used/`;
      const url = new URL(base);
      url.searchParams.set("text", params.query);
      if (params.budget) url.searchParams.set("price_to", params.budget);
      if (params.year) url.searchParams.set("year_from", params.year);
      return url.toString();
    },
  },
};

const brandAliases = {
  toyota: "toyota",
  тойота: "toyota",
  kia: "kia",
  киа: "kia",
  mazda: "mazda",
  мазда: "mazda",
  hyundai: "hyundai",
  хендай: "hyundai",
  хундай: "hyundai",
  skoda: "skoda",
  шкода: "skoda",
  volkswagen: "volkswagen",
  vw: "volkswagen",
  bmw: "bmw",
  mercedes: "mercedes",
  mercedesbenz: "mercedes",
  audi: "audi",
  nissan: "nissan",
  honda: "honda",
  lada: "vaz",
  ваз: "vaz",
};

const modelAliases = {
  camry: "camry",
  камри: "camry",
  rav4: "rav_4",
  "rav-4": "rav_4",
  k5: "k5",
  rio: "rio",
  sportage: "sportage",
  cx5: "cx_5",
  "cx-5": "cx_5",
  tucson: "tucson",
  solaris: "solaris",
  octavia: "octavia",
  tiguan: "tiguan",
  polo: "polo",
  passat: "passat",
  x5: "x5",
  x3: "x3",
  qashqai: "qashqai",
};

function buildVehiclePath(query) {
  const tokens = cleanText(query)
    .toLowerCase()
    .replace(/[^\p{L}\p{N}-]+/gu, " ")
    .split(/\s+/)
    .filter(Boolean);
  const normalized = tokens.map((token) => token.replace(/[^a-zа-яё0-9-]/gi, ""));
  const brand = normalized.map((token) => brandAliases[token]).find(Boolean);
  const model = normalized.map((token) => modelAliases[token]).find(Boolean);

  if (brand && model) return `${brand}/${model}/`;
  if (brand) return `${brand}/`;
  return "";
}

function sendJson(response, status, payload) {
  response.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    "access-control-allow-origin": "*",
  });
  response.end(JSON.stringify(payload));
}

function serveStatic(request, response) {
  const url = new URL(request.url, `http://${request.headers.host}`);
  const pathname = decodeURIComponent(url.pathname === "/" ? "/index.html" : url.pathname);
  const fullPath = path.resolve(ROOT, `.${pathname}`);

  if (!fullPath.startsWith(ROOT)) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  fs.readFile(fullPath, (error, data) => {
    if (error) {
      response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
      response.end("Not found");
      return;
    }

    response.writeHead(200, { "content-type": mimeTypes[path.extname(fullPath)] || "application/octet-stream" });
    response.end(data);
  });
}

function cleanText(value = "") {
  return String(value)
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&quot;/g, "\"")
    .replace(/&amp;/g, "&")
    .replace(/&#x2F;/g, "/")
    .replace(/\s+/g, " ")
    .trim();
}

function absoluteUrl(sourceUrl, maybeUrl) {
  if (!maybeUrl) return "";
  try {
    return new URL(maybeUrl, sourceUrl).toString();
  } catch {
    return "";
  }
}

function imageUrlFrom(value) {
  if (!value) return "";
  if (Array.isArray(value)) return imageUrlFrom(value[0]);
  if (typeof value === "object") return value.contentUrl || value.url || "";
  return value;
}

function numberFromText(value = "") {
  const match = String(value).replace(/\s/g, "").match(/\d{4,}/);
  return match ? Number(match[0]) : null;
}

function parseLdJson(html, sourceName, sourceUrl) {
  const items = [];
  const scripts = html.match(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi) || [];

  for (const script of scripts) {
    const body = script.replace(/^<script[^>]*>/i, "").replace(/<\/script>$/i, "").trim();
    try {
      const parsed = JSON.parse(body);
      collectLdItems(parsed, items, sourceName, sourceUrl);
    } catch {
      // Some pages include malformed JSON-LD. Generic parsing below can still find cards.
    }
  }

  return items;
}

function collectLdItems(node, items, sourceName, sourceUrl) {
  if (!node || typeof node !== "object") return;

  if (Array.isArray(node)) {
    node.forEach((child) => collectLdItems(child, items, sourceName, sourceUrl));
    return;
  }

  if (Array.isArray(node.itemListElement)) {
    node.itemListElement.forEach((entry) => collectLdItems(entry.item || entry, items, sourceName, sourceUrl));
  }

  const type = Array.isArray(node["@type"]) ? node["@type"].join(" ") : node["@type"];
  const offer = Array.isArray(node.offers) ? node.offers[0] : node.offers;
  const image = imageUrlFrom(node.image || offer?.image);
  const imageName = cleanText((typeof node.image === "object" && !Array.isArray(node.image) ? node.image.name : "") || (typeof offer?.image === "object" ? offer.image.name : ""));
  const title = cleanText(node.name || node.title || imageName);
  const price = numberFromText(offer?.price || node.price || node.description);

  if (title && /car|vehicle|product|offer/i.test(type || "") && (price || node.url)) {
    items.push({
      id: `${sourceName}-${items.length}-${title}`,
      title,
      source: sourceName,
      url: absoluteUrl(sourceUrl, node.url || offer?.url),
      image: absoluteUrl(sourceUrl, image),
      price,
      year: numberFromText(title.match(/\b(19|20)\d{2}\b/)?.[0]),
      mileage: numberFromText(node.mileageFromOdometer?.value || node.description),
      description: cleanText(node.description),
    });
  }

  Object.values(node).forEach((child) => {
    if (child && typeof child === "object") collectLdItems(child, items, sourceName, sourceUrl);
  });
}

function parseGenericCards(html, sourceName, sourceUrl) {
  const items = [];
  const linkPattern = /<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]{80,2400}?)<\/a>/gi;
  let match;

  while ((match = linkPattern.exec(html)) && items.length < 25) {
    const href = match[1];
    const body = match[2];
    const text = cleanText(body);
    const price = numberFromText(text.match(/[\d\s]{5,12}\s*(?:₽|руб|р\.|р\b)/i)?.[0] || "");
    const year = numberFromText(text.match(/\b(19|20)\d{2}\b/)?.[0] || "");

    if (!price || !year || text.length < 18) continue;
    if (!/toyota|kia|mazda|hyundai|skoda|volkswagen|bmw|mercedes|audi|nissan|honda|lada|ford|renault|camry|rav4|tiguan|octavia|солярис|рио|кроссовер|седан/i.test(text)) continue;

    const imageMatch = body.match(/<img[^>]+(?:src|data-src)=["']([^"']+)["']/i);
    const title = text
      .replace(/[\d\s]{5,12}\s*(?:₽|руб|р\.|р\b).*/i, "")
      .slice(0, 90)
      .trim();

    if (!title) continue;

    items.push({
      id: `${sourceName}-${items.length}-${href}`,
      title,
      source: sourceName,
      url: absoluteUrl(sourceUrl, href),
      image: absoluteUrl(sourceUrl, imageMatch?.[1]),
      price,
      year,
      mileage: numberFromText(text.match(/[\d\s]{2,9}\s*(?:км|km)/i)?.[0] || ""),
      description: text.slice(0, 260),
    });
  }

  return items;
}

function parseJsonOfferSnippets(html, sourceName, sourceUrl) {
  const items = [];
  const pattern = /"@type"\s*:\s*"Offer"[\s\S]{0,900}?"contentUrl"\s*:\s*"([^"]+)"[\s\S]{0,500}?"name"\s*:\s*"([^"]+)"[\s\S]{0,900}?"url"\s*:\s*"([^"]+)"[\s\S]{0,500}?"price"\s*:\s*(\d+)/gi;
  let match;

  while ((match = pattern.exec(html)) && items.length < 40) {
    const title = decodeJsonString(match[2]);
    items.push({
      id: `${sourceName}-json-${items.length}-${match[3]}`,
      title,
      source: sourceName,
      url: absoluteUrl(sourceUrl, decodeJsonString(match[3])),
      image: absoluteUrl(sourceUrl, decodeJsonString(match[1])),
      price: Number(match[4]),
      year: numberFromText(title.match(/\b(19|20)\d{2}\b/)?.[0]),
      mileage: null,
      description: title,
    });
  }

  return items;
}

function decodeJsonString(value) {
  try {
    return JSON.parse(`"${value.replace(/"/g, '\\"')}"`);
  } catch {
    return value;
  }
}

function normalizeItems(items, params) {
  const seen = new Set();
  const budget = Number(params.budget || 0);
  const minYear = Number(params.year || 0);

  return items
    .filter((item) => item.title && item.url)
    .filter((item) => isRelevantToQuery(item, params.query))
    .filter((item) => !item.price || !budget || item.price <= budget)
    .filter((item) => !item.year || !minYear || item.year >= minYear)
    .filter((item) => {
      const key = `${item.source}:${item.url}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 36)
    .map((item) => applyScore(item, params));
}

function applyScore(item, params) {
  const score = scoreCar(item, params);
  return {
    ...item,
    score: score.total,
    scoreParts: score.parts,
    priceComment: score.priceComment,
    summary: buildSummary(item, score),
    tags: buildTags(item, score),
  };
}

function median(values) {
  const sorted = values.filter(Boolean).sort((a, b) => a - b);
  if (!sorted.length) return null;
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

function scoreCar(item, params) {
  const budget = Number(params.budget || 0);
  const minYear = Number(params.year || 2015);
  const ageScore = item.year ? Math.min(9.4, Math.max(5.2, 10 - (new Date().getFullYear() - item.year) * 0.32)) : 6.7;
  const mileageScore = item.mileage ? Math.min(9.2, Math.max(4.8, 10 - item.mileage / 28000)) : 6.8;
  const photoScore = getPhotoScore(item);
  const descriptionScore = item.description?.length > 120 ? 7.8 : 6.2;
  const priceScore = item.price && budget ? Math.min(9.3, Math.max(5.2, 8.7 - Math.max(0, item.price - budget * 0.92) / budget * 6)) : 6.8;
  const sourceTrust = item.source === "Auto.ru" ? 7.8 : item.source === "Drom" ? 7.6 : 7.2;
  const freshBonus = item.year && item.year >= minYear + 3 ? 0.25 : 0;

  const total = priceScore * 0.28 + photoScore * 0.22 + descriptionScore * 0.16 + ageScore * 0.18 + mileageScore * 0.1 + sourceTrust * 0.06 + freshBonus;

  return {
    total: Math.max(4.5, Math.min(9.8, total)),
    parts: {
      price: priceScore,
      photo: photoScore,
      description: descriptionScore,
      age: ageScore,
    },
    priceComment: item.price && budget && item.price < budget * 0.9 ? "ниже бюджета" : "в рамках фильтра",
  };
}

function getPhotoScore(item) {
  if (item.photoAnalysis?.score) return item.photoAnalysis.score;
  if (item.image) return 6.9;
  return 5.2;
}

async function enrichWithVision(items, params) {
  const limit = 18;
  const enriched = [];
  let analyzed = 0;

  for (const item of items) {
    if (item.image && analyzed < limit) {
      analyzed += 1;
      enriched.push({
        ...item,
        photoAnalysis: await analyzeImage(item.image),
      });
    } else {
      enriched.push(item);
    }
  }

  return enriched.map((item) => applyScore(item, params));
}

async function analyzeImage(imageUrl) {
  try {
    const response = await fetchImageWithTimeout(imageUrl);
    if (!response.ok) throw new Error(`image status ${response.status}`);

    const buffer = Buffer.from(await response.arrayBuffer());
    const meta = await sharp(buffer).metadata();
    const resized = sharp(buffer)
      .rotate()
      .resize({ width: 160, height: 120, fit: "inside", withoutEnlargement: true })
      .removeAlpha()
      .raw();
    const { data, info } = await resized.toBuffer({ resolveWithObject: true });
    const metrics = getImageMetrics(data, info, meta);
    const score = scoreImageMetrics(metrics);

    return {
      ok: true,
      score,
      ...metrics,
      label: describeImageMetrics(metrics, score),
    };
  } catch (error) {
    return {
      ok: false,
      score: 5.9,
      label: "фото не удалось проанализировать локально",
      error: error.message,
    };
  }
}

function getImageMetrics(data, info, meta) {
  const pixels = info.width * info.height;
  const channels = info.channels;
  let sum = 0;
  let sumSquares = 0;
  let saturationSum = 0;
  let dark = 0;
  let bright = 0;
  const luma = new Float32Array(pixels);

  for (let i = 0, p = 0; i < data.length; i += channels, p += 1) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const y = 0.299 * r + 0.587 * g + 0.114 * b;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    luma[p] = y;
    sum += y;
    sumSquares += y * y;
    saturationSum += max === 0 ? 0 : (max - min) / max;
    if (y < 38) dark += 1;
    if (y > 232) bright += 1;
  }

  const mean = sum / pixels;
  const variance = Math.max(0, sumSquares / pixels - mean * mean);
  const contrast = Math.sqrt(variance);
  let gradient = 0;
  let gradientCount = 0;

  for (let y = 1; y < info.height; y += 1) {
    for (let x = 1; x < info.width; x += 1) {
      const idx = y * info.width + x;
      gradient += Math.abs(luma[idx] - luma[idx - 1]) + Math.abs(luma[idx] - luma[idx - info.width]);
      gradientCount += 2;
    }
  }

  return {
    width: meta.width || info.width,
    height: meta.height || info.height,
    brightness: mean,
    contrast,
    sharpness: gradient / Math.max(1, gradientCount),
    saturation: saturationSum / pixels,
    darkShare: dark / pixels,
    brightShare: bright / pixels,
  };
}

function scoreImageMetrics(metrics) {
  const brightnessScore = 10 - Math.min(5, Math.abs(metrics.brightness - 128) / 18);
  const contrastScore = Math.min(10, Math.max(4.5, metrics.contrast / 7.5));
  const sharpnessScore = Math.min(10, Math.max(4.5, metrics.sharpness / 2.2));
  const sizeScore = Math.min(10, Math.max(5, Math.sqrt(metrics.width * metrics.height) / 95));
  const exposurePenalty = Math.min(1.6, (metrics.darkShare + metrics.brightShare) * 3.2);
  const score = brightnessScore * 0.24 + contrastScore * 0.24 + sharpnessScore * 0.32 + sizeScore * 0.2 - exposurePenalty;

  return Math.max(4.8, Math.min(9.4, score));
}

function describeImageMetrics(metrics, score) {
  const notes = [];
  notes.push(score >= 8 ? "фото четкое и информативное" : score >= 6.8 ? "фото пригодно для первичной оценки" : "фото слабое для оценки состояния");
  if (metrics.brightness < 75) notes.push("темновато");
  if (metrics.brightness > 190) notes.push("пересвет");
  if (metrics.contrast < 28) notes.push("низкий контраст");
  if (metrics.sharpness < 9) notes.push("возможна смазанность");
  return notes.join(", ");
}

async function fetchImageWithTimeout(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(url, {
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
        "user-agent": "Mozilla/5.0",
      },
    });
    clearTimeout(timer);
    return response;
  } catch (error) {
    clearTimeout(timer);
    throw error;
  }
}

function isRelevantToQuery(item, query) {
  const rawTerms = cleanText(query)
    .toLowerCase()
    .replace(/[^\p{L}\p{N}-]+/gu, " ")
    .split(/\s+/)
    .filter((term) => term.length > 1);
  const terms = new Set(rawTerms);

  rawTerms.forEach((term) => {
    if (brandAliases[term]) terms.add(brandAliases[term]);
    if (modelAliases[term]) terms.add(modelAliases[term].replace("_", ""));
    if (modelAliases[term]) terms.add(modelAliases[term].replace("_", "-"));
  });

  const usefulTerms = [...terms].filter((term) => !["авто", "машина", "кроссовер", "седан", "лифтбек", "внедорожник"].includes(term));
  if (!usefulTerms.length) return true;

  const haystack = `${item.title} ${item.description || ""}`
    .toLowerCase()
    .replace(/[_\s]+/g, "");
  return usefulTerms.some((term) => haystack.includes(term.replace(/[_\s]+/g, "")));
}

function buildTags(item, score) {
  const tags = [item.source];
  if (item.photoAnalysis?.ok) tags.push(`vision ${item.photoAnalysis.score.toFixed(1)}`);
  else if (item.image) tags.push("есть фото");
  if (item.year) tags.push(`${item.year} год`);
  if (item.mileage) tags.push(`${new Intl.NumberFormat("ru-RU").format(item.mileage)} км`);
  if (score.total >= 8) tags.push("сильный кандидат");
  if (score.parts.description < 6.5) tags.push("мало данных");
  return tags.slice(0, 5);
}

function buildSummary(item, score) {
  const parts = [];
  parts.push(`AI оценил объявление на ${score.total.toFixed(1)} из 10.`);
  if (item.photoAnalysis?.ok) {
    parts.push(`Локальный vision-lite: ${item.photoAnalysis.label}.`);
  } else {
    parts.push(item.image ? "Фото найдено, но локальный анализ не удался." : "Фото не удалось извлечь из публичной выдачи.");
  }
  if (item.price) parts.push(`Цена ${score.priceComment}.`);
  if (item.description?.length < 80) parts.push("Описание короткое, перед звонком нужно запросить VIN, отчет и дополнительные фото.");
  return parts.join(" ");
}

async function fetchSource(sourceKey, params) {
  const source = sources[sourceKey];
  const url = source.buildUrl(params);
  const started = Date.now();

  try {
    const response = await fetchWithTimeout(url);

    const html = await response.text();
    const blocked = response.status >= 400 || /captcha|доступ ограничен|access denied|are you human/i.test(html);
    const parsed = blocked ? [] : [
      ...parseLdJson(html, source.name, url),
      ...parseJsonOfferSnippets(html, source.name, url),
      ...parseGenericCards(html, source.name, url),
    ];

    return {
      source: source.name,
      url,
      ok: response.ok && !blocked,
      status: response.status,
      ms: Date.now() - started,
      count: parsed.length,
      items: parsed,
      message: blocked
        ? "Источник не отдал публичную выдачу: вероятно, требуется CAPTCHA, cookie-сессия или официальный API."
        : parsed.length
          ? ""
          : `HTML доступен, но карточки не распознаны (${html.length} символов).`,
    };
  } catch (error) {
    return {
      source: source.name,
      url,
      ok: false,
      status: 0,
      ms: Date.now() - started,
      count: 0,
      items: [],
      message: error.name === "AbortError" ? "Таймаут запроса к источнику." : `${error.message}${error.cause?.code ? ` (${error.cause.code})` : ""}`,
    };
  }
}

async function fetchWithTimeout(url) {
  let lastError;

  for (let attempt = 0; attempt < 2; attempt += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 18000);

    try {
      const response = await fetch(url, {
        redirect: "follow",
        signal: controller.signal,
        headers: {
          "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "accept-language": "ru-RU,ru;q=0.9,en;q=0.6",
          "user-agent": "Mozilla/5.0",
        },
      });
      clearTimeout(timer);
      return response;
    } catch (error) {
      clearTimeout(timer);
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, 450));
    }
  }

  throw lastError;
}

async function handleSearch(request, response) {
  const url = new URL(request.url, `http://${request.headers.host}`);
  const params = {
    query: cleanText(url.searchParams.get("query") || "Toyota Camry"),
    region: url.searchParams.get("region") || "all",
    budget: url.searchParams.get("budget") || "",
    year: url.searchParams.get("year") || "",
    priority: url.searchParams.get("priority") || "balanced",
  };

  const selectedSources = (url.searchParams.get("sources") || "avito,drom,autoRu")
    .split(",")
    .map((item) => item.trim())
    .filter((item) => sources[item]);

  const results = [];
  for (const sourceKey of selectedSources) {
    results.push(await fetchSource(sourceKey, params));
  }
  let allItems = normalizeItems(results.flatMap((result) => result.items), params)
    .sort((a, b) => b.score - a.score);
  allItems = (await enrichWithVision(allItems, params))
    .sort((a, b) => b.score - a.score);
  const realPrices = allItems.map((item) => item.price).filter(Boolean);
  const medianPrice = median(realPrices);

  sendJson(response, 200, {
    params,
    searchedAt: new Date().toISOString(),
    region: regions[params.region]?.label || regions.all.label,
    sources: results.map(({ items, ...result }) => result),
    medianPrice,
    items: allItems,
  });
}

const server = http.createServer((request, response) => {
  const url = new URL(request.url, `http://${request.headers.host}`);

  if (url.pathname === "/api/search") {
    handleSearch(request, response).catch((error) => {
      sendJson(response, 500, { error: error.message });
    });
    return;
  }

  serveStatic(request, response);
});

server.listen(PORT, () => {
  console.log(`AutoScout AI is running: http://localhost:${PORT}`);
});
