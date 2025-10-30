import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, DollarSign, Users, Star, Clock, X, Search, RefreshCw, Wine, RotateCw, Navigation, Phone, Mail } from 'lucide-react';

const RioNidoTravelPlanner = () => {
  const [currentStep, setCurrentStep] = useState('experiences');
  const [preferences, setPreferences] = useState({
    interests: [],
    travelStyle: 'moderate',
    budget: 'moderate',
    duration: 1,
    guestName: '',
    includeSweets: true,
    includeMarkets: true
  });
  const [generatedItinerary, setGeneratedItinerary] = useState([]);
  const [selectedSignatureExperience, setSelectedSignatureExperience] = useState(null);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchType, setSearchType] = useState('signature');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [showBusinessModal, setShowBusinessModal] = useState(false);
  const [signatureExperienceStartIndex, setSignatureExperienceStartIndex] = useState(0);
  const [selectedWineTrail, setSelectedWineTrail] = useState(null);
  const [showWineTrailModal, setShowWineTrailModal] = useState(false);
  const [selectedShoppingDistrict, setSelectedShoppingDistrict] = useState(null);
  const [showShoppingDistrictModal, setShowShoppingDistrictModal] = useState(false);
  const [redeemedBusinesses, setRedeemedBusinesses] = useState(new Set());
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [redeemingBusiness, setRedeemingBusiness] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingExperience, setBookingExperience] = useState(null);
  const [skipToReview, setSkipToReview] = useState(false);
  const [showItineraryEmailModal, setShowItineraryEmailModal] = useState(false);

  // ============================================
  // BACKEND INTEGRATION CONFIGURATION
  // ============================================
  
  // Google Sheets API endpoint for tracking redemptions and reviews
  // Set this up at: https://script.google.com
  const GOOGLE_SHEETS_URL = 'YOUR_GOOGLE_SHEETS_API_ENDPOINT_HERE';
  
  // EmailJS configuration for sending itineraries
  // Sign up free at: https://www.emailjs.com
  const EMAILJS_CONFIG = {
    serviceID: 'YOUR_EMAILJS_SERVICE_ID',
    templateID: 'YOUR_EMAILJS_TEMPLATE_ID',
    publicKey: 'YOUR_EMAILJS_PUBLIC_KEY'
  };

  // ============================================
  // GOOGLE SHEETS INTEGRATION - Track Redemptions & Reviews
  // ============================================
  
  const trackRedemption = async (businessData, contactInfo) => {
    const redemptionData = {
      timestamp: new Date().toISOString(),
      type: 'redemption',
      guestName: preferences.guestName || 'Anonymous',
      businessName: businessData.name,
      businessCategory: businessData.category,
      businessLocation: businessData.location,
      guestEmail: contactInfo.email || '',
      guestPhone: contactInfo.phone || '',
      wantsItinerary: contactInfo.shareItinerary || false
    };

    try {
      const response = await fetch(GOOGLE_SHEETS_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(redemptionData)
      });
      
      console.log('✅ Redemption tracked to Google Sheets:', businessData.name);
      return true;
    } catch (error) {
      console.error('❌ Error tracking redemption:', error);
      return false;
    }
  };

  const trackReview = async (businessData, reviewData) => {
    const reviewSubmission = {
      timestamp: new Date().toISOString(),
      type: 'review',
      guestName: preferences.guestName || 'Anonymous',
      businessName: businessData.name,
      businessCategory: businessData.category,
      rating: reviewData.rating,
      reviewText: reviewData.reviewText || '',
      guestEmail: reviewData.email || '',
      guestPhone: reviewData.phone || ''
    };

    try {
      const response = await fetch(GOOGLE_SHEETS_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reviewSubmission)
      });
      
      console.log('✅ Review tracked to Google Sheets:', businessData.name, `(${reviewData.rating} stars)`);
      return true;
    } catch (error) {
      console.error('❌ Error tracking review:', error);
      return false;
    }
  };

  // Handle redeem button click
  const handleRedeem = (business) => {
    console.log('🎫 REDEEM CLICKED:', business.name);
    setRedeemingBusiness(business);
    setShowBusinessModal(false); // Close business details modal
    setShowRedeemModal(true); // Open redeem modal
    console.log('✅ States updated - showRedeemModal should be true');
  };

  // Handle redeem submission
  const handleRedeemSubmit = async (contactInfo) => {
    if (redeemingBusiness) {
      await trackRedemption(redeemingBusiness, contactInfo);
      setRedeemedBusinesses(new Set([...redeemedBusinesses, redeemingBusiness.name]));
      // DON'T close modal - the thank you screen will show with "Leave a Review" button
    }
  };

  // Helper function to create Google Maps link
  const createMapLink = (locationName, address) => {
    const destination = encodeURIComponent(address || locationName);
    // Use Google Maps directions endpoint for better mobile behavior
    return `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
  };

  // Helper function to create multi-stop route for entire day
  const createDayRoute = (activities) => {
    // Filter out activities without locations and get addresses
    const locations = activities
      .filter(a => a.location || a.address)
      .map(a => encodeURIComponent(a.location || a.address));
    
    if (locations.length === 0) return null;
    if (locations.length === 1) {
      return `https://www.google.com/maps/search/?api=1&query=${locations[0]}`;
    }
    
    // Multi-stop route: origin -> waypoints -> destination
    const origin = locations[0];
    const destination = locations[locations.length - 1];
    const waypoints = locations.slice(1, -1).join('|');
    
    if (waypoints) {
      return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&waypoints=${waypoints}`;
    } else {
      return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}`;
    }
  };

  // Helper function to estimate drive time between two zones
  const estimateDriveTime = (fromZone, toZone) => {
    if (!fromZone || !toZone || fromZone === toZone) return null;
    
    // Approximate drive times in minutes between zones
    const driveTimes = {
      'central-north': 10,
      'central-south': 25,
      'central-occidental': 20,
      'central-healdsburg': 25,
      'central-coast': 35,
      'north-south': 30,
      'north-occidental': 25,
      'north-healdsburg': 15,
      'north-coast': 40,
      'south-occidental': 15,
      'south-healdsburg': 35,
      'south-coast': 40,
      'occidental-healdsburg': 30,
      'occidental-coast': 25,
      'healdsburg-coast': 50
    };
    
    // Create both possible keys (since it's bidirectional)
    const key1 = `${fromZone}-${toZone}`;
    const key2 = `${toZone}-${fromZone}`;
    
    return driveTimes[key1] || driveTimes[key2] || null;
  };

  // Helper function to check if a location is open during the proposed time slot
  const isOpenDuringTimeSlot = (item, timeSlot) => {
    // If no hours specified, assume it's open (for flexibility)
    if (!item.hours) return true;
    
    try {
      // Parse time slot (e.g., "8:00 AM - 9:30 AM" or "6:30 PM - 8:30 PM")
      const timeSlotMatch = timeSlot.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
      if (!timeSlotMatch) return true; // Can't parse, assume open
      
      let slotHour = parseInt(timeSlotMatch[1]);
      const slotMinute = parseInt(timeSlotMatch[2]);
      const slotPeriod = timeSlotMatch[3].toUpperCase();
      
      // Convert to 24-hour format
      if (slotPeriod === 'PM' && slotHour !== 12) slotHour += 12;
      if (slotPeriod === 'AM' && slotHour === 12) slotHour = 0;
      const slotTimeIn24 = slotHour * 100 + slotMinute; // e.g., 830 for 8:30am, 1830 for 6:30pm
      
      // Parse hours (e.g., "8am-3pm daily" or "5pm-9pm Wed-Sun")
      const hoursMatch = item.hours.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)\s*-\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm)/i);
      if (!hoursMatch) return true; // Can't parse, assume open
      
      let openHour = parseInt(hoursMatch[1]);
      const openMinute = parseInt(hoursMatch[2] || 0);
      const openPeriod = hoursMatch[3].toUpperCase();
      let closeHour = parseInt(hoursMatch[4]);
      const closeMinute = parseInt(hoursMatch[5] || 0);
      const closePeriod = hoursMatch[6].toUpperCase();
      
      // Convert to 24-hour format
      if (openPeriod === 'PM' && openHour !== 12) openHour += 12;
      if (openPeriod === 'AM' && openHour === 12) openHour = 0;
      if (closePeriod === 'PM' && closeHour !== 12) closeHour += 12;
      if (closePeriod === 'AM' && closeHour === 12) closeHour = 0;
      
      const openTime = openHour * 100 + openMinute;
      const closeTime = closeHour * 100 + closeMinute;
      
      // Check if slot time falls within open hours
      return slotTimeIn24 >= openTime && slotTimeIn24 < closeTime;
    } catch (e) {
      // If any parsing fails, assume open for flexibility
      return true;
    }
  };


  // SHOPPING DISTRICTS - Similar to wine trails
  const shoppingDistricts = [
    {
      name: "Downtown Guerneville Shopping District",
      description: "Explore unique boutiques, antique shops, and local artisan stores in the heart of the Russian River",
      highlights: ["Main Street Station antiques", "Nimble & Finn's Ice Cream", "Jilly's eclectic gifts", "Local art galleries"],
      hours: "Most shops 11am-6pm daily",
      zone: "central",
      address: "Main St, Guerneville, CA 95446"
    },
    {
      name: "Downtown Healdsburg Plaza",
      description: "Upscale shops, wine tasting rooms, and gourmet food stores surrounding the historic town plaza",
      highlights: ["Boutique clothing stores", "Art galleries", "Cheese shops", "Wine accessory stores"],
      hours: "Most shops 10am-6pm daily",
      zone: "healdsburg",
      address: "Healdsburg Plaza, Healdsburg, CA 95448"
    },
    {
      name: "Downtown Sebastopol Shopping",
      description: "Quirky downtown with independent bookstores, farmers markets, and unique local crafts",
      highlights: ["Copperfield's Books", "The Barlow artisan market", "Farmers market vendors", "Local craft stores"],
      hours: "Most shops 10am-7pm, Farmers Market Sun 10am-1:30pm",
      zone: "south",
      address: "Main St, Sebastopol, CA 95472"
    },
    {
      name: "Occidental Village Shopping",
      description: "Charming historic town with artisan galleries, antique shops, and local crafts",
      highlights: ["Artisan galleries", "Antique shops", "Local crafts", "Historic buildings"],
      hours: "Most shops 11am-5pm",
      zone: "occidental",
      address: "Main St, Occidental, CA 95465"
    },
    {
      name: "Bodega Bay Coastal Shopping",
      description: "Coastal shops featuring local art, seafood markets, and ocean-themed gifts",
      highlights: ["Fresh seafood markets", "Coastal art galleries", "Surf shops", "Ocean gift stores"],
      hours: "Most shops 10am-5pm daily",
      zone: "coast",
      address: "Highway 1, Bodega Bay, CA 94923"
    }
  ];

  // WINE TRAILS - EXCLUSIVE EXPERIENCES
  const wineTrails = [
    {
      name: "Russian River Valley Pinot Trail",
      wineries: [
        { name: "Rochioli Vineyards", blurb: "Legendary family estate producing world-class Pinot Noir. Four generations of winemaking excellence with sought-after allocation-only wines." },
        { name: "Porter Creek Vineyards", blurb: "Organic hillside estate specializing in old-vine Pinot Noir and Chardonnay. Intimate tastings in a rustic barn setting." },
        { name: "Russian River Vineyards", blurb: "Beautiful grounds perfect for picnicking. Known for approachable Pinot Noir and gorgeous outdoor tasting areas." }
      ],
      description: "Explore world-class Pinot Noir producers in the heart of Russian River Valley",
      exclusivePerks: "Private tastings + 15% off all purchases + complimentary cheese pairings",
      zone: "north"
    },
    {
      name: "Sparkling Wine Discovery Route",
      wineries: [
        { name: "Iron Horse Vineyards", blurb: "Stunning hilltop estate famous for sparkling wines served at presidential inaugurations. Breathtaking views and outdoor tastings." },
        { name: "Korbel Champagne Cellars", blurb: "Historic sparkling wine producer since 1882. Beautiful rose gardens, brandy tastings, and delicatessen on-site." }
      ],
      description: "Discover exceptional sparkling wines from historic estates",
      exclusivePerks: "VIP tours + complimentary sparkling tasting + souvenir flutes",
      zone: "central"
    },
    {
      name: "Boutique Artisan Winemaker Trail",
      wineries: [
        { name: "Furthermore Wines", blurb: "Small-batch artisan wines in a charming downtown Santa Rosa tasting room. Focus on natural winemaking and unique varietals." },
        { name: "Ryme Cellars", blurb: "Vermouth specialists with exceptional wines. Known for innovative blends and sustainable practices in their Sebastopol tasting room." },
        { name: "Benovia Winery", blurb: "Estate Pinot Noir and Chardonnay from meticulously farmed vineyards. Elegant tasting room with vineyard views." }
      ],
      description: "Small-batch artisan winemakers crafting unique, terroir-driven wines",
      exclusivePerks: "Meet the winemakers + barrel tastings + 20% off bottle purchases",
      zone: "south"
    }
  ];

  // SIGNATURE EXPERIENCES - 12 total
  const signatureExperiences = [
    { 
      id: 'sig_rnl1', 
      name: "Wine Country Limo Package", 
      tagline: "Five Wineries, One Unforgettable Day", 
      description: "Free limo service with exclusive wine tasting tour and gourmet lunch.",
      fullDescription: "Experience the best of Russian River wine country in style! Your private limousine will whisk you to five exceptional wineries: Ryme Vineyards, Furthermore Vineyards, Korbel Champagne Cellars, and Russian River Vineyards. Enjoy exclusive discounts at each stop and a delicious deli lunch prepared by Graze restaurant at Rio Nido Lodge.",
      duration: "6-7 hours",
      price: "$125 per person",
      minGuests: "Minimum 4 guests required",
      bookingContact: {
        phone: "(707) 869-2323",
        email: "experiences@rionidolodge.com"
      },
      includes: [
        "Private limousine service",
        "Five winery visits with exclusive tastings",
        "Gourmet deli lunch from Graze",
        "Special discounts at all participating wineries",
        "Professional driver/guide"
      ],
      bestTime: "10am - 5pm",
      rating: "5.0",
      isRNLExclusive: true,
      category: "Signature Experience",
      bookingUrl: "https://rionidolodge.com/contact-signature-experiences"
    },
    { 
      id: 'sig_rnl2', 
      name: "Explore Sonoma County's Hidden Gems", 
      tagline: "A Curated Journey with Local Expert Fawn", 
      description: "Discover secret spots with personal guide Fawn - DeLoach Winery tasting, cheesemaker tour, Armstrong Redwoods, coastal picnic, and artisan treasures.",
      fullDescription: "Join Fawn, your expert local guide, for an unforgettable day exploring Sonoma County's best-kept secrets. Visit DeLoach Winery for an exclusive tasting, tour a local cheesemaker, savor fresh-baked breads, stroll through Armstrong Redwoods, enjoy dramatic coastal views with a gourmet oceanside picnic, browse art galleries, and indulge in salt water taffy. Fawn's insider knowledge makes this more than a tour—it's a day with a friend who knows all the special places.",
      duration: "Full day (6-7 hours)",
      price: "$185 per person",
      minGuests: "Minimum 2 guests, maximum 6",
      bookingContact: {
        name: "Fawn - Local Guide",
        phone: "(707) 869-2323",
        email: "fawn@rionidolodge.com",
        bookingNote: "Call or email to schedule your personalized tour"
      },
      includes: [
        "Personal guide (Fawn) for the entire day",
        "Winery tasting at DeLoach Vineyards",
        "Cheesemaker tour and samples",
        "Fresh-baked breads and pastries",
        "Armstrong Redwoods nature walk",
        "Scenic coastal viewpoints",
        "Gourmet oceanside picnic lunch",
        "Art gallery visits",
        "Salt water taffy stop",
        "All entrance fees and tastings included"
      ],
      bestTime: "9am - 4pm",
      rating: "5.0",
      isRNLExclusive: true,
      category: "Signature Experience",
      bookingUrl: "https://rionidolodge.com/contact-signature-experiences"
    },
    { 
      id: 'sig_3', 
      name: "Russian River Kayak Adventure", 
      tagline: "Paddle Through Paradise", 
      description: "Guided kayaking experience on the scenic Russian River with wildlife viewing.",
      fullDescription: "Explore the Russian River from the water! This guided kayaking tour takes you through calm stretches of the river, past sandy beaches and through shaded groves. Watch for river otters, great blue herons, and osprey as you paddle. Perfect for beginners and experienced kayakers alike.",
      duration: "3 hours",
      price: "$75 per person",
      minGuests: "Minimum 2 guests",
      includes: [
        "Kayak and paddle rental",
        "Life jackets and safety equipment",
        "Experienced guide",
        "Dry bags for personal items",
        "Shuttle service"
      ],
      bestTime: "Mid-morning",
      rating: "4.8",
      category: "Signature Experience",
      bookingUrl: "https://rionidolodge.com/contact-signature-experiences"
    },
    { 
      id: 'sig_4', 
      name: "Sunset Wine & Cheese Pairing", 
      tagline: "Golden Hour Elegance", 
      description: "Curated wine tasting with artisan cheese pairings at a hillside vineyard.",
      fullDescription: "Watch the sun set over rolling vineyards while savoring carefully selected Russian River Valley wines paired with artisan cheeses from local creameries. Your sommelier will guide you through each pairing, explaining the nuances of both the wines and cheeses.",
      duration: "2 hours",
      price: "$85 per person",
      includes: [
        "Five wine tastings",
        "Artisan cheese board",
        "Sommelier-led tasting",
        "Vineyard views",
        "Souvenir wine glass"
      ],
      bestTime: "5pm - 7pm (seasonal)",
      rating: "4.9",
      category: "Signature Experience",
      bookingUrl: "https://rionidolodge.com/contact-signature-experiences"
    },
    { 
      id: 'sig_5', 
      name: "Chef's Table Experience", 
      tagline: "An Evening with the Chef", 
      description: "Five-course tasting menu with wine pairings and kitchen tour.",
      fullDescription: "Join our executive chef for an intimate culinary journey. Start with a behind-the-scenes kitchen tour, then enjoy a five-course tasting menu prepared exclusively for your group. Each course is paired with local wines, and the chef personally explains the inspiration behind each dish.",
      duration: "3 hours",
      price: "$165 per person",
      minGuests: "Minimum 2 guests, maximum 8",
      includes: [
        "Kitchen tour",
        "Five-course tasting menu",
        "Wine pairings",
        "Personal time with the chef",
        "Recipe cards"
      ],
      bestTime: "6pm seating",
      rating: "5.0",
      category: "Signature Experience",
      bookingUrl: "https://rionidolodge.com/contact-signature-experiences"
    },
    { 
      id: 'sig_6', 
      name: "Coastal Explorer Package", 
      tagline: "From Redwoods to Rugged Coast", 
      description: "Full-day guided tour from the redwoods to the Pacific coast.",
      fullDescription: "Experience the diversity of Sonoma County in one incredible day. Start in the ancient redwood groves, wind through wine country, and end at the dramatic Pacific coastline. Your expert guide will take you to hidden viewpoints, local favorites, and provide insights into the region's geology, ecology, and history.",
      duration: "8 hours",
      price: "$195 per person",
      minGuests: "Minimum 4 guests",
      includes: [
        "Private luxury van",
        "Expert guide",
        "Gourmet picnic lunch",
        "All entrance fees",
        "Photography stops"
      ],
      bestTime: "9am - 5pm",
      rating: "4.9",
      category: "Signature Experience",
      bookingUrl: "https://rionidolodge.com/contact-signature-experiences"
    },
    { 
      id: 'sig_7', 
      name: "Vineyard Bike Tour", 
      tagline: "Pedal Through Wine Country", 
      description: "Leisurely bike tour through scenic vineyards with wine tastings.",
      fullDescription: "Cruise through picturesque wine country on a comfortable electric-assist bike. This guided tour takes you along quiet country roads, through vineyards, and stops at three boutique wineries. Your guide will share stories about the region's winemaking heritage while you enjoy the scenery at your own pace.",
      duration: "4 hours",
      price: "$125 per person",
      includes: [
        "Electric-assist bike rental",
        "Helmet and safety gear",
        "Expert guide",
        "Three winery tastings",
        "Snacks and water"
      ],
      bestTime: "10am - 2pm",
      rating: "4.8",
      category: "Signature Experience"
    },
    { 
      id: 'sig_8', 
      name: "Spa & Wine Retreat", 
      tagline: "Relax, Restore, Rejuvenate", 
      description: "Half-day spa package with massage, facial, and wine tasting.",
      fullDescription: "Indulge in ultimate relaxation with this comprehensive spa experience. Begin with a 60-minute massage, followed by a nourishing facial using organic, locally-sourced ingredients. Conclude your retreat with a private wine tasting in our spa lounge, complete with light refreshments.",
      duration: "4 hours",
      price: "$285 per person",
      includes: [
        "60-minute massage",
        "Facial treatment",
        "Private wine tasting",
        "Light refreshments",
        "Spa amenity access"
      ],
      bestTime: "10am or 2pm",
      rating: "5.0",
      category: "Signature Experience"
    },
    { 
      id: 'sig_9', 
      name: "Farm-to-Table Dinner Series", 
      tagline: "Celebrating Local Harvest", 
      description: "Multi-course dinner featuring ingredients from neighboring farms.",
      fullDescription: "Experience the true meaning of farm-to-table dining. Our chef creates a special menu using ingredients sourced within 20 miles of the restaurant, many harvested the same day. Meet local farmers and producers who supply the meal while enjoying wines from nearby vineyards.",
      duration: "3 hours",
      price: "$145 per person",
      includes: [
        "Four-course dinner",
        "Wine pairings",
        "Meet the farmers",
        "Farm stories and history",
        "Take-home preserves"
      ],
      bestTime: "6pm - 9pm (Saturdays only)",
      rating: "4.9",
      category: "Signature Experience"
    },
    { 
      id: 'sig_10', 
      name: "Photography Workshop", 
      tagline: "Capture the Beauty", 
      description: "Professional photography workshop in stunning wine country locations.",
      fullDescription: "Learn to capture the essence of wine country from a professional photographer. This hands-on workshop covers landscape, vineyard, and food photography techniques. Visit multiple scenic locations and receive personalized instruction to improve your skills.",
      duration: "4 hours",
      price: "$175 per person",
      minGuests: "Minimum 3 guests, maximum 6",
      includes: [
        "Professional instruction",
        "Transportation to locations",
        "Photo editing basics",
        "Digital photo portfolio",
        "Wine & snacks"
      ],
      bestTime: "Golden hour (morning or evening)",
      rating: "4.8",
      category: "Signature Experience"
    },
    { 
      id: 'sig_11', 
      name: "Sunset River Cruise", 
      tagline: "Romance on the Russian River", 
      description: "Private sunset cruise with champagne and hors d'oeuvres.",
      fullDescription: "Enjoy an enchanting evening on the Russian River aboard a vintage boat. As the sun sets, you'll cruise past scenic riverbanks while sipping champagne and enjoying gourmet hors d'oeuvres. Perfect for couples celebrating special occasions or groups seeking a unique experience.",
      duration: "2 hours",
      price: "$95 per person",
      minGuests: "Minimum 2 guests, maximum 12",
      includes: [
        "Private boat cruise",
        "Champagne service",
        "Gourmet hors d'oeuvres",
        "Captain and crew",
        "Sunset views"
      ],
      bestTime: "7pm (seasonal)",
      rating: "5.0",
      category: "Signature Experience"
    },
    { 
      id: 'sig_12', 
      name: "Foraging & Cooking Class", 
      tagline: "From Forest to Fork", 
      description: "Guided foraging walk followed by hands-on cooking class.",
      fullDescription: "Discover the edible treasures of the redwood forest with an expert forager, then learn to transform your finds into delicious dishes. This unique experience combines education about wild foods with practical cooking skills, all while enjoying the beauty of the forest.",
      duration: "5 hours",
      price: "$155 per person",
      minGuests: "Minimum 4 guests, maximum 8",
      includes: [
        "Guided foraging walk",
        "Hands-on cooking class",
        "All ingredients and equipment",
        "Lunch featuring foraged foods",
        "Recipe booklet"
      ],
      bestTime: "9am - 2pm",
      rating: "4.9",
      category: "Signature Experience"
    }
  ];

  // EXPERIENCES DATABASE
  const experiencesDatabase = {
    wineries: [
      { name: "Furthermore Wines", category: "Wine Tasting", description: "Small-batch artisan winery with a charming tasting room", location: "Santa Rosa", hours: "12pm-6pm Thu-Mon", phone: "(707) 978-9463", price: "$$", rating: "4.8", zone: "south", address: "1001 4th St, Santa Rosa, CA 95404" },
      { name: "Korbel Champagne Cellars", category: "Wine Tasting", description: "Historic sparkling wine estate with beautiful gardens and tours", location: "Guerneville", hours: "10am-4:30pm daily", phone: "(707) 824-7000", price: "$$$", rating: "4.6", zone: "central", address: "13250 River Rd, Guerneville, CA 95446" },
      { name: "Russian River Vineyards", category: "Wine Tasting", description: "Family-owned winery with scenic picnic grounds and Pinot Noir", location: "Forestville", hours: "11am-5pm daily", phone: "(707) 887-3344", price: "$$", rating: "4.5", zone: "north", address: "5700 Gravenstein Hwy N, Forestville, CA 95436" },
      { name: "Iron Horse Vineyards", category: "Wine Tasting", description: "Renowned sparkling wine producer with stunning hilltop views", location: "Sebastopol", hours: "10am-4pm daily", phone: "(707) 887-1507", price: "$$$", rating: "4.9", zone: "south", address: "9786 Ross Station Rd, Sebastopol, CA 95472" },
      { name: "Porter Creek Vineyards", category: "Wine Tasting", description: "Small organic hillside winery specializing in Pinot Noir and Chardonnay", location: "Healdsburg", hours: "10:30am-4:30pm daily", phone: "(707) 433-6321", price: "$$", rating: "4.7", zone: "healdsburg", address: "8735 Westside Rd, Healdsburg, CA 95448" },
      { name: "Benovia Winery", category: "Wine Tasting", description: "Estate Pinot Noir and Chardonnay with elegant tasting room", location: "Santa Rosa", hours: "10am-4pm Thu-Mon", phone: "(707) 921-1040", price: "$$$", rating: "4.8", zone: "south", address: "3339 Hartman Rd, Santa Rosa, CA 95401" }
    ],
    
    restaurants: [
      { name: "Graze", category: "Fine Dining", description: "Upscale farm-to-table restaurant at Rio Nido Lodge with seasonal menu", location: "Rio Nido Lodge", hours: "5pm-9pm Wed-Sun", phone: "(707) 869-2323", price: "$$$", rating: "4.8", zone: "central", hasBreakfast: false, address: "14540 Canyon Two Rd, Guerneville, CA 95446" },
      { name: "Graze Brunch", category: "Breakfast & Brunch", description: "Weekend brunch at Rio Nido Lodge featuring farm-fresh ingredients and seasonal specialties", location: "Rio Nido Lodge", hours: "8am-2pm Fri-Sun", phone: "(707) 869-2323", price: "$$$", rating: "4.8", zone: "central", hasBreakfast: true, address: "14540 Canyon Two Rd, Guerneville, CA 95446", isGrazeFallback: true },
      { name: "Rio Nido Lodge Lounge", category: "Breakfast", description: "Complimentary coffee and fresh pastries served in the cozy lodge lounge", location: "Rio Nido Lodge", hours: "8am-10am Mon-Thu", phone: "(707) 869-2323", price: "Free", rating: "4.8", zone: "central", hasBreakfast: true, address: "14540 Canyon Two Rd, Guerneville, CA 95446", isGrazeFallback: true },
      { name: "Boon Eat + Drink", category: "Fine Dining", description: "Michelin-recommended restaurant focusing on local, seasonal cuisine", location: "Guerneville", hours: "5pm-9pm Wed-Sun", phone: "(707) 869-0780", price: "$$$", rating: "4.7", zone: "central", hasBreakfast: false, address: "16248 Main St, Guerneville, CA 95446" },
      { name: "Big Bottom Market", category: "Breakfast & Market", description: "Famous for biscuits and local artisan products", location: "Guerneville", hours: "8am-3pm daily", phone: "(707) 604-7295", price: "$$", rating: "4.6", zone: "central", hasBreakfast: true, address: "16228 Main St, Guerneville, CA 95446" },
      { name: "Seaside Metal", category: "Casual Dining", description: "Waterfront seafood shack with fresh catches and coastal vibes", location: "Jenner", hours: "11am-8pm Thu-Mon", phone: "(707) 865-0607", price: "$$", rating: "4.5", zone: "coast", hasBreakfast: false, address: "10439 CA-1, Jenner, CA 95450" },
      { name: "The Farmhouse Inn Restaurant", category: "Fine Dining", description: "Michelin-starred fine dining with wine country elegance", location: "Forestville", hours: "5:30pm-9pm Thu-Sun", phone: "(707) 887-3300", price: "$$$", rating: "4.9", zone: "north", hasBreakfast: false, address: "7871 River Rd, Forestville, CA 95436" },
      { name: "Hazel", category: "Fine Dining", description: "Elevated California cuisine with locally-sourced ingredients in a sophisticated Occidental setting", location: "Occidental", hours: "5pm-9pm Wed-Sun", phone: "(707) 823-6627", price: "$$$", rating: "4.8", zone: "occidental", hasBreakfast: false, address: "3782 Bohemian Hwy, Occidental, CA 95465" },
      { name: "Coffee Bazaar", category: "Breakfast", description: "Local coffee roaster and breakfast spot with pastries", location: "Guerneville", hours: "7am-2pm daily", phone: "(707) 869-9706", price: "$", rating: "4.4", zone: "central", hasBreakfast: true, address: "14045 Armstrong Woods Rd, Guerneville, CA 95446" },
      { name: "Main Street Station", category: "Breakfast", description: "Cozy cafe with hearty breakfast plates, fresh-baked goods, and local coffee", location: "Guerneville", hours: "7am-2pm daily", phone: "(707) 869-0501", price: "$", rating: "4.5", zone: "central", hasBreakfast: true, address: "16280 Main St, Guerneville, CA 95446" },
      { name: "Pat's Restaurant", category: "Breakfast", description: "Classic American diner with generous portions and friendly service", location: "Guerneville", hours: "7am-2pm daily", phone: "(707) 869-9904", price: "$", rating: "4.3", zone: "central", hasBreakfast: true, address: "16236 Main St, Guerneville, CA 95446" },
      { name: "Stumptown Brewery Cafe", category: "Breakfast", description: "Casual breakfast spot with craft coffee and homestyle cooking", location: "Guerneville", hours: "7:30am-2pm Fri-Mon", phone: "(707) 869-0705", price: "$", rating: "4.4", zone: "central", hasBreakfast: true, address: "15045 River Rd, Guerneville, CA 95446" },
      { name: "Occidental Bohemian Farmer's Market Bistro", category: "Casual Dining", description: "Farm-fresh ingredients in a charming small-town setting", location: "Occidental", hours: "11am-8pm Fri-Tue", phone: "(707) 874-3675", price: "$$", rating: "4.5", zone: "occidental", hasBreakfast: false, address: "3610 Bohemian Hwy, Occidental, CA 95465" },
      { name: "Howard's Cafe", category: "Breakfast", description: "Classic American diner with huge portions and old-school charm", location: "Occidental", hours: "7am-2pm daily", phone: "(707) 874-2838", price: "$", rating: "4.6", zone: "occidental", hasBreakfast: true, address: "3611 Bohemian Hwy, Occidental, CA 95465" },
      { name: "Wild Flour Bread", category: "Breakfast", description: "Artisan wood-fired bakery with exceptional pastries and morning buns", location: "Freestone", hours: "8:30am-2pm Fri-Sun", phone: "(707) 874-2938", price: "$$", rating: "4.8", zone: "occidental", hasBreakfast: true, address: "140 Bohemian Hwy, Freestone, CA 95472" },
      { name: "Bohemian Cafe", category: "Breakfast", description: "Small-town breakfast spot with espresso drinks and fresh pastries", location: "Occidental", hours: "7am-2pm Wed-Mon", phone: "(707) 874-1234", price: "$", rating: "4.4", zone: "occidental", hasBreakfast: true, address: "3688 Bohemian Hwy, Occidental, CA 95465" },
      { name: "Willow Wood Market Cafe", category: "Breakfast", description: "Organic breakfast and lunch in a garden setting", location: "Graton", hours: "8am-3pm Wed-Mon", phone: "(707) 823-0233", price: "$$", rating: "4.6", zone: "south", hasBreakfast: true, address: "9020 Graton Rd, Graton, CA 95444" },
      { name: "Hardcore Espresso", category: "Breakfast", description: "Punk rock-themed coffee shop with excellent espresso drinks and vegan pastries", location: "Sebastopol", hours: "6:30am-5pm daily", phone: "(707) 829-9010", price: "$", rating: "4.7", zone: "south", hasBreakfast: true, address: "6761 Sebastopol Ave, Sebastopol, CA 95472" },
      { name: "Slice of Life", category: "Breakfast", description: "Health-focused cafe with organic smoothies, acai bowls, and hearty breakfast options", location: "Sebastopol", hours: "7am-3pm daily", phone: "(707) 829-6627", price: "$$", rating: "4.5", zone: "south", hasBreakfast: true, address: "6970 McKinley St, Sebastopol, CA 95472" },
      { name: "Retrograde Coffee Roasters", category: "Breakfast", description: "Local coffee roastery with pastries, breakfast sandwiches, and artisan coffee", location: "Sebastopol", hours: "7am-2pm daily", phone: "(707) 823-7200", price: "$", rating: "4.6", zone: "south", hasBreakfast: true, address: "8351 Gravenstein Hwy, Sebastopol, CA 95472" },
      { name: "Fern Bar", category: "Casual Dining", description: "California coastal cuisine with excellent lunch and dinner plates", location: "Sebastopol", hours: "11am-9pm daily", phone: "(707) 827-3839", price: "$$", rating: "4.7", zone: "south", hasBreakfast: false, address: "6780 McKinley St, Sebastopol, CA 95472" },
      { name: "The Barlow Marketplace Cafe", category: "Breakfast", description: "Artisan marketplace cafe with fresh pastries, breakfast burritos, and local coffee", location: "Sebastopol", hours: "7am-3pm daily", phone: "(707) 824-5600", price: "$$", rating: "4.6", zone: "south", hasBreakfast: true, address: "6770 McKinley St, Sebastopol, CA 95472" },
      { name: "River's End Restaurant", category: "Fine Dining", description: "Spectacular ocean views with fresh seafood and steaks", location: "Jenner", hours: "12pm-8pm Thu-Mon", phone: "(707) 865-2484", price: "$$$", rating: "4.6", zone: "coast", hasBreakfast: false, address: "11048 CA-1, Jenner, CA 95450" },
      { name: "Underwood Bar & Bistro", category: "Casual Dining", description: "Wine country comfort food with extensive local wine list", location: "Graton", hours: "5pm-9pm Wed-Sun", phone: "(707) 823-7023", price: "$$", rating: "4.7", zone: "south", hasBreakfast: false, address: "9113 Graton Rd, Graton, CA 95444" },
      { name: "Ace in the Hole Cider Pub", category: "Casual Dining", description: "Farm-to-table pub featuring house-made ciders and seasonal menu", location: "Sebastopol", hours: "12pm-8pm daily", phone: "(707) 827-3697", price: "$$", rating: "4.5", zone: "south", hasBreakfast: false, address: "3100 Gravenstein Hwy S, Sebastopol, CA 95472" },
      { name: "Stavrand Restaurant", category: "Casual Dining", description: "California cuisine in a cozy, rustic setting", location: "Guerneville", hours: "5pm-9pm Wed-Sun", phone: "(707) 869-0501", price: "$$", rating: "4.4", zone: "central", hasBreakfast: false, address: "16280 Main St, Guerneville, CA 95446" },
      { name: "Cafe Aquatica", category: "Breakfast", description: "Waterfront cafe with coffee, breakfast burritos, and ocean views", location: "Jenner", hours: "8am-3pm daily", phone: "(707) 865-2251", price: "$", rating: "4.5", zone: "coast", hasBreakfast: true, address: "10439 CA-1, Jenner, CA 95450" },
      { name: "Blue Heron Restaurant", category: "Casual Dining", description: "Classic diner with hearty breakfasts and coastal charm", location: "Duncans Mills", hours: "7am-2pm daily", phone: "(707) 865-9135", price: "$", rating: "4.3", zone: "coast", hasBreakfast: true, address: "25300 Steelhead Blvd, Duncans Mills, CA 95430" },
      { name: "Cape Fear Cafe", category: "Casual Dining", description: "Historic cafe in Duncans Mills with homestyle cooking", location: "Duncans Mills", hours: "8am-3pm Fri-Mon", phone: "(707) 865-9246", price: "$", rating: "4.4", zone: "coast", hasBreakfast: true, address: "25191 Main St, Duncans Mills, CA 95430" },
      { name: "Tides Wharf Restaurant", category: "Casual Dining", description: "Fresh seafood and clam chowder overlooking Bodega Bay harbor", location: "Bodega Bay", hours: "7am-9pm daily", phone: "(707) 875-3652", price: "$$", rating: "4.3", zone: "coast", hasBreakfast: true, address: "835 CA-1, Bodega Bay, CA 94923" },
      { name: "Terrapin Creek Cafe", category: "Fine Dining", description: "Award-winning small plates and wine pairings in Bodega Bay", location: "Bodega Bay", hours: "5pm-9pm Thu-Mon", phone: "(707) 875-2700", price: "$$$", rating: "4.7", zone: "coast", hasBreakfast: false, address: "1580 Eastshore Rd, Bodega Bay, CA 94923" },
      { name: "Forestville Coffee House", category: "Breakfast", description: "Cozy neighborhood cafe with artisan coffee and homemade pastries", location: "Forestville", hours: "7am-2pm daily", phone: "(707) 887-1234", price: "$", rating: "4.5", zone: "north", hasBreakfast: true, address: "6535 Front St, Forestville, CA 95436" },
      { name: "Backyard Forestville", category: "Breakfast", description: "Garden patio cafe serving farm-fresh breakfasts and specialty coffee", location: "Forestville", hours: "7:30am-2pm Thu-Mon", phone: "(707) 887-9463", price: "$$", rating: "4.6", zone: "north", hasBreakfast: true, address: "6566 Front St, Forestville, CA 95436" },
      { name: "Forestville Bakery", category: "Breakfast", description: "Local bakery with fresh pastries, breakfast sandwiches, and coffee", location: "Forestville", hours: "6:30am-1pm Wed-Sun", phone: "(707) 887-3301", price: "$", rating: "4.5", zone: "north", hasBreakfast: true, address: "6604 Front St, Forestville, CA 95436" },
      { name: "River Inn Grill", category: "Breakfast", description: "Rustic riverside cafe with hearty American breakfast classics", location: "Forestville", hours: "7am-2pm daily", phone: "(707) 887-7662", price: "$", rating: "4.4", zone: "north", hasBreakfast: true, address: "16141 Main St, Forestville, CA 95436" },
      { name: "Occidental Cafe & General Store", category: "Breakfast", description: "Historic cafe serving hearty breakfasts and local coffee", location: "Occidental", hours: "7am-2pm daily", phone: "(707) 874-1234", price: "$", rating: "4.4", zone: "occidental", hasBreakfast: true, address: "3611 Main St, Occidental, CA 95465" },
      { name: "Downtown Bakery & Creamery", category: "Breakfast", description: "Award-winning bakery with fresh pastries and artisan coffee", location: "Healdsburg", hours: "6:30am-3pm daily", phone: "(707) 431-2719", price: "$$", rating: "4.7", zone: "healdsburg", hasBreakfast: true, address: "308A Center St, Healdsburg, CA 95448" },
      { name: "Costeaux French Bakery", category: "Breakfast", description: "Authentic French bakery with croissants, quiche, and espresso", location: "Healdsburg", hours: "6am-6pm daily", phone: "(707) 433-1913", price: "$$", rating: "4.6", zone: "healdsburg", hasBreakfast: true, address: "417 Healdsburg Ave, Healdsburg, CA 95448" },
      { name: "Flying Goat Coffee", category: "Breakfast", description: "Local coffee roastery with pastries and breakfast sandwiches", location: "Healdsburg", hours: "6:30am-5pm daily", phone: "(707) 433-3599", price: "$", rating: "4.7", zone: "healdsburg", hasBreakfast: true, address: "324 Center St, Healdsburg, CA 95448" },
      { name: "Healdsburg SHED Cafe", category: "Breakfast", description: "Farm-to-table breakfast in a modern market setting", location: "Healdsburg", hours: "7am-3pm daily", phone: "(707) 431-7433", price: "$$", rating: "4.5", zone: "healdsburg", hasBreakfast: true, address: "25 North St, Healdsburg, CA 95448" }
    ],
    
    activities: [
      { name: "Armstrong Redwoods State Natural Reserve", category: "Nature & Hiking", description: "Ancient old-growth redwood forest with peaceful trails", location: "Guerneville", hours: "Sunrise to sunset daily", price: "$10 parking", rating: "4.9", zone: "central", address: "17000 Armstrong Woods Rd, Guerneville, CA 95446" },
      { name: "Johnson's Beach", category: "Outdoor", description: "Family-friendly river beach perfect for swimming and sunbathing", location: "Guerneville", hours: "10am-6pm daily (summer)", price: "Free", rating: "4.5", zone: "central", address: "16241 1st St, Guerneville, CA 95446" },
      { name: "Goat Rock State Beach", category: "Nature", description: "Dramatic coastal cliffs and seal viewing at river mouth", location: "Jenner", hours: "Open 24 hours", price: "Free", rating: "4.8", zone: "coast", address: "Goat Rock Rd, Jenner, CA 95450" },
      { name: "Burke's Canoe Trips", category: "Outdoor", description: "Scenic Russian River kayaking and canoeing adventures", location: "Forestville", hours: "9am-6pm daily (May-Oct)", phone: "(707) 887-1222", price: "$$", rating: "4.6", zone: "north", address: "8600 River Rd, Forestville, CA 95436" },
      { name: "Osmosis Day Spa Sanctuary", category: "Spa", description: "Unique enzyme bath experience and Japanese-inspired spa treatments", location: "Occidental", hours: "9am-8pm daily", phone: "(707) 823-8231", price: "$$$", rating: "4.7", zone: "occidental", address: "209 Bohemian Hwy, Freestone, CA 95472" },
      { name: "Duncans Mills Historic District", category: "Entertainment", description: "Historic railroad town with antique shops and charming main street", location: "Duncans Mills", hours: "Varies by shop", price: "Free", rating: "4.4", zone: "coast", address: "Main St, Duncans Mills, CA 95430" },
      { name: "Bodega Head Trail", category: "Nature & Hiking", description: "Coastal hiking with whale watching opportunities and ocean views", location: "Bodega Bay", hours: "Sunrise to sunset", price: "Free", rating: "4.8", zone: "coast", address: "Bodega Head, Bodega Bay, CA 94923" },
      { name: "Russian River Adventures", category: "Outdoor", description: "River tube rentals and guided float trips", location: "Guerneville", hours: "9am-6pm daily (May-Sep)", phone: "(707) 887-2452", price: "$$", rating: "4.5", zone: "central", address: "20 Healdsburg Ave, Guerneville, CA 95446" },
      { name: "Sonoma Coast State Park", category: "Nature & Hiking", description: "Rugged coastline with tide pools and scenic overlooks", location: "Jenner", hours: "Sunrise to sunset", price: "$8 parking", rating: "4.7", zone: "coast", address: "CA-1, Jenner, CA 95450" },
      { name: "Jenner Headlands Preserve", category: "Nature & Hiking", description: "Coastal trails with panoramic ocean and river views", location: "Jenner", hours: "Sunrise to sunset", price: "Free", rating: "4.6", zone: "coast", address: "22680 CA-1, Jenner, CA 95450" }
    ],
    
    shops: [
      { name: "Nimble & Finn's Ice Cream", category: "Dessert Shop", description: "Artisan ice cream with unique and classic flavors", location: "Guerneville", hours: "12pm-9pm daily", phone: "(707) 604-7462", price: "$", rating: "4.8", zone: "central", address: "16390 4th St, Guerneville, CA 95446" },
      { name: "Main Street Station Antiques", category: "Antiques", description: "Large antique store with vintage finds and collectibles", location: "Guerneville", hours: "10am-6pm daily", phone: "(707) 869-2404", price: "Varies", rating: "4.4", zone: "central", address: "16280 Main St, Guerneville, CA 95446" },
      { name: "Jilly's Roadhouse", category: "Gift Shop", description: "Eclectic gifts, home decor, and local artisan products", location: "Guerneville", hours: "11am-6pm Thu-Mon", phone: "(707) 869-3900", price: "$$", rating: "4.5", zone: "central", address: "16250 Main St, Guerneville, CA 95446" },
      { name: "Copperfield's Books", category: "Bookstore", description: "Independent bookstore with great selection and local author events", location: "Sebastopol", hours: "10am-7pm daily", phone: "(707) 823-2618", price: "Varies", rating: "4.7", zone: "south", address: "138 N Main St, Sebastopol, CA 95472" },
      { name: "The Barlow", category: "Market & Cafe", description: "Artisan marketplace with wine tasting, craft distilleries, and eateries", location: "Sebastopol", hours: "Varies by vendor", price: "$$", rating: "4.6", zone: "south", address: "6770 McKinley St, Sebastopol, CA 95472" },
      { name: "Spud Point Crab Company", category: "Market", description: "Fresh crab and clam chowder at a working harbor", location: "Bodega Bay", hours: "9am-5pm daily", phone: "(707) 875-9472", price: "$$", rating: "4.7", zone: "coast", address: "1860 Westshore Rd, Bodega Bay, CA 94923" },
      { name: "Wild Flour Bread", category: "Bakery", description: "Artisan bakery with wood-fired breads and pastries", location: "Freestone", hours: "8:30am-5:30pm Fri-Mon", phone: "(707) 874-2938", price: "$", rating: "4.8", zone: "occidental", address: "140 Bohemian Hwy, Freestone, CA 95472" },
      { name: "Sebastopol Farmers Market", category: "Market", description: "Weekly farmers market with local produce and crafts", location: "Sebastopol", hours: "10am-1:30pm Sunday", price: "$", rating: "4.6", zone: "south", address: "Depot St, Sebastopol, CA 95472" },
      { name: "Kozlowski Farms", category: "Farm Store", description: "Farm stand with homemade jams, pies, and apple products", location: "Forestville", hours: "9am-5pm daily", phone: "(707) 887-1587", price: "$$", rating: "4.5", zone: "north", address: "5566 Gravenstein Hwy N, Forestville, CA 95436" },
      { name: "Duncans Mills General Store", category: "Gift Shop", description: "Historic general store with gifts, candy, and souvenirs", location: "Duncans Mills", hours: "10am-5pm daily", phone: "(707) 865-2548", price: "$", rating: "4.4", zone: "coast", address: "25101 Main St, Duncans Mills, CA 95430" },
      { name: "Gold Coast Coffee & Bakery", category: "Bakery", description: "Fresh pastries, coffee, and breakfast treats", location: "Duncans Mills", hours: "7am-3pm daily", price: "$", rating: "4.3", zone: "coast", address: "25191 Main St, Duncans Mills, CA 95430" },
      { name: "The Chanslor Guest Ranch Gift Shop", category: "Gift Shop", description: "Western-themed gifts and local artwork", location: "Bodega Bay", hours: "10am-5pm daily", price: "$$", rating: "4.2", zone: "coast", address: "2660 CA-1, Bodega Bay, CA 94923" }
    ]
  };

  // ROUTE THEMES - Each route is built around specific experiences and zones
  const routeThemes = [
    {
      name: "Russian River Heartland",
      theme: { name: "Wine & Dine", icon: "🍷" },
      wineryRecommendation: { trail: wineTrails[0], timeSlot: '11:00 AM - 2:30 PM' },
      zones: ['central', 'north'],
      exclusions: []
    },
    {
      name: "Sparkling Wine Route",
      theme: { name: "Bubbles & Beauty", icon: "✨" },
      wineryRecommendation: { trail: wineTrails[1], timeSlot: '11:30 AM - 2:00 PM' },
      zones: ['central', 'south'],
      exclusions: []
    },
    {
      name: "Artisan Wine & Farm Trail",
      theme: { name: "Farm to Glass", icon: "🌾" },
      wineryRecommendation: { trail: wineTrails[2], timeSlot: '12:00 PM - 3:00 PM' },
      zones: ['south', 'occidental'],
      exclusions: []
    },
    {
      name: "Coastal Adventure",
      theme: { name: "Ocean & Coast", icon: "🌊" },
      zones: ['coast'], // STRICT: Coast only - no mixing with inland!
      shoppingRecommendation: { district: shoppingDistricts[4], timeSlot: '2:00 PM - 4:00 PM' },
      exclusions: []
    },
    {
      name: "Sebastopol Explorer",
      theme: { name: "Arts & Crafts", icon: "🎨" },
      zones: ['south', 'occidental'], // Sebastopol + Occidental (compatible zones)
      shoppingRecommendation: { district: shoppingDistricts[2], timeSlot: '2:00 PM - 5:00 PM' },
      exclusions: []
    }
  ];

  // Function to search experiences
  const openSearchModal = (type) => {
    setSearchType(type);
    setSearchQuery('');
    setShowSearchModal(true);
  };

  const getGroupedSearchResults = () => {
    const query = searchQuery.toLowerCase();
    const allResults = [];

    if (searchType === 'signature' || searchType === 'all') {
      const sigResults = signatureExperiences.filter(exp =>
        query === '' || // Show all if no query
        exp.name.toLowerCase().includes(query) ||
        exp.description.toLowerCase().includes(query) ||
        exp.tagline.toLowerCase().includes(query)
      );
      allResults.push(...sigResults);
    }

    if (searchType === 'all') {
      ['wineries', 'restaurants', 'activities', 'shops'].forEach(category => {
        const categoryResults = experiencesDatabase[category]?.filter(item =>
          query === '' || // Show all if no query
          item.name.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query) ||
          item.category.toLowerCase().includes(query)
        );
        if (categoryResults) allResults.push(...categoryResults);
      });
    }

    const grouped = {};
    allResults.forEach(result => {
      const cat = result.category || 'Other';
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(result);
    });

    return grouped;
  };

  // Get all experiences grouped by region and category for "Search All"
  const getExperiencesByRegionAndCategory = () => {
    const query = searchQuery.toLowerCase();
    const regions = {
      'Guerneville Area (Central)': { zones: ['central'], experiences: [] },
      'Forestville Area (North)': { zones: ['north'], experiences: [] },
      'Sebastopol/Graton Area (South)': { zones: ['south'], experiences: [] },
      'Occidental Area': { zones: ['occidental'], experiences: [] },
      'Healdsburg Area': { zones: ['healdsburg'], experiences: [] },
      'Coastal Area': { zones: ['coast'], experiences: [] }
    };

    // Add signature experiences (these don't have zones, so add to all regions or first region)
    const sigResults = signatureExperiences.filter(exp =>
      query === '' ||
      exp.name.toLowerCase().includes(query) ||
      exp.description.toLowerCase().includes(query) ||
      exp.tagline.toLowerCase().includes(query)
    );

    // Group all database experiences by zone
    ['wineries', 'restaurants', 'activities', 'shops'].forEach(category => {
      const items = experiencesDatabase[category] || [];
      items.forEach(item => {
        if (query === '' ||
            item.name.toLowerCase().includes(query) ||
            item.description.toLowerCase().includes(query) ||
            (item.category && item.category.toLowerCase().includes(query))) {
          
          // Add to appropriate region based on zone
          Object.entries(regions).forEach(([regionName, regionData]) => {
            if (regionData.zones.includes(item.zone)) {
              regionData.experiences.push(item);
            }
          });
        }
      });
    });

    // Add signature experiences to first region if they passed filter
    if (sigResults.length > 0) {
      regions['Guerneville Area (Central)'].experiences.unshift(...sigResults);
    }

    // Now group by category within each region
    const result = {};
    Object.entries(regions).forEach(([regionName, regionData]) => {
      if (regionData.experiences.length > 0) {
        const categorized = {};
        regionData.experiences.forEach(exp => {
          const cat = exp.category || 'Signature Experience';
          if (!categorized[cat]) categorized[cat] = [];
          categorized[cat].push(exp);
        });
        result[regionName] = categorized;
      }
    });

    return result;
  };

  // Function to generate itinerary
  // Helper function to get zone display info - MATCHING DOCUMENT COLOR SCHEME
  const getZoneInfo = (zone) => {
    const zoneMap = {
      'central': { name: 'Guerneville', color: 'bg-red-900/40 text-stone-200 border-red-700', icon: '🏘️' },
      'north': { name: 'Forestville', color: 'bg-amber-900/40 text-amber-200 border-amber-700', icon: '🌲' },
      'south': { name: 'Sebastopol', color: 'bg-stone-700/40 text-stone-200 border-stone-600', icon: '🍇' },
      'occidental': { name: 'Occidental', color: 'bg-red-800/40 text-stone-200 border-red-600', icon: '🏔️' },
      'healdsburg': { name: 'Healdsburg', color: 'bg-amber-800/40 text-amber-200 border-amber-600', icon: '🍷' },
      'coast': { name: 'Coast', color: 'bg-stone-600/40 text-stone-100 border-stone-500', icon: '🌊' }
    };
    return zoneMap[zone] || { name: zone, color: 'bg-stone-500/40 text-stone-200 border-stone-400', icon: '📍' };
  };

  const generateItinerary = () => {
    const itinerary = [];
    const usedActivities = new Set();
    const usedRoutes = new Set();
    
    // Track special experiences at itinerary level (not just day level)
    // Only allow once for trips < 4 days, can repeat for 4+ days
    let wineTrailUsed = false;
    let shoppingDistrictUsed = false;
    
    // Helper function to get activity type for variety checking
    const getActivityType = (activity) => {
      const name = activity.name.toLowerCase();
      if (name.includes('canoe') || name.includes('kayak') || name.includes('paddle')) return 'water_sports';
      if (name.includes('hike') || name.includes('trail') || name.includes('redwood') || name.includes('preserve')) return 'hiking';
      if (name.includes('beach') || name.includes('coast')) return 'coastal';
      if (name.includes('spa') || name.includes('wellness')) return 'wellness';
      return 'other';
    };
    
    // ZONE COMPATIBILITY - Define which zones can be visited on the same day
    // These groupings make geographic sense and minimize driving
    // CRITICAL: All activity selections (wine trails, shopping districts, activities)
    // must respect these zone groupings to ensure logical out-and-back routing
    const zoneCompatibility = {
      'central': ['central', 'north'], // Guerneville + Forestville (close together)
      'north': ['central', 'north'], // Forestville + Guerneville
      'south': ['south', 'occidental'], // Sebastopol/Graton + Occidental
      'occidental': ['south', 'occidental'], // Occidental + Sebastopol
      'healdsburg': ['healdsburg', 'north'], // Healdsburg + Forestville
      'coast': ['coast', 'occidental'] // Coast + Occidental (Hazel is on the way back from coast)
    };
    
    // RETURN ROUTE ZONES - What zones are "on the way back" to Rio Nido Lodge (central)
    // This helps select dinner spots that make sense when returning from day trips
    const returnRouteZones = {
      'coast': ['coast', 'occidental', 'central'], // From coast, Occidental (Hazel) and Guerneville are on the way back
      'south': ['south', 'occidental', 'central'], // From Sebastopol area, these are reasonable return paths
      'occidental': ['occidental', 'central'], // From Occidental, these make sense
      'north': ['north', 'central'], // From Forestville, stay in these zones
      'healdsburg': ['healdsburg', 'north', 'central'], // From Healdsburg, these are on the way
      'central': ['central'] // Already home!
    };
    
    // Helper to select random unused item - STRICT zone filtering, no random fallback
    const getUnusedItem = (allItems, routeZones, filterFn = () => true, timeSlot = null) => {
      // Build compatible zones list from route zones
      const compatibleZones = new Set();
      routeZones.forEach(zone => {
        if (zoneCompatibility[zone]) {
          zoneCompatibility[zone].forEach(z => compatibleZones.add(z));
        }
      });
      
      // STRICT: Only items from compatible zones that are open during the time slot
      let available = allItems.filter(item => {
        const zoneMatch = compatibleZones.has(item.zone);
        const notUsed = !usedActivities.has(item.name);
        const customFilter = filterFn(item);
        const hoursMatch = !timeSlot || isOpenDuringTimeSlot(item, timeSlot);
        
        return zoneMatch && notUsed && customFilter && hoursMatch;
      });
      
      // If still nothing available, only then expand to route zones
      if (available.length === 0) {
        available = allItems.filter(item => {
          const zoneMatch = routeZones.includes(item.zone);
          const notUsed = !usedActivities.has(item.name);
          const customFilter = filterFn(item);
          const hoursMatch = !timeSlot || isOpenDuringTimeSlot(item, timeSlot);
          
          return zoneMatch && notUsed && customFilter && hoursMatch;
        });
      }
      
      // NEVER fall back to all zones - return null if nothing available
      if (available.length === 0) return null;
      
      const selected = available[Math.floor(Math.random() * available.length)];
      usedActivities.add(selected.name);
      return selected;
    };
    
    // Helper to get dinner on the return route
    const getDinnerOnReturnRoute = (routeZones, excludeGraze = false) => {
      const dinnerOptions = experiencesDatabase.restaurants.filter(r => !r.hasBreakfast);
      
      // Build return route zones based on the day's farthest point
      const returnZones = new Set();
      routeZones.forEach(zone => {
        if (returnRouteZones[zone]) {
          returnRouteZones[zone].forEach(z => returnZones.add(z));
        }
      });
      
      // Filter for return route + unused
      const availableDinners = dinnerOptions.filter(item => {
        if (excludeGraze && (item.name === 'Graze' || item.name === 'Graze Brunch' || item.name === 'Rio Nido Lodge Lounge')) return false;
        return returnZones.has(item.zone) && !usedActivities.has(item.name);
      });
      
      if (availableDinners.length === 0) return null;
      
      const selected = availableDinners[Math.floor(Math.random() * availableDinners.length)];
      usedActivities.add(selected.name);
      return selected;
    };

    // Determine if user wants coastal experiences
    const wantsCoastal = preferences.interests.includes('Coastal Adventures');

    // Get Graze restaurant for Day 1 dinner
    const grazeRestaurant = experiencesDatabase.restaurants.find(r => r.name === 'Graze');

    // Generate itinerary for each day
    for (let day = 1; day <= preferences.duration; day++) {
      // Select a route theme for this day
      let availableRoutes = routeThemes.filter(r => !usedRoutes.has(r.name));
      
      // If coastal selected, prioritize coastal routes
      if (wantsCoastal) {
        const coastalRoutes = availableRoutes.filter(r => r.zones.includes('coast'));
        if (coastalRoutes.length > 0) {
          availableRoutes = coastalRoutes;
        }
      }
      
      if (availableRoutes.length === 0) {
        // Reset if we run out
        usedRoutes.clear();
        availableRoutes = routeThemes;
      }
      
      const todaysRoute = availableRoutes[Math.floor(Math.random() * availableRoutes.length)];
      usedRoutes.add(todaysRoute.name);

      const dayActivities = [];
      const dayActivityTypes = new Set(); // Track types used today for variety

      // ===== 8:00 AM - BREAKFAST ===== ALWAYS REQUIRED!
      let breakfastOptions = experiencesDatabase.restaurants.filter(r => r.hasBreakfast && !r.isGrazeFallback);
      
      // PRIORITIZE Markets & Delis if toggle is on
      if (preferences.includeMarkets) {
        const marketsAndDelis = breakfastOptions.filter(r => 
          r.category === 'Breakfast & Market' || r.category === 'Market & Cafe'
        );
        // Try markets first, then fall back to regular breakfast
        if (marketsAndDelis.length > 0) {
          breakfastOptions = marketsAndDelis;
        }
      }
      
      let breakfast = getUnusedItem(breakfastOptions, todaysRoute.zones, () => true, '8:00 AM');
      
      // If no breakfast in route zones, expand to compatible zones
      if (!breakfast) {
        const compatibleZones = new Set();
        todaysRoute.zones.forEach(zone => {
          if (zoneCompatibility[zone]) {
            zoneCompatibility[zone].forEach(z => compatibleZones.add(z));
          }
        });
        
        const compatibleBreakfast = experiencesDatabase.restaurants.filter(item => {
          return item.hasBreakfast && !item.isGrazeFallback && compatibleZones.has(item.zone) && !usedActivities.has(item.name);
        });
        
        if (compatibleBreakfast.length > 0) {
          breakfast = compatibleBreakfast[Math.floor(Math.random() * compatibleBreakfast.length)];
          usedActivities.add(breakfast.name);
        }
      }
      
      // FALLBACK FOR 3+ DAY TRIPS: If still no breakfast, use Graze at Rio Nido Lodge
      if (!breakfast && preferences.duration >= 3) {
        const grazeFallbackOptions = experiencesDatabase.restaurants.filter(r => r.isGrazeFallback && !usedActivities.has(r.name));
        if (grazeFallbackOptions.length > 0) {
          // Pick appropriate option (brunch for Fri-Sun, lounge for Mon-Thu)
          breakfast = grazeFallbackOptions[Math.floor(Math.random() * grazeFallbackOptions.length)];
          usedActivities.add(breakfast.name);
        }
      }
      
      // ALWAYS add breakfast if we found one
      if (breakfast) {
        dayActivities.push({
          ...breakfast,
          timeSlot: '8:00 AM - 9:30 AM',
          badge: '🥐 Breakfast',
          routeStop: 1
        });
      }

      // ===== 10:00 AM - MORNING ACTIVITY =====
      // Priority: Shopping District > Spa & Wellness > Nature & Hiking > Coastal Adventures
      let morningActivity = null;
      
      // SHOPPING DISTRICT - Only once for trips < 4 days, can repeat for 4+ days
      const canAddShoppingDistrict = preferences.duration >= 4 || !shoppingDistrictUsed;
      
      if (preferences.interests.includes('Shopping') && preferences.includeMarkets && !morningActivity && canAddShoppingDistrict) {
        // PRIORITY 1: Try route's recommended shopping district
        let district = null;
        if (todaysRoute.shoppingRecommendation && !usedActivities.has(todaysRoute.shoppingRecommendation.district.name)) {
          district = todaysRoute.shoppingRecommendation.district;
        } else {
          // PRIORITY 2: Try districts in the EXACT route zones (not compatible zones)
          const routeZoneDistricts = shoppingDistricts.filter(d => 
            !usedActivities.has(d.name) && todaysRoute.zones.includes(d.zone)
          );
          
          if (routeZoneDistricts.length > 0) {
            district = routeZoneDistricts[Math.floor(Math.random() * routeZoneDistricts.length)];
          } else {
            // PRIORITY 3: Fall back to compatible zones if nothing in exact zones
            const compatibleZones = new Set();
            todaysRoute.zones.forEach(zone => {
              if (zoneCompatibility[zone]) {
                zoneCompatibility[zone].forEach(z => compatibleZones.add(z));
              }
            });
            
            const compatibleDistricts = shoppingDistricts.filter(d => 
              !usedActivities.has(d.name) && compatibleZones.has(d.zone)
            );
            
            if (compatibleDistricts.length > 0) {
              district = compatibleDistricts[Math.floor(Math.random() * compatibleDistricts.length)];
            }
          }
        }
        
        if (district) {
          usedActivities.add(district.name);
          shoppingDistrictUsed = true;
          dayActivities.push({
            ...district,
            timeSlot: '10:00 AM - 12:00 PM',
            badge: '🛍️ Shopping District',
            routeStop: 2,
            isDistrict: true
          });
          morningActivity = district;
        }
      }
      
      // SPA & WELLNESS
      if (preferences.interests.includes('Spa & Wellness') && !morningActivity) {
        const spaActivities = experiencesDatabase.activities.filter(a => a.category === 'Spa');
        morningActivity = getUnusedItem(spaActivities, todaysRoute.zones, () => true, '10:00 AM');
        if (morningActivity) {
          dayActivities.push({
            ...morningActivity,
            timeSlot: '10:00 AM - 12:00 PM',
            badge: '🧘 Spa & Wellness',
            routeStop: 2
          });
        }
      }
      
      // NATURE & HIKING
      if (preferences.interests.includes('Nature & Hiking') && !morningActivity) {
        const natureActivities = experiencesDatabase.activities.filter(a => 
          a.category === 'Nature & Hiking' || a.category === 'Nature' || a.category === 'Outdoor'
        );
        morningActivity = getUnusedItem(natureActivities, todaysRoute.zones, () => true, '10:00 AM');
        if (morningActivity) {
          const activityType = getActivityType(morningActivity);
          dayActivityTypes.add(activityType);
          dayActivities.push({
            ...morningActivity,
            timeSlot: '10:00 AM - 12:00 PM',
            badge: '🥾 Morning Activity',
            routeStop: 2
          });
        }
      }
      
      // COASTAL ADVENTURES
      if (preferences.interests.includes('Coastal Adventures') && !morningActivity) {
        const coastalActivities = experiencesDatabase.activities.filter(a => a.zone === 'coast');
        morningActivity = getUnusedItem(coastalActivities, todaysRoute.zones, () => true, '10:00 AM');
        if (morningActivity) {
          const activityType = getActivityType(morningActivity);
          dayActivityTypes.add(activityType);
          dayActivities.push({
            ...morningActivity,
            timeSlot: '10:00 AM - 12:00 PM',
            badge: '🌊 Coastal Adventure',
            routeStop: 2
          });
        }
      }
      
      // FALLBACK: If no morning activity and we have at least 4 activities already, add ANY available activity
      if (!morningActivity) {
        const allActivities = experiencesDatabase.activities.filter(a => {
          const type = getActivityType(a);
          return !dayActivityTypes.has(type); // Don't add if we already have this type today
        });
        morningActivity = getUnusedItem(allActivities, todaysRoute.zones, () => true, '10:00 AM');
        if (morningActivity) {
          const activityType = getActivityType(morningActivity);
          dayActivityTypes.add(activityType);
          dayActivities.push({
            ...morningActivity,
            timeSlot: '10:00 AM - 12:00 PM',
            badge: '🥾 Morning Activity',
            routeStop: 2
          });
        }
      }
      
      // GUARANTEED FALLBACK: If still no morning activity, try ANY activity from compatible zones
      if (!morningActivity) {
        const compatibleZones = new Set();
        todaysRoute.zones.forEach(zone => {
          if (zoneCompatibility[zone]) {
            zoneCompatibility[zone].forEach(z => compatibleZones.add(z));
          }
        });
        
        const compatibleActivities = experiencesDatabase.activities.filter(item => {
          const type = getActivityType(item);
          return compatibleZones.has(item.zone) && !usedActivities.has(item.name) && !dayActivityTypes.has(type);
        });
        
        if (compatibleActivities.length > 0) {
          morningActivity = compatibleActivities[Math.floor(Math.random() * compatibleActivities.length)];
          usedActivities.add(morningActivity.name);
          const activityType = getActivityType(morningActivity);
          dayActivityTypes.add(activityType);
          dayActivities.push({
            ...morningActivity,
            timeSlot: '10:00 AM - 12:00 PM',
            badge: '🥾 Morning Activity',
            routeStop: 2
          });
        }
      }

      // ===== 12:00 PM - WINE TRAIL OR LUNCH =====
      // Wine trail: Only once for trips < 4 days, can repeat for 4+ days
      const canAddWineTrail = preferences.duration >= 4 || !wineTrailUsed;
      
      if (preferences.interests.includes('Wine Tasting') && canAddWineTrail) {
        // Try route's wine trail first, then any unused wine trail THAT MATCHES ROUTE ZONES
        let wineTrail = null;
        
        if (todaysRoute.wineryRecommendation && !usedActivities.has(todaysRoute.wineryRecommendation.trail.name)) {
          wineTrail = todaysRoute.wineryRecommendation.trail;
        } else {
          // Build compatible zones for wine trail selection
          const compatibleZones = new Set();
          todaysRoute.zones.forEach(zone => {
            if (zoneCompatibility[zone]) {
              zoneCompatibility[zone].forEach(z => compatibleZones.add(z));
            }
          });
          
          // Only select wine trails whose zone is compatible with today's route
          const availableTrails = wineTrails.filter(t => 
            !usedActivities.has(t.name) && compatibleZones.has(t.zone)
          );
          
          if (availableTrails.length > 0) {
            wineTrail = availableTrails[Math.floor(Math.random() * availableTrails.length)];
          }
        }
        
        if (wineTrail) {
          usedActivities.add(wineTrail.name);
          wineTrailUsed = true; // Mark as used for this itinerary
          dayActivities.push({
            ...wineTrail,
            timeSlot: '12:00 PM - 3:00 PM',
            badge: '🍷 Wine Trail',
            routeStop: 3,
            isTrail: true
          });
        } else {
          // No wine trails available, MUST do lunch instead
          let lunchOptions = experiencesDatabase.restaurants.filter(r => !r.hasBreakfast);
          
          // PRIORITIZE Markets & Delis if toggle is on
          if (preferences.includeMarkets) {
            const marketsAndDelis = lunchOptions.filter(r => 
              r.category === 'Breakfast & Market' || r.category === 'Market & Cafe'
            );
            if (marketsAndDelis.length > 0) {
              lunchOptions = marketsAndDelis;
            }
          }
          
          const lunch = getUnusedItem(lunchOptions, todaysRoute.zones, () => true, '12:30 PM');
          
          if (lunch) {
            dayActivities.push({
              ...lunch,
              timeSlot: '12:30 PM - 2:00 PM',
              badge: '🍽️ Lunch',
              routeStop: 3
            });
          }
        }
      } else {
        // No wine trail allowed or wine tasting not selected, so lunch is REQUIRED here
        let lunchOptions = experiencesDatabase.restaurants.filter(r => !r.hasBreakfast);
        
        // PRIORITIZE Markets & Delis if toggle is on
        if (preferences.includeMarkets) {
          const marketsAndDelis = lunchOptions.filter(r => 
            r.category === 'Breakfast & Market' || r.category === 'Market & Cafe'
          );
          if (marketsAndDelis.length > 0) {
            lunchOptions = marketsAndDelis;
          }
        }
        
        const lunch = getUnusedItem(lunchOptions, todaysRoute.zones, () => true, '12:30 PM');
        
        // ENSURE lunch is added even if zone matching fails
        if (lunch) {
          dayActivities.push({
            ...lunch,
            timeSlot: '12:30 PM - 2:00 PM',
            badge: '🍽️ Lunch',
            routeStop: 3
          });
        } else {
          // Last resort: pick ANY lunch option available
          const allLunchOptions = experiencesDatabase.restaurants.filter(r => 
            !r.hasBreakfast && !usedActivities.has(r.name)
          );
          if (allLunchOptions.length > 0) {
            const fallbackLunch = allLunchOptions[Math.floor(Math.random() * allLunchOptions.length)];
            usedActivities.add(fallbackLunch.name);
            dayActivities.push({
              ...fallbackLunch,
              timeSlot: '12:30 PM - 2:00 PM',
              badge: '🍽️ Lunch',
              routeStop: 3
            });
          }
        }
      }

      // ===== 3:00 PM - AFTERNOON ACTIVITY =====
      // Priority: Shopping District (if conditions met) > Spa > Nature/Coastal activities
      
      const hadWineTrail = dayActivities.some(a => a.isTrail);
      const hadMorningShoppingDistrict = dayActivities.some(a => a.isDistrict);
      let afternoonActivity = null;
      
      // SHOPPING DISTRICT - can appear if not used yet (or if 4+ days) and not in morning
      const canAddAfternoonShopping = (preferences.duration >= 4 || !shoppingDistrictUsed) && !hadMorningShoppingDistrict;
      
      if (preferences.interests.includes('Shopping') && preferences.includeMarkets && canAddAfternoonShopping && !afternoonActivity) {
        // PRIORITY 1: Try route's recommended shopping district
        let district = null;
        if (todaysRoute.shoppingRecommendation && !usedActivities.has(todaysRoute.shoppingRecommendation.district.name)) {
          district = todaysRoute.shoppingRecommendation.district;
        } else {
          // PRIORITY 2: Try districts in the EXACT route zones (not compatible zones)
          const routeZoneDistricts = shoppingDistricts.filter(d => 
            !usedActivities.has(d.name) && todaysRoute.zones.includes(d.zone)
          );
          
          if (routeZoneDistricts.length > 0) {
            district = routeZoneDistricts[Math.floor(Math.random() * routeZoneDistricts.length)];
          } else {
            // PRIORITY 3: Fall back to compatible zones if nothing in exact zones
            const compatibleZones = new Set();
            todaysRoute.zones.forEach(zone => {
              if (zoneCompatibility[zone]) {
                zoneCompatibility[zone].forEach(z => compatibleZones.add(z));
              }
            });
            
            const compatibleDistricts = shoppingDistricts.filter(d => 
              !usedActivities.has(d.name) && compatibleZones.has(d.zone)
            );
            
            if (compatibleDistricts.length > 0) {
              district = compatibleDistricts[Math.floor(Math.random() * compatibleDistricts.length)];
            }
          }
        }
        
        if (district) {
          usedActivities.add(district.name);
          shoppingDistrictUsed = true;
          dayActivities.push({
            ...district,
            timeSlot: hadWineTrail ? '3:30 PM - 5:30 PM' : '3:00 PM - 5:00 PM',
            badge: '🛍️ Shopping District',
            routeStop: 4,
            isDistrict: true
          });
          afternoonActivity = district;
        }
      }
      
      // SPA & WELLNESS - if spa selected and no afternoon activity yet
      if (preferences.interests.includes('Spa & Wellness') && !afternoonActivity) {
        const spaActivities = experiencesDatabase.activities.filter(a => a.category === 'Spa');
        const spa = getUnusedItem(spaActivities, todaysRoute.zones, () => true, '3:00 PM');
        if (spa) {
          dayActivities.push({
            ...spa,
            timeSlot: '3:00 PM - 5:00 PM',
            badge: '🧘 Spa & Wellness',
            routeStop: 4
          });
          afternoonActivity = spa;
        }
      }
      
      // NATURE/COASTAL/OTHER ACTIVITIES - if no specific afternoon activity yet
      if (!afternoonActivity) {
        const afternoonActivities = experiencesDatabase.activities.filter(a => {
          const type = getActivityType(a);
          return !dayActivityTypes.has(type); // Don't add if we already have this type today
        });
        const activity = getUnusedItem(afternoonActivities, todaysRoute.zones, () => true, '3:00 PM');
        if (activity) {
          const activityType = getActivityType(activity);
          dayActivityTypes.add(activityType);
          dayActivities.push({
            ...activity,
            timeSlot: '3:00 PM - 5:00 PM',
            badge: '✨ Afternoon Activity',
            routeStop: 4
          });
          afternoonActivity = activity;
        }
      }
      
      // GUARANTEED FALLBACK: If still no afternoon activity, try ANY activity from compatible zones
      if (!afternoonActivity) {
        const compatibleZones = new Set();
        todaysRoute.zones.forEach(zone => {
          if (zoneCompatibility[zone]) {
            zoneCompatibility[zone].forEach(z => compatibleZones.add(z));
          }
        });
        
        const compatibleActivities = experiencesDatabase.activities.filter(item => {
          const type = getActivityType(item);
          return compatibleZones.has(item.zone) && !usedActivities.has(item.name) && !dayActivityTypes.has(type);
        });
        
        if (compatibleActivities.length > 0) {
          const activity = compatibleActivities[Math.floor(Math.random() * compatibleActivities.length)];
          usedActivities.add(activity.name);
          const activityType = getActivityType(activity);
          dayActivityTypes.add(activityType);
          dayActivities.push({
            ...activity,
            timeSlot: '3:00 PM - 5:00 PM',
            badge: '✨ Afternoon Activity',
            routeStop: 4
          });
          afternoonActivity = activity;
        }
      }

      // ===== 5:30 PM - LATE AFTERNOON (Optional) =====
      // Sweet treat or local shop if enabled
      if (preferences.interests.includes('Shopping') && preferences.includeSweets) {
        const dessertShops = experiencesDatabase.shops.filter(s => 
          s.category === 'Dessert Shop' || s.category === 'Bakery'
        );
        const shop = getUnusedItem(dessertShops, todaysRoute.zones, () => true, '5:30 PM');
        if (shop) {
          dayActivities.push({
            ...shop,
            timeSlot: '5:30 PM - 6:15 PM',
            badge: '🍨 Sweet Treat',
            routeStop: 5
          });
        }
      }

      // ===== 6:30 PM - DINNER ===== 
      // IMPROVED: Consider return route to Rio Nido Lodge
      let dinner;
      
      // Try to use Graze on the first compatible day (central or north route)
      const routeCompatibleWithGraze = todaysRoute.zones.includes('central') || todaysRoute.zones.includes('north');
      
      if (grazeRestaurant && !usedActivities.has('Graze') && routeCompatibleWithGraze) {
        // Use Graze on the first day that has a compatible route
        dinner = grazeRestaurant;
        usedActivities.add('Graze');
      } else {
        // For all other days, prioritize restaurants on the return route
        dinner = getDinnerOnReturnRoute(todaysRoute.zones, true); // exclude Graze from search
      }

      if (dinner) {
        dayActivities.push({
          ...dinner,
          timeSlot: '6:30 PM - 8:30 PM',
          badge: '🍽️ Dinner',
          routeStop: 6
        });
      }

      itinerary.push({
        day: day,
        routeName: todaysRoute.name,
        theme: generateDayTheme(dayActivities),
        activities: dayActivities
      });
    }

    setGeneratedItinerary(itinerary);
    setCurrentStep('itinerary');
  };

  // Function to generate theme based on actual activities in the day
  const generateDayTheme = (activities) => {
    const hasWineTrail = activities.some(a => a.isTrail);
    const hasShoppingDistrict = activities.some(a => a.isDistrict);
    const hasSpa = activities.some(a => a.category === 'Spa');
    const hasCoastal = activities.some(a => a.zone === 'coast');
    const hasNature = activities.some(a => 
      a.category === 'Nature & Hiking' || 
      a.category === 'Nature' || 
      a.category === 'Outdoor'
    );

    // Priority order for theme selection
    if (hasWineTrail && hasShoppingDistrict) {
      return { name: "Vineyard & Village Explorer", icon: "🍷🛍️" };
    } else if (hasWineTrail) {
      return { name: "Wine Country Journey", icon: "🍷" };
    } else if (hasSpa && hasCoastal) {
      return { name: "Coastal Serenity & Spa", icon: "🧘🌊" };
    } else if (hasSpa) {
      return { name: "Relaxation & Renewal", icon: "🧘" };
    } else if (hasCoastal && hasNature) {
      return { name: "Redwoods to Rugged Coast", icon: "🌊🌲" };
    } else if (hasCoastal) {
      return { name: "Pacific Coast Discovery", icon: "🌊" };
    } else if (hasShoppingDistrict && hasNature) {
      return { name: "Village Charm & Natural Beauty", icon: "🛍️🥾" };
    } else if (hasShoppingDistrict) {
      return { name: "Artisan Village Adventure", icon: "🛍️" };
    } else if (hasNature) {
      return { name: "Forest & Valley Escape", icon: "🌲" };
    } else {
      return { name: "Russian River Discovery", icon: "✨" };
    }
  };

  // NEW FUNCTION: Plan day around signature experience
  const planDayAroundSignature = (signatureExp) => {
    const itinerary = [];
    const usedActivities = new Set([signatureExp.name]);
    
    // Helper to select random unused item - works across all zones
    const getUnusedItem = (items, filterFn = () => true) => {
      const available = items.filter(item => {
        return !usedActivities.has(item.name) && filterFn(item);
      });
      
      if (available.length === 0) return null;
      
      const selected = available[Math.floor(Math.random() * available.length)];
      usedActivities.add(selected.name);
      return selected;
    };

    const dayActivities = [];

    // BREAKFAST
    const breakfastOptions = experiencesDatabase.restaurants.filter(r => r.hasBreakfast);
    const breakfast = getUnusedItem(breakfastOptions);
    if (breakfast) {
      dayActivities.push({
        ...breakfast,
        timeSlot: '8:00 AM - 9:30 AM',
        badge: '🥐 Breakfast',
        routeStop: 1
      });
    }

    // MORNING ACTIVITY - before signature experience
    const morningActivity = getUnusedItem(experiencesDatabase.activities);
    if (morningActivity) {
      dayActivities.push({
        ...morningActivity,
        timeSlot: '10:00 AM - 11:30 AM',
        badge: '🥾 Morning Activity',
        routeStop: 2
      });
    }

    // SIGNATURE EXPERIENCE - The star of the day
    dayActivities.push({
      ...signatureExp,
      timeSlot: signatureExp.bestTime || '12:00 PM - 3:00 PM',
      badge: '⭐ Signature Experience',
      routeStop: 3
    });

    // AFTERNOON TREAT
    if (preferences.includeSweets) {
      const dessertShop = getUnusedItem(experiencesDatabase.shops.filter(s => 
        s.category === 'Dessert Shop' || s.category === 'Bakery'
      ));
      if (dessertShop) {
        dayActivities.push({
          ...dessertShop,
          timeSlot: '3:30 PM - 4:30 PM',
          badge: '🍨 Sweet Treat',
          routeStop: 4
        });
      }
    }

    // DINNER (never breakfast)
    const dinnerOptions = experiencesDatabase.restaurants.filter(r => !r.hasBreakfast);
    const dinner = getUnusedItem(dinnerOptions);
    if (dinner) {
      dayActivities.push({
        ...dinner,
        timeSlot: '6:30 PM - 8:30 PM',
        badge: '🍽️ Dinner',
        routeStop: 5
      });
    }

    itinerary.push({
      day: 1,
      routeName: `${signatureExp.name} Day`,
      theme: { name: "Signature Experience", icon: "⭐" },
      activities: dayActivities
    });

    setGeneratedItinerary(itinerary);
    setShowSignatureModal(false);
    setCurrentStep('itinerary');
  };

  // Function to check if an activity can be replaced
  const canReplaceActivity = (dayIndex, activityIndex) => {
    const day = generatedItinerary[dayIndex];
    const activity = day.activities[activityIndex];
    
    // Don't allow replacing signature experiences, wine trails, or shopping districts
    if (activity.isTrail || activity.isDistrict || activity.id?.startsWith('sig')) {
      return false;
    }

    // Check if there are alternative options available
    const categoryMap = {
      'Wine Tasting': 'wineries',
      'Dining': 'restaurants',
      'Fine Dining': 'restaurants',
      'Breakfast': 'restaurants',
      'Breakfast & Brunch': 'restaurants',
      'Breakfast & Market': 'restaurants',
      'Casual Dining': 'restaurants',
      'Bakery': 'restaurants',
      'Dessert': 'restaurants',
      'Nature & Hiking': 'activities',
      'Outdoor': 'activities',
      'Nature': 'activities',
      'Entertainment': 'activities',
      'Culture': 'activities',
      'Activity': 'activities',
      'Water Sports': 'activities',
      'Adventure': 'activities',
      'Market': 'activities',
      'Dessert Shop': 'shops',
      'Antiques': 'shops',
      'Bookstore': 'shops',
      'Gift Shop': 'shops',
      'Spa': 'shops',
      'Farm Store': 'shops',
      'Market & Cafe': 'shops',
      'Gallery': 'shops'
    };

    const dbCategory = categoryMap[activity.category];
    if (!dbCategory) return false;

    const availableOptions = experiencesDatabase[dbCategory].filter(item => {
      // For restaurants, allow flexible swapping based on meal type
      if (dbCategory === 'restaurants') {
        const isBreakfast = activity.hasBreakfast || activity.category.includes('Breakfast') || activity.category === 'Bakery';
        const itemIsBreakfast = item.hasBreakfast || item.category.includes('Breakfast') || item.category === 'Bakery';
        
        // Breakfast items can only swap with breakfast items, dinner with dinner
        if (isBreakfast !== itemIsBreakfast) return false;
      } else {
        // For non-restaurants, must be same category
        if (item.category !== activity.category) return false;
      }
      
      // Must not be currently used in itinerary
      const isUsed = generatedItinerary.some(d => 
        d.activities.some(a => a.name === item.name)
      );
      return !isUsed;
    });

    return availableOptions.length >= 1; // Show if at least 1 alternative exists
  };

  // Replace activity with zone and hours validation
  const replaceActivity = (dayIndex, activityIndex) => {
    const day = generatedItinerary[dayIndex];
    const activity = day.activities[activityIndex];

    const categoryMap = {
      'Wine Tasting': 'wineries',
      'Dining': 'restaurants',
      'Fine Dining': 'restaurants',
      'Breakfast': 'restaurants',
      'Breakfast & Brunch': 'restaurants',
      'Breakfast & Market': 'restaurants',
      'Casual Dining': 'restaurants',
      'Bakery': 'restaurants',
      'Dessert': 'restaurants',
      'Nature & Hiking': 'activities',
      'Outdoor': 'activities',
      'Nature': 'activities',
      'Entertainment': 'activities',
      'Culture': 'activities',
      'Activity': 'activities',
      'Water Sports': 'activities',
      'Adventure': 'activities',
      'Market': 'activities',
      'Dessert Shop': 'shops',
      'Antiques': 'shops',
      'Bookstore': 'shops',
      'Gift Shop': 'shops',
      'Spa': 'shops',
      'Farm Store': 'shops',
      'Market & Cafe': 'shops',
      'Gallery': 'shops'
    };

    const dbCategory = categoryMap[activity.category];
    if (!dbCategory) return;

    // Get all zones in today's route for zone compatibility checking
    const todaysZones = new Set(day.activities.map(a => a.zone).filter(Boolean));
    
    // Build compatible zones based on what's already in the day
    const compatibleZones = new Set();
    todaysZones.forEach(zone => {
      compatibleZones.add(zone);
      // Add compatible zones based on zone compatibility map
      const zoneCompatibility = {
        'central': ['central', 'north'],
        'north': ['central', 'north'],
        'south': ['south', 'occidental'],
        'occidental': ['south', 'occidental'],
        'healdsburg': ['healdsburg', 'north'],
        'coast': ['coast', 'occidental'] // KEY: Coast days can include occidental restaurants like Hazel on the way back
      };
      if (zoneCompatibility[zone]) {
        zoneCompatibility[zone].forEach(z => compatibleZones.add(z));
      }
    });

    // Base predicate for same meal/category and not already used
    const baseEligible = (item) => {
      // For restaurants, allow flexible swapping based on meal type
      if (dbCategory === 'restaurants') {
        const isBreakfast = activity.hasBreakfast || activity.category.includes('Breakfast') || activity.category === 'Bakery';
        const itemIsBreakfast = item.hasBreakfast || item.category.includes('Breakfast') || item.category === 'Bakery';
        
        // Breakfast items can only swap with breakfast items, dinner with dinner
        if (isBreakfast !== itemIsBreakfast) return false;
      } else {
        // For non-restaurants, must be same category
        if (item.category !== activity.category) return false;
      }
      
      // Must not be currently used in itinerary
      const isUsed = generatedItinerary.some(d => 
        d.activities.some(a => a.name === item.name)
      );
      return !isUsed;
    };

    // Tier 1: strict - zone compatible AND open during time slot
    let candidates = experiencesDatabase[dbCategory].filter(item => {
      if (!baseEligible(item)) return false;
      if (!compatibleZones.has(item.zone)) return false;
      if (!isOpenDuringTimeSlot(item, activity.timeSlot)) return false;
      return true;
    });

    // Tier 2: relax hours - zone compatible only
    if (candidates.length === 0) {
      candidates = experiencesDatabase[dbCategory].filter(item => {
        if (!baseEligible(item)) return false;
        if (!compatibleZones.has(item.zone)) return false;
        return true;
      });
    }

    // Tier 3: relax zone - any eligible in database
    if (candidates.length === 0) {
      candidates = experiencesDatabase[dbCategory].filter(item => baseEligible(item));
    }

    if (candidates.length > 0) {
      const replacement = candidates[Math.floor(Math.random() * candidates.length)];
      const updatedItinerary = [...generatedItinerary];
      updatedItinerary[dayIndex].activities[activityIndex] = {
        ...replacement,
        timeSlot: activity.timeSlot,
        badge: activity.badge,
        routeStop: activity.routeStop
      };
      setGeneratedItinerary(updatedItinerary);
    }
  };

  // Redeem Modal Component
  const RedeemModal = () => {
    const [contactInfo, setContactInfo] = useState({
      email: '',
      phone: '',
      shareItinerary: false,
      rating: 0,
      reviewText: ''
    });
    const [showThankYou, setShowThankYou] = useState(false);
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [reviewSubmitted, setReviewSubmitted] = useState(false);

    // When modal opens with skipToReview=true, show review form directly
    useEffect(() => {
      if (skipToReview) {
        setShowReviewForm(true);
        setShowThankYou(false);
        setSkipToReview(false);
      }
    }, [skipToReview]);

    const handleSubmit = async (e) => {
      e.preventDefault();
      console.log('📝 Form submitted, calling handleRedeemSubmit');
      await handleRedeemSubmit(contactInfo);
      console.log('🎉 Setting showThankYou to true');
      setShowThankYou(true);
      // DON'T close modal - stay open for review
    };

    const openReviewForm = (e) => {
      e.preventDefault();
      e.stopPropagation();
      setShowThankYou(false);
      setShowReviewForm(true);
    };

    const handleReviewSubmit = async (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      console.log('📝 Submitting review...');
      
      // Mark as redeemed (if not already) and optionally track redemption
      if (redeemingBusiness && !redeemedBusinesses.has(redeemingBusiness.name)) {
        setRedeemedBusinesses(new Set([...redeemedBusinesses, redeemingBusiness.name]));
        try {
          await trackRedemption(redeemingBusiness, contactInfo);
        } catch (_) {
          // Non-blocking
        }
      }

      // Send review data to Google Sheets
      await trackReview(redeemingBusiness, contactInfo);
      
      console.log('⭐ Review submitted:', {
        business: redeemingBusiness.name,
        rating: contactInfo.rating,
        review: contactInfo.reviewText,
        guestName: preferences.guestName
      });
      
      setReviewSubmitted(true);
    };

    const closeModal = () => {
      setShowRedeemModal(false);
      setContactInfo({ email: '', phone: '', shareItinerary: false, rating: 0, reviewText: '' });
      setShowThankYou(false);
      setShowReviewForm(false);
      setReviewSubmitted(false);
      setSkipToReview(false);
    };

    // Generate Google Form URL with pre-filled business name
    const getReviewFormUrl = () => {
      // Replace with your actual Google Form ID
      const FORM_ID = 'YOUR_GOOGLE_FORM_ID_HERE';
      const businessNameEncoded = encodeURIComponent(redeemingBusiness?.name || '');
      return `https://docs.google.com/forms/d/e/${FORM_ID}/viewform?usp=pp_url&entry.BUSINESS_NAME_FIELD_ID=${businessNameEncoded}`;
    };

    if (!redeemingBusiness) {
      console.log('❌ RedeemModal: No redeeming business set');
      return null;
    }

    console.log('✅ RedeemModal rendering:', {
      businessName: redeemingBusiness.name,
      showThankYou,
      showReviewForm,
      reviewSubmitted
    });

    return (
      <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-50">
        <div className="bg-gradient-to-br from-red-950 to-stone-950 border-2 border-amber-300 rounded-2xl w-[calc(100vw-1.5rem)] sm:w-full sm:max-w-md shadow-2xl">
          {!showThankYou && !showReviewForm && (
            <>
              <div className="bg-gradient-to-br from-red-950 via-stone-950 to-red-950 p-4 sm:p-6 rounded-t-2xl border-b-2 border-amber-300">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-stone-50">Redeem Your Offer</h3>
                    <p className="text-stone-300 mt-1">{redeemingBusiness.name}</p>
                  </div>
                  <button
                    onClick={closeModal}
                    className="p-2 hover:bg-white/20 rounded-lg transition-all"
                  >
                    <X className="w-6 h-6 text-stone-50" />
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
                <div>
                  <label className="block text-stone-50 font-semibold mb-2">Email (Optional)</label>
                  <input
                    type="email"
                    value={contactInfo.email}
                    onChange={(e) => setContactInfo({...contactInfo, email: e.target.value})}
                    className="w-full p-3 rounded-lg bg-black/70 border-2 border-red-800 text-stone-50 focus:border-amber-300 focus:outline-none placeholder-stone-400"
                    placeholder="your@email.com"
                  />
                </div>

                <div>
                  <label className="block text-stone-50 font-semibold mb-2">Phone (Optional)</label>
                  <input
                    type="tel"
                    value={contactInfo.phone}
                    onChange={(e) => setContactInfo({...contactInfo, phone: e.target.value})}
                    className="w-full p-3 rounded-lg bg-black/70 border-2 border-red-800 text-stone-50 focus:border-amber-300 focus:outline-none placeholder-stone-400"
                    placeholder="(555) 123-4567"
                  />
                </div>

                <div className="flex items-center gap-3 p-3 bg-black border-2 border-red-800 rounded-lg">
                  <input
                    type="checkbox"
                    id="shareItinerary"
                    checked={contactInfo.shareItinerary}
                    onChange={(e) => setContactInfo({...contactInfo, shareItinerary: e.target.checked})}
                    className="w-5 h-5 rounded border-red-700 text-red-700 focus:ring-amber-300"
                  />
                  <label htmlFor="shareItinerary" className="text-stone-50 text-sm cursor-pointer flex-1">
                    Send me my personalized itinerary
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-stone-100 to-amber-50 hover:from-amber-50 hover:to-amber-100 text-stone-900 py-4 rounded-xl font-bold transition-all shadow-xl border-2 border-amber-300"
                >
                  🎫 Redeem Offer
                </button>
              </form>
            </>
          )}

          {showThankYou && !showReviewForm && (
            <div className="p-8 text-center space-y-6">
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-3xl font-bold text-amber-300">Thank You!</h3>
              <p className="text-stone-200 text-lg leading-relaxed">
                Your 10% discount has been redeemed at <span className="text-amber-300 font-semibold">{redeemingBusiness.name}</span>. 
                Show this screen to your server or cashier to receive your discount.
              </p>
              <p className="text-stone-300 text-sm">
                We hope you enjoy your experience! Please consider leaving a review to help other guests.
              </p>
              <button
                onClick={openReviewForm}
                className="w-full bg-gradient-to-r from-amber-200 to-amber-300 hover:from-amber-300 hover:to-amber-400 text-stone-900 py-4 rounded-xl font-bold transition-all shadow-xl border-2 border-amber-400"
              >
                Leave a Review
              </button>
              <button
                onClick={closeModal}
                className="w-full bg-gradient-to-r from-red-800 via-red-700 to-red-800 hover:from-red-700 hover:via-red-600 hover:to-red-700 text-stone-50 py-3 rounded-xl font-bold transition-all shadow-xl border-2 border-amber-300"
              >
                Close
              </button>
            </div>
          )}

          {showReviewForm && (
            <div className="p-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-stone-50">Leave a Review</h3>
                  <p className="text-stone-300 mt-1">{redeemingBusiness.name}</p>
                </div>
                <button
                  onClick={closeModal}
                  className="p-2 hover:bg-white/20 rounded-lg transition-all"
                >
                  <X className="w-6 h-6 text-stone-50" />
                </button>
              </div>
              
              {!reviewSubmitted ? (
                <form onSubmit={handleReviewSubmit} className="space-y-6">
                  {/* Star Rating */}
                  <div>
                    <label className="block text-stone-50 font-semibold mb-3">Rate Your Experience</label>
                    <div className="flex gap-2 justify-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setContactInfo({...contactInfo, rating: star})}
                          className="transition-all"
                        >
                          <Star 
                            className={`w-12 h-12 ${
                              star <= (contactInfo.rating || 0)
                                ? 'fill-amber-300 text-amber-300'
                                : 'text-stone-400 hover:text-amber-200'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Review Text */}
                  <div>
                    <label className="block text-stone-50 font-semibold mb-2">Tell Us About Your Experience (Optional)</label>
                    <textarea
                      value={contactInfo.reviewText || ''}
                      onChange={(e) => setContactInfo({...contactInfo, reviewText: e.target.value})}
                      rows="4"
                      className="w-full p-3 rounded-lg bg-black/70 border-2 border-red-800 text-stone-50 focus:border-amber-300 focus:outline-none placeholder-stone-400"
                      placeholder="What did you enjoy most? Any suggestions?"
                    />
                  </div>

                  {!contactInfo.rating && (
                    <p className="text-amber-300 text-sm text-center">
                      Please select a star rating above to submit your review
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={!contactInfo.rating}
                    className="w-full bg-gradient-to-r from-amber-200 to-amber-300 hover:from-amber-300 hover:to-amber-400 disabled:from-stone-600 disabled:to-stone-700 disabled:cursor-not-allowed text-stone-900 disabled:text-stone-400 py-4 rounded-xl font-bold transition-all shadow-xl border-2 border-amber-400"
                  >
                    Submit Review
                  </button>
                </form>
              ) : (
                <div className="text-center space-y-6 py-8">
                  <div className="text-6xl mb-4">⭐</div>
                  <h3 className="text-3xl font-bold text-amber-300">Thank You!</h3>
                  <p className="text-stone-200 text-lg leading-relaxed">
                    Your review of <span className="text-amber-300 font-semibold">{redeemingBusiness.name}</span> has been submitted.
                    We appreciate your feedback!
                  </p>
                  <button
                    onClick={closeModal}
                    className="w-full bg-gradient-to-r from-red-800 via-red-700 to-red-800 hover:from-red-700 hover:via-red-600 hover:to-red-700 text-stone-50 py-3 rounded-xl font-bold transition-all shadow-xl border-2 border-amber-300"
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  // ============================================
  // EMAIL INTEGRATION - Send Itineraries via EmailJS
  // ============================================
  
  const sendItineraryEmail = async (recipientEmail) => {
    // Format the itinerary for email
    const formatItineraryForEmail = () => {
      let emailBody = `Hi ${preferences.guestName || 'Guest'}!\n\n`;
      emailBody += `Here's your personalized ${preferences.duration}-day Russian River Valley itinerary:\n\n`;
      emailBody += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
      
      generatedItinerary.forEach((day, index) => {
        emailBody += `📅 DAY ${index + 1}: ${day.theme}\n`;
        emailBody += `${day.description}\n\n`;
        
        if (day.breakfast) {
          emailBody += `🍳 BREAKFAST - ${day.breakfast.time}\n`;
          emailBody += `${day.breakfast.name}\n`;
          emailBody += `${day.breakfast.location}\n`;
          if (day.breakfast.exclusiveOffer) emailBody += `⭐ ${day.breakfast.exclusiveOffer}\n`;
          emailBody += `📍 ${createMapLink(day.breakfast.name, day.breakfast.location)}\n\n`;
        }
        
        if (day.morning) {
          emailBody += `🌅 MORNING ACTIVITY - ${day.morning.time}\n`;
          emailBody += `${day.morning.name}\n`;
          emailBody += `${day.morning.location}\n`;
          if (day.morning.exclusiveOffer) emailBody += `⭐ ${day.morning.exclusiveOffer}\n`;
          emailBody += `📍 ${createMapLink(day.morning.name, day.morning.location)}\n\n`;
        }
        
        if (day.lunch) {
          emailBody += `🍽️ LUNCH - ${day.lunch.time}\n`;
          emailBody += `${day.lunch.name}\n`;
          emailBody += `${day.lunch.location}\n`;
          if (day.lunch.exclusiveOffer) emailBody += `⭐ ${day.lunch.exclusiveOffer}\n`;
          emailBody += `📍 ${createMapLink(day.lunch.name, day.lunch.location)}\n\n`;
        }
        
        if (day.afternoon) {
          emailBody += `☀️ AFTERNOON ACTIVITY - ${day.afternoon.time}\n`;
          emailBody += `${day.afternoon.name}\n`;
          emailBody += `${day.afternoon.location}\n`;
          if (day.afternoon.exclusiveOffer) emailBody += `⭐ ${day.afternoon.exclusiveOffer}\n`;
          emailBody += `📍 ${createMapLink(day.afternoon.name, day.afternoon.location)}\n\n`;
        }
        
        if (day.dinner) {
          emailBody += `🌙 DINNER - ${day.dinner.time}\n`;
          emailBody += `${day.dinner.name}\n`;
          emailBody += `${day.dinner.location}\n`;
          if (day.dinner.exclusiveOffer) emailBody += `⭐ ${day.dinner.exclusiveOffer}\n`;
          emailBody += `📍 ${createMapLink(day.dinner.name, day.dinner.location)}\n\n`;
        }
        
        emailBody += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
      });
      
      emailBody += `\n🎉 Enjoy your Russian River Valley adventure!\n\n`;
      emailBody += `From the team at Rio Nido Lodge\n`;
      emailBody += `📍 14000 River Road, Guerneville, CA 95446\n`;
      emailBody += `📞 (707) 869-0821\n`;
      
      return emailBody;
    };

    try {
      // Option 1: Using EmailJS (Free tier: 200 emails/month)
      if (EMAILJS_CONFIG.publicKey !== 'YOUR_EMAILJS_PUBLIC_KEY') {
        const emailParams = {
          to_email: recipientEmail,
          guest_name: preferences.guestName || 'Guest',
          itinerary_details: formatItineraryForEmail(),
          duration: preferences.duration,
          reply_to: 'reservations@rionidolodge.com'
        };

        // Load EmailJS script if not already loaded
        if (!window.emailjs) {
          const script = document.createElement('script');
          script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js';
          script.onload = async () => {
            window.emailjs.init(EMAILJS_CONFIG.publicKey);
            const response = await window.emailjs.send(
              EMAILJS_CONFIG.serviceID,
              EMAILJS_CONFIG.templateID,
              emailParams
            );
            console.log('✅ Email sent via EmailJS:', response);
          };
          document.head.appendChild(script);
        } else {
          const response = await window.emailjs.send(
            EMAILJS_CONFIG.serviceID,
            EMAILJS_CONFIG.templateID,
            emailParams
          );
          console.log('✅ Email sent via EmailJS:', response);
        }
        return true;
      } else {
        // Option 2: Fallback to mailto (if EmailJS not configured)
        const subject = encodeURIComponent(`Your Rio Nido Lodge Itinerary - ${preferences.duration} Days`);
        const body = encodeURIComponent(formatItineraryForEmail());
        window.location.href = `mailto:${recipientEmail}?subject=${subject}&body=${body}`;
        console.log('📧 Opened mailto client');
        return true;
      }
    } catch (error) {
      console.error('❌ Error sending email:', error);
      return false;
    }
  };

  // Itinerary Email Modal Component
  const ItineraryEmailModal = () => {
    const [email, setEmail] = useState('');
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState(false);

    const handleSendItinerary = async (e) => {
      e.preventDefault();
      setSending(true);
      setError(false);
      
      try {
        const success = await sendItineraryEmail(email);
        if (success) {
          setSent(true);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error('Error sending itinerary:', err);
        setError(true);
      } finally {
        setSending(false);
      }
    };

    const closeModal = () => {
      setShowItineraryEmailModal(false);
      setEmail('');
      setSent(false);
      setError(false);
      setSending(false);
    };

    return (
      <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-50">
        <div className="bg-gradient-to-br from-red-950 to-stone-950 border-2 border-amber-300 rounded-2xl w-[calc(100vw-1.5rem)] sm:w-full sm:max-w-md shadow-2xl">
          <div className="bg-gradient-to-br from-red-950 via-stone-950 to-red-950 p-4 sm:p-6 rounded-t-2xl border-b-2 border-amber-300">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-2xl font-bold text-stone-50">Send Your Itinerary</h3>
                <p className="text-stone-300 mt-1">We'll email your personalized {preferences.duration}-day plan</p>
              </div>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-white/20 rounded-lg transition-all"
              >
                <X className="w-6 h-6 text-stone-50" />
              </button>
            </div>
          </div>

          {!sent && !error ? (
            <form onSubmit={handleSendItinerary} className="p-4 sm:p-6 space-y-4">
              <div>
                <label className="block text-stone-50 font-semibold mb-2">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 rounded-lg bg-black/70 border-2 border-red-800 text-stone-50 focus:border-amber-300 focus:outline-none placeholder-stone-400"
                  placeholder="your@email.com"
                  required
                  disabled={sending}
                />
              </div>

              <div className="bg-amber-950/30 border-2 border-amber-300 rounded-lg p-4">
                <p className="text-stone-300 text-sm">
                  📧 Your complete {preferences.duration}-day itinerary with all restaurant recommendations, 
                  activities, map links, and exclusive partner offers will be sent to this email.
                </p>
              </div>

              <button
                type="submit"
                disabled={sending}
                className="w-full bg-gradient-to-r from-amber-200 to-amber-300 hover:from-amber-300 hover:to-amber-400 disabled:from-stone-600 disabled:to-stone-700 text-stone-900 disabled:text-stone-400 py-4 rounded-xl font-bold transition-all shadow-xl border-2 border-amber-400 disabled:cursor-not-allowed"
              >
                {sending ? '✉️ Sending...' : '📧 Send My Itinerary'}
              </button>
            </form>
          ) : error ? (
            <div className="p-8 text-center space-y-6">
              <div className="text-6xl mb-4">⚠️</div>
              <h3 className="text-2xl font-bold text-amber-300">Oops!</h3>
              <p className="text-stone-200 text-lg leading-relaxed">
                We couldn't send the email automatically. You can still access your itinerary on this page!
              </p>
              <p className="text-stone-300 text-sm">
                Tip: Take a screenshot or print this page to save your itinerary.
              </p>
              <button
                onClick={closeModal}
                className="w-full bg-gradient-to-r from-red-800 via-red-700 to-red-800 hover:from-red-700 hover:via-red-600 hover:to-red-700 text-stone-50 py-3 rounded-xl font-bold transition-all shadow-xl border-2 border-amber-300"
              >
                Close
              </button>
            </div>
          ) : (
            <div className="p-8 text-center space-y-6">
              <div className="text-6xl mb-4">✅</div>
              <h3 className="text-3xl font-bold text-amber-300">Sent!</h3>
              <p className="text-stone-200 text-lg leading-relaxed">
                Your itinerary has been sent to <span className="text-amber-300 font-semibold">{email}</span>
              </p>
              <p className="text-stone-300 text-sm">
                Check your inbox (and spam folder) for your personalized Russian River Valley itinerary!
              </p>
              <button
                onClick={closeModal}
                className="w-full bg-gradient-to-r from-red-800 via-red-700 to-red-800 hover:from-red-700 hover:via-red-600 hover:to-red-700 text-stone-50 py-3 rounded-xl font-bold transition-all shadow-xl border-2 border-amber-300"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Booking Contact Modal Component
  const BookingContactModal = () => {
    if (!bookingExperience || !bookingExperience.bookingContact) return null;

    const contact = bookingExperience.bookingContact;

    return (
      <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-50">
        <div className="bg-gradient-to-br from-red-950 to-stone-950 border-2 border-amber-300 rounded-2xl w-[calc(100vw-1.5rem)] sm:w-full sm:max-w-lg shadow-2xl">
          <div className="bg-gradient-to-br from-red-950 via-stone-950 to-red-950 p-4 sm:p-6 rounded-t-2xl border-b-2 border-amber-300">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-2xl font-bold text-stone-50">Book Your Experience</h3>
                <p className="text-stone-300 mt-1">{bookingExperience.name}</p>
              </div>
              <button
                onClick={() => setShowBookingModal(false)}
                className="p-2 hover:bg-white/20 rounded-lg transition-all"
              >
                <X className="w-6 h-6 text-stone-50" />
              </button>
            </div>
          </div>

          <div className="p-8 space-y-6">
            <div className="text-center">
              <div className="text-6xl mb-4">📞</div>
              <h4 className="text-2xl font-bold text-amber-300 mb-2">Contact {contact.name || 'Us'}</h4>
              <p className="text-stone-300 text-sm mb-6">
                {contact.bookingNote || 'Call or email to reserve your spot'}
              </p>
            </div>

            <div className="space-y-4">
              {/* Phone Button */}
              <a
                href={`tel:${contact.phone}`}
                className="flex items-center justify-center gap-3 w-full bg-gradient-to-r from-stone-100 to-amber-50 hover:from-amber-50 hover:to-amber-100 text-stone-900 py-4 rounded-xl font-bold transition-all shadow-xl border-2 border-amber-300"
              >
                <Phone className="w-5 h-5" />
                Call {contact.phone}
              </a>

              {/* Email Button */}
              <a
                href={`mailto:${contact.email}?subject=Booking: ${bookingExperience.name}&body=Hi! I'd like to book the ${bookingExperience.name} experience.%0D%0A%0D%0AGuest Name: ${preferences.guestName || '[Your Name]'}%0D%0APreferred Date: [Date]%0D%0ANumber of Guests: [Number]%0D%0A%0D%0AThank you!`}
                className="flex items-center justify-center gap-3 w-full bg-gradient-to-r from-red-800 via-red-700 to-red-800 hover:from-red-700 hover:via-red-600 hover:to-red-700 text-stone-50 py-4 rounded-xl font-bold transition-all shadow-xl border-2 border-amber-300"
              >
                <Mail className="w-5 h-5" />
                Email {contact.email}
              </a>
            </div>

            <div className="bg-amber-950/30 border-2 border-amber-300 rounded-xl p-4">
              <p className="text-amber-200 text-sm text-center font-semibold">
                💡 Tip: Book in advance to secure your preferred date!
              </p>
            </div>

            <button
              onClick={() => setShowBookingModal(false)}
              className="w-full bg-gradient-to-r from-stone-700 to-stone-800 hover:from-stone-600 hover:to-stone-700 text-stone-50 py-3 rounded-xl font-semibold transition-all border-2 border-stone-600"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-black text-stone-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="text-center mb-8">
          <h1 className="text-7xl md:text-8xl text-red-800 mb-2" style={{ fontFamily: "'Brush Script MT', 'Lucida Handwriting', cursive", fontWeight: '400' }}>
            Rio Nido Lodge
          </h1>
          <p className="text-stone-200 text-xl">Your Personalized Russian River Experience</p>
        </div>

        {currentStep === 'experiences' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-red-950 via-stone-950 to-red-950 border-2 border-amber-300 rounded-2xl p-6 shadow-2xl">
              <h2 className="text-3xl text-stone-50 font-semibold mb-6">Plan Your Adventure</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-stone-50 font-semibold mb-2">Guest Name</label>
                  <input
                    type="text"
                    value={preferences.guestName}
                    onChange={(e) => setPreferences({...preferences, guestName: e.target.value})}
                    className="w-full p-4 rounded-lg bg-black/70 border-2 border-red-800 text-stone-50 focus:border-amber-300 focus:outline-none placeholder-stone-400"
                    placeholder="Enter your name"
                  />
                </div>

                <div>
                  <label className="block text-stone-50 font-semibold mb-2">Length of Stay</label>
                  <select
                    value={preferences.duration}
                    onChange={(e) => setPreferences({...preferences, duration: parseInt(e.target.value)})}
                    className="w-full p-4 rounded-lg bg-black/70 border-2 border-red-800 text-stone-50 focus:border-amber-300 focus:outline-none"
                  >
                    {[1,2,3,4,5].map(num => (
                      <option key={num} value={num}>{num} {num === 1 ? 'Day' : 'Days'}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-stone-50 font-semibold mb-2">Interests</label>
                  <div className="grid grid-cols-2 gap-3">
                    {['Wine Tasting', 'Dining', 'Nature & Hiking', 'Shopping', 'Spa & Wellness', 'Coastal Adventures'].map(interest => (
                      <button
                        key={interest}
                        onClick={() => {
                          const newInterests = preferences.interests.includes(interest)
                            ? preferences.interests.filter(i => i !== interest)
                            : [...preferences.interests, interest];
                          setPreferences({...preferences, interests: newInterests});
                        }}
                        className={`p-4 rounded-lg border-2 font-semibold transition-all ${
                          preferences.interests.includes(interest)
                            ? 'bg-red-800 border-amber-300 text-stone-50 shadow-xl'
                            : 'bg-black border-red-800 text-stone-200 hover:border-amber-300 hover:text-stone-50'
                        }`}
                      >
                        {interest}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-stone-50 font-semibold mb-2">Budget</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      {value: 'budget', label: 'Budget', icon: '$'},
                      {value: 'moderate', label: 'Moderate', icon: '$$'},
                      {value: 'splurge', label: 'Splurge', icon: '$$$'}
                    ].map(option => (
                      <button
                        key={option.value}
                        onClick={() => setPreferences({...preferences, budget: option.value})}
                        className={`p-4 rounded-lg border-2 font-semibold transition-all ${
                          preferences.budget === option.value
                            ? 'bg-red-800 border-amber-300 text-stone-50 shadow-xl'
                            : 'bg-black border-red-800 text-stone-200 hover:border-amber-300 hover:text-stone-50'
                        }`}
                      >
                        <div className="text-2xl mb-1 text-amber-200">{option.icon}</div>
                        <div className="text-sm">{option.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-4 bg-black border-2 border-red-800 rounded-lg hover:border-amber-300 transition-all">
                    <input
                      type="checkbox"
                      id="includeSweets"
                      checked={preferences.includeSweets}
                      onChange={(e) => setPreferences({...preferences, includeSweets: e.target.checked})}
                      className="w-5 h-5 rounded border-red-700 text-red-700 focus:ring-amber-300"
                    />
                    <label htmlFor="includeSweets" className="text-stone-50 font-semibold cursor-pointer flex-1">
                      Include Sweets & Bakeries
                    </label>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-black border-2 border-red-800 rounded-lg hover:border-amber-300 transition-all">
                    <input
                      type="checkbox"
                      id="includeMarkets"
                      checked={preferences.includeMarkets}
                      onChange={(e) => setPreferences({...preferences, includeMarkets: e.target.checked})}
                      className="w-5 h-5 rounded border-red-700 text-red-700 focus:ring-amber-300"
                    />
                    <label htmlFor="includeMarkets" className="text-stone-50 font-semibold cursor-pointer flex-1">
                      Include Markets & Delis
                    </label>
                  </div>
                </div>

                <button
                  onClick={generateItinerary}
                  className="w-full bg-gradient-to-r from-red-800 via-red-700 to-red-800 hover:from-red-700 hover:via-red-600 hover:to-red-700 text-stone-50 py-5 rounded-xl font-bold text-xl transition-all shadow-2xl border-2 border-amber-300"
                >
                  Generate My Itinerary
                </button>
              </div>
            </div>

            <div className="bg-gradient-to-br from-red-950 via-stone-950 to-red-950 border-2 border-amber-300 rounded-2xl p-6 shadow-2xl">
              <div className="mb-5">
                <h2 className="text-2xl text-stone-50 font-semibold">Featured Signature Experiences</h2>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-4 mb-6">
                {[...signatureExperiences]
                  .sort((a, b) => (b.isRNLExclusive ? 1 : 0) - (a.isRNLExclusive ? 1 : 0))
                  .slice(0, 6)
                  .map(exp => (
                  <div
                    key={exp.id}
                    className="relative bg-black border-2 border-red-800 hover:border-stone-300 rounded-xl p-4 transition-all cursor-pointer group shadow-xl flex flex-col"
                    onClick={() => {
                      setSelectedSignatureExperience(exp);
                      setShowSignatureModal(true);
                    }}
                  >
                    {exp.isRNLExclusive && (
                      <div className="absolute top-0 right-0 bg-amber-400 text-black border border-amber-300 px-2 py-1 text-xs font-bold rounded-bl-lg rounded-tr-lg shadow-lg">
                        RNL EXCLUSIVE
                      </div>
                    )}
                    <div className="mt-2 sm:mt-4 flex flex-col flex-1">
                      <h3 className="text-base font-bold text-stone-50 mb-1 group-hover:text-stone-200 transition-colors leading-tight">{exp.name}</h3>
                      <p className="text-stone-300 text-xs mb-2 italic">{exp.tagline}</p>
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="text-stone-100 font-bold">{exp.price}</span>
                        <div className="flex items-center gap-1 text-stone-100">
                          <Star className="w-3 h-3 fill-current" />
                          <span className="font-semibold">{exp.rating}</span>
                        </div>
                      </div>
                      <p className="text-stone-300 text-xs leading-snug line-clamp-3 mb-auto">{exp.description}</p>
                      
                      <div className="mt-3 pt-3 border-t border-stone-400/30">
                        <button className="w-full bg-gradient-to-r from-stone-100 to-stone-200 hover:from-stone-50 hover:to-stone-100 text-black py-2 rounded-lg font-bold text-xs transition-all shadow-md">
                          View Details & Plan Day
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => openSearchModal('signature')}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-red-900 hover:bg-red-800 text-stone-50 rounded-xl font-bold text-sm transition-all border-2 border-amber-300 shadow-lg"
                >
                  <Search className="w-4 h-4" />
                  Search Signature Experiences
                </button>
                <button
                  onClick={() => openSearchModal('all')}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-red-800 hover:bg-red-700 text-stone-50 rounded-xl font-bold text-sm transition-all border-2 border-amber-300 shadow-lg"
                >
                  <Search className="w-4 h-4" />
                  Search All Experiences
                </button>
              </div>
            </div>
          </div>
        )}

        {currentStep === 'itinerary' && generatedItinerary.length > 0 && (
          <div className="space-y-6">
            {/* Header - Outside the day boxes */}
            <div className="flex items-center justify-between">
              <h2 className="text-4xl text-stone-50 font-bold">
                {preferences.guestName ? `${preferences.guestName}'s Recommendations` : 'Your Recommendations'}
              </h2>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowItineraryEmailModal(true)}
                  className="px-6 py-3 bg-gradient-to-r from-amber-200 to-amber-300 hover:from-amber-300 hover:to-amber-400 text-stone-900 rounded-xl font-bold transition-all border-2 border-amber-400 shadow-xl flex items-center gap-2"
                >
                  <Mail className="w-5 h-5" />
                  Send Me My Itinerary
                </button>
                <button
                  onClick={() => setCurrentStep('experiences')}
                  className="px-6 py-3 bg-red-900 hover:bg-red-800 text-stone-50 rounded-xl font-semibold transition-all border-2 border-red-800"
                >
                  Edit Preferences
                </button>
              </div>
            </div>

            {/* Days Container */}
            <div className="bg-gradient-to-br from-red-950 via-stone-950 to-red-950 border-2 border-amber-300 rounded-2xl p-6 shadow-2xl">
              {generatedItinerary.map((day, dayIndex) => (
                <div key={day.day} className="mb-8">
                  <div className="flex items-center justify-between mb-4 border-b-2 border-red-800 pb-2">
                    <div>
                      <h3 className="text-2xl font-bold text-stone-50">
                        Day {day.day}
                      </h3>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-amber-200 text-lg font-semibold">{day.theme.name}</span>
                      </div>
                      {/* TODAY'S ROUTE WITH ARROWS */}
                      <div className="flex items-center gap-2 mt-3">
                        <span className="text-stone-400 text-sm">Today's Route:</span>
                        {(() => {
                          // Get unique zones from activities
                          const zones = [...new Set(day.activities.map(a => a.zone).filter(Boolean))];
                          return (
                            <div className="flex items-center gap-2">
                              {zones.map((zone, idx) => (
                                <React.Fragment key={zone}>
                                  <span className="text-stone-100 font-semibold text-sm">
                                    {getZoneInfo(zone).name}
                                  </span>
                                  {idx < zones.length - 1 && (
                                    <svg className="w-4 h-4 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                  )}
                                </React.Fragment>
                              ))}
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                  
                  {/* Start Day's Route Button */}
                  {createDayRoute(day.activities) && (
                    <div className="mb-6">
                      <a
                        href={createDayRoute(day.activities)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-stone-100 to-amber-50 hover:from-amber-50 hover:to-amber-100 text-stone-900 rounded-xl font-bold transition-all shadow-lg border-2 border-amber-300"
                      >
                        <Navigation className="w-5 h-5" />
                        Let's Go!
                      </a>
                    </div>
                  )}
                  
                  <div className="space-y-4">
                    {day.activities.map((activity, activityIndex) => (
                      <React.Fragment key={`${dayIndex}-${activityIndex}`}>
                        {/* Drive Time Indicator - Show between activities */}
                        {activityIndex > 0 && (() => {
                          const prevActivity = day.activities[activityIndex - 1];
                          const driveTime = estimateDriveTime(prevActivity.zone, activity.zone);
                          
                          if (driveTime) {
                            return (
                              <div className="flex items-center justify-center gap-3 py-2">
                                <div className="flex-1 border-t border-stone-600"></div>
                                <div className="flex items-center gap-2 px-4 py-2 bg-stone-800/40 border border-stone-600 rounded-full text-stone-300 text-sm">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                  </svg>
                                  <span className="font-semibold">{driveTime} min drive</span>
                                </div>
                                <div className="flex-1 border-t border-stone-600"></div>
                              </div>
                            );
                          }
                          return null;
                        })()}
                        
                        <div
                        key={`${dayIndex}-${activityIndex}`}
                        className={`border-2 rounded-xl p-6 transition-all ${
                          activity.isTrail || activity.isDistrict
                            ? 'bg-black border-red-800'
                            : 'bg-black border-red-800 hover:border-amber-300'
                        }`}
                      >
                        {activity.isTrail ? (
                          <div 
                            className="cursor-pointer"
                            onClick={() => {
                              setSelectedWineTrail(activity);
                              setShowWineTrailModal(true);
                            }}
                          >
                            {/* SIMPLIFIED CLICKABLE WINE TRAIL CARD */}
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <span className="text-red-400 font-bold">{activity.timeSlot}</span>
                                <span className="px-3 py-1 bg-red-900/40 text-red-300 rounded-full text-sm border border-red-800">
                                  {activity.badge}
                                </span>
                              </div>
                              <span className="text-stone-400 text-sm">Click for details →</span>
                            </div>
                            
                            <h4 className="text-2xl font-bold text-amber-200 mb-2">
                              {activity.name}
                            </h4>
                            <p className="text-stone-100 text-lg mb-3">{activity.description}</p>
                            
                            <div className="flex flex-wrap gap-2">
                              <div className="text-stone-200 font-semibold">Featured Wineries:</div>
                              {activity.wineries.map((winery, idx) => (
                                <span key={idx} className="px-3 py-1 bg-red-900/60 text-amber-200 rounded-full text-sm border border-red-800">
                                  {winery.name}
                                </span>
                              ))}
                            </div>
                          </div>
                        ) : activity.isDistrict ? (
                          <div 
                            className="cursor-pointer"
                            onClick={() => {
                              setSelectedShoppingDistrict(activity);
                              setShowShoppingDistrictModal(true);
                            }}
                          >
                            {/* SHOPPING DISTRICT CARD */}
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <span className="text-red-400 font-bold">{activity.timeSlot}</span>
                                <span className="px-3 py-1 bg-red-900/40 text-red-300 rounded-full text-sm border border-red-800">
                                  {activity.badge}
                                </span>
                              </div>
                              <span className="text-stone-400 text-sm">Click for details →</span>
                            </div>
                            
                            <h4 className="text-2xl font-bold text-amber-200 mb-2">
                              {activity.name}
                            </h4>
                            <p className="text-stone-100 text-lg mb-3">{activity.description}</p>
                            
                            {activity.hours && (
                              <div className="text-stone-300 text-sm mb-3">
                                ⏰ {activity.hours}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="flex items-start justify-between gap-4">
                            <div 
                              className="flex-1 cursor-pointer hover:bg-red-900/20 -m-2 p-2 rounded-lg transition-all"
                              onClick={() => {
                                // Check if this is a signature experience
                                if (activity.id && activity.id.startsWith('sig')) {
                                  setSelectedSignatureExperience(activity);
                                  setShowSignatureModal(true);
                                } else {
                                  setSelectedBusiness(activity);
                                  setShowBusinessModal(true);
                                }
                              }}
                            >
                              <div className="flex items-center gap-3 mb-2">
                                <span className="text-red-400 font-bold">{activity.timeSlot}</span>
                                {activity.badge && (
                                  <span className="px-3 py-1 bg-red-900/60 text-stone-200 rounded-full text-sm border-2 border-red-800">
                                    {activity.badge}
                                  </span>
                                )}
                              </div>
                              
                              <h4 className="text-xl font-semibold text-stone-50 mb-2">{activity.name}</h4>
                              <p className="text-stone-200 mb-3">{activity.description}</p>
                              
                              <div className="flex flex-wrap items-center gap-4 text-sm text-stone-300 mb-2">
                                {activity.location && (
                                  <div className="flex items-center gap-1">
                                    <MapPin className="w-4 h-4" />
                                    <span>{activity.location}</span>
                                  </div>
                                )}
                                {activity.rating && (
                                  <div className="flex items-center gap-1 text-amber-200">
                                    <Star className="w-4 h-4 fill-current" />
                                    <span>{activity.rating}</span>
                                  </div>
                                )}
                              </div>
                              
                              {activity.hours && (
                                <div className="text-stone-400 text-sm mb-2">
                                  ⏰ {activity.hours}
                                </div>
                              )}
                              
                              {/* Show different CTAs based on activity type */}
                              {activity.id && activity.id.startsWith('sig') && activity.bookingContact ? (
                                <div className="text-xs text-amber-300 mt-2">
                                  ⭐ Click to view details or book this experience
                                </div>
                              ) : (
                                <div className="text-xs text-amber-300 mt-2">
                                  💳 Click to view exclusive offer
                                </div>
                              )}
                            </div>

                            {/* Book Now button for signature experiences */}
                            {activity.id && activity.id.startsWith('sig') && activity.bookingContact && (
                              <button
                                onClick={() => {
                                  setBookingExperience(activity);
                                  setShowBookingModal(true);
                                }}
                                className="p-3 bg-gradient-to-r from-amber-200 to-amber-300 hover:from-amber-300 hover:to-amber-400 rounded-xl transition-all border-2 border-amber-400 shadow-lg flex-shrink-0 flex items-center gap-2"
                                title="Book this experience"
                              >
                                <Phone className="w-5 h-5 text-stone-900" />
                                <span className="text-stone-900 font-bold text-sm">Book Now</span>
                              </button>
                            )}

                            {/* Replace button - only show if alternatives available and NOT a signature experience */}
                            {!(activity.id && activity.id.startsWith('sig')) && canReplaceActivity(dayIndex, activityIndex) && (
                              <button
                                onClick={() => replaceActivity(dayIndex, activityIndex)}
                                className="p-3 bg-gradient-to-r from-stone-100 to-amber-50 hover:from-amber-50 hover:to-amber-100 rounded-xl transition-all border-2 border-amber-300 shadow-lg flex-shrink-0"
                                title="Swap for another option"
                              >
                                <RotateCw className="w-5 h-5 text-stone-900" />
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}


        {showSignatureModal && selectedSignatureExperience && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-gradient-to-br from-red-950 to-stone-950 border-2 border-amber-300 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              {/* Header with Title */}
              <div className="sticky top-0 bg-gradient-to-br from-red-950 via-stone-950 to-red-950 border-b-2 border-amber-300 p-4">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-xl font-bold text-amber-300 uppercase tracking-wide">Signature Experience</h2>
                  <button
                    onClick={() => setShowSignatureModal(false)}
                    className="p-1.5 hover:bg-white/10 rounded-lg transition-all"
                  >
                    <X className="w-5 h-5 text-stone-50" />
                  </button>
                </div>
                <h3 className="text-2xl font-bold text-stone-50">{selectedSignatureExperience.name}</h3>
                <p className="text-stone-300 text-sm italic mt-1">{selectedSignatureExperience.tagline}</p>
              </div>

              <div className="p-4 space-y-3">
                {selectedSignatureExperience.isRNLExclusive && (
                  <div className="bg-gradient-to-r from-amber-900/40 via-amber-800/40 to-amber-900/40 border border-amber-300 text-amber-200 px-3 py-1.5 rounded-lg text-center font-bold text-xs tracking-wide">
                    RIO NIDO LODGE EXCLUSIVE
                  </div>
                )}

                {/* Description */}
                <p className="text-stone-200 text-sm leading-relaxed">{selectedSignatureExperience.fullDescription}</p>

                {/* Details Grid - More Compact */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-red-950/60 border-2 border-red-800 rounded-lg p-2">
                    <div className="text-stone-400 text-xs mb-0.5">Duration</div>
                    <div className="text-stone-50 font-semibold text-sm">{selectedSignatureExperience.duration}</div>
                  </div>
                  <div className="bg-red-950/60 border-2 border-red-800 rounded-lg p-2">
                    <div className="text-stone-400 text-xs mb-0.5">Price</div>
                    <div className="text-amber-200 font-bold text-sm">{selectedSignatureExperience.price}</div>
                  </div>
                  <div className="bg-red-950/60 border-2 border-red-800 rounded-lg p-2">
                    <div className="text-stone-400 text-xs mb-0.5">Rating</div>
                    <div className="text-stone-50 font-semibold text-sm flex items-center gap-1">
                      <Star className="w-3 h-3 fill-amber-300 text-amber-300" />
                      {selectedSignatureExperience.rating}
                    </div>
                  </div>
                </div>

                {selectedSignatureExperience.minGuests && (
                  <div className="bg-red-950/40 border-2 border-red-800 rounded-lg p-2 text-stone-200 text-xs flex items-center gap-2">
                    <Users className="w-3 h-3" />
                    {selectedSignatureExperience.minGuests}
                  </div>
                )}

                {/* What's Included - 2 Column Layout */}
                <div className="bg-red-950/40 border-2 border-red-800 rounded-lg p-3">
                  <h4 className="text-stone-50 font-semibold text-xs uppercase tracking-wide mb-2">What's Included:</h4>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                    {selectedSignatureExperience.includes.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-1.5 text-stone-300 text-xs">
                        <span className="text-amber-300 mt-0.5 flex-shrink-0">✓</span>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Best Time Info */}
                <div className="bg-red-950/40 border-2 border-amber-300/50 rounded-lg p-2 text-center">
                  <p className="text-stone-300 text-xs">
                    <span className="text-amber-200 font-semibold">Best Time:</span> {selectedSignatureExperience.bestTime}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={() => planDayAroundSignature(selectedSignatureExperience)}
                    className="bg-gradient-to-r from-stone-100 to-amber-50 hover:from-amber-50 hover:to-amber-100 text-stone-900 py-3 rounded-xl font-bold text-sm transition-all shadow-xl border-2 border-amber-300"
                  >
                    ⭐ Plan My Day
                  </button>
                  <button
                    onClick={() => setShowSignatureModal(false)}
                    className="bg-gradient-to-r from-red-800 via-red-700 to-red-800 hover:from-red-700 hover:via-red-600 hover:to-red-700 text-stone-50 py-3 rounded-xl font-bold text-sm transition-all shadow-xl border-2 border-amber-300"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showSearchModal && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-gradient-to-br from-red-950 to-stone-950 border-2 border-amber-300 rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="sticky top-0 bg-red-900 border-b-2 border-amber-300 p-6 flex items-center justify-between">
                <h3 className="text-2xl font-bold text-stone-50">
                  {searchType === 'signature' ? 'Signature Experiences' : 'All Experiences'}
                </h3>
                <button
                  onClick={() => setShowSearchModal(false)}
                  className="p-2 hover:bg-red-800 rounded-lg transition-all"
                >
                  <X className="w-6 h-6 text-stone-50" />
                </button>
              </div>

              <div className="p-6">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter by name or description..."
                  className="w-full p-4 rounded-lg bg-black/70 border-2 border-red-800 text-stone-50 focus:border-amber-300 focus:outline-none placeholder-stone-400 mb-6"
                />

                <div className="space-y-6">
                  {searchType === 'signature' ? (
                    // Signature Experiences - Simple category grouping
                    Object.keys(getGroupedSearchResults()).length > 0 ? (
                      Object.entries(getGroupedSearchResults()).map(([category, results]) => (
                        <div key={category} className="space-y-3">
                          <h4 className="text-xl font-bold text-amber-200 border-b-2 border-amber-300/30 pb-2">
                            {category} ({results.length})
                          </h4>
                          <div className="grid grid-cols-2 gap-4">
                            {results.map((result, idx) => (
                              <div
                                key={idx}
                                className="bg-red-950/40 border-2 border-red-800 hover:border-amber-300 rounded-xl p-4 cursor-pointer transition-all"
                                onClick={() => {
                                  setSelectedSignatureExperience(result);
                                  setShowSignatureModal(true);
                                  setShowSearchModal(false);
                                }}
                              >
                                <h5 className="text-base font-bold text-stone-50 mb-1">{result.name}</h5>
                                <p className="text-stone-300 text-xs italic mb-2">{result.tagline}</p>
                                <div className="flex items-center justify-between text-xs mb-2">
                                  <span className="text-amber-200 font-semibold">{result.price}</span>
                                  <div className="flex items-center gap-1 text-amber-200">
                                    <Star className="w-3 h-3 fill-current" />
                                    <span>{result.rating}</span>
                                  </div>
                                </div>
                                <p className="text-stone-200 text-xs line-clamp-2">{result.description}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-stone-400 py-8">
                        No signature experiences found
                      </div>
                    )
                  ) : (
                    // All Experiences - Organized by Region and Category
                    Object.keys(getExperiencesByRegionAndCategory()).length > 0 ? (
                      Object.entries(getExperiencesByRegionAndCategory()).map(([region, categories]) => (
                        <div key={region} className="space-y-4">
                          <div className="bg-gradient-to-r from-red-900/60 to-stone-900/60 border-2 border-amber-300 rounded-xl p-4">
                            <h3 className="text-2xl font-bold text-amber-300">{region}</h3>
                          </div>
                          
                          {Object.entries(categories).map(([category, results]) => (
                            <div key={category} className="ml-4 space-y-3">
                              <h4 className="text-lg font-bold text-stone-200 border-b border-stone-600 pb-2">
                                {category} ({results.length})
                              </h4>
                              <div className="grid grid-cols-2 gap-3">
                                {results.map((result, idx) => (
                                  <div
                                    key={idx}
                                    className="bg-red-950/30 border-2 border-red-800 hover:border-amber-300 rounded-lg p-3 cursor-pointer transition-all"
                                    onClick={() => {
                                      if (result.id?.startsWith('sig')) {
                                        setSelectedSignatureExperience(result);
                                        setShowSignatureModal(true);
                                        setShowSearchModal(false);
                                      } else {
                                        setSelectedBusiness(result);
                                        setShowBusinessModal(true);
                                        setShowSearchModal(false);
                                      }
                                    }}
                                  >
                                    <div className="flex items-start justify-between gap-2">
                                      <div className="flex-1 min-w-0">
                                        <h5 className="text-sm font-bold text-stone-50 mb-1 truncate">{result.name}</h5>
                                        <p className="text-stone-300 text-xs line-clamp-2">{result.description}</p>
                                      </div>
                                      <div className="flex flex-col items-end gap-1 text-xs flex-shrink-0">
                                        {result.price && <span className="text-amber-200 font-semibold">{result.price}</span>}
                                        {result.rating && (
                                          <div className="flex items-center gap-1 text-amber-200">
                                            <Star className="w-3 h-3 fill-current" />
                                            <span>{result.rating}</span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-stone-400 py-8">
                        No experiences found
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {showBusinessModal && selectedBusiness && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-50">
            <div className="bg-gradient-to-br from-red-950 to-stone-950 border-2 border-amber-300 rounded-2xl w-[calc(100vw-1.5rem)] sm:w-full sm:max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="bg-gradient-to-br from-red-950 via-stone-950 to-red-950 p-4 sm:p-6 rounded-t-2xl border-b-2 border-amber-300">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-stone-50">{selectedBusiness.name}</h3>
                    <p className="text-stone-200 mt-1">{selectedBusiness.category}</p>
                  </div>
                  <button
                    onClick={() => setShowBusinessModal(false)}
                    className="p-2 hover:bg-white/20 rounded-lg transition-all"
                  >
                    <X className="w-6 h-6 text-stone-50" />
                  </button>
                </div>
              </div>

              <div className="p-4 sm:p-8 space-y-6">
                <p className="text-stone-200 text-lg leading-relaxed">{selectedBusiness.description}</p>

                {/* EXCLUSIVE PARTNER OFFER - LUXURIOUS REDESIGN */}
                <div className="bg-gradient-to-br from-stone-100 via-amber-50 to-stone-100 border-4 border-red-800 rounded-2xl p-8 shadow-2xl">
                  <div className="text-center space-y-4">
                    <div className="text-red-900 font-black text-3xl tracking-wide uppercase">
                      Exclusive Partner Offer
                    </div>
                    <div className="w-24 h-1 bg-red-800 mx-auto"></div>
                    <div className="bg-white/60 backdrop-blur-sm border-2 border-red-800 rounded-xl p-8 shadow-xl">
                      <div className="text-stone-900 text-xl font-semibold leading-relaxed mb-4">
                        Show your Rio Nido Lodge room key to receive
                      </div>
                      <div className="text-red-800 text-6xl font-black my-4">10% OFF</div>
                      <div className="text-stone-900 text-xl font-semibold">
                        your entire purchase
                      </div>
                    </div>
                    
                   {/* REDEEM BUTTON → DIRECT TO REVIEW */}
                   <button
                     onClick={() => {
                       setRedeemingBusiness(selectedBusiness);
                       setShowBusinessModal(false);
                       setSkipToReview(true);
                       setShowRedeemModal(true);
                     }}
                     className="w-full bg-gradient-to-r from-red-800 via-red-700 to-red-800 hover:from-red-700 hover:via-red-600 hover:to-red-700 text-stone-50 py-4 rounded-xl font-bold text-lg transition-all shadow-xl border-2 border-amber-300"
                   >
                     👉 Click to Redeem
                   </button>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <a
                    href={createMapLink(selectedBusiness.name, selectedBusiness.address || selectedBusiness.location)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-gradient-to-r from-stone-100 to-amber-50 hover:from-amber-50 hover:to-amber-100 text-stone-900 py-4 rounded-xl font-bold transition-all shadow-xl border-2 border-amber-300 flex items-center justify-center gap-2"
                  >
                    <Navigation className="w-5 h-5" />
                    Get Directions
                  </a>
                  {selectedBusiness.phone && (
                    <a
                      href={`tel:${selectedBusiness.phone}`}
                      className="flex-1 bg-gradient-to-r from-red-800 via-red-700 to-red-800 hover:from-red-700 hover:via-red-600 hover:to-red-700 text-stone-50 py-4 rounded-xl font-bold transition-all shadow-xl border-2 border-amber-300 flex items-center justify-center gap-2"
                    >
                      <Phone className="w-5 h-5" />
                      Call Now
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {showWineTrailModal && selectedWineTrail && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-50">
            <div className="bg-gradient-to-br from-red-950 to-stone-950 border-2 border-amber-300 rounded-2xl w-[calc(100vw-1.5rem)] sm:w-full sm:max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="bg-gradient-to-br from-red-950 via-stone-950 to-red-950 p-4 sm:p-6 rounded-t-2xl border-b-2 border-amber-300">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-stone-50">{selectedWineTrail.name}</h3>
                    <p className="text-stone-200 mt-1">{selectedWineTrail.description}</p>
                  </div>
                  <button
                    onClick={() => setShowWineTrailModal(false)}
                    className="p-2 hover:bg-white/20 rounded-lg transition-all"
                  >
                    <X className="w-6 h-6 text-stone-50" />
                  </button>
                </div>
              </div>

              <div className="p-4 sm:p-8 space-y-6">
                <div className="bg-amber-950/30 border-2 border-amber-300 rounded-xl p-6">
                  <div className="text-amber-300 font-bold text-lg mb-2">Exclusive Perks for Rio Nido Guests:</div>
                  <p className="text-stone-200 text-lg">{selectedWineTrail.exclusivePerks}</p>
                </div>

                <div>
                  <h4 className="text-xl font-bold text-stone-50 mb-4">Featured Wineries on This Trail:</h4>
                  <div className="space-y-4">
                    {selectedWineTrail.wineries.map((winery, idx) => (
                      <div key={idx} className="bg-red-950/40 border-2 border-red-800 rounded-xl p-5">
                        <h5 className="text-lg font-bold text-amber-200 mb-2">{winery.name}</h5>
                        <p className="text-stone-200 leading-relaxed">{winery.blurb}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-red-950/40 border-2 border-amber-300/50 rounded-lg p-4 text-center">
                  <p className="text-stone-300 text-sm">
                    <span className="text-amber-200 font-semibold">Timeframe:</span> {selectedWineTrail.timeSlot}
                  </p>
                  <p className="text-stone-400 text-xs mt-2">
                    This curated wine trail is exclusively available to Rio Nido Lodge guests
                  </p>
                </div>

                <button
                  onClick={() => setShowWineTrailModal(false)}
                  className="w-full bg-gradient-to-r from-red-800 via-red-700 to-red-800 hover:from-red-700 hover:via-red-600 hover:to-red-700 text-stone-50 py-4 rounded-xl font-bold transition-all shadow-xl border-2 border-amber-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {showShoppingDistrictModal && selectedShoppingDistrict && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-50">
            <div className="bg-gradient-to-br from-red-950 to-stone-950 border-2 border-amber-300 rounded-2xl w-[calc(100vw-1.5rem)] sm:w-full sm:max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="bg-gradient-to-br from-red-950 via-stone-950 to-red-950 p-4 sm:p-6 rounded-t-2xl border-b-2 border-amber-300">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-stone-50">{selectedShoppingDistrict.name}</h3>
                    <p className="text-stone-200 mt-1">{selectedShoppingDistrict.description}</p>
                  </div>
                  <button
                    onClick={() => setShowShoppingDistrictModal(false)}
                    className="p-2 hover:bg-white/20 rounded-lg transition-all"
                  >
                    <X className="w-6 h-6 text-stone-50" />
                  </button>
                </div>
              </div>

              <div className="p-4 sm:p-8 space-y-6">
                <div className="bg-red-950/40 border-2 border-red-800 rounded-lg p-4">
                  <div className="text-stone-400 text-sm mb-1">Hours</div>
                  <div className="text-stone-50 font-semibold">⏰ {selectedShoppingDistrict.hours}</div>
                </div>

                <div>
                  <h4 className="text-xl font-bold text-stone-50 mb-4">Shopping Highlights:</h4>
                  <div className="space-y-3">
                    {selectedShoppingDistrict.highlights.map((highlight, idx) => (
                      <div key={idx} className="bg-red-950/40 border-2 border-red-800 rounded-xl p-4 flex items-start gap-3">
                        <span className="text-amber-200 text-xl flex-shrink-0">🛍️</span>
                        <p className="text-stone-200 leading-relaxed">{highlight}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-amber-950/30 border-2 border-amber-300 rounded-xl p-6">
                  <div className="text-amber-300 font-bold text-lg mb-2">💡 Insider Tip:</div>
                  <p className="text-stone-200">
                    Take your time exploring the unique local shops. Many are family-owned businesses with one-of-a-kind items you won't find anywhere else. Ask shop owners for recommendations - they love sharing their local favorites!
                  </p>
                </div>

                <div className="bg-red-950/40 border-2 border-amber-300/50 rounded-lg p-4 text-center">
                  <p className="text-stone-300 text-sm">
                    <span className="text-amber-200 font-semibold">Timeframe:</span> {selectedShoppingDistrict.timeSlot}
                  </p>
                  <p className="text-stone-400 text-xs mt-2">
                    Plan 2-3 hours to explore the district at a leisurely pace
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <a
                    href={createMapLink(selectedShoppingDistrict.name, selectedShoppingDistrict.address)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-gradient-to-r from-stone-100 to-amber-50 hover:from-amber-50 hover:to-amber-100 text-stone-900 py-4 rounded-xl font-bold transition-all shadow-xl border-2 border-amber-300 flex items-center justify-center gap-2"
                  >
                    <Navigation className="w-5 h-5" />
                    Get Directions
                  </a>
                  <button
                    onClick={() => setShowShoppingDistrictModal(false)}
                    className="flex-1 bg-gradient-to-r from-red-800 via-red-700 to-red-800 hover:from-red-700 hover:via-red-600 hover:to-red-700 text-stone-50 py-4 rounded-xl font-bold transition-all shadow-xl border-2 border-amber-300"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* REDEEM MODAL */}
        {showRedeemModal && <RedeemModal />}
        
        {/* ITINERARY EMAIL MODAL */}
        {showItineraryEmailModal && <ItineraryEmailModal />}
        
        {/* BOOKING CONTACT MODAL */}
        {showBookingModal && <BookingContactModal />}
      </div>
    </div>
  );
};

export default RioNidoTravelPlanner;
