/**
 * CompX Orbit — CV & Resume Engine Data Models & Pre-filled Templates
 */

export interface PersonalInfo {
  fullName: string;
  jobTitle: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  linkedin: string;
  github: string;
  bio: string;
  photoUrl: string;
}

export interface WorkExperience {
  id: string;
  position: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  highlights: string[];
}

export interface Education {
  id: string;
  degree: string;
  institution: string;
  location: string;
  startYear: string;
  endYear: string;
  gpa?: string;
}

export interface SkillItem {
  name: string;
  level: "Beginner" | "Intermediate" | "Advanced" | "Expert";
}

export interface ProjectItem {
  id: string;
  name: string;
  role: string;
  link: string;
  description: string;
  techStack: string;
}

export interface CertificateItem {
  id: string;
  name: string;
  issuer: string;
  date: string;
}

export interface LanguageItem {
  id: string;
  language: string;
  proficiency: "Native" | "Fluent" | "Professional" | "Conversational";
}

export type CvTemplateId = "modern" | "executive" | "minimalist-ats" | "sidebar" | "creative-tech";

export interface CvData {
  templateId: CvTemplateId;
  themeColor: string;
  fontFamily: string;
  showPhoto: boolean;
  personal: PersonalInfo;
  experience: WorkExperience[];
  education: Education[];
  skills: SkillItem[];
  projects: ProjectItem[];
  certificates: CertificateItem[];
  languages: LanguageItem[];
}

export const CV_TEMPLATES: { id: CvTemplateId; name: string; tag: string; desc: string }[] = [
  {
    id: "modern",
    name: "Modern Orbit",
    tag: "Most Popular",
    desc: "Clean 2-column layout with header accent, skill pills, and stylish timeline.",
  },
  {
    id: "sidebar",
    name: "Elegant Sidebar",
    tag: "Creative & Agency",
    desc: "Dedicated dark left sidebar for contact & skills, right column for career milestones.",
  },
  {
    id: "minimalist-ats",
    name: "ATS-Optimized Clean",
    tag: "High Job-Scan Rate",
    desc: "Strict single-column layout with zero table traps, optimized for recruiter ATS parsers.",
  },
  {
    id: "executive",
    name: "Executive Corporate",
    tag: "Leadership & Senior",
    desc: "Refined typography, elegant section dividers, and formal hierarchy for senior roles.",
  },
  {
    id: "creative-tech",
    name: "Tech & Startup",
    tag: "Modern Portfolio",
    desc: "High-impact headers with project metrics, GitHub/portfolio callouts, and skill tags.",
  },
];

export const THEME_COLORS = [
  { name: "Orbit Emerald", hex: "#10b981" },
  { name: "CompX Green", hex: "#3cff5f" },
  { name: "Electric Blue", hex: "#2563eb" },
  { name: "Royal Purple", hex: "#7c3aed" },
  { name: "Crimson Rose", hex: "#e11d48" },
  { name: "Sunset Amber", hex: "#d97706" },
  { name: "Slate Corporate", hex: "#475569" },
  { name: "Onyx Dark", hex: "#1e293b" },
];

export const CV_FONTS = [
  { name: "Inter (Modern Sans)", value: "Inter, sans-serif" },
  { name: "Roboto (Clean Tech)", value: "Roboto, sans-serif" },
  { name: "Georgia (Classic Serif)", value: "Georgia, serif" },
  { name: "Arial (Standard Universal)", value: "Arial, sans-serif" },
  { name: "Trebuchet MS (Dynamic)", value: "'Trebuchet MS', sans-serif" },
];

/* ────────────────────────────────────────────────────────────────────────────
   PRE-FILLED SAMPLE PROFILES
   ──────────────────────────────────────────────────────────────────────────── */

