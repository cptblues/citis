# Virea — Évolution du gameplay web
## Placement de structures, améliorations et influences territoriales

> **Statut :** proposition de gameplay v2 pour le prototype web  
> **Date :** 29 juin 2026  
> **Document de référence précédent :** `specs_jeu_renaissance_communes.md`  
> **Nom de travail :** *Virea — Communes vivantes*  
> **Plateforme :** navigateur desktop  
> **Technologies conservées :** React, TypeScript, Phaser, moteur déterministe partagé  
> **Durée cible :** 30 à 45 minutes  
> **Mode :** solo avec statistiques communautaires asynchrones

---

# 1. Rôle de ce document

Ce document décrit une évolution du gameplay du premier cahier des charges web.

Il ne remplace pas les sections relatives :

- aux données géographiques françaises ;
- au découpage des communes ;
- au backend communautaire ;
- à la validation serveur ;
- à la direction artistique générale ;
- au pipeline d'assets.

Il remplace ou complète principalement les sections consacrées :

- à la boucle de jeu ;
- aux projets ;
- aux actions ;
- aux tuiles ;
- aux synergies ;
- à la simulation ;
- au score ;
- à l'interface de jeu ;
- au contenu du premier prototype.

La principale évolution est la suivante :

> Les projets ponctuels deviennent des structures persistantes placées sur les tuiles, améliorables sur trois niveaux et capables d'influencer les tuiles voisines.

---

# 2. Nouvelle proposition centrale

Le joueur reçoit une commune composée d'environ 35 à 45 tuiles pour le premier prototype.

Chaque tuile peut accueillir au maximum **une structure principale**.

Le joueur peut effectuer trois types d'actions :

1. construire une nouvelle structure ;
2. améliorer une structure existante ;
3. recycler une structure pour récupérer une partie de son coût.

Les structures agissent :

- directement sur leur propre tuile ;
- indirectement sur les tuiles situées dans leur rayon d'influence ;
- positivement ou négativement ;
- différemment selon la nature de la tuile d'accueil ;
- différemment selon leur niveau.

Le plaisir recherché devient :

```text
observer la carte
→ choisir le bon bâtiment
→ trouver la meilleure tuile
→ visualiser les influences
→ créer une combinaison
→ améliorer la structure
→ voir le score et la commune progresser
```

Le jeu devient plus proche d'un mélange entre :

- un city-builder compact ;
- un jeu de plateau à optimisation ;
- un puzzle de voisinage ;
- un jeu de transformation territoriale.

---

# 3. Objectifs de conception

## 3.1 Placement immédiatement compréhensible

Le joueur doit comprendre avant de construire :

- ce que produit le bâtiment ;
- les tuiles touchées ;
- les bonus de terrain ;
- les effets négatifs ;
- le gain ou la perte de score prévue.

## 3.2 Peu de bâtiments, beaucoup de combinaisons

La première version contient seulement sept familles de structures.

La profondeur vient :

- du choix de la tuile ;
- du niveau de la structure ;
- du rayon ;
- des structures voisines ;
- des besoins locaux ;
- du moment de l'investissement.

## 3.3 Les améliorations doivent changer le rôle

Un niveau supérieur ne doit pas seulement ajouter des chiffres.

Selon le bâtiment, une amélioration peut :

- agrandir le rayon ;
- ajouter un effet secondaire ;
- réduire une nuisance ;
- améliorer son rendement ;
- débloquer une synergie ;
- modifier visuellement le quartier.

## 3.4 Un score visible et explicable

Le joueur doit toujours pouvoir répondre à la question :

> Pourquoi mon score vient-il d'augmenter ou de diminuer ?

## 3.5 Une première version très contrôlée

La v1 ne contient pas :

- de routes à tracer ;
- de réseau électrique manuel ;
- de gestion individuelle des habitants ;
- de multiples ressources de construction ;
- de bâtiments orientables librement ;
- de plusieurs structures sur une tuile ;
- de branches d'amélioration ;
- de multijoueur synchrone ;
- de marché entre joueurs.

---

# 4. Format de la première partie

## 4.1 Carte

- 37 tuiles idéales pour une carte de test hexagonale ;
- entre 35 et 45 tuiles pour une commune réelle découpée ;
- cinq types principaux de terrain ;
- un modificateur optionnel de rivière ;
- une mairie de départ non recyclable ;
- quelques tuiles déjà occupées ou dégradées selon le scénario.

## 4.2 Tours

La première version utilise **10 tours**.

Chaque tour fournit :

- 3 points d'action ;
- un revenu ;
- une courte phase de planification ;
- une résolution ;
- un retour visuel.

Le joueur dispose donc d'environ 30 actions durant une partie.

Cette quantité permet généralement :

- de construire 8 à 12 structures ;
- d'en améliorer plusieurs ;
- de recycler une ou deux erreurs ;
- de terminer en 30 à 45 minutes.

## 4.3 Actions

| Action | Coût en action | Effet |
|---|---:|---|
| Construire | 1 | Ajoute une structure niveau 1 |
| Améliorer | 1 | Passe au niveau suivant |
| Recycler | 1 | Supprime et rembourse partiellement |
| Étudier une tuile | 1 | Optionnel, révèle le détail d'une zone |
| Passer | 0 | Termine volontairement le tour |

L'action « Étudier » peut être retirée du tout premier prototype.

---

# 5. Ressources et indicateurs

## 5.1 Une seule ressource dépensable

La v1 utilise uniquement le **budget de développement**.

Il sert à :

- construire ;
- améliorer ;
- payer l'entretien ;
- absorber certains événements futurs.

Le budget est gagné par :

- le revenu de base ;
- les commerces ;
- les ateliers et industries ;
- certaines fermes ;
- les objectifs intermédiaires.

