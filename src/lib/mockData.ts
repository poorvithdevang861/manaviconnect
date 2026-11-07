export interface School {
  id: string;
  name: string;
  region: string;
  code: string;
}

export interface Batch {
  id: string;
  schoolId: string;
  yearJoined: number;
  yearLeft: number;
  name: string;
}

export interface Member {
  id: string;
  name: string;
  email: string;
  phone?: string;
  school: string;
  batch: string; // e.g. "Class of 2012"
  batchYear: number;
  house?: "Aravali" | "Nilgiri" | "Shivalik" | "Udaygiri";
  role: string;
  organisation: string;
  city: string;
  avatar: string;
  initials: string;
  bio: string;
  status: "verified" | "pending" | "suspended";
  phoneVisibility: "me" | "batch" | "school" | "all";
  emailVisibility: "me" | "batch" | "school" | "all";
  joinedDate: string;
  isAdmin?: boolean;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  city: string;
  type: "Full-time" | "Internship" | "Contract" | "Remote";
  experienceLevel: string;
  description: string;
  applyMethod: string;
  postedBy: {
    id: string;
    name: string;
    batch: string;
    role: string;
  };
  postedAt: string;
  saved?: boolean;
}

export interface Story {
  id: string;
  title: string;
  type: "news" | "achievement" | "memoir" | "general";
  excerpt: string;
  content: string;
  author: {
    id: string;
    name: string;
    batch: string;
    role: string;
    avatar: string;
  };
  audience: "all" | "school" | "batch";
  publishedAt: string;
  readTime: string;
  coverImage?: string;
}

export interface EventItem {
  id: string;
  title: string;
  description: string;
  venue: string;
  city: string;
  date: string;
  time: string;
  startsAt: string;
  host: {
    name: string;
    batch: string;
  };
  audience: "all" | "school" | "batch";
  goingCount: number;
  maybeCount: number;
  userRsvp?: "going" | "maybe" | "not_going";
  questions?: Array<{
    id: string;
    author: string;
    batch: string;
    question: string;
    answer?: string;
  }>;
}

export interface MessageThread {
  id: string;
  participant: {
    id: string;
    name: string;
    batch: string;
    role: string;
    city: string;
    avatar: string;
  };
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  messages: Array<{
    id: string;
    senderId: string;
    text: string;
    timestamp: string;
    isSelf: boolean;
  }>;
}

export const CURRENT_USER: Member = {
  id: "mem_current",
  name: "Poorvith Devang",
  email: "poorvith@manaviconnect.in",
  phone: "+91 98450 12345",
  school: "MANAVI",
  batch: "Class of 2014",
  batchYear: 2014,
  house: "Aravali",
  role: "Lead Software Architect",
  organisation: "Fascinateit",
  city: "Bengaluru",
  avatar: "",
  initials: "PD",
  bio: "Batch of 2014, Aravali House. Building modern web platforms and mentoring Navodayan engineering aspirants.",
  status: "verified",
  phoneVisibility: "batch",
  emailVisibility: "school",
  joinedDate: "2024-01-15",
  isAdmin: true,
};

