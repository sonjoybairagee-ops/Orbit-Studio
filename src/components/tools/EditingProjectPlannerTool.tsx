"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Film,
  Calendar,
  CheckSquare,
  MessageSquare,
  Clock,
  Plus,
  Trash2,
  Copy,
  Check,
  Download,
  RotateCcw,
  Sparkles,
  AlertCircle,
  Camera,
  Layers,
  Sliders,
  ChevronRight,
  ExternalLink,
  Save,
  CheckCircle2,
} from "lucide-react";

type PlannerTab = "shots" | "scenes" | "checklist" | "revisions" | "deadlines";

interface ShotItem {
  id: string;
  shotNumber: string;
  sceneNumber: string;
  shotType: string;
  movement: string;
  angle: string;
  description: string;
  audioNote: string;
  equipment: string;
  status: "To Shoot" | "Filmed" | "In Timeline" | "Approved";
}

interface SceneItem {
  id: string;
  sceneNumber: string;
  heading: string;
  targetDuration: string;
  synopsis: string;
  talent: string;
  graphics: string;
  sfx: string;
  lutColor: string;
}

interface ChecklistItem {
  id: string;
  stage: string;
  task: string;
  completed: boolean;
}

interface RevisionItem {
  id: string;
  round: string;
  timecode: string;
  note: string;
  priority: "Critical" | "Major" | "Minor" | "Polish";
  category: "Video Cut" | "Audio" | "Graphics/Text" | "Color";
  status: "Pending" | "In Progress" | "Resolved";
}

interface MilestoneItem {
  id: string;
  title: string;
  deadlineDate: string;
  completed: boolean;
}

const DEFAULT_SHOTS: ShotItem[] = [
  {
    id: "s1",
    shotNumber: "1.1",
    sceneNumber: "SC 01",
    shotType: "Wide Shot (WS)",
    movement: "Slow Push-In",
    angle: "Eye Level",
    description: "Host at editing desk introducing the video hook with neon studio backdrop.",
    audioNote: "Wireless Lav + Studio Room Ambience",
    equipment: "24-70mm @ 28mm f/2.8, Key Light 5600K",
    status: "Approved",
  },
  {
    id: "s2",
    shotNumber: "1.2",
    sceneNumber: "SC 01",
    shotType: "Extreme Close-Up (ECU)",
    movement: "Static",
    angle: "High Angle",
    description: "Fingers hitting keyboard shortcuts on mechanical keyboard with RGB glow.",
    audioNote: "Foley mechanical switch clicks",
    equipment: "90mm Macro f/2.8",
    status: "In Timeline",
  },
  {
    id: "s3",
    shotNumber: "2.1",
    sceneNumber: "SC 02",
    shotType: "Medium Close-Up (MCU)",
    movement: "Handheld Parallax",
    angle: "Low Angle",
    description: "Screen recording capture & host demonstrating Premiere Pro workflow.",
    audioNote: "Clean VO dialogue @ -14 LUFS",
    equipment: "50mm f/1.8",
    status: "To Shoot",
  },
];

const DEFAULT_SCENES: SceneItem[] = [
  {
    id: "sc1",
    sceneNumber: "01",
    heading: "INT. ORBIT STUDIO - DAY",
    targetDuration: "00:45",
    synopsis: "High-energy intro, pain point hook: 'Editing videos takes too long without an organized pipeline'.",
    talent: "Lead Creator / Editor",
    graphics: "Kinetic typography, animated problem callouts",
    sfx: "Sub-bass drop, digital swoosh, camera shutter",
    lutColor: "Dark Cinema Neon, Contrast +15, Deep emeralds",
  },
  {
    id: "sc2",
    sceneNumber: "02",
    heading: "INT. EDITING SUITE - SCREEN CAPTURE",
    targetDuration: "02:30",
    synopsis: "Step-by-step breakdown: Timecode sync, proxy workflow, and rough cut assembly.",
    talent: "Screen Capture + Picture-in-Picture Host",
    graphics: "Zoom spotlights, keyboard shortcut overlay, progress bar",
    sfx: "Mouse clicks, subtle Lo-Fi background beat",
    lutColor: "Clean Rec.709 Neutral, 100% accurate UI colors",
  },
  {
    id: "sc3",
    sceneNumber: "03",
    heading: "INT. STUDIO - CALL TO ACTION",
    targetDuration: "00:30",
    synopsis: "Final summary, bonus tip, and link to Free Tools download.",
    talent: "Host direct to camera",
    graphics: "End screen cards, subscribe button with bell pop",
    sfx: "Pop hit, riser, chime notification",
    lutColor: "Warm studio rim lighting, 5600K key",
  },
];

const DEFAULT_CHECKLIST: ChecklistItem[] = [
  // Stage 1: Ingest & Prep
  { id: "c1", stage: "1. Ingest & Prep", task: "Backup raw footage to primary & secondary SSDs", completed: true },
  { id: "c2", stage: "1. Ingest & Prep", task: "Organize project folder structure (Footage, Audio, Graphics, Renders)", completed: true },
  { id: "c3", stage: "1. Ingest & Prep", task: "Generate ProRes / DNxHR editing proxies for smooth 4K scrubbing", completed: true },
  { id: "c4", stage: "1. Ingest & Prep", task: "Sync dual-system scratch audio with high-quality boom/lav track", completed: true },
  // Stage 2: Rough Cut
  { id: "c5", stage: "2. Assembly & Rough Cut", task: "Select best takes and build A-roll radio cut", completed: true },
  { id: "c6", stage: "2. Assembly & Rough Cut", task: "Eliminate dead pauses, stumble takes, and filler words", completed: false },
  { id: "c7", stage: "2. Assembly & Rough Cut", task: "Insert primary B-roll to cover jump cuts and illustrate points", completed: false },
  // Stage 3: Fine Cut & Motion
  { id: "c8", stage: "3. Fine Cut & Motion", task: "Refine audio J-cuts and L-cuts for natural conversational pacing", completed: false },
  { id: "c9", stage: "3. Fine Cut & Motion", task: "Add kinetic zooms, speed ramps, and focal reframing", completed: false },
  { id: "c10", stage: "3. Fine Cut & Motion", task: "Insert lower-thirds, callouts, and animated subtitles", completed: false },
  // Stage 4: Audio Mix & Sound Design
  { id: "c11", stage: "4. Audio Post", task: "Clean dialogue with vocal isolator, EQ, and subtle de-esser", completed: false },
  { id: "c12", stage: "4. Audio Post", task: "Layer SFX (whooshes, impacts, UI clicks, riser transitions)", completed: false },
  { id: "c13", stage: "4. Audio Post", task: "Apply audio ducking to background music track under speech", completed: false },
  { id: "c14", stage: "4. Audio Post", task: "Master timeline loudness to -14 LUFS (YouTube / Web standard)", completed: false },
  // Stage 5: Color & Quality Control
  { id: "c15", stage: "5. Color & Master QC", task: "White balance and exposure correction across all camera angles", completed: false },
  { id: "c16", stage: "5. Color & Master QC", task: "Apply creative LUT look and verify skin tones on Vectorscope", completed: false },
  { id: "c17", stage: "5. Color & Master QC", task: "Check timeline for black gaps, flash frames, or offline media", completed: false },
  { id: "c18", stage: "5. Color & Master QC", task: "Export final high-bitrate master and capture 4K thumbnail frame", completed: false },
];

