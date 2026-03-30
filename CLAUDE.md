# Trip Planner MVP

## Tech Stack
- Next.js 15 App Router, TypeScript
- Tailwind CSS + shadcn/ui components
- Supabase (auth + PostgreSQL database)
- Groq API for trip generation (ultra-fast inference, OpenAI-compatible, free tier with generous limits)
- SerpAPI Google Flights for flight search (FREE tier - 100 searches/month)
- Leaflet + OpenStreetMap for maps (FREE, no API key)
- Deploy on Vercel (FREE tier)

## Project Rules
- Hebrew UI with FULL RTL support:
  - dir="rtl" on html element
  - All text, labels, placeholders, and buttons in Hebrew
  - Form layouts flow right-to-left
  - Navigation items ordered RTL
  - Icons and arrows mirrored where needed (chevrons, back buttons)
  - Number inputs and sliders work naturally in RTL
- Currency: Israeli Shekels (ILS, symbol: ₪) everywhere - budget input, price displays, budget breakdowns
- All prices multiply by number of travelers (not per-person unless labeled)
- Use Server Components by default, Client Components only when needed (forms, maps, interactive elements)
- All API keys in .env.local - never commit secrets
- Use Supabase MCP for database operations when possible
- Use Context7 for up-to-date docs (add "use context7" to prompts about Next.js, Supabase, Tailwind)
- One big prompt is better than many small ones - batch related tasks together

## Architecture
- /app - Next.js pages and API routes
- /app/api - Server-side API routes (Groq, SerpAPI flights, Supabase)
- /components - Reusable UI components (shadcn/ui based)
- /components/ui - shadcn/ui primitives
- /lib - Utility functions, API clients, Supabase client
- /types - TypeScript interfaces

## Key Features (in build order)
1. Trip input form: destination, budget (₪), travelers (count + type), interests survey, synced days slider + date picker, flexible dates toggle
2. AI-generated daily itinerary personalized by traveler type, interests, and group size - via Groq
3. Real flight search via SerpAPI Google Flights with flexible date pricing
4. Trip cost breakdown with REAL estimated rates - calculated for total number of travelers:
   - Flights: actual prices from SerpAPI x number of travelers
   - Accommodation: 2 options - central vs non-central (price per room, suggest room count based on group)
   - Food: 2 tiers - mid-range vs luxurious, per day x travelers
   - Activities: average cost per day x travelers
   - Total trip cost estimate combining all categories
5. Trip summary: total attractions, top highlights, main restaurants, key activities at a glance
6. Interactive map showing attractions (Leaflet + OpenStreetMap)
7. Supabase Auth (Google + Email/Password)
8. Save trips to Supabase database
9. Share trip via public URL /trip/[id]

## Traveler Preferences (Form Section)
The form must collect traveler info BEFORE generating the trip:
- **Number of travelers**: number input (1-10), default 2
- **Traveler type**: select one - solo, couple, family (with kids), friends group
- **Age range**: select - 18-25, 25-35, 35-50, 50+, mixed ages
- **Trip interests**: multi-select checkboxes (pick 1-4):
  - Attractions & landmarks
  - Nightlife & bars
  - Food & restaurants
  - Nature & hiking
  - Shopping
  - Culture & museums
  - Beach & relaxation
  - Adventure & extreme sports
- These preferences are sent to both the Groq API (for itinerary personalization) and affect the cost calculations

## Synced Date Picker + Days Slider
The date range picker and days slider MUST stay perfectly in sync at ALL times:
- If user picks start date May 1 and end date May 7 -> slider auto-updates to 7 days
- If user changes slider from 7 to 13 days -> end date MUST update to May 13
- If user changes start date to May 5 (while slider is 13) -> end date updates to May 17
- If user changes end date to May 10 (while start is May 5) -> slider updates to 6 days
- CRITICAL: Every change to either control must immediately update the other. No conflicts allowed.
- Implementation: use a single state with startDate + days as source of truth. Derive endDate from startDate + days. When endDate changes, recalculate days.

## Flexible Dates Feature
- Toggle: "I'm flexible with dates" checkbox
- When enabled: user picks a whole month (e.g., "August 2026") instead of exact dates
- Flight search MUST only return results within the selected month - never show June flights when August is selected
- Show results grouped by week within the month:
  - "Week 1 (Aug 1-7): average ₪X per person"
  - "Week 2 (Aug 8-14): average ₪Y per person"
  - "Week 3 (Aug 15-21): average ₪Z per person"
  - "Week 4 (Aug 22-31): average ₪W per person"
- Highlight the cheapest week
- Within each week, show the 2-3 cheapest specific date combinations
- User can click a week/date to select it and switch back to exact dates mode

## Trip Summary Section
After the itinerary is generated, show a quick summary card at the top of results:
- Total number of attractions/landmarks to visit
- Top 3-5 main attractions (the must-see highlights)
- Top 3 recommended restaurants
- Main activities by category (based on user's selected interests)
- Estimated total trip cost range (budget combo to luxury combo)
- Number of travelers and trip type reminder

## Trip Cost Breakdown
The app must show a detailed cost breakdown based on real data, calculated for ALL travelers:
- **Flights**: Real prices from SerpAPI Google Flights x number of travelers
- **Accommodation (2 options)**:
  - Central/tourist area hotel - higher price, better location
  - Non-central/budget area hotel - lower price, further from attractions
  - Suggest number of rooms based on group type (couple=1, family=1-2, friends=by pairs)
  - Show per-night rate AND total for all nights
- **Food (2 tiers)**:
  - Mid-range: average restaurant meals per day x travelers
  - Luxurious: upscale dining per day x travelers
- **Activities**: Average daily cost x travelers (some activities have group discounts - note this)
- **Total**: Sum of all categories for the full group, shown prominently
- Also show per-person breakdown below the total
- All prices in ₪ (ILS)

## API Integration Notes
- Groq: use `groq-sdk` npm package (`import Groq from 'groq-sdk'`), or alternatively `openai` package with baseURL: `https://api.groq.com/openai/v1`
- SerpAPI: REST API, endpoint: `https://serpapi.com/search.json?engine=google_flights`
- Supabase: Use `@supabase/supabase-js` client, auth helpers for Next.js
