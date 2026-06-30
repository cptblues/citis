# Citis

Prototype web d'un jeu de transformation territoriale sur carte hexagonale.

Citis explore une boucle de stratégie calme: développer une commune autour d'un bourg central en choisissant des tuiles, en les plaçant sur une grille hexagonale, puis en validant les tours. Le projet sépare volontairement l'interface, le rendu et les règles pour garder un moteur de jeu testable sans React ni Phaser.

## Etat du prototype

Le prototype actuel affiche une scène Phaser intégrée dans une application React.

- le plateau commence avec une tuile centrale `Bourg`;
- chaque tour propose deux tuiles de territoire, aujourd'hui `Prairie` et `Forêt`;
- le joueur sélectionne une proposition, puis la place sur une case libre adjacente au territoire;
- un seul placement est autorisé par tour;
- React contrôle l'état de tour et Phaser gère l'affichage interactif de la carte;
- les règles pures du plateau, des tours, des coordonnées hexagonales et des métriques sont couvertes par des tests Vitest.

Une ancienne scène, `PrototypeScene`, reste dans le code pour les essais de terrain, d'influence et de placement de structures. La scène utilisée par défaut dans `createPhaserGame` est `TerritoryPrototypeScene`.

## Stack technique

- TypeScript
- React
- Phaser
- Vite
- Vitest
- oxlint

## Prérequis

- Linux, macOS ou Windows
- Node.js 22.12 ou plus récent
- npm

## Installation

```bash
npm install
npm run dev
```

Vite affiche ensuite l'adresse locale, généralement `http://localhost:5173`.

## Commandes

```bash
npm run dev       # serveur de développement
npm run lint      # analyse statique
npm run typecheck # vérification TypeScript
npm run test      # tests en mode surveillance
npm run test:run  # tests une seule fois
npm run build     # compilation de production
npm run check     # lint + tests + build
```

## Arborescence

```text
src/
├── app/          # composition React et styles de l'écran principal
├── content/      # données de prototype et définitions de tuiles/structures
├── engine/       # règles pures du jeu, sans React ni Phaser
├── game/         # intégration Phaser, événements et scènes
├── ui/           # emplacement prévu pour les composants réutilisables
├── index.css
└── main.tsx
```

## Règles d'architecture

Le moteur dans `src/engine` doit rester déterministe et indépendant de l'affichage. Il expose des fonctions pures pour calculer les coordonnées hexagonales, les placements disponibles, l'état des tours, les structures et les métriques.

Le contenu dans `src/content` décrit les données du prototype: cartes, définitions visuelles, propositions de tour et constantes de plateau.

React orchestre l'interface et l'état de tour dans `src/app`, puis communique avec Phaser via les événements déclarés dans `src/game/gameEvents.ts`. Phaser dessine la carte, gère les interactions pointeur et émet un événement lorsqu'une tuile est posée.

Voir aussi [`docs/architecture.md`](docs/architecture.md) et les documents de conception dans [`docs/`](docs/).

## Pistes de suite

- formaliser la scène active et retirer ou archiver l'ancienne scène de prototype;
- ajouter des règles de score et de synergies entre tuiles;
- enrichir les types de tuiles et les améliorations visibles;
- brancher les métriques du moteur sur l'interface de la boucle de tour;
- élargir les tests aux interactions React/Phaser les plus critiques.
