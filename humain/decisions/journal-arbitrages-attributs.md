# ARIANE — Journal des arbitrages attributaires

Version consolidée : 1.3.0

Ce document conserve la mémoire des principaux arbitrages métier réalisés lors de la normalisation du référentiel attributaire.

## Arbitrages validés

1. `ATT-0100 — PAVE` : exclu du référentiel canonique, signification métier non connue avec suffisamment de certitude.
2. `ATT-0171` et `ATT-0172` : fusionnés dans `presence_installation_electrique_distribution` ; rattachement à l'objet réellement desservi.
3. `ATT-0217 — Clause d'autonomie` : devient `presence_clause_autonomie_juridique`, principalement sur `BAT`, uniquement sur preuve juridique explicite.
4. `ATT-0290 — Installations de plomberie logements` : devient `presence_installation_plomberie` sur `LOG`.
5. `ATT-0291 — Installations sanitaires logements` : devient `presence_installation_sanitaire` sur `LOG`.
6. `ATT-0341 — Coordonnées X/Y` : scindé en `coordonnee_x_lambert93` et `coordonnee_y_lambert93`, obtenues par géocodage de l'adresse du bâtiment en EPSG:2154.
7. `ATT-0343 — Secteur météo / Géorisque` : suppression de la notion météo ; éclatement des risques naturels en attributs distincts au niveau `RES`.
8. `mode_financement` : rattachement uniquement à `LOG`.
9. `numero_lot_edd` : multi-rattachement autorisé sur `LOG`, `LOC`, `CAV`, `DEP`, `PST` sans objet `LOT`.
10. `repere_source` : attribut transversal, uniquement lorsque le repère est explicitement présent dans la source.
11. `surface_plafond` : `HAL`, `CAG`, `CIR`; proxy depuis la surface de sol autorisé sous conditions, avec traçabilité.
12. `surface_sol` : `HAL`, `CAG`, `CIR`; calcul simple depuis dimensions fiables autorisé.
13. `surface_murs` : `HAL`, `CAG`, `CIR`; calcul possible depuis périmètre et hauteur fiables.
14. Agrégats de surfaces : `BAT` est le niveau normal ; `RES` reste une exception marginale lorsqu'une source agrège plusieurs bâtiments sans ventilation fiable.
15. Tantièmes : distinction entre `tantieme_charges_generales` et `base_tantiemes_charges_generales`, sur `LOG`, `LOC`, `CAV`, `DEP`, `PST`.

## Relations sorties des attributs

- `ATT-0085 — Rattachement annexes` devient une relation `AFFECTE_A` depuis `PST`, `CAV` ou `DEP` vers `LOG` ou `LOC`.
- `ATT-0218 — Servitude foncière` devient une relation juridique.
- `ATT-0219 — Servitude bâtiment` devient une relation juridique.

## Décisions d'architecture de captation

- La structure patrimoniale est construite à partir du premier jeu documentaire d'un programme.
- Après validation externe, cette structure est figée.
- Les captations documentaires 2 à N ne peuvent jamais modifier cette structure.
- Toute nouvelle valeur captée est une observation distincte, sourcée et scorée.
- Plusieurs observations contradictoires pour le même objet et attribut sont conservées simultanément.
- L'IA ne choisit jamais la valeur faisant foi.
- La validation humaine est réalisée ultérieurement en base de données, en dehors du protocole IA.