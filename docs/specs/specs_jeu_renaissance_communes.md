# Renaissance — Communes vivantes
## Spécifications détaillées du jeu web

> **Statut :** proposition de conception et plan de production v1  
> **Date :** 29 juin 2026  
> **Nom de travail :** *Renaissance — Communes vivantes*  
> **Plateforme :** navigateur desktop, puis tablette  
> **Durée cible :** 30 à 45 minutes par partie  
> **Mode principal :** solo  
> **Composante communautaire :** statistiques et comparaison asynchrones  
> **Développement :** itérations courtes réalisées avec Codex AI, chacune testée et validée

---

# Sommaire

1. Vision et positionnement  
2. Piliers et concepts originaux  
3. Boucle de gameplay  
4. Structure d'une partie  
5. Ressources, projets, réseaux et simulation  
6. Carte de jeu et données communales  
7. Pipeline SIG France  
8. Hexagones et cohérence géographique  
9. Rivières, forêts, urbain, agriculture et relief  
10. Expérience communautaire  
11. Architecture web  
12. Direction artistique et assets IA  
13. Modèle de données et API  
14. Tests, performance et sécurité  
15. Roadmap MVP vers bêta  
16. Étapes Codex détaillées  
17. Prompts d'assets  
18. Sources officielles

---

# 1. Résumé exécutif

*Renaissance — Communes vivantes* est un jeu de stratégie territoriale dans lequel le joueur choisit une commune française réelle, puis joue une trajectoire alternative de cette commune sur une carte simplifiée inspirée de sa géographie.

Le joueur ne dirige pas une mairie au sens administratif. Il agit comme un **architecte du territoire** : il restaure une rivière, réhabilite des logements, relance des activités, protège des terres agricoles, crée des connexions et rend le territoire plus résilient.

La carte reprend la forme réelle de la commune. Dans les versions enrichies, elle reprend aussi la position cohérente de ses rivières, forêts, zones agricoles, zones bâties, routes principales et reliefs. Elle est transformée en une carte de jeu lisible composée d'environ **45 à 90 cellules**, majoritairement hexagonales.

Le cœur du plaisir vient de quatre actions :

1. comprendre un problème territorial et ses causes ;
2. choisir peu d'actions, mais produire plusieurs conséquences ;
3. créer des synergies entre des zones et des projets ;
4. voir la commune se transformer visuellement.

Chaque joueur joue sa propre version parallèle d'une commune. Les autres joueurs ne peuvent pas modifier sa partie. Les résultats alimentent ensuite des statistiques :

- commune la plus jouée ;
- commune la moins explorée ;
- meilleur taux de réussite ;
- meilleure nature ;
- meilleure autonomie ;
- meilleure qualité de vie ;
- projets les plus choisis ;
- trajectoires rares ;
- comparaison avec les joueurs du même scénario.

Positionnement synthétique :

> Une transformation territoriale inspirée par la satisfaction de *Terra Nil*, la lisibilité des réseaux de *Mini Metro*, les combinaisons compactes d'*Islanders* et la douceur cartographique de *Dorfromantik*, sans reprendre leurs mécaniques exactes.

---

# 2. Hypothèses retenues

Ces hypothèses permettent de produire un premier prototype sans bloquer le projet.

- Desktop d'abord.
- France métropolitaine pour le premier pipeline.
- DROM après stabilisation.
- Une partie standard comprend 12 saisons.
- Une saison est une unité de gameplay abstraite.
- Environ 55 à 75 cellules sur une carte standard.
- Trois points d'action par saison.
- Le jeu n'est pas une simulation municipale officielle.
- Les données réelles servent de contexte, pas de diagnostic.
- Le mode communautaire est asynchrone.
- Le moteur est déterministe.
- Les parties sont sauvegardables.
- Jeu sans compte possible.
- Compte facultatif pour synchroniser et publier ses statistiques.
- Les premières communes sont préparées à l'avance.
- Les assets visuels sont générés par IA puis normalisés.
- Les polices restent des polices web ouvertes pour la lisibilité.

---

# 3. Vision du jeu

## 3.1 Fantaisie proposée

Le joueur reçoit un territoire possédant une identité et des contraintes :

- une rivière ;
- un centre-bourg ;
- des secteurs résidentiels ;
- des terres agricoles ;
- des forêts ;
- une activité ou une friche ;
- des routes ;
- des services ;
- des secteurs plus vulnérables.

La proposition n'est pas :

> Construire une ville idéale à partir d'un terrain vide.

Elle est :

> Comprendre un territoire existant, révéler son potentiel et le faire fonctionner autrement.

## 3.2 Promesse émotionnelle

À la fin, le joueur doit pouvoir regarder sa carte et penser :

> Cette commune était bloquée. J'ai créé une organisation cohérente qui lui correspond.

## 3.3 Piliers

### Peu d'actions, beaucoup d'effets

Une action possède des effets directs, voisins, systémiques et retardés.

### Le territoire est un réseau

La position d'une zone compte autant que sa production.

### La carte raconte la partie

Le joueur comprend l'état du territoire sans ouvrir dix tableaux.

### Plusieurs bonnes solutions

Une commune écologique, compacte, autonome, patrimoniale ou productive peut être réussie.

### Solo d'abord

La communauté enrichit le bilan mais n'est jamais nécessaire pour jouer.

---

# 4. Inspirations et différenciation

## 4.1 Inspirations

### Terra Nil

À retenir :

- restauration visible ;
- transformation en plusieurs étapes ;
- plaisir de réparer.

À éviter :

- copier ses bâtiments ;
- copier sa structure de mission ;
- faire du nettoyage l'unique objectif.

### Mini Metro / Mini Motorways

À retenir :

- lecture immédiate des flux ;
- problèmes émergents ;
- réseaux simples.

À éviter :

- pression temps réel pure ;
- tracé de lignes comme mécanique unique.

### Islanders

À retenir :

- sessions compactes ;
- bonus de proximité ;
- placement satisfaisant.

À éviter :

- score de placement comme seule profondeur.

### Dorfromantik

À retenir :

- continuité géographique ;
- douceur visuelle ;
- plaisir d'une carte qui devient harmonieuse.

### Frostpunk

À retenir :

- dilemmes ;
- conséquences humaines ;
- priorités difficiles.

À éviter :

- tonalité punitive permanente.

## 4.2 Concepts originaux proposés

Il est impossible de garantir qu'aucun jeu n'a jamais exploré isolément chacune de ces idées. L'originalité se trouve dans leur combinaison.

### Trajectoires parallèles

Chaque joueur transforme une version alternative de la même commune.

### Fil des conséquences

Le jeu montre les chaînes causales :

```text
Logements réhabilités
→ nouveaux habitants
→ davantage de clientèle
→ commerce maintenu
→ centre plus attractif
```

### Systèmes territoriaux émergents

Le moteur reconnaît une structure fonctionnelle plutôt qu'une simple recette.

```text
production
+ transformation
+ distribution
+ accès résidentiel
= système alimentaire local
```

### Mémoire du territoire

Les choix laissent des traces durables :

- sol dépollué ;
- artificialisation ;
- bâtiment sauvé ;
- rivière restaurée ;
- institution locale créée.

