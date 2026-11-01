"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import {
  Download,
  Upload,
  RotateCcw,
  Sparkles,
  Sliders,
  SlidersHorizontal,
  Film,
  Camera,
  CheckCircle2,
  HelpCircle,
  Eye,
  Layers,
  Palette,
  Maximize2,
  Info,
  Check,
  Copy,
} from "lucide-react";

export interface ColorGradeState {
  exposure: number;       // -2.0 to +2.0
  contrast: number;       // -50 to +50
  saturation: number;     // 0 to 200
  temperature: number;    // -100 to +100
  tint: number;           // -100 to +100
  lift: number;           // -0.1 to +0.2
  gamma: number;          // 0.6 to 1.6
  gain: number;           // 0.6 to 1.6
  shadowHue: number;      // 0 to 360
  shadowAmount: number;   // 0 to 100
  highlightHue: number;   // 0 to 360
  highlightAmount: number;// 0 to 100
  vignette: number;       // 0 to 100
}

export const DEFAULT_GRADE: ColorGradeState = {
  exposure: 0,
  contrast: 0,
  saturation: 100,
  temperature: 0,
  tint: 0,
  lift: 0,
  gamma: 1.0,
  gain: 1.0,
  shadowHue: 190,        // Cyan/Teal
  shadowAmount: 0,
  highlightHue: 35,       // Warm Amber/Orange
  highlightAmount: 0,
  vignette: 0,
};

export interface LutPreset {
  id: string;
  name: string;
  category: string;
  description: string;
  badge: string;
  tagColor: string;
  settings: ColorGradeState;
}

export const PRESETS: LutPreset[] = [
  {
    id: "teal-orange",
    name: "Teal & Orange",
    category: "Blockbuster",
    description: "The classic Hollywood action & cinematic look. Cool teal shadows with rich golden warm skin tones.",
    badge: "Popular",
    tagColor: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    settings: {
      ...DEFAULT_GRADE,
      contrast: 18,
      saturation: 110,
      temperature: 8,
      lift: -0.02,
      gamma: 0.95,
      gain: 1.08,
      shadowHue: 195,
      shadowAmount: 48,
      highlightHue: 32,
      highlightAmount: 38,
      vignette: 15,
    },
  },
  {
    id: "kodak-2383",
    name: "Kodak 2383 Film Print",
    category: "Vintage Film",
    description: "Emulates the iconic Kodak motion picture film stock with rolled-off highlights and rich, organic warmth.",
    badge: "Analog Film",
    tagColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    settings: {
      ...DEFAULT_GRADE,
      contrast: 12,
      saturation: 96,
      temperature: 24,
      tint: -4,
      lift: 0.04,
      gamma: 1.05,
      gain: 0.96,
      shadowHue: 160,
      shadowAmount: 22,
      highlightHue: 45,
      highlightAmount: 28,
      vignette: 20,
    },
  },
  {
    id: "cyberpunk-neon",
    name: "Cyberpunk Neon 2077",
    category: "Sci-Fi & Urban",
    description: "High-contrast nighttime urban aesthetic with electric magenta shadows and cyan neon highlights.",
    badge: "Futuristic",
    tagColor: "bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/30",
    settings: {
      ...DEFAULT_GRADE,
      contrast: 28,
      saturation: 135,
      temperature: -18,
      lift: -0.05,
      gamma: 0.92,
      gain: 1.15,
      shadowHue: 305, // Magenta
      shadowAmount: 52,
      highlightHue: 185, // Cyan
      highlightAmount: 46,
      vignette: 30,
    },
  },
  {
    id: "moody-forest",
    name: "Moody Pine & Emerald",
    category: "Atmospheric",
    description: "Deep Scandinavian moody look. Desaturated warmth, deep pine greens, and lifted misty shadows.",
    badge: "Cinematic",
    tagColor: "bg-teal-500/10 text-teal-400 border-teal-500/30",
    settings: {
      ...DEFAULT_GRADE,
      contrast: 14,
      saturation: 82,
      temperature: -12,
      tint: -16,
      lift: 0.06,
      gamma: 1.08,
      gain: 0.94,
      shadowHue: 155,
      shadowAmount: 36,
      highlightHue: 205,
      highlightAmount: 18,
      vignette: 25,
    },
  },
  {
    id: "bleach-bypass",
    name: "Bleach Bypass (Silver Retain)",
    category: "Action / Grit",
    description: "High-impact gritty aesthetic popular in Saving Private Ryan and Fincher thrillers. Reduced color, punchy contrast.",
    badge: "Gritty",
    tagColor: "bg-sky-500/10 text-sky-400 border-sky-500/30",
    settings: {
      ...DEFAULT_GRADE,
      contrast: 34,
      saturation: 58,
      temperature: -6,
      lift: -0.03,
      gamma: 0.94,
      gain: 1.12,
      shadowHue: 210,
      shadowAmount: 20,
      highlightHue: 60,
      highlightAmount: 15,
      vignette: 22,
    },
  },
  {
    id: "film-noir",
    name: "35mm Film Noir (B&W)",
    category: "Monochrome",
    description: "Crisp silver-gelatin black and white with deep crushed shadows, punchy midtones, and velvety highlights.",
    badge: "Classic",
    tagColor: "bg-neutral-500/10 text-neutral-300 border-neutral-500/30",
    settings: {
      ...DEFAULT_GRADE,
      saturation: 0,
      contrast: 32,
      exposure: 0.1,
      lift: -0.04,
      gamma: 0.96,
      gain: 1.14,
      shadowHue: 0,
      shadowAmount: 0,
      highlightHue: 0,
      highlightAmount: 0,
      vignette: 35,
    },
  },
  {
    id: "golden-hour",
    name: "Golden Hour Glow",
    category: "Sunset & Romance",
    description: "Sun-drenched, warm sunset amber flare. Softens skin tones and brings out golden evening magic.",
    badge: "Warm",
    tagColor: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
    settings: {
      ...DEFAULT_GRADE,
      contrast: 10,
      saturation: 115,
      temperature: 42,
      tint: 8,
      lift: 0.02,
      gamma: 1.02,
      gain: 1.06,
      shadowHue: 28,
      shadowAmount: 32,
      highlightHue: 48,
      highlightAmount: 45,
      vignette: 15,
    },
  },
  {
    id: "clean-commercial",
    name: "Clean Studio Commercial",
    category: "Commercial",
    description: "Crisp, vibrant, punchy lighting for tech ads, cosmetics, and YouTube tutorials with authentic skin tones.",
    badge: "Broadcast",
    tagColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    settings: {
      ...DEFAULT_GRADE,
      exposure: 0.15,
      contrast: 8,
      saturation: 108,
      temperature: 2,
      tint: 0,
      lift: 0.01,
      gamma: 1.0,
      gain: 1.04,
      shadowHue: 200,
      shadowAmount: 8,
      highlightHue: 40,
      highlightAmount: 12,
      vignette: 0,
    },
  },
];

