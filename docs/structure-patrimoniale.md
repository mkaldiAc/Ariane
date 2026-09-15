# ARIANE — Référentiel normatif de structure patrimoniale

Version : 1.1.0

## 1. Objet

Cette spécification définit les règles à respecter pour construire une structure patrimoniale ARIANE à partir de plans, pièces graphiques, documents techniques, bases de données ou autres sources documentaires.

L'objectif est d'obtenir une représentation homogène, lisible et exploitable du patrimoine, destinée ensuite à accueillir des données attributaires.

Le modèle comprend une racine de contexte `PROGRAMME`, puis une hiérarchie physique à partir du niveau `FONCIER`.

L'IA ne doit pas créer sa propre ontologie. Elle doit utiliser exclusivement les objets, relations et règles définis ici.

## 2. Principe fondamental

`PROGRAMME` est l'objet racine du référentiel ARIANE. Il représente l'opération immobilière dans son ensemble et peut porter des informations générales telles que la dénomination du programme.

À partir du niveau `FONCIER`, la hiérarchie doit répondre en priorité à la question : **où cet objet se situe-t-il physiquement dans le patrimoine ?**

Une relation parent/enfant sous `FONCIER` représente donc d'abord une relation physique de contenance, d'appartenance ou de dépendance spatiale.

Les relations d'affectation, d'usage, de desserte ou d'implantation cadastrale sont complémentaires et ne remplacent jamais le parent physique.

## 3. Structure de référence

```text
PROGRAMME
└── FONCIER
    ├── PARCELLE
    └── RÉSIDENCE
        ├── BÂTIMENT
        │   ├── ENTRÉE / HALL
        │   ├── CAGE D'ESCALIER
        │   │   └── ZONE DE CIRCULATION
        │   ├── ZONE DE CIRCULATION
        │   ├── LOGEMENT
        │   │   ├── PIÈCE
        │   │   └── ESPACE EXTÉRIEUR PRIVATIF
        │   ├── LOCAL D'ACTIVITÉ / COMMERCE
        │   │   ├── PIÈCE
        │   │   └── ESPACE EXTÉRIEUR PRIVATIF
        │   ├── LOCAL POUBELLES
        │   ├── LOCAL VÉLOS
        │   ├── CAVE
        │   ├── DÉPENDANCE
        │   ├── LOCAL TECHNIQUE
        │   └── ZONE DE STATIONNEMENT INTÉRIEURE
        │       └── PLACE DE STATIONNEMENT
        └── ESPACE EXTÉRIEUR DE RÉSIDENCE
            ├── ESPACE VÉGÉTALISÉ
            ├── ZONE DE CIRCULATION EXTÉRIEURE
            ├── AIRE DE JEUX
            └── ZONE DE STATIONNEMENT EXTÉRIEURE
                └── PLACE DE STATIONNEMENT
```

Cette arborescence présente les parcours principaux. Le rattachement réel doit toujours suivre le parent physique le plus précis démontrable à partir du niveau `FONCIER`.

## 4. Référentiel des objets

| Code | Objet | Définition |
|---|---|---|
| PRG | Programme | Opération immobilière globale servant de racine de contexte et pouvant porter des attributs généraux |
| FON | Foncier | Périmètre foncier patrimonial dépendant d'un programme |
| PAR | Parcelle | Parcelle cadastrale composant tout ou partie du foncier |
| RES | Résidence | Ensemble immobilier géré comme une même opération patrimoniale |
| BAT | Bâtiment | Construction physiquement identifiable : immeuble, maison, bâtiment technique, parking construit, etc. |
| HAL | Entrée / Hall | Espace d'accès principal ou secondaire au bâtiment |
| CAG | Cage d'escalier | Ensemble physique organisant principalement une circulation verticale |
| CIR | Zone de circulation | Espace intérieur de distribution horizontale ou locale |
| LOG | Logement | Unité physique destinée à l'habitation |
| PIE | Pièce | Espace constitutif d'un logement ou d'un local d'activité |
| LOC | Local d'activité / commerce | Unité physique dédiée à une activité non résidentielle |
| EXP | Espace extérieur privatif | Jardin, terrasse, cour ou autre espace extérieur physiquement dépendant d'un logement ou d'un local |
| LPO | Local poubelles | Local principalement dédié aux déchets |
| LVE | Local vélos | Local principalement dédié au stationnement des vélos |
| CAV | Cave | Volume individualisé ou identifiable destiné au stockage |
| DEP | Dépendance | Annexe physique ne relevant pas d'une catégorie plus précise |
| LTE | Local technique | Local accueillant principalement des équipements ou installations techniques |
| ZSI | Zone de stationnement intérieure | Zone intérieure organisée pour accueillir une ou plusieurs places de stationnement |
| ZSE | Zone de stationnement extérieure | Zone extérieure organisée pour accueillir des places de stationnement |
| PST | Place de stationnement | Emplacement individuel de stationnement |
| EXT | Espace extérieur de résidence | Ensemble des espaces extérieurs collectifs ou généraux de la résidence |
| VEG | Espace végétalisé | Surface végétalisée collective ou générale |
| CEX | Zone de circulation extérieure | Voirie, cheminement, accès ou circulation extérieure |
| AJE | Aire de jeux | Espace extérieur aménagé destiné aux jeux |

