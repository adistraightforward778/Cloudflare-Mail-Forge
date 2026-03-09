import http from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  createRoutingRule,
  deleteRoutingRule,
  getRoutingRule,
  listRoutingRules,
  listZones,
  updateRoutingRule,
} from "./src/cloudflare.js";
import { loadConfig, saveConfig } from "./src/config-store.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PUBLIC_DIR = path.join(__dirname, "public");
const HOST = process.env.APP_HOST || "127.0.0.1";
const PORT = Number(process.env.APP_PORT || 3042);

const MIME_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
};

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  res.end(JSON.stringify(payload));
}

function sendError(res, statusCode, message, details) {
  sendJson(res, statusCode, {
    ok: false,
    error: message,
    details: details || null,
  });
}

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  if (chunks.length === 0) {
    return {};
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf-8"));
  } catch {
    throw new Error("请求体不是合法 JSON");
  }
}

function ensureToken(config) {
  if (!config.token) {
    throw new Error("请先在配置区保存 Cloudflare API Token");
  }
}

function normalizeList(input) {
  if (!input) {
    return [];
  }
  return Array.from(
    new Set(
      String(input)
        .split(/[\n,\s]+/)
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  );
}

function randomLocalPart(length = 8) {
  const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from({ length }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join("");
}

function createLocalParts(body) {
  const mode = body.mode === "manual" ? "manual" : "pattern";
  if (mode === "manual") {
    const parts = normalizeList(body.manualInput);
    if (parts.length === 0) {
      throw new Error("手动模式下请至少输入一个 local-part 或完整邮箱");
    }
    return parts;
  }

  const count = Number(body.count || 0);
  const start = Number(body.start || 1);
  if (!Number.isInteger(count) || count <= 0) {
    throw new Error("批量模式下 count 必须是正整数");
  }
  if (!Number.isInteger(start) || start <= 0) {
    throw new Error("批量模式下 start 必须是正整数");
  }

  const prefix = String(body.prefix || "").trim();
  return Array.from({ length: count }, (_, index) => {
    if (!prefix) {
      return randomLocalPart();
    }
    return `${prefix}${start + index}`;
  });
}

function expandAddresses(localParts, targets) {
  const results = [];
  for (const target of targets) {
    for (const localPart of localParts) {
      results.push({
        zoneId: target.zoneId,
        zoneName: target.domain,
        address: localPart.includes("@") ? localPart : `${localPart}@${target.domain}`,
      });
    }
  }
  return results;
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function handleApi(req, res, url) {
  try {
    if (req.method === "GET" && url.pathname === "/api/health") {
      sendJson(res, 200, { ok: true, host: HOST, port: PORT, now: new Date().toISOString() });
      return;
    }

    if (req.method === "GET" && url.pathname === "/api/config") {
      const config = await loadConfig();
      sendJson(res, 200, { ok: true, config });
      return;
    }

    if (req.method === "PUT" && url.pathname === "/api/config") {
      const body = await readBody(req);
      const nextConfig = await saveConfig({
        token: String(body.token || "").trim(),
        destinationEmail: String(body.destinationEmail || "").trim(),
        defaultPrefix: String(body.defaultPrefix || "").trim(),
        defaultCount: Number(body.defaultCount || 5),
        defaultStart: Number(body.defaultStart || 1),
        delayMs: Number(body.delayMs || 0),
        selectedZoneIds: Array.isArray(body.selectedZoneIds)
          ? body.selectedZoneIds.map((item) => String(item).trim()).filter(Boolean)
          : [],
      });
      sendJson(res, 200, { ok: true, config: nextConfig });
      return;
    }

    if (req.method === "GET" && url.pathname === "/api/zones") {
      const config = await loadConfig();
      ensureToken(config);
      const zones = await listZones(config.token);
      sendJson(res, 200, { ok: true, zones });
      return;
    }

    if (req.method === "GET" && url.pathname === "/api/rules") {
      const zoneId = url.searchParams.get("zoneId");
      if (!zoneId) {
        sendError(res, 400, "缺少 zoneId");
        return;
      }
      const config = await loadConfig();
      ensureToken(config);
      const rules = await listRoutingRules(config.token, zoneId);
      sendJson(res, 200, { ok: true, rules });
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/rules/batch") {
      const body = await readBody(req);
      const config = await loadConfig();
      ensureToken(config);

      const destinationEmail = String(body.destinationEmail || config.destinationEmail || "").trim();
      if (!destinationEmail) {
        sendError(res, 400, "缺少 destinationEmail");
        return;
      }

      const targets = Array.isArray(body.targets)
        ? body.targets
            .map((item) => ({
              zoneId: String(item.zoneId || "").trim(),
              domain: String(item.domain || "").trim(),
            }))
            .filter((item) => item.zoneId && item.domain)
        : [];

      if (targets.length === 0) {
        sendError(res, 400, "请先至少选择一个域名");
        return;
      }

      const localParts = createLocalParts(body);
      const addresses = expandAddresses(localParts, targets);
      const enabled = body.enabled !== false;
      const delayMs = Math.max(0, Number(body.delayMs ?? config.delayMs ?? 0));

      const results = [];
      for (const item of addresses) {
        try {
          const rule = await createRoutingRule(config.token, item.zoneId, {
            address: item.address,
            destinationEmail,
            enabled,
          });
          results.push({
            zoneId: item.zoneId,
            zoneName: item.zoneName,
            address: item.address,
            status: "created",
            ruleId: rule.id || "",
            message: "",
          });
        } catch (error) {
          results.push({
            zoneId: item.zoneId,
            zoneName: item.zoneName,
            address: item.address,
            status: "failed",
            ruleId: "",
            message: error.message,
          });
        }
        if (delayMs > 0) {
          await sleep(delayMs);
        }
      }

      sendJson(res, 200, {
        ok: true,
        summary: {
          total: results.length,
          created: results.filter((item) => item.status === "created").length,
          failed: results.filter((item) => item.status === "failed").length,
        },
        results,
      });
      return;
    }

    if (req.method === "DELETE" && url.pathname === "/api/rules") {
      const body = await readBody(req);
      const zoneId = String(body.zoneId || "").trim();
      const ruleIds = Array.isArray(body.ruleIds)
        ? body.ruleIds.map((item) => String(item).trim()).filter(Boolean)
        : [];

      if (!zoneId || ruleIds.length === 0) {
        sendError(res, 400, "删除需要 zoneId 和 ruleIds");
        return;
      }

      const config = await loadConfig();
      ensureToken(config);

      const results = [];
      for (const ruleId of ruleIds) {
        try {
          await deleteRoutingRule(config.token, zoneId, ruleId);
          results.push({ ruleId, status: "deleted", message: "" });
        } catch (error) {
          results.push({ ruleId, status: "failed", message: error.message });
        }
      }

      sendJson(res, 200, { ok: true, results });
      return;
    }

    if (req.method === "PATCH" && url.pathname === "/api/rules/toggle") {
      const body = await readBody(req);
      const zoneId = String(body.zoneId || "").trim();
      const ruleId = String(body.ruleId || "").trim();
      const enabled = Boolean(body.enabled);

      if (!zoneId || !ruleId) {
        sendError(res, 400, "启停需要 zoneId 和 ruleId");
        return;
      }

      const config = await loadConfig();
      ensureToken(config);
      const currentRule = await getRoutingRule(config.token, zoneId, ruleId);
      const updatedRule = await updateRoutingRule(config.token, zoneId, ruleId, {
        actions: currentRule.actions || [],
        enabled,
        matchers: currentRule.matchers || [],
        name: currentRule.name || `rule:${ruleId}`,
        priority: currentRule.priority || 0,
      });

      sendJson(res, 200, { ok: true, rule: updatedRule });
      return;
    }

    sendError(res, 404, "API 路径不存在");
  } catch (error) {
    sendError(res, 500, error.message);
  }
}

async function serveStatic(res, url) {
  const rawPath = url.pathname === "/" ? "/index.html" : url.pathname;
  const normalizedPath = path.normalize(rawPath).replace(/^(\.\.[/\\])+/, "");
  const filePath = path.join(PUBLIC_DIR, normalizedPath);

  if (!filePath.startsWith(PUBLIC_DIR)) {
    sendError(res, 403, "禁止访问该路径");
    return;
  }

  try {
    const content = await readFile(filePath);
    const ext = path.extname(filePath);
    res.writeHead(200, {
      "Content-Type": MIME_TYPES[ext] || "application/octet-stream",
      "Cache-Control": "no-store",
    });
    res.end(content);
  } catch {
    sendError(res, 404, "页面不存在");
  }
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || "/", `http://${req.headers.host || `${HOST}:${PORT}`}`);
  if (url.pathname.startsWith("/api/")) {
    await handleApi(req, res, url);
    return;
  }
  await serveStatic(res, url);
});

server.listen(PORT, HOST, () => {
  console.log(`Cloudflare Mail Forge running at http://${HOST}:${PORT}`);
});
