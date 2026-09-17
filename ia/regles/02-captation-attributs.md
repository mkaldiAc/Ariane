# ARIANE — Règles IA de captation attributaire

Version : 1.3.0

## Principe

Une observation est une information captée dans une source déterminée pour un objet patrimonial existant et un attribut canonique ARIANE.

Chaque observation doit porter au minimum :
- `programme_id` ;
- `capture_id` ;
- `source_id` ;
- `observation_id` ;
- `object_id` ;
- `attribute_id` ;
- valeur source ;
- valeur normalisée si applicable ;
- unité source et unité normalisée si applicable ;
- page/plan/repère ;
- mode d'identification ;
- score de confiance.

## Rattachement

- Rattacher chaque observation à un seul objet concret.
- Respecter strictement les types d'objets autorisés par l'attribut.
- En mode incrémental, utiliser uniquement les `object_id` de la structure validée fournie.
- Ne jamais créer un objet pour permettre un rattachement.

## Absence

L'absence d'information dans un document signifie `Inconnu`.

Elle ne produit jamais automatiquement `Non`, `0`, une modalité par défaut ou la copie d'une valeur provenant d'un autre objet.

## Valeurs explicites, déduites, proxy et enrichies

Les modes d'identification autorisés sont :
- `EXPLICITE` : valeur directement présente dans la source ;
- `DEDUIT` : valeur calculée à partir d'éléments explicites de la source ;
- `PROXY` : valeur approchée à partir d'une autre donnée selon une règle explicitement autorisée ;
- `ENRICHI` : valeur obtenue par enrichissement externe autorisé à partir d'une donnée captée.

Toute valeur non explicite doit conserver la règle utilisée et les données d'entrée ayant permis son obtention.

## Règles particulières validées

- `surface_sol` : calcul simple autorisé à partir de dimensions explicites et non ambiguës.
- `surface_plafond` : proxy à partir de `surface_sol` autorisé si la géométrie ne rend pas l'approximation incohérente ; toujours en mode `PROXY`.
- `surface_murs` : calcul autorisé à partir d'un périmètre et d'une hauteur fiables ; ne jamais inventer une hauteur.
- agrégats de surfaces : `BAT` est le niveau agrégé privilégié ; `RES` uniquement si la source agrège explicitement plusieurs bâtiments sans ventilation fiable.
- coordonnées X/Y : géocodage depuis l'adressage, en Lambert-93 / EPSG:2154, mode `ENRICHI`.
- risques naturels : capter séparément chaque nature de risque au niveau `RES`.
- `numero_lot_edd` et tantièmes : porter sur l'objet physique correspondant sans créer d'objet `LOT`.

## Validation humaine

La validation humaine ne fait pas partie de la captation IA.

L'IA ne produit jamais de statut métier de validation et ne choisit jamais une observation comme valeur de référence.