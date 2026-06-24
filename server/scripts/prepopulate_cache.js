const { GoogleGenerativeAI } = require("@google/generative-ai");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const PEXELS_API_KEY = process.env.PEXELS_API_KEY;

if (!GEMINI_API_KEY) {
  console.error("GEMINI_API_KEY is not defined in .env");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const TRIP_CACHE_FILE = path.join(__dirname, "../trip-cache.json");
const PEXELS_CACHE_FILE = path.join(__dirname, "../pexels-cache.json");

function loadCache(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, "utf8");
      return new Map(JSON.parse(raw));
    }
  } catch (error) {
    console.error(`Failed to load cache from ${filePath}:`, error.message);
  }
  return new Map();
}

function saveCache(filePath, cacheMap) {
  try {
    const serialized = JSON.stringify(Array.from(cacheMap.entries()), null, 2);
    fs.writeFileSync(filePath, serialized, "utf8");
    console.log(`Saved cache to ${filePath}`);
  } catch (error) {
    console.error(`Failed to save cache to ${filePath}:`, error.message);
  }
}

const tripCache = loadCache(TRIP_CACHE_FILE);
const pexelsCache = loadCache(PEXELS_CACHE_FILE);
const pexelsUsedUrls = new Set();

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const AI_PROMPT_BASIC = `
Generate a travel plan summary in STRICT JSON format only.

Location: {location}
Duration: {days} Days
Traveler: {traveller}
Budget: {budget}

IMPORTANT RULES:
1. Return ONLY valid JSON
2. Do not add markdown
3. Do not add \`\`\`
4. Do not add explanations
5. Use double quotes for all keys and string values
6. Do not use unescaped quotes inside strings
7. Ensure all arrays and objects are properly closed
8. Return parsable JSON only
9. If an image URL is unavailable, return an empty string ""
10. Never truncate the JSON response
11. The estimated_total_cost and estimated_cost_per_person MUST be calculated in Indian Rupees (INR) and formatted with the ₹ symbol (e.g. ₹15,000).

Use this exact JSON structure:

{
  "location": "string",
  "duration": "string",
  "traveler_type": "string",
  "budget_level": "string",
  "estimated_total_cost": "string",
  "estimated_cost_per_person": "string",

  "hotels_options": [
    {
      "hotel_name": "string",
      "address": "string",
      "price_range_per_night": "string",
      "image_url": "string",
      "geo_coordinates": {
        "latitude": 0,
        "longitude": 0
      },
      "rating": 0,
      "description": "string"
    }
  ]
}
Give 4 to 5 hotel options with details like name, address, price range per night, image url, geo coordinates, rating and a brief description.
Give me exact image url and not any example url. The image should be relevant to the place or hotel. Do not return any placeholder url. If you do not have an exact image url.
`;

const AI_PROMPT_ITINERARY = `
Generate a detailed day-wise itinerary in STRICT JSON format only.

Location: {location}
Duration: {days} Days
Traveler: {traveller}
Budget: {budget}

IMPORTANT RULES:
1. Return ONLY valid JSON
2. Do not add markdown
3. Do not add \`\`\`
4. Do not add explanations
5. Use double quotes for all keys and string values
6. Do not use unescaped quotes inside strings
7. Ensure all arrays and objects are properly closed
8. Return parsable JSON only
9. If an image URL is unavailable, return an empty string ""
10. Never truncate the JSON response

Use this exact JSON structure (return only the array of days):

[
  {
    "day": 1,
    "theme": "string",

    "places": [
      {
        "place_name": "string",
        "details": "string",
        "image_url": "string",

        "geo_coordinates": {
          "latitude": 0,
          "longitude": 0
        },

        "ticket_pricing": "string",
        "travel_time_from_previous_location": "string",
        "time_to_spend": "string",
        "best_time_to_visit": "string"
      }
    ],

    "lunch_option": {
      "restaurant_name": "string",
      "cuisine": "string",
      "best_time_to_visit": "string",
      "budget_level": "string"
    },

    "dinner_option": {
      "restaurant_name": "string",
      "cuisine": "string",
      "best_time_to_visit": "string",
      "budget_level": "string"
    }
  }
]

For the itinerary, provide a day-wise breakdown of activities. Each day should have a theme (e.g., adventure, culture, relaxation) and a list of places to visit with details like name, description, image url, geo coordinates, ticket pricing, travel time from the previous location, recommended time to spend at each place, and the best time to visit. Also include one lunch and one dinner restaurant recommendation for each day with details like name, cuisine type, best time to visit, and budget level.
Give me exact image url and not any example url. The image should be relevant to the place or hotel. Do not return any placeholder url. If you do not have an exact image url.
`;

const destinations = [
  "Jaipur, Rajasthan, India",
  "Manali, Himachal Pradesh, India",
  "Shimla, Himachal Pradesh, India",
  "Srinagar, Jammu and Kashmir, India",
  "Kashmir Valley, India",
  "Dubai, United Arab Emirates",
  "Maldives",
  "Las Vegas, Nevada, USA",
  "Austria",
  "Switzerland",
  "Paris, France",
  "London, United Kingdom",
  "Barcelona, Spain",
  "New York, NY, USA",
  "Goa, India",
  "Kerala, India",
  "Agra, Uttar Pradesh, India"
];

const config = { days: "3", traveller: "Just Me", budget: "Cheap" };