### Réussite contextualisée

Chaque résultat possède :

- valeur absolue ;
- percentile dans la commune ;
- comparaison par difficulté ;
- profil de stratégie.

### Bilan contre-factuel

La fin explique ce qui aurait pu se produire sans certaines décisions.

---

# 5. Boucle de gameplay

## 5.1 Durée

- introduction : 2 à 4 minutes ;
- 12 saisons : 2 à 3 minutes chacune ;
- bilan : 3 à 5 minutes ;
- total : 30 à 45 minutes.

## 5.2 Une saison

### 1. Diagnostic

Le jeu présente au maximum trois informations importantes :

- tension ;
- changement récent ;
- événement ou opportunité.

Exemple :

> Le centre-bourg perd des habitants.  
> La boulangerie risque de fermer.  
> Des logements vacants se trouvent près de l'école.

### 2. Priorité

Le joueur choisit une orientation saisonnière :

- habitat ;
- économie ;
- nature ;
- mobilité ;
- autonomie ;
- services.

Cette priorité donne un léger bonus, sans bloquer les autres choix.

### 3. Planification

Le joueur dispose de :

- trois points d'action ;
- un budget ;
- une capacité de chantier ;
- un soutien local.

Actions possibles :

- lancer un projet ;
- améliorer un projet ;
- créer une connexion ;
- soutenir un service ;
- étudier une zone ;
- conserver une action contre un petit bonus futur.

### 4. Prévisualisation

Avant confirmation :

- coût ;
- durée ;
- effets directs ;
- zones touchées ;
- risques ;
- synergies ;
- entretien futur.

### 5. Résolution

Le moteur calcule :

- projets ;
- flux ;
- besoins ;
- population ;
- emplois ;
- nature ;
- événements ;
- effets retardés.

### 6. Retour narratif

Le jeu montre :

- une réussite ;
- une nouvelle tension ;
- une réaction humaine.

## 5.3 Boucle résumée

```text
Observer
→ choisir une priorité
→ dépenser trois actions
→ créer une synergie
→ résoudre
→ voir la commune réagir
→ s'adapter
```

---

# 6. Structure des 12 saisons

## Acte 1 — Stabiliser, saisons 1 à 4

- comprendre le territoire ;
- éviter une fermeture ;
- traiter une urgence ;
- lancer un premier système.

## Acte 2 — Reconnecter, saisons 5 à 8

- créer des réseaux ;
- spécialiser des zones ;
- arbitrer croissance et préservation ;
- subir une conséquence d'un choix passé.

## Acte 3 — Résister, saisons 9 à 12

- affronter un choc ;
- tester la résilience ;
- finaliser l'identité de la commune ;
- remplir l'objectif principal.

---

# 7. Objectifs, victoire et défaite

## 7.1 Objectifs d'un scénario

Chaque scénario comporte :

- un objectif principal ;
- deux objectifs secondaires ;
- une contrainte identitaire.

Exemple :

**Objectif principal**  
Atteindre 70 de résilience.

**Secondaires**

- maintenir trois services essentiels ;
- restaurer 60 % du corridor écologique.

**Contrainte**

- ne pas urbaniser de nouvelles terres agricoles.

## 7.2 Défaite

Éviter les défaites arbitraires.

Défaite possible si :

- budget négatif pendant trois saisons ;
- soutien local à zéro pendant deux saisons ;
- disparition d'un service imposé par le scénario ;
- abandon.

Une partie perdue doit quand même produire un bilan.

## 7.3 Bilan multi-axes

- qualité de vie ;
- nature ;
- économie locale ;
- autonomie ;
- accessibilité ;
- résilience ;
- patrimoine ;
- sobriété foncière.

Profils possibles :

- Bourg résilient ;
- Commune nourricière ;
- Territoire renaturé ;
- Pôle local dynamique ;
- Commune compacte ;
- Réseau solidaire ;
- Croissance fragile ;
- Transition inachevée.

---

# 8. Indicateurs et ressources

## 8.1 Indicateurs visibles

Limiter la barre principale à six valeurs :

1. Population
2. Emplois
3. Nature
4. Autonomie
5. Bonheur
6. Budget

## 8.2 Variables secondaires

- logements ;
- services ;
- accessibilité ;
- voiture ;
- alimentation locale ;
- énergie locale ;
- eau ;
- pollution ;
- risque d'inondation ;
- attractivité ;
- soutien local ;
- artificialisation ;
- patrimoine.

## 8.3 Ressources d'action

### Budget

Construction et entretien.

### Points d'action

Trois par saison.

### Capacité de chantier

Empêche de lancer trop de grands travaux simultanément.

### Soutien local

Influence les coûts, délais et événements sociaux.

---

# 9. Projets

## 9.1 Catégories

### Nature

- restauration de rivière ;
- parc ;
- haies ;
- forêt ;
- zone humide ;
- désimperméabilisation ;
- corridor écologique.

### Habitat

- logements vacants ;
- habitat compact ;
- écoquartier ;
- résidence intergénérationnelle ;
- rénovation énergétique.

### Économie

- atelier coopératif ;
- marché local ;
- commerce ;
- recyclerie ;
- transformation agricole ;
- tiers-lieu.

### Mobilité

- voie cyclable ;
- navette ;
- chemin piéton ;
- halte ferroviaire ;
- logistique légère.

### Services

- école ;
- maison de santé ;
- médiathèque ;
- espace associatif ;
- service public générique.

### Autonomie

- maraîchage ;
- solaire ;
- réseau de chaleur ;
- récupération d'eau ;
- stockage.

## 9.2 Définition technique

```ts
export interface ProjectDefinition {
  id: string;
  name: string;
  category: string;
  description: string;
  tags: string[];

  costs: {
    budget: number;
    actionPoints: number;
    constructionCapacity: number;
    maintenancePerSeason: number;
  };

  durationSeasons: number;
  allowedLandUses: string[];
  forbiddenConstraints: string[];
  prerequisites: ProjectCondition[];

  directEffects: MetricEffect[];
  adjacencyEffects: AdjacencyEffect[];
  networkEffects: NetworkEffect[];
  delayedEffects: DelayedEffect[];

  visualStateIds: {
    planned: string;
    construction: string;
    active: string;
    upgraded?: string;
    degraded?: string;
  };
}
```

---

# 10. Systèmes territoriaux

## Circuit alimentaire local

- production ;
- transformation ;
- distribution ;
- accès aux habitants.

## Corridor écologique

- cellules naturelles connectées ;
- rivière ou zone humide ;
- fragmentation faible.

## Centre de proximité

- logements ;
- commerce ;
- service ;
- accessibilité.

## Boucle de réemploi

- recyclerie ;
- atelier ;
- déchets ;
- débouché.

## Quartier familial

- logements ;
- école ;
- espace vert ;
- accès sûr.

## Réseau de fraîcheur

- arbres ;
- eau ;
- sol perméable ;
- connexion avec zones urbaines.

Lorsqu'un système apparaît, le jeu l'annonce et explique les éléments qui ont contribué.

---

# 11. Simulation

## 11.1 Ordre de calcul

