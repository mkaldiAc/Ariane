# ARIANE — Règles de captation des attributs par IA

Version : 1.2.0

## Références obligatoires

Avant toute captation attributaire, lire dans cet ordre :

1. `README.md`
2. `docs/structure-patrimoniale.md`
3. `model/objets-patrimoniaux.yaml`
4. `docs/attributs-patrimoniaux.md`
5. les fichiers machine-readable du référentiel attributaire validé

Le mapping historique des `ATT-xxxx` sert à la traçabilité et à la migration. Il ne doit jamais redevenir le dictionnaire de captation cible.

## Précondition

Ne capter les attributs qu'après avoir suffisamment stabilisé la structure patrimoniale du document.

## Algorithme général

Pour chaque information potentielle :

1. identifier l'objet patrimonial concret concerné ;
2. vérifier que son type est autorisé par le référentiel ARIANE ;
3. déterminer s'il s'agit réellement d'un attribut et non :
   - de l'existence d'un objet déjà portée par la structure ;
   - d'une localisation ;
   - d'une relation fonctionnelle ou juridique ;
   - d'un agrégat recalculable ;
4. rechercher un attribut canonique compatible ;
5. appliquer strictement sa définition, ses exclusions et sa règle de rattachement ;
6. conserver la valeur documentaire, l'unité et la source ;
7. rattacher chaque occurrence à **un seul objet concret** ;
8. préciser `Mode_identification = Explicite` ou `Déduit` ;
9. si plusieurs objets pourraient convenir sans preuve suffisante, ne pas dupliquer la valeur : produire une anomalie à vérifier.

## Absence d'information

L'absence d'une information dans un document signifie `Inconnu`.

Elle ne produit jamais automatiquement :

- `Non` ;
- `0` ;
- une modalité par défaut ;
- une valeur copiée d'un autre objet.

## Données déduites

Toute donnée calculée, enrichie ou obtenue par proxy doit :

- être marquée `Déduit` ;
- conserver les données d'entrée ;
- conserver la règle appliquée ;
- conserver la source permettant la déduction ;
- ne jamais être présentée comme une valeur explicitement lue dans le document.

## Multi-rattachement

Un attribut peut être autorisé sur plusieurs types d'objets lorsque sa sémantique est strictement identique. Cela ne signifie jamais qu'une même valeur doit être copiée sur plusieurs objets.

Chaque occurrence possède un seul `ID_objet`.

## Financement

`mode_financement` est rattaché uniquement à `LOG`.

Ne pas recopier automatiquement un financement global de programme ou de résidence sur tous les logements. L'affectation au logement doit être démontrée.

## Numéro de lot EDD

`numero_lot_edd` peut être porté par `LOG`, `LOC`, `CAV`, `DEP` ou `PST`.

Le numéro est un identifiant juridique externe. Il ne crée jamais un objet `LOT`.

## Repère source

`repere_source` reprend uniquement un numéro, code ou repère explicitement visible dans la source.

Interdiction d'inventer un repère pour identifier commodément un objet.

## Installation électrique de distribution

Utiliser `presence_installation_electrique_distribution` pour la présence d'un tableau/coffret de distribution et des circuits qui lui sont rattachés.

Objets autorisés : `LOG`, `LOC`, `LTE`, `BAT`, `HAL`, `CAG`, `CIR`.

Règle : rattacher à l'objet **desservi par l'installation**, et non automatiquement à l'espace où le tableau est physiquement implanté.

La simple présence de prises ou de luminaires ne suffit pas.

## Plomberie

`presence_installation_plomberie` décrit sur `LOG` la présence du réseau intérieur de distribution d'eau et d'évacuation.

Ne pas confondre le réseau avec la seule présence d'un équipement sanitaire.

## Installation sanitaire

`presence_installation_sanitaire` décrit sur `LOG` la présence d'au moins un équipement sanitaire ou d'une installation sanitaire explicitement mentionnée.

Une canalisation seule ne suffit pas.

## Clause d'autonomie juridique

`presence_clause_autonomie_juridique` est portée principalement par `BAT`.

Elle ne peut être captée que sur la base d'une mention explicite dans un acte, règlement, convention, EDD/EDDV ou document juridique assimilé.

Une autonomie technique ne permet pas de déduire une autonomie juridique.

