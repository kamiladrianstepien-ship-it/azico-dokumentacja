'use client';
import { useState, useRef, useEffect } from "react";

const STEPS = [
  { id: 0, label: "Zalaczniki" },
  { id: 1, label: "Sprawdz dane" },
  { id: 2, label: "Zakres prac" },
  { id: 3, label: "Podsumowanie" },
];

const SCOPE_OPTIONS = [
  { id: "ssp", label: "SSP", full: "System Sygnalizacji Pozarowej", icon: "🔔" },
  { id: "stolarka", label: "Stolarka pozarowa", full: "Drzwi i bramy przeciwpozarowe", icon: "🚪" },
  { id: "przejscia", label: "Przejscia pozarowe", full: "Zabezpieczenia przejsc instalacyjnych", icon: "🧱" },
  { id: "oddzielenia", label: "Oddzielenia pozarowe", full: "Sciany i stropy oddzielenia", icon: "🏗️" },
  { id: "klapy", label: "Klapy pozarowe", full: "Klapy odcinajace w instalacjach", icon: "💨" },
  { id: "obudowy", label: "Obudowy kanalow", full: "Obudowy kanalow wentylacyjnych", icon: "📦" },
  { id: "tryskacze", label: "Tryskacze", full: "Instalacja tryskaczowa", icon: "💧" },
  { id: "hydranty", label: "Hydranty", full: "Instalacja hydrantowa", icon: "🧯" },
  { id: "oddymianie", label: "Oddymianie", full: "System oddymiania i wentylacji", icon: "🌫️" },
  { id: "oswietlenie", label: "Oswietlenie ewak.", full: "Oswietlenie awaryjne i ewakuacyjne", icon: "💡" },
  { id: "dso", label: "DSO", full: "Dzwiekowy System Ostrzegawczy", icon: "🔊" },
  { id: "gaszenie", label: "Gaszenie gazem", full: "Stale urzadzenia gasnicze gazowe", icon: "🧪" },
];

const MOCK_EXTRACTED = [
  { key: "nazwaInwestycji", label: "Nazwa inwestycji", value: "Budowa budynku biurowo-uslugowego Nowa Wola Park", source: "Projekt_SSP.pdf", confirmed: false },
  { key: "adres", label: "Adres budowy", value: "ul. Sielska 17, 60-129 Poznan", source: "Projekt_SSP.pdf", confirmed: false },
  { key: "inwestor", label: "Inwestor", value: "Nowa Wola Park Sp. z o.o.", source: "Projekt_SSP.pdf", confirmed: false },
  { key: "generalnyWykonawca", label: "Generalny wykonawca", value: "Budimex S.A.", source: "Umowa_AZ-2025.pdf", confirmed: false },
  { key: "numerUmowy", label: "Numer umowy", value: "AZ/2025/0394", source: "Umowa_AZ-2025.pdf", confirmed: false },
  { key: "dataRozpoczecia", label: "Data rozpoczecia", value: "2025-01-15", source: "Umowa_AZ-2025.pdf", confirmed: false },
  { key: "dataZakonczenia", label: "Data zakonczenia", value: "2025-08-30", source: "Umowa_AZ-2025.pdf", confirmed: false },
  { key: "systemSSP", label: "System SSP", value: "Bosch FPA-5000", source: "Projekt_SSP.pdf", confirmed: false },
  { key: "systemPrzejscia", label: "System przejsc poz.", value: "Hilti CFS-S ACR", source: "Projekt_przejscia.pdf", confirmed: false },
  { key: "klasyfikacja", label: "Klasyfikacja ogniowa", value: "EI60 / EI120", source: "Projekt_przejscia.pdf", confirmed: false },
  { key: "atest1", label: "Atest / Certyfikat", value: "ITB-0456/2024 (Hilti)", source: "Certyfikat_Hilti.pdf", confirmed: false },
  { key: "atest2", label: "Atest / Certyfikat", value: "Nr 23/CJ/2023 (Bosch)", source: "Certyfikat_Bosch.pdf", confirmed: false },
];

function getTimeNow() {
  return new Date().toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" });
}