1. effets directs ;
2. voisinages ;
3. réseaux ;
4. besoins ;
5. démographie ;
6. économie ;
7. écologie ;
8. événements ;
9. retards.

## 11.2 Graphe territorial

- nœuds : cellules ;
- arêtes : voisinage ;
- réseaux spécialisés : route, rivière, mobilité, écologie, énergie.

## 11.3 Formule simplifiée

```text
impact total
= effet direct
× compatibilité du terrain
× état du projet
+ bonus de voisinage
+ bonus de réseau
- saturation
- perturbation
```

## 11.4 Déterminisme

Une partie est définie par :

- version du moteur ;
- version de carte ;
- version du scénario ;
- graine ;
- actions.

```ts
export interface RunReplay {
  engineVersion: string;
  mapVersion: string;
  scenarioVersion: string;
  seed: string;
  actions: PlayerAction[];
}
```

Le serveur peut rejouer la partie pour valider les statistiques.

---

# 12. Événements

## Types

### Territoriaux

- crue ;
- sécheresse ;
- canicule ;
- pollution.

### Économiques

- fermeture ;
- nouvelle activité ;
- hausse des coûts ;
- tourisme.

### Sociaux

- familles ;
- vieillissement ;
- mobilisation ;
- opposition ;
- manque de professionnels.

### Positifs

- initiative citoyenne ;
- financement ;
- découverte naturelle ;
- reconnaissance patrimoniale.

## Déclenchement

Un événement possède :

- conditions ;
- poids ;
- délai ;
- incompatibilités ;
- choix ;
- conséquences.

```ts
export interface EventDefinition {
  id: string;
  title: string;
  narrative: string;
  tags: string[];
  conditions: Condition[];
  baseWeight: number;
  cooldown: number;
  choices: EventChoice[];
}
```

---

# 13. Habitants et narration

Le jeu simule surtout des groupes :

- jeunes ménages ;
- agriculteurs ;
- commerçants ;
- personnes âgées ;
- navetteurs ;
- associations ;
- artisans ;
- visiteurs.

Quelques personnages récurrents donnent un visage aux effets :

- la boulangère ;
- le maraîcher ;
- la médecin ;
- la responsable associative ;
- une famille nouvellement installée.

Ils ne créent pas un RPG. Ils servent de retour narratif et d'indice.

---

# 14. Composante communautaire

## 14.1 Principes

- aucune attaque ;
- aucune ressource volée ;
- aucune attente imposée ;
- aucune possession exclusive d'une commune ;
- pas de chat dans le MVP.

## 14.2 Statistiques France

- communes les plus jouées ;
- communes peu explorées ;
- taux de réussite ;
- parties terminées ;
- profils de stratégie.

## 14.3 Statistiques par commune

- joueurs ;
- parties ;
- victoire ;
- médianes ;
- percentiles ;
- projets populaires ;
- projets rares ;
- trajectoires ;
- meilleures performances par catégorie.

## 14.4 Comparaison personnelle

- percentile ;
- écart à la médiane ;
- stratégie similaire ;
- stratégie opposée ;
- badges ;
- historique.

## 14.5 Équité

Ne pas classer sur le score brut uniquement.

```text
score normalisé
= 50
+ 10 × z-score dans la commune
+ bonus d'objectifs
- pénalités
```

Préférer les percentiles.

## 14.6 Anti-triche

Le client envoie la graine, les versions et le journal d'actions. Le serveur rejoue la partie.

Si le résultat diffère :

- sauvegarde locale conservée ;
- résultat non publié ;
- erreur enregistrée.

## 14.7 Vie privée

- pseudonyme facultatif ;
- pas de GPS ;
- pas d'adresse ;
- statistiques masquées sous cinq parties ;
- identifiants anonymes possibles.

---

# 15. Architecture web recommandée

## Vue générale

```text
Navigateur
├── React : interface
├── Phaser : carte jouable
├── MapLibre : sélection des communes
├── moteur TypeScript partagé
├── IndexedDB : sauvegarde
└── API HTTP

Serveur
├── Node.js / Fastify
├── moteur partagé pour validation
├── PostgreSQL / PostGIS
├── stockage objet
└── jobs géographiques
```

## Frontend

- React ;
- TypeScript strict ;
- Vite ;
- Phaser 3 ;
- MapLibre GL JS ;
- Zustand ;
- TanStack Query ;
- Zod ;
- Vitest ;
- Playwright.

React gère :

- menus ;
- panneaux ;
- statistiques ;
- tutoriel ;
- événements ;
- communauté ;
- accessibilité.

Phaser gère :

- carte ;
- sélection ;
- objets ;
- animations ;
- flux ;
- particules.

MapLibre gère :

- France ;
- zoom ;
- contours ;
- recherche ;
- sélection de commune.

## Backend

- Node.js ;
- TypeScript ;
- Fastify ;
- Zod ;
- PostgreSQL ;
- PostGIS ;
- Kysely ou Drizzle ;
- stockage S3 compatible.

## Monorepo

```text
renaissance-communes/
├── apps/
│   ├── web/
│   ├── api/
│   └── geo-worker/
├── packages/
│   ├── game-engine/
│   ├── game-content/
│   ├── shared-schemas/
│   ├── map-format/
│   ├── ui/
│   └── config/
├── data/
│   ├── raw/
│   ├── processed/
│   └── fixtures/
├── assets/
│   ├── source-ai/
│   ├── normalized/
│   ├── atlases/
│   └── manifests/
├── docs/
├── scripts/
├── AGENTS.md
├── docker-compose.yml
└── pnpm-workspace.yaml
```

---

# 16. Modèle de données

## Tables

### users

```text
id, created_at, display_name, auth_provider, is_anonymous
```

### communes

```text
insee_code, name, department_code, region_code, centroid,
area_km2, population_reference, archetype, difficulty,
active_map_version
```

### map_versions

```text
id, commune_insee_code, version, status, source_versions_json,
map_json_url, preview_url, created_at
```

### scenarios

```text
id, commune_insee_code, version, name, difficulty, definition_json
```

### runs

```text
id, user_id, commune_insee_code, map_version, scenario_version,
engine_version, seed, status, started_at, completed_at,
duration_seconds, is_verified
```

### run_actions

```text
run_id, turn_index, action_index, action_type, payload_json
```

### run_results

```text
run_id, won, profile, population, jobs, nature, autonomy,
happiness, budget, resilience, land_sobriety, score_json
```

### commune_aggregates

```text
commune_insee_code, period, run_count, player_count, win_rate,
median_scores_json, project_usage_json, updated_at
```

---

# 17. API

## Communes

```http
GET /api/communes/search?q=grenoble
GET /api/communes/:inseeCode
GET /api/communes/:inseeCode/map
GET /api/communes/:inseeCode/scenarios
```

## Parties

```http
POST /api/runs
GET /api/runs/:runId
POST /api/runs/:runId/checkpoint
POST /api/runs/:runId/complete
```

## Statistiques

```http
GET /api/stats/france
GET /api/stats/communes/:inseeCode
GET /api/stats/communes/:inseeCode/strategies
GET /api/stats/me
```

---

# 18. Sauvegarde

## Locale

IndexedDB, après :

- chaque action confirmée ;
- chaque fin de saison ;
- chaque changement important.

