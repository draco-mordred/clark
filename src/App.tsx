
import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const POSTINGS = [
  { id: "medicine", label: "Medicine", icon: "💊" },
  { id: "surgery", label: "Surgery", icon: "🔪" },
  { id: "specialty", label: "Specialty Postings", icon: "✨" },
  { id: "community", label: "Community Medicine", icon: "🏘️" },
  { id: "obgyn", label: "Obstetrics & Gynaecology", icon: "🤰" },
  { id: "paediatrics", label: "Paediatrics", icon: "👶" },
];

const postingLabel = (id: string) => POSTINGS.find((p) => p.id === id)?.label ?? id;

const SPECIALTY_UNITS = ["Ophthalmology", "Radiology", "Psychiatry", "ENT", "Dermatology", "Anaesthesiology"];

// Geeky Medics — per-posting curated clinical skills topics.
// Each entry links to a Geeky Medics search so links never break as their slugs change.
const GEEKY_HUB = "https://geekymedics.com/osce-guides/";
const gm = (topic: string) => `https://geekymedics.com/?s=${encodeURIComponent(topic)}`;
const GEEKY_TOPICS: Record<string, { label: string; url: string }[]> = {
  medicine: [
    { label: "Cardiovascular examination 🎥", url: "https://geekymedics.com/cardiovascular-examination-2/" },
    { label: "Respiratory examination 🎥", url: gm("respiratory examination OSCE guide") },
    { label: "Abdominal examination 🎥", url: gm("abdominal examination OSCE guide") },
    { label: "Cranial nerve examination 🎥", url: gm("cranial nerve examination") },
    { label: "Thyroid status examination 🎥", url: gm("thyroid status examination") },
    { label: "History taking guides", url: gm("history taking") },
  ],
  surgery: [
    { label: "Peripheral vascular examination 🎥", url: gm("peripheral vascular examination") },
    { label: "Breast examination 🎥", url: gm("breast examination") },
    { label: "Hernia examination 🎥", url: gm("hernia examination") },
    { label: "Male catheterisation", url: gm("urinary catheterisation") },
    { label: "Sutures & suturing", url: gm("sutures suturing") },
  ],
  specialty: [
    { label: "Fundoscopy (ophthalmoscopy) 🎥", url: gm("fundoscopy ophthalmoscopy") },
    { label: "Examination of the eyes & vision 🎥", url: gm("examination of the eyes and vision") },
    { label: "Ear (otoscopy) & ENT examination 🎥", url: gm("ear examination ENT") },
    { label: "Mental state examination 🎥", url: gm("mental state examination") },
    { label: "Dermatological examination 🎥", url: gm("dermatology examination") },
    { label: "Pre-operative assessment / anaesthesia", url: gm("anaesthesia pre-operative assessment") },
  ],
  community: [
    { label: "Hand hygiene & PPE", url: gm("hand hygiene") },
    { label: "Blood pressure measurement", url: gm("blood pressure measurement") },
    { label: "Child development assessment", url: gm("developmental assessment") },
    { label: "Immunisation", url: gm("immunisation") },
  ],
  obgyn: [
    { label: "Obstetric history taking 🎥", url: gm("obstetric history taking") },
    { label: "Obstetric (pregnancy) examination 🎥", url: gm("obstetric examination") },
    { label: "Speculum / cervical screening 🎥", url: gm("speculum examination") },
    { label: "Gynaecological history", url: gm("gynaecological history") },
  ],
  paediatrics: [
    { label: "Paediatric history taking 🎥", url: gm("paediatric history taking") },
    { label: "Paediatric cardiovascular examination 🎥", url: gm("paediatric cardiovascular examination") },
    { label: "Paediatric respiratory examination 🎥", url: gm("paediatric respiratory examination") },
    { label: "Newborn infant examination 🎥", url: gm("newborn infant examination") },
    { label: "Developmental assessment 🎥", url: gm("developmental assessment") },
  ],
};

type Source = { id: string; title: string; url: string; note: string };

type Clerk = {
  id: string;
  savedAt: string;
  meta: { name: string; age: string; sex: string; ward: string; bed: string; hospitalNo: string; clerkedBy: string; date: string; posting: string };
  history: {
    presenting: string; hpc: string; painAnalysis: string; sysReview: string;
    pastMed: string; pastSurg: string; drugs: string; allergies: string;
    family: string; social: string; obgyn: string;
  };
  exam: {
    vitals: string; general: string; system1: string; system1Name: string; system2: string; system2Name: string;
    others: string;
  };
  findings: string;
  dx: { working: string; differentials: string; investigations: string };
  plan: string;
  sources: Source[];
};

