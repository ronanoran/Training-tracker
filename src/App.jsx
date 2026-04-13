import { useState, useRef, useEffect, useCallback } from "react";

// ─── localStorage helpers ──────────────────────────────────────────────────
const load = (key, fallback) => { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; } };
const save = (key, val) => { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} };

// ─── Exercise Data ─────────────────────────────────────────────────────────
const DEFAULT_MONDAY = [
  [
    { id: "m1a", name: "Trap Bar Deadlift", sets: 4, reps: "5", note: "Main posterior chain builder" },
    { id: "m2a", name: "Bulgarian Split Squat", sets: 3, reps: "8 each", note: "Single-leg stability" },
    { id: "m3a", name: "Bent-Over Row", sets: 3, reps: "10", note: "Horizontal pull" },
    { id: "m4a", name: "Copenhagen Planks", sets: 3, reps: "8 each side", note: "Groin/hip resilience" },
    { id: "m5a", name: "Farmer's Walk", sets: 3, reps: "20m", note: "Loaded carry for contact prep" },
    { id: "m6a", name: "Isometric Neck Holds", sets: 3, reps: "10s each side", note: "Front, back, sides" },
  ],
  [
    { id: "m1b", name: "Romanian Deadlift", sets: 4, reps: "6", note: "Hamstring focus, control descent" },
    { id: "m2b", name: "Rear-Foot Elevated Lunge", sets: 3, reps: "8 each", note: "Hip flexor mobility under load" },
    { id: "m3b", name: "Chest-Supported DB Row", sets: 3, reps: "10", note: "Remove lower back from equation" },
    { id: "m4b", name: "Side Plank + Hip Abduction", sets: 3, reps: "10 each side", note: "Lateral stability" },
    { id: "m5b", name: "Suitcase Carry", sets: 3, reps: "20m each", note: "Anti-lateral flexion" },
    { id: "m6b", name: "Isometric Neck Holds", sets: 3, reps: "10s each side", note: "Front, back, sides" },
  ],
  [
    { id: "m1c", name: "Back Squat", sets: 4, reps: "5", note: "Full depth, brace hard" },
    { id: "m2c", name: "Step-Up with Knee Drive", sets: 3, reps: "8 each", note: "No push off back foot" },
    { id: "m3c", name: "Pendlay Row", sets: 3, reps: "8", note: "Explosive pull from floor" },
    { id: "m4c", name: "Copenhagen Planks", sets: 3, reps: "10 each side", note: "Progress from Week 1" },
    { id: "m5c", name: "Double KB Carry", sets: 3, reps: "25m", note: "Heavier than Week 1" },
    { id: "m6c", name: "Isometric Neck Holds", sets: 3, reps: "12s each side", note: "Build duration" },
  ],
  [
    { id: "m1d", name: "Trap Bar Deadlift", sets: 3, reps: "4", note: "Deload — drop 15%, perfect form" },
    { id: "m2d", name: "Goblet Squat", sets: 3, reps: "10", note: "Mobility focus" },
    { id: "m3d", name: "Single-Arm DB Row", sets: 3, reps: "10 each", note: "Full range of motion" },
    { id: "m4d", name: "Dead Bug", sets: 3, reps: "8 each side", note: "Trunk control reset" },
    { id: "m5d", name: "Farmer's Walk", sets: 2, reps: "20m", note: "Lighter — recovery week" },
    { id: "m6d", name: "Isometric Neck Holds", sets: 2, reps: "10s each side", note: "Maintenance" },
  ],
];

const DEFAULT_THURSDAY = [
  [
    { id: "t1a", name: "Hang Power Clean", sets: 4, reps: "4", note: "Explosive — speed not weight" },
    { id: "t2a", name: "Box Jump", sets: 3, reps: "5", note: "Reset fully between reps" },
    { id: "t3a", name: "Hip Thrust", sets: 3, reps: "10", note: "Full hip extension at top" },
    { id: "t4a", name: "Single-Leg RDL", sets: 3, reps: "8 each", note: "Control the descent" },
    { id: "t5a", name: "Lateral Band Walks", sets: 2, reps: "15 each", note: "Prehab" },
    { id: "t6a", name: "Mini Band Squats", sets: 2, reps: "15", note: "Prehab" },
  ],
  [
    { id: "t1b", name: "Trap Bar Jump", sets: 4, reps: "5", note: "Light load, maximum intent" },
    { id: "t2b", name: "Broad Jump", sets: 3, reps: "4", note: "Stick landing — deceleration counts" },
    { id: "t3b", name: "Glute Bridge with Band", sets: 3, reps: "12", note: "Band above knees" },
    { id: "t4b", name: "Nordic Hamstring Curl", sets: 3, reps: "5", note: "Eccentric — control down" },
    { id: "t5b", name: "Clamshells", sets: 2, reps: "15 each", note: "Prehab — glute med" },
    { id: "t6b", name: "Ankle Hops", sets: 2, reps: "15", note: "Stiffness training" },
  ],
  [
    { id: "t1c", name: "DB Power Snatch", sets: 4, reps: "3 each", note: "Speed through the pull" },
    { id: "t2c", name: "Reactive Box Jump", sets: 3, reps: "4", note: "Drop off box then immediately jump" },
    { id: "t3c", name: "Hip Thrust", sets: 4, reps: "8", note: "Add 5kg from Week 1" },
    { id: "t4c", name: "Single-Leg RDL to Row", sets: 3, reps: "8 each", note: "Balance + pull combo" },
    { id: "t5c", name: "Monster Walks", sets: 2, reps: "15 each direction", note: "Prehab" },
    { id: "t6c", name: "Mini Band Squats", sets: 2, reps: "15", note: "Prehab" },
  ],
  [
    { id: "t1d", name: "Hang Power Clean", sets: 3, reps: "3", note: "Deload — light, perfect mechanics" },
    { id: "t2d", name: "Box Jump", sets: 2, reps: "4", note: "Lower box height this week" },
    { id: "t3d", name: "Hip Thrust", sets: 2, reps: "10", note: "Bodyweight or light load" },
    { id: "t4d", name: "Single-Leg Glute Bridge", sets: 2, reps: "10 each", note: "Floor variation" },
    { id: "t5d", name: "Lateral Band Walks", sets: 2, reps: "12 each", note: "Maintenance" },
    { id: "t6d", name: "Ankle Mobility Drill", sets: 2, reps: "10 each", note: "Wall ankle stretch" },
  ],
];

const DEFAULT_WEEK_TEMPLATE = [
  { day: "Monday", type: "gym", label: "Strength & Collision Prep", icon: "🏋️" },
  { day: "Tuesday", type: "rugby", label: "Rugby Training", icon: "🏉", notes: "Evening session. Focus on skills, team drills, set pieces." },
  { day: "Wednesday", type: "run", label: "Easy Recovery Run", icon: "🏃", target: "6km easy — conversational pace only. If last night was brutal, drop to 4km." },
  { day: "Thursday", type: "gym", label: "Power & Speed", icon: "⚡" },
  { day: "Friday", type: "run", label: "Tempo / Intervals", icon: "🏃", target: "7–8km — alternate: 3×2km at HM effort OR 5×1km at 10km effort with 90s rest" },
  { day: "Saturday", type: "rugby", label: "Match Day", icon: "🏉", notes: "Matches until June 15. Dynamic warm-up only. Fuel 2–3hrs before kick-off." },
  { day: "Sunday", type: "run", label: "Long Run / Long Cycle", icon: "🚴", target: "10–12km long run — or monthly long cycle (60–100km easy pace)" },
];

