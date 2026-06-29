# Virea — Design du prototype satisfaisant

## Objectif

Faire en sorte que **chaque construction rende immédiatement la carte plus vivante, plus lisible et plus satisfaisante**, même avec des assets très simples.

Le prototype doit valider cette sensation avant d'investir dans un rendu final.

---

## Principe central

Chaque construction doit provoquer au minimum :

1. un changement visuel sur sa tuile ;
2. une propagation visible vers les tuiles voisines ;
3. une conséquence chiffrée compréhensible ;
4. une courte animation ;
5. un retour sonore.

Une construction ne doit jamais être silencieuse ou uniquement modifier une statistique.

---

## Boucle visuelle après une action

Séquence recommandée :

```text
0,0 s : validation de la construction
0,2 s : apparition ou évolution du bâtiment
0,5 s : transformation de la tuile
0,8 s : onde vers les tuiles influencées
1,1 s : mise à jour des bâtiments voisins
1,4 s : nombres et score s'actualisent
1,7 s : éventuelle synergie annoncée
```

La simulation peut être calculée instantanément. Les animations servent uniquement à présenter les résultats.

---

## Prototype minimal

### Carte

- 19 à 25 tuiles hexagonales ;
- terrain simple, initialement peu vivant ;
- couleurs plates ;
- aucun fond de carte réel nécessaire ;
- rayon de voisinage visible.

### Bâtiments

Commencer avec seulement quatre structures :

- Habitation ;
- Commerce ;
- Parc ;
- Usine.

Chaque structure possède :

- deux niveaux ;
- un effet direct ;
- un effet sur les voisins ;
- un effet visuel ;
- un son ;
- une contribution au score.

### Objectif du test

Le joueur doit pouvoir poser cinq à huit bâtiments et ressentir que la carte devient progressivement plus vivante.

---

## Réactions visuelles des bâtiments

### Habitation

À la construction :

- maisons qui apparaissent ;
- petit chemin ;
- quelques arbres ou lampadaires ;
- apparition de quelques habitants.

Effets :

- augmente la capacité de population ;
- reçoit les bonus des commerces, parcs et services ;
- reste partiellement vide si la zone est peu attractive.

### Commerce

À la construction :

- bâtiment d'abord peu actif ;
- lumière ou étal quand la demande augmente ;
- petits clients lorsque des habitants sont proches.

Effets :

- crée des emplois ;
- génère du revenu ;
- augmente l'attractivité résidentielle ;
- dépend de la population voisine.

### Parc

À la construction :

- sol brun vers vert ;
- herbe ;
- buissons ;
- arbres ;
- habitants ou animaux décoratifs ;
- onde verte sur les tuiles voisines.

Effets :

- augmente la nature ;
- améliore l'attractivité ;
- réduit partiellement la pollution ;
- crée des corridors verts.

Le parc doit être le bâtiment le plus démonstratif du prototype.

### Usine

À la construction :

- bâtiment plus massif ;
- activité ou véhicules ;
- légère fumée ;
- sol local plus sombre ;
- onde rouge ou violette.

Effets :

- crée beaucoup d'emplois ;
- produit du revenu ;
- génère de la pollution ;
- réduit l'attractivité des logements proches.

Au niveau supérieur :

- pollution réduite ;
- meilleure apparence ;
- ajout d'éléments de recyclage ou d'énergie propre.

---

## États visuels locaux

Chaque tuile peut afficher plusieurs niveaux simples.

### Nature

```text
0 : sol dégradé
1 : herbe rare
2 : végétation
3 : arbres
4 : biodiversité dense
```

### Activité

```text
0 : vide
1 : quelques habitants
2 : quartier actif
3 : zone très animée
```

### Pollution

```text
0 : propre
1 : traces légères
2 : sol sombre
3 : fumée et déchets
```

### Prospérité

```text
0 : bâtiment fermé
1 : bâtiment actif
2 : activité visible
3 : zone très fréquentée
```

Ces états peuvent être représentés par des formes simples superposées.

---

## Prévisualisation avant construction

Avant le clic final, afficher :

- le bâtiment fantôme ;
- les tuiles compatibles ;
- le rayon d'influence ;
- les tuiles qui vont changer ;
- les effets positifs ;
- les effets négatifs ;
- la variation de score.

Exemple :

```text
Parc niveau 1

Tuile choisie :
+8 Nature

Habitations touchées :
+3 Attractivité
+2 Population estimée

Pollution :
-1

Score prévu :
+34
```

La satisfaction commence avant même la validation.

