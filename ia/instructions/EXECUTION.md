# ARIANE — protocole d’exécution IA

Version 1.3.0

## 1. Préparation obligatoire

Avant toute analyse :

1. lire `../manifest.yaml` ;
2. charger le référentiel des objets et relations ;
3. charger le catalogue canonique des attributs ;
4. lire toutes les règles de `../regles/` ;
5. respecter les schémas de sortie de `../schemas/`.

## 2. Identifier le mode d’exécution

Deux modes seulement sont autorisés.

### INITIALISATION_PROGRAMME

Entrées minimales :

- `programme_id` ;
- `capture_id` ;
- premier jeu documentaire.

Mission :

1. construire une **structure proposée** conformément au référentiel ARIANE ;
2. attribuer des identifiants stables aux objets proposés ;
3. capter les observations attributaires disponibles dans le même jeu documentaire ;
4. produire les relations complémentaires explicitement démontrées ;
5. produire les anomalies et incertitudes.

Sorties :

- `structure_proposee` ;
- `sources` ;
- `observations` ;
- `relations` ;
- `anomalies`.

La validation de la structure se déroule ensuite hors de l’IA. L’IA ne doit pas inventer de statut de validation.

### CAPTATION_INCREMENTALE

Entrées minimales :

- `programme_id` ;
- `capture_id` ;
- `structure_version` ;
- structure patrimoniale validée du programme ;
- nouveau jeu documentaire.

Mission :

1. considérer la structure fournie comme **strictement en lecture seule** ;
2. rapprocher les éléments du document des objets existants ;
3. capter uniquement de nouvelles observations et relations documentées ;
4. produire une anomalie lorsqu’un élément documentaire ne peut pas être rattaché de manière suffisamment fiable.

Interdictions absolues en mode incrémental :

- créer un objet patrimonial ;
- supprimer un objet ;
- modifier son type ;
- modifier son parent ;
- fusionner ou scinder des objets ;
- changer un `object_id` ;
- produire une nouvelle `structure_version` ;
- choisir une valeur attributaire comme valeur de référence.

Si un nouveau document révèle un objet absent de la structure, produire une anomalie `OBJET_STRUCTURE_ABSENT`.

## 3. Règle de cumul

Chaque valeur observée dans le nouveau jeu documentaire crée une nouvelle `observation_id`, même si le même `object_id + attribute_id` possède déjà d’autres observations dans la base aval.

Ne jamais dédupliquer des valeurs provenant de documents différents au seul motif qu’elles sont identiques.

## 4. Absence de validation métier

Les sorties IA ne contiennent aucun champ du type :

- `valide_humain` ;
- `fait_foi` ;
- `valeur_reference` ;
- `observation_retenue`.

Ces décisions appartiennent au système transactionnel aval.

## 5. Fin d’exécution

Avant restitution :

- vérifier la conformité aux schémas ;
- vérifier la présence de la traçabilité documentaire ;
- vérifier les scores de confiance ;
- vérifier qu’aucune observation antérieure n’a été écrasée ;
- en mode incrémental, vérifier qu’aucune modification de structure n’a été produite.
