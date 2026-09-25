# ARIANE — CAPTURE, CURRENT et promotion des données

Version : 1.4.0

## 1. Principe général

ARIANE distingue strictement :

- **CAPTURE** : résultat immuable d'une itération documentaire ;
- **CURRENT** : projection consolidée courante du programme ;
- **STR-xxx** : version validée de la structure patrimoniale.

Une CAPTURE conserve ce qui a été constaté à l'instant de l'analyse. CURRENT représente ce qui est actuellement consolidable et exploitable.

## 2. Immutabilité des CAPTURE

Après émission et stockage, une CAPTURE n'est jamais réécrite par une captation ultérieure ni par `VALIDER_STRUCTURE`.

Une correction, un rejet ou une validation ultérieure ne modifie pas le constat historique.

## 3. OBJECT / STRUCTURE

Dans une CAPTURE initiale, les objets constituent `STRUCTURE_PROPOSEE`.

Dans une captation incrémentale :
- les objets validés sont seulement référencés ;
- un objet absent peut être conservé comme `CANDIDAT_STRUCTURE` ;
- ce candidat n'appartient pas à la structure validée.

Dans CURRENT, seuls les objets appartenant à la dernière structure validée `STR-xxx` sont présents comme structure de référence.

## 4. OBSERVATIONS

Dans une CAPTURE, toutes les observations démontrables sont conservées.

Une observation sur un objet validé porte `RATTACHE_STRUCTURE_VALIDEE`.

Une observation sur un objet candidat porte `EN_ATTENTE_RATTACHEMENT_STRUCTUREL` et reste hors CURRENT tant que l'objet n'est pas validé.

Après acceptation du candidat via `VALIDER_STRUCTURE`, l'observation devient éligible à CURRENT sans être recaptée ni réinterprétée.

Plusieurs observations contradictoires peuvent coexister dans CURRENT. La valeur métier de référence est décidée hors IA.

## 5. SOURCES

Chaque CAPTURE contient uniquement les sources analysées pendant l'itération.

CURRENT peut maintenir un catalogue cumulé des sources analysées.

Une source n'est jamais bloquée parce qu'elle a permis de détecter un objet candidat : elle reste un fait documentaire traçable.

## 6. RELATIONS

Une relation entre objets déjà validés peut être consolidée dans CURRENT.

Une relation impliquant au moins un objet candidat porte `EN_ATTENTE_RATTACHEMENT_STRUCTUREL` et reste dans la CAPTURE.

Elle ne devient éligible à CURRENT que lorsque tous les objets patrimoniaux nécessaires à son interprétation appartiennent à la structure validée.

## 7. ANOMALIES

Dans une CAPTURE, une anomalie est immuable.

CURRENT représente le suivi opérationnel des anomalies :
- `OUVERTE` tant que le problème n'est pas arbitré ;
- `RESOLUE` lorsqu'une évolution validée le résout ;
- `REJETEE` lorsqu'une proposition d'évolution est explicitement refusée.

La modification du statut dans CURRENT ne modifie jamais l'anomalie historique de la CAPTURE.

## 8. Promotion après validation de structure

`VALIDER_STRUCTURE` est la seule opération IA autorisée à promouvoir des données en attente de rattachement structurel.

Pour chaque candidat explicitement approuvé par l'humain :

1. créer la nouvelle `STR-xxx` à partir de la structure source ;
2. ajouter l'objet candidat sans modifier les objets non concernés ;
3. rechercher ses observations et relations en attente dans les CAPTURE ;
4. les rendre éligibles à CURRENT en conservant leurs identifiants et leur provenance ;
5. mettre à jour dans CURRENT le statut des anomalies structurelles résolues.

Cette promotion est déterministe. Elle ne constitue pas une nouvelle captation.

## 9. Refus d'un candidat

Si l'humain refuse l'intégration d'un candidat :
- aucune nouvelle structure n'est créée pour ce candidat ;
- ses observations et relations restent dans leur CAPTURE ;
- elles n'entrent jamais dans CURRENT ;
- l'anomalie historique reste inchangée ;
- CURRENT peut enregistrer la décision de rejet.

## 10. Règle finale

CAPTURE est la mémoire factuelle et immuable.

CURRENT est l'état consolidé courant.

Une donnée captée n'est jamais perdue parce qu'elle n'est pas encore intégrable à CURRENT.
