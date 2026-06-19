import React, { useState, useEffect, useCallback } from "react";

const SUPABASE_URL = "https://ehpwkfhqlxtjzkkaokfx.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVocHdrZmhxbHh0anpra2Fva2Z4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE4MTQ5NjksImV4cCI6MjA5NzM5MDk2OX0.hHxdvNGc0sbdd6CS_oUOgm6o74qK3W1V9HeiaJNGyL4";

const sb = {
  async signIn(email, password) {
    const r = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: SUPABASE_ANON_KEY },
      body: JSON.stringify({ email, password }),
    });
    const d = await r.json();
    if (!r.ok) throw new Error(d.error_description || d.msg || "Login failed");
    return d;
  },
  async signUp(email, password) {
    const r = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: SUPABASE_ANON_KEY },
      body: JSON.stringify({ email, password }),
    });
    const d = await r.json();
    if (!r.ok) throw new Error(d.error_description || d.msg || "Signup failed");
    return d;
  },
  async signOut(token) {
    await fetch(`${SUPABASE_URL}/auth/v1/logout`, {
      method: "POST",
      headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${token}` },
    });
  },
  async from(token, table) {
    const headers = {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
    const base = `${SUPABASE_URL}/rest/v1/${table}`;
    return {
      async select(filter = "") {
        const r = await fetch(`${base}${filter}`, { headers });
        if (!r.ok) { const e = await r.json(); throw new Error(e.message || "Select failed"); }
        return r.json();
      },
      async insert(body) {
        const r = await fetch(base, {
          method: "POST", headers: { ...headers, Prefer: "return=representation" },
          body: JSON.stringify(body),
        });
        if (!r.ok) { const e = await r.json(); throw new Error(e.message || "Insert failed"); }
        return r.json();
      },
      async update(body, filter = "") {
        const r = await fetch(`${base}${filter}`, {
          method: "PATCH", headers: { ...headers, Prefer: "return=representation" },
          body: JSON.stringify(body),
        });
        if (!r.ok) { const e = await r.json(); throw new Error(e.message || "Update failed"); }
        return r.json();
      },
      async delete(filter = "") {
        const r = await fetch(`${base}${filter}`, { method: "DELETE", headers });
        if (!r.ok) { const e = await r.json(); throw new Error(e.message || "Delete failed"); }
        return true;
      },
      async upsert(body) {
        const r = await fetch(base, {
          method: "POST",
          headers: { ...headers, Prefer: "return=representation,resolution=merge-duplicates" },
          body: JSON.stringify(body),
        });
        if (!r.ok) { const e = await r.json(); throw new Error(e.message || "Upsert failed"); }
        return r.json();
      },
    };
  },
};

const T = {
  navy: "#0A0F1E", navyMid: "#111827", navyLight: "#1E2D4A",
  teal: "#00D4C8", tealDim: "#00A89E", tealGlow: "rgba(0,212,200,0.15)",
  white: "#F0F4FF", whiteDim: "#8899BB",
  accent: "#FF6B35", success: "#22C55E", warning: "#F59E0B", danger: "#EF4444",
  glass: "rgba(30,45,74,0.6)", glassBorder: "rgba(0,212,200,0.2)",
};

const SUBJECT_CONFIG = {
  Mathematics: { color: T.teal,    bg: "rgba(0,212,200,0.1)",  border: "rgba(0,212,200,0.25)",  tag: "tag-math",      emoji: "∫"  },
  Physics:     { color: T.accent,  bg: "rgba(255,107,53,0.1)", border: "rgba(255,107,53,0.25)", tag: "tag-physics",   emoji: "⚡" },
  Chemistry:   { color: T.success, bg: "rgba(34,197,94,0.1)",  border: "rgba(34,197,94,0.25)",  tag: "tag-chemistry", emoji: "⚗️" },
};

const DEFAULT_TABS = [
  { id: "schedule",    label: "Schedule",    icon: "schedule"   },
  { id: "materials",   label: "Materials",   icon: "materials"  },
  { id: "grades",      label: "Grades",      icon: "grades"     },
  { id: "tests",       label: "Tests",       icon: "tests"      },
  { id: "videos",      label: "Videos",      icon: "video"      },
  { id: "evaluations", label: "Evaluations", icon: "eval"       },
];

const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600&display=swap');
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    body{background:#0A0F1E;color:#F0F4FF;font-family:'Inter',sans-serif;min-height:100vh;overflow-x:hidden}
    ::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:#111827}::-webkit-scrollbar-thumb{background:#00A89E;border-radius:3px}
    .display{font-family:'Space Grotesk',sans-serif}
    .glass{background:rgba(30,45,74,0.6);backdrop-filter:blur(12px);border:1px solid rgba(0,212,200,0.2);border-radius:16px}
    .btn-primary{background:linear-gradient(135deg,#00D4C8,#00A89E);color:#0A0F1E;border:none;border-radius:10px;padding:11px 22px;font-family:'Space Grotesk',sans-serif;font-weight:600;font-size:14px;cursor:pointer;transition:all .2s;display:inline-flex;align-items:center;gap:7px}
    .btn-primary:hover{transform:translateY(-1px);box-shadow:0 8px 24px rgba(0,212,200,0.3)}
    .btn-primary:disabled{opacity:.5;cursor:not-allowed;transform:none}
    .btn-ghost{background:transparent;color:#00D4C8;border:1px solid rgba(0,212,200,0.2);border-radius:10px;padding:10px 22px;font-family:'Space Grotesk',sans-serif;font-weight:500;font-size:14px;cursor:pointer;transition:all .2s;display:inline-flex;align-items:center;gap:7px}
    .btn-ghost:hover{background:rgba(0,212,200,0.15);border-color:#00D4C8}
    .btn-danger{background:rgba(239,68,68,.12);color:#EF4444;border:1px solid rgba(239,68,68,.3);border-radius:8px;padding:7px 13px;font-family:'Space Grotesk',sans-serif;font-weight:500;font-size:13px;cursor:pointer;transition:all .2s;display:inline-flex;align-items:center;gap:6px}
    .btn-danger:hover{background:rgba(239,68,68,.22)}
    .btn-success{background:rgba(34,197,94,.12);color:#22C55E;border:1px solid rgba(34,197,94,.3);border-radius:8px;padding:7px 13px;font-family:'Space Grotesk',sans-serif;font-weight:500;font-size:13px;cursor:pointer;transition:all .2s;display:inline-flex;align-items:center;gap:6px}
    input,textarea,select{background:rgba(255,255,255,.05);border:1px solid rgba(0,212,200,0.2);border-radius:10px;color:#F0F4FF;font-family:'Inter',sans-serif;font-size:14px;padding:11px 15px;width:100%;outline:none;transition:border-color .2s}
    input:focus,textarea:focus,select:focus{border-color:#00D4C8;box-shadow:0 0 0 3px rgba(0,212,200,0.15)}
    input::placeholder,textarea::placeholder{color:#8899BB}
    select option{background:#111827}
    label{display:block;font-size:11px;font-weight:600;color:#8899BB;margin-bottom:5px;letter-spacing:.6px;text-transform:uppercase}
    .tag{display:inline-flex;align-items:center;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:600;letter-spacing:.4px}
    .tag-math{background:rgba(0,212,200,.15);color:#00D4C8;border:1px solid rgba(0,212,200,.3)}
    .tag-phys{background:rgba(255,107,53,.15);color:#FF6B35;border:1px solid rgba(255,107,53,.3)}
    .tag-chem{background:rgba(34,197,94,.15);color:#22C55E;border:1px solid rgba(34,197,94,.3)}
    .badge{padding:2px 8px;border-radius:20px;font-size:11px;font-weight:600}
    .badge-teal{background:rgba(0,212,200,0.15);color:#00D4C8}
    .badge-green{background:rgba(34,197,94,.15);color:#22C55E}
    .badge-orange{background:rgba(255,107,53,.15);color:#FF6B35}
    .badge-red{background:rgba(239,68,68,.15);color:#EF4444}
    .badge-gray{background:rgba(136,153,187,.12);color:#8899BB}
    .sidebar-link{display:flex;align-items:center;gap:11px;padding:10px 14px;border-radius:10px;color:#8899BB;cursor:pointer;transition:all .2s;font-size:13.5px;font-weight:500;border:1px solid transparent}
    .sidebar-link:hover{background:rgba(0,212,200,0.15);color:#F0F4FF}
    .sidebar-link.active{background:rgba(0,212,200,0.15);color:#00D4C8;border-color:rgba(0,212,200,0.2)}
    .stat-card{background:rgba(30,45,74,0.6);backdrop-filter:blur(12px);border:1px solid rgba(0,212,200,0.2);border-radius:16px;padding:22px;transition:all .2s}
    .stat-card:hover{border-color:#00D4C8;transform:translateY(-2px)}
    .modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.75);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;z-index:1000;padding:20px}
    .modal{background:#111827;border:1px solid rgba(0,212,200,0.2);border-radius:20px;padding:30px;width:100%;max-width:500px;max-height:90vh;overflow-y:auto;animation:floatUp .3s ease forwards}
    .modal-lg{max-width:680px}
    .progress-bar{height:6px;background:rgba(255,255,255,.08);border-radius:3px;overflow:hidden}
    .progress-fill{height:100%;border-radius:3px;background:linear-gradient(90deg,#00D4C8,#00A89E);transition:width .6s ease}
    .grid-2{display:grid;grid-template-columns:repeat(2,1fr);gap:14px}
    .grid-3{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
    .grid-4{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}
    .toast{position:fixed;bottom:24px;right:24px;padding:13px 18px;border-radius:12px;font-size:14px;font-weight:500;z-index:9999;animation:floatUp .3s ease forwards;display:flex;align-items:center;gap:9px;min-width:260px;max-width:360px}
    .toast-success{background:rgba(34,197,94,.12);border:1px solid rgba(34,197,94,.4);color:#22C55E}
    .toast-error{background:rgba(239,68,68,.12);border:1px solid rgba(239,68,68,.4);color:#EF4444}
    .toast-info{background:rgba(0,212,200,0.15);border:1px solid rgba(0,212,200,0.2);color:#00D4C8}
    .spinner{width:16px;height:16px;border:2px solid rgba(255,255,255,.15);border-top-color:#00D4C8;border-radius:50%;animation:spin .7s linear infinite;display:inline-block;flex-shrink:0}
    @keyframes spin{to{transform:rotate(360deg)}}
    @keyframes floatUp{from{opacity:0;transform:translateY(20px) scale(.97)}to{opacity:1;transform:translateY(0) scale(1)}}
    @keyframes fadeIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
    @keyframes glow{0%,100%{box-shadow:0 0 20px rgba(0,212,200,.2)}50%{box-shadow:0 0 40px rgba(0,212,200,.4)}}
    .animate-in{animation:fadeIn .35s ease forwards}
    .float-up{animation:floatUp .4s cubic-bezier(.16,1,.3,1) forwards}
    @media(max-width:768px){.grid-2,.grid-3,.grid-4{grid-template-columns:1fr}}
    .col{display:flex;flex-direction:column;gap:14px}
    .input-group{display:flex;flex-direction:column;gap:5px}
    .empty-state{padding:52px 24px;text-align:center;color:#8899BB}
    .empty-state h3{font-size:16px;font-weight:600;color:#F0F4FF;margin-bottom:6px;font-family:'Space Grotesk',sans-serif}
    .empty-state p{font-size:13px;line-height:1.6;max-width:320px;margin:0 auto 20px}
    table{width:100%;border-collapse:collapse}
    th{padding:13px 18px;text-align:left;font-size:11px;font-weight:600;color:#8899BB;letter-spacing:.5px;text-transform:uppercase;border-bottom:1px solid rgba(0,212,200,0.2)}
    td{padding:13px 18px;font-size:14px;border-bottom:1px solid rgba(0,212,200,.06)}
    tr:last-child td{border-bottom:none}
    tr:hover td{background:rgba(255,255,255,.02)}
    .tab-btn{padding:10px 18px;border-radius:8px 8px 0 0;cursor:pointer;font-size:13px;font-weight:500;border:1px solid transparent;border-bottom:none;white-space:nowrap;display:inline-flex;align-items:center;gap:6px;transition:all .2s;background:transparent;color:#8899BB}
    .chip-filter{padding:7px 15px;border-radius:8px;cursor:pointer;font-size:13px;font-weight:500;transition:all .2s;border:1px solid rgba(0,212,200,0.2);background:transparent;color:#8899BB}
    .chip-filter.active{border-color:#00D4C8;background:rgba(0,212,200,0.15);color:#00D4C8}
    .section-header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:26px}
    .section-title{font-size:25px;font-weight:700;margin-bottom:3px;font-family:'Space Grotesk',sans-serif}
    .section-sub{color:#8899BB;font-size:13.5px}
  `}</style>
);
const useToast = () => {
  const [toast, setToast] = useState(null);
  const show = useCallback((msg, type = "info") => {
    setToast({ msg, type, id: Date.now() });
    setTimeout(() => setToast(null), 3800);
  }, []);
  return { toast, show };
};
const Toast = ({ toast }) => {
  if (!toast) return null;
  const icons = { success: "✓", error: "✕", info: "ℹ" };
  return <div className={`toast toast-${toast.type}`}><span>{icons[toast.type]}</span>{toast.msg}</div>;
};

const Icon = ({ name, size = 17 }) => {
  const icons = {
    logo:      <polygon points="12,2 22,8 22,16 12,22 2,16 2,8" stroke="currentColor" strokeWidth="2" fill="none"/>,
    dashboard: <><rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5"/></>,
    students:  <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="1.5"/><circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.5"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="1.5"/></>,
    tests:     <><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" stroke="currentColor" strokeWidth="1.5"/><rect x="9" y="3" width="6" height="4" rx="1" stroke="currentColor" strokeWidth="1.5"/><path d="m9 12 2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></>,
    materials: <><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="currentColor" strokeWidth="1.5"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke="currentColor" strokeWidth="1.5"/></>,
    analytics: <><line x1="18" y1="20" x2="18" y2="10" stroke="currentColor" strokeWidth="1.5"/><line x1="12" y1="20" x2="12" y2="4" stroke="currentColor" strokeWidth="1.5"/><line x1="6" y1="20" x2="6" y2="14" stroke="currentColor" strokeWidth="1.5"/></>,
    announce:  <><path d="M22 8.5a6.5 6.5 0 0 1-6.5 6.5c-1.61 0-3.09-.59-4.22-1.56L3 18V6l8.28 4.56A6.47 6.47 0 0 1 15.5 9" stroke="currentColor" strokeWidth="1.5"/><circle cx="15.5" cy="5.5" r="4.5" stroke="currentColor" strokeWidth="1.5"/></>,
    schedule:  <><rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5"/><line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="1.5"/><line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="1.5"/><line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="1.5"/></>,
    grades:    <><circle cx="12" cy="8" r="6" stroke="currentColor" strokeWidth="1.5"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" stroke="currentColor" strokeWidth="1.5"/></>,
    video:     <><polygon points="23 7 16 12 23 17 23 7" stroke="currentColor" strokeWidth="1.5"/><rect x="1" y="5" width="15" height="14" rx="2" stroke="currentColor" strokeWidth="1.5"/></>,
    eval:      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="1.5"/>,
    quote:     <><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z" stroke="currentColor" strokeWidth="1.5"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z" stroke="currentColor" strokeWidth="1.5"/></>,
    settings:  <><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" stroke="currentColor" strokeWidth="1.5"/></>,
    logout:    <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="currentColor" strokeWidth="1.5"/><polyline points="16 17 21 12 16 7" stroke="currentColor" strokeWidth="1.5"/><line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" strokeWidth="1.5"/></>,
    plus:      <><line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" strokeWidth="2"/><line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" strokeWidth="2"/></>,
    close:     <><line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2"/><line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2"/></>,
    eye:       <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="1.5"/><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5"/></>,
    trash:     <><polyline points="3 6 5 6 21 6" stroke="currentColor" strokeWidth="1.5"/><path d="M19 6l-1 14H6L5 6" stroke="currentColor" strokeWidth="1.5"/><path d="M10 11v6M14 11v6M9 6V4h6v2" stroke="currentColor" strokeWidth="1.5"/></>,
    edit:      <><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="1.5"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="1.5"/></>,
    folder:    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="1.5"/>,
    upload:    <><polyline points="16 16 12 12 8 16" stroke="currentColor" strokeWidth="1.5"/><line x1="12" y1="12" x2="12" y2="21" stroke="currentColor" strokeWidth="1.5"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" stroke="currentColor" strokeWidth="1.5"/></>,
    bank:      <><line x1="3" y1="22" x2="21" y2="22" stroke="currentColor" strokeWidth="1.5"/><line x1="6" y1="18" x2="6" y2="11" stroke="currentColor" strokeWidth="1.5"/><line x1="10" y1="18" x2="10" y2="11" stroke="currentColor" strokeWidth="1.5"/><line x1="14" y1="18" x2="14" y2="11" stroke="currentColor" strokeWidth="1.5"/><line x1="18" y1="18" x2="18" y2="11" stroke="currentColor" strokeWidth="1.5"/><polygon points="12 2 20 7 4 7 12 2" stroke="currentColor" strokeWidth="1.5"/></>,
    shield:    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="1.5"/>,
    teams:     <><rect x="2" y="7" width="13" height="10" rx="2" stroke="currentColor" strokeWidth="1.5"/><path d="M15 10l4-2v8l-4-2" stroke="currentColor" strokeWidth="1.5"/></>,
    check:     <polyline points="20 6 9 17 4 12" stroke="currentColor" strokeWidth="2"/>,
    mail:      <><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" strokeWidth="1.5"/><polyline points="22,6 12,13 2,6" stroke="currentColor" strokeWidth="1.5"/></>,
    info:      <><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/><line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" strokeWidth="1.5"/><line x1="12" y1="16" x2="12.01" y2="16" stroke="currentColor" strokeWidth="2"/></>,
    refresh:   <><polyline points="23 4 23 10 17 10" stroke="currentColor" strokeWidth="1.5"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" stroke="currentColor" strokeWidth="1.5"/></>,
  };
  return (
    <span style={{ display:"inline-flex", alignItems:"center", justifyContent:"center" }}>
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">{icons[name]}</svg>
    </span>
  );
};

const Avatar = ({ name, size = 36, color = T.teal }) => (
  <div style={{ width:size, height:size, borderRadius:"50%", background:`linear-gradient(135deg,${color},${color}99)`, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, fontSize:size*0.38, color:T.navy, flexShrink:0 }}>
    {(name||"?").charAt(0).toUpperCase()}
  </div>
);

const subjectTag = (s) => {
  if (!s) return "";
  const m = { Mathematics:"math", Physics:"phys", Chemistry:"chem" };
  return `tag-${m[s]||"math"}`;
};

const useDB = (token, table, filter = "", deps = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const reload = useCallback(async () => {
    if (!token || !table) return;
    setLoading(true); setError(null);
    try {
      const t = await sb.from(token, table);
      const result = await t.select(filter);
      setData(result);
    } catch(e) { setError(e.message); setData([]); }
    finally { setLoading(false); }
  }, [token, table, filter, ...deps]);
  useEffect(() => { reload(); }, [reload]);
  return { data, loading, error, reload };
};
const LandingPage = ({ onSelect }) => {
  const [hov, setHov] = useState(null);
  return (
    <div style={{ minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:24, position:"relative", overflow:"hidden" }}>
      <div style={{ position:"absolute", inset:0, backgroundImage:`linear-gradient(rgba(0,212,200,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,212,200,.03) 1px,transparent 1px)`, backgroundSize:"40px 40px", pointerEvents:"none" }}/>
      <div style={{ position:"absolute", top:"20%", left:"15%", width:400, height:400, background:"radial-gradient(circle,rgba(0,212,200,.07) 0%,transparent 70%)", pointerEvents:"none" }}/>
      <div style={{ position:"absolute", bottom:"20%", right:"15%", width:300, height:300, background:"radial-gradient(circle,rgba(255,107,53,.05) 0%,transparent 70%)", pointerEvents:"none" }}/>
      <div style={{ textAlign:"center", maxWidth:580, position:"relative", zIndex:1 }} className="animate-in">
        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:14, marginBottom:28 }}>
          <div style={{ color:T.teal, animation:"glow 3s ease infinite" }}><Icon name="logo" size={50}/></div>
          <div>
            <div className="display" style={{ fontSize:50, fontWeight:700, letterSpacing:"-1.5px", lineHeight:1 }}>Prove<span style={{ color:T.teal }}>It!</span></div>
            <div style={{ fontSize:11, color:T.whiteDim, letterSpacing:"3px", textTransform:"uppercase", marginTop:3 }}>Academic Excellence Platform</div>
          </div>
        </div>
        <p style={{ color:T.whiteDim, fontSize:16, lineHeight:1.7, marginBottom:44, maxWidth:380, margin:"0 auto 44px" }}>
          Grade 12 tutoring for <span style={{ color:T.teal }}>Mathematics</span>, <span style={{ color:T.accent }}>Physics</span> &amp; <span style={{ color:T.success }}>Chemistry</span>
        </p>
        <div style={{ display:"flex", gap:16, justifyContent:"center", flexWrap:"wrap" }}>
          {[
            { role:"student", label:"I'm a Student", sub:"Access subjects, tests & materials", icon:"students" },
            { role:"tutor",   label:"I'm a Tutor",   sub:"Manage your platform & students",  icon:"shield"   },
          ].map(({ role, label, sub, icon }) => (
            <div key={role} className="glass" onClick={() => onSelect(role)}
              onMouseEnter={() => setHov(role)} onMouseLeave={() => setHov(null)}
              style={{ width:220, padding:"28px 22px", cursor:"pointer", transition:"all .25s",
                transform:hov===role?"translateY(-4px)":"none",
                borderColor:hov===role?T.teal:T.glassBorder,
                boxShadow:hov===role?"0 20px 40px rgba(0,212,200,.15)":"none" }}>
              <div style={{ color:hov===role?T.teal:T.whiteDim, marginBottom:12, transition:"color .2s" }}><Icon name={icon} size={32}/></div>
              <div className="display" style={{ fontSize:18, fontWeight:600, marginBottom:6 }}>{label}</div>
              <div style={{ fontSize:12, color:T.whiteDim, lineHeight:1.5 }}>{sub}</div>
            </div>
          ))}
        </div>
        <div style={{ display:"flex", gap:8, justifyContent:"center", marginTop:44, flexWrap:"wrap" }}>
          <span className="tag tag-math">Mathematics</span>
          <span className="tag tag-phys">Physics</span>
          <span className="tag tag-chem">Chemistry</span>
        </div>
      </div>
    </div>
  );
};

