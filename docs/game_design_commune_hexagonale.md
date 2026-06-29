# Game Design Document — Jeu de commune en tuiles hexagonales

## 1. Vision du jeu

Le jeu est un jeu de stratégie et d’optimisation calme, basé sur le placement de tuiles hexagonales autour d’un bourg central.

Le joueur développe progressivement une commune en choisissant, à chaque tour, une tuile parmi plusieurs propositions aléatoires. Il doit positionner cette tuile intelligemment, profiter des synergies de voisinage, puis éventuellement améliorer une tuile déjà présente.

L’objectif n’est pas de construire une ville dense ni de gérer une économie complexe. Le cœur du jeu consiste à organiser un territoire équilibré capable de répondre aux besoins de ses habitants en nourriture, énergie, nature et qualité de vie.

La sensation recherchée est celle d’un puzzle territorial accessible, satisfaisant et rejouable, avec une forte progression visuelle.

---

## 2. Piliers de design

### 2.1 Un territoire construit progressivement

La partie commence avec une seule tuile centrale : le bourg.

Le joueur étend ensuite la commune en posant des tuiles autour de celles déjà présentes. Chaque nouvelle tuile modifie les possibilités de placement, les ressources produites et les synergies disponibles.

### 2.2 Des choix simples, mais significatifs

À chaque tour, le joueur prend peu de décisions :

1. choisir une tuile parmi plusieurs propositions ;
2. la positionner ;
3. améliorer éventuellement une tuile existante ;
4. terminer le tour.

Chaque décision doit cependant avoir des conséquences visibles et stratégiques.

### 2.3 Des synergies territoriales

Les tuiles gagnent des bonus selon leurs voisines.

Exemples :

- un verger adjacent à une prairie fleurie reçoit un bonus de pollinisation ;
- une ferme proche du bourg distribue plus facilement sa nourriture ;
- une forêt adjacente à une rivière améliore la qualité de l’eau ;
- plusieurs espaces naturels connectés créent un corridor écologique ;
- une ferme équipée de panneaux solaires produit également de l’énergie.

### 2.4 Des améliorations visibles

Une tuile peut recevoir une ou plusieurs améliorations spécialisées.

Exemples :

- ruche sur un verger ;
- panneaux solaires sur une ferme ;
- haies autour d’un champ ;
- sentier dans une forêt ;
- turbine sur une rivière ;
- mare dans une prairie ;
- récupération d’eau sur un bâtiment agricole.

Ces améliorations doivent apparaître directement sur la carte.

### 2.5 Une victoire accessible, une optimisation ouverte

Chaque commune possède un score minimal à atteindre pour être considérée comme réussie.

Ce seuil garantit que le joueur a construit un territoire suffisamment équilibré pour répondre aux besoins essentiels de la population.

Une fois le seuil dépassé, le joueur continue d’optimiser son territoire afin d’obtenir le meilleur score possible et de se positionner dans le classement propre à la commune.

Plusieurs stratégies doivent pouvoir atteindre le seuil de victoire, et plusieurs approches doivent permettre de viser les meilleurs scores.

---

## 3. Boucle principale d’un tour

Chaque tour suit toujours la même structure.

### Phase 1 — Proposition de tuiles

Le joueur reçoit plusieurs tuiles candidates, par exemple trois.

Chaque proposition affiche :

- le type de tuile ;
- ses productions de base ;
- ses contraintes ;
- ses éventuelles connexions ;
- un aperçu des synergies possibles.

Le joueur doit choisir une seule tuile.

Les propositions peuvent être partiellement aléatoires, avec des règles empêchant les situations impossibles.

### Phase 2 — Placement

Le joueur positionne la tuile choisie contre une tuile déjà posée.

Le jeu affiche avant validation :

- les ressources produites ;
- les bonus de voisinage ;
- les malus éventuels ;
- les nouvelles connexions ;
- la progression des objectifs ;
- les synergies activées ou interrompues.

