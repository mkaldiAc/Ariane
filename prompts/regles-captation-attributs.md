# ARIANE — Règles de captation des attributs par IA

Version : 1.0.0

## Références obligatoires

Avant toute captation attributaire, lire dans cet ordre :

1. `docs/structure-patrimoniale.md`
2. `model/objets-patrimoniaux.yaml`
3. `docs/attributs-patrimoniaux.md`
4. le dictionnaire canonique d'attributs issu de la normalisation des 345 attributs

Le mapping historique des `ATT-xxxx` sert à la traçabilité et à la migration ; il ne doit pas redevenir le dictionnaire de captation cible.

## Précondition

Ne capter les attributs qu'après avoir suffisamment stabilisé la structure patrimoniale du document.

## Algorithme de captation

Pour chaque information potentielle :

1. identifier l'objet patrimonial concret concerné ;
2. vérifier que son type est autorisé par `objets-patrimoniaux.yaml` ;
3. déterminer s'il s'agit réellement d'un attribut, et non :
   - de l'existence d'un objet déjà portée par la structure ;
   - d'une localisation (`RDC`, `R+1`, `SS-1`...) ;
   - d'une relation d'affectation, d'usage ou juridique ;
   - d'un agrégat recalculable ;
4. rechercher un attribut canonique autorisé pour le type de l'objet ;
5. appliquer strictement sa définition, les informations à rechercher, les exclusions et la règle de rattachement ;
6. conserver la valeur documentaire, l'unité source et la traçabilité ;
7. rattacher chaque occurrence à un seul objet concret ;
8. si plusieurs objets pourraient convenir sans preuve suffisante, ne pas dupliquer la valeur : créer une anomalie à vérifier.

## Règle sur les absences

L'absence d'une information dans un document signifie `Inconnu`.

Elle ne doit jamais produire automatiquement :

- `Non` ;
- `0` ;
- une modalité par défaut ;
- une valeur déduite d'un autre objet.

## Règle sur les nomenclatures

Lorsqu'un attribut utilise une nomenclature :

- conserver la valeur source ;
- rapprocher de la nomenclature uniquement si l'équivalence est certaine ;
- si la source apporte une valeur hors nomenclature, conserver la valeur source et signaler l'écart ;
- ne pas générer les autres modalités avec la valeur `Non`.

Exemple : un logement explicitement `T3` produit `typologie_logement = T3`, et non cinq autres attributs à `Non`.

## Règle de multi-rattachement

Certains attributs canoniques autorisent plusieurs types d'objets. Cela signifie uniquement que la **définition de l'attribut** est réutilisable sur ces objets.

Cela ne signifie jamais qu'une même valeur doit être copiée sur plusieurs objets.

Chaque valeur captée possède un seul `ID_objet`.

## Règle sur les anciens ATT-xxxx

Pour une nouvelle captation :

- utiliser l'attribut canonique ;
- ne pas recréer les colonnes booléennes historiques fusionnées ;
- ne pas réintroduire `LOT`, `PCM` ou les anciens multi-rattachements ambigus ;
- conserver l'ancien `ATT-xxxx` uniquement comme information de migration lorsqu'elle est utile.

## Surface habitable / surface de pièce

Ne jamais utiliser indistinctement l'ancien `Surface Habitable Lot`.

- `surface_habitable_logement` : uniquement sur `LOG` et uniquement si la source qualifie explicitement la valeur de surface habitable / SH.
- `surface_piece` : sur `PIE` lorsque la valeur est la surface de la pièce.

Une valeur ne doit jamais être enregistrée dans les deux attributs.

## Sortie minimale

Pour chaque valeur :

- `ID_objet`
- `Attribut_canonique`
- `Valeur_source`
- `Valeur_normalisee` si applicable
- `Unite_source`
- `Unite_normalisee`
- `Document_source`
- `Page_ou_plan`
- `Repere`
- `Mode_identification` (`Explicite` ou `Déduit`)
- `Confiance`
- `Commentaire` si ambiguïté

## Cas à arbitrer

Les cas listés comme `A_ARBITRER` dans `docs/attributs-patrimoniaux.md` ne doivent pas être captés automatiquement avant stabilisation métier.

## Principe final

La fidélité au référentiel ARIANE prévaut sur la volonté de remplir toutes les données.

Une information mal rattachée est plus dommageable qu'une information laissée inconnue et correctement signalée.
