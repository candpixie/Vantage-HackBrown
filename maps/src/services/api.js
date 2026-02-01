const NYC_TOKEN = import.meta.env.VITE_NYC_DATA_TOKEN;
const RENTCAST_KEY = import.meta.env.VITE_RENTCAST_API_KEY;

const NTA_GEOJSON_URL = 'https://data.cityofnewyork.us/resource/9nt8-h7nd.geojson';
const POPULATION_URL = 'https://data.cityofnewyork.us/resource/swpk-hqdp.json';
const CENSUS_URL =
  'https://api.census.gov/data/2022/acs/acs5?get=NAME,B01002_001E,B19013_001E,B01003_001E&for=county:005,047,061,081,085&in=state:36';
const RENTCAST_URL = 'https://api.rentcast.io/v1/listings/rental';

const FIPS_TO_BORO = {
  '005': 'Bronx',
  '047': 'Brooklyn',
  '061': 'Manhattan',
  '081': 'Queens',
  '085': 'Staten Island',
};

const NYC_COUNTIES = ['005', '047', '061', '081', '085'];

// ---------------------------------------------------------------------------
// Mock listings — residential rentals, used when RentCast is unavailable
// ---------------------------------------------------------------------------
const MOCK_LISTINGS = [
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
].map((l) => ({
  ...l,
  photos: [],
  listingType: 'Rental',
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
export function formatPrice(price) {
  if (price == null) return '';
  if (price >= 10000) return `$${Math.round(price / 1000)}K`;
  if (price >= 1000) {
    const k = price / 1000;
    return k === Math.floor(k) ? `$${k}K` : `$${k.toFixed(1)}K`;
  }
  return `$${price}`;
}

export function findNeighborhoodForProperty(property, geojson) {
  if (!property?.lat || !property?.lng || !geojson?.features) return null;
  let best = null;
  let bestDist = Infinity;
  for (const f of geojson.features) {
    const geom = f.geometry;
    if (!geom) continue;
    const coords = geom.type === 'MultiPolygon' ? geom.coordinates.flat(2) : geom.type === 'Polygon' ? geom.coordinates.flat() : null;
    if (!coords?.length) continue;
    let sx = 0, sy = 0;
    for (const [x, y] of coords) { sx += x; sy += y; }
    const cx = sx / coords.length, cy = sy / coords.length;
    const d = (property.lat - cy) ** 2 + (property.lng - cx) ** 2;
    if (d < bestDist) { bestDist = d; best = f.properties; }
  }
  return best;
}

function ntaCentroid(geometry) {
  if (!geometry) return null;
  const coords = geometry.type === 'MultiPolygon' ? geometry.coordinates.flat(2) : geometry.type === 'Polygon' ? geometry.coordinates.flat() : null;
  if (!coords?.length) return null;
  let sx = 0, sy = 0;
  for (const [x, y] of coords) { sx += x; sy += y; }
  return [sx / coords.length, sy / coords.length]; // [lng, lat]
}

// Deterministic hash for fallback variation — same NTA always yields same value
function deterministicHash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h) + str.charCodeAt(i);
    h |= 0;
  }
  return ((h & 0x7fffffff) % 10000) / 10000; // 0–1
}