Le recyclage rend une partie du budget investi.

## 5.2 Indicateurs principaux

Les six valeurs visibles en permanence sont :

1. Population
2. Emplois
3. Services
4. Nature
5. Autonomie
6. Budget

Le **Score communal** est affiché séparément et de façon plus importante.

## 5.3 Valeurs dérivées

### Attractivité locale

Détermine le taux d'occupation des habitations.

Elle dépend notamment :

- des services ;
- de la nature ;
- des commerces ;
- des emplois proches ;
- de la pollution.

### Bonheur

Moyenne de la satisfaction des zones habitées.

Il influence le score, mais n'est pas une ressource directement dépensée.

### Pollution

Valeur négative locale et globale.

Elle est surtout produite par les structures économiques lourdes.

### Revenu par tour

Somme :

```text
revenu de base
+ commerces actifs
+ production active
+ agriculture
- entretien
```

---

# 6. Types de tuiles

Chaque tuile possède :

- un type principal ;
- éventuellement un ou plusieurs modificateurs ;
- une structure principale ;
- des valeurs locales ;
- une liste de voisines ;
- une position logique hexagonale.

## 6.1 Centre-bourg

Caractéristiques :

- forte valeur commerciale ;
- bonne accessibilité ;
- espace limité ;
- terrain adapté aux services.

Bonus proposés :

- Commerce : +25 % de revenu.
- École : +20 % de services.
- Habitation : +10 % d'attractivité initiale.

Contraintes :

- Usine interdite dans la v1.
- Ferme interdite.

## 6.2 Zone résidentielle ou constructible

Caractéristiques :

- terrain neutre ;
- bonne compatibilité avec l'habitat ;
- nombreux choix possibles.

Bonus :

- Habitation : +20 % de capacité.
- Parc : +10 % d'influence sur le bonheur.

## 6.3 Terre agricole

Bonus :

- Ferme : +50 % d'autonomie.
- Installation solaire : +20 % d'autonomie.

Malus :

- Habitation : -20 % de capacité.
- La construction d'un bâtiment non agricole ajoute une petite pénalité de sobriété foncière au score final.

## 6.4 Forêt ou zone naturelle

Bonus :

- Parc : +50 % de nature.
- Ferme agroécologique niveau 3 : petit bonus de continuité naturelle si adjacente.

Contraintes :

- Habitation interdite.
- Commerce interdit.
- Atelier ou usine interdit.
- Solaire interdit dans la première version.

## 6.5 Zone industrielle ou friche

Bonus :

- Atelier : coût initial réduit de 20 %.
- Pollution du bâtiment réduite de 25 %, car la nuisance est mieux localisée.

Contraintes :

- Habitation interdite.
- Parc plus cher au niveau 1 en raison de la dépollution nécessaire.

## 6.6 Modificateur « bord de rivière »

Ce modificateur peut s'ajouter à un type de tuile.

Bonus :

- Parc : +25 % de nature.
- Ferme niveau 3 : petit bonus d'autonomie.

Malus :

- Pollution industrielle : +50 % sur cette tuile.
- Une industrie placée près de l'eau dégrade davantage le score écologique.

---

# 7. Une structure principale par tuile

## 7.1 Règle

Chaque tuile possède un seul emplacement principal.

Cette limitation est essentielle pour :

- rendre les choix lisibles ;
- éviter les interfaces complexes ;
- rendre les silhouettes visuelles claires ;
- donner de la valeur au recyclage ;
- créer un puzzle d'espace.

## 7.2 Mairie de départ

La mairie est une structure spéciale :

- placée automatiquement ;
- non recyclable ;
- non déplaçable ;
- fournit un revenu de base ;
- fournit un petit niveau de services ;
- sert de centre visuel à la commune.

Valeurs indicatives :

```text
Revenu de base : +20 par tour
Services : +5
Rayon civique : 1
```

## 7.3 Pas de position libre dans la tuile

Dans la v1 :

- le joueur choisit la tuile ;
- le jeu choisit l'emplacement exact du bâtiment ;
- le bâtiment s'oriente automatiquement ;
- les éléments décoratifs sont placés par le moteur.

Cela réduit fortement le coût de production et les problèmes d'ergonomie.

---

# 8. Système d'influence

## 8.1 Distances

Le système utilise la distance hexagonale.

- Rayon 0 : tuile du bâtiment.
- Rayon 1 : les six tuiles voisines.
- Rayon 2 : le second anneau autour de la structure.

La plupart des niveaux 1 et 2 utilisent un rayon de 0 ou 1.

Le rayon 2 est principalement réservé aux niveaux 3.

## 8.2 Types d'influence

Une structure peut émettre :

- population potentielle ;
- demande commerciale ;
- emplois ;
- services ;
- nature ;
- autonomie ;
- attractivité ;
- revenu ;
- pollution ;
- réduction d'entretien ;
- bonus de synergie.

## 8.3 Atténuation

Valeurs par défaut :

| Distance | Coefficient |
|---|---:|
| Tuile source | 100 % |
| Rayon 1 | 60 % |
| Rayon 2 | 30 % |

Une définition de bâtiment peut remplacer ces coefficients.

## 8.4 Cibles

Une influence peut cibler :

- toutes les tuiles ;
- uniquement les habitations ;
- uniquement les commerces ;
- uniquement les structures économiques ;
- uniquement les tuiles naturelles ;
- uniquement les tuiles occupées ;
- uniquement les tuiles du même réseau.

## 8.5 Empilement

Pour éviter qu'une stratégie consiste à empiler le même bâtiment autour d'une tuile :

| Source similaire reçue | Efficacité |
|---|---:|
| Première | 100 % |
| Deuxième | 70 % |
| Troisième et suivantes | 40 % |

