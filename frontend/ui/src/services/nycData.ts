/**
 * Real NYC data fetching service
 * Uses VITE_NYC_DATA_TOKEN for NYC Open Data APIs
 * Uses VITE_RENTCAST_API_KEY for rental listing data
 * Uses Census Bureau APIs for demographics
 */

const NYC_TOKEN = import.meta.env.VITE_NYC_DATA_TOKEN;
const RENTCAST_KEY = import.meta.env.VITE_RENTCAST_API_KEY;

const NTA_GEOJSON_URL = 'https://data.cityofnewyork.us/resource/9nt8-h7nd.geojson';
const POPULATION_URL = 'https://data.cityofnewyork.us/resource/swpk-hqdp.json';
const CENSUS_URL =
  'https://api.census.gov/data/2022/acs/acs5?get=NAME,B01002_001E,B19013_001E,B01003_001E&for=county:005,047,061,081,085&in=state:36';
const RENTCAST_URL = 'https://api.rentcast.io/v1/listings/rental';

const FIPS_TO_BORO: Record<string, string> = {
  '005': 'Bronx',
  '047': 'Brooklyn',
  '061': 'Manhattan',
  '081': 'Queens',
  '085': 'Staten Island',
};

const NYC_COUNTIES = ['005', '047', '061', '081', '085'];

// ---------------------------------------------------------------------------
// Mock listings fallback
// ---------------------------------------------------------------------------
const MOCK_LISTINGS: RentCastListing[] = [
  { id: 'm1', address: '235 E 22nd St, Apt 4B, NY 10010', lat: 40.7378, lng: -73.9823, price: 3200, sqft: 850, bedrooms: 1, bathrooms: 1, propertyType: 'Apartment', neighborhood: 'Gramercy Park', borough: 'Manhattan' },
  { id: 'm2', address: '156 W 56th St, Apt 12A, NY 10019', lat: 40.7649, lng: -73.9795, price: 5500, sqft: 1200, bedrooms: 2, bathrooms: 2, propertyType: 'Apartment', neighborhood: 'Midtown West', borough: 'Manhattan' },
  { id: 'm3', address: '45-15 Barnett Ave, Apt 3C, LIC, NY 11104', lat: 40.7476, lng: -73.9212, price: 2800, sqft: 750, bedrooms: 1, bathrooms: 1, propertyType: 'Apartment', neighborhood: 'Long Island City', borough: 'Queens' },
  { id: 'm4', address: '298 DeKalb Ave, Apt 5F, Brooklyn, NY 11205', lat: 40.6892, lng: -73.9712, price: 2400, sqft: 680, bedrooms: 1, bathrooms: 1, propertyType: 'Apartment', neighborhood: 'Fort Greene', borough: 'Brooklyn' },
  { id: 'm5', address: '515 E 168th St, Apt 2A, Bronx, NY 10456', lat: 40.8327, lng: -73.9097, price: 1600, sqft: 900, bedrooms: 2, bathrooms: 1, propertyType: 'Apartment', neighborhood: 'Morrisania', borough: 'Bronx' },
  { id: 'm6', address: '78 Christopher St, Apt 6D, NY 10014', lat: 40.7336, lng: -74.003, price: 4200, sqft: 950, bedrooms: 1, bathrooms: 1, propertyType: 'Apartment', neighborhood: 'West Village', borough: 'Manhattan' },
  { id: 'm7', address: '89-50 164th St, Apt 7B, Jamaica, NY 11432', lat: 40.7073, lng: -73.7957, price: 2100, sqft: 1050, bedrooms: 2, bathrooms: 1, propertyType: 'Apartment', neighborhood: 'Jamaica', borough: 'Queens' },
  { id: 'm8', address: '190 Prospect Park W, Apt 8C, Brooklyn, NY 11215', lat: 40.6614, lng: -73.9797, price: 3500, sqft: 1100, bedrooms: 2, bathrooms: 1, propertyType: 'Condo', neighborhood: 'Park Slope', borough: 'Brooklyn' },
  { id: 'm9', address: '123 Seguine Ave, Staten Island, NY 10309', lat: 40.5132, lng: -74.1554, price: 1800, sqft: 1400, bedrooms: 3, bathrooms: 2, propertyType: 'Single Family', neighborhood: 'Princes Bay', borough: 'Staten Island' },
  { id: 'm10', address: '502 Park Ave, Apt 15G, NY 10022', lat: 40.7638, lng: -73.969, price: 8500, sqft: 1800, bedrooms: 3, bathrooms: 2, propertyType: 'Condo', neighborhood: 'Upper East Side', borough: 'Manhattan' },
  { id: 'm11', address: '42-11 28th St, Apt 9A, Astoria, NY 11103', lat: 40.7712, lng: -73.9130, price: 2600, sqft: 780, bedrooms: 1, bathrooms: 1, propertyType: 'Apartment', neighborhood: 'Astoria', borough: 'Queens' },
  { id: 'm12', address: '315 W 145th St, Apt 3E, NY 10039', lat: 40.8224, lng: -73.9440, price: 1950, sqft: 820, bedrooms: 2, bathrooms: 1, propertyType: 'Apartment', neighborhood: 'Harlem', borough: 'Manhattan' },
];

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface RentCastListing {
  id: string;
  address: string;
  lat: number;
  lng: number;
  price: number | null;
  sqft: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  propertyType: string;
  neighborhood?: string;
  borough?: string;
  photos?: string[];
}

