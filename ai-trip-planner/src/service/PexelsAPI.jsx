import axios from "axios";

const BACKEND_PEXELS_URL = "http://localhost:5000/api/pexels-image";

export async function searchPexelsImage(query) {
  if (!query?.trim()) {
    console.warn("searchPexelsImage: empty query");
    return "";
  }

  try {
    console.log(`[Pexels Proxy Client] Querying backend for image: "${query}"`);
    const response = await axios.get(BACKEND_PEXELS_URL, {
      params: { query }
    });
    
    return response.data.url || "";
  } catch (error) {
    console.error("[Pexels Proxy Client] Failed to fetch image from backend:", error.message || error);
    return "";
  }
}
