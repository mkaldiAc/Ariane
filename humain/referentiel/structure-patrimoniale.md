# ARIANE — Structure patrimoniale de référence

Version : 1.3.4

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

Si un jeu documentaire ultérieur révèle un objet absent ou une incohérence, l'IA produit une anomalie. Toute évolution éventuelle de la structure est une décision de gouvernance externe à la captation IA.