// ---------------------------------------------------------------------------
// 1. NTA boundary shapes (GeoJSON)
// ---------------------------------------------------------------------------
export async function fetchNTAShapes() {
  const url = `${NTA_GEOJSON_URL}?$limit=500&$$app_token=${NYC_TOKEN}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`NTA shapes fetch failed (${res.status})`);
  const geojson = await res.json();

  geojson.features = geojson.features.map((f) => {
    const p = f.properties;
    return {
      ...f,
      properties: { ...p, ntacode: p.nta2020, ntaname: p.ntaname, boroname: p.boroname, countyfips: p.countyfips },
    };
  });
  return geojson;
}

// ---------------------------------------------------------------------------
// 2. Population by NTA (2010 codes — prefix-matched to 2020 codes)
// ---------------------------------------------------------------------------
export async function fetchPopulation() {
  const url = `${POPULATION_URL}?$where=year='2010'&$limit=500&$$app_token=${NYC_TOKEN}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Population fetch failed (${res.status})`);
  return res.json();
}

// ---------------------------------------------------------------------------
// 3. Census Bureau ACS — borough-level fallback
// ---------------------------------------------------------------------------
export async function fetchBoroughDemographics() {
  const res = await fetch(CENSUS_URL);
  if (!res.ok) throw new Error(`Census Bureau fetch failed (${res.status})`);
  const rows = await res.json();

  const ageLookup = {};
  const incomeLookup = {};
  const popLookup = {};
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
}

// ---------------------------------------------------------------------------
// 3b. Census ACS at TRACT level + TIGERweb centroids → NTA-level demographics
// ---------------------------------------------------------------------------
async function fetchTractData() {
  try {
    // Fetch tract-level ACS data (median age + income + population) — one call per county
    const acsPromises = NYC_COUNTIES.map((c) =>
      fetch(`https://api.census.gov/data/2022/acs/acs5?get=B01002_001E,B19013_001E,B01003_001E&for=tract:*&in=state:36+county:${c}`)
        .then((r) => (r.ok ? r.json() : []))
        .catch(() => [])
    );

    // Fetch tract internal-point coordinates from TIGERweb
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

    // Parse ACS rows → { geoid: { age, income, pop } }
    const tractDemo = {};
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

    // Parse TIGERweb → { geoid: [lng, lat] }
    const centroids = {};
    for (const res of tigerResults) {
      for (const f of res.features ?? []) {
        const a = f.attributes;
        if (a?.GEOID && a?.INTPTLAT && a?.INTPTLON) {
          centroids[a.GEOID] = [Number(a.INTPTLON), Number(a.INTPTLAT)];
        }
      }
    }

    // Combine — only tracts with both demo data and coordinates
    // Filter out Census sentinel values (e.g. -666666666 for missing data)
    const located = [];
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

// Map located tracts → NTA-level averages (K-nearest tracts per NTA centroid)
function mapTractsToNTAs(tracts, ntaFeatures) {
  const result = {};

  for (const f of ntaFeatures) {
    const code = f.properties.ntacode ?? f.properties.nta2020;
    if (!code) continue;

    const c = ntaCentroid(f.geometry);
    if (!c) continue;
    const [cLng, cLat] = c;

    // Find 8 nearest tracts and average their values
    const nearest = tracts
      .map((t) => ({ ...t, d: (t.lat - cLat) ** 2 + (t.lng - cLng) ** 2 }))
      .sort((a, b) => a.d - b.d)
      .slice(0, 8);

    if (nearest.length) {
      // Only average non-zero values for income/age to avoid Census nulls dragging averages down
      const validAge = nearest.filter((t) => t.age > 0);
      const validInc = nearest.filter((t) => t.income > 0);
      result[code] = {
        medianAge: validAge.length > 0 ? validAge.reduce((s, t) => s + t.age, 0) / validAge.length : 0,
        income: validInc.length > 0 ? validInc.reduce((s, t) => s + t.income, 0) / validInc.length : 0,
        population: nearest.reduce((s, t) => s + t.pop, 0), // sum, not average
      };
    }
  }

  return Object.keys(result).length > 20 ? result : null;
}