export const SAMPLE_MOTION_DESIGNER: CvData = {
  templateId: "modern",
  themeColor: "#10b981",
  fontFamily: "Inter, sans-serif",
  showPhoto: true,
  personal: {
    fullName: "Alex Rivera",
    jobTitle: "Senior Motion Designer & VFX Artist",
    email: "alex.rivera.motion@example.com",
    phone: "+1 (555) 382-9014",
    location: "Los Angeles, CA · Remote",
    website: "https://alexrivera.design",
    linkedin: "linkedin.com/in/alex-rivera-motion",
    github: "github.com/alexrivera-fx",
    photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
    bio: "Passionate Senior Motion Designer with 6+ years creating commercial broadcast graphics, kinetic typography, and 3D product animations for global tech brands. Specialist in Adobe After Effects, Premiere Pro, and Cinema 4D pipelines.",
  },
  experience: [
    {
      id: "exp-1",
      position: "Lead Motion Designer",
      company: "Apex Creative Agency",
      location: "San Francisco, CA",
      startDate: "2022",
      endDate: "Present",
      isCurrent: true,
      highlights: [
        "Directed motion branding system for 14 major SaaS client product launches, generating 24M+ video views.",
        "Engineered automated After Effects Mogrt templates that reduced team post-production turnaround time by 45%.",
        "Spearheaded 3D product visualizations and character kinetic typography for broadcast national TV commercials.",
      ],
    },
    {
      id: "exp-2",
      position: "Motion Graphics Artist & Video Editor",
      company: "Horizon Media Studio",
      location: "Austin, TX",
      startDate: "2019",
      endDate: "2022",
      isCurrent: false,
      highlights: [
        "Delivered 120+ promotional video assets for YouTube, Instagram Reels, and digital billboard campaigns.",
        "Collaborated with creative directors to storyboard, animate, and sound-design interactive UI micro-animations.",
        "Optimized render pipelines with multi-machine Adobe render farms, reducing export delays by 35%.",
      ],
    },
  ],
  education: [
    {
      id: "edu-1",
      degree: "B.F.A. in Digital Media Arts & Animation",
      institution: "California Institute of the Arts",
      location: "Valencia, CA",
      startYear: "2015",
      endYear: "2019",
      gpa: "3.9 / 4.0",
    },
  ],
  skills: [
    { name: "After Effects", level: "Expert" },
    { name: "Premiere Pro", level: "Expert" },
    { name: "Cinema 4D / Octane", level: "Advanced" },
    { name: "Kinetic Typography", level: "Expert" },
    { name: "Color Grading (DaVinci)", level: "Advanced" },
    { name: "Sound Design & Mix", level: "Intermediate" },
    { name: "Figma / UI Animation", level: "Advanced" },
    { name: "Storyboarding", level: "Expert" },
  ],
  projects: [
    {
      id: "proj-1",
      name: "CompX Orbit Brand Motion Identity",
      role: "Lead Animator",
      link: "https://compxorbit.com",
      description: "Complete kinetic identity system including 3D logo resolves, exploder animations, and UI transitions.",
      techStack: "After Effects · C4D · Redshift",
    },
    {
      id: "proj-2",
      name: "Cyberpunk 2077 Fan Kinetic Trailer",
      role: "Solo Creator",
      link: "https://vimeo.com/example",
      description: "Viral 90-second typography sequence featuring stylized GLSL glitch shaders and custom sound design.",
      techStack: "After Effects · Premiere Pro",
    },
  ],
  certificates: [
    {
      id: "cert-1",
      name: "Adobe Certified Professional in Visual Effects",
      issuer: "Adobe Inc.",
      date: "2023",
    },
    {
      id: "cert-2",
      name: "Maxon Cinema 4D Certified Specialist",
      issuer: "Maxon",
      date: "2022",
    },
  ],
  languages: [
    { id: "lang-1", language: "English", proficiency: "Native" },
    { id: "lang-2", language: "Spanish", proficiency: "Fluent" },
  ],
};

export const SAMPLE_SOFTWARE_ENGINEER: CvData = {
  templateId: "minimalist-ats",
  themeColor: "#2563eb",
  fontFamily: "Roboto, sans-serif",
  showPhoto: false,
  personal: {
    fullName: "Marcus Chen",
    jobTitle: "Senior Full-Stack Software Engineer",
    email: "marcus.chen.dev@example.com",
    phone: "+1 (415) 890-2341",
    location: "Seattle, WA · Open to Remote",
    website: "https://marcuschen.dev",
    linkedin: "linkedin.com/in/marcus-chen-code",
    github: "github.com/marcuschen",
    photoUrl: "",
    bio: "Full-Stack Software Engineer with 7+ years of experience architecting scalable distributed web platforms, high-throughput REST/GraphQL APIs, and real-time streaming services. Deep expertise in TypeScript, Next.js, Node.js, and Cloud Infrastructure.",
  },
  experience: [
    {
      id: "exp-1",
      position: "Staff Software Engineer",
      company: "CloudScale Systems",
      location: "Seattle, WA",
      startDate: "2021",
      endDate: "Present",
      isCurrent: true,
      highlights: [
        "Architected real-time WebSocket telemetry engine handling 120,000 req/sec with sub-20ms p99 latency.",
        "Migrated legacy monolithic service to Next.js 14 and Cloudflare Workers, trimming server costs by $180,000/yr.",
        "Mentored team of 9 frontend & backend engineers through daily code reviews and CI/CD automation.",
      ],
    },
    {
      id: "exp-2",
      position: "Senior Frontend Engineer",
      company: "Veloce Technologies",
      location: "San Jose, CA",
      startDate: "2018",
      endDate: "2021",
      isCurrent: false,
      highlights: [
        "Led front-end development of enterprise analytics dashboard used daily by 45,000 active business accounts.",
        "Built modular component library with Tailwind CSS & TypeScript achieving 98% unit test coverage in Jest.",
        "Reduced Lighthouse Web Vitals LCP from 3.8s to 0.9s with server-rendered streaming and edge caching.",
      ],
    },
  ],
  education: [
    {
      id: "edu-1",
      degree: "B.S. in Computer Science",
      institution: "University of Washington",
      location: "Seattle, WA",
      startYear: "2014",
      endYear: "2018",
      gpa: "3.85 / 4.0",
    },
  ],
  skills: [
    { name: "TypeScript / JavaScript", level: "Expert" },
    { name: "React & Next.js", level: "Expert" },
    { name: "Node.js & Express", level: "Expert" },
    { name: "PostgreSQL & Supabase", level: "Advanced" },
    { name: "Docker & Kubernetes", level: "Advanced" },
    { name: "Redis & WebSockets", level: "Advanced" },
    { name: "AWS & Cloudflare", level: "Advanced" },
    { name: "GraphQL & REST APIs", level: "Expert" },
  ],
  projects: [
    {
      id: "proj-1",
      name: "FastCache Distributed Key-Value Store",
      role: "Creator & Maintainer",
      link: "https://github.com/example/fastcache",
      description: "High-speed in-memory caching engine written in Go with Raft consensus algorithm. 2.4k GitHub stars.",
      techStack: "Go · Docker · gRPC",
    },
  ],
  certificates: [
    {
      id: "cert-1",
      name: "AWS Certified Solutions Architect – Associate",
      issuer: "Amazon Web Services",
      date: "2023",
    },
  ],
  languages: [
    { id: "lang-1", language: "English", proficiency: "Native" },
    { id: "lang-2", language: "Mandarin Chinese", proficiency: "Fluent" },
  ],
};

