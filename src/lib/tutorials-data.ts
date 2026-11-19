// ============================================================================
// COMPX ORBIT STUDIO — SECTION-WISE TUTORIALS DATA
// ============================================================================
// 💡 How to add a new tutorial video:
// 1. Find the section below (e.g. morph, color, animation, arrow, carousel, etc.)
// 2. Change `isReady: true`
// 3. Paste your YouTube Video ID in `youtubeId: "YOUR_YOUTUBE_ID"`
//    (Example: For https://youtu.be/wLxPWqRVGlQ, the ID is "wLxPWqRVGlQ")
// 4. Optionally update `duration` (e.g. "12:45") and `title`.
// ============================================================================

export type TutorialSectionKey =
  | "all"
  | "complete"
  | "tools"
  | "studio"
  | "motion-lab"
  | "morph"
  | "color"
  | "animation"
  | "arrow"
  | "carousel"
  | "comps"
  | "sfx"
  | "mogrt"
  | "license";

export interface TutorialSectionMeta {
  id: TutorialSectionKey;
  name: string;
  banglaName: string;
  iconName: string;
  badgeColor: string;
  tagline: string;
  description: string;
}

export interface TutorialVideo {
  id: string;
  sectionKey: Exclude<TutorialSectionKey, "all">;
  sectionName: string;
  title: string;
  banglaTitle?: string;
  description: string;
  youtubeId?: string; // YouTube video ID (e.g. "wv4jzxJoqK0")
  duration?: string; // e.g. "13:02" or "Coming Soon"
  level: "Beginner" | "Intermediate" | "Advanced" | "All Levels";
  isReady: boolean; // Set true when video is recorded and live on YouTube
  featured?: boolean; // Highlight as main/recommended video
  topics: string[]; // Key feature bullet points covered
  badge?: string; // e.g. "Tools Masterclass", "Complete Guide", "In Production"
}

