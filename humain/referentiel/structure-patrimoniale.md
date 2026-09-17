# ARIANE — Structure patrimoniale de référence

Version : 1.3.0

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

## Stabilisation par programme

Le premier jeu documentaire sert à produire une **structure proposée** du programme.

Après validation externe, cette structure devient la structure de référence du programme et reçoit une version stable.

Les captations documentaires ultérieures :
- utilisent cette structure comme référentiel obligatoire ;
- réutilisent les identifiants d'objets existants ;
- ne peuvent jamais la modifier automatiquement.

Si un jeu documentaire ultérieur révèle un objet absent ou une incohérence, l'IA produit une anomalie. Toute évolution éventuelle de la structure est une décision de gouvernance externe à la captation IA.