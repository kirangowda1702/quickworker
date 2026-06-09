// QuickWorker Data Layer
// Contains 30 Services and dynamically generates exactly 20 Hassan-based workers for each service (600 workers total).

export const services = [
  { id: "electrician", name: "Electrician", category: "Repairs", icon: "Zap", price: 149, description: "Wiring, switchboard repairs, fan installs, and electrical troubleshooting." },
  { id: "plumber", name: "Plumber", category: "Repairs", icon: "Droplets", price: 199, description: "Leak fixing, tap replacements, pipe repairs, and toilet installations." },
  { id: "carpenter", name: "Carpenter", category: "Repairs", icon: "Hammer", price: 199, description: "Furniture repair, door latch fix, cabinets, and custom woodwork." },
  { id: "ac-repair", name: "AC Service & Repair", category: "Repairs", icon: "Wind", price: 349, description: "AC gas filling, filter cleaning, cooling fixes, and installation." },
  { id: "appliance", name: "Appliance Repair", category: "Repairs", icon: "Tv", price: 249, description: "Washing machine, refrigerator, microwave, and TV repairs." },
  { id: "house-cleaning", name: "House Cleaning", category: "Cleaning", icon: "Sparkles", price: 799, description: "Full deep cleaning of 1/2/3 BHK houses, floors, and windows." },
  { id: "sofa-cleaning", name: "Sofa & Carpet Cleaning", category: "Cleaning", icon: "Brush", price: 499, description: "Vacuuming and dry shampooing of sofas, carpets, and mattresses." },
  { id: "kitchen-cleaning", name: "Kitchen Deep Cleaning", category: "Cleaning", icon: "Flame", price: 599, description: "Stove, chimney, cabinets, grease removal, and slab sanitization." },
  { id: "bathroom-cleaning", name: "Bathroom Cleaning", category: "Cleaning", icon: "Trash2", price: 299, description: "Tile scrubbing, stain removal, taps scaling, and disinfection." },
  { id: "painting", name: "Wall Painter", category: "Repairs", icon: "Palette", price: 999, description: "Interior & exterior express painting, touchups, and stencils." },
  { id: "pest-control", name: "Pest Control", category: "Cleaning", icon: "Bug", price: 699, description: "Termite, cockroach, bedbug, and mosquito treatments." },
  { id: "mason", name: "Mason (Tile & Cement)", category: "Repairs", icon: "Grid", price: 450, description: "Tile layups, wall cementing, bricks repair, and plastering." },
  { id: "gardener", name: "Gardener", category: "Cleaning", icon: "Flower2", price: 249, description: "Lawn trimming, soil preparation, plant pruning, and weeding." },
  { id: "beautician-women", name: "Women's Salon", category: "Personal Care", icon: "Sparkles", price: 399, description: "Facials, waxing, manicures, pedicures, and threading at home." },
  { id: "hairdresser-men", name: "Men & Kids Salon", category: "Personal Care", icon: "Scissors", price: 199, description: "Haircut, shave, beard grooming, head massage, and kids styling." },
  { id: "massage-men", name: "Massage for Men", category: "Personal Care", icon: "Activity", price: 899, description: "Deep tissue, Swedish, and relaxation massages by certified male therapists." },
  { id: "massage-women", name: "Massage for Women", category: "Personal Care", icon: "HeartPulse", price: 999, description: "Pain relief, stress relief, and Ayurvedic massages by female therapists." },
  { id: "makeup-artist", name: "Makeup Artist", category: "Personal Care", icon: "Smile", price: 1499, description: "Bridal, party, and occasion makeup and hairstyling at home." },
  { id: "physiotherapist", name: "Physiotherapist", category: "Personal Care", icon: "ShieldAlert", price: 499, description: "Home physio sessions for back pain, joint stiffness, and rehab." },
  { id: "car-washing", name: "Car Wash & Detail", category: "Cleaning", icon: "Car", price: 299, description: "Exterior wash, interior vacuuming, polish, and dashboard cleanup." },
  { id: "pc-repair", name: "Laptop & PC Repair", category: "Tech Support", icon: "Laptop", price: 399, description: "OS install, RAM upgrade, screen replacement, and hardware fixes." },
  { id: "mobile-repair", name: "Mobile Repair", category: "Tech Support", icon: "Smartphone", price: 199, description: "Screen display replacement, battery swap, and software updates." },
  { id: "cctv-install", name: "CCTV Installation", category: "Tech Support", icon: "Video", price: 499, description: "IP camera setup, DVR configuration, wiring, and app connection." },
  { id: "packers-movers", name: "Packers & Movers", category: "Repairs", icon: "Truck", price: 1999, description: "Shifting goods, loading/unloading, packing items securely." },
  { id: "water-purifier", name: "RO Purifier Repair", category: "Repairs", icon: "GlassWater", price: 299, description: "Filter swap, water tasting issues, membrane check, and leakage." },
  { id: "chimney-repair", name: "Chimney Repair", category: "Repairs", icon: "Gauge", price: 349, description: "Blower cleaning, filter replacement, motor repair, and wiring." },
  { id: "tailoring", name: "Home Tailoring", category: "Personal Care", icon: "ScissorsLineDashed", price: 149, description: "Stitching and alteration, blouse & dress designing, doorstep delivery." },
  { id: "dog-groomer", name: "Dog Grooming & Walk", category: "Personal Care", icon: "Footprints", price: 399, description: "Dog nail cutting, shampooing, hair trimming, and dog walking." },
  { id: "tutor", name: "Home Tutor", category: "Tech Support", icon: "GraduationCap", price: 299, description: "Personalized classes (K-10), math, science, and languages." },
  { id: "event-decorator", name: "Event Decorator", category: "Cleaning", icon: "PartyPopper", price: 2499, description: "Balloon decoration, floral setups for birthdays, anniversaries, and pujas." },
  { id: "driver", name: "Driver", category: "Repairs", icon: "Car", price: 399, description: "Professional drivers for local or outstation travels." },
  { id: "deep-cleaning", name: "Deep Cleaning", category: "Cleaning", icon: "Sparkles", price: 899, description: "Intense deep cleaning services for homes and offices." }
];