Les effets négatifs ne bénéficient pas de cette réduction, mais sont plafonnés pour conserver une partie jouable.

## 8.6 Recalcul

Après chaque construction, amélioration ou recyclage :

1. vider les influences calculées ;
2. parcourir les structures par identifiant stable ;
3. calculer le bonus de terrain ;
4. parcourir les tuiles dans le rayon ;
5. appliquer l'atténuation ;
6. appliquer les filtres ;
7. appliquer les rendements décroissants ;
8. recalculer occupation, revenu et score ;
9. produire un détail des variations.

La prévisualisation utilise exactement ce même calcul sur une copie temporaire de l'état.

---

# 9. Catalogue de bâtiments de la v1

La première version contient sept familles.

Chaque structure possède trois niveaux.

Les valeurs ci-dessous sont une base de prototypage, pas un équilibrage final.

---

## 9.1 Habitation

### Rôle

- crée de la capacité de population ;
- produit de la demande commerciale ;
- a besoin d'un environnement attractif ;
- valorise les services et la nature proches.

### Niveaux

| Niveau | Nom | Capacité | Coût | Entretien | Rayon de demande |
|---|---|---:|---:|---:|---:|
| 1 | Maisons | 10 | 20 | 1 | 1 |
| 2 | Quartier | 50 | +40 | +2 | 1 |
| 3 | Écoquartier | 100 | +70 | +4 | 2 |

Effet de niveau 3 :

- +5 d'attractivité sur sa propre tuile ;
- meilleure efficacité avec parc et école.

### Occupation

La capacité n'est pas automatiquement remplie à 100 %.

```text
occupation de base : 50 %

+ commerce proche
+ services proches
+ nature proche
+ emplois proches
- pollution
```

Exemple :

```text
Capacité : 50
Attractivité : 78 %
Population active : 39
```

Cette mécanique évite le spam d'habitations isolées.

---

## 9.2 Commerce

### Rôle

- crée des emplois ;
- produit du revenu ;
- augmente légèrement l'attractivité des logements ;
- dépend de la population proche.

| Niveau | Nom | Emplois max | Revenu max | Coût | Entretien | Rayon |
|---|---|---:|---:|---:|---:|---:|
| 1 | Commerce local | 6 | 8 | 25 | 2 | 1 |
| 2 | Halle commerciale | 18 | 22 | +45 | +3 | 1 |
| 3 | Pôle commercial | 35 | 45 | +75 | +5 | 2 |

### Efficacité commerciale

```text
efficacité =
50 % de base
+ demande résidentielle reçue
+ bonus centre-bourg
```

Plafond conseillé : 125 %.

Un commerce sans habitants proches fonctionne, mais rapporte peu.

---

## 9.3 Atelier et industrie

### Rôle

- crée beaucoup d'emplois ;
- produit du revenu ;
- génère de la pollution ;
- fonctionne bien sur une friche.

| Niveau | Nom | Emplois | Revenu | Pollution | Coût | Entretien | Rayon nuisance |
|---|---|---:|---:|---:|---:|---:|---:|
| 1 | Atelier | 15 | 14 | 2 | 35 | 3 | 1 |
| 2 | Manufacture | 40 | 38 | 4 | +60 | +6 | 1 |
| 3 | Industrie circulaire | 80 | 80 | 3 | +90 | +10 | 1 |

Le niveau 3 réduit la pollution par rapport au niveau 2.

Il ajoute également :

- +10 % de remboursement lors du recyclage d'une structure située au rayon 1 ;
- un bonus au système « Boucle de réemploi ».

---

## 9.4 Parc

### Rôle

- augmente la nature ;
- améliore l'attractivité des habitations ;
- réduit partiellement la pollution reçue ;
- permet des corridors naturels.

| Niveau | Nom | Nature source | Attractivité | Coût | Entretien | Rayon |
|---|---|---:|---:|---:|---:|---:|
| 1 | Square | 8 | +2 | 20 | 1 | 1 |
| 2 | Parc communal | 20 | +4 | +35 | +2 | 1 |
| 3 | Parc écologique | 40 | +6 | +55 | +3 | 2 |

Effet supplémentaire :

- absorbe 1 point de pollution au niveau 2 ;
- absorbe 2 points au niveau 3.

---

## 9.5 École

### Rôle

- produit des services ;
- augmente l'attractivité des habitations ;
- améliore la qualité des emplois proches à haut niveau.

| Niveau | Nom | Services | Bonus habitat | Coût | Entretien | Rayon |
|---|---|---:|---:|---:|---:|---:|
| 1 | École | 10 | +5 % | 35 | 4 | 1 |
| 2 | Groupe scolaire | 25 | +12 % | +55 | +4 | 1 |
| 3 | Campus local | 50 | +20 % | +85 | +6 | 2 |

Effet niveau 3 :

- +10 % de revenu pour les commerces et ateliers touchés.

---

## 9.6 Ferme

### Rôle

- produit de l'autonomie ;
- crée quelques emplois ;
- génère un petit revenu ;
- valorise les terres agricoles.

| Niveau | Nom | Autonomie | Emplois | Revenu | Coût | Entretien | Rayon |
|---|---|---:|---:|---:|---:|---:|---:|
| 1 | Ferme | 10 | 3 | 4 | 25 | 2 | 0 |
| 2 | Coopérative | 30 | 8 | 10 | +40 | +3 | 1 |
| 3 | Pôle agroécologique | 60 | 15 | 20 | +65 | +5 | 1 |

Effet niveau 3 :

- +3 de nature aux tuiles naturelles ou agricoles voisines ;
- participe au système « Circuit local ».

---

## 9.7 Installation solaire

### Rôle