const LoginForm = ({ role, onLogin, onBack, showToast }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [forgotMode, setForgotMode] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const handleLogin = async () => {
    setError("");
    if (!email || !password) { setError("Please fill in all fields."); return; }
    setLoading(true);
    try {
      const data = await sb.signIn(email.trim(), password);
      const token = data.access_token;
      let profiles = [];
      try {
        const t = await sb.from(token, "profiles");
        profiles = await t.select(`?email=eq.${encodeURIComponent(email.trim())}`);
      } catch(e) { /* table not yet created — proceed as first-time tutor */ }
      const profile = profiles?.[0];
      if (!profile) {
        const newProfile = { email: email.trim(), role, name: email.split("@")[0], subjects: role==="tutor"?["Mathematics","Physics","Chemistry"]:[] };
        try {
          const t = await sb.from(token, "profiles");
          await t.upsert(newProfile);
        } catch(e) { /* table not ready yet */ }
        onLogin({ ...newProfile, token, uid: data.user?.id });
      } else {
        if (profile.role !== role) { setError(`This account is a ${profile.role}, not a ${role}.`); await sb.signOut(token); setLoading(false); return; }
        onLogin({ ...profile, token, uid: data.user?.id });
      }
    } catch(e) { setError(e.message || "Login failed. Check your credentials."); }
    setLoading(false);
  };

  const handleForgot = async () => {
    if (!email) { setError("Enter your email first."); return; }
    setLoading(true);
    try {
      await fetch(`${SUPABASE_URL}/auth/v1/recover`, {
        method:"POST", headers:{ "Content-Type":"application/json", apikey:SUPABASE_ANON_KEY },
        body: JSON.stringify({ email: email.trim() }),
      });
      setResetSent(true);
    } catch(e) { setError("Could not send reset email."); }
    setLoading(false);
  };

  return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", padding:24, position:"relative" }}>
      <div style={{ position:"absolute", inset:0, backgroundImage:`linear-gradient(rgba(0,212,200,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,212,200,.03) 1px,transparent 1px)`, backgroundSize:"40px 40px" }}/>
      <div className="glass float-up" style={{ width:"100%", maxWidth:420, padding:38, position:"relative", zIndex:1 }}>
        <button onClick={onBack} className="btn-ghost" style={{ padding:"5px 13px", fontSize:12, marginBottom:26 }}>← Back</button>
        <div style={{ display:"flex", alignItems:"center", gap:11, marginBottom:6 }}>
          <Icon name="logo" size={26}/><span className="display" style={{ fontSize:22, fontWeight:700 }}>Prove<span style={{ color:T.teal }}>It!</span></span>
        </div>
        <h2 className="display" style={{ fontSize:19, fontWeight:600, marginBottom:3 }}>{role==="tutor"?"Tutor Portal":"Student Portal"}</h2>
        <p style={{ color:T.whiteDim, fontSize:13, marginBottom:28 }}>Sign in to continue</p>
        {resetSent ? (
          <div style={{ textAlign:"center", padding:"20px 0" }}>
            <Icon name="mail" size={40}/>
            <p style={{ marginTop:14, color:T.whiteDim, fontSize:14 }}>Reset link sent to <strong style={{ color:T.white }}>{email}</strong>. Check your inbox.</p>
            <button className="btn-ghost" style={{ marginTop:20 }} onClick={() => { setResetSent(false); setForgotMode(false); }}>Back to Login</button>
          </div>
        ) : (
          <div className="col">
            <div className="input-group"><label>Email Address</label><input type="email" placeholder="your@email.com" value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==="Enter"&&!forgotMode&&handleLogin()} autoFocus/></div>
            {!forgotMode && <div className="input-group"><label>Password</label><input type="password" placeholder="••••••••" value={password} onChange={e=>setPassword(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleLogin()}/></div>}
            {error && <div style={{ background:"rgba(239,68,68,.1)", border:"1px solid rgba(239,68,68,.3)", borderRadius:8, padding:"10px 14px", fontSize:13, color:T.danger }}>{error}</div>}
            {forgotMode ? (
              <div style={{ display:"flex", gap:10 }}>
                <button className="btn-ghost" style={{ flex:1 }} onClick={()=>setForgotMode(false)}>Cancel</button>
                <button className="btn-primary" style={{ flex:1, justifyContent:"center" }} onClick={handleForgot} disabled={loading}>{loading?<span className="spinner"/>:"Send Reset Link"}</button>
              </div>
            ) : (
              <>
                <button className="btn-primary" style={{ padding:14, justifyContent:"center" }} onClick={handleLogin} disabled={loading}>{loading?<span className="spinner"/>:"Sign In"}</button>
                <button onClick={()=>setForgotMode(true)} style={{ background:"none", border:"none", color:T.whiteDim, fontSize:13, cursor:"pointer", textDecoration:"underline" }}>Forgot password?</button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const QuoteSplash = ({ quote, onDismiss }) => (
  <div onClick={onDismiss} style={{ position:"fixed", inset:0, zIndex:2000, background:quote.bg||T.navy, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:48, cursor:"pointer" }} className="float-up">
    <div style={{ maxWidth:660, textAlign:"center" }}>
      <div style={{ color:quote.textColor||T.teal, marginBottom:28, opacity:.5 }}><Icon name="quote" size={48}/></div>
      <blockquote style={{ fontSize:"clamp(22px,4vw,38px)", fontFamily:"'Space Grotesk',sans-serif", fontWeight:600, lineHeight:1.35, color:quote.textColor||T.white, marginBottom:20, letterSpacing:"-0.5px" }}>"{quote.text}"</blockquote>
      {quote.author && <p style={{ color:quote.textColor?`${quote.textColor}99`:T.whiteDim, fontSize:16, fontStyle:"italic" }}>— {quote.author}</p>}
      <p style={{ color:quote.textColor?`${quote.textColor}50`:T.whiteDim, fontSize:11, marginTop:48, letterSpacing:"2.5px", textTransform:"uppercase" }}>Tap anywhere to continue</p>
    </div>
  </div>
);
const TutorSidebar = ({ active, onNav, onLogout, onPreview, user }) => {
  const nav = [
    { id:"dashboard",     label:"Dashboard",          icon:"dashboard"  },
    { id:"students",      label:"Students",           icon:"students"   },
    { id:"tests",         label:"Tests & Assignments",icon:"tests"      },
    { id:"materials",     label:"Materials",          icon:"materials"  },
    { id:"analytics",     label:"Analytics",          icon:"analytics"  },
    { id:"announcements", label:"Announcements",      icon:"announce"   },
    { id:"schedule",      label:"Schedule",           icon:"schedule"   },
    { id:"videos",        label:"Video Library",      icon:"video"      },
    { id:"evaluations",   label:"Evaluations",        icon:"eval"       },
    { id:"quotes",        label:"Motivational Quotes",icon:"quote"      },
    { id:"questionbank",  label:"Question Bank",      icon:"bank"       },
    { id:"settings",      label:"Settings",           icon:"settings"   },
  ];
  return (
    <div style={{ width:238, background:T.navyMid, borderRight:`1px solid ${T.glassBorder}`, display:"flex", flexDirection:"column", height:"100vh", position:"sticky", top:0, flexShrink:0 }}>
      <div style={{ padding:"22px 18px 18px", borderBottom:`1px solid ${T.glassBorder}` }}>
        <div style={{ display:"flex", alignItems:"center", gap:9 }}><Icon name="logo" size={22}/><span className="display" style={{ fontSize:19, fontWeight:700 }}>Prove<span style={{ color:T.teal }}>It!</span></span></div>
        <div style={{ fontSize:10, color:T.whiteDim, letterSpacing:"2px", textTransform:"uppercase", marginTop:3, marginLeft:31 }}>Tutor Portal</div>
      </div>
      <nav style={{ flex:1, overflowY:"auto", padding:"10px" }}>
        {nav.map(item => (
          <div key={item.id} className={`sidebar-link ${active===item.id?"active":""}`} onClick={()=>onNav(item.id)}>
            <Icon name={item.icon} size={15}/><span>{item.label}</span>
          </div>
        ))}
      </nav>
      <div style={{ padding:"10px", borderTop:`1px solid ${T.glassBorder}` }}>
        <div style={{ padding:"8px 14px", marginBottom:4, display:"flex", alignItems:"center", gap:10 }}>
          <Avatar name={user?.name} size={28}/>
          <div style={{ fontSize:12, lineHeight:1.3, overflow:"hidden" }}>
            <div style={{ fontWeight:600, color:T.white, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{user?.name}</div>
            <div style={{ color:T.whiteDim, fontSize:11, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{user?.email}</div>
          </div>
        </div>
        <div className="sidebar-link" onClick={onPreview} style={{ color:T.accent }}><Icon name="eye" size={15}/><span>Student Preview</span></div>
        <div className="sidebar-link" onClick={onLogout}><Icon name="logout" size={15}/><span>Sign Out</span></div>
      </div>
    </div>
  );
};

const TutorDashboard = ({ token, onNav }) => {
  const { data:students } = useDB(token,"profiles","?role=eq.student");
  const { data:tests }    = useDB(token,"tests","?order=created_at.desc&limit=5");
  const { data:announce } = useDB(token,"announcements","?order=created_at.desc&limit=4");
  const stats = [
    { label:"Total Students", value:students?.length??"—", icon:"students", color:T.teal    },
    { label:"Active Tests",   value:tests?.filter(t=>t.status==="active").length??"—", icon:"tests", color:T.accent },
    { label:"Announcements",  value:announce?.length??"—", icon:"announce", color:T.success },
    { label:"Subjects",       value:"3", icon:"materials", color:T.warning },
  ];
  return (
    <div className="animate-in">
      <h1 className="display section-title">Welcome back 👋</h1>
      <p className="section-sub" style={{ marginBottom:28 }}>Here's your platform at a glance.</p>
      <div className="grid-4" style={{ marginBottom:28 }}>
        {stats.map(s=>(
          <div key={s.label} className="stat-card">
            <div style={{ color:s.color, marginBottom:14 }}><Icon name={s.icon} size={20}/></div>
            <div className="display" style={{ fontSize:30, fontWeight:700, color:s.color, marginBottom:2 }}>{s.value}</div>
            <div style={{ fontSize:13, color:T.whiteDim }}>{s.label}</div>
          </div>
        ))}
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1.4fr 1fr", gap:18 }}>
        <div className="glass" style={{ padding:22 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
            <h3 className="display" style={{ fontSize:15, fontWeight:600 }}>Recent Tests</h3>
            <button className="btn-ghost" style={{ padding:"5px 12px", fontSize:12 }} onClick={()=>onNav("tests")}>View all</button>
          </div>
          {!tests?<div style={{ color:T.whiteDim,fontSize:13 }}>Loading...</div>:
           tests.length===0?<div className="empty-state"><p>No tests yet</p><button className="btn-primary" style={{ fontSize:13 }} onClick={()=>onNav("tests")}>Create Test</button></div>:
           tests.map(t=>(
            <div key={t.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"11px 14px", marginBottom:8, background:"rgba(255,255,255,.03)", borderRadius:10, border:`1px solid ${T.glassBorder}` }}>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13, fontWeight:500, marginBottom:3 }}>{t.title}</div>
                <span className={subjectTag(t.subject)+" tag"}>{t.subject}</span>
              </div>
              <span className={`badge ${t.status==="active"?"badge-green":t.status==="draft"?"badge-teal":"badge-gray"}`}>{t.status}</span>
            </div>
          ))}
        </div>
        <div className="glass" style={{ padding:22 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
            <h3 className="display" style={{ fontSize:15, fontWeight:600 }}>Announcements</h3>
            <button className="btn-ghost" style={{ padding:"5px 12px", fontSize:12 }} onClick={()=>onNav("announcements")}>Post new</button>
          </div>
          {!announce?<div style={{ color:T.whiteDim,fontSize:13 }}>Loading...</div>:
           announce.length===0?<div className="empty-state"><p>No announcements</p></div>:
           announce.map(a=>(
            <div key={a.id} style={{ padding:"11px 14px", marginBottom:8, background:"rgba(255,255,255,.03)", borderRadius:10, border:`1px solid ${T.glassBorder}` }}>
              <div style={{ fontSize:13, fontWeight:500 }}>{a.title}</div>
              <div style={{ fontSize:11, color:T.whiteDim, marginTop:3 }}>{a.created_at?.split("T")[0]}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const StudentManagement = ({ token, showToast }) => {
  const { data:students, loading, reload } = useDB(token,"profiles","?role=eq.student&order=name");
  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [form, setForm] = useState({ name:"", email:"", password:"", subjects:[] });
  const [saving, setSaving] = useState(false);
  const filtered = (students||[]).filter(s=>{
    const q=search.toLowerCase();
    return (!q||s.name?.toLowerCase().includes(q)||s.email?.toLowerCase().includes(q))&&(filter==="all"||(s.subjects||[]).includes(filter));
  });
  const handleAdd = async () => {
    if(!form.name||!form.email||!form.password||form.subjects.length===0){showToast("All fields required","error");return;}
    setSaving(true);
    try {
      await sb.signUp(form.email.trim(),form.password);
      const t = await sb.from(token,"profiles");
      await t.upsert({ email:form.email.trim(), name:form.name, role:"student", subjects:form.subjects });
      showToast(`${form.name} added`,"success");
      setForm({name:"",email:"",password:"",subjects:[]});setShowAdd(false);reload();
    } catch(e){showToast(e.message,"error");}
    setSaving(false);
  };
  const handleRemove = async (email,name) => {
    try {
      const t=await sb.from(token,"profiles");
      await t.update({role:"removed"},`?email=eq.${encodeURIComponent(email)}`);
      showToast(`${name} removed`,"info");reload();
    } catch(e){showToast(e.message,"error");}
  };
  const tog=s=>setForm(p=>({...p,subjects:p.subjects.includes(s)?p.subjects.filter(x=>x!==s):[...p.subjects,s]}));
  return (
    <div className="animate-in">
      <div className="section-header">
        <div><h1 className="display section-title">Students</h1><p className="section-sub">{students?.length??"—"} enrolled</p></div>
        <button className="btn-primary" onClick={()=>setShowAdd(true)}><Icon name="plus" size={14}/>Add Student</button>
      </div>
      <div style={{ display:"flex", gap:10, marginBottom:18, flexWrap:"wrap" }}>
        <input placeholder="Search name or email..." value={search} onChange={e=>setSearch(e.target.value)} style={{ maxWidth:280 }}/>
        {["all","Mathematics","Physics","Chemistry"].map(f=>(
          <button key={f} className={`chip-filter ${filter===f?"active":""}`} onClick={()=>setFilter(f)}>{f==="all"?"All":f}</button>
        ))}
      </div>
      <div className="glass" style={{ overflow:"hidden" }}>
        {loading?<div style={{ padding:40,textAlign:"center",color:T.whiteDim }}><span className="spinner"/> Loading students...</div>:
         filtered.length===0?<div className="empty-state"><h3>No students found</h3><p>Add your first student using the button above</p></div>:(
          <table>
            <thead><tr><th>Student</th><th>Email</th><th>Subjects</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.map(s=>(
                <tr key={s.email}>
                  <td><div style={{ display:"flex", alignItems:"center", gap:10 }}><Avatar name={s.name} size={34}/><span style={{ fontWeight:500 }}>{s.name}</span></div></td>
                  <td style={{ color:T.whiteDim }}>{s.email}</td>
                  <td><div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>{(s.subjects||[]).map(sub=><span key={sub} className={`tag ${subjectTag(sub)}`}>{sub}</span>)}</div></td>
                  <td>
                    <div style={{ display:"flex", gap:7 }}>
                      <button className="btn-ghost" style={{ padding:"6px 11px",fontSize:12 }}><Icon name="edit" size={13}/></button>
                      <button className="btn-danger" style={{ padding:"6px 11px" }} onClick={()=>handleRemove(s.email,s.name)}><Icon name="trash" size={13}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {showAdd&&(
        <div className="modal-overlay" onClick={()=>setShowAdd(false)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:22 }}>
              <h2 className="display" style={{ fontSize:19, fontWeight:600 }}>Add Student</h2>
              <button onClick={()=>setShowAdd(false)} style={{ background:"none",border:"none",color:T.whiteDim,cursor:"pointer" }}><Icon name="close" size={20}/></button>
            </div>
            <div className="col">
              <div className="input-group"><label>Full Name</label><input placeholder="Student's full name" value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))}/></div>
              <div className="input-group"><label>Email Address</label><input type="email" placeholder="student@email.com" value={form.email} onChange={e=>setForm(p=>({...p,email:e.target.value}))}/></div>
              <div className="input-group">
                <label>Temporary Password</label>
                <input type="password" placeholder="Set a temporary password" value={form.password} onChange={e=>setForm(p=>({...p,password:e.target.value}))}/>
                <span style={{ fontSize:11,color:T.whiteDim,marginTop:4 }}>Student can change this after first login</span>
              </div>
              <div>
                <label>Subjects</label>
                <div style={{ display:"flex", gap:8, marginTop:8 }}>
                  {["Mathematics","Physics","Chemistry"].map(sub=>{
                    const cfg=SUBJECT_CONFIG[sub];
                    return <button key={sub} onClick={()=>tog(sub)} style={{ padding:"8px 14px",borderRadius:8,cursor:"pointer",fontSize:13,fontWeight:500,transition:"all .2s", border:`1px solid ${form.subjects.includes(sub)?cfg.color:T.glassBorder}`, background:form.subjects.includes(sub)?cfg.bg:"transparent", color:form.subjects.includes(sub)?cfg.color:T.whiteDim }}>{sub}</button>;
                  })}
                </div>
              </div>
              <div style={{ display:"flex", gap:10, marginTop:4 }}>
                <button className="btn-ghost" onClick={()=>setShowAdd(false)} style={{ flex:1 }}>Cancel</button>
                <button className="btn-primary" onClick={handleAdd} disabled={saving} style={{ flex:1,justifyContent:"center" }}>{saving?<span className="spinner"/>:"Add Student"}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
const MaterialsManager = ({ token, showToast }) => {
  const [subject, setSubject] = useState("Mathematics");
  const { data:folders, loading, reload } = useDB(token,"material_folders",`?subject=eq.${subject}&order=created_at`,[subject]);
  const [expanded, setExpanded] = useState({});
  const [showNew, setShowNew] = useState(false);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const addFolder = async () => {
    if(!name.trim())return;
    setSaving(true);
    try {
      const t=await sb.from(token,"material_folders");
      await t.insert({name:name.trim(),subject});
      setName("");setShowNew(false);showToast("Folder created","success");reload();
    } catch(e){showToast(e.message,"error");}
    setSaving(false);
  };
  const del = async (id) => {
    try { const t=await sb.from(token,"material_folders"); await t.delete(`?id=eq.${id}`); showToast("Deleted","info"); reload(); }
    catch(e){showToast(e.message,"error");}
  };
  const cfg = SUBJECT_CONFIG[subject];
  return (
    <div className="animate-in">
      <div className="section-header">
        <div><h1 className="display section-title">Material Library</h1><p className="section-sub">Manage and publish resources</p></div>
        <div style={{ display:"flex",gap:9 }}>
          <button className="btn-ghost" onClick={()=>setShowNew(true)}><Icon name="folder" size={14}/>New Folder</button>
          <button className="btn-primary"><Icon name="upload" size={14}/>Upload File</button>
        </div>
      </div>
      <div style={{ display:"flex",gap:8,marginBottom:22 }}>
        {["Mathematics","Physics","Chemistry"].map(s=>{const c=SUBJECT_CONFIG[s];return(<button key={s} onClick={()=>setSubject(s)} style={{ padding:"8px 18px",borderRadius:8,cursor:"pointer",fontSize:13,fontWeight:500,transition:"all .2s",border:`1px solid ${subject===s?c.color:T.glassBorder}`,background:subject===s?c.bg:"transparent",color:subject===s?c.color:T.whiteDim }}>{s}</button>);})}
      </div>
      {loading?<div style={{ textAlign:"center",padding:40 }}><span className="spinner"/></div>:
       (folders||[]).length===0?(
        <div className="empty-state"><div style={{ fontSize:40,marginBottom:14,opacity:.5 }}>📁</div><h3>No folders yet</h3><p>Create folders to organise your {subject} materials</p><button className="btn-primary" onClick={()=>setShowNew(true)}>Create First Folder</button></div>
       ):(
        <div className="col">
          {folders.map(folder=>(
            <div key={folder.id} className="glass" style={{ overflow:"hidden" }}>
              <div style={{ padding:"15px 18px",display:"flex",alignItems:"center",gap:11,cursor:"pointer" }} onClick={()=>setExpanded(p=>({...p,[folder.id]:!p[folder.id]}))}>
                <span style={{ color:cfg.color }}><Icon name="folder" size={17}/></span>
                <span style={{ flex:1,fontWeight:500,fontSize:14.5 }}>{folder.name}</span>
                <button className="btn-danger" style={{ padding:"4px 9px" }} onClick={e=>{e.stopPropagation();del(folder.id)}}><Icon name="trash" size={13}/></button>
                <span style={{ color:T.whiteDim,fontSize:12,transform:expanded[folder.id]?"rotate(180deg)":"none",transition:"transform .2s" }}>▼</span>
              </div>
              {expanded[folder.id]&&(
                <div style={{ borderTop:`1px solid ${T.glassBorder}` }}>
                  <div style={{ padding:"16px 18px",textAlign:"center",color:T.whiteDim,fontSize:13 }}>File upload connects to Supabase Storage (Phase 3)</div>
                  <div style={{ padding:"10px 18px",borderTop:`1px solid ${T.glassBorder}` }}>
                    <button className="btn-ghost" style={{ padding:"7px 14px",fontSize:12 }}><Icon name="upload" size={13}/>Upload to folder</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
       )}
      {showNew&&(
        <div className="modal-overlay" onClick={()=>setShowNew(false)}>
          <div className="modal" style={{ maxWidth:380 }} onClick={e=>e.stopPropagation()}>
            <h2 className="display" style={{ fontSize:18,fontWeight:600,marginBottom:18 }}>New Folder — {subject}</h2>
            <input placeholder="Folder name" value={name} onChange={e=>setName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addFolder()} autoFocus/>
            <div style={{ display:"flex",gap:10,marginTop:14 }}>
              <button className="btn-ghost" onClick={()=>setShowNew(false)} style={{ flex:1 }}>Cancel</button>
              <button className="btn-primary" onClick={addFolder} disabled={saving} style={{ flex:1,justifyContent:"center" }}>{saving?<span className="spinner"/>:"Create"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const TestsManager = ({ token, showToast, onMark }) => {
  const { data:tests, loading, reload } = useDB(token,"tests","?order=created_at.desc");
  const [showCreate, setShowCreate] = useState(false);
  const [filterSubject, setFilterSubject] = useState("all");
  const [form, setForm] = useState({ title:"", subject:"Mathematics", due_date:"", attempts_allowed:1, marking_mode:"manual", show_results_immediately:false });
  const [saving, setSaving] = useState(false);
  const filtered = (tests||[]).filter(t=>filterSubject==="all"||t.subject===filterSubject);
  const handleCreate = async () => {
    if(!form.title||!form.due_date){showToast("Title and due date required","error");return;}
    setSaving(true);
    try {
      const t=await sb.from(token,"tests"); await t.insert({...form,status:"draft"});
      showToast("Test created","success");setShowCreate(false);
      setForm({title:"",subject:"Mathematics",due_date:"",attempts_allowed:1,marking_mode:"manual",show_results_immediately:false});reload();
    } catch(e){showToast(e.message,"error");}
    setSaving(false);
  };
  const del = async (id) => { try { const t=await sb.from(token,"tests"); await t.delete(`?id=eq.${id}`); showToast("Deleted","info"); reload(); } catch(e){showToast(e.message,"error");} };
  const setStatus = async (id,status) => { try { const t=await sb.from(token,"tests"); await t.update({status},`?id=eq.${id}`); showToast(`Test ${status}`,"success"); reload(); } catch(e){showToast(e.message,"error");} };
  return (
    <div className="animate-in">
      <div className="section-header">
        <div><h1 className="display section-title">Tests & Assignments</h1><p className="section-sub">Create, manage and mark assessments</p></div>
        <button className="btn-primary" onClick={()=>setShowCreate(true)}><Icon name="plus" size={14}/>Create Test</button>
      </div>
      <div style={{ display:"flex",gap:8,marginBottom:18 }}>
        {["all","Mathematics","Physics","Chemistry"].map(f=><button key={f} className={`chip-filter ${filterSubject===f?"active":""}`} onClick={()=>setFilterSubject(f)}>{f==="all"?"All":f}</button>)}
      </div>
      {loading?<div style={{ textAlign:"center",padding:40 }}><span className="spinner"/></div>:
       filtered.length===0?<div className="empty-state"><h3>No tests yet</h3><p>Create your first test</p><button className="btn-primary" onClick={()=>setShowCreate(true)}>Create Test</button></div>:(
        <div className="col">
          {filtered.map(t=>(
            <div key={t.id} className="glass" style={{ padding:20,display:"flex",alignItems:"center",gap:14 }}>
              <div style={{ flex:1 }}>
                <div style={{ display:"flex",gap:8,alignItems:"center",marginBottom:6 }}>
                  <span style={{ fontWeight:600,fontSize:15 }}>{t.title}</span>
                  <span className={`badge ${t.status==="active"?"badge-green":t.status==="closed"?"badge-gray":"badge-teal"}`}>{t.status}</span>
                  <span className="badge badge-orange" style={{ fontSize:10 }}>{t.marking_mode}</span>
                </div>
                <div style={{ display:"flex",gap:10,alignItems:"center" }}>
                  <span className={`tag ${subjectTag(t.subject)}`}>{t.subject}</span>
                  <span style={{ fontSize:12,color:T.whiteDim }}>Due: {t.due_date}</span>
                  <span style={{ fontSize:12,color:T.whiteDim }}>{t.attempts_allowed===99?"Unlimited":t.attempts_allowed} attempt{t.attempts_allowed!==1?"s":""}</span>
                </div>
              </div>
              <div style={{ display:"flex",gap:8 }}>
                {t.status==="draft"&&<button className="btn-success" style={{ padding:"7px 13px",fontSize:12 }} onClick={()=>setStatus(t.id,"active")}><Icon name="check" size={13}/>Publish</button>}
                {t.status==="active"&&<button className="btn-ghost" style={{ padding:"7px 13px",fontSize:12 }} onClick={()=>setStatus(t.id,"closed")}>Close</button>}
                <button className="btn-ghost" style={{ padding:"7px 13px",fontSize:12 }}><Icon name="edit" size={13}/>Edit</button>
                <button className="btn-ghost" style={{ padding:"7px 13px",fontSize:12, color:T.accent, borderColor:"rgba(255,107,53,.3)" }} onClick={()=>onMark&&onMark(t)}><Icon name="eye" size={13}/>Mark</button>
                <button className="btn-danger" style={{ padding:"7px 10px" }} onClick={()=>del(t.id)}><Icon name="trash" size={14}/></button>
              </div>
            </div>
          ))}
        </div>
       )}
      {showCreate&&(
        <div className="modal-overlay" onClick={()=>setShowCreate(false)}>
          <div className="modal modal-lg" onClick={e=>e.stopPropagation()}>
            <div style={{ display:"flex",justifyContent:"space-between",marginBottom:22 }}>
              <h2 className="display" style={{ fontSize:19,fontWeight:600 }}>Create Test</h2>
              <button onClick={()=>setShowCreate(false)} style={{ background:"none",border:"none",color:T.whiteDim,cursor:"pointer" }}><Icon name="close" size={20}/></button>
            </div>
            <div className="col">
              <div className="input-group"><label>Test Title</label><input placeholder="e.g. Functions & Graphs Test 1" value={form.title} onChange={e=>setForm(p=>({...p,title:e.target.value}))}/></div>
              <div className="grid-2">
                <div className="input-group"><label>Subject</label><select value={form.subject} onChange={e=>setForm(p=>({...p,subject:e.target.value}))}>{["Mathematics","Physics","Chemistry"].map(s=><option key={s}>{s}</option>)}</select></div>
                <div className="input-group"><label>Due Date</label><input type="date" value={form.due_date} onChange={e=>setForm(p=>({...p,due_date:e.target.value}))}/></div>
              </div>
              <div className="grid-2">
                <div className="input-group"><label>Attempts</label><select value={form.attempts_allowed} onChange={e=>setForm(p=>({...p,attempts_allowed:Number(e.target.value)}))}><option value={1}>1 attempt</option><option value={2}>2 attempts</option><option value={3}>3 attempts</option><option value={99}>Unlimited</option></select></div>
                <div className="input-group"><label>Marking Mode</label><select value={form.marking_mode} onChange={e=>setForm(p=>({...p,marking_mode:e.target.value}))}><option value="manual">Manual (I mark it)</option><option value="auto">Auto-mark</option><option value="mixed">Mixed</option></select></div>
              </div>
              {form.marking_mode!=="manual"&&(
                <label style={{ display:"flex",alignItems:"center",gap:9,textTransform:"none",letterSpacing:0,fontSize:14,fontWeight:400 }}>
                  <input type="checkbox" style={{ width:"auto" }} checked={form.show_results_immediately} onChange={e=>setForm(p=>({...p,show_results_immediately:e.target.checked}))}/>
                  Show results immediately after submission
                </label>
              )}
              <div style={{ background:T.tealGlow,borderRadius:10,padding:"12px 14px",fontSize:13,color:T.teal,display:"flex",gap:8 }}>
                <Icon name="info" size={15}/>After creating, go to <strong>Question Bank</strong> to add questions with LaTeX, images and symbols.
              </div>
              <div style={{ display:"flex",gap:10 }}>
                <button className="btn-ghost" onClick={()=>setShowCreate(false)} style={{ flex:1 }}>Cancel</button>
                <button className="btn-primary" onClick={handleCreate} disabled={saving} style={{ flex:1,justifyContent:"center" }}>{saving?<span className="spinner"/>:"Create Test"}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
const AnnouncementsManager = ({ token, showToast }) => {
  const { data:list, loading, reload } = useDB(token,"announcements","?order=created_at.desc");
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title:"", body:"", subject:"all", pinned:false });
  const [saving, setSaving] = useState(false);
  const handleAdd = async () => {
    if(!form.title||!form.body){showToast("Title and body required","error");return;}
    setSaving(true);
    try { const t=await sb.from(token,"announcements"); await t.insert(form); showToast("Posted","success"); setShowAdd(false); setForm({title:"",body:"",subject:"all",pinned:false}); reload(); }
    catch(e){showToast(e.message,"error");}
    setSaving(false);
  };
  const del = async (id) => { try { const t=await sb.from(token,"announcements"); await t.delete(`?id=eq.${id}`); showToast("Deleted","info"); reload(); } catch(e){showToast(e.message,"error");} };
  const borderColor = s => s==="all"?T.teal:SUBJECT_CONFIG[s]?.color||T.teal;
  return (
    <div className="animate-in">
      <div className="section-header">
        <div><h1 className="display section-title">Announcements</h1><p className="section-sub">Broadcast updates to students</p></div>
        <button className="btn-primary" onClick={()=>setShowAdd(true)}><Icon name="plus" size={14}/>Post Announcement</button>
      </div>
      {loading?<div style={{ textAlign:"center",padding:40 }}><span className="spinner"/></div>:
       (list||[]).length===0?<div className="empty-state"><h3>No announcements yet</h3><p>Post your first update</p></div>:(
        <div className="col">
          {list.map(a=>(
            <div key={a.id} className="glass" style={{ padding:22,borderLeft:`3px solid ${borderColor(a.subject)}` }}>
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10 }}>
                <div style={{ display:"flex",gap:8,alignItems:"center" }}>
                  {a.pinned&&<span style={{ fontSize:11,color:T.accent,fontWeight:600 }}>📌 PINNED</span>}
                  <span className={`badge ${a.subject==="all"?"badge-teal":a.subject==="Mathematics"?"badge-teal":a.subject==="Physics"?"badge-orange":"badge-green"}`}>{a.subject==="all"?"All Students":a.subject}</span>
                </div>
                <div style={{ display:"flex",gap:8,alignItems:"center" }}>
                  <span style={{ fontSize:12,color:T.whiteDim }}>{a.created_at?.split("T")[0]}</span>
                  <button className="btn-danger" style={{ padding:"4px 9px" }} onClick={()=>del(a.id)}><Icon name="trash" size={13}/></button>
                </div>
              </div>
              <h3 style={{ fontSize:16,fontWeight:600,marginBottom:8 }}>{a.title}</h3>
              <p style={{ fontSize:14,color:T.whiteDim,lineHeight:1.65 }}>{a.body}</p>
            </div>
          ))}
        </div>
       )}
      {showAdd&&(
        <div className="modal-overlay" onClick={()=>setShowAdd(false)}>
          <div className="modal modal-lg" onClick={e=>e.stopPropagation()}>
            <div style={{ display:"flex",justifyContent:"space-between",marginBottom:22 }}>
              <h2 className="display" style={{ fontSize:19,fontWeight:600 }}>New Announcement</h2>
              <button onClick={()=>setShowAdd(false)} style={{ background:"none",border:"none",color:T.whiteDim,cursor:"pointer" }}><Icon name="close" size={20}/></button>
            </div>
            <div className="col">
              <div className="input-group"><label>Title</label><input placeholder="Announcement title" value={form.title} onChange={e=>setForm(p=>({...p,title:e.target.value}))}/></div>
              <div className="input-group"><label>Message</label><textarea rows={5} placeholder="Write your message..." value={form.body} onChange={e=>setForm(p=>({...p,body:e.target.value}))}/></div>
              <div className="grid-2">
                <div className="input-group"><label>Send To</label>
                  <select value={form.subject} onChange={e=>setForm(p=>({...p,subject:e.target.value}))}>
                    <option value="all">All Students</option>
                    {["Mathematics","Physics","Chemistry"].map(s=><option key={s} value={s}>{s} Only</option>)}
                  </select>
                </div>
                <div style={{ display:"flex",alignItems:"flex-end",paddingBottom:2 }}>
                  <label style={{ display:"flex",alignItems:"center",gap:9,textTransform:"none",letterSpacing:0,fontSize:14,fontWeight:400 }}>
                    <input type="checkbox" style={{ width:"auto" }} checked={form.pinned} onChange={e=>setForm(p=>({...p,pinned:e.target.checked}))}/>Pin this
                  </label>
                </div>
              </div>
              <div style={{ display:"flex",gap:10 }}>
                <button className="btn-ghost" onClick={()=>setShowAdd(false)} style={{ flex:1 }}>Cancel</button>
                <button className="btn-primary" onClick={handleAdd} disabled={saving} style={{ flex:1,justifyContent:"center" }}>{saving?<span className="spinner"/>:"Post"}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ScheduleManager = ({ token, showToast }) => {
  const { data:sessions, loading, reload } = useDB(token,"sessions","?order=session_date,session_time");
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title:"", session_date:"", session_time:"", subject:"Mathematics", teams_link:"", type:"live" });
  const [saving, setSaving] = useState(false);
  const today = new Date().toISOString().split("T")[0];
  const upcoming = (sessions||[]).filter(s=>s.session_date>=today);
  const past = (sessions||[]).filter(s=>s.session_date<today).reverse();
  const handleAdd = async () => {
    if(!form.title||!form.session_date||!form.session_time){showToast("Fill required fields","error");return;}
    setSaving(true);
    try { const t=await sb.from(token,"sessions"); await t.insert(form); showToast("Session scheduled","success"); setShowAdd(false); setForm({title:"",session_date:"",session_time:"",subject:"Mathematics",teams_link:"",type:"live"}); reload(); }
    catch(e){showToast(e.message,"error");}
    setSaving(false);
  };
  const del = async (id) => { try { const t=await sb.from(token,"sessions"); await t.delete(`?id=eq.${id}`); showToast("Removed","info"); reload(); } catch(e){showToast(e.message,"error");} };
  const SessionRow = ({ s }) => {
    const cfg = SUBJECT_CONFIG[s.subject]||SUBJECT_CONFIG.Mathematics;
    return (
      <div className="glass" style={{ padding:18,display:"flex",alignItems:"center",gap:14,borderLeft:`3px solid ${cfg.color}`,marginBottom:10 }}>
        <div style={{ textAlign:"center",minWidth:50 }}>
          <div style={{ fontSize:22,fontWeight:700,color:cfg.color,lineHeight:1 }}>{s.session_date?.split("-")[2]}</div>
          <div style={{ fontSize:10,color:T.whiteDim,textTransform:"uppercase" }}>{new Date(s.session_date+"T12:00").toLocaleString("default",{month:"short"})}</div>
        </div>
        <div style={{ width:1,height:34,background:T.glassBorder }}/>
        <div style={{ flex:1 }}>
          <div style={{ fontWeight:600,fontSize:14.5,marginBottom:4 }}>{s.title}</div>
          <div style={{ display:"flex",gap:8,alignItems:"center" }}>
            <span className={`tag ${subjectTag(s.subject)}`}>{s.subject}</span>
            <span style={{ fontSize:12,color:T.whiteDim }}>⏰ {s.session_time}</span>
            <span className={`badge ${s.type==="live"?"badge-teal":"badge-orange"}`}>{s.type==="live"?"Live Lesson":"Test"}</span>
          </div>
        </div>
        {s.teams_link&&<a href={s.teams_link} target="_blank" rel="noreferrer" className="btn-primary" style={{ textDecoration:"none",fontSize:13,padding:"8px 14px" }}><Icon name="teams" size={13}/>Join</a>}
        <button className="btn-danger" style={{ padding:"7px 9px" }} onClick={()=>del(s.id)}><Icon name="trash" size={14}/></button>
      </div>
    );
  };
  return (
    <div className="animate-in">
      <div className="section-header">
        <div><h1 className="display section-title">Schedule</h1><p className="section-sub">Lessons and tests with MS Teams links</p></div>
        <button className="btn-primary" onClick={()=>setShowAdd(true)}><Icon name="plus" size={14}/>Schedule Session</button>
      </div>
      {loading?<div style={{ textAlign:"center",padding:40 }}><span className="spinner"/></div>:(
        <>
          <p style={{ fontSize:12,color:T.whiteDim,textTransform:"uppercase",letterSpacing:"1.5px",fontWeight:600,marginBottom:12 }}>Upcoming</p>
          {upcoming.length===0?<div className="empty-state"><h3>No upcoming sessions</h3><p>Schedule your next lesson</p></div>:upcoming.map(s=><SessionRow key={s.id} s={s}/>)}
          {past.length>0&&<>
            <p style={{ fontSize:12,color:T.whiteDim,textTransform:"uppercase",letterSpacing:"1.5px",fontWeight:600,margin:"24px 0 12px" }}>Past Sessions</p>
            <div style={{ opacity:.55 }}>{past.map(s=><SessionRow key={s.id} s={s}/>)}</div>
          </>}
        </>
      )}
      {showAdd&&(
        <div className="modal-overlay" onClick={()=>setShowAdd(false)}>
          <div className="modal modal-lg" onClick={e=>e.stopPropagation()}>
            <div style={{ display:"flex",justifyContent:"space-between",marginBottom:22 }}>
              <h2 className="display" style={{ fontSize:19,fontWeight:600 }}>Schedule Session</h2>
              <button onClick={()=>setShowAdd(false)} style={{ background:"none",border:"none",color:T.whiteDim,cursor:"pointer" }}><Icon name="close" size={20}/></button>
            </div>
            <div className="col">
              <div className="input-group"><label>Title</label><input placeholder="e.g. Mathematics: Calculus Review" value={form.title} onChange={e=>setForm(p=>({...p,title:e.target.value}))}/></div>
              <div className="grid-2">
                <div className="input-group"><label>Date</label><input type="date" value={form.session_date} onChange={e=>setForm(p=>({...p,session_date:e.target.value}))}/></div>
                <div className="input-group"><label>Time</label><input type="time" value={form.session_time} onChange={e=>setForm(p=>({...p,session_time:e.target.value}))}/></div>
              </div>
              <div className="grid-2">
                <div className="input-group"><label>Subject</label><select value={form.subject} onChange={e=>setForm(p=>({...p,subject:e.target.value}))}>{["Mathematics","Physics","Chemistry"].map(s=><option key={s}>{s}</option>)}</select></div>
                <div className="input-group"><label>Type</label><select value={form.type} onChange={e=>setForm(p=>({...p,type:e.target.value}))}><option value="live">Live Lesson</option><option value="test">Test / Assessment</option></select></div>
              </div>
              <div className="input-group"><label>MS Teams Link</label><input placeholder="https://teams.microsoft.com/l/meetup-join/..." value={form.teams_link} onChange={e=>setForm(p=>({...p,teams_link:e.target.value}))}/></div>
              <div style={{ display:"flex",gap:10 }}>
                <button className="btn-ghost" onClick={()=>setShowAdd(false)} style={{ flex:1 }}>Cancel</button>
                <button className="btn-primary" onClick={handleAdd} disabled={saving} style={{ flex:1,justifyContent:"center" }}>{saving?<span className="spinner"/>:"Schedule"}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Analytics = ({ token }) => {
  const { data:students } = useDB(token,"profiles","?role=eq.student");
  const { data:tests } = useDB(token,"tests","?status=neq.draft");
  return (
    <div className="animate-in">
      <h1 className="display section-title" style={{ marginBottom:4 }}>Analytics</h1>
      <p className="section-sub" style={{ marginBottom:28 }}>Performance insights across all subjects</p>
      <div className="grid-3" style={{ marginBottom:28 }}>
        {["Mathematics","Physics","Chemistry"].map(s=>{
          const cfg=SUBJECT_CONFIG[s];
          const count=(students||[]).filter(st=>(st.subjects||[]).includes(s)).length;
          return (
            <div key={s} className="glass" style={{ padding:22,borderTop:`3px solid ${cfg.color}` }}>
              <div style={{ display:"flex",justifyContent:"space-between",marginBottom:12 }}>
                <span className={`tag ${subjectTag(s)}`}>{s}</span>
                <span style={{ fontSize:26,fontWeight:700,color:cfg.color }}>{count}</span>
              </div>
              <div style={{ fontSize:12,color:T.whiteDim,marginBottom:12 }}>Students enrolled</div>
              <div className="progress-bar"><div className="progress-fill" style={{ width:`${Math.min((count/100)*100,100)}%`,background:`linear-gradient(90deg,${cfg.color},${cfg.color}88)` }}/></div>
            </div>
          );
        })}
      </div>
      <div className="glass" style={{ padding:22 }}>
        <h3 className="display" style={{ fontSize:15,fontWeight:600,marginBottom:18 }}>Tests Overview</h3>
        {!tests?<div style={{ color:T.whiteDim,fontSize:13 }}>Loading...</div>:
         tests.length===0?<div className="empty-state"><p>No published tests yet</p></div>:
         tests.map(t=>(
          <div key={t.id} style={{ display:"flex",alignItems:"center",gap:14,marginBottom:12 }}>
            <div style={{ width:200 }}>
              <div style={{ fontSize:13,fontWeight:500,marginBottom:3 }}>{t.title}</div>
              <span className={`tag ${subjectTag(t.subject)}`}>{t.subject}</span>
            </div>
            <div style={{ flex:1 }}><div className="progress-bar"><div className="progress-fill" style={{ width:"0%" }}/></div></div>
            <span style={{ fontSize:12,color:T.whiteDim,minWidth:120,textAlign:"right" }}>No submissions yet</span>
          </div>
        ))}
      </div>
    </div>
  );
};
const VideoLibrary = ({ token, showToast }) => {
  const [subject, setSubject] = useState("Mathematics");
  const { data:videos, loading, reload } = useDB(token,"videos",`?subject=eq.${subject}&order=created_at.desc`,[subject]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title:"", link:"", duration:"", session_date:"" });
  const [saving, setSaving] = useState(false);
  const handleAdd = async () => {
    if(!form.title||!form.link){showToast("Title and link required","error");return;}
    setSaving(true);
    try { const t=await sb.from(token,"videos"); await t.insert({...form,subject}); showToast("Video added","success"); setShowAdd(false); setForm({title:"",link:"",duration:"",session_date:""}); reload(); }
    catch(e){showToast(e.message,"error");}
    setSaving(false);
  };
  const del = async (id) => { try { const t=await sb.from(token,"videos"); await t.delete(`?id=eq.${id}`); showToast("Removed","info"); reload(); } catch(e){showToast(e.message,"error");} };
  const cfg = SUBJECT_CONFIG[subject];
  return (
    <div className="animate-in">
      <div className="section-header">
        <div><h1 className="display section-title">Video Library</h1><p className="section-sub">Recorded lesson links for students</p></div>
        <button className="btn-primary" onClick={()=>setShowAdd(true)}><Icon name="plus" size={14}/>Add Recording</button>
      </div>
      <div style={{ display:"flex",gap:8,marginBottom:22 }}>
        {["Mathematics","Physics","Chemistry"].map(s=>{const c=SUBJECT_CONFIG[s];return(<button key={s} onClick={()=>setSubject(s)} style={{ padding:"8px 18px",borderRadius:8,cursor:"pointer",fontSize:13,fontWeight:500,transition:"all .2s",border:`1px solid ${subject===s?c.color:T.glassBorder}`,background:subject===s?c.bg:"transparent",color:subject===s?c.color:T.whiteDim }}>{s}</button>);})}
      </div>
      {loading?<div style={{ textAlign:"center",padding:40 }}><span className="spinner"/></div>:
       (videos||[]).length===0?<div className="empty-state"><h3>No recordings yet</h3><p>Add your first recorded lesson link</p></div>:(
        <div className="col">
          {videos.map(v=>(
            <div key={v.id} className="glass" style={{ padding:18,display:"flex",alignItems:"center",gap:14 }}>
              <div style={{ color:cfg.color }}><Icon name="video" size={24}/></div>
              <div style={{ flex:1 }}><div style={{ fontWeight:500,fontSize:14.5,marginBottom:3 }}>{v.title}</div><div style={{ fontSize:12,color:T.whiteDim }}>{v.session_date}{v.duration&&` · ${v.duration}`}</div></div>
              <a href={v.link} target="_blank" rel="noreferrer" className="btn-ghost" style={{ textDecoration:"none",fontSize:13,padding:"7px 14px" }}>Watch →</a>
              <button className="btn-danger" style={{ padding:"7px 9px" }} onClick={()=>del(v.id)}><Icon name="trash" size={14}/></button>
            </div>
          ))}
        </div>
       )}
      {showAdd&&(
        <div className="modal-overlay" onClick={()=>setShowAdd(false)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div style={{ display:"flex",justifyContent:"space-between",marginBottom:22 }}>
              <h2 className="display" style={{ fontSize:19,fontWeight:600 }}>Add Recording</h2>
              <button onClick={()=>setShowAdd(false)} style={{ background:"none",border:"none",color:T.whiteDim,cursor:"pointer" }}><Icon name="close" size={20}/></button>
            </div>
            <div className="col">
              <div className="input-group"><label>Lesson Title</label><input placeholder="e.g. Calculus: Limits Explained" value={form.title} onChange={e=>setForm(p=>({...p,title:e.target.value}))}/></div>
              <div className="input-group"><label>Recording Link (OneDrive / YouTube / Teams)</label><input placeholder="https://..." value={form.link} onChange={e=>setForm(p=>({...p,link:e.target.value}))}/></div>
              <div className="grid-2">
                <div className="input-group"><label>Duration</label><input placeholder="e.g. 45 min" value={form.duration} onChange={e=>setForm(p=>({...p,duration:e.target.value}))}/></div>
                <div className="input-group"><label>Date</label><input type="date" value={form.session_date} onChange={e=>setForm(p=>({...p,session_date:e.target.value}))}/></div>
              </div>
              <div style={{ display:"flex",gap:10 }}>
                <button className="btn-ghost" onClick={()=>setShowAdd(false)} style={{ flex:1 }}>Cancel</button>
                <button className="btn-primary" onClick={handleAdd} disabled={saving} style={{ flex:1,justifyContent:"center" }}>{saving?<span className="spinner"/>:"Add Video"}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const QuotesManager = ({ token, showToast }) => {
  const { data:quotes, loading, reload } = useDB(token,"quotes","?order=created_at.desc");
  const [showAdd, setShowAdd] = useState(false);
  const [preview, setPreview] = useState(null);
  const [form, setForm] = useState({ text:"", author:"", bg_color:"#1E2D4A", text_color:"#F0F4FF", active:false });
  const [saving, setSaving] = useState(false);
  const handleAdd = async () => {
    if(!form.text){showToast("Quote text required","error");return;}
    setSaving(true);
    try {
      if(form.active){ const t=await sb.from(token,"quotes"); await t.update({active:false},"?active=eq.true"); }
      const t=await sb.from(token,"quotes"); await t.insert(form);
      showToast("Quote added","success"); setShowAdd(false); setForm({text:"",author:"",bg_color:"#1E2D4A",text_color:"#F0F4FF",active:false}); reload();
    } catch(e){showToast(e.message,"error");}
    setSaving(false);
  };
  const toggleActive = async (id, isActive) => {
    try {
      const t=await sb.from(token,"quotes");
      await t.update({active:false},"?active=eq.true");
      if(!isActive) await t.update({active:true},`?id=eq.${id}`);
      showToast(isActive?"Deactivated":"Set as active","success"); reload();
    } catch(e){showToast(e.message,"error");}
  };
  const del = async (id) => { try { const t=await sb.from(token,"quotes"); await t.delete(`?id=eq.${id}`); showToast("Deleted","info"); reload(); } catch(e){showToast(e.message,"error");} };
  return (
    <div className="animate-in">
      <div className="section-header">
        <div><h1 className="display section-title">Motivational Quotes</h1><p className="section-sub">One active quote shows as a full-screen splash on student login</p></div>
        <button className="btn-primary" onClick={()=>setShowAdd(true)}><Icon name="plus" size={14}/>Add Quote</button>
      </div>
      {loading?<div style={{ textAlign:"center",padding:40 }}><span className="spinner"/></div>:
       (quotes||[]).length===0?<div className="empty-state"><h3>No quotes yet</h3><p>Add your first motivational quote for students</p></div>:(
        <div className="col">
          {quotes.map(q=>(
            <div key={q.id} className="glass" style={{ padding:22,display:"flex",gap:18,alignItems:"center",borderLeft:q.active?`3px solid ${T.teal}`:`3px solid transparent` }}>
              <div style={{ flex:1 }}>
                <p style={{ fontSize:15,fontWeight:500,lineHeight:1.45,marginBottom:6 }}>"{q.text}"</p>
                {q.author&&<p style={{ fontSize:13,color:T.whiteDim }}>— {q.author}</p>}
                <div style={{ display:"flex",gap:8,marginTop:10,alignItems:"center" }}>
                  <div style={{ width:20,height:20,borderRadius:4,background:q.bg_color,border:`1px solid ${T.glassBorder}` }} title="Background colour"/>
                  <div style={{ width:20,height:20,borderRadius:4,background:q.text_color,border:`1px solid ${T.glassBorder}` }} title="Text colour"/>
                  {q.active&&<span className="badge badge-teal">● ACTIVE</span>}
                </div>
              </div>
              <div style={{ display:"flex",gap:8,flexShrink:0 }}>
                <button className="btn-ghost" style={{ padding:"7px 13px",fontSize:12 }} onClick={()=>setPreview(q)}><Icon name="eye" size={13}/>Preview</button>
                <button onClick={()=>toggleActive(q.id,q.active)} style={{ padding:"7px 13px",borderRadius:8,fontSize:13,cursor:"pointer",fontWeight:500,background:q.active?"rgba(239,68,68,.1)":T.tealGlow,color:q.active?T.danger:T.teal,border:`1px solid ${q.active?"rgba(239,68,68,.3)":T.glassBorder}`,display:"inline-flex",alignItems:"center" }}>
                  {q.active?"Deactivate":"Set Active"}
                </button>
                <button className="btn-danger" style={{ padding:"7px 9px" }} onClick={()=>del(q.id)}><Icon name="trash" size={14}/></button>
              </div>
            </div>
          ))}
        </div>
       )}
      {preview&&<QuoteSplash quote={{ text:preview.text, author:preview.author, bg:preview.bg_color, textColor:preview.text_color }} onDismiss={()=>setPreview(null)}/>}
      {showAdd&&(
        <div className="modal-overlay" onClick={()=>setShowAdd(false)}>
          <div className="modal modal-lg" onClick={e=>e.stopPropagation()}>
            <div style={{ display:"flex",justifyContent:"space-between",marginBottom:22 }}>
              <h2 className="display" style={{ fontSize:19,fontWeight:600 }}>New Motivational Quote</h2>
              <button onClick={()=>setShowAdd(false)} style={{ background:"none",border:"none",color:T.whiteDim,cursor:"pointer" }}><Icon name="close" size={20}/></button>
            </div>
            <div className="col">
              <div className="input-group"><label>Quote Text</label><textarea rows={3} placeholder="Enter the motivational quote..." value={form.text} onChange={e=>setForm(p=>({...p,text:e.target.value}))}/></div>
              <div className="input-group"><label>Author (optional)</label><input placeholder="e.g. Nelson Mandela" value={form.author} onChange={e=>setForm(p=>({...p,author:e.target.value}))}/></div>
              <div className="grid-2">
                <div className="input-group"><label>Background Colour</label><input type="color" value={form.bg_color} onChange={e=>setForm(p=>({...p,bg_color:e.target.value}))} style={{ height:44,cursor:"pointer" }}/></div>
                <div className="input-group"><label>Text Colour</label><input type="color" value={form.text_color} onChange={e=>setForm(p=>({...p,text_color:e.target.value}))} style={{ height:44,cursor:"pointer" }}/></div>
              </div>
              <label style={{ display:"flex",alignItems:"center",gap:9,textTransform:"none",letterSpacing:0,fontSize:14,fontWeight:400 }}>
                <input type="checkbox" style={{ width:"auto" }} checked={form.active} onChange={e=>setForm(p=>({...p,active:e.target.checked}))}/>Set as active immediately
              </label>
              <div style={{ display:"flex",gap:10 }}>
                <button className="btn-ghost" onClick={()=>setShowAdd(false)} style={{ flex:1 }}>Cancel</button>
                <button className="btn-primary" onClick={handleAdd} disabled={saving} style={{ flex:1,justifyContent:"center" }}>{saving?<span className="spinner"/>:"Add Quote"}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── PHASE 3: QUESTION BANK + TEST ENGINE ────────────────────────────────────

// LaTeX renderer using KaTeX via CDN (loaded dynamically)
const loadKaTeX = () => {
  if (window.katex) return Promise.resolve();
  return new Promise((resolve) => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css";
    document.head.appendChild(link);
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js";
    script.onload = resolve;
    document.head.appendChild(script);
  });
};

const renderLatex = (text) => {
  if (!text) return "";
  if (!window.katex) return text;
  try {
    return text.replace(/\$\$([^$]+)\$\$/g, (_, math) => {
      try { return window.katex.renderToString(math, { displayMode: true, throwOnError: false }); }
      catch(e) { return `<span style="color:#EF4444">LaTeX error</span>`; }
    }).replace(/\$([^$]+)\$/g, (_, math) => {
      try { return window.katex.renderToString(math, { displayMode: false, throwOnError: false }); }
      catch(e) { return `<span style="color:#EF4444">LaTeX error</span>`; }
    });
  } catch(e) { return text; }
};

// Rich text display component
const RichText = ({ content }) => {
  const [rendered, setRendered] = useState(content || "");
  useEffect(() => {
    loadKaTeX().then(() => setRendered(renderLatex(content || "")));
  }, [content]);
  return <span dangerouslySetInnerHTML={{ __html: rendered }} />;
};

// ─── QUESTION EDITOR MODAL ───────────────────────────────────────────────────
const QuestionEditor = ({ testId, question, onSave, onClose, showToast }) => {
  const [form, setForm] = useState(question || {
    type: "mcq", content: "", options: ["", "", "", ""],
    correct_answer: "", marks: 1, order_index: 0,
  });
  const [preview, setPreview] = useState(false);
  const [saving, setSaving] = useState(false);

  const SYMBOLS = {
    "Math": ["∫", "∑", "∞", "√", "≤", "≥", "≠", "≈", "±", "×", "÷", "π", "θ", "α", "β", "Δ", "λ", "μ", "Ω", "∂"],
    "Physics": ["⃗", "ω", "τ", "ρ", "σ", "ε", "φ", "Φ", "Ψ", "η", "κ", "γ", "ν", "ξ"],
    "Chemistry": ["→", "⇌", "↑", "↓", "⁺", "⁻", "°", "₀", "₁", "₂", "₃", "₄", "₅", "₆", "₇", "₈", "₉"],
  };

  const insertAtCursor = (symbol) => {
    const ta = document.getElementById("question-content");
    if (!ta) { setForm(p => ({ ...p, content: p.content + symbol })); return; }
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const newVal = form.content.substring(0, start) + symbol + form.content.substring(end);
    setForm(p => ({ ...p, content: newVal }));
    setTimeout(() => { ta.selectionStart = ta.selectionEnd = start + symbol.length; ta.focus(); }, 0);
  };

  const updateOption = (i, val) => setForm(p => {
    const opts = [...(p.options || ["","","",""])];
    opts[i] = val;
    return { ...p, options: opts };
  });

  const addOption = () => setForm(p => ({ ...p, options: [...(p.options || []), ""] }));
  const removeOption = (i) => setForm(p => ({ ...p, options: p.options.filter((_, j) => j !== i) }));

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-lg" onClick={e => e.stopPropagation()} style={{ maxWidth: 740, maxHeight: "95vh" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
          <h2 className="display" style={{ fontSize:18, fontWeight:600 }}>{question ? "Edit Question" : "New Question"}</h2>
          <div style={{ display:"flex", gap:8 }}>
            <button className="btn-ghost" style={{ padding:"6px 14px", fontSize:12 }} onClick={() => setPreview(p => !p)}>
              {preview ? "✏️ Edit" : "👁 Preview"}
            </button>
            <button onClick={onClose} style={{ background:"none", border:"none", color:T.whiteDim, cursor:"pointer" }}><Icon name="close" size={20}/></button>
          </div>
        </div>

        {preview ? (
          <div style={{ padding:"20px", background:"rgba(255,255,255,.03)", borderRadius:12, border:`1px solid ${T.glassBorder}`, minHeight:200 }}>
            <div style={{ fontSize:15, lineHeight:1.7, marginBottom:16 }}><RichText content={form.content}/></div>
            {form.type === "mcq" && (form.options||[]).filter(o=>o).map((opt, i) => (
              <div key={i} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 14px", marginBottom:8, borderRadius:8, border:`1px solid ${form.correct_answer===String(i)?T.teal:T.glassBorder}`, background:form.correct_answer===String(i)?T.tealGlow:"transparent" }}>
                <div style={{ width:20, height:20, borderRadius:"50%", border:`2px solid ${form.correct_answer===String(i)?T.teal:T.whiteDim}`, flexShrink:0 }}/>
                <RichText content={opt}/>
              </div>
            ))}
            {form.type === "short" && <div style={{ background:"rgba(255,255,255,.05)", borderRadius:8, padding:"10px 14px", color:T.whiteDim, fontSize:13 }}>Short answer field here</div>}
            {form.type === "long" && <div style={{ background:"rgba(255,255,255,.05)", borderRadius:8, padding:"10px 14px", color:T.whiteDim, fontSize:13, minHeight:80 }}>Long answer field here</div>}
          </div>
        ) : (
          <div className="col">
            {/* Type + Marks row */}
            <div className="grid-2">
              <div className="input-group">
                <label>Question Type</label>
                <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value, correct_answer: "" }))}>
                  <option value="mcq">Multiple Choice (MCQ)</option>
                  <option value="short">Short Answer</option>
                  <option value="long">Long Answer / Essay</option>
                  <option value="true_false">True / False</option>
                </select>
              </div>
              <div className="input-group">
                <label>Marks</label>
                <input type="number" min="1" max="100" value={form.marks} onChange={e => setForm(p => ({ ...p, marks: Number(e.target.value) }))}/>
              </div>
            </div>

            {/* Symbol toolbar */}
            <div>
              <label>Insert Symbol / Notation</label>
              <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                {Object.entries(SYMBOLS).map(([cat, syms]) => (
                  <div key={cat} style={{ display:"flex", alignItems:"center", gap:6, flexWrap:"wrap" }}>
                    <span style={{ fontSize:10, color:T.whiteDim, fontWeight:600, minWidth:58, textTransform:"uppercase", letterSpacing:".5px" }}>{cat}</span>
                    {syms.map(s => (
                      <button key={s} onClick={() => insertAtCursor(s)} style={{ width:30, height:30, borderRadius:6, border:`1px solid ${T.glassBorder}`, background:"rgba(255,255,255,.04)", color:T.white, cursor:"pointer", fontSize:14, display:"flex", alignItems:"center", justifyContent:"center" }} title={s}>{s}</button>
                    ))}
                  </div>
                ))}
              </div>
              <div style={{ marginTop:8, padding:"8px 12px", background:"rgba(0,212,200,.06)", borderRadius:8, fontSize:11, color:T.teal }}>
                💡 Use <strong>$formula$</strong> for inline LaTeX and <strong>$$formula$$</strong> for display LaTeX. Example: <strong>$x^2 + y^2 = r^2$</strong>
              </div>
            </div>

            {/* Question content */}
            <div className="input-group">
              <label>Question Content</label>
              <textarea id="question-content" rows={4} placeholder="Type your question here. Use $...$ for LaTeX equations, e.g. $\frac{d}{dx}(x^2) = 2x$" value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))} style={{ fontFamily:"monospace", fontSize:13 }}/>
            </div>

            {/* MCQ options */}
            {form.type === "mcq" && (
              <div>
                <label>Answer Options</label>
                <div className="col" style={{ gap:8, marginTop:6 }}>
                  {(form.options || ["","","",""]).map((opt, i) => (
                    <div key={i} style={{ display:"flex", gap:8, alignItems:"center" }}>
                      <button onClick={() => setForm(p => ({ ...p, correct_answer: String(i) }))} style={{ width:28, height:28, borderRadius:"50%", border:`2px solid ${form.correct_answer===String(i)?T.teal:T.glassBorder}`, background:form.correct_answer===String(i)?T.tealGlow:"transparent", cursor:"pointer", flexShrink:0, color:form.correct_answer===String(i)?T.teal:T.whiteDim, fontSize:11, fontWeight:700 }}>{String.fromCharCode(65+i)}</button>
                      <input placeholder={`Option ${String.fromCharCode(65+i)}`} value={opt} onChange={e => updateOption(i, e.target.value)} style={{ flex:1 }}/>
                      {(form.options||[]).length > 2 && <button className="btn-danger" style={{ padding:"5px 8px" }} onClick={() => removeOption(i)}><Icon name="trash" size={12}/></button>}
                    </div>
                  ))}
                  <button className="btn-ghost" style={{ padding:"6px 14px", fontSize:12, alignSelf:"flex-start" }} onClick={addOption}><Icon name="plus" size={13}/>Add Option</button>
                </div>
              </div>
            )}

            {/* True/False */}
            {form.type === "true_false" && (
              <div>
                <label>Correct Answer</label>
                <div style={{ display:"flex", gap:10, marginTop:6 }}>
                  {["True","False"].map(v => (
                    <button key={v} onClick={() => setForm(p => ({ ...p, correct_answer: v }))} style={{ flex:1, padding:"10px", borderRadius:8, cursor:"pointer", fontWeight:600, fontSize:14, border:`1px solid ${form.correct_answer===v?T.teal:T.glassBorder}`, background:form.correct_answer===v?T.tealGlow:"transparent", color:form.correct_answer===v?T.teal:T.whiteDim }}>{v}</button>
                  ))}
                </div>
              </div>
            )}

            {/* Short answer — model answer */}
            {form.type === "short" && (
              <div className="input-group">
                <label>Model Answer (for auto-mark reference)</label>
                <input placeholder="Expected answer..." value={form.correct_answer} onChange={e => setForm(p => ({ ...p, correct_answer: e.target.value }))}/>
                <span style={{ fontSize:11, color:T.whiteDim, marginTop:4 }}>For manual marking, this is just a reference for you</span>
              </div>
            )}
          </div>
        )}

        <div style={{ display:"flex", gap:10, marginTop:20 }}>
          <button className="btn-ghost" onClick={onClose} style={{ flex:1 }}>Cancel</button>
          <button className="btn-primary" disabled={saving} style={{ flex:1, justifyContent:"center" }}
            onClick={async () => {
              if (!form.content.trim()) { showToast("Question content required","error"); return; }
              setSaving(true);
              try { await onSave(form); onClose(); }
              catch(e) { showToast(e.message,"error"); }
              setSaving(false);
            }}>
            {saving ? <span className="spinner"/> : "Save Question"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── QUESTION BANK PAGE ───────────────────────────────────────────────────────
const QuestionBankPage = ({ token, showToast }) => {
  const [filterSubject, setFilterSubject] = useState("all");
  const [filterTest, setFilterTest] = useState("all");
  const { data: tests } = useDB(token, "tests", "?order=created_at.desc");
  const { data: questions, loading, reload } = useDB(token, "questions",
    filterTest !== "all" ? `?test_id=eq.${filterTest}&order=order_index` : "?order=created_at.desc"
  , [filterTest]);
  const [showEditor, setShowEditor] = useState(false);
  const [editingQ, setEditingQ] = useState(null);
  const [selectedTest, setSelectedTest] = useState("none");

  const filteredTests = (tests||[]).filter(t => filterSubject==="all" || t.subject===filterSubject);

  const handleSave = async (form) => {
    const testId = filterTest !== "all" ? filterTest : (selectedTest !== "none" ? selectedTest : null);
    const t = await sb.from(token, "questions");
    if (editingQ?.id) {
      await t.update({ ...form, test_id: testId }, `?id=eq.${editingQ.id}`);
      showToast("Question updated","success");
    } else {
      await t.insert({ ...form, test_id: testId, order_index: (questions||[]).length });
      showToast("Question added","success");
    }
    reload();
  };

  const deleteQ = async (id) => {
    try { const t = await sb.from(token,"questions"); await t.delete(`?id=eq.${id}`); showToast("Deleted","info"); reload(); }
    catch(e) { showToast(e.message,"error"); }
  };

  const moveQ = async (id, dir, idx) => {
    const qs = [...(questions||[])];
    const swapIdx = dir === "up" ? idx-1 : idx+1;
    if (swapIdx < 0 || swapIdx >= qs.length) return;
    try {
      const t = await sb.from(token,"questions");
      await t.update({ order_index: swapIdx }, `?id=eq.${id}`);
      await t.update({ order_index: idx }, `?id=eq.${qs[swapIdx].id}`);
      reload();
    } catch(e) { showToast(e.message,"error"); }
  };

  const typeLabel = { mcq:"MCQ", short:"Short Answer", long:"Long Answer", true_false:"True/False" };
  const typeBadge = { mcq:"badge-teal", short:"badge-orange", long:"badge-green", true_false:"badge-gray" };

  return (
    <div className="animate-in">
      <div className="section-header">
        <div><h1 className="display section-title">Question Bank</h1><p className="section-sub">Create and manage questions for your tests</p></div>
        <button className="btn-primary" onClick={() => { setEditingQ(null); setShowEditor(true); }}><Icon name="plus" size={14}/>New Question</button>
      </div>

      {/* Filters */}
      <div style={{ display:"flex", gap:10, marginBottom:18, flexWrap:"wrap" }}>
        <div style={{ display:"flex", gap:8 }}>
          {["all","Mathematics","Physics","Chemistry"].map(f => (
            <button key={f} className={`chip-filter ${filterSubject===f?"active":""}`} onClick={() => { setFilterSubject(f); setFilterTest("all"); }}>{f==="all"?"All Subjects":f}</button>
          ))}
        </div>
      </div>

      <div style={{ display:"flex", gap:10, marginBottom:20, alignItems:"center" }}>
        <label style={{ margin:0, textTransform:"none", letterSpacing:0, fontSize:13, color:T.whiteDim, whiteSpace:"nowrap" }}>Filter by test:</label>
        <select value={filterTest} onChange={e => setFilterTest(e.target.value)} style={{ maxWidth:320 }}>
          <option value="all">All Questions</option>
          {filteredTests.map(t => <option key={t.id} value={t.id}>{t.title} ({t.subject})</option>)}
        </select>
        {filterTest === "all" && (
          <>
            <label style={{ margin:0, textTransform:"none", letterSpacing:0, fontSize:13, color:T.whiteDim, whiteSpace:"nowrap" }}>Assign new to:</label>
            <select value={selectedTest} onChange={e => setSelectedTest(e.target.value)} style={{ maxWidth:320 }}>
              <option value="none">No test (bank only)</option>
              {(tests||[]).map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
            </select>
          </>
        )}
      </div>

      {loading ? <div style={{ textAlign:"center", padding:40 }}><span className="spinner"/></div> :
       (questions||[]).length === 0 ? (
        <div className="empty-state">
          <div style={{ fontSize:40, marginBottom:14, opacity:.5 }}><Icon name="bank" size={40}/></div>
          <h3>No questions yet</h3>
          <p>Create your first question with LaTeX, chemistry symbols, physics notation and image support</p>
          <button className="btn-primary" onClick={() => { setEditingQ(null); setShowEditor(true); }}>Create Question</button>
        </div>
       ) : (
        <div className="col">
          {questions.map((q, idx) => (
            <div key={q.id} className="glass" style={{ padding:20 }}>
              <div style={{ display:"flex", alignItems:"flex-start", gap:14 }}>
                <div style={{ display:"flex", flexDirection:"column", gap:4, flexShrink:0 }}>
                  <button onClick={() => moveQ(q.id,"up",idx)} disabled={idx===0} style={{ background:"none", border:`1px solid ${T.glassBorder}`, borderRadius:6, color:T.whiteDim, cursor:"pointer", padding:"3px 8px", fontSize:12 }}>▲</button>
                  <div style={{ textAlign:"center", fontSize:12, color:T.whiteDim, fontWeight:600 }}>{idx+1}</div>
                  <button onClick={() => moveQ(q.id,"down",idx)} disabled={idx===(questions||[]).length-1} style={{ background:"none", border:`1px solid ${T.glassBorder}`, borderRadius:6, color:T.whiteDim, cursor:"pointer", padding:"3px 8px", fontSize:12 }}>▼</button>
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ display:"flex", gap:8, marginBottom:8, flexWrap:"wrap", alignItems:"center" }}>
                    <span className={`badge ${typeBadge[q.type]||"badge-gray"}`}>{typeLabel[q.type]||q.type}</span>
                    <span className="badge badge-teal">{q.marks} mark{q.marks!==1?"s":""}</span>
                  </div>
                  <div style={{ fontSize:14, lineHeight:1.6 }}><RichText content={q.content}/></div>
                  {q.type === "mcq" && (q.options||[]).filter(o=>o).length > 0 && (
                    <div style={{ marginTop:10, display:"flex", flexDirection:"column", gap:5 }}>
                      {(q.options||[]).filter(o=>o).map((opt, i) => (
                        <div key={i} style={{ display:"flex", gap:8, alignItems:"center", fontSize:13 }}>
                          <span style={{ color: q.correct_answer===String(i)?T.success:T.whiteDim, fontWeight:600, minWidth:20 }}>{q.correct_answer===String(i)?"✓":String.fromCharCode(65+i)}</span>
                          <span style={{ color: q.correct_answer===String(i)?T.success:T.whiteDim }}><RichText content={opt}/></span>
                        </div>
                      ))}
                    </div>
                  )}
                  {q.type === "true_false" && q.correct_answer && (
                    <div style={{ marginTop:8, fontSize:13, color:T.success }}>✓ Answer: {q.correct_answer}</div>
                  )}
                  {q.type === "short" && q.correct_answer && (
                    <div style={{ marginTop:8, fontSize:13, color:T.whiteDim }}>Model answer: {q.correct_answer}</div>
                  )}
                </div>
                <div style={{ display:"flex", gap:7, flexShrink:0 }}>
                  <button className="btn-ghost" style={{ padding:"6px 11px", fontSize:12 }} onClick={() => { setEditingQ(q); setShowEditor(true); }}><Icon name="edit" size={13}/></button>
                  <button className="btn-danger" style={{ padding:"6px 10px" }} onClick={() => deleteQ(q.id)}><Icon name="trash" size={13}/></button>
                </div>
              </div>
            </div>
          ))}
        </div>
       )}

      {showEditor && (
        <QuestionEditor
          testId={filterTest !== "all" ? filterTest : (selectedTest !== "none" ? selectedTest : null)}
          question={editingQ}
          onSave={handleSave}
          onClose={() => { setShowEditor(false); setEditingQ(null); }}
          showToast={showToast}
        />
      )}
    </div>
  );
};

// ─── STUDENT TEST TAKING ──────────────────────────────────────────────────────
const TestTaker = ({ test, token, userEmail, onFinish }) => {
  const { data: questions, loading } = useDB(token, "questions", `?test_id=eq.${test.id}&order=order_index`);
  const [answers, setAnswers] = useState({});
  const [currentQ, setCurrentQ] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [timeLeft, setTimeLeft] = useState(test.time_limit ? test.time_limit * 60 : null);

  // Timer
  useEffect(() => {
    if (!timeLeft) return;
    const t = setInterval(() => setTimeLeft(p => { if (p <= 1) { clearInterval(t); handleSubmit(); return 0; } return p - 1; }), 1000);
    return () => clearInterval(t);
  }, []);

  const handleSubmit = async () => {
    setSubmitting(true);
    const qs = questions || [];
    let score = null;
    let autoScore = 0;
    let totalAutoMarks = 0;

    if (test.marking_mode === "auto" || test.marking_mode === "mixed") {
      qs.forEach(q => {
        if (q.type === "mcq" || q.type === "true_false") {
          totalAutoMarks += q.marks;
          if (answers[q.id] === q.correct_answer) autoScore += q.marks;
        }
      });
      const totalMarks = qs.reduce((s, q) => s + (q.marks||1), 0);
      score = totalAutoMarks > 0 ? Math.round((autoScore / totalMarks) * 100) : null;
    }

    try {
      const t = await sb.from(token, "submissions");
      await t.insert({
        test_id: test.id,
        student_email: userEmail,
        answers: answers,
        score: score,
        status: test.marking_mode === "manual" ? "submitted" : "marked",
        attempt_number: 1,
      });
      setResult({ score, autoScore, totalAutoMarks, questions: qs });
      setSubmitted(true);
    } catch(e) { console.error(e); }
    setSubmitting(false);
  };

  const formatTime = (s) => `${Math.floor(s/60).toString().padStart(2,"0")}:${(s%60).toString().padStart(2,"0")}`;
  const totalMarks = (questions||[]).reduce((s,q) => s+(q.marks||1), 0);
  const answeredCount = Object.keys(answers).length;

  if (loading) return <div style={{ textAlign:"center", padding:60 }}><span className="spinner"/></div>;

  if (submitted) {
    const showScore = test.marking_mode !== "manual" && test.show_results_immediately;
    return (
      <div className="animate-in" style={{ maxWidth:600, margin:"0 auto", padding:"48px 24px", textAlign:"center" }}>
        <div style={{ fontSize:60, marginBottom:16 }}>🎉</div>
        <h2 className="display" style={{ fontSize:26, fontWeight:700, marginBottom:8 }}>Test Submitted!</h2>
        <p style={{ color:T.whiteDim, marginBottom:32 }}>Your answers have been recorded successfully.</p>
        {showScore && result?.score !== null && (
          <div className="glass" style={{ padding:32, marginBottom:28 }}>
            <div style={{ fontSize:60, fontWeight:700, color: result.score>=75?T.success:result.score>=50?T.warning:T.danger, marginBottom:8 }}>{result.score}%</div>
            <div style={{ fontSize:14, color:T.whiteDim }}>Your Score</div>
            <div className="progress-bar" style={{ marginTop:16 }}>
              <div className="progress-fill" style={{ width:`${result.score}%`, background:`linear-gradient(90deg,${result.score>=75?T.success:result.score>=50?T.warning:T.danger},${result.score>=75?T.success:result.score>=50?T.warning:T.danger}99)` }}/>
            </div>
            {/* Show correct/incorrect per MCQ */}
            {result.questions && (
              <div style={{ marginTop:24, textAlign:"left" }}>
                {result.questions.filter(q=>q.type==="mcq"||q.type==="true_false").map(q => (
                  <div key={q.id} style={{ display:"flex", gap:10, alignItems:"flex-start", marginBottom:10, padding:"10px 14px", borderRadius:8, background: answers[q.id]===q.correct_answer?"rgba(34,197,94,.08)":"rgba(239,68,68,.08)", border:`1px solid ${answers[q.id]===q.correct_answer?"rgba(34,197,94,.3)":"rgba(239,68,68,.3)"}` }}>
                    <span style={{ color:answers[q.id]===q.correct_answer?T.success:T.danger, fontWeight:700, fontSize:16, flexShrink:0 }}>{answers[q.id]===q.correct_answer?"✓":"✕"}</span>
                    <div style={{ fontSize:13, flex:1 }}><RichText content={q.content}/></div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {!showScore && (
          <div className="glass" style={{ padding:20, marginBottom:28 }}>
            <p style={{ color:T.whiteDim, fontSize:14 }}>
              {test.marking_mode === "manual" ? "Your tutor will mark your test and release results soon." : "Results will be released by your tutor."}
            </p>
          </div>
        )}
        <button className="btn-primary" onClick={onFinish}>Back to Tests</button>
      </div>
    );
  }

  const q = (questions||[])[currentQ];
  if (!q) return null;

  return (
    <div style={{ maxWidth:760, margin:"0 auto", padding:"0 24px 48px" }}>
      {/* Test header */}
      <div style={{ position:"sticky", top:0, background:T.navy, padding:"16px 0", borderBottom:`1px solid ${T.glassBorder}`, marginBottom:24, zIndex:10 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div>
            <div style={{ fontWeight:600, fontSize:15 }}>{test.title}</div>
            <div style={{ fontSize:12, color:T.whiteDim, marginTop:2 }}>
              Question {currentQ+1} of {(questions||[]).length} · {answeredCount} answered · {totalMarks} marks total
            </div>
          </div>
          <div style={{ display:"flex", gap:12, alignItems:"center" }}>
            {timeLeft !== null && (
              <div style={{ fontFamily:"monospace", fontSize:16, fontWeight:700, color: timeLeft < 300 ? T.danger : T.teal, background:"rgba(0,0,0,.3)", padding:"6px 14px", borderRadius:8 }}>
                ⏱ {formatTime(timeLeft)}
              </div>
            )}
            <button className="btn-primary" onClick={handleSubmit} disabled={submitting} style={{ padding:"8px 18px" }}>
              {submitting ? <span className="spinner"/> : "Submit Test"}
            </button>
          </div>
        </div>
        {/* Progress bar */}
        <div className="progress-bar" style={{ marginTop:12 }}>
          <div className="progress-fill" style={{ width:`${((currentQ+1)/(questions||[]).length)*100}%` }}/>
        </div>
      </div>

      {/* Question */}
      <div className="glass" style={{ padding:28, marginBottom:20 }}>
        <div style={{ display:"flex", gap:10, marginBottom:16, alignItems:"center" }}>
          <span style={{ width:32, height:32, borderRadius:"50%", background:T.tealGlow, border:`1px solid ${T.teal}`, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, fontSize:13, color:T.teal, flexShrink:0 }}>{currentQ+1}</span>
          <div style={{ display:"flex", gap:8 }}>
            <span className="badge badge-teal">{q.marks} mark{q.marks!==1?"s":""}</span>
            {answers[q.id] !== undefined && <span className="badge badge-green">✓ Answered</span>}
          </div>
        </div>
        <div style={{ fontSize:16, lineHeight:1.75, marginBottom:24 }}><RichText content={q.content}/></div>

        {/* MCQ options */}
        {q.type === "mcq" && (
          <div className="col" style={{ gap:10 }}>
            {(q.options||[]).filter(o=>o).map((opt, i) => (
              <div key={i} onClick={() => setAnswers(p => ({ ...p, [q.id]: String(i) }))}
                style={{ display:"flex", alignItems:"center", gap:12, padding:"14px 18px", borderRadius:10, cursor:"pointer", transition:"all .2s",
                  border:`1px solid ${answers[q.id]===String(i)?T.teal:T.glassBorder}`,
                  background:answers[q.id]===String(i)?T.tealGlow:"rgba(255,255,255,.02)" }}>
                <div style={{ width:22, height:22, borderRadius:"50%", border:`2px solid ${answers[q.id]===String(i)?T.teal:T.whiteDim}`, background:answers[q.id]===String(i)?T.teal:"transparent", flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center" }}>
                  {answers[q.id]===String(i) && <div style={{ width:8, height:8, borderRadius:"50%", background:T.navy }}/>}
                </div>
                <span style={{ color:answers[q.id]===String(i)?T.white:T.whiteDim, fontWeight:answers[q.id]===String(i)?500:400 }}><RichText content={opt}/></span>
              </div>
            ))}
          </div>
        )}

        {/* True/False */}
        {q.type === "true_false" && (
          <div style={{ display:"flex", gap:12 }}>
            {["True","False"].map(v => (
              <div key={v} onClick={() => setAnswers(p => ({ ...p, [q.id]: v }))}
                style={{ flex:1, padding:"16px", borderRadius:10, cursor:"pointer", textAlign:"center", fontWeight:600, fontSize:15, transition:"all .2s",
                  border:`1px solid ${answers[q.id]===v?T.teal:T.glassBorder}`,
                  background:answers[q.id]===v?T.tealGlow:"rgba(255,255,255,.02)",
                  color:answers[q.id]===v?T.teal:T.whiteDim }}>
                {v}
              </div>
            ))}
          </div>
        )}

        {/* Short answer */}
        {q.type === "short" && (
          <input placeholder="Type your answer here..." value={answers[q.id]||""} onChange={e => setAnswers(p => ({ ...p, [q.id]: e.target.value }))} style={{ fontSize:15 }}/>
        )}

        {/* Long answer */}
        {q.type === "long" && (
          <textarea rows={8} placeholder="Write your answer here..." value={answers[q.id]||""} onChange={e => setAnswers(p => ({ ...p, [q.id]: e.target.value }))} style={{ fontSize:15, lineHeight:1.7, resize:"vertical" }}/>
        )}
      </div>

      {/* Navigation */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <button className="btn-ghost" onClick={() => setCurrentQ(p => Math.max(0, p-1))} disabled={currentQ===0}>← Previous</button>
        {/* Question dots */}
        <div style={{ display:"flex", gap:6, flexWrap:"wrap", justifyContent:"center", maxWidth:400 }}>
          {(questions||[]).map((_, i) => (
            <button key={i} onClick={() => setCurrentQ(i)} style={{ width:32, height:32, borderRadius:8, border:`1px solid ${i===currentQ?T.teal:answers[_?.id]!==undefined?T.success:T.glassBorder}`, background:i===currentQ?T.tealGlow:answers[_?.id]!==undefined?"rgba(34,197,94,.12)":"transparent", color:i===currentQ?T.teal:answers[_?.id]!==undefined?T.success:T.whiteDim, cursor:"pointer", fontSize:12, fontWeight:600 }}>{i+1}</button>
          ))}
        </div>
        <button className="btn-primary" onClick={() => setCurrentQ(p => Math.min((questions||[]).length-1, p+1))} disabled={currentQ===(questions||[]).length-1}>Next →</button>
      </div>
    </div>
  );
};

// ─── MARKING INTERFACE ────────────────────────────────────────────────────────
const MarkingInterface = ({ test, token, showToast, onClose }) => {
  const { data: submissions, loading, reload } = useDB(token, "submissions", `?test_id=eq.${test.id}&order=submitted_at`);
  const { data: questions } = useDB(token, "questions", `?test_id=eq.${test.id}&order=order_index`);
  const [selected, setSelected] = useState(null);
  const [marks, setMarks] = useState({});
  const [feedback, setFeedback] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (selected) {
      const existingMarks = {};
      (questions||[]).forEach(q => {
        if (selected.answers?.[q.id] !== undefined) existingMarks[q.id] = "";
      });
      setMarks(existingMarks);
      setFeedback(selected.feedback || "");
    }
  }, [selected, questions]);

  const totalMarks = (questions||[]).reduce((s,q) => s+(q.marks||1), 0);

  const handleSaveMark = async () => {
    setSaving(true);
    const totalAwarded = Object.values(marks).reduce((s, v) => s + (Number(v)||0), 0);
    const score = Math.round((totalAwarded / totalMarks) * 100);
    try {
      const t = await sb.from(token, "submissions");
      await t.update({ score, feedback, status:"marked", question_marks: marks }, `?id=eq.${selected.id}`);
      showToast(`Marked: ${score}%`, "success");
      reload();
      setSelected(null);
    } catch(e) { showToast(e.message,"error"); }
    setSaving(false);
  };

  const releaseResults = async (subId) => {
    try {
      const t = await sb.from(token,"submissions");
      await t.update({ status:"released" }, `?id=eq.${subId}`);
      showToast("Results released to student","success");
      reload();
    } catch(e) { showToast(e.message,"error"); }
  };

  return (
    <div style={{ position:"fixed", inset:0, background:T.navy, zIndex:500, overflowY:"auto" }}>
      <div style={{ maxWidth:900, margin:"0 auto", padding:"24px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:28 }}>
          <button className="btn-ghost" onClick={onClose} style={{ padding:"8px 14px", fontSize:13 }}>← Back</button>
          <div>
            <h1 className="display" style={{ fontSize:22, fontWeight:700 }}>Marking: {test.title}</h1>
            <p style={{ color:T.whiteDim, fontSize:13 }}>{(submissions||[]).length} submissions · {(submissions||[]).filter(s=>s.status==="marked"||s.status==="released").length} marked</p>
          </div>
        </div>

        {selected ? (
          <div className="animate-in">
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
              <h2 className="display" style={{ fontSize:18 }}>Marking: {selected.student_email}</h2>
              <button className="btn-ghost" onClick={() => setSelected(null)}>← All Submissions</button>
            </div>
            <div className="col">
              {(questions||[]).map((q, i) => {
                const studentAnswer = selected.answers?.[q.id];
                const isAutoMarkable = q.type==="mcq"||q.type==="true_false";
                const isCorrect = isAutoMarkable && studentAnswer === q.correct_answer;
                return (
                  <div key={q.id} className="glass" style={{ padding:22 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:12 }}>
                      <div style={{ fontWeight:600, fontSize:14 }}>Q{i+1} <span style={{ fontWeight:400, color:T.whiteDim }}>({q.marks} mark{q.marks!==1?"s":""})</span></div>
                      {isAutoMarkable && <span style={{ color:isCorrect?T.success:T.danger, fontWeight:600, fontSize:13 }}>{isCorrect?"✓ Correct":"✕ Incorrect"}</span>}
                    </div>
                    <div style={{ fontSize:14, marginBottom:12, lineHeight:1.6 }}><RichText content={q.content}/></div>
                    <div style={{ padding:"10px 14px", background:"rgba(255,255,255,.04)", borderRadius:8, marginBottom:12 }}>
                      <div style={{ fontSize:11, color:T.whiteDim, marginBottom:4 }}>STUDENT'S ANSWER</div>
                      <div style={{ fontSize:14 }}>{studentAnswer !== undefined ? <RichText content={String(studentAnswer)}/> : <span style={{ color:T.whiteDim }}>No answer provided</span>}</div>
                    </div>
                    {(q.type==="short"||q.type==="long") && q.correct_answer && (
                      <div style={{ padding:"10px 14px", background:"rgba(34,197,94,.06)", borderRadius:8, marginBottom:12, border:"1px solid rgba(34,197,94,.2)" }}>
                        <div style={{ fontSize:11, color:T.success, marginBottom:4 }}>MODEL ANSWER</div>
                        <div style={{ fontSize:13, color:T.whiteDim }}>{q.correct_answer}</div>
                      </div>
                    )}
                    <div style={{ display:"flex", gap:10, alignItems:"center" }}>
                      <label style={{ margin:0, textTransform:"none", letterSpacing:0, fontSize:13, whiteSpace:"nowrap" }}>Marks awarded:</label>
                      <input type="number" min="0" max={q.marks} value={isAutoMarkable ? (isCorrect ? q.marks : 0) : (marks[q.id]||"")}
                        onChange={e => !isAutoMarkable && setMarks(p => ({ ...p, [q.id]: e.target.value }))}
                        readOnly={isAutoMarkable}
                        style={{ width:70, textAlign:"center", opacity:isAutoMarkable?0.6:1 }}/>
                      <span style={{ fontSize:13, color:T.whiteDim }}>/ {q.marks}</span>
                    </div>
                  </div>
                );
              })}
              <div className="input-group">
                <label>Overall Feedback to Student</label>
                <textarea rows={4} placeholder="Write feedback for this student..." value={feedback} onChange={e => setFeedback(e.target.value)}/>
              </div>
              <button className="btn-primary" onClick={handleSaveMark} disabled={saving} style={{ justifyContent:"center" }}>
                {saving ? <span className="spinner"/> : "Save & Mark Complete"}
              </button>
            </div>
          </div>
        ) : (
          loading ? <div style={{ textAlign:"center", padding:40 }}><span className="spinner"/></div> :
          (submissions||[]).length === 0 ? (
            <div className="empty-state"><h3>No submissions yet</h3><p>Students haven't submitted this test yet</p></div>
          ) : (
            <div className="col">
              {submissions.map(sub => (
                <div key={sub.id} className="glass" style={{ padding:20, display:"flex", alignItems:"center", gap:14 }}>
                  <Avatar name={sub.student_email} size={38}/>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:500, marginBottom:4 }}>{sub.student_email}</div>
                    <div style={{ fontSize:12, color:T.whiteDim }}>Submitted: {sub.submitted_at?.split("T")[0]}</div>
                  </div>
                  <div style={{ display:"flex", gap:10, alignItems:"center" }}>
                    {sub.score !== null && <span style={{ fontSize:20, fontWeight:700, color:sub.score>=75?T.success:sub.score>=50?T.warning:T.danger }}>{sub.score}%</span>}
                    <span className={`badge ${sub.status==="released"?"badge-green":sub.status==="marked"?"badge-teal":"badge-orange"}`}>{sub.status}</span>
                    <button className="btn-ghost" style={{ padding:"7px 13px", fontSize:12 }} onClick={() => setSelected(sub)}>
                      {sub.status==="submitted"?"Mark":"Review"}
                    </button>
                    {sub.status==="marked" && (
                      <button className="btn-success" style={{ padding:"7px 13px", fontSize:12 }} onClick={() => releaseResults(sub.id)}>Release</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
};

// ─── STUDENT TESTS LIST ───────────────────────────────────────────────────────
const StudentTestsList = ({ token, userEmail, subject }) => {
  const { data: tests } = useDB(token, "tests", `?subject=eq.${subject}&status=eq.active&order=due_date`);
  const { data: submissions } = useDB(token, "submissions", `?student_email=eq.${encodeURIComponent(userEmail)}`);
  const [takingTest, setTakingTest] = useState(null);
  const [viewingResult, setViewingResult] = useState(null);

  const getSubmission = (testId) => (submissions||[]).find(s => s.test_id === testId);

  if (takingTest) {
    return <TestTaker test={takingTest} token={token} userEmail={userEmail} onFinish={() => setTakingTest(null)}/>;
  }

  return (
    <div>
      <h3 className="display" style={{ fontSize:17, fontWeight:600, marginBottom:18 }}>Tests & Assignments</h3>
      {(tests||[]).length === 0
        ? <div className="empty-state"><h3>No active tests</h3><p>Your tutor hasn't assigned any tests yet</p></div>
        : <div className="col">
          {tests.map(test => {
            const sub = getSubmission(test.id);
            const canTake = !sub || (sub && test.attempts_allowed > 1);
            return (
              <div key={test.id} className="glass" style={{ padding:22 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
                  <div>
                    <div style={{ fontWeight:600, fontSize:15, marginBottom:6 }}>{test.title}</div>
                    <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                      <span style={{ fontSize:12, color:T.whiteDim }}>Due: {test.due_date}</span>
                      <span style={{ fontSize:12, color:T.whiteDim }}>{test.attempts_allowed===99?"Unlimited":test.attempts_allowed} attempt{test.attempts_allowed!==1?"s":""}</span>
                    </div>
                  </div>
                  {sub ? (
                    <div style={{ textAlign:"right" }}>
                      {sub.status==="released" && sub.score !== null && (
                        <div style={{ fontSize:24, fontWeight:700, color:sub.score>=75?T.success:sub.score>=50?T.warning:T.danger }}>{sub.score}%</div>
                      )}
                      <span className={`badge ${sub.status==="released"?"badge-green":sub.status==="marked"?"badge-teal":"badge-orange"}`}>{sub.status==="released"?"Results Released":sub.status==="marked"?"Marked — Pending Release":"Submitted"}</span>
                    </div>
                  ) : null}
                </div>
                {sub?.feedback && sub.status==="released" && (
                  <div style={{ padding:"10px 14px", background:"rgba(0,212,200,.06)", borderRadius:8, marginBottom:12, border:`1px solid ${T.glassBorder}` }}>
                    <div style={{ fontSize:11, color:T.teal, fontWeight:600, marginBottom:4 }}>TUTOR FEEDBACK</div>
                    <p style={{ fontSize:13, color:T.whiteDim, lineHeight:1.6 }}>{sub.feedback}</p>
                  </div>
                )}
                {canTake && (
                  <button className="btn-primary" style={{ padding:"9px 20px", fontSize:13 }} onClick={() => setTakingTest(test)}>
                    {sub ? "Retry Test →" : "Start Test →"}
                  </button>
                )}
                {sub && !canTake && sub.status !== "released" && (
                  <p style={{ fontSize:13, color:T.whiteDim }}>Awaiting results from your tutor.</p>
                )}
              </div>
            );
          })}
        </div>
      }
    </div>
  );
};

// ─── STUDENT GRADES PAGE ──────────────────────────────────────────────────────
const StudentGrades = ({ token, userEmail, subject }) => {
  const { data: submissions } = useDB(token, "submissions",
    `?student_email=eq.${encodeURIComponent(userEmail)}&status=eq.released&order=submitted_at.desc`
  );
  const { data: tests } = useDB(token, "tests", `?subject=eq.${subject}`);

  const getTest = (id) => (tests||[]).find(t => t.id === id);
  const subjectSubs = (submissions||[]).filter(s => { const t = getTest(s.test_id); return t?.subject === subject; });
  const avg = subjectSubs.length > 0 ? Math.round(subjectSubs.reduce((s,x) => s+(x.score||0), 0) / subjectSubs.length) : null;

  return (
    <div>
      <h3 className="display" style={{ fontSize:17, fontWeight:600, marginBottom:18 }}>My Grades</h3>
      {avg !== null && (
        <div className="glass" style={{ padding:22, marginBottom:20, display:"flex", alignItems:"center", gap:20 }}>
          <div style={{ textAlign:"center" }}>
            <div style={{ fontSize:48, fontWeight:700, color:avg>=75?T.success:avg>=50?T.warning:T.danger, lineHeight:1 }}>{avg}%</div>
            <div style={{ fontSize:12, color:T.whiteDim, marginTop:4 }}>Average</div>
          </div>
          <div style={{ flex:1 }}>
            <div className="progress-bar" style={{ height:10 }}>
              <div className="progress-fill" style={{ width:`${avg}%`, background:`linear-gradient(90deg,${avg>=75?T.success:avg>=50?T.warning:T.danger},${avg>=75?T.success:avg>=50?T.warning:T.danger}99)` }}/>
            </div>
            <div style={{ fontSize:12, color:T.whiteDim, marginTop:8 }}>{subjectSubs.length} test{subjectSubs.length!==1?"s":""} completed</div>
          </div>
        </div>
      )}
      {subjectSubs.length === 0
        ? <div className="empty-state"><h3>No grades yet</h3><p>Your results will appear here after your tutor releases them</p></div>
        : <div className="col">
          {subjectSubs.map(sub => {
            const test = getTest(sub.test_id);
            return (
              <div key={sub.id} className="glass" style={{ padding:20, display:"flex", alignItems:"center", gap:14 }}>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:500, marginBottom:4 }}>{test?.title || "Test"}</div>
                  <div style={{ fontSize:12, color:T.whiteDim }}>{sub.submitted_at?.split("T")[0]}</div>
                  {sub.feedback && <div style={{ fontSize:13, color:T.whiteDim, marginTop:6, fontStyle:"italic" }}>"{sub.feedback}"</div>}
                </div>
                <div style={{ textAlign:"right" }}>
                  <div style={{ fontSize:28, fontWeight:700, color:sub.score>=75?T.success:sub.score>=50?T.warning:T.danger }}>{sub.score}%</div>
                </div>
              </div>
            );
          })}
        </div>
      }
    </div>
  );
};
const EvaluationsManager = () => (
  <div className="animate-in">
    <h1 className="display section-title" style={{ marginBottom: 4 }}>Evaluations</h1>
    <p className="section-sub" style={{ marginBottom: 28 }}>Lesson evaluations and feedback forms</p>
    <div className="empty-state">
      <h3>Coming soon</h3>
      <p>This section has not been implemented yet.</p>
    </div>
  </div>
);
const SettingsPage = ({ user }) => (
  <div className="animate-in">
    <h1 className="display section-title" style={{ marginBottom: 4 }}>Settings</h1>
    <p className="section-sub" style={{ marginBottom: 28 }}>Manage your account and platform preferences</p>
    <div className="glass" style={{ padding: 22 }}>
      <div style={{ marginBottom: 12 }}>
        <strong>Name:</strong> {user?.name || "-"}
      </div>
      <div>
        <strong>Email:</strong> {user?.email || "-"}
      </div>
    </div>
  </div>
);
const TutorApp = ({ user, onLogout, onPreview }) => {
  const [active, setActive] = useState("dashboard");
  const [markingTest, setMarkingTest] = useState(null);
  const { toast, show } = useToast();
  const p = { token:user.token, showToast:show, user };

  if (markingTest) {
    return <MarkingInterface test={markingTest} token={user.token} showToast={show} onClose={() => setMarkingTest(null)}/>;
  }

  const pages = {
    dashboard:     <TutorDashboard {...p} onNav={setActive}/>,
    students:      <StudentManagement {...p}/>,
    tests:         <TestsManager {...p} onMark={setMarkingTest}/>,
    materials:     <MaterialsManager {...p}/>,
    analytics:     <Analytics {...p}/>,
    announcements: <AnnouncementsManager {...p}/>,
    schedule:      <ScheduleManager {...p}/>,
    videos:        <VideoLibrary {...p}/>,
    evaluations:   <EvaluationsManager {...p}/>,
    quotes:        <QuotesManager {...p}/>,
    questionbank:  <QuestionBankPage {...p}/>,
    settings:      <SettingsPage {...p}/>,
  };
  return (
    <div style={{ display:"flex", minHeight:"100vh" }}>
      <TutorSidebar active={active} onNav={setActive} onLogout={onLogout} onPreview={onPreview} user={user}/>
      <main style={{ flex:1, padding:"34px 38px", overflowY:"auto", maxWidth:"calc(100vw - 238px)" }}>
        {pages[active] || pages.dashboard}
      </main>
      <Toast toast={toast}/>
    </div>
  );
};

const StudentApp = ({ user, onLogout, token }) => {
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [activeTab, setActiveTab] = useState("schedule");
  const { data:announcements } = useDB(token,"announcements","?order=created_at.desc&limit=6");
  const { data:sessions } = useDB(token,"sessions", selectedSubject?`?subject=eq.${selectedSubject}&order=session_date,session_time`:"", [selectedSubject]);
  const { data:videos } = useDB(token,"videos", selectedSubject?`?subject=eq.${selectedSubject}&order=created_at.desc`:"", [selectedSubject]);
  const subjects = user.subjects || [];
  const today = new Date().toISOString().split("T")[0];

  const renderTab = () => {
    const cfg = SUBJECT_CONFIG[selectedSubject] || SUBJECT_CONFIG.Mathematics;
    switch(activeTab) {
      case "schedule": return (
        <div>
          <h3 className="display" style={{ fontSize:17,fontWeight:600,marginBottom:18 }}>Upcoming Sessions</h3>
          {(sessions||[]).filter(s=>s.session_date>=today).length===0
            ?<div className="empty-state"><h3>No upcoming sessions</h3><p>Your tutor hasn't scheduled any sessions yet</p></div>
            :(sessions||[]).filter(s=>s.session_date>=today).map(s=>(
              <div key={s.id} className="glass" style={{ padding:18,marginBottom:10,display:"flex",gap:14,alignItems:"center",borderLeft:`3px solid ${cfg.color}` }}>
                <div style={{ textAlign:"center",minWidth:50 }}>
                  <div style={{ fontSize:22,fontWeight:700,color:cfg.color,lineHeight:1 }}>{s.session_date?.split("-")[2]}</div>
                  <div style={{ fontSize:10,color:T.whiteDim,textTransform:"uppercase" }}>{new Date(s.session_date+"T12:00").toLocaleString("default",{month:"short"})}</div>
                </div>
                <div style={{ width:1,height:34,background:T.glassBorder }}/>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:500,marginBottom:3 }}>{s.title}</div>
                  <div style={{ fontSize:12,color:T.whiteDim }}>⏰ {s.session_time}</div>
                </div>
                {s.teams_link&&<a href={s.teams_link} target="_blank" rel="noreferrer" className="btn-primary" style={{ textDecoration:"none",fontSize:13,padding:"8px 14px",display:"inline-flex",alignItems:"center",gap:6 }}><Icon name="teams" size={13}/>Join</a>}
              </div>
            ))}
        </div>
      );
      case "materials": return (<div><h3 className="display" style={{ fontSize:17,fontWeight:600,marginBottom:18 }}>Study Materials</h3><div className="empty-state"><h3>No materials yet</h3><p>Your tutor will upload materials here</p></div></div>);
      case "grades":    return <StudentGrades token={token} userEmail={user.email} subject={selectedSubject}/>;
      case "tests":     return <StudentTestsList token={token} userEmail={user.email} subject={selectedSubject}/>;
      case "videos":    return (
        <div>
          <h3 className="display" style={{ fontSize:17,fontWeight:600,marginBottom:18 }}>Recorded Lessons</h3>
          {(videos||[]).length===0
            ?<div className="empty-state"><h3>No recordings yet</h3><p>Recorded lessons will appear here</p></div>
            :videos.map(v=>(
              <div key={v.id} className="glass" style={{ padding:18,marginBottom:10,display:"flex",gap:14,alignItems:"center" }}>
                <div style={{ color:cfg.color }}><Icon name="video" size={22}/></div>
                <div style={{ flex:1 }}><div style={{ fontWeight:500 }}>{v.title}</div><div style={{ fontSize:12,color:T.whiteDim }}>{v.session_date}{v.duration&&` · ${v.duration}`}</div></div>
                <a href={v.link} target="_blank" rel="noreferrer" className="btn-ghost" style={{ textDecoration:"none",fontSize:13,padding:"7px 14px" }}>Watch →</a>
              </div>
            ))}
        </div>
      );
      case "evaluations": return (<div><h3 className="display" style={{ fontSize:17,fontWeight:600,marginBottom:18 }}>Lesson Evaluations</h3><div className="empty-state"><h3>No evaluations open</h3><p>Your tutor will post evaluations after lessons</p></div></div>);
      default: return <div style={{ color:T.whiteDim }}>Coming soon</div>;
    }
  };

  return (
    <div style={{ minHeight:"100vh" }}>
      <div style={{ height:58,background:T.navyMid,borderBottom:`1px solid ${T.glassBorder}`,display:"flex",alignItems:"center",padding:"0 24px",gap:14 }}>
        <Icon name="logo" size={20}/>
        <span className="display" style={{ fontSize:17,fontWeight:700 }}>Prove<span style={{ color:T.teal }}>It!</span></span>
        {selectedSubject&&<button onClick={()=>{setSelectedSubject(null);setActiveTab("schedule");}} className="btn-ghost" style={{ padding:"5px 13px",fontSize:12,marginLeft:6 }}>← Subjects</button>}
        <div style={{ flex:1 }}/>
        <Avatar name={user.name} size={30}/>
        <span style={{ fontSize:13,fontWeight:500 }}>{user.name}</span>
        <button onClick={onLogout} className="btn-ghost" style={{ padding:"5px 11px",fontSize:12 }}><Icon name="logout" size={13}/>Sign Out</button>
      </div>

      {!selectedSubject ? (
        <div style={{ padding:"44px 38px" }} className="animate-in">
          <h1 className="display" style={{ fontSize:27,fontWeight:700,marginBottom:4 }}>Welcome back, {user.name?.split(" ")[0]} 👋</h1>
          <p style={{ color:T.whiteDim,marginBottom:36 }}>Select a subject to get started</p>
          {subjects.length===0
            ?<div className="empty-state"><h3>No subjects yet</h3><p>Your tutor hasn't enrolled you in any subjects yet.</p></div>
            :(
              <div style={{ display:"flex",gap:18,flexWrap:"wrap",marginBottom:44 }}>
                {subjects.map(subject=>{
                  const cfg=SUBJECT_CONFIG[subject];
                  return (
                    <div key={subject} onClick={()=>setSelectedSubject(subject)}
                      style={{ width:270,padding:30,borderRadius:20,cursor:"pointer",background:cfg.bg,border:`1px solid ${cfg.border}`,transition:"all .25s" }}
                      onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-4px)";e.currentTarget.style.boxShadow=`0 18px 36px ${cfg.bg}`;}}
                      onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="none";}}>
                      <div style={{ fontSize:38,marginBottom:16 }}>{cfg.emoji}</div>
                      <h2 className="display" style={{ fontSize:21,fontWeight:700,color:cfg.color,marginBottom:10 }}>{subject}</h2>
                      <div style={{ display:"flex",gap:6,flexWrap:"wrap" }}>
                        {DEFAULT_TABS.slice(0,4).map(t=><span key={t.id} style={{ fontSize:10,color:cfg.color,opacity:.7,background:`${cfg.color}15`,padding:"3px 8px",borderRadius:4 }}>{t.label}</span>)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          {(announcements||[]).length>0&&(
            <div>
              <h3 className="display" style={{ fontSize:15,fontWeight:600,marginBottom:14 }}>Latest Announcements</h3>
              <div className="col">
                {announcements.filter(a=>a.subject==="all"||(user.subjects||[]).includes(a.subject)).slice(0,3).map(a=>(
                  <div key={a.id} className="glass" style={{ padding:18,borderLeft:`3px solid ${a.subject==="all"?T.teal:SUBJECT_CONFIG[a.subject]?.color||T.teal}` }}>
                    {a.pinned&&<span style={{ fontSize:11,color:T.accent,fontWeight:600,display:"block",marginBottom:4 }}>📌 PINNED</span>}
                    <div style={{ fontWeight:500,marginBottom:4 }}>{a.title}</div>
                    <p style={{ fontSize:13,color:T.whiteDim,lineHeight:1.6 }}>{a.body}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="animate-in">
          <div style={{ padding:"22px 28px 0",borderBottom:`1px solid ${T.glassBorder}` }}>
            <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:16 }}>
              <span style={{ fontSize:30 }}>{SUBJECT_CONFIG[selectedSubject].emoji}</span>
              <h2 className="display" style={{ fontSize:22,fontWeight:700,color:SUBJECT_CONFIG[selectedSubject].color }}>{selectedSubject}</h2>
            </div>
            <div style={{ display:"flex",gap:2,overflowX:"auto",borderBottom:`1px solid ${T.glassBorder}` }}>
              {DEFAULT_TABS.map(tab=>{
                const cfg=SUBJECT_CONFIG[selectedSubject];
                const isActive=activeTab===tab.id;
                return (
                  <button key={tab.id} className="tab-btn" onClick={()=>setActiveTab(tab.id)}
                    style={{ background:isActive?cfg.bg:"transparent",color:isActive?cfg.color:T.whiteDim,borderColor:isActive?cfg.color:"transparent",borderBottomColor:"transparent",marginBottom:isActive?"-1px":"0" }}>
                    <Icon name={tab.icon} size={13}/>{tab.label}
                  </button>
                );
              })}
            </div>
          </div>
          <div style={{ padding:"26px 28px" }}>{renderTab()}</div>
        </div>
      )}
    </div>
  );
};

export default function App() {
  const [screen, setScreen] = useState("landing");
  const [role, setRole] = useState(null);
  const [user, setUser] = useState(null);
  const [showQuote, setShowQuote] = useState(false);
  const [activeQuote, setActiveQuote] = useState(null);
  const [previewMode, setPreviewMode] = useState(false);
  const { toast, show } = useToast();

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("proveit_user");
      if (saved) { const u=JSON.parse(saved); setUser(u); setScreen("app"); }
    } catch(e) {}
  }, []);

  const handleLogin = async (userData) => {
    try { sessionStorage.setItem("proveit_user", JSON.stringify(userData)); } catch(e) {}
    setUser(userData);
    if (userData.role==="student") {
      try {
        const t=await sb.from(userData.token,"quotes");
        const qs=await t.select("?active=eq.true&limit=1");
        if(qs?.length>0){ setActiveQuote(qs[0]); setShowQuote(true); }
      } catch(e) {}
    }
    setScreen("app");
  };

  const handleLogout = async () => {
    if(user?.token){ try { await sb.signOut(user.token); } catch(e){} }
    try { sessionStorage.removeItem("proveit_user"); } catch(e) {}
    setUser(null); setRole(null); setScreen("landing"); setPreviewMode(false); setShowQuote(false); setActiveQuote(null);
  };

  return (
    <>
      <GlobalStyles/>
      {showQuote&&activeQuote&&<QuoteSplash quote={{ text:activeQuote.text, author:activeQuote.author, bg:activeQuote.bg_color, textColor:activeQuote.text_color }} onDismiss={()=>setShowQuote(false)}/>}
      {screen==="landing"&&<LandingPage onSelect={r=>{setRole(r);setScreen("login");}}/>}
      {screen==="login"&&<LoginForm role={role} onLogin={handleLogin} onBack={()=>setScreen("landing")} showToast={show}/>}
      {screen==="app"&&!showQuote&&user&&(
        previewMode?(
          <div>
            <div style={{ position:"fixed",top:0,left:0,right:0,zIndex:999,background:T.accent,padding:"9px 22px",display:"flex",alignItems:"center",gap:11,fontSize:13,fontWeight:600,color:T.navy }}>
              <Icon name="eye" size={15}/>STUDENT PREVIEW — viewing as a student
              <div style={{ flex:1 }}/>
              <button onClick={()=>setPreviewMode(false)} style={{ background:T.navy,color:T.white,border:"none",borderRadius:6,padding:"4px 14px",cursor:"pointer",fontSize:12 }}>Exit Preview</button>
            </div>
            <div style={{ paddingTop:40 }}>
              <StudentApp user={{...user,name:"Sample Student",subjects:["Mathematics","Physics","Chemistry"]}} onLogout={handleLogout} token={user.token}/>
            </div>
          </div>
        ):user.role==="tutor"?(
          <TutorApp user={user} onLogout={handleLogout} onPreview={()=>setPreviewMode(true)}/>
        ):(
          <StudentApp user={user} onLogout={handleLogout} token={user.token}/>
        )
      )}
      <Toast toast={toast}/>
    </>
  );
}