const firstNamesMale = [
  "Amit", "Rahul", "Karan", "Sanjay", "Vijay", "Anil", "Sunil", "Ravi", "Manjunath", 
  "Srinivas", "Ramesh", "Ganesh", "Shekhar", "Prakash", "Harish", "Deepak", "Sandesh", 
  "Vikram", "Ajay", "Pradeep", "Raghu", "Karthik", "Rakesh", "Darshan", "Puneeth", 
  "Abhishek", "Chethan", "Naveen", "Yashwant", "Shiva", "Arjun"
];

const firstNamesFemale = [
  "Priya", "Sunitha", "Kavitha", "Deepa", "Divya", "Anitha", "Rupa", "Sneha", "Radhika", 
  "Meena", "Shalini", "Shruthi", "Lakshmi", "Preethi", "Aishwarya", "Pooja", "Swathi", 
  "Jyothi", "Kavya", "Rashmi", "Sowmya", "Geetha", "Sujatha", "Rekha", "Madhavi"
];

const lastNames = [
  "Kumar", "Sharma", "Singh", "Joshi", "Patil", "Gowda", "Shetty", "Rao", "Nair", 
  "Prasad", "Naidu", "Pai", "Acharya", "Murthy", "Hegde", "Bhat", "Raj", "Roy", 
  "Das", "Verma", "Soni", "Lal", "Mishra", "Swamy", "Nayak"
];

const localities = [
  { name: "Kuvempu Nagar", lat: 13.0135, lng: 76.0945 },
  { name: "Hemavathi Nagar", lat: 13.0078, lng: 76.1023 },
  { name: "Vidya Nagar", lat: 13.0195, lng: 76.1067 },
  { name: "BM Road", lat: 13.0055, lng: 76.0921 },
  { name: "Channapatna", lat: 12.9982, lng: 76.0898 },
  { name: "Salagame Road", lat: 13.0232, lng: 76.0911 },
  { name: "Dairy Circle", lat: 13.0012, lng: 76.1154 },
  { name: "Vijaya Nagar", lat: 13.0161, lng: 76.1210 },
  { name: "Hassan City Center", lat: 13.0065, lng: 76.1002 },
  { name: "Arasikere Road", lat: 13.0312, lng: 76.1018 }
];

