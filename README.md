# ARIANE

## Finalité du dépôt

Ce dépôt est la **source de référence normative du projet ARIANE** pour les travaux de captation de données patrimoniales assistés par IA.

Le projet poursuit deux objectifs successifs et complémentaires :

1. **Construire une structure patrimoniale** à partir de l'analyse de documents, en particulier de plans architecturaux et techniques.
2. **Capter des informations attributaires** dans ces mêmes documents ou dans d'autres sources, puis les rattacher aux objets de la structure patrimoniale ainsi constituée.

Une IA utilisant ce dépôt ne réalise donc pas une simple extraction de texte. Elle doit reconstruire un patrimoine selon une ontologie et des règles précises, puis rattacher les données captées aux bons objets patrimoniaux.

## Principe fondamental

La structure ARIANE comporte désormais une racine de contexte :

```text
PROGRAMME [PRG]
└── FONCIER [FON]
    ├── PARCELLE [PAR]
    └── RÉSIDENCE [RES]
        └── ...
```

`PROGRAMME` représente l'opération immobilière dans son ensemble. Il peut porter des informations attributaires générales telles que la dénomination du programme. Il ne constitue pas en lui-même un objet physique.

À partir du niveau `FONCIER`, la hiérarchie répond d'abord à la question :

> **Où cet objet se situe-t-il physiquement dans le patrimoine ?**

Sous `FONCIER`, la hiérarchie représente en priorité une relation physique de contenance, d'appartenance ou de dépendance spatiale.

Les notions d'affectation, d'usage, de desserte ou d'implantation cadastrale sont des relations complémentaires et ne doivent pas déformer la hiérarchie physique.

## Chaîne de traitement attendue

### Étape 1 — Construction de la structure patrimoniale

À partir des documents fournis, l'IA doit :

- identifier le `PROGRAMME` concerné et ses informations générales lorsqu'elles sont disponibles ;
- identifier les objets patrimoniaux réellement présents ;
- utiliser exclusivement les types définis par le référentiel ARIANE ;
- reconstruire les relations parent/enfant prévues par le modèle ;
- à partir du `FONCIER`, rattacher les objets selon leur réalité physique ;
- distinguer les objets des simples localisations, caractéristiques ou relations fonctionnelles ;
- conserver la source documentaire de chaque information ;
- signaler les incertitudes sans inventer de structure.

Les règles applicables sont décrites dans :

- `docs/structure-patrimoniale.md`
- `model/objets-patrimoniaux.yaml`
- `prompts/regles-captation.md`

### Étape 2 — Captation des attributs

Une fois la structure patrimoniale stabilisée, l'IA doit :

- rechercher les attributs présents dans les documents ;
- rattacher chaque attribut à l'objet patrimonial approprié, y compris `PROGRAMME` lorsque l'information concerne l'opération dans son ensemble ;
- respecter le niveau de rattachement prévu par le référentiel attributaire ;
- conserver la valeur, l'unité, la source et le niveau de confiance ;
- ne jamais créer un attribut non prévu sans le signaler explicitement.

Le référentiel détaillé des attributs sera ajouté progressivement au dépôt.

## Périmètre documentaire

Les sources analysées peuvent notamment être :

- plans de masse ;
- plans de niveaux ;
- plans de sous-sol ;
- coupes ;
- façades ;
- plans de stationnement ;
- notices architecturales ;
- notices techniques ;
- tableaux de surfaces ;
- documents APD, PRO, DOE ou équivalents ;
- autres documents patrimoniaux structurés ou non structurés.

Les plans constituent une source particulièrement importante car ils permettent de reconstruire la structure physique du patrimoine.

## Règles structurantes actuelles

Le modèle ARIANE s'appuie notamment sur les principes suivants :

- `PROGRAMME` est l'objet racine du référentiel ;
- `PROGRAMME` est un objet de contexte et de regroupement, qui peut porter des attributs généraux de l'opération ;
- tout `FONCIER` dépend d'un `PROGRAMME` ;
- un `PROGRAMME` peut comprendre un ou plusieurs `FONCIERS` ;
- `PARCELLE` et `RÉSIDENCE` dépendent du foncier ;
- une résidence peut être implantée sur plusieurs parcelles via une relation complémentaire ;
- `BÂTIMENT` représente indifféremment un immeuble, une maison, un bâtiment technique ou un bâtiment de stationnement ;
- `LOT` est interdit ;
- `PCM / PARTIE COMMUNE` est interdit ;
- les étages (`RDC`, `R+1`, `SS-1`...) sont des localisations, jamais des objets patrimoniaux ;
- `ENTRÉE / HALL`, `CAGE D'ESCALIER` et `ZONE DE CIRCULATION` décrivent la distribution physique intérieure ;
- les logements, locaux, caves, dépendances, locaux poubelles, locaux vélos et locaux techniques sont rattachés au parent physique le plus précis démontrable ;
- un espace extérieur privatif dépend physiquement d'un logement ou d'un local ;
- les espaces extérieurs collectifs dépendent d'un `ESPACE EXTÉRIEUR DE RÉSIDENCE` ;
- les stationnements sont structurés par `ZONE DE STATIONNEMENT INTÉRIEURE` ou `ZONE DE STATIONNEMENT EXTÉRIEURE`, puis `PLACE DE STATIONNEMENT` ;
- `Box`, `ouvert`, `couvert`, `PMR`, `électrifié`, etc. sont des caractéristiques d'une place, pas des types patrimoniaux ;
- les chaufferies, sous-stations, TGBT, locaux VMC, etc. sont des `LOCAUX TECHNIQUES` caractérisés par leur type.

## Règle de précision

À partir du niveau `FONCIER`, l'IA doit toujours chercher le **parent physique le plus précis démontrable par les sources**, sans inventer de niveau de détail.

> Niveau de détail maximal démontrable, jamais niveau de détail maximal imaginable.

## Traçabilité

Toute information captée doit pouvoir être reliée à sa source documentaire.

À minima, conserver lorsque disponible :

- document source ;
- page, feuille ou plan ;
- référence ou repère ;
- élément constaté ;
- caractère explicite ou déduit ;
- niveau de confiance.

## Utilisation par une IA

Avant toute captation, une IA doit lire au minimum :

1. ce `README.md` ;
2. `docs/structure-patrimoniale.md` ;
3. `model/objets-patrimoniaux.yaml` ;
4. `prompts/regles-captation.md`.

En cas de divergence entre une interprétation libre et le référentiel ARIANE, **le référentiel ARIANE prévaut**.

## Gouvernance du dépôt

Ce dépôt constitue la source de vérité du projet ARIANE pour les règles de captation.

Les évolutions du modèle doivent être explicites, documentées et versionnées.

Version courante : voir le fichier `VERSION`.
