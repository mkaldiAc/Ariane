# ARIANE

## Finalité du dépôt

Ce dépôt est la **source de référence du projet ARIANE** pour la reconstruction de la structure patrimoniale et la captation de données attributaires assistées par IA.

La chaîne ARIANE comporte deux étapes indissociables :

1. **Construire la structure patrimoniale** à partir des documents disponibles.
2. **Capter les attributs** et les rattacher aux objets patrimoniaux construits.

Une IA ne doit donc jamais extraire des données sans tenir compte de la structure, de la sémantique des attributs et des règles de rattachement définies dans ce dépôt.

## Version courante

Version ARIANE : **1.2.0**.

La version 1.2.0 consolide :

- le référentiel de structure patrimoniale ;
- le référentiel attributaire issu des 345 besoins historiques ;
- les arbitrages métier validés le 17 septembre 2026 ;
- les règles de captation des surfaces, installations, données juridiques, coordonnées et risques naturels ;
- la traçabilité des anciens `ATT-xxxx` vers les attributs canoniques.

## Principe fondamental de structure

```text
PROGRAMME [PRG]
└── FONCIER [FON]
    ├── PARCELLE [PAR]
    └── RÉSIDENCE [RES]
        └── ...
```

`PROGRAMME` est la racine de contexte. À partir du niveau `FONCIER`, la hiérarchie décrit prioritairement la réalité physique du patrimoine.

La règle reste :

> **Niveau de détail maximal démontrable, jamais niveau de détail maximal imaginable.**

`LOT`, `PCM / PARTIE COMMUNE`, les étages et les catégories fonctionnelles non prévues ne doivent jamais être créés comme objets pour résoudre artificiellement un besoin de captation.

## Références normatives

### Structure patrimoniale

- `docs/structure-patrimoniale.md`
- `model/objets-patrimoniaux.yaml`

### Attributs

- `docs/attributs-patrimoniaux.md` — doctrine et décisions métier consolidées ;
- `model/attributs/index.yaml` — index du dictionnaire canonique ;
- `model/attributs/*.yaml` — définition machine-readable des 278 attributs canoniques ;
- `prompts/regles-captation-attributs.md` — règles opérationnelles de captation.

### Migration / historique

- `model/migration/index.yaml`
- `model/migration/mapping_*.yaml`

Ces fichiers conservent la correspondance des 345 attributs historiques vers le référentiel cible. Ils servent à la migration et à la traçabilité, **pas à définir la captation future**.

### Relations complémentaires et juridiques

- les relations physiques/fonctionnelles principales sont décrites dans `model/objets-patrimoniaux.yaml` ;
- `docs/relations-juridiques.md` précise la captation des servitudes ;
- `model/relations-juridiques.yaml` fournit leur représentation machine-readable.

### Historique des décisions

- `docs/journal-arbitrages-attributs.md`

Ce document conserve la mémoire des choix validés pendant la normalisation, pour compréhension humaine et audit futur.

## Fichiers à lire par une IA avant captation

Une IA doit lire au minimum, dans cet ordre :

1. `README.md` ;
2. `docs/structure-patrimoniale.md` ;
3. `model/objets-patrimoniaux.yaml` ;
4. `docs/attributs-patrimoniaux.md` ;
5. `model/attributs/index.yaml` puis les fichiers d’attributs utiles ;
6. `prompts/regles-captation.md` ;
7. `prompts/regles-captation-attributs.md`.

## Règles transversales de captation

- une occurrence de donnée est rattachée à **un seul objet concret** ;
- l’absence d’information signifie `Inconnu`, jamais `Non` ni `0` ;
- toute valeur calculée, dérivée ou obtenue par proxy est marquée `Déduit` et sa règle est tracée ;
- une valeur agrégée ne doit pas remplacer une valeur rattachable à un niveau physique plus précis ;
- le niveau `RES` est exceptionnel pour les agrégats physiques et ne doit jamais être choisi par facilité ;
- une relation juridique ou fonctionnelle ne doit pas être transformée en parent physique ;
- si le référentiel ne permet pas une captation sans ambiguïté, l’IA doit créer une anomalie à vérifier plutôt qu’inventer.

## Sortie minimale d’une captation

### OBJETS

- `ID_objet`
- `Type_objet`
- `Code_type`
- `Libelle`
- `ID_parent_principal`
- `Niveau`
- `Confiance`
- `Source`

### RELATIONS_COMPLEMENTAIRES

- `ID_objet_source`
- `Type_relation`
- `ID_objet_cible` ou cible externe documentée
- `Source`
- `Confiance`

### ATTRIBUTS

- `ID_objet`
- `Attribut_canonique`
- `Valeur_source`
- `Valeur_normalisee`
- `Unite_source`
- `Unite_normalisee`
- `Document_source`
- `Page_ou_plan`
- `Repere`
- `Mode_identification` (`Explicite` / `Déduit`)
- `Confiance`
- `Commentaire`

### ANOMALIES_A_VERIFIER

- `Objet_concerne`
- `Description`
- `Hypothese_eventuelle`
- `Source`
- `Action_attendue`

## Gouvernance

Le dépôt est la source de vérité ARIANE pour les règles de captation. Toute évolution conceptuelle doit être explicite, documentée et versionnée.
