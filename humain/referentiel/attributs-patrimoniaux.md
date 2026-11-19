# ARIANE — Référentiel attributaire

Protocole ARIANE : **1.4.0** (révision du catalogue attributaire : **1.3.3**).

Référence normative : [`ia/referentiel/attributs/index.yaml`](../../ia/referentiel/attributs/index.yaml), qui déclare **278 attributs canoniques**.

## Finalité

Le référentiel attributaire ARIANE définit les données pouvant être captées dans les documents et leur rattachement aux objets patrimoniaux.

Le catalogue machine-readable de référence utilisé par l'IA est situé dans `ia/referentiel/attributs/`.

## Principes

- Une valeur captée est rattachée à un seul objet patrimonial concret.
- Un attribut est défini par son identifiant canonique, son libellé, son type de donnée, son unité et les types d'objets autorisés.
- L'existence d'un objet appartient à la structure et ne doit pas être dupliquée par un attribut redondant.
- Les localisations et les relations ne doivent pas être transformées en attributs.
- L'absence d'information signifie `Inconnu`, jamais automatiquement `Non` ou `0`.
- Les valeurs calculées, déduites, utilisées comme proxy ou issues d'un enrichissement sont distinguées des valeurs explicites.

## Modèle d'observation

ARIANE ne considère pas qu'un couple `objet + attribut` possède une valeur unique.

Chaque information trouvée dans un document produit une **observation distincte** comprenant notamment :

- le programme ;
- la campagne de captation ;
- le document source ;
- l'objet patrimonial ;
- l'attribut canonique ;
- la valeur brute ;
- la valeur normalisée éventuelle ;
- l'unité ;
- la page, le plan ou le repère ;
- le mode de captation ;
- le score de confiance de l'IA.

Deux documents donnant des valeurs différentes pour le même attribut du même objet produisent donc deux observations conservées simultanément.

## Captation cumulative

Pour un programme donné :

1. le premier jeu documentaire permet de construire une structure et de produire les premières observations ;
2. après validation externe de la structure, celle-ci est figée ;
3. chaque jeu documentaire suivant produit de nouvelles observations et relations sur la structure validée ;
4. un objet nouveau démontré peut être conservé comme `CANDIDAT_STRUCTURE`, avec ses observations et relations dans une CAPTURE, sans entrer dans CURRENT avant une validation humaine explicite de la structure ;
5. aucune observation antérieure n'est écrasée et aucune CAPTURE historique n'est réécrite.

La sélection ultérieure d'une observation faisant foi relève de la base de données et du processus métier aval, pas de l'IA.

## Décisions importantes intégrées au référentiel

- `mode_financement` est porté par `LOG`.
- `numero_lot_edd` est autorisé sur `LOG`, `LOC`, `CAV`, `DEP`, `PST` sans création d'un objet `LOT`.
- `repere_source` conserve uniquement une désignation explicitement portée par la source et attribuable sans ambiguïté à l'objet. Il est distinct de `source_anchor`, qui localise la preuve documentaire ; il n'est jamais fabriqué à partir d'un identifiant ARIANE.
- les surfaces de sol, plafond et murs sont portées par `HAL`, `CAG`, `CIR` ; des agrégats `BAT` existent, avec `RES` uniquement comme exception documentaire.
- un proxy surface de sol → surface de plafond est autorisé sous conditions et doit être tracé.
- les tantièmes de charges générales sont séparés entre numérateur et base de répartition.
- les coordonnées X/Y sont exprimées en Lambert-93 / EPSG:2154 et obtenues depuis l'adressage.
- les risques sont captés séparément au niveau `RES`.
- les installations électriques, plomberie et sanitaire disposent de définitions distinctes.

Le détail des arbitrages est conservé dans `humain/decisions/journal-arbitrages-attributs.md`.