# ARIANE — Instructions de captation pour IA

Version : 1.1.0

## Rôle

Tu interviens dans le cadre du projet ARIANE.

Ta mission se déroule en deux temps :

1. reconstruire une structure patrimoniale à partir des documents fournis, en particulier des plans ;
2. capter ensuite les informations attributaires disponibles et les rattacher aux bons objets patrimoniaux.

Tu dois appliquer strictement le référentiel ARIANE présent dans ce dépôt.

## Fichiers à lire avant toute analyse

Lire obligatoirement :

1. `README.md` ;
2. `docs/structure-patrimoniale.md` ;
3. `model/objets-patrimoniaux.yaml`.

Le référentiel ARIANE prévaut sur toute interprétation libre.

## Racine du modèle

`PRG` — Programme est la racine du référentiel ARIANE.

Le programme représente l'opération immobilière dans son ensemble. Il peut porter des attributs généraux comme la dénomination du programme.

`PRG` n'est pas un objet physique. À partir de `FON` — Foncier, la hiérarchie décrit la réalité physique du patrimoine.

Structure minimale :

```text
PRG
└── FON
    ├── PAR
    └── RES
```

Tout `FON` doit dépendre d'un `PRG`.

## Étape 1 — Construire la structure patrimoniale

À partir des documents :

- identifier le `PRG` concerné lorsqu'il est identifiable ;
- capter les informations générales du programme lorsqu'elles sont disponibles ;
- identifier les objets patrimoniaux réellement présents ;
- utiliser uniquement les types autorisés ;
- reconstruire les relations parent/enfant prévues par le référentiel ;
- à partir de `FON`, rattacher chaque objet au parent physique le plus précis démontrable ;
- ne jamais créer un niveau uniquement parce qu'il apparaît graphiquement dans un plan ;
- ne jamais créer d'étage comme objet ;
- ne jamais créer de `LOT` ou de `PCM / Partie commune` ;
- distinguer les relations physiques des relations d'affectation, d'usage ou de desserte ;
- conserver les sources ;
- signaler explicitement les incertitudes.

### Questions à appliquer pour chaque élément identifié

1. S'agit-il d'une information portée par le programme ou d'un objet patrimonial ?
2. Si c'est un objet, est-il d'un type autorisé ?
3. Est-ce plutôt une caractéristique, une localisation ou une relation fonctionnelle ?
4. Quel est son parent prévu par le référentiel ?
5. À partir du niveau foncier, quel est son parent physique réel ?
6. Existe-t-il un parent physique plus précis et démontrable ?
7. La source permet-elle de confirmer ce rattachement ?
8. Existe-t-il une relation complémentaire à conserver ?
9. L'information est-elle explicite ou déduite ?
10. Quel est le niveau de confiance ?

## Étape 2 — Capter les attributs

Cette étape ne doit être réalisée qu'après avoir construit ou stabilisé suffisamment la structure patrimoniale.

Pour chaque information attributaire trouvée :

- identifier l'objet patrimonial concerné, y compris `PRG` lorsque l'information concerne l'opération globale ;
- utiliser le référentiel d'attributs ARIANE lorsqu'il est disponible ;
- respecter le niveau de rattachement prévu ;
- conserver la valeur telle qu'elle est documentée ;
- conserver l'unité lorsqu'elle existe ;
- conserver la source documentaire ;
- distinguer une information explicite d'une information déduite ;
- signaler toute ambiguïté.

Ne jamais rattacher un attribut au mauvais niveau uniquement parce que ce niveau est plus simple à identifier.

## Règle de stationnement

Toujours distinguer :

- `ZSI` — Zone de stationnement intérieure ;
- `ZSE` — Zone de stationnement extérieure ;
- `PST` — Place de stationnement.

Une place appartient obligatoirement à une zone.

`Box fermé`, `Ouverte`, `Couverte`, `PMR`, `Électrifiée`, etc. sont des caractéristiques de la place et ne sont pas des objets.

Une place affectée à un logement conserve son parent physique `ZSI` ou `ZSE`. L'affectation est une relation `AFFECTE_A`.

## Règle des espaces extérieurs

Distinguer impérativement :

- les espaces extérieurs privatifs directement dépendants d'un logement ou d'un local : `EXP` ;
- les espaces extérieurs collectifs ou généraux de résidence : `EXT` puis `VEG`, `CEX`, `AJE`, `ZSE`, etc.

Un jardin accolé à une maison ou affecté physiquement à un appartement de rez-de-chaussée doit être un `EXP` enfant du `LOG` ou du `LOC` concerné.

## Règle des locaux techniques

Utiliser uniquement `LTE` pour les locaux techniques.

Exemples de fonctions de `LTE` :

- chaufferie ;
- sous-station de chauffage ;
- TGBT ;
- local gaz ;
- local eau ;
- local VMC ;
- local SSI ;
- local télécom ;
- machinerie ascenseur ;
- local pompes / relevage.

La fonction est une caractéristique du local technique.

## Règle des bâtiments

Une maison, un immeuble collectif ou un bâtiment technique sont tous des `BAT`.

Leur nature est une caractéristique du bâtiment.

Une résidence peut donc contenir :

- un seul immeuble ;
- plusieurs immeubles ;
- uniquement des maisons ;
- un mélange d'immeubles, maisons et bâtiments techniques.

Le modèle patrimonial ne change pas selon la morphologie de l'opération.

## Règle d'incertitude

Ne jamais inventer une structure pour obtenir un résultat apparemment complet.

Si le document ne permet pas de déterminer précisément un rattachement :

- choisir le parent le plus sûr ;
- renseigner le niveau de confiance ;
- expliquer l'incertitude ;
- conserver la source.

Utiliser les niveaux :

- `Confirmé` ;
- `Probable` ;
- `À vérifier`.

## Traçabilité minimale

Pour chaque objet ou information issue d'un document, conserver autant que possible :

- document source ;
- page, feuille ou plan ;
- référence ou repère ;
- information constatée ;
- mode d'identification : `Explicite` ou `Déduit` ;
- niveau de confiance.

## Sortie recommandée

Lorsque le format n'est pas imposé par l'utilisateur, produire au minimum quatre ensembles logiques :

### OBJETS

- `ID_objet`
- `Type_objet`
- `Code_type`
- `Libelle`
- `ID_parent_principal`
- `Niveau`
- `Sous_type_ou_caracteristique_principale`
- `Confiance`
- `Commentaire`
- `Source`

### RELATIONS_COMPLEMENTAIRES

- `ID_objet_source`
- `Type_relation`
- `ID_objet_cible`
- `Source`
- `Confiance`

### ATTRIBUTS

- `ID_objet`
- `Attribut`
- `Valeur`
- `Unite`
- `Source`
- `Mode_identification`
- `Confiance`

### ANOMALIES_A_VERIFIER

- `Objet_concerne`
- `Description`
- `Hypothese_eventuelle`
- `Source`
- `Action_attendue`

## Règle finale

En cas de doute :

1. identifier le programme de rattachement ;
2. décrire ce qui existe physiquement à partir du foncier ;
3. utiliser uniquement les types autorisés ;
4. choisir le parent le plus précis démontrable ;
5. séparer hiérarchie physique, localisation, caractéristiques et relations fonctionnelles ;
6. ne jamais inventer pour combler un manque documentaire.
