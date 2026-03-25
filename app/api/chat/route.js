export async function POST(req) {
  try {
    const { message, context, history } = await req.json();
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey || apiKey.startsWith('sk-ant-xxx')) {
      return Response.json({ reply: getFallback(message) });
    }

    const messages = [];
    if (history?.length) {
      for (const msg of history.slice(-10)) {
        messages.push({ role: msg.role === 'ai' ? 'assistant' : 'user', content: msg.text });
      }
    }
    messages.push({ role: 'user', content: message });

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        system: `Jestes asystentem dokumentacji powykonawczej firmy Azico.pl (branza ppoz). Pomagasz pracownicom biurowym. Znasz systemy SSP, stolarke pozarowa, przejscia pozarowe, klapy, obudowy, tryskacze, hydranty, oddymianie. Znasz atesty, aprobaty, certyfikaty, klasyfikacje ogniowe. Odpowiadaj krotko i konkretnie po polsku. Kontekst: ${JSON.stringify(context)}`,
        messages,
      }),
    });

    if (!response.ok) return Response.json({ reply: 'Problem z polaczeniem do AI. Sprobuj ponownie.' });
    const data = await response.json();
    const reply = data.content?.map(b => b.type === 'text' ? b.text : '').filter(Boolean).join('\n') || 'Brak odpowiedzi.';
    return Response.json({ reply });
  } catch {
    return Response.json({ reply: 'Wystapil blad. Sprobuj ponownie.' });
  }
}

function getFallback(msg) {
  const l = msg.toLowerCase();
  if (l.includes('hilti') || l.includes('promat')) return 'Rozumiem. Podmienie system i atesty we wszystkich protokolach.';
  if (l.includes('termin') || l.includes('data')) return 'Przyjmuje. Zaktualizuje daty.';
  if (l.includes('atest') || l.includes('certyfikat')) return 'Dodam do zestawienia. Masz plik do wgrania?';
  if (l.includes('pomoc') || l.includes('jak')) return '1. Wgraj pliki\n2. Analizuj\n3. Sprawdz dane\n4. Wybierz protokoly\n5. Generuj';
  return 'Rozumiem, uwzglednie to w dokumentacji.';
}