export default function AzicoApp({ onLogout }) {
  const [step, setStep] = useState(0);
  const [files, setFiles] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzeProgress, setAnalyzeProgress] = useState(0);
  const [extracted, setExtracted] = useState([]);
  const [selectedScope, setSelectedScope] = useState([]);
  const [suggestedScope] = useState(["ssp", "przejscia"]);
  const [chatMessages, setChatMessages] = useState([
    { role: "ai", text: "Witaj! Jestem asystentem dokumentacji Azico.\n\nWgraj pliki z komputera lub Google Drive, a nastepnie kliknij \"Analizuj\". Wyciagne z nich wszystkie potrzebne dane.\n\nMozesz tez napisac mi pytanie w kazdej chwili.", time: getTimeNow() },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [genStep, setGenStep] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const chatEndRef = useRef(null);
  const fileRef = useRef(null);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chatMessages]);

  const addAi = (text) => setChatMessages((m) => [...m, { role: "ai", text, time: getTimeNow() }]);

  const handleFiles = (e) => {
    const nf = Array.from(e.target.files || []).map((f) => ({ name: f.name, size: (f.size/1024/1024).toFixed(1)+" MB", status: "ready" }));
    setFiles((p) => [...p, ...nf]);
    addAi("Przyjalem: " + nf.map((f) => f.name).join(", ") + ".\n\nKliknij \"Analizuj pliki\" gdy wgrasz wszystkie dokumenty.");
  };

  const handleGoogleDrive = () => { addAi("Otwieram Google Drive... Wybierz folder lub pliki.\n\n(W produkcyjnej wersji otworzy sie Google Picker.)"); };
  const removeFile = (i) => setFiles((p) => p.filter((_, idx) => idx !== i));

  const handleAnalyze = () => {
    if (!files.length) return;
    setIsAnalyzing(true); setAnalyzeProgress(0);
    setFiles((f) => f.map((x) => ({ ...x, status: "analyzing" })));
    let p = 0;
    const iv = setInterval(() => {
      p += Math.random()*15+5;
      if (p >= 100) { p=100; clearInterval(iv); setTimeout(() => {
        setIsAnalyzing(false);
        setFiles((f) => f.map((x) => ({ ...x, status: "analyzed" })));
        setExtracted(MOCK_EXTRACTED.map((x) => ({ ...x })));
        setStep(1);
        addAi("Analiza zakonczona. Znalazlem " + MOCK_EXTRACTED.length + " pol danych.\n\nSprawdz i potwierdz dane, a potem wybierz zakres prac.");
      }, 400); }
      setAnalyzeProgress(Math.min(p, 100));
    }, 300);
  };

  const toggleConfirm = (i) => { setExtracted((p) => { const n=[...p]; n[i]={...n[i], confirmed:!n[i].confirmed}; return n; }); };
  const confirmAll = () => { const all = extracted.every((x)=>x.confirmed); setExtracted((p) => p.map((x) => ({...x, confirmed:!all}))); };
  const editField = (i, v) => { setExtracted((p) => { const n=[...p]; n[i]={...n[i], value:v, confirmed:true, source:"Reczna edycja"}; return n; }); };
  const allFieldsConfirmed = extracted.length > 0 && extracted.every((f) => f.confirmed);

  const toggleScope = (id) => { setSelectedScope((p) => p.includes(id) ? p.filter((s) => s !== id) : [...p, id]); };
  const applySuggested = () => { setSelectedScope((p) => [...new Set([...p, ...suggestedScope])]); };

  const handleChat = () => {
    if (!chatInput.trim()) return;
    const msg = chatInput.trim();
    setChatMessages((m) => [...m, { role: "user", text: msg, time: getTimeNow() }]);
    setChatInput("");
    setTimeout(() => {
      const l = msg.toLowerCase();
      let r = "Rozumiem, uwzglednie to w dokumentacji.";
      if (l.includes("hilti")||l.includes("promat")||l.includes("zamien")) r = "Rozumiem. Podmienie system i atesty we wszystkich protokolach.";
      else if (l.includes("termin")||l.includes("data")||l.includes("pilne")) r = "Przyjmuje. Zaktualizuje daty w dokumentacji.";
      else if (l.includes("atest")||l.includes("certyfikat")) r = "Dodam do zestawienia. Masz plik do wgrania?";
      else if (l.includes("pomoc")||l.includes("jak")||l.includes("co rob")) r = "1. Wgraj pliki\n2. Kliknij Analizuj\n3. Sprawdz dane\n4. Wybierz protokoly\n5. Generuj";
      else if (l.includes("ei")) r = "Zanotowlem klasyfikacje. Sprawdze zgodnosc z atestami.";
      addAi(r);
    }, 600);
  };

  const GEN_STEPS = ["Przygotowuje szablony...","Wypelniam dane budowy...","Generuje protokoly ("+selectedScope.length+")...","Tworze zestawienie atestow...","Skladam spis tresci...","Kompletuje dokumentacje...","Zapisuje na Google Drive..."];

  const handleGenerate = () => {
    if (!selectedScope.length) { addAi("Zaznacz przynajmniej jeden zakres prac."); return; }
    if (!allFieldsConfirmed) { addAi("Potwierdz najpierw wszystkie dane w kroku 2."); setStep(1); return; }
    setIsGenerating(true); setGenStep(0);
    GEN_STEPS.forEach((_, i) => setTimeout(() => setGenStep(i+1), (i+1)*900));
    setTimeout(() => {
      setIsGenerating(false); setShowSuccess(true);
      const names = selectedScope.map((s) => SCOPE_OPTIONS.find((o) => o.id === s)?.label).join(", ");
      const bn = extracted.find((e) => e.key === "nazwaInwestycji")?.value || "Nowa budowa";
      addAi("Dokumentacja gotowa!\n\n" + selectedScope.length + " protokolow: " + names + ".\n\nPliki: Azico / Dokumentacja / " + bn);
    }, GEN_STEPS.length * 900 + 600);
  };

  const S = 15; // base font size

  return (
    <div style={{ minHeight:"100vh", background:"#0b0e14", fontFamily:"'DM Sans',system-ui,sans-serif", color:"#e2e8f0", fontSize:S }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:4px} ::-webkit-scrollbar-track{background:transparent} ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.08);border-radius:10px}
        @keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.5)}}
        .fi{animation:fadeIn .25s ease-out} .pd{animation:pulse 1s infinite}
        input[type="file"]{display:none}
      `}</style>

      {/* HEADER */}
      <header style={{ borderBottom:"1px solid rgba(255,255,255,0.06)", padding:"16px 24px", display:"flex", alignItems:"center", justifyContent:"center", background:"linear-gradient(180deg, rgba(200,30,30,0.08) 0%, transparent 100%)", position:"relative" }}>
        <div style={{ display:"flex", alignItems:"center", gap:18 }}>
          {/* AZICO.PL SVG Logo */}
          <svg viewBox="0 0 280 60" height="36" xmlns="http://www.w3.org/2000/svg">
            <rect x="4" y="14" width="22" height="38" rx="2" fill="#dc2626"/>
            <rect x="7" y="17" width="4" height="5" rx=".5" fill="#0b0e14" opacity=".3"/>
            <rect x="13" y="17" width="4" height="5" rx=".5" fill="#0b0e14" opacity=".3"/>
            <rect x="19" y="17" width="4" height="5" rx=".5" fill="#0b0e14" opacity=".3"/>
            <rect x="7" y="25" width="4" height="5" rx=".5" fill="#0b0e14" opacity=".3"/>
            <rect x="13" y="25" width="4" height="5" rx=".5" fill="#0b0e14" opacity=".3"/>
            <rect x="19" y="25" width="4" height="5" rx=".5" fill="#0b0e14" opacity=".3"/>
            <rect x="7" y="33" width="4" height="5" rx=".5" fill="#0b0e14" opacity=".3"/>
            <rect x="13" y="33" width="4" height="5" rx=".5" fill="#0b0e14" opacity=".3"/>
            <rect x="19" y="33" width="4" height="5" rx=".5" fill="#0b0e14" opacity=".3"/>
            <rect x="7" y="41" width="4" height="5" rx=".5" fill="#0b0e14" opacity=".3"/>
            <rect x="13" y="41" width="4" height="5" rx=".5" fill="#0b0e14" opacity=".3"/>
            <rect x="19" y="41" width="4" height="5" rx=".5" fill="#0b0e14" opacity=".3"/>
            <path d="M15 14L15 8Q15 5 18 5L22 5" stroke="#aaa" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
            <circle cx="15" cy="8" r="2.2" fill="#dc2626"/><circle cx="15" cy="8" r="1" fill="#fff" opacity=".4"/>
            <ellipse cx="15" cy="53" rx="15" ry="3" fill="#dc2626" opacity=".5"/>
            <text x="38" y="44" fontFamily="Arial Black,Arial,sans-serif" fontWeight="900" fontSize="40" fill="#dc2626" letterSpacing="1">AZICO</text>
            <text x="210" y="44" fontFamily="Arial Black,Arial,sans-serif" fontWeight="900" fontSize="40" fill="#dc2626">.PL</text>
          </svg>
          <div style={{ height:30, width:1, background:"rgba(255,255,255,0.1)" }}/>
          <div style={{ fontWeight:700, fontSize:20, letterSpacing:"0.04em", textTransform:"uppercase" }}>Dokumentacja powykonawcza</div>
        </div>
        <div style={{ position:"absolute", right:24, display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ width:7,height:7,borderRadius:"50%",background:"#22c55e",boxShadow:"0 0 6px rgba(34,197,94,.5)" }}/>
          <span style={{ fontSize:12, color:"rgba(255,255,255,.35)" }}>AI Online</span>
          <span style={{color:"rgba(255,255,255,.1)"}}>|</span>
          <button onClick={onLogout} style={{background:"none",border:"none",color:"rgba(255,255,255,.25)",fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>Wyloguj</button>
        </div>
      </header>

      <div style={{ display:"flex", height:"calc(100vh - 69px)", overflow:"hidden" }}>
        {/* LEFT */}
        <div style={{ flex:"1 1 58%", display:"flex", flexDirection:"column", borderRight:"1px solid rgba(255,255,255,.05)", overflow:"hidden" }}>
          {/* Steps */}
          <div style={{ display:"flex", padding:"14px 24px", borderBottom:"1px solid rgba(255,255,255,.05)", background:"rgba(255,255,255,.01)" }}>
            {STEPS.map((s,i) => (
              <div key={s.id} style={{ display:"flex", alignItems:"center", flex:1 }}>
                <button onClick={() => { if(i<=step||(i===1&&extracted.length>0)) setStep(i); }} style={{
                  display:"flex", alignItems:"center", gap:8, padding:"8px 16px", borderRadius:8, border:"none",
                  background: step===i ? "rgba(200,30,30,.12)" : "transparent",
                  color: step===i ? "#ef4444" : i<=step ? "rgba(255,255,255,.6)" : "rgba(255,255,255,.2)",
                  cursor: i<=step||(i===1&&extracted.length>0)?"pointer":"default",
                  fontSize:14, fontWeight:step===i?600:400, fontFamily:"inherit", transition:"all .2s",
                }}>
                  <span style={{ width:26,height:26,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,
                    background: i<step?"#22c55e":step===i?"#ef4444":"rgba(255,255,255,.08)", color:i<=step?"white":"rgba(255,255,255,.3)" }}>
                    {i<step?"✓":i+1}
                  </span>
                  {s.label}
                </button>
                {i<STEPS.length-1 && <div style={{ flex:1,height:1,background:i<step?"rgba(34,197,94,.3)":"rgba(255,255,255,.06)",margin:"0 4px" }}/>}
              </div>
            ))}
          </div>

          {/* Content */}
          <div style={{ flex:1, overflow:"auto", padding:24 }}>
            {step===0 && (
              <div className="fi">
                <p style={{ fontSize:S, color:"rgba(255,255,255,.4)", marginBottom:18 }}>Wgraj dokumenty zrodlowe - projekty, atesty, certyfikaty, umowy.</p>
                <div onClick={() => fileRef.current?.click()} style={{ border:"2px dashed rgba(255,255,255,.1)", borderRadius:16, padding:"40px 24px", textAlign:"center", cursor:"pointer", transition:"all .2s", marginBottom:12 }}
                  onMouseEnter={(e)=>{e.currentTarget.style.borderColor="rgba(239,68,68,.3)";e.currentTarget.style.background="rgba(239,68,68,.02)"}}
                  onMouseLeave={(e)=>{e.currentTarget.style.borderColor="rgba(255,255,255,.1)";e.currentTarget.style.background="transparent"}}>
                  <input ref={fileRef} type="file" multiple accept=".pdf,.docx,.doc,.jpg,.jpeg,.png" onChange={handleFiles}/>
                  <div style={{ fontSize:40,marginBottom:10 }}>📂</div>
                  <div style={{ fontSize:16,color:"rgba(255,255,255,.5)",fontWeight:500 }}>Kliknij aby dodac pliki z komputera</div>
                  <div style={{ fontSize:13,color:"rgba(255,255,255,.2)",marginTop:4 }}>lub przeciagnij i upusc - PDF, DOCX, JPG</div>
                </div>
                <button onClick={handleGoogleDrive} style={{ width:"100%",padding:"14px 16px",marginBottom:18,background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.08)",borderRadius:12,color:"rgba(255,255,255,.6)",fontSize:14,fontWeight:500,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:10,transition:"all .2s" }}
                  onMouseEnter={(e)=>{e.currentTarget.style.borderColor="rgba(66,133,244,.4)";e.currentTarget.style.background="rgba(66,133,244,.05)"}}
                  onMouseLeave={(e)=>{e.currentTarget.style.borderColor="rgba(255,255,255,.08)";e.currentTarget.style.background="rgba(255,255,255,.03)"}}>
                  <svg width="20" height="18" viewBox="0 0 24 22"><path d="M4.4 22l3-5.2H22l-3 5.2H4.4z" fill="#3777E3"/><path d="M15 10L11 3l3-3h6l-3 4.5L15 10z" fill="#FFCF63"/><path d="M2 16.8L5.5 10h7L9 16.8H2z" fill="#11A861"/></svg>
                  Importuj z Google Drive
                </button>
                {files.map((f,i)=>(
                  <div key={i} className="fi" style={{ display:"flex",alignItems:"center",gap:12,padding:"12px 16px",background:"rgba(255,255,255,.02)",border:"1px solid rgba(255,255,255,.05)",borderRadius:10,marginBottom:6 }}>
                    <span style={{fontSize:20}}>📄</span>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:14,fontWeight:500,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{f.name}</div>
                      <div style={{fontSize:12,color:"rgba(255,255,255,.25)"}}>{f.size}</div>
                    </div>
                    <span style={{fontSize:12,fontWeight:500,color:f.status==="analyzed"?"#22c55e":f.status==="analyzing"?"#f59e0b":"rgba(255,255,255,.3)"}}>
                      {f.status==="analyzed"?"✓ Gotowy":f.status==="analyzing"?"Analizuje...":"Wgrany"}
                    </span>
                    <button onClick={()=>removeFile(i)} style={{background:"none",border:"none",color:"rgba(255,255,255,.15)",cursor:"pointer",fontSize:16,fontFamily:"inherit"}}>✕</button>
                  </div>
                ))}
                {files.length>0&&!isAnalyzing&&!extracted.length&&(
                  <button onClick={handleAnalyze} style={{ width:"100%",marginTop:16,padding:"16px",background:"linear-gradient(135deg,#dc2626,#b91c1c)",border:"none",borderRadius:12,color:"white",fontSize:15,fontWeight:600,cursor:"pointer",boxShadow:"0 4px 20px rgba(220,38,38,.25)",fontFamily:"inherit" }}>
                    🔍 Analizuj pliki
                  </button>
                )}
                {isAnalyzing&&(
                  <div style={{marginTop:16}}>
                    <div style={{display:"flex",justifyContent:"space-between",fontSize:13,color:"rgba(255,255,255,.4)",marginBottom:6}}>
                      <span>Analizuje dokumenty...</span><span>{Math.round(analyzeProgress)}%</span>
                    </div>
                    <div style={{height:5,background:"rgba(255,255,255,.06)",borderRadius:3,overflow:"hidden"}}>
                      <div style={{height:"100%",width:analyzeProgress+"%",background:"linear-gradient(90deg,#dc2626,#ef4444)",borderRadius:3,transition:"width .3s"}}/>
                    </div>
                  </div>
                )}
              </div>
            )}

            {step===1&&(
              <div className="fi">
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
                  <p style={{fontSize:S,color:"rgba(255,255,255,.4)"}}>Sprawdz wyciagniete dane. Potwierdz lub edytuj.</p>
                  <button onClick={confirmAll} style={{ padding:"8px 16px", background:allFieldsConfirmed?"rgba(239,68,68,.1)":"rgba(34,197,94,.1)", border:"1px solid "+(allFieldsConfirmed?"rgba(239,68,68,.25)":"rgba(34,197,94,.25)"), borderRadius:8, color:allFieldsConfirmed?"#ef4444":"#22c55e", fontSize:13,fontWeight:500,cursor:"pointer",fontFamily:"inherit",whiteSpace:"nowrap" }}>
                    {allFieldsConfirmed?"✕ Odznacz wszystko":"✓ Potwierdz wszystko"}
                  </button>
                </div>
                {extracted.map((f,i)=>(
                  <div key={i} className="fi" style={{ display:"flex",alignItems:"center",gap:12,padding:"12px 16px",
                    background:f.confirmed?"rgba(34,197,94,.03)":"rgba(255,255,255,.02)",
                    border:"1px solid "+(f.confirmed?"rgba(34,197,94,.15)":"rgba(255,255,255,.05)"),
                    borderRadius:10,marginBottom:6,transition:"all .2s" }}>
                    <div style={{width:120,fontSize:13,color:"rgba(255,255,255,.4)",fontWeight:500,flexShrink:0}}>{f.label}</div>
                    <input value={f.value} onChange={(e)=>editField(i,e.target.value)} style={{ flex:1,padding:"6px 10px",background:"transparent",border:"1px solid transparent",borderRadius:6,color:"white",fontSize:S,outline:"none",fontFamily:"inherit" }}
                      onFocus={(e)=>{e.target.style.borderColor="rgba(239,68,68,.3)";e.target.style.background="rgba(255,255,255,.03)"}}
                      onBlur={(e)=>{e.target.style.borderColor="transparent";e.target.style.background="transparent"}}/>
                    <div style={{fontSize:11,color:"rgba(255,255,255,.2)",width:95,textAlign:"right",flexShrink:0}}>{f.source}</div>
                    <button onClick={()=>toggleConfirm(i)} style={{ width:30,height:30,borderRadius:7,
                      border:"1px solid "+(f.confirmed?"rgba(34,197,94,.4)":"rgba(255,255,255,.1)"),
                      background:f.confirmed?"rgba(34,197,94,.15)":"transparent",
                      color:f.confirmed?"#22c55e":"rgba(255,255,255,.2)",
                      cursor:"pointer",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"inherit",transition:"all .15s",flexShrink:0 }}>✓</button>
                  </div>
                ))}
                {allFieldsConfirmed&&<div className="fi" style={{marginTop:18,padding:"14px 18px",background:"rgba(34,197,94,.06)",border:"1px solid rgba(34,197,94,.2)",borderRadius:12,fontSize:14,color:"#22c55e",textAlign:"center"}}>Wszystkie dane potwierdzone</div>}
              </div>
            )}

            {step===2&&(
              <div className="fi">
                <p style={{fontSize:S,color:"rgba(255,255,255,.4)",marginBottom:14}}>Wybierz jakie protokoly ma zawierac dokumentacja.</p>
                {suggestedScope.length>0&&!selectedScope.length&&(
                  <div className="fi" style={{padding:"14px 18px",marginBottom:18,background:"rgba(239,68,68,.05)",border:"1px solid rgba(239,68,68,.15)",borderRadius:12,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                    <div><div style={{fontSize:14,fontWeight:500}}>Sugestia AI</div><div style={{fontSize:13,color:"rgba(255,255,255,.4)",marginTop:2}}>W dokumentach: {suggestedScope.map((s)=>SCOPE_OPTIONS.find((o)=>o.id===s)?.label).join(", ")}</div></div>
                    <button onClick={applySuggested} style={{padding:"8px 16px",background:"rgba(239,68,68,.15)",border:"1px solid rgba(239,68,68,.3)",borderRadius:8,color:"#ef4444",fontSize:13,fontWeight:500,cursor:"pointer",fontFamily:"inherit",whiteSpace:"nowrap"}}>Zastosuj</button>
                  </div>
                )}
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                  {SCOPE_OPTIONS.map((o)=>(
                    <button key={o.id} onClick={()=>toggleScope(o.id)} style={{
                      display:"flex",alignItems:"center",gap:10,padding:"14px 16px",borderRadius:12,textAlign:"left",
                      border:"1px solid "+(selectedScope.includes(o.id)?"rgba(239,68,68,.5)":"rgba(255,255,255,.06)"),
                      background:selectedScope.includes(o.id)?"rgba(239,68,68,.08)":"rgba(255,255,255,.02)",
                      color:"inherit",cursor:"pointer",fontFamily:"inherit",transition:"all .15s",fontSize:14 }}>
                      <span style={{fontSize:22}}>{o.icon}</span>
                      <div style={{flex:1}}><div style={{fontWeight:500}}>{o.label}</div><div style={{fontSize:12,color:"rgba(255,255,255,.25)",marginTop:1}}>{o.full}</div></div>
                      {selectedScope.includes(o.id)&&<span style={{color:"#22c55e",fontSize:18,flexShrink:0}}>✓</span>}
                    </button>
                  ))}
                </div>
                {selectedScope.length>0&&<div style={{marginTop:18,padding:"12px 18px",background:"rgba(239,68,68,.05)",border:"1px solid rgba(239,68,68,.15)",borderRadius:12,fontSize:14,color:"rgba(255,255,255,.5)"}}>Wybrano: {selectedScope.length}</div>}
              </div>
            )}

            {step===3&&(
              <div className="fi">
                <p style={{fontSize:S,color:"rgba(255,255,255,.4)",marginBottom:18}}>Podsumowanie przed generowaniem.</p>
                {[{title:"Dane budowy",keys:["nazwaInwestycji","adres","inwestor","generalnyWykonawca","numerUmowy"]},
                  {title:"Systemy i atesty",keys:["systemSSP","systemPrzejscia","klasyfikacja","atest1","atest2"]}].map((sec,si)=>(
                  <div key={si} style={{padding:"16px 18px",background:"rgba(255,255,255,.02)",border:"1px solid rgba(255,255,255,.05)",borderRadius:12,marginBottom:12}}>
                    <div style={{fontSize:13,color:"rgba(255,255,255,.3)",fontWeight:600,marginBottom:12,textTransform:"uppercase",letterSpacing:1}}>{sec.title}</div>
                    {extracted.filter((f)=>sec.keys.includes(f.key)).map((f,i)=>(
                      <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",fontSize:14}}>
                        <span style={{color:"rgba(255,255,255,.4)"}}>{f.label}</span><span style={{fontWeight:500}}>{f.value}</span>
                      </div>
                    ))}
                  </div>
                ))}
                <div style={{padding:"16px 18px",background:"rgba(239,68,68,.03)",border:"1px solid rgba(239,68,68,.12)",borderRadius:12,marginBottom:12}}>
                  <div style={{fontSize:13,color:"rgba(255,255,255,.3)",fontWeight:600,marginBottom:12,textTransform:"uppercase",letterSpacing:1}}>Protokoly ({selectedScope.length})</div>
                  <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                    {selectedScope.map((s)=>{const o=SCOPE_OPTIONS.find((x)=>x.id===s);return <span key={s} style={{padding:"5px 12px",background:"rgba(239,68,68,.1)",border:"1px solid rgba(239,68,68,.2)",borderRadius:6,fontSize:13,color:"#ef4444"}}>{o?.icon} {o?.label}</span>})}
                  </div>
                </div>
                <div style={{padding:"14px 18px",background:"rgba(66,133,244,.05)",border:"1px solid rgba(66,133,244,.15)",borderRadius:12,fontSize:14,color:"rgba(255,255,255,.5)"}}>
                  📁 Nowy folder na Google Drive:<br/><strong style={{color:"rgba(255,255,255,.8)"}}>Azico / Dokumentacja / {extracted.find((e)=>e.key==="nazwaInwestycji")?.value||"..."}</strong>
                </div>
              </div>
            )}
          </div>

          {/* Bottom */}
          <div style={{padding:"16px 24px",borderTop:"1px solid rgba(255,255,255,.05)",background:"rgba(255,255,255,.01)",display:"flex",gap:10,alignItems:"center"}}>
            {step>0&&!isGenerating&&!showSuccess&&<button onClick={()=>setStep(step-1)} style={{padding:"14px 22px",background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.08)",borderRadius:10,color:"rgba(255,255,255,.5)",fontSize:14,cursor:"pointer",fontFamily:"inherit",fontWeight:500}}>Wstecz</button>}
            <div style={{flex:1}}>
              {isGenerating?(
                <div>{GEN_STEPS.map((s,i)=>(
                  <div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"4px 0",fontSize:13,opacity:i<genStep?.5:i===genStep?1:.2,transition:"opacity .3s"}}>
                    <div style={{width:7,height:7,borderRadius:"50%",background:i<genStep?"#22c55e":i===genStep?"#ef4444":"rgba(255,255,255,.15)",boxShadow:i===genStep?"0 0 8px #ef4444":"none"}} className={i===genStep?"pd":""}/>
                    {s}
                  </div>
                ))}</div>
              ):showSuccess?(
                <div className="fi" style={{background:"rgba(34,197,94,.08)",border:"1px solid rgba(34,197,94,.2)",borderRadius:14,padding:"18px 22px",textAlign:"center"}}>
                  <div style={{fontSize:26,marginBottom:6}}>✅</div>
                  <div style={{fontWeight:600,fontSize:16,color:"#22c55e"}}>Dokumentacja wygenerowana!</div>
                  <div style={{margin:"10px auto",padding:"8px 16px",display:"inline-flex",alignItems:"center",gap:8,background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.08)",borderRadius:8,fontSize:14,color:"rgba(255,255,255,.7)"}}>
                    📁 Azico / Dokumentacja / {extracted.find((e)=>e.key==="nazwaInwestycji")?.value||"Nowa budowa"}
                  </div>
                  <div style={{fontSize:12,color:"rgba(255,255,255,.25)",marginTop:4}}>{selectedScope.length} protokolow + spis tresci + zestawienie atestow</div>
                  <button onClick={()=>{setShowSuccess(false);setStep(0);setFiles([]);setExtracted([]);setSelectedScope([]);setGenStep(0);}} style={{marginTop:12,padding:"10px 24px",background:"rgba(34,197,94,.12)",border:"1px solid rgba(34,197,94,.25)",borderRadius:8,color:"#22c55e",fontSize:14,cursor:"pointer",fontFamily:"inherit"}}>Nowa dokumentacja</button>
                </div>
              ):step<3?(
                <button onClick={()=>{
                  if(step===0&&extracted.length>0)setStep(1);
                  else if(step===1&&allFieldsConfirmed)setStep(2);
                  else if(step===1)addAi("Potwierdz wszystkie dane zanim przejdziesz dalej.");
                  else if(step===2&&selectedScope.length>0)setStep(3);
                  else if(step===2)addAi("Zaznacz przynajmniej jeden zakres.");
                }} disabled={step===0&&!extracted.length} style={{
                  width:"100%",padding:"14px",
                  background:step===0&&!extracted.length?"rgba(255,255,255,.04)":"linear-gradient(135deg,#dc2626,#b91c1c)",
                  border:"none",borderRadius:10,color:"white",fontSize:15,fontWeight:600,
                  cursor:step===0&&!extracted.length?"default":"pointer",
                  fontFamily:"inherit",opacity:step===0&&!extracted.length?.3:1,
                  boxShadow:step===0&&!extracted.length?"none":"0 4px 15px rgba(220,38,38,.25)" }}>Dalej</button>
              ):(
                <button onClick={handleGenerate} style={{width:"100%",padding:"16px",background:"linear-gradient(135deg,#dc2626,#991b1b)",border:"none",borderRadius:12,color:"white",fontSize:16,fontWeight:600,cursor:"pointer",fontFamily:"inherit",boxShadow:"0 4px 25px rgba(220,38,38,.3)"}}>Generuj dokumentacje</button>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT: CHAT */}
        <div style={{flex:"1 1 42%",display:"flex",flexDirection:"column",background:"rgba(255,255,255,.005)",overflow:"hidden"}}>
          <div style={{padding:"14px 20px",borderBottom:"1px solid rgba(255,255,255,.05)",display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:34,height:34,borderRadius:8,background:"linear-gradient(135deg,#dc2626,#ef4444)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>🤖</div>
            <div><div style={{fontSize:16,fontWeight:600}}>Asystent AI</div><div style={{fontSize:12,color:"rgba(255,255,255,.25)"}}>Pomaga z dokumentacja ppoz</div></div>
          </div>
          <div style={{flex:1,overflow:"auto",padding:"16px 20px",display:"flex",flexDirection:"column",gap:12}}>
            {chatMessages.map((m,i)=>(
              <div key={i} className="fi" style={{display:"flex",flexDirection:"column",alignItems:m.role==="user"?"flex-end":"flex-start"}}>
                <div style={{maxWidth:"85%",padding:"12px 16px",fontSize:14,lineHeight:1.6,whiteSpace:"pre-line",borderRadius:16,
                  ...(m.role==="user"?{background:"linear-gradient(135deg,#dc2626,#b91c1c)",color:"white",borderBottomRightRadius:4}
                    :{background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.06)",borderBottomLeftRadius:4})}}>
                  {m.text}
                </div>
                <span style={{fontSize:11,color:"rgba(255,255,255,.15)",marginTop:3,padding:"0 4px"}}>{m.time}</span>
              </div>
            ))}
            <div ref={chatEndRef}/>
          </div>
          <div style={{padding:"12px 16px",borderTop:"1px solid rgba(255,255,255,.05)",display:"flex",gap:8}}>
            <input value={chatInput} onChange={(e)=>setChatInput(e.target.value)} onKeyDown={(e)=>e.key==="Enter"&&!e.shiftKey&&handleChat()}
              placeholder="Napisz uwage lub pytanie..."
              style={{flex:1,padding:"12px 16px",background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.08)",borderRadius:10,color:"white",fontSize:14,outline:"none",fontFamily:"inherit"}}
              onFocus={(e)=>{e.target.style.borderColor="rgba(239,68,68,.4)"}} onBlur={(e)=>{e.target.style.borderColor="rgba(255,255,255,.08)"}}/>
            <button onClick={handleChat} style={{padding:"12px 18px",borderRadius:10,border:"none",
              background:chatInput.trim()?"linear-gradient(135deg,#dc2626,#b91c1c)":"rgba(255,255,255,.04)",
              color:chatInput.trim()?"white":"rgba(255,255,255,.2)",fontSize:18,cursor:chatInput.trim()?"pointer":"default",fontFamily:"inherit"}}>➤</button>
          </div>
        </div>
      </div>
    </div>
  );
}