// ----------------------------------------------------------------------------
// Complete Tutorials + 11 Extension Sections Metadata + License Setup
// ----------------------------------------------------------------------------
export const TUTORIAL_SECTIONS: TutorialSectionMeta[] = [
  {
    id: "complete",
    name: "Complete Tutorials",
    banglaName: "কমপ্লিট টিউটোরিয়াল",
    iconName: "GraduationCap",
    badgeColor: "from-emerald-500/20 to-emerald-500/5 text-emerald-400 border-emerald-500/30",
    tagline: "All-in-One Extension Walkthroughs",
    description: "অরবিট স্টুডিওর আগের সকল ফুল ও কমপ্লিট ওভারভিউ টিউটোরিয়াল। পুরো এক্সটেনশন কিভাবে একসাথে কাজ করে তা বিস্তারিত শিখুন।",
  },
  {
    id: "tools",
    name: "Tools Tab",
    banglaName: "টুলস ট্যাব",
    iconName: "Wrench",
    badgeColor: "from-emerald-500/20 to-emerald-500/5 text-emerald-400 border-emerald-500/30",
    tagline: "Essential Workflow & Layer Tools",
    description: "9-point anchor point positioning, 1-click alignments, keyframe reverse, timeline in/out trimming, and project cleaning.",
  },
  {
    id: "studio",
    name: "Studio Tab",
    banglaName: "স্টুডিও ট্যাব",
    iconName: "Sparkles",
    badgeColor: "from-cyan-500/20 to-cyan-500/5 text-cyan-400 border-cyan-500/30",
    tagline: "Captions, Text & Native FX",
    description: "Dynamic number counters, kinetic text exploder, auto captions, and 1-click native effects like Deep Glow and Shadow Studio.",
  },
  {
    id: "motion-lab",
    name: "Motion Lab",
    banglaName: "মোশন ল্যাব",
    iconName: "Activity",
    badgeColor: "from-lime-500/20 to-lime-500/5 text-lime-400 border-lime-500/30",
    tagline: "Visual Graph & Bezier Editor",
    description: "Visual speed & influence graph editor, draggable curve handles, bounce physics, and reusable easing curves.",
  },
  {
    id: "morph",
    name: "Morph Engine",
    banglaName: "মর্ফ ইঞ্জিন",
    iconName: "Layers",
    badgeColor: "from-purple-500/20 to-purple-500/5 text-purple-400 border-purple-500/30",
    tagline: "Super Morph & Shape Transitions",
    description: "Seamless path-to-path morphing, vector shape transformation, mask vertex matching, and smooth vector morphs.",
  },
  {
    id: "color",
    name: "Color Palettes",
    banglaName: "কালার প্যালেট",
    iconName: "Palette",
    badgeColor: "from-pink-500/20 to-pink-500/5 text-pink-400 border-pink-500/30",
    tagline: "Live Swatches & 1-Click Recoloring",
    description: "Curated color schemes, 1-click project-wide auto recoloring, contrast checkers, and live swatch synchronization.",
  },
  {
    id: "animation",
    name: "Animation Presets",
    banglaName: "অ্যানিমেশন প্রিসেট",
    iconName: "PlayCircle",
    badgeColor: "from-amber-500/20 to-amber-500/5 text-amber-400 border-amber-500/30",
    tagline: "1-Click Dynamic Kinetic Motions",
    description: "Overshoot dynamics, elastic entrance/exit presets, staggered animations, and kinetic typography moves.",
  },
  {
    id: "arrow",
    name: "Arrow & Pointers",
    banglaName: "অ্যারো ও পয়েন্টার",
    iconName: "ArrowRight",
    badgeColor: "from-teal-500/20 to-teal-500/5 text-teal-400 border-teal-500/30",
    tagline: "Dynamic Arrows & Target Callouts",
    description: "Animated directional arrows, auto-pointing target indicators, path drawing animations, and customizable heads & strokes.",
  },
  {
    id: "carousel",
    name: "Carousel & Sliders",
    banglaName: "ক্যারোসেল ও স্লাইডার",
    iconName: "Sliders",
    badgeColor: "from-blue-500/20 to-blue-500/5 text-blue-400 border-blue-500/30",
    tagline: "3D Multi-Slide & Social Feeds",
    description: "Generate 3D cylindrical and flat carousels, social media multi-slide swipe animations, and automated layer spacing.",
  },
  {
    id: "comps",
    name: "Comps Utilities",
    banglaName: "কম্পস ইউটিলিটি",
    iconName: "FolderTree",
    badgeColor: "from-indigo-500/20 to-indigo-500/5 text-indigo-400 border-indigo-500/30",
    tagline: "Batch Precomp & Smart Resizer",
    description: "Batch precompose layers, smart aspect ratio resizing, unprecomp without keyframe loss, and automated project cleaning.",
  },
  {
    id: "sfx",
    name: "SFX Library",
    banglaName: "এসএফএক্স লাইব্রেরি",
    iconName: "Volume2",
    badgeColor: "from-rose-500/20 to-rose-500/5 text-rose-400 border-rose-500/30",
    tagline: "Built-in Audio & 1-Click Sync",
    description: "Instant waveform sound effects browser with whooshes, risers, pops, hits, and automatic 1-click timeline marker sync.",
  },
  {
    id: "mogrt",
    name: "MOGRT Templates",
    banglaName: "মোগার্ট টেমপ্লেট",
    iconName: "Film",
    badgeColor: "from-violet-500/20 to-violet-500/5 text-violet-400 border-violet-500/30",
    tagline: "Essential Graphics for Premiere Pro",
    description: "Export clean dynamic MOGRT packages, connect live text/color controllers, and reuse templates directly inside Premiere Pro.",
  },
  {
    id: "license",
    name: "License & Setup",
    banglaName: "লাইসেন্স ও সেটআপ",
    iconName: "Tag",
    badgeColor: "from-emerald-500/20 to-emerald-500/5 text-emerald-400 border-emerald-500/30",
    tagline: "Activation, Installation & Giveaway",
    description: "Step-by-step extension installation guide, license activation, and how to participate in the 50 free lifetime keys giveaway.",
  },
];