const emptyClerk = (): Clerk => ({
  id: crypto.randomUUID(),
  savedAt: "",
  meta: { name: "", age: "", sex: "", ward: "", bed: "", hospitalNo: "", clerkedBy: "", date: new Date().toISOString().slice(0, 10), posting: "medicine" },
  history: { presenting: "", hpc: "", painAnalysis: "", sysReview: "", pastMed: "", pastSurg: "", drugs: "", allergies: "", family: "", social: "", obgyn: "" },
  exam: { vitals: "", general: "", system1: "", system1Name: "Cardiovascular", system2: "", system2Name: "Respiratory", others: "" },
  findings: "",
  dx: { working: "", differentials: "", investigations: "" },
  plan: "",
  sources: [],
});

const F = (s: string) => (s && s.trim() ? s.trim() : "—");

// Extract a Google Drive folder id from most share-link formats
const extractDriveId = (link: string): string | null => {
  if (!link.trim()) return null;
  const m = link.match(/\/folders\/([a-zA-Z0-9_-]+)/) || link.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (m) return m[1];
  return /^[a-zA-Z0-9_-]{20,}$/.test(link.trim()) ? link.trim() : null;
};

const folderEmbedUrl = (id: string, view: "list" | "grid" = "list") =>
  `https://drive.google.com/embeddedfolderview?id=${id}#${view}`;

function buildPresentation(c: Clerk): string {
  const m = c.meta;
  const ageSex = [m.age ? m.age + " year old" : "", m.sex.toLowerCase()].filter(Boolean).join(" ");
  const lines: string[] = [];
  lines.push("CASE PRESENTATION");
  lines.push(`${F(m.name)}, a ${ageSex || "patient"} admitted ${m.ward ? "on " + m.ward + (m.bed ? " (bed " + m.bed + ")" : "") : ""}${m.hospitalNo ? ", Hosp. No: " + m.hospitalNo : ""}${m.posting ? " [" + postingLabel(m.posting) + " posting]" : ""}.`);
  lines.push("");
  lines.push("HISTORY");
  lines.push(`Presenting complaint: ${F(c.history.presenting)}`);
  lines.push(`History of presenting complaint:`);
  c.history.hpc.split(/\n+/).filter(Boolean).forEach((l) => lines.push("  • " + l.trim()));
  if (c.history.painAnalysis.trim()) lines.push(`Pain analysis: ${F(c.history.painAnalysis)}`);
  if (c.history.sysReview.trim()) {
    lines.push("Systemic review:");
    c.history.sysReview.split(/\n+/).filter(Boolean).forEach((l) => lines.push("  • " + l.trim()));
  }
  lines.push(`Past medical history: ${F(c.history.pastMed)}`);
  if (c.history.pastSurg.trim()) lines.push(`Past surgical history: ${F(c.history.pastSurg)}`);
  lines.push(`Drug history: ${F(c.history.drugs)}`);
  lines.push(`Allergies: ${F(c.history.allergies)}`);
  lines.push(`Family history: ${F(c.history.family)}`);
  lines.push(`Social history: ${F(c.history.social)}`);
  if (m.sex.toLowerCase() === "female" && c.history.obgyn.trim()) lines.push(`Obstetric/gynaecological history: ${F(c.history.obgyn)}`);
  lines.push("");
  lines.push("EXAMINATION");
  lines.push(`Vitals: ${F(c.exam.vitals)}`);
  lines.push(`General examination: ${F(c.exam.general)}`);
  if (c.exam.system1.trim()) lines.push(`${c.exam.system1Name} examination: ${F(c.exam.system1)}`);
  if (c.exam.system2.trim()) lines.push(`${c.exam.system2Name} examination: ${F(c.exam.system2)}`);
  if (c.exam.others.trim()) lines.push(`Other systems: ${F(c.exam.others)}`);
  lines.push("");
  lines.push(`SUMMARY OF FINDINGS: ${F(c.findings)}`);
  lines.push("");
  lines.push("ASSESSMENT");
  lines.push(`Working diagnosis: ${F(c.dx.working)}`);
  if (c.dx.differentials.trim()) {
    lines.push("Differentials:");
    c.dx.differentials.split(/\n+/).filter(Boolean).forEach((l) => lines.push("  • " + l.trim()));
  }
  if (c.dx.investigations.trim()) {
    lines.push("Investigations planned:");
    c.dx.investigations.split(/\n+/).filter(Boolean).forEach((l) => lines.push("  • " + l.trim()));
  }
  lines.push("");
  lines.push("MANAGEMENT PLAN");
  c.plan.split(/\n+/).filter(Boolean).forEach((l) => lines.push("  • " + l.trim()));
  if (c.plan.trim() === "") lines.push("  • —");
  if (c.sources && c.sources.length) {
    lines.push("");
    lines.push("REFERENCES / SOURCES");
    c.sources.forEach((s, i) => {
      lines.push(`  ${i + 1}. ${s.title}${s.note ? " — " + s.note : ""} (${s.url})`);
    });
  }
  return lines.join("\n");
}