// Helper: HSL to RGB (returns [0..1, 0..1, 0..1])
function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0, g = 0, b = 0;

  if (h >= 0 && h < 60) {
    r = c; g = x; b = 0;
  } else if (h >= 60 && h < 120) {
    r = x; g = c; b = 0;
  } else if (h >= 120 && h < 180) {
    r = 0; g = c; b = x;
  } else if (h >= 180 && h < 240) {
    r = 0; g = x; b = c;
  } else if (h >= 240 && h < 300) {
    r = x; g = 0; b = c;
  } else {
    r = c; g = 0; b = x;
  }
  return [r + m, g + m, b + m];
}

// Universal Color Transformation Function (used identically for both 2D canvas and 3D .CUBE generation)
export function applyColorGrade(
  r: number,
  g: number,
  b: number,
  grade: ColorGradeState
): [number, number, number] {
  // 1. Lift / Gain
  let nr = Math.max(0, r * grade.gain + grade.lift);
  let ng = Math.max(0, g * grade.gain + grade.lift);
  let nb = Math.max(0, b * grade.gain + grade.lift);

  // Gamma
  if (grade.gamma !== 1.0 && grade.gamma > 0.05) {
    const invGamma = 1.0 / grade.gamma;
    nr = Math.pow(nr, invGamma);
    ng = Math.pow(ng, invGamma);
    nb = Math.pow(nb, invGamma);
  }

  // 2. Exposure
  if (grade.exposure !== 0) {
    const expScale = Math.pow(2, grade.exposure);
    nr *= expScale;
    ng *= expScale;
    nb *= expScale;
  }

  // 3. Contrast (around 0.5 pivot)
  if (grade.contrast !== 0) {
    const c = 1 + grade.contrast / 100;
    nr = (nr - 0.5) * c + 0.5;
    ng = (ng - 0.5) * c + 0.5;
    nb = (nb - 0.5) * c + 0.5;
  }

  // 4. White Balance (Temperature & Tint)
  if (grade.temperature !== 0 || grade.tint !== 0) {
    const tempFactor = grade.temperature / 100;
    const tintFactor = grade.tint / 100;

    nr += tempFactor * 0.22 + tintFactor * 0.08;
    ng -= tintFactor * 0.16;
    nb -= tempFactor * 0.22 - tintFactor * 0.08;
  }

  // 5. Split Toning (Shadows & Highlights)
  const lum = 0.2126 * nr + 0.7152 * ng + 0.0722 * nb;
  if (grade.shadowAmount > 0) {
    const shadowWeight = Math.max(0, 1 - 2 * lum) * (grade.shadowAmount / 100);
    const [sr, sg, sb] = hslToRgb(grade.shadowHue, 0.9, 0.5);
    nr += (sr - 0.5) * shadowWeight * 0.55;
    ng += (sg - 0.5) * shadowWeight * 0.55;
    nb += (sb - 0.5) * shadowWeight * 0.55;
  }

  if (grade.highlightAmount > 0) {
    const hlWeight = Math.max(0, 2 * lum - 1) * (grade.highlightAmount / 100);
    const [hr, hg, hb] = hslToRgb(grade.highlightHue, 0.9, 0.5);
    nr += (hr - 0.5) * hlWeight * 0.55;
    ng += (hg - 0.5) * hlWeight * 0.55;
    nb += (hb - 0.5) * hlWeight * 0.55;
  }

  // 6. Saturation
  const finalLum = 0.2126 * nr + 0.7152 * ng + 0.0722 * nb;
  const satScale = grade.saturation / 100;
  nr = finalLum + (nr - finalLum) * satScale;
  ng = finalLum + (ng - finalLum) * satScale;
  nb = finalLum + (nb - finalLum) * satScale;

  // Clamping [0..1]
  return [
    Math.max(0, Math.min(1, nr)),
    Math.max(0, Math.min(1, ng)),
    Math.max(0, Math.min(1, nb)),
  ];
}