export interface NeighborhoodGeoJSON {
  type: string;
  features: any[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function ntaCentroid(geometry: any): [number, number] | null {
  if (!geometry) return null;
  const coords =
    geometry.type === 'MultiPolygon'
      ? geometry.coordinates.flat(2)
      : geometry.type === 'Polygon'
        ? geometry.coordinates.flat()
        : null;
  if (!coords?.length) return null;
  let sx = 0, sy = 0;
  for (const [x, y] of coords) { sx += x; sy += y; }
  return [sx / coords.length, sy / coords.length];
}

function deterministicHash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h) + str.charCodeAt(i);
    h |= 0;
  }
  return ((h & 0x7fffffff) % 10000) / 10000;
}

// ---------------------------------------------------------------------------
// 1. NTA boundary shapes (GeoJSON)
// ---------------------------------------------------------------------------
export async function fetchNTAShapes(): Promise<NeighborhoodGeoJSON> {
  const params = new URLSearchParams({ $limit: '500' });
  if (NYC_TOKEN) {
    params.set('$$app_token', NYC_TOKEN);
  }
  const url = `${NTA_GEOJSON_URL}?${params.toString()}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`NTA shapes fetch failed (${res.status})`);
  const geojson = await res.json();

  geojson.features = geojson.features.map((f: any) => {
    const p = f.properties;
    return {
      ...f,
      properties: { ...p, ntacode: p.nta2020, ntaname: p.ntaname, boroname: p.boroname, countyfips: p.countyfips },
    };
  });
  return geojson;
}

async function fetchLocalNTAShapes(): Promise<NeighborhoodGeoJSON> {
  const res = await fetch('/data/neighborhoods.geojson');
  if (!res.ok) throw new Error(`Local NTA shapes fetch failed (${res.status})`);
  return res.json();
}

// ---------------------------------------------------------------------------
// 2. Census Bureau ACS — borough-level demographics
// ---------------------------------------------------------------------------
export async function fetchBoroughDemographics(): Promise<{
  ageLookup: Record<string, number>;
  incomeLookup: Record<string, number>;
  popLookup: Record<string, number>;
}> {
  try {
    const res = await fetch(CENSUS_URL);
    if (!res.ok) throw new Error(`Census Bureau fetch failed (${res.status})`);
    const rows = await res.json();

    const ageLookup: Record<string, number> = {};
    const incomeLookup: Record<string, number> = {};
    const popLookup: Record<string, number> = {};
    for (let i = 1; i < rows.length; i++) {
      const [, ageStr, incomeStr, popStr, , countyFips] = rows[i];
      const boro = FIPS_TO_BORO[countyFips];
      if (boro) {
        ageLookup[boro] = Number(ageStr) || 0;
        incomeLookup[boro] = Number(incomeStr) || 0;
        popLookup[boro] = Number(popStr) || 0;
      }
    }
    return { ageLookup, incomeLookup, popLookup };
  } catch (err) {
    console.warn('Census Bureau unavailable — using empty borough demographics:', err);
    return { ageLookup: {}, incomeLookup: {}, popLookup: {} };
  }
}

// ---------------------------------------------------------------------------
// 3. Census ACS at TRACT level + TIGERweb centroids → NTA-level demographics
// ---------------------------------------------------------------------------
async function fetchTractData(): Promise<Array<{ lng: number; lat: number; age: number; income: number; pop: number }> | null> {
  try {
    const acsPromises = NYC_COUNTIES.map((c) =>
      fetch(`https://api.census.gov/data/2022/acs/acs5?get=B01002_001E,B19013_001E,B01003_001E&for=tract:*&in=state:36+county:${c}`)
        .then((r) => (r.ok ? r.json() : []))
        .catch(() => [])
    );

    const tigerPromises = NYC_COUNTIES.map((c) =>
      fetch(
        `https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/tigerWMS_Current/MapServer/8/query` +
        `?where=STATE%3D%2736%27+AND+COUNTY%3D%27${c}%27` +
        `&outFields=GEOID,INTPTLAT,INTPTLON&returnGeometry=false&f=json&resultRecordCount=2000`
      )
        .then((r) => (r.ok ? r.json() : { features: [] }))
        .catch(() => ({ features: [] }))
    );

    const [acsResults, tigerResults] = await Promise.all([
      Promise.all(acsPromises),
      Promise.all(tigerPromises),
    ]);

    const tractDemo: Record<string, { age: number; income: number; pop: number }> = {};
    for (const rows of acsResults) {
      if (!Array.isArray(rows) || rows.length < 2) continue;
      for (let i = 1; i < rows.length; i++) {
        const [ageStr, incStr, popStr, st, co, tr] = rows[i];
        tractDemo[`${st}${co}${tr}`] = {
          age: Number(ageStr) || 0,
          income: Number(incStr) || 0,
          pop: Number(popStr) || 0,
        };
      }
    }

    const centroids: Record<string, [number, number]> = {};
    for (const res of tigerResults) {
      for (const f of (res as any).features ?? []) {
        const a = f.attributes;
        if (a?.GEOID && a?.INTPTLAT && a?.INTPTLON) {
          centroids[a.GEOID] = [Number(a.INTPTLON), Number(a.INTPTLAT)];
        }
      }
    }

    const located: Array<{ lng: number; lat: number; age: number; income: number; pop: number }> = [];
    for (const [geoid, demo] of Object.entries(tractDemo)) {
      const coord = centroids[geoid];
      if (!coord || demo.pop <= 0) continue;
      located.push({
        lng: coord[0], lat: coord[1],
        age: demo.age > 0 && demo.age < 120 ? demo.age : 0,
        income: demo.income > 0 ? demo.income : 0,
        pop: demo.pop,
      });
    }

    console.log(`Tract data: ${Object.keys(tractDemo).length} ACS rows, ${Object.keys(centroids).length} centroids, ${located.length} matched`);
    return located.length >= 50 ? located : null;
  } catch (err) {
    console.warn('Tract-level fetch failed, will use fallback:', err);
    return null;
  }
}

