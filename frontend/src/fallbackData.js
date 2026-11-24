export const BANGALORE_AREAS = {
  "JP Nagar": { lat: 12.9063, lng: 77.5857 },
  "Jayanagar": { lat: 12.9299, lng: 77.5824 },
  "Koramangala": { lat: 12.9352, lng: 77.6245 },
  "Electronic City": { lat: 12.8452, lng: 77.6602 },
  "HSR Layout": { lat: 12.9121, lng: 77.6446 },
  "Indiranagar": { lat: 12.9784, lng: 77.6408 }
};

export const FALLBACK_CAFES = [
  {
    id: 1,
    name: "The Courtyard Community Cafe",
    area: "JP Nagar",
    address: "24th Main, 2nd Phase, JP Nagar, Bengaluru",
    lat: 12.9078,
    lng: 77.5881,
    budget: 350,
    ambiance: "Outdoor Garden",
    overallRating: 4.6,
    subRatings: { ambiance: 4.8, seating: 4.7, food: 4.4, value: 4.5 },
    tags: ["Group Tables", "Shaded Garden", "Power Outlets", "Pet Friendly"],
    hours: "8:30 AM – 10:30 PM",
    specialty: "Cold Brew Tonic, Pesto Focaccia & Wood-Fired Pizza",
    image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=900&q=80",
    reviews: [
      { id: 101, user: "Ananya R.", rating: 4.8, spend: 340, comment: "Spacious garden tables where 6 of us talked for 3 hours without feeling rushed.", date: "2 days ago" }
    ]
  },
  {
    id: 5,
    name: "Blue Tokai & Banyan Verandah",
    area: "Jayanagar",
    address: "11th Main, 4th Block, Jayanagar, Bengaluru",
    lat: 12.9279,
    lng: 77.5839,
    budget: 380,
    ambiance: "Cozy & Quiet",
    overallRating: 4.7,
    subRatings: { ambiance: 4.8, seating: 4.6, food: 4.7, value: 4.5 },
    tags: ["Tree-Lined Street", "Conversation Friendly", "Artisanal Coffee", "Croissants"],
    hours: "7:30 AM – 10:30 PM",
    specialty: "Vietnamese Iced Coffee, Almond Croissant & Avocado Sourdough",
    image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=80",
    reviews: [
      { id: 106, user: "Meera S.", rating: 4.8, spend: 360, comment: "Peaceful Jayanagar 4th Block vibe—you can actually hear each other talk.", date: "3 days ago" }
    ]
  },
  {
    id: 9,
    name: "The Hole In The Wall Cafe",
    area: "Koramangala",
    address: "8th Main, 4th Block, Koramangala, Bengaluru",
    lat: 12.9346,
    lng: 77.6264,
    budget: 450,
    ambiance: "Board Games & Lively",
    overallRating: 4.6,
    subRatings: { ambiance: 4.6, seating: 4.4, food: 4.8, value: 4.5 },
    tags: ["Iconic Brunch", "Waffles & Burgers", "Lively Crowd", "Group Booths"],
    hours: "8:30 AM – 9:30 PM",
    specialty: "All-English Breakfast, Ferrero Rocher Waffle & Classic Burgers",
    image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=900&q=80",
    reviews: [
      { id: 110, user: "Shreya D.", rating: 4.7, spend: 460, comment: "A Bangalore classic for friend reunions!", date: "1 day ago" }
    ]
  },
  {
    id: 13,
    name: "Bean & Byte Garden Cafe",
    area: "Electronic City",
    address: "Neeladri Road, Phase 1, Electronic City, Bengaluru",
    lat: 12.8468,
    lng: 77.6584,
    budget: 270,
    ambiance: "Outdoor Garden",
    overallRating: 4.6,
    subRatings: { ambiance: 4.7, seating: 4.7, food: 4.4, value: 4.8 },
    tags: ["Near Colleges & Tech Parks", "Open Lawn", "Student Budget", "Large Groups"],
    hours: "8:30 AM – 10:30 PM",
    specialty: "Iced Caramel Macchiato, Paneer Tikka Wrap & Choco Lava Cake",
    image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=900&q=80",
    reviews: [
      { id: 114, user: "Sanjana M.", rating: 4.7, spend: 260, comment: "Right off Neeladri Road—super convenient and budget-friendly after college classes!", date: "2 days ago" }
    ]
  },
  {
    id: 17,
    name: "Silaa The Garden Cafe",
    area: "HSR Layout",
    address: "27th Main, Sector 1, HSR Layout, Bengaluru",
    lat: 12.9135,
    lng: 77.6512,
    budget: 550,
    ambiance: "Outdoor Garden",
    overallRating: 4.8,
    subRatings: { ambiance: 4.9, seating: 4.8, food: 4.7, value: 4.4 },
    tags: ["Lush Greenery", "Aesthetic Photos", "Group Seating", "Brunch & Dinner"],
    hours: "9:00 AM – 11:00 PM",
    specialty: "Rose Pistachio Tres Leches, Truffle Fries & Iced Pour-Over",
    image: "https://images.unsplash.com/photo-1525610553991-2bede1a236e2?auto=format&fit=crop&w=900&q=80",
    reviews: [
      { id: 118, user: "Aarav M.", rating: 4.8, spend: 540, comment: "Gorgeous garden atmosphere in HSR—ideal for weekend group brunches.", date: "2 days ago" }
    ]
  },
  {
    id: 21,
    name: "Paper & Pie",
    area: "Indiranagar",
    address: "100 Feet Road, HAL 2nd Stage, Indiranagar, Bengaluru",
    lat: 12.9762,
    lng: 77.6412,
    budget: 480,
    ambiance: "Aesthetic & Minimal",
    overallRating: 4.7,
    subRatings: { ambiance: 4.8, seating: 4.7, food: 4.6, value: 4.4 },
    tags: ["Warm Wood Interiors", "Podcast Pods", "All-Day Breakfast", "Spacious"],
    hours: "8:00 AM – 11:00 PM",
    specialty: "Cinnamon French Toast, Flat White & Mushroom Melt",
    image: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=900&q=80",
    reviews: [
      { id: 122, user: "Devika N.", rating: 4.7, spend: 470, comment: "One of the cleanest, most comfortable spaces on 100ft Road to catch up with friends.", date: "2 days ago" }
    ]
  }
];