## 5. Programme et foncier

- `PRG` est l'objet racine du référentiel ARIANE.
- `PRG` est un objet de contexte et de regroupement ; il ne représente pas un objet physique en lui-même.
- `PRG` peut porter des informations attributaires générales, par exemple la dénomination du programme.
- Tout `FON` dépend obligatoirement d'un `PRG`.
- Un `PRG` peut comprendre un ou plusieurs `FON`.
- `PAR` dépend de `FON`.
- `RES` dépend de `FON`.
- Une résidence peut être implantée sur une ou plusieurs parcelles via une relation `IMPLANTE_SUR`.
- Une résidence ne doit pas être placée sous une parcelle dans la hiérarchie physique.

## 6. Bâtiments

`BAT` est un objet générique couvrant notamment :

- immeuble collectif ;
- maison individuelle ;
- maison groupée ou mitoyenne ;
- bâtiment technique ;
- bâtiment de stationnement ;
- autre construction identifiable.

`MAISON` et `IMMEUBLE` ne sont jamais des types patrimoniaux. Ils sont des valeurs de caractérisation de `BAT`.

Le même modèle s'applique aux résidences composées :

- uniquement d'un immeuble ;
- d'un immeuble et de maisons ;
- uniquement de maisons.

## 7. Distribution intérieure

Les objets `HAL`, `CAG` et `CIR` servent à décrire la structure de distribution physique.

Une `CIR` peut dépendre :

- d'une `CAG` lorsqu'elle correspond à la distribution d'une cage ;
- directement d'un `BAT` lorsqu'elle n'est pas rattachable à une cage précise.

Les niveaux `RDC`, `R+1`, `R+2`, `SS-1`, etc. sont des localisations et ne sont jamais des objets patrimoniaux.

## 8. Rattachement des espaces intérieurs

Les objets `LOG`, `LOC`, `LPO`, `LVE`, `CAV`, `DEP` et `LTE` sont rattachés au parent physique qui les contient ou les dessert le plus directement.

Exemples possibles :

```text
BAT > CAG > CIR > LOG
BAT > HAL > LVE
BAT > CIR > LTE
BAT > LPO
```

Le parent le plus précis démontrable doit être utilisé, sans inventer de niveau intermédiaire.

## 9. Logements et locaux

Aucun objet `LOT` ne doit exister.

Un logement ou un local est directement un objet patrimonial.

`PIE` dépend obligatoirement de `LOG` ou `LOC`.

`EXP` dépend physiquement de `LOG` ou `LOC` lorsqu'il s'agit d'un jardin, d'une terrasse, d'une cour privative ou d'un autre espace extérieur directement associé.

## 10. Espaces extérieurs de résidence

Les espaces extérieurs collectifs ou généraux dépendent de `EXT`, lui-même rattaché à `RES`.

Sous `EXT`, on peut notamment trouver :

- `VEG` ;
- `CEX` ;
- `AJE` ;
- `ZSE`.

Un jardin ou une terrasse privative ne doit pas être placé sous `EXT` s'il dépend physiquement d'un logement ou d'un local.

## 11. Stationnement

Le modèle distingue explicitement :

- `ZSI` — Zone de stationnement intérieure ;
- `ZSE` — Zone de stationnement extérieure ;
- `PST` — Place de stationnement.

Règles :

```text
BAT > ZSI > PST
RES > EXT > ZSE > PST
```

Une place ne doit jamais être directement rattachée à `BAT`, `EXT`, `LOG` ou `LOC`.

Le caractère `Box fermé`, `Ouvert`, `Couvert`, `PMR`, `Électrifié`, etc. est une caractéristique de `PST` et non un type patrimonial.