// Generate Adobe / DaVinci compatible 3D .CUBE ASCII format
export function generateCubeLut(
  size: number,
  title: string,
  grade: ColorGradeState
): string {
  const lines: string[] = [
    `# Created with CompX Orbit Cinematic 3D LUT Generator`,
    `# 100% Compatible with Adobe Premiere Pro, After Effects, DaVinci Resolve, Final Cut Pro`,
    `TITLE "${title}"`,
    `LUT_3D_SIZE ${size}`,
    `DOMAIN_MIN 0.0 0.0 0.0`,
    `DOMAIN_MAX 1.0 1.0 1.0`,
    ``,
  ];

  // Standard Adobe Cube format:
  // Outermost loop: BLUE (0 to size-1)
  // Middle loop: GREEN (0 to size-1)
  // Innermost loop: RED (0 to size-1)
  for (let b = 0; b < size; b++) {
    const bIn = b / (size - 1);
    for (let g = 0; g < size; g++) {
      const gIn = g / (size - 1);
      for (let r = 0; r < size; r++) {
        const rIn = r / (size - 1);
        const [rOut, gOut, bOut] = applyColorGrade(rIn, gIn, bIn, grade);
        lines.push(`${rOut.toFixed(6)} ${gOut.toFixed(6)} ${bOut.toFixed(6)}`);
      }
    }
  }

  return lines.join("\n");
}