// ─── Colors ────────────────────────────────────────────────────────────────
const C = {
  bg: "#080c10", surface: "#0e1318", card: "#111820", border: "#1a2430", borderHi: "#243040",
  text: "#dde6f0", muted: "#b8d0e0", dim: "#5a7a8a",
  gym: { accent: "#4da6ff", light: "#091a2e" },
  rugby: { accent: "#ff8c3b", light: "#1e1000" },
  run: { accent: "#3dffa0", light: "#051a10" },
  green: "#3dffa0", blue: "#4da6ff", orange: "#ff8c3b", red: "#ff5566",
  cyan: "#3dd9ff", purple: "#b47aff", gold: "#ffd166",
};
const accentFor = t => ({ gym: C.blue, rugby: C.orange, run: C.green }[t] || C.blue);
const lightFor = t => ({ gym: C.gym.light, rugby: C.rugby.light, run: C.run.light }[t] || C.gym.light);
const CYCLE_LABELS = ["Strength Base", "Volume Build", "Intensity Peak", "Deload & Reset"];

// ─── Pace utils ────────────────────────────────────────────────────────────
function parseTime(str) {
  if (!str) return null;
  str = str.trim();
  if (str.includes(":")) { const [m, s] = str.split(":").map(Number); return m * 60 + (s || 0); }
  const n = parseFloat(str);
  return isNaN(n) ? null : n * 60;
}
function fmtTime(secs) {
  if (!secs || secs <= 0) return "";
  const m = Math.floor(secs / 60), s = Math.round(secs % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}
function calcPace(type, distKm, timeSecs) {
  if (!distKm || !timeSecs || distKm <= 0 || timeSecs <= 0) return "";
  if (type === "cycle") return `${(distKm / (timeSecs / 3600)).toFixed(1)} km/h`;
  return `${fmtTime(timeSecs / distKm)} /km`;
}
function getMonthKey(dateStr) { return dateStr ? dateStr.slice(0, 7) : null; }
function getCurrentMonthKey() { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`; }
function fmtMonthLabel(key) { if (!key) return ""; const [y, m] = key.split("-"); return new Date(+y, +m - 1).toLocaleString("default", { month: "long" }); }
function getPrevBest(id, prevLogs) {
  const sets = prevLogs?.[id]; if (!sets?.length) return null;
  const w = sets.map(s => parseFloat(s.weight)).filter(Boolean);
  return w.length ? Math.max(...w) : null;
}

// ─── SetLogger ─────────────────────────────────────────────────────────────
function SetLogger({ exId, sets, saved, onSave, prevBest }) {
  const [rows, setRows] = useState(saved || Array.from({ length: sets }, (_, i) => ({ set: i + 1, weight: "", reps: "", done: false })));
  const upd = (i, f, v) => { const r = rows.map((x, j) => j === i ? { ...x, [f]: v } : x); setRows(r); onSave(exId, r); };
  const curBest = Math.max(...rows.map(r => parseFloat(r.weight) || 0));
  const isPR = prevBest && curBest > prevBest;
  return (
    <div style={{ marginTop: 10 }}>
      {prevBest && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, padding: "6px 10px", background: isPR ? "#0a2a10" : C.surface, borderRadius: 7, border: `1px solid ${isPR ? C.green + "40" : C.border}` }}>
          <span style={{ fontSize: 11, color: C.muted }}>Last cycle best:</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: isPR ? C.green : C.blue, fontFamily: "monospace" }}>{prevBest}kg</span>
          {isPR && <span style={{ fontSize: 9, fontWeight: 700, color: C.green, background: C.green + "20", padding: "2px 6px", borderRadius: 4, letterSpacing: 1 }}>NEW PR 🔥</span>}
        </div>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "26px 1fr 1fr 30px", gap: "3px 7px", marginBottom: 5 }}>
        {["SET", "KG", "REPS", ""].map((h, i) => <span key={i} style={{ fontSize: 9, color: C.muted, fontWeight: 700, letterSpacing: 1.5 }}>{h}</span>)}
      </div>
      {rows.map((row, i) => (
        <div key={i} style={{ display: "grid", gridTemplateColumns: "26px 1fr 1fr 30px", gap: "3px 7px", marginBottom: 5, alignItems: "center" }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: row.done ? C.green : C.muted, textAlign: "center", fontFamily: "monospace" }}>{row.set}</span>
          <input type="number" placeholder="—" value={row.weight} onChange={e => upd(i, "weight", e.target.value)} style={{ padding: "7px 8px", borderRadius: 7, border: `1px solid ${row.done ? C.green + "50" : C.border}`, fontSize: 13, background: row.done ? "#051a10" : C.surface, color: C.text, outline: "none", width: "100%", boxSizing: "border-box", fontFamily: "monospace" }} />
          <input type="text" placeholder="—" value={row.reps} onChange={e => upd(i, "reps", e.target.value)} style={{ padding: "7px 8px", borderRadius: 7, border: `1px solid ${row.done ? C.green + "50" : C.border}`, fontSize: 13, background: row.done ? "#051a10" : C.surface, color: C.text, outline: "none", width: "100%", boxSizing: "border-box", fontFamily: "monospace" }} />
          <button onClick={() => upd(i, "done", !row.done)} style={{ width: 28, height: 28, borderRadius: 7, border: `1px solid ${row.done ? C.green + "80" : C.border}`, background: row.done ? C.green + "18" : "transparent", color: row.done ? C.green : C.muted, cursor: "pointer", fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {row.done ? "✓" : "○"}
          </button>
        </div>
      ))}
    </div>
  );
}

function ExCard({ ex, saved, onSave, prevBest }) {
  const [open, setOpen] = useState(false);
  const done = saved?.length > 0 && saved.every(s => s.done);
  return (
    <div style={{ border: `1px solid ${done ? C.green + "45" : C.border}`, borderRadius: 12, marginBottom: 8, background: done ? "#051a10" : C.card, overflow: "hidden" }}>
      <div onClick={() => setOpen(!open)} style={{ padding: "12px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
            {done && <span style={{ fontSize: 11, color: C.green }}>✓</span>}
            <span style={{ fontWeight: 700, fontSize: 14, color: done ? C.green : C.text }}>{ex.name}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 11, color: C.muted }}>{ex.sets}×{ex.reps}{ex.note ? ` · ${ex.note}` : ""}</span>
            {prevBest && <span style={{ fontSize: 10, color: C.blue, fontFamily: "monospace" }}>prev {prevBest}kg</span>}
          </div>
        </div>
        <span style={{ fontSize: 12, color: C.muted, transform: open ? "rotate(180deg)" : "none", transition: "0.2s", marginLeft: 8 }}>▾</span>
      </div>
      {open && <div style={{ padding: "0 14px 13px", borderTop: `1px solid ${C.border}` }}>
        <SetLogger exId={ex.id} sets={ex.sets} saved={saved} onSave={onSave} prevBest={prevBest} />
      </div>}
    </div>
  );
}

function GymDay({ exList, gymLogs, saveSet, prevLogs }) {
  const [rest, setRest] = useState(false);
  if (rest) return (
    <div>
      <div style={{ textAlign: "center", padding: "28px", background: C.card, borderRadius: 14, border: `1px solid ${C.border}`, marginBottom: 10 }}>
        <div style={{ fontSize: 32, marginBottom: 8 }}>😴</div>
        <div style={{ fontWeight: 700, color: C.text, marginBottom: 3 }}>Rest Day Logged</div>
        <div style={{ fontSize: 12, color: C.muted }}>Intentional recovery. Smart move.</div>
      </div>
      <button onClick={() => setRest(false)} style={{ width: "100%", padding: "10px", borderRadius: 10, border: `1px solid ${C.border}`, background: C.surface, color: C.muted, fontWeight: 600, fontSize: 13, cursor: "pointer" }}>Undo</button>
    </div>
  );
  return (
    <div>
      <div style={{ fontSize: 9, color: C.muted, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 10 }}>{exList.length} exercises</div>
      {exList.map(ex => <ExCard key={ex.id} ex={ex} saved={gymLogs[ex.id]} onSave={saveSet} prevBest={getPrevBest(ex.id, prevLogs)} />)}
      <div style={{ marginTop: 12, padding: "11px 13px", background: C.card, borderRadius: 11, border: `1px solid ${C.border}`, marginBottom: 10 }}>
        <div style={{ fontSize: 9, color: C.muted, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 4 }}>Post-session</div>
        <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.6 }}>10 min mobility — hip flexors + thoracic spine. Protein within 60 min.</div>
      </div>
      <button onClick={() => setRest(true)} style={{ width: "100%", padding: "10px", borderRadius: 10, border: `1px solid ${C.border}`, background: C.surface, color: C.muted, fontWeight: 600, fontSize: 13, cursor: "pointer" }}>😴 Take a rest day instead</button>
    </div>
  );
}

function RunDay({ day, target, saved, onSave }) {
  const [data, setData] = useState(saved || { notes: "", done: false });
  const upd = (f, v) => { const u = { ...data, [f]: v }; setData(u); onSave(day, u); };
  return (
    <div>
      <div style={{ fontSize: 13, color: C.muted, background: C.surface, borderRadius: 10, padding: "10px 13px", marginBottom: 14, lineHeight: 1.6, border: `1px solid ${C.border}` }}>🎯 {target}</div>
      <div style={{ fontSize: 12, color: C.muted, marginBottom: 8 }}>Log distance & pace in the <span style={{ color: C.green, fontWeight: 700 }}>Log tab</span> after your session.</div>
      <textarea placeholder="Quick notes..." value={data.notes} onChange={e => upd("notes", e.target.value)} rows={2} style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, background: C.surface, color: C.text, outline: "none", resize: "none", boxSizing: "border-box", fontFamily: "inherit", marginBottom: 10 }} />
      <button onClick={() => upd("done", !data.done)} style={{ padding: "10px 18px", borderRadius: 10, border: `1px solid ${data.done ? C.green + "60" : C.borderHi}`, background: data.done ? C.green + "15" : C.card, color: data.done ? C.green : C.text, fontWeight: 700, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
        {data.done ? "✓ Session Done" : "Mark Complete"}
      </button>
    </div>
  );
}

function RugbyDay({ dayData, saved, onSave }) {
  const [data, setData] = useState(saved || { sessionNotes: "", injuryFlag: false, restDay: false, readiness: {}, done: false });
  const upd = (f, v) => { const u = { ...data, [f]: v }; setData(u); onSave(dayData.day, u); };
  const isMatch = dayData.day === "Saturday";
  if (data.restDay) return (
    <div>
      <div style={{ textAlign: "center", padding: "28px", background: C.card, borderRadius: 14, border: `1px solid ${C.border}`, marginBottom: 10 }}>
        <div style={{ fontSize: 32, marginBottom: 8 }}>😴</div>
        <div style={{ fontWeight: 700, color: C.text, marginBottom: 3 }}>Rest Day Logged</div>
      </div>
      <button onClick={() => upd("restDay", false)} style={{ width: "100%", padding: "10px", borderRadius: 10, border: `1px solid ${C.border}`, background: C.surface, color: C.muted, fontWeight: 600, fontSize: 13, cursor: "pointer" }}>Undo</button>
    </div>
  );
  return (
    <div>
      <div style={{ padding: "13px 15px", background: C.card, borderRadius: 12, border: `1px solid ${C.border}`, marginBottom: 10 }}>
        <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.7 }}>{dayData.notes}</div>
      </div>
      {isMatch && (
        <div style={{ background: C.rugby.light, borderRadius: 12, border: `1px solid ${C.orange}22`, padding: "14px", marginBottom: 10 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: C.orange, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 12 }}>Pre-Match Readiness</div>
          {[["sleep", "Sleep quality", ["Poor", "OK", "Good", "Great"]], ["soreness", "Body soreness", ["None", "Mild", "Moderate", "Heavy"]], ["energy", "Energy level", ["Low", "OK", "Good", "High"]]].map(([key, label, opts]) => (
            <div key={key} style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 11, color: C.muted, marginBottom: 6 }}>{label}</div>
              <div style={{ display: "flex", gap: 5 }}>
                {opts.map((opt, i) => (
                  <button key={opt} onClick={() => upd("readiness", { ...data.readiness, [key]: i })} style={{ flex: 1, padding: "7px 2px", borderRadius: 8, border: `1px solid ${data.readiness?.[key] === i ? C.orange + "70" : C.border}`, background: data.readiness?.[key] === i ? C.orange + "18" : C.surface, color: data.readiness?.[key] === i ? C.orange : C.muted, fontSize: 11, fontWeight: 600, cursor: "pointer" }}>{opt}</button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      <div style={{ marginBottom: 10 }}>
        <label style={{ fontSize: 9, color: C.muted, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5, display: "block", marginBottom: 5 }}>Session Notes</label>
        <textarea placeholder={isMatch ? "How did the match go?" : "How was training? Key drills, what felt good..."} value={data.sessionNotes} onChange={e => upd("sessionNotes", e.target.value)} rows={3} style={{ width: "100%", padding: "9px 10px", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, background: C.surface, color: C.text, outline: "none", resize: "none", boxSizing: "border-box", fontFamily: "inherit" }} />
      </div>
      <button onClick={() => upd("injuryFlag", !data.injuryFlag)} style={{ width: "100%", padding: "10px", borderRadius: 9, border: `1px solid ${data.injuryFlag ? C.red + "60" : C.border}`, background: data.injuryFlag ? C.red + "12" : C.surface, color: data.injuryFlag ? C.red : C.muted, fontWeight: 600, fontSize: 13, cursor: "pointer", marginBottom: 10, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
        🚩 {data.injuryFlag ? "Injury flagged" : "Flag an injury or niggle"}
      </button>
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={() => upd("done", !data.done)} style={{ flex: 1, padding: "11px", borderRadius: 10, border: `1px solid ${data.done ? C.green + "60" : C.borderHi}`, background: data.done ? C.green + "15" : C.card, color: data.done ? C.green : C.text, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
          {data.done ? "✓ Session Logged" : "Mark Complete"}
        </button>
        <button onClick={() => upd("restDay", true)} style={{ padding: "11px 14px", borderRadius: 10, border: `1px solid ${C.border}`, background: C.surface, color: C.muted, fontWeight: 600, fontSize: 12, cursor: "pointer" }}>😴 Rest</button>
      </div>
      {!isMatch && <div style={{ marginTop: 10, padding: "11px 13px", background: C.rugby.light, borderRadius: 11, border: `1px solid ${C.orange}20` }}>
        <div style={{ fontSize: 9, fontWeight: 700, color: C.orange, marginBottom: 4, textTransform: "uppercase", letterSpacing: 1.5 }}>Tomorrow morning</div>
        <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.5 }}>Wednesday run is recovery only. If tonight was brutal, drop to 4km or walk. No ego.</div>
      </div>}
    </div>
  );
}

function WeekSummaryBar({ weekNum, gymLogs, runLogs, rugbyLogs, activityLogs, getEx }) {
  const gymDone = ["Monday", "Thursday"].filter(day => getEx(day).every(ex => gymLogs[ex.id]?.every(s => s.done))).length;
  const rugbyDone = ["Tuesday", "Saturday"].filter(day => rugbyLogs[day]?.done).length;
  const runDone = ["Wednesday", "Friday", "Sunday"].filter(day => runLogs[day]?.done).length;
  const now = new Date(); const startOfWeek = new Date(now); startOfWeek.setDate(now.getDate() - now.getDay() + 1); startOfWeek.setHours(0,0,0,0); const endOfWeek = new Date(startOfWeek); endOfWeek.setDate(startOfWeek.getDate() + 7);
  const weekRunKm = activityLogs.filter(l => l.type === "run" && l.date && new Date(l.date) >= startOfWeek && new Date(l.date) < endOfWeek).reduce((a, l) => a + (parseFloat(l.distance) || 0), 0);
  const hasInjury = ["Tuesday", "Saturday"].some(d => rugbyLogs[d]?.injuryFlag);
  return (
    <div style={{ background: C.card, borderRadius: 14, padding: "14px", border: `1px solid ${C.border}`, marginTop: 8 }}>
      <div style={{ fontSize: 9, color: C.muted, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 12 }}>Week {weekNum} Summary</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8 }}>
        {[{ label: "Gym", value: `${gymDone}/2`, ok: gymDone === 2, color: C.blue }, { label: "Rugby", value: `${rugbyDone}/2`, ok: rugbyDone === 2, color: C.orange }, { label: "Runs", value: `${runDone}/3`, ok: runDone === 3, color: C.green }, { label: "Run km", value: `${weekRunKm.toFixed(1)}`, ok: weekRunKm >= 20, color: C.green }].map(({ label, value, ok, color }) => (
          <div key={label} style={{ background: C.surface, borderRadius: 9, padding: "10px 8px", border: `1px solid ${ok ? color + "35" : C.border}`, textAlign: "center" }}>
            <div style={{ fontSize: 9, color: C.muted, marginBottom: 4, letterSpacing: 0.8, textTransform: "uppercase" }}>{label}</div>
            <div style={{ fontSize: 17, fontWeight: 900, color: ok ? color : C.text, fontFamily: "'Barlow Condensed', monospace", lineHeight: 1 }}>{value}</div>
            {label === "Run km" && <div style={{ fontSize: 8, color: C.muted, marginTop: 2 }}>/ 20 target</div>}
          </div>
        ))}
      </div>
      {hasInjury && <div style={{ marginTop: 10, padding: "7px 10px", background: C.red + "10", borderRadius: 8, border: `1px solid ${C.red}30`, fontSize: 12, color: C.red }}>🚩 Injury flag active — monitor closely</div>}
    </div>
  );
}

// ─── Summary Tab ──────────────────────────────────────────────────────────
const RUN_PRS = [{ key: "5k", label: "5km" }, { key: "10k", label: "10km" }, { key: "half", label: "Half Marathon" }, { key: "full", label: "Full Marathon" }];
const LIFT_PRS = [{ key: "bench", label: "Bench Press" }, { key: "squat", label: "Squat" }, { key: "deadlift", label: "Deadlift" }];

function SummaryTab({ activityLogs, prs, onSavePrs }) {
  const [prEdit, setPrEdit] = useState(null);
  const [prInput, setPrInput] = useState("");
  const currentMonth = getCurrentMonthKey();
  const totalRun = activityLogs.filter(l => l.type === "run").reduce((a, l) => a + (parseFloat(l.distance) || 0), 0);
  const totalCycle = activityLogs.filter(l => l.type === "cycle").reduce((a, l) => a + (parseFloat(l.distance) || 0), 0);
  const totalSwim = activityLogs.filter(l => l.type === "swim").reduce((a, l) => a + (parseFloat(l.distance) || 0), 0);
  const monthRun = activityLogs.filter(l => l.type === "run" && getMonthKey(l.date) === currentMonth).reduce((a, l) => a + (parseFloat(l.distance) || 0), 0);
  const monthCycle = activityLogs.filter(l => l.type === "cycle" && getMonthKey(l.date) === currentMonth).reduce((a, l) => a + (parseFloat(l.distance) || 0), 0);
  const monthSwim = activityLogs.filter(l => l.type === "swim" && getMonthKey(l.date) === currentMonth).reduce((a, l) => a + (parseFloat(l.distance) || 0), 0);
  const savePr = (key, val) => { onSavePrs({ ...prs, [key]: { value: val, date: new Date().toISOString().slice(0, 10) } }); setPrEdit(null); setPrInput(""); };
  const Row = ({ icon, label, mo, all, color }) => (
    <div style={{ display: "grid", gridTemplateColumns: "28px 1fr 1fr 1fr", alignItems: "center", gap: 8, padding: "11px 0", borderBottom: `1px solid ${C.border}` }}>
      <span style={{ fontSize: 18 }}>{icon}</span>
      <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{label}</span>
      <div style={{ textAlign: "right" }}><div style={{ fontSize: 16, fontWeight: 800, color: mo > 0 ? color : C.dim, fontFamily: "'Barlow Condensed', monospace" }}>{mo.toFixed(1)}</div><div style={{ fontSize: 9, color: C.muted }}>km / mo</div></div>
      <div style={{ textAlign: "right" }}><div style={{ fontSize: 16, fontWeight: 800, color: all > 0 ? color : C.dim, fontFamily: "'Barlow Condensed', monospace" }}>{all.toFixed(1)}</div><div style={{ fontSize: 9, color: C.muted }}>km total</div></div>
    </div>
  );
  const PRItem = ({ prKey, label, unit, color }) => {
    const pr = prs[prKey]; const isEditing = prEdit === prKey;
    return (
      <div style={{ padding: "12px 14px", background: C.surface, borderRadius: 10, border: `1px solid ${pr ? color + "30" : C.border}`, marginBottom: 7 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div><div style={{ fontSize: 12, fontWeight: 700, color: C.text }}>{label}</div>{pr && <div style={{ fontSize: 10, color: C.muted }}>{pr.date}</div>}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {pr && !isEditing && <span style={{ fontSize: 20, fontWeight: 900, color, fontFamily: "'Barlow Condensed', monospace" }}>{pr.value} <span style={{ fontSize: 11, color: C.muted, fontWeight: 400 }}>{unit}</span></span>}
            {isEditing ? (
              <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
                <input autoFocus type="text" placeholder={unit} value={prInput} onChange={e => setPrInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && prInput) savePr(prKey, prInput); if (e.key === "Escape") { setPrEdit(null); setPrInput(""); } }} style={{ width: 80, padding: "6px 8px", borderRadius: 7, border: `1px solid ${color + "60"}`, background: C.card, color: C.text, fontSize: 13, outline: "none", fontFamily: "monospace", textAlign: "right" }} />
                <button onClick={() => { if (prInput) savePr(prKey, prInput); }} style={{ padding: "6px 10px", borderRadius: 7, border: `1px solid ${color + "60"}`, background: color + "20", color, fontWeight: 700, fontSize: 12, cursor: "pointer" }}>✓</button>
                <button onClick={() => { setPrEdit(null); setPrInput(""); }} style={{ padding: "6px 8px", borderRadius: 7, border: `1px solid ${C.border}`, background: "none", color: C.muted, fontSize: 12, cursor: "pointer" }}>✕</button>
              </div>
            ) : (
              <button onClick={() => { setPrEdit(prKey); setPrInput(pr?.value || ""); }} style={{ padding: "5px 10px", borderRadius: 7, border: `1px solid ${C.border}`, background: "none", color: C.muted, fontSize: 11, cursor: "pointer", fontWeight: 600 }}>{pr ? "Edit" : "+ Set PR"}</button>
            )}
          </div>
        </div>
      </div>
    );
  };
  return (
    <div>
      <div style={{ background: C.card, borderRadius: 14, padding: "14px 16px", border: `1px solid ${C.border}`, marginBottom: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "28px 1fr 1fr 1fr", gap: 8, marginBottom: 8 }}>
          <span /><span style={{ fontSize: 9, color: C.muted, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>Activity</span>
          <span style={{ fontSize: 9, color: C.muted, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, textAlign: "right" }}>{fmtMonthLabel(currentMonth)}</span>
          <span style={{ fontSize: 9, color: C.muted, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, textAlign: "right" }}>All Time</span>
        </div>
        <Row icon="🏃" label="Running" mo={monthRun} all={totalRun} color={C.green} />
        <Row icon="🚴" label="Cycling" mo={monthCycle} all={totalCycle} color={C.cyan} />
        <Row icon="🏊" label="Swimming" mo={monthSwim} all={totalSwim} color={C.purple} />
      </div>
      <div style={{ fontSize: 10, color: C.green, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}><span style={{ fontSize: 14 }}>🏅</span> Running PRs</div>
      {RUN_PRS.map(pr => <PRItem key={pr.key} prKey={pr.key} label={pr.label} unit="mm:ss" color={C.green} />)}
      <div style={{ fontSize: 10, color: C.blue, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5, margin: "16px 0 10px", display: "flex", alignItems: "center", gap: 6 }}><span style={{ fontSize: 14 }}>🏋️</span> Lifting PRs</div>
      {LIFT_PRS.map(pr => <PRItem key={pr.key} prKey={pr.key} label={pr.label} unit="kg" color={C.blue} />)}
    </div>
  );
}

// ─── Log Tab ──────────────────────────────────────────────────────────────
const ACTIVITY_TYPES = [
  { key: "run", label: "Run", icon: "🏃", color: "#3dffa0", paceLabel: "Pace /km", distLabel: "Distance (km)", timeLabel: "Time (mm:ss or min)" },
  { key: "cycle", label: "Cycle", icon: "🚴", color: "#3dd9ff", paceLabel: "Speed (km/h)", distLabel: "Distance (km)", timeLabel: "Time (hrs)" },
  { key: "swim", label: "Swim", icon: "🏊", color: "#b47aff", paceLabel: "Pace /km", distLabel: "Distance (km)", timeLabel: "Time (mm:ss or min)" },
];

function LogTab({ logs, onSave }) {
  const empty = { type: "run", date: "", distance: "", time: "", notes: "" };
  const [form, setForm] = useState(empty);
  const [filter, setFilter] = useState("all");
  const upd = (f, v) => setForm(p => ({ ...p, [f]: v }));
  const at = ACTIVITY_TYPES.find(t => t.key === form.type);
  const autoPace = calcPace(form.type, parseFloat(form.distance), parseTime(form.time));
  const add = () => { if (!form.distance || !form.date) return; onSave([...logs, { ...form, pace: autoPace, id: Date.now() }]); setForm(empty); };
  const del = id => onSave(logs.filter(l => l.id !== id));
  const filtered = filter === "all" ? logs : logs.filter(l => l.type === filter);
  const colorFor = t => ACTIVITY_TYPES.find(x => x.key === t)?.color || C.green;
  const iconFor = t => ACTIVITY_TYPES.find(x => x.key === t)?.icon || "🏃";
  return (
    <div>
      <div style={{ fontSize: 10, color: C.muted, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 12 }}>Log an Activity</div>
      <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
        {ACTIVITY_TYPES.map(t => (
          <button key={t.key} onClick={() => upd("type", t.key)} style={{ flex: 1, padding: "10px 4px", borderRadius: 10, border: `1px solid ${form.type === t.key ? t.color + "70" : C.border}`, background: form.type === t.key ? t.color + "15" : C.surface, color: form.type === t.key ? t.color : C.muted, fontWeight: 700, fontSize: 13, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
            <span style={{ fontSize: 20 }}>{t.icon}</span><span style={{ fontSize: 11 }}>{t.label}</span>
          </button>
        ))}
      </div>
      <div style={{ background: C.card, borderRadius: 13, padding: 14, border: `1px solid ${C.border}`, marginBottom: 16 }}>
        <div style={{ marginBottom: 10 }}>
          <label style={{ fontSize: 9, color: C.muted, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.2, display: "block", marginBottom: 4 }}>Date</label>
          <input type="date" value={form.date} onChange={e => upd("date", e.target.value)} style={{ padding: "8px 9px", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, background: C.surface, color: C.text, outline: "none", width: "100%", boxSizing: "border-box" }} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
          <div><label style={{ fontSize: 9, color: C.muted, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.2, display: "block", marginBottom: 4 }}>{at.distLabel}</label><input type="text" placeholder="0.0" value={form.distance} onChange={e => upd("distance", e.target.value)} style={{ padding: "8px 9px", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, background: C.surface, color: C.text, outline: "none", width: "100%", boxSizing: "border-box", fontFamily: "monospace" }} /></div>
          <div><label style={{ fontSize: 9, color: C.muted, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.2, display: "block", marginBottom: 4 }}>{at.timeLabel}</label><input type="text" placeholder={form.type === "cycle" ? "1.5" : "25:30"} value={form.time} onChange={e => upd("time", e.target.value)} style={{ padding: "8px 9px", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, background: C.surface, color: C.text, outline: "none", width: "100%", boxSizing: "border-box", fontFamily: "monospace" }} /></div>
        </div>
        {autoPace && <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 11px", background: at.color + "10", borderRadius: 8, border: `1px solid ${at.color}30`, marginBottom: 10 }}><span style={{ fontSize: 11, color: C.muted }}>{at.paceLabel}:</span><span style={{ fontSize: 15, fontWeight: 800, color: at.color, fontFamily: "monospace" }}>{autoPace}</span><span style={{ fontSize: 10, color: C.muted, marginLeft: "auto" }}>auto-calculated</span></div>}
        <div style={{ marginBottom: 12 }}><label style={{ fontSize: 9, color: C.muted, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.2, display: "block", marginBottom: 4 }}>Notes</label><textarea placeholder="Route, conditions, how it felt..." value={form.notes} onChange={e => upd("notes", e.target.value)} rows={2} style={{ width: "100%", padding: "8px 9px", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, background: C.surface, color: C.text, outline: "none", resize: "none", boxSizing: "border-box", fontFamily: "inherit" }} /></div>
        <button onClick={add} style={{ width: "100%", padding: "11px", borderRadius: 10, border: `1px solid ${at.color + "50"}`, background: at.color + "15", color: at.color, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>{at.icon} Log {at.label}</button>
      </div>
      <div style={{ display: "flex", gap: 5, marginBottom: 12 }}>
        {[["all", "All", C.text], ["run", "🏃 Run", C.green], ["cycle", "🚴 Cycle", C.cyan], ["swim", "🏊 Swim", C.purple]].map(([key, label, color]) => (
          <button key={key} onClick={() => setFilter(key)} style={{ padding: "5px 10px", borderRadius: 7, border: `1px solid ${filter === key ? color + "60" : C.border}`, background: filter === key ? color + "12" : "transparent", color: filter === key ? color : C.muted, fontWeight: 600, fontSize: 11, cursor: "pointer" }}>{label}</button>
        ))}
      </div>
      {filtered.length === 0 ? <div style={{ textAlign: "center", padding: "32px 20px", color: C.muted, fontSize: 13 }}>No activities logged yet.</div>
        : filtered.slice().reverse().map(entry => {
          const color = colorFor(entry.type);
          return (
            <div key={entry.id} style={{ background: C.card, borderRadius: 12, padding: "13px 14px", border: `1px solid ${color}20`, marginBottom: 8 }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 9, background: color + "15", border: `1px solid ${color}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{iconFor(entry.type)}</div>
                  <div>
                    <div style={{ fontSize: 9, color: C.muted, marginBottom: 2, letterSpacing: 1 }}>{entry.date}</div>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 5 }}>
                      <span style={{ fontSize: 22, fontWeight: 900, color, fontFamily: "'Barlow Condensed', monospace", lineHeight: 1 }}>{parseFloat(entry.distance).toFixed(1)}</span>
                      <span style={{ fontSize: 11, color: C.muted }}>km</span>
                      {entry.pace && <span style={{ fontSize: 12, color: C.muted, fontFamily: "monospace", marginLeft: 4 }}>· {entry.pace}</span>}
                    </div>
                    {entry.time && <div style={{ fontSize: 11, color: C.muted, marginTop: 1 }}>{entry.time}{entry.type === "cycle" ? "h" : ""}</div>}
                  </div>
                </div>
                <button onClick={() => del(entry.id)} style={{ background: "none", border: "none", color: C.muted, cursor: "pointer", fontSize: 16, padding: "2px 6px" }}>×</button>
              </div>
              {entry.notes && <div style={{ fontSize: 12, color: C.muted, marginTop: 8, lineHeight: 1.5, paddingLeft: 46 }}>{entry.notes}</div>}
            </div>
          );
        })}
    </div>
  );
}

