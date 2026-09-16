# ARIANE — Référentiel d'attributs patrimoniaux

Version de travail : 1.0.0  
Date de normalisation : 2026-09-16  
Référentiel de structure utilisé : ARIANE 1.1.0

## 1. Objet

Ce document formalise la méthode et les résultats de la confrontation des **345 attributs historiques** au référentiel de structure patrimoniale ARIANE 1.1.0.

La refonte aboutit à **268 attributs canoniques**. Chaque `ATT-xxxx` historique reste traçable dans la matrice de migration produite avec le livrable de travail.

## 2. Principes de normalisation

1. Une valeur captée est toujours rattachée à **un seul objet patrimonial concret**.
2. Un attribut canonique vise par défaut **un seul type d'objet**.
3. Un multi-rattachement n'est accepté que lorsque la sémantique de l'attribut est strictement identique quel que soit le type d'objet.
4. L'existence d'un objet est décrite par la **structure** ; elle n'est pas dupliquée par un booléen attributaire.
5. `RDC`, `R+1`, `SS-1`, etc. sont des **localisations**, pas des attributs patrimoniaux.
6. Les affectations, rattachements d'annexes et servitudes sont des **relations**, pas des attributs.
7. `LOT` et `PCM` ne sont jamais utilisés comme cibles : les données sont redistribuées vers les objets physiques autorisés.
8. L'absence d'information dans un document ne vaut jamais `Non` ni `0`.
9. Pour chaque attribut, la sémantique destinée à l'IA doit préciser : définition, information à rechercher, exclusions et règle de rattachement.

## 3. Bilan des 345 attributs

| Décision | Nombre |
|---|---:|
| `CONSERVER` | 4 |
| `REFORMULER` | 233 |
| `FUSIONNER` | 90 |
| `EXCLURE_STRUCTURE` | 3 |
| `RELATION` | 3 |
| `AGREGE_CONTROLE` | 4 |
| `A_ARBITRER` | 8 |

Le nombre de décisions `FUSIONNER` porte sur les lignes historiques : plusieurs anciennes colonnes peuvent donc alimenter un même attribut canonique.

## 4. Transformations structurantes

- `T1`, `T1 bis`, `T2`, `T3`, `T4`, `T5` deviennent une seule propriété `typologie_logement` de `LOG`.
- `Salon`, `Cuisine`, `Salle de bain`, `WC`, `Chambre` deviennent des valeurs de `type_piece` sur `PIE`.
- `Balcon`, `Loggia`, `Jardin`, `Terrasse` sont des `EXP`. Leur nature utilise `EXP.type_espace_exterieur` et leur surface devient `surface_espace_exterieur_privatif`.
- `Étage` est supprimé du référentiel attributaire : il s'agit d'une localisation.
- `Nombre de bâtiments`, `Nombre de locaux techniques` et `Surface parties communes` sont des agrégats/contrôles dérivables de la structure.
- Les familles de financement sont regroupées dans `mode_financement`.
- Les sous-types de chauffage et de ventilation deviennent des nomenclatures, avec un attribut séparé pour la quantité lorsque celle-ci reste nécessaire.
- Les données propres à une chaufferie sont portées par `LTE` ; les caractéristiques de toiture/façade restent portées par `BAT`.
- Les informations globales d'opération (MOA, permis, agréments, intervenants globaux) sont portées par `PRG` lorsque leur portée est celle du programme.

## 5. Surface habitable et surface de pièce

L'ancien `ATT-0086 — Surface Habitable Lot` mélange deux sémantiques et doit être scindé :

- `surface_habitable_logement` sur `LOG` uniquement lorsque la source qualifie explicitement la valeur comme surface habitable / SH ;
- `surface_piece` sur `PIE` lorsqu'une valeur surfacique est associée à une pièce.

Une même valeur ne doit jamais être copiée dans les deux attributs.

## 6. Exceptions multi-rattachement retenues

Les exceptions suivantes sont admises au niveau de la **définition** de l'attribut. Chaque valeur captée reste néanmoins attachée à un seul objet concret.

| Attribut canonique | Objets autorisés |
|---|---|
| `mode_financement` | `LOG`, `LOC` |
| `numero_lot_edd` | `LOG`, `LOC`, `CAV`, `DEP`, `PST` |
| `repere_objet` | `LOG`, `LOC`, `CAV`, `DEP`, `LTE`, `PST`, `LPO`, `LVE` |
| `surface_revetements_muraux` | `HAL`, `CAG`, `CIR` |
| `surface_revetements_plafond` | `HAL`, `CAG`, `CIR` |
| `surface_revetements_sol` | `HAL`, `CAG`, `CIR` |
| `tantieme_charge_generale` | `LOG`, `LOC`, `CAV`, `DEP`, `PST` |

## 7. Cas à arbitrer avant activation automatique

- `ATT-0100 — PAVE` : acronyme / définition métier à confirmer.
- `ATT-0171 — Installation électrique Logements` : unité atomique comptée à définir.
- `ATT-0172 — Installation électrique Parties communes` : unité atomique comptée à définir.
- `ATT-0217 — Clause d'autonomie` : portée juridique et objet cible à préciser.
- `ATT-0290 — Installations de plomberie logements` : unité atomique comptée à définir.
- `ATT-0291 — Installations sanitaires logements` : unité atomique comptée à définir.
- `ATT-0341 — Coordonnées X/Y` : système de coordonnées (CRS) et convention du point à préciser.
- `ATT-0343 — Secteur météo / Géorisque` : deux notions mélangées à scinder après définition métier.

Ces attributs ne doivent pas être activés en captation automatique avant arbitrage.

## 8. Relations sorties du référentiel attributaire

Trois besoins historiques sont reclassés en relations :

- `ATT-0085 — Rattachement annexes` : affectation d'une annexe à un `LOG`/`LOC`. `PST -> AFFECTE_A -> LOG/LOC` existe déjà ; l'extension à `CAV`/`DEP` est à arbitrer.
- `ATT-0218 — Servitude foncière` : relation juridique à formaliser.
- `ATT-0219 — Servitude bâtiment` : relation juridique à formaliser.

## 9. Règle finale

Lorsqu'un document contient une information :

1. identifier d'abord l'objet physique ARIANE concerné ;
2. rechercher l'attribut canonique autorisé pour cet objet ;
3. appliquer sa définition sémantique et ses exclusions ;
4. rattacher la valeur à **un seul objet concret** ;
5. conserver la valeur source, l'unité, le document, la page/repère, le mode d'identification et la confiance ;
6. si aucun attribut ne correspond sans ambiguïté, créer une anomalie à vérifier plutôt que forcer un rattachement.
