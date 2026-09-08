# INBLICK – kodschema för fall

Detta schema beskriver den redaktionella kodning som bör användas när ett fall uppdateras eller när den textbaserade kodningen i sambandsgrafen ersätts med manuellt verifierade fält.

## Grundprincip

Ett fall ska skilja mellan:

1. vad en källa faktiskt visar,
2. vilken rättslig eller administrativ status uppgiften har,
3. vilken analytisk kod som används för att jämföra fall.

En kod är inte ett bevis på motiv, skuld eller kausalitet. Om uppgiften inte kan verifieras ska värdet vara `UNKNOWN` eller lämnas tomt.

## Rekommenderade fält

```json
{
  "id": "c001",
  "title": "Kort beskrivande rubrik",
  "date": "2026-01",
  "loc": {"m": "Kommun", "r": "Län", "lat": 0, "lng": 0, "p": "municipality"},
  "sector": "LOCAL_GOV",
  "actor": "CRIMINAL_NETWORK",
  "secondary_actors": [],
  "role": "INSIDER",
  "status": "CONFIRMED",
  "legal_status": "CONVICTION",
  "summary": "Vad källorna uttryckligen visar.",
  "sources": [
    {"title": "Primärkälla", "url": "https://example.org", "source_type": "COURT", "last_verified": "2026-09-08"}
  ],
  "coding": {
    "methods": ["ACCESS"],
    "discovery": ["INTERNAL_LOG"],
    "gaps": ["ACCESS", "LOGGING"],
    "outcome": "COMPLETED",
    "basis": "EDITORIAL"
  },
  "confidence": "HIGH",
  "source_note": "Vilken källa stöder vilken central uppgift.",
  "last_verified": "2026-09-08"
}
```

## Kodvärden

### `status`

- `CONFIRMED`: centrala händelseuppgifter stöds av starkt källmaterial, exempelvis dom, myndighetsbeslut eller flera oberoende källor.
- `INDICATION`: uppgiften är relevant men ofullständig, omstridd eller inte slutligt verifierad.

### `legal_status`

Exempel: `CONVICTION`, `ACQUITTAL`, `CHARGED`, `SUSPECTED`, `ADMINISTRATIVE`, `REPORTING_ONLY`, `UNKNOWN`.

Rättslig status gäller inte automatiskt hela den analytiska tolkningen. En person kan vara dömd för en handling utan att varje uppgift om nätverk, motiv eller effekt är fastställd.

### `role`

Exempel: `INSIDER`, `ENABLER`, `PLACED_ACTOR`, `EXTERNAL_SUPPLIER`, `TARGET`, `UNKNOWN`.

Rollen ska beskriva funktion och åtkomst, inte personlighet eller etnicitet.

### `coding`

Koderna ska bara användas när den bakomliggande uppgiften går att hitta i källmaterialet.

- `methods`: exempelvis `THREAT`, `RELATION`, `BRIBERY`, `ACCESS`, `PROCUREMENT`, `PLACEMENT`, `SOCIAL_ENGINEERING`, `SABOTAGE`, `BENEFIT_FRAUD`, `FOREIGN_TECH`.
- `discovery`: exempelvis `INTERNAL_LOG`, `WHISTLEBLOWER`, `JOURNALISM`, `POLICE`, `SECURITY`, `AUDIT`, `COURT`.
- `gaps`: exempelvis `ACCESS`, `DUTIES`, `SCREENING`, `VETTING`, `CONFLICT`, `SUPPLIER`, `REPORTING`, `LOGGING`, `CONTRACT`, `PHYSICAL`, `GOVERNANCE`.
- `outcome`: `COMPLETED`, `INTERRUPTED`, `PARTIAL` eller `UNCLEAR`.

## Käll- och kvalitetskrav

- Prioritera domar, myndighetsbeslut, offentliga rapporter och förstahandsuppgifter.
- Ange datum för senaste kontroll av länken.
- Markera om uppgiften är ett påstående från en part, en journalistisk uppgift eller ett fastställt förhållande.
- Ange vilken central uppgift varje källa stöder.
- Använd inte sökträffar, rubriker eller textmatchning som ensam grund för en kod.
- Lägg inte in personuppgifter som saknar tydligt ändamål och rättsligt stöd.

## Redaktionsregel

Sambandsgrafen ska visa om varje kod kommer från `EDITORIAL` eller `TEXT_MATCH`. Textmatchning är ett explorativt hjälpmedel och ska inte blandas ihop med manuellt verifierad fallkodning.
