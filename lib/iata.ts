// City name → IATA airport code mapping
const IATA_MAP: Record<string, string> = {
  // Israel
  "תל אביב": "TLV", "tel aviv": "TLV", "tlv": "TLV",
  "אילת": "ETH", "eilat": "ETH",
  // Europe
  "לונדון": "LHR", "london": "LHR",
  "פריז": "CDG", "paris": "CDG",
  "רומא": "FCO", "rome": "FCO",
  "ברצלונה": "BCN", "barcelona": "BCN",
  "אמסטרדם": "AMS", "amsterdam": "AMS",
  "ברלין": "BER", "berlin": "BER",
  "מדריד": "MAD", "madrid": "MAD",
  "וינה": "VIE", "vienna": "VIE",
  "פראג": "PRG", "prague": "PRG",
  "בודפשט": "BUD", "budapest": "BUD",
  "אתונה": "ATH", "athens": "ATH",
  "ליסבון": "LIS", "lisbon": "LIS",
  "דובאי": "DXB", "dubai": "DXB",
  "איסטנבול": "IST", "istanbul": "IST",
  // Asia
  "טוקיו": "NRT", "tokyo": "NRT",
  "בנגקוק": "BKK", "bangkok": "BKK",
  "סינגפור": "SIN", "singapore": "SIN",
  "הונג קונג": "HKG", "hong kong": "HKG",
  "בייג'ינג": "PEK", "beijing": "PEK",
  "מומבאי": "BOM", "mumbai": "BOM",
  "דלהי": "DEL", "delhi": "DEL",
  // Americas
  "ניו יורק": "JFK", "new york": "JFK",
  "לוס אנג'לס": "LAX", "los angeles": "LAX",
  "מיאמי": "MIA", "miami": "MIA",
  "שיקגו": "ORD", "chicago": "ORD",
  "טורונטו": "YYZ", "toronto": "YYZ",
  // Africa
  "קהיר": "CAI", "cairo": "CAI",
  "קפטאון": "CPT", "cape town": "CPT",
  "נירובי": "NBO", "nairobi": "NBO",
};

export function cityToIata(city: string): string {
  const key = city.trim().toLowerCase();
  // Direct match
  if (IATA_MAP[key]) return IATA_MAP[key];
  // Partial match
  for (const [name, code] of Object.entries(IATA_MAP)) {
    if (key.includes(name) || name.includes(key)) return code;
  }
  // Fallback: return first 3 chars uppercased as best-effort IATA
  return city.slice(0, 3).toUpperCase();
}
