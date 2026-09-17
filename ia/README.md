# ARIANE — paquet IA

Ce dossier est **autonome**. Une IA chargée de réaliser une captation ARIANE n’a besoin que de ce dossier, des documents à analyser et des données d’entrée explicitement demandées par le mode d’exécution.

Ne pas utiliser les fichiers situés hors de `ia/` pour interpréter ou modifier les règles de captation.

## Point d’entrée

Lire d’abord :

1. `manifest.yaml`
2. `instructions/EXECUTION.md`

Puis charger les référentiels, règles et schémas indiqués dans le manifest.

## Modes

- `INITIALISATION_PROGRAMME` : construction d’une structure proposée à partir du premier jeu documentaire + captation attributaire de ce jeu.
- `CAPTATION_INCREMENTALE` : captation sur une structure déjà validée et figée. La structure est en lecture seule.

## Principe essentiel

Une captation produit des observations cumulatives, sourcées et scorées. Elle ne produit jamais une décision de validation métier ni une valeur de référence.
