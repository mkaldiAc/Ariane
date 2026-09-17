# ARIANE — Référentiel d'attributs patrimoniaux

Version : 1.2.0  
Date de consolidation : 2026-09-17  
Référentiel de structure utilisé : ARIANE 1.1.0

## 1. Objet

Ce document formalise la doctrine attributaire ARIANE après confrontation des **345 besoins historiques** avec la structure patrimoniale normalisée et après arbitrages métier.

La refonte aboutit à **278 attributs canoniques validés**, sans arbitrage métier restant ouvert. Les anciens identifiants `ATT-xxxx` restent des références historiques de migration ; ils ne constituent plus le dictionnaire de captation cible.

## 2. Principes de normalisation

1. Une valeur captée est toujours rattachée à **un seul objet patrimonial concret**.
2. Un attribut canonique vise par défaut **un seul type d'objet**.
3. Un multi-rattachement n'est accepté que lorsque la sémantique de l'attribut reste strictement identique entre les objets autorisés.
4. L'existence d'un objet est décrite par la structure ; elle n'est pas dupliquée par un booléen attributaire.
5. `RDC`, `R+1`, `SS-1`, etc. sont des localisations, pas des attributs patrimoniaux.
6. Les affectations d'annexes et les servitudes sont des relations, pas des attributs.
7. `LOT` et `PCM` ne sont jamais utilisés comme cibles ; les informations sont redistribuées vers les objets ARIANE autorisés.
8. L'absence d'information dans un document signifie `Inconnu` et ne produit jamais automatiquement `Non`, `0` ou une modalité par défaut.
9. Une valeur calculée, dérivée ou obtenue par proxy est marquée `Déduit` et conserve la règle de calcul ou de proxy.
10. Pour les données physiques agrégées, le niveau physique le plus précis prévaut. Le niveau `RES` n'est admis qu'exceptionnellement lorsqu'une source agrège plusieurs bâtiments sans ventilation fiable.

## 3. Transformations structurantes

- Les anciennes colonnes `T1`, `T1 bis`, `T2`, `T3`, `T4`, `T5` deviennent une seule propriété `typologie_logement` de `LOG`.
- `Salon`, `Cuisine`, `Salle de bain`, `WC`, `Chambre`, etc. deviennent des valeurs de `type_piece` sur `PIE`.
- `Balcon`, `Loggia`, `Jardin`, `Terrasse` sont des `EXP` ; leur nature caractérise l'objet et leur surface est un attribut de `EXP`.
- `Étage` sort du référentiel attributaire : il s'agit d'une localisation.
- Les familles de financement sont regroupées dans `mode_financement`, porté **uniquement par `LOG`**.
- Les sous-types de chauffage et de ventilation deviennent des nomenclatures et non des batteries de booléens.
- Les données propres à une chaufferie sont portées par `LTE` lorsque le local technique est identifié.
- Les informations globales de l'opération (MOA, permis, agréments, intervenants globaux) sont portées par `PRG` lorsque leur portée est celle du programme.

## 4. Surface habitable et surface de pièce

L'ancien `ATT-0086 — Surface Habitable Lot` mélangeait deux sémantiques. Il est scindé :

- `surface_habitable_logement` sur `LOG`, uniquement lorsque la source qualifie explicitement la valeur comme surface habitable / SH ;
- `surface_piece` sur `PIE` lorsqu'une valeur surfacique est associée à une pièce.

Une même valeur ne doit jamais être copiée dans les deux attributs.

## 5. Installations électriques

`ATT-0171` et `ATT-0172` sont fusionnés dans :

### `presence_installation_electrique_distribution`

**Libellé :** Présence d'une installation électrique de distribution.

**Définition :** présence d'une installation électrique locale comprenant au minimum un tableau électrique de répartition/distribution et les circuits qui lui sont rattachés pour alimenter l'objet concerné.

**Objets autorisés :** `LOG`, `LOC`, `LTE`, `BAT`, `HAL`, `CAG`, `CIR`.

**Règle :** rattacher à l'objet réellement desservi, et non automatiquement à l'espace dans lequel le tableau est physiquement implanté. `LOG` est le cas principal pour l'installation propre au logement. `LTE` convient à une distribution portée par un local technique. `BAT` convient à une distribution générale non rattachable plus précisément. `HAL`, `CAG` ou `CIR` ne sont utilisés que si l'installation dessert spécifiquement cet espace.