Le joueur peut faire pivoter la tuile si les bords ou connexions ont une importance.

### Phase 3 — Amélioration facultative

Après le placement, le joueur peut améliorer une tuile existante s’il dispose d’un point d’amélioration ou si les conditions nécessaires sont remplies.

Cette étape est facultative.

Le joueur peut :

- ajouter une amélioration ;
- faire évoluer une construction ;
- restaurer un milieu ;
- renforcer une connexion ;
- conserver son point pour plus tard, si le système le permet.

### Phase 4 — Résolution

Le jeu recalcule :

- nourriture ;
- énergie ;
- nature ;
- bonheur ;
- santé ;
- population ;
- résilience ;
- artificialisation ;
- objectifs de commune.

Les effets visuels sont joués sur la carte :

- apparition d’arbres ;
- floraison ;
- circulation d’habitants ;
- animation d’un moulin ;
- éclairage de bâtiments ;
- arrivée d’animaux ;
- évolution du bourg.

### Phase 5 — Fin du tour

Le joueur valide la fin du tour.

Le jeu peut alors :

- faire évoluer la population ;
- appliquer un événement ;
- débloquer de nouvelles tuiles ;
- proposer de nouvelles améliorations ;
- passer à la saison suivante ;
- vérifier les conditions de victoire ou de fin.

---

## 4. Structure générale d’une partie

### 4.1 Départ

Chaque partie commence avec :

- une tuile Bourg ;
- une population initiale ;
- des besoins de base ;
- une particularité communale ;
- un nombre limité de tours ou de placements ;
- quelques types de tuiles disponibles ;
- une première série d’objectifs.

### 4.2 Développement

Le joueur construit progressivement un territoire de 15 à 25 tuiles environ.

La carte doit rester suffisamment petite pour que chaque placement soit important et lisible.

### 4.3 Fin de partie

La partie se termine lorsque l’une des conditions suivantes est remplie :

- le nombre maximal de tours est atteint ;
- le nombre maximal de tuiles est posé ;
- le nombre maximal de tours est atteint ;
- le joueur déclenche volontairement le bilan final après avoir atteint le score minimal de victoire.

Il est préférable d’éviter les défaites brutales. Une mauvaise partie doit généralement aller jusqu’au bilan, avec un résultat faible plutôt qu’un écran de game over.

---

## 5. La tuile Bourg

La tuile Bourg est le centre de la commune.

Elle ne représente pas toute la zone urbaine à construire, mais le cœur habité du territoire.

Elle contient visuellement :

- mairie ;
- place centrale ;
- maisons ;
- commerces ;
- école ou service public ;
- habitants ;
- espaces végétalisés.

Le bourg reçoit les bénéfices du territoire environnant.

Son apparence évolue avec la progression :

- nouveaux habitants ;
- bâtiments rénovés ;
- marché animé ;
- rues végétalisées ;
- éclairage alimenté localement ;
- fontaine ou place restaurée ;
- nouveaux services ;
- meilleure fréquentation.

Le bourg peut également recevoir ses propres améliorations :

- marché local ;
- cantine ;
- toiture solaire ;
- végétalisation ;
- maison de santé ;
- piste cyclable ;
- récupération d’eau ;
- rénovation énergétique.

---

## 6. Ressources principales

Le jeu doit rester lisible. Quatre ressources principales sont recommandées.

### Nourriture

Représente la capacité à alimenter la population.

Produite notamment par :

- ferme ;
- champ ;
- verger ;
- maraîchage ;
- forêt nourricière ;
- élevage extensif.

### Énergie

Représente l’énergie locale disponible.

Produite notamment par :

- panneaux solaires ;
- éolienne ;
- turbine ;
- méthanisation limitée ;
- rénovation énergétique réduisant les besoins.

### Nature

Représente la qualité écologique du territoire.

Améliorée notamment par :