// ─── Claude AI Panel ───────────────────────────────────────────────────────
function ClaudePanel({ open, onClose, appState, onApplyChanges }) {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hi! I can modify your training plan on the fly. Try asking me to:\n\n• Add or swap exercises\n• Change run targets or session notes\n• Adjust sets, reps or notes for any exercise\n• Add a new PR category\n\nWhat would you like to change?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);
  useEffect(() => { if (open) setTimeout(() => inputRef.current?.focus(), 100); }, [open]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setLoading(true);

    const systemPrompt = `You are an AI assistant embedded inside a rugby and running training tracker app. You help the user modify their training plan.

The current app state is:
${JSON.stringify({
  mondayExercises: appState.mondayEx,
  thursdayExercises: appState.thursdayEx,
  weekTemplate: appState.weekTemplate,
}, null, 2)}

When the user asks you to make changes, you MUST respond with a JSON block wrapped in <CHANGES> tags followed by a brief plain-English explanation of what you changed.

The JSON must have this exact structure (only include keys you are changing):
{
  "mondayExercises": [...], // full 4-week array if changing Monday exercises
  "thursdayExercises": [...], // full 4-week array if changing Thursday exercises  
  "weekTemplate": [...] // full 7-day array if changing schedule/targets/notes
}

Rules for exercise objects:
- id: keep existing ids or use new unique strings like "m7a", "t7a" etc
- name: string
- sets: number
- reps: string
- note: string

Rules for weekTemplate objects:
- day: string (Monday-Sunday)
- type: "gym" | "run" | "rugby"
- label: string
- icon: string emoji
- target: string (for run days)
- notes: string (for rugby days)

If the user is just asking a question or chatting (not requesting changes), respond normally WITHOUT a <CHANGES> block.

Always be concise and friendly. You are a knowledgeable sports conditioning coach.`;

    try {
      const response = await fetch("/api/claude", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: systemPrompt,
          messages: [
            ...messages.filter(m => m.role !== "assistant" || messages.indexOf(m) > 0).map(m => ({ role: m.role, content: m.content })),
            { role: "user", content: userMsg }
          ],
        })
      });
      const data = await response.json();
      const raw = data.content?.[0]?.text || "Sorry, I couldn't process that.";

      // Parse changes if present
      const changesMatch = raw.match(/<CHANGES>([\s\S]*?)<\/CHANGES>/);
      let displayText = raw.replace(/<CHANGES>[\s\S]*?<\/CHANGES>/g, "").trim();

      if (changesMatch) {
        try {
          const changes = JSON.parse(changesMatch[1].trim());
          onApplyChanges(changes);
          displayText = (displayText || "Done!") + "\n\n✅ Changes applied to your training plan.";
        } catch (e) {
          displayText = displayText || "I tried to make changes but ran into a formatting issue. Please try again.";
        }
      }

      setMessages(prev => [...prev, { role: "assistant", content: displayText }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: "assistant", content: "Something went wrong. Please try again." }]);
    }
    setLoading(false);
  };

  if (!open) return null;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", flexDirection: "column", background: C.bg }}>
      {/* Panel header */}
      <div style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: C.blue + "20", border: `1px solid ${C.blue}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>✦</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 800, color: C.text, fontFamily: "'Barlow Condensed', sans-serif", textTransform: "uppercase", letterSpacing: 1 }}>AI Coach</div>
            <div style={{ fontSize: 10, color: C.muted }}>Modify your plan on the fly</div>
          </div>
        </div>
        <button onClick={onClose} style={{ background: C.card, border: `1px solid ${C.border}`, color: C.muted, cursor: "pointer", width: 32, height: 32, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>×</button>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 14px", display: "flex", flexDirection: "column", gap: 12 }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
            <div style={{
              maxWidth: "85%", padding: "10px 13px", borderRadius: msg.role === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
              background: msg.role === "user" ? C.blue + "20" : C.card,
              border: `1px solid ${msg.role === "user" ? C.blue + "40" : C.border}`,
              fontSize: 13, color: C.text, lineHeight: 1.6, whiteSpace: "pre-wrap",
            }}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex", justifyContent: "flex-start" }}>
            <div style={{ padding: "10px 14px", borderRadius: "14px 14px 14px 4px", background: C.card, border: `1px solid ${C.border}` }}>
              <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: C.blue, opacity: 0.7, animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite` }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions */}
      <div style={{ padding: "8px 14px 4px", flexShrink: 0, overflowX: "auto" }}>
        <div style={{ display: "flex", gap: 6, width: "max-content" }}>
          {["Add pull-ups to Monday", "Swap Thursday box jumps for sprints", "Increase run target to 25km", "Add a swimming session on Wednesday"].map(s => (
            <button key={s} onClick={() => setInput(s)} style={{ padding: "6px 11px", borderRadius: 20, border: `1px solid ${C.borderHi}`, background: C.card, color: C.muted, fontSize: 11, cursor: "pointer", whiteSpace: "nowrap", fontFamily: "inherit" }}>{s}</button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div style={{ padding: "10px 14px 16px", background: C.surface, borderTop: `1px solid ${C.border}`, flexShrink: 0 }}>
        <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
          <textarea
            ref={inputRef}
            placeholder="Ask me to change anything..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            rows={2}
            style={{ flex: 1, padding: "10px 12px", borderRadius: 10, border: `1px solid ${C.border}`, background: C.card, color: C.text, fontSize: 13, outline: "none", resize: "none", fontFamily: "inherit", lineHeight: 1.5 }}
          />
          <button onClick={send} disabled={loading || !input.trim()}
            style={{ width: 42, height: 42, borderRadius: 10, border: "none", background: input.trim() && !loading ? C.blue : C.dim, color: "#fff", cursor: input.trim() && !loading ? "pointer" : "default", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "background 0.2s" }}>
            ↑
          </button>
        </div>
        <div style={{ fontSize: 10, color: C.muted, marginTop: 6, textAlign: "center" }}>Enter to send · Shift+Enter for new line</div>
      </div>

      <style>{`@keyframes pulse { 0%,100%{opacity:0.3;transform:scale(0.8)} 50%{opacity:1;transform:scale(1)} }`}</style>
    </div>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState("Week");
  const [selDay, setSelDay] = useState(null);
  const [gymLogs, setGymLogs] = useState(() => load("gymLogs", {}));
  const [runLogs, setRunLogs] = useState(() => load("runLogs", {}));
  const [rugbyLogs, setRugbyLogs] = useState(() => load("rugbyLogs", {}));
  const [weekNum, setWeekNum] = useState(() => load("weekNum", 1));
  const [allLogs, setAllLogs] = useState(() => load("allLogs", {}));
  const [activityLogs, setActivityLogs] = useState(() => load("activityLogs", []));
  const [prs, setPrs] = useState(() => load("prs", {}));
  const [aiOpen, setAiOpen] = useState(false);

  // Mutable plan state — Claude AI can modify these
  const [mondayEx, setMondayEx] = useState(() => load("mondayEx", DEFAULT_MONDAY));
  const [thursdayEx, setThursdayEx] = useState(() => load("thursdayEx", DEFAULT_THURSDAY));
  const [weekTemplate, setWeekTemplate] = useState(() => load("weekTemplate", DEFAULT_WEEK_TEMPLATE));

  // Persist to localStorage on every change
  useEffect(() => { save("gymLogs", gymLogs); }, [gymLogs]);
  useEffect(() => { save("runLogs", runLogs); }, [runLogs]);
  useEffect(() => { save("rugbyLogs", rugbyLogs); }, [rugbyLogs]);
  useEffect(() => { save("weekNum", weekNum); }, [weekNum]);
  useEffect(() => { save("allLogs", allLogs); }, [allLogs]);
  useEffect(() => { save("activityLogs", activityLogs); }, [activityLogs]);
  useEffect(() => { save("prs", prs); }, [prs]);
  useEffect(() => { save("mondayEx", mondayEx); }, [mondayEx]);
  useEffect(() => { save("thursdayEx", thursdayEx); }, [thursdayEx]);
  useEffect(() => { save("weekTemplate", weekTemplate); }, [weekTemplate]);

  const wi = (weekNum - 1) % 4;
  const prevLogs = allLogs[weekNum - 1]?.gym || {};
  const getEx = day => day === "Monday" ? mondayEx[wi] : thursdayEx[wi];

  const saveSet = (id, rows) => setGymLogs(p => ({ ...p, [id]: rows }));
  const saveRun = (day, data) => setRunLogs(p => ({ ...p, [day]: data }));
  const saveRugby = (day, data) => setRugbyLogs(p => ({ ...p, [day]: data }));

  const changeWeek = nw => {
    setAllLogs(p => ({ ...p, [weekNum]: { gym: gymLogs, run: runLogs, rugby: rugbyLogs } }));
    setWeekNum(nw);
    const s = allLogs[nw] || {};
    setGymLogs(s.gym || {}); setRunLogs(s.run || {}); setRugbyLogs(s.rugby || {});
    setSelDay(null);
  };

  const isDone = d => {
    if (d.type === "gym") return getEx(d.day).every(ex => gymLogs[ex.id]?.every(s => s.done));
    if (d.type === "run" && d.target) return runLogs[d.day]?.done;
    if (d.type === "rugby") return rugbyLogs[d.day]?.done;
    return false;
  };

  const applyAIChanges = (changes) => {
    if (changes.mondayExercises) setMondayEx(changes.mondayExercises);
    if (changes.thursdayExercises) setThursdayEx(changes.thursdayExercises);
    if (changes.weekTemplate) setWeekTemplate(changes.weekTemplate);
  };

  const completedDays = weekTemplate.filter(isDone).length;
  const dayData = selDay !== null ? weekTemplate[selDay] : null;

  return (
    <div style={{ fontFamily: "'Barlow','Segoe UI',sans-serif", minHeight: "100vh", background: C.bg, color: C.text }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600;700;800;900&family=Barlow+Condensed:wght@600;700;800;900&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        input::placeholder,textarea::placeholder{color:#1e3040!important;}
        ::-webkit-scrollbar{width:3px;}::-webkit-scrollbar-thumb{background:#1a2830;border-radius:3px;}
        input[type=number]::-webkit-inner-spin-button,input[type=number]::-webkit-outer-spin-button{-webkit-appearance:none;}
        input[type=date]::-webkit-calendar-picker-indicator{filter:invert(0.3);}
        body{background:#080c10;}
        .safe-header{padding-top:max(14px, env(safe-area-inset-top)) !important;}
        @supports(padding-top: constant(safe-area-inset-top)){
          .safe-header{padding-top:max(14px, constant(safe-area-inset-top)) !important;}
        }
      `}</style>

      {/* HEADER */}
      <div className="safe-header" style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, paddingLeft: 16, paddingRight: 16, paddingBottom: 0, position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 480, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 11 }}>
            <div>
              <div style={{ fontSize: 22, fontWeight: 900, color: C.text, fontFamily: "'Barlow Condensed',sans-serif", letterSpacing: 1, lineHeight: 1, textTransform: "uppercase" }}>Training Tracker</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {/* AI Coach button */}
              <button onClick={() => setAiOpen(true)}
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 12px", borderRadius: 10, border: `1px solid ${C.blue}50`, background: C.blue + "15", color: C.blue, fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>
                <span style={{ fontSize: 14 }}>✦</span> AI Coach
              </button>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 9, color: C.muted, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 5 }}>Week</div>
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <button onClick={() => changeWeek(Math.max(1, weekNum - 1))} style={{ background: C.card, border: `1px solid ${C.border}`, color: C.muted, cursor: "pointer", width: 26, height: 26, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>‹</button>
                  <span style={{ fontSize: 18, fontWeight: 900, color: C.text, minWidth: 20, textAlign: "center", fontFamily: "'Barlow Condensed',monospace" }}>{weekNum}</span>
                  <button onClick={() => changeWeek(weekNum + 1)} style={{ background: C.card, border: `1px solid ${C.border}`, color: C.muted, cursor: "pointer", width: 26, height: 26, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>›</button>
                </div>
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 4, marginBottom: 9 }}>
            {[0,1,2,3].map(i => <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i === wi ? C.blue : C.dim, transition: "0.3s" }} />)}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 11 }}>
            <span style={{ fontSize: 11, color: C.blue, fontWeight: 600 }}>Cycle {wi+1}/4 · {CYCLE_LABELS[wi]}</span>
            <span style={{ fontSize: 11, color: C.muted }}>{completedDays}/7 done</span>
          </div>
          <div style={{ display: "flex" }}>
            {["Week","Summary","Log"].map(t => (
              <button key={t} onClick={() => { setTab(t); setSelDay(null); }}
                style={{ flex: 1, padding: "9px 4px", background: "none", border: "none", borderBottom: `2px solid ${tab === t ? C.blue : "transparent"}`, color: tab === t ? C.text : C.muted, fontWeight: tab === t ? 700 : 500, fontSize: 13, cursor: "pointer", transition: "all 0.2s", fontFamily: "inherit" }}>
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 480, margin: "0 auto", padding: "14px 14px 100px" }}>

        {tab === "Week" && !dayData && (
          <>
            {wi === 3 && <div style={{ background: "#1a1000", border: `1px solid ${C.orange}30`, borderRadius: 10, padding: "10px 13px", marginBottom: 12, fontSize: 12, color: C.orange, lineHeight: 1.5 }}>⚡ Deload week. Drop weights 15%, nail technique. Arrive fresh.</div>}
            {weekTemplate.map((d, i) => {
              const done = isDone(d); const acc = accentFor(d.type); const hasInj = d.type === "rugby" && rugbyLogs[d.day]?.injuryFlag;
              return (
                <div key={i} onClick={() => setSelDay(i)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", borderRadius: 12, marginBottom: 6, background: C.card, border: `1px solid ${done ? acc+"35" : hasInj ? C.red+"35" : C.border}`, cursor: "pointer" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 38, height: 38, borderRadius: 9, background: done ? acc+"12" : C.surface, border: `1px solid ${done ? acc+"30" : C.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, flexShrink: 0 }}>{d.icon}</div>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        <div style={{ fontWeight: 700, fontSize: 14, color: done ? acc : C.text }}>{d.day}</div>
                        {hasInj && <span style={{ fontSize: 10 }}>🚩</span>}
                      </div>
                      <div style={{ fontSize: 11, color: C.muted }}>{d.label}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 7, flexShrink: 0 }}>
                    {done && <span style={{ fontSize: 12, color: acc }}>✓</span>}
                    <span style={{ fontSize: 9, fontWeight: 700, color: acc, background: acc+"12", padding: "3px 7px", borderRadius: 5, letterSpacing: 1.2, textTransform: "uppercase" }}>{d.type}</span>
                  </div>
                </div>
              );
            })}
            <WeekSummaryBar weekNum={weekNum} gymLogs={gymLogs} runLogs={runLogs} rugbyLogs={rugbyLogs} activityLogs={activityLogs} getEx={getEx} />
          </>
        )}

        {tab === "Week" && dayData && (
          <>
            <button onClick={() => setSelDay(null)} style={{ background: "none", border: "none", color: C.muted, cursor: "pointer", fontSize: 13, fontWeight: 600, marginBottom: 13, padding: 0, display: "flex", alignItems: "center", gap: 4 }}>← Back</button>
            <div style={{ background: lightFor(dayData.type), borderRadius: 13, padding: "14px 16px", marginBottom: 14, border: `1px solid ${accentFor(dayData.type)}18` }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
                  <span style={{ fontSize: 24 }}>{dayData.icon}</span>
                  <div>
                    <div style={{ fontSize: 21, fontWeight: 900, color: C.text, fontFamily: "'Barlow Condensed',sans-serif", letterSpacing: 1, textTransform: "uppercase", lineHeight: 1 }}>{dayData.day}</div>
                    <div style={{ fontSize: 12, color: accentFor(dayData.type), fontWeight: 600, marginTop: 2 }}>{dayData.label}</div>
                  </div>
                </div>
                {dayData.type === "gym" && <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 9, color: C.muted, letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 2 }}>Cycle</div>
                  <div style={{ fontSize: 20, fontWeight: 900, color: C.blue, fontFamily: "'Barlow Condensed',monospace", lineHeight: 1 }}>{wi+1}/4</div>
                  <div style={{ fontSize: 10, color: C.muted, marginTop: 1 }}>{CYCLE_LABELS[wi]}</div>
                </div>}
              </div>
            </div>
            {dayData.type === "gym" && <GymDay exList={getEx(dayData.day)} gymLogs={gymLogs} saveSet={saveSet} prevLogs={prevLogs} />}
            {dayData.type === "run" && dayData.target && <RunDay day={dayData.day} target={dayData.target} saved={runLogs[dayData.day]} onSave={saveRun} />}
            {dayData.type === "rugby" && <RugbyDay dayData={dayData} saved={rugbyLogs[dayData.day]} onSave={saveRugby} />}
          </>
        )}

        {tab === "Summary" && <SummaryTab activityLogs={activityLogs} prs={prs} onSavePrs={setPrs} />}
        {tab === "Log" && <LogTab logs={activityLogs} onSave={setActivityLogs} />}
      </div>

      {/* AI Panel */}
      <ClaudePanel
        open={aiOpen}
        onClose={() => setAiOpen(false)}
        appState={{ mondayEx, thursdayEx, weekTemplate }}
        onApplyChanges={applyAIChanges}
      />
    </div>
  );
}