- produit de l'autonomie ;
- réduit la dépendance de la commune ;
- réduit légèrement l'entretien des bâtiments proches au niveau 3.

| Niveau | Nom | Autonomie | Coût | Entretien | Rayon |
|---|---|---:|---:|---:|---:|
| 1 | Toitures solaires | 12 | 40 | 2 | 0 |
| 2 | Centrale locale | 35 | +60 | +3 | 1 |
| 3 | Réseau énergétique | 70 | +90 | +5 | 1 |

Effet niveau 3 :

- réduit de 10 % l'entretien des structures situées au rayon 1 ;
- réduction plafonnée pour éviter les boucles trop puissantes.

---

# 10. Améliorations

## 10.1 Règle générale

Une amélioration :

- coûte une action ;
- coûte du budget ;
- conserve la structure ;
- déclenche une transformation visuelle ;
- recalcule immédiatement les influences.

## 10.2 Différences entre niveaux

### Niveau 1

- rôle simple ;
- faible coût ;
- faible rayon ;
- idéal pour démarrer.

### Niveau 2

- augmentation forte du rendement ;
- meilleure efficacité ;
- coût d'entretien plus important.

### Niveau 3

- identité visuelle forte ;
- rayon parfois augmenté ;
- effet secondaire ;
- accès à une synergie avancée.

## 10.3 Pas de branches dans la v1

Le niveau 2 ne propose pas deux directions différentes.

Exemple repoussé à plus tard :

```text
Commerce niveau 2
├── marché local
└── centre commercial
```

La v1 utilise une seule progression par bâtiment.

---

# 11. Recyclage

## 11.1 But

Le recyclage permet :

- de corriger une mauvaise décision ;
- de libérer une tuile ;
- de transformer une stratégie ;
- de récupérer une partie de l'investissement.

## 11.2 Règle proposée

```text
remboursement de base =
40 % du coût cumulé de construction et d'amélioration
```

Exemple :

```text
Habitation niveau 2
Coût cumulé : 20 + 40 = 60
Remboursement : 24
```

## 11.3 Modificateurs

- Industrie circulaire au rayon 1 : remboursement +10 %.
- Structure construite durant le tour courant : remboursement limité à 80 % pour permettre l'annulation sans exploitation.
- Aucun remboursement de l'entretien déjà payé.
- Aucun remboursement des bonus d'objectif.

## 11.4 Coût stratégique

Recycler coûte une action.

Le joueur ne peut donc pas déplacer gratuitement ses structures.

## 11.5 Visuel

Animation proposée :

1. bâtiment désassemblé ;
2. éléments aspirés vers une jauge de ressources ;
3. tuile nettoyée ;
4. nombre de budget récupéré affiché ;
5. influences retirées sous forme d'ondes inversées.

---

# 12. Déblocage progressif

Le joueur ne doit pas voir les sept bâtiments dès la première seconde.

## Palier 1 — Village

Disponible au départ :

- Habitation ;
- Commerce ;
- Parc ;
- Ferme.

## Palier 2 — Bourg

Débloqué lorsque l'une des conditions est remplie :

- score supérieur à 300 ;
- ou début du tour 4.

Nouveaux contenus :

- École ;
- Atelier ;
- niveaux 2.

## Palier 3 — Commune active

Débloqué lorsque l'une des conditions est remplie :

- score supérieur à 800 ;
- ou début du tour 7.

Nouveaux contenus :

- Installation solaire ;
- niveaux 3 ;
- synergies avancées.

Cette règle récompense un bon joueur sans bloquer un joueur en difficulté.

---

# 13. Synergies de la v1

La première version contient quatre synergies clairement affichées.

## 13.1 Quartier vivant

Conditions :

- une habitation ;
- un commerce dans son rayon ;
- un parc ou une école dans son rayon.

Effets :

- +10 % d'occupation ;
- +25 points de score par quartier ;
- animation de quartier plus actif.

## 13.2 Circuit local

Conditions :

- une ferme niveau 2 ou 3 ;
- un commerce ;
- des habitations à portée du commerce.

Effets :

- +15 % de revenu commercial ;
- +5 d'autonomie ;
- +40 points de score.

## 13.3 Corridor vert

Conditions :

- trois parcs ou tuiles naturelles connectés ;
- au moins une structure parc niveau 2.

Effets :

- +10 de nature globale ;
- réduction de pollution sur la chaîne ;
- +60 points de score.

## 13.4 Boucle de réemploi

Conditions :

- industrie circulaire niveau 3 ;
- commerce ou ferme dans son rayon ;
- au moins une opération de recyclage pendant la partie.

Effets :

- +10 % de revenu industriel ;
- +10 % de remboursement futur dans la zone ;
- +80 points de score.

## 13.5 Détection

Une synergie :

- est détectée automatiquement ;
- ne peut compter qu'une seule fois avec exactement le même groupe de structures ;
- peut être perdue si une structure est recyclée ;
- réapparaît si les conditions sont rétablies.

---

# 14. Modèle local d'habitation

## 14.1 Pourquoi ne pas ajouter immédiatement toute la population

Une habitation isolée ne doit pas être aussi efficace qu'un quartier bien organisé.

## 14.2 Calcul proposé

```text
attractivité de base : 50

+ influence commerce, maximum +10
+ influence services, maximum +20
+ influence nature, maximum +20
+ présence d'emplois proches, maximum +10
- pollution, maximum -40
+ bonus de terrain
```

```text
taux d'occupation =
clamp(attractivité / 100, 25 %, 100 %)
```

```text
population active =
arrondi(capacité × taux d'occupation)
```

## 14.3 Exemple

```text
Quartier niveau 2
Capacité : 50

Base : 50
Commerce : +8
École : +12
Parc : +10
Emplois : +5
Pollution : -6

Attractivité : 79
Population : 40
```

