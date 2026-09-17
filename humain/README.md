# ARIANE — Ressources destinées aux humains

Ce dossier contient les documents de compréhension, de gouvernance, d'arbitrage et de travail du projet ARIANE.

Il n'est **pas nécessaire à une IA pour exécuter une captation**. Le seul espace normatif d'exécution IA est `ia/`.

## Organisation

- `referentiel/` : documentation lisible par l'humain sur la structure, les attributs et les relations ;
- `decisions/` : mémoire des arbitrages métier et décisions de conception ;
- `historique/` : éléments de migration, correspondances avec les anciens `ATT-xxxx` et versions antérieures ;
- `livrables/` : emplacement prévu pour les fichiers Excel, Word, PDF ou autres livrables de travail validés.

## Principe de gouvernance

Les ressources humaines peuvent expliquer, justifier et documenter les règles, mais elles ne doivent pas introduire une règle de captation différente de celle présente dans `ia/`.

En cas d'évolution métier :
1. la décision est documentée dans `humain/decisions/` ;
2. le référentiel `ia/` est mis à jour ;
3. la version ARIANE est incrémentée ;
4. les documents humains sont alignés sur la nouvelle version.

## Validation humaine des données captées

La validation des observations captées par l'IA est réalisée **hors du repo d'exécution IA**, dans la base de données ou le système métier aval.

Le repo ARIANE définit comment l'IA capte et restitue les observations ; il ne définit pas quelle observation est retenue comme valeur de référence métier après intégration en base.