## Serveur

- checkpoint en fin de saison ;
- jeu non bloqué en cas de réseau absent ;
- synchronisation ultérieure.

```ts
export interface SaveGame {
  runId: string;
  engineVersion: string;
  mapVersion: string;
  scenarioVersion: string;
  seed: string;
  currentSeason: number;
  state: GameState;
  actions: PlayerAction[];
  savedAt: string;
}
```


# 19. Sources cartographiques françaises

## 19.1 Identité administrative

Utiliser le **Code officiel géographique de l'Insee** comme référence pour :

- code commune ;
- nom ;
- département ;
- région ;
- historique des modifications.

Toujours utiliser le **code Insee**, et non le code postal, comme identifiant principal.

## 19.2 Contours communaux

### Source de production recommandée : IGN Admin Express COG

Avantages :

- cohérence avec le COG ;
- source institutionnelle ;
- formats SIG ;
- mises à jour ;
- données ouvertes.

### Source de prototype : contours administratifs data.gouv.fr

Très pratique pour obtenir des GeoJSON simplifiés.

Niveaux typiques :

- 1000 m : aperçu national ;
- 100 m : navigation régionale ou départementale ;
- 50 m ou 5 m : préparation détaillée hors ligne.

Ne jamais envoyer le fichier national le plus détaillé directement au navigateur.

## 19.3 Sources de détail

### BD TOPO

Pour :

- hydrographie ;
- bâti ;
- routes ;
- voies ferrées ;
- services et activités ;
- végétation disponible ;
- zones d'activité ;
- lieux nommés.

### OCS GE

Pour :

- couverture du sol ;
- usage du sol ;
- zones construites ;
- distinction entre occupation et fonction.

### BD Forêt

Pour :

- emprises forestières ;
- formations végétales.

### Registre parcellaire graphique

Pour :

- agriculture ;
- prairies ;
- certaines cultures.

### RGE ALTI ou LiDAR HD, plus tard

Pour :

- altitude ;
- pente ;
- vallée ;
- ruissellement ;
- coût de construction.

## 19.4 Licences

Préférer un pipeline principalement composé de données IGN, Insee et data.gouv.fr.

OpenStreetMap peut compléter certaines zones, mais la licence ODbL impose une gestion attentive de l'attribution et des données dérivées.

## 19.5 Attribution

Exemple à adapter :

```text
Données géographiques : IGN — Licence Ouverte Etalab 2.0.
Référentiel administratif : Insee, Code officiel géographique.
Contours simplifiés : data.gouv.fr.
```

Créer une page « Sources et licences » dans le jeu.

---

# 20. Pipeline de création des cartes

## 20.1 Principe

Ne pas créer la carte complète dans le navigateur.

```text
données brutes
→ nettoyage
→ projection métrique
→ extraction de la commune
→ grille
→ enrichissement
→ simplification
→ GameMap JSON
→ prévisualisation
→ validation
→ publication
```

## 20.2 Projection

Pour la France métropolitaine, utiliser **Lambert-93, EPSG:2154** pour les calculs.

Avantages :

- distances en mètres ;
- surfaces cohérentes ;
- hexagones réguliers ;
- traitement spatial fiable.

Convertir en WGS84 uniquement quand MapLibre l'exige.

## 20.3 Import des contours

```bash
ogr2ogr \
  -f PostgreSQL \
  "PG:host=localhost dbname=renaissance user=postgres password=postgres" \
  communes-100m.geojson \
  -nln geo.communes_raw \
  -nlt MULTIPOLYGON \
  -t_srs EPSG:2154
```

Toujours conserver :

- fichier brut ;
- URL source ;
- licence ;
- date ;
- millésime ;
- hash du fichier.

## 20.4 Nettoyage

```sql
CREATE TABLE geo.commune_work AS
SELECT
  code AS insee_code,
  nom AS name,
  ST_Multi(
    ST_CollectionExtract(
      ST_MakeValid(geom),
      3
    )
  )::geometry(MultiPolygon, 2154) AS geom
FROM geo.communes_raw
WHERE code = :insee_code;
```

Étapes :

- filtrer par code ;
- réparer ;
- supprimer géométries vides ;
- gérer les îles ;
- simplifier légèrement ;
- conserver l'original séparément.

---

# 21. Découpage en hexagones

## 21.1 Compromis visuel

Une commune réelle n'a pas une forme hexagonale.

Solution :

- grille régulière au centre ;
- cellules découpées aux limites ;
- fusion des fragments trop petits ;
- coordonnées logiques conservées.

Les cellules de bord ne seront pas toujours des hexagones parfaits. C'est préférable à des hexagones qui dépassent de la commune.

## 21.2 Nombre cible

| Commune | Cellules |
|---|---:|
| Très petite | 36–45 |
| Petite | 45–60 |
| Moyenne | 55–75 |
| Grande | 70–90 |
| Très étendue | 80–110 max |

Le nombre dépend de la jouabilité, pas uniquement de la superficie.

## 21.3 Taille initiale

Pour une cible `N` :

```text
surface_cellule = surface_commune / N
surface_hexagone = 3 × √3 / 2 × côté²
côté = √(2 × surface_cellule / (3 × √3))
```

Puis ajuster par itérations.

```ts
let side = estimateHexSide(area, target);

for (let attempt = 0; attempt < 8; attempt += 1) {
  const count = generateAndCount(side);

  if (count > target * 1.1) side *= 1.06;
  else if (count < target * 0.9) side *= 0.94;
  else break;
}
```

## 21.4 Génération PostGIS

```sql
WITH commune AS (
  SELECT geom FROM geo.commune_work
),
grid AS (
  SELECT
    hex.geom AS full_hex,
    hex.i,
    hex.j
  FROM commune,
  LATERAL ST_HexagonGrid(:side_meters, commune.geom) AS hex
),
clipped AS (
  SELECT
    i,
    j,
    full_hex,
    ST_Intersection(full_hex, commune.geom) AS geom
  FROM grid, commune
  WHERE ST_Intersects(full_hex, commune.geom)
)
SELECT
  i,
  j,
  geom,
  ST_Area(geom) / NULLIF(ST_Area(full_hex), 0) AS coverage_ratio
FROM clipped
WHERE NOT ST_IsEmpty(geom);
```

## 21.5 Cellules de bord

Règles proposées :

- garder si centroïde dans la commune ;
- ou couverture supérieure à 35 % ;
- fusionner les fragments sous 20 % ;
- choisir le voisin partageant la plus longue frontière ;
- éviter les multipolygones éclatés ;
- ne pas fusionner à travers une rupture majeure.

## 21.6 Voisins

Voisins logiques par coordonnées de grille, puis contrôle spatial.

```sql
SELECT
  a.id AS cell_a,
  b.id AS cell_b
FROM game.cells a
JOIN game.cells b
  ON a.id < b.id
 AND ST_Touches(a.geom, b.geom);
```

Cas particuliers :

- île ;
- commune coupée ;
- rivière majeure ;
- pont ;
- discontinuité administrative.

## 21.7 Coordonnées de rendu

```text
x_local = (x - min_x) / (max_x - min_x)
y_local = 1 - (y - min_y) / (max_y - min_y)
```

