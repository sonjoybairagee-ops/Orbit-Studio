import Link from "next/link";
import { ToolItem } from "@/lib/tools-data";
import { 
  Minimize2, 
  FileImage, 
  Repeat, 
  Maximize, 
  Crop, 
  FileText, 
  Type, 
  Subtitles, 
  ArrowRight,
  Combine,
  Split,
  Layers,
  Code,
  FileSpreadsheet,
  Link as LinkIcon,
  Binary,
  Search, 
  FileCode,
  Volume2,
  Scissors,
  Music,
  Film,
  Camera,
  Archive,
  Table2,
  Percent,
  Calendar,
  Clock,
  QrCode,
  KeyRound,
  Palette,
  Sparkles,
  AlignLeft,
  PaintBucket,
  Grid,
  Globe,
  FileCode2,
  Pipette,
  Stamp,
  Contrast,
  BoxSelect,
  Square,
  Move3d,
  Columns3,
  LayoutGrid,
  Tag,
  Share2,
  Bot,
  Network,
  Link2,
  Ruler,
  Briefcase,
  Landmark,
  Receipt,
  Mail,
  TrendingUp,
  Target,
  Contact
} from "lucide-react";

interface ToolCardProps {
  tool: ToolItem;
}

const CATEGORY_STYLES: Record<
  string,
  {
    glow: string;
    iconBorder: string;
    iconBg: string;
    iconColor: string;
    hoverBorder: string;
    badgeBorder: string;
    badgeBg: string;
    badgeText: string;
  }
> = {
  image: {
    glow: "from-[#3cff5f]/25",
    iconBorder: "border-[#2a4d33]",
    iconBg: "bg-[#102a16]",
    iconColor: "text-[#3cff5f]",
    hoverBorder: "hover:border-[#3cff5f]/70",
    badgeBorder: "border-[#2a4d33]",
    badgeBg: "bg-[#102a16]",
    badgeText: "text-[#3cff5f]",
  },
  pdf: {
    glow: "from-[#f87171]/25",
    iconBorder: "border-[#4a2225]",
    iconBg: "bg-[#2a1315]",
    iconColor: "text-[#f87171]",
    hoverBorder: "hover:border-[#f87171]/70",
    badgeBorder: "border-[#4a2225]",
    badgeBg: "bg-[#2a1315]",
    badgeText: "text-[#f87171]",
  },
  text: {
    glow: "from-[#52e2ec]/25",
    iconBorder: "border-[#18444a]",
    iconBg: "bg-[#0d262b]",
    iconColor: "text-[#52e2ec]",
    hoverBorder: "hover:border-[#52e2ec]/70",
    badgeBorder: "border-[#18444a]",
    badgeBg: "bg-[#0d262b]",
    badgeText: "text-[#52e2ec]",
  },
  subtitle: {
    glow: "from-[#d16be9]/25",
    iconBorder: "border-[#4a2052]",
    iconBg: "bg-[#27122b]",
    iconColor: "text-[#d16be9]",
    hoverBorder: "hover:border-[#d16be9]/70",
    badgeBorder: "border-[#4a2052]",
    badgeBg: "bg-[#27122b]",
    badgeText: "text-[#d16be9]",
  },
  dev: {
    glow: "from-[#38bdf8]/25",
    iconBorder: "border-[#1a3d54]",
    iconBg: "bg-[#0c2333]",
    iconColor: "text-[#38bdf8]",
    hoverBorder: "hover:border-[#38bdf8]/70",
    badgeBorder: "border-[#1a3d54]",
    badgeBg: "bg-[#0c2333]",
    badgeText: "text-[#38bdf8]",
  },
  audio: {
    glow: "from-[#a78bfa]/25",
    iconBorder: "border-[#372d5c]",
    iconBg: "bg-[#1f1936]",
    iconColor: "text-[#a78bfa]",
    hoverBorder: "hover:border-[#a78bfa]/70",
    badgeBorder: "border-[#372d5c]",
    badgeBg: "bg-[#1f1936]",
    badgeText: "text-[#a78bfa]",
  },
  file: {
    glow: "from-[#34d399]/25",
    iconBorder: "border-[#1c4737]",
    iconBg: "bg-[#0e271e]",
    iconColor: "text-[#34d399]",
    hoverBorder: "hover:border-[#34d399]/70",
    badgeBorder: "border-[#1c4737]",
    badgeBg: "bg-[#0e271e]",
    badgeText: "text-[#34d399]",
  },
  calc: {
    glow: "from-[#fbbf24]/25",
    iconBorder: "border-[#4d3c16]",
    iconBg: "bg-[#29200b]",
    iconColor: "text-[#fbbf24]",
    hoverBorder: "hover:border-[#fbbf24]/70",
    badgeBorder: "border-[#4d3c16]",
    badgeBg: "bg-[#29200b]",
    badgeText: "text-[#fbbf24]",
  },
  design: {
    glow: "from-[#f472b6]/25",
    iconBorder: "border-[#52203d]",
    iconBg: "bg-[#2b1220]",
    iconColor: "text-[#f472b6]",
    hoverBorder: "hover:border-[#f472b6]/70",
    badgeBorder: "border-[#52203d]",
    badgeBg: "bg-[#2b1220]",
    badgeText: "text-[#f472b6]",
  },
  seo: {
    glow: "from-[#2dd4bf]/25",
    iconBorder: "border-[#164741]",
    iconBg: "bg-[#0b2623]",
    iconColor: "text-[#2dd4bf]",
    hoverBorder: "hover:border-[#2dd4bf]/70",
    badgeBorder: "border-[#164741]",
    badgeBg: "bg-[#0b2623]",
    badgeText: "text-[#2dd4bf]",
  },
  marketing: {
    glow: "from-[#fb923c]/25",
    iconBorder: "border-[#4d2c16]",
    iconBg: "bg-[#29170b]",
    iconColor: "text-[#fb923c]",
    hoverBorder: "hover:border-[#fb923c]/70",
    badgeBorder: "border-[#4d2c16]",
    badgeBg: "bg-[#29170b]",
    badgeText: "text-[#fb923c]",
  },
  video: {
    glow: "from-[#a855f7]/30",
    iconBorder: "border-[#4a2254]",
    iconBg: "bg-[#201026]",
    iconColor: "text-[#c084fc]",
    hoverBorder: "hover:border-[#c084fc]/70",
    badgeBorder: "border-[#4a2254]",
    badgeBg: "bg-[#201026]",
    badgeText: "text-[#c084fc]",
  },
};

