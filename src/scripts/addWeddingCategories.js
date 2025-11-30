// Script to add wedding categories and subcategories
// Run this script to populate the database with wedding-related categories

const weddingCategories = [
  {
    name: "Venues & Spaces",
    subs: [
      "Marriage Halls / Banquet Halls",
      "Hotels & Resorts",
      "Farmhouses / Lawns",
      "Community Halls",
      "Destination Wedding Venues",
      "Clubs & Convention Centers",
    ],
  },
  {
    name: "Decor & Setup",
    subs: [
      "Tent & Canopy Providers",
      "Stage Decoration Specialists",
      "Flower Decorators",
      "Balloon & Theme Decorators",
      "Furniture & Seating Providers",
      "Wedding Arch & Entrance Designers",
      "Mandap & Pandal Setup Teams",
    ],
  },
  {
    name: "Food & Catering",
    subs: [
      "Wedding Caterers (Veg / Non-Veg)",
      "Sweet Shops & Mithai Vendors",
      "Bakeries (Cakes, Cupcakes, Desserts)",
      "Juice & Beverage Counters",
      "Ice Cream & Kulfi Vendors",
      "Live Food Counters (Chaat, Snacks, Tandoor, South Indian, etc.)",
    ],
  },
  {
    name: "Photography & Videography",
    subs: [
      "Wedding Photographers",
      "Pre-Wedding Shoot Specialists",
      "Cinematographers",
      "Drone Camera Operators",
      "Photo Booth Setup Providers",
      "LED Wall / Big Screen Display Providers",
    ],
  },
  {
    name: "Bridal & Groom Services",
    subs: [
      "Bridal Makeup Artists",
      "Groom Makeup & Styling Artists",
      "Mehendi (Henna) Artists",
      "Hair Stylists & Beauticians",
      "Nail Art Designers",
      "Spa & Skincare Services",
      "Saree & Lehenga Draping Specialists",
      "Turban (Pagdi) & Safa Tying Experts",
    ],
  },
  {
    name: "Clothing & Accessories",
    subs: [
      "Bridal Wear Shops",
      "Groom Wear Shops (Sherwani, Suits, etc.)",
      "Family Clothing Shops (Saree, Kurta, Lehenga, Gowns)",
      "Jewelry Shops (Gold, Silver, Diamond, Imitation)",
      "Artificial Jewelry Vendors",
      "Costume Jewelry & Accessories Shops",
      "Footwear Shops (Bride, Groom & Family)",
    ],
  },
  {
    name: "Music & Entertainment",
    subs: [
      "Wedding Bands",
      "Dhol Players & Nagada Artists",
      "DJs & Sound Systems",
      "Orchestra & Live Singers",
      "Folk Dance Groups",
      "Ghazal & Sufi Singers",
      "Qawwali Groups",
      "Stand-up Comedians / Anchors",
      "Magicians / Jugglers / Puppet Shows",
      "Celebrity Performers (if budgeted)",
    ],
  },
  {
    name: "Lighting & Sound",
    subs: [
      "Stage & Venue Lighting Providers",
      "LED & Fairy Light Decorators",
      "Chandeliers & Lamp Setup Providers",
      "Fireworks & Cold Pyro Technicians",
      "Sound System Providers",
      "Generators & Power Backup Providers",
    ],
  },
  {
    name: "Travel & Logistics",
    subs: [
      "Car Rental Services (Bride & Groom Entry)",
      "Vintage Car Providers",
      "Luxury Car Providers",
      "Bus/Tempo Traveller Rentals for Guests",
      "Auto/E-Rickshaw Decoration for Traditional Entry",
      "Horse (Ghodi) & Baggi (Chariot) Providers",
      "Camel/Elephant Providers (for Royal Weddings)",
      "Air & Train Ticket Agents (Destination Weddings)",
    ],
  },
  {
    name: "Rituals & Traditions",
    subs: [
      "Pandit Ji / Priests (Hindu Wedding)",
      "Maulvi (Muslim Wedding)",
      "Granthi (Sikh Wedding)",
      "Father / Christian Priests",
      "Astrologers & Matchmakers",
      "Pooja Samagri Shops",
      "Dharmic Bands / Bhajan Mandali",
    ],
  },
  {
    name: "Event Planning & Management",
    subs: [
      "Wedding Planners",
      "Event Managers",
      "Hospitality & Guest Management Teams",
      "Invitation Card Printers & Designers",
      "E-Invitation Designers (Digital Cards, Videos)",
      "Return Gift Vendors",
      "Welcome Kit Providers",
      "Bouncers & Security Guards",
      "Valet Parking Services",
      "Event Day Coordinators",
    ],
  },
  {
    name: "Shops & Miscellaneous Vendors",
    subs: [
      "Gift Shops & Wrapping Services",
      "Stage Throne & Sofa Rentals (Bride & Groom seating)",
      "Crockery & Utensil Rentals",
      "Shamiyana & Carpet Providers",
      "AC / Cooler / Heater Rental Vendors",
      "Portable Toilet / Washroom Providers",
      "Event Insurance Agents",
    ],
  },
];

// Function to create categories via API
async function createCategories() {
  const API_BASE_URL = "http://localhost:3000/api"; // Update with your API base URL
  const CREATE_CATEGORY_ENDPOINT = "/categories"; // Update with your actual endpoint

  console.log("Starting to create wedding categories...");

  for (let i = 0; i < weddingCategories.length; i++) {
    const category = weddingCategories[i];

    try {
      const categoryData = {
        category_name: category.name,
        subcategories: category.subs.map((sub) => ({ subcategory_name: sub })),
      };

      console.log(
        `Creating category ${i + 1}/${weddingCategories.length}: ${
          category.name
        }`
      );

      const response = await fetch(
        `${API_BASE_URL}${CREATE_CATEGORY_ENDPOINT}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // Add authorization headers if needed
            // 'Authorization': 'Bearer YOUR_TOKEN_HERE'
          },
          body: JSON.stringify(categoryData),
        }
      );

      if (response.ok) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const result = await response.json();
        console.log(
          `✅ Successfully created: ${category.name} with ${category.subs.length} subcategories`
        );
      } else {
        const error = await response.text();
        console.error(`❌ Failed to create ${category.name}:`, error);
      }

      // Add a small delay between requests to avoid overwhelming the server
      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (error) {
      console.error(`❌ Error creating ${category.name}:`, error);
    }
  }

  console.log("Finished creating wedding categories!");
}

// Export for use in other files
if (typeof module !== "undefined" && module.exports) {
  module.exports = { weddingCategories, createCategories };
}

// Run the script if called directly
if (typeof window === "undefined" && require.main === module) {
  createCategories().catch(console.error);
}
