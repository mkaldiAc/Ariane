# ARIANE — Protocole d'exécution IA

Version : 1.3.0

## 1. Déterminer le mode

Deux modes existent :

- `INITIALISATION_PROGRAMME` : premier jeu documentaire du programme.
- `CAPTATION_INCREMENTALE` : tout jeu documentaire suivant.

Le mode doit être explicite dans la demande d'exécution.

## 2. INITIALISATION_PROGRAMME

Entrées :
- `programme_id` ;
- `capture_id` ;
- jeu documentaire initial ;
- référentiel ARIANE.

L'IA doit :
1. construire une structure patrimoniale proposée selon le référentiel ;
2. attribuer des identifiants stables aux objets proposés ;
3. capter les observations attributaires disponibles ;
4. produire les relations complémentaires/juridiques identifiables ;
5. produire les anomalies et incertitudes.

La sortie structurelle porte le statut `PROPOSEE`. Elle doit être validée à l'extérieur du processus IA avant toute captation incrémentale.

## 3. CAPTATION_INCREMENTALE

Entrées :
- `programme_id` ;
- `capture_id` ;
- `structure_version` ;
- structure patrimoniale validée ;
- nouveau jeu documentaire ;
- référentiel ARIANE.

L'IA doit :
1. charger la structure validée ;
2. réutiliser exclusivement les `object_id` existants ;
3. analyser les nouveaux documents sans chercher à faire coïncider leurs valeurs avec les observations antérieures ;
4. ajouter de nouvelles observations ;
5. produire les relations documentaires éventuelles ;
6. signaler toute impossibilité de rattachement ou incohérence structurelle dans `ANOMALIES`.

Interdictions en mode incrémental :
- créer un objet patrimonial ;
- supprimer un objet ;
- déplacer un objet ;
- changer son parent ;
- fusionner ou scinder des objets ;
- renommer un identifiant ;
- générer une nouvelle version de structure.

## 4. Gestion des objets absents

Si un document ultérieur mentionne un objet qui n'existe pas dans la structure validée :

- ne pas créer cet objet ;
- ne pas rattacher artificiellement ses données à un autre objet ;
- produire une anomalie `OBJET_STRUCTURE_ABSENT` avec :
  - type d'objet pressenti ;
  - repère source ;
  - description ;
  - document/page/plan ;
  - score de confiance.

## 5. Gestion des observations

Une observation correspond à une valeur captée dans une source pour un objet et un attribut.

Chaque observation possède son propre `observation_id`.

Le couple `object_id + attribute_id` peut posséder plusieurs observations issues de documents différents, de captations différentes, ou même du même document si la source fournit plusieurs occurrences distinctes.

Ne jamais écraser, fusionner ni sélectionner automatiquement une observation.

## 6. Validation humaine

La validation humaine n'est pas une sortie ni une étape ARIANE IA.

L'IA ne renseigne aucun statut tel que :
- valide ;
- rejeté ;
- fait foi ;
- valeur de référence.

Ces décisions sont réalisées ultérieurement dans la base de données ou le système métier aval.

## 7. Sorties attendues

### STRUCTURE_PROPOSEE
Uniquement en `INITIALISATION_PROGRAMME`.

### OBSERVATIONS
À chaque captation.

### RELATIONS
Relations identifiées dans le jeu documentaire courant.

### ANOMALIES
Incertitudes, objets absents, rattachements impossibles, contradictions structurelles ou informations ne pouvant être captées proprement.

## 8. Principe de neutralité documentaire

Une observation récente n'est pas présumée meilleure qu'une observation ancienne.

Le type de document (APD, PRO, DOE, diagnostic, etc.) n'autorise jamais l'IA à sélectionner une valeur comme référence métier.