Cette présentation doit être visible dans le panneau de la tuile.

---

# 15. Efficacité commerciale

## Calcul proposé

```text
efficacité de base : 50 %

+ population reçue dans le rayon
+ bonus centre-bourg
+ bonus école niveau 3
```

```text
emplois actifs = emplois max × efficacité
revenu actif = revenu max × efficacité
```

Plafond : 125 %.

Exemple :

```text
Halle commerciale
Emplois max : 18
Efficacité : 110 %
Emplois actifs : 20
Revenu : 24
```

Les valeurs peuvent dépasser légèrement le maximum nominal grâce à une très bonne implantation.

---

# 16. Bonheur

Le bonheur est calculé à partir des zones habitées.

```text
bonheur local =
50
+ services
+ nature
+ commerce
+ couverture d'emploi
- pollution
```

Le bonheur global est une moyenne pondérée par la population.

Il produit :

- un multiplicateur modéré de score ;
- des retours narratifs ;
- un objectif possible de scénario.

Il ne doit pas créer une spirale punitive importante dans la v1.

---

# 17. Score communal

## 17.1 Objectif

Le score doit encourager :

- la croissance ;
- l'équilibre ;
- l'efficacité spatiale ;
- les synergies ;
- la maîtrise de la pollution ;
- l'utilisation intelligente du budget.

## 17.2 Contributions de base

Valeurs initiales proposées :

```text
Population active : +1 point par habitant
Emploi actif : +1,5 point
Service : +2 points
Nature : +2 points
Autonomie : +1,5 point
Pollution : -3 points
Budget final : +0,2 point par unité
```

## 17.3 Multiplicateur de bonheur

```text
multiplicateur bonheur =
0,85 + bonheur_global × 0,003
```

Exemples :

- bonheur 50 : ×1,00 ;
- bonheur 75 : ×1,075 ;
- bonheur 100 : ×1,15.

## 17.4 Bonus d'équilibre

Le jeu calcule cinq piliers normalisés :

- population ;
- emplois ;
- services ;
- nature ;
- autonomie.

Bonus :

| Condition | Bonus |
|---|---:|
| Les cinq piliers atteignent 40 % de leur objectif | +100 |
| Les cinq atteignent 70 % | +200 supplémentaires |
| Les cinq atteignent 100 % | +400 supplémentaires |

Cette règle empêche une stratégie de maximiser uniquement la population.

## 17.5 Synergies

Les synergies ajoutent des points séparés et visibles.

## 17.6 Score en direct

Le score est recalculé après chaque action.

La prévisualisation affiche :

```text
Score actuel : 742
Après construction : 816
Variation prévue : +74
```

Une variation peut être négative si la pollution ou l'entretien dépasse les bénéfices.

## 17.7 Pas de points définitivement acquis

Le score représente l'état actuel.

Si une structure est recyclée :

- ses points disparaissent ;
- les synergies associées peuvent disparaître ;
- seul le nouvel état compte.

Cela évite de construire puis recycler uniquement pour récolter des points.

---

# 18. Présentation visuelle

## 18.1 Mode construction

Quand le joueur choisit un bâtiment :

- les tuiles incompatibles sont grisées ;
- les tuiles compatibles sont éclairées ;
- les meilleurs bonus de terrain reçoivent une bordure dorée ;
- le bâtiment apparaît en fantôme ;
- le rayon est dessiné sur la carte.

## 18.2 Prévisualisation des influences

Couleurs suggérées :

- bleu : population et services ;
- orange : emplois et économie ;
- vert : nature ;
- jaune : autonomie ;
- rouge : pollution ;
- violet : synergie.

Chaque tuile touchée affiche un petit résumé :

```text
+6 attractivité
+4 services
-2 pollution
```

## 18.3 Heatmaps

Boutons de vue :

- Population ;
- Emplois ;
- Services ;
- Nature ;
- Autonomie ;
- Pollution ;
- Attractivité.

Une heatmap remplace temporairement les couleurs du terrain sans masquer les bâtiments.

## 18.4 Retour après action

Lors d'une construction :

1. animation de chantier courte ;
2. bâtiment apparaît ;
3. onde se propage dans le rayon ;
4. nombres flottants sur les tuiles ;
5. score s'incrémente ;
6. bannière si une synergie apparaît.

## 18.5 Amélioration

L'amélioration doit être très visible :

- changement de silhouette ;
- éléments ajoutés ;
- activité accrue ;
- rayon qui s'étend ;
- animation de niveau.

## 18.6 Panneau de tuile

Afficher :

- type de terrain ;
- modificateurs ;
- bâtiment et niveau ;
- production directe ;
- influences émises ;
- influences reçues ;
- efficacité ;
- contribution au score ;
- actions disponibles.

---

# 19. Déroulement d'un tour

## 19.1 Début

- revenu encaissé ;
- entretien payé ;
- bâtiments débloqués annoncés ;
- objectifs rappelés ;
- une ou deux recommandations non obligatoires.

## 19.2 Planification

Le joueur possède trois actions.

Il peut alterner librement :

- construction ;
- amélioration ;
- recyclage.

Après chaque action, la carte et le score sont recalculés.

## 19.3 Fin de tour

Le joueur clique sur « Terminer le tour ».

Le moteur :

1. finalise les productions ;
2. recalcule la population ;
3. recalcule les commerces ;
4. recalcule le bonheur ;
5. applique les revenus ;
6. vérifie les synergies ;
7. vérifie les objectifs ;
8. sauvegarde.

## 19.4 Résolution visuelle

Durée cible : 8 à 12 secondes.

Le joueur peut accélérer ou désactiver les animations répétitives.