// ----------------------------------------------------------------------------
// All Tutorial Videos (Single Video per Tab + Complete Tutorials Section)
// ----------------------------------------------------------------------------
export const TUTORIAL_VIDEOS: TutorialVideo[] = [
  // ==========================================================================
  // COMPLETE TUTORIALS SECTION (Previous Full Overviews & Masterclasses)
  // ==========================================================================
  {
    id: "complete-v261-master",
    sectionKey: "complete",
    sectionName: "Complete Tutorials",
    title: "COMPX ORBIT STUDIO v2.6.1 — EXTENSION TUTORIAL IS HERE!",
    banglaTitle: "কম্পএক্স অরবিট স্টুডিও v2.6.1 — সম্পূর্ণ এক্সটেনশন ওয়াকথ্রু",
    description:
      "The complete walkthrough of CompX Orbit Studio v2.6.1 extension — learn how to master all the essential workflow tools, 9-point anchor points, timeline utilities, and speed up your After Effects production.",
    youtubeId: "Ia66YvWO6JI",
    duration: "16:20",
    level: "All Levels",
    isReady: true,
    featured: true,
    badge: "v2.6.1 Full Tour",
    topics: [
      "Complete Orbit Studio v2.6.1 Overview",
      "Workspace Navigation & Docking in After Effects",
      "9-Point Anchor Point & Alignment Operations",
      "Layer Trimming, Split & Reverse Keyframes",
      "Native FX, Studio & Motion Lab Quick Look",
    ],
  },
  {
    id: "complete-deep-glow-shadow",
    sectionKey: "complete",
    sectionName: "Complete Tutorials",
    title: "Orbit Studio Complete Tutorial | Deep Glow, Shadow & Native FX",
    banglaTitle: "ডিপ গ্লো, শ্যাডো স্টুডিও এবং সম্পূর্ণ ওয়ার্কফ্লো গাইড",
    description:
      "In-depth complete video walkthrough of Orbit Studio core tools including Deep Glow 2, Shadow Studio 3, dynamic number counters, and overall workflow optimization.",
    youtubeId: "9fnTG_5MDBQ",
    duration: "14:15",
    level: "Beginner",
    isReady: true,
    badge: "Full Walkthrough",
    topics: [
      "Deep Glow 2 & Optical Glow Presets",
      "Shadow Studio 3 Realistic Drop Shadows",
      "Dynamic Number Counters with Auto Commas",
      "Text Exploder by Word and Character",
      "Quick FX: Gradient, Glow, Fill & Blur",
    ],
  },
  {
    id: "complete-master-feature-guide",
    sectionKey: "complete",
    sectionName: "Complete Tutorials",
    title: "Orbit Studio Complete Tutorial | Master Every Feature in After Effects",
    banglaTitle: "মাস্টার এভরি ফিচার গাইড: কমপ্লিট আফটার ইফেক্টস ওয়ার্কফ্লো",
    description:
      "Comprehensive full overview of every single feature in Orbit Studio to speed up your creative workflow in Adobe After Effects.",
    youtubeId: "xalYhDRnOh8",
    duration: "18:40",
    level: "All Levels",
    isReady: true,
    badge: "Master Overview",
    topics: [
      "Visual Bezier Graph Editor with Interactive Handles",
      "Speed & Influence Curve Tweaking",
      "Elastic & Bounce Physics Presets",
      "Project Setup & Workspace Efficiency",
      "Copy & Paste Easing Curves Across Multiple Layers",
    ],
  },

  // ==========================================================================
  // 1. TOOLS TAB (ONLY 1 DEDICATED VIDEO)
  // ==========================================================================
  {
    id: "tools-tab-tutorial",
    sectionKey: "tools",
    sectionName: "Tools Tab",
    title: "Orbit Studio Tools Tab Tutorial | Explore Powerful Creative Tools in After Effects",
    banglaTitle: "অরবিট স্টুডিও টুলস ট্যাব টিউটোরিয়াল: ক্রিয়েটিভ টুলস ও পাওয়ারফুল ওয়ার্কফ্লো",
    description:
      "Deep dive into the Orbit Studio Tools Tab. Learn how to work 10x faster with 9-point anchor point snapping, 1-click alignments, keyframe reversal, timeline in/out trimming, and project cleaning inside Adobe After Effects.",
    youtubeId: "wv4jzxJoqK0",
    duration: "13:02",
    level: "Beginner",
    isReady: true,
    featured: true,
    badge: "Tools Tab Only",
    topics: [
      "9-Point Anchor Point Instant Snap & Center",
      "1-Click Layer Alignments, Distribution & Spacing",
      "Reverse Keyframes with Exact Velocity Preservation",
      "Timeline In/Out Quick Trimming at Playhead",
      "Smart Project Cleaner & Unused Layer Purge",
    ],
  },

  // ==========================================================================
  // 2. STUDIO TAB (UPCOMING DEDICATED VIDEO)
  // ==========================================================================
  {
    id: "studio-tab-dedicated",
    sectionKey: "studio",
    sectionName: "Studio Tab",
    title: "Studio Tab Tutorial: Auto Captions, Dynamic Counters & Kinetic Text",
    banglaTitle: "স্টুডিও ট্যাব টিউটোরিয়াল: ক্যাপশন, কাউন্টার ও টেক্সট মোশন",
    description:
      "Dedicated single video tutorial for the Studio Tab. Auto word captions, SRT subtitles, animated dynamic number counters, and text exploding kinetic workflows.",
    youtubeId: "", // 💡 Paste your YouTube ID here when recorded
    duration: "Coming Soon",
    level: "Beginner",
    isReady: false,
    badge: "In Production",
    topics: [
      "Dynamic Number Counters with Auto Commas",
      "Text Exploder by Word and Character",
      "SRT & Word Caption Subtitle Automation",
      "Native FX: Deep Glow, Shadow Studio & Blurs",
      "1-Click Kinetic Typography Presets",
    ],
  },

  // ==========================================================================
  // 3. MOTION LAB (UPCOMING DEDICATED VIDEO)
  // ==========================================================================
  {
    id: "motion-lab-dedicated",
    sectionKey: "motion-lab",
    sectionName: "Motion Lab",
    title: "Motion Lab Tutorial: Visual Graph Editor & Interactive Bezier Curves",
    banglaTitle: "মোশন ল্যাব টিউটোরিয়াল: ভিজুয়াল গ্রাফ ও কার্ভ এডিটর",
    description:
      "Dedicated single video tutorial for the Motion Lab workspace. Master visual curve handles, speed/influence graphs, and custom easing curves without touching AE default graph handles.",
    youtubeId: "", // 💡 Paste your YouTube ID here when recorded
    duration: "Coming Soon",
    level: "Intermediate",
    isReady: false,
    badge: "In Production",
    topics: [
      "Visual Bezier Graph Editor with Interactive Handles",
      "Instant Speed & Influence Curve Tweaking",
      "1-Click Ease In, Ease Out & Smooth S-Curves",
      "Elastic & Bounce Physics Presets",
      "Copy & Paste Easing Curves Across Multiple Layers",
    ],
  },

  // ==========================================================================
  // 4. MORPH ENGINE (UPCOMING DEDICATED VIDEO)
  // ==========================================================================
  {
    id: "morph-engine-guide",
    sectionKey: "morph",
    sectionName: "Morph Engine",
    title: "Super Morph Engine: Seamless Shape & Path Morphing Masterclass",
    banglaTitle: "সুপার মর্ফ ইঞ্জিন: ভেক্টর শেপ ও পাথ ট্রানজিশন গাইড",
    description:
      "Learn how to seamlessly morph between any two vector shapes, logos, or mask paths without manual vertex keyframing. Step-by-step guide to achieving buttery smooth liquid and geometric shape morphs.",
    youtubeId: "", // 💡 Paste your YouTube ID here when recorded
    duration: "Coming Soon",
    level: "Intermediate",
    isReady: false,
    badge: "In Production",
    topics: [
      "Super Morph 1-Click Shape Transformation",
      "Vector Shape to Shape Path Interpolation",
      "Mask Vertex Alignment & Distortion Fixes",
      "Smooth Logo-to-Icon Transitions",
      "Timing & Speed Easing for Realistic Morphs",
    ],
  },

  // ==========================================================================
  // 5. COLOR PALETTES (UPCOMING DEDICATED VIDEO)
  // ==========================================================================
  {
    id: "color-palettes-guide",
    sectionKey: "color",
    sectionName: "Color Palettes",
    title: "Color Palettes: 1-Click Auto Recoloring & Project Swatch Manager",
    banglaTitle: "কালার প্যালেট: ১-ক্লিকে প্রজেক্ট রিকলার ও সোয়াচ ব্যবহার",
    description:
      "Explore the Color Tab in Orbit Studio. Switch entire project color palettes in a single click, create custom brand palettes, check contrast, and batch apply fills & strokes instantly.",
    youtubeId: "", // 💡 Paste your YouTube ID here when recorded
    duration: "Coming Soon",
    level: "Beginner",
    isReady: false,
    badge: "In Production",
    topics: [
      "Curated Trendy Motion Design Color Palettes",
      "1-Click Entire Composition Auto Recoloring",
      "Adding Custom Hex Codes & Swatch Libraries",
      "Batch Swapping Shape Fills and Gradient Strokes",
      "Exporting & Sharing Palettes with Team Members",
    ],
  },

  // ==========================================================================
  // 6. ANIMATION PRESETS (UPCOMING DEDICATED VIDEO)
  // ==========================================================================
  {
    id: "animation-presets-guide",
    sectionKey: "animation",
    sectionName: "Animation Presets",
    title: "Animation Presets: Instant Dynamic Keyframes & Kinetic Physics",
    banglaTitle: "অ্যানিমেশন প্রিসেট: ওভালশ্যুট, বাউন্স ও ইনস্ট্যান্ট মোশন",
    description:
      "Discover the Animation Tab library. Apply elastic bounces, cinematic slide-ins, scale pops, and staggered multi-layer animations without touching individual keyframes.",
    youtubeId: "", // 💡 Paste your YouTube ID here when recorded
    duration: "Coming Soon",
    level: "All Levels",
    isReady: false,
    badge: "In Production",
    topics: [
      "1-Click In & Out Animation Presets",
      "Physics-based Natural Bounce & Overshoot",
      "Kinetic Slide, Scale & Fade Combinations",
      "Staggering Multiple Layers with Adjustable Delay",
      "Saving Custom Motions into the User Preset Library",
    ],
  },

  // ==========================================================================
  // 7. ARROW & POINTERS (UPCOMING DEDICATED VIDEO)
  // ==========================================================================
  {
    id: "arrow-pointers-guide",
    sectionKey: "arrow",
    sectionName: "Arrow & Pointers",
    title: "Arrow & Pointer Studio: Animated Callouts & Target Tracking Arrows",
    banglaTitle: "অ্যারো ও পয়েন্টার: ডাইনামিক তীর ও ইনফোগ্রাফিক কলআউট",
    description:
      "How to use the Arrow & Pointer workspace. Generate animated curved arrows, target indicator pins, dynamic draw-on paths, and callout pointers that stick to moving video subjects.",
    youtubeId: "", // 💡 Paste your YouTube ID here when recorded
    duration: "Coming Soon",
    level: "All Levels",
    isReady: false,
    badge: "In Production",
    topics: [
      "Customizable Arrow Heads, Curved Shafts & Dash Lines",
      "Auto Trim Paths Draw-on Animation",
      "Tracking Target Callout Pins to Footage",
      "Color, Stroke Width & Head Scale Controls",
      "HUD & Explainer Video Graphic Callouts",
    ],
  },

  // ==========================================================================
  // 8. CAROUSEL & SLIDERS (UPCOMING DEDICATED VIDEO)
  // ==========================================================================
  {
    id: "carousel-sliders-guide",
    sectionKey: "carousel",
    sectionName: "Carousel & Sliders",
    title: "Carousel & Slider Maker: 3D Multi-Slide Feeds & Social Presentations",
    banglaTitle: "ক্যারোসেল ও স্লাইডার: ৩ডি স্লাইড ও সোশ্যাল প্রেজেন্টেশন",
    description:
      "Master the Carousel Tab. Turn multiple images, mockups, or video clips into 3D rotating cylinders, horizontal card feeds, or swipeable social media carousels in seconds.",
    youtubeId: "", // 💡 Paste your YouTube ID here when recorded
    duration: "Coming Soon",
    level: "Intermediate",
    isReady: false,
    badge: "In Production",
    topics: [
      "3D Cylindrical Ring Carousel Setup",
      "Horizontal Flat Slider with Inertial Momentum",
      "Automated Equal Spacing for Multi-Slide Comps",
      "Seamless Loop Animations for Instagram/TikTok",
      "Depth of Field & Perspective Camera Linking",
    ],
  },

  // ==========================================================================
  // 9. COMPS UTILITIES (UPCOMING DEDICATED VIDEO)
  // ==========================================================================
  {
    id: "comps-utilities-guide",
    sectionKey: "comps",
    sectionName: "Comps Utilities",
    title: "Comps Master: Batch Precomp, Smart Resizer & Auto Layer Organizer",
    banglaTitle: "কম্পস ইউটিলিটি: ব্যাচ প্রিকম্প, স্মার্ট রিসাইজার ও প্রজেক্ট সাজানো",
    description:
      "Speed up project management with the Comps Tab. Batch precompose individual layers, adapt compositions from 16:9 to 9:16 automatically, and unpack precomps without losing timing.",
    youtubeId: "", // 💡 Paste your YouTube ID here when recorded
    duration: "Coming Soon",
    level: "Beginner",
    isReady: false,
    badge: "In Production",
    topics: [
      "Batch Precomp Multiple Layers into Separate Comps",
      "Smart Aspect Ratio Resizer (16:9 ↔ 9:16 ↔ 1:1)",
      "Unprecomp Extract Layers Directly into Main Timeline",
      "Auto Rename and Folder Organizer for Clean Projects",
      "Crop Comp to Layer Boundaries in 1 Click",
    ],
  },

  // ==========================================================================
  // 10. SFX LIBRARY (UPCOMING DEDICATED VIDEO)
  // ==========================================================================
  {
    id: "sfx-library-guide",
    sectionKey: "sfx",
    sectionName: "SFX Library",
    title: "SFX Library: Built-in Sound Effects & 1-Click Timeline Audio Sync",
    banglaTitle: "এসএফএক্স লাইব্রেরি: সাউন্ড ইফেক্ট ব্রাউজার ও টাইমলাইন সিঙ্ক",
    description:
      "A complete guide to the built-in SFX Library in Orbit Studio. Browse hundreds of curated motion design sounds (whooshes, risers, impacts, UI clicks) and sync them straight to keyframe markers.",
    youtubeId: "", // 💡 Paste your YouTube ID here when recorded
    duration: "Coming Soon",
    level: "All Levels",
    isReady: false,
    badge: "In Production",
    topics: [
      "Built-in Categorized Sound Effects Browser",
      "Instant Waveform Audio Preview on Hover",
      "1-Click Drop SFX Directly at Playhead",
      "Auto Sync Whoosh Peak to Keyframe Velocity",
      "Importing Custom Sound Effect Folders & Favorites",
    ],
  },

  // ==========================================================================
  // 11. MOGRT TEMPLATES (UPCOMING DEDICATED VIDEO)
  // ==========================================================================
  {
    id: "mogrt-templates-guide",
    sectionKey: "mogrt",
    sectionName: "MOGRT Templates",
    title: "MOGRT Workflow: Exporting & Customizing Templates in Premiere Pro",
    banglaTitle: "মোগার্ট টেমপ্লেট: প্রিমিয়ার প্রোতে ডায়নামিক গ্রাফিক্স ও টাইটেল",
    description:
      "Harness the power of MOGRTs inside Orbit Studio. Create dynamic Premiere Pro essential graphics templates with live text, color selectors, and slider controls for fast client revisions.",
    youtubeId: "", // 💡 Paste your YouTube ID here when recorded
    duration: "Coming Soon",
    level: "Intermediate",
    isReady: false,
    badge: "In Production",
    topics: [
      "Setting up Essential Graphics Controller Properties",
      "Exposing Text, Color & Slider Controls for Premiere",
      "Exporting Lightweight .mogrt Packages",
      "Responsive Design Time-stretching Setup",
      "Organizing Reusable Title & Lower Third Packages",
    ],
  },

  // ==========================================================================
  // 12. LICENSE & GIVEAWAY SETUP (LIVE)
  // ==========================================================================
  {
    id: "giveaway-license-setup",
    sectionKey: "license",
    sectionName: "License & Setup",
    title: "Orbit Studio লাইফটাইম Extension লাইসেন্স গিভঅ্যাওয়ে!",
    banglaTitle: "অরবিট স্টুডিও লাইফটাইম এক্সটেনশন লাইসেন্স গিভঅ্যাওয়ে ও সেটআপ",
    description:
      "Everything you need to know about setting up CompX Orbit Studio, offline/online license activation, and how to participate in the 50 Free Extension Licenses 30-Day Lucky Draw.",
    youtubeId: "wLxPWqRVGlQ",
    duration: "02:05",
    level: "All Levels",
    isReady: true,
    badge: "Giveaway Guide",
    topics: [
      "How to Install CompX Orbit Studio in After Effects",
      "Entering the 50 Free Lifetime Licenses Giveaway",
      "Sharing on Facebook & Submitting Public Post Link",
      "License Key Activation & Offline Mode Setup",
      "Troubleshooting ZXP / CEP Extension Loading Issues",
    ],
  },
];
