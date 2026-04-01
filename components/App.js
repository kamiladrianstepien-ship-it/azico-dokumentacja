'use client';
import { useState, useRef, useEffect, useCallback } from "react";

// === DANE ===
const ZAKRES_OPTIONS = [
  { id: 'przejscia_konstrukcji', label: 'Zabezpieczenie ogniochronne przejść konstrukcji', icon: '🔥' },
  { id: 'przejscia_instalacyjne', label: 'Zabezpieczenie przejść instalacyjnych', icon: '🧱' },
  { id: 'obudowa_szachtu', label: 'Obudowa szachtu', icon: '📦' },
  { id: 'oddymianie', label: 'System oddymiania', icon: '🌫️' },
  { id: 'drzwi', label: 'Montaż drzwi ppoż / napowietrzających', icon: '🚪' },
  { id: 'klapy_dymowe', label: 'Montaż klap dymowych', icon: '💨' },
  { id: 'stolarka', label: 'Stolarka pożarowa', icon: '🏗️' },
  { id: 'kurtyna', label: 'Kurtyna dymowa', icon: '🎭' },
  { id: 'ssp', label: 'SSP', icon: '🔔' },
  { id: 'tryskacze', label: 'Tryskacze', icon: '💧' },
  { id: 'hydranty', label: 'Hydranty', icon: '🧯' },
  { id: 'oswietlenie', label: 'Oświetlenie ewakuacyjne', icon: '💡' },
  { id: 'dso', label: 'DSO', icon: '🔊' },
  { id: 'gaszenie', label: 'Gaszenie gazem', icon: '🧪' },
];

const PROTOKOL_MAP = {
  przejscia_konstrukcji: ['protokol_izolacji', 'raport_zabezpieczenia'],
  przejscia_instalacyjne: ['protokol_izolacji', 'raport_zabezpieczenia'],
  oddymianie: ['protokol_drzwi', 'wykaz_drzwi', 'protokol_klap', 'protokol_oddymiania', 'pomiary_izolacji', 'pomiary_pe', 'ochrona_ppor'],
  drzwi: ['protokol_drzwi', 'wykaz_drzwi'],
  klapy_dymowe: ['protokol_klap', 'protokol_oddymiania'],
  stolarka: ['protokol_drzwi', 'wykaz_drzwi'],
  ssp: ['pomiary_izolacji', 'pomiary_pe', 'ochrona_ppor'],
  dso: ['pomiary_izolacji', 'pomiary_pe', 'ochrona_ppor'],
};

const ALL_PROTOKOLY = [
  { id: 'oswiadczenie_wyk', label: 'Oświadczenie wykonawcze Azico', required: true },
  { id: 'oswiadczenie_kier', label: 'Oświadczenie kierownika budowy', required: true },
  { id: 'protokol_izolacji', label: 'Protokół z wykonania izolacji ppoż' },
  { id: 'raport_zabezpieczenia', label: 'Raport z wykonania zabezpieczenia ogniochronnego' },
  { id: 'protokol_drzwi', label: 'Protokół z montażu drzwi' },
  { id: 'wykaz_drzwi', label: 'Wykaz drzwi zamontowanych' },
  { id: 'protokol_klap', label: 'Protokół z montażu klap dymowych' },
  { id: 'protokol_oddymiania', label: 'Protokół sprawdzenia zadziałania oddymiania' },
  { id: 'pomiary_izolacji', label: 'Pomiary izolacji' },
  { id: 'pomiary_pe', label: 'Pomiary ciągłości PE' },
  { id: 'ochrona_ppor', label: 'Ochrona przeciwporażeniowa' },
];

const DODATKOWE = [
  { id: 'strona_tytulowa', label: 'Strona tytułowa' },
  { id: 'spis_tresci', label: 'Spis treści (automatyczny)' },
  { id: 'okladka_waski', label: 'Okładka segregatora - brzeg wąski' },
  { id: 'okladka_szeroki', label: 'Okładka segregatora - brzeg szeroki' },
];

const MOCK_RESULT = {
  dane: [
    { key: 'nazwaInwestycji', label: 'Nazwa inwestycji', value: 'Wykonanie zabezpieczenia ogniochronnego przejść konstrukcji stalowej do klasy odporności ogniowej EI60 w budynku centrum logistycznego CTP ZAB3 - PSIBUFET w Zabrzu' },
    { key: 'adres', label: 'Adres obiektu', value: 'ul. Salomona Isaaca 5, 41-807 Zabrze' },
    { key: 'inwestor', label: 'Inwestor', value: 'CTP Invest Poland sp. z o.o., ul. Rondo ONZ 1, 00-124 Warszawa' },
    { key: 'generalnyWykonawca', label: 'Generalny wykonawca', value: 'YPERO S.A., ul. Kozierowskiego 2 lokal 203, 60-185 Skórzewo' },
    { key: 'klasyfikacja', label: 'Klasyfikacja ogniowa', value: 'EI60' },
    { key: 'dataStart', label: 'Data rozpoczęcia', value: '23.10.2025' },
    { key: 'dataEnd', label: 'Data zakończenia', value: '07.11.2025' },
  ],
  systemy: [
    { key: 's1', label: 'System / materiał', value: 'Flame Cabel Pasta A - Carboline Polska Sp. z o.o.' },
    { key: 's2', label: 'System / materiał', value: 'Frontrock Plus - Rockwool Polska Sp. z o.o.' },
  ],
  certyfikaty: [
    { key: 'c1', label: 'Certyfikat', value: 'Certyfikat Stałości Właściwości Użytkowych 1488-CPR-0538/W' },
    { key: 'c2', label: 'Deklaracja', value: 'DoP FCPA-005-1-2023-06-02' },
    { key: 'c3', label: 'ETA', value: 'Europejska Ocena Techniczna ETA 15/0853' },
    { key: 'c4', label: 'IDT', value: 'Indywidualna Dokumentacja Techniczna nr 445/2025' },
  ],
};

