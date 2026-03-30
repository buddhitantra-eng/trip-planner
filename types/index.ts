export type TravelerType = "solo" | "couple" | "family" | "friends";

export type AgeRange = "18-25" | "25-35" | "35-50" | "50+" | "mixed";

export type Interest =
  | "attractions"
  | "nightlife"
  | "food"
  | "nature"
  | "shopping"
  | "culture"
  | "beach"
  | "adventure";

export interface TravelerPreferences {
  count: number;
  type: TravelerType;
  ageRange: AgeRange;
  interests: Interest[];
}

export interface TripFormData {
  destination: string;
  originCity: string;
  budgetIls: number;
  dateStart: string;
  dateEnd: string;
  days: number;
  flexibleDates: boolean;
  flexibleMonth?: string;
  travelers: TravelerPreferences;
}

export interface ActivityItem {
  time: string;
  name: string;
  description: string;
  durationMinutes: number;
  estimatedCostIls: number;
  category: Interest;
  lat?: number;
  lng?: number;
  address?: string;
  tips?: string;
}

export interface DayPlan {
  dayNumber: number;
  date: string;
  theme: string;
  activities: ActivityItem[];
  meals: {
    breakfast?: string;
    lunch?: string;
    dinner?: string;
  };
  dailyBudgetIls: number;
  notes?: string;
}

export interface ItineraryData {
  summary: string;
  days: DayPlan[];
  generalTips: string[];
  bestTimeToVisit?: string;
  weatherNote?: string;
}

export interface FlightLeg {
  airline: string;
  flightNumber: string;
  departureAirport: string;
  arrivalAirport: string;
  departureTime: string;
  arrivalTime: string;
  durationMinutes: number;
  stops: number;
}

export interface FlightOption {
  id: string;
  outbound: FlightLeg[];
  inbound: FlightLeg[];
  totalPriceIls: number;
  pricePerPersonIls: number;
  bookingUrl?: string;
  airline: string;
  totalDurationMinutes: number;
  stops: number;
}

export interface FlightsData {
  options: FlightOption[];
  searchedAt: string;
  origin: string;
  destination: string;
  cheapestPriceIls: number;
}

export interface CostBreakdownItem {
  label: string;
  amountIls: number;
  percentage: number;
  color: string;
}

export interface CostBreakdown {
  totalBudgetIls: number;
  totalEstimatedCostIls: number;
  items: CostBreakdownItem[];
  surplusOrDeficitIls: number;
  isOverBudget: boolean;
  perPersonIls: number;
}

export type TripStatus = "draft" | "generating" | "ready" | "error";

export interface Trip {
  id: string;
  userId: string | null;
  shareToken: string;
  status: TripStatus;
  destination: string;
  destinationLat: number | null;
  destinationLng: number | null;
  budgetIls: number;
  dateStart: string;
  dateEnd: string;
  flexibleDates: boolean;
  travelersCount: number;
  travelersType: TravelerType;
  ageRangeMin: number;
  ageRangeMax: number;
  interests: Interest[];
  originCity: string;
  originIata: string;
  itinerary: ItineraryData | null;
  flights: FlightsData | null;
  costBreakdown: CostBreakdown | null;
  generationError: string | null;
  createdAt: string;
  updatedAt: string;
}

export type TripSummary = Omit<
  Trip,
  "itinerary" | "flights" | "costBreakdown"
>;
