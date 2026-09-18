# ARIANE — Préservation des observations

Version : 1.3.2

## Principe cardinal

Une observation captée est un constat documentaire. Elle ne doit jamais être remplacée par une observation ultérieure.

## Conséquences

Pour un même `object_id` et un même `attribute_id`, il peut exister plusieurs observations :
- issues de documents différents ;
- issues de captations différentes ;
- avec des valeurs identiques ou différentes ;
- avec des scores de confiance différents.

Chaque occurrence conserve son propre `observation_id` et sa propre traçabilité.

## Interdictions

L'IA ne doit jamais :
- choisir automatiquement l'observation qui fait foi ;
- supprimer une observation contradictoire ;
- privilégier automatiquement un DOE, un PRO ou tout autre type documentaire ;
- fusionner plusieurs valeurs en moyenne, minimum, maximum ou valeur supposée la plus récente ;
- attribuer un statut de validation métier.

## Validation externe

La sélection éventuelle d'une observation comme valeur de référence est réalisée hors IA, dans la base de données ou le système métier aval, au moyen d'opérations transactionnelles distinctes de la captation.

ARIANE IA n'a pas besoin de connaître le résultat de cette validation pour poursuivre les captations documentaires.
