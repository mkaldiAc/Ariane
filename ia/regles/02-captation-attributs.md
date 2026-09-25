# ARIANE — Règles IA de captation attributaire

Version : 1.4.0

## Principe

Une observation est une information captée dans une source déterminée pour un objet patrimonial existant ou, en captation incrémentale, pour un objet candidat explicitement détecté dans la même CAPTURE.

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
- En mode incrémental, rattacher normalement les observations aux `object_id` de la structure validée.
- Si la source démontre un objet absent de cette structure, les observations peuvent être rattachées à l'`object_id` d'un `CANDIDAT_STRUCTURE` émis dans la même CAPTURE.
- Toute observation d'un objet candidat porte `structural_binding_status = EN_ATTENTE_RATTACHEMENT_STRUCTUREL`.
- Une observation en attente reste dans la CAPTURE et ne peut pas entrer dans `CURRENT` avant validation explicite de l'objet par `VALIDER_STRUCTURE`.
- Ne jamais rattacher artificiellement une donnée d'un objet candidat à un objet existant pour contourner cette règle.

## Règle stricte — `repere_source`

`repere_source` conserve la désignation que la source utilise effectivement pour identifier ou repérer l'objet observé dans son contexte documentaire.

Une observation `repere_source` est autorisée uniquement si toutes les conditions suivantes sont satisfaites :
1. la valeur apparaît explicitement dans la source ;
2. la preuve est localisable ;
3. le rattachement graphique, spatial ou textuel entre cette valeur et l'objet est suffisamment direct et non ambigu ;
4. le texte joue dans la source un rôle de désignation ou de repérage de l'objet ;
5. aucune anomalie non résolue ne remet en cause ce rattachement documentaire.

Pour `repere_source`, le seul `identification_mode` autorisé est `EXPLICITE`.

Une anomalie `OBJET_STRUCTURE_ABSENT` ne remet pas à elle seule en cause le rattachement documentaire à un objet candidat : un `repere_source` peut donc être capté sur ce candidat si son identification est explicite et non ambiguë.

En cas de doute :
- ne pas produire l'observation `repere_source` ;
- conserver le texte dans `source_anchor` si cela aide à localiser la preuve ;
- capter l'information sous un autre attribut canonique lorsqu'il existe et que son rattachement est démontrable ;
- sinon produire une anomalie `RATTACHEMENT_AMBIGU` ou `ATTRIBUT_NON_CAPTABLE`.

## Absence

L'absence d'information dans un document signifie `Inconnu`.

Elle ne produit jamais automatiquement `Non`, `0`, une modalité par défaut ou la copie d'une valeur provenant d'un autre objet.

## Valeurs explicites, déduites, proxy et enrichies

Les modes d'identification autorisés sont :
- `EXPLICITE` ;
- `DEDUIT` ;
- `PROXY` ;
- `ENRICHI`.

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

La validation humaine des observations ne fait pas partie de la captation IA.

L'IA ne produit jamais de statut métier de validation et ne choisit jamais une observation comme valeur de référence.