function buildDocHtml(c: Clerk, pres: string): string {
  const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
  return `<html xmlns:w="urn:schemas-microsoft-com:office:word"><head><meta charset="utf-8">
<style>body{font-family:Calibri,sans-serif;font-size:11pt;line-height:1.4}h1{font-size:14pt}h2{font-size:12pt;border-bottom:1px solid #333}pre{font-family:Calibri;font-size:11pt;white-space:pre-wrap}.meta{color:#555}</style>
</head><body><h1>Clark — Patient Write-up</h1>
<p class="meta">${esc(c.meta.name || "Unnamed patient")} · ${esc(c.meta.age)}y ${esc(c.meta.sex)} · ${esc(c.meta.ward)}${c.meta.bed ? " bed " + esc(c.meta.bed) : ""} · Hosp No: ${esc(c.meta.hospitalNo)} · ${esc(c.meta.date)}${c.meta.clerkedBy ? " · Clerked by " + esc(c.meta.clerkedBy) : ""}</p>
<pre>${esc(pres)}</pre></body></html>`;
}

function Field({ label, value, onChange, rows = 3, placeholder }: { label: string; value: string; onChange: (v: string) => void; rows?: number; placeholder?: string }) {
  return (
    <div className="space-y-1.5 mb-4">
      <Label className="text-sm font-semibold text-slate-700">{label}</Label>
      <Textarea value={value} rows={rows} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className="w-full text-sm" />
    </div>
  );
}

function Single({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div className="space-y-1.5 mb-4">
      <Label className="text-sm font-semibold text-slate-700">{label}</Label>
      <Input value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className="text-sm" />
    </div>
  );
}