- forêt ;
- prairie ;
- haies ;
- zone humide ;
- rivière restaurée ;
- corridors écologiques ;
- diversité des milieux.

### Bonheur

Représente la qualité de vie générale.

Amélioré notamment par :

- accès à la nature ;
- alimentation locale ;
- services ;
- déplacements doux ;
- diversité du paysage ;
- loisirs ;
- faible pollution.

---

## 7. Statistiques secondaires

Certaines valeurs peuvent être calculées à partir des ressources principales.

### Santé

Dépend de :

- nourriture suffisante ;
- qualité de l’eau ;
- nature accessible ;
- faible pollution ;
- services de proximité.

### Population

La population augmente si les besoins sont satisfaits.

Une population plus importante produit éventuellement davantage de points, mais augmente les besoins de nourriture, d’énergie et de services.

### Résilience

Mesure la capacité de la commune à supporter les aléas.

Elle dépend de :

- diversité des productions ;
- stockage ;
- zones humides ;
- forêts ;
- autonomie ;
- faible dépendance à une seule source.

### Artificialisation

Augmente avec les constructions lourdes et certaines infrastructures.

Elle doit rester sous un seuil pour atteindre 100 %.

### Biodiversité

Peut être intégrée à Nature ou exister comme sous-statistique.

Elle dépend principalement de la diversité des milieux et de leur continuité.

---

## 8. Types de tuiles

### Bourg

Tuile centrale unique.

### Prairie

Produit de la nature et du bonheur.

Synergies possibles :

- bonus avec ruche ;
- bonus avec verger ;
- bonus avec forêt ;
- continuité écologique.

Améliorations possibles :

- prairie fleurie ;
- mare ;
- pâturage extensif ;
- hôtel à insectes.

### Forêt

Produit beaucoup de nature et améliore la résilience.

Synergies possibles :

- bonus près d’une rivière ;
- bonus avec d’autres forêts ;
- réduction de pollution près d’une ferme ;
- corridor écologique.

Améliorations possibles :

- sentier ;
- gestion durable ;
- zone protégée ;
- forêt nourricière.

### Rivière

Produit de l’eau, de la nature et parfois de l’énergie.

Contraintes :

- doit conserver une continuité ;
- certaines constructions dégradent sa qualité.

Améliorations possibles :

- turbine douce ;
- restauration des berges ;
- passe à poissons ;
- promenade ;
- zone humide adjacente.

### Champ

Produit beaucoup de nourriture.

Contreparties possibles :

- faible nature ;
- appauvrissement du sol ;
- besoin en eau.

Améliorations possibles :

- rotation des cultures ;
- haies ;
- irrigation raisonnée ;
- agriculture biologique.

### Verger

Produit de la nourriture et un peu de nature.

Synergies possibles :

- prairie ;
- ruche ;
- haies ;
- proximité du bourg.

Améliorations possibles :

- rucher ;
- diversification des arbres ;
- cueillette locale ;
- agroforesterie.

### Ferme

Construction productive polyvalente.

Produit :

- nourriture ;
- emplois ou bonheur ;
- parfois énergie après amélioration.

Améliorations possibles :

- panneaux solaires ;
- récupération d’eau ;
- compostage ;
- vente directe ;
- isolation ;
- atelier de transformation.

### Colline

Terrain favorable au vent, aux panoramas et à certaines zones naturelles.

Améliorations possibles :

- éolienne ;
- belvédère ;
- pâturage ;
- reboisement.

### Zone humide

Produit beaucoup de nature et de résilience.

Contraintes :

- nécessite généralement une rivière ou un terrain humide.

Améliorations possibles :

- réserve naturelle ;
- observatoire ;
- bassin de rétention.

### Friche

Tuile faible au départ, mais flexible.

Peut devenir :

- ferme solaire ;
- prairie ;
- atelier ;
- forêt ;
- équipement communal.

La friche peut être intéressante car elle permet de créer des choix de reconversion.

---