export const MOCK_MEMBERS: Member[] = [
  CURRENT_USER,
  {
    id: "mem_1",
    name: "Dr. Ananya Hegde",
    email: "ananya.hegde@apollohospitals.com",
    phone: "+91 94801 88231",
    school: "MANAVI",
    batch: "Class of 2010",
    batchYear: 2010,
    house: "Nilgiri",
    role: "Consultant Pediatrician",
    organisation: "Apollo Hospitals",
    city: "Mysuru",
    avatar: "",
    initials: "AH",
    bio: "Passionate about child health and community medicine in rural Malnad. Eager to mentor aspirants preparing for NEET.",
    status: "verified",
    phoneVisibility: "school",
    emailVisibility: "all",
    joinedDate: "2023-11-02",
  },
  {
    id: "mem_2",
    name: "Rohit Kulkarni",
    email: "rohit.k@ias.gov.in",
    phone: "+91 99002 44109",
    school: "MANAVI",
    batch: "Class of 2008",
    batchYear: 2008,
    house: "Shivalik",
    role: "Assistant Commissioner",
    organisation: "Government of Karnataka",
    city: "Shivamogga",
    avatar: "",
    initials: "RK",
    bio: "UPSC CSE 2015. Working on rural water conservation and e-governance reforms.",
    status: "verified",
    phoneVisibility: "batch",
    emailVisibility: "school",
    joinedDate: "2023-08-14",
    isAdmin: true,
  },
  {
    id: "mem_3",
    name: "Sneha Bharadwaj",
    email: "sneha@agrinext.io",
    phone: "+91 97410 55670",
    school: "MANAVI",
    batch: "Class of 2012",
    batchYear: 2012,
    house: "Udaygiri",
    role: "Founder & CEO",
    organisation: "AgriNext Labs",
    city: "Bengaluru",
    avatar: "",
    initials: "SB",
    bio: "Building precision coffee harvest forecasting. Happy to advise alumni on agritech grants and early venture building.",
    status: "verified",
    phoneVisibility: "all",
    emailVisibility: "all",
    joinedDate: "2024-02-10",
  },
  {
    id: "mem_4",
    name: "Kiran Prasad",
    email: "kiran.prasad@tcs.com",
    phone: "+91 98442 33110",
    school: "MANAVI",
    batch: "Class of 2016",
    batchYear: 2016,
    house: "Aravali",
    role: "Senior Cloud Infrastructure Engineer",
    organisation: "Tata Consultancy Services",
    city: "Hyderabad",
    avatar: "",
    initials: "KP",
    bio: "Kubernetes, distributed storage and terraform automation enthusiast. 2016 batch sports captain.",
    status: "verified",
    phoneVisibility: "batch",
    emailVisibility: "school",
    joinedDate: "2024-03-01",
  },
  {
    id: "mem_5",
    name: "Deepa Nayak",
    email: "deepa.nayak@highcourt.kar.nic.in",
    phone: "+91 94481 99022",
    school: "MANAVI",
    batch: "Class of 2007",
    batchYear: 2007,
    house: "Nilgiri",
    role: "Advocate, High Court of Karnataka",
    organisation: "Chambers of D. Nayak",
    city: "Bengaluru",
    avatar: "",
    initials: "DN",
    bio: "Constitutional and civil property law. Always available to review pro-bono alumni community trusts.",
    status: "verified",
    phoneVisibility: "batch",
    emailVisibility: "school",
    joinedDate: "2023-09-20",
  },
  {
    id: "mem_6",
    name: "Varun Shenoy",
    email: "varun.shenoy@stanford.edu",
    phone: "+1 650 492 8831",
    school: "MANAVI",
    batch: "Class of 2018",
    batchYear: 2018,
    house: "Shivalik",
    role: "Doctoral Researcher, Artificial Intelligence",
    organisation: "Stanford University",
    city: "Palo Alto, CA",
    avatar: "",
    initials: "VS",
    bio: "Researching multimodal foundation models and biology reasoning. JNV Olympiad medalist.",
    status: "verified",
    phoneVisibility: "me",
    emailVisibility: "school",
    joinedDate: "2024-05-18",
  },
];