const DEFAULT_REVISIONS: RevisionItem[] = [
  {
    id: "r1",
    round: "Round 1 (Rough Cut)",
    timecode: "00:01:14:08",
    note: "Trim the pause before the product demonstration. Pick up pace by 2 seconds.",
    priority: "Major",
    category: "Video Cut",
    status: "Resolved",
  },
  {
    id: "r2",
    round: "Round 1 (Rough Cut)",
    timecode: "00:02:45:00",
    note: "Background music is too loud over host dialogue here. Lower music by -3 dB.",
    priority: "Critical",
    category: "Audio",
    status: "In Progress",
  },
  {
    id: "r3",
    round: "Round 2 (Color & GFX)",
    timecode: "00:03:10:18",
    note: "Typo in the feature spec card: change '1080p' to '4K 60fps'.",
    priority: "Critical",
    category: "Graphics/Text",
    status: "Pending",
  },
];

const DEFAULT_MILESTONES: MilestoneItem[] = [
  { id: "m1", title: "Media Ingest & Proxy Sync", deadlineDate: "2026-11-02", completed: true },
  { id: "m2", title: "V1 Rough Cut Assembly", deadlineDate: "2026-11-05", completed: false },
  { id: "m3", title: "Client Revision Window", deadlineDate: "2026-11-08", completed: false },
  { id: "m4", title: "Color Grade & Sound Mix V2", deadlineDate: "2026-11-10", completed: false },
  { id: "m5", title: "Final 4K Master Delivery", deadlineDate: "2026-11-12", completed: false },
];

