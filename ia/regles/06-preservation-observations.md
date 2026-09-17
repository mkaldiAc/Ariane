# 06 — Préservation des observations

## Principe append-only

Une observation captée est immuable du point de vue de l’IA.

Une nouvelle captation ajoute de nouvelles observations ; elle ne met pas à jour celles issues des captations précédentes.

Le couple `object_id + attribute_id` n’est jamais une clé unique.

Exemple :

- APD : hall H01 — `surface_sol = 18,20 m²`
- PRO : hall H01 — `surface_sol = 18,40 m²`
- DOE : hall H01 — `surface_sol = 19,10 m²`

ARIANE doit produire trois observations distinctes.

## Valeurs identiques

Deux documents différents donnant la même valeur produisent également deux observations distinctes, car la provenance documentaire est différente.

## Arbitrage interdit à l’IA

L’IA ne doit jamais :

- supprimer une valeur au profit d’une autre ;
- considérer automatiquement le document le plus récent comme prioritaire ;
- fusionner des observations provenant de sources distinctes ;
- produire un statut de validation humaine ;
- désigner la valeur de référence.

La sélection de la valeur faisant foi est une opération transactionnelle du système aval, extérieure à ARIANE-IA.