export const MOCK_STORIES: Story[] = [
  {
    id: "story_1",
    title: "Alumni Chapter Establishes Science Lab Library at Campus",
    type: "news",
    excerpt: "Batches of 2004–2012 came together to donate 1,200 science and competitive exam books to the school central library.",
    content: "During the recent winter reunion, representatives from eight graduating batches officially handed over a curated collection of reference books, Olympiad material, and upgraded computer science resources to Principal Madam.\n\nSpecial thanks to the local chapter steering committee for coordinating the logistics across Mysuru and Bengaluru.",
    author: {
      id: "mem_2",
      name: "Rohit Kulkarni",
      batch: "Class of 2008",
      role: "Assistant Commissioner",
      avatar: "",
    },
    audience: "school",
    publishedAt: "Nov 3, 2026",
    readTime: "3 min read",
  },
  {
    id: "story_2",
    title: "Sneha Bharadwaj ('12) Featured in National Agritech 30 Under 30",
    type: "achievement",
    excerpt: "Her venture AgriNext Labs has brought AI-based soil nutrient profiling to over 4,500 coffee planters in Kodagu and Hassan.",
    content: "We are thrilled to congratulate our alumni Sneha Bharadwaj (Batch of 2012, Udaygiri House) on being recognized by the Ministry of Agriculture for pioneering affordable soil health kits for smallholder farmers.\n\nSneha credits her early curiosity to the JNV science exhibitions held in 2010.",
    author: {
      id: "mem_current",
      name: "Poorvith Devang",
      batch: "Class of 2014",
      role: "Lead Software Architect",
      avatar: "",
    },
    audience: "all",
    publishedAt: "Oct 28, 2026",
    readTime: "2 min read",
  },
  {
    id: "story_3",
    title: "Memories of Morning Assemblies and House Cross-Country Runs",
    type: "memoir",
    excerpt: "Reflecting on the crisp 5:45 AM whistle, the morning jogging track around the eucalyptus grove, and twenty-year friendships.",
    content: "No matter where in the world our careers take us, the discipline and companionship forged in our hostel dormitories remain the single most defining influence on who we are.",
    author: {
      id: "mem_5",
      name: "Deepa Nayak",
      batch: "Class of 2007",
      role: "Advocate, High Court",
      avatar: "",
    },
    audience: "school",
    publishedAt: "Oct 15, 2026",
    readTime: "4 min read",
  },
];

export const MOCK_JOBS: Job[] = [
  {
    id: "job_1",
    title: "Senior Full-Stack Engineer (Next.js & Go)",
    company: "AgriNext Labs",
    city: "Bengaluru (Hybrid)",
    type: "Full-time",
    experienceLevel: "Mid-Senior (4-8 yrs)",
    description: "Looking for an experienced engineer to lead our sensor telemetry platform. Strong hands-on experience with TypeScript, Next.js, and Postgres required. Navodaya alumni referrals get priority interviews.",
    applyMethod: "careers@agrinext.io",
    postedBy: {
      id: "mem_3",
      name: "Sneha Bharadwaj",
      batch: "Class of 2012",
      role: "Founder & CEO",
    },
    postedAt: "Nov 4, 2026",
  },
  {
    id: "job_2",
    title: "Pediatric Resident / Clinical Fellow",
    company: "Apollo Specialty Hospitals",
    city: "Mysuru",
    type: "Full-time",
    experienceLevel: "1-3 years",
    description: "Opening for junior clinical fellows in Department of Pediatrics. Opportunity to work closely with senior consultants on outpatient and neonatal care.",
    applyMethod: "ananya.hegde@apollohospitals.com",
    postedBy: {
      id: "mem_1",
      name: "Dr. Ananya Hegde",
      batch: "Class of 2010",
      role: "Consultant Pediatrician",
    },
    postedAt: "Oct 30, 2026",
  },
  {
    id: "job_3",
    title: "Remote Devops & Cloud Architect",
    company: "Fascinateit Labs",
    city: "Remote",
    type: "Full-time",
    experienceLevel: "Mid-Senior (4-8 yrs)",
    description: "Managing edge compute networks, container orchestrations, and automated deployment pipelines for community cloud infrastructures.",
    applyMethod: "hiring@fascinateit.com",
    postedBy: {
      id: "mem_current",
      name: "Poorvith Devang",
      batch: "Class of 2014",
      role: "Lead Software Architect",
    },
    postedAt: "Nov 1, 2026",
  },
];