export default function EditingProjectPlannerTool() {
  const [activeTab, setActiveTab] = useState<PlannerTab>("shots");

  // Project Meta
  const [projectName, setProjectName] = useState<string>("SaaS Product Launch Reel 4K");
  const [projectType, setProjectType] = useState<string>("Commercial / Ad");
  const [clientName, setClientName] = useState<string>("CompX Technologies");
  const [targetDuration, setTargetDuration] = useState<string>("03:45");
  const [finalDeadline, setFinalDeadline] = useState<string>("2026-11-12");

  // Data Collections
  const [shots, setShots] = useState<ShotItem[]>(DEFAULT_SHOTS);
  const [scenes, setScenes] = useState<SceneItem[]>(DEFAULT_SCENES);
  const [checklist, setChecklist] = useState<ChecklistItem[]>(DEFAULT_CHECKLIST);
  const [revisions, setRevisions] = useState<RevisionItem[]>(DEFAULT_REVISIONS);
  const [milestones, setMilestones] = useState<MilestoneItem[]>(DEFAULT_MILESTONES);

  const [copiedNotification, setCopiedNotification] = useState<string | null>(null);

  // New item form toggles / states
  const [newShot, setNewShot] = useState<Partial<ShotItem>>({
    shotNumber: "1.3",
    sceneNumber: "SC 01",
    shotType: "Close-Up (CU)",
    movement: "Static",
    angle: "Eye Level",
    description: "",
    audioNote: "",
    equipment: "",
    status: "To Shoot",
  });

  const [newScene, setNewScene] = useState<Partial<SceneItem>>({
    sceneNumber: "04",
    heading: "INT. STUDIO - DAY",
    targetDuration: "01:00",
    synopsis: "",
    talent: "",
    graphics: "",
    sfx: "",
    lutColor: "",
  });

  const [newRevision, setNewRevision] = useState<Partial<RevisionItem>>({
    round: "Round 1",
    timecode: "00:00:00:00",
    note: "",
    priority: "Major",
    category: "Video Cut",
    status: "Pending",
  });

  const [newChecklistTask, setNewChecklistTask] = useState<string>("");
  const [newChecklistStage, setNewChecklistStage] = useState<string>("1. Ingest & Prep");

  const [newMilestoneTitle, setNewMilestoneTitle] = useState<string>("");
  const [newMilestoneDate, setNewMilestoneDate] = useState<string>("");

  // LocalStorage Persistence
  useEffect(() => {
    try {
      const saved = localStorage.getItem("orbit_editing_planner_data");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.projectName) setProjectName(parsed.projectName);
        if (parsed.projectType) setProjectType(parsed.projectType);
        if (parsed.clientName) setClientName(parsed.clientName);
        if (parsed.targetDuration) setTargetDuration(parsed.targetDuration);
        if (parsed.finalDeadline) setFinalDeadline(parsed.finalDeadline);
        if (parsed.shots) setShots(parsed.shots);
        if (parsed.scenes) setScenes(parsed.scenes);
        if (parsed.checklist) setChecklist(parsed.checklist);
        if (parsed.revisions) setRevisions(parsed.revisions);
        if (parsed.milestones) setMilestones(parsed.milestones);
      }
    } catch {
      // Ignore storage error
    }
  }, []);

  const saveToLocalStorage = () => {
    try {
      const payload = {
        projectName,
        projectType,
        clientName,
        targetDuration,
        finalDeadline,
        shots,
        scenes,
        checklist,
        revisions,
        milestones,
      };
      localStorage.setItem("orbit_editing_planner_data", JSON.stringify(payload));
      setCopiedNotification("Project Plan Autosaved to Browser!");
      setTimeout(() => setCopiedNotification(null), 2500);
    } catch {
      // Ignore
    }
  };

  // Checklist Completion Stats
  const checklistStats = useMemo(() => {
    const total = checklist.length;
    const completed = checklist.filter((c) => c.completed).length;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, percent };
  }, [checklist]);

  // Days remaining calculation
  const deadlineDaysRemaining = useMemo(() => {
    if (!finalDeadline) return null;
    const target = new Date(finalDeadline).getTime();
    const now = new Date().getTime();
    const diffDays = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
    return diffDays;
  }, [finalDeadline]);

  // Add Shot
  const handleAddShot = () => {
    if (!newShot.description) return;
    const item: ShotItem = {
      id: "shot_" + Date.now(),
      shotNumber: newShot.shotNumber || "1.0",
      sceneNumber: newShot.sceneNumber || "SC 01",
      shotType: newShot.shotType || "Wide Shot (WS)",
      movement: newShot.movement || "Static",
      angle: newShot.angle || "Eye Level",
      description: newShot.description,
      audioNote: newShot.audioNote || "Boom / Lav",
      equipment: newShot.equipment || "Standard Lens",
      status: (newShot.status as ShotItem["status"]) || "To Shoot",
    };
    setShots((prev) => [...prev, item]);
    setNewShot({
      shotNumber: (parseFloat(item.shotNumber) + 0.1).toFixed(1),
      sceneNumber: item.sceneNumber,
      shotType: "Close-Up (CU)",
      movement: "Static",
      angle: "Eye Level",
      description: "",
      audioNote: "",
      equipment: "",
      status: "To Shoot",
    });
  };

  // Delete Shot
  const handleDeleteShot = (id: string) => {
    setShots((prev) => prev.filter((s) => s.id !== id));
  };

  // Add Scene
  const handleAddScene = () => {
    if (!newScene.heading) return;
    const item: SceneItem = {
      id: "sc_" + Date.now(),
      sceneNumber: newScene.sceneNumber || "01",
      heading: newScene.heading,
      targetDuration: newScene.targetDuration || "01:00",
      synopsis: newScene.synopsis || "",
      talent: newScene.talent || "",
      graphics: newScene.graphics || "",
      sfx: newScene.sfx || "",
      lutColor: newScene.lutColor || "",
    };
    setScenes((prev) => [...prev, item]);
    setNewScene({
      sceneNumber: (parseInt(item.sceneNumber, 10) + 1).toString().padStart(2, "0"),
      heading: "INT. LOCATION - DAY",
      targetDuration: "01:00",
      synopsis: "",
      talent: "",
      graphics: "",
      sfx: "",
      lutColor: "",
    });
  };

  // Delete Scene
  const handleDeleteScene = (id: string) => {
    setScenes((prev) => prev.filter((s) => s.id !== id));
  };

  // Toggle Checklist
  const handleToggleChecklist = (id: string) => {
    setChecklist((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  // Add Revision
  const handleAddRevision = () => {
    if (!newRevision.note) return;
    const item: RevisionItem = {
      id: "rev_" + Date.now(),
      round: newRevision.round || "Round 1",
      timecode: newRevision.timecode || "00:00:00:00",
      note: newRevision.note,
      priority: (newRevision.priority as RevisionItem["priority"]) || "Major",
      category: (newRevision.category as RevisionItem["category"]) || "Video Cut",
      status: (newRevision.status as RevisionItem["status"]) || "Pending",
    };
    setRevisions((prev) => [...prev, item]);
    setNewRevision({
      round: item.round,
      timecode: "00:00:00:00",
      note: "",
      priority: "Major",
      category: "Video Cut",
      status: "Pending",
    });
  };

  // Update Revision Status
  const handleUpdateRevisionStatus = (id: string, status: RevisionItem["status"]) => {
    setRevisions((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status } : r))
    );
  };

  // Copy Markdown Project Summary
  const copyMarkdownSummary = () => {
    let md = `# Video Editing Project Plan: ${projectName}\n`;
    md += `**Client:** ${clientName} | **Type:** ${projectType} | **Target Duration:** ${targetDuration} | **Deadline:** ${finalDeadline}\n\n`;
    md += `## 1. Post-Production Progress: ${checklistStats.percent}% (${checklistStats.completed}/${checklistStats.total} Tasks)\n\n`;
    md += `## 2. Shot List (${shots.length} Shots)\n`;
    shots.forEach((s) => {
      md += `- [${s.status}] **Shot ${s.shotNumber}** (${s.shotType}, ${s.movement}): ${s.description} | Gear: ${s.equipment}\n`;
    });
    md += `\n## 3. Client Revision Notes (${revisions.length} Items)\n`;
    revisions.forEach((r) => {
      md += `- [${r.status}] **${r.timecode}** (${r.priority} / ${r.category}): ${r.note}\n`;
    });

    navigator.clipboard.writeText(md);
    setCopiedNotification("Project Plan copied as Markdown for Notion / Slack!");
    setTimeout(() => setCopiedNotification(null), 2500);
  };

  // CSV Export for Shot List
  const exportShotsCSV = () => {
    let csv = "Shot Number,Scene,Shot Type,Movement,Angle,Equipment,Action Description,Audio Note,Status\n";
    shots.forEach((s) => {
      const escape = (str: string) => `"${(str || "").replace(/"/g, '""')}"`;
      csv += `${escape(s.shotNumber)},${escape(s.sceneNumber)},${escape(s.shotType)},${escape(s.movement)},${escape(s.angle)},${escape(s.equipment)},${escape(s.description)},${escape(s.audioNote)},${escape(s.status)}\n`;
    });
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${projectName.toLowerCase().replace(/[^a-z0-9]/g, "_")}_shot_list.csv`;
    link.click();
    URL.revokeObjectURL(url);
    setCopiedNotification("Shot list exported as CSV!");
    setTimeout(() => setCopiedNotification(null), 2500);
  };

  // CSV Export for Client Revisions
  const exportRevisionsCSV = () => {
    let csv = "Timecode,Round,Category,Priority,Feedback Note,Status\n";
    revisions.forEach((r) => {
      const escape = (str: string) => `"${(str || "").replace(/"/g, '""')}"`;
      csv += `${escape(r.timecode)},${escape(r.round)},${escape(r.category)},${escape(r.priority)},${escape(r.note)},${escape(r.status)}\n`;
    });
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${projectName.toLowerCase().replace(/[^a-z0-9]/g, "_")}_revisions.csv`;
    link.click();
    URL.revokeObjectURL(url);
    setCopiedNotification("Client revisions exported as CSV!");
    setTimeout(() => setCopiedNotification(null), 2500);
  };

  // Add Custom Checklist Task
  const handleAddCustomTask = () => {
    if (!newChecklistTask.trim()) return;
    const item: ChecklistItem = {
      id: "cust_" + Date.now(),
      stage: newChecklistStage,
      task: newChecklistTask.trim(),
      completed: false,
    };
    setChecklist((prev) => [...prev, item]);
    setNewChecklistTask("");
    setCopiedNotification("Custom checklist task added!");
    setTimeout(() => setCopiedNotification(null), 2500);
  };

  // Add Custom Milestone
  const handleAddMilestone = () => {
    if (!newMilestoneTitle.trim() || !newMilestoneDate) return;
    const item: MilestoneItem = {
      id: "ms_" + Date.now(),
      title: newMilestoneTitle.trim(),
      deadlineDate: newMilestoneDate,
      completed: false,
    };
    setMilestones((prev) => [...prev, item]);
    setNewMilestoneTitle("");
    setNewMilestoneDate("");
    setCopiedNotification("New project milestone added!");
    setTimeout(() => setCopiedNotification(null), 2500);
  };

  // Template Loader
  const loadTemplate = (type: "youtube" | "commercial" | "film") => {
    if (type === "youtube") {
      setProjectName("10-Min Tech Review Video");
      setProjectType("YouTube Video");
      setTargetDuration("10:30");
      setShots([
        { id: "y1", shotNumber: "1.1", sceneNumber: "SC 01", shotType: "Medium Shot (MS)", movement: "Static", angle: "Eye Level", description: "Hook & Product reveal directly to camera.", audioNote: "Main Lav Mic", equipment: "35mm f/1.4", status: "Approved" },
        { id: "y2", shotNumber: "1.2", sceneNumber: "SC 01", shotType: "Close-Up B-roll", movement: "Gimbal 360", angle: "Low Angle", description: "Product rotating on lighted turntable.", audioNote: "Swoosh SFX", equipment: "50mm Macro", status: "In Timeline" },
        { id: "y3", shotNumber: "2.1", sceneNumber: "SC 02", shotType: "Screen Capture", movement: "Static", angle: "Direct", description: "Software benchmark test results on screen.", audioNote: "Clean VO", equipment: "4K Capture Card", status: "To Shoot" },
      ]);
    } else if (type === "commercial") {
      setProjectName("30-Sec Brand Commercial Spot");
      setProjectType("Commercial / Ad");
      setTargetDuration("00:30");
      setShots(DEFAULT_SHOTS);
    } else {
      setProjectName("Indie Narrative Short Film");
      setProjectType("Short Film");
      setTargetDuration("12:00");
    }
    setCopiedNotification(`Loaded ${type.toUpperCase()} workflow preset!`);
    setTimeout(() => setCopiedNotification(null), 2500);
  };

  return (
    <div className="w-full space-y-8">
      {/* Project Master Bar Card */}
      <div className="rounded-3xl border border-[#26332d] bg-gradient-to-b from-[#101813] to-[#080e0b] p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-[#213026]">
          {/* Title & Type */}
          <div className="space-y-2 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#4a2254] bg-[#24132e] px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider text-[#c084fc]">
                <Film className="h-3 w-3" /> Post-Production Command Center
              </span>
              <span className="text-xs text-[#8da195] font-mono">
                Autosaves to local storage
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="text-xl sm:text-2xl font-black text-[#e7eee9] bg-transparent border-b border-transparent hover:border-[#29392f] focus:border-[#3cff5f] focus:outline-none transition-all"
                placeholder="Enter Project Title..."
              />
            </div>
          </div>

          {/* Quick Actions & Templates */}
          <div className="flex flex-wrap items-center gap-2 self-start lg:self-center">
            <button
              type="button"
              onClick={saveToLocalStorage}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#2a5234] bg-[#102a16] px-3.5 py-2 text-xs font-semibold text-[#3cff5f] hover:bg-[#16381e] transition-all cursor-pointer"
            >
              <Save className="h-3.5 w-3.5" />
              <span>Save Plan</span>
            </button>

            <button
              type="button"
              onClick={copyMarkdownSummary}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#29392f] bg-[#0c1510] px-3.5 py-2 text-xs font-semibold text-[#afbeb4] hover:border-[#3cff5f] hover:text-[#e7eee9] transition-all cursor-pointer"
            >
              <Copy className="h-3.5 w-3.5" />
              <span>Copy Markdown</span>
            </button>

            <button
              type="button"
              onClick={exportShotsCSV}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#1b3d45] bg-[#0c242b] px-3.5 py-2 text-xs font-semibold text-[#52e2ec] hover:bg-[#12343b] transition-all cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Shots CSV</span>
            </button>

            <button
              type="button"
              onClick={exportRevisionsCSV}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#4d3c16] bg-[#261f0c] px-3.5 py-2 text-xs font-semibold text-[#fbbf24] hover:bg-[#382d12] transition-all cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Revisions CSV</span>
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#29392f] bg-[#0c1510] px-3.5 py-2 text-xs font-semibold text-[#afbeb4] hover:border-[#3cff5f] hover:text-[#e7eee9] transition-all cursor-pointer"
            >
              <Film className="h-3.5 w-3.5" />
              <span>Print Call Sheet</span>
            </button>

            {/* Template Dropdown */}
            <div className="flex items-center gap-1 text-xs text-[#8da195]">
              <span className="ml-2 font-mono">Presets:</span>
              <button
                type="button"
                onClick={() => loadTemplate("youtube")}
                className="rounded-lg border border-[#26332d] bg-[#0a120d] px-2.5 py-1 text-[11px] font-mono text-[#afbeb4] hover:text-[#3cff5f] hover:border-[#3cff5f] cursor-pointer"
              >
                YouTube
              </button>
              <button
                type="button"
                onClick={() => loadTemplate("commercial")}
                className="rounded-lg border border-[#26332d] bg-[#0a120d] px-2.5 py-1 text-[11px] font-mono text-[#afbeb4] hover:text-[#3cff5f] hover:border-[#3cff5f] cursor-pointer"
              >
                Ad/Spot
              </button>
            </div>
          </div>
        </div>

        {/* Quick Project Specs Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
          <div className="rounded-2xl border border-[#213026] bg-[#09120d] p-3.5">
            <span className="text-[10px] font-mono uppercase text-[#8da195] block mb-1">
              Client / Channel
            </span>
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="w-full bg-transparent text-xs font-bold text-[#e7eee9] focus:outline-none"
            />
          </div>

          <div className="rounded-2xl border border-[#213026] bg-[#09120d] p-3.5">
            <span className="text-[10px] font-mono uppercase text-[#8da195] block mb-1">
              Target Duration
            </span>
            <input
              type="text"
              value={targetDuration}
              onChange={(e) => setTargetDuration(e.target.value)}
              className="w-full bg-transparent text-xs font-mono font-bold text-[#3cff5f] focus:outline-none"
            />
          </div>

          <div className="rounded-2xl border border-[#213026] bg-[#09120d] p-3.5">
            <span className="text-[10px] font-mono uppercase text-[#8da195] block mb-1">
              Editing Progress
            </span>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 rounded-full bg-[#16241a] overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-[#3cff5f] transition-all duration-300"
                  style={{ width: `${checklistStats.percent}%` }}
                />
              </div>
              <span className="text-xs font-mono font-bold text-[#3cff5f]">
                {checklistStats.percent}%
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-[#213026] bg-[#09120d] p-3.5">
            <span className="text-[10px] font-mono uppercase text-[#8da195] block mb-1">
              Final Deadline
            </span>
            <div className="flex items-center justify-between">
              <input
                type="date"
                value={finalDeadline}
                onChange={(e) => setFinalDeadline(e.target.value)}
                className="bg-transparent text-xs font-mono text-[#e7eee9] focus:outline-none"
              />
              {deadlineDaysRemaining !== null && (
                <span
                  className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                    deadlineDaysRemaining > 3
                      ? "bg-[#102a16] text-[#3cff5f]"
                      : deadlineDaysRemaining >= 0
                      ? "bg-[#2b210a] text-[#fbbf24]"
                      : "bg-[#2b1215] text-[#f87171]"
                  }`}
                >
                  {deadlineDaysRemaining > 0
                    ? `${deadlineDaysRemaining}d left`
                    : deadlineDaysRemaining === 0
                    ? "Due Today"
                    : "Overdue"}
                </span>
              )}
            </div>
          </div>
        </div>

        {copiedNotification && (
          <div className="mt-4 rounded-xl border border-[#2a5234] bg-[#0d2616] p-3 text-xs font-semibold text-[#3cff5f] flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{copiedNotification}</span>
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2 rounded-2xl border border-[#26332d] bg-[#0c1510] p-2">
        <button
          type="button"
          onClick={() => setActiveTab("shots")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
            activeTab === "shots"
              ? "border border-[#3cff5f] bg-[#102a16] text-[#3cff5f] shadow-[0_0_15px_rgba(60,255,95,0.15)]"
              : "text-[#9baaa1] hover:bg-[#121f17] hover:text-[#e7eee9]"
          }`}
        >
          <Camera className="h-4 w-4" />
          <span>Shot List ({shots.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("scenes")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
            activeTab === "scenes"
              ? "border border-[#52e2ec] bg-[#0c242b] text-[#52e2ec] shadow-[0_0_15px_rgba(82,226,236,0.15)]"
              : "text-[#9baaa1] hover:bg-[#121f17] hover:text-[#e7eee9]"
          }`}
        >
          <Layers className="h-4 w-4" />
          <span>Scene Breakdown ({scenes.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("checklist")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
            activeTab === "checklist"
              ? "border border-[#c084fc] bg-[#24132e] text-[#c084fc] shadow-[0_0_15px_rgba(192,132,252,0.15)]"
              : "text-[#9baaa1] hover:bg-[#121f17] hover:text-[#e7eee9]"
          }`}
        >
          <CheckSquare className="h-4 w-4" />
          <span>Editing Checklist ({checklistStats.percent}%)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("revisions")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
            activeTab === "revisions"
              ? "border border-[#fbbf24] bg-[#261e0b] text-[#fbbf24] shadow-[0_0_15px_rgba(251,191,36,0.15)]"
              : "text-[#9baaa1] hover:bg-[#121f17] hover:text-[#e7eee9]"
          }`}
        >
          <MessageSquare className="h-4 w-4" />
          <span>Client Revisions ({revisions.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("deadlines")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
            activeTab === "deadlines"
              ? "border border-[#f472b6] bg-[#2b1220] text-[#f472b6] shadow-[0_0_15px_rgba(244,114,182,0.15)]"
              : "text-[#9baaa1] hover:bg-[#121f17] hover:text-[#e7eee9]"
          }`}
        >
          <Calendar className="h-4 w-4" />
          <span>Milestones &amp; Deadlines</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: SHOT LIST GENERATOR */}
      {/* ========================================================================= */}
      {activeTab === "shots" && (
        <div className="space-y-6">
          {/* Add Shot Card */}
          <div className="rounded-3xl border border-[#26332d] bg-[#0c1510] p-6 shadow-md">
            <h3 className="text-base font-bold text-[#e7eee9] mb-4 flex items-center gap-2">
              <Plus className="h-4 w-4 text-[#3cff5f]" />
              <span>Add New Shot to Plan</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
              <div>
                <label className="text-[11px] font-mono text-[#8da195] block mb-1">Shot #</label>
                <input
                  type="text"
                  value={newShot.shotNumber}
                  onChange={(e) => setNewShot({ ...newShot, shotNumber: e.target.value })}
                  className="w-full rounded-xl border border-[#26332d] bg-[#070e0a] p-2 text-xs font-mono text-[#e7eee9]"
                  placeholder="1.1"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono text-[#8da195] block mb-1">Scene</label>
                <input
                  type="text"
                  value={newShot.sceneNumber}
                  onChange={(e) => setNewShot({ ...newShot, sceneNumber: e.target.value })}
                  className="w-full rounded-xl border border-[#26332d] bg-[#070e0a] p-2 text-xs font-mono text-[#e7eee9]"
                  placeholder="SC 01"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono text-[#8da195] block mb-1">Shot Type</label>
                <select
                  value={newShot.shotType}
                  onChange={(e) => setNewShot({ ...newShot, shotType: e.target.value })}
                  className="w-full rounded-xl border border-[#26332d] bg-[#070e0a] p-2 text-xs text-[#e7eee9]"
                >
                  <option>Wide Shot (WS)</option>
                  <option>Medium Shot (MS)</option>
                  <option>Medium Close-Up (MCU)</option>
                  <option>Close-Up (CU)</option>
                  <option>Extreme Close-Up (ECU)</option>
                  <option>Over the Shoulder (OTS)</option>
                  <option>POV / First Person</option>
                  <option>Aerial / Drone</option>
                  <option>Insert / Cutaway</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-mono text-[#8da195] block mb-1">Movement</label>
                <select
                  value={newShot.movement}
                  onChange={(e) => setNewShot({ ...newShot, movement: e.target.value })}
                  className="w-full rounded-xl border border-[#26332d] bg-[#070e0a] p-2 text-xs text-[#e7eee9]"
                >
                  <option>Static / Tripod</option>
                  <option>Slow Push-In</option>
                  <option>Pull-Back</option>
                  <option>Pan Left/Right</option>
                  <option>Dolly / Tracking</option>
                  <option>Gimbal 360</option>
                  <option>Handheld Parallax</option>
                  <option>Speed Ramp</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-mono text-[#8da195] block mb-1">Equipment</label>
                <input
                  type="text"
                  value={newShot.equipment}
                  onChange={(e) => setNewShot({ ...newShot, equipment: e.target.value })}
                  className="w-full rounded-xl border border-[#26332d] bg-[#070e0a] p-2 text-xs text-[#e7eee9]"
                  placeholder="35mm f/1.8"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono text-[#8da195] block mb-1">Status</label>
                <select
                  value={newShot.status}
                  onChange={(e) =>
                    setNewShot({ ...newShot, status: e.target.value as ShotItem["status"] })
                  }
                  className="w-full rounded-xl border border-[#26332d] bg-[#070e0a] p-2 text-xs text-[#3cff5f]"
                >
                  <option>To Shoot</option>
                  <option>Filmed</option>
                  <option>In Timeline</option>
                  <option>Approved</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="md:col-span-3">
                <input
                  type="text"
                  value={newShot.description}
                  onChange={(e) => setNewShot({ ...newShot, description: e.target.value })}
                  placeholder="Shot action / visual description (e.g. Host unboxes camera, cinematic soft lighting)..."
                  className="w-full rounded-xl border border-[#26332d] bg-[#070e0a] p-2.5 text-xs text-[#e7eee9] focus:border-[#3cff5f] focus:outline-none"
                />
              </div>
              <div>
                <button
                  type="button"
                  onClick={handleAddShot}
                  className="w-full h-full rounded-xl border border-[#3cff5f] bg-[#102a16] px-4 py-2 text-xs font-bold text-[#3cff5f] hover:bg-[#16381e] transition-colors cursor-pointer"
                >
                  + Add Shot
                </button>
              </div>
            </div>
          </div>

          {/* Shot Cards List */}
          <div className="space-y-3">
            {shots.map((shot) => (
              <div
                key={shot.id}
                className="group flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl border border-[#26332d] bg-[#0c1510] p-4.5 hover:border-[#395a43] transition-all"
              >
                <div className="flex items-start gap-3.5 flex-1">
                  <div className="flex flex-col items-center justify-center rounded-xl border border-[#26332d] bg-[#101813] h-12 w-14 shrink-0 font-mono">
                    <span className="text-[10px] text-[#8da195]">{shot.sceneNumber}</span>
                    <span className="text-sm font-bold text-[#3cff5f]">{shot.shotNumber}</span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold text-[#e7eee9]">{shot.shotType}</span>
                      <span className="text-[#334538]">•</span>
                      <span className="text-[11px] text-[#52e2ec] font-mono">{shot.movement}</span>
                      <span className="text-[#334538]">•</span>
                      <span className="text-[11px] text-[#afbeb4] font-mono">{shot.equipment}</span>
                    </div>
                    <p className="text-xs text-[#9baaa1] leading-relaxed">{shot.description}</p>
                    {shot.audioNote && (
                      <span className="text-[10px] text-[#697d70] font-mono block">
                        Audio: {shot.audioNote}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end md:self-center">
                  <select
                    value={shot.status}
                    onChange={(e) => {
                      const nextStatus = e.target.value as ShotItem["status"];
                      setShots((prev) =>
                        prev.map((s) => (s.id === shot.id ? { ...s, status: nextStatus } : s))
                      );
                    }}
                    className={`rounded-full px-3 py-1 text-[11px] font-semibold border cursor-pointer ${
                      shot.status === "Approved"
                        ? "border-[#2a5234] bg-[#102a16] text-[#3cff5f]"
                        : shot.status === "In Timeline"
                        ? "border-[#1b3d45] bg-[#0a1e24] text-[#52e2ec]"
                        : shot.status === "Filmed"
                        ? "border-[#4a2254] bg-[#24132e] text-[#c084fc]"
                        : "border-[#4d3c16] bg-[#261f0c] text-[#fbbf24]"
                    }`}
                  >
                    <option>To Shoot</option>
                    <option>Filmed</option>
                    <option>In Timeline</option>
                    <option>Approved</option>
                  </select>

                  <button
                    type="button"
                    onClick={() => handleDeleteShot(shot.id)}
                    className="p-1.5 rounded-lg text-[#8da195] hover:text-[#f87171] hover:bg-[#2b1215] transition-colors"
                    title="Delete shot"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: SCENE BREAKDOWN */}
      {/* ========================================================================= */}
      {activeTab === "scenes" && (
        <div className="space-y-6">
          {/* Add Scene Card */}
          <div className="rounded-3xl border border-[#26332d] bg-[#0c1510] p-6 shadow-md">
            <h3 className="text-base font-bold text-[#e7eee9] mb-4 flex items-center gap-2">
              <Plus className="h-4 w-4 text-[#52e2ec]" />
              <span>Add Scene to Breakdown</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-3">
              <div>
                <label className="text-[11px] font-mono text-[#8da195] block mb-1">Scene #</label>
                <input
                  type="text"
                  value={newScene.sceneNumber}
                  onChange={(e) => setNewScene({ ...newScene, sceneNumber: e.target.value })}
                  className="w-full rounded-xl border border-[#26332d] bg-[#070e0a] p-2 text-xs font-mono text-[#e7eee9]"
                  placeholder="04"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-[11px] font-mono text-[#8da195] block mb-1">
                  Scene Slugline / Heading
                </label>
                <input
                  type="text"
                  value={newScene.heading}
                  onChange={(e) => setNewScene({ ...newScene, heading: e.target.value })}
                  className="w-full rounded-xl border border-[#26332d] bg-[#070e0a] p-2 text-xs font-bold text-[#52e2ec]"
                  placeholder="INT. STUDIO - DAY"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono text-[#8da195] block mb-1">Target Runtime</label>
                <input
                  type="text"
                  value={newScene.targetDuration}
                  onChange={(e) => setNewScene({ ...newScene, targetDuration: e.target.value })}
                  className="w-full rounded-xl border border-[#26332d] bg-[#070e0a] p-2 text-xs font-mono text-[#3cff5f]"
                  placeholder="01:30"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
              <input
                type="text"
                value={newScene.synopsis}
                onChange={(e) => setNewScene({ ...newScene, synopsis: e.target.value })}
                placeholder="Scene action synopsis / key takeaway..."
                className="rounded-xl border border-[#26332d] bg-[#070e0a] p-2.5 text-xs text-[#e7eee9]"
              />
              <input
                type="text"
                value={newScene.graphics}
                onChange={(e) => setNewScene({ ...newScene, graphics: e.target.value })}
                placeholder="Motion graphics / VFX needed..."
                className="rounded-xl border border-[#26332d] bg-[#070e0a] p-2.5 text-xs text-[#e7eee9]"
              />
              <input
                type="text"
                value={newScene.lutColor}
                onChange={(e) => setNewScene({ ...newScene, lutColor: e.target.value })}
                placeholder="Color Grade / LUT mood..."
                className="rounded-xl border border-[#26332d] bg-[#070e0a] p-2.5 text-xs text-[#e7eee9]"
              />
            </div>

            <button
              type="button"
              onClick={handleAddScene}
              className="rounded-xl border border-[#52e2ec] bg-[#0c242b] px-5 py-2 text-xs font-bold text-[#52e2ec] hover:bg-[#12343b] transition-colors cursor-pointer"
            >
              + Add Scene
            </button>
          </div>

          {/* Scene Breakdown Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {scenes.map((scene) => (
              <div
                key={scene.id}
                className="rounded-2xl border border-[#26332d] bg-[#0c1510] p-5 space-y-3 relative group"
              >
                <div className="flex items-center justify-between border-b border-[#213026] pb-3">
                  <div className="flex items-center gap-2">
                    <span className="rounded-md border border-[#1b3d45] bg-[#0d262b] px-2 py-0.5 text-xs font-mono font-bold text-[#52e2ec]">
                      SC {scene.sceneNumber}
                    </span>
                    <h4 className="text-sm font-bold text-[#e7eee9]">{scene.heading}</h4>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-[#3cff5f]">
                      {scene.targetDuration}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeleteScene(scene.id)}
                      className="text-[#8da195] hover:text-[#f87171] p-1"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-[#afbeb4] leading-relaxed">{scene.synopsis}</p>

                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono pt-2 border-t border-[#1b2720]">
                  <div className="text-[#8da195]">
                    <span className="text-[#697d70] block">VFX / Graphics:</span>
                    <span className="text-[#e7eee9]">{scene.graphics || "None"}</span>
                  </div>
                  <div className="text-[#8da195]">
                    <span className="text-[#697d70] block">Color Mood:</span>
                    <span className="text-[#c084fc]">{scene.lutColor || "Standard"}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: EDITING CHECKLIST */}
      {/* ========================================================================= */}
      {activeTab === "checklist" && (
        <div className="space-y-6">
          <div className="rounded-3xl border border-[#26332d] bg-[#0c1510] p-6 shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-[#213026]">
              <div>
                <h3 className="text-base font-bold text-[#e7eee9] flex items-center gap-2">
                  <CheckSquare className="h-4 w-4 text-[#c084fc]" />
                  <span>Standard Post-Production Workflow Pipeline</span>
                </h3>
                <p className="text-xs text-[#9baaa1]">
                  Industry-standard stages from proxy creation to -14 LUFS audio mastering.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-[#3cff5f] font-bold">
                  {checklistStats.completed} of {checklistStats.total} Done
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setChecklist((prev) => prev.map((item) => ({ ...item, completed: true })))
                  }
                  className="rounded-lg border border-[#26332d] bg-[#101813] px-2.5 py-1 text-xs text-[#afbeb4] hover:text-[#3cff5f] transition-colors"
                >
                  Check All
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setChecklist((prev) => prev.map((item) => ({ ...item, completed: false })))
                  }
                  className="rounded-lg border border-[#26332d] bg-[#101813] px-2.5 py-1 text-xs text-[#afbeb4] hover:text-[#f87171] transition-colors"
                >
                  Reset
                </button>
              </div>
            </div>

            {/* Checklist Items Grouped by Stage */}
            <div className="space-y-6">
              {[
                "1. Ingest & Prep",
                "2. Assembly & Rough Cut",
                "3. Fine Cut & Motion",
                "4. Audio Post",
                "5. Color & Master QC",
              ].map((stageName) => {
                const stageItems = checklist.filter((c) => c.stage === stageName);
                if (stageItems.length === 0) return null;

                return (
                  <div key={stageName} className="space-y-2">
                    <span className="text-xs font-mono font-bold text-[#c084fc] uppercase tracking-wider block">
                      {stageName}
                    </span>

                    <div className="space-y-1.5">
                      {stageItems.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => handleToggleChecklist(item.id)}
                          className={`flex items-center justify-between rounded-xl border p-3 cursor-pointer transition-all ${
                            item.completed
                              ? "border-[#2a5234] bg-[#0c1a11]/90 text-[#3cff5f]"
                              : "border-[#26332d] bg-[#070e0a] text-[#afbeb4] hover:border-[#395a43]"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={item.completed}
                              onChange={() => {}}
                              className="h-4 w-4 rounded accent-[#3cff5f] cursor-pointer"
                            />
                            <span
                              className={`text-xs ${
                                item.completed ? "line-through opacity-70 text-[#8da195]" : "font-medium text-[#e7eee9]"
                              }`}
                            >
                              {item.task}
                            </span>
                          </div>

                          {item.completed && (
                            <span className="text-[10px] font-mono text-[#3cff5f] font-semibold">
                              Done ✓
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Add Custom Task Form */}
            <div className="flex flex-col sm:flex-row gap-2 pt-6 mt-6 border-t border-[#213026]">
              <select
                value={newChecklistStage}
                onChange={(e) => setNewChecklistStage(e.target.value)}
                className="rounded-xl border border-[#26332d] bg-[#070e0a] p-2 text-xs text-[#c084fc] font-mono"
              >
                <option>1. Ingest & Prep</option>
                <option>2. Assembly & Rough Cut</option>
                <option>3. Fine Cut & Motion</option>
                <option>4. Audio Post</option>
                <option>5. Color & Master QC</option>
              </select>
              <input
                type="text"
                value={newChecklistTask}
                onChange={(e) => setNewChecklistTask(e.target.value)}
                placeholder="Add custom task (e.g. Export 9:16 TikTok cutdown, render LUT pack)..."
                className="flex-1 rounded-xl border border-[#26332d] bg-[#070e0a] p-2 text-xs text-[#e7eee9] focus:border-[#c084fc] focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddCustomTask}
                className="rounded-xl border border-[#c084fc] bg-[#24132e] px-4 py-2 text-xs font-bold text-[#c084fc] hover:bg-[#341b42] cursor-pointer"
              >
                + Add Task
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: CLIENT REVISION TRACKER */}
      {/* ========================================================================= */}
      {activeTab === "revisions" && (
        <div className="space-y-6">
          {/* Add Revision Form */}
          <div className="rounded-3xl border border-[#26332d] bg-[#0c1510] p-6 shadow-md">
            <h3 className="text-base font-bold text-[#e7eee9] mb-4 flex items-center gap-2">
              <Plus className="h-4 w-4 text-[#fbbf24]" />
              <span>Log Client Feedback / Timecode Revision</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-3">
              <div>
                <label className="text-[11px] font-mono text-[#8da195] block mb-1">Review Round</label>
                <select
                  value={newRevision.round}
                  onChange={(e) => setNewRevision({ ...newRevision, round: e.target.value })}
                  className="w-full rounded-xl border border-[#26332d] bg-[#070e0a] p-2 text-xs text-[#e7eee9]"
                >
                  <option>Round 1 (Rough Cut)</option>
                  <option>Round 2 (Color & GFX)</option>
                  <option>Round 3 (Final Polish)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-mono text-[#8da195] block mb-1">Timecode</label>
                <input
                  type="text"
                  value={newRevision.timecode}
                  onChange={(e) => setNewRevision({ ...newRevision, timecode: e.target.value })}
                  className="w-full rounded-xl border border-[#26332d] bg-[#070e0a] p-2 text-xs font-mono font-bold text-[#fbbf24]"
                  placeholder="00:01:24:10"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono text-[#8da195] block mb-1">Priority</label>
                <select
                  value={newRevision.priority}
                  onChange={(e) =>
                    setNewRevision({ ...newRevision, priority: e.target.value as RevisionItem["priority"] })
                  }
                  className="w-full rounded-xl border border-[#26332d] bg-[#070e0a] p-2 text-xs text-[#e7eee9]"
                >
                  <option>Critical</option>
                  <option>Major</option>
                  <option>Minor</option>
                  <option>Polish</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-mono text-[#8da195] block mb-1">Category</label>
                <select
                  value={newRevision.category}
                  onChange={(e) =>
                    setNewRevision({ ...newRevision, category: e.target.value as RevisionItem["category"] })
                  }
                  className="w-full rounded-xl border border-[#26332d] bg-[#070e0a] p-2 text-xs text-[#e7eee9]"
                >
                  <option>Video Cut</option>
                  <option>Audio</option>
                  <option>Graphics/Text</option>
                  <option>Color</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="sm:col-span-3">
                <input
                  type="text"
                  value={newRevision.note}
                  onChange={(e) => setNewRevision({ ...newRevision, note: e.target.value })}
                  placeholder="Client feedback note (e.g. Lower music volume here, swap B-roll clip)..."
                  className="w-full rounded-xl border border-[#26332d] bg-[#070e0a] p-2.5 text-xs text-[#e7eee9] focus:border-[#fbbf24] focus:outline-none"
                />
              </div>
              <div>
                <button
                  type="button"
                  onClick={handleAddRevision}
                  className="w-full h-full rounded-xl border border-[#fbbf24] bg-[#261f0c] px-4 py-2 text-xs font-bold text-[#fbbf24] hover:bg-[#382d12] transition-colors cursor-pointer"
                >
                  + Add Revision Note
                </button>
              </div>
            </div>
          </div>

          {/* Revisions List */}
          <div className="space-y-3">
            {revisions.map((rev) => (
              <div
                key={rev.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-[#26332d] bg-[#0c1510] p-4.5"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#fbbf24] bg-[#261f0c] px-2 py-0.5 rounded border border-[#4d3c16]">
                      {rev.timecode}
                    </span>
                    <span className="text-[11px] font-mono text-[#8da195]">{rev.round}</span>
                    <span className="text-[#334538]">•</span>
                    <span className="text-[11px] text-[#c084fc] font-mono">{rev.category}</span>
                    <span
                      className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                        rev.priority === "Critical"
                          ? "bg-[#2b1215] text-[#f87171] border border-[#4a2225]"
                          : "bg-[#261f0c] text-[#fbbf24]"
                      }`}
                    >
                      {rev.priority}
                    </span>
                  </div>

                  <p className="text-xs text-[#e7eee9] leading-relaxed">{rev.note}</p>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <select
                    value={rev.status}
                    onChange={(e) =>
                      handleUpdateRevisionStatus(rev.id, e.target.value as RevisionItem["status"])
                    }
                    className={`rounded-full px-3 py-1 text-xs font-semibold border cursor-pointer ${
                      rev.status === "Resolved"
                        ? "border-[#2a5234] bg-[#102a16] text-[#3cff5f]"
                        : rev.status === "In Progress"
                        ? "border-[#1b3d45] bg-[#0d262b] text-[#52e2ec]"
                        : "border-[#4d3c16] bg-[#261f0c] text-[#fbbf24]"
                    }`}
                  >
                    <option>Pending</option>
                    <option>In Progress</option>
                    <option>Resolved</option>
                  </select>

                  <button
                    type="button"
                    onClick={() => setRevisions((prev) => prev.filter((r) => r.id !== rev.id))}
                    className="p-1.5 rounded-lg text-[#8da195] hover:text-[#f87171]"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: MILESTONES & DEADLINE TRACKER */}
      {/* ========================================================================= */}
      {activeTab === "deadlines" && (
        <div className="space-y-6">
          <div className="rounded-3xl border border-[#26332d] bg-gradient-to-b from-[#101813] to-[#080e0b] p-6 sm:p-8 shadow-xl">
            <h3 className="text-base font-bold text-[#e7eee9] mb-1 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-[#f472b6]" />
              <span>Project Milestones &amp; Delivery Schedule</span>
            </h3>
            <p className="text-xs text-[#9baaa1] mb-6">
              Track video editing deliverables from rough cut to final master handoff.
            </p>

            <div className="space-y-3">
              {milestones.map((m, idx) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between p-4 rounded-2xl border border-[#26332d] bg-[#0c1510]"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-[#16221a] font-mono text-xs font-bold text-[#f472b6]">
                      {idx + 1}
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-[#e7eee9]">{m.title}</h4>
                      <span className="text-[11px] font-mono text-[#8da195]">
                        Due: {m.deadlineDate}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setMilestones((prev) =>
                        prev.map((item) =>
                          item.id === m.id ? { ...item, completed: !item.completed } : item
                        )
                      )
                    }
                    className={`rounded-full px-3 py-1 text-xs font-semibold border cursor-pointer ${
                      m.completed
                        ? "border-[#2a5234] bg-[#102a16] text-[#3cff5f]"
                        : "border-[#26332d] bg-[#070e0a] text-[#8da195]"
                    }`}
                  >
                    {m.completed ? "Delivered ✓" : "Pending"}
                  </button>
                </div>
              ))}
            </div>

            {/* Add Milestone Form */}
            <div className="flex flex-col sm:flex-row gap-3 pt-6 mt-6 border-t border-[#213026]">
              <input
                type="text"
                value={newMilestoneTitle}
                onChange={(e) => setNewMilestoneTitle(e.target.value)}
                placeholder="Milestone name (e.g. Colorist Round 1 Delivery)..."
                className="flex-1 rounded-xl border border-[#26332d] bg-[#070e0a] p-2.5 text-xs text-[#e7eee9] focus:border-[#f472b6] focus:outline-none"
              />
              <input
                type="date"
                value={newMilestoneDate}
                onChange={(e) => setNewMilestoneDate(e.target.value)}
                className="rounded-xl border border-[#26332d] bg-[#070e0a] p-2.5 text-xs text-[#e7eee9] focus:border-[#f472b6] focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddMilestone}
                className="rounded-xl border border-[#f472b6] bg-[#2b1220] px-4 py-2.5 text-xs font-bold text-[#f472b6] hover:bg-[#3d1a2d] cursor-pointer"
              >
                + Add Milestone
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
