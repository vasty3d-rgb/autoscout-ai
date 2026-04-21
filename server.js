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
  novosibirsk: {
    label: "Новосибирская область",
    avito: "novosibirskaya_oblast",
    drom: "novosibirsk",
    autoRu: "novosibirsk",
  },
  nnovgorod: {
    label: "Нижегородская область",
    avito: "nizhegorodskaya_oblast",
    drom: "nizhniy_novgorod",
    autoRu: "nizhniy_novgorod",
  },
  kazan: {
    label: "Республика Татарстан",
    avito: "tatarstan",
    drom: "kazan",
    autoRu: "kazan",
  },
  samara: {
    label: "Самарская область",
    avito: "samarskaya_oblast",
    drom: "samara",
    autoRu: "samara",
  },
  rostov: {
    label: "Ростовская область",
    avito: "rostovskaya_oblast",
    drom: "rostov-na-donu",
    autoRu: "rostov-na-donu",
  },
  bashkortostan: {
    label: "Республика Башкортостан",
    avito: "bashkortostan",
    drom: "ufa",
    autoRu: "ufa",
  },
  chelyabinsk: {
    label: "Челябинская область",
    avito: "chelyabinskaya_oblast",
    drom: "chelyabinsk",
    autoRu: "chelyabinsk",
  },
  perm: {
    label: "Пермский край",
    avito: "permskiy_kray",
    drom: "perm",
    autoRu: "perm",
  },
  krasnoyarsk: {
    label: "Красноярский край",
    avito: "krasnoyarskiy_kray",
    drom: "krasnoyarsk",
    autoRu: "krasnoyarsk",
  },
  voronezh: {
    label: "Воронежская область",
    avito: "voronezhskaya_oblast",
    drom: "voronezh",
    autoRu: "voronezh",
  },
  volgograd: {
    label: "Волгоградская область",
    avito: "volgogradskaya_oblast",
    drom: "volgograd",
    autoRu: "volgograd",
  },
  saratov: {
    label: "Саратовская область",
    avito: "saratovskaya_oblast",
    drom: "saratov",
    autoRu: "saratov",
  },
  tyumen: {
    label: "Тюменская область",
    avito: "tyumenskaya_oblast",
    drom: "tyumen",
    autoRu: "tyumen",
  },
  irkutsk: {
    label: "Иркутская область",
    avito: "irkutskaya_oblast",
    drom: "irkutsk",
    autoRu: "irkutsk",
  },
  primorsky: {
    label: "Приморский край",
    avito: "primorskiy_kray",
    drom: "vladivostok",
    autoRu: "vladivostok",
  },
  stavropol: {
    label: "Ставропольский край",
    avito: "stavropolskiy_kray",
    drom: "stavropol",
    autoRu: "stavropol",
  },
  omsk: {
    label: "Омская область",
    avito: "omskaya_oblast",
    drom: "omsk",
    autoRu: "omsk",
  },
  ufa: {
    label: "Уфа",
    avito: "ufa",
    drom: "ufa",
    autoRu: "ufa",
  },
  sochi: {
    label: "Сочи",
    avito: "sochi",
    drom: "sochi",
    autoRu: "sochi",
  },
  kaliningrad: {
    label: "Калининградская область",
    avito: "kaliningradskaya_oblast",
    drom: "kaliningrad",
    autoRu: "kaliningrad",
  },
  crimea: {
    label: "Республика Крым",
    avito: "krym",
    drom: "crimea",
    autoRu: "crimea",
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
    "access-control-allow-methods": "GET, POST, OPTIONS",
    "access-control-allow-headers": "content-type",
  });
  response.end(JSON.stringify(payload));
}

function readJsonBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";
    request.on("data", (chunk) => {
      body += chunk;
      if (body.length > 512000) {
        reject(new Error("Request body is too large"));
        request.destroy();
      }
    });
    request.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        reject(new Error("Invalid JSON body"));
      }
    });
    request.on("error", reject);
  });
}