---

# 20. Exemple de partie

## Tour 1

Bâtiments disponibles :

- Habitation ;
- Commerce ;
- Parc ;
- Ferme.

Actions :

1. construire une habitation sur zone résidentielle ;
2. construire un commerce au centre ;
3. construire un parc entre les deux.

Résultat :

- habitation capacité 12 grâce au terrain ;
- occupation améliorée par commerce et parc ;
- synergie Quartier vivant ;
- score fortement augmenté.

## Tour 3

Le joueur améliore :

- habitation niveau 2 ;
- commerce niveau 2.

Il construit une ferme sur une terre agricole.

Résultat :

- hausse de population ;
- hausse de revenu ;
- autonomie ;
- futur Circuit local.

## Tour 5

Le palier Bourg est débloqué.

Le joueur choisit entre :

- une école près des logements ;
- un atelier sur la friche ;
- améliorer le parc.

Le choix produit un profil de commune différent.

## Tour 8

Le niveau 3 est disponible.

Le joueur peut :

- densifier le quartier ;
- rendre l'industrie circulaire ;
- transformer le parc ;
- créer un réseau solaire.

## Tour 10

Le joueur optimise :

- recycle un commerce mal placé ;
- récupère 40 % de son coût ;
- construit une école ;
- active un bonus d'équilibre ;
- termine avec une carte visuellement cohérente.

---

# 21. Équilibrage initial

## 21.1 Paramètres de départ

```text
Budget initial : 160
Revenu mairie : 20 par tour
Actions : 3 par tour
Tours : 10
Objectif de score bronze : 1 000
Objectif argent : 1 500
Objectif or : 2 100
```

Ces valeurs servent uniquement de point de départ.

## 21.2 Courbe souhaitée

### Début

- constructions niveau 1 faciles ;
- budget encore confortable ;
- compréhension du voisinage.

### Milieu

- arbitrage entre nouvelles structures et améliorations ;
- entretien plus visible ;
- premiers problèmes de pollution ;
- déblocage de l'école et de l'atelier.

### Fin

- niveaux 3 coûteux ;
- optimisation du rayon ;
- recyclage éventuel ;
- recherche des bonus d'équilibre ;
- choix de profil final.

## 21.3 Règles anti-spam

- occupation des logements liée à l'attractivité ;
- commerces liés à la demande ;
- rendements décroissants des influences identiques ;
- bonus d'équilibre ;
- entretien croissant ;
- une structure par tuile ;
- contraintes de terrain ;
- pollution industrielle.

---

# 22. Périmètre exact de la v1

## Contenu

- une commune basique ;
- 37 tuiles ;
- cinq types de terrain ;
- modificateur rivière ;
- mairie ;
- sept bâtiments ;
- trois niveaux par bâtiment ;
- 21 apparences principales ;
- dix tours ;
- trois actions par tour ;
- une ressource ;
- six indicateurs ;
- bonheur et pollution dérivés ;
- quatre synergies ;
- recyclage ;
- score dynamique ;
- sauvegarde locale ;
- écran de résultat.

## Éléments repoussés

- événements aléatoires complexes ;
- habitants individuels ;
- routes ;
- transports ;
- eau et énergie en réseaux distincts ;
- plusieurs communes ;
- branches de technologie ;
- bâtiments uniques ;
- catastrophes ;
- commerce entre joueurs ;
- défis hebdomadaires ;
- statistiques communautaires détaillées.

## Après validation

Ordre conseillé :

1. événements simples ;
2. deuxième scénario ;
3. premières communes réelles ;
4. statistiques communautaires ;
5. nouveaux bâtiments ;
6. branches d'amélioration ;
7. infrastructures et routes ;
8. enjeux climatiques.

---

# 23. Évolution du modèle de données TypeScript

## 23.1 Tuile

```ts
export type LandUse =
  | "town_center"
  | "residential"
  | "agriculture"
  | "forest"
  | "industrial";

export type TileModifier = "riverside";

export interface GameTile {
  id: string;
  q: number;
  r: number;
  neighborIds: string[];

  landUse: LandUse;
  modifiers: TileModifier[];

  structureId: string | null;

  baseValues: TileMetricSet;
  receivedInfluences: AppliedInfluence[];
  computedValues: TileMetricSet;

  attractiveness: number;
  pollution: number;
  localHappiness: number;
}
```

## 23.2 Structure placée

```ts
export interface StructureInstance {
  id: string;
  definitionId: string;
  tileId: string;
  level: 1 | 2 | 3;
  builtTurn: number;
  totalInvestedBudget: number;
}
```

## 23.3 Définition

```ts
export interface StructureDefinition {
  id: string;
  name: string;
  category:
    | "housing"
    | "commerce"
    | "industry"
    | "nature"
    | "service"
    | "food"
    | "energy";

  unlockTier: 1 | 2 | 3;
  allowedLandUses: LandUse[];
  forbiddenModifiers?: TileModifier[];

  levels: [
    StructureLevelDefinition,
    StructureLevelDefinition,
    StructureLevelDefinition
  ];

  siteBonuses: SiteBonus[];
  synergyTags: string[];
}
```

## 23.4 Niveau

```ts
export interface StructureLevelDefinition {
  name: string;
  buildOrUpgradeCost: number;
  maintenance: number;

  directEffects: MetricEffect[];
  influenceEffects: InfluenceEffect[];

  visualAssetId: string;
  description: string;
}
```

## 23.5 Influence

```ts
export interface InfluenceEffect {
  metric:
    | "population_demand"
    | "jobs"
    | "services"
    | "nature"
    | "autonomy"
    | "attractiveness"
    | "income"
    | "pollution"
    | "maintenance_reduction";

  amount: number;
  radius: 0 | 1 | 2;
  falloff?: [number, number, number];

  targetFilter?:
    | "all"
    | "housing"
    | "commerce"
    | "industry"
    | "natural"
    | "occupied";
}
```

