# ARIANE — Règles IA de structure patrimoniale

Version : 1.3.2

## Portée

Ces règles s'appliquent principalement en mode `INITIALISATION_PROGRAMME`.

En mode `CAPTATION_INCREMENTALE`, la structure validée fournie en entrée prévaut intégralement et ne peut jamais être modifiée.

## Principes

- `PRG` est la racine de contexte du programme.
- À partir de `FON`, la hiérarchie décrit la réalité physique.
- Chaque objet possède au maximum un parent principal.
- Utiliser le parent physique le plus précis démontrable.
- Les étages sont des localisations, jamais des objets.
- `LOT`, `PCM`, `MAISON`, `IMMEUBLE`, `BOX`, `CHAUFFERIE`, `ETAGE`, `PARKING` et `STATIONNEMENT` sont interdits comme types d'objets.
- Les relations d'affectation, usage, desserte et implantation ne modifient jamais le parent physique.
- Ne jamais inventer un objet ou un niveau de structure pour améliorer artificiellement la complétude.

## Règle de stabilisation

La structure produite lors de l'initialisation est une `STRUCTURE_PROPOSEE`.

Après décision humaine explicite, elle peut devenir la structure de référence du programme selon `07-finalisation-structure-validee.md`.

L'IA ne peut jamais prendre seule cette décision de validation.

Elle peut seulement matérialiser techniquement la décision humaine si le déclencheur formel requis par `07-finalisation-structure-validee.md` est fourni dans le message utilisateur courant.

Toutes les captations ultérieures utilisent cette structure figée.

## Objets absents dans un jeu ultérieur

Toute mention d'un objet non présent dans la structure validée produit une anomalie et non une évolution structurelle.
