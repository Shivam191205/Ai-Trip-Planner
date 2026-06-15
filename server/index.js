const express = require("express");
const cors = require("cors");
const axios = require("axios");
const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// Initialize Google Gen AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const MODELS = [
  "gemini-2.5-flash"
];

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
  responseMimeType: "application/json",
};

const MAX_RETRIES = 3;
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Caches
const tripCache = new Map();
const pexelsCache = new Map();
const pexelsUsedUrls = new Set();

// Helper functions for Gemini errors
function isSpikeOrTransientError(error) {
  if (!error) return false;
  const status = error.status || error.statusCode;
  if (status === 429 || status === 500 || status === 503 || status === 504) {
    return true;
  }
  const message = (error.message || String(error)).toLowerCase();
  const transientKeywords = [
    "429", "500", "503", "504", "too many requests", "rate limit",
    "quota", "exhausted", "overload", "busy", "spike",
    "temporarily unavailable", "service unavailable", "try again later", "transient"
  ];
  return transientKeywords.some(keyword => message.includes(keyword));
}

function isFatalNonTransientError(error) {
  if (!error) return false;
  const status = error.status || error.statusCode;
  if (status === 400 || status === 401 || status === 403) {
    return true;
  }
  const message = (error.message || String(error)).toLowerCase();
  const fatalKeywords = [
    "api key", "unauthorized", "invalid api key", "forbidden",
    "invalid argument", "bad request", "key not valid"
  ];
  return fatalKeywords.some(keyword => message.includes(keyword));
}

// -------------------------------------------------------------
// POST: Generate Trip (Gemini Proxy with Fallback & Cache)
// -------------------------------------------------------------
app.post("/api/generate-trip", async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required." });
  }

  // Construct a unique cache key based on the normalized prompt content
  const normalizedPrompt = prompt.toLowerCase().replace(/\s+/g, " ").trim();
  const cacheKey = `trip-${normalizedPrompt.substring(0, 100).replace(/[^a-z0-9]/g, "-")}-len-${normalizedPrompt.length}`;
  
  if (tripCache.has(cacheKey)) {
    console.log(`[Cache Hit] Returning cached trip for: ${cacheKey}`);
    return res.json({ source: "cache", data: tripCache.get(cacheKey) });
  }

  console.log(`[Cache Miss] Fetching trip from Gemini for: ${cacheKey}`);
  let lastError = null;

  for (const modelName of MODELS) {
    let retryCount = 0;
    while (retryCount <= MAX_RETRIES) {
      try {
        if (retryCount > 0) {
          console.log(`[Gemini Proxy] Retry #${retryCount} for model: ${modelName}`);
        } else {
          console.log(`[Gemini Proxy] Attempting content generation with model: ${modelName}`);
        }

        const model = genAI.getGenerativeModel({ model: modelName });
        const session = model.startChat({ generationConfig });
        const result = await session.sendMessage(prompt);

        if (result && result.response) {
          const responseText = result.response.text();
          console.log(`[Gemini Proxy] Success! Generated content using model: ${modelName}`);
          
          // Parse string response robustly (strip markdown formatting/backticks if present)
          let raw = responseText.trim();
          const codeBlockMatch = raw.match(/```(?:json)?\s*([\s\S]*)\s*```$/i);
          if (codeBlockMatch) {
            raw = codeBlockMatch[1].trim();
          }
          const firstBrace = raw.indexOf('{');
          const lastBrace = raw.lastIndexOf('}');
          if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
            raw = raw.slice(firstBrace, lastBrace + 1);
          }

          const parsedData = JSON.parse(raw);
          
          // Store in cache
          tripCache.set(cacheKey, parsedData);
          return res.json({ source: "api", data: parsedData });
        }
      } catch (error) {
        lastError = error;

        if (isFatalNonTransientError(error)) {
          console.error(`[Gemini Proxy] Fatal error on model ${modelName}:`, error.message || error);
          return res.status(error.status || 400).json({ error: error.message || String(error) });
        }

        // For all other errors, retry up to MAX_RETRIES times with exponential backoff
        if (retryCount < MAX_RETRIES) {
          retryCount++;
          const backoffMs = retryCount * 1000;
          console.log(`[Gemini Proxy] Error on model ${modelName} (attempt ${retryCount}/${MAX_RETRIES + 1}): ${error.message || error}. Retrying in ${backoffMs}ms...`);
          await delay(backoffMs);
          continue;
        } else {
          console.warn(`[Gemini Proxy] Max retries reached for model ${modelName}.`);
        }
        break;
      }
    }
  }

  res.status(500).json({
    error: "All fallback models failed to generate content.",
    details: lastError ? (lastError.message || String(lastError)) : null
  });
});

// -------------------------------------------------------------
// GET: Pexels Image (Pexels Proxy & Cache)
// -------------------------------------------------------------
const getBroadenedQuery = (query) => {
  const q = query.toLowerCase();
  if (q.includes("hotel") || q.includes("inn") || q.includes("lodge") || q.includes("resort") || q.includes("stay")) {
    return "hotel room luxury";
  }
  if (q.includes("restaurant") || q.includes("cafe") || q.includes("dining") || q.includes("food") || q.includes("cuisine")) {
    return "fine dining food";
  }
  const words = query.split(/\s+/).filter(Boolean);
  if (words.length > 2) {
    return words.slice(0, 2).join(" ");
  }
  return "travel destination";
};

async function fetchFromPexels(query) {
  try {
    const response = await axios.get("https://api.pexels.com/v1/search", {
      headers: {
        Authorization: process.env.PEXELS_API_KEY,
      },
      params: {
        query,
        per_page: 15,
      },
    });

    const photos = response?.data?.photos || [];
    
    // Find first photo URL that hasn't been used yet
    for (const photo of photos) {
      const url = photo?.src?.landscape || photo?.src?.medium || photo?.src?.original;
      if (url && !pexelsUsedUrls.has(url)) {
        pexelsUsedUrls.add(url);
        return url;
      }
    }

    if (photos.length > 0) {
      const fallbackUrl = photos[0]?.src?.landscape || photos[0]?.src?.medium || photos[0]?.src?.original;
      return fallbackUrl || "";
    }
    return "";
  } catch (error) {
    console.error("Pexels API fetch failed for query:", query, error.message || error);
    return "";
  }
}

app.get("/api/pexels-image", async (req, res) => {
  const { query } = req.query;

  if (!query?.trim()) {
    return res.status(400).json({ error: "Query parameter is required." });
  }

  const cacheKey = `pexels-${query.toLowerCase().trim()}`;

  if (pexelsCache.has(cacheKey)) {
    console.log(`[Cache Hit] Returning cached Pexels image for: ${cacheKey}`);
    return res.json({ source: "cache", url: pexelsCache.get(cacheKey) });
  }

  console.log(`[Cache Miss] Querying Pexels for: ${query}`);
  
  // 1. Try original query
  let url = await fetchFromPexels(query);

  // 2. Try broadened query if original failed
  if (!url) {
    const broadQuery = getBroadenedQuery(query);
    console.log(`No results for original query "${query}". Trying broadened: "${broadQuery}"`);
    url = await fetchFromPexels(broadQuery);
  }

  // 3. Fallback to generic "travel"
  if (!url) {
    console.log(`No results for broadened query. Trying generic fallback "travel"`);
    url = await fetchFromPexels("travel");
  }

  if (url) {
    pexelsCache.set(cacheKey, url);
  }

  res.json({ source: "api", url: url || "" });
});

app.listen(PORT, () => {
  console.log(`[Server] Proxy server running on port ${PORT}`);
});
