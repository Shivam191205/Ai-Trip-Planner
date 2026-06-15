import axios from "axios";

const BACKEND_URL = "http://localhost:5000/api/generate-trip";

// Create a custom chatSession wrapper that proxies requests to our Node/Express backend
export const chatSession = {
  sendMessage: async function (message) {
    try {
      console.log(`[Gemini Proxy Client] Sending request to backend proxy...`);
      
      const response = await axios.post(BACKEND_URL, {
        prompt: message
      });

      const tripData = response.data.data;

      // Mock the SDK response shape to avoid breaking existing UI code
      return {
        response: {
          text: () => typeof tripData === "string" ? tripData : JSON.stringify(tripData)
        }
      };
    } catch (error) {
      console.error("[Gemini Proxy Client] Error calling backend proxy:", error.message || error);
      throw error;
    }
  }
};