---

## Représentation des influences

Couleurs proposées :

- vert : nature ;
- bleu : services et population ;
- orange : emplois et économie ;
- jaune : autonomie ;
- rouge : pollution ;
- violet : synergie.

Après une construction, une onde colorée doit voyager de la structure vers les tuiles concernées.

Chaque tuile touchée peut afficher brièvement :

```text
+4 Attractivité
+2 Population
-1 Pollution
```

---

## Synergies visuelles

Une synergie ne doit pas seulement ajouter un badge.

### Quartier vivant

Condition :

```text
Habitation + Commerce + Parc
```

Transformation :

- plus d'habitants ;
- rues actives ;
- lumières ;
- bancs ;
- végétation ;
- animation spéciale.

### Corridor vert

Condition :

```text
Plusieurs parcs ou zones naturelles connectées
```

Transformation :

- végétation reliant les tuiles ;
- oiseaux ou papillons ;
- rivière ou sols plus propres ;
- onde verte globale.

### Zone productive

Condition :

```text
Usine + Habitations accessibles + Commerce
```

Transformation :

- flux entre les bâtiments ;
- véhicules ou marchandises ;
- emplois visibles ;
- pollution à gérer.

---

## Son

Ajouter dès le prototype :

- clic de construction ;
- bruit léger de chantier ;
- son de croissance ;
- tintement de propagation ;
- son d'amélioration ;
- son de recyclage ;
- accord spécial pour une synergie.

Le son peut rendre des formes géométriques très satisfaisantes.

---

## Interface minimale

### Barre haute

Afficher :

- Score ;
- Population ;
- Emplois ;
- Nature ;
- Pollution ;
- Budget.

### Barre de construction

Quatre boutons :

- Habitation ;
- Commerce ;
- Parc ;
- Usine.

### Panneau de tuile

Afficher :

- type de terrain ;
- bâtiment ;
- niveau ;
- influences émises ;
- influences reçues ;
- contribution au score ;
- améliorer ;
- recycler.

### Outils

- afficher les rayons ;
- afficher la heatmap nature ;
- afficher la heatmap pollution ;
- afficher la heatmap attractivité.

---

## Règles de satisfaction

Chaque action doit respecter les règles suivantes :

```text
1 changement visuel local
+ 1 effet sur une autre tuile
+ 1 animation
+ 1 son
+ 1 retour numérique
```

Une amélioration doit :

- changer la silhouette ;
- augmenter ou modifier le rayon ;
- déclencher une nouvelle animation ;
- améliorer clairement le score ou réduire une nuisance.

Un recyclage doit :

- désassembler visuellement le bâtiment ;
- récupérer une partie du budget ;
- retirer les influences ;
- libérer la tuile ;
- montrer la nouvelle situation.

---

## Ce qui peut rester très simple

Le prototype peut utiliser :

- hexagones plats ;
- rectangles pour les bâtiments ;
- cercles pour les arbres ;
- points pour les habitants ;
- lignes pour les flux ;
- changements de couleur ;
- petites particules ;
- sons simples.

La qualité du prototype dépend surtout de :

- la clarté ;
- le rythme ;
- la propagation ;
- l'avant/après ;
- la compréhension des conséquences.

---

## Ordre de développement

### Étape 1

Créer une carte grise de 19 à 25 tuiles.

### Étape 2

Ajouter la sélection et la pose de bâtiments.

### Étape 3

Ajouter un état visuel local pour chaque bâtiment.

### Étape 4

Ajouter les rayons et la prévisualisation.

### Étape 5

Ajouter la propagation animée.

### Étape 6

Ajouter les mises à jour de score et statistiques.

### Étape 7

Ajouter les niveaux d'amélioration.

### Étape 8

Ajouter le recyclage.

### Étape 9

Ajouter une première synergie : Quartier vivant.

### Étape 10

Ajouter les sons et le polish.

---

## Critères de validation

Le prototype est réussi si :

- chaque clic produit une réaction visible ;
- le joueur comprend quelles tuiles sont influencées ;
- la carte est nettement plus vivante après cinq constructions ;
- une amélioration paraît plus satisfaisante qu'une simple hausse de chiffre ;
- une usine crée un compromis clair entre économie et pollution ;
- un parc produit un avant/après très visible ;
- une synergie déclenche un moment spécial ;
- le joueur souhaite tester un autre placement pour améliorer son score.

La question principale est :

> Est-ce que poser un bâtiment provoque immédiatement une transformation que le joueur a envie de regarder ?
