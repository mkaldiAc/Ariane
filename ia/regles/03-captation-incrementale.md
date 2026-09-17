# 03 — Captation incrémentale

## Objet

Permettre plusieurs campagnes documentaires successives sur un même programme sans altérer la structure validée ni les observations précédentes.

## Entrées obligatoires

- `programme_id` ;
- `capture_id` ;
- `structure_version` ;
- structure complète validée du programme ;
- nouveau jeu documentaire.

## Structure en lecture seule

La structure fournie est normative pour cette captation.

L’IA doit réutiliser les `object_id` existants. Elle ne peut ni créer ni modifier un objet patrimonial.

Lorsqu’un document utilise un autre libellé ou repère pour un objet existant, l’IA doit tenter le rapprochement avec l’objet existant et scorer ce rattachement.

## Objet absent

Si une information concerne vraisemblablement un objet absent de la structure :

- ne pas créer l’objet ;
- ne pas rattacher arbitrairement la valeur à son parent ;
- produire une anomalie `OBJET_STRUCTURE_ABSENT` avec la source et le repère documentaire.

## Rattachement ambigu

Si plusieurs objets existants sont plausibles sans preuve suffisante, produire `RATTACHEMENT_AMBIGU` et ne pas dupliquer l’observation.
