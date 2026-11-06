export interface SeedEntity {
  canonicalName: string;
  entityType: string;
  priorFrequency: number; // e.g. 0.01 (rare) to 0.45 (very common)
  aliases: string[];
}

import { ADDITIONAL_50_QUESTIONS } from "./additional-questions";


export interface SeedQuestion {
  id: string;
  order: number;
  questionText: string;
  category: string;
  subcategory: string;
  difficulty: "easy" | "medium" | "hard";
  explanation: string;
  entities: SeedEntity[];
}

export const SEED_QUESTIONS: SeedQuestion[] = [
  {
    id: "q-1",
    order: 1,
    questionText: "Name an Indian actor who has won the National Film Award for Best Actor.",
    category: "Bollywood & Cinema",
    subcategory: "National Awards",
    difficulty: "medium",
    explanation: "Awarded annually by the Directorate of Film Festivals since 1967.",
    entities: [
      {
        canonicalName: "Amitabh Bachchan",
        entityType: "actor",
        priorFrequency: 0.35,
        aliases: ["Big B", "Bachchan", "Amitabh", "Shahenshah", "Amitabh Bachan"],
      },
      {
        canonicalName: "Mithun Chakraborty",
        entityType: "actor",
        priorFrequency: 0.12,
        aliases: ["Mithun", "Mithun Da", "Mithun Chakroborty"],
      },
      {
        canonicalName: "Kamal Haasan",
        entityType: "actor",
        priorFrequency: 0.14,
        aliases: ["Kamal Hassan", "Kamal Hasan", "Ulaga Nayagan", "Ulaganayagan"],
      },
      {
        canonicalName: "Mammootty",
        entityType: "actor",
        priorFrequency: 0.08,
        aliases: ["Mammotty", "Mammookka", "Mammootti"],
      },
      {
        canonicalName: "Mohanlal",
        entityType: "actor",
        priorFrequency: 0.10,
        aliases: ["Mohan Lal", "Lalettan"],
      },
      {
        canonicalName: "Manoj Bajpayee",
        entityType: "actor",
        priorFrequency: 0.05,
        aliases: ["Manoj Bajpai", "Manoj Bajpayi", "Bajpayee"],
      },
      {
        canonicalName: "Irrfan Khan",
        entityType: "actor",
        priorFrequency: 0.07,
        aliases: ["Irfan Khan", "Irrfan"],
      },
      {
        canonicalName: "Allu Arjun",
        entityType: "actor",
        priorFrequency: 0.18,
        aliases: ["Bunny", "Pushpa", "Allu"],
      },
      {
        canonicalName: "Suriya",
        entityType: "actor",
        priorFrequency: 0.06,
        aliases: ["Surya", "Suriya Sivakumar"],
      },
      {
        canonicalName: "Naseeruddin Shah",
        entityType: "actor",
        priorFrequency: 0.03, // Rare!
        aliases: ["Naseeruddin", "Nasseruddin Shah", "Naseeruddin Saha"],
      },
      {
        canonicalName: "Sanjeev Kumar",
        entityType: "actor",
        priorFrequency: 0.02, // Ultra Rare!
        aliases: ["Haribhai Zariwala", "Sanjeev"],
      },
      {
        canonicalName: "Ajay Devgn",
        entityType: "actor",
        priorFrequency: 0.15,
        aliases: ["Ajay Devgan", "Ajay", "Devgn"],
      },
    ],
  },
  {
    id: "q-2",
    order: 2,
    questionText: "Name an Indian cricketer who has scored a century in Test cricket.",
    category: "Cricket",
    subcategory: "Test Cricket",
    difficulty: "easy",
    explanation: "Over 85 Indian batsmen have scored at least one century in men's Test cricket.",
    entities: [
      {
        canonicalName: "Sachin Tendulkar",
        entityType: "cricketer",
        priorFrequency: 0.40, // Very common
        aliases: ["Sachin", "Tendulkar", "Master Blaster", "Little Master", "SRT"],
      },
      {
        canonicalName: "Virat Kohli",
        entityType: "cricketer",
        priorFrequency: 0.38, // Very common
        aliases: ["Kohli", "King Kohli", "Cheeku", "VK"],
      },
      {
        canonicalName: "Rohit Sharma",
        entityType: "cricketer",
        priorFrequency: 0.22,
        aliases: ["Rohit", "Hitman", "Ro"],
      },
      {
        canonicalName: "Rahul Dravid",
        entityType: "cricketer",
        priorFrequency: 0.18,
        aliases: ["Dravid", "The Wall", "Jammy"],
      },
      {
        canonicalName: "Sunil Gavaskar",
        entityType: "cricketer",
        priorFrequency: 0.12,
        aliases: ["Gavaskar", "Sunny Gavaskar", "Sunny"],
      },
      {
        canonicalName: "VVS Laxman",
        entityType: "cricketer",
        priorFrequency: 0.08,
        aliases: ["Laxman", "VVS", "Very Very Special Laxman"],
      },
      {
        canonicalName: "Rishabh Pant",
        entityType: "cricketer",
        priorFrequency: 0.10,
        aliases: ["Pant", "Spidey"],
      },
      {
        canonicalName: "Yashasvi Jaiswal",
        entityType: "cricketer",
        priorFrequency: 0.07,
        aliases: ["Jaiswal", "Yashasvi"],
      },
      {
        canonicalName: "Karun Nair",
        entityType: "cricketer",
        priorFrequency: 0.03, // Rare (Triple Century!)
        aliases: ["Karun", "Nair"],
      },
      {
        canonicalName: "Gundappa Viswanath",
        entityType: "cricketer",
        priorFrequency: 0.02, // Rare!
        aliases: ["GR Viswanath", "Vishy", "Viswanath"],
      },
      {
        canonicalName: "Wasim Jaffer",
        entityType: "cricketer",
        priorFrequency: 0.02, // Rare!
        aliases: ["Jaffer", "Wasim"],
      },
      {
        canonicalName: "Polly Umrigar",
        entityType: "cricketer",
        priorFrequency: 0.01, // Ultra Rare!
        aliases: ["Umrigar", "Pahlan Ratanji Umrigar"],
      },
    ],
  },
  {
    id: "q-3",
    order: 3,
    questionText: "Name an Indian city that served as the capital of an ancient or medieval Indian dynasty or empire.",
    category: "Indian History",
    subcategory: "Historic Capitals",
    difficulty: "medium",
    explanation: "India was home to grand imperial capitals across the Mauryas, Cholas, Vijayanagara, and Guptas.",
    entities: [
      {
        canonicalName: "Delhi",
        entityType: "city",
        priorFrequency: 0.35,
        aliases: ["Dilli", "New Delhi", "Indraprastha", "Shahjahanabad"],
      },
      {
        canonicalName: "Pataliputra",
        entityType: "city",
        priorFrequency: 0.15,
        aliases: ["Patna", "Kusumdhvaja", "Pushpapura"],
      },
      {
        canonicalName: "Hampi",
        entityType: "city",
        priorFrequency: 0.14,
        aliases: ["Vijayanagara", "Vijayanagar", "Pampa Kshetra"],
      },
      {
        canonicalName: "Ujjain",
        entityType: "city",
        priorFrequency: 0.08,
        aliases: ["Ujjayini", "Avanti"],
      },
      {
        canonicalName: "Thanjavur",
        entityType: "city",
        priorFrequency: 0.06,
        aliases: ["Tanjore", "Thanjai"],
      },
      {
        canonicalName: "Kannauj",
        entityType: "city",
        priorFrequency: 0.04,
        aliases: ["Kanyakubja", "Kanooj"],
      },
      {
        canonicalName: "Madurai",
        entityType: "city",
        priorFrequency: 0.07,
        aliases: ["Koodal", "Temple City"],
      },
      {
        canonicalName: "Badami",
        entityType: "city",
        priorFrequency: 0.02, // Rare!
        aliases: ["Vatapi"],
      },
      {
        canonicalName: "Kanchipuram",
        entityType: "city",
        priorFrequency: 0.04,
        aliases: ["Kanchi", "Conjeevaram"],
      },
      {
        canonicalName: "Rajgir",
        entityType: "city",
        priorFrequency: 0.03, // Rare!
        aliases: ["Rajagriha", "Girivraja"],
      },
      {
        canonicalName: "Manyakheta",
        entityType: "city",
        priorFrequency: 0.01, // Ultra Rare! (Rashtrakuta capital)
        aliases: ["Malkhed"],
      },
    ],
  },
  {
    id: "q-4",
    order: 4,
    questionText: "Name an Indian state or Union Territory that has a coastline.",
    category: "Indian Geography",
    subcategory: "Coastal Regions",
    difficulty: "easy",
    explanation: "India has a mainland coastline extending over 7,500 kilometers.",
    entities: [
      {
        canonicalName: "Goa",
        entityType: "state",
        priorFrequency: 0.32,
        aliases: ["Gova"],
      },
      {
        canonicalName: "Kerala",
        entityType: "state",
        priorFrequency: 0.28,
        aliases: ["God's Own Country", "Keralam"],
      },
      {
        canonicalName: "Maharashtra",
        entityType: "state",
        priorFrequency: 0.22,
        aliases: ["Maha"],
      },
      {
        canonicalName: "Gujarat",
        entityType: "state",
        priorFrequency: 0.18,
        aliases: ["Gujrat"],
      },
      {
        canonicalName: "Tamil Nadu",
        entityType: "state",
        priorFrequency: 0.19,
        aliases: ["TN", "Tamilnadu"],
      },
      {
        canonicalName: "Karnataka",
        entityType: "state",
        priorFrequency: 0.14,
        aliases: ["Kar"],
      },
      {
        canonicalName: "Andhra Pradesh",
        entityType: "state",
        priorFrequency: 0.11,
        aliases: ["AP", "Andhra"],
      },
      {
        canonicalName: "West Bengal",
        entityType: "state",
        priorFrequency: 0.12,
        aliases: ["WB", "Bengal", "Bangla"],
      },
      {
        canonicalName: "Odisha",
        entityType: "state",
        priorFrequency: 0.09,
        aliases: ["Orissa", "Utkala"],
      },
      {
        canonicalName: "Puducherry",
        entityType: "union_territory",
        priorFrequency: 0.05,
        aliases: ["Pondicherry", "Pondi"],
      },
      {
        canonicalName: "Lakshadweep",
        entityType: "union_territory",
        priorFrequency: 0.03, // Rare!
        aliases: ["Laccadives"],
      },
      {
        canonicalName: "Daman and Diu",
        entityType: "union_territory",
        priorFrequency: 0.02, // Ultra Rare!
        aliases: ["Daman Diu", "Dadra and Nagar Haveli and Daman and Diu"],
      },
    ],
  },
  {
    id: "q-5",
    order: 5,
    questionText: "Name a traditional Indian sweet (mithai) prepared with milk, paneer, or chenna.",
    category: "Indian Food & Chai",
    subcategory: "Mithai",
    difficulty: "easy",
    explanation: "Indian sweets made from milk solids and fresh curd cheese form the crown jewel of festive feasts.",
    entities: [
      {
        canonicalName: "Rasgulla",
        entityType: "sweet",
        priorFrequency: 0.35,
        aliases: ["Roshogolla", "Rasgulla", "Rasbari"],
      },
      {
        canonicalName: "Gulab Jamun",
        entityType: "sweet",
        priorFrequency: 0.38,
        aliases: ["Jamun", "Gulaab Jamun"],
      },
      {
        canonicalName: "Rasmalai",
        entityType: "sweet",
        priorFrequency: 0.22,
        aliases: ["Ras Malai", "Rossomalai"],
      },
      {
        canonicalName: "Sandesh",
        entityType: "sweet",
        priorFrequency: 0.10,
        aliases: ["Shondesh"],
      },
      {
        canonicalName: "Kalakand",
        entityType: "sweet",
        priorFrequency: 0.08,
        aliases: ["Kala Kand", "Milk Cake"],
      },
      {
        canonicalName: "Peda",
        entityType: "sweet",
        priorFrequency: 0.11,
        aliases: ["Pera", "Dharwad Peda", "Mathura Peda"],
      },
      {
        canonicalName: "Basundi",
        entityType: "sweet",
        priorFrequency: 0.05,
        aliases: ["Rabri Basundi"],
      },
      {
        canonicalName: "Rabri",
        entityType: "sweet",
        priorFrequency: 0.09,
        aliases: ["Rabdi"],
      },
      {
        canonicalName: "Cham Cham",
        entityType: "sweet",
        priorFrequency: 0.04,
        aliases: ["Chum Chum", "Chomchom"],
      },
      {
        canonicalName: "Chenna Poda",
        entityType: "sweet",
        priorFrequency: 0.02, // Rare! (Odisha specialty baked cheese)
        aliases: ["Chhena Poda", "Chhenapoda"],
      },
      {
        canonicalName: "Pantua",
        entityType: "sweet",
        priorFrequency: 0.01, // Ultra Rare!
        aliases: ["Ledikeni"],
      },
    ],
  },
  {
    id: "q-6",
    order: 6,
    questionText: "Name an Indian television show from the 1990s or 2000s (Doordarshan or early Cable TV).",
    category: "90s Nostalgia",
    subcategory: "Classic TV",
    difficulty: "medium",
    explanation: "The golden era of Indian television brought timeless family comedies, thrillers, and dramas.",
    entities: [
      {
        canonicalName: "Shaktimaan",
        entityType: "tv_show",
        priorFrequency: 0.32,
        aliases: ["Shaktiman", "Gangadhar"],
      },
      {
        canonicalName: "CID",
        entityType: "tv_show",
        priorFrequency: 0.35,
        aliases: ["C.I.D.", "Daya Darwaza Todo", "ACP Pradyuman"],
      },
      {
        canonicalName: "Sarabhai vs Sarabhai",
        entityType: "tv_show",
        priorFrequency: 0.20,
        aliases: ["Sarabhai", "Sarabhai v Sarabhai", "Maya Sarabhai"],
      },
      {
        canonicalName: "Malgudi Days",
        entityType: "tv_show",
        priorFrequency: 0.16,
        aliases: ["Swami and Friends", "RK Narayan Malgudi"],
      },
      {
        canonicalName: "Dekh Bhai Dekh",
        entityType: "tv_show",
        priorFrequency: 0.12,
        aliases: ["Dekh Bhai Dekh Diwan Family"],
      },
      {
        canonicalName: "Office Office",
        entityType: "tv_show",
        priorFrequency: 0.10,
        aliases: ["Mussaddi Lal", "Mussaddilal"],
      },
      {
        canonicalName: "Hip Hip Hurray",
        entityType: "tv_show",
        priorFrequency: 0.05,
        aliases: ["Hip Hip Hurrey"],
      },
      {
        canonicalName: "Byomkesh Bakshi",
        entityType: "tv_show",
        priorFrequency: 0.07,
        aliases: ["Bakshi", "Byomkesh"],
      },
      {
        canonicalName: "Just Mohabbat",
        entityType: "tv_show",
        priorFrequency: 0.04,
        aliases: ["Jai Just Mohabbat"],
      },
      {
        canonicalName: "Hum Paanch",
        entityType: "tv_show",
        priorFrequency: 0.08,
        aliases: ["Hum Panch", "Anand Mathur"],
      },
      {
        canonicalName: "Captain Vyom",
        entityType: "tv_show",
        priorFrequency: 0.02, // Rare! (Milind Soman sci-fi)
        aliases: ["Vyom", "Capt Vyom"],
      },
      {
        canonicalName: "Flop Show",
        entityType: "tv_show",
        priorFrequency: 0.03, // Rare! (Jaspal Bhatti)
        aliases: ["Jaspal Bhatti Flop Show"],
      },
    ],
  },
  {
    id: "q-7",
    order: 7,
    questionText: "Name an Indian film directed by Satyajit Ray, Rajkumar Hirani, or Mani Ratnam.",
    category: "Master Directors",
    subcategory: "Auteur Cinema",
    difficulty: "medium",
    explanation: "Directed by three of Indian cinema's greatest master storytellers.",
    entities: [
      {
        canonicalName: "3 Idiots",
        entityType: "movie",
        priorFrequency: 0.36,
        aliases: ["Three Idiots", "3 Idiots Movie"],
      },
      {
        canonicalName: "Munna Bhai M.B.B.S.",
        entityType: "movie",
        priorFrequency: 0.24,
        aliases: ["Munna Bhai", "Munnabhai MBBS", "Munnabhai"],
      },
      {
        canonicalName: "PK",
        entityType: "movie",
        priorFrequency: 0.22,
        aliases: ["P.K.", "PeeKay"],
      },
      {
        canonicalName: "Roja",
        entityType: "movie",
        priorFrequency: 0.16,
        aliases: ["Roja Film"],
      },
      {
        canonicalName: "Bombay",
        entityType: "movie",
        priorFrequency: 0.14,
        aliases: ["Bombay Movie"],
      },
      {
        canonicalName: "Dil Se..",
        entityType: "movie",
        priorFrequency: 0.15,
        aliases: ["Dil Se", "Dilse"],
      },
      {
        canonicalName: "Nayakan",
        entityType: "movie",
        priorFrequency: 0.12,
        aliases: ["Nayagan", "Nayakan Kamal Haasan"],
      },
      {
        canonicalName: "Guru",
        entityType: "movie",
        priorFrequency: 0.10,
        aliases: ["Guru Mani Ratnam"],
      },
      {
        canonicalName: "Ponniyin Selvan",
        entityType: "movie",
        priorFrequency: 0.11,
        aliases: ["PS 1", "PS 2", "Ponniyin Selvan 1", "PS1"],
      },
      {
        canonicalName: "Pather Panchali",
        entityType: "movie",
        priorFrequency: 0.13,
        aliases: ["Song of the Little Road", "Apu Trilogy 1"],
      },
      {
        canonicalName: "Charulata",
        entityType: "movie",
        priorFrequency: 0.04, // Rare! (Satyajit Ray)
        aliases: ["The Lonely Wife", "Charu Lata"],
      },
      {
        canonicalName: "Shatranj Ke Khilari",
        entityType: "movie",
        priorFrequency: 0.03, // Rare! (The Chess Players)
        aliases: ["The Chess Players", "Shatranj Ke Khiladi"],
      },
      {
        canonicalName: "Mahanagar",
        entityType: "movie",
        priorFrequency: 0.01, // Ultra Rare! (The Big City)
        aliases: ["The Big City"],
      },
    ],
  },
  ...ADDITIONAL_50_QUESTIONS,
];


