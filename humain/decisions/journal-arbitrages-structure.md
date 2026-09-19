# ARIANE — Journal des arbitrages de structure patrimoniale

Ce document conserve la mémoire des décisions humaines relatives à la structure patrimoniale. Le référentiel normatif d'exécution reste le dossier `ia/`.

## 2026-09-19 — Priorité de rattachement aux circulations physiques

Décision : lorsqu'une zone de circulation intérieure physique (`CIR`) dessert directement un logement ou un local, elle constitue obligatoirement son parent principal. Un palier physiquement identifiable est une `CIR` s'il assure cette distribution directe.

Les niveaux (`RDC`, `R+1`, `R+2`, `SS-1`, etc.) restent des localisations et ne justifient jamais seuls la création d'une `CIR`.

En l'absence de circulation physique intermédiaire, le rattachement direct au bâtiment reste autorisé, notamment pour une maison individuelle.

Conséquence normative : les `allowed_parents` restent inchangés pour permettre les différents cas physiques, mais ils ne sont plus interprétés comme des alternatives équivalentes ; la `CIR` est prioritaire et obligatoire lorsque sa présence et sa desserte directe sont démontrables.
