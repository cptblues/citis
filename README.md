# Citis

Prototype web d'un jeu de transformation territoriale sur carte hexagonale.

Cette archive contient uniquement la base technique. Elle n'inclut encore ni grille, ni scène Phaser, ni mécanique de construction.

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
├── app/          # écrans et composition React
├── content/      # données de cartes et bâtiments
├── engine/       # règles pures du jeu
├── game/         # scène et rendu Phaser
├── ui/           # composants React réutilisables
├── index.css
└── main.tsx
```

Voir aussi [`docs/architecture.md`](docs/architecture.md).

## Prochaine étape

Créer le conteneur Phaser, puis afficher une carte fictive de 25 hexagones sans interaction.