## 23.6 Actions

```ts
export type PlayerAction =
  | {
      type: "build";
      structureDefinitionId: string;
      tileId: string;
    }
  | {
      type: "upgrade";
      structureId: string;
    }
  | {
      type: "recycle";
      structureId: string;
    };
```

## 23.7 Score

```ts
export interface ScoreBreakdown {
  populationPoints: number;
  jobPoints: number;
  servicePoints: number;
  naturePoints: number;
  autonomyPoints: number;
  pollutionPenalty: number;
  budgetPoints: number;
  happinessMultiplier: number;
  balanceBonus: number;
  synergyBonus: number;
  total: number;
}
```

---

# 24. Architecture de calcul

## 24.1 Fonctions pures

Le package `game-engine` doit exposer :

```ts
getTilesInRadius(map, tileId, radius)
getBuildPreview(state, definitionId, tileId)
getUpgradePreview(state, structureId)
getRecyclePreview(state, structureId)

applyBuildAction(state, action)
applyUpgradeAction(state, action)
applyRecycleAction(state, action)

recomputeInfluences(state)
recomputeOccupancy(state)
recomputeCommerceEfficiency(state)
detectSynergies(state)
calculateScore(state)
resolveTurn(state)
```

## 24.2 Ordre de recalcul

```text
structures
→ bonus de site
→ influences émises
→ influences reçues
→ pollution
→ attractivité
→ occupation
→ commerces
→ emplois actifs
→ revenu
→ bonheur
→ synergies
→ score
```

## 24.3 Prévisualisation

La prévisualisation :

- clone l'état ;
- applique l'action ;
- recalcule ;
- compare avant/après ;
- renvoie uniquement le delta et les tuiles modifiées.

```ts
export interface ActionPreview {
  valid: boolean;
  invalidReason?: string;
  budgetDelta: number;
  scoreDelta: number;
  globalMetricDelta: Partial<GlobalMetrics>;
  affectedTiles: TileDelta[];
  createdSynergies: string[];
  removedSynergies: string[];
}
```

## 24.4 Déterminisme

- aucun `Math.random()` dans ces calculs ;
- tuiles et structures triées par ID ;
- arrondis centralisés ;
- mêmes actions = même résultat ;
- score validable côté serveur ultérieurement.

---

# 25. Évolution de l'interface web

## Barre haute

Afficher :

- score ;
- tour ;
- actions restantes ;
- population ;
- emplois ;
- services ;
- nature ;
- autonomie ;
- budget.

## Barre de construction

Catégories :

- Habiter ;
- Produire ;
- Servir ;
- Restaurer ;
- Autonomie.

Chaque carte de bâtiment montre :

- niveau disponible ;
- coût ;
- entretien ;
- terrain recommandé ;
- rayon ;
- effet principal.

## Panneau droit

Selon le contexte :

### Tuile vide

- type ;
- bonus ;
- contraintes ;
- constructions compatibles.

### Structure

- niveau ;
- rendement ;
- efficacité ;
- influences ;
- contribution au score ;
- améliorer ;
- recycler.

## Bas de l'écran

- actions du tour ;
- annuler la dernière action si elle n'est pas encore validée ;
- terminer le tour ;
- résumé des variations.

## Outils de lecture

- heatmaps ;
- afficher les rayons ;
- afficher les synergies ;
- afficher les tuiles sous-utilisées ;
- masquer les décorations.

---

# 26. Sauvegarde et compatibilité

Le format de sauvegarde doit ajouter :

- structures ;
- niveaux ;
- investissement cumulé ;
- palier de déblocage ;
- actions restantes ;
- score détaillé ;
- synergies actives.

Les anciennes sauvegardes du prototype précédent ne seront pas obligatoirement compatibles.

Ajouter :

```text
saveSchemaVersion = 2
simulationVersion = structures-v1
```

---

# 27. Assets nécessaires pour cette évolution

## Structures

Sept familles × trois niveaux :

- 21 assets principaux.

## États supplémentaires

Par famille :

- fantôme de placement ;
- chantier simple ;
- surbrillance ;
- état désactivé éventuel.

Les chantiers peuvent partager un kit générique.

## Effets

- onde d'influence ;
- amélioration ;
- recyclage ;
- score ;
- synergie ;
- pollution ;
- nature ;
- activité.

## Tuiles

- cinq terrains ;
- bord de rivière ;
- états sélectionnés ;
- heatmaps ;
- grille de rayon.

Le style doit rester cohérent avec le premier écran proposé :

- formes propres ;
- palette naturelle ;
- vue légèrement isométrique ;
- bâtiments lisibles ;
- animations courtes.

---

# 28. Étapes de développement Codex

## Étape 1 — Faire évoluer les schémas

```text
Fais évoluer les types GameTile, StructureInstance,
StructureDefinition, StructureLevelDefinition, InfluenceEffect,
PlayerAction et ScoreBreakdown.

Ajoute les schémas Zod.
Crée une migration de fixture vers saveSchemaVersion 2.
Aucun composant React ou Phaser dans game-engine.
```

## Étape 2 — Distance hexagonale

```text
Implémente getHexDistance et getTilesInRadius.
Gère les tuiles de bord irrégulières avec le graphe de voisins.
Ajoute tests rayon 0, 1 et 2.
```

## Étape 3 — Placement

```text
Implémente la validation des terrains, du budget, de l'emplacement et
du palier.
Implémente applyBuildAction comme fonction pure.
Ajoute les quatre bâtiments du palier 1.
```

## Étape 4 — Influences