## 9. Système de synergies

Les synergies sont le cœur de l’optimisation.

### Synergies d’adjacence

Une tuile reçoit un bonus selon ses voisines immédiates.

Exemples :

- verger + prairie : pollinisation ;
- forêt + rivière : eau protégée ;
- ferme + bourg : circuit court ;
- prairie + forêt : corridor écologique ;
- zone humide + rivière : résilience aux inondations.

### Synergies de groupe

Un ensemble de plusieurs tuiles forme un motif.

Exemples :

- trois milieux naturels connectés : corridor écologique ;
- ferme + verger + marché du bourg : alimentation locale ;
- rivière + turbine + stockage : autonomie énergétique ;
- plusieurs productions différentes : résilience alimentaire.

### Synergies d’amélioration

Une amélioration renforce une relation existante.

Exemples :

- une ruche augmente les vergers et prairies proches ;
- les haies améliorent les champs adjacents ;
- les panneaux solaires bénéficient d’un stockage communal ;
- un sentier relie plusieurs espaces naturels au bourg.

### Synergies négatives

Certaines associations créent des malus.

Exemples :

- industrie ou infrastructure lourde près d’un espace naturel ;
- monoculture entourée de monocultures ;
- éolienne trop proche du bourg ;
- rivière fragmentée ;
- trop forte concentration de tuiles artificialisées.

---

## 10. Système d’améliorations

Chaque tuile peut disposer de un ou deux emplacements d’amélioration.

Les améliorations doivent remplir au moins l’un de ces rôles :

- augmenter une production ;
- réduire un malus ;
- créer une synergie ;
- transformer le rôle de la tuile ;
- améliorer son apparence ;
- contribuer à un objectif spécial.

### Catégories d’améliorations

#### Productives

- panneaux solaires ;
- ruche ;
- turbine ;
- serre ;
- atelier de transformation.

#### Écologiques

- haies ;
- mare ;
- passe à poissons ;
- arbres supplémentaires ;
- restauration des sols.

#### Sociales

- sentier ;
- marché ;
- aire de loisirs ;
- vente directe ;
- transport doux.

#### Défensives ou résilientes

- bassin de rétention ;
- stockage d’énergie ;
- réserve d’eau ;
- pare-feu naturel ;
- diversification agricole.

### Déblocage des améliorations

Les améliorations peuvent être débloquées par :

- niveau de ressource atteint ;
- objectif accompli ;
- nombre de tuiles posées ;
- découverte d’une synergie ;
- particularité de la commune ;
- progression saisonnière.

---

## 11. Proposition aléatoire des tuiles

Le hasard doit créer de l’adaptation, sans rendre une partie impossible.

### Règle de base

À chaque tour, le joueur choisit une tuile parmi trois propositions.

### Contrôle du hasard

Le système doit respecter plusieurs règles :

- toujours proposer au moins une tuile jouable ;
- éviter les longues séries du même type ;
- garantir l’apparition des catégories essentielles ;
- tenir compte des objectifs encore réalisables ;
- augmenter légèrement la probabilité des tuiles nécessaires ;
- éviter de donner trop tôt des tuiles avancées.

### Pioche ou sac de tuiles

Une solution adaptée consiste à utiliser un sac de tuiles défini pour chaque commune.

Exemple :

- 4 prairies ;
- 3 forêts ;
- 3 champs ;
- 2 rivières ;
- 2 vergers ;
- 1 colline ;
- 1 friche ;
- 1 zone humide.

Le joueur ne connaît pas nécessairement l’ordre, mais peut connaître le contenu global du sac.

Cela permet de combiner hasard et planification.

### Possibilités de contrôle données au joueur

Quelques outils peuvent limiter la frustration :

- conserver une proposition pour le tour suivant ;
- remplacer une proposition une fois par partie ;
- regarder les prochaines tuiles ;
- débloquer un quatrième choix ;
- défausser une tuile contre une pénalité ;
- choisir une tuile garantie après un objectif.

