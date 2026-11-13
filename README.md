# Kiosk samoobsługowy — wersja A

Projekt odtwarza pionowy interfejs kiosku do zamawiania jedzenia. Obejmuje wybór produktów i zestawów, personalizację, koszyk, wybór płatności oraz ekrany scenariuszy S1–S3. Płatność i inne elementy urządzenia są symulowane — aplikacja nie łączy się z terminalem ani backendem.

## Wymagania

- Node.js 20.19 lub nowszy z linii 20, albo Node.js 22.12 lub nowszy
- npm (jest instalowany razem z Node.js)

Sprawdź wersje:

```powershell
node --version
npm --version
```

## Instalacja i uruchomienie

1. Sklonuj repozytorium i przejdź do katalogu projektu:

```powershell
git clone https://github.com/evee03/McDonald.git
cd McDonald
```

2. Zainstaluj zależności zgodnie z plikiem blokady:

```powershell
npm ci
```

3. Uruchom serwer deweloperski:

```powershell
npm run dev
```

Otwórz adres wyświetlony przez Vite w terminalu. Domyślnie jest to <http://localhost:5173/>. Zatrzymaj serwer skrótem `Ctrl+C`.

## Przydatne polecenia

```powershell
npm run lint       # kontrola lint
npm run build      # sprawdzenie TypeScript i kompilacja produkcyjna
npm run preview    # lokalny podgląd zbudowanej wersji (po npm run build)
```

## Technologia

React, TypeScript, Vite, Zustand i CSS. Stan zamówienia jest zarządzany po stronie przeglądarki; projekt nie wymaga serwera aplikacyjnego ani bazy danych.

## Mapa przejść

Edytowalna mapa ekranów dla S1–S3 znajduje się w [`mapa-przejsc-wersja-A.drawio`](./mapa-przejsc-wersja-A.drawio). Otwórz plik w [diagrams.net](https://app.diagrams.net/).

## Scenariusze

- **S1:** dwa burgery z bekonem na wynos i płatność bezgotówkowa.
- **S2:** zwykły burger na miejscu, personalizacja do trzech plastrów sera i płatność kartą.
- **S3:** zestaw na wynos z burgerem, dużymi frytkami i wodą, płatność gotówką przy kasie (symulowana).

Aplikacja prezentuje interfejs kiosku w przeglądarce. Nie obsługuje rzeczywistej drukarki paragonów, fizycznej klawiatury PIN ani transakcji płatniczych.
