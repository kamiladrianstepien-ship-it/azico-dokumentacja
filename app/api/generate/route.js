export async function POST(req) {
  try {
    const formData = await req.formData();
    const dataStr = formData.get('data');
    const data = JSON.parse(dataStr);
    const fileNames = [];
    for (const entry of formData.getAll('files')) {
      if (entry instanceof File) fileNames.push(entry.name);
    }

    const webhookUrl = process.env.N8N_WEBHOOK_URL;
    if (!webhookUrl || webhookUrl.includes('twoj-n8n')) {
      console.log('=== AZICO GENERATE ===', data.budowa, data.zakres, fileNames);
      return Response.json({ success: true, message: 'Demo mode', driveLink: '' });
    }

    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, pliki: fileNames, timestamp: new Date().toISOString() }),
    });

    let result = {};
    try { result = await res.json(); } catch {}
    return Response.json({ success: true, driveLink: result.driveLink || '' });
  } catch {
    return Response.json({ success: false, message: 'Blad webhook' }, { status: 500 });
  }
}