Une affectation à un logement ou un local est une relation complémentaire `AFFECTE_A` et ne modifie pas le parent physique de la place.

## 12. Locaux techniques

Tous les locaux techniques utilisent le type `LTE`.

Leur fonction est une caractéristique, par exemple :

- Chaufferie ;
- Sous-station de chauffage ;
- Local électrique / TGBT ;
- Local gaz ;
- Local eau ;
- Local VMC / ventilation ;
- Local SSI ;
- Local télécom / courants faibles ;
- Machinerie ascenseur ;
- Local pompes / relevage ;
- Local maintenance ;
- Autre local technique.

Une chaufferie ne doit donc jamais devenir un nouveau type patrimonial.

Si le local technique est contenu dans une construction indépendante, créer d'abord un `BAT` de type bâtiment technique, puis le `LTE`.

## 13. Relations complémentaires

Les relations non hiérarchiques peuvent notamment être :

- `IMPLANTE_SUR` ;
- `AFFECTE_A` ;
- `UTILISE_PAR` ;
- `DESSERT`.

Elles ne remplacent jamais le parent physique principal.

## 14. Objets interdits

Les catégories suivantes sont interdites :

- `LOT` ;
- `PCM` / `PARTIE COMMUNE` ;
- `MAISON` comme type patrimonial ;
- `IMMEUBLE` comme type patrimonial ;
- `BOX` comme objet ;
- `CHAUFFERIE` comme type patrimonial ;
- `ÉTAGE`, `RDC`, `R+1`, etc. comme objets ;
- `PARKING` générique ;
- `STATIONNEMENT` générique.

L'IA ne doit pas inventer un nouveau type pour résoudre un cas ambigu.

## 15. Règle de précision maximale démontrable

À partir du niveau `FON`, toujours préférer le parent physique le plus précis lorsque celui-ci est démontrable.

Exemple préféré :

```text
BAT > CAG-A > CIR-A-R1 > LOG-101
```

plutôt que :

```text
BAT > LOG-101
```

si la cage et la circulation sont identifiables.

En revanche, ne jamais inventer une cage ou une circulation absente ou incertaine.

**Principe : niveau de détail maximal démontrable, jamais niveau de détail maximal imaginable.**

## 16. Incertitudes

En cas d'incertitude :

1. créer l'objet si son existence est suffisamment établie ;
2. utiliser le parent le plus sûr ;
3. conserver la source ;
4. indiquer un niveau de confiance ;
5. documenter ce qui reste à vérifier ;
6. ne jamais inventer une relation non démontrée.

Niveaux de confiance recommandés :

- `Confirmé` ;
- `Probable` ;
- `À vérifier`.

## 17. Traçabilité documentaire

Chaque objet ou information capté à partir d'un document doit conserver, lorsque disponible :

- le document source ;
- la page, feuille ou plan ;
- la référence source ;
- l'élément constaté ;
- le mode d'identification (`Explicite` ou `Déduit`) ;
- le niveau de confiance.

## 18. Contrôles conceptuels minimaux

Avant de considérer une structure comme exploitable, vérifier au minimum :

1. `PRG` existe comme racine ;
2. tout `FON` dépend d'un `PRG` ;
3. aucun `LOT` ou `PCM` n'a été créé ;
4. `PAR` et `RES` dépendent de `FON` ;
5. tout `BAT` dépend de `RES` ;
6. aucune maison ou immeuble n'est créé comme type distinct de `BAT` ;
7. aucun étage n'est un objet ;
8. toute `PIE` dépend de `LOG` ou `LOC` ;
9. tout `EXP` dépend de `LOG` ou `LOC` ;
10. toute `PST` dépend de `ZSI` ou `ZSE` ;
11. toute `ZSI` appartient à un `BAT` ;
12. toute `ZSE` appartient à `EXT` ;
13. tous les locaux techniques utilisent `LTE` ;
14. toute incertitude est explicitement documentée.

## 19. Principe final

En cas de doute, appliquer dans cet ordre :

1. Identifier le programme de rattachement.
2. Décrire ce qui existe physiquement à partir du foncier.
3. Utiliser uniquement les types patrimoniaux autorisés.
4. Rattacher chaque objet au parent le plus précis démontrable.
5. Séparer structure physique, caractéristiques, localisation et relations fonctionnelles.

La fidélité au référentiel ARIANE prime sur toute interprétation libre du document source.
