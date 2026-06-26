export const SelectTravelsList = [
  {
    id: 1,
    title: 'Just Me',
    desc: 'A solo traveler in exploration',
    icon: '✈️',
    people: '1 Person'
  },
  {
    id: 2,
    title: 'Couple',
    desc: 'Two travelers in a romantic getaway',
    icon: '🥂',
    people: '2 People'
  },
  {
    id: 3,
    title: 'Family',
    desc: 'A fun family vacation with loved ones',
    icon: '🏡',
    people: '3 to 5 People'
  },
  {
    id: 4,
    title: 'Friends',
    desc: 'A group adventure with friends',
    icon: '🎉',
    people: '5 to 10 People'
  }
];

export const SelectBudgetOptions = [
  {
    id: 1,
    title: 'Cheap',
    desc: 'Stay conscious of costs',
    icon: '💸'
  },
  {
    id: 2,
    title: 'Moderate',
    desc: 'Keep cost on the average side',
    icon: '💰'
  },
  {
    id: 3,
    title: 'Luxury',
    desc: 'Don’t worry about cost',
    icon: '💎'
  }
];

export const AI_PROMPT_BASIC = `
Generate a travel plan summary in STRICT JSON format only.

Location: {location}
Duration: {days} Days
Traveler: {traveller}
Budget: {budget}

IMPORTANT RULES:
1. Return ONLY valid JSON
2. Do not add markdown
3. Do not add \`\`\`
4. Do not add explanations
5. Use double quotes for all keys and string values
6. Do not use unescaped quotes inside strings
7. Ensure all arrays and objects are properly closed
8. Return parsable JSON only
9. If an image URL is unavailable, return an empty string ""
10. Never truncate the JSON response
11. The estimated_total_cost and estimated_cost_per_person MUST be calculated in Indian Rupees (INR) and formatted with the ₹ symbol (e.g. ₹15,000).

Use this exact JSON structure:

{
  "location": "string",
  "duration": "string",
  "traveler_type": "string",
  "budget_level": "string",
  "estimated_total_cost": "string",
  "estimated_cost_per_person": "string",

  "hotels_options": [
    {
      "hotel_name": "string",
      "address": "string",
      "price_range_per_night": "string",
      "image_url": "string",
      "geo_coordinates": {
        "latitude": 0,
        "longitude": 0
      },
      "rating": 0,
      "description": "string"
    }
  ]
}
Give 4 to 5 hotel options with details like name, address, price range per night, geo coordinates, rating and a brief description.
`;

export const AI_PROMPT_ITINERARY = `
Generate a detailed day-wise itinerary and realistic flight options in STRICT JSON format only.

Location: {location}
Departure City: {departureCity}
Duration: {days} Days
Traveler: {traveller}
Budget: {budget}

IMPORTANT RULES:
1. Return ONLY valid JSON
2. Do not add markdown
3. Do not add \`\`\`
4. Do not add explanations
5. Use double quotes for all keys and string values
6. Do not use unescaped quotes inside strings
7. Ensure all arrays and objects are properly closed
8. Return parsable JSON only
9. If an image URL is unavailable, return an empty string ""
10. Never truncate the JSON response
11. Flight pricing should be realistic estimates in Indian Rupees (INR) using the ₹ symbol.

Use this exact JSON structure:

{
  "flights": [
    {
      "airline": "string",
      "flight_type": "string", // e.g., "Non-Stop", "1-Stop"
      "flight_date": "string", // e.g., "YYYY-MM-DD"
      "estimated_price": "string", // e.g., "₹5,400"
      "booking_link_suggestion": "string" // e.g., "https://www.google.com/travel/flights"
    }
  ],
  "itinerary": [
    {
      "day": 1,
      "theme": "string",
      "places": [
        {
          "place_name": "string",
          "details": "string",
          "image_url": "string",
          "geo_coordinates": {
            "latitude": 0,
            "longitude": 0
          },
          "ticket_pricing": "string",
          "travel_time_from_previous_location": "string",
          "time_to_spend": "string",
          "best_time_to_visit": "string"
        }
      ],
      "lunch_option": {
        "restaurant_name": "string",
        "cuisine": "string",
        "best_time_to_visit": "string",
        "budget_level": "string"
      },
      "dinner_option": {
        "restaurant_name": "string",
        "cuisine": "string",
        "best_time_to_visit": "string",
        "budget_level": "string"
      }
    }
  ]
}

For the itinerary, provide a day-wise breakdown of activities. Each day should have a theme (e.g., adventure, culture, relaxation) and a list of places to visit. Also include one lunch and one dinner restaurant recommendation for each day.
Provide 2 to 3 budget-matching flight recommendations under "flights" matching the location.
`;