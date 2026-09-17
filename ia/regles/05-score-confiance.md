# 05 — Score de confiance

## Sens du score

Le score mesure la confiance de l’IA dans **la qualité de sa captation**. Il ne mesure pas la probabilité que la valeur soit la vérité métier.

Une valeur parfaitement lue dans un document obsolète peut donc avoir un score de captation élevé tout en n’étant pas la valeur de référence métier.

## Score sur 100

Le score est composé de quatre dimensions :

- `evidence` : 0 à 30 — clarté de la preuve documentaire ;
- `object_binding` : 0 à 30 — certitude du rattachement au bon objet ;
- `semantic_match` : 0 à 25 — certitude de correspondance avec le bon attribut ;
- `transformation` : 0 à 15 — fiabilité de la lecture, normalisation, calcul, proxy ou enrichissement.

`score = evidence + object_binding + semantic_match + transformation`.

## Principes

- une valeur `EXPLICITE` clairement libellée peut atteindre un score très élevé ;
- un calcul `DEDUIT` doit perdre des points si plusieurs hypothèses interviennent ;
- un `PROXY` ne doit pas obtenir le maximum sur la dimension transformation ;
- un `ENRICHI` doit refléter la qualité de la donnée d’entrée et du rapprochement ;
- un rattachement objet incertain doit réduire `object_binding` même si la valeur est parfaitement lisible.

Ne jamais utiliser ce score pour choisir automatiquement l’observation qui fait foi.
