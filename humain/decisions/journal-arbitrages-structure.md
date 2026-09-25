# ARIANE — Journal des arbitrages de structure patrimoniale

Ce document conserve la mémoire des décisions humaines relatives à la structure patrimoniale. Le référentiel normatif d'exécution reste le dossier `ia/`.

## 2026-09-19 — Priorité de rattachement aux circulations physiques

Décision : lorsqu'une zone de circulation intérieure physique (`CIR`) dessert directement un logement ou un local, elle constitue obligatoirement son parent principal. Un palier physiquement identifiable est une `CIR` s'il assure cette distribution directe.

Les niveaux (`RDC`, `R+1`, `R+2`, `SS-1`, etc.) restent des localisations et ne justifient jamais seuls la création d'une `CIR`.

En l'absence de circulation physique intermédiaire, le rattachement direct au bâtiment reste autorisé, notamment pour une maison individuelle.

Conséquence normative : les `allowed_parents` restent inchangés pour permettre les différents cas physiques, mais ils ne sont plus interprétés comme des alternatives équivalentes ; la `CIR` est prioritaire et obligatoire lorsque sa présence et sa desserte directe sont démontrables.

## 2026-09-25 — CAPTURE, CURRENT et évolution contrôlée de structure

Décisions :

- chaque CAPTURE constitue l'historique immuable d'une itération documentaire ;
- CURRENT représente l'état consolidé courant du programme ;
- une captation incrémentale peut conserver un objet absent de la structure validée comme `CANDIDAT_STRUCTURE`, ainsi que ses observations et relations ;
- ces données restent en attente de rattachement structurel et ne peuvent pas entrer dans CURRENT tant que l'objet n'est pas validé ;
- une nouvelle version de structure (`STR-002`, `STR-003`, etc.) ne peut résulter que d'une décision humaine explicite ;
- l'action IA canonique permettant de matérialiser cette décision est désormais `VALIDER_STRUCTURE` ;
- lorsqu'un candidat est accepté, `VALIDER_STRUCTURE` crée la nouvelle structure et permet la promotion déterministe vers CURRENT des observations et relations déjà captées ;
- aucune CAPTURE historique n'est modifiée lors de cette promotion ;
- si un candidat est rejeté, ses données restent conservées uniquement dans la CAPTURE ;
- la validation métier des observations reste indépendante et réalisée hors du flux IA.