---

## 12. Particularités des communes

Chaque commune possède une identité qui modifie la partie.

### Exemples

#### Commune agricole

- beaucoup de terres fertiles ;
- production alimentaire facilitée ;
- biodiversité initiale faible ;
- risque d’épuisement des sols.

#### Commune forestière

- nature abondante ;
- peu de terrains agricoles ;
- potentiel de tourisme doux ;
- risques d’incendie.

#### Commune de rivière

- énergie hydraulique ;
- bonne fertilité ;
- risque d’inondation ;
- continuité de rivière à respecter.

#### Commune de montagne

- tuiles difficiles à aménager ;
- potentiel éolien et hydraulique ;
- mobilité plus compliquée ;
- forte valeur paysagère.

#### Commune périurbaine

- nombreuses friches ;
- besoins élevés ;
- artificialisation initiale importante ;
- fort potentiel de reconversion.

#### Commune littorale

- vent abondant ;
- biodiversité particulière ;
- pression touristique ;
- risque de submersion.

Chaque particularité doit modifier :

- le sac de tuiles ;
- les objectifs ;
- les seuils de ressources ;
- les risques ;
- les améliorations disponibles ;
- les bonus de score.

---

## 13. Condition de victoire et score minimal

Chaque commune possède un score minimal à atteindre.

Ce seuil représente le niveau de réussite attendu pour considérer la commune comme revitalisée ou équilibrée.

Exemple :

```text
Score minimal de victoire : 5 000
Score actuel : 4 620
```

Le joueur peut dépasser ce seuil autant que possible.

Le score minimal ne doit cependant pas permettre de compenser totalement une commune déséquilibrée avec une seule statistique très élevée.

Il est donc recommandé d’ajouter quelques conditions essentielles obligatoires, par exemple :

- nourriture au-dessus d’un seuil minimal ;
- énergie au-dessus d’un seuil minimal ;
- santé de la population suffisante ;
- artificialisation sous une limite critique.

Exemple :

```text
Conditions essentielles

✓ Nourriture : 62 / 50
✓ Énergie : 48 / 40
✓ Santé : 71 / 60
✗ Artificialisation : 31 / 25

Score : 5 480 / 5 000
Victoire non validée : artificialisation trop élevée
```

Ces conditions doivent rester peu nombreuses et faciles à comprendre. Le score reste le principal objectif, tandis que les seuils essentiels empêchent les stratégies absurdes ou trop déséquilibrées.

---

## 14. Score final

Le score remplit deux fonctions :

- valider la victoire lorsque le seuil minimal est atteint ;
- comparer les performances au-delà de ce seuil.

Chaque commune possède son propre score minimal, adapté à sa difficulté, à sa taille et à ses contraintes.

### Composantes du score

- satisfaction des besoins ;
- santé ;
- bonheur ;
- biodiversité ;
- résilience ;
- autonomie alimentaire ;
- autonomie énergétique ;
- artificialisation ;
- nombre d’actions restantes ;
- nombre de tuiles intactes ;
- diversité des aménagements ;
- nombre de synergies actives ;
- qualité de l’organisation territoriale.

### Bonus d’excellence

Le joueur peut recevoir des bonus pour :

- dépasser largement le score minimal ;
- conserver plusieurs espaces naturels ;
- éviter la surproduction ;
- utiliser peu d’améliorations ;
- créer plusieurs circuits locaux ;
- maintenir une forte diversité ;
- réussir un objectif propre à la commune.

### Distinctions

Exemples :

- Commune autonome ;
- Gardienne de la rivière ;
- Territoire vivant ;
- Zéro artificialisation nette ;
- Championne des circuits courts ;
- Commune sobre ;
- Refuge de biodiversité ;
- Énergie positive.

---

## 15. Bilan de fin de partie

Le bilan doit raconter la commune créée.

### Informations affichées