export default function App() {
  const [view, setView] = useState<"home" | "clerk" | "present" | "drive">("home");
  const [clerk, setClerk] = useState<Clerk>(emptyClerk());
  const [saved, setSaved] = useState<Clerk[]>([]);
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState("");
  const [postingFilter, setPostingFilter] = useState<string>("all");
  const [driveLinks, setDriveLinks] = useState<Record<string, string>>({});
  const [driveTab, setDriveTab] = useState<string>("medicine");
  const [srcDraft, setSrcDraft] = useState<{ title: string; url: string; note: string }>({ title: "", url: "", note: "" });
  const [textRefs, setTextRefs] = useState<Record<string, Source[]>>({});
  const [refDraft, setRefDraft] = useState<{ title: string; url: string; note: string }>({ title: "", url: "", note: "" });
  const toastTimer = useRef<number | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("wardclerk_records"); if (raw) setSaved(JSON.parse(raw));
      const dl = localStorage.getItem("wardclerk_drivelinks"); if (dl) setDriveLinks(JSON.parse(dl));
      const tr = localStorage.getItem("clark_textrefs"); if (tr) setTextRefs(JSON.parse(tr));
    } catch {}
  }, []);

  const saveTextRefs = (postingId: string, list: Source[]) => {
    const next = { ...textRefs, [postingId]: list };
    setTextRefs(next);
    try { localStorage.setItem("clark_textrefs", JSON.stringify(next)); } catch {}
  };

  const addTextRef = (postingId: string) => {
    if (!refDraft.title.trim() || !refDraft.url.trim()) { showToast("Add a title and link"); return; }
    saveTextRefs(postingId, [...(textRefs[postingId] ?? []), { id: crypto.randomUUID(), title: refDraft.title, url: refDraft.url, note: refDraft.note }]);
    setRefDraft({ title: "", url: "", note: "" });
    showToast("Reference added to library");
  };

  const saveDriveLink = (postingId: string, link: string) => {
    const next = { ...driveLinks, [postingId]: link };
    setDriveLinks(next);
    try { localStorage.setItem("wardclerk_drivelinks", JSON.stringify(next)); } catch {}
    showToast(link ? "Drive folder linked" : "Link cleared");
  };

  const showToast = (msg: string) => {
    setToast(msg);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(""), 2500);
  };

  const persist = (list: Clerk[]) => {
    setSaved(list);
    try { localStorage.setItem("wardclerk_records", JSON.stringify(list)); } catch {}
  };

  const saveClerk = () => {
    if (!clerk.meta.name.trim()) { showToast("Add at least the patient's name"); return; }
    const rec = { ...clerk, savedAt: new Date().toISOString() };
    const idx = saved.findIndex((s) => s.id === rec.id);
    const list = idx >= 0 ? saved.map((s, i) => (i === idx ? rec : s)) : [rec, ...saved];
    persist(list);
    setClerk(rec);
    showToast(idx >= 0 ? "Clerk updated" : "Clerk saved on this device");
  };

  const del = (id: string) => persist(saved.filter((s) => s.id !== id));

  const exportDoc = (c: Clerk) => {
    const html = buildDocHtml(c, buildPresentation(c));
    const blob = new Blob(["\ufeff", html], { type: "application/msword" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `clerk_${(c.meta.name || "patient").replace(/\s+/g, "_")}_${c.meta.date}.doc`;
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
    showToast("Word file downloaded");
  };

  const copyPres = async (text: string) => {
    try { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); }
    catch { showToast("Copy failed — select the text manually"); }
  };

  const completeness = (c: Clerk) => {
    const checks = [
      !!c.meta.name, !!c.history.presenting, !!c.history.hpc, !!c.history.pastMed,
      !!c.history.drugs, !!c.history.family, !!c.history.social,
      !!c.exam.vitals, !!c.exam.general, !!c.exam.system1,
      !!c.findings, !!c.dx.working, !!c.plan,
    ];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  };

  const set = <K extends keyof Clerk>(section: K, field: string, value: string) => {
    setClerk((prev) => {
      const sec = prev[section] as Record<string, string>;
      return { ...prev, [section]: { ...sec, [field]: value } };
    });
  };

  return (
    <div className="min-h-screen bg-slate-100 pb-24">
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-sm px-4 py-2 rounded-full shadow-lg">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="sticky top-0 z-40 bg-teal-700 text-white shadow">
        <div className="max-w-xl mx-auto px-4 py-3 flex items-center gap-3">
          <button className="text-2xl font-bold tracking-tight" onClick={() => setView("home")}>🩺 Clark</button>
          {view !== "home" && (
            <div className="ml-auto flex items-center gap-2">
              <Badge className="bg-teal-600 text-white">{completeness(clerk)}% complete</Badge>
              <Button size="sm" variant="secondary" onClick={saveClerk}>Save</Button>
              <Button size="sm" className="bg-white text-teal-800 hover:bg-teal-50" onClick={() => setView("present")}>Present</Button>
            </div>
          )}
        </div>
      </div>

      {/* HOME */}
      {view === "home" && (
        <div className="max-w-xl mx-auto p-4 space-y-4">
          <div className="flex gap-2">
            <Button className="flex-1 bg-teal-700 hover:bg-teal-800" onClick={() => { setClerk(emptyClerk()); setView("clerk"); }}>➕ Start new clerk</Button>
            <Button className="flex-1" variant="outline" onClick={() => setView("drive")}>📁 Library</Button>
          </div>

          <Card>
            <CardHeader><CardTitle className="text-lg">Saved clerks</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-1.5 flex-wrap">
                <button className={`text-xs px-2.5 py-1 rounded-full border ${postingFilter === "all" ? "bg-teal-700 text-white border-teal-700" : "bg-white text-slate-600"}`} onClick={() => setPostingFilter("all")}>All</button>
                {POSTINGS.map((p) => (
                  <button key={p.id} className={`text-xs px-2.5 py-1 rounded-full border ${postingFilter === p.id ? "bg-teal-700 text-white border-teal-700" : "bg-white text-slate-600"}`} onClick={() => setPostingFilter(p.id)}>
                    {p.icon} {p.label}
                  </button>
                ))}
              </div>
              <div className="space-y-2">
              {saved.length === 0 && <p className="text-sm text-slate-500">No saved clerks yet. Clerks are stored on this device only (offline-capable).</p>}
              {saved.filter((s) => postingFilter === "all" || s.meta.posting === postingFilter).map((s) => (
                <div key={s.id} className="flex items-center gap-2 border rounded-lg p-3 bg-slate-50">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm truncate">{s.meta.name || "Unnamed"}</p>
                    <p className="text-xs text-slate-500 truncate">{s.meta.age ? s.meta.age + "y " : ""}{s.meta.sex} · {postingLabel(s.meta.posting)} · {s.meta.date}{s.dx.working ? " · " + s.dx.working : ""}</p>
                    {s.sources && s.sources.length > 0 && <Badge className="mt-1 bg-amber-100 text-amber-800 border-0 text-[10px]">📚 {s.sources.length} source{s.sources.length > 1 ? "s" : ""}</Badge>}
                  </div>
                  <Button size="sm" variant="outline" onClick={() => { setClerk(s); setView("clerk"); }}>Open</Button>
                  <Button size="sm" variant="outline" onClick={() => exportDoc(s)}>Word</Button>
                  <Button size="sm" variant="destructive" onClick={() => del(s.id)}>✕</Button>
                </div>
              ))}
              </div>
            </CardContent>
          </Card>

          <p className="text-xs text-slate-400 text-center">For learning purposes — an aid to clerking, not a substitute for consultant guidance.</p>
        </div>
      )}

      {/* CLERK */}
      {view === "clerk" && (
        <div className="max-w-xl mx-auto p-4">
          <Tabs defaultValue="biodata" className="w-full">
            <TabsList className="w-full grid grid-cols-5 h-auto p-1 text-xs mb-4">
              <TabsTrigger value="biodata">Biodata</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
              <TabsTrigger value="exam">Exam</TabsTrigger>
              <TabsTrigger value="assess">Assess</TabsTrigger>
              <TabsTrigger value="plan">Plan</TabsTrigger>
            </TabsList>

            <TabsContent value="biodata">
              <Card><CardContent className="pt-4">
                <div className="space-y-1.5 mb-4">
                  <Label className="text-sm font-semibold text-slate-700">Posting</Label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {POSTINGS.map((p) => (
                      <button key={p.id} className={`text-xs px-2 py-2 rounded-lg border text-left ${clerk.meta.posting === p.id ? "bg-teal-700 text-white border-teal-700" : "bg-white text-slate-700"}`} onClick={() => set("meta", "posting", p.id)}>
                        {p.icon} {p.label}
                      </button>
                    ))}
                  </div>
                  {clerk.meta.posting === "specialty" && (
                    <p className="text-[11px] text-slate-500 mt-1">Specialty posting — note the unit (Ophthalmology, Radiology, Psychiatry, ENT, Dermatology, Anaesthesiology) in the ward/unit field.</p>
                  )}
                </div>
                <Single label="Patient name" value={clerk.meta.name} onChange={(v) => set("meta", "name", v)} placeholder="Surname, First name" />
                <div className="grid grid-cols-2 gap-3">
                  <Single label="Age (years)" value={clerk.meta.age} onChange={(v) => set("meta", "age", v)} placeholder="e.g. 34" />
                  <div className="space-y-1.5 mb-4">
                    <Label className="text-sm font-semibold text-slate-700">Sex</Label>
                    <Select value={clerk.meta.sex || "male"} onValueChange={(v) => set("meta", "sex", v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="male">Male</SelectItem><SelectItem value="female">Female</SelectItem></SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Single label="Ward / unit" value={clerk.meta.ward} onChange={(v) => set("meta", "ward", v)} placeholder="e.g. Medical Ward B" />
                  <Single label="Bed number" value={clerk.meta.bed} onChange={(v) => set("meta", "bed", v)} />
                </div>
                <Single label="Hospital number" value={clerk.meta.hospitalNo} onChange={(v) => set("meta", "hospitalNo", v)} />
                <Single label="Date clerked" value={clerk.meta.date} onChange={(v) => set("meta", "date", v)} placeholder="YYYY-MM-DD" />
                <Single label="Clerked by" value={clerk.meta.clerkedBy} onChange={(v) => set("meta", "clerkedBy", v)} placeholder="Your name / group" />
              </CardContent></Card>
            </TabsContent>

            <TabsContent value="history">
              <Card><CardContent className="pt-4">
                <Field label="Presenting complaint(s)" value={clerk.history.presenting} onChange={(v) => set("history", "presenting", v)} rows={2} placeholder="e.g. 2-week history of cough with hemoptysis" />
                <Field label="History of presenting complaint" value={clerk.history.hpc} onChange={(v) => set("history", "hpc", v)} rows={6} placeholder={"Chronology, onset, progression, associated symptoms… one point per line"} />
                <Field label="Pain analysis (SOCRATES) — if relevant" value={clerk.history.painAnalysis} onChange={(v) => set("history", "painAnalysis", v)} rows={3} placeholder={"Site · Onset · Character · Radiation · Associations · Timing · Exacerbating/relieving · Severity /10"} />
                <Field label="Systemic review" value={clerk.history.sysReview} onChange={(v) => set("history", "sysReview", v)} rows={5} placeholder={"CNS · CVS · Respiratory · GIT · GUT · Musculoskeletal — positives and pertinent negatives"} />
                <Field label="Past medical history" value={clerk.history.pastMed} onChange={(v) => set("history", "pastMed", v)} rows={3} placeholder={"Hypertension, DM, TB, sickle cell, surgeries…"} />
                <Field label="Past surgical history" value={clerk.history.pastSurg} onChange={(v) => set("history", "pastSurg", v)} rows={2} />
                <Field label="Drug history" value={clerk.history.drugs} onChange={(v) => set("history", "drugs", v)} rows={3} placeholder="Include traditional/herbal remedies" />
                <Field label="Allergies" value={clerk.history.allergies} onChange={(v) => set("history", "allergies", v)} rows={2} placeholder="Known allergies, or none known" />
                <Field label="Family history" value={clerk.history.family} onChange={(v) => set("history", "family", v)} rows={2} placeholder="Similar conditions, hereditary illnesses" />
                <Field label="Social history" value={clerk.history.social} onChange={(v) => set("history", "social", v)} rows={3} placeholder="Occupation, smoking, alcohol, residence, travel" />
                {clerk.meta.sex === "female" && (
                  <Field label="Obstetric / gynaecological history" value={clerk.history.obgyn} onChange={(v) => set("history", "obgyn", v)} rows={3} placeholder="Menstrual history, pregnancies (GP notation), contraception, last menstrual period" />
                )}
              </CardContent></Card>
            </TabsContent>

            <TabsContent value="exam">
              <Card><CardContent className="pt-4">
                <Field label="Vitals" value={clerk.exam.vitals} onChange={(v) => set("exam", "vitals", v)} rows={3} placeholder="Temp °C · PR /min · RR /min · BP mmHg · SpO₂ · pain score" />
                <Field label="General examination" value={clerk.exam.general} onChange={(v) => set("exam", "general", v)} rows={4} placeholder="Alertness, pallor, jaundice, cyanosis, clubbing, oedema, hydration, nutrition (5 cardinal signs)" />
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5 mb-4">
                    <Label className="text-sm font-semibold text-slate-700">System 1</Label>
                    <Select value={clerk.exam.system1Name} onValueChange={(v) => set("exam", "system1Name", v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {["Cardiovascular", "Respiratory", "Abdomen", "CNS", "Musculoskeletal", "Skin", "Head & Neck", "Genitourinary"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5 mb-4">
                    <Label className="text-sm font-semibold text-slate-700">System 2</Label>
                    <Select value={clerk.exam.system2Name} onValueChange={(v) => set("exam", "system2Name", v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {["Cardiovascular", "Respiratory", "Abdomen", "CNS", "Musculoskeletal", "Skin", "Head & Neck", "Genitourinary"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Field label={`${clerk.exam.system1Name} examination`} value={clerk.exam.system1} onChange={(v) => set("exam", "system1", v)} rows={4} placeholder="Inspection · Palpation · Percussion · Auscultation" />
                <Field label={`${clerk.exam.system2Name} examination`} value={clerk.exam.system2} onChange={(v) => set("exam", "system2", v)} rows={4} />
                <Field label="Other systems / summary of signs" value={clerk.exam.others} onChange={(v) => set("exam", "others", v)} rows={3} />
              </CardContent></Card>
            </TabsContent>

            <TabsContent value="assess">
              <Card><CardContent className="pt-4">
                <Field label="Summary of findings" value={clerk.findings} onChange={(v) => setClerk((p) => ({ ...p, findings: v }))} rows={5} placeholder="A short paragraph tying the history and exam together — 'Mr X is a … who presented with … significant findings include…'" />
                <Field label="Working diagnosis" value={clerk.dx.working} onChange={(v) => set("dx", "working", v)} rows={2} />
                <Field label="Differential diagnoses" value={clerk.dx.differentials} onChange={(v) => set("dx", "differentials", v)} rows={4} placeholder={"One differential per line, with a phrase on why it fits / what distinguishes it"} />
                <Field label="Investigations planned" value={clerk.dx.investigations} onChange={(v) => set("dx", "investigations", v)} rows={4} placeholder={"Bedside · Laboratory · Imaging — one per line, with rationale"} />
              </CardContent></Card>
            </TabsContent>

            <TabsContent value="plan">
              <Card><CardContent className="pt-4">
                <Field label="Management plan" value={clerk.plan} onChange={(v) => setClerk((p) => ({ ...p, plan: v }))} rows={8} placeholder={"One item per line: conservative measures, drugs (name/dose/route/duration), monitoring, referral, patient education, definitive treatment"} />

                <div className="border-t pt-3">
                  <Label className="text-sm font-semibold text-slate-700">📚 Sources & references</Label>
                  <p className="text-xs text-slate-500 mb-2">Link Drive files or any reference used for this clerk (e.g. a lecture slide from the posting's Drive folder — right-click a Drive file → Share → Copy link). Cited in the write-up.</p>
                  {clerk.sources.map((s) => (
                    <div key={s.id} className="flex items-start gap-2 border rounded-lg p-2 bg-amber-50 mb-2">
                      <div className="min-w-0 flex-1">
                        <a href={s.url} target="_blank" rel="noreferrer" className="text-sm font-semibold text-teal-800 underline break-all">{s.title}</a>
                        {s.note && <p className="text-xs text-slate-600">{s.note}</p>}
                      </div>
                      <Button size="sm" variant="ghost" className="text-xs" onClick={() => setClerk((p) => ({ ...p, sources: p.sources.filter((x) => x.id !== s.id) }))}>Remove</Button>
                    </div>
                  ))}
                  <div className="space-y-2 border rounded-lg p-2 bg-slate-50">
                    <Input className="text-sm" placeholder="Source title (e.g. 'Chest pain lecture slides')" value={srcDraft.title} onChange={(e) => setSrcDraft({ ...srcDraft, title: e.target.value })} />
                    <Input className="text-sm" placeholder="Drive/file URL" value={srcDraft.url} onChange={(e) => setSrcDraft({ ...srcDraft, url: e.target.value })} />
                    <Input className="text-sm" placeholder="Note (optional — what it supported)" value={srcDraft.note} onChange={(e) => setSrcDraft({ ...srcDraft, note: e.target.value })} />
                    <Button size="sm" variant="outline" className="w-full" onClick={() => {
                      if (!srcDraft.title.trim() || !srcDraft.url.trim()) { showToast("Add a title and URL"); return; }
                      setClerk((p) => ({ ...p, sources: [...p.sources, { id: crypto.randomUUID(), title: srcDraft.title, url: srcDraft.url, note: srcDraft.note }] }));
                      setSrcDraft({ title: "", url: "", note: "" });
                      showToast("Source added");
                    }}>+ Add source</Button>
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <Button className="flex-1 bg-teal-700 hover:bg-teal-800" onClick={saveClerk}>Save clerk</Button>
                  <Button className="flex-1" variant="outline" onClick={() => setView("present")}>Generate presentation</Button>
                </div>
              </CardContent></Card>
            </TabsContent>
          </Tabs>
        </div>
      )}

      {/* PRESENT */}
      {view === "present" && (
        <div className="max-w-xl mx-auto p-4 space-y-3">
          <div className="flex gap-2">
            <Button className="flex-1 bg-teal-700 hover:bg-teal-800" onClick={() => copyPres(buildPresentation(clerk))}>{copied ? "✓ Copied" : "Copy presentation"}</Button>
            <Button className="flex-1" variant="outline" onClick={() => exportDoc(clerk)}>Download Word (.doc)</Button>
            <Button variant="outline" onClick={() => setView("clerk")}>Edit</Button>
          </div>
          <Card><CardContent className="pt-4">
            <pre className="text-sm whitespace-pre-wrap font-sans leading-relaxed">{buildPresentation(clerk)}</pre>
          </CardContent></Card>
        </div>
      )}

      {/* DRIVE LIBRARY */}
      {view === "drive" && (
        <div className="max-w-xl mx-auto p-4 space-y-4">
          <div className="flex gap-1.5 flex-wrap">
            {POSTINGS.map((p) => (
              <button key={p.id} className={`text-xs px-2.5 py-1 rounded-full border ${driveTab === p.id ? "bg-teal-700 text-white border-teal-700" : "bg-white text-slate-600"}`} onClick={() => setDriveTab(p.id)}>
                {p.icon} {p.label}
              </button>
            ))}
          </div>

          <Card>
            <CardHeader><CardTitle className="text-lg">{POSTINGS.find((p) => p.id === driveTab)?.icon} {postingLabel(driveTab)} — Drive folder</CardTitle></CardHeader>
            <CardContent>
              <p className="text-xs text-slate-500 mb-2">
                In Google Drive: open the posting's folder → Share → set to <b>"Anyone with the link"</b> → Copy link → paste it below.
                {driveTab === "specialty" && " For specialty postings you can link one folder per unit by pasting each unit's folder link when you switch to that posting."}
              </p>
              <div className="flex gap-2">
                <Input className="text-sm" placeholder="https://drive.google.com/drive/folders/…" value={driveLinks[driveTab] ?? ""} onChange={(e) => setDriveLinks({ ...driveLinks, [driveTab]: e.target.value })} />
                <Button size="sm" className="bg-teal-700 hover:bg-teal-800 shrink-0" onClick={() => {
                  const raw = (driveLinks[driveTab] ?? "").trim();
                  if (raw && !extractDriveId(raw)) { showToast("That doesn't look like a Drive folder link"); return; }
                  saveDriveLink(driveTab, raw);
                }}>Link</Button>
              </div>
              {driveTab === "specialty" && SPECIALTY_UNITS.length > 0 && (
                <p className="text-[11px] text-slate-400 mt-2">Units in this posting: {SPECIALTY_UNITS.join(", ")}.</p>
              )}
            </CardContent>
          </Card>

          {(() => {
            const id = extractDriveId(driveLinks[driveTab] ?? "");
            if (!id) return (
              <Card><CardContent className="pt-4">
                <p className="text-sm text-slate-500 text-center py-8">No Drive folder linked for {postingLabel(driveTab)} yet. Paste a folder link above and tap Link.</p>
              </CardContent></Card>
            );
            return (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-lg">📁 Folder contents</CardTitle>
                  <a href={`https://drive.google.com/drive/folders/${id}`} target="_blank" rel="noreferrer" className="text-xs text-teal-700 underline">Open in Drive ↗</a>
                </CardHeader>
                <CardContent>
                  <iframe src={folderEmbedUrl(id)} className="w-full rounded-lg border" style={{ height: "60vh" }} title="Drive folder" />
                  <p className="text-[11px] text-slate-400 mt-2">To cite a file in a clerk: open it in Drive → Share → Copy link → add it under Sources in the clerk's Plan tab.</p>
                </CardContent>
              </Card>
            );
          })()}

          <Card>
            <CardHeader><CardTitle className="text-lg">📖 Textbooks & references</CardTitle></CardHeader>
            <CardContent>
              <p className="text-xs text-slate-500 mb-2">Standard textbooks for the {postingLabel(driveTab)} posting — add from your Drive (paste the file/folder link) or manually (e.g. "Kumar & Clark 10th ed., p. 340"). Cite them in clerks via the Sources section.</p>
              {(textRefs[driveTab] ?? []).map((r) => (
                <div key={r.id} className="flex items-start gap-2 border rounded-lg p-2 bg-slate-50 mb-2">
                  <div className="min-w-0 flex-1">
                    <a href={r.url} target="_blank" rel="noreferrer" className="text-sm font-semibold text-teal-800 underline break-all">{r.title}</a>
                    {r.note && <p className="text-xs text-slate-600">{r.note}</p>}
                  </div>
                  <div className="flex flex-col gap-1">
                    <Button size="sm" variant="ghost" className="text-xs" onClick={() => {
                      navigator.clipboard?.writeText(r.url).catch(() => {});
                      showToast("Link copied — paste it in a clerk's Sources");
                    }}>Copy link</Button>
                    <Button size="sm" variant="ghost" className="text-xs text-red-600" onClick={() => saveTextRefs(driveTab, (textRefs[driveTab] ?? []).filter((x) => x.id !== r.id))}>Remove</Button>
                  </div>
                </div>
              ))}
              <div className="space-y-2 border rounded-lg p-2 bg-white">
                <Input className="text-sm" placeholder="Reference title (e.g. 'Davidson's 24th ed — Ch. 17')" value={refDraft.title} onChange={(e) => setRefDraft({ ...refDraft, title: e.target.value })} />
                <Input className="text-sm" placeholder="Drive/URL link (optional for print books)" value={refDraft.url} onChange={(e) => setRefDraft({ ...refDraft, url: e.target.value })} />
                <Input className="text-sm" placeholder="Note (optional — e.g. pages, edition)" value={refDraft.note} onChange={(e) => setRefDraft({ ...refDraft, note: e.target.value })} />
                <Button size="sm" variant="outline" className="w-full" onClick={() => addTextRef(driveTab)}>+ Add reference</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-lg">🎥 Geeky Medics guides</CardTitle>
              <a href={GEEKY_HUB} target="_blank" rel="noreferrer" className="text-xs text-teal-700 underline">All OSCE guides ↗</a>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-slate-500 mb-2">Step-by-step examination guides with video demonstrations, matched to the {postingLabel(driveTab)} posting.</p>
              <div className="space-y-1.5">
                {(GEEKY_TOPICS[driveTab] ?? []).map((t) => (
                  <a key={t.url} href={t.url} target="_blank" rel="noreferrer" className="block text-sm text-teal-800 hover:bg-teal-50 rounded-lg border px-3 py-2">
                    ▶ {t.label}
                  </a>
                ))}
              </div>
              <p className="text-[11px] text-slate-400 mt-2">geekymedics.com — free revision guides, videos & checklists.</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Mobile bottom nav */}
      {view !== "home" && (
        <div className="fixed bottom-0 inset-x-0 bg-white border-t z-40 shadow">
          <div className="max-w-xl mx-auto grid grid-cols-2 gap-2 p-2">
            <Button variant="ghost" onClick={() => setView("home")}>← All clerks</Button>
            <Button variant="ghost" onClick={saveClerk}>💾 Save</Button>
          </div>
        </div>
      )}
    </div>
  );
}