Le rendu Phaser utilise des coordonnées locales et non Lambert-93.

---

# 22. Format GameMap

```ts
export interface GameCell {
  id: string;
  communeInseeCode: string;
  q: number;
  r: number;
  geometry: number[][][];
  centroid: [number, number];
  neighbors: string[];

  dominantLandUse:
    | "urban_core"
    | "residential"
    | "industrial"
    | "agriculture"
    | "forest"
    | "wetland"
    | "water"
    | "mixed_rural";

  coverage: {
    built: number;
    forest: number;
    agriculture: number;
    water: number;
    wetland: number;
  };

  features: {
    riverLengthM: number;
    roadLengthM: number;
    railLengthM: number;
    buildingCount: number;
    addressCount: number;
    heritageAnchorCount: number;
  };

  gameplay: {
    pollution: number;
    ecologicalValue: number;
    accessibility: number;
    attractiveness: number;
    projectCapacity: number;
    floodExposure: number;
  };
}
```

Exemple de racine :

```json
{
  "version": "1.0.0",
  "commune": {
    "inseeCode": "00000",
    "name": "Commune exemple",
    "departmentCode": "00"
  },
  "bounds": {
    "widthMeters": 8200,
    "heightMeters": 6100
  },
  "cells": [],
  "features": {
    "rivers": [],
    "roads": [],
    "railways": [],
    "anchors": []
  },
  "scenarioHints": {
    "archetype": "rural_river_valley",
    "difficulty": 2
  }
}
```

---

# 23. Enrichissement géographique

Cette étape doit venir après le MVP de gameplay.

## 23.1 Principe

Ne pas réduire le territoire à une étiquette unique.

Conserver :

- classe dominante ;
- pourcentages de couverture ;
- lignes réelles simplifiées ;
- points d'intérêt ;
- valeurs de gameplay dérivées.

## 23.2 Rivières

Pipeline :

1. extraire les cours d'eau intersectant la commune ;
2. découper à la limite ;
3. simplifier sans casser la continuité ;
4. calculer la longueur dans chaque cellule ;
5. ordonner les cellules traversées ;
6. produire un graphe hydraulique ;
7. conserver entrées et sorties aux frontières.

Ne pas faire passer la rivière uniquement de centre d'hexagone à centre d'hexagone.

Variables :

- longueur ;
- largeur estimée ;
- ordre du cours d'eau ;
- qualité de gameplay ;
- risque de crue abstrait ;
- continuité.

## 23.3 Forêts

```text
couverture_forêt =
surface_forêt_intersectée / surface_cellule
```

Classification indicative :

- > 65 % : forêt ;
- 30–65 % : mixte forestier ;
- < 30 % : contribution secondaire.

## 23.4 Urbain

Combiner :

- emprise bâtie ;
- nombre de bâtiments ;
- adresses ;
- voirie ;
- couverture artificialisée ;
- services.

Détecter un centre par densité, centralité et concentration de services.

## 23.5 Agriculture

Combiner :

- OCS GE ;
- RPG ;
- végétation ;
- faible densité bâtie.

Classes suffisantes :

- grande culture ;
- prairie ;
- maraîchage potentiel ;
- vigne/verger ;
- agricole mixte.

## 23.6 Industrie et friches

Une friche réelle est difficile à détecter automatiquement.

Pour le MVP enrichi :

- détecter zones d'activité ;
- détecter grands bâtiments ;
- proposer des candidats ;
- faire valider manuellement ;
- autoriser une fiction contrôlée.

Le jeu peut dire « ancienne scierie » sans prétendre reproduire une entreprise réelle.

## 23.7 Relief

Plus tard :

- altitude moyenne ;
- pente ;
- exposition ;
- ruissellement ;
- coût de chantier ;
- visibilité.

## 23.8 Ordre de rendu

1. fond de cellule ;
2. textures secondaires ;
3. rivières et routes ;
4. objets décoratifs ;
5. bâtiments ;
6. flux ;
7. effets ;
8. sélection.

---

# 24. Sélection des communes

## Écran France

- recherche ;
- filtre difficulté ;
- filtre archétype ;
- populaires ;
- peu explorées ;
- déjà jouées ;
- aléatoire.

## Archétypes

- rural agricole ;
- rural forestier ;
- vallée ;
- périurbain ;
- petite ville ;
- littoral ;
- montagne ;
- industriel ;
- touristique ;
- transfrontalier, plus tard.

## Difficulté

Calcul possible à partir de :

- fragmentation ;
- densité ;
- part urbanisée ;
- relief ;
- distance entre pôles ;
- dépendance ;
- risques abstraits ;
- budget de scénario.

Toujours préciser que cet indice est ludique.

---

# 25. Direction artistique

## Style

- vue du dessus avec légère perspective 3/4 ;
- maquette territoriale ;
- gouache numérique ;
- formes nettes ;
- architecture française stylisée ;
- ambiance optimiste ;
- carte très lisible.

## Palette

- bleu nuit : navigation ;
- crème : panneaux ;
- vert forêt ;
- vert clair ;
- bleu rivière ;
- jaune agricole ;
- terre cuite ;
- violet gris : friches ;
- orange : alerte ;
- rouge : critique.

## Lisibilité

- couleur + icône + motif ;
- mode daltonisme ;
- textes HTML ;
- contraste WCAG AA ;
- texte minimum 14 px ;
- zones cliquables 40 px minimum.

---

# 26. Inventaire d'assets

## Terrains

- forêt ;
- prairie ;
- culture ;
- humide ;
- eau ;
- urbain ;
- résidentiel ;
- industriel ;
- pollution ;
- chantier ;
- parc restauré.

## Nature

- feuillus ;
- conifères ;
- haies ;
- rochers ;
- roseaux ;
- buissons ;
- fleurs ;
- berges.

## Bâtiments

- maisons ;
- immeubles bas ;
- ferme ;
- grange ;
- commerce ;
- école ;
- santé ;
- atelier ;
- marché ;
- gare ;
- scierie ;
- recyclerie ;
- tiers-lieu ;
- solaire.

## Infrastructures

- routes ;
- chemins ;
- pistes cyclables ;
- ponts ;
- rails ;
- arrêts ;
- lignes.

## Interface

- indicateurs ;
- projets ;
- badges ;
- événements ;
- portraits ;
- blasons ;
- récompenses.

## États

1. planifié ;
2. chantier ;
3. actif ;
4. amélioré.

---

# 27. Pipeline d'assets IA

## 27.1 Bible visuelle

Créer une planche avec :

- palette ;
- caméra ;
- lumière ;
- échelle ;
- arbres ;
- bâtiments ;
- rivière ;
- friche ;
- version restaurée ;
- composants UI.

Elle devient la référence de toutes les générations.

## 27.2 Règles de production

- générer par famille ;
- conserver la même image de référence ;
- produire des objets isolés ;
- éviter les textes ;
- demander un fond transparent ;
- normaliser automatiquement ;
- vérifier à la taille réelle.

## 27.3 Nettoyage

Script Node + Sharp :

- trim ;
- fond ;
- marge ;
- resize ;
- PNG alpha ;
- WebP illustrations ;
- miniatures ;
- hash ;
- rapport d'erreurs.

