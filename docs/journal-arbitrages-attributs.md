# ARIANE — Journal des arbitrages du référentiel attributaire

Version : 1.2.0  
Date de validation : 2026-09-17

## Objet

Ce document conserve la mémoire des principaux arbitrages métier réalisés lors de la normalisation des 345 attributs historiques. Il est destiné en priorité à la compréhension humaine et sert de contexte complémentaire pour les IA lorsque l'origine d'une règle doit être comprise.

## 1 — `ATT-0100 — PAVE`

**Décision : suppression.**

La signification métier de l'acronyme n'a pas pu être retrouvée avec suffisamment de certitude. L'attribut est exclu du référentiel canonique et reste uniquement présent dans l'historique de migration.

## 2 — `ATT-0171 — Installation électrique Logements`

**Décision : reformulation.**

Devient `presence_installation_electrique_distribution` : présence d'une installation locale comprenant au minimum un tableau électrique de distribution/répartition et les circuits qui lui sont rattachés.

## 3 — `ATT-0172 — Installation électrique Parties communes`

**Décision : fusion avec `ATT-0171`.**

La notion `parties communes` n'est pas un objet ARIANE. L'attribut unique est rattaché à l'objet réellement desservi : `LOG`, `LOC`, `LTE`, `BAT`, `HAL`, `CAG` ou `CIR` selon le cas.

## 4 — `ATT-0217 — Clause d'autonomie`

**Décision : précision juridique.**

Devient `presence_clause_autonomie_juridique`, principalement sur `BAT`. Une autonomie technique ne permet pas de déduire la présence d'une clause juridique.

## 5 — `ATT-0290 — Installations de plomberie logements`

**Décision : reformulation.**

Devient `presence_installation_plomberie`, portée par `LOG`, décrivant la présence du réseau intérieur de distribution d'eau et d'évacuation.

## 6 — `ATT-0291 — Installations sanitaires logements`

**Décision : reformulation.**

Devient `presence_installation_sanitaire`, portée par `LOG`, décrivant la présence d'au moins un ensemble d'équipements sanitaires. La notion reste distincte du réseau de plomberie.

## 7 — `ATT-0341 — Coordonnées X/Y`

**Décision : scission et convention géographique.**

Deux attributs : `coordonnee_x_lambert93` et `coordonnee_y_lambert93` sur `BAT`.

Convention : Lambert-93 / EPSG:2154. Les coordonnées sont obtenues à partir de l'adressage de référence du bâtiment par géocodage, et non à partir du centroïde géométrique de l'emprise.

## 8 — `ATT-0343 — Secteur météo / Géorisque`

**Décision : suppression partielle et éclatement.**

La composante `secteur météo / zone climatique` est abandonnée faute de sémantique métier suffisamment connue.

Les risques naturels/technologiques sont conservés comme attributs distincts portés par `RES` : inondation, retrait-gonflement des argiles, radon, sismicité, mouvement de terrain, etc.

## 9 — Mode de financement

**Décision : rattachement unique à `LOG`.**

Le financement peut différer d'un logement à l'autre au sein d'une même résidence. Il n'est donc pas porté par `PRG` ou `RES` et n'est pas retenu sur `LOC`.

## 10 — Numéro de lot EDD

**Décision : multi-rattachement justifié.**

`numero_lot_edd` peut être porté par `LOG`, `LOC`, `CAV`, `DEP` ou `PST`. Il s'agit d'un identifiant juridique externe. Aucun objet `LOT` ne doit être créé.

## 11 — Repère source

**Décision : attribut transversal.**

`repere_source` est applicable à tout objet patrimonial explicitement désigné dans un document. Il est interdit à l'IA d'inventer un repère.

## 12 — Surface de plafond

**Décision : simplification sémantique et proxy autorisé.**

L'ancien libellé lié au `revêtement` devient `surface_plafond`, car l'attribut ne qualifie pas le matériau.

Rattachement détaillé : `HAL`, `CAG`, `CIR`.

Proxy autorisé : la surface de sol du même espace peut être utilisée comme approximation de la surface de plafond lorsque la géométrie le permet. La valeur est alors `Déduit` et le proxy est tracé. Les doubles hauteurs, vides, rampants, trémies importantes ou géométries atypiques empêchent ou fragilisent ce proxy.

Agrégats : `BAT` en priorité ; `RES` uniquement de manière exceptionnelle lorsque la source agrège plusieurs bâtiments sans ventilation fiable.

## 13 — Surface de sol

**Décision : surface simple et calcul contrôlé.**

Devient `surface_sol` sur `HAL`, `CAG`, `CIR`. Un calcul simple à partir de dimensions explicites et non ambiguës est autorisé en mode `Déduit`.

Agrégats : `BAT` en priorité ; `RES` de manière exceptionnelle.

## 14 — Surface de murs

**Décision : surface simple et calcul contrôlé.**

Devient `surface_murs` sur `HAL`, `CAG`, `CIR`. Le calcul `périmètre × hauteur` est autorisé uniquement avec des données fiables. Les ouvertures ne sont déduites que si leurs dimensions sont connues. L'IA ne doit jamais inventer une hauteur d'étage.

Agrégats : `BAT` en priorité ; `RES` de manière exceptionnelle.

## 15 — Tantièmes de charges générales

**Décision : deux attributs et multi-rattachement justifié.**

- `tantieme_charges_generales` = numérateur ;
- `base_tantiemes_charges_generales` = dénominateur.

Objets autorisés : `LOG`, `LOC`, `CAV`, `DEP`, `PST`.

La base ne doit jamais être supposée égale à 10 000. Les clés spécialisées d'ascenseur, chauffage, bâtiment ou autres ne sont pas fusionnées avec les charges générales.

## Décision complémentaire — Affectation des annexes

L'ancien `ATT-0085 — Rattachement annexes` est reclassé en relation `AFFECTE_A`.

La relation est étendue aux sources `PST`, `CAV`, `DEP` vers `LOG` ou `LOC`. Elle ne modifie jamais le parent physique principal de l'annexe.

## Statut final

À l'issue de ces arbitrages, aucun des huit cas initialement classés `A_ARBITRER` ne reste ouvert. Le référentiel attributaire 1.2.0 est utilisable pour la captation, sous réserve d'appliquer les règles de déduction et de traçabilité prévues dans le dépôt.
