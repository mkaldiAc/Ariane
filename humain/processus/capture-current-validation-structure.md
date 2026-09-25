# ARIANE — Guide humain : CAPTURE, CURRENT et validation de structure

Ce document explique le fonctionnement opérationnel décidé pour les captations ARIANE. Le référentiel normatif utilisé par l'IA reste exclusivement le dossier `ia/`.

## Principes

- chaque CAPTURE est un historique immuable d'une itération ;
- CURRENT est l'état consolidé courant ;
- une structure validée porte une version `STR-001`, `STR-002`, etc. ;
- une nouvelle captation ne crée jamais automatiquement une nouvelle version de structure ;
- un objet nouveau peut être conservé comme candidat avec ses observations et relations ;
- seul un arbitrage humain peut autoriser son intégration à une nouvelle structure.

## Exemple : ajout d'une cave

1. La captation courante utilise `STR-001`.
2. Un document démontre une cave absente de `STR-001`.
3. La CAPTURE conserve la cave comme `CANDIDAT_STRUCTURE`, ses observations, ses relations et l'anomalie `OBJET_STRUCTURE_ABSENT`.
4. Ces données restent hors CURRENT.
5. Un humain examine le candidat et décide de l'accepter ou de le rejeter.
6. En cas d'acceptation, l'humain déclenche explicitement `VALIDER_STRUCTURE` et fournit la version cible, par exemple `STR-002`, ainsi que l'identifiant du candidat approuvé.
7. L'IA matérialise `STR-002`, puis promeut vers CURRENT les observations et relations déjà captées qui deviennent rattachables.
8. La CAPTURE historique n'est jamais modifiée.
9. En cas de rejet, les données restent uniquement dans la CAPTURE.

## Responsabilités humaines

L'humain :
- valide ou refuse toute évolution de structure ;
- fournit explicitement la version cible ;
- identifie les objets candidats approuvés ;
- précise les corrections de type ou de rattachement nécessaires ;
- valide ultérieurement les observations métier dans le système aval.

L'IA :
- constate ;
- conserve les preuves ;
- propose des candidats ;
- ne décide jamais seule de l'évolution ;
- exécute uniquement les décisions explicites via `VALIDER_STRUCTURE`.