## 27.4 Atlas Phaser

Séparer :

- nature ;
- bâtiments ;
- infrastructures ;
- particules ;
- icônes.

Éviter un atlas unique.

## 27.5 Contrôle qualité

- perspective ;
- lumière ;
- échelle ;
- silhouette ;
- transparence ;
- absence de texte parasite ;
- absence de coupe ;
- cohérence des états ;
- lisibilité.

---

# 28. Performance

## Objectifs

- premier affichage jouable < 5 s ;
- 60 FPS sur machine moyenne ;
- 30 FPS minimum tablette ;
- carte initiale < 5 Mo ;
- sauvegarde instantanée.

## Techniques

- atlas ;
- WebP/AVIF sans alpha ;
- PNG optimisé avec alpha ;
- culling ;
- pool de particules ;
- pas de SIG lourd côté client ;
- données simplifiées ;
- workers si nécessaire ;
- chargement différé.

## Carte nationale

- GeoJSON simplifié pour prototype ;
- tuiles vectorielles ou PMTiles en production ;
- MapLibre pour le rendu GPU.

---

# 29. PMTiles

Pour la carte nationale :

1. convertir en GeoJSON ou GeoParquet ;
2. générer les tuiles avec Tippecanoe ;
3. créer MBTiles ;
4. empaqueter en PMTiles ;
5. stocker sur S3/R2 ;
6. servir avec requêtes HTTP Range ;
7. lire avec MapLibre.

Pour le gameplay d'une commune, conserver un GameMap JSON dédié.

---

# 30. Sécurité

- Zod sur toutes les entrées ;
- limites de payload ;
- journal d'actions immuable ;
- rate limiting ;
- identifiants opaques ;
- secrets côté serveur ;
- CSP ;
- audit des dépendances ;
- migrations ;
- sauvegardes ;
- validation des GameMap.

---

# 31. Tests

## Moteur

- déterminisme ;
- ressources ;
- projets ;
- synergies ;
- événements ;
- sauvegarde ;
- versions.

## Géographie

- géométries valides ;
- cellules dans la commune ;
- pas de vide ;
- chevauchements contrôlés ;
- graphe connecté ;
- rivière continue ;
- pourcentages 0–1 ;
- IDs uniques.

## Frontend

- sélection ;
- projet ;
- annulation ;
- saison ;
- sauvegarde ;
- reprise ;
- bilan ;
- statistiques.

## End-to-end

1. ouvrir ;
2. choisir ;
3. lancer ;
4. jouer trois actions ;
5. résoudre ;
6. sauvegarder ;
7. recharger ;
8. terminer ;
9. consulter le bilan.

---

# 32. Observabilité

Événements utiles :

- chargement ;
- erreur de carte ;
- début ;
- saison terminée ;
- abandon ;
- fin ;
- projet choisi ;
- tutoriel ;
- erreur de validation.

Indicateurs :

- taux de démarrage ;
- taux de fin ;
- durée ;
- saison d'abandon ;
- projets jamais choisis ;
- communes trop difficiles ;
- erreurs par version.


# 33. Roadmap produit

## Phase 0 — Prototype de règles

Contenu :

- une commune fictive ;
- 20 cellules ;
- 12 projets ;
- 6 saisons ;
- simulation dans un script ;
- aucun backend.

Question testée :

> Le joueur comprend-il les causes d'un problème et ressent-il de la satisfaction lorsqu'un placement crée plusieurs effets ?

Critère :

- trois testeurs doivent pouvoir expliquer une chaîne causale volontairement créée.

## Phase 1 — Prototype web

- React ;
- Phaser ;
- carte fixe ;
- sélection ;
- trois indicateurs ;
- six saisons ;
- résultat local ;
- aucune donnée réelle.

## Phase 2 — Vertical slice

- interface proche du mockup ;
- 50 à 60 cellules ;
- 12 saisons ;
- 20 projets ;
- événements ;
- sauvegarde ;
- bilan ;
- une commune réelle ;
- premières animations finales.

## Phase 3 — Communauté

- backend ;
- validation ;
- compte facultatif ;
- statistiques ;
- classement contextualisé ;
- comparaison.

## Phase 4 — Pipeline France

- COG ;
- contours ;
- PostGIS ;
- grille automatique ;
- export ;
- administration ;
- 10 communes validées.

## Phase 5 — Enrichissement

- rivières ;
- forêt ;
- bâti ;
- agriculture ;
- routes ;
- archétypes ;
- génération de scénarios assistée.

## Phase 6 — Bêta

- 50 à 100 communes ;
- équilibrage ;
- analytics ;
- tutoriel ;
- accessibilité ;
- performance ;
- publication.

---

# 34. MVP recommandé

Ne pas commencer avec toute la France.

## MVP 1

- une carte fictive ;
- 24 à 36 cellules ;
- trois terrains ;
- six saisons ;
- douze projets ;
- trois systèmes ;
- huit événements ;
- sauvegarde locale ;
- bilan ;
- aucun compte.

Question centrale :

> Comprendre, connecter et transformer la carte est-il amusant ?

## Vertical slice

- une commune réelle ;
- 55 à 70 cellules ;
- 12 saisons ;
- 20 à 25 projets ;
- 15 événements ;
- backend ;
- statistiques ;
- écran communautaire ;
- direction artistique finale.

---

# 35. Organisation du développement avec Codex AI

## 35.1 Règle

Ne jamais demander à Codex de créer le jeu complet.

Chaque tâche doit contenir :

- contexte ;
- fichiers autorisés ;
- résultat attendu ;
- contraintes ;
- tests ;
- critères d'acceptation ;
- commandes à exécuter.

## 35.2 AGENTS.md

```md
# Règles de contribution

- TypeScript strict.
- Aucun `any` sans justification.
- Le moteur est déterministe.
- `game-engine` ne dépend ni de React ni de Phaser.
- Les contrats utilisent Zod.
- Toute mécanique possède des tests.
- Les migrations appliquées ne sont jamais modifiées.
- Les traitements SIG sont hors ligne.
- Les textes visibles sont centralisés.
- Après chaque tâche : lint, typecheck, test, build.
```

## 35.3 Méthode de travail

Pour chaque étape :

1. créer une branche ;
2. donner le prompt ;
3. laisser Codex modifier uniquement les fichiers prévus ;
4. lire le diff ;
5. exécuter les tests ;
6. tester manuellement ;
7. corriger ;
8. fusionner ;
9. documenter.

---

# 36. Étapes Codex détaillées

## Étape 1 — Monorepo

### Objectif

Créer la structure.

### Prompt

```text
Initialise un monorepo pnpm TypeScript nommé renaissance-communes.

Crée :
- apps/web avec React, Vite et TypeScript strict ;
- apps/api avec Fastify ;
- apps/geo-worker ;
- packages/game-engine ;
- packages/shared-schemas ;
- packages/map-format ;
- packages/ui.

Ajoute ESLint, Prettier, Vitest et les scripts lint, typecheck, test,
build et dev.
Crée docker-compose avec PostgreSQL + PostGIS.
Ne développe aucune mécanique.
Ajoute un README.
Exécute toutes les commandes et corrige les erreurs.
```

