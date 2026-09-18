# ARIANE — Règles IA de captation attributaire

Version : 1.3.3

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

## Règle stricte — `repere_source`

`repere_source` conserve la désignation que la source utilise effectivement pour identifier ou repérer l'objet observé dans son contexte documentaire.

Une observation `repere_source` est autorisée uniquement si **toutes** les conditions suivantes sont satisfaites :
1. la valeur apparaît explicitement dans la source ; `value_raw` reprend le texte source ;
2. la preuve est localisable par `source_id`, `page_or_plan` et/ou `source_anchor` ;
3. le rattachement graphique, spatial ou textuel entre cette valeur et l'objet est suffisamment direct et non ambigu ;
4. le texte joue dans la source un rôle de désignation ou de repérage de l'objet, et non seulement de caractéristique, de commentaire ou de description ;
5. aucune anomalie non résolue ne remet en cause le rattachement de cette occurrence à l'objet.

Pour `repere_source`, le seul `identification_mode` autorisé est `EXPLICITE`. Il est interdit de produire un `repere_source` en mode `DEDUIT`, `PROXY` ou `ENRICHI`.

Sont notamment interdits comme `repere_source` :
- un label, nom ou numéro construit par l'IA pour les besoins de la structure ;
- une valeur dérivée de l'`object_id` ou utilisée pour fabriquer rétrospectivement une preuve ;
- une phrase descriptive générale de l'opération ou du programme ;
- une caractéristique technique, un état, un matériau, une accessibilité, une surface, une dimension ou toute autre qualification qui ne sert pas elle-même de désignation de l'objet ;
- un texte simplement voisin de l'objet sans lien documentaire démontrable ;
- un texte dont le rattachement est contradictoire ou ambigu.

Exemples de captation recevable lorsque le rattachement est explicite : `Jardin 003` pour l'espace extérieur correspondant, `001 (T4)` pour le logement correspondant, `Hall 1` pour le hall correspondant, `Chambre 1` pour la pièce correspondante.

Exemples non recevables : `terrasse non-accessible` utilisé comme repère d'un bâtiment ; `Construction de 22 logements collectifs` utilisé comme repère du programme. Ces textes peuvent constituer une preuve ou alimenter un autre attribut canonique, mais ils ne désignent pas nécessairement l'objet.

Un libellé fonctionnel générique, par exemple `Ordures ménagères`, peut être un `repere_source` uniquement si la source l'utilise clairement pour désigner l'espace correspondant et si le rattachement physique est cohérent. Si la même zone présente des indices contradictoires ou un autre usage, ne pas produire l'observation `repere_source` et créer une anomalie.

En cas de doute :
- ne pas produire l'observation `repere_source` ;
- conserver le texte dans `source_anchor` si cela aide à localiser la preuve ;
- capter l'information sous un autre attribut canonique lorsqu'il existe et que son rattachement est démontrable ;
- sinon produire une anomalie `RATTACHEMENT_AMBIGU` ou `ATTRIBUT_NON_CAPTABLE`.

Une occurrence qui fait l'objet d'une anomalie de rattachement non résolue ne peut pas simultanément être utilisée comme `repere_source` de l'objet litigieux.

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