- score total ;
- rang ;
- score minimal requis ;
- écart entre le score obtenu et le seuil de victoire ;
- tours utilisés ;
- population finale ;
- ressources finales ;
- autonomie ;
- artificialisation ;
- biodiversité ;
- synergies activées ;
- améliorations installées ;
- événements traversés ;
- carte finale de la commune.

### Comparaison avec les parties précédentes

Le jeu peut afficher :

- meilleur score personnel sur cette commune ;
- position dans le classement de cette commune ;
- écart avec le meilleur score connu ;
- meilleure biodiversité ;
- plus faible artificialisation ;
- meilleure autonomie ;
- moins de tours utilisés ;
- meilleur équilibre global.

---

## 16. Progression entre les parties

Le jeu peut proposer une progression légère sans rendre les premières communes impossibles à accomplir.

### Éléments débloquables

- nouvelles communes ;
- nouvelles améliorations ;
- nouveaux types de tuiles ;
- variantes de bourg ;
- défis ;
- cosmétiques ;
- encyclopédie des synergies ;
- modes de difficulté.

### Principe important

Les déblocages ne doivent pas être obligatoires pour atteindre le score minimal sur une commune déjà disponible.

Ils doivent ajouter de nouvelles possibilités, de nouveaux scénarios ou de nouvelles stratégies.

---

## 17. Événements

Les événements doivent rester limités et lisibles.

Exemples :

- sécheresse ;
- pluie abondante ;
- vague de chaleur ;
- arrivée de nouveaux habitants ;
- demande de marché local ;
- maladie des cultures ;
- programme d’aide énergétique ;
- découverte d’une espèce protégée.

Les événements peuvent :

- modifier temporairement une production ;
- créer un objectif secondaire ;
- tester la résilience ;
- offrir un choix ;
- débloquer une amélioration.

Le hasard événementiel ne doit pas empêcher définitivement d’atteindre le score minimal sans possibilité de réaction.

---

## 18. Interface utilisateur

### Vue principale

La carte doit rester au centre.

Les informations importantes :

- ressources en haut ;
- objectifs sur le côté ;
- propositions de tuiles en bas ;
- amélioration disponible clairement visible ;
- bouton de fin de tour ;
- aperçu des effets avant placement.

### Lisibilité des synergies

Lorsqu’une tuile est survolée ou déplacée :

- les voisines concernées sont surlignées ;
- les bonus apparaissent avec des icônes ;
- les liens positifs sont animés ;
- les conflits sont signalés ;
- le total avant et après placement est comparé.

### Inspection d’une tuile

Cliquer sur une tuile affiche :

- type ;
- niveau ;
- productions ;
- synergies ;
- malus ;
- améliorations installées ;
- améliorations disponibles ;
- rayon ou connexions.

---

## 19. Direction artistique

Le style recherché est dessiné, chaleureux et non réaliste.

### Principes visuels

- vue isométrique ou 2.5D ;
- formes simples et lisibles ;
- contours légèrement dessinés ;
- textures peintes ;
- couleurs chaleureuses ;
- animations douces ;
- bâtiments inspirés des communes françaises ;
- évolution visuelle forte des tuiles.

### Priorités de production

Le jeu doit rester convaincant sans nécessiter une grande quantité d’animations complexes.

Chaque tuile peut être composée de :

- un terrain de base ;
- une construction principale ;
- quelques éléments décoratifs ;
- un ou deux overlays d’amélioration ;
- de petites animations en boucle.

---

## 20. Contenu minimal pour un prototype

### Carte

- grille hexagonale ;
- tuile Bourg centrale ;
- placement autour des tuiles existantes ;
- aperçu avant validation ;
- rotation facultative.

### Tuiles

Au minimum :

- prairie ;
- forêt ;
- rivière ;
- champ ;
- verger ;
- ferme.

### Ressources

- nourriture ;
- énergie ;
- nature ;
- bonheur.

### Améliorations

