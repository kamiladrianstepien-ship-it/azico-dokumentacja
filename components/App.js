'use client';
import { useState, useRef, useEffect } from "react";

// === DATA ===
const ZAKRES_OPTIONS = [
  { id: 'przejscia_konstrukcji', label: 'Zabezpieczenie ogniochronne przejsc konstrukcji', icon: '🔥' },
  { id: 'przejscia_instalacyjne', label: 'Zabezpieczenie przejsc instalacyjnych', icon: '🧱' },
  { id: 'obudowa_szachtu', label: 'Obudowa szachtu', icon: '📦' },
  { id: 'oddymianie', label: 'System oddymiania', icon: '🌫️' },
  { id: 'drzwi', label: 'Montaz drzwi ppoz / napowietrzajacych', icon: '🚪' },
  { id: 'klapy_dymowe', label: 'Montaz klap dymowych', icon: '💨' },
  { id: 'stolarka', label: 'Stolarka pozarowa', icon: '🏗️' },
  { id: 'kurtyna', label: 'Kurtyna dymowa', icon: '🎭' },
  { id: 'ssp', label: 'SSP', icon: '🔔' },
  { id: 'tryskacze', label: 'Tryskacze', icon: '💧' },
  { id: 'hydranty', label: 'Hydranty', icon: '🧯' },
  { id: 'oswietlenie', label: 'Oswietlenie ewakuacyjne', icon: '💡' },
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
  { id: 'oswiadczenie_wyk', label: 'Oswiadczenie wykonawcze Azico', always: true },
  { id: 'oswiadczenie_kier', label: 'Oswiadczenie kierownika budowy', always: true },
  { id: 'protokol_izolacji', label: 'Protokol z wykonania izolacji ppoz' },
  { id: 'raport_zabezpieczenia', label: 'Raport z wykonania zabezpieczenia ogniochronnego' },
  { id: 'protokol_drzwi', label: 'Protokol z montazu drzwi' },
  { id: 'wykaz_drzwi', label: 'Wykaz drzwi zamontowanych' },
  { id: 'protokol_klap', label: 'Protokol z montazu klap dymowych' },
  { id: 'protokol_oddymiania', label: 'Protokol sprawdzenia zadziałania oddymiania' },
  { id: 'pomiary_izolacji', label: 'Pomiary izolacji' },
  { id: 'pomiary_pe', label: 'Pomiary ciaglosci PE' },
  { id: 'ochrona_ppor', label: 'Ochrona przeciwporazeniowa' },
];

const DODATKOWE = [
  { id: 'strona_tytulowa', label: 'Strona tytulowa' },
  { id: 'spis_tresci', label: 'Spis tresci (automatyczny)' },
  { id: 'okladka_waski', label: 'Okladka segregatora - brzeg waski' },
  { id: 'okladka_szeroki', label: 'Okladka segregatora - brzeg szeroki' },
];

// Demo: co AI "wyciagnie" z plikow
const MOCK_RESULT = {
  dane: [
    { key: 'nazwaInwestycji', label: 'Nazwa inwestycji', value: 'Wykonanie zabezpieczenia ogniochronnego przejsc konstrukcji stalowej do klasy odpornosci ogniowej EI60 w budynku centrum logistycznego CTP ZAB3 - PSIBUFET w Zabrzu' },
    { key: 'adres', label: 'Adres obiektu', value: 'ul. Salomona Isaaca 5, 41-807 Zabrze' },
    { key: 'inwestor', label: 'Inwestor', value: 'CTP Invest Poland sp. z o.o., ul. Rondo ONZ 1, 00-124 Warszawa' },
    { key: 'generalnyWykonawca', label: 'Generalny wykonawca', value: 'YPERO S.A., ul. Kozierowskiego 2 lokal 203, 60-185 Skorzewo' },
    { key: 'klasyfikacja', label: 'Klasyfikacja ogniowa', value: 'EI60' },
    { key: 'dataStart', label: 'Data rozpoczecia', value: '23.10.2025' },
    { key: 'dataEnd', label: 'Data zakonczenia', value: '07.11.2025' },
  ],
  systemy: [
    { key: 's1', label: 'System / material', value: 'Flame Cabel Pasta A - Carboline Polska Sp. z o.o.' },
    { key: 's2', label: 'System / material', value: 'Frontrock Plus - Rockwool Polska Sp. z o.o.' },
  ],
  certyfikaty: [
    { key: 'c1', label: 'Certyfikat', value: 'Certyfikat Stalosci Wlasciwosci Uzytkowych 1488-CPR-0538/W' },
    { key: 'c2', label: 'Deklaracja', value: 'DoP FCPA-005-1-2023-06-02' },
    { key: 'c3', label: 'ETA', value: 'Europejska Ocena Techniczna ETA 15/0853' },
    { key: 'c4', label: 'IDT', value: 'Indywidualna Dokumentacja Techniczna nr 445/2025' },
  ],
  branze: ['budowlana'],
  zakresy: ['przejscia_konstrukcji'],
  typDok: 'standard',
  kierownik: 'Artur Stepien',
};