La présence de prises, luminaires ou équipements électriques ne suffit pas à elle seule à conclure à la présence de cette installation.

## 6. Plomberie et sanitaire

### `presence_installation_plomberie`

**Objet :** `LOG`.

Présence d'un réseau intérieur de distribution d'eau et d'évacuation desservant les équipements sanitaires ou techniques du logement.

La présence d'un appareil sanitaire seul ne suffit pas à décrire le réseau.

### `presence_installation_sanitaire`

**Objet :** `LOG`.

Présence d'au moins un ensemble d'équipements sanitaires destinés aux usages d'hygiène ou d'eau domestique : WC, lavabo, douche, baignoire, évier, etc.

La seule présence d'une canalisation ne suffit pas à conclure à l'installation sanitaire.

Ces deux attributs sont volontairement distincts.

## 7. Clause d'autonomie juridique

L'ancien `ATT-0217 — Clause d'autonomie` devient :

### `presence_clause_autonomie_juridique`

**Objet principal :** `BAT`.

Indique qu'un document juridique ou contractuel applicable au bâtiment contient une clause établissant explicitement son autonomie juridique, fonctionnelle ou de gestion au sein d'un ensemble immobilier.

La captation doit reposer sur une mention explicite dans un acte, règlement, convention, EDD/EDDV ou document juridique assimilé. Une autonomie technique constatée ne permet jamais de déduire la clause juridique.

## 8. Coordonnées géographiques

L'ancien `ATT-0341 — Coordonnées X/Y` devient deux attributs :

- `coordonnee_x_lambert93` ;
- `coordonnee_y_lambert93`.

**Objet :** `BAT`.

Convention ARIANE : **Lambert-93 / EPSG:2154**.

Les coordonnées sont déterminées **à partir de l'adressage de référence du bâtiment**, par géocodage. Elles ne correspondent pas à un centroïde géométrique calculé sur l'emprise du bâtiment.

La traçabilité doit conserver l'adresse utilisée ainsi que la source ou le service de géocodage.

## 9. Risques naturels et technologiques

L'ancien `ATT-0343 — Secteur météo / Géorisque` est scindé.

La composante `secteur météo / zone climatique` est **supprimée**, sa sémantique métier n'étant plus suffisamment connue.

Les risques sont conservés comme attributs distincts portés par `RES`, notamment :

- `risque_inondation` ;
- `risque_retrait_gonflement_argiles` ;
- `risque_radon` ;
- `risque_sismique` ;
- `risque_mouvement_terrain` ;
- autres risques spécifiques si le dictionnaire les prévoit.

Chaque risque possède sa propre valeur, son niveau ou zonage, sa source et, lorsque disponible, la date/version du référentiel utilisé. Plusieurs risques ne doivent jamais être concaténés dans une même valeur.

## 10. Attribut supprimé pour sémantique insuffisante

`ATT-0100 — PAVE` est supprimé du référentiel canonique. Sa signification métier n'a pas pu être retrouvée avec suffisamment de certitude. Il reste uniquement dans l'historique de migration avec le motif d'exclusion.

## 11. Financement

`mode_financement` est rattaché **uniquement à `LOG`**.

Il peut contenir les catégories de financement ou montages explicitement affectés au logement (`PLAI`, `PLUS`, `PLS`, `PLI`, `PSLA`, `BRS`, etc.).

Ne jamais recopier automatiquement sur un logement un financement global d'opération sans preuve de son affectation.

## 12. Numéro de lot EDD

### `numero_lot_edd`

**Objets autorisés :** `LOG`, `LOC`, `CAV`, `DEP`, `PST`.

Le numéro de lot EDD est un **identifiant juridique externe**. Il ne justifie jamais la création d'un objet `LOT` dans la structure ARIANE.

## 13. Repère source

### `repere_source`

Attribut transversal applicable aux objets patrimoniaux lorsque la source les désigne explicitement par un numéro, code ou repère (`Bât. A`, `Cage 2`, `Logt 103`, `P12`, etc.).

Il est interdit à l'IA d'inventer un repère pour compléter un objet. Le repère ARIANE interne, le numéro de lot EDD et la référence cadastrale restent des notions distinctes.

## 14. Surfaces de sol, plafond et murs dans les espaces communs

Les attributs décrivent **uniquement des surfaces**. Le mot `revêtement` est supprimé car ces attributs ne qualifient pas la nature du matériau.

### 14.1 Niveau détaillé

Trois attributs sont autorisés sur `HAL`, `CAG` et `CIR` :

- `surface_sol` ;
- `surface_plafond` ;
- `surface_murs`.

#### Surface de sol

Une valeur explicite est prioritaire. À défaut, l'IA peut calculer une surface à partir de dimensions explicites, simples et non ambiguës, par exemple longueur × largeur. Le résultat est alors `Déduit`.

Il est interdit de reconstruire librement une surface complexe depuis un plan sans règle de calcul fiable.

#### Surface de plafond

Une valeur explicite est prioritaire. À défaut, la **surface au sol peut être utilisée comme proxy de la surface de plafond** lorsque la géométrie de l'espace rend l'assimilation raisonnable.

Le proxy est interdit ou doit être signalé comme non fiable en présence notamment de :

- vide important ;
- double hauteur ;
- plafond rampant ;
- trémie importante ;
- géométrie manifestement atypique.

Toute valeur issue du proxy est marquée `Déduit` avec commentaire obligatoire.

#### Surface de murs

Une valeur explicite est prioritaire. Une surface peut être calculée à partir d'un périmètre et d'une hauteur fiables. Les ouvertures ne sont retranchées que si leurs dimensions sont explicitement disponibles et si le calcul reste non ambigu.

Aucune hauteur d'étage approximative ne doit être inventée.

### 14.2 Agrégats au bâtiment

Lorsque la source fournit un total non ventilé à l'échelle du bâtiment :

- `surface_sol_espaces_communs_batiment` → `BAT` ;
- `surface_plafond_espaces_communs_batiment` → `BAT` ;
- `surface_murs_espaces_communs_batiment` → `BAT`.

Ces attributs servent à **capter une valeur source explicitement agrégée**. Ils ne doivent pas être calculés automatiquement pendant l'extraction à partir des objets enfants ; les agrégations calculées relèvent d'une couche de calcul distincte.

### 14.3 Agrégats à la résidence — exception

Lorsque la source agrège explicitement plusieurs bâtiments sans ventilation fiable :

- `surface_sol_espaces_communs_residence` → `RES` ;
- `surface_plafond_espaces_communs_residence` → `RES` ;
- `surface_murs_espaces_communs_residence` → `RES`.

Ce rattachement est **exceptionnel et marginal** : une surface d'espaces communs au niveau résidence n'a pas de sens physique homogène. `RES` ne doit jamais être choisi par facilité. Si un rattachement `BAT` est possible, `BAT` prévaut.

## 15. Tantièmes de charges générales

Deux attributs sont distingués :

### `tantieme_charges_generales`

Numérateur de la quote-part de charges générales attribuée à l'objet.

### `base_tantiemes_charges_generales`

Dénominateur de la clé, par exemple `10000` dans `85 / 10000`.

**Objets autorisés pour les deux :** `LOG`, `LOC`, `CAV`, `DEP`, `PST`.

La base ne doit jamais être supposée égale à 10 000 si elle n'est pas documentée. Les tantièmes d'ascenseur, chauffage, bâtiment ou autres clés spécialisées ne doivent jamais être fusionnés avec la clé de charges générales.

## 16. Relations sorties du référentiel attributaire

### Affectation des annexes

L'ancien `ATT-0085` devient une relation `AFFECTE_A`. Les sources possibles sont `PST`, `CAV` et `DEP`, vers `LOG` ou `LOC`.

Cette affectation ne modifie jamais le parent physique principal de l'annexe.

### Servitudes

`ATT-0218 — Servitude foncière` et `ATT-0219 — Servitude bâtiment` sont des relations juridiques. Elles sont décrites dans `docs/relations-juridiques.md`.

## 17. Règle finale

Pour toute information :

1. identifier d'abord l'objet ARIANE concerné ;
2. vérifier que l'information est bien un attribut et non un objet, une localisation ou une relation ;
3. rechercher l'attribut canonique autorisé ;
4. appliquer sa définition et sa règle de rattachement ;
5. rattacher l'occurrence à un seul objet concret ;
6. conserver valeur, unité, source, repère/page, mode `Explicite` ou `Déduit`, confiance et commentaire utile ;
7. si aucun attribut ne correspond sans ambiguïté, produire une anomalie plutôt que forcer la captation.
