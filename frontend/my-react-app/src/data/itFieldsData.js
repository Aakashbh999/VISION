import {
  Code,
  Smartphone,
  Terminal,
  Shield,
  BarChart,
  Cloud,
  Brain,
  Brush,
  GitBranch,
  Bug,
  Megaphone,
  Router,
  Database,
  ClipboardList,
  Bitcoin,
} from "lucide-react";

export const itFieldsData = [
  {
    id: 1,
    slug: "web-development",
    name: "Web Development",
    shortDescription:
      "Focuses on building websites and web applications using modern technologies and frameworks.",
    demand: "High",
    icon: Code,
    motivation:
      "Ideal for students who enjoy building interactive digital experiences and seeing real-time results.",
    skills: [
      "HTML/CSS",
      "JavaScript",
      "React/Angular/Vue",
      "Node.js/PHP/Python",
    ],
    careerPaths: [
      "Frontend Developer",
      "Backend Developer",
      "Full Stack Developer",
      "WordPress Developer",
    ],
    salaryRange: "NRs 40,000 – 1,20,000",
    topCompanies: ["Leapfrog", "Deerwalk", "Cotiviti", "Verisk", "F1Soft"],
    nepalDemandNote:
      "High demand in Kathmandu Valley, especially in software companies and startups.",
  },
  {
    id: 2,
    slug: "mobile-app-development",
    name: "Mobile App Development",
    shortDescription:
      "Involves creating applications for smartphones and tablets across Android and iOS platforms.",
    demand: "High",
    icon: Smartphone,
    motivation:
      "A strong choice if you enjoy building applications people use daily on their phones.",
    skills: ["Java/Kotlin", "Swift", "Flutter", "React Native"],
    careerPaths: [
      "Android Developer",
      "iOS Developer",
      "Cross-Platform Developer",
      "Mobile QA",
    ],
    salaryRange: "NRs 45,000 – 1,30,000",
    topCompanies: [
      "Leapfrog",
      "Deerwalk",
      "Young Innovations",
      "Gandaki Technologies",
    ],
    nepalDemandNote:
      "Growing demand for cross-platform apps in Nepali startups.",
  },
  {
    id: 3,
    slug: "software-engineering",
    name: "Software Engineering",
    shortDescription:
      "Builds large-scale software solutions using engineering principles and best practices.",
    demand: "High",
    icon: Terminal,
    motivation:
      "Perfect for students who like solving complex problems through systematic design.",
    skills: ["OOP", "Data Structures", "System Design", "Version Control"],
    careerPaths: ["Software Engineer", "Systems Architect", "Technical Lead"],
    salaryRange: "NRs 50,000 – 1,50,000",
    topCompanies: ["Leapfrog", "Cotiviti", "Deerwalk", "CloudFactory"],
    nepalDemandNote:
      "Core roles in almost every IT company; strong career growth.",
  },
  {
    id: 4,
    slug: "cyber-security",
    name: "Cyber Security",
    shortDescription:
      "Protects systems, networks, and data from cyber threats and unauthorized access.",
    demand: "High",
    icon: Shield,
    motivation:
      "Great for those who enjoy ethical hacking, defense strategies, and digital safety.",
    skills: [
      "Network Security",
      "Ethical Hacking",
      "Cryptography",
      "Incident Response",
    ],
    careerPaths: [
      "Security Analyst",
      "Penetration Tester",
      "Security Consultant",
      "SOC Analyst",
    ],
    salaryRange: "NRs 60,000 – 1,80,000",
    topCompanies: ["NIC Asia Bank", "WorldLink", "Vianet", "CG Computers"],
    nepalDemandNote:
      "Increasing demand due to digital transformation in banking and government.",
  },
  {
    id: 5,
    slug: "data-science",
    name: "Data Science",
    shortDescription:
      "Extracts insights from data to solve business problems using statistics and ML.",
    demand: "High",
    icon: BarChart,
    motivation:
      "Suited for students who love finding patterns in data and making predictions.",
    skills: ["Python", "SQL", "Machine Learning", "Data Visualization"],
    careerPaths: [
      "Data Analyst",
      "Data Scientist",
      "ML Engineer",
      "Business Intelligence",
    ],
    salaryRange: "NRs 60,000 – 1,50,000",
    topCompanies: ["Fusemachines", "Leapfrog", "CloudFactory", "Cotiviti"],
    nepalDemandNote:
      "Emerging field with strong potential in fintech and e-commerce.",
  },
  {
    id: 6,
    slug: "cloud-computing",
    name: "Cloud Computing",
    shortDescription:
      "Manages scalable, on-demand computing resources over the internet.",
    demand: "High",
    icon: Cloud,
    motivation:
      "Ideal if you're interested in building infrastructure that powers modern applications.",
    skills: ["AWS/Azure/GCP", "Docker", "Kubernetes", "DevOps"],
    careerPaths: ["Cloud Engineer", "DevOps Engineer", "Cloud Architect"],
    salaryRange: "NRs 70,000 – 2,00,000",
    topCompanies: ["Leapfrog", "Deerwalk", "Cotiviti", "Braindigit"],
    nepalDemandNote:
      "High-value skills; many Nepali companies are migrating to cloud.",
  },
  {
    id: 7,
    slug: "artificial-intelligence",
    name: "Artificial Intelligence",
    shortDescription:
      "Builds systems that mimic human intelligence and automate decision-making.",
    demand: "High",
    icon: Brain,
    motivation:
      "Best for students fascinated by machines that can learn, reason, and adapt.",
    skills: ["Python", "TensorFlow/PyTorch", "NLP", "Computer Vision"],
    careerPaths: [
      "AI Engineer",
      "ML Engineer",
      "Research Scientist",
      "NLP Engineer",
    ],
    salaryRange: "NRs 80,000 – 2,50,000",
    topCompanies: ["Fusemachines", "Leapfrog", "Paaila Technology", "Cotiviti"],
    nepalDemandNote: "Niche but growing; opportunities in robotics and NLP.",
  },
  {
    id: 8,
    slug: "ui-ux-design",
    name: "UI/UX Design",
    shortDescription:
      "Designs user-friendly interfaces and seamless digital experiences.",
    demand: "Medium",
    icon: Brush,
    motivation:
      "A great fit if you care about how products look and feel from a user's perspective.",
    skills: ["Figma", "Adobe XD", "User Research", "Wireframing"],
    careerPaths: [
      "UI Designer",
      "UX Designer",
      "Product Designer",
      "UX Researcher",
    ],
    salaryRange: "NRs 35,000 – 1,00,000",
    topCompanies: [
      "Leapfrog",
      "Deerwalk",
      "Young Innovations",
      "Gandaki Technologies",
    ],
    nepalDemandNote: "Essential in product-based companies; steady demand.",
  },
  {
    id: 9,
    slug: "devops",
    name: "DevOps",
    shortDescription:
      "Integrates development, operations, and security for faster reliable delivery.",
    demand: "Medium",
    icon: GitBranch,
    motivation:
      "Excellent for students who enjoy automation, collaboration, and continuous improvement.",
    skills: [
      "Linux",
      "CI/CD",
      "Docker",
      "Kubernetes",
      "Infrastructure as Code",
    ],
    careerPaths: [
      "DevOps Engineer",
      "Site Reliability Engineer",
      "Automation Engineer",
    ],
    salaryRange: "NRs 60,000 – 1,80,000",
    topCompanies: ["Leapfrog", "Cotiviti", "CloudFactory", "Deerwalk"],
    nepalDemandNote: "Rapidly growing as companies adopt agile and cloud.",
  },
  {
    id: 10,
    slug: "quality-assurance",
    name: "Quality Assurance (QA)",
    shortDescription:
      "Ensures software reliability through systematic testing and validation.",
    demand: "Medium",
    icon: Bug,
    motivation:
      "Suited for detail-oriented students who enjoy breaking things to make them better.",
    skills: [
      "Manual Testing",
      "Automation (Selenium)",
      "Test Planning",
      "Bug Tracking",
    ],
    careerPaths: ["QA Engineer", "Test Automation Engineer", "QA Lead"],
    salaryRange: "NRs 30,000 – 80,000",
    topCompanies: ["Leapfrog", "Deerwalk", "Cotiviti", "F1Soft"],
    nepalDemandNote:
      "Essential role in all software companies; good entry-level option.",
  },
  {
    id: 11,
    slug: "digital-marketing",
    name: "Digital Marketing",
    shortDescription:
      "Promotes products and services through online channels and data-driven campaigns.",
    demand: "Medium",
    icon: Megaphone,
    motivation:
      "Ideal for creative students who enjoy storytelling and audience engagement.",
    skills: [
      "SEO/SEM",
      "Social Media",
      "Google Analytics",
      "Content Marketing",
    ],
    careerPaths: [
      "Digital Marketing Specialist",
      "SEO Analyst",
      "Social Media Manager",
      "Growth Hacker",
    ],
    salaryRange: "NRs 25,000 – 70,000",
    topCompanies: ["Esewa", "Daraz", "SastoDeal", "HamroBazar"],
    nepalDemandNote: "High demand in e-commerce and media agencies.",
  },
  {
    id: 12,
    slug: "networking-system-admin",
    name: "Networking & System Admin",
    shortDescription:
      "Manages computer networks, servers, and IT infrastructure.",
    demand: "Medium",
    icon: Router,
    motivation:
      "Great for students who like keeping systems connected, secure, and running smoothly.",
    skills: ["CCNA", "Linux/Windows Server", "Firewall", "Network Security"],
    careerPaths: [
      "Network Engineer",
      "System Administrator",
      "IT Support Engineer",
    ],
    salaryRange: "NRs 30,000 – 90,000",
    topCompanies: ["WorldLink", "Vianet", "Ncell", "NTA"],
    nepalDemandNote:
      "Steady demand in ISPs, banks, and corporate IT departments.",
  },
  {
    id: 13,
    slug: "database-management",
    name: "Database Management",
    shortDescription:
      "Organizes, secures, and optimises data storage and retrieval.",
    demand: "Medium",
    icon: Database,
    motivation:
      "Perfect for students who enjoy structuring data and ensuring it's always available.",
    skills: [
      "SQL",
      "Oracle/MySQL/PostgreSQL",
      "Database Design",
      "Performance Tuning",
    ],
    careerPaths: ["Database Administrator", "Data Engineer", "SQL Developer"],
    salaryRange: "NRs 35,000 – 1,00,000",
    topCompanies: ["Cotiviti", "Deerwalk", "Leapfrog", "NIC Asia"],
    nepalDemandNote: "Core skill in data-driven organizations.",
  },
  {
    id: 14,
    slug: "it-project-management",
    name: "IT Project Management",
    shortDescription:
      "Oversees planning, execution, and delivery of technology projects.",
    demand: "Medium",
    icon: ClipboardList,
    motivation:
      "A strong fit if you like leading teams, managing timelines, and delivering results.",
    skills: ["Agile/Scrum", "JIRA", "Risk Management", "Client Communication"],
    careerPaths: [
      "Project Coordinator",
      "IT Project Manager",
      "Scrum Master",
      "Product Manager",
    ],
    salaryRange: "NRs 60,000 – 1,50,000",
    topCompanies: ["Leapfrog", "Deerwalk", "Cotiviti", "Verisk"],
    nepalDemandNote: "Experienced professionals are highly valued.",
  },
  {
    id: 15,
    slug: "blockchain",
    name: "Blockchain",
    shortDescription:
      "Builds decentralized ledgers and secure, transparent record systems.",
    demand: "Low",
    icon: Bitcoin,
    motivation:
      "For students excited about the future of trust, transparency, and decentralized applications.",
    skills: ["Solidity", "Ethereum", "Smart Contracts", "Web3.js"],
    careerPaths: [
      "Blockchain Developer",
      "Smart Contract Engineer",
      "Cryptocurrency Analyst",
    ],
    salaryRange: "NRs 70,000 – 2,00,000",
    topCompanies: ["Fusemachines", "Blockchain Nepal", "Remitano", "Startups"],
    nepalDemandNote:
      "Nascent field, but growing interest in fintech and remittance.",
  },
];
