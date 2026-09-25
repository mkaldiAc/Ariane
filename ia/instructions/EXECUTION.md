# ARIANE — Protocole d'exécution IA

Version : 1.4.0

## 1. Déterminer l'opération

Deux modes de captation existent :

- `INITIALISATION_PROGRAMME` : premier jeu documentaire du programme ;
- `CAPTATION_INCREMENTALE` : tout jeu documentaire suivant.

Une opération complémentaire existe :

- `VALIDER_STRUCTURE` : matérialisation technique d'une décision humaine de validation ou d'évolution de structure.

`VALIDER_STRUCTURE` n'est pas un mode de captation.

## 2. INITIALISATION_PROGRAMME

Entrées :
- `programme_id` ;
- `capture_id` ;
- jeu documentaire initial ;
- référentiel ARIANE.

L'IA doit :
1. déclarer dans `SOURCES` chaque document effectivement analysé ;
2. construire une `STRUCTURE_PROPOSEE` ;
3. attribuer des identifiants stables aux objets proposés ;
4. capter les observations disponibles ;
5. produire les relations identifiables ;
6. produire les anomalies et incertitudes.

La décision de faire devenir cette structure une structure validée est exclusivement humaine.

## 3. VALIDER_STRUCTURE

L'IA n'est autorisée à exécuter cette opération que si l'instruction utilisateur courante fournit explicitement :
- `action: VALIDER_STRUCTURE` ;
- `human_approval: true` ;
- `programme_id` ;
- `target_structure_version`.

Lorsqu'un objet candidat doit être intégré, l'humain doit aussi identifier explicitement ce candidat, de préférence dans `approved_candidate_object_ids`.

Les champs manquants ne peuvent pas être inférés ou générés par l'IA.

Lorsque le déclencheur est valide, l'IA :
1. part de la structure source ;
2. conserve les objets validés non concernés ;
3. applique uniquement les modifications explicitement demandées ;
4. ajoute uniquement les objets candidats explicitement approuvés ;
5. produit la nouvelle structure validée ;
6. promeut vers CURRENT les observations et relations déjà captées qui deviennent structurellement rattachables ;
7. met à jour dans CURRENT le suivi des anomalies résolues ;
8. ne modifie aucune CAPTURE historique.

Voir `regles/07-finalisation-structure-validee.md` et `regles/08-capture-current.md`.

## 4. Contrôle du parent physique pendant l'initialisation

Pour chaque objet, appliquer les règles de `regles/01-structure-patrimoniale.md`, notamment la priorité aux circulations physiques directement desservantes.

En captation incrémentale, une incohérence ou un meilleur rattachement suggéré par un nouveau document ne modifie jamais la structure validée. L'écart est signalé.

## 5. CAPTATION_INCREMENTALE

Entrées :
- `programme_id` ;
- `capture_id` ;
- `structure_version` ;
- structure patrimoniale validée ;
- nouveau jeu documentaire ;
- référentiel ARIANE.

L'IA doit :
1. déclarer les nouvelles SOURCES ;
2. charger la structure validée ;
3. réutiliser les `object_id` existants pour les objets déjà validés ;
4. analyser les nouveaux documents indépendamment des anciennes valeurs ;
5. ajouter les nouvelles observations ;
6. produire les nouvelles relations ;
7. signaler les anomalies ;
8. lorsqu'un objet absent est démontré, le conserver comme `CANDIDAT_STRUCTURE` dans la CAPTURE avec ses données associées.

Interdictions :
- modifier la structure validée ;
- ajouter directement un candidat à la structure validée ;
- supprimer ou déplacer un objet validé ;
- modifier un `object_id` validé ;
- générer une nouvelle `STR-xxx` ;
- promouvoir un candidat ou ses données vers CURRENT pendant la captation.

## 6. Gestion d'un objet absent

Si un document démontre un objet absent de la structure validée :

1. créer dans la CAPTURE un objet `CANDIDAT_STRUCTURE` ;
2. lui attribuer un `object_id` stable dans la CAPTURE ;
3. produire `OBJET_STRUCTURE_ABSENT` ;
4. capter les observations démontrables sur cet objet ;
5. capter les relations démontrables ;
6. marquer les observations et relations `EN_ATTENTE_RATTACHEMENT_STRUCTUREL`.

Si l'existence ou le rattachement documentaire de l'objet est insuffisamment démontré, ne pas créer de candidat et produire uniquement l'anomalie adaptée.

## 7. Gestion des observations

Chaque observation possède son propre `observation_id`.

Une observation sur un objet validé peut être structurellement rattachable à CURRENT.

Une observation sur un candidat reste dans la CAPTURE avec `EN_ATTENTE_RATTACHEMENT_STRUCTUREL`.

Aucune observation n'est écrasée ou fusionnée automatiquement.

## 8. Gestion des relations

Une relation impliquant un candidat reste dans la CAPTURE avec `EN_ATTENTE_RATTACHEMENT_STRUCTUREL`.

Elle ne devient éligible à CURRENT qu'après intégration explicite du candidat dans une structure validée.

## 9. Gestion des sources

SOURCES décrit les documents effectivement analysés dans la captation courante.

Les sources restent des faits documentaires même lorsqu'elles concernent un objet candidat et peuvent être consolidées dans le catalogue CURRENT.

## 10. Gestion des anomalies

Dans une CAPTURE, une anomalie est immuable.

Dans CURRENT, son état opérationnel peut évoluer vers `RESOLUE` ou `REJETEE` après décision humaine.

## 11. Validation humaine des observations

La validation métier des observations reste hors ARIANE IA.

L'IA ne renseigne aucun statut métier tel que :
- valide ;
- rejeté ;
- fait foi ;
- valeur de référence.

## 12. Sorties attendues

### INITIALISATION_PROGRAMME
- SOURCES
- STRUCTURE_PROPOSEE
- OBSERVATIONS
- RELATIONS
- ANOMALIES

### CAPTATION_INCREMENTALE
- SOURCES
- OBJETS_CANDIDATS si nécessaire
- OBSERVATIONS
- RELATIONS
- ANOMALIES

## 13. Neutralité documentaire

Une observation récente n'est pas présumée meilleure qu'une ancienne.

Le type de document n'autorise jamais l'IA à sélectionner une valeur métier comme référence.

## 14. Immutabilité

Une CAPTURE passée n'est jamais modifiée.

Toute évolution du programme est matérialisée par une nouvelle CAPTURE ou une nouvelle version de structure validée, selon la nature de l'évolution.
