import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const DATA_DIR = path.join(process.cwd(), "data");
const CONFIG_PATH = path.join(DATA_DIR, "app-config.json");
const ENV_PATH = path.join(process.cwd(), ".env");

function parseEnv(text) {
  const result = {};
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) {
      continue;
    }
    const [key, value] = trimmed.split("=", 2);
    result[key.trim()] = value.trim();
  }
  return result;
}

async function readEnvConfig() {
  try {
    const text = await readFile(ENV_PATH, "utf-8");
    const env = parseEnv(text);
    return {
      token: env.CF_API_TOKEN || "",
      destinationEmail: env.CF_DEST_EMAIL || "",
      defaultPrefix: env.CF_PREFIX || "",
      defaultCount: Number(env.CF_COUNT || 5),
      defaultStart: Number(env.CF_START || 1),
      delayMs: Number(env.CF_DELAY_MS || 0),
      selectedZoneIds: [],
    };
  } catch {
    return {
      token: "",
      destinationEmail: "",
      defaultPrefix: "",
      defaultCount: 5,
      defaultStart: 1,
      delayMs: 0,
      selectedZoneIds: [],
    };
  }
}

function sanitizeConfig(config) {
  return {
    token: String(config.token || "").trim(),
    destinationEmail: String(config.destinationEmail || "").trim(),
    defaultPrefix: String(config.defaultPrefix || "").trim(),
    defaultCount: Number.isFinite(Number(config.defaultCount)) ? Number(config.defaultCount) : 5,
    defaultStart: Number.isFinite(Number(config.defaultStart)) ? Number(config.defaultStart) : 1,
    delayMs: Number.isFinite(Number(config.delayMs)) ? Number(config.delayMs) : 0,
    selectedZoneIds: Array.isArray(config.selectedZoneIds)
      ? Array.from(new Set(config.selectedZoneIds.map((item) => String(item).trim()).filter(Boolean)))
      : [],
  };
}

export async function loadConfig() {
  const envConfig = await readEnvConfig();
  try {
    const fileText = await readFile(CONFIG_PATH, "utf-8");
    return sanitizeConfig({
      ...envConfig,
      ...JSON.parse(fileText),
    });
  } catch {
    return sanitizeConfig(envConfig);
  }
}

export async function saveConfig(nextConfig) {
  const current = await loadConfig();
  const merged = sanitizeConfig({
    ...current,
    ...nextConfig,
  });
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(CONFIG_PATH, `${JSON.stringify(merged, null, 2)}\n`, "utf-8");
  return merged;
}