const DEFAULT_CATEGORY_STYLE = {
  glow: "from-[#3cff5f]/25",
  iconBorder: "border-[#2a4d33]",
  iconBg: "bg-[#102a16]",
  iconColor: "text-[#3cff5f]",
  hoverBorder: "hover:border-[#3cff5f]/70",
  badgeBorder: "border-[#2a4d33]",
  badgeBg: "bg-[#102a16]",
  badgeText: "text-[#3cff5f]",
};

export default function ToolCard({ tool }: ToolCardProps) {
  const renderIcon = () => {
    switch (tool.iconName) {
      case "Mail":
        return <Mail className="h-6 w-6" />;
      case "TrendingUp":
        return <TrendingUp className="h-6 w-6" />;
      case "Target":
        return <Target className="h-6 w-6" />;
      case "Contact":
        return <Contact className="h-6 w-6" />;
      case "Ruler":
        return <Ruler className="h-6 w-6" />;
      case "Briefcase":
        return <Briefcase className="h-6 w-6" />;
      case "Landmark":
        return <Landmark className="h-6 w-6" />;
      case "Receipt":
        return <Receipt className="h-6 w-6" />;
      case "Tag":
        return <Tag className="h-6 w-6" />;
      case "Share2":
        return <Share2 className="h-6 w-6" />;
      case "Bot":
        return <Bot className="h-6 w-6" />;
      case "Network":
        return <Network className="h-6 w-6" />;
      case "Link2":
        return <Link2 className="h-6 w-6" />;
      case "Contrast":
        return <Contrast className="h-6 w-6" />;
      case "BoxSelect":
        return <BoxSelect className="h-6 w-6" />;
      case "Square":
        return <Square className="h-6 w-6" />;
      case "Move3d":
        return <Move3d className="h-6 w-6" />;
      case "Columns3":
        return <Columns3 className="h-6 w-6" />;
      case "LayoutGrid":
        return <LayoutGrid className="h-6 w-6" />;
      case "PaintBucket":
        return <PaintBucket className="h-6 w-6" />;
      case "Grid":
        return <Grid className="h-6 w-6" />;
      case "Globe":
        return <Globe className="h-6 w-6" />;
      case "FileCode2":
        return <FileCode2 className="h-6 w-6" />;
      case "Pipette":
        return <Pipette className="h-6 w-6" />;
      case "Stamp":
        return <Stamp className="h-6 w-6" />;
      case "Percent":
        return <Percent className="h-6 w-6" />;
      case "Calendar":
        return <Calendar className="h-6 w-6" />;
      case "Clock":
        return <Clock className="h-6 w-6" />;
      case "QrCode":
        return <QrCode className="h-6 w-6" />;
      case "KeyRound":
        return <KeyRound className="h-6 w-6" />;
      case "Palette":
        return <Palette className="h-6 w-6" />;
      case "Sparkles":
        return <Sparkles className="h-6 w-6" />;
      case "AlignLeft":
        return <AlignLeft className="h-6 w-6" />;
      case "Volume2":
        return <Volume2 className="h-6 w-6" />;
      case "Scissors":
        return <Scissors className="h-6 w-6" />;
      case "Music":
        return <Music className="h-6 w-6" />;
      case "Film":
        return <Film className="h-6 w-6" />;
      case "Camera":
        return <Camera className="h-6 w-6" />;
      case "Archive":
        return <Archive className="h-6 w-6" />;
      case "Table2":
        return <Table2 className="h-6 w-6" />;
      case "Code":
        return <Code className="h-6 w-6" />;
      case "FileSpreadsheet":
        return <FileSpreadsheet className="h-6 w-6" />;
      case "Link":
        return <LinkIcon className="h-6 w-6" />;
      case "Binary":
        return <Binary className="h-6 w-6" />;
      case "Search":
        return <Search className="h-6 w-6" />;
      case "FileCode":
        return <FileCode className="h-6 w-6" />;
      case "Combine":
        return <Combine className="h-6 w-6" />;
      case "Split":
        return <Split className="h-6 w-6" />;
      case "Layers":
        return <Layers className="h-6 w-6" />;
      case "Minimize2":
        return <Minimize2 className="h-6 w-6" />;
      case "FileImage":
        return <FileImage className="h-6 w-6" />;
      case "Repeat":
        return <Repeat className="h-6 w-6" />;
      case "Maximize":
        return <Maximize className="h-6 w-6" />;
      case "Crop":
        return <Crop className="h-6 w-6" />;
      case "FileText":
        return <FileText className="h-6 w-6" />;
      case "Type":
        return <Type className="h-6 w-6" />;
      case "Subtitles":
        return <Subtitles className="h-6 w-6" />;
      default:
        return <Code className="h-6 w-6" />;
    }
  };

  const style = CATEGORY_STYLES[tool.category] || DEFAULT_CATEGORY_STYLE;

  return (
    <Link
      href={tool.href}
      className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-[#26332d] bg-gradient-to-b from-[#101813] via-[#0d1410] to-[#080e0b] p-5 transition-all duration-300 hover:-translate-y-1.5 ${style.hoverBorder} hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.85),0_0_24px_rgba(60,255,95,0.1)]`}
    >
      {/* Top Ambient Glow */}
      <div
        className={`pointer-events-none absolute -top-12 -right-12 h-36 w-36 rounded-full bg-gradient-to-br ${style.glow} to-transparent blur-2xl opacity-25 transition-opacity duration-300 group-hover:opacity-80`}
        aria-hidden="true"
      />

      {/* Top Accent Line on Hover */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#3cff5f]/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <div>
        {/* Header: Icon + Category Badge */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-xl border ${style.iconBorder} ${style.iconBg} ${style.iconColor} shadow-inner transition-transform duration-300 group-hover:scale-110`}
          >
            {renderIcon()}
          </div>

          <div className="flex flex-col items-end gap-1">
            {tool.badge ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#2a4d33] bg-[#102a16] px-2.5 py-0.5 text-[10px] font-semibold tracking-wider text-[#3cff5f] uppercase shadow-xs">
                <span className="h-1.5 w-1.5 rounded-full bg-[#3cff5f] animate-pulse" />
                {tool.badge}
              </span>
            ) : (
              <span
                className={`inline-flex items-center rounded-full border ${style.badgeBorder} ${style.badgeBg} px-2.5 py-0.5 text-[9px] font-mono tracking-wider ${style.badgeText} uppercase`}
              >
                {tool.category}
              </span>
            )}
          </div>
        </div>

        {/* Title */}
        <h3 className="text-base font-bold tracking-tight text-[#e7eee9] transition-colors duration-200 group-hover:text-white line-clamp-1 mb-2">
          {tool.name}
        </h3>

        {/* Short Description */}
        <p className="text-xs leading-relaxed text-[#9baaa1] transition-colors duration-200 group-hover:text-[#afbeb4] line-clamp-2">
          {tool.shortDesc}
        </p>
      </div>

      {/* Footer: Tech badge + Action */}
      <div className="mt-5 flex items-center justify-between border-t border-[#1f2d24] pt-3.5">
        <span className="font-mono text-[10px] tracking-wider text-[#62776a] uppercase transition-colors group-hover:text-[#8da195]">
          100% Free · Client-Side
        </span>
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#3cff5f] transition-all duration-200 group-hover:text-[#77ff90]">
          <span>Use Tool</span>
          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  );
}
