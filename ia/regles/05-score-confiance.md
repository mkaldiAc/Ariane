# ARIANE — Score de confiance de captation

Version : 1.3.0

## Définition

Le score de confiance mesure la confiance de l'IA dans la **qualité de sa captation**. Il ne mesure pas la vérité métier de la valeur captée.

L'IA ne doit jamais interpréter un score élevé comme une autorisation à sélectionner une observation comme valeur de référence.

## Score total

Score sur 100 points :

- `evidence_score` : 0 à 30 — clarté de la preuve documentaire ;
- `object_binding_score` : 0 à 30 — certitude du rattachement au bon objet patrimonial ;
- `semantic_match_score` : 0 à 25 — certitude que l'information correspond au bon attribut canonique ;
- `transformation_score` : 0 à 15 — fiabilité de la lecture, normalisation, calcul, proxy ou enrichissement.

`confidence_score = evidence_score + object_binding_score + semantic_match_score + transformation_score`

## Principes de notation

### Preuve documentaire

30 points : valeur explicite, lisible, clairement associée à l'élément concerné.

Réduire le score lorsque la preuve est indirecte, fragmentée, ambiguë, issue d'une légende difficile à rattacher ou de qualité documentaire dégradée.

### Rattachement objet

30 points : `object_id` identifié sans ambiguïté grâce à la structure validée et aux repères documentaires.

Réduire le score si plusieurs objets existants pourraient correspondre.

### Correspondance sémantique

25 points : la valeur correspond explicitement à la définition de l'attribut.

Réduire le score lorsque la terminologie source est ambiguë ou nécessite une interprétation.

### Transformation

15 points : transcription directe ou normalisation déterministe.

Un calcul, un proxy ou un enrichissement doit généralement réduire ce sous-score par rapport à une valeur explicite.

## Sortie

Conserver à la fois le score total et les quatre composantes afin de permettre un audit ultérieur.