// ---------------------------------------------------------------------------
// 4. Merge all demographics into GeoJSON features
// ---------------------------------------------------------------------------
export function mergeDataIntoGeoJSON(geojson, boroDemographics, ntaDemographics = null) {
  const { ageLookup, incomeLookup, popLookup: boroPopLookup } = boroDemographics;

  const features = geojson.features.map((f) => {
    const p = f.properties;
    const ntacode = p.ntacode ?? '';

    let population, income, medianAge;

    // Borough base + hash variation (used as fallback per-field)
    const boroIncome = incomeLookup[p.boroname] ?? 0;
    const boroAge = ageLookup[p.boroname] ?? 0;
    const boroPop = boroPopLookup[p.boroname] ?? 0;
    const vi = deterministicHash(ntacode + 'inc');
    const va = deterministicHash(ntacode + 'age');
    const vp = deterministicHash(ntacode + 'pop');

    const nta = ntaDemographics?.[ntacode];
    // Use NTA-level data when valid, fall back to borough+hash per field
    population = nta?.population > 0
      ? Math.round(nta.population)
      : (boroPop > 0 ? Math.round((boroPop / 40) * (0.3 + vp * 1.4)) : 0);
    income = nta?.income > 0
      ? Math.round(nta.income)
      : (boroIncome > 0 ? Math.round(boroIncome * (0.45 + vi * 1.1)) : 0);
    medianAge = nta?.medianAge > 0
      ? +nta.medianAge.toFixed(1)
      : (boroAge > 0 ? +(boroAge * (0.80 + va * 0.40)).toFixed(1) : 0);

    return {
      ...f,
      properties: { ...p, population, income, medianAge, _hasDemographics: population > 0 || income > 0 },
    };
  });

  const vals = (key) => features.map((f) => f.properties[key]).filter((v) => v > 0);
  const minMax = (arr) => (arr.length ? { min: Math.min(...arr), max: Math.max(...arr) } : { min: 0, max: 1 });

  const popStats = minMax(vals('population'));
  const incStats = minMax(vals('income'));
  const ageStats = minMax(vals('medianAge'));

  const normalized = features.map((f) => {
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
// 5. RentCast listings — residential rentals (falls back to mock data)
// ---------------------------------------------------------------------------
export async function fetchListings() {
  try {
    const url = `${RENTCAST_URL}?city=New%20York&state=NY&status=Active&limit=50`;
    const res = await fetch(url, { headers: { 'X-Api-Key': RENTCAST_KEY, Accept: 'application/json' } });
    if (!res.ok) throw new Error(`${res.status}`);
    const data = await res.json();
    const listings = (Array.isArray(data) ? data : []).map((l, i) => ({
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
      listingType: l.listingType ?? 'Rental',
    }));
    return listings.length ? listings : MOCK_LISTINGS;
  } catch {
    console.warn('RentCast unavailable — using mock listings');
    return MOCK_LISTINGS;
  }
}

// ---------------------------------------------------------------------------
// 6. Neighbourhood summary for AI prompts
// ---------------------------------------------------------------------------
export function buildNeighborhoodSummary(geojson) {
  if (!geojson?.features) return [];
  return geojson.features
    .filter((f) => f.properties._hasDemographics)
    .map((f) => ({
      ntacode: f.properties.ntacode,
      name: f.properties.ntaname,
      borough: f.properties.boroname,
      population: f.properties.population,
      medianAge: f.properties.medianAge,
      medianHouseholdIncome: f.properties.income,
    }));
}

// ---------------------------------------------------------------------------
// 7. Master fetch
// ---------------------------------------------------------------------------
export async function fetchAllData() {
  const [geojson, boroDemographics, listings, tractData] = await Promise.all([
    fetchNTAShapes(),
    fetchBoroughDemographics(),
    fetchListings(),
    fetchTractData(),
  ]);

  // Map tract data to NTA-level demographics if available
  let ntaDemographics = null;
  if (tractData) {
    ntaDemographics = mapTractsToNTAs(tractData, geojson.features);
    if (ntaDemographics) {
      console.log(`Mapped tract data to ${Object.keys(ntaDemographics).length} NTAs`);
    }
  }

  const neighborhoods = mergeDataIntoGeoJSON(geojson, boroDemographics, ntaDemographics);
  return { neighborhoods, listings };
}