export const MOCK_EVENTS: EventItem[] = [
  {
    id: "event_1",
    title: "MANAVI Annual Winter Alumni Reunion 2026",
    description: "The grand annual gathering on the school quadrangle. Batch felicitation for Silver Jubilee (Batch of 2001) and Decennial (Batch of 2016). Lunch and cultural evening in the Multipurpose Hall.",
    venue: "Main Quadrangle & Assembly Grounds, Campus",
    city: "Campus Grounds",
    date: "Dec 20, 2026",
    time: "10:00 AM – 5:00 PM IST",
    startsAt: "2026-12-20T10:00:00+05:30",
    host: {
      name: "Rohit Kulkarni",
      batch: "Class of 2008",
    },
    audience: "all",
    goingCount: 142,
    maybeCount: 38,
    userRsvp: "going",
    questions: [
      {
        id: "q_1",
        author: "Kiran Prasad",
        batch: "Class of 2016",
        question: "Is overnight dormitory stay permitted for outstation batchmates traveling from Hyderabad/Mumbai?",
        answer: "Yes, Guest House rooms and Senior Dorm A have been reserved. Please RSVP 'Going' so the committee can assign beds.",
      },
    ],
  },
  {
    id: "event_2",
    title: "Bengaluru Chapter Breakfast Meetup",
    description: "An informal morning walk and breakfast at Cubbon Park. Ideal for alumni working in technology, legal, civil services and healthcare to connect in person.",
    venue: "Cubbon Park / Airlines Hotel",
    city: "Bengaluru",
    date: "Nov 22, 2026",
    time: "8:00 AM – 10:30 AM IST",
    startsAt: "2026-11-22T08:00:00+05:30",
    host: {
      name: "Poorvith Devang",
      batch: "Class of 2014",
    },
    audience: "school",
    goingCount: 28,
    maybeCount: 14,
    userRsvp: "going",
  },
];

export const MOCK_THREADS: MessageThread[] = [
  {
    id: "th_1",
    participant: {
      id: "mem_2",
      name: "Rohit Kulkarni",
      batch: "Class of 2008",
      role: "Assistant Commissioner",
      city: "Shivamogga",
      avatar: "",
    },
    lastMessage: "The district guest house clearance is confirmed for the Dec 20 alumni meet.",
    lastMessageAt: "10:45 AM",
    unreadCount: 1,
    messages: [
      {
        id: "m_1",
        senderId: "mem_2",
        text: "Namaskara Poorvith, hope you're doing well in Bengaluru.",
        timestamp: "Yesterday, 4:15 PM",
        isSelf: false,
      },
      {
        id: "m_2",
        senderId: "mem_current",
        text: "Namaskara Rohit Anna! All good here. How are the campus permissions looking for the winter meet?",
        timestamp: "Yesterday, 5:02 PM",
        isSelf: true,
      },
      {
        id: "m_3",
        senderId: "mem_2",
        text: "The district guest house clearance is confirmed for the Dec 20 alumni meet. We are expecting over 140 alumni.",
        timestamp: "10:45 AM",
        isSelf: false,
      },
    ],
  },
  {
    id: "th_2",
    participant: {
      id: "mem_3",
      name: "Sneha Bharadwaj",
      batch: "Class of 2012",
      role: "Founder & CEO, AgriNext Labs",
      city: "Bengaluru",
      avatar: "",
    },
    lastMessage: "Thanks for reviewing the job posting draft, it's live on the jobs board now.",
    lastMessageAt: "Nov 5",
    unreadCount: 0,
    messages: [
      {
        id: "m_4",
        senderId: "mem_3",
        text: "Hi Poorvith, I just submitted a job post for a senior engineer at AgriNext.",
        timestamp: "Nov 5, 2:30 PM",
        isSelf: false,
      },
      {
        id: "m_5",
        senderId: "mem_current",
        text: "Approved it from the admin queue right away! It has great visibility.",
        timestamp: "Nov 5, 2:45 PM",
        isSelf: true,
      },
      {
        id: "m_6",
        senderId: "mem_3",
        text: "Thanks for reviewing the job posting draft, it's live on the jobs board now.",
        timestamp: "Nov 5, 3:10 PM",
        isSelf: false,
      },
    ],
  },
];
