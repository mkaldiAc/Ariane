# ARIANE

ARIANE est un référentiel et un protocole de captation patrimoniale standardisée assistée par IA.

Version courante : **1.3.1**.

## Organisation du dépôt

Le dépôt est volontairement séparé selon le consommateur des ressources.

```text
Ariane/
├── ia/        # seules ressources nécessaires à une IA de captation
├── humain/    # documentation, arbitrages, historique et livrables de travail
├── README.md
└── VERSION
```

## `ia/` — espace normatif d'exécution

Le dossier `ia/` est autonome et constitue le **seul espace qu'une IA doit lire pour exécuter une captation ARIANE**.

Point d'entrée obligatoire : `ia/README.md`.

Il contient :
- le référentiel des objets patrimoniaux ;
- le référentiel attributaire canonique ;
- les relations autorisées ;
- les règles de structure et de captation ;
- le protocole de captation incrémentale ;
- les règles de traçabilité ;
- le score de confiance ;
- les schémas de sortie.

## `humain/` — espace documentaire et de gouvernance

Le dossier `humain/` contient les ressources destinées à la compréhension et à la gouvernance du projet :
- documentation lisible du référentiel ;
- journal des arbitrages ;
- historique de conception et de migration ;
- futurs livrables Excel, Word, PDF ou autres documents de travail validés.

Une IA de captation n'a pas besoin de lire ce dossier.

## Scénario de captation ARIANE

### 1. Initialisation d'un programme

Le premier jeu documentaire d'un programme est traité en mode `INITIALISATION_PROGRAMME`.

L'IA produit :
- la liste `SOURCES` des documents effectivement analysés ;
- une structure patrimoniale proposée ;
- les premières observations attributaires ;
- les relations identifiées ;
- les anomalies éventuelles.

La structure est ensuite contrôlée et validée **hors du processus IA**.

### 2. Structure figée

Une fois validée, la structure patrimoniale devient la structure de référence du programme.

Elle reçoit une version stable et ses identifiants d'objets sont réutilisés dans toutes les captations suivantes.

### 3. Captations successives

Les jeux documentaires 2 à N sont traités en mode `CAPTATION_INCREMENTALE`.

L'IA reçoit :
- `programme_id` ;
- `capture_id` ;
- la structure patrimoniale validée ;
- sa `structure_version` ;
- le nouveau jeu documentaire.

Elle produit pour chaque campagne la liste `SOURCES` des nouveaux documents effectivement analysés.

Elle peut ajouter de nouvelles observations et relations documentaires, mais **ne peut jamais modifier la structure validée**.

Un objet absent ou une incohérence structurelle détectés dans un document ultérieur produisent une anomalie, jamais une modification automatique du patrimoine.

## Modèle de données captées

ARIANE conserve des **observations documentaires**, et non une valeur unique par attribut.

Chaque observation est liée au minimum à :
- un programme ;
- une campagne de captation ;
- un document source déclaré dans `SOURCES` ;
- un objet patrimonial ;
- un attribut canonique ;
- une valeur brute et éventuellement normalisée ;
- un repère documentaire ;
- un mode de captation ;
- un score de confiance.

Ainsi, si plusieurs documents fournissent plusieurs valeurs pour le même attribut du même objet, toutes les valeurs sont conservées comme observations distinctes.

## Validation humaine

La validation humaine et la sélection d'une observation faisant foi sont **hors du périmètre de l'IA et hors du protocole de captation ARIANE**.

Les observations sont destinées à être intégrées dans une base de données. Les opérations transactionnelles de validation métier sont réalisées ensuite dans le système aval.

L'IA :
- ne valide jamais une observation ;
- ne rejette jamais une observation contradictoire ;
- ne choisit jamais une valeur de référence ;
- ne privilégie jamais automatiquement un type de document.

## Principe central

> ARIANE construit une structure patrimoniale initiale par programme. Après validation externe, cette structure est figée. Les captations ultérieures accumulent des observations sourcées et scorées sur les objets existants sans modifier la structure ni arbitrer les valeurs métier.
