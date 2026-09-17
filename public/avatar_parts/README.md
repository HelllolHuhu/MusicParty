# Avatar Parts & Template Guide

Tento priečinok obsahuje jednotlivé vrstvy a SVG šablóny pre tvorbu herných postáv (Character Creator).

---

## 📁 Štruktúra priečinkov

```
public/avatar_parts/
├── head/            # Tvar hlavy a uši (mení farbu pleti)
│   ├── head_1.svg   # Okrúhla tvár
│   ├── head_2.svg   # Hranatá tvár
│   └── head_3.svg   # Špicatá / Oválna tvár
├── hair/            # Účesy (mení farbu vlasov)
│   ├── hair_1.svg   # Spiky / Quiff
│   ├── hair_2.svg   # Afro / Kučery
│   └── hair_3.svg   # Mohawk / Punk
├── eyes/            # Oči a obočie (mení farbu dúhovky)
│   ├── eyes_1.svg   # Klasické oči
│   ├── eyes_2.svg   # Pohodové / Half-closed
│   └── eyes_3.svg   # Anime / Iskrivé
├── beard/           # Brada a fúzy (mení farbu brady)
│   ├── beard_1.svg  # Plná brada
│   ├── beard_2.svg  # Kozia briadka
│   └── beard_3.svg  # Klasické fúzy
└── accessories/     # Doplnky (okuliare, slúchadlá, reťaze)
    ├── acc_1.svg    # Slnečné okuliare
    ├── acc_2.svg    # DJ Slúchadlá
    └── acc_3.svg    # Zlatá reťaz a náušnice
```

---

## 🎨 Formát súborov a pravidlá pre nové obrázky

Ak pridávate nové časti alebo meníte existujúce:

1. **Formát súboru**: `.svg` (vektorová grafika).
2. **ViewBox & Rozmery**: Každý súbor musí mať rovnaký `viewBox="0 0 200 200"` a `fill="none"`.
3. **Centrovanie vrstiev**:
   - Stred tváre / nos: `(100, 115)`
   - Oči: `Y: 90 - 105`, `X: 75` (ľavé) a `125` (pravé)
   - Vlasy: `Y: 20 - 95`
   - Brada / Fúzy: `Y: 130 - 180`
   - Doplnky: `Y: 30 - 190`
4. **Zmena farby (Color Changer)**:
   - Elementy, ktoré majú preberať vybranú farbu (farba pleti, vlasov, očí, brady), majú nastavené `fill="currentColor"`.
   - Obrysy a detaily používajú pevnú farbu (napr. `#1f2937` pre tmavý obrys, `#ffffff` pre lesk).
