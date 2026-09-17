# ARIANE — Ressources destinées à l'IA

Ce dossier constitue le **seul point d'entrée nécessaire à une IA de captation ARIANE**.

L'IA ne doit pas utiliser les ressources du dossier `humain/` pour exécuter une captation. Ces ressources servent à la compréhension, à la gouvernance, aux arbitrages et aux livrables de travail.

## Objectif

ARIANE permet de traiter un programme immobilier en plusieurs temps :

1. construire une structure patrimoniale à partir d'un premier jeu documentaire ;
2. capter les attributs présents dans ce même jeu documentaire ;
3. après validation externe de la structure, réutiliser cette structure figée pour tous les jeux documentaires suivants ;
4. ajouter de nouvelles observations attributaires à chaque captation sans écraser les observations précédentes.

## Deux modes d'exécution

### `INITIALISATION_PROGRAMME`

À utiliser uniquement pour le premier jeu documentaire d'un programme.

Entrées minimales :
- `programme_id` ;
- `capture_id` ;
- documents du jeu initial ;
- référentiel ARIANE contenu dans ce dossier.

Sorties :
- `STRUCTURE_PROPOSEE` ;
- `OBSERVATIONS` ;
- `RELATIONS` ;
- `ANOMALIES`.

La structure proposée est ensuite contrôlée et validée **hors du processus IA**.

### `CAPTATION_INCREMENTALE`

À utiliser pour tous les jeux documentaires suivants.

Entrées minimales :
- `programme_id` ;
- `capture_id` ;
- structure patrimoniale validée du programme ;
- nouveaux documents ;
- référentiel ARIANE contenu dans ce dossier.

Sorties :
- `OBSERVATIONS` ;
- `RELATIONS` documentaires éventuelles ;
- `ANOMALIES`.

En mode incrémental, **la structure validée est intangible** : l'IA ne crée, ne supprime, ne déplace, ne fusionne et ne renomme aucun objet patrimonial.

Si un document ultérieur semble révéler un objet absent ou une incohérence structurelle, l'IA produit une anomalie `OBJET_STRUCTURE_ABSENT` ou `INCOHERENCE_STRUCTURE` et poursuit la captation sans modifier la structure.

## Principe d'observation cumulative

Une observation est une information captée dans une source déterminée pour un objet et un attribut déterminés.

Le couple `object_id + attribute_id` n'est jamais unique.

Si trois documents indiquent trois surfaces différentes pour le même hall, trois observations distinctes doivent être conservées.

L'IA :
- ne choisit jamais quelle valeur fait foi ;
- ne supprime jamais une observation au motif qu'une autre semble meilleure ou plus récente ;
- ne réalise aucune validation métier humaine ;
- produit un score de confiance sur la qualité de sa propre captation.

La validation humaine et la sélection d'une valeur de référence sont réalisées ultérieurement dans le système de données aval, hors ARIANE IA.

## Ordre de lecture obligatoire

1. `manifest.yaml`
2. `instructions/EXECUTION.md`
3. `referentiel/objets-patrimoniaux.yaml`
4. `referentiel/relations-juridiques.yaml`
5. `referentiel/attributs/index.yaml` puis les fichiers attributaires utiles
6. `regles/01-structure-patrimoniale.md`
7. `regles/02-captation-attributs.md`
8. `regles/03-captation-incrementale.md`
9. `regles/04-tracabilite-et-sources.md`
10. `regles/05-score-confiance.md`
11. `regles/06-preservation-observations.md`
12. les schémas de sortie dans `schemas/`

## Règle finale

La mission de l'IA est de **constater, structurer, rattacher, sourcer et scorer**.

Elle ne valide jamais une donnée métier et ne modifie jamais une structure patrimoniale déjà validée.