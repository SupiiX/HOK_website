# Adatfájlok / Data Files

Ez a mappa tartalmazza a weboldal dinamikus adatfájljait JSON formátumban.

## 📁 Fájlok

### `corvinus-scholarship.json`
**Ösztöndíj statisztikák adatai**

Tartalmazza a Corvinus ösztöndíjas helyek arányát szakonként és tanévenként.

**Struktúra:**
```json
{
  "periods": [
    {
      "period": "2024/2025/1",
      "courses": [
        {
          "level": "alapképzés",
          "name": "Szak neve",
          "code": "KÓDJA",
          "schedule": "Nappali",
          "language": "magyar",
          "scholarship_ratio": 85.5
        }
      ]
    }
  ]
}
```

**Használat:**
- `assets/js/corvinus-scholarship.js` tölti be
- Megjelenik: Ösztöndíj → Kalkulátor & Eszközök → Statisztikák

**Frissítés:** Félévente, amikor az új ösztöndíj adatok elérhetővé válnak

---

### `events-calendar.json`
**Eseménynaptár adatai**

Tartalmazza a félév eseményeit, határidőit és programjait.

**Struktúra:**
```json
{
  "semester": {
    "id": "2024-osz",
    "name": "2024 Őszi félév",
    "startDate": "2024-09-01",
    "endDate": "2025-01-31"
  },
  "categories": [
    {
      "id": "tanulmanyi",
      "name": "Tanulmányi",
      "nameEn": "Academic",
      "color": "#d6394c"
    }
  ],
  "events": [
    {
      "id": 1,
      "title": "Esemény címe",
      "titleEn": "Event title",
      "date": "2024-10-15",
      "endDate": null,
      "category": "tanulmanyi",
      "description": "Leírás",
      "descriptionEn": "Description",
      "location": "Helyszín",
      "locationEn": "Location",
      "link": "#osztondij"
    }
  ]
}
```

**Használat:**
- `assets/js/events-calendar.js` tölti be
- Megjelenik: Hallgatói Élet → Közelgő események és határidők

**Frissítés:**
- Félévente: teljes fájl cseréje új félév adataival
- Folyamatosan: új események hozzáadása

---

## 🔧 Karbantartás

### Új esemény hozzáadása
1. Nyisd meg: `events-calendar.json`
2. Másold be az új eseményt az `events` tömbbe
3. Használd a következő ID-t (utolsó +1)
4. Mentsd el

### Félév váltás
1. **Ösztöndíj:** Frissítsd a `corvinus-scholarship.json` fájlt az új tanévi adatokkal
2. **Események:** Cseréld le az `events-calendar.json` tartalmát az új félév eseményeivel

### Grafikus admin program
Később ezek a fájlok egy grafikus felületen keresztül is szerkeszthetőek lesznek.

---

## ⚠️ Fontos

- **JSON formátum:** A fájloknak érvényes JSON szintaxist kell követniük
- **Dátum formátum:** `YYYY-MM-DD` (pl. 2024-10-15)
- **Ékezetes karakterek:** UTF-8 kódolással támogatottak
- **Git:** Commitold a változtatásokat érthető üzenettel

---

## 📞 Kapcsolat

Ha kérdésed van a struktúrával kapcsolatban, vedd fel a kapcsolatot a HÖK IT csapatával.