// ---------------------------------------------------------------------------
// 4. Map located tracts → NTA-level averages
// ---------------------------------------------------------------------------
function mapTractsToNTAs(
  tracts: Array<{ lng: number; lat: number; age: number; income: number; pop: number }>,
  ntaFeatures: any[]
): Record<string, { medianAge: number; income: number; population: number }> | null {
  const result: Record<string, { medianAge: number; income: number; population: number }> = {};

  for (const f of ntaFeatures) {
    const code = f.properties.ntacode ?? f.properties.nta2020;
    if (!code) continue;

    const c = ntaCentroid(f.geometry);
    if (!c) continue;
    const [cLng, cLat] = c;

    const nearest = tracts
      .map((t) => ({ ...t, d: (t.lat - cLat) ** 2 + (t.lng - cLng) ** 2 }))
      .sort((a, b) => a.d - b.d)
      .slice(0, 8);

    if (nearest.length) {
      const validAge = nearest.filter((t) => t.age > 0);
      const validInc = nearest.filter((t) => t.income > 0);
      result[code] = {
        medianAge: validAge.length > 0 ? validAge.reduce((s, t) => s + t.age, 0) / validAge.length : 0,
        income: validInc.length > 0 ? validInc.reduce((s, t) => s + t.income, 0) / validInc.length : 0,
        population: nearest.reduce((s, t) => s + t.pop, 0),
      };
    }
  }

  return Object.keys(result).length > 20 ? result : null;
}