```text
Implémente recomputeInfluences.
Gère rayon, atténuation, cibles et rendements décroissants.
Ajoute un rapport détaillé par tuile.
```

## Étape 5 — Habitation et commerce

```text
Implémente attractivité, occupation et efficacité commerciale.
Ajoute tests avec et sans parc, école, commerce et pollution.
```

## Étape 6 — Amélioration

```text
Implémente applyUpgradeAction.
Ajoute niveaux 2 et 3.
Valide coût, palier et niveau maximum.
Ajoute tests du changement de rayon.
```

## Étape 7 — Recyclage

```text
Implémente applyRecycleAction avec remboursement de 40 %.
Ajoute le bonus d'industrie circulaire.
Retire les influences et synergies.
Ajoute tests anti-exploitation.
```

## Étape 8 — Score

```text
Implémente calculateScore et ScoreBreakdown.
Ajoute multiplicateur bonheur, bonus d'équilibre et synergies.
Le score doit être intégralement explicable.
```

## Étape 9 — Prévisualisation

```text
Implémente getBuildPreview, getUpgradePreview et getRecyclePreview.
Retourne scoreDelta, metricDelta, affectedTiles et synergies.
Utilise le même moteur que l'action réelle.
```

## Étape 10 — Interface Phaser

```text
Ajoute les sprites de structures, niveaux, fantômes et rayons.
Affiche les tuiles compatibles et incompatibles.
Anime les ondes d'influence.
```

## Étape 11 — Interface React

```text
Crée la barre de construction, le panneau de structure, le score
détaillé, les actions restantes et les boutons améliorer/recycler.
Ajoute une heatmap par indicateur.
```

## Étape 12 — Tour et progression

```text
Implémente dix tours, trois actions, revenus, entretien et paliers.
Ajoute la résolution visuelle et la sauvegarde.
```

## Étape 13 — Synergies

```text
Implémente Quartier vivant, Circuit local, Corridor vert et Boucle de
réemploi.
Ajoute explication, animation et tests.
```

## Étape 14 — Équilibrage

```text
Crée une commande de simulation automatique jouant des stratégies
heuristiques simples.
Exporte CSV : score, budget, constructions, niveaux et piliers.
Détecte les bâtiments jamais rentables ou dominants.
```

---

# 29. Tests d'acceptation

## Placement

- impossible sur une tuile occupée ;
- impossible sur terrain interdit ;
- bonus de terrain correctement appliqué ;
- budget débité ;
- action débitée ;
- rayon affiché.

## Amélioration

- niveau maximum respecté ;
- coût correct ;
- nouveau rayon ;
- visuel mis à jour ;
- score recalculé.

## Recyclage

- structure supprimée ;
- 40 % remboursés ;
- action consommée ;
- score diminué ;
- synergie retirée ;
- tuile à nouveau disponible.

## Influence

- rayon 1 correct ;
- rayon 2 correct ;
- bord de carte correct ;
- atténuation correcte ;
- cibles correctes ;
- empilement correct.

## Score

- score identique après rechargement ;
- pas de points conservés après recyclage ;
- bonus d'équilibre correct ;
- pollution négative ;
- détail égal au total.

## Durée

- une partie de test complète entre 25 et 50 minutes ;
- aucune phase de résolution supérieure à 15 secondes ;
- construction comprise sans tutoriel long.

---

# 30. Décisions retenues

Pour cette première évolution :

- une seule structure par tuile ;
- sept bâtiments ;
- trois niveaux linéaires ;
- une seule ressource ;
- dix tours ;
- trois actions ;
- rayons maximum de deux ;
- cinq terrains ;
- quatre synergies ;
- score dynamique ;
- recyclage à 40 % ;
- événements complexes repoussés ;
- routes repoussées ;
- statistiques multijoueur conservées pour une étape ultérieure.

---

# 31. Vision après la v1

Si la boucle est validée, les évolutions les plus prometteuses sont :

## Branches d'amélioration

Exemple :

```text
Habitation niveau 2
├── quartier dense
└── écoquartier
```

## Bâtiments uniques

- gare ;
- hôpital ;
- université ;
- barrage ;
- grand parc ;
- patrimoine.

## Infrastructures secondaires

Une tuile pourrait accueillir :

- une structure principale ;
- une infrastructure légère.

Exemples :

- piste cyclable ;
- route ;
- réseau d'énergie ;
- haie ;
- transport.

## Événements

Les événements pourraient modifier temporairement :

- la demande ;
- le coût ;
- la pollution ;
- les objectifs ;
- le rayon d'un bâtiment.

## Scénarios de commune

- commune rurale ;
- commune forestière ;
- commune industrielle ;
- commune périurbaine ;
- commune littorale.

## Défis communautaires

- meilleur score sans industrie ;
- aucune artificialisation agricole ;
- autonomie maximale ;
- population maximale avec pollution limitée ;
- meilleur ratio score/budget.

---

# 32. Recommandation finale

Cette évolution donne au jeu un cœur plus concret et plus immédiatement satisfaisant.

Le joueur ne choisit plus seulement une action abstraite. Il :

- pose quelque chose ;
- le voit apparaître ;
- comprend son rayon ;
- observe ses effets ;
- l'améliore ;
- crée un quartier ;
- corrige ses erreurs ;
- optimise un score.

La formule de la première version devient :

```text
une carte compacte
+ sept bâtiments
+ trois niveaux
+ un rayon lisible
+ des bonus de terrain
+ quatre synergies
+ un score en direct
= une boucle testable et rejouable
```

Le premier prototype doit chercher à répondre à une seule question :

> Est-il amusant de choisir la bonne structure, sur la bonne tuile, au bon niveau, pour déclencher plusieurs effets visibles à la fois ?
