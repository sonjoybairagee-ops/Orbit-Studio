"use client";

import React, { useState, useRef } from "react";
import {
  FileText,
  Download,
  Printer,
  Sparkles,
  Plus,
  Trash2,
  Upload,
  User,
  Briefcase,
  GraduationCap,
  Wrench,
  FolderGit2,
  Award,
  Languages,
  Check,
  Eye,
  RotateCcw,
  Palette,
  Type,
  Layout,
  ExternalLink,
  Mail,
  Phone,
  MapPin,
  Globe,
  ZoomIn,
  ZoomOut,
  Image as ImageIcon,
} from "lucide-react";
import {
  CvData,
  CvTemplateId,
  CV_TEMPLATES,
  THEME_COLORS,
  CV_FONTS,
  SAMPLE_MOTION_DESIGNER,
  SAMPLE_SOFTWARE_ENGINEER,
  SAMPLE_CREATIVE_DIRECTOR,
  BLANK_CV_DATA,
  WorkExperience,
  Education,
  SkillItem,
  ProjectItem,
  CertificateItem,
  LanguageItem,
} from "@/lib/cv-templates-data";

export default function CvMakerTool() {
  const [cv, setCv] = useState<CvData>(SAMPLE_MOTION_DESIGNER);
  const [activeTab, setActiveTab] = useState<"personal" | "experience" | "education" | "skills" | "projects" | "extras">("personal");
  const [zoom, setZoom] = useState<number>(100);
  const [status, setStatus] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const jsonInputRef = useRef<HTMLInputElement>(null);
  const cvPrintRef = useRef<HTMLDivElement>(null);

  // Helper updates
  const updatePersonal = (field: string, value: string) => {
    setCv((prev) => ({
      ...prev,
      personal: { ...prev.personal, [field]: value },
    }));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        updatePersonal("photoUrl", reader.result);
        setCv((prev) => ({ ...prev, showPhoto: true }));
        setStatus("Photo uploaded successfully!");
      }
    };
    reader.readAsDataURL(file);
  };

  // Experience handlers
  const addExperience = () => {
    const newExp: WorkExperience = {
      id: `exp-${Date.now()}`,
      position: "Job Position",
      company: "Company Name",
      location: "Location",
      startDate: "2023",
      endDate: "Present",
      isCurrent: true,
      highlights: ["Major accomplishment or key deliverable in this role."],
    };
    setCv((prev) => ({ ...prev, experience: [newExp, ...prev.experience] }));
  };

  const updateExperience = (id: string, field: keyof WorkExperience, value: any) => {
    setCv((prev) => ({
      ...prev,
      experience: prev.experience.map((exp) => (exp.id === id ? { ...exp, [field]: value } : exp)),
    }));
  };

  const removeExperience = (id: string) => {
    setCv((prev) => ({
      ...prev,
      experience: prev.experience.filter((exp) => exp.id !== id),
    }));
  };

  const addHighlight = (expId: string) => {
    setCv((prev) => ({
      ...prev,
      experience: prev.experience.map((exp) =>
        exp.id === expId ? { ...exp, highlights: [...exp.highlights, "Key contribution or milestone."] } : exp
      ),
    }));
  };

  const updateHighlight = (expId: string, idx: number, val: string) => {
    setCv((prev) => ({
      ...prev,
      experience: prev.experience.map((exp) => {
        if (exp.id !== expId) return exp;
        const newHl = [...exp.highlights];
        newHl[idx] = val;
        return { ...exp, highlights: newHl };
      }),
    }));
  };

  const removeHighlight = (expId: string, idx: number) => {
    setCv((prev) => ({
      ...prev,
      experience: prev.experience.map((exp) => {
        if (exp.id !== expId) return exp;
        return { ...exp, highlights: exp.highlights.filter((_, i) => i !== idx) };
      }),
    }));
  };

  // Education handlers
  const addEducation = () => {
    const newEdu: Education = {
      id: `edu-${Date.now()}`,
      degree: "Degree / Certificate",
      institution: "Institution Name",
      location: "Location",
      startYear: "2018",
      endYear: "2022",
    };
    setCv((prev) => ({ ...prev, education: [...prev.education, newEdu] }));
  };

  const updateEducation = (id: string, field: keyof Education, value: any) => {
    setCv((prev) => ({
      ...prev,
      education: prev.education.map((edu) => (edu.id === id ? { ...edu, [field]: value } : edu)),
    }));
  };

  const removeEducation = (id: string) => {
    setCv((prev) => ({
      ...prev,
      education: prev.education.filter((edu) => edu.id !== id),
    }));
  };

  // Skills handlers
  const [newSkillName, setNewSkillName] = useState<string>("");
  const addSkill = () => {
    if (!newSkillName.trim()) return;
    const newSkill: SkillItem = {
      name: newSkillName.trim(),
      level: "Advanced",
    };
    setCv((prev) => ({ ...prev, skills: [...prev.skills, newSkill] }));
    setNewSkillName("");
  };

  const removeSkill = (index: number) => {
    setCv((prev) => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index),
    }));
  };

  // Projects handlers
  const addProject = () => {
    const newProj: ProjectItem = {
      id: `proj-${Date.now()}`,
      name: "Project Name",
      role: "Lead Creator",
      link: "https://example.com",
      description: "Brief overview of what was built and the measurable impact achieved.",
      techStack: "Tools & Technologies used",
    };
    setCv((prev) => ({ ...prev, projects: [...prev.projects, newProj] }));
  };

  const updateProject = (id: string, field: keyof ProjectItem, value: string) => {
    setCv((prev) => ({
      ...prev,
      projects: prev.projects.map((p) => (p.id === id ? { ...p, [field]: value } : p)),
    }));
  };

  const removeProject = (id: string) => {
    setCv((prev) => ({
      ...prev,
      projects: prev.projects.filter((p) => p.id !== id),
    }));
  };

  // Extras handlers (Certificates & Languages)
  const addCertificate = () => {
    const newCert: CertificateItem = {
      id: `cert-${Date.now()}`,
      name: "Certification Name",
      issuer: "Issuing Organization",
      date: "2023",
    };
    setCv((prev) => ({ ...prev, certificates: [...prev.certificates, newCert] }));
  };

  const updateCertificate = (id: string, field: keyof CertificateItem, value: string) => {
    setCv((prev) => ({
      ...prev,
      certificates: prev.certificates.map((c) => (c.id === id ? { ...c, [field]: value } : c)),
    }));
  };

  const removeCertificate = (id: string) => {
    setCv((prev) => ({
      ...prev,
      certificates: prev.certificates.filter((c) => c.id !== id),
    }));
  };

  const addLanguage = () => {
    const newLang: LanguageItem = {
      id: `lang-${Date.now()}`,
      language: "Language",
      proficiency: "Fluent",
    };
    setCv((prev) => ({ ...prev, languages: [...prev.languages, newLang] }));
  };

  const updateLanguage = (id: string, field: keyof LanguageItem, value: any) => {
    setCv((prev) => ({
      ...prev,
      languages: prev.languages.map((l) => (l.id === id ? { ...l, [field]: value } : l)),
    }));
  };

  const removeLanguage = (id: string) => {
    setCv((prev) => ({
      ...prev,
      languages: prev.languages.filter((l) => l.id !== id),
    }));
  };

  // Profile presets
  const loadProfile = (preset: "motion" | "dev" | "creative" | "blank") => {
    if (preset === "motion") setCv(SAMPLE_MOTION_DESIGNER);
    else if (preset === "dev") setCv(SAMPLE_SOFTWARE_ENGINEER);
    else if (preset === "creative") setCv(SAMPLE_CREATIVE_DIRECTOR);
    else if (preset === "blank") setCv(BLANK_CV_DATA);
    setStatus("Loaded template profile!");
  };

  // Export handlers
  const handlePrint = () => {
    window.print();
  };

  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(cv, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${cv.personal.fullName.replace(/\s+/g, "_")}_CV_Backup.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    setStatus("Saved CV data JSON backup!");
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string);
        if (parsed.personal && parsed.experience) {
          setCv(parsed);
          setStatus("Loaded CV from backup JSON file!");
        } else {
          alert("Invalid CV backup file format.");
        }
      } catch {
        alert("Failed to parse JSON file.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="cv-maker-container">
      {/* Top Application Bar */}
      <div className="rounded-2xl border border-[#223328] bg-[#0c1410] p-4 mb-6 shadow-xl no-print">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#142319] border border-[#233829] flex items-center justify-center text-[#3cff5f] shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                CompX CV &amp; Resume Studio
                <span className="text-[10px] font-mono text-[#3cff5f] bg-[#142319] border border-[#233829] px-2 py-0.5 rounded-full">
                  ATS Ready
                </span>
              </h2>
              <p className="text-xs text-[#8da096]">Choose template, customize details, and download print-ready PDF</p>
            </div>
          </div>

          {/* Quick Action Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Sample Profile Selector */}
            <select
              onChange={(e) => loadProfile(e.target.value as any)}
              defaultValue="motion"
              className="px-3 py-2 rounded-xl bg-[#142319] border border-[#233829] text-xs font-bold text-[#e7eee9] hover:border-[#3cff5f]/50 transition-all cursor-pointer focus:outline-none"
              title="Load Pre-filled Sample Profile"
            >
              <option value="motion">🎬 Motion Designer CV</option>
              <option value="dev">💻 Software Engineer CV</option>
              <option value="creative">🎨 Creative Director CV</option>
              <option value="blank">📄 Start Blank</option>
            </select>

            {/* Hidden JSON input */}
            <input ref={jsonInputRef} type="file" accept=".json" onChange={handleImportJson} className="hidden" />
            <button
              type="button"
              onClick={() => jsonInputRef.current?.click()}
              className="px-3 py-2 rounded-xl bg-[#101914] border border-[#1e2d24] text-xs font-medium text-[#a2b4a9] hover:text-white hover:border-[#2d4235] transition-all cursor-pointer"
              title="Import previously saved JSON"
            >
              <Upload className="w-3.5 h-3.5 inline mr-1 text-[#60a5fa]" />
              Import JSON
            </button>

            <button
              type="button"
              onClick={handleExportJson}
              className="px-3 py-2 rounded-xl bg-[#101914] border border-[#1e2d24] text-xs font-medium text-[#a2b4a9] hover:text-white hover:border-[#2d4235] transition-all cursor-pointer"
              title="Download backup file"
            >
              Backup JSON
            </button>

            {/* Print / Download PDF CTA */}
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#3cff5f] text-black font-extrabold text-xs shadow-lg shadow-[#3cff5f]/20 hover:bg-[#34e253] transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download PDF (.pdf)</span>
            </button>
          </div>
        </div>

        {status && (
          <div className="mt-3 px-3 py-1.5 rounded-lg bg-[#142319] border border-[#233829] text-xs text-[#3cff5f] flex items-center justify-between">
            <span>{status}</span>
            <button type="button" onClick={() => setStatus("")} className="text-[#8da096] hover:text-white">
              ×
            </button>
          </div>
        )}

        {/* Template & Styling Toolbar */}
        <div className="mt-4 pt-4 border-t border-[#1c2921] grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Template Choice */}
          <div>
            <label className="block text-[11px] font-bold text-[#8da096] uppercase mb-1.5 flex items-center gap-1.5">
              <Layout className="w-3.5 h-3.5 text-[#3cff5f]" />
              Select Template:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {CV_TEMPLATES.map((tmpl) => (
                <button
                  key={tmpl.id}
                  type="button"
                  onClick={() => setCv((prev) => ({ ...prev, templateId: tmpl.id }))}
                  className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                    cv.templateId === tmpl.id
                      ? "border-[#3cff5f] bg-[#142319] text-white shadow-sm"
                      : "border-[#1e2d24] bg-[#0c1410] text-[#a2b4a9] hover:border-[#2d4235]"
                  }`}
                >
                  <p className="text-xs font-bold truncate">{tmpl.name}</p>
                  <p className="text-[10px] text-[#3cff5f] font-mono truncate">{tmpl.tag}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Accent Color Palette */}
          <div>
            <label className="block text-[11px] font-bold text-[#8da096] uppercase mb-1.5 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-[#3cff5f]" />
              Accent Theme Color:
            </label>
            <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-xl bg-[#080d0a] border border-[#1e2d24]">
              {THEME_COLORS.map((c) => (
                <button
                  key={c.hex}
                  type="button"
                  onClick={() => setCv((prev) => ({ ...prev, themeColor: c.hex }))}
                  className={`w-7 h-7 rounded-lg transition-transform cursor-pointer relative ${
                    cv.themeColor === c.hex ? "scale-110 ring-2 ring-white ring-offset-2 ring-offset-[#080d0a]" : "hover:scale-105"
                  }`}
                  style={{ backgroundColor: c.hex }}
                  title={c.name}
                />
              ))}
            </div>
          </div>

          {/* Typography & Layout Spacing */}
          <div>
            <label className="block text-[11px] font-bold text-[#8da096] uppercase mb-1.5 flex items-center gap-1.5">
              <Type className="w-3.5 h-3.5 text-[#3cff5f]" />
              Font &amp; Photo:
            </label>
            <div className="flex items-center gap-2">
              <select
                value={cv.fontFamily}
                onChange={(e) => setCv((prev) => ({ ...prev, fontFamily: e.target.value }))}
                className="flex-1 px-3 py-2 rounded-xl bg-[#080d0a] border border-[#1e2d24] text-xs font-medium text-white focus:outline-none focus:border-[#3cff5f]/50"
              >
                {CV_FONTS.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.name}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => setCv((prev) => ({ ...prev, showPhoto: !prev.showPhoto }))}
                className={`px-3 py-2 rounded-xl border text-xs font-bold transition-colors cursor-pointer shrink-0 ${
                  cv.showPhoto
                    ? "border-[#3cff5f] bg-[#142319] text-[#3cff5f]"
                    : "border-[#1e2d24] bg-[#080d0a] text-[#8da096]"
                }`}
              >
                {cv.showPhoto ? "✓ Photo Active" : "No Photo"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Dual Pane Studio */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Multi-Tab Customization Form (5 cols) */}
        <div className="lg:col-span-5 rounded-3xl border border-[#223328] bg-[#0c1410] shadow-2xl p-4 sm:p-6 no-print">
          {/* Navigation Tabs */}
          <div className="flex flex-wrap gap-1.5 p-1 rounded-2xl bg-[#070c09] border border-[#1c2921] mb-5">
            {[
              { id: "personal", label: "Personal", icon: User },
              { id: "experience", label: "Experience", icon: Briefcase },
              { id: "education", label: "Education", icon: GraduationCap },
              { id: "skills", label: "Skills", icon: Wrench },
              { id: "projects", label: "Projects", icon: FolderGit2 },
              { id: "extras", label: "Extras", icon: Award },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 min-w-[70px] py-2 px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === tab.id
                      ? "bg-[#142319] text-[#3cff5f] border border-[#233829] shadow-sm"
                      : "text-[#8da096] hover:text-white"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* TAB 1: PERSONAL INFO */}
          {activeTab === "personal" && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-3 rounded-2xl bg-[#121c16] border border-[#1e2e23]">
                <div className="relative w-16 h-16 rounded-full bg-[#182b1f] border border-[#284833] flex items-center justify-center overflow-hidden shrink-0">
                  {cv.personal.photoUrl ? (
                    <img src={cv.personal.photoUrl} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-7 h-7 text-[#8da096]" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-white mb-1">Profile Photo</p>
                  <div className="flex items-center gap-2">
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-2.5 py-1 rounded-lg bg-[#142319] border border-[#233829] text-[11px] font-bold text-white hover:border-[#3cff5f]/50 cursor-pointer"
                    >
                      Upload Picture
                    </button>
                    {cv.personal.photoUrl && (
                      <button
                        type="button"
                        onClick={() => updatePersonal("photoUrl", "")}
                        className="px-2 py-1 rounded-lg text-[11px] text-red-400 hover:text-red-300"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#8da096] mb-1">Full Name:</label>
                <input
                  type="text"
                  value={cv.personal.fullName}
                  onChange={(e) => updatePersonal("fullName", e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#121c16] border border-[#1e2e23] text-white text-sm focus:outline-none focus:border-[#3cff5f]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#8da096] mb-1">Professional Job Title / Headline:</label>
                <input
                  type="text"
                  value={cv.personal.jobTitle}
                  onChange={(e) => updatePersonal("jobTitle", e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#121c16] border border-[#1e2e23] text-white text-sm focus:outline-none focus:border-[#3cff5f]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#8da096] mb-1">Email:</label>
                  <input
                    type="email"
                    value={cv.personal.email}
                    onChange={(e) => updatePersonal("email", e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#121c16] border border-[#1e2e23] text-white text-sm focus:outline-none focus:border-[#3cff5f]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#8da096] mb-1">Phone Number:</label>
                  <input
                    type="text"
                    value={cv.personal.phone}
                    onChange={(e) => updatePersonal("phone", e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#121c16] border border-[#1e2e23] text-white text-sm focus:outline-none focus:border-[#3cff5f]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#8da096] mb-1">Location / City:</label>
                  <input
                    type="text"
                    value={cv.personal.location}
                    onChange={(e) => updatePersonal("location", e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#121c16] border border-[#1e2e23] text-white text-sm focus:outline-none focus:border-[#3cff5f]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#8da096] mb-1">Portfolio / Website:</label>
                  <input
                    type="text"
                    value={cv.personal.website}
                    onChange={(e) => updatePersonal("website", e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3 py-2 rounded-xl bg-[#121c16] border border-[#1e2e23] text-white text-sm focus:outline-none focus:border-[#3cff5f]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#8da096] mb-1">LinkedIn URL:</label>
                  <input
                    type="text"
                    value={cv.personal.linkedin}
                    onChange={(e) => updatePersonal("linkedin", e.target.value)}
                    placeholder="linkedin.com/in/..."
                    className="w-full px-3 py-2 rounded-xl bg-[#121c16] border border-[#1e2e23] text-white text-sm focus:outline-none focus:border-[#3cff5f]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#8da096] mb-1">GitHub / Behance:</label>
                  <input
                    type="text"
                    value={cv.personal.github}
                    onChange={(e) => updatePersonal("github", e.target.value)}
                    placeholder="github.com/..."
                    className="w-full px-3 py-2 rounded-xl bg-[#121c16] border border-[#1e2e23] text-white text-sm focus:outline-none focus:border-[#3cff5f]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#8da096] mb-1">Professional Bio / Summary:</label>
                <textarea
                  rows={4}
                  value={cv.personal.bio}
                  onChange={(e) => updatePersonal("bio", e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#121c16] border border-[#1e2e23] text-white text-sm focus:outline-none focus:border-[#3cff5f]"
                />
              </div>
            </div>
          )}

          {/* TAB 2: WORK EXPERIENCE */}
          {activeTab === "experience" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#8da096]">Employment History</h3>
                <button
                  type="button"
                  onClick={addExperience}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#142319] border border-[#233829] text-xs font-bold text-[#3cff5f] hover:bg-[#1b3323] transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Position
                </button>
              </div>

              {cv.experience.map((exp, index) => (
                <div key={exp.id} className="p-4 rounded-2xl bg-[#121c16] border border-[#1e2e23] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-[#3cff5f] font-bold">Position #{index + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeExperience(exp.id)}
                      className="text-[#8da096] hover:text-red-400 p-1 rounded"
                      title="Delete experience"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-[#8da096] mb-1">Job Title / Role:</label>
                      <input
                        type="text"
                        value={exp.position}
                        onChange={(e) => updateExperience(exp.id, "position", e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-xl bg-[#0c1410] border border-[#233829] text-white text-xs focus:outline-none focus:border-[#3cff5f]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#8da096] mb-1">Company / Organization:</label>
                      <input
                        type="text"
                        value={exp.company}
                        onChange={(e) => updateExperience(exp.id, "company", e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-xl bg-[#0c1410] border border-[#233829] text-white text-xs focus:outline-none focus:border-[#3cff5f]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-[#8da096] mb-1">Start Date:</label>
                      <input
                        type="text"
                        value={exp.startDate}
                        onChange={(e) => updateExperience(exp.id, "startDate", e.target.value)}
                        placeholder="2021"
                        className="w-full px-2 py-1.5 rounded-xl bg-[#0c1410] border border-[#233829] text-white text-xs text-center focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[#8da096] mb-1">End Date:</label>
                      <input
                        type="text"
                        value={exp.endDate}
                        disabled={exp.isCurrent}
                        onChange={(e) => updateExperience(exp.id, "endDate", e.target.value)}
                        placeholder={exp.isCurrent ? "Present" : "2023"}
                        className="w-full px-2 py-1.5 rounded-xl bg-[#0c1410] border border-[#233829] text-white text-xs text-center focus:outline-none disabled:opacity-50"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[#8da096] mb-1">Location:</label>
                      <input
                        type="text"
                        value={exp.location}
                        onChange={(e) => updateExperience(exp.id, "location", e.target.value)}
                        placeholder="City, State"
                        className="w-full px-2 py-1.5 rounded-xl bg-[#0c1410] border border-[#233829] text-white text-xs text-center focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Highlights Bullets */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-[11px] font-bold text-[#8da096]">Key Achievements &amp; Bullets:</label>
                      <button
                        type="button"
                        onClick={() => addHighlight(exp.id)}
                        className="text-[10px] font-bold text-[#3cff5f] hover:underline"
                      >
                        + Add Bullet
                      </button>
                    </div>
                    <div className="space-y-1.5">
                      {exp.highlights.map((hl, hlIdx) => (
                        <div key={hlIdx} className="flex items-center gap-1.5">
                          <span className="text-[#3cff5f] text-xs">•</span>
                          <input
                            type="text"
                            value={hl}
                            onChange={(e) => updateHighlight(exp.id, hlIdx, e.target.value)}
                            className="flex-1 px-2.5 py-1.5 rounded-lg bg-[#0c1410] border border-[#233829] text-white text-xs focus:outline-none focus:border-[#3cff5f]"
                          />
                          {exp.highlights.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeHighlight(exp.id, hlIdx)}
                              className="text-[#8da096] hover:text-red-400 p-1"
                            >
                              ×
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: EDUCATION */}
          {activeTab === "education" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#8da096]">Education &amp; Degrees</h3>
                <button
                  type="button"
                  onClick={addEducation}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#142319] border border-[#233829] text-xs font-bold text-[#3cff5f] hover:bg-[#1b3323] cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Education
                </button>
              </div>

              {cv.education.map((edu, index) => (
                <div key={edu.id} className="p-4 rounded-2xl bg-[#121c16] border border-[#1e2e23] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-[#3cff5f] font-bold">Education #{index + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeEducation(edu.id)}
                      className="text-[#8da096] hover:text-red-400 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#8da096] mb-1">Degree / Major:</label>
                    <input
                      type="text"
                      value={edu.degree}
                      onChange={(e) => updateEducation(edu.id, "degree", e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-xl bg-[#0c1410] border border-[#233829] text-white text-xs focus:outline-none focus:border-[#3cff5f]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#8da096] mb-1">University / College:</label>
                    <input
                      type="text"
                      value={edu.institution}
                      onChange={(e) => updateEducation(edu.id, "institution", e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-xl bg-[#0c1410] border border-[#233829] text-white text-xs focus:outline-none focus:border-[#3cff5f]"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-[#8da096] mb-1">Start Year:</label>
                      <input
                        type="text"
                        value={edu.startYear}
                        onChange={(e) => updateEducation(edu.id, "startYear", e.target.value)}
                        className="w-full px-2 py-1.5 rounded-xl bg-[#0c1410] border border-[#233829] text-white text-xs text-center"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[#8da096] mb-1">Graduation:</label>
                      <input
                        type="text"
                        value={edu.endYear}
                        onChange={(e) => updateEducation(edu.id, "endYear", e.target.value)}
                        className="w-full px-2 py-1.5 rounded-xl bg-[#0c1410] border border-[#233829] text-white text-xs text-center"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[#8da096] mb-1">GPA / Honors:</label>
                      <input
                        type="text"
                        value={edu.gpa || ""}
                        onChange={(e) => updateEducation(edu.id, "gpa", e.target.value)}
                        placeholder="3.9"
                        className="w-full px-2 py-1.5 rounded-xl bg-[#0c1410] border border-[#233829] text-white text-xs text-center"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 4: SKILLS */}
          {activeTab === "skills" && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="e.g. After Effects, DaVinci, Next.js..."
                  value={newSkillName}
                  onChange={(e) => setNewSkillName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addSkill()}
                  className="flex-1 px-3 py-2 rounded-xl bg-[#121c16] border border-[#1e2e23] text-white text-xs focus:outline-none focus:border-[#3cff5f]"
                />
                <button
                  type="button"
                  onClick={addSkill}
                  className="px-4 py-2 rounded-xl bg-[#3cff5f] text-black font-bold text-xs hover:bg-[#34e253] cursor-pointer"
                >
                  Add Skill
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-[#121c16] border border-[#1e2e23]">
                <p className="text-[11px] font-bold text-[#8da096] uppercase mb-3">Skills List ({cv.skills.length})</p>
                <div className="flex flex-wrap gap-2">
                  {cv.skills.map((skill, index) => (
                    <div
                      key={index}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#142319] border border-[#233829] text-xs font-medium text-white"
                    >
                      <span>{skill.name}</span>
                      <button
                        type="button"
                        onClick={() => removeSkill(index)}
                        className="text-[#8da096] hover:text-red-400 font-bold ml-1"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: PROJECTS */}
          {activeTab === "projects" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#8da096]">Featured Projects</h3>
                <button
                  type="button"
                  onClick={addProject}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#142319] border border-[#233829] text-xs font-bold text-[#3cff5f] hover:bg-[#1b3323] cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Project
                </button>
              </div>

              {cv.projects.map((proj, index) => (
                <div key={proj.id} className="p-4 rounded-2xl bg-[#121c16] border border-[#1e2e23] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-[#3cff5f] font-bold">Project #{index + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeProject(proj.id)}
                      className="text-[#8da096] hover:text-red-400 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-[#8da096] mb-1">Project Name:</label>
                      <input
                        type="text"
                        value={proj.name}
                        onChange={(e) => updateProject(proj.id, "name", e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-xl bg-[#0c1410] border border-[#233829] text-white text-xs focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#8da096] mb-1">Project URL / Link:</label>
                      <input
                        type="text"
                        value={proj.link}
                        onChange={(e) => updateProject(proj.id, "link", e.target.value)}
                        placeholder="https://..."
                        className="w-full px-2.5 py-1.5 rounded-xl bg-[#0c1410] border border-[#233829] text-white text-xs focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#8da096] mb-1">Tools &amp; Tech Stack:</label>
                    <input
                      type="text"
                      value={proj.techStack}
                      onChange={(e) => updateProject(proj.id, "techStack", e.target.value)}
                      placeholder="e.g. After Effects · Cinema 4D"
                      className="w-full px-2.5 py-1.5 rounded-xl bg-[#0c1410] border border-[#233829] text-white text-xs focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#8da096] mb-1">Description:</label>
                    <textarea
                      rows={2}
                      value={proj.description}
                      onChange={(e) => updateProject(proj.id, "description", e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-xl bg-[#0c1410] border border-[#233829] text-white text-xs focus:outline-none"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 6: EXTRAS (Certifications & Languages) */}
          {activeTab === "extras" && (
            <div className="space-y-6">
              {/* Certifications */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#8da096]">Certifications</h3>
                  <button
                    type="button"
                    onClick={addCertificate}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#142319] border border-[#233829] text-xs font-bold text-[#3cff5f] hover:bg-[#1b3323]"
                  >
                    + Add
                  </button>
                </div>

                {cv.certificates.map((cert) => (
                  <div key={cert.id} className="p-3 rounded-xl bg-[#121c16] border border-[#1e2e23] flex items-center gap-2">
                    <input
                      type="text"
                      value={cert.name}
                      onChange={(e) => updateCertificate(cert.id, "name", e.target.value)}
                      placeholder="Certificate title"
                      className="flex-1 px-2 py-1 rounded-lg bg-[#0c1410] border border-[#233829] text-white text-xs"
                    />
                    <input
                      type="text"
                      value={cert.issuer}
                      onChange={(e) => updateCertificate(cert.id, "issuer", e.target.value)}
                      placeholder="Issuer"
                      className="w-28 px-2 py-1 rounded-lg bg-[#0c1410] border border-[#233829] text-white text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => removeCertificate(cert.id)}
                      className="text-[#8da096] hover:text-red-400 p-1"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>

              {/* Languages */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#8da096]">Languages</h3>
                  <button
                    type="button"
                    onClick={addLanguage}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#142319] border border-[#233829] text-xs font-bold text-[#3cff5f] hover:bg-[#1b3323]"
                  >
                    + Add
                  </button>
                </div>

                {cv.languages.map((lang) => (
                  <div key={lang.id} className="p-3 rounded-xl bg-[#121c16] border border-[#1e2e23] flex items-center gap-2">
                    <input
                      type="text"
                      value={lang.language}
                      onChange={(e) => updateLanguage(lang.id, "language", e.target.value)}
                      placeholder="e.g. English"
                      className="flex-1 px-2 py-1 rounded-lg bg-[#0c1410] border border-[#233829] text-white text-xs"
                    />
                    <select
                      value={lang.proficiency}
                      onChange={(e) => updateLanguage(lang.id, "proficiency", e.target.value as any)}
                      className="px-2 py-1 rounded-lg bg-[#0c1410] border border-[#233829] text-white text-xs"
                    >
                      <option value="Native">Native</option>
                      <option value="Fluent">Fluent</option>
                      <option value="Professional">Professional</option>
                      <option value="Conversational">Conversational</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => removeLanguage(lang.id)}
                      className="text-[#8da096] hover:text-red-400 p-1"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Live Interactive A4 CV Preview (7 cols) */}
        <div className="lg:col-span-7 flex flex-col items-center">
          {/* Preview Canvas Bar */}
          <div className="w-full flex items-center justify-between px-3 py-2 mb-2 rounded-xl bg-[#0c1410] border border-[#1e2d24] text-xs text-[#8da096] no-print">
            <span className="flex items-center gap-1.5 font-bold text-white">
              <Eye className="w-4 h-4 text-[#3cff5f]" />
              Live A4 Print Preview
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setZoom((z) => Math.max(70, z - 10))}
                className="p-1 rounded hover:text-white"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="font-mono text-[11px]">{zoom}%</span>
              <button
                type="button"
                onClick={() => setZoom((z) => Math.min(130, z + 10))}
                className="p-1 rounded hover:text-white"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Actual Printable A4 Resume Canvas */}
          <div className="w-full overflow-x-auto flex justify-center p-2 sm:p-4 bg-[#070c09] rounded-3xl border border-[#1c2921]">
            <div
              ref={cvPrintRef}
              id="cv-printable-page"
              className="cv-sheet bg-white text-[#1e293b] shadow-2xl transition-transform origin-top"
              style={{
                width: "210mm",
                minHeight: "297mm",
                fontFamily: cv.fontFamily,
                transform: `scale(${zoom / 100})`,
                transformOrigin: "top center",
              }}
            >
              {/* RENDER TEMPLATE COMPONENT BASED ON SELECTED ID */}
              {cv.templateId === "modern" && <ModernTemplate cv={cv} />}
              {cv.templateId === "sidebar" && <SidebarTemplate cv={cv} />}
              {cv.templateId === "minimalist-ats" && <AtsTemplate cv={cv} />}
              {cv.templateId === "executive" && <ExecutiveTemplate cv={cv} />}
              {cv.templateId === "creative-tech" && <CreativeTechTemplate cv={cv} />}
            </div>
          </div>
        </div>
      </div>

      {/* Dedicated Print & PDF Styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          .no-print,
          .orbit-site-header,
          footer {
            display: none !important;
          }
          #cv-printable-page,
          #cv-printable-page * {
            visibility: visible !important;
          }
          #cv-printable-page {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 210mm !important;
            min-height: 297mm !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            transform: none !important;
            background: white !important;
            color: #1e293b !important;
          }
          @page {
            size: A4;
            margin: 0;
          }
        }
      `}</style>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
   TEMPLATE 1: MODERN ORBIT (Clean 2-Column with Accent Bar)
   ──────────────────────────────────────────────────────────────────────────── */
function ModernTemplate({ cv }: { cv: CvData }) {
  return (
    <div className="p-8 sm:p-10">
      {/* Top Header */}
      <div className="border-b-2 pb-6 mb-6" style={{ borderColor: cv.themeColor }}>
        <div className="flex items-start justify-between gap-6">
          <div className="flex-1">
            <h1 className="text-3xl font-black tracking-tight text-slate-900">{cv.personal.fullName}</h1>
            <p className="text-lg font-bold mt-1" style={{ color: cv.themeColor }}>
              {cv.personal.jobTitle}
            </p>
            {cv.personal.bio && <p className="mt-3 text-xs text-slate-600 leading-relaxed">{cv.personal.bio}</p>}
          </div>
          {cv.showPhoto && cv.personal.photoUrl && (
            <img
              src={cv.personal.photoUrl}
              alt={cv.personal.fullName}
              className="w-24 h-24 rounded-2xl object-cover border-2 shadow-sm shrink-0"
              style={{ borderColor: cv.themeColor }}
            />
          )}
        </div>

        {/* Contact Links Bar */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-600">
          {cv.personal.email && (
            <span className="flex items-center gap-1">
              <Mail className="w-3 h-3 text-slate-400" />
              {cv.personal.email}
            </span>
          )}
          {cv.personal.phone && (
            <span className="flex items-center gap-1">
              <Phone className="w-3 h-3 text-slate-400" />
              {cv.personal.phone}
            </span>
          )}
          {cv.personal.location && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-slate-400" />
              {cv.personal.location}
            </span>
          )}
          {cv.personal.website && (
            <span className="flex items-center gap-1 font-medium" style={{ color: cv.themeColor }}>
              <Globe className="w-3 h-3" />
              {cv.personal.website.replace(/^https?:\/\//, "")}
            </span>
          )}
          {cv.personal.linkedin && (
            <span className="flex items-center gap-1">
              <ExternalLink className="w-3 h-3 text-slate-400" />
              {cv.personal.linkedin}
            </span>
          )}
        </div>
      </div>

      {/* 2-Column Content Grid */}
      <div className="grid grid-cols-12 gap-8">
        {/* Left Column (8 cols): Experience & Projects */}
        <div className="col-span-8 space-y-6">
          {/* Experience */}
          {cv.experience.length > 0 && (
            <section>
              <h2 className="text-xs font-black uppercase tracking-wider mb-4 pb-1 border-b flex items-center gap-2" style={{ color: cv.themeColor, borderColor: `${cv.themeColor}40` }}>
                <Briefcase className="w-3.5 h-3.5" />
                Work Experience
              </h2>
              <div className="space-y-5">
                {cv.experience.map((exp) => (
                  <div key={exp.id} className="relative pl-3 border-l-2" style={{ borderColor: `${cv.themeColor}60` }}>
                    <div className="flex items-baseline justify-between">
                      <h3 className="text-sm font-bold text-slate-900">{exp.position}</h3>
                      <span className="text-[10px] font-mono font-bold text-slate-500">
                        {exp.startDate} — {exp.isCurrent ? "Present" : exp.endDate}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-slate-700">
                      {exp.company} {exp.location && `· ${exp.location}`}
                    </p>
                    {exp.highlights.length > 0 && (
                      <ul className="mt-2 space-y-1 text-xs text-slate-600 list-disc list-outside ml-4">
                        {exp.highlights.map((hl, i) => (
                          <li key={i}>{hl}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Featured Projects */}
          {cv.projects.length > 0 && (
            <section>
              <h2 className="text-xs font-black uppercase tracking-wider mb-4 pb-1 border-b flex items-center gap-2" style={{ color: cv.themeColor, borderColor: `${cv.themeColor}40` }}>
                <FolderGit2 className="w-3.5 h-3.5" />
                Key Projects &amp; Deliverables
              </h2>
              <div className="space-y-4">
                {cv.projects.map((proj) => (
                  <div key={proj.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold text-slate-900">{proj.name}</h3>
                      {proj.link && (
                        <span className="text-[10px] font-mono" style={{ color: cv.themeColor }}>
                          {proj.link.replace(/^https?:\/\//, "")}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] font-semibold text-slate-600 mt-0.5">{proj.techStack}</p>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{proj.description}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Right Column (4 cols): Skills, Education, Extras */}
        <div className="col-span-4 space-y-6">
          {/* Skills */}
          {cv.skills.length > 0 && (
            <section>
              <h2 className="text-xs font-black uppercase tracking-wider mb-3 pb-1 border-b" style={{ color: cv.themeColor, borderColor: `${cv.themeColor}40` }}>
                Skills &amp; Expertise
              </h2>
              <div className="flex flex-wrap gap-1.5">
                {cv.skills.map((s, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-md text-[11px] font-bold"
                    style={{ backgroundColor: `${cv.themeColor}18`, color: cv.themeColor }}
                  >
                    {s.name}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Education */}
          {cv.education.length > 0 && (
            <section>
              <h2 className="text-xs font-black uppercase tracking-wider mb-3 pb-1 border-b" style={{ color: cv.themeColor, borderColor: `${cv.themeColor}40` }}>
                Education
              </h2>
              <div className="space-y-3">
                {cv.education.map((edu) => (
                  <div key={edu.id}>
                    <h3 className="text-xs font-bold text-slate-900">{edu.degree}</h3>
                    <p className="text-[11px] text-slate-600 font-medium">{edu.institution}</p>
                    <p className="text-[10px] font-mono text-slate-500">
                      {edu.startYear} — {edu.endYear} {edu.gpa && `· GPA: ${edu.gpa}`}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Certifications */}
          {cv.certificates.length > 0 && (
            <section>
              <h2 className="text-xs font-black uppercase tracking-wider mb-3 pb-1 border-b" style={{ color: cv.themeColor, borderColor: `${cv.themeColor}40` }}>
                Certifications
              </h2>
              <div className="space-y-2">
                {cv.certificates.map((cert) => (
                  <div key={cert.id}>
                    <p className="text-xs font-bold text-slate-800">{cert.name}</p>
                    <p className="text-[10px] text-slate-500">
                      {cert.issuer} {cert.date && `(${cert.date})`}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Languages */}
          {cv.languages.length > 0 && (
            <section>
              <h2 className="text-xs font-black uppercase tracking-wider mb-3 pb-1 border-b" style={{ color: cv.themeColor, borderColor: `${cv.themeColor}40` }}>
                Languages
              </h2>
              <div className="space-y-1">
                {cv.languages.map((l) => (
                  <div key={l.id} className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-800">{l.language}</span>
                    <span className="text-slate-500 text-[11px]">{l.proficiency}</span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
   TEMPLATE 2: ELEGANT SIDEBAR (Dark/Accent Left Column)
   ──────────────────────────────────────────────────────────────────────────── */
function SidebarTemplate({ cv }: { cv: CvData }) {
  return (
    <div className="grid grid-cols-12 min-h-full">
      {/* Left Sidebar (4 cols) */}
      <div className="col-span-4 p-8 text-white space-y-6" style={{ backgroundColor: "#0f172a" }}>
        {cv.showPhoto && cv.personal.photoUrl && (
          <div className="flex justify-center mb-4">
            <img
              src={cv.personal.photoUrl}
              alt={cv.personal.fullName}
              className="w-28 h-28 rounded-full object-cover border-4"
              style={{ borderColor: cv.themeColor }}
            />
          </div>
        )}

        <div>
          <h1 className="text-xl font-black text-white">{cv.personal.fullName}</h1>
          <p className="text-xs font-bold mt-1" style={{ color: cv.themeColor }}>
            {cv.personal.jobTitle}
          </p>
        </div>

        {/* Contact info */}
        <div className="space-y-2 text-[11px] text-slate-300">
          <p className="text-[10px] uppercase font-black tracking-wider text-slate-400">Contact</p>
          {cv.personal.email && (
            <p className="break-all flex items-center gap-1.5">
              <Mail className="w-3 h-3 shrink-0" style={{ color: cv.themeColor }} />
              {cv.personal.email}
            </p>
          )}
          {cv.personal.phone && (
            <p className="flex items-center gap-1.5">
              <Phone className="w-3 h-3 shrink-0" style={{ color: cv.themeColor }} />
              {cv.personal.phone}
            </p>
          )}
          {cv.personal.location && (
            <p className="flex items-center gap-1.5">
              <MapPin className="w-3 h-3 shrink-0" style={{ color: cv.themeColor }} />
              {cv.personal.location}
            </p>
          )}
          {cv.personal.website && (
            <p className="break-all flex items-center gap-1.5">
              <Globe className="w-3 h-3 shrink-0" style={{ color: cv.themeColor }} />
              {cv.personal.website.replace(/^https?:\/\//, "")}
            </p>
          )}
        </div>

        {/* Skills */}
        {cv.skills.length > 0 && (
          <div className="space-y-2">
            <p className="text-[10px] uppercase font-black tracking-wider text-slate-400">Skills</p>
            <div className="flex flex-wrap gap-1.5">
              {cv.skills.map((s, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-200 border border-slate-700"
                >
                  {s.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {cv.education.length > 0 && (
          <div className="space-y-3">
            <p className="text-[10px] uppercase font-black tracking-wider text-slate-400">Education</p>
            {cv.education.map((edu) => (
              <div key={edu.id} className="text-xs">
                <p className="font-bold text-white">{edu.degree}</p>
                <p className="text-[11px] text-slate-400">{edu.institution}</p>
                <p className="text-[10px] font-mono text-slate-500">
                  {edu.startYear} — {edu.endYear}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Languages */}
        {cv.languages.length > 0 && (
          <div className="space-y-1.5 text-xs">
            <p className="text-[10px] uppercase font-black tracking-wider text-slate-400">Languages</p>
            {cv.languages.map((l) => (
              <p key={l.id} className="flex justify-between text-[11px]">
                <span className="font-medium text-slate-300">{l.language}</span>
                <span className="text-slate-400">{l.proficiency}</span>
              </p>
            ))}
          </div>
        )}
      </div>

      {/* Right Content Area (8 cols) */}
      <div className="col-span-8 p-8 space-y-6 bg-white">
        {cv.personal.bio && (
          <section>
            <h2 className="text-xs font-black uppercase tracking-wider mb-2 pb-1 border-b" style={{ color: cv.themeColor }}>
              Professional Summary
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed">{cv.personal.bio}</p>
          </section>
        )}

        {/* Experience */}
        {cv.experience.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-xs font-black uppercase tracking-wider pb-1 border-b" style={{ color: cv.themeColor }}>
              Work Experience
            </h2>
            <div className="space-y-5">
              {cv.experience.map((exp) => (
                <div key={exp.id}>
                  <div className="flex items-baseline justify-between">
                    <h3 className="text-sm font-bold text-slate-900">{exp.position}</h3>
                    <span className="text-[10px] font-mono font-bold text-slate-500">
                      {exp.startDate} — {exp.isCurrent ? "Present" : exp.endDate}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-700">
                    {exp.company} {exp.location && `· ${exp.location}`}
                  </p>
                  {exp.highlights.length > 0 && (
                    <ul className="mt-2 space-y-1 text-xs text-slate-600 list-disc list-outside ml-4">
                      {exp.highlights.map((hl, i) => (
                        <li key={i}>{hl}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Projects */}
        {cv.projects.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-xs font-black uppercase tracking-wider pb-1 border-b" style={{ color: cv.themeColor }}>
              Projects
            </h2>
            <div className="space-y-3">
              {cv.projects.map((proj) => (
                <div key={proj.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <h3 className="text-xs font-bold text-slate-900">{proj.name}</h3>
                  <p className="text-[11px] font-mono text-slate-500 mt-0.5">{proj.techStack}</p>
                  <p className="text-xs text-slate-600 mt-1">{proj.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
   TEMPLATE 3: MINIMALIST ATS-OPTIMIZED (Single-column, Maximum Parse Score)
   ──────────────────────────────────────────────────────────────────────────── */
function AtsTemplate({ cv }: { cv: CvData }) {
  return (
    <div className="p-10 space-y-5">
      {/* Header */}
      <div className="text-center border-b pb-4">
        <h1 className="text-2xl font-bold uppercase tracking-wide text-slate-900">{cv.personal.fullName}</h1>
        <p className="text-sm font-semibold mt-0.5" style={{ color: cv.themeColor }}>
          {cv.personal.jobTitle}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-3 text-xs text-slate-600 mt-2">
          {cv.personal.location && <span>{cv.personal.location}</span>}
          {cv.personal.phone && <span>• {cv.personal.phone}</span>}
          {cv.personal.email && <span>• {cv.personal.email}</span>}
          {cv.personal.website && <span>• {cv.personal.website.replace(/^https?:\/\//, "")}</span>}
          {cv.personal.linkedin && <span>• {cv.personal.linkedin}</span>}
        </div>
      </div>

      {/* Summary */}
      {cv.personal.bio && (
        <section>
          <h2 className="text-xs font-bold uppercase tracking-wider border-b pb-1 mb-2 text-slate-800">
            Professional Summary
          </h2>
          <p className="text-xs text-slate-700 leading-relaxed">{cv.personal.bio}</p>
        </section>
      )}

      {/* Skills */}
      {cv.skills.length > 0 && (
        <section>
          <h2 className="text-xs font-bold uppercase tracking-wider border-b pb-1 mb-2 text-slate-800">
            Core Competencies &amp; Skills
          </h2>
          <p className="text-xs text-slate-700 leading-relaxed font-medium">
            {cv.skills.map((s) => s.name).join(" • ")}
          </p>
        </section>
      )}

      {/* Experience */}
      {cv.experience.length > 0 && (
        <section>
          <h2 className="text-xs font-bold uppercase tracking-wider border-b pb-1 mb-3 text-slate-800">
            Professional Experience
          </h2>
          <div className="space-y-4">
            {cv.experience.map((exp) => (
              <div key={exp.id}>
                <div className="flex justify-between items-baseline">
                  <h3 className="text-xs font-bold text-slate-900">
                    {exp.position} — <span className="font-semibold text-slate-700">{exp.company}</span>
                  </h3>
                  <span className="text-[11px] font-mono text-slate-600">
                    {exp.startDate} – {exp.isCurrent ? "Present" : exp.endDate}
                  </span>
                </div>
                {exp.highlights.length > 0 && (
                  <ul className="mt-1.5 space-y-1 text-xs text-slate-700 list-disc list-outside ml-4">
                    {exp.highlights.map((hl, i) => (
                      <li key={i}>{hl}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Education */}
      {cv.education.length > 0 && (
        <section>
          <h2 className="text-xs font-bold uppercase tracking-wider border-b pb-1 mb-2 text-slate-800">
            Education
          </h2>
          <div className="space-y-2">
            {cv.education.map((edu) => (
              <div key={edu.id} className="flex justify-between items-baseline text-xs">
                <div>
                  <span className="font-bold text-slate-900">{edu.degree}</span>, {edu.institution}
                </div>
                <span className="text-[11px] font-mono text-slate-600">
                  {edu.startYear} – {edu.endYear} {edu.gpa && `(GPA: ${edu.gpa})`}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Projects */}
      {cv.projects.length > 0 && (
        <section>
          <h2 className="text-xs font-bold uppercase tracking-wider border-b pb-1 mb-2 text-slate-800">
            Projects
          </h2>
          <div className="space-y-2">
            {cv.projects.map((proj) => (
              <div key={proj.id} className="text-xs">
                <p className="font-bold text-slate-900">
                  {proj.name} <span className="font-normal text-slate-500">({proj.techStack})</span>
                </p>
                <p className="text-slate-700 mt-0.5">{proj.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
   TEMPLATE 4: EXECUTIVE CORPORATE (Formal Serifs & Leadership Grid)
   ──────────────────────────────────────────────────────────────────────────── */
function ExecutiveTemplate({ cv }: { cv: CvData }) {
  return (
    <div className="p-10 space-y-6">
      <div className="border-b-4 pb-4" style={{ borderColor: cv.themeColor }}>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">{cv.personal.fullName}</h1>
        <p className="text-base font-semibold text-slate-700 mt-1">{cv.personal.jobTitle}</p>
        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 mt-3">
          {cv.personal.email && <span>{cv.personal.email}</span>}
          {cv.personal.phone && <span>· {cv.personal.phone}</span>}
          {cv.personal.location && <span>· {cv.personal.location}</span>}
          {cv.personal.linkedin && <span>· {cv.personal.linkedin}</span>}
        </div>
      </div>

      {cv.personal.bio && (
        <section>
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-800 mb-2">Executive Summary</h2>
          <p className="text-xs text-slate-700 leading-relaxed">{cv.personal.bio}</p>
        </section>
      )}

      {/* Experience */}
      {cv.experience.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-800 border-b pb-1">
            Career Experience
          </h2>
          <div className="space-y-5">
            {cv.experience.map((exp) => (
              <div key={exp.id}>
                <div className="flex items-baseline justify-between">
                  <h3 className="text-sm font-bold text-slate-900">{exp.position}</h3>
                  <span className="text-xs font-mono font-medium text-slate-500">
                    {exp.startDate} – {exp.isCurrent ? "Present" : exp.endDate}
                  </span>
                </div>
                <p className="text-xs font-semibold text-slate-700 mb-2">
                  {exp.company} — {exp.location}
                </p>
                {exp.highlights.length > 0 && (
                  <ul className="space-y-1 text-xs text-slate-600 list-disc list-outside ml-4">
                    {exp.highlights.map((hl, i) => (
                      <li key={i}>{hl}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Education & Skills Grid */}
      <div className="grid grid-cols-2 gap-8 pt-2">
        {cv.education.length > 0 && (
          <section>
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-800 border-b pb-1 mb-2">
              Education
            </h2>
            {cv.education.map((edu) => (
              <div key={edu.id} className="text-xs mb-2">
                <p className="font-bold text-slate-900">{edu.degree}</p>
                <p className="text-slate-600">{edu.institution}</p>
              </div>
            ))}
          </section>
        )}

        {cv.skills.length > 0 && (
          <section>
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-800 border-b pb-1 mb-2">
              Core Competencies
            </h2>
            <div className="flex flex-wrap gap-1.5">
              {cv.skills.map((s, i) => (
                <span key={i} className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-800">
                  {s.name}
                </span>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
   TEMPLATE 5: CREATIVE TECH & STARTUP (High Visual Impact)
   ──────────────────────────────────────────────────────────────────────────── */
function CreativeTechTemplate({ cv }: { cv: CvData }) {
  return (
    <div className="p-8 sm:p-10 space-y-6">
      {/* Header with Color Block Accent */}
      <div className="p-6 rounded-2xl text-white relative overflow-hidden" style={{ backgroundColor: "#0b1219" }}>
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full blur-2xl opacity-20" style={{ backgroundColor: cv.themeColor }} />
        <div className="relative z-10 flex items-center justify-between gap-6">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-white/10 text-white mb-2 inline-block">
              {cv.personal.jobTitle}
            </span>
            <h1 className="text-3xl font-black text-white tracking-tight">{cv.personal.fullName}</h1>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 mt-3">
              {cv.personal.email && <span>{cv.personal.email}</span>}
              {cv.personal.location && <span>· {cv.personal.location}</span>}
              {cv.personal.website && (
                <span className="font-semibold" style={{ color: cv.themeColor }}>
                  · {cv.personal.website.replace(/^https?:\/\//, "")}
                </span>
              )}
            </div>
          </div>
          {cv.showPhoto && cv.personal.photoUrl && (
            <img
              src={cv.personal.photoUrl}
              alt={cv.personal.fullName}
              className="w-20 h-20 rounded-2xl object-cover border-2 shrink-0"
              style={{ borderColor: cv.themeColor }}
            />
          )}
        </div>
      </div>

      {/* Experience */}
      {cv.experience.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xs font-black uppercase tracking-wider flex items-center gap-2" style={{ color: cv.themeColor }}>
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cv.themeColor }} />
            Work History
          </h2>
          <div className="space-y-4">
            {cv.experience.map((exp) => (
              <div key={exp.id} className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex justify-between items-baseline">
                  <h3 className="text-sm font-bold text-slate-900">{exp.position}</h3>
                  <span className="text-[10px] font-mono font-bold text-slate-500">
                    {exp.startDate} — {exp.isCurrent ? "Present" : exp.endDate}
                  </span>
                </div>
                <p className="text-xs font-semibold text-slate-600 mb-2">{exp.company}</p>
                {exp.highlights.length > 0 && (
                  <ul className="space-y-1 text-xs text-slate-600 list-disc list-outside ml-4">
                    {exp.highlights.map((hl, i) => (
                      <li key={i}>{hl}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Projects Grid */}
      {cv.projects.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xs font-black uppercase tracking-wider flex items-center gap-2" style={{ color: cv.themeColor }}>
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cv.themeColor }} />
            Featured Projects
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {cv.projects.map((proj) => (
              <div key={proj.id} className="p-3 rounded-xl border border-slate-200">
                <h3 className="text-xs font-bold text-slate-900">{proj.name}</h3>
                <p className="text-[10px] font-mono text-slate-500 mt-0.5">{proj.techStack}</p>
                <p className="text-xs text-slate-600 mt-1">{proj.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Skills Pill Badges */}
      {cv.skills.length > 0 && (
        <section>
          <h2 className="text-xs font-black uppercase tracking-wider mb-2 flex items-center gap-2" style={{ color: cv.themeColor }}>
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cv.themeColor }} />
            Technologies &amp; Competencies
          </h2>
          <div className="flex flex-wrap gap-1.5">
            {cv.skills.map((s, i) => (
              <span
                key={i}
                className="px-2.5 py-1 rounded-lg text-xs font-bold border"
                style={{ borderColor: `${cv.themeColor}50`, color: cv.themeColor, backgroundColor: `${cv.themeColor}10` }}
              >
                {s.name}
              </span>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
