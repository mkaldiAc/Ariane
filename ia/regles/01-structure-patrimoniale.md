# ARIANE — Règles IA de structure patrimoniale

Version : 1.4.0

## Portée

Ces règles s'appliquent principalement en mode `INITIALISATION_PROGRAMME`.

En mode `CAPTATION_INCREMENTALE`, la structure validée fournie en entrée prévaut intégralement et ne peut jamais être modifiée.

## Principes

- `PRG` est la racine de contexte du programme.
- À partir de `FON`, la hiérarchie décrit la réalité physique.
- Chaque objet possède au maximum un parent principal.
- Utiliser le parent physique le plus précis démontrable.
- Les étages sont des localisations, jamais des objets.
- `LOT`, `PCM`, `MAISON`, `IMMEUBLE`, `BOX`, `CHAUFFERIE`, `ETAGE`, `PARKING` et `STATIONNEMENT` sont interdits comme types d'objets.
- Les relations d'affectation, usage, desserte et implantation ne modifient jamais le parent physique.
- Ne jamais inventer un objet ou un niveau de structure pour améliorer artificiellement la complétude.

## Règle obligatoire de priorité des circulations physiques

Pour tout logement, local ou espace fermé dont le référentiel autorise `CIR` comme parent, l'IA doit rechercher le **plus petit espace physique de distribution qui donne directement accès à l'objet**.

Lorsqu'une zone de circulation intérieure physique est identifiable ou démontrable entre le bâtiment et l'objet desservi, cette `CIR` constitue **obligatoirement le parent principal** de l'objet.

Une `CIR` peut notamment être :
- un couloir ;
- un dégagement ;
- une coursive ;
- un palier ;
- tout autre espace physique assurant la distribution directe d'un ou plusieurs logements ou locaux.

Un simple palier est donc une `CIR` dès lors qu'il correspond à un espace physique identifiable et qu'il dessert directement un ou plusieurs objets patrimoniaux.

### Ordre de décision

1. rechercher une `CIR` physique directement desservante ;
2. si elle existe et est démontrable, rattacher obligatoirement l'objet à cette `CIR` ;
3. sinon, utiliser le parent physique intermédiaire pertinent autorisé par le référentiel ;
4. si aucun parent physique intermédiaire n'existe, rattacher directement l'objet au `BAT` lorsque ce parent est autorisé.

Il est interdit de choisir `BAT`, `HAL` ou `CAG` par simple commodité lorsqu'une `CIR` directement desservante, plus précise, est démontrable.

### Niveaux et circulations

Les indications `RDC`, `R+1`, `R+2`, `SS-1`, etc. restent des **localisations** et ne sont jamais des objets patrimoniaux.

Une `CIR` ne doit **jamais** être créée uniquement parce qu'un niveau existe. Elle doit correspondre à un espace physique de circulation réellement identifiable ou démontrable dans la source.

## Règle de stabilisation

La structure produite lors de l'initialisation est une `STRUCTURE_PROPOSEE`.

Après décision humaine explicite, elle peut devenir la structure de référence du programme selon `07-finalisation-structure-validee.md`.

L'IA ne peut jamais prendre seule cette décision de validation.

Elle peut seulement matérialiser techniquement la décision humaine par l'action `VALIDER_STRUCTURE` si le déclencheur formel requis est fourni dans le message utilisateur courant.

Toutes les captations ultérieures utilisent cette structure figée.

## Objets absents dans un jeu ultérieur

Lorsqu'un document d'une captation incrémentale démontre l'existence d'un objet absent de la structure validée :

- la structure validée reste strictement inchangée ;
- l'IA peut créer dans la **CAPTURE courante uniquement** un objet avec `object_status = CANDIDAT_STRUCTURE` ;
- cet objet candidat reçoit un `object_id` permettant de rattacher les constats de cette capture ;
- le `structure_version` porté par l'objet candidat désigne la structure de référence par rapport à laquelle l'absence est constatée ; il ne signifie jamais que l'objet appartient à cette structure ;
- l'IA peut renseigner le type et le parent pressentis uniquement s'ils sont démontrables par la source ;
- l'IA produit obligatoirement une anomalie `OBJET_STRUCTURE_ABSENT` liée au candidat ;
- l'objet candidat ne peut jamais entrer dans la structure validée ni dans `CURRENT` au cours de la captation.

Une évolution de structure ne peut intervenir qu'après décision humaine explicite matérialisée par `VALIDER_STRUCTURE`.
