import { useState, useCallback } from 'react';
import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

export function useAI() {
  const [audienceScores, setAudienceScores] = useState({});
  const [audienceLoading, setAudienceLoading] = useState(false);
  const [revenueData, setRevenueData] = useState(null);
  const [revenueLoading, setRevenueLoading] = useState(false);
  const [storefrontUrl, setStorefrontUrl] = useState(null);
  const [storefrontLoading, setStorefrontLoading] = useState(false);
  const [storefrontError, setStorefrontError] = useState(null);
  const [floorplanUrl, setFloorplanUrl] = useState(null);
  const [floorplanLoading, setFloorplanLoading] = useState(false);
  const [floorplanError, setFloorplanError] = useState(null);
  const [revenueError, setRevenueError] = useState(null);

  // -- Audience scoring (GPT-4o) --
  const scoreAudience = useCallback(async (description, neighborhoodSummary) => {
    if (!description.trim() || !neighborhoodSummary?.length) return;
    setAudienceLoading(true);
    setAudienceScores({});
    const trimmed = neighborhoodSummary.slice(0, 120);
    try {
      const res = await client.chat.completions.create({
        model: 'gpt-4o',
        temperature: 0.3,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: 'You are an expert NYC demographic analyst. Score EACH neighbourhood 0-100 on suitability for the described customer type. Return JSON: { "scores": [{ "ntacode": "...", "score": 0-100 }] }' },
          { role: 'user', content: `Target customer: "${description}"\n\nNeighbourhood data:\n${JSON.stringify(trimmed)}` },
        ],
      });
      const parsed = JSON.parse(res.choices[0].message.content);
      const map = {};
      for (const s of parsed.scores ?? []) map[s.ntacode] = s.score;
      setAudienceScores(map);
    } catch (err) {
      console.error('Audience scoring failed:', err);
    } finally {
      setAudienceLoading(false);
    }
  }, []);

  // -- Revenue prediction (GPT-4o) --
  const predictRevenue = useCallback(async (property, audienceScore) => {
    setRevenueLoading(true);
    setRevenueData(null);
    setRevenueError(null);
    try {
      const res = await client.chat.completions.create({
        model: 'gpt-4o',
        temperature: 0.4,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: 'You are a commercial real estate analyst for NYC. Estimate projected monthly revenue. Return JSON: { "revenue": <number>, "confidence": "low"|"medium"|"high", "factors": ["..."], "summary": "one sentence" }' },
          { role: 'user', content: `Address: ${property.address}\nSq Ft: ${property.sqft ?? 'unknown'}\nMonthly Rent: $${property.price ?? 'unknown'}\nAudience Score: ${audienceScore ?? 'N/A'}/100` },
        ],
      });
      setRevenueData(JSON.parse(res.choices[0].message.content));
    } catch (err) {
      console.error('Revenue prediction failed:', err);
      setRevenueError(err.message || 'Revenue prediction failed');
    } finally {
      setRevenueLoading(false);
    }
  }, []);

  // -- Storefront visualisation (DALL-E 3) --
  const generateStorefront = useCallback(async (address, businessType) => {
    setStorefrontLoading(true);
    setStorefrontUrl(null);
    setStorefrontError(null);
    try {
      const res = await client.images.generate({
        model: 'dall-e-3',
        prompt: `A photorealistic street-level photograph of a modern renovated ${businessType || 'retail'} storefront at ${address}, New York City. Large glass windows, contemporary signage, warm lighting, clean modern materials. Golden hour, pedestrians walking by. Architectural photography.`,
        n: 1,
        size: '1024x1024',
        quality: 'standard',
      });
      setStorefrontUrl(res.data[0].url);
    } catch (err) {
      console.error('Storefront generation failed:', err);
      setStorefrontError(err.message || 'Storefront generation failed');
    } finally {
      setStorefrontLoading(false);
    }
  }, []);

  // -- Architectural floor plan (DALL-E 3) --
  const generateFloorplan = useCallback(async (sqft, businessType) => {
    setFloorplanLoading(true);
    setFloorplanUrl(null);
    setFloorplanError(null);
    try {
      const res = await client.images.generate({
        model: 'dall-e-3',
        prompt: `A clean, professional architectural floor plan for a ${sqft || 2000} sq ft ${businessType || 'retail'} commercial space in New York City. Top-down blueprint view showing: entrance, sales floor, storage room, restroom, and counter area. Clean lines, labeled rooms with dimensions, minimalist style on white background. Technical drawing style.`,
        n: 1,
        size: '1024x1024',
        quality: 'standard',
      });
      setFloorplanUrl(res.data[0].url);
    } catch (err) {
      console.error('Floor plan generation failed:', err);
      setFloorplanError(err.message || 'Floor plan generation failed');
    } finally {
      setFloorplanLoading(false);
    }
  }, []);

  const resetPropertyAI = useCallback(() => {
    setRevenueData(null);
    setRevenueError(null);
    setStorefrontUrl(null);
    setStorefrontError(null);
    setFloorplanUrl(null);
    setFloorplanError(null);
  }, []);

  return {
    audienceScores, audienceLoading, scoreAudience,
    revenueData, revenueLoading, revenueError, predictRevenue,
    storefrontUrl, storefrontLoading, storefrontError, generateStorefront,
    floorplanUrl, floorplanLoading, floorplanError, generateFloorplan,
    resetPropertyAI,
  };
}
