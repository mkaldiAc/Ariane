# ARIANE

ARIANE est un référentiel et un protocole standardisé de captation de données patrimoniales assistée par IA.

Version du package : **1.3.0**.

## Organisation du dépôt

Le dépôt sépare volontairement deux publics.

```text
Ariane/
├── ia/       # ressources autonomes destinées à l’IA de captation
├── humain/   # documentation, décisions, historique et livrables de travail
├── README.md
└── VERSION
```

### `ia/` — paquet autonome pour l’IA

Une IA chargée d’exécuter une captation ARIANE doit recevoir **uniquement le contenu du dossier `ia/`**, en plus des documents à analyser et, lorsqu’il s’agit d’une captation incrémentale, de la structure validée du programme.

Le point d’entrée obligatoire est :

`ia/instructions/EXECUTION.md`

Le fichier `ia/manifest.yaml` liste toutes les ressources nécessaires.

### `humain/` — ressources de compréhension et de gouvernance

Ce dossier contient les documents explicatifs, journaux d’arbitrage, historiques de migration et futurs livrables Word/Excel. Il n’est pas requis pour exécuter une captation IA.

## Cycle de captation d’un programme

ARIANE distingue deux modes.

### 1. `INITIALISATION_PROGRAMME`

À partir du premier jeu documentaire :

1. l’IA propose la structure patrimoniale du programme ;
2. l’IA capte également les données attributaires observables dans ce jeu documentaire ;
3. l’IA produit les relations et anomalies détectées ;
4. la structure proposée est ensuite contrôlée et validée **hors du processus IA**.

La structure validée reçoit une version stable et devient le référentiel de rattachement du programme.

### 2. `CAPTATION_INCREMENTALE`

Pour les jeux documentaires 2 à N :

1. l’IA reçoit l’identifiant du programme ;
2. elle reçoit la structure patrimoniale validée et sa version ;
3. elle analyse uniquement le nouveau jeu documentaire ;
4. elle rattache les nouvelles observations aux objets existants ;
5. elle **ne crée, ne supprime, ne déplace et ne fusionne aucun objet patrimonial** ;
6. toute information ne pouvant être rattachée à la structure validée produit une anomalie.

## Principe d’observation cumulative

Une donnée captée est une **observation**, pas une valeur de référence.

Si trois documents fournissent trois valeurs différentes pour la surface du même hall, ARIANE conserve trois observations distinctes, chacune avec sa source et son score de confiance.

L’IA ne doit jamais :

- écraser une observation antérieure ;
- choisir la valeur qui « fait foi » ;
- marquer une valeur comme validée métier ;
- arbitrer un conflit documentaire.

La validation métier et la désignation de la valeur de référence sont réalisées **en aval, dans la base de données et hors des échanges avec l’IA**.

## Identifiants structurants

Les captations doivent au minimum être organisées autour de :

- `programme_id` : programme concerné ;
- `structure_version` : version de la structure validée utilisée ;
- `capture_id` : session / lot de captation ;
- `source_id` : document analysé ;
- `observation_id` : occurrence attributaire captée.

## Traçabilité et confiance

Chaque observation conserve sa source documentaire, son repère, son mode d’identification et un score de confiance portant sur la qualité de la captation, et non sur la vérité métier de la valeur.

Pour toute exécution IA, les règles présentes dans `ia/` prévalent.