Au minimum :

- ruche ;
- panneaux solaires ;
- haies ;
- sentier forestier ;
- turbine.

### Synergies

Au minimum cinq synergies :

- verger + prairie ;
- forêt + rivière ;
- ferme + bourg ;
- forêt + forêt ;
- champ + haies.

### Boucle

- trois propositions ;
- sélection ;
- placement ;
- amélioration facultative ;
- fin du tour ;
- recalcul ;
- écran de bilan.

### Fin

- nombre limité de tours ;
- score minimal de victoire ;
- conditions essentielles ;
- score final ;
- statistiques.

---

## 21. Ordre de développement recommandé

### Étape 1 — Boucle brute

- placer une tuile ;
- terminer un tour ;
- générer trois propositions ;
- empêcher les placements invalides.

### Étape 2 — Ressources

- ajouter les quatre ressources principales ;
- recalculer après placement ;
- afficher les variations.

### Étape 3 — Synergies

- créer les bonus d’adjacence ;
- afficher un aperçu avant placement ;
- ajouter les premiers motifs territoriaux.

### Étape 4 — Améliorations

- sélectionner une tuile existante ;
- ajouter une amélioration ;
- modifier ses statistiques ;
- afficher visuellement l’amélioration.

### Étape 5 — Objectifs

- définir une commune test ;
- ajouter une checklist ;
- calculer le pourcentage d’accomplissement.

### Étape 6 — Fin de partie

- limiter le nombre de tours ;
- produire le score ;
- afficher le bilan final ;
- enregistrer le meilleur résultat.

### Étape 7 — Identité visuelle

- ajouter les variantes graphiques ;
- animer les productions ;
- faire évoluer le bourg ;
- renforcer les retours visuels.

---

## 22. Commune de test recommandée

### Nom

Saint-Verdant

### Particularité

Petite commune rurale équilibrée, conçue pour apprendre les règles.

### Durée

15 tours.

### Taille maximale

16 tuiles en plus du bourg.

### Tuiles disponibles

- 3 prairies ;
- 3 forêts ;
- 2 rivières ;
- 2 champs ;
- 2 vergers ;
- 2 fermes ;
- 1 colline ;
- 1 friche.

### Améliorations

- ruche ;
- panneaux solaires ;
- haies ;
- sentier ;
- turbine ;
- récupération d’eau.

### Condition de victoire

- score minimal : 5 000 points ;
- nourriture minimale : 45 ;
- énergie minimale : 35 ;
- santé minimale : 60 ;
- artificialisation maximale : 30.

### Principales sources de score

- nourriture excédentaire raisonnable ;
- autonomie énergétique ;
- nature et biodiversité ;
- bonheur et santé ;
- corridors écologiques ;
- synergies actives ;
- faible artificialisation ;
- tours ou actions restantes.

### Synergies principales

- verger adjacent à prairie : +2 nourriture et +1 nature ;
- forêt adjacente à rivière : +2 nature ;
- ferme adjacente au bourg : +2 bonheur ;
- deux forêts adjacentes : +1 nature chacune ;
- ruche sur verger proche d’une prairie : bonus supplémentaire ;
- panneaux solaires sur ferme : +3 énergie sans nouvelle artificialisation.

---

## 23. Résumé de la formule de jeu

La formule centrale du jeu est :

> Choisir une tuile, la positionner intelligemment, améliorer le territoire, puis observer la commune évoluer.

La profondeur vient de la combinaison de quatre éléments :

- choix aléatoire contrôlé ;
- placement spatial ;
- synergies de voisinage ;
- améliorations spécialisées.

La victoire vient de l’atteinte d’un score minimal associé à quelques conditions essentielles.

La performance vient ensuite de la capacité à dépasser ce seuil grâce à un territoire équilibré, efficace et peu artificialisé.

Le jeu doit donner au joueur la sensation de construire un territoire vivant, cohérent et unique, tour après tour.
