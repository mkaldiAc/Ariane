# ARIANE — Traçabilité et sources

Version : 1.3.2

## Principe

Aucune observation ne doit exister sans rattachement documentaire explicite.

## Source documentaire

Chaque document analysé doit disposer d'un `source_id` stable dans la captation considérée.

Conserver lorsque disponibles :
- nom du fichier ;
- type documentaire ;
- date du document ;
- identifiant de lot/captation ;
- empreinte ou hash du fichier si le système d'ingestion le fournit ;
- page, feuille, plan, article ou repère ;
- extrait ou ancre permettant de retrouver la preuve.

## Observation

Chaque observation doit pouvoir être reliée sans ambiguïté à :
- un `programme_id` ;
- un `capture_id` ;
- un `source_id` ;
- un `object_id` ;
- un `attribute_id`.

## Conservation de la valeur source

Toujours conserver :
- `value_raw` : valeur telle qu'elle apparaît dans la source ;
- `value_normalized` : valeur normalisée éventuelle ;
- `unit_raw` ;
- `unit_normalized`.

La normalisation ne doit jamais faire disparaître la valeur originale.

## Déductions et enrichissements

Pour `DEDUIT`, `PROXY` ou `ENRICHI`, conserver en plus :
- la règle appliquée ;
- les données d'entrée ;
- la source des données d'entrée ;
- le cas échéant la source d'enrichissement.

## Multiplicité

Deux occurrences distinctes dans deux documents différents produisent deux observations distinctes même si la valeur est identique.