import type { TripFormData } from "@/types";

const INTEREST_LABELS: Record<string, string> = {
  attractions: "אטרקציות ואתרים",
  nightlife: "חיי לילה ובארים",
  food: "אוכל ומסעדות",
  nature: "טבע וטיולים",
  shopping: "קניות",
  culture: "תרבות ומוזיאונים",
  beach: "חוף וים",
  adventure: "אקסטרים והרפתקאות",
};

const TRAVELER_LABELS: Record<string, string> = {
  solo: "יחיד/ה",
  couple: "זוג",
  family: "משפחה עם ילדים",
  friends: "קבוצת חברים",
};

export function buildTripPrompt(form: TripFormData): string {
  const { destination, budgetIls, days, travelers } = form;
  const interests = travelers.interests
    .map((i) => INTEREST_LABELS[i] ?? i)
    .join(", ");
  const travelerType = TRAVELER_LABELS[travelers.type] ?? travelers.type;

  return `אתה מתכנן טיולים מומחה. תכנן מסלול טיול מפורט ל${destination}.

פרטי הטיול:
- יעד: ${destination}
- משך: ${days} ימים
- תקציב כולל: ₪${budgetIls.toLocaleString("he-IL")}
- נוסעים: ${travelers.count} (${travelerType})
- טווח גילאים: ${travelers.ageRange}
- תחומי עניין: ${interests}

החזר JSON בלבד (ללא markdown, ללא הסברים נוספים) במבנה הבא:

{
  "summary": "תיאור קצר של הטיול בעברית",
  "highlights": ["אטרקציה 1", "אטרקציה 2", "אטרקציה 3"],
  "topRestaurants": ["מסעדה 1", "מסעדה 2", "מסעדה 3"],
  "totalAttractions": 12,
  "costRange": {
    "min": 8000,
    "max": 14000
  },
  "days": [
    {
      "dayNumber": 1,
      "date": "יום ראשון",
      "theme": "נושא היום בעברית",
      "morning": {
        "activity": "שם פעילות",
        "description": "תיאור קצר בעברית",
        "duration": "2 שעות",
        "costIls": 80,
        "tip": "טיפ מקומי"
      },
      "afternoon": {
        "activity": "שם פעילות",
        "description": "תיאור קצר בעברית",
        "duration": "3 שעות",
        "costIls": 120,
        "tip": "טיפ מקומי"
      },
      "evening": {
        "activity": "שם פעילות",
        "description": "תיאור קצר בעברית",
        "duration": "2 שעות",
        "costIls": 200,
        "tip": "טיפ מקומי"
      },
      "meals": {
        "breakfast": {"name": "שם מקום", "costPerPersonIls": 60, "tier": "mid"},
        "lunch": {"name": "שם מקום", "costPerPersonIls": 100, "tier": "mid"},
        "dinner": {"name": "שם מקום", "costPerPersonIls": 180, "tier": "luxury"}
      }
    }
  ],
  "costBreakdown": {
    "accommodation": {
      "central": {
        "name": "שם אזור מרכזי",
        "perNightIls": 800,
        "rooms": 1,
        "totalIls": ${8 * days}
      },
      "budget": {
        "name": "שם אזור פחות מרכזי",
        "perNightIls": 450,
        "rooms": 1,
        "totalIls": ${4.5 * days}
      }
    },
    "food": {
      "midRange": {
        "perPersonPerDayIls": 200,
        "totalIls": ${200 * travelers.count * days}
      },
      "luxury": {
        "perPersonPerDayIls": 400,
        "totalIls": ${400 * travelers.count * days}
      }
    },
    "activities": {
      "perPersonPerDayIls": 150,
      "totalIls": ${150 * travelers.count * days}
    },
    "transport": {
      "perPersonPerDayIls": 80,
      "totalIls": ${80 * travelers.count * days}
    },
    "combos": {
      "budgetMid": 0,
      "budgetLuxury": 0,
      "centralMid": 0,
      "centralLuxury": 0
    }
  },
  "localTips": ["טיפ 1 בעברית", "טיפ 2 בעברית", "טיפ 3 בעברית"],
  "weatherNote": "הערת מזג אוויר בעברית",
  "bestTimeToVisit": "זמן מומלץ בעברית"
}

הנחיות חשובות:
- כל הטקסט בעברית
- כל המחירים ב-₪ ריאליסטיים ל${destination}
- מחירים מחושבים לכלל הנוסעים (${travelers.count} נוסעים) אלא אם צוין "לנוסע"
- התאם פעילויות לתחומי עניין: ${interests}
- התאם לסוג נוסע: ${travelerType}
${travelers.type === "family" ? "- פעילויות ידידותיות לילדים, נגישות לעגלה\n" : ""}${travelers.type === "couple" ? "- מסעדות רומנטיות, נקודות תצפית, חוויות בוטיק\n" : ""}${travelers.type === "friends" ? "- פעילויות קבוצתיות, חיי לילה, אדרנלין\n" : ""}${travelers.type === "solo" ? "- סיורי הליכה, קפה תרבות, אירוח סוציאלי\n" : ""}${travelers.ageRange === "18-25" ? "- יותר חיי לילה והרפתקאות\n" : ""}${travelers.ageRange === "50+" ? "- קצב רגוע יותר, תרבות ואמנות\n" : ""}
- חשב combos בcostBreakdown.combos: budgetMid = budget.totalIls + food.midRange.totalIls + activities.totalIls + transport.totalIls, וכן הלאה
- החזר JSON תקין בלבד`;
}