// Helper to calculate distance in KM using Haversine formula
export const getDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in km
};

// Generate exactly 20 workers per service. Total = 30 * 20 = 600 workers.
export const workers = (() => {
  const list = [];
  let workerIdCounter = 1;

  services.forEach((service) => {
    // Some services have female workers predominantly (e.g. Women Salon, Women Massage, Makeup Artist)
    const isFemalePreferred = 
      service.id === "beautician-women" || 
      service.id === "massage-women" || 
      service.id === "makeup-artist" ||
      service.id === "tailoring";
    
    // Some services have male workers predominantly
    const isMalePreferred = 
      service.id === "electrician" ||
      service.id === "plumber" ||
      service.id === "carpenter" ||
      service.id === "ac-repair" ||
      service.id === "mason" ||
      service.id === "massage-men";

    for (let i = 1; i <= 20; i++) {
      const id = workerIdCounter++;
      
      // Determine gender
      let isFemale = false;
      if (isFemalePreferred) {
        isFemale = true;
      } else if (isMalePreferred) {
        isFemale = false;
      } else {
        isFemale = Math.random() > 0.35; // 35% female for other jobs
      }

      const firstName = isFemale 
        ? firstNamesFemale[(id + i) % firstNamesFemale.length]
        : firstNamesMale[(id + i) % firstNamesMale.length];
      const lastName = lastNames[(id * i) % lastNames.length];
      const name = `${firstName} ${lastName}`;

      // Pick a random locality in Hassan
      const localityObj = localities[(id + i) % localities.length];
      
      // Slightly randomize coordinates of worker within that locality to create natural dispersion
      const offsetLat = (Math.sin(id) * 0.008);
      const offsetLng = (Math.cos(id) * 0.008);
      const lat = localityObj.lat + offsetLat;
      const lng = localityObj.lng + offsetLng;

      // Experience: 2 to 15 years
      const experience = 2 + ((id * 3) % 13);
      
      // Rating: 4.1 to 4.9
      const rating = parseFloat((4.1 + ((id * 7) % 9) * 0.1).toFixed(1));
      
      // Reviews count: 12 to 180
      const reviewsCount = 12 + ((id * 13) % 169);

      // Price multiplier: slight variance (+-20%) based on experience/rating
      const variance = 0.9 + ((id % 5) * 0.08); // 0.9 to 1.22
      const price = Math.round(service.price * variance);

      // Avatar
      const genderPath = isFemale ? "women" : "men";
      const imageIndex = (id % 90) + 1; // 1 to 90
      const avatar = `https://randomuser.me/api/portraits/${genderPath}/${imageIndex}.jpg`;

      let finalName = name;
      let finalPhone = `+91${7000000000 + (id * 17923) % 299999999}`;
      
      if (id === 1) {
        finalName = "Kiran Gowda";
        finalPhone = "+919110885805";
      } else if (id === 2) {
        finalName = "Madan Patil";
        finalPhone = "+918152093467";
      } else if (id === 3) {
        finalName = "Hemanth Bhat";
        finalPhone = "+916366025492";
      }

      list.push({
        id: `W${id.toString().padStart(3, "0")}`,
        name: finalName,
        gender: isFemale ? "Female" : "Male",
        phone: finalPhone,
        avatar,
        serviceId: service.id,
        serviceName: service.name,
        locality: localityObj.name,
        coordinates: { lat, lng },
        experience,
        rating,
        reviewsCount,
        price,
        completedJobs: reviewsCount + 10,
        about: `Expert ${service.name.toLowerCase()} with ${experience} years of hands-on experience in Hassan. Committed to clean, punctual, and quality service.`,
        isAvailable: (id % 7) !== 0 // 6 out of 7 are available
      });
    }
  });

  return list;
})();