function getTime() { return new Date().toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' }); }

// === LOGO ===
function Logo({ h = 32 }) {
  return (
    <svg viewBox="0 0 280 60" height={h} xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="14" width="22" height="38" rx="2" fill="#dc2626"/>
      {[17,25,33,41].map(y => [7,13,19].map(x => <rect key={x+'-'+y} x={x} y={y} width="4" height="5" rx=".5" fill="#0b0e14" opacity=".3"/>))}
      <path d="M15 14L15 8Q15 5 18 5L22 5" stroke="#aaa" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      <circle cx="15" cy="8" r="2.2" fill="#dc2626"/><circle cx="15" cy="8" r="1" fill="#fff" opacity=".4"/>
      <ellipse cx="15" cy="53" rx="15" ry="3" fill="#dc2626" opacity=".5"/>
      <text x="38" y="44" fontFamily="Arial Black,Arial,sans-serif" fontWeight="900" fontSize="40" fill="#dc2626" letterSpacing="1">AZICO</text>
      <text x="210" y="44" fontFamily="Arial Black,Arial,sans-serif" fontWeight="900" fontSize="40" fill="#dc2626">.PL</text>
    </svg>
  );
}

// === MAIN APP ===
export default function App({ onLogout }) {
  const [step, setStep] = useState(0);
  const [files, setFiles] = useState([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);

  // AI-extracted (after analysis)
  const [dane, setDane] = useState([]);
  const [systemy, setSystemy] = useState([]);
  const [certy, setCerty] = useState([]);
  const [branze, setBranze] = useState([]);
  const [zakresy, setZakresy] = useState([]);
  const [typDok, setTypDok] = useState('standard');
  const [kierownik, setKierownik] = useState('');
  const [protokoly, setProtokoly] = useState([]);
  const [dodatkowe, setDodatkowe] = useState(['strona_tytulowa', 'spis_tresci']);

  const [generating, setGenerating] = useState(false);
  const [genStep, setGenStep] = useState(0);
  const [done, setDone] = useState(false);

  const [chat, setChat] = useState([
    { role: 'ai', text: 'Witaj! Wgraj dokumenty - projekty, umowy, atesty, certyfikaty.\n\nWyciagne z nich wszystkie dane automatycznie. Ty tylko sprawdzisz i potwierdzisz.', time: getTime() }
  ]);
  const [chatIn, setChatIn] = useState('');
  const chatEnd = useRef(null);
  const fileRef = useRef(null);

  useEffect(() => { chatEnd.current?.scrollIntoView({ behavior: 'smooth' }); }, [chat]);
  const ai = (t) => setChat(c => [...c, { role: 'ai', text: t, time: getTime() }]);
  const toggle = (arr, set, id) => set(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);

  // Step 1: Upload
  const onFiles = (e) => {
    const nf = Array.from(e.target.files || []).map(f => ({ name: f.name, size: (f.size/1024/1024).toFixed(1)+' MB', status: 'ready' }));
    setFiles(p => [...p, ...nf]);
    ai('Przyjalem: ' + nf.map(f => f.name).join(', ') + '.\n\nKliknij "Analizuj pliki" gdy wgrasz wszystko.');
  };

  // Step 1: Analyze -> scans file names to detect branze, zakresy, etc.
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

        // Smart detection from file names
        const allNames = files.map(f => f.name.toLowerCase()).join(' ');

        // Detect branze
        const detectedBranze = [];
        if (allNames.includes('budowlan') || allNames.includes('szacht') || allNames.includes('obudow') || allNames.includes('izolacj') || allNames.includes('przejsc') || allNames.includes('drzwi') || allNames.includes('klap')) detectedBranze.push('budowlana');
        if (allNames.includes('elektr') || allNames.includes('pomiary') || allNames.includes('oddymi') || allNames.includes('ssp') || allNames.includes('czujk') || allNames.includes('central') || allNames.includes('okablow')) detectedBranze.push('elektryczna');
        if (allNames.includes('sanitar') || allNames.includes('hydrant') || allNames.includes('tryskai') || allNames.includes('wod')) detectedBranze.push('sanitarna');
        if (!detectedBranze.length) detectedBranze.push('budowlana');

        // Detect zakresy
        const detectedZakresy = [];
        if (allNames.includes('przejsc') || allNames.includes('konstrukcj')) detectedZakresy.push('przejscia_konstrukcji');
        if (allNames.includes('przejsc') && allNames.includes('instalac')) detectedZakresy.push('przejscia_instalacyjne');
        if (allNames.includes('szacht') || allNames.includes('obudow')) detectedZakresy.push('obudowa_szachtu');
        if (allNames.includes('oddymi') || allNames.includes('oddymiania')) detectedZakresy.push('oddymianie');
        if (allNames.includes('drzwi') || allNames.includes('napowietrz')) detectedZakresy.push('drzwi');
        if (allNames.includes('klap') && (allNames.includes('dymow') || allNames.includes('dymowych'))) detectedZakresy.push('klapy_dymowe');
        if (allNames.includes('stolark')) detectedZakresy.push('stolarka');
        if (allNames.includes('kurtyn')) detectedZakresy.push('kurtyna');
        if (allNames.includes('ssp') || allNames.includes('sygnalizacj')) detectedZakresy.push('ssp');
        if (allNames.includes('tryskai') || allNames.includes('tryskacz')) detectedZakresy.push('tryskacze');
        if (allNames.includes('hydrant')) detectedZakresy.push('hydranty');
        if (allNames.includes('oswietl') || allNames.includes('ewakuac')) detectedZakresy.push('oswietlenie');
        if (allNames.includes('dso') || allNames.includes('dzwiekow')) detectedZakresy.push('dso');
        if (!detectedZakresy.length) detectedZakresy.push('przejscia_konstrukcji');

        // Detect extra certyfikaty from file names
        const detectedCerty = [...MOCK_RESULT.certyfikaty];
        if (allNames.includes('promat') || allNames.includes('promaduct')) {
          detectedCerty.push({ key: 'c_extra1', label: 'Deklaracja', value: 'Deklaracja Wlasciwosci Uzytkowych - PROMATECT-L500' });
          detectedCerty.push({ key: 'c_extra2', label: 'KOT', value: 'Krajowa Ocena Techniczna ITB-KOT-2021/1924' });
        }
        if (allNames.includes('askon') || allNames.includes('klap')) {
          detectedCerty.push({ key: 'c_extra3', label: 'Certyfikat', value: 'Certyfikat Stalosci Wlasciwosci Uzytkowych 1488-CPR-0309/W (Askon Fire)' });
          detectedCerty.push({ key: 'c_extra4', label: 'Swiadectwo', value: 'Swiadectwo dopuszczenia nr 4406/2021' });
        }

        // Fill state
        setDane(MOCK_RESULT.dane.map(x => ({ ...x, confirmed: false, source: 'AI' })));
        setSystemy(MOCK_RESULT.systemy.map(x => ({ ...x, confirmed: false, source: 'AI' })));
        setCerty(detectedCerty.map(x => ({ ...x, confirmed: false, source: x.source || 'AI' })));
        setBranze([...new Set(detectedBranze)]);
        setZakresy([...new Set(detectedZakresy)]);
        setTypDok('standard');
        setKierownik(MOCK_RESULT.kierownik);

        // Auto-suggest protocols based on detected zakresy
        const sugg = new Set(['oswiadczenie_wyk', 'oswiadczenie_kier']);
        [...new Set(detectedZakresy)].forEach(z => { (PROTOKOL_MAP[z] || []).forEach(pr => sugg.add(pr)); });
        setProtokoly([...sugg]);

        setStep(1);

        const branzeStr = [...new Set(detectedBranze)].join(', ');
        const zakreszStr = [...new Set(detectedZakresy)].map(z => ZAKRES_OPTIONS.find(o => o.id === z)?.label || z).join(', ');

        ai('Analiza zakonczona! Wyciagnalem:\n\n' +
          '- Dane budowy: ' + MOCK_RESULT.dane.length + ' pol\n' +
          '- Systemy i materialy: ' + MOCK_RESULT.systemy.length + '\n' +
          '- Certyfikaty: ' + detectedCerty.length + '\n' +
          '- Branze: ' + branzeStr + '\n' +
          '- Zakres prac: ' + zakreszStr + '\n' +
          '- Kierownik: Artur Stepien\n' +
          '- Sugerowane protokoly: ' + sugg.size + '\n\n' +
          'Sprawdz dane i potwierdz w kolejnych krokach.');
      }, 500); }
      setProgress(Math.min(p, 100));
    }, 250);
  };

  // Confirm helpers
  const confirmField = (arr, set, i) => set(p => { const n=[...p]; n[i]={...n[i], confirmed:!n[i].confirmed}; return n; });
  const confirmAllArr = (arr, set) => { const all = arr.every(x => x.confirmed); set(p => p.map(x => ({ ...x, confirmed: !all }))); };
  const editField = (arr, set, i, v) => set(p => { const n=[...p]; n[i]={...n[i], value:v, confirmed:true, source:'Reczna edycja'}; return n; });
  const allDaneOk = dane.length > 0 && dane.every(x => x.confirmed) && systemy.every(x => x.confirmed) && certy.every(x => x.confirmed);

  // TOC builder
  const buildTOC = () => {
    const secs = [];
    const s1 = { title: 'I. Oswiadczenia, uprawnienia, protokoly', items: [] };
    protokoly.forEach(pid => { const p = ALL_PROTOKOLY.find(x => x.id === pid); if (p) s1.items.push(p.label); });
    s1.items.push('Uprawnienia budowlane - ' + kierownik);
    s1.items.push('Zaswiadczenie o przynaleznosci do Izby Inzynierow Budownictwa');
    secs.push(s1);
    branze.forEach((b, i) => {
      const sec = { title: ['II','III','IV','V'][i] + '. Karty materialowe - branza ' + b, items: [] };
      certy.forEach(c => sec.items.push(c.value));
      systemy.forEach(s => sec.items.push('Karta produktowa: ' + s.value));
      secs.push(sec);
    });
    secs.push({ title: ['II','III','IV','V'][branze.length] + '. Rysunki powykonawcze', items: ['Rzuty i rysunki z wgranych plikow'] });
    return secs;
  };

  // Chat - with TOC/protocol editing commands
  const onChat = () => {
    if (!chatIn.trim()) return;
    const m = chatIn.trim(); setChatIn('');
    setChat(c => [...c, { role: 'user', text: m, time: getTime() }]);
    setTimeout(() => {
      const l = m.toLowerCase();
      let r = 'Rozumiem, uwzglednie to.';
      let acted = false;

      // ADD protocol/document
      if (l.includes('dodaj')) {
        ALL_PROTOKOLY.forEach(p => {
          if (l.includes(p.label.toLowerCase().substring(0, 15)) || 
              (l.includes('izolacj') && p.id === 'protokol_izolacji') ||
              (l.includes('pomiar') && l.includes('izolacj') && p.id === 'pomiary_izolacji') ||
              (l.includes('pomiar') && l.includes('pe') && p.id === 'pomiary_pe') ||
              (l.includes('pomiar') && l.includes('ciaglosc') && p.id === 'pomiary_pe') ||
              (l.includes('ochrona') && l.includes('przeciw') && p.id === 'ochrona_ppor') ||
              (l.includes('oddymi') && p.id === 'protokol_oddymiania') ||
              (l.includes('drzwi') && p.id === 'protokol_drzwi') ||
              (l.includes('wykaz') && l.includes('drzwi') && p.id === 'wykaz_drzwi') ||
              (l.includes('klap') && p.id === 'protokol_klap') ||
              (l.includes('raport') && p.id === 'raport_zabezpieczenia')) {
            if (!protokoly.includes(p.id)) {
              setProtokoly(prev => [...prev, p.id]);
              r = 'Dodalem: "' + p.label + '" do listy dokumentow. Zobaczysz to w kroku Protokoly i Spisie tresci.';
              acted = true;
            } else {
              r = '"' + p.label + '" jest juz na liscie.';
              acted = true;
            }
          }
        });
        if (!acted && l.includes('dodaj')) {
          r = 'Powiedz dokladniej co dodac, np.:\n- "dodaj protokol oddymiania"\n- "dodaj pomiary izolacji"\n- "dodaj wykaz drzwi"\n- "dodaj ochrone przeciwporazeniowa"';
          acted = true;
        }
      }

      // REMOVE protocol/document
      if (l.includes('usun') || l.includes('usunac') || l.includes('wyrzuc') || l.includes('zabierz')) {
        ALL_PROTOKOLY.forEach(p => {
          if (l.includes(p.label.toLowerCase().substring(0, 15)) ||
              (l.includes('izolacj') && !l.includes('pomiar') && p.id === 'protokol_izolacji') ||
              (l.includes('pomiar') && l.includes('izolacj') && p.id === 'pomiary_izolacji') ||
              (l.includes('pomiar') && l.includes('pe') && p.id === 'pomiary_pe') ||
              (l.includes('pomiar') && l.includes('ciaglosc') && p.id === 'pomiary_pe') ||
              (l.includes('ochrona') && l.includes('przeciw') && p.id === 'ochrona_ppor') ||
              (l.includes('oddymi') && p.id === 'protokol_oddymiania') ||
              (l.includes('drzwi') && !l.includes('wykaz') && p.id === 'protokol_drzwi') ||
              (l.includes('wykaz') && p.id === 'wykaz_drzwi') ||
              (l.includes('klap') && p.id === 'protokol_klap') ||
              (l.includes('raport') && p.id === 'raport_zabezpieczenia')) {
            if (protokoly.includes(p.id)) {
              setProtokoly(prev => prev.filter(x => x !== p.id));
              r = 'Usuniety: "' + p.label + '" z listy dokumentow.';
              acted = true;
            }
          }
        });
        if (!acted && (l.includes('usun') || l.includes('wyrzuc'))) {
          r = 'Powiedz dokladniej co usunac, np.:\n- "usun pomiary PE"\n- "usun ochrone przeciwporazeniowa"\n- "usun protokol oddymiania"';
          acted = true;
        }
      }

      // Other commands
      if (!acted) {
        if (l.includes('hilti') || l.includes('promat') || l.includes('zamien')) r = 'Podmienie system i atesty we wszystkich protokolach.';
        else if (l.includes('termin') || l.includes('data')) r = 'Zaktualizuje daty.';
        else if (l.includes('atest') || l.includes('certyfikat')) r = 'Dodam do zestawienia.';
        else if (l.includes('branz') && l.includes('elektr')) { setBranze(p => p.includes('elektryczna') ? p : [...p, 'elektryczna']); r = 'Dodalem branze elektryczna.'; }
        else if (l.includes('branz') && l.includes('sanitar')) { setBranze(p => p.includes('sanitarna') ? p : [...p, 'sanitarna']); r = 'Dodalem branze sanitarna.'; }
        else if (l.includes('pomoc') || l.includes('jak') || l.includes('co mog')) r = 'Moge edytowac dokumentacje. Napisz np.:\n- "dodaj protokol oddymiania"\n- "usun pomiary PE"\n- "dodaj branze elektryczna"\n- "podmien system na Hilti"';
        else if (l.includes('spis') || l.includes('tresci')) r = 'Spis tresci generuje sie automatycznie z wybranych protokolow. Napisz "dodaj..." lub "usun..." zeby go zmienic.';
      }

      ai(r);
    }, 500);
  };

  // Generate
  const GEN = ['Tworze folder na Drive...','Generuje strone tytulowa...','Generuje oswiadczenia...','Generuje protokoly...','Tworze spis tresci...','Dolaczam karty materialowe...','Dolaczam uprawnienia...','Walidacja...','Zapisuje na Drive...'];
  const onGenerate = () => {
    setGenerating(true); setGenStep(0);
    GEN.forEach((_, i) => setTimeout(() => setGenStep(i+1), (i+1)*700));
    setTimeout(() => {
      setGenerating(false); setDone(true);
      const nm = dane.find(d => d.key === 'nazwaInwestycji')?.value || 'Nowa budowa';
      ai('Dokumentacja gotowa!\n\n' + protokoly.length + ' dokumentow.\nFolder: Azico / Dokumentacja / ' + nm.substring(0,50) + '...');
    }, GEN.length*700+500);
  };

  const canNext = () => {
    if (step === 0) return dane.length > 0; // analyzed
    if (step === 1) return allDaneOk;
    if (step === 2) return protokoly.length > 0;
    if (step === 3) return true;
    return true;
  };

  // Styles
  const C = { padding: '16px 18px', background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.06)', borderRadius: 12, marginBottom: 12 };
  const redBg = (on) => ({ background: on ? 'rgba(239,68,68,.08)' : 'rgba(255,255,255,.02)', border: '1px solid ' + (on ? 'rgba(239,68,68,.25)' : 'rgba(255,255,255,.06)') });
  const greenBg = (on) => ({ background: on ? 'rgba(34,197,94,.04)' : 'rgba(255,255,255,.02)', border: '1px solid ' + (on ? 'rgba(34,197,94,.2)' : 'rgba(255,255,255,.06)') });

  const STEPS = ['Wgraj pliki', 'Sprawdz dane', 'Protokoly', 'Spis tresci', 'Generuj'];

  return (
    <div style={{ minHeight: '100vh', background: '#0b0e14', fontFamily: "'DM Sans',system-ui,sans-serif", color: '#e2e8f0', fontSize: 15, display: 'flex', flexDirection: 'column' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:4px} ::-webkit-scrollbar-track{background:transparent} ::-webkit-scrollbar-thumb{background:rgba(255,255,255,.08);border-radius:10px}
        input,textarea,select,button{font-family:inherit}
        @keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.5)}}
        .fi{animation:fadeIn .3s ease-out} .pd{animation:pulse 1s infinite}
      `}</style>

      {/* HEADER */}
      <header style={{ borderBottom: '1px solid rgba(255,255,255,.06)', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(180deg,rgba(200,30,30,.06),transparent)', position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Logo h={32} />
          <div style={{ height: 28, width: 1, background: 'rgba(255,255,255,.1)' }} />
          <div style={{ fontWeight: 700, fontSize: 19, letterSpacing: '.03em', textTransform: 'uppercase' }}>Dokumentacja powykonawcza</div>
        </div>
        <div style={{ position: 'absolute', right: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 6px rgba(34,197,94,.5)' }} />
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,.3)' }}>AI Online</span>
          <span style={{ color: 'rgba(255,255,255,.08)' }}>|</span>
          <button onClick={onLogout} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,.2)', fontSize: 12, cursor: 'pointer' }}>Wyloguj</button>
        </div>
      </header>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* LEFT */}
        <div style={{ flex: '1 1 60%', display: 'flex', flexDirection: 'column', borderRight: '1px solid rgba(255,255,255,.05)', overflow: 'hidden' }}>

          {/* STEPS */}
          <div style={{ display: 'flex', padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,.05)', background: 'rgba(255,255,255,.01)' }}>
            {STEPS.map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                <button onClick={() => { if (i <= step) setStep(i); }} style={{
                  display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8, border: 'none',
                  background: step === i ? 'rgba(200,30,30,.12)' : 'transparent',
                  color: step === i ? '#ef4444' : i < step ? 'rgba(255,255,255,.5)' : 'rgba(255,255,255,.2)',
                  cursor: i <= step ? 'pointer' : 'default', fontSize: 13, fontWeight: step === i ? 600 : 400, whiteSpace: 'nowrap',
                }}>
                  <span style={{ width: 22, height: 22, borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700,
                    background: i < step ? '#22c55e' : step === i ? '#dc2626' : 'rgba(255,255,255,.06)', color: i <= step ? 'white' : 'rgba(255,255,255,.25)' }}>
                    {i < step ? '✓' : i + 1}
                  </span>
                  {s}
                </button>
                {i < STEPS.length - 1 && <div style={{ flex: 1, height: 1, background: i < step ? 'rgba(34,197,94,.25)' : 'rgba(255,255,255,.05)', margin: '0 4px', minWidth: 8 }} />}
              </div>
            ))}
          </div>

          {/* CONTENT */}
          <div style={{ flex: 1, overflow: 'auto', padding: 24 }}>

            {/* STEP 0: PLIKI */}
            {step === 0 && (
              <div className="fi">
                <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 6 }}>Zrodlo dokumentow</h2>
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,.4)', marginBottom: 16 }}>Wskazz folder budowy lub wgraj pliki recznie. AI sam znajdzie i wyciagnie potrzebne dane.</p>

                {/* OPTION A: Google Drive folder */}
                <div style={{ padding: '20px', background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.06)', borderRadius: 14, marginBottom: 12, cursor: 'pointer', transition: 'all .2s' }}
                  onClick={() => {
                    ai('Google Drive Picker bedzie dostepny w produkcyjnej wersji.\n\nNa razie wgraj pliki recznie przyciskiem ponizej.');
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor='rgba(66,133,244,.4)'; e.currentTarget.style.background='rgba(66,133,244,.04)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor='rgba(255,255,255,.06)'; e.currentTarget.style.background='rgba(255,255,255,.02)'; }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(66,133,244,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="24" height="22" viewBox="0 0 24 22"><path d="M4.4 22l3-5.2H22l-3 5.2H4.4z" fill="#3777E3"/><path d="M15 10L11 3l3-3h6l-3 4.5L15 10z" fill="#FFCF63"/><path d="M2 16.8L5.5 10h7L9 16.8H2z" fill="#11A861"/></svg>
                    </div>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 600 }}>Podlacz folder z Google Drive</div>
                      <div style={{ fontSize: 13, color: 'rgba(255,255,255,.35)', marginTop: 2 }}>Wskazz folder budowy — AI sam przejrzy pliki i wyciagnie dane</div>
                    </div>
                    <div style={{ marginLeft: 'auto', fontSize: 13, color: 'rgba(66,133,244,.8)', fontWeight: 500, padding: '6px 14px', background: 'rgba(66,133,244,.08)', borderRadius: 8 }}>Wybierz folder</div>
                  </div>
                </div>

                {/* Divider */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '16px 0' }}>
                  <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,.06)' }} />
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,.2)' }}>lub</span>
                  <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,.06)' }} />
                </div>

                {/* OPTION B: Manual upload */}
                <div onClick={() => fileRef.current?.click()} style={{ border: '2px dashed rgba(255,255,255,.08)', borderRadius: 14, padding: '28px', textAlign: 'center', cursor: 'pointer', marginBottom: 12 }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor='rgba(239,68,68,.3)'; e.currentTarget.style.background='rgba(239,68,68,.02)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor='rgba(255,255,255,.08)'; e.currentTarget.style.background='transparent'; }}>
                  <input ref={fileRef} type="file" multiple accept=".pdf,.docx,.doc,.xlsx,.jpg,.png,.dwg" onChange={onFiles} style={{ display: 'none' }} />
                  <div style={{ fontSize: 32, marginBottom: 8 }}>📂</div>
                  <div style={{ fontSize: 15, color: 'rgba(255,255,255,.45)', fontWeight: 500 }}>Wgraj pliki recznie z komputera</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,.2)', marginTop: 4 }}>PDF, DOCX, XLSX, JPG, DWG</div>
                </div>

                {/* Hint: what files */}
                <div style={{ padding: '12px 16px', background: 'rgba(255,255,255,.015)', border: '1px solid rgba(255,255,255,.04)', borderRadius: 10, marginBottom: 16, fontSize: 13, color: 'rgba(255,255,255,.3)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 16px' }}>
                  <div>📐 Projekt / dokumentacja projektowa</div>
                  <div>📋 Umowa / zlecenie</div>
                  <div>📜 Certyfikaty, atesty, deklaracje</div>
                  <div>📏 Rysunki powykonawcze</div>
                  <div>📷 Zdjecia z budowy (opcjonalnie)</div>
                  <div>📄 Wytyczne klienta (jesli sa)</div>
                </div>

                {/* Uploaded files list */}
                {files.map((f, i) => (
                  <div key={i} className="fi" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.06)', borderRadius: 10, marginBottom: 6 }}>
                    <span style={{ fontSize: 18 }}>📄</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</div>
                      <div style={{ fontSize: 12, color: 'rgba(255,255,255,.25)' }}>{f.size}</div>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 500, color: f.status === 'analyzed' ? '#22c55e' : f.status === 'analyzing' ? '#f59e0b' : 'rgba(255,255,255,.3)' }}>
                      {f.status === 'analyzed' ? '✓ Gotowy' : f.status === 'analyzing' ? 'Analizuje...' : 'Wgrany'}
                    </span>
                    <button onClick={() => setFiles(p => p.filter((_,idx) => idx!==i))} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,.15)', cursor: 'pointer', fontSize: 16 }}>✕</button>
                  </div>
                ))}

                {/* Analyze button */}
                {files.length > 0 && !analyzing && !dane.length && (
                  <button onClick={onAnalyze} style={{ width: '100%', marginTop: 16, padding: '16px', background: 'linear-gradient(135deg,#dc2626,#b91c1c)', border: 'none', borderRadius: 12, color: 'white', fontSize: 15, fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 20px rgba(220,38,38,.25)' }}>
                    🔍 Analizuj pliki - AI wyciagnie dane
                  </button>
                )}

                {/* Progress bar */}
                {analyzing && (
                  <div style={{ marginTop: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'rgba(255,255,255,.4)', marginBottom: 6 }}>
                      <span>AI przegladal pliki i wyciaga dane...</span><span>{Math.round(progress)}%</span>
                    </div>
                    <div style={{ height: 5, background: 'rgba(255,255,255,.06)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: progress+'%', background: 'linear-gradient(90deg,#dc2626,#ef4444)', borderRadius: 3, transition: 'width .3s' }} />
                    </div>
                  </div>
                )}

                {/* Analysis result summary */}
                {dane.length > 0 && (
                  <div className="fi" style={{ marginTop: 16, padding: '16px 18px', background: 'rgba(34,197,94,.06)', border: '1px solid rgba(34,197,94,.2)', borderRadius: 12 }}>
                    <div style={{ fontWeight: 600, color: '#22c55e', marginBottom: 8, fontSize: 15 }}>AI wyciagnal dane z plikow</div>
                    <div style={{ fontSize: 14, color: 'rgba(255,255,255,.5)', lineHeight: 1.7 }}>
                      Dane budowy: {dane.length} pol | Systemy: {systemy.length} | Certyfikaty: {certy.length}<br/>
                      Branze: {branze.join(', ')} | Zakres: {zakresy.map(z => ZAKRES_OPTIONS.find(o => o.id === z)?.label).join(', ')}<br/>
                      Kierownik: {kierownik} | Sugerowane protokoly: {protokoly.length}
                    </div>
                    <div style={{ fontSize: 13, color: '#22c55e', marginTop: 10 }}>Kliknij "Dalej" aby sprawdzic i potwierdzic dane.</div>
                  </div>
                )}
              </div>
            )}

            {/* STEP 1: SPRAWDZ DANE */}
            {step === 1 && (
              <div className="fi">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <h2 style={{ fontSize: 18, fontWeight: 600 }}>Sprawdz wyciagniete dane</h2>
                  <button onClick={() => { confirmAllArr(dane, setDane); confirmAllArr(systemy, setSystemy); confirmAllArr(certy, setCerty); }}
                    style={{ padding: '8px 16px', background: allDaneOk ? 'rgba(239,68,68,.1)' : 'rgba(34,197,94,.08)', border: '1px solid ' + (allDaneOk ? 'rgba(239,68,68,.25)' : 'rgba(34,197,94,.2)'), borderRadius: 8, color: allDaneOk ? '#ef4444' : '#22c55e', fontSize: 13, fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                    {allDaneOk ? '✕ Odznacz' : '✓ Potwierdz wszystko'}
                  </button>
                </div>

                {/* Dane budowy */}
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,.3)', fontWeight: 600, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>Dane budowy</div>
                {dane.map((f, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', ...greenBg(f.confirmed), borderRadius: 10, marginBottom: 4, transition: 'all .2s' }}>
                    <div style={{ width: 110, fontSize: 13, color: 'rgba(255,255,255,.4)', fontWeight: 500, flexShrink: 0 }}>{f.label}</div>
                    <input value={f.value} onChange={e => editField(dane, setDane, i, e.target.value)} style={{ flex: 1, padding: '5px 8px', background: 'transparent', border: '1px solid transparent', borderRadius: 6, color: '#e2e8f0', fontSize: 14, outline: 'none' }}
                      onFocus={e => { e.target.style.borderColor='rgba(239,68,68,.3)'; e.target.style.background='rgba(255,255,255,.02)'; }}
                      onBlur={e => { e.target.style.borderColor='transparent'; e.target.style.background='transparent'; }} />
                    <button onClick={() => confirmField(dane, setDane, i)} style={{ width: 28, height: 28, borderRadius: 7, border: '1px solid ' + (f.confirmed ? 'rgba(34,197,94,.4)' : 'rgba(255,255,255,.1)'), background: f.confirmed ? 'rgba(34,197,94,.15)' : 'transparent', color: f.confirmed ? '#22c55e' : 'rgba(255,255,255,.2)', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>✓</button>
                  </div>
                ))}

                <div style={{ fontSize: 13, color: 'rgba(255,255,255,.3)', fontWeight: 600, margin: '16px 0 8px', textTransform: 'uppercase', letterSpacing: 1 }}>Systemy i materialy</div>
                {systemy.map((f, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', ...greenBg(f.confirmed), borderRadius: 10, marginBottom: 4 }}>
                    <div style={{ width: 110, fontSize: 13, color: 'rgba(255,255,255,.4)', fontWeight: 500, flexShrink: 0 }}>{f.label}</div>
                    <input value={f.value} onChange={e => editField(systemy, setSystemy, i, e.target.value)} style={{ flex: 1, padding: '5px 8px', background: 'transparent', border: '1px solid transparent', borderRadius: 6, color: '#e2e8f0', fontSize: 14, outline: 'none' }}
                      onFocus={e => { e.target.style.borderColor='rgba(239,68,68,.3)'; e.target.style.background='rgba(255,255,255,.02)'; }}
                      onBlur={e => { e.target.style.borderColor='transparent'; e.target.style.background='transparent'; }} />
                    <button onClick={() => confirmField(systemy, setSystemy, i)} style={{ width: 28, height: 28, borderRadius: 7, border: '1px solid ' + (f.confirmed ? 'rgba(34,197,94,.4)' : 'rgba(255,255,255,.1)'), background: f.confirmed ? 'rgba(34,197,94,.15)' : 'transparent', color: f.confirmed ? '#22c55e' : 'rgba(255,255,255,.2)', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>✓</button>
                  </div>
                ))}

                <div style={{ fontSize: 13, color: 'rgba(255,255,255,.3)', fontWeight: 600, margin: '16px 0 8px', textTransform: 'uppercase', letterSpacing: 1 }}>Certyfikaty i atesty</div>
                {certy.map((f, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', ...greenBg(f.confirmed), borderRadius: 10, marginBottom: 4 }}>
                    <div style={{ width: 110, fontSize: 13, color: 'rgba(255,255,255,.4)', fontWeight: 500, flexShrink: 0 }}>{f.label}</div>
                    <input value={f.value} onChange={e => editField(certy, setCerty, i, e.target.value)} style={{ flex: 1, padding: '5px 8px', background: 'transparent', border: '1px solid transparent', borderRadius: 6, color: '#e2e8f0', fontSize: 14, outline: 'none' }}
                      onFocus={e => { e.target.style.borderColor='rgba(239,68,68,.3)'; e.target.style.background='rgba(255,255,255,.02)'; }}
                      onBlur={e => { e.target.style.borderColor='transparent'; e.target.style.background='transparent'; }} />
                    <button onClick={() => confirmField(certy, setCerty, i)} style={{ width: 28, height: 28, borderRadius: 7, border: '1px solid ' + (f.confirmed ? 'rgba(34,197,94,.4)' : 'rgba(255,255,255,.1)'), background: f.confirmed ? 'rgba(34,197,94,.15)' : 'transparent', color: f.confirmed ? '#22c55e' : 'rgba(255,255,255,.2)', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>✓</button>
                  </div>
                ))}

                {/* AI-detected config */}
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,.3)', fontWeight: 600, margin: '16px 0 8px', textTransform: 'uppercase', letterSpacing: 1 }}>Wykryte przez AI</div>
                <div style={{ ...C, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,.4)', width: '100%', marginBottom: 4 }}>Branze:</div>
                  {['budowlana','elektryczna','sanitarna'].map(b => (
                    <button key={b} onClick={() => toggle(branze, setBranze, b)} style={{ padding: '8px 16px', borderRadius: 8, fontSize: 13, cursor: 'pointer', ...redBg(branze.includes(b)), color: '#e2e8f0' }}>
                      {branze.includes(b) && '✓ '}{b}
                    </button>
                  ))}
                </div>
                <div style={{ ...C, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,.4)', width: '100%', marginBottom: 4 }}>Zakres prac:</div>
                  {ZAKRES_OPTIONS.map(z => (
                    <button key={z.id} onClick={() => toggle(zakresy, setZakresy, z.id)} style={{ padding: '6px 12px', borderRadius: 8, fontSize: 12, cursor: 'pointer', ...redBg(zakresy.includes(z.id)), color: '#e2e8f0' }}>
                      {z.icon} {z.label} {zakresy.includes(z.id) && '✓'}
                    </button>
                  ))}
                </div>
                <div style={C}>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,.4)', marginBottom: 4 }}>Kierownik budowy:</div>
                  <input value={kierownik} onChange={e => setKierownik(e.target.value)} style={{ width: '100%', padding: '10px 12px', background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 8, color: '#e2e8f0', fontSize: 14, outline: 'none' }} />
                </div>

                {allDaneOk && <div className="fi" style={{ marginTop: 12, padding: '12px', background: 'rgba(34,197,94,.06)', border: '1px solid rgba(34,197,94,.2)', borderRadius: 12, fontSize: 14, color: '#22c55e', textAlign: 'center' }}>Wszystkie dane potwierdzone</div>}
              </div>
            )}

            {/* STEP 2: PROTOKOLY */}
            {step === 2 && (
              <div className="fi">
                <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 6 }}>Dokumenty do wygenerowania</h2>
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,.4)', marginBottom: 16 }}>AI zasugerowalo na podstawie zakresu. Mozesz dodac lub usunac.</p>

                <div style={{ fontSize: 13, color: 'rgba(255,255,255,.3)', fontWeight: 600, marginBottom: 8 }}>PROTOKOLY I OSWIADCZENIA</div>
                {ALL_PROTOKOLY.map(p => (
                  <button key={p.id} onClick={() => toggle(protokoly, setProtokoly, p.id)} style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '12px 16px', marginBottom: 4, borderRadius: 10, cursor: 'pointer', textAlign: 'left', fontSize: 14, ...redBg(protokoly.includes(p.id)), color: '#e2e8f0' }}>
                    <span style={{ flex: 1 }}>{p.label}{p.always ? ' (zawsze)' : ''}</span>
                    {protokoly.includes(p.id) && <span style={{ color: '#22c55e', fontSize: 16 }}>✓</span>}
                  </button>
                ))}

                <div style={{ fontSize: 13, color: 'rgba(255,255,255,.3)', fontWeight: 600, margin: '16px 0 8px' }}>DODATKOWE</div>
                {DODATKOWE.map(d => (
                  <button key={d.id} onClick={() => toggle(dodatkowe, setDodatkowe, d.id)} style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '12px 16px', marginBottom: 4, borderRadius: 10, cursor: 'pointer', textAlign: 'left', fontSize: 14, ...redBg(dodatkowe.includes(d.id)), color: '#e2e8f0' }}>
                    <span style={{ flex: 1 }}>{d.label}</span>
                    {dodatkowe.includes(d.id) && <span style={{ color: '#22c55e', fontSize: 16 }}>✓</span>}
                  </button>
                ))}
              </div>
            )}

            {/* STEP 3: SPIS TRESCI */}
            {step === 3 && (
              <div className="fi">
                <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 6 }}>Spis tresci (podglad)</h2>
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,.4)', marginBottom: 16 }}>Wygenerowany automatycznie z wybranych dokumentow.</p>

                <div style={{ ...C, padding: '20px 24px' }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#dc2626', marginBottom: 4, textTransform: 'uppercase' }}>Dokumentacja powykonawcza</div>
                  <div style={{ fontSize: 14, color: 'rgba(255,255,255,.4)', marginBottom: 16 }}>{dane.find(d => d.key === 'nazwaInwestycji')?.value}</div>
                  <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 14 }}>Spis zawartosci:</div>
                  {buildTOC().map((sec, si) => (
                    <div key={si} style={{ marginBottom: 14 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, textDecoration: 'underline', marginBottom: 6 }}>{sec.title}</div>
                      <ol style={{ paddingLeft: 24, fontSize: 14, color: 'rgba(255,255,255,.4)' }}>
                        {sec.items.map((item, ii) => <li key={ii} style={{ marginBottom: 3 }}>{item}</li>)}
                      </ol>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 4: PODSUMOWANIE */}
            {step === 4 && (
              <div className="fi">
                <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Podsumowanie</h2>

                <div style={C}>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,.25)', fontWeight: 600, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 }}>Dane budowy</div>
                  {dane.map((f, i) => <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: 14 }}><span style={{ color: 'rgba(255,255,255,.4)' }}>{f.label}</span><span style={{ fontWeight: 500, maxWidth: '55%', textAlign: 'right' }}>{f.value}</span></div>)}
                </div>

                <div style={{ ...C, background: 'rgba(239,68,68,.03)', borderColor: 'rgba(239,68,68,.12)' }}>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,.25)', fontWeight: 600, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 }}>Dokumenty ({protokoly.length + dodatkowe.length})</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                    {[...protokoly, ...dodatkowe].map(id => {
                      const nm = ALL_PROTOKOLY.find(x=>x.id===id)?.label || DODATKOWE.find(x=>x.id===id)?.label || id;
                      return <span key={id} style={{ padding: '4px 10px', background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.15)', borderRadius: 6, fontSize: 12, color: '#ef4444' }}>{nm}</span>;
                    })}
                  </div>
                </div>

                <div style={{ ...C, background: 'rgba(59,130,246,.05)', borderColor: 'rgba(59,130,246,.15)' }}>
                  <div style={{ fontSize: 14, color: 'rgba(255,255,255,.5)' }}>
                    📁 Nowy folder na Google Drive:<br />
                    <strong style={{ color: 'rgba(255,255,255,.8)' }}>Azico / Dokumentacja / {(dane.find(d => d.key === 'nazwaInwestycji')?.value || '...').substring(0, 60)}</strong>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* BOTTOM */}
          <div style={{ padding: '14px 24px', borderTop: '1px solid rgba(255,255,255,.05)', background: 'rgba(255,255,255,.01)', display: 'flex', gap: 10, alignItems: 'center' }}>
            {step > 0 && !generating && !done && <button onClick={() => setStep(step-1)} style={{ padding: '12px 20px', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 8, color: 'rgba(255,255,255,.4)', fontSize: 14, cursor: 'pointer', fontWeight: 500 }}>Wstecz</button>}
            <div style={{ flex: 1 }}>
              {generating ? (
                <div>{GEN.map((s, i) => <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '3px 0', fontSize: 13, opacity: i < genStep ? .5 : i === genStep ? 1 : .2, transition: 'opacity .3s' }}><div style={{ width: 6, height: 6, borderRadius: '50%', background: i < genStep ? '#22c55e' : i === genStep ? '#dc2626' : 'rgba(255,255,255,.15)', boxShadow: i === genStep ? '0 0 8px #dc2626' : 'none' }} className={i === genStep ? 'pd' : ''} />{s}</div>)}</div>
              ) : done ? (
                <div className="fi" style={{ background: 'rgba(34,197,94,.08)', border: '1px solid rgba(34,197,94,.2)', borderRadius: 14, padding: '18px', textAlign: 'center' }}>
                  <div style={{ fontSize: 26, marginBottom: 6 }}>✅</div>
                  <div style={{ fontWeight: 600, fontSize: 16, color: '#22c55e' }}>Dokumentacja wygenerowana!</div>
                  <div style={{ margin: '10px auto', padding: '8px 16px', display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 8, fontSize: 14, color: 'rgba(255,255,255,.7)' }}>
                    📁 Azico / Dokumentacja / {(dane.find(d => d.key === 'nazwaInwestycji')?.value || '').substring(0,40)}...
                  </div>
                  <button onClick={() => { setDone(false); setStep(0); setFiles([]); setDane([]); setSystemy([]); setCerty([]); setBranze([]); setZakresy([]); setProtokoly([]); setGenStep(0); }}
                    style={{ display: 'block', margin: '12px auto 0', padding: '10px 24px', background: 'rgba(34,197,94,.1)', border: '1px solid rgba(34,197,94,.25)', borderRadius: 8, color: '#22c55e', fontSize: 14, cursor: 'pointer' }}>Nowa dokumentacja</button>
                </div>
              ) : step < 4 ? (
                <button onClick={() => { if (canNext()) setStep(step+1); else ai('Uzupelnij wymagane pola.'); }} disabled={!canNext()} style={{
                  width: '100%', padding: '14px', background: canNext() ? 'linear-gradient(135deg,#dc2626,#b91c1c)' : 'rgba(255,255,255,.04)',
                  border: 'none', borderRadius: 10, color: 'white', fontSize: 15, fontWeight: 600, cursor: canNext() ? 'pointer' : 'default', opacity: canNext() ? 1 : .3,
                  boxShadow: canNext() ? '0 4px 15px rgba(220,38,38,.25)' : 'none',
                }}>Dalej</button>
              ) : (
                <button onClick={onGenerate} style={{ width: '100%', padding: '16px', background: 'linear-gradient(135deg,#dc2626,#991b1b)', border: 'none', borderRadius: 12, color: 'white', fontSize: 16, fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 25px rgba(220,38,38,.3)' }}>
                  Generuj dokumentacje
                </button>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT: CHAT */}
        <div style={{ flex: '1 1 40%', display: 'flex', flexDirection: 'column', background: 'rgba(255,255,255,.005)', overflow: 'hidden' }}>
          <div style={{ padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,.05)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg,#dc2626,#ef4444)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🤖</div>
            <div><div style={{ fontSize: 15, fontWeight: 600 }}>Asystent AI</div><div style={{ fontSize: 12, color: 'rgba(255,255,255,.25)' }}>Pomaga z dokumentacja ppoz</div></div>
          </div>
          <div style={{ flex: 1, overflow: 'auto', padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {chat.map((m, i) => (
              <div key={i} className="fi" style={{ display: 'flex', flexDirection: 'column', alignItems: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{ maxWidth: '85%', padding: '12px 16px', fontSize: 14, lineHeight: 1.6, whiteSpace: 'pre-line', borderRadius: 16,
                  ...(m.role === 'user' ? { background: 'linear-gradient(135deg,#dc2626,#b91c1c)', color: 'white', borderBottomRightRadius: 4 }
                    : { background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.06)', borderBottomLeftRadius: 4 }) }}>
                  {m.text}
                </div>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,.15)', marginTop: 3, padding: '0 4px' }}>{m.time}</span>
              </div>
            ))}
            <div ref={chatEnd} />
          </div>
          <div style={{ padding: '12px 14px', borderTop: '1px solid rgba(255,255,255,.05)', display: 'flex', gap: 8 }}>
            <input value={chatIn} onChange={e => setChatIn(e.target.value)} onKeyDown={e => e.key === 'Enter' && !e.shiftKey && onChat()}
              placeholder="Napisz uwage lub pytanie..." style={{ flex: 1, padding: '12px 14px', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 10, color: '#e2e8f0', fontSize: 14, outline: 'none' }}
              onFocus={e => e.target.style.borderColor='rgba(239,68,68,.3)'} onBlur={e => e.target.style.borderColor='rgba(255,255,255,.08)'} />
            <button onClick={onChat} style={{ padding: '12px 16px', borderRadius: 10, border: 'none', background: chatIn.trim() ? 'linear-gradient(135deg,#dc2626,#b91c1c)' : 'rgba(255,255,255,.04)', color: chatIn.trim() ? 'white' : 'rgba(255,255,255,.2)', fontSize: 18, cursor: chatIn.trim() ? 'pointer' : 'default' }}>➤</button>
          </div>
        </div>
      </div>
    </div>
  );
}
