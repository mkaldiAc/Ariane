# 02 — Captation des attributs

## Principe

Utiliser exclusivement les attributs définis dans `../referentiel/attributs/`.

Pour chaque information :

1. identifier l’objet ARIANE concerné ;
2. vérifier que l’attribut est autorisé pour ce type d’objet ;
3. conserver la valeur source ;
4. normaliser uniquement selon les règles de l’attribut ;
5. créer une observation sourcée ;
6. attribuer un mode d’identification et un score de confiance.

## Interdictions

- Ne pas transformer l’existence d’un objet en booléen redondant.
- Ne pas créer un attribut hors référentiel pour éviter une anomalie.
- Ne pas convertir une localisation ou une relation en attribut.
- L’absence de mention vaut `Inconnu`, jamais `Non` ou `0`.
- Ne pas copier une même observation sur plusieurs objets.

## Modes d’identification

- `EXPLICITE` : la valeur est directement portée par la source.
- `DEDUIT` : la valeur résulte d’un calcul ou raisonnement autorisé.
- `PROXY` : une donnée explicitement autorisée sert de proxy à une autre, par exemple surface de sol pour surface de plafond sous les conditions prévues.
- `ENRICHI` : la valeur provient d’un enrichissement externe autorisé, par exemple géocodage d’une adresse pour Lambert-93.

Toute valeur non explicite doit conserver la règle utilisée et les données d’entrée.