function gt() { return new Date().toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' }); }

// === LOGO ===
function Logo({ h = 32 }) {
  return (
    <svg viewBox="0 0 280 60" height={h} xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="14" width="22" height="38" rx="2" fill="#e53030"/>
      {[17,25,33,41].map(y => [7,13,19].map(x => <rect key={x+'-'+y} x={x} y={y} width="4" height="5" rx=".5" fill="#0b0e14" opacity=".3"/>))}
      <path d="M15 14L15 8Q15 5 18 5L22 5" stroke="#999" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      <circle cx="15" cy="8" r="2.2" fill="#e53030"/><circle cx="15" cy="8" r="1" fill="#fff" opacity=".4"/>
      <ellipse cx="15" cy="53" rx="15" ry="3" fill="#e53030" opacity=".5"/>
      
      <text x="38" y="44" fontFamily="Arial Black,Arial,sans-serif" fontWeight="900" fontSize="40" fill="#e53030" letterSpacing="1">AZICO.PL</text>
    </svg>
  );
}

// === SECTION CARD ===
function Section({ icon, title, count, total, onConfirmAll, children }) {
  return (
    <div style={{ border: '1px solid rgba(255,255,255,.12)', borderRadius: 12, marginBottom: 16, overflow: 'hidden' }}>
      <div style={{ padding: '10px 16px', background: 'rgba(255,255,255,.02)', borderBottom: '1px solid rgba(255,255,255,.06)', display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 16 }}>{icon}</span>
        <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.1em', color: '#e53030', textTransform: 'uppercase', flex: 1 }}>{title}</span>
        {total > 0 && <span style={{ fontSize: 12, color: count === total ? '#22c55e' : '#9ca3af', fontWeight: 500 }}>{count}/{total}</span>}
        {onConfirmAll && total > 0 && (
          <button onClick={onConfirmAll} style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid '+(count===total?'rgba(229,48,48,.25)':'rgba(34,197,94,.25)'), background: count===total?'rgba(229,48,48,.08)':'rgba(34,197,94,.08)', color: count===total?'#e53030':'#22c55e', fontSize: 11, cursor: 'pointer', fontWeight: 500 }}>
            {count===total?'Odznacz':'Zatwierdz wszystko'}
          </button>
        )}
      </div>
      <div style={{ padding: '8px 12px' }}>{children}</div>
    </div>
  );
}

// === EDITABLE ROW ===
function DataRow({ field, onConfirm, onEdit }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(field.value);
  const inputRef = useRef(null);

  useEffect(() => { setVal(field.value); }, [field.value]);
  useEffect(() => { if (editing && inputRef.current) inputRef.current.focus(); }, [editing]);

  const save = () => { setEditing(false); onEdit(val); };
  const cancel = () => { setEditing(false); setVal(field.value); };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderBottom: '1px solid rgba(255,255,255,.06)', transition: 'background .15s', background: field.confirmed ? 'rgba(34,197,94,.06)' : 'transparent' }}>
      <div style={{ width: 110, fontSize: 12, color: '#6b7280', fontWeight: 500, flexShrink: 0 }}>{field.label}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        {editing ? (
          <input ref={inputRef} value={val} onChange={e => setVal(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') cancel(); }}
            onBlur={save}
            style={{ width: '100%', padding: '5px 8px', background: 'rgba(255,255,255,.04)', border: '1px solid #e53030', borderRadius: 6, color: '#fff', fontSize: 14, outline: 'none', fontFamily: 'inherit' }} />
        ) : (
          <div onClick={() => setEditing(true)} style={{ padding: '5px 8px', borderRadius: 6, color: '#fff', fontSize: 14, cursor: 'pointer', minHeight: 28, wordBreak: 'break-word' }} title="Kliknij aby edytować">
            {field.value}
          </div>
        )}
      </div>
      <button onClick={onConfirm} style={{ width: 28, height: 28, borderRadius: 7, border: `1px solid ${field.confirmed ? 'rgba(34,197,94,.5)' : 'rgba(255,255,255,.12)'}`, background: field.confirmed ? 'rgba(34,197,94,.15)' : 'transparent', color: field.confirmed ? '#22c55e' : 'rgba(255,255,255,.2)', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all .15s' }}>✓</button>
    </div>
  );
}

// === MAIN ===
export default function App({ onLogout }) {
  const [step, setStep] = useState(0);
  const [files, setFiles] = useState([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dane, setDane] = useState([]);
  const [systemy, setSystemy] = useState([]);
  const [certy, setCerty] = useState([]);
  const [branze, setBranze] = useState([]);
  const [zakresy, setZakresy] = useState([]);
  const [kierownik, setKierownik] = useState('');
  const [protokoly, setProtokoly] = useState([]);
  const [suggestedProto, setSuggestedProto] = useState([]);
  const [dodatkowe, setDodatkowe] = useState(['strona_tytulowa', 'spis_tresci']);
  const [generating, setGenerating] = useState(false);
  const [genStep, setGenStep] = useState(0);
  const [done, setDone] = useState(false);
  const [chatOpen, setChatOpen] = useState(true);
  const [chat, setChat] = useState([
    { role: 'ai', text: 'Witaj! Wgraj dokumenty lub podłącz folder z Google Drive.\n\nWyciągnę z nich wszystkie dane automatycznie - Ty tylko sprawdzisz i potwierdzisz.', time: gt() }
  ]);
  const [chatIn, setChatIn] = useState('');
  const chatEndRef = useRef(null);
  const fileRef = useRef(null);
  const [highlightSec, setHighlightSec] = useState(null);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chat]);
  useEffect(() => { setChatOpen(step < 2); }, [step]);

  // Keyboard shortcut for new doc
  useEffect(() => {
    if (!done) return;
    const handler = (e) => { if (e.key === 'n' || e.key === 'N' || e.key === 'Enter') resetAll(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [done]);

  const addAi = (t) => setChat(c => [...c, { role: 'ai', text: t, time: gt() }]);
  const toggle = (arr, set, id) => set(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);

  const resetAll = () => { setDone(false); setStep(0); setFiles([]); setDane([]); setSystemy([]); setCerty([]); setBranze([]); setZakresy([]); setProtokoly([]); setSuggestedProto([]); setGenStep(0); setDodatkowe(['strona_tytulowa','spis_tresci']); };

  const highlightSection = (id) => { setHighlightSec(id); setTimeout(() => setHighlightSec(null), 1500); };

  // Upload
  const onFiles = (e) => {
    const nf = Array.from(e.target.files || []).map(f => ({ name: f.name, size: (f.size/1024/1024).toFixed(1)+' MB', status: 'ready' }));
    setFiles(p => [...p, ...nf]);
    addAi('Przyjąłem: ' + nf.map(f => f.name).join(', ') + '.\n\nKliknij „Analizuj pliki" gdy wgrasz wszystko.');
  };

  // Analyze
  const onAnalyze = () => {
    if (!files.length) return;
    setAnalyzing(true); setProgress(0);
    setFiles(f => f.map(x => ({ ...x, status: 'analyzing' })));
    let p = 0;
    const iv = setInterval(() => {
      p += Math.random()*12+5;
      if (p >= 100) { clearInterval(iv); setTimeout(() => {
        setAnalyzing(false); setProgress(100);
        setFiles(f => f.map(x => ({ ...x, status: 'analyzed' })));
        const allNames = files.map(f => f.name.toLowerCase()).join(' ');
        const dB = [];
        if (allNames.includes('budowlan') || allNames.includes('szacht') || allNames.includes('izolacj') || allNames.includes('przejsc') || allNames.includes('drzwi') || allNames.includes('klap')) dB.push('budowlana');
        if (allNames.includes('elektr') || allNames.includes('pomiary') || allNames.includes('oddymi') || allNames.includes('ssp') || allNames.includes('central')) dB.push('elektryczna');
        if (allNames.includes('sanitar') || allNames.includes('hydrant') || allNames.includes('trysk')) dB.push('sanitarna');
        if (!dB.length) dB.push('budowlana');
        const dZ = [];
        if (allNames.includes('konstrukcj')) dZ.push('przejscia_konstrukcji');
        if (allNames.includes('instalac')) dZ.push('przejscia_instalacyjne');
        if (allNames.includes('szacht') || allNames.includes('obudow')) dZ.push('obudowa_szachtu');
        if (allNames.includes('oddymi')) dZ.push('oddymianie');
        if (allNames.includes('drzwi') || allNames.includes('napowietrz')) dZ.push('drzwi');
        if (allNames.includes('klap')) dZ.push('klapy_dymowe');
        if (allNames.includes('stolark')) dZ.push('stolarka');
        if (allNames.includes('kurtyn')) dZ.push('kurtyna');
        if (allNames.includes('ssp')) dZ.push('ssp');
        if (!dZ.length) dZ.push('przejscia_konstrukcji');

        const dC = [...MOCK_RESULT.certyfikaty];
        if (allNames.includes('promat')) { dC.push({ key: 'cx1', label: 'Deklaracja', value: 'Deklaracja Właściwości Użytkowych - PROMATECT-L500' }); dC.push({ key: 'cx2', label: 'KOT', value: 'Krajowa Ocena Techniczna ITB-KOT-2021/1924' }); }
        if (allNames.includes('askon') || allNames.includes('klap')) { dC.push({ key: 'cx3', label: 'Certyfikat', value: 'Certyfikat Stałości Właściwości Użytkowych 1488-CPR-0309/W (Askon Fire)' }); }

        setDane(MOCK_RESULT.dane.map(x => ({ ...x, confirmed: false, source: 'AI' })));
        setSystemy(MOCK_RESULT.systemy.map(x => ({ ...x, confirmed: false, source: 'AI' })));
        setCerty(dC.map(x => ({ ...x, confirmed: false, source: x.source || 'AI' })));
        setBranze([...new Set(dB)]); setZakresy([...new Set(dZ)]);
        setKierownik('Artur Stępień');

        const sugg = new Set(['oswiadczenie_wyk', 'oswiadczenie_kier']);
        [...new Set(dZ)].forEach(z => { (PROTOKOL_MAP[z] || []).forEach(pr => sugg.add(pr)); });
        setProtokoly([...sugg]); setSuggestedProto([...sugg]);

        setStep(1);
        const bStr = [...new Set(dB)].join(', ');
        const zStr = [...new Set(dZ)].map(z => ZAKRES_OPTIONS.find(o => o.id === z)?.label || z).join(', ');
        addAi('Analiza zakończona!\n\nDane budowy: ' + MOCK_RESULT.dane.length + ' pól\nSystemy: ' + MOCK_RESULT.systemy.length + '\nCertyfikaty: ' + dC.length + '\nBranże: ' + bStr + '\nZakres: ' + zStr + '\nKierownik: Artur Stępień\nProtokołów: ' + sugg.size);
      }, 500); }
      setProgress(Math.min(p, 100));
    }, 250);
  };

  // Confirm helpers
  const confirmF = (arr, set, i) => set(p => { const n=[...p]; n[i]={...n[i], confirmed:!n[i].confirmed}; return n; });
  const editF = (arr, set, i, v) => set(p => { const n=[...p]; n[i]={...n[i], value:v, confirmed:true}; return n; });
  const toggleAllSection = (arr, set) => { const all = arr.every(x=>x.confirmed); set(p=>p.map(x=>({...x, confirmed:!all}))); };
  const confirmAllData = () => { toggleAllSection(dane,setDane); toggleAllSection(systemy,setSystemy); toggleAllSection(certy,setCerty); };
  const allOk = dane.length>0 && dane.every(x=>x.confirmed) && systemy.every(x=>x.confirmed) && certy.every(x=>x.confirmed);

  // TOC
  const buildTOC = () => {
    const secs = [];
    const s1 = { title: 'I. Oświadczenia, uprawnienia, protokoły', items: [] };
    protokoly.forEach(pid => { const p = ALL_PROTOKOLY.find(x=>x.id===pid); if(p) s1.items.push(p.label); });
    s1.items.push('Uprawnienia budowlane - ' + kierownik);
    s1.items.push('Zaświadczenie o przynależności do Izby Inżynierów Budownictwa');
    secs.push(s1);
    branze.forEach((b,i) => {
      const sec = { title: ['II','III','IV','V'][i]+'. Karty materiałowe - branża '+b, items: [] };
      certy.forEach(c => sec.items.push(c.value));
      systemy.forEach(s => sec.items.push('Karta produktowa: '+s.value));
      secs.push(sec);
    });
    secs.push({ title: ['II','III','IV','V'][branze.length]+'. Rysunki powykonawcze', items: ['Rzuty i rysunki z wgranych plików'] });
    return secs;
  };

  // Chat with TOC editing
  const onChat = () => {
    if (!chatIn.trim()) return;
    const m = chatIn.trim(); setChatIn('');
    setChat(c => [...c, { role: 'user', text: m, time: gt() }]);
    setTimeout(() => {
      const l = m.toLowerCase();
      let r = 'Rozumiem, uwzględnię to.';
      let acted = false;

      if (l.includes('dodaj')) {
        ALL_PROTOKOLY.forEach(p => {
          const match = l.includes(p.label.toLowerCase().substring(0,12)) || (l.includes('izolacj') && p.id==='protokol_izolacji') || (l.includes('oddymi') && p.id==='protokol_oddymiania') || (l.includes('drzwi') && !l.includes('wykaz') && p.id==='protokol_drzwi') || (l.includes('wykaz') && p.id==='wykaz_drzwi') || (l.includes('klap') && p.id==='protokol_klap') || (l.includes('pomiar') && l.includes('izolacj') && p.id==='pomiary_izolacji') || (l.includes('pomiar') && l.includes('pe') && p.id==='pomiary_pe') || (l.includes('ochrona') && p.id==='ochrona_ppor') || (l.includes('raport') && p.id==='raport_zabezpieczenia');
          if (match && !protokoly.includes(p.id)) { setProtokoly(prev => [...prev, p.id]); r = 'Dodałem: „'+p.label+'" do listy dokumentów.'; acted = true; }
          else if (match && protokoly.includes(p.id)) { r = '„'+p.label+'" jest już na liście.'; acted = true; }
        });
        if (!acted && l.includes('branz') && l.includes('elektr')) { setBranze(p=>p.includes('elektryczna')?p:[...p,'elektryczna']); r='Dodałem branżę elektryczną.'; acted=true; }
        if (!acted && l.includes('branz') && l.includes('sanitar')) { setBranze(p=>p.includes('sanitarna')?p:[...p,'sanitarna']); r='Dodałem branżę sanitarną.'; acted=true; }
        if (!acted) { r = 'Napisz np.:\n- „dodaj protokół oddymiania"\n- „dodaj pomiary izolacji"\n- „dodaj branżę elektryczną"'; acted=true; }
      }
      if (l.includes('usuń') || l.includes('usun') || l.includes('wyrzuć') || l.includes('wyrzuc') || l.includes('zabierz')) {
        ALL_PROTOKOLY.forEach(p => {
          const match = l.includes(p.label.toLowerCase().substring(0,12)) || (l.includes('izolacj') && !l.includes('pomiar') && p.id==='protokol_izolacji') || (l.includes('oddymi') && p.id==='protokol_oddymiania') || (l.includes('drzwi') && p.id==='protokol_drzwi') || (l.includes('klap') && p.id==='protokol_klap') || (l.includes('pomiar') && l.includes('pe') && p.id==='pomiary_pe') || (l.includes('ochrona') && p.id==='ochrona_ppor');
          if (match && protokoly.includes(p.id)) { setProtokoly(prev=>prev.filter(x=>x!==p.id)); r='Usunięto: „'+p.label+'".'; acted=true; }
        });
        if (!acted) { r='Napisz np. „usuń pomiary PE" lub „usuń ochronę przeciwporażeniową".'; acted=true; }
      }
      if (!acted) {
        if (l.includes('hilti') || l.includes('promat') || l.includes('zamień') || l.includes('zamien')) r='Podmienię system i atesty we wszystkich protokołach.';
        else if (l.includes('pomoc') || l.includes('jak') || l.includes('co mogę') || l.includes('co moge')) r='Mogę edytować dokumentację. Napisz:\n- „dodaj protokół oddymiania"\n- „usuń pomiary PE"\n- „dodaj branżę elektryczną"';
      }
      addAi(r);
    }, 400);
  };

  // Generate
  const GEN = ['Tworzę folder na Drive...','Generuję stronę tytułową...','Generuję oświadczenia...','Generuję protokoły...','Tworzę spis treści...','Dołączam karty materiałowe...','Dołączam uprawnienia...','Walidacja...','Zapisuję na Drive...'];
  const onGenerate = () => {
    setGenerating(true); setGenStep(0);
    GEN.forEach((_,i) => setTimeout(()=>setGenStep(i+1),(i+1)*700));
    setTimeout(() => { setGenerating(false); setDone(true);
      const nm = dane.find(d=>d.key==='nazwaInwestycji')?.value||'Nowa budowa';
      addAi('Dokumentacja gotowa!\n\n'+protokoly.length+' dokumentów.\nFolder: Azico / Dokumentacja / '+nm.substring(0,50)+'...');
    }, GEN.length*700+500);
  };

  const canNext = () => { if(step===0) return dane.length>0; if(step===1) return dane.length>0; if(step===2) return protokoly.length>0; return true; };

  const STEPS = [
    { label: 'Wgrywanie', num: 1 },
    { label: 'Weryfikacja', num: 2 },
    { label: 'Protokoły', num: 3 },
    { label: 'Spis treści', num: 4 },
    { label: 'Generowanie', num: 5 },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#111', fontFamily: "'DM Sans',system-ui,sans-serif", color: '#e2e8f0', fontSize: 15, display: 'flex', flexDirection: 'column' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0} input,textarea,select,button{font-family:inherit}
        ::-webkit-scrollbar{width:5px} ::-webkit-scrollbar-track{background:transparent} ::-webkit-scrollbar-thumb{background:rgba(255,255,255,.1);border-radius:10px}
        @keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.4)}}
        @keyframes hlPulse{0%,100%{border-color:rgba(229,48,48,.15)}50%{border-color:rgba(229,48,48,.6)}}
        .fi{animation:fadeIn .2s ease-out} .pd{animation:pulse 1s infinite}
        .hl{animation:hlPulse 0.75s ease-in-out 2}
      `}</style>

      {/* HEADER */}
      <header style={{ borderBottom: '1px solid rgba(255,255,255,.08)', padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(180deg,rgba(229,48,48,.05),transparent)', position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Logo h={30} />
          <div style={{ height: 26, width: 1, background: 'rgba(255,255,255,.1)' }} />
          <div style={{ fontWeight: 700, fontSize: 18, letterSpacing: '.03em', textTransform: 'uppercase' }}>Dokumentacja powykonawcza</div>
        </div>
        <div style={{ position: 'absolute', right: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 6px rgba(34,197,94,.5)' }} />
          <span style={{ fontSize: 11, color: '#9ca3af' }}>AI Online</span>
        </div>
      </header>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* LEFT */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

          {/* STEPPER */}
          <div style={{ display: 'flex', padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,.06)', background: 'rgba(255,255,255,.01)', justifyContent: 'center', gap: 0 }}>
            {STEPS.map((s,i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
                <button onClick={() => { if(i<=step) setStep(i); }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '4px 16px', border: 'none', background: 'transparent', cursor: i<=step?'pointer':'default' }}>
                  <span style={{ width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 600, transition: 'all .15s',
                    background: i<step?'#22c55e':step===i?'#e53030':'rgba(255,255,255,.08)', color: i<=step?'#fff':'rgba(255,255,255,.3)' }}>
                    {i<step?'✓':s.num}
                  </span>
                  <span style={{ fontSize: 11, color: step===i?'#e53030':i<step?'#9ca3af':'rgba(255,255,255,.25)', fontWeight: step===i?600:400 }}>{s.label}</span>
                </button>
                {i<STEPS.length-1 && <div style={{ width: 40, height: 1, background: i<step?'rgba(34,197,94,.3)':'rgba(255,255,255,.06)' }}/>}
              </div>
            ))}
          </div>

          {/* CONTENT */}
          <div style={{ flex: 1, overflow: 'auto', padding: 24 }}>

            {/* STEP 0: PLIKI */}
            {step===0 && (
              <div className="fi">
                <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 6 }}>Źródło dokumentów</h2>
                <p style={{ fontSize: 14, color: '#9ca3af', marginBottom: 16 }}>Wskaż folder budowy lub wgraj pliki ręcznie. AI sam znajdzie i wyciągnie potrzebne dane.</p>

                <div onClick={()=>addAi('Google Drive Picker będzie dostępny w produkcyjnej wersji.\n\nNa razie wgraj pliki ręcznie przyciskiem poniżej.')} style={{ padding: 20, background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 14, marginBottom: 12, cursor: 'pointer', transition: 'all .15s' }}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor='rgba(59,130,246,.4)';e.currentTarget.style.background='rgba(59,130,246,.04)';}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor='rgba(255,255,255,.08)';e.currentTarget.style.background='rgba(255,255,255,.02)';}}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(59,130,246,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="24" height="22" viewBox="0 0 24 22"><path d="M4.4 22l3-5.2H22l-3 5.2H4.4z" fill="#3777E3"/><path d="M15 10L11 3l3-3h6l-3 4.5L15 10z" fill="#FFCF63"/><path d="M2 16.8L5.5 10h7L9 16.8H2z" fill="#11A861"/></svg>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 16, fontWeight: 600 }}>Podłącz folder z Google Drive</div>
                      <div style={{ fontSize: 13, color: '#9ca3af', marginTop: 2 }}>Wskaż folder budowy - AI sam przejrzy pliki</div>
                    </div>
                    <div style={{ fontSize: 13, color: 'rgba(59,130,246,.8)', fontWeight: 500, padding: '6px 14px', background: 'rgba(59,130,246,.08)', borderRadius: 8 }}>Wybierz folder</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '14px 0' }}>
                  <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,.06)' }} />
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,.2)' }}>lub</span>
                  <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,.06)' }} />
                </div>

                <div onClick={()=>fileRef.current?.click()} style={{ border: '2px dashed rgba(255,255,255,.08)', borderRadius: 14, padding: 28, textAlign: 'center', cursor: 'pointer', marginBottom: 12, transition: 'all .15s' }}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor='rgba(229,48,48,.3)';e.currentTarget.style.background='rgba(229,48,48,.02)';}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor='rgba(255,255,255,.08)';e.currentTarget.style.background='transparent';}}>
                  <input ref={fileRef} type="file" multiple accept=".pdf,.docx,.doc,.xlsx,.jpg,.png,.dwg" onChange={onFiles} style={{ display: 'none' }} />
                  <div style={{ fontSize: 32, marginBottom: 8 }}>📂</div>
                  <div style={{ fontSize: 15, color: '#9ca3af', fontWeight: 500 }}>Wgraj pliki ręcznie z komputera</div>
                  <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>PDF, DOCX, XLSX, JPG, DWG</div>
                </div>

                <div style={{ padding: '10px 14px', background: 'rgba(255,255,255,.015)', border: '1px solid rgba(255,255,255,.04)', borderRadius: 10, marginBottom: 14, fontSize: 13, color: '#6b7280', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3px 16px' }}>
                  <div>📐 Projekt / dokumentacja projektowa</div><div>📋 Umowa / zlecenie</div>
                  <div>📜 Certyfikaty, atesty, deklaracje</div><div>📏 Rysunki powykonawcze</div>
                  <div>📷 Zdjęcia z budowy (opcjonalnie)</div><div>📄 Wytyczne klienta (jeśli są)</div>
                </div>

                {files.map((f,i) => (
                  <div key={i} className="fi" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 10, marginBottom: 5 }}>
                    <span style={{ fontSize: 18 }}>📄</span>
                    <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 14, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</div><div style={{ fontSize: 12, color: '#6b7280' }}>{f.size}</div></div>
                    <span style={{ fontSize: 12, fontWeight: 500, color: f.status==='analyzed'?'#22c55e':f.status==='analyzing'?'#f59e0b':'#6b7280' }}>{f.status==='analyzed'?'✓ Gotowy':f.status==='analyzing'?'Analizuję...':'Wgrany'}</span>
                    <button onClick={()=>setFiles(p=>p.filter((_,idx)=>idx!==i))} style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', fontSize: 16 }}>✕</button>
                  </div>
                ))}

                {files.length>0 && !analyzing && !dane.length && (
                  <button onClick={onAnalyze} style={{ width: '100%', marginTop: 14, padding: 16, background: 'linear-gradient(135deg,#e53030,#b91c1c)', border: 'none', borderRadius: 12, color: 'white', fontSize: 15, fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 20px rgba(229,48,48,.25)' }}>
                    🔍 Analizuj pliki - AI wyciągnie dane
                  </button>
                )}
                {analyzing && (
                  <div style={{ marginTop: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#9ca3af', marginBottom: 6 }}><span>AI przegląda pliki...</span><span>{Math.round(progress)}%</span></div>
                    <div style={{ height: 5, background: 'rgba(255,255,255,.06)', borderRadius: 3, overflow: 'hidden' }}><div style={{ height: '100%', width: progress+'%', background: 'linear-gradient(90deg,#e53030,#ef4444)', borderRadius: 3, transition: 'width .3s' }}/></div>
                  </div>
                )}
                {dane.length>0 && (
                  <div className="fi" style={{ marginTop: 14, padding: '14px 16px', background: 'rgba(34,197,94,.06)', border: '1px solid rgba(34,197,94,.2)', borderRadius: 12 }}>
                    <div style={{ fontWeight: 600, color: '#22c55e', marginBottom: 6 }}>AI wyciągnął dane z plików</div>
                    <div style={{ fontSize: 14, color: '#9ca3af', lineHeight: 1.7 }}>
                      Dane budowy: {dane.length} pól | Systemy: {systemy.length} | Certyfikaty: {certy.length}<br/>
                      Branże: {branze.join(', ')} | Protokołów: {protokoly.length}
                    </div>
                    <div style={{ fontSize: 13, color: '#22c55e', marginTop: 8 }}>Kliknij „Dalej" aby sprawdzić i potwierdzić dane.</div>
                  </div>
                )}
              </div>
            )}

            {/* STEP 1: WERYFIKACJA */}
            {step===1 && (
              <div className="fi">
                <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Sprawdź wyciągnięte dane</h2>

                <Section icon="🏗️" title="Dane budowy" count={dane.filter(x=>x.confirmed).length} total={dane.length} onConfirmAll={()=>toggleAllSection(dane,setDane)}>
                  {dane.map((f,i) => <DataRow key={i} field={f} onConfirm={()=>confirmF(dane,setDane,i)} onEdit={v=>editF(dane,setDane,i,v)} />)}
                </Section>

                <Section icon="⚙️" title="Systemy i materialy" count={systemy.filter(x=>x.confirmed).length} total={systemy.length} onConfirmAll={()=>toggleAllSection(systemy,setSystemy)}>
                  {systemy.map((f,i) => <DataRow key={i} field={f} onConfirm={()=>confirmF(systemy,setSystemy,i)} onEdit={v=>editF(systemy,setSystemy,i,v)} />)}
                </Section>

                <Section icon="📜" title="Certyfikaty i atesty" count={certy.filter(x=>x.confirmed).length} total={certy.length} onConfirmAll={()=>toggleAllSection(certy,setCerty)}>
                  {certy.map((f,i) => <DataRow key={i} field={f} onConfirm={()=>confirmF(certy,setCerty,i)} onEdit={v=>editF(certy,setCerty,i,v)} />)}
                </Section>

                <Section icon="🤖" title="Wykryte przez AI" count={0} total={0}>
                  <div style={{ padding: '8px 12px', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    <div style={{ fontSize: 12, color: '#6b7280', width: '100%', marginBottom: 4 }}>Branże:</div>
                    {['budowlana','elektryczna','sanitarna'].map(b => (
                      <button key={b} onClick={()=>toggle(branze,setBranze,b)} style={{ padding: '7px 14px', borderRadius: 8, fontSize: 13, cursor: 'pointer', border: '1px solid '+(branze.includes(b)?'rgba(229,48,48,.3)':'rgba(255,255,255,.08)'), background: branze.includes(b)?'rgba(229,48,48,.08)':'rgba(255,255,255,.02)', color: '#d1d5db' }}>
                        {branze.includes(b)&&'✓ '}{b}
                      </button>
                    ))}
                  </div>
                  <div style={{ padding: '8px 12px' }}>
                    <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>Kierownik budowy:</div>
                    <input value={kierownik} onChange={e=>setKierownik(e.target.value)} style={{ width: '100%', padding: '8px 12px', background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 8, color: '#fff', fontSize: 14, outline: 'none' }} />
                  </div>
                </Section>

                {allOk && <div className="fi" style={{ padding: 12, background: 'rgba(34,197,94,.06)', border: '1px solid rgba(34,197,94,.2)', borderRadius: 12, fontSize: 14, color: '#22c55e', textAlign: 'center' }}>Wszystkie dane potwierdzone ✓</div>}
              </div>
            )}

            {/* STEP 2: PROTOKOLY */}
            {step===2 && (
              <div className="fi">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <h2 style={{ fontSize: 18, fontWeight: 600 }}>Dokumenty do wygenerowania</h2>
                  <span style={{ fontSize: 13, color: '#9ca3af' }}>Zaznaczono {protokoly.length + dodatkowe.length} z {ALL_PROTOKOLY.length + DODATKOWE.length}</span>
                </div>
                <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                  <button onClick={()=>{setProtokoly(ALL_PROTOKOLY.map(p=>p.id));setDodatkowe(DODATKOWE.map(d=>d.id));}} style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid rgba(255,255,255,.1)', background: 'rgba(255,255,255,.02)', color: '#9ca3af', fontSize: 12, cursor: 'pointer' }}>Zaznacz wszystkie</button>
                  <button onClick={()=>{setProtokoly(['oswiadczenie_wyk','oswiadczenie_kier']);setDodatkowe([]);}} style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid rgba(255,255,255,.1)', background: 'rgba(255,255,255,.02)', color: '#9ca3af', fontSize: 12, cursor: 'pointer' }}>Odznacz wszystkie</button>
                </div>

                <div style={{ border: '1px solid rgba(255,255,255,.1)', borderRadius: 12, marginBottom: 14, overflow: 'hidden' }}>
                  <div style={{ padding: '8px 14px', background: 'rgba(255,255,255,.03)', borderBottom: '1px solid rgba(255,255,255,.06)', fontSize: 11, fontWeight: 600, letterSpacing: '.1em', color: '#e53030', textTransform: 'uppercase' }}>Wymagane</div>
                  {ALL_PROTOKOLY.filter(p=>p.required).map(p => (
                    <button key={p.id} onClick={()=>toggle(protokoly,setProtokoly,p.id)} style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,.04)', cursor: 'pointer', textAlign: 'left', fontSize: 14, background: protokoly.includes(p.id)?'rgba(229,48,48,.06)':'transparent', border: 'none', color: '#d1d5db', minHeight: 52 }}>
                      <div style={{ width: 24, height: 24, borderRadius: 6, border: '2px solid '+(protokoly.includes(p.id)?'#e53030':'rgba(255,255,255,.15)'), background: protokoly.includes(p.id)?'#e53030':'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 14, flexShrink: 0 }}>{protokoly.includes(p.id)&&'✓'}</div>
                      <span style={{ flex: 1 }}>{p.label}</span>
                      {suggestedProto.includes(p.id) && <span title="Dodane automatycznie przez AI na podstawie analizy plików" style={{ color: '#f59e0b', fontSize: 16 }}>✦</span>}
                    </button>
                  ))}
                </div>

                <div style={{ border: '1px solid rgba(255,255,255,.1)', borderRadius: 12, marginBottom: 14, overflow: 'hidden', position: 'relative' }}>
                  <div style={{ padding: '8px 14px', background: 'rgba(255,255,255,.02)', borderBottom: '1px solid rgba(255,255,255,.06)', display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.1em', color: '#e53030', textTransform: 'uppercase' }}>Protokoły</span>
                    <span style={{ fontSize: 11, color: '#6b7280' }}>opcjonalne</span>
                  </div>
                  {ALL_PROTOKOLY.filter(p=>!p.required).map(p => (
                    <button key={p.id} onClick={()=>toggle(protokoly,setProtokoly,p.id)} style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,.04)', cursor: 'pointer', textAlign: 'left', fontSize: 14, background: protokoly.includes(p.id)?'rgba(229,48,48,.06)':'transparent', border: 'none', color: '#d1d5db', minHeight: 52 }}>
                      <div style={{ width: 24, height: 24, borderRadius: 6, border: '2px solid '+(protokoly.includes(p.id)?'#e53030':'rgba(255,255,255,.15)'), background: protokoly.includes(p.id)?'#e53030':'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 14, flexShrink: 0 }}>{protokoly.includes(p.id)&&'✓'}</div>
                      <span style={{ flex: 1 }}>{p.label}</span>
                      {suggestedProto.includes(p.id) && <span title="Dodane automatycznie przez AI" style={{ color: '#f59e0b', fontSize: 16 }}>✦</span>}
                    </button>
                  ))}
                </div>

                <div style={{ border: '1px solid rgba(255,255,255,.1)', borderRadius: 12, overflow: 'hidden' }}>
                  <div style={{ padding: '8px 14px', background: 'rgba(255,255,255,.02)', borderBottom: '1px solid rgba(255,255,255,.06)', fontSize: 11, fontWeight: 600, letterSpacing: '.1em', color: '#e53030', textTransform: 'uppercase' }}>Dodatkowe dokumenty</div>
                  {DODATKOWE.map(d => (
                    <button key={d.id} onClick={()=>toggle(dodatkowe,setDodatkowe,d.id)} style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,.04)', cursor: 'pointer', textAlign: 'left', fontSize: 14, background: dodatkowe.includes(d.id)?'rgba(229,48,48,.06)':'transparent', border: 'none', color: '#d1d5db', minHeight: 52 }}>
                      <div style={{ width: 24, height: 24, borderRadius: 6, border: '2px solid '+(dodatkowe.includes(d.id)?'#e53030':'rgba(255,255,255,.15)'), background: dodatkowe.includes(d.id)?'#e53030':'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 14, flexShrink: 0 }}>{dodatkowe.includes(d.id)&&'✓'}</div>
                      <span>{d.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 3: SPIS TRESCI */}
            {step===3 && (
              <div className="fi">
                <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 6 }}>Spis treści (podgląd)</h2>
                <p style={{ fontSize: 14, color: '#9ca3af', marginBottom: 16 }}>Wygenerowany automatycznie. Możesz go zmienić pisząc w czacie np. „dodaj protokół oddymiania".</p>
                <div style={{ padding: '20px 24px', background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 12 }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#e53030', marginBottom: 4, textTransform: 'uppercase' }}>Dokumentacja powykonawcza</div>
                  <div style={{ fontSize: 14, color: '#9ca3af', marginBottom: 18 }}>{dane.find(d=>d.key==='nazwaInwestycji')?.value}</div>
                  <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 14 }}>Spis zawartości:</div>
                  {buildTOC().map((sec,si) => (
                    <div key={si} style={{ marginTop: 20 }}>
                      <div style={{ fontSize: 15, fontWeight: 600, color: '#e53030', marginBottom: 8 }}>{sec.title}</div>
                      <ol style={{ paddingLeft: 16, lineHeight: 1.9 }}>
                        {sec.items.map((item,ii) => <li key={ii} style={{ fontSize: 13, color: '#d1d5db', paddingLeft: 0 }}>{item}</li>)}
                      </ol>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 4: PODSUMOWANIE */}
            {step===4 && (
              <div className="fi">
                <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Podsumowanie</h2>
                <div style={{ padding: '14px 16px', background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 12, marginBottom: 12 }}>
                  <div style={{ fontSize: 11, color: '#6b7280', fontWeight: 600, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '.1em' }}>Dane budowy</div>
                  {dane.map((f,i) => <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: 14, borderBottom: '1px solid rgba(255,255,255,.04)' }}><span style={{ color: '#6b7280' }}>{f.label}</span><span style={{ fontWeight: 500, maxWidth: '55%', textAlign: 'right', color: '#fff' }}>{f.value}</span></div>)}
                </div>
                <div style={{ padding: '14px 16px', background: 'rgba(229,48,48,.03)', border: '1px solid rgba(229,48,48,.15)', borderRadius: 12, marginBottom: 12 }}>
                  <div style={{ fontSize: 11, color: '#6b7280', fontWeight: 600, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '.1em' }}>Dokumenty ({protokoly.length+dodatkowe.length})</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                    {[...protokoly,...dodatkowe].map(id => {
                      const nm = ALL_PROTOKOLY.find(x=>x.id===id)?.label || DODATKOWE.find(x=>x.id===id)?.label || id;
                      return <span key={id} style={{ padding: '4px 10px', background: 'rgba(229,48,48,.08)', border: '1px solid rgba(229,48,48,.15)', borderRadius: 6, fontSize: 12, color: '#ef4444' }}>{nm}</span>;
                    })}
                  </div>
                </div>
                <div style={{ padding: '14px 16px', background: 'rgba(59,130,246,.04)', border: '1px solid rgba(59,130,246,.15)', borderRadius: 12 }}>
                  <div style={{ fontSize: 14, color: '#9ca3af' }}>📁 Nowy folder na Google Drive:<br/><strong style={{ color: '#fff' }}>Azico / Dokumentacja / {(dane.find(d=>d.key==='nazwaInwestycji')?.value||'...').substring(0,60)}</strong></div>
                </div>
              </div>
            )}
          </div>

          {/* FOOTER */}
          <div style={{ padding: '12px 24px', borderTop: '1px solid rgba(255,255,255,.06)', background: 'rgba(255,255,255,.01)', display: 'flex', gap: 12, alignItems: 'center', justifyContent: 'flex-end' }}>
            {step>0 && !generating && !done && <button onClick={()=>setStep(step-1)} style={{ width: 120, padding: '12px', background: 'transparent', border: '1px solid rgba(255,255,255,.12)', borderRadius: 8, color: '#9ca3af', fontSize: 14, cursor: 'pointer', fontWeight: 500 }}>Wstecz</button>}
            {step===1 && !allOk && <button onClick={confirmAllData} style={{ padding: '12px 20px', background: 'rgba(34,197,94,.1)', border: '1px solid rgba(34,197,94,.25)', borderRadius: 8, color: '#22c55e', fontSize: 14, cursor: 'pointer', fontWeight: 500 }}>✓ Potwierdź wszystko</button>}
            {generating ? (
              <div style={{ flex: 1 }}>{GEN.map((s,i) => <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '2px 0', fontSize: 13, opacity: i<genStep?.5:i===genStep?1:.2 }}><div style={{ width: 6, height: 6, borderRadius: '50%', background: i<genStep?'#22c55e':i===genStep?'#e53030':'rgba(255,255,255,.15)', boxShadow: i===genStep?'0 0 8px #e53030':'none' }} className={i===genStep?'pd':''}/>{s}</div>)}</div>
            ) : done ? (
              <div className="fi" style={{ flex: 1, background: 'rgba(34,197,94,.06)', border: '1px solid rgba(34,197,94,.2)', borderRadius: 12, padding: '16px 20px', textAlign: 'center' }}>
                <div style={{ fontSize: 24, marginBottom: 4 }}>✅</div>
                <div style={{ fontWeight: 600, fontSize: 16, color: '#22c55e' }}>Dokumentacja wygenerowana!</div>
                <div style={{ margin: '8px auto', padding: '8px 14px', display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 8, fontSize: 14, color: 'rgba(255,255,255,.7)' }}>📁 Azico / Dokumentacja / {(dane.find(d=>d.key==='nazwaInwestycji')?.value||'').substring(0,40)}...</div>
                <div><button onClick={resetAll} style={{ marginTop: 10, padding: '10px 24px', minWidth: 180, background: 'rgba(34,197,94,.1)', border: '1px solid rgba(34,197,94,.25)', borderRadius: 8, color: '#22c55e', fontSize: 14, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}>+ Nowa dokumentacja</button></div>
                <div style={{ fontSize: 12, color: '#6b7280', marginTop: 8 }}>Naciśnij N lub Enter, aby rozpocząć nową dokumentację</div>
              </div>
            ) : step<4 ? (
              <button onClick={()=>{if(canNext())setStep(step+1);else addAi('Uzupełnij wymagane pola.');}} disabled={!canNext()} style={{ width: 200, padding: '12px', background: canNext()?'linear-gradient(135deg,#e53030,#b91c1c)':'rgba(255,255,255,.04)', border: 'none', borderRadius: 8, color: 'white', fontSize: 15, fontWeight: 600, cursor: canNext()?'pointer':'default', opacity: canNext()?1:.3, boxShadow: canNext()?'0 4px 15px rgba(229,48,48,.25)':'none' }}>Dalej</button>
            ) : (
              <button onClick={onGenerate} style={{ width: 200, padding: '14px', background: 'linear-gradient(135deg,#e53030,#991b1b)', border: 'none', borderRadius: 8, color: 'white', fontSize: 15, fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 25px rgba(229,48,48,.3)' }}>Generuj dokumentację</button>
            )}
          </div>
        </div>

        {/* RIGHT: CHAT */}
        {chatOpen ? (
          <div style={{ width: '30%', minWidth: 300, display: 'flex', flexDirection: 'column', background: 'rgba(255,255,255,.01)', borderLeft: '1px solid rgba(255,255,255,.06)', overflow: 'hidden' }}>
            <div style={{ padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,.06)', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 30, height: 30, borderRadius: 8, background: 'linear-gradient(135deg,#e53030,#ef4444)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15 }}>🤖</div>
              <div style={{ flex: 1 }}><div style={{ fontSize: 14, fontWeight: 600 }}>Asystent AI</div><div style={{ fontSize: 11, color: '#6b7280' }}>Pomaga z dokumentacją ppoż</div></div>
              <button onClick={()=>setChatOpen(false)} title="Zwiń panel" style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', fontSize: 18, padding: 4 }}>→</button>
            </div>
            <div style={{ flex: 1, overflow: 'auto', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {chat.map((m,i) => (
                <div key={i} className="fi" style={{ display: 'flex', flexDirection: 'column', alignItems: m.role==='user'?'flex-end':'flex-start' }}>
                  <div style={{ maxWidth: '88%', padding: '10px 14px', fontSize: 13, lineHeight: 1.6, whiteSpace: 'pre-line', borderRadius: 14,
                    ...(m.role==='user'?{background:'linear-gradient(135deg,#e53030,#b91c1c)',color:'white',borderBottomRightRadius:4}
                      :{background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.06)',borderBottomLeftRadius:4,color:'#d1d5db'}) }}>
                    {m.text}
                  </div>
                  <span style={{ fontSize: 10, color: '#6b7280', marginTop: 2, padding: '0 4px' }}>{m.time}</span>
                </div>
              ))}
              <div ref={chatEndRef}/>
            </div>
            <div style={{ padding: '10px 12px', borderTop: '1px solid rgba(255,255,255,.06)', display: 'flex', gap: 6 }}>
              <input value={chatIn} onChange={e=>setChatIn(e.target.value)} onKeyDown={e=>e.key==='Enter'&&!e.shiftKey&&onChat()}
                placeholder="Napisz uwagę lub pytanie..." style={{ flex: 1, padding: '10px 12px', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 10, color: '#e2e8f0', fontSize: 13, outline: 'none' }}
                onFocus={e=>e.target.style.borderColor='rgba(229,48,48,.3)'} onBlur={e=>e.target.style.borderColor='rgba(255,255,255,.08)'}/>
              <button onClick={onChat} style={{ padding: '10px 14px', borderRadius: 10, border: 'none', background: chatIn.trim()?'linear-gradient(135deg,#e53030,#b91c1c)':'rgba(255,255,255,.04)', color: chatIn.trim()?'white':'rgba(255,255,255,.2)', fontSize: 16, cursor: chatIn.trim()?'pointer':'default' }}>➤</button>
            </div>
          </div>
        ) : (
          <div style={{ width: 48, background: 'rgba(255,255,255,.01)', borderLeft: '1px solid rgba(255,255,255,.06)', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 12, gap: 8 }}>
            <button onClick={()=>setChatOpen(true)} title="Rozwiń panel AI" style={{ width: 36, height: 36, borderRadius: 8, background: 'linear-gradient(135deg,#e53030,#ef4444)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🤖</button>
            <button onClick={()=>setChatOpen(true)} style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', fontSize: 16 }}>←</button>
          </div>
        )}
      </div>
    </div>
  );
}