export const SAMPLE_CREATIVE_DIRECTOR: CvData = {
  templateId: "sidebar",
  themeColor: "#7c3aed",
  fontFamily: "Inter, sans-serif",
  showPhoto: true,
  personal: {
    fullName: "Elena Rostova",
    jobTitle: "Creative Director & Brand Strategist",
    email: "elena.rostova@example.com",
    phone: "+44 20 7946 0912",
    location: "London, UK",
    website: "https://elenarostova.co.uk",
    linkedin: "linkedin.com/in/elena-rostova-creative",
    github: "",
    photoUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80",
    bio: "Award-winning Creative Director with 9+ years directing multi-channel advertising campaigns, high-end video productions, and luxury rebrands. Proven track record leading multidisciplinary teams of art directors, animators, and copywriters.",
  },
  experience: [
    {
      id: "exp-1",
      position: "Creative Director",
      company: "Vanguard Studio London",
      location: "London, UK",
      startDate: "2020",
      endDate: "Present",
      isCurrent: true,
      highlights: [
        "Head of Creative managing 16 designers, directors, and 3D artists across London and New York offices.",
        "Spearheaded international brand campaign for major luxury apparel brand, delivering 420% return on ad spend.",
        "Awarded D&AD Yellow Pencil 2023 for Best Commercial Craft in Digital Motion Design.",
      ],
    },
  ],
  education: [
    {
      id: "edu-1",
      degree: "M.A. in Creative Direction & Advertising",
      institution: "Royal College of Art",
      location: "London, UK",
      startYear: "2013",
      endYear: "2015",
    },
  ],
  skills: [
    { name: "Creative Strategy", level: "Expert" },
    { name: "Brand Architecture", level: "Expert" },
    { name: "Art Direction", level: "Expert" },
    { name: "Video Production", level: "Advanced" },
    { name: "Pitch Presentations", level: "Expert" },
    { name: "Team Mentorship", level: "Expert" },
  ],
  projects: [
    {
      id: "proj-1",
      name: "Monolith Luxury Brand Film",
      role: "Executive Creative Director",
      link: "https://vanguardlondon.com/monolith",
      description: "60-second cinematic film combining live 35mm footage and photo-real CGI, screened at Cannes Lions.",
      techStack: "Direction · Cinema 4D · Alexa Mini LF",
    },
  ],
  certificates: [
    {
      id: "cert-1",
      name: "D&AD Creative Leadership Certification",
      issuer: "D&AD",
      date: "2022",
    },
  ],
  languages: [
    { id: "lang-1", language: "English", proficiency: "Native" },
    { id: "lang-2", language: "French", proficiency: "Professional" },
  ],
};

export const BLANK_CV_DATA: CvData = {
  templateId: "modern",
  themeColor: "#10b981",
  fontFamily: "Inter, sans-serif",
  showPhoto: false,
  personal: {
    fullName: "Your Name",
    jobTitle: "Your Professional Title",
    email: "your.email@example.com",
    phone: "+1 (555) 000-0000",
    location: "City, Country",
    website: "",
    linkedin: "",
    github: "",
    photoUrl: "",
    bio: "Write a brief compelling summary of your professional background, key achievements, and core expertise...",
  },
  experience: [
    {
      id: "exp-1",
      position: "Job Position",
      company: "Company Name",
      location: "City, State",
      startDate: "2022",
      endDate: "Present",
      isCurrent: true,
      highlights: ["Key achievement or responsibility in this role.", "Another major project or metric milestone."],
    },
  ],
  education: [
    {
      id: "edu-1",
      degree: "Degree / Qualification",
      institution: "University / School",
      location: "City, Country",
      startYear: "2018",
      endYear: "2022",
    },
  ],
  skills: [
    { name: "Core Skill 1", level: "Expert" },
    { name: "Core Skill 2", level: "Advanced" },
    { name: "Core Skill 3", level: "Intermediate" },
  ],
  projects: [],
  certificates: [],
  languages: [{ id: "lang-1", language: "English", proficiency: "Native" }],
};