async function fetchPexelsImage(query) {
  if (!PEXELS_API_KEY) return "";
  const cacheKey = `pexels-${query.toLowerCase().trim()}`;
  if (pexelsCache.has(cacheKey)) {
    return pexelsCache.get(cacheKey);
  }

  try {
    const response = await axios.get("https://api.pexels.com/v1/search", {
      headers: { Authorization: PEXELS_API_KEY },
      params: { query, per_page: 5 },
    });
    const photos = response?.data?.photos || [];
    for (const photo of photos) {
      const url = photo?.src?.landscape || photo?.src?.medium || photo?.src?.original;
      if (url && !pexelsUsedUrls.has(url)) {
        pexelsUsedUrls.add(url);
        pexelsCache.set(cacheKey, url);
        return url;
      }
    }
    if (photos.length > 0) {
      const fallbackUrl = photos[0]?.src?.landscape || photos[0]?.src?.medium;
      if (fallbackUrl) {
        pexelsCache.set(cacheKey, fallbackUrl);
        return fallbackUrl;
      }
    }
  } catch (error) {
    console.error(`Pexels API error for "${query}":`, error.message);
  }
  return "";
}

function parseJSON(responseText) {
  let raw = responseText.trim();
  const codeBlockMatch = raw.match(/```(?:json)?\s*([\s\S]*)\s*```$/i);
  if (codeBlockMatch) {
    raw = codeBlockMatch[1].trim();
  }
  let firstChar = raw.indexOf('{');
  let lastChar = raw.lastIndexOf('}');
  const firstArray = raw.indexOf('[');
  const lastArray = raw.lastIndexOf(']');
  if (firstArray !== -1 && (firstChar === -1 || firstArray < firstChar)) {
    firstChar = firstArray;
    lastChar = lastArray;
  }
  if (firstChar !== -1 && lastChar !== -1 && lastChar > firstChar) {
    raw = raw.slice(firstChar, lastChar + 1);
  }
  return JSON.parse(raw);
}

async function generateWithGemini(prompt) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
  const result = await model.generateContent(prompt);
  return parseJSON(result.response.text());
}

async function populateDestination(location) {
  console.log(`\n========================================`);
  console.log(`Processing destination: ${location}`);
  console.log(`========================================`);

  // 1. Basic details and Hotels
  const basicPrompt = AI_PROMPT_BASIC.replaceAll("{location}", location)
    .replace("{days}", config.days)
    .replace("{traveller}", config.traveller)
    .replace("{budget}", config.budget)
    .replace("{budget}", config.budget);

  const basicPromptKey = `trip-${basicPrompt.toLowerCase().replace(/\s+/g, " ").trim().substring(0, 100).replace(/[^a-z0-9]/g, "-")}-len-${basicPrompt.length}`;

  if (tripCache.has(basicPromptKey)) {
    console.log(`[Basic Cache Hit] Skipping Gemini call.`);
  } else {
    try {
      console.log(`Calling Gemini for basic trip details...`);
      const basicData = await generateWithGemini(basicPrompt);
      tripCache.set(basicPromptKey, basicData);
      console.log(`Successfully generated and cached basic trip details.`);
      await delay(2000);
    } catch (e) {
      console.error(`Failed generating basic details for ${location}:`, e.message);
      return;
    }
  }

  // 2. Detailed Itinerary
  const itineraryPrompt = AI_PROMPT_ITINERARY.replaceAll("{location}", location)
    .replace("{days}", config.days)
    .replace("{traveller}", config.traveller)
    .replace("{budget}", config.budget);

  const itineraryPromptKey = `trip-${itineraryPrompt.toLowerCase().replace(/\s+/g, " ").trim().substring(0, 100).replace(/[^a-z0-9]/g, "-")}-len-${itineraryPrompt.length}`;

  if (tripCache.has(itineraryPromptKey)) {
    console.log(`[Itinerary Cache Hit] Skipping Gemini call.`);
  } else {
    try {
      console.log(`Calling Gemini for itinerary...`);
      const itineraryData = await generateWithGemini(itineraryPrompt);
      tripCache.set(itineraryPromptKey, itineraryData);
      console.log(`Successfully generated and cached itinerary.`);
      await delay(2000);
    } catch (e) {
      console.error(`Failed generating itinerary for ${location}:`, e.message);
    }
  }

  // 3. Cache Pexels images for the location
  console.log(`Pre-fetching and caching Pexels images for ${location}...`);
  await fetchPexelsImage(location);

  const basicData = tripCache.get(basicPromptKey);
  if (basicData?.hotels_options) {
    for (const hotel of basicData.hotels_options) {
      const query = `${hotel.hotel_name || "hotel"} ${location}`.trim();
      await fetchPexelsImage(query);
    }
  }

  const itineraryData = tripCache.get(itineraryPromptKey);
  if (Array.isArray(itineraryData)) {
    for (const day of itineraryData) {
      if (day.places) {
        for (const place of day.places) {
          const query = `${place.place_name || "sight"} ${location}`.trim();
          await fetchPexelsImage(query);
        }
      }
    }
  }

  // Save progress
  saveCache(TRIP_CACHE_FILE, tripCache);
  saveCache(PEXELS_CACHE_FILE, pexelsCache);
}

async function run() {
  console.log(`Starting prepopulation for ${destinations.length} destinations...`);
  for (const dest of destinations) {
    try {
      await populateDestination(dest);
      // Extra delay between destinations to avoid quota/rate limits
      await delay(3000);
    } catch (error) {
      console.error(`Error populating ${dest}:`, error.message);
    }
  }
  console.log("\nPrepopulation completed successfully!");
}

run();
