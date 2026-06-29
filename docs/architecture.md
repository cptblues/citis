# Architecture initiale de Citis

Le projet sépare volontairement l'affichage, les règles et le contenu.

- `src/app` : composition React et écrans HTML.
- `src/game` : intégration Phaser, scènes et rendu de la carte.
- `src/engine` : règles pures et déterministes, sans React ni Phaser.
- `src/content` : cartes fictives et définitions de structures.
- `src/ui` : composants React réutilisables.

## Règle importante

Le moteur de jeu ne doit jamais importer React ou Phaser. Phaser affiche l'état ; il ne décide pas des règles.
