// IMPORTANT: This key should be set in the environment variables as GEOAPIFY_API_KEY.
// It is NOT the same as the Gemini API Key.
const GEOAPIFY_API_KEY = process.env.GEOAPIFY_API_KEY;

interface GeoapifyFeature {
  properties: {
    lat: number;
    lon: number;
    formatted: string;
  };
}

interface GeoapifyResponse {
  features: GeoapifyFeature[];
}

export const geocode = async (text: string): Promise<{ lat: number; lon: number } | null> => {
  if (!GEOAPIFY_API_KEY) {
    console.error("Geoapify API key is not set. Please set the GEOAPIFY_API_KEY environment variable.");
    alert("The map search feature is currently unavailable. Please configure the API key.");
    return null;
  }
  const url = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(text)}&apiKey=${GEOAPIFY_API_KEY}`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Geoapify API error: ${response.statusText}`);
    }
    const data: GeoapifyResponse = await response.json();

    if (data.features && data.features.length > 0) {
      const { lat, lon } = data.features[0].properties;
      return { lat, lon };
    }
    return null;
  } catch (error) {
    console.error("Error calling Geoapify API:", error);
    return null;
  }
};
