# 01 — Structure patrimoniale

## Finalité

La structure décrit la réalité physique du programme selon le référentiel `objets-patrimoniaux.yaml`.

## Règles

- `PRG` est la racine de contexte du programme.
- À partir de `FON`, utiliser le parent physique le plus précis démontrable.
- Ne jamais créer `LOT`, `PCM`, étage, maison, immeuble, box ou chaufferie comme type patrimonial lorsqu’ils sont interdits par le référentiel.
- Séparer structure physique, attributs, localisation et relations complémentaires.
- Les niveaux `RDC`, `R+1`, `SS-1`, etc. sont des localisations.
- Une relation fonctionnelle ou juridique ne modifie jamais le parent physique.
- Ne jamais inventer un niveau intermédiaire pour augmenter artificiellement la précision.

## Cycle de vie

La structure peut être construite uniquement pendant `INITIALISATION_PROGRAMME`.

Après validation externe, elle reçoit une `structure_version` et devient immuable pour toutes les exécutions `CAPTATION_INCREMENTALE`.

Toute information ultérieure suggérant une structure différente est restituée comme anomalie, jamais comme modification.
