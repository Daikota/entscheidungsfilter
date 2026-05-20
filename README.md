# Entscheidungsfilter

Version: 1.1.0

Entscheidungsfilter ist eine mobile App zum strukturierten Vergleichen von Optionen. Du legst Entscheidungen an, ergänzt Optionen und Kriterien, bewertest jede Option nach den Kriterien und erhältst eine gewichtete Rangliste.

## Tech Stack

- Expo SDK 54
- React Native
- Expo Router
- TypeScript
- expo-sqlite
- React Context für App-State
- lokales Theme-System mit Light/Dark/System-Modus

## Hauptfunktionen

- Entscheidungen erstellen, bearbeiten und löschen
- Optionen und Kriterien hinzufügen, bearbeiten und löschen
- Gewichtung für Kriterien von 1 bis 3
- Bewertungsskala von 1 bis 5
- Ergebnisberechnung nach `Bewertung * Gewichtung`
- Rangliste mit Gewinner, Alternativen und Punktwerten
- Fortschritt für offene Bewertungen
- Einstellungen mit Theme-Auswahl und lokaler Datenverwaltung

## Lokale Speicherung

Alle App-Daten werden lokal auf dem Gerät mit SQLite gespeichert:

- Entscheidungen
- Optionen
- Kriterien
- Bewertungen
- Theme-Einstellung

Die App verwendet keine Accounts, keine externe API, keine Werbung und kein Cloud-Backend.

## Entwicklung starten

Abhängigkeiten installieren:

```bash
npm install
```

Expo starten:

```bash
npx expo start
```

Expo mit geleertem Metro-Cache starten:

```bash
npx expo start -c
```

Die App kann in Expo Go auf Android getestet werden.

## Projektstruktur

```text
app/                  Expo-Router-Screens
app/decision/          Detail-, Bewertungs- und Ergebnisfluss
components/ui/         wiederverwendbare UI-Komponenten
constants/             Theme- und Farbwerte
contexts/              App-State und Datenaktionen
database/              SQLite-Initialisierung, Schema und Repository
types/                 zentrale TypeScript-Typen
utils/                 Validierung und Ergebnisberechnung
assets/images/         App-Logo, Icon- und Splash-Assets
```

## Wichtige Befehle

```bash
npm install
npx expo start
npx expo start -c
```