## Coordonnées Lambert-93 issues de l'adressage

Les attributs sont :

- `coordonnee_x_lambert93` ;
- `coordonnee_y_lambert93`.

Ils sont portés par `BAT` et exprimés en Lambert-93 / EPSG:2154.

La coordonnée doit être déterminée à partir de l'**adresse de référence du bâtiment** par géocodage. Ne pas substituer un centroïde géométrique de l'emprise.

Conserver l'adresse utilisée et la source/service de géocodage.

## Risques

Les risques sont des attributs distincts portés par `RES` : inondation, retrait-gonflement des argiles, radon, sismicité, mouvement de terrain, etc.

Ne jamais concaténer plusieurs risques dans une valeur unique. Conserver pour chaque risque la valeur source, le niveau/zonage, le référentiel et sa date/version lorsque disponibles.

La notion historique `secteur météo / zone climatique` est supprimée et ne doit pas être captée.

## Surface habitable / surface de pièce

- `surface_habitable_logement` : `LOG` uniquement et uniquement si la source qualifie explicitement la valeur de surface habitable / SH ;
- `surface_piece` : `PIE` lorsque la valeur est celle de la pièce.

Une valeur ne doit jamais être enregistrée dans les deux attributs.

## Surfaces de sol, plafond et murs

Les attributs détaillés sont `surface_sol`, `surface_plafond`, `surface_murs` et s'appliquent à `HAL`, `CAG`, `CIR`.

### Surface de sol

Priorité à la valeur explicite. Un calcul est autorisé à partir de dimensions simples, explicites et non ambiguës. Le résultat est `Déduit`.

Ne pas reconstruire librement une surface complexe sur plan.

### Surface de plafond

Priorité à la valeur explicite. À défaut, **la surface de sol du même espace peut servir de proxy** si la géométrie rend l'assimilation raisonnable.

Interdire ou signaler le proxy comme non fiable en présence de vide important, double hauteur, plafond rampant, trémie importante ou géométrie atypique.

Toute utilisation du proxy est `Déduit` et doit être commentée.

### Surface de murs

Priorité à la valeur explicite. Un calcul `périmètre × hauteur` est possible uniquement si périmètre et hauteur sont fiables.

Les ouvertures ne sont retranchées que si leurs dimensions sont connues et le calcul non ambigu. Ne jamais inventer une hauteur d'étage.

### Agrégats bâtiment

Les valeurs explicitement agrégées par une source peuvent être portées par `BAT` via :

- `surface_sol_espaces_communs_batiment` ;
- `surface_plafond_espaces_communs_batiment` ;
- `surface_murs_espaces_communs_batiment`.

Ne pas les calculer automatiquement pendant la captation à partir des objets enfants.

### Agrégats résidence — exception

Si une source agrège plusieurs bâtiments sans ventilation fiable, utiliser exceptionnellement `RES` via :

- `surface_sol_espaces_communs_residence` ;
- `surface_plafond_espaces_communs_residence` ;
- `surface_murs_espaces_communs_residence`.

Ce niveau est marginal : **RES ne doit jamais être choisi par facilité**. Un rattachement `BAT` possible prévaut toujours.

## Tantièmes de charges générales

Utiliser :

- `tantieme_charges_generales` pour le numérateur ;
- `base_tantiemes_charges_generales` pour le dénominateur.

Objets autorisés : `LOG`, `LOC`, `CAV`, `DEP`, `PST`.

Ne jamais supposer une base de 10 000. Ne pas mélanger les charges générales avec une clé d'ascenseur, chauffage, bâtiment ou autre clé spécialisée.

## Affectation d'annexes

Pour `PST`, `CAV` ou `DEP` affecté à un `LOG` ou `LOC`, utiliser la relation `AFFECTE_A`.

L'affectation ne change jamais le parent physique principal de l'annexe.

## Servitudes

Les servitudes sont des relations juridiques et non des attributs ordinaires. Appliquer `docs/relations-juridiques.md`.

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
- `Commentaire`

## Principe final

La fidélité au référentiel ARIANE prévaut sur la volonté de remplir toutes les données.

Une information non captée mais correctement signalée est préférable à une information inventée, mal interprétée ou rattachée au mauvais objet.
