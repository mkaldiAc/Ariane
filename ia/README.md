# ARIANE — Ressources destinées à l'IA

Ce dossier constitue le **seul point d'entrée nécessaire à une IA de captation ARIANE**.

L'IA ne doit pas utiliser les ressources du dossier `humain/` pour exécuter une captation. Ces ressources servent à la compréhension, à la gouvernance, aux arbitrages et aux livrables de travail.

Version : **1.4.0**.

## Objectif

ARIANE permet de traiter un programme immobilier en plusieurs temps :

1. construire une structure patrimoniale à partir d'un premier jeu documentaire ;
2. capter les attributs présents dans ce même jeu documentaire ;
3. après décision humaine explicite de validation, réutiliser une structure figée pour les jeux documentaires suivants ;
4. conserver chaque itération comme une **CAPTURE immuable** ;
5. maintenir un **CURRENT** représentant l'état consolidé courant ;
6. conserver comme `CANDIDAT_STRUCTURE` tout objet ultérieurement démontré mais absent de la structure validée, avec ses observations et relations ;
7. ne promouvoir cet objet et ses données vers CURRENT qu'après décision humaine explicite matérialisée par `VALIDER_STRUCTURE`.

## Modes de captation

### `INITIALISATION_PROGRAMME`

À utiliser uniquement pour le premier jeu documentaire d'un programme.

Entrées minimales :
- `programme_id` ;
- `capture_id` ;
- documents du jeu initial ;
- référentiel ARIANE contenu dans ce dossier.

Sorties :
- `SOURCES` ;
- `STRUCTURE_PROPOSEE` ;
- `OBSERVATIONS` ;
- `RELATIONS` ;
- `ANOMALIES`.

La décision de validation de la structure appartient à l'humain. L'IA ne peut jamais la prendre seule.

### `CAPTATION_INCREMENTALE`

À utiliser pour tous les jeux documentaires suivants.

Entrées minimales :
- `programme_id` ;
- `capture_id` ;
- `structure_version` ;
- structure patrimoniale validée du programme ;
- nouveaux documents ;
- référentiel ARIANE contenu dans ce dossier.

Sorties :
- `SOURCES` ;
- `OBJETS_CANDIDATS` lorsque nécessaire ;
- `OBSERVATIONS` ;
- `RELATIONS` ;
- `ANOMALIES`.

La structure validée est intangible pendant la captation.

Si un document démontre un objet absent de cette structure, l'IA peut conserver cet objet comme `CANDIDAT_STRUCTURE` dans la CAPTURE courante, capter ses observations et relations, et produire l'anomalie `OBJET_STRUCTURE_ABSENT`.

Ces données portent `EN_ATTENTE_RATTACHEMENT_STRUCTUREL` et restent hors CURRENT tant que l'objet n'a pas été accepté par décision humaine explicite.

## CAPTURE et CURRENT

### CAPTURE

Une CAPTURE représente le résultat factuel d'une itération documentaire.

Une fois émise et stockée, elle est immuable.

Elle peut contenir :
- des sources ;
- des observations ;
- des relations ;
- des anomalies ;
- des objets candidats absents de la structure validée.

Une décision ou une captation ultérieure ne réécrit jamais une CAPTURE passée.

### CURRENT

CURRENT représente l'état consolidé courant du programme.

Il contient :
- la dernière structure validée `STR-xxx` ;
- les observations structurellement rattachables ;
- les relations structurellement rattachables ;
- le catalogue cumulé des sources ;
- l'état courant de suivi des anomalies.

Les données d'un objet candidat ne peuvent pas entrer dans CURRENT avant validation de cet objet.

Voir `regles/08-capture-current.md`.

## Validation d'une structure : `VALIDER_STRUCTURE`

`VALIDER_STRUCTURE` n'est pas un mode de captation. C'est une opération de matérialisation d'une décision humaine.

L'IA peut l'exécuter uniquement si le message utilisateur courant fournit explicitement :

```yaml
action: VALIDER_STRUCTURE
human_approval: true
programme_id: <PROGRAMME_ID>
target_structure_version: <STRUCTURE_VERSION>
```

Lorsqu'un ou plusieurs objets candidats doivent être intégrés, l'humain fournit également leurs identifiants, par exemple :

```yaml
approved_candidate_object_ids:
  - CAV_003
```

L'opération réalise alors logiquement :
1. la création de la nouvelle structure validée ;
2. la promotion vers CURRENT des observations et relations déjà captées qui deviennent rattachables ;
3. la mise à jour du suivi des anomalies dans CURRENT.

La CAPTURE historique reste inchangée.

## Principe d'observation cumulative

Une observation est un constat documentaire.

Une observation ultérieure ne remplace jamais une observation antérieure.

Plusieurs valeurs peuvent coexister pour un même `object_id + attribute_id`.

La validation humaine des observations et la sélection d'une valeur métier de référence sont réalisées dans le système aval, hors ARIANE IA.

## Règle stricte sur `repere_source`

`repere_source` conserve uniquement une désignation explicitement portée par la source et rattachée sans ambiguïté à l'objet.

`source_anchor` et `repere_source` restent distincts.

Une anomalie `OBJET_STRUCTURE_ABSENT` n'interdit pas à elle seule de capter un `repere_source` sur un objet candidat si son identification documentaire est explicite et non ambiguë.

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
12. `regles/07-finalisation-structure-validee.md`
13. `regles/08-capture-current.md`
14. les schémas dans `schemas/`

## Règle finale

La mission de l'IA est de **constater, structurer, rattacher, sourcer, scorer et conserver**.

Elle ne valide jamais seule une donnée métier ni une évolution de structure.

Une donnée captée n'est jamais perdue au seul motif qu'elle n'est pas encore intégrable à CURRENT.