export default function LutGeneratorTool() {
  const [grade, setGrade] = useState<ColorGradeState>(DEFAULT_GRADE);
  const [selectedPreset, setSelectedPreset] = useState<string>("teal-orange");
  const [splitPosition, setSplitPosition] = useState<number>(50); // 0 to 100%
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [copiedInstructions, setCopiedInstructions] = useState<boolean>(false);
  const [showInstructions, setShowInstructions] = useState<boolean>(false);
  const [lutTitle, setLutTitle] = useState<string>("Orbit_Teal_and_Orange");

  // Canvas Viewport references
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const originalImageRef = useRef<HTMLImageElement | null>(null);
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);
  const [isDraggingSplit, setIsDraggingSplit] = useState<boolean>(false);

  // Default sample scene or user uploaded image
  const [sampleScene, setSampleScene] = useState<string>("portrait");

  // Load sample procedural scenes or custom image
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";

    // Use built-in high-quality canvas procedural generators so tool always has rich visuals
    const offscreen = document.createElement("canvas");
    offscreen.width = 1280;
    offscreen.height = 720;
    const ctx = offscreen.getContext("2d");

    if (!ctx) return;

    if (sampleScene === "portrait") {
      // Cinematic Portrait Studio Lighting
      const bgGrad = ctx.createRadialGradient(640, 360, 50, 640, 360, 600);
      bgGrad.addColorStop(0, "#28343e");
      bgGrad.addColorStop(1, "#0a1118");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, 1280, 720);

      // Warm Key Light (Left)
      const keyLight = ctx.createRadialGradient(480, 300, 20, 480, 300, 400);
      keyLight.addColorStop(0, "rgba(255, 210, 170, 0.85)");
      keyLight.addColorStop(1, "rgba(255, 180, 120, 0)");
      ctx.fillStyle = keyLight;
      ctx.beginPath();
      ctx.arc(480, 300, 400, 0, Math.PI * 2);
      ctx.fill();

      // Cool Rim Light (Right)
      const rimLight = ctx.createRadialGradient(820, 320, 20, 820, 320, 350);
      rimLight.addColorStop(0, "rgba(80, 190, 240, 0.75)");
      rimLight.addColorStop(1, "rgba(20, 80, 150, 0)");
      ctx.fillStyle = rimLight;
      ctx.beginPath();
      ctx.arc(820, 320, 350, 0, Math.PI * 2);
      ctx.fill();

      // Stylized Subject Silhouette & Tones
      ctx.fillStyle = "#e0a37e";
      ctx.beginPath();
      ctx.ellipse(640, 310, 110, 140, 0, 0, Math.PI * 2);
      ctx.fill();

      // Shoulders
      ctx.fillStyle = "#1e2a38";
      ctx.beginPath();
      ctx.ellipse(640, 520, 260, 130, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (sampleScene === "cyberpunk") {
      // Cyberpunk Night City Grid
      ctx.fillStyle = "#080612";
      ctx.fillRect(0, 0, 1280, 720);

      // Neon buildings & horizon
      const neonSky = ctx.createLinearGradient(0, 0, 0, 720);
      neonSky.addColorStop(0, "#210936");
      neonSky.addColorStop(0.6, "#540d58");
      neonSky.addColorStop(0.61, "#0a2e38");
      neonSky.addColorStop(1, "#031018");
      ctx.fillStyle = neonSky;
      ctx.fillRect(0, 0, 1280, 720);

      // Electric Cyan & Magenta Neon Bars
      ctx.fillStyle = "#00f0ff";
      ctx.fillRect(200, 180, 60, 300);
      ctx.fillRect(780, 120, 80, 360);

      ctx.fillStyle = "#ff0077";
      ctx.fillRect(340, 140, 70, 340);
      ctx.fillRect(940, 200, 65, 280);

      // Perspective roads
      ctx.strokeStyle = "rgba(0, 240, 255, 0.4)";
      ctx.lineWidth = 2;
      for (let i = 0; i < 12; i++) {
        ctx.beginPath();
        ctx.moveTo(640, 440);
        ctx.lineTo(i * 120, 720);
        ctx.stroke();
      }
    } else {
      // Golden Hour Mountain Horizon
      const skyGrad = ctx.createLinearGradient(0, 0, 0, 480);
      skyGrad.addColorStop(0, "#194261");
      skyGrad.addColorStop(0.5, "#d96f3a");
      skyGrad.addColorStop(0.85, "#f7bc54");
      skyGrad.addColorStop(1, "#fae3a0");
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, 1280, 720);

      // Glowing Sun
      const sun = ctx.createRadialGradient(640, 380, 20, 640, 380, 280);
      sun.addColorStop(0, "rgba(255, 255, 220, 1)");
      sun.addColorStop(0.3, "rgba(255, 200, 90, 0.8)");
      sun.addColorStop(1, "rgba(255, 120, 50, 0)");
      ctx.fillStyle = sun;
      ctx.beginPath();
      ctx.arc(640, 380, 280, 0, Math.PI * 2);
      ctx.fill();

      // Mountains
      ctx.fillStyle = "#2c1c24";
      ctx.beginPath();
      ctx.moveTo(0, 520);
      ctx.lineTo(240, 360);
      ctx.lineTo(500, 480);
      ctx.lineTo(760, 320);
      ctx.lineTo(1020, 460);
      ctx.lineTo(1280, 380);
      ctx.lineTo(1280, 720);
      ctx.lineTo(0, 720);
      ctx.closePath();
      ctx.fill();
    }

    img.src = offscreen.toDataURL("image/png");
    img.onload = () => {
      originalImageRef.current = img;
      setImageLoaded(true);
    };
  }, [sampleScene]);

  // Render processed image with live Split Screen Before/After
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const img = originalImageRef.current;
    if (!canvas || !img || !imageLoaded) return;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    canvas.width = img.width;
    canvas.height = img.height;

    // Draw original full image
    ctx.drawImage(img, 0, 0);

    const splitPx = Math.floor((splitPosition / 100) * canvas.width);

    // If split is 0, entire canvas is original.
    // If split > 0, process pixels on the right side of the split divider!
    // Left side: Original (Rec.709 Flat / Neutral)
    // Right side: Graded (CompX 3D LUT look)
    if (splitPx < canvas.width) {
      const processWidth = canvas.width - splitPx;
      const imageData = ctx.getImageData(splitPx, 0, processWidth, canvas.height);
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        const rNorm = data[i] / 255;
        const gNorm = data[i + 1] / 255;
        const bNorm = data[i + 2] / 255;

        const [rOut, gOut, bOut] = applyColorGrade(rNorm, gNorm, bNorm, grade);

        data[i] = Math.round(rOut * 255);
        data[i + 1] = Math.round(gOut * 255);
        data[i + 2] = Math.round(bOut * 255);
      }

      ctx.putImageData(imageData, splitPx, 0);
    }

    // Vignette overlay (applied only on the graded portion)
    if (grade.vignette > 0 && splitPx < canvas.width) {
      const vigRadius = Math.max(canvas.width, canvas.height) * 0.75;
      const vigGrad = ctx.createRadialGradient(
        canvas.width / 2,
        canvas.height / 2,
        vigRadius * 0.35,
        canvas.width / 2,
        canvas.height / 2,
        vigRadius
      );
      const alpha = (grade.vignette / 100) * 0.7;
      vigGrad.addColorStop(0, "rgba(0,0,0,0)");
      vigGrad.addColorStop(1, `rgba(0,0,0,${alpha})`);

      ctx.save();
      ctx.beginPath();
      ctx.rect(splitPx, 0, canvas.width - splitPx, canvas.height);
      ctx.clip();
      ctx.fillStyle = vigGrad;
      ctx.fillRect(splitPx, 0, canvas.width - splitPx, canvas.height);
      ctx.restore();
    }

    // Draw Split Divider Line
    ctx.save();
    ctx.strokeStyle = "#3cff5f";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(splitPx, 0);
    ctx.lineTo(splitPx, canvas.height);
    ctx.stroke();

    // Divider handle knob
    ctx.fillStyle = "#102a16";
    ctx.beginPath();
    ctx.arc(splitPx, canvas.height / 2, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#3cff5f";
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.restore();
  }, [grade, splitPosition, imageLoaded]);

  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  // Handle Preset Selection
  const applyPreset = (preset: LutPreset) => {
    setSelectedPreset(preset.id);
    setGrade({ ...preset.settings });
    setLutTitle(`Orbit_${preset.name.replace(/[^a-zA-Z0-9]/g, "_")}`);
  };

  // Upload Custom User Image
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        originalImageRef.current = img;
        setSampleScene("custom");
        setImageLoaded(true);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Split Divider Mouse/Touch Dragging
  const handlePointerDown = () => setIsDraggingSplit(true);
  const handlePointerUp = () => setIsDraggingSplit(false);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingSplit || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSplitPosition(percentage);
  };

  // Download .CUBE LUT (33x33 or 17x17)
  const downloadCubeLut = (size: 33 | 17) => {
    setIsExporting(true);
    setTimeout(() => {
      try {
        const cubeContent = generateCubeLut(size, lutTitle, grade);
        const blob = new Blob([cubeContent], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${lutTitle}_${size}x.cube`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } finally {
        setIsExporting(false);
      }
    }, 50);
  };

  // Download Fully Graded Still PNG
  const downloadGradedImage = () => {
    const img = originalImageRef.current;
    if (!img) return;

    const fullCanvas = document.createElement("canvas");
    fullCanvas.width = img.width;
    fullCanvas.height = img.height;
    const ctx = fullCanvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(img, 0, 0);
    const imageData = ctx.getImageData(0, 0, fullCanvas.width, fullCanvas.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i] / 255;
      const g = data[i + 1] / 255;
      const b = data[i + 2] / 255;
      const [ro, go, bo] = applyColorGrade(r, g, b, grade);
      data[i] = Math.round(ro * 255);
      data[i + 1] = Math.round(go * 255);
      data[i + 2] = Math.round(bo * 255);
    }
    ctx.putImageData(imageData, 0, 0);

    const a = document.createElement("a");
    a.href = fullCanvas.toDataURL("image/png");
    a.download = `${lutTitle}_graded_still.png`;
    a.click();
  };

  const copyInstructions = () => {
    const text = `How to Use CompX Orbit .CUBE LUTs:

1. Adobe Premiere Pro:
   • Go to the "Color" workspace (Lumetri Color panel on right).
   • Under "Creative" tab > click the "Look" dropdown.
   • Choose "Browse..." and select your downloaded .cube file.
   • Adjust Intensity slider to taste (typically 75% to 100%).

2. Adobe After Effects:
   • Select your video or Adjustment Layer.
   • Go to Effects > Color Correction > Apply Color LUT.
   • Choose your downloaded .cube file.

3. DaVinci Resolve:
   • Open Project Settings (gear icon) > Color Management > Open LUT Folder.
   • Copy the .cube file into the folder > click "Update Lists".
   • Right-click any node in the Color page > LUT > select your LUT.`;
    navigator.clipboard.writeText(text);
    setCopiedInstructions(true);
    setTimeout(() => setCopiedInstructions(false), 2500);
  };

  return (
    <div className="w-full text-[#e7eee9]">
      {/* Top Controls Toolbar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#26332d] bg-[#0c1410] p-4">
        {/* Sample Scene Selector & Custom Upload */}
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="text-xs font-semibold text-[#8ea396] uppercase tracking-wider">
            Preview Scene:
          </span>
          <button
            onClick={() => setSampleScene("portrait")}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
              sampleScene === "portrait"
                ? "bg-[#3cff5f] text-[#050a08] font-bold shadow-[0_0_15px_rgba(60,255,95,0.4)]"
                : "border border-[#26332d] bg-[#142019] text-[#c0d0c6] hover:bg-[#1a2b22]"
            }`}
          >
            Studio Portrait
          </button>
          <button
            onClick={() => setSampleScene("cyberpunk")}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
              sampleScene === "cyberpunk"
                ? "bg-[#3cff5f] text-[#050a08] font-bold shadow-[0_0_15px_rgba(60,255,95,0.4)]"
                : "border border-[#26332d] bg-[#142019] text-[#c0d0c6] hover:bg-[#1a2b22]"
            }`}
          >
            Cyberpunk Night
          </button>
          <button
            onClick={() => setSampleScene("golden")}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
              sampleScene === "golden"
                ? "bg-[#3cff5f] text-[#050a08] font-bold shadow-[0_0_15px_rgba(60,255,95,0.4)]"
                : "border border-[#26332d] bg-[#142019] text-[#c0d0c6] hover:bg-[#1a2b22]"
            }`}
          >
            Sunset Horizon
          </button>

          <label className="cursor-pointer rounded-lg border border-dashed border-[#3cff5f]/50 bg-[#14241b] px-3.5 py-1.5 text-xs font-semibold text-[#3cff5f] hover:bg-[#1c3326] transition-all flex items-center gap-1.5">
            <Upload className="h-3.5 w-3.5" />
            <span>Upload Image/Frame</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowInstructions(!showInstructions)}
            className="flex items-center gap-1.5 rounded-lg border border-[#26332d] bg-[#142019] px-3 py-1.5 text-xs font-medium text-[#9baaa1] hover:text-[#3cff5f] transition-all"
          >
            <HelpCircle className="h-3.5 w-3.5" />
            <span>AE / Premiere Guide</span>
          </button>

          <button
            onClick={() => {
              setGrade(DEFAULT_GRADE);
              setSelectedPreset("custom");
            }}
            className="flex items-center gap-1.5 rounded-lg border border-[#26332d] bg-[#142019] px-3 py-1.5 text-xs font-medium text-[#9baaa1] hover:text-white transition-all"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset Grade</span>
          </button>

          <button
            onClick={() => downloadCubeLut(33)}
            disabled={isExporting}
            className="flex items-center gap-1.5 rounded-lg bg-[#3cff5f] px-4 py-1.5 text-xs font-black text-[#050a08] shadow-[0_0_20px_rgba(60,255,95,0.35)] hover:bg-[#52ff71] transition-all"
          >
            <Download className="h-3.5 w-3.5 stroke-[2.5]" />
            <span>Download .CUBE (33×33)</span>
          </button>
        </div>
      </div>

      {/* Guide Banner Modal */}
      {showInstructions && (
        <div className="mb-6 rounded-2xl border border-[#3cff5f]/30 bg-[#0c1812] p-5 shadow-2xl relative">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5 text-[#3cff5f]">
              <Sparkles className="h-5 w-5" />
              <h3 className="text-base font-bold text-[#e7eee9]">
                How to Apply This .CUBE LUT in After Effects & Premiere Pro
              </h3>
            </div>
            <button
              onClick={copyInstructions}
              className="flex items-center gap-1 rounded-md border border-[#26332d] bg-[#142019] px-2.5 py-1 text-xs text-[#3cff5f] hover:bg-[#1a2e23]"
            >
              {copiedInstructions ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy Instructions</span>
                </>
              )}
            </button>
          </div>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-[#9baaa1] leading-relaxed">
            <div className="rounded-xl border border-[#1d2a23] bg-[#08100c] p-3.5">
              <span className="font-bold text-[#3cff5f]">1. Adobe Premiere Pro</span>
              <p className="mt-1.5">
                Open <strong>Lumetri Color</strong> &gt; go to <strong>Creative</strong> tab &gt; click <strong>Look</strong> dropdown &gt; choose <strong>Browse...</strong> and select this downloaded .cube file.
              </p>
            </div>
            <div className="rounded-xl border border-[#1d2a23] bg-[#08100c] p-3.5">
              <span className="font-bold text-[#3cff5f]">2. Adobe After Effects</span>
              <p className="mt-1.5">
                Apply to video or an Adjustment Layer: <strong>Effects &gt; Color Correction &gt; Apply Color LUT</strong>, then select your downloaded .cube file.
              </p>
            </div>
            <div className="rounded-xl border border-[#1d2a23] bg-[#08100c] p-3.5">
              <span className="font-bold text-[#3cff5f]">3. DaVinci Resolve</span>
              <p className="mt-1.5">
                Open <strong>Project Settings &gt; Color Management &gt; Open LUT Folder</strong>, paste the file, hit <em>Update Lists</em>, then right-click any node to apply.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Studio Workspace: Left Canvas Preview / Right Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Before / After Canvas (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div
            ref={containerRef}
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onPointerMove={handlePointerMove}
            onPointerLeave={handlePointerUp}
            className="group relative select-none overflow-hidden rounded-2xl border border-[#26332d] bg-[#080f0b] shadow-2xl cursor-ew-resize aspect-video flex items-center justify-center"
          >
            <canvas
              ref={canvasRef}
              className="max-h-full max-w-full object-contain pointer-events-none"
            />

            {/* Split Comparison Badges */}
            <div className="pointer-events-none absolute top-3.5 left-3.5 rounded-md bg-[#050a08]/85 px-2.5 py-1 text-[11px] font-semibold text-[#8ea396] border border-[#26332d] backdrop-blur-md">
              Original (Rec.709)
            </div>
            <div className="pointer-events-none absolute top-3.5 right-3.5 rounded-md bg-[#102a16]/90 px-2.5 py-1 text-[11px] font-bold text-[#3cff5f] border border-[#2a4d33] backdrop-blur-md">
              Graded ({PRESETS.find((p) => p.id === selectedPreset)?.name || "Custom"})
            </div>

            {/* Helper bottom hint */}
            <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-[#050a08]/75 px-3 py-1 text-[10px] text-[#8ea396] backdrop-blur-md opacity-80 group-hover:opacity-100 transition-opacity">
              Drag slider left / right to compare before &amp; after
            </div>
          </div>

          {/* Quick Still Frame Download */}
          <div className="flex items-center justify-between text-xs text-[#8ea396] px-1">
            <span>LUT Matrix Format: 3D RGB Look-Up Table (.CUBE)</span>
            <button
              onClick={downloadGradedImage}
              className="text-[#3cff5f] hover:underline font-medium flex items-center gap-1"
            >
              <Camera className="h-3.5 w-3.5" />
              <span>Save Graded Still (PNG)</span>
            </button>
          </div>

          {/* Preset Cards Carousel / Grid */}
          <div className="mt-2">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-bold text-[#3cff5f] uppercase tracking-wider flex items-center gap-1.5">
                <Palette className="h-3.5 w-3.5" />
                <span>Hollywood &amp; Creator Cinema Presets</span>
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => applyPreset(preset)}
                  className={`group relative flex flex-col text-left rounded-xl border p-3 transition-all ${
                    selectedPreset === preset.id
                      ? "border-[#3cff5f] bg-[#102a16]/60 shadow-[0_0_20px_rgba(60,255,95,0.18)]"
                      : "border-[#202e26] bg-[#0a120e] hover:border-[#3cff5f]/50 hover:bg-[#0f1b14]"
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="text-[10px] uppercase font-bold text-[#8ea396]">
                      {preset.category}
                    </span>
                    <span
                      className={`text-[9px] font-semibold px-1.5 py-0.5 rounded border ${preset.tagColor}`}
                    >
                      {preset.badge}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-[#e7eee9] group-hover:text-[#3cff5f] transition-colors truncate">
                    {preset.name}
                  </span>
                  <p className="mt-1 text-[10px] text-[#718579] line-clamp-2 leading-tight">
                    {preset.description}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Precise Studio Color Grading Controls (5 Cols) */}
        <div className="lg:col-span-5 rounded-2xl border border-[#26332d] bg-[#0c1410] p-5 shadow-2xl flex flex-col justify-between">
          <div className="space-y-5">
            {/* LUT Name Input */}
            <div>
              <label className="text-xs font-semibold text-[#8ea396] mb-1.5 block">
                LUT File Name:
              </label>
              <input
                type="text"
                value={lutTitle}
                onChange={(e) => setLutTitle(e.target.value.replace(/[^a-zA-Z0-9_-]/g, "_"))}
                className="w-full rounded-xl border border-[#26332d] bg-[#142019] px-3 py-2 text-xs font-mono text-[#3cff5f] focus:border-[#3cff5f] focus:outline-none"
                placeholder="Orbit_Cinema_Look"
              />
            </div>

            {/* Basic Tone Sliders */}
            <div className="space-y-3.5">
              <span className="text-xs font-bold text-[#3cff5f] uppercase tracking-wider flex items-center gap-1.5 border-b border-[#1c2a22] pb-1.5">
                <Sliders className="h-3.5 w-3.5" />
                <span>Primary Exposure &amp; Contrast</span>
              </span>

              {/* Exposure Slider */}
              <div>
                <div className="flex justify-between text-xs text-[#c0d0c6] mb-1">
                  <span>Exposure (EV)</span>
                  <span className="font-mono text-[#3cff5f]">
                    {grade.exposure > 0 ? `+${grade.exposure.toFixed(2)}` : grade.exposure.toFixed(2)}
                  </span>
                </div>
                <input
                  type="range"
                  min="-1.5"
                  max="1.5"
                  step="0.05"
                  value={grade.exposure}
                  onChange={(e) => {
                    setSelectedPreset("custom");
                    setGrade((prev) => ({ ...prev, exposure: parseFloat(e.target.value) }));
                  }}
                  className="w-full accent-[#3cff5f] h-1.5 bg-[#1a2a20] rounded-lg cursor-pointer"
                />
              </div>

              {/* Contrast Slider */}
              <div>
                <div className="flex justify-between text-xs text-[#c0d0c6] mb-1">
                  <span>Contrast</span>
                  <span className="font-mono text-[#3cff5f]">{grade.contrast > 0 ? `+${grade.contrast}` : grade.contrast}</span>
                </div>
                <input
                  type="range"
                  min="-40"
                  max="40"
                  step="1"
                  value={grade.contrast}
                  onChange={(e) => {
                    setSelectedPreset("custom");
                    setGrade((prev) => ({ ...prev, contrast: parseInt(e.target.value) }));
                  }}
                  className="w-full accent-[#3cff5f] h-1.5 bg-[#1a2a20] rounded-lg cursor-pointer"
                />
              </div>

              {/* Saturation Slider */}
              <div>
                <div className="flex justify-between text-xs text-[#c0d0c6] mb-1">
                  <span>Saturation</span>
                  <span className="font-mono text-[#3cff5f]">{grade.saturation}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="200"
                  step="2"
                  value={grade.saturation}
                  onChange={(e) => {
                    setSelectedPreset("custom");
                    setGrade((prev) => ({ ...prev, saturation: parseInt(e.target.value) }));
                  }}
                  className="w-full accent-[#3cff5f] h-1.5 bg-[#1a2a20] rounded-lg cursor-pointer"
                />
              </div>
            </div>

            {/* White Balance & Tint */}
            <div className="space-y-3.5">
              <span className="text-xs font-bold text-[#3cff5f] uppercase tracking-wider flex items-center gap-1.5 border-b border-[#1c2a22] pb-1.5">
                <SlidersHorizontal className="h-3.5 w-3.5" />
                <span>White Balance &amp; Film Tone</span>
              </span>

              {/* Temperature */}
              <div>
                <div className="flex justify-between text-xs text-[#c0d0c6] mb-1">
                  <span>Temperature (Cool / Warm)</span>
                  <span className="font-mono text-[#3cff5f]">{grade.temperature}</span>
                </div>
                <input
                  type="range"
                  min="-80"
                  max="80"
                  step="1"
                  value={grade.temperature}
                  onChange={(e) => {
                    setSelectedPreset("custom");
                    setGrade((prev) => ({ ...prev, temperature: parseInt(e.target.value) }));
                  }}
                  className="w-full accent-[#3cff5f] h-1.5 bg-gradient-to-r from-sky-500 via-[#1a2a20] to-amber-500 rounded-lg cursor-pointer"
                />
              </div>

              {/* Tint */}
              <div>
                <div className="flex justify-between text-xs text-[#c0d0c6] mb-1">
                  <span>Tint (Green / Magenta)</span>
                  <span className="font-mono text-[#3cff5f]">{grade.tint}</span>
                </div>
                <input
                  type="range"
                  min="-60"
                  max="60"
                  step="1"
                  value={grade.tint}
                  onChange={(e) => {
                    setSelectedPreset("custom");
                    setGrade((prev) => ({ ...prev, tint: parseInt(e.target.value) }));
                  }}
                  className="w-full accent-[#3cff5f] h-1.5 bg-gradient-to-r from-emerald-500 via-[#1a2a20] to-fuchsia-500 rounded-lg cursor-pointer"
                />
              </div>
            </div>

            {/* Split Toning: Shadows vs Highlights */}
            <div className="space-y-3.5">
              <span className="text-xs font-bold text-[#3cff5f] uppercase tracking-wider flex items-center gap-1.5 border-b border-[#1c2a22] pb-1.5">
                <Palette className="h-3.5 w-3.5" />
                <span>Split Toning (Shadows &amp; Highlights)</span>
              </span>

              {/* Shadows Tint */}
              <div>
                <div className="flex justify-between text-xs text-[#c0d0c6] mb-1">
                  <span className="flex items-center gap-1">
                    <span
                      className="inline-block w-2.5 h-2.5 rounded-full border border-white/20"
                      style={{
                        backgroundColor: `hsl(${grade.shadowHue}, 80%, 50%)`,
                      }}
                    />
                    Shadows Color Tone
                  </span>
                  <span className="font-mono text-[#3cff5f]">
                    Hue {grade.shadowHue}° ({grade.shadowAmount}%)
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="range"
                    min="0"
                    max="360"
                    value={grade.shadowHue}
                    onChange={(e) => {
                      setSelectedPreset("custom");
                      setGrade((prev) => ({ ...prev, shadowHue: parseInt(e.target.value) }));
                    }}
                    className="w-full accent-[#3cff5f] h-1.5 bg-gradient-to-r from-red-500 via-green-500 to-blue-500 rounded-lg cursor-pointer"
                  />
                  <input
                    type="range"
                    min="0"
                    max="80"
                    value={grade.shadowAmount}
                    onChange={(e) => {
                      setSelectedPreset("custom");
                      setGrade((prev) => ({ ...prev, shadowAmount: parseInt(e.target.value) }));
                    }}
                    placeholder="Strength"
                    className="w-full accent-[#3cff5f] h-1.5 bg-[#1a2a20] rounded-lg cursor-pointer"
                  />
                </div>
              </div>

              {/* Highlights Tint */}
              <div>
                <div className="flex justify-between text-xs text-[#c0d0c6] mb-1">
                  <span className="flex items-center gap-1">
                    <span
                      className="inline-block w-2.5 h-2.5 rounded-full border border-white/20"
                      style={{
                        backgroundColor: `hsl(${grade.highlightHue}, 80%, 50%)`,
                      }}
                    />
                    Highlights Color Tone
                  </span>
                  <span className="font-mono text-[#3cff5f]">
                    Hue {grade.highlightHue}° ({grade.highlightAmount}%)
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="range"
                    min="0"
                    max="360"
                    value={grade.highlightHue}
                    onChange={(e) => {
                      setSelectedPreset("custom");
                      setGrade((prev) => ({ ...prev, highlightHue: parseInt(e.target.value) }));
                    }}
                    className="w-full accent-[#3cff5f] h-1.5 bg-gradient-to-r from-red-500 via-green-500 to-blue-500 rounded-lg cursor-pointer"
                  />
                  <input
                    type="range"
                    min="0"
                    max="80"
                    value={grade.highlightAmount}
                    onChange={(e) => {
                      setSelectedPreset("custom");
                      setGrade((prev) => ({ ...prev, highlightAmount: parseInt(e.target.value) }));
                    }}
                    className="w-full accent-[#3cff5f] h-1.5 bg-[#1a2a20] rounded-lg cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Vignette */}
            <div>
              <div className="flex justify-between text-xs text-[#c0d0c6] mb-1">
                <span>Vignette Edge Falloff</span>
                <span className="font-mono text-[#3cff5f]">{grade.vignette}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="60"
                value={grade.vignette}
                onChange={(e) => {
                  setSelectedPreset("custom");
                  setGrade((prev) => ({ ...prev, vignette: parseInt(e.target.value) }));
                }}
                className="w-full accent-[#3cff5f] h-1.5 bg-[#1a2a20] rounded-lg cursor-pointer"
              />
            </div>
          </div>

          {/* Download Buttons Section */}
          <div className="mt-6 pt-4 border-t border-[#1c2a22] space-y-2.5">
            <button
              onClick={() => downloadCubeLut(33)}
              disabled={isExporting}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#3cff5f] py-3 text-sm font-black text-[#050a08] shadow-[0_0_25px_rgba(60,255,95,0.4)] hover:bg-[#52ff71] transition-all"
            >
              <Download className="h-4 w-4 stroke-[2.5]" />
              <span>Download 33×33 .CUBE LUT (Standard)</span>
            </button>

            <button
              onClick={() => downloadCubeLut(17)}
              disabled={isExporting}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-[#2a4d33] bg-[#102a16] py-2 text-xs font-bold text-[#3cff5f] hover:bg-[#163820] transition-all"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download 17×17 .CUBE LUT (Mobile / OBS)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