### Acceptation

- installation ;
- build ;
- tests ;
- base démarrée.

---

## Étape 2 — Contrats

```text
Crée GameState, GameCell, ProjectDefinition, PlayerAction,
SeasonResult, GameEvent, GameMap et RunReplay.

Ajoute les schémas Zod.
Crée des fixtures valides et invalides.
Aucune dépendance à React, Phaser ou au navigateur.
Aucun any.
```

Acceptation :

- validation ;
- erreurs compréhensibles ;
- tests.

---

## Étape 3 — Moteur déterministe

```text
Implémente resolveSeason(state, actions, context).

Contraintes :
- fonction pure ;
- aucune Date ;
- aucun Math.random direct ;
- RNG injecté ;
- entrées immuables ;
- journal des variations ;
- mêmes entrées = même sortie.

Ajoute des tests snapshots et de reproductibilité.
```

---

## Étape 4 — Carte fictive

```text
Crée une fixture de 24 cellules avec voisins, terrains et trois zones :
centre-bourg, rivière et ancienne scierie.

Ajoute un validateur :
- IDs uniques ;
- voisins symétriques ;
- graphe connecté ;
- géométries non vides ;
- métriques bornées.
```

---

## Étape 5 — Phaser dans React

```text
Intègre une scène Phaser dans React.
Affiche les cellules.
Permets survol, sélection et désélection.
Expose la sélection à React via un adaptateur typé.
Phaser ne gère pas les panneaux HTML.
Ajoute Playwright.
```

---

## Étape 6 — Interface

```text
Crée l'écran principal :
- top bar ;
- navigation gauche ;
- carte ;
- panneau de cellule ;
- barre événement ;
- cartes de projets.

Crée les design tokens.
Compatible 1366x768 et 1920x1080.
Aucun texte dans les images.
Ajoute un catalogue de composants.
```

---

## Étape 7 — Projets

```text
Ajoute 12 ProjectDefinition.
Filtre selon la cellule.
Affiche coûts, effets et risques.
Permets planification, annulation et confirmation.
Le moteur reste la seule source de vérité.
Ajoute tests.
```

---

## Étape 8 — Synergies

```text
Implémente :
- circuit alimentaire ;
- corridor écologique ;
- centre de proximité.

Le détecteur retourne les cellules et projets contributifs.
Affiche une explication.
Ajoute tests positifs et négatifs.
```

---

## Étape 9 — Campagne

```text
Ajoute 12 saisons en trois actes.
Trois points d'action par saison.
Ajoute chantiers, entretien, effets retardés et transition.
Ajoute un mode debug accéléré.
```

---

## Étape 10 — Événements

```text
Ajoute 15 événements JSON.
Chaque événement possède conditions, poids, cooldown et choix.
Tirage déterministe.
Vue debug d'éligibilité.
Tests de reproductibilité.
```

---

## Étape 11 — Sauvegarde

```text
Implémente IndexedDB versionnée.
Sauvegarde après action et saison.
Ajoute reprise, suppression et migration.
En cas de corruption, afficher une erreur sans bloquer.
```

---

## Étape 12 — Bilan

```text
Crée :
- profil ;
- huit dimensions ;
- objectifs ;
- systèmes ;
- conséquences ;
- chronologie ;
- export image local.

Le profil est calculé par fonction pure testée.
```

---

## Étape 13 — Base et API

```text
Crée les migrations pour users, communes, map_versions, scenarios,
runs, run_actions, run_results et commune_aggregates.

Crée :
POST /runs
POST /runs/:id/checkpoint
POST /runs/:id/complete

Valide avec Zod.
Ajoute tests d'intégration.
```

---

## Étape 14 — Validation serveur

```text
À la fin, rejoue RunReplay côté serveur.
Compare au résultat client.
Marque verified uniquement si égal.
Ajoute tests de fraude.
```

---

## Étape 15 — Statistiques

```text
Calcule par commune :
- parties ;
- joueurs ;
- victoire ;
- médianes ;
- percentiles ;
- usage projets.

Ne publie pas de distribution sous cinq parties.
Crée l'écran communautaire.
Tâche idempotente.
```

---

## Étape 16 — Carte de France

```text
Intègre MapLibre.
Charge des contours simplifiés.
Ajoute recherche, survol, sélection, zoom et détail.
Le code Insee est l'identifiant.
Respecte le budget de performance.
```

---

## Étape 17 — Import SIG

```text
Crée :
pnpm geo import-communes --input <path> --year 2026

Fonctions :
- import GDAL ;
- EPSG:2154 ;
- réparation ;
- métadonnées ;
- rapport JSON ;
- échec clair si invalide.
```

---

## Étape 18 — Grille

```text
Crée :
pnpm geo build-grid --insee <code> --target-cells 60

Utilise ST_HexagonGrid.
Découpe.
Fusionne les fragments.
Construit les voisins.
Exporte GameMap JSON.
Produit un SVG de contrôle.
```

---

## Étape 19 — Hydrographie

```text
Crée :
pnpm geo enrich-hydro --insee <code> --source <gpkg>

Découpe les cours d'eau.
Simplifie sans casser les connexions.
Calcule longueur par cellule.
Produit un graphe.
Ajoute les polylignes.
Génère une prévisualisation.
```

---

## Étape 20 — Occupation du sol

```text
Combine forêt, occupation du sol, bâtiments et agriculture.
Calcule les pourcentages par cellule.
Applique une classification documentée.
Conserve les données brutes.
Produit une traçabilité des sources.
```

---

## Étape 21 — Assets

```text
Crée scripts/assets/process.ts avec Sharp.

Entrée : assets/source-ai.
Sortie : assets/normalized et assets/manifests/assets.json.

Fonctions :
trim, pad, resize, alpha, PNG/WebP, thumbnail, hash et rapport.
Ajoute une page catalogue.
```

---

## Étape 22 — CI/CD

```text
Crée GitHub Actions :
install, lint, typecheck, tests, build, Playwright.
Ajoute validation GameMap.
Ne lance pas le SIG complet à chaque commit.
Documente le déploiement.
```

---

# 37. Prompts pour les assets IA

## 37.1 Prompt maître

```text
Polished asset for a cozy ecological territory-management web game.
Top-down three-quarter orthographic view, consistent 35-degree camera,
soft digital gouache texture, clean readable silhouettes, modern French
rural and small-town architecture, optimistic but grounded atmosphere,
soft natural daylight from the upper left, restrained earthy palette,
subtle ambient shadow, high visual clarity at small size, no text,
no interface, no watermark, no cropped object, consistent scale.
```

## 37.2 Forêt

```text
[MASTER STYLE]

A seamless forest terrain tile for a strategy game map, mixed French
temperate woodland, deciduous trees and a few conifers, clearings and
low bushes, readable from far away, no buildings, no roads, no river,
no border, centered composition, 1024x1024.
```

## 37.3 Rivière

```text
[MASTER STYLE]

A modular gently curved blue-green river segment with natural banks,
stones, reeds and subtle ripples, designed to connect seamlessly,
no bridge, no buildings, transparent background, consistent width,
1024x1024.
```

