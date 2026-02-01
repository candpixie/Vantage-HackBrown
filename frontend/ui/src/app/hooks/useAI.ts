import { useState, useCallback } from 'react';

// Lazy-initialize OpenAI client to avoid crashing when API key is not set
let client: any = null;
let OpenAI: any = null;

async function getOpenAIClient(): Promise<any> {
  if (!OpenAI) {
    try {
      const openaiModule = await import('openai');
      OpenAI = openaiModule.default;
    } catch (error) {
      throw new Error('OpenAI package not installed. Run: npm install openai');
    }
  }
  
  if (!client) {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OpenAI API key not configured. Set VITE_OPENAI_API_KEY in your .env file to enable AI features.');
    }
    client = new OpenAI({
      apiKey,
      dangerouslyAllowBrowser: true,
    });
  }
  return client;
}

export function useAI() {
  const [storefrontUrl, setStorefrontUrl] = useState<string | null>(null);
  const [storefrontLoading, setStorefrontLoading] = useState(false);
  const [storefrontError, setStorefrontError] = useState<string | null>(null);
  const [floorplanUrl, setFloorplanUrl] = useState<string | null>(null);
  const [floorplanLoading, setFloorplanLoading] = useState(false);
  const [floorplanError, setFloorplanError] = useState<string | null>(null);

  const generateStorefront = useCallback(async (address: string, businessType?: string, sqft?: number, propertyType?: string) => {
    setStorefrontLoading(true);
    setStorefrontUrl(null);
    setStorefrontError(null);
    try {
      const openaiClient = await getOpenAIClient();
      const sizeDesc = sqft ? `${sqft} sq ft` : 'mid-size';
      const buildingType = propertyType || 'commercial';
      const res = await openaiClient.images.generate({
        model: 'dall-e-3',
        prompt: `A photorealistic street-level photograph of the building at ${address}, New York City, reimagined as a modern ${businessType || 'retail'} storefront. The building is a ${buildingType} property, approximately ${sizeDesc}. Show the exact street facade with the actual NYC neighborhood character — neighboring buildings, sidewalk, street details. The storefront has been renovated with large glass windows, a stylish ${businessType || 'retail'} sign, warm interior lighting, modern materials. Daytime, natural light, pedestrians walking past. Shot on a professional camera, architectural photography style.`,
        n: 1,
        size: '1024x1024',
        quality: 'standard',
      });
      setStorefrontUrl(res.data[0].url ?? null);
    } catch (err: any) {
      console.error('Storefront generation failed:', err);
      setStorefrontError(err.message || 'Storefront generation failed');
    } finally {
      setStorefrontLoading(false);
    }
  }, []);

  const generateFloorplan = useCallback(async (sqft: number | string, businessType?: string, address?: string) => {
    setFloorplanLoading(true);
    setFloorplanUrl(null);
    setFloorplanError(null);
    try {
      const openaiClient = await getOpenAIClient();
      const area = sqft || 2000;
      const locationHint = address ? ` at ${address}` : ' in New York City';
      const res = await openaiClient.images.generate({
        model: 'dall-e-3',
        prompt: `A clean, professional architectural floor plan for converting a ${area} sq ft space${locationHint} into a ${businessType || 'retail'} establishment. Top-down blueprint view showing: main entrance from street, customer seating area, service counter with ${businessType || 'retail'} equipment, prep/kitchen area, storage room, restroom, and emergency exit. Include dimensions for each room, clean lines, labeled areas. Minimalist technical drawing on white background. Professional architectural blueprint style with scale bar.`,
        n: 1,
        size: '1024x1024',
        quality: 'standard',
      });
      setFloorplanUrl(res.data[0].url ?? null);
    } catch (err: any) {
      console.error('Floor plan generation failed:', err);
      setFloorplanError(err.message || 'Floor plan generation failed');
    } finally {
      setFloorplanLoading(false);
    }
  }, []);

  const resetPropertyAI = useCallback(() => {
    setStorefrontUrl(null);
    setStorefrontError(null);
    setFloorplanUrl(null);
    setFloorplanError(null);
  }, []);

  return {
    storefrontUrl, storefrontLoading, storefrontError, generateStorefront,
    floorplanUrl, floorplanLoading, floorplanError, generateFloorplan,
    resetPropertyAI,
  };
}
