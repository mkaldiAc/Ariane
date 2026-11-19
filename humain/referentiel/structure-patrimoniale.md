# ARIANE — Structure patrimoniale de référence

Protocole ARIANE : **1.5.0** (révision du référentiel d'objets : **1.3.4**).

Référence normative : [`ia/referentiel/objets-patrimoniaux.yaml`](../../ia/referentiel/objets-patrimoniaux.yaml).

## Finalité

La structure patrimoniale ARIANE décrit la réalité physique du patrimoine d'un programme immobilier afin de servir de support stable aux données attributaires captées dans les documents.

## Hiérarchie de référence

```text
PROGRAMME [PRG]
└── FONCIER [FON]
    ├── PARCELLE [PAR]
    └── RÉSIDENCE [RES]
        ├── BÂTIMENT [BAT]
        │   ├── ENTRÉE / HALL [HAL]
        │   ├── CAGE D'ESCALIER [CAG]
        │   │   └── ZONE DE CIRCULATION [CIR]
        │   ├── ZONE DE CIRCULATION [CIR]
        │   ├── LOGEMENT [LOG]
        │   │   ├── PIÈCE [PIE]
        │   │   └── ESPACE EXTÉRIEUR PRIVATIF [EXP]
        │   ├── LOCAL D'ACTIVITÉ / COMMERCE [LOC]
        │   ├── LOCAL POUBELLES [LPO]
        │   ├── LOCAL VÉLOS [LVE]
        │   ├── CAVE [CAV]
        │   ├── DÉPENDANCE [DEP]
        │   ├── LOCAL TECHNIQUE [LTE]
        │   └── ZONE DE STATIONNEMENT INTÉRIEURE [ZSI]
        │       └── PLACE DE STATIONNEMENT [PST]
        └── ESPACE EXTÉRIEUR DE RÉSIDENCE [EXT]
            ├── ESPACE VÉGÉTALISÉ [VEG]
            ├── ZONE DE CIRCULATION EXTÉRIEURE [CEX]
            ├── AIRE DE JEUX [AJE]
            └── ZONE DE STATIONNEMENT EXTÉRIEURE [ZSE]
                └── PLACE DE STATIONNEMENT [PST]
```

## Principes

- `PRG` est la racine de contexte.
- À partir de `FON`, la hiérarchie décrit la réalité physique.
- Chaque objet est rattaché au parent physique le plus précis démontrable.
- `LOT`, `PCM`, étage, maison, immeuble, box, chaufferie ou parking générique ne sont pas des types patrimoniaux ARIANE.
- Les relations d'affectation, de desserte, d'usage ou d'implantation sont complémentaires et ne changent jamais le parent physique.

## Priorité de rattachement aux circulations intérieures

La liste des parents autorisés ne constitue pas une liste de choix équivalents.

Lorsqu'un logement, un local ou un autre espace fermé est **directement desservi par une circulation intérieure physique identifiable**, cette circulation `CIR` doit être utilisée comme parent principal. Cette règle traduit le principe général de rattachement au parent physique le plus précis démontrable.

Sont notamment considérés comme des circulations physiques :
- les couloirs ;
- les dégagements ;
- les coursives ;
- les paliers, y compris un simple palier desservant quelques logements ;
- les autres espaces physiques assurant directement la distribution.

Les niveaux `RDC`, `R+1`, `R+2`, `SS-1`, etc. restent des informations de localisation. Ils ne sont pas des objets patrimoniaux et ne doivent pas conduire à créer artificiellement une `CIR`.

Ainsi :

```text
BAT Immeuble
└── CAG Cage
    └── CIR Palier R+1
        ├── LOG 101
        └── LOG 102
```

est attendu lorsqu'un palier physique dessert les logements, tandis que :

```text
BAT Maison individuelle
└── LOG Logement
```

est attendu lorsqu'aucune circulation intérieure intermédiaire n'existe.

## Stabilisation par programme

Le premier jeu documentaire sert à produire une **structure proposée** du programme.

Après validation externe, cette structure devient la structure de référence du programme et reçoit une version stable.

Les captations documentaires ultérieures :
- utilisent cette structure comme référentiel obligatoire ;
- réutilisent les identifiants d'objets existants ;
- ne peuvent jamais la modifier automatiquement.

Si un jeu documentaire ultérieur révèle un objet absent ou une incohérence, l'IA signale une anomalie. Lorsque l'existence d'un objet absent est démontrée, elle peut également le conserver comme `CANDIDAT_STRUCTURE` dans la CAPTURE immuable, avec ses observations et relations en attente de rattachement structurel.

Ce candidat et ses données restent **hors CURRENT**. Seule une décision humaine explicite, matérialisée par l'action `VALIDER_STRUCTURE`, peut produire une nouvelle version `STR-xxx` et promouvoir les données devenues rattachables vers CURRENT. Les captations historiques ne sont jamais modifiées.

La validation humaine des valeurs métier reste un processus distinct, réalisé dans le système aval.

## Propositions de retrait, de déplacement et de réintégration

Depuis ARIANE 1.5.0, la captation peut **proposer** (et non appliquer) un AJOUT, un RETRAIT, un MODIFIER_PARENT ou une REINTEGRATION, conservés en CAPTURE et distingués des anomalies. Un écart de quantité non individualisé porte `A_QUALIFIER` : seul l'humain peut identifier l'objet à retirer.

Après décision humaine explicite, `VALIDER_STRUCTURE` peut exclure un objet de la STR courante, le déplacer vers un parent conforme à `allowed_parents`, ou le restaurer sous son identifiant historique. Toutes les CAPTURE et STR anciennes restent immuables ; les observations redevenues rattachables sont restaurées vers CURRENT.
