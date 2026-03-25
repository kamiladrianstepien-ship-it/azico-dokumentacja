# Azico.pl - Dokumentacja Powykonawcza

## Szybki deploy na Vercel (15 minut)

### Krok 1: Zaloz konta (jesli nie masz)
- GitHub: https://github.com/signup
- Vercel: https://vercel.com/signup (zaloguj sie GitHubem)

### Krok 2: Wrzuc projekt na GitHub
1. Wejdz na https://github.com/new
2. Nazwa repo: `azico-dokumentacja`
3. Kliknij "Create repository"
4. Na komputerze otworz terminal w folderze projektu:
```bash
cd azico-app
git init
git add .
git commit -m "Azico dokumentacja"
git branch -M main
git remote add origin https://github.com/TWOJ-LOGIN/azico-dokumentacja.git
git push -u origin main
```

### Krok 3: Deploy na Vercel
1. Wejdz na https://vercel.com/new
2. Kliknij "Import" przy swoim repo azico-dokumentacja
3. W "Environment Variables" dodaj:
   - `NEXT_PUBLIC_APP_PASSWORD` = twoje haslo (np. azico2025)
   - `ANTHROPIC_API_KEY` = klucz z console.anthropic.com (opcjonalnie, bez niego dziala demo)
   - `N8N_WEBHOOK_URL` = URL z n8n (opcjonalnie, potem)
4. Kliknij "Deploy"
5. Po 1-2 minutach dostajesz link!

### Krok 4: Wyslij link
Skopiuj link (np. azico-dokumentacja.vercel.app) i wyslij komu chcesz.
Haslo domyslne: azico2025

## Uruchomienie lokalne
```bash
npm install
npm run dev
```
Otworz http://localhost:3000

## Jak to dziala
- Haslo firmowe chroni dostep
- Formularz krok po kroku: pliki -> sprawdz dane -> zakres -> generuj
- Czat AI pomaga (Claude API lub demo mode)
- Generowanie wysyla webhook do n8n
- Bez kluczy API dziala w trybie demo