## 37.4 Centre-bourg

```text
[MASTER STYLE]

A compact French small-town center, warm stone and terracotta roofs,
small square, bakery storefront, town hall silhouette and trees,
friendly and active, no readable signs, isolated transparent background,
1536x1536.
```

## 37.5 Ancienne scierie

```text
[MASTER STYLE]

An abandoned former sawmill complex, damaged wooden industrial
buildings, old chimney, stacked decaying logs, broken yard and subtle
soil pollution, sad but not horror, clear silhouette, transparent
background, 1536x1536.
```

## 37.6 Scierie transformée

```text
[MASTER STYLE]

The exact same footprint and camera as the abandoned sawmill asset,
now transformed into an ecological public park, preserved chimney,
reused timber, paths, young trees, wetland garden and benches,
transparent background, 1536x1536.
```

## 37.7 Icônes

```text
A coherent set of 12 vector-like game icons for population, jobs,
nature, autonomy, happiness, budget, housing, mobility, water, food,
health and resilience. Rounded shapes, navy outlines, readable at
32 pixels, no text, transparent background.
```

## 37.8 Événement

```text
Editorial card illustration for a French territory-management game:
young families visiting renovated apartments near a small town center,
warm optimistic scene with subtle concern about housing, soft digital
gouache, no text, horizontal composition with empty space for HTML text,
1600x900.
```

## 37.9 Marché local

```text
[MASTER STYLE]

A lively but compact French local market for a strategy game, wooden
stalls with vegetables, bread and simple awnings, a few tiny abstract
people, isolated transparent background, no signs, 1536x1536.
```

## 37.10 Voie cyclable

```text
[MASTER STYLE]

A modular top-down bicycle path segment for a territory game, pale
mineral surface, small planted edges, one tiny bicycle silhouette,
designed to connect seamlessly, transparent background, 1024x1024.
```

## 37.11 Maison de santé

```text
[MASTER STYLE]

A small modern health center adapted to a French village, timber and
light stone facade, accessible entrance, a few trees, friendly civic
architecture, isolated transparent background, no signage, 1536x1536.
```

---

# 38. Critères de réussite

Après une partie, le joueur doit pouvoir :

- citer un problème initial ;
- expliquer une décision ;
- expliquer une conséquence inattendue ;
- identifier un système créé ;
- comparer avant et après ;
- comprendre son profil.

Mesures indicatives :

- tutoriel terminé > 70 % ;
- saison 12 atteinte > 50 % ;
- durée médiane 30–45 min ;
- deuxième partie > 20 % ;
- aucun projet inutile ;
- taux de victoire par commune entre 15 et 90 % après équilibrage.

---

# 39. Risques et réponses

## Le jeu ressemble à un tableau de bord

Réponse :

- carte centrale ;
- animation ;
- transformation ;
- trois informations maximum ;
- narration.

## Le SIG absorbe le projet

Réponse :

- carte fictive d'abord ;
- enrichissement après validation ;
- génération hors ligne ;
- validation manuelle.

## Les communes sont trop différentes

Réponse :

- cellules normalisées ;
- archétypes ;
- scénarios ;
- scores contextualisés.

## Les assets IA sont incohérents

Réponse :

- bible ;
- référence ;
- génération par familles ;
- normalisation ;
- catalogue.

## La simulation devient illisible

Réponse :

- trois flux au MVP ;
- six indicateurs ;
- causalité ;
- debug ;
- formules simples.

## Le classement est injuste

Réponse :

- percentiles ;
- catégories ;
- validation serveur ;
- comparaison dans la même commune.

---

# 40. Décisions à trancher après prototype

1. Projets libres ou main de cartes ?
2. Tour par tour pur ou courte animation temps réel ?
3. Défaite dure ou bilan systématique ?
4. Groupes d'habitants ou personnages persistants ?
5. Noms réels ou territoires fictifs inspirés ?
6. Bâtiments réels ou zones abstraites ?
7. Statistiques visibles avant la première fin ?
8. Modèle économique ?
9. Tablette au lancement ?
10. Partage public de cartes ou uniquement de scores ?

---

# 41. Recommandation finale

Ordre conseillé :

```text
1. mécanique sur carte fictive
2. transformation visuelle
3. partie complète
4. sauvegarde
5. backend
6. statistiques
7. sélection de communes
8. contours
9. hexagones
10. rivières
11. occupation du sol
12. relief
13. extension nationale
```

Ne pas commencer par télécharger et traiter toute la France.

Le premier objectif n'est pas :

> Disposer de milliers de cartes.

Le premier objectif est :

> Rendre une seule commune réellement agréable à comprendre et à transformer.

---

# 42. Sources techniques officielles

## Référentiels

- Insee — COG 2026  
  https://www.insee.fr/fr/information/8740222
- Insee — fichiers du COG  
  https://www.insee.fr/fr/information/2560452
- data.gouv.fr — contours administratifs  
  https://www.data.gouv.fr/datasets/contours-administratifs
- Guide API découpage administratif  
  https://guides.data.gouv.fr/guides/reutiliser-des-donnees/utiliser-les-api-geographiques/utiliser-lapi-decoupage-administratif

## IGN

- Données et logiciels ouverts  
  https://www.ign.fr/institut/des-donnees-et-logiciels-ouverts-au-service-de-la-nation
- Recherche et téléchargement  
  https://cartes.gouv.fr/decouvrir/rechercher-une-donnee/
- Services de la Géoplateforme  
  https://geoservices.ign.fr/documentation/services
- Téléchargements et flux  
  https://cartes.gouv.fr/aide/fr/guides-utilisateur/rechercher-une-donnee/telechargements-et-flux/

## Géotraitement

- PostGIS ST_HexagonGrid  
  https://postgis.net/docs/ST_HexagonGrid.html
- PostGIS ST_Intersection  
  https://postgis.net/docs/ST_Intersection.html
- GDAL ogr2ogr  
  https://gdal.org/en/stable/programs/ogr2ogr.html
- GDAL GeoPackage  
  https://gdal.org/en/stable/drivers/vector/gpkg.html

## Web cartographique

- MapLibre GL JS  
  https://maplibre.org/maplibre-gl-js/docs/
- PMTiles pour MapLibre  
  https://docs.protomaps.com/pmtiles/maplibre
- Concepts PMTiles  
  https://docs.protomaps.com/pmtiles/
- Tippecanoe  
  https://github.com/felt/tippecanoe

---

# 43. Glossaire

**COG** — Code officiel géographique.  
**Code Insee** — Identifiant administratif d'une commune.  
**SIG** — Système d'information géographique.  
**PostGIS** — Extension géographique de PostgreSQL.  
**Lambert-93** — Projection métrique EPSG:2154.  
**GeoJSON** — Format JSON géographique.  
**GeoPackage** — Format SIG basé sur SQLite.  
**PMTiles** — Archive de tuiles servie depuis du stockage objet.  
**GameMap** — Format interne léger d'une carte jouable.  
**Moteur déterministe** — Même résultat pour les mêmes entrées.  
**Trajectoire** — Ensemble des choix et conséquences d'une partie.  
**Système territorial** — Combinaison fonctionnelle reconnue par le moteur.