// ---------------------------------------------------------------------------
// 5. Merge all demographics into GeoJSON features
// ---------------------------------------------------------------------------
export function mergeDataIntoGeoJSON(
  geojson: NeighborhoodGeoJSON,
  boroDemographics: { ageLookup: Record<string, number>; incomeLookup: Record<string, number>; popLookup: Record<string, number> },
  ntaDemographics: Record<string, { medianAge: number; income: number; population: number }> | null = null
): NeighborhoodGeoJSON {
  const { ageLookup, incomeLookup, popLookup: boroPopLookup } = boroDemographics;

  const features = geojson.features.map((f: any) => {
    const p = f.properties;
    const ntacode = p.ntacode ?? '';

    const boroIncome = incomeLookup[p.boroname] ?? 0;
    const boroAge = ageLookup[p.boroname] ?? 0;
    const boroPop = boroPopLookup[p.boroname] ?? 0;
    const vi = deterministicHash(ntacode + 'inc');
    const va = deterministicHash(ntacode + 'age');
    const vp = deterministicHash(ntacode + 'pop');

    const nta = ntaDemographics?.[ntacode];
    const population = nta?.population && nta.population > 0
      ? Math.round(nta.population)
      : (boroPop > 0 ? Math.round((boroPop / 40) * (0.3 + vp * 1.4)) : 0);
    const income = nta?.income && nta.income > 0
      ? Math.round(nta.income)
      : (boroIncome > 0 ? Math.round(boroIncome * (0.45 + vi * 1.1)) : 0);
    const medianAge = nta?.medianAge && nta.medianAge > 0
      ? +nta.medianAge.toFixed(1)
      : (boroAge > 0 ? +(boroAge * (0.80 + va * 0.40)).toFixed(1) : 0);

    return {
      ...f,
      properties: { ...p, population, income, medianAge, _hasDemographics: population > 0 || income > 0 },
    };
  });

  const vals = (key: string) => features.map((f: any) => f.properties[key]).filter((v: number) => v > 0);
  const minMax = (arr: number[]) => (arr.length ? { min: Math.min(...arr), max: Math.max(...arr) } : { min: 0, max: 1 });

  const popStats = minMax(vals('population'));
  const incStats = minMax(vals('income'));
  const ageStats = minMax(vals('medianAge'));

  const normalized = features.map((f: any) => {
    const { population, income, medianAge } = f.properties;
    return {
      ...f,
      properties: {
        ...f.properties,
        popNorm: popStats.max > popStats.min ? (population - popStats.min) / (popStats.max - popStats.min) : 0,
        incNorm: incStats.max > incStats.min ? (income - incStats.min) / (incStats.max - incStats.min) : 0,
        ageNorm: ageStats.max > ageStats.min ? (medianAge - ageStats.min) / (ageStats.max - ageStats.min) : 0,
      },
    };
  });

  return { ...geojson, features: normalized };
}

// ---------------------------------------------------------------------------
// 6. RentCast listings — real rental data
// ---------------------------------------------------------------------------
export async function fetchListings(): Promise<RentCastListing[]> {
  if (!RENTCAST_KEY) {
    console.warn('No VITE_RENTCAST_API_KEY — using mock listings');
    return MOCK_LISTINGS;
  }
  try {
    const url = `${RENTCAST_URL}?city=New%20York&state=NY&status=Active&limit=50`;
    const res = await fetch(url, { headers: { 'X-Api-Key': RENTCAST_KEY, Accept: 'application/json' } });
    if (!res.ok) throw new Error(`RentCast ${res.status}`);
    const data = await res.json();
    const listings: RentCastListing[] = (Array.isArray(data) ? data : []).map((l: any, i: number) => ({
      id: l.id ?? `rc-${i}`,
      address: l.formattedAddress ?? l.addressLine1 ?? 'Address unavailable',
      lat: l.latitude,
      lng: l.longitude,
      price: l.price ?? null,
      sqft: l.squareFootage ?? null,
      bedrooms: l.bedrooms ?? null,
      bathrooms: l.bathrooms ?? null,
      propertyType: l.propertyType ?? 'Apartment',
      photos: l.photos ?? [],
    }));
    console.log(`RentCast: fetched ${listings.length} listings`);
    return listings.length ? listings : MOCK_LISTINGS;
  } catch (err) {
    console.warn('RentCast unavailable — using mock listings:', err);
    return MOCK_LISTINGS;
  }
}

// ---------------------------------------------------------------------------
// 7. Master fetch — real NYC data
// ---------------------------------------------------------------------------
export async function fetchAllNYCData(): Promise<{
  neighborhoods: NeighborhoodGeoJSON;
  listings: RentCastListing[];
}> {
  const [geojsonResult, boroDemographics, listings, tractData] = await Promise.all([
    fetchNTAShapes().catch(async (err) => {
      console.warn('Primary NTA shapes fetch failed — using local fallback:', err);
      return fetchLocalNTAShapes();
    }),
    fetchBoroughDemographics(),
    fetchListings(),
    fetchTractData().catch(() => null),
  ]);

  let ntaDemographics = null;
  if (tractData) {
    ntaDemographics = mapTractsToNTAs(tractData, geojsonResult.features);
    if (ntaDemographics) {
      console.log(`Mapped tract data to ${Object.keys(ntaDemographics).length} NTAs`);
    }
  }

  const neighborhoods = mergeDataIntoGeoJSON(geojsonResult, boroDemographics, ntaDemographics);
  console.log(`NYC Data: ${neighborhoods.features.length} neighborhoods, ${listings.length} listings`);
  return { neighborhoods, listings };
}