function sendBuffer(response, status, contentType, buffer) {
  response.writeHead(status, {
    "content-type": contentType || "application/octet-stream",
    "cache-control": "public, max-age=86400",
    "access-control-allow-origin": "*",
  });
  response.end(buffer);
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
    if (String(maybeUrl).startsWith("//")) return `https:${maybeUrl}`;
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
      year: estimateYearFromTitle(title),
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

    const imageMatch = body.match(/<img[^>]+(?:src|data-src|data-original)=["']([^"']+)["']/i);
    const srcsetMatch = body.match(/<img[^>]+srcset=["']([^"']+)["']/i);
    const imageUrl = imageMatch?.[1] || srcsetMatch?.[1]?.split(/\s+/)?.[0];
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
      image: absoluteUrl(sourceUrl, imageUrl),
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
      year: estimateYearFromTitle(title),
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

function estimateYearFromTitle(title = "") {
  const explicitYear = numberFromText(String(title).match(/\b(19|20)\d{2}\b/)?.[0]);
  if (explicitYear) return explicitYear;

  const text = String(title).toLowerCase();
  const generationRules = [
    [/kia\s+rio.*\biv\b|rio\s+4-speed\s+iii/i, 2017],
    [/kia\s+rio.*\biii\b.*рестайлинг/i, 2015],
    [/kia\s+rio.*\biii\b/i, 2011],
    [/toyota\s+camry.*xv70|camry\s+viii/i, 2018],
    [/toyota\s+camry.*xv50|camry\s+vii/i, 2011],
    [/volkswagen\s+tiguan.*ii/i, 2017],
    [/skoda\s+octavia.*a7|octavia\s+iii/i, 2013],
    [/hyundai\s+solaris.*ii/i, 2017],
    [/hyundai\s+tucson.*iii/i, 2015],
    [/mazda\s+cx-5.*ii/i, 2017],
  ];

  const matched = generationRules.find(([pattern]) => pattern.test(text));
  return matched ? matched[1] : null;
}

function applyScore(item, params) {
  const score = scoreCar(item, params);
  return {
    ...item,
    score: score.total,
    scoreParts: score.parts,
    priceComment: score.priceComment,
    summary: buildSummary(item, score),
    assistantReview: buildAssistantReview(item, score, params),
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

async function enrichWithListingDetails(items) {
  const limit = 10;
  const enriched = [];
  let loaded = 0;

  for (const item of items) {
    if ((!item.year || !item.mileage) && item.url && loaded < limit) {
      loaded += 1;
      const details = await fetchListingDetails(item.url);
      enriched.push({
        ...item,
        year: item.year || details.year,
        mileage: item.mileage || details.mileage,
        description: item.description?.length > details.description?.length ? item.description : details.description || item.description,
        detailsLoaded: details.ok,
      });
    } else {
      enriched.push(item);
    }
  }

  return enriched;
}

async function fetchListingDetails(url) {
  try {
    const response = await fetchWithTimeout(url);
    const html = await response.text();
    const text = cleanText(html);
    const title = cleanText(html.match(/<title>(.*?)<\/title>/i)?.[1] || "");
    const year = extractYearFromListing(html, text, title);
    const mileage = extractMileageFromListing(html, text);
    const description = cleanText(
      html.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i)?.[1] ||
      html.match(/<meta\s+property=["']og:description["']\s+content=["']([^"']+)["']/i)?.[1] ||
      title
    );

    return { ok: response.ok, year, mileage, description };
  } catch {
    return { ok: false, year: null, mileage: null, description: "" };
  }
}

function extractYearFromListing(html, text, title) {
  const candidates = [
    html.match(/"productionDate"\s*:\s*"?((?:19|20)\d{2})"?/i)?.[1],
    html.match(/"year"\s*:\s*"?((?:19|20)\d{2})"?/i)?.[1],
    text.match(/(?:год выпуска|год|выпуска)\D{0,30}((?:19|20)\d{2})/i)?.[1],
    title.match(/\b((?:19|20)\d{2})\b/)?.[1],
  ];
  return numberFromText(candidates.find(Boolean) || "");
}

function extractMileageFromListing(html, text) {
  const candidates = [
    html.match(/"mileage"\s*:\s*"?(\d{1,7})"?/i)?.[1],
    html.match(/"mileageFromOdometer"\s*:\s*\{[^}]*"value"\s*:\s*"?(\d{1,7})"?/i)?.[1],
    text.match(/пробег\D{0,40}([\d\s]{2,9})\s*(?:км|km)/i)?.[1],
    text.match(/([\d\s]{2,9})\s*(?:км|km)/i)?.[1],
  ];
  return numberFromText(candidates.find(Boolean) || "");
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

async function handleImageProxy(request, response) {
  const currentUrl = new URL(request.url, `http://${request.headers.host}`);
  const target = currentUrl.searchParams.get("url");

  if (!target || !/^https?:\/\//i.test(target)) {
    sendJson(response, 400, { error: "Invalid image url" });
    return;
  }

  try {
    const imageResponse = await fetchImageWithTimeout(target);
    if (!imageResponse.ok) {
      sendJson(response, imageResponse.status, { error: `Image request failed: ${imageResponse.status}` });
      return;
    }

    const contentType = imageResponse.headers.get("content-type") || "image/jpeg";
    const buffer = Buffer.from(await imageResponse.arrayBuffer());
    sendBuffer(response, 200, contentType, buffer);
  } catch (error) {
    sendJson(response, 502, { error: error.message });
  }
}

async function handleAnalyze(request, response) {
  if (request.method === "OPTIONS") {
    sendJson(response, 200, { ok: true });
    return;
  }

  if (request.method !== "POST") {
    sendJson(response, 405, { error: "Method not allowed" });
    return;
  }

  const body = await readJsonBody(request);
  const item = body.item || {};
  const filters = body.filters || {};
  let details = { ok: false, year: null, mileage: null, description: "" };

  if (item.url && /^https?:\/\//i.test(item.url)) {
    details = await fetchListingDetails(item.url);
  }

  const merged = {
    ...item,
    year: item.year || details.year,
    mileage: item.mileage || details.mileage,
    description: details.description?.length > item.description?.length ? details.description : item.description || details.description,
    detailsLoaded: details.ok,
  };

  const score = scoreCar(merged, { budget: filters.budget || filters.priceMax || 0, year: filters.year || "" });
  const analysis = buildDeepListingAnalysis(merged, score, filters, details);

  sendJson(response, 200, { ok: true, analysis });
}

function buildDeepListingAnalysis(item, score, filters, details) {
  const profile = getMaintenanceProfile(item);
  const description = cleanText(`${item.title || ""} ${item.description || ""}`).toLowerCase();
  const age = item.year ? new Date().getFullYear() - item.year : null;
  const budget = Number(filters.budget || filters.priceMax || 0);
  const risks = [];
  const buySignals = [];
  const inspectionPlan = [
    "Проверить VIN, ПТС/СТС, ограничения, залоги, количество владельцев и историю регистраций.",
    "Сделать диагностику двигателя, коробки, подвески, тормозов и электронных блоков в профильном сервисе.",
    "Осмотреть кузов толщиномером: стойки, пороги, арки, проемы дверей, лонжероны и крышу.",
  ];
  const whatToAsk = [
    "Почему продаете и сколько машина у вас во владении?",
    "Есть ли VIN, отчет, заказ-наряды и фото ПТС/СТС без лишних персональных данных?",
    "Какие работы делались за последние 20 000 км и что требует ремонта сейчас?",
  ];
  const likelyRepairs = [...profile.repairs];
  const maintenanceEstimate = [
    `Обычное годовое обслуживание: примерно ${profile.annual}.`,
    `Разовое ТО с маслами и фильтрами: примерно ${profile.basicService}.`,
    `Резерв после покупки лучше держать не ниже ${profile.reserve}.`,
  ];

  if (details.ok) {
    buySignals.push("Удалось прочитать публичную страницу объявления и сверить часть данных с карточкой.");
  } else {
    risks.push("Площадка не отдала полную страницу автоматически. Анализ сделан по карточке и доступному описанию, без обхода антибота.");
  }

  if (item.price && budget) {
    if (item.price < budget * 0.86) {
      buySignals.push("Цена заметно ниже заданного бюджета, есть смысл быстро проверить, пока объявление актуально.");
      risks.push("Слишком привлекательная цена может скрывать срочность, юридические ограничения или будущие вложения.");
    } else if (item.price <= budget) {
      buySignals.push("Цена проходит фильтр бюджета и выглядит рабочей для первичного отбора.");
    } else {
      risks.push("Цена выше бюджета: перед осмотром нужен торг или пересмотр условий поиска.");
    }
  } else {
    risks.push("Цена не распознана надежно, ее нужно сверить на площадке.");
  }

  if (item.year) {
    if (age <= 5) buySignals.push("Возраст небольшой, риск крупных возрастных вложений ниже среднего.");
    else if (age <= 10) inspectionPlan.push("По возрасту уже важны регламентные жидкости, состояние подвески, тормозов, аккумулятора и резины.");
    else risks.push("Возраст существенный: кузов, электрика, резиновые элементы и скрытые ДТП нужно проверять особенно внимательно.");
  } else {
    risks.push("Год не подтвержден из открытых данных, попросите фото документов и отчет по VIN.");
  }

  if (item.mileage) {
    if (item.mileage <= 70000) buySignals.push("Пробег умеренный, но его нужно подтвердить сервисной историей и отчетом.");
    else if (item.mileage <= 150000) inspectionPlan.push("Пробег средний: особое внимание коробке, подвеске, рулевой, тормозам и утечкам.");
    else {
      risks.push("Пробег высокий, вероятность вложений в подвеску, двигатель, коробку и салон выше.");
      likelyRepairs.unshift("Диагностика компрессии/эндоскопия двигателя и проверка коробки под нагрузкой.");
    }
  } else {
    risks.push("Пробег не найден надежно, попросите фото одометра и отчет с историей пробега.");
  }

  if (item.photoAnalysis?.ok) {
    const photoText = `Фото: ${item.photoAnalysis.label || "локальная оценка выполнена"}, балл ${item.photoAnalysis.score.toFixed(1)} из 10.`;
    if (item.photoAnalysis.score >= 7.3) buySignals.push(photoText);
    else {
      risks.push(photoText);
      inspectionPlan.push("Попросить дополнительные фото кузова при дневном свете, салона, подкапотного пространства, порогов и арок.");
    }
  } else if (item.image) {
    risks.push("Фото есть, но локальный анализ не смог получить достаточно данных. Галерею лучше смотреть вручную.");
  } else {
    risks.push("Фото не извлечены из выдачи, без ручного просмотра объявление слабое для принятия решения.");
  }

  const flags = findDescriptionFlags(description);
  risks.push(...flags.risks);
  buySignals.push(...flags.good);
  whatToAsk.push(...flags.questions);

  const sellerSignals = getSellerSignals(description, item.source);
  inspectionPlan.push(...sellerSignals.checks);
  risks.push(...sellerSignals.risks);

  const decision = score.total >= 8.1 && risks.length <= 4
    ? "Сильный кандидат"
    : score.total >= 7.1
      ? "Можно рассматривать"
      : "Только после проверок";

  return {
    decision,
    verdict: `${item.title || "Автомобиль"}: ${score.total.toFixed(1)} из 10`,
    summary: buildDeepSummary(item, score, profile, risks),
    buySignals: buySignals.slice(0, 6),
    risks: risks.slice(0, 8),
    inspectionPlan: inspectionPlan.slice(0, 7),
    whatToAsk: whatToAsk.slice(0, 7),
    likelyRepairs: likelyRepairs.slice(0, 6),
    maintenanceEstimate,
    finalAdvice: getFinalAdvice(score.total, risks.length, profile),
  };
}

function getMaintenanceProfile(item) {
  const title = cleanText(item.title || "").toLowerCase();
  const premium = /\b(bmw|mercedes|audi|lexus|volvo|infiniti|land rover|porsche)\b/i.test(title);
  const crossover = /\b(rav4|cx-5|tiguan|tucson|sportage|santa fe|x-trail|qashqai|touareg|outlander|forester|cr-v|duster|kodiaq)\b/i.test(title);
  const mass = /\b(rio|solaris|polo|rapid|octavia|elantra|cerato|corolla|camry|logan|granta|vesta|largus)\b/i.test(title);

  if (premium) {
    return {
      annual: "180 000 - 400 000 ₽ в год",
      basicService: "35 000 - 80 000 ₽",
      reserve: "250 000 - 500 000 ₽",
      repairs: [
        "Проверка турбин, цепей/ремней ГРМ, течей масла и состояния охлаждения.",
        "Диагностика АКПП/робота, пневмы или адаптивной подвески, если они есть.",
        "Проверка оригинальности пробега через блоки и сервисную историю.",
      ],
    };
  }

  if (crossover) {
    return {
      annual: "90 000 - 220 000 ₽ в год",
      basicService: "18 000 - 45 000 ₽",
      reserve: "120 000 - 250 000 ₽",
      repairs: [
        "Проверка полного привода, муфты, раздатки и кардана, если привод 4WD.",
        "Осмотр подвески, ступиц, тормозов и состояния шин.",
        "Проверка вариатора/автомата и регулярности замены масла в трансмиссии.",
      ],
    };
  }

  if (mass) {
    return {
      annual: "45 000 - 120 000 ₽ в год",
      basicService: "10 000 - 28 000 ₽",
      reserve: "70 000 - 150 000 ₽",
      repairs: [
        "Проверка подвески, рулевой рейки, тормозов и состояния кузова снизу.",
        "Проверка коробки передач, особенно если это робот, вариатор или старый автомат.",
        "Сверка пробега с износом салона, руля, педалей и сервисной историей.",
      ],
    };
  }

  return {
    annual: "70 000 - 180 000 ₽ в год",
    basicService: "15 000 - 40 000 ₽",
    reserve: "100 000 - 220 000 ₽",
    repairs: [
      "Проверка двигателя, коробки, подвески, тормозов и кузова перед задатком.",
      "Сверка регламентных работ по возрасту и пробегу.",
      "Проверка доступности запчастей и стоимости типовых работ по модели.",
    ],
  };
}

function findDescriptionFlags(description) {
  const risks = [];
  const good = [];
  const questions = [];

  if (/такси|каршеринг|аренд/.test(description)) risks.push("В описании есть признаки такси, аренды или коммерческой эксплуатации.");
  if (/дтп|авари|бит|восстанов/.test(description)) risks.push("Есть упоминания ДТП или кузовного восстановления, нужен осмотр геометрии и отчет.");
  if (/залог|огранич|арест|запрет/.test(description)) risks.push("Возможны юридические ограничения, проверка документов обязательна до задатка.");
  if (/окрас|крашен|красил/.test(description)) questions.push("Какие элементы красились и есть ли фото до ремонта?");
  if (/без вложений|обслужен|сервисн|заказ-наряд/.test(description)) good.push("Описание обещает обслуживание или отсутствие вложений, попросите подтверждающие заказ-наряды.");
  if (/торг/.test(description)) good.push("Возможен торг, после диагностики можно аргументировать снижение цены.");
  if (/срочно/.test(description)) risks.push("Срочная продажа требует аккуратной проверки причины и документов.");

  return { risks, good, questions };
}

function getSellerSignals(description, source) {
  const risks = [];
  const checks = [];

  if (/дилер|салон|официальн/.test(description)) {
    checks.push("Если продавец салон, проверить комиссионный договор, собственника в ПТС и условия гарантии.");
  } else if (/собственник|частник|один владелец/.test(description)) {
    checks.push("Если продает собственник, сверить паспорт продавца с ПТС/СТС и договором.");
  } else {
    risks.push(`Тип продавца на ${source || "площадке"} не определен, уточните кто вписан в документы и кто принимает деньги.`);
  }

  return { risks, checks };
}

function buildDeepSummary(item, score, profile, risks) {
  const parts = [`Итоговая оценка ${score.total.toFixed(1)} из 10.`];
  if (item.year) parts.push(`Год: ${item.year}.`);
  if (item.mileage) parts.push(`Пробег: ${new Intl.NumberFormat("ru-RU").format(item.mileage)} км.`);
  parts.push(`Ориентир по содержанию: ${profile.annual}.`);
  if (risks.length) parts.push(`Главные сомнения: ${risks.slice(0, 2).join(" ")}`);
  return parts.join(" ");
}

function getFinalAdvice(total, riskCount, profile) {
  if (total >= 8.1 && riskCount <= 4) {
    return `Можно ехать на осмотр, но только с VIN-отчетом и диагностикой. Держите резерв на первые работы: ${profile.reserve}.`;
  }
  if (total >= 7.1) {
    return `Объявление можно держать в списке, но решение принимать после отчета, торга и диагностики. Резерв на старт: ${profile.reserve}.`;
  }
  return `Покупать без глубокой проверки не стоит. Сначала документы, история, диагностика и понятный торг; резерв на риски: ${profile.reserve}.`;
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

function buildAssistantReview(item, score, params) {
  const budget = Number(params.budget || 0);
  const decision = getDecision(score.total);
  const reasons = [];
  const risks = [];
  const checks = [];
  const questions = [];

  if (item.price && budget) {
    if (item.price <= budget * 0.86) {
      reasons.push("Цена заметно ниже вашего бюджета, поэтому объявление стоит быстро проверить, пока оно не ушло.");
      risks.push("Слишком привлекательная цена может означать срочную продажу, скрытые вложения или ограничения по документам.");
    } else if (item.price <= budget) {
      reasons.push("Цена проходит фильтр и находится в рабочем диапазоне бюджета.");
    } else {
      risks.push("Цена выше заданного бюджета, торг или пересмотр фильтра обязателен.");
    }
  } else {
    risks.push("Цена не распознана надежно, сравните ее на самой площадке перед звонком.");
  }

  if (item.year) {
    const age = new Date().getFullYear() - item.year;
    if (age <= 5) reasons.push("Автомобиль относительно свежий, риск возрастных вложений ниже.");
    else if (age <= 10) checks.push("Проверить регламентные работы по возрасту: жидкости, подвеску, тормоза, резину.");
    else risks.push("Возраст уже существенный, диагностика кузова и технической части особенно важна.");
  } else {
    risks.push("Год не подтвержден из открытых данных, нужно сверить ПТС/СТС и отчет по VIN.");
  }

  if (item.mileage) {
    if (item.mileage <= 70000) reasons.push("Пробег выглядит умеренным для рынка, если он подтверждается сервисной историей.");
    else if (item.mileage <= 150000) checks.push("Пробег средний: проверьте обслуживание коробки, подвески и тормозов.");
    else risks.push("Пробег высокий, возможны вложения в подвеску, двигатель, коробку и салон.");
  } else {
    risks.push("Пробег не найден в открытых данных, запросите фото одометра и отчет.");
  }

  if (item.photoAnalysis?.ok) {
    if (item.photoAnalysis.score >= 7.3) {
      reasons.push("Фото достаточно четкие для первичной оценки внешнего состояния.");
    } else if (item.photoAnalysis.score >= 6.2) {
      checks.push("Фото средние по качеству: попросите дополнительные снимки кузова, салона, порогов и арок.");
    } else {
      risks.push("Фото слабые: по ним трудно оценить кузов и состояние, лучше не ехать без дополнительных материалов.");
    }
  } else if (item.image) {
    checks.push("Фото есть, но локальный анализ не смог их проверить; откройте объявление и посмотрите галерею вручную.");
  } else {
    risks.push("Фото не извлечены из выдачи, объявление требует ручной проверки.");
  }

  if (!item.description || item.description.length < 90) {
    risks.push("Описание короткое: продавец не раскрыл историю, обслуживание и возможные нюансы.");
  } else {
    reasons.push("В описании есть дополнительные данные, это повышает прозрачность объявления.");
  }

  questions.push("Сколько владельцев по ПТС и кто фактически продает автомобиль?");
  questions.push("Есть ли VIN, отчет, сервисная история и заказ-наряды?");
  questions.push("Какие детали красились, были ли ДТП и страховые выплаты?");
  questions.push("Готов ли продавец на диагностику в выбранном вами сервисе?");

  checks.push("Сверить VIN на кузове, в документах и в отчете.");
  checks.push("Проверить кузов толщиномером, особенно переднюю часть, стойки, пороги и крышу.");
  checks.push("Сделать компьютерную диагностику и осмотр ходовой.");

  return {
    decision,
    verdict: buildVerdict(item, score, decision),
    reasons: unique(reasons).slice(0, 4),
    risks: unique(risks).slice(0, 5),
    checks: unique(checks).slice(0, 5),
    questions: unique(questions).slice(0, 4),
    recommendation: getRecommendation(score.total),
  };
}

function getDecision(score) {
  if (score >= 8.2) return "Сильный кандидат";
  if (score >= 7.2) return "Можно рассматривать";
  if (score >= 6.4) return "Только после проверки";
  return "Лучше пропустить";
}

function getRecommendation(score) {
  if (score >= 8.2) return "Позвонить продавцу и бронировать осмотр, но не вносить предоплату без проверки документов.";
  if (score >= 7.2) return "Добавить в шорт-лист и сравнить с 3-5 похожими вариантами.";
  if (score >= 6.4) return "Ехать на осмотр только если продавец заранее пришлет VIN, отчет и дополнительные фото.";
  return "Не тратить время без сильного торга или подтвержденной прозрачной истории.";
}

function buildVerdict(item, score, decision) {
  const price = item.price ? `за ${new Intl.NumberFormat("ru-RU").format(item.price)} ₽` : "без надежно распознанной цены";
  const year = item.year ? `${item.year} года` : "с неподтвержденным годом";
  const mileage = item.mileage ? `и пробегом ${new Intl.NumberFormat("ru-RU").format(item.mileage)} км` : "и неподтвержденным пробегом";
  return `${decision}: ${item.title} ${year} ${mileage} ${price}. Итоговый балл ${score.total.toFixed(1)} из 10.`;
}

function unique(items) {
  return [...new Set(items.filter(Boolean))];
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
  allItems = (await enrichWithListingDetails(allItems))
    .map((item) => applyScore(item, params))
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

  if (url.pathname === "/api/analyze") {
    handleAnalyze(request, response).catch((error) => {
      sendJson(response, 500, { error: error.message });
    });
    return;
  }

  if (url.pathname === "/api/search") {
    handleSearch(request, response).catch((error) => {
      sendJson(response, 500, { error: error.message });
    });
    return;
  }

  if (url.pathname === "/api/image") {
    handleImageProxy(request, response);
    return;
  }

  serveStatic(request, response);
});

server.listen(PORT, () => {
  console.log(`AutoScout AI is running: http://localhost:${PORT